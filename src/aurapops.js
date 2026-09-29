import { ApiError, json, readJson } from "./http.js";
import { getAuthenticatedAdmin, sameOrigin } from "./security.js";

const BODY_BYTES = 1400 * 1024;
const IMAGE_BYTES = 420 * 1024;
const IMAGE_CHARS = Math.ceil((IMAGE_BYTES * 4) / 3) + 64;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const LINK_TYPES = new Set(["website","menu","instagram","facebook","tiktok","whatsapp","maps","custom","snake","tetris"]);
const STATUS = new Set(["pending","approved","rejected"]);
const PAYMENT = new Set(["unpaid","paid"]);

let schemaReady = false;

function clean(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function slugify(value) {
  return clean(value, 80)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54);
}

function color(value, fallback) {
  const text = clean(value, 16);
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback;
}

function safeUrl(value) {
  const text = clean(value, 1000);
  if (!text) return "";
  try {
    const parsed = new URL(text);
    return ["http:","https:","mailto:","tel:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

async function hashToken(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}

function newToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, "0")).join("");
}

function hasBytes(bytes, expected, offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function decodeImage(dataUrl) {
  const text = String(dataUrl || "").trim();
  if (!text) return null;
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(text);
  if (!match) throw new ApiError(400, "Only JPG, PNG or WebP images are supported.");
  const contentType = match[1].toLowerCase();
  const encoded = match[2];
  if (!IMAGE_TYPES.has(contentType) || !encoded || encoded.length % 4 !== 0 || encoded.length > IMAGE_CHARS) {
    throw new ApiError(400, "Image is invalid or too large.");
  }
  let binary;
  try { binary = atob(encoded); } catch { throw new ApiError(400, "Image is invalid."); }
  if (!binary.length || binary.length > IMAGE_BYTES) throw new ApiError(400, "Image is too large.");
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const valid =
    (contentType === "image/jpeg" && hasBytes(bytes, [0xff,0xd8,0xff])) ||
    (contentType === "image/png" && hasBytes(bytes, [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])) ||
    (contentType === "image/webp" && hasBytes(bytes, [0x52,0x49,0x46,0x46]) && hasBytes(bytes, [0x57,0x45,0x42,0x50], 8));
  if (!valid) throw new ApiError(400, "Image content is invalid.");
  return { contentType, bytes: bytes.buffer };
}

function normalizeLinks(value) {
  if (!Array.isArray(value)) return [];
  if (value.length > 12) throw new ApiError(400, "You can add up to 12 links and games.");
  return value.map((item, index) => {
    const type = clean(item?.type, 30).toLowerCase();
    if (!LINK_TYPES.has(type)) throw new ApiError(400, `Item ${index + 1} has an unsupported type.`);
    const isGame = type === "snake" || type === "tetris";
    const label = clean(item?.label, 60) || (type === "snake" ? "Snake" : type === "tetris" ? "Tetris" : "Open link");
    const url = isGame ? "" : safeUrl(item?.url);
    if (!isGame && !url) throw new ApiError(400, `Add a valid link for "${label}".`);
    return { type, label, url };
  });
}

async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS aurapops (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL UNIQUE, owner_token_hash TEXT NOT NULL, title TEXT NOT NULL, subtitle TEXT NOT NULL DEFAULT '', background_mode TEXT NOT NULL DEFAULT 'color' CHECK (background_mode IN ('color','image')), background_color TEXT NOT NULL DEFAULT '#0b1610', card_color TEXT NOT NULL DEFAULT '#111a16', text_color TEXT NOT NULL DEFAULT '#ffffff', accent_color TEXT NOT NULL DEFAULT '#e1e100', avatar_image_id TEXT, background_image_id TEXT, links_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid')), owner_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), approved_at TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_aurapops_status_created ON aurapops(status, created_at DESC)"),
    db.prepare("CREATE TABLE IF NOT EXISTS aurapop_images (id TEXT PRIMARY KEY NOT NULL, pop_id TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('avatar','background')), content_type TEXT NOT NULL, image_bytes BLOB NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (pop_id) REFERENCES aurapops(id) ON DELETE CASCADE)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_aurapop_images_pop ON aurapop_images(pop_id)")
  ]);
  schemaReady = true;
}

async function ownerRow(request, db, id) {
  const token = request.headers.get("X-Aura-Pop-Token") || "";
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const row = await db.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(id).first();
  if (!row) return null;
  return await hashToken(token) === row.owner_token_hash ? row : null;
}

function parseLinks(row) {
  try { return normalizeLinks(JSON.parse(row.links_json || "[]")); }
  catch { return []; }
}

function publicPop(row, origin, includeState = false) {
  const data = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    backgroundMode: row.background_mode,
    backgroundColor: row.background_color,
    cardColor: row.card_color,
    textColor: row.text_color,
    accentColor: row.accent_color,
    avatarUrl: row.avatar_image_id ? `${origin}/api/aurapops/images/${row.avatar_image_id}` : "",
    backgroundImageUrl: row.background_image_id ? `${origin}/api/aurapops/images/${row.background_image_id}` : "",
    links: parseLinks(row),
    publicUrl: `${origin}/pops/${row.slug}`,
    updatedAt: row.updated_at,
  };
  if (includeState) {
    data.status = row.status;
    data.paymentStatus = row.payment_status;
    data.ownerNote = row.owner_note || "";
  }
  return data;
}

async function replaceImage(db, popId, kind, dataUrl, currentId) {
  if (dataUrl === undefined) return currentId || null;
  if (!dataUrl) {
    if (currentId) await db.prepare("DELETE FROM aurapop_images WHERE id=? AND pop_id=?").bind(currentId, popId).run();
    return null;
  }
  const image = decodeImage(dataUrl);
  const id = crypto.randomUUID();
  const statements = [
    db.prepare("INSERT INTO aurapop_images (id,pop_id,kind,content_type,image_bytes) VALUES (?,?,?,?,?)")
      .bind(id,popId,kind,image.contentType,image.bytes)
  ];
  if (currentId) statements.push(db.prepare("DELETE FROM aurapop_images WHERE id=? AND pop_id=?").bind(currentId,popId));
  await db.batch(statements);
  return id;
}

function normalizeBody(body, current = null) {
  const title = clean(body.title ?? current?.title, 80);
  if (!title) throw new ApiError(400, "Add a popup name.");
  return {
    title,
    subtitle: clean(body.subtitle ?? current?.subtitle, 180),
    backgroundMode: ["color","image"].includes(body.backgroundMode) ? body.backgroundMode : (current?.background_mode || "color"),
    backgroundColor: color(body.backgroundColor ?? current?.background_color, "#0b1610"),
    cardColor: color(body.cardColor ?? current?.card_color, "#111a16"),
    textColor: color(body.textColor ?? current?.text_color, "#ffffff"),
    accentColor: color(body.accentColor ?? current?.accent_color, "#e1e100"),
    links: normalizeLinks(body.links ?? (current ? JSON.parse(current.links_json || "[]") : [])),
    avatarData: Object.prototype.hasOwnProperty.call(body,"avatarData") ? body.avatarData : undefined,
    backgroundData: Object.prototype.hasOwnProperty.call(body,"backgroundData") ? body.backgroundData : undefined,
  };
}

async function adminAudit(db, admin, action, targetId, request) {
  await db.prepare("INSERT INTO admin_audit_log (id,admin_user_id,username_snapshot,action,resource,target_id,request_id) VALUES (?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), admin.id, admin.username, action, "aurapops", targetId, String(request.headers.get("CF-Ray") || "").slice(0,80)).run();
}

export async function handleAuraPops(request, env) {
  const url = new URL(request.url);
  const isApi = url.pathname.startsWith("/api/aurapops") || url.pathname.startsWith("/api/admin/aurapops");
  if (!isApi) return null;
  await ensureSchema(env.DB);

  if (url.pathname.startsWith("/api/admin/aurapops")) {
    const admin = await getAuthenticatedAdmin(request, env.DB);
    if (!admin) return json({ error: "Unauthorized." }, 401, { "Cache-Control":"no-store" });

    const match = url.pathname.match(/^\/api\/admin\/aurapops(?:\/([a-f0-9-]+))?$/i);
    if (!match) return json({ error: "Not found." }, 404);
    const id = match[1] || null;

    if (request.method === "GET" && !id) {
      const rows = await env.DB.prepare("SELECT * FROM aurapops ORDER BY created_at DESC LIMIT 200").all();
      return json({ items:(rows.results || []).map(row => publicPop(row,url.origin,true)) },200,{ "Cache-Control":"no-store" });
    }

    if (request.method === "PATCH" && id) {
      if (admin.role === "viewer") return json({ error: "Read-only account." },403,{ "Cache-Control":"no-store" });
      if (!sameOrigin(request)) return json({ error: "Invalid request origin." },403,{ "Cache-Control":"no-store" });
      const current = await env.DB.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(id).first();
      if (!current) return json({ error: "AuraPop not found." },404);
      const body = await readJson(request, 16 * 1024);
      const status = body.status === undefined ? current.status : clean(body.status,20);
      const payment = body.paymentStatus === undefined ? current.payment_status : clean(body.paymentStatus,20);
      if (!STATUS.has(status) || !PAYMENT.has(payment)) return json({ error:"Invalid status." },400);
      if (status === "approved" && payment !== "paid") return json({ error:"Confirm payment before activation." },409);
      const note = body.ownerNote === undefined ? current.owner_note : clean(body.ownerNote,500);
      const approvedAt = status === "approved" ? (current.approved_at || new Date().toISOString()) : null;
      await env.DB.prepare("UPDATE aurapops SET status=?,payment_status=?,owner_note=?,approved_at=?,updated_at=datetime('now') WHERE id=?")
        .bind(status,payment,note,approvedAt,id).run();
      await adminAudit(env.DB,admin,"update",id,request);
      const updated = await env.DB.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(id).first();
      return json({ pop:publicPop(updated,url.origin,true) },200,{ "Cache-Control":"no-store" });
    }
    return json({ error:"Method not allowed." },405);
  }

  const imageMatch = url.pathname.match(/^\/api\/aurapops\/images\/([a-f0-9-]+)$/i);
  if (imageMatch && (request.method === "GET" || request.method === "HEAD")) {
    const image = await env.DB.prepare("SELECT i.*,p.status,p.payment_status,p.owner_token_hash FROM aurapop_images i JOIN aurapops p ON p.id=i.pop_id WHERE i.id=? LIMIT 1").bind(imageMatch[1]).first();
    if (!image) return new Response("Not found.",{status:404});
    let allowed = image.status === "approved" && image.payment_status === "paid";
    if (!allowed) {
      const admin = await getAuthenticatedAdmin(request,env.DB);
      if (admin) allowed = true;
      else {
        const token = request.headers.get("X-Aura-Pop-Token") || "";
        if (/^[a-f0-9]{64}$/i.test(token) && await hashToken(token) === image.owner_token_hash) allowed = true;
      }
    }
    if (!allowed) return new Response("Not found.",{status:404});
    return new Response(request.method === "HEAD" ? null : image.image_bytes,{
      status:200,
      headers:{
        "Content-Type":image.content_type,
        "Cache-Control":image.status === "approved" && image.payment_status === "paid" ? "public, max-age=3600" : "no-store",
        "X-Content-Type-Options":"nosniff"
      }
    });
  }

  const publicMatch = url.pathname.match(/^\/api\/aurapops\/public\/([a-z0-9-]+)$/i);
  if (publicMatch && request.method === "GET") {
    const row = await env.DB.prepare("SELECT * FROM aurapops WHERE slug=? AND status='approved' AND payment_status='paid' LIMIT 1").bind(publicMatch[1]).first();
    return row
      ? json({ pop:publicPop(row,url.origin,false) },200,{ "Cache-Control":"public, max-age=60" })
      : json({ error:"This AuraPop is not active yet." },404,{ "Cache-Control":"no-store" });
  }

  if (url.pathname === "/api/aurapops" && request.method === "POST") {
    if (!sameOrigin(request)) return json({ error:"Invalid request origin." },403);
    const body = await readJson(request,BODY_BYTES);
    const normalized = normalizeBody(body);
    let slug = slugify(body.slug || normalized.title);
    if (slug.length < 3) throw new ApiError(400,"Choose an address with at least 3 characters.");
    const duplicate = await env.DB.prepare("SELECT id FROM aurapops WHERE slug=? LIMIT 1").bind(slug).first();
    if (duplicate) slug += "-" + crypto.randomUUID().slice(0,4);

    const id = crypto.randomUUID();
    const token = newToken();
    await env.DB.prepare("INSERT INTO aurapops (id,slug,owner_token_hash,title,subtitle,background_mode,background_color,card_color,text_color,accent_color,links_json) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
      .bind(id,slug,await hashToken(token),normalized.title,normalized.subtitle,normalized.backgroundMode,normalized.backgroundColor,normalized.cardColor,normalized.textColor,normalized.accentColor,JSON.stringify(normalized.links)).run();

    try {
      const avatarId = await replaceImage(env.DB,id,"avatar",normalized.avatarData,null);
      const backgroundId = await replaceImage(env.DB,id,"background",normalized.backgroundData,null);
      await env.DB.prepare("UPDATE aurapops SET avatar_image_id=?,background_image_id=? WHERE id=?").bind(avatarId,backgroundId,id).run();
    } catch (error) {
      await env.DB.prepare("DELETE FROM aurapops WHERE id=?").bind(id).run();
      throw error;
    }
    const row = await env.DB.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(id).first();
    return json({ pop:publicPop(row,url.origin,true), token },201,{ "Cache-Control":"no-store" });
  }

  const ownerMatch = url.pathname.match(/^\/api\/aurapops\/([a-f0-9-]+)$/i);
  if (ownerMatch) {
    const id = ownerMatch[1];
    const current = await ownerRow(request,env.DB,id);
    if (!current) return json({ error:"AuraPop access denied." },401,{ "Cache-Control":"no-store" });

    if (request.method === "GET") {
      return json({ pop:publicPop(current,url.origin,true) },200,{ "Cache-Control":"no-store" });
    }

    if (request.method === "PATCH") {
      if (!sameOrigin(request)) return json({ error:"Invalid request origin." },403,{ "Cache-Control":"no-store" });
      const body = await readJson(request,BODY_BYTES);
      const normalized = normalizeBody(body,current);
      const avatarId = await replaceImage(env.DB,id,"avatar",normalized.avatarData,current.avatar_image_id);
      const backgroundId = await replaceImage(env.DB,id,"background",normalized.backgroundData,current.background_image_id);
      await env.DB.prepare("UPDATE aurapops SET title=?,subtitle=?,background_mode=?,background_color=?,card_color=?,text_color=?,accent_color=?,avatar_image_id=?,background_image_id=?,links_json=?,updated_at=datetime('now') WHERE id=?")
        .bind(normalized.title,normalized.subtitle,normalized.backgroundMode,normalized.backgroundColor,normalized.cardColor,normalized.textColor,normalized.accentColor,avatarId,backgroundId,JSON.stringify(normalized.links),id).run();
      const updated = await env.DB.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(id).first();
      return json({ pop:publicPop(updated,url.origin,true) },200,{ "Cache-Control":"no-store" });
    }
  }

  return json({ error:"Not found." },404);
}
