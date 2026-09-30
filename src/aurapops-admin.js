import { getAuthenticatedAdmin, sameOrigin } from "./security.js";

const APP_ORIGIN = "https://aurapops.online";
const POP_STATUS = new Set(["pending", "approved", "rejected"]);
const PAYMENT_STATUS = new Set(["unpaid", "paid"]);
let schemaReady = false;

function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

function clean(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function ensureSchema(db) {
  if (schemaReady) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS aurapops (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL UNIQUE, owner_token_hash TEXT NOT NULL, title TEXT NOT NULL, subtitle TEXT NOT NULL DEFAULT '', background_mode TEXT NOT NULL DEFAULT 'color' CHECK (background_mode IN ('color','image')), background_color TEXT NOT NULL DEFAULT '#0b1610', card_color TEXT NOT NULL DEFAULT '#111a16', text_color TEXT NOT NULL DEFAULT '#ffffff', accent_color TEXT NOT NULL DEFAULT '#e1e100', avatar_image_id TEXT, background_image_id TEXT, links_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid')), admin_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), approved_at TEXT)"),
    db.prepare("CREATE TABLE IF NOT EXISTS aurapop_images (id TEXT PRIMARY KEY NOT NULL, pop_id TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('avatar','background')), content_type TEXT NOT NULL, image_bytes BLOB NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (pop_id) REFERENCES aurapops(id) ON DELETE CASCADE)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_aurapops_status_created ON aurapops(status, created_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_aurapop_images_pop ON aurapop_images(pop_id)")
  ]);
  schemaReady = true;
}

function mapPop(row) {
  let links = [];
  try { links = JSON.parse(row.links_json || "[]"); } catch {}
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    backgroundMode: row.background_mode,
    backgroundColor: row.background_color,
    cardColor: row.card_color,
    textColor: row.text_color,
    accentColor: row.accent_color,
    links,
    avatarUrl: row.avatar_image_id ? `/api/admin/aurapops/images/${encodeURIComponent(row.avatar_image_id)}` : "",
    backgroundImageUrl: row.background_image_id ? `/api/admin/aurapops/images/${encodeURIComponent(row.background_image_id)}` : "",
    publicUrl: `${APP_ORIGIN}/pops/${encodeURIComponent(row.slug)}`,
    status: row.status,
    paymentStatus: row.payment_status,
    adminNote: row.admin_note || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at || "",
  };
}

async function readBody(request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 8192) {
    return { error: "Request is too large." };
  }
  try {
    return { value: JSON.parse(raw || "{}") };
  } catch {
    return { error: "Invalid JSON." };
  }
}

export async function handleAuraPopsAdmin(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/admin/aurapops")) return null;
  if (!env.DB) return json({ error: "Service unavailable." }, 503);

  const admin = await getAuthenticatedAdmin(request, env.DB);
  if (!admin) return json({ error: "Unauthorized." }, 401, { "Cache-Control": "no-store" });

  await ensureSchema(env.DB);

  if (url.pathname === "/api/admin/aurapops/pops" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM aurapops ORDER BY created_at DESC LIMIT 200").all();
    return json({ items: (rows.results || []).map(mapPop) }, 200, { "Cache-Control": "no-store" });
  }

  const imageMatch = url.pathname.match(/^\/api\/admin\/aurapops\/images\/([a-f0-9-]+)$/i);
  if (imageMatch && (request.method === "GET" || request.method === "HEAD")) {
    const image = await env.DB.prepare("SELECT content_type, image_bytes FROM aurapop_images WHERE id=? LIMIT 1").bind(imageMatch[1]).first();
    if (!image) return new Response("Not found.", { status: 404 });
    return new Response(request.method === "HEAD" ? null : image.image_bytes, {
      status: 200,
      headers: {
        "Content-Type": image.content_type,
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const popMatch = url.pathname.match(/^\/api\/admin\/aurapops\/pops\/([a-f0-9-]+)$/i);
  if (popMatch && request.method === "PATCH") {
    if (admin.role === "viewer") return json({ error: "Read-only account." }, 403, { "Cache-Control": "no-store" });
    if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });

    const current = await env.DB.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(popMatch[1]).first();
    if (!current) return json({ error: "AuraPop not found." }, 404, { "Cache-Control": "no-store" });

    const bodyResult = await readBody(request);
    if (bodyResult.error) return json({ error: bodyResult.error }, 400, { "Cache-Control": "no-store" });
    const body = bodyResult.value;

    const status = body.status === undefined ? current.status : clean(body.status, 20);
    const paymentStatus = body.paymentStatus === undefined ? current.payment_status : clean(body.paymentStatus, 20);
    const adminNote = body.adminNote === undefined ? current.admin_note : clean(body.adminNote, 500);

    if (!POP_STATUS.has(status) || !PAYMENT_STATUS.has(paymentStatus)) {
      return json({ error: "Invalid status." }, 400, { "Cache-Control": "no-store" });
    }
    if (status === "approved" && paymentStatus !== "paid") {
      return json({ error: "Confirm payment before activation." }, 409, { "Cache-Control": "no-store" });
    }

    const approvedAt = status === "approved" ? (current.approved_at || new Date().toISOString()) : null;
    await env.DB.prepare(
      "UPDATE aurapops SET status=?, payment_status=?, admin_note=?, approved_at=?, updated_at=datetime('now') WHERE id=?"
    ).bind(status, paymentStatus, adminNote, approvedAt, popMatch[1]).run();

    const updated = await env.DB.prepare("SELECT * FROM aurapops WHERE id=? LIMIT 1").bind(popMatch[1]).first();
    return json({ pop: mapPop(updated) }, 200, { "Cache-Control": "no-store" });
  }

  return json({ error: "Not found." }, 404, { "Cache-Control": "no-store" });
}
