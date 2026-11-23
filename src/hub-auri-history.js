// Auri chat history, saved per person and workspace so a conversation
// survives closing the tab and follows the customer to other devices.
// Only the author can read or clear their own conversation.
import { ApiError, json, readJson } from './http.js';

export const HISTORY_SCHEMA = [
 `CREATE TABLE IF NOT EXISTS hub_auri_messages (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('me','auri')),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
 'CREATE INDEX IF NOT EXISTS hub_auri_messages_owner ON hub_auri_messages(organization_id, customer_id, created_at)',
];
const KEEP = 80;
const ready = new WeakSet();
async function ensure(db) { if (ready.has(db)) return; await db.batch(HISTORY_SCHEMA.map(sql => db.prepare(sql))); ready.add(db); }

export async function handleAuriHistory(request, env, { org, user, authorize }) {
 const db = env.DB;
 await ensure(db);
 const guard = await authorize(db, org, user, 'auri:use');
 if (request.method === 'GET') {
  const rows = (await db.prepare(`SELECT role, body AS text, created_at AS at FROM (SELECT rowid AS rid, role, body, created_at FROM hub_auri_messages WHERE organization_id=? AND customer_id=? ORDER BY created_at DESC, rid DESC LIMIT ${KEEP}) ORDER BY created_at, rid`).bind(org, user.id).all()).results || [];
  return json({ messages: rows }, 200, { 'Cache-Control': 'private, no-store' });
 }
 if (request.method === 'DELETE') {
  await db.prepare('DELETE FROM hub_auri_messages WHERE organization_id=? AND customer_id=?').bind(org, user.id).run();
  return json({ cleared: true });
 }
 if (request.method !== 'POST') throw new ApiError(405, 'Method not allowed.');
 const body = await readJson(request, 12000);
 if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 6) throw new ApiError(400, 'Invalid conversation.');
 const clean = body.messages.map(m => ({ role: m?.role === 'me' ? 'me' : m?.role === 'auri' ? 'auri' : null, text: String(m?.text ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, 1500) }));
 if (clean.some(m => !m.role || !m.text)) throw new ApiError(400, 'Invalid conversation.');
 await db.batch([
  ...clean.map(m => db.prepare(`INSERT INTO hub_auri_messages(id,organization_id,customer_id,role,body) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM organizations WHERE id=? AND ${guard.sql})`).bind(crypto.randomUUID(), org, user.id, m.role, m.text, org, ...guard.args)),
  db.prepare(`DELETE FROM hub_auri_messages WHERE organization_id=? AND customer_id=? AND id NOT IN (SELECT id FROM hub_auri_messages WHERE organization_id=? AND customer_id=? ORDER BY created_at DESC, rowid DESC LIMIT ${KEEP})`).bind(org, user.id, org, user.id),
 ]);
 return json({ saved: clean.length }, 201);
}
