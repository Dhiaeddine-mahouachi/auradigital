import { json, readJson } from "./http.js";
import { getAuthenticatedAdmin, sameOrigin } from "./security.js";

const BODY_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES_PER_REQUEST = 6;
const MAX_IMAGE_BYTES = 600 * 1024;
const MAX_IMAGE_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 64;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const NOTE_COLORS = new Set(["green", "teal", "yellow", "coral", "lavender", "slate"]);

async function ensureWorkspace(db) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS admin_notes (id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT 'green', created_by TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
    db.prepare("CREATE TABLE IF NOT EXISTS admin_note_images (id TEXT PRIMARY KEY NOT NULL, note_id TEXT NOT NULL, content_type TEXT NOT NULL, image_bytes BLOB NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_notes_updated ON admin_notes(updated_at DESC)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_note_images_note ON admin_note_images(note_id)"),
  ]);
}

function clean(value, max) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

function hasBytes(bytes, expected, offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function decodeImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(String(dataUrl || "").trim());
  if (!match) throw new Error("Only JPG, PNG and WebP images are allowed.");
  const contentType = match[1].toLowerCase();
  const encoded = match[2];
  if (!IMAGE_TYPES.has(contentType) || !encoded || encoded.length % 4 !== 0 || encoded.length > MAX_IMAGE_CHARS) throw new Error("One of the images is invalid or too large.");
  let binary;
  try { binary = atob(encoded); } catch { throw new Error("One of the images could not be read."); }
  if (!binary.length || binary.length > MAX_IMAGE_BYTES) throw new Error("Each image must be 600 KB or smaller.");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const valid =
    (contentType === "image/jpeg" && hasBytes(bytes, [0xff, 0xd8, 0xff])) ||
    (contentType === "image/png" && hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (contentType === "image/webp" && hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) && hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8));
  if (!valid) throw new Error("One of the uploaded files does not match its image type.");
  return { contentType, bytes: bytes.buffer };
}

function normalizeImages(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_IMAGES_PER_REQUEST) throw new Error(`You can add up to ${MAX_IMAGES_PER_REQUEST} images at a time.`);
  return value.filter(Boolean).map(decodeImage);
}

async function listNotes(db) {
  const [notesResult, imagesResult] = await db.batch([
    db.prepare("SELECT id,title,body,color,created_by,created_at,updated_at FROM admin_notes ORDER BY updated_at DESC LIMIT 100"),
    db.prepare("SELECT id,note_id,content_type,created_at FROM admin_note_images ORDER BY created_at ASC"),
  ]);
  const images = imagesResult.results || [];
  return (notesResult.results || []).map((note) => ({
    id: note.id,
    title: note.title,
    body: note.body,
    color: note.color,
    createdBy: note.created_by,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    images: images.filter((image) => image.note_id === note.id).map((image) => ({ id: image.id, url: `/api/admin/workspace/images/${image.id}`, contentType: image.content_type })),
  }));
}

async function insertImages(db, noteId, images) {
  if (!images.length) return;
  await db.batch(images.map((image) => db.prepare("INSERT INTO admin_note_images (id,note_id,content_type,image_bytes) VALUES (?,?,?,?)").bind(crypto.randomUUID(), noteId, image.contentType, image.bytes)));
}

function imageResponse(row) {
  let bytes = row?.image_bytes;
  if (ArrayBuffer.isView(bytes)) bytes = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  else if (Array.isArray(bytes)) bytes = Uint8Array.from(bytes).buffer;
  if (!(bytes instanceof ArrayBuffer) || !IMAGE_TYPES.has(row?.content_type)) return json({ error: "Image could not be read." }, 500, { "Cache-Control": "no-store" });
  return new Response(bytes, { headers: { "Content-Type": row.content_type, "Content-Length": String(bytes.byteLength), "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
}

export async function handleAdminWorkspace(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/admin/workspace")) return null;

  await ensureWorkspace(env.DB);
  const admin = await getAuthenticatedAdmin(request, env.DB);
  if (!admin) return json({ error: "Unauthorized." }, 401, { "Cache-Control": "no-store" });

  const imageMatch = url.pathname.match(/^\/api\/admin\/workspace\/images\/([a-f0-9-]+)$/i);
  if (imageMatch && request.method === "GET") {
    const row = await env.DB.prepare("SELECT content_type,image_bytes FROM admin_note_images WHERE id=? LIMIT 1").bind(imageMatch[1]).first();
    return row ? imageResponse(row) : json({ error: "Image not found." }, 404, { "Cache-Control": "no-store" });
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });
    if (admin.role === "viewer") return json({ error: "This account has read-only access." }, 403, { "Cache-Control": "no-store" });
  }

  if (imageMatch && request.method === "DELETE") {
    await env.DB.prepare("DELETE FROM admin_note_images WHERE id=?").bind(imageMatch[1]).run();
    return json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }

  if (url.pathname === "/api/admin/workspace/notes" && request.method === "GET") return json({ notes: await listNotes(env.DB) }, 200, { "Cache-Control": "no-store" });

  if (url.pathname === "/api/admin/workspace/notes" && request.method === "POST") {
    let body;
    try { body = await readJson(request, BODY_BYTES); } catch { return json({ error: "Note data is too large or invalid." }, 400, { "Cache-Control": "no-store" }); }
    const title = clean(body.title, 120) || "Untitled note";
    const noteBody = clean(body.body, 8000);
    const color = NOTE_COLORS.has(String(body.color)) ? String(body.color) : "green";
    let images;
    try { images = normalizeImages(body.images); } catch (error) { return json({ error: error.message }, 400, { "Cache-Control": "no-store" }); }
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO admin_notes (id,title,body,color,created_by) VALUES (?,?,?,?,?)").bind(id, title, noteBody, color, admin.username || admin.id).run();
    await insertImages(env.DB, id, images);
    return json({ ok: true, id }, 201, { "Cache-Control": "no-store" });
  }

  const noteMatch = url.pathname.match(/^\/api\/admin\/workspace\/notes\/([a-f0-9-]+)$/i);
  if (noteMatch && request.method === "PUT") {
    const current = await env.DB.prepare("SELECT * FROM admin_notes WHERE id=? LIMIT 1").bind(noteMatch[1]).first();
    if (!current) return json({ error: "Note not found." }, 404, { "Cache-Control": "no-store" });
    let body;
    try { body = await readJson(request, BODY_BYTES); } catch { return json({ error: "Note data is too large or invalid." }, 400, { "Cache-Control": "no-store" }); }
    const title = body.title === undefined ? current.title : (clean(body.title, 120) || "Untitled note");
    const noteBody = body.body === undefined ? current.body : clean(body.body, 8000);
    const color = body.color === undefined ? current.color : (NOTE_COLORS.has(String(body.color)) ? String(body.color) : current.color);
    let images;
    try { images = normalizeImages(body.images); } catch (error) { return json({ error: error.message }, 400, { "Cache-Control": "no-store" }); }
    await env.DB.prepare("UPDATE admin_notes SET title=?,body=?,color=?,updated_at=datetime('now') WHERE id=?").bind(title, noteBody, color, noteMatch[1]).run();
    await insertImages(env.DB, noteMatch[1], images);
    return json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }

  if (noteMatch && request.method === "DELETE") {
    await env.DB.batch([env.DB.prepare("DELETE FROM admin_note_images WHERE note_id=?").bind(noteMatch[1]), env.DB.prepare("DELETE FROM admin_notes WHERE id=?").bind(noteMatch[1])]);
    return json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }

  return json({ error: "Not found." }, 404, { "Cache-Control": "no-store" });
}
