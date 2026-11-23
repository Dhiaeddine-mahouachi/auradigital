// Account profile photo. The browser resizes the picture to a small square
// (256 px WebP/JPEG/PNG) before upload, so it is stored as a bounded data URL
// in its own additive table. Only the signed-in customer can read or change
// their own photo; teammates never receive it through this endpoint.
import { ApiError, json, readJson } from './http.js';

export const PHOTO_SCHEMA = `CREATE TABLE IF NOT EXISTS customer_profile_photos (
 customer_id TEXT PRIMARY KEY REFERENCES customer_users(id) ON DELETE CASCADE,
 data_url TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT (datetime('now')))`;
export const MAX_PHOTO_CHARS = 90000;
const PATTERN = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/;
const ready = new WeakSet();
async function ensure(db) { if (ready.has(db)) return; await db.prepare(PHOTO_SCHEMA).run(); ready.add(db); }

export async function profilePhoto(db, userId) {
 await ensure(db);
 return (await db.prepare('SELECT data_url FROM customer_profile_photos WHERE customer_id=?').bind(userId).first())?.data_url || null;
}

export async function handleProfilePhoto(request, env, user) {
 const db = env.DB;
 await ensure(db);
 if (request.method === 'GET') return json({ photo: await profilePhoto(db, user.id) }, 200, { 'Cache-Control': 'private, no-store' });
 if (request.method === 'DELETE') {
  await db.prepare('DELETE FROM customer_profile_photos WHERE customer_id=?').bind(user.id).run();
  return json({ photo: null });
 }
 if (request.method !== 'PUT') throw new ApiError(405, 'Method not allowed.');
 const { photo } = await readJson(request, MAX_PHOTO_CHARS + 200);
 if (typeof photo !== 'string' || photo.length > MAX_PHOTO_CHARS || !PATTERN.test(photo)) throw new ApiError(400, 'Choose a JPEG, PNG or WebP image.');
 await db.prepare("INSERT INTO customer_profile_photos(customer_id,data_url) VALUES(?,?) ON CONFLICT(customer_id) DO UPDATE SET data_url=excluded.data_url,updated_at=datetime('now')").bind(user.id, photo).run();
 return json({ photo });
}

// Business logo, per workspace. Members with access can see it; only people
// allowed to edit the business profile can change it.
export const LOGO_SCHEMA = `CREATE TABLE IF NOT EXISTS organization_logos (
 organization_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
 data_url TEXT NOT NULL,
 updated_by TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT (datetime('now')))`;
const logoReady = new WeakSet();
async function ensureLogo(db) { if (logoReady.has(db)) return; await db.prepare(LOGO_SCHEMA).run(); logoReady.add(db); }
export async function workspaceLogo(db, org) {
 await ensureLogo(db);
 return (await db.prepare('SELECT data_url FROM organization_logos WHERE organization_id=?').bind(org).first())?.data_url || null;
}
export async function handleWorkspaceLogo(request, env, { org, user, authorize }) {
 const db = env.DB;
 await ensureLogo(db);
 if (request.method === 'GET') { await authorize(db, org, user); return json({ logo: await workspaceLogo(db, org) }, 200, { 'Cache-Control': 'private, no-store' }); }
 const guard = await authorize(db, org, user, 'profile:write');
 if (request.method === 'DELETE') {
  await db.prepare(`DELETE FROM organization_logos WHERE organization_id=? AND EXISTS(SELECT 1 FROM organizations WHERE id=? AND ${guard.sql})`).bind(org, org, ...guard.args).run();
  return json({ logo: null });
 }
 if (request.method !== 'PUT') throw new ApiError(405, 'Method not allowed.');
 const { logo } = await readJson(request, MAX_PHOTO_CHARS + 200);
 if (typeof logo !== 'string' || logo.length > MAX_PHOTO_CHARS || !PATTERN.test(logo)) throw new ApiError(400, 'Choose a JPEG, PNG or WebP image.');
 const r = await db.prepare(`INSERT INTO organization_logos(organization_id,data_url,updated_by) SELECT ?,?,? WHERE EXISTS(SELECT 1 FROM organizations WHERE id=? AND ${guard.sql})
  ON CONFLICT(organization_id) DO UPDATE SET data_url=excluded.data_url,updated_by=excluded.updated_by,updated_at=datetime('now')`).bind(org, logo, user.id, org, ...guard.args).run();
 if (!r.meta.changes) throw new ApiError(404, 'Workspace not found or access unavailable.');
 return json({ logo });
}
