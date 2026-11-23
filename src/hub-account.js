// Account controls inside AuraHub: see how many devices are signed in, sign
// out every other device, and download a copy of your data (KVKK/GDPR access).
import { ApiError, json, readJson } from './http.js';
import { currentSessionHash } from './customer-accounts.ts';

async function tables(db) { return new Set(((await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results || []).map(r => r.name)); }

export async function handleAccount(request, env, user, path) {
 const db = env.DB;
 if (path === '/api/hub/me/sessions') {
  const current = await currentSessionHash(request);
  if (request.method === 'GET') {
   const row = await db.prepare("SELECT count(*) AS n FROM customer_sessions WHERE customer_id=? AND expires_at>datetime('now')").bind(user.id).first();
   return json({ active: Number(row?.n || 0) }, 200, { 'Cache-Control': 'private, no-store' });
  }
  if (request.method !== 'POST') throw new ApiError(405, 'Method not allowed.');
  const { action } = await readJson(request, 200);
  if (action !== 'revoke-others' || !current) throw new ApiError(400, 'Invalid request.');
  const r = await db.prepare('DELETE FROM customer_sessions WHERE customer_id=? AND token_hash<>?').bind(user.id, current).run();
  return json({ signedOut: r.meta.changes || 0 });
 }
 if (path === '/api/hub/me/export' && request.method === 'GET') {
  const have = await tables(db);
  const account = await db.prepare('SELECT id,email,full_name AS name,created_at AS createdAt FROM customer_users WHERE id=?').bind(user.id).first();
  const owned = (await db.prepare('SELECT id,name,profile_json,mode,created_at AS createdAt FROM organizations WHERE owner_id=? ORDER BY created_at').bind(user.id).all()).results || [];
  const workspaces = [];
  for (const o of owned) {
   const missions = (await db.prepare('SELECT capability,status,data_json FROM business_missions WHERE organization_id=? ORDER BY position').bind(o.id).all()).results.map(m => ({ capability: m.capability, status: m.status, ...JSON.parse(m.data_json) }));
   const leads = have.has('hub_leads') ? (await db.prepare('SELECT id,name,contact,source,interest,value_minor,stage,follow_up_at,last_contacted_at,created_at,updated_at,archived_at FROM hub_leads WHERE organization_id=? ORDER BY created_at').bind(o.id).all()).results : [];
   const notes = have.has('hub_lead_notes') ? (await db.prepare('SELECT lead_id,body,created_at FROM hub_lead_notes WHERE organization_id=? ORDER BY created_at').bind(o.id).all()).results : [];
   workspaces.push({ id: o.id, name: o.name, mode: o.mode, createdAt: o.createdAt, profile: JSON.parse(o.profile_json), roadmap: missions, leads, leadNotes: notes });
  }
  const auri = have.has('hub_auri_messages') ? (await db.prepare('SELECT organization_id AS workspaceId,role,body,created_at AS at FROM hub_auri_messages WHERE customer_id=? ORDER BY created_at').bind(user.id).all()).results : [];
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), account, workspaces, auriConversations: auri }, null, 2);
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="aurahub-data.json"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
 }
 return null;
}
