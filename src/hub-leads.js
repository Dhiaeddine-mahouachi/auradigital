// Aura Studio lead pipeline: the customer's own inquiries, kept inside their
// workspace. Every read and write is scoped to the organization and checked
// against the current membership rows (the same guard as the rest of the Hub).
// Leads are never hard-deleted; they are archived so nothing is lost.
import { ApiError, json, readJson } from './http.js';

export const LEAD_SCHEMA = [
 `CREATE TABLE IF NOT EXISTS hub_lead_stages (
  organization_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  stages_json TEXT NOT NULL CHECK(json_valid(stages_json)),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
 `CREATE TABLE IF NOT EXISTS hub_leads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'other',
  interest TEXT NOT NULL DEFAULT '',
  value_minor INTEGER,
  stage TEXT NOT NULL,
  assignee_id TEXT,
  follow_up_at TEXT,
  last_contacted_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  archived_at TEXT,
  version INTEGER NOT NULL DEFAULT 1)`,
 'CREATE INDEX IF NOT EXISTS hub_leads_org ON hub_leads(organization_id, archived_at, updated_at)',
 `CREATE TABLE IF NOT EXISTS hub_lead_notes (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES hub_leads(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
 'CREATE INDEX IF NOT EXISTS hub_lead_notes_lead ON hub_lead_notes(lead_id, created_at)',
];

export const LEAD_SOURCES = ['website','phone','whatsapp','instagram','email','walk_in','referral','other'];
export const DEFAULT_STAGES = [
 {id:'new',label:'New inquiry'},
 {id:'contacted',label:'Contacted'},
 {id:'proposal',label:'Proposal'},
 {id:'in_progress',label:'In progress'},
 {id:'won',label:'Won / Completed'},
];
const MAX_LEADS = 2000, MAX_NOTES = 200, MAX_STAGES = 8;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
const stageId = v => typeof v === 'string' && /^[a-z][a-z0-9_]{1,23}$/.test(v);

const ready = new WeakSet();
export async function ensureLeadSchema(db) {
 if (ready.has(db)) return;
 await db.batch(LEAD_SCHEMA.map(sql => db.prepare(sql)));
 ready.add(db);
}

async function stagesFor(db, org) {
 const row = await db.prepare('SELECT stages_json, version FROM hub_lead_stages WHERE organization_id=?').bind(org).first();
 return row ? { stages: JSON.parse(row.stages_json), version: row.version } : { stages: DEFAULT_STAGES, version: 0 };
}

// Teammates a lead can be assigned to: the owner and active members. Only
// names and ids are shared; emails stay on the owner-only Team page.
async function assignees(db, org) {
 const rows = (await db.prepare(`SELECT u.id, u.full_name AS name FROM organizations o JOIN customer_users u ON u.id=o.owner_id WHERE o.id=?
  UNION SELECT u.id, u.full_name AS name FROM organization_members m JOIN customer_users u ON u.id=m.customer_id WHERE m.organization_id=? AND m.status='active'`).bind(org, org).all()).results || [];
 return rows.map(r => ({ id: r.id, name: r.name || '—' }));
}

function validLead(body, stages, people, partial = false) {
 const out = {};
 if (!partial || body.name !== undefined) {
  out.name = clean(body.name, 120);
  if (out.name.length < 2) throw new ApiError(400, 'Enter a name of at least 2 characters.');
 }
 if (body.contact !== undefined) out.contact = clean(body.contact, 200);
 if (body.interest !== undefined) out.interest = clean(body.interest, 160);
 if (body.source !== undefined) {
  if (!LEAD_SOURCES.includes(body.source)) throw new ApiError(400, 'Choose a valid source.');
  out.source = body.source;
 }
 if (body.value !== undefined) {
  if (body.value === null || body.value === '') out.value_minor = null;
  else {
   const value = Number(body.value);
   if (!Number.isFinite(value) || value < 0 || value > 1e9) throw new ApiError(400, 'Enter a value between 0 and 1,000,000,000.');
   out.value_minor = Math.round(value * 100);
  }
 }
 if (!partial || body.stage !== undefined) {
  const stage = body.stage ?? stages[0].id;
  if (!stages.some(s => s.id === stage)) throw new ApiError(400, 'Choose a pipeline stage.');
  out.stage = stage;
 }
 for (const [key, column] of [['followUpAt', 'follow_up_at'], ['lastContactedAt', 'last_contacted_at']]) {
  if (body[key] === undefined) continue;
  if (body[key] === null || body[key] === '') { out[column] = null; continue; }
  if (typeof body[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body[key]) || Number.isNaN(Date.parse(body[key]))) throw new ApiError(400, 'Use a valid date.');
  out[column] = body[key];
 }
 if (body.assigneeId !== undefined) {
  if (body.assigneeId === null || body.assigneeId === '') out.assignee_id = null;
  else if (!people.some(p => p.id === body.assigneeId)) throw new ApiError(400, 'Assign the lead to a member of this workspace.');
  else out.assignee_id = body.assigneeId;
 }
 return out;
}

const leadRow = r => ({ id: r.id, name: r.name, contact: r.contact, source: r.source, interest: r.interest,
 value: r.value_minor === null || r.value_minor === undefined ? null : r.value_minor / 100, stage: r.stage,
 assigneeId: r.assignee_id, followUpAt: r.follow_up_at || null, lastContactedAt: r.last_contacted_at || null, createdAt: r.created_at, updatedAt: r.updated_at, archived: Boolean(r.archived_at), version: r.version,
 notes: Number(r.notes || 0) });

// `authorize` and `audit` come from the Hub router so this module cannot drift
// from its permission model. Reads need workspace access; writes need
// roadmap:write (owners and admins), the Hub's existing "change business work" permission.
export async function handleLeads(request, env, { org, user, section, item, authorize, audit }) {
 const db = env.DB;
 await ensureLeadSchema(db);
 const method = request.method;
 if (section === 'lead-stages') {
  if (item) throw new ApiError(404, 'Not found.');
  if (method === 'GET') { await authorize(db, org, user); return json(await stagesFor(db, org)); }
  if (method !== 'PUT') throw new ApiError(405, 'Method not allowed.');
  const guard = await authorize(db, org, user, 'roadmap:write');
  const body = await readJson(request, 4000);
  if (!Array.isArray(body.stages) || body.stages.length < 2 || body.stages.length > MAX_STAGES || !Number.isInteger(body.version)) throw new ApiError(400, `Use between 2 and ${MAX_STAGES} stages.`);
  const stages = body.stages.map(s => ({ id: s?.id, label: clean(s?.label, 40) }));
  if (stages.some(s => !stageId(s.id) || s.label.length < 1) || new Set(stages.map(s => s.id)).size !== stages.length) throw new ApiError(400, 'Each stage needs a unique id and a name.');
  const used = (await db.prepare('SELECT DISTINCT stage FROM hub_leads WHERE organization_id=? AND archived_at IS NULL').bind(org).all()).results.map(r => r.stage);
  const missing = used.filter(id => !stages.some(s => s.id === id));
  if (missing.length) throw new ApiError(409, 'Move the leads out of a stage before removing it.');
  const stagesJson = JSON.stringify(stages);
  const write = body.version === 0
   ? db.prepare(`INSERT INTO hub_lead_stages(organization_id,stages_json) SELECT ?,? WHERE ${guard.sql} ON CONFLICT(organization_id) DO NOTHING`).bind(org, stagesJson, ...guard.args)
   : db.prepare(`UPDATE hub_lead_stages SET stages_json=?,version=version+1,updated_at=datetime('now') WHERE organization_id=? AND version=? AND ${guard.sql}`).bind(stagesJson, org, body.version, ...guard.args);
  const [result] = await db.batch([write, db.prepare("INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action,target_id) SELECT ?,?,?,'lead_stages_changed',NULL WHERE changes()=1").bind(crypto.randomUUID(), org, user.id)]);
  if (!result.meta.changes) throw new ApiError(409, 'Stages changed or access was revoked. Reload before saving.');
  return json(await stagesFor(db, org));
 }

 // section === 'leads'
 if (item && !uuid(item)) throw new ApiError(404, 'Lead not found.');
 if (method === 'GET' && !item) {
  const guard = await authorize(db, org, user);
  const url = new URL(request.url);
  const archived = url.searchParams.get('archived') === '1';
  const rows = (await db.prepare(`SELECT l.*, (SELECT count(*) FROM hub_lead_notes n WHERE n.lead_id=l.id) AS notes FROM hub_leads l
   WHERE l.organization_id=? AND ${archived ? 'l.archived_at IS NOT NULL' : 'l.archived_at IS NULL'} AND ${guard.sql} ORDER BY l.updated_at DESC, l.id LIMIT ${MAX_LEADS}`).bind(org, ...guard.args).all()).results || [];
  const [{ stages, version }, people] = await Promise.all([stagesFor(db, org), assignees(db, org)]);
  return json({ leads: rows.map(leadRow), stages, stagesVersion: version, assignees: people, sources: LEAD_SOURCES }, 200, { 'Cache-Control': 'private, no-store' });
 }
 if (method === 'GET' && item) {
  const guard = await authorize(db, org, user);
  const lead = await db.prepare(`SELECT l.* FROM hub_leads l WHERE l.id=? AND l.organization_id=? AND ${guard.sql}`).bind(item, org, ...guard.args).first();
  if (!lead) throw new ApiError(404, 'Lead not found.');
  const notes = (await db.prepare(`SELECT n.id, n.body, n.created_at AS createdAt, u.full_name AS author FROM hub_lead_notes n LEFT JOIN customer_users u ON u.id=n.author_id
   WHERE n.lead_id=? AND n.organization_id=? ORDER BY n.created_at DESC, n.id LIMIT ${MAX_NOTES}`).bind(item, org).all()).results || [];
  // Change history from the audit log (who did what, when).
  const historyRows = (await db.prepare(`SELECT a.action, a.created_at AS at, u.full_name AS actor FROM member_access_audit_logs a LEFT JOIN customer_users u ON u.id=a.actor_id
   WHERE a.organization_id=? AND a.target_id=? AND a.action LIKE 'lead_%' ORDER BY a.created_at DESC LIMIT 50`).bind(org, item).all()).results || [];
  return json({ lead: leadRow(lead), notes, history: historyRows }, 200, { 'Cache-Control': 'private, no-store' });
 }
 if (method === 'POST' && !item) {
  const guard = await authorize(db, org, user, 'roadmap:write');
  const body = await readJson(request, 6000);
  const [{ stages }, people] = await Promise.all([stagesFor(db, org), assignees(db, org)]);
  const lead = { source: 'other', contact: '', interest: '', value_minor: null, assignee_id: null, follow_up_at: null, last_contacted_at: null, ...validLead(body, stages, people) };
  const id = crypto.randomUUID();
  const note = clean(body.note, 2000);
  const [result] = await db.batch([
   db.prepare(`INSERT INTO hub_leads(id,organization_id,name,contact,source,interest,value_minor,stage,assignee_id,follow_up_at,last_contacted_at,created_by)
    SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE ${guard.sql} AND (SELECT count(*) FROM hub_leads WHERE organization_id=? AND archived_at IS NULL)<${MAX_LEADS}`)
    .bind(id, org, lead.name, lead.contact, lead.source, lead.interest, lead.value_minor, lead.stage, lead.assignee_id, lead.follow_up_at, lead.last_contacted_at, user.id, ...guard.args, org),
   ...(note ? [db.prepare('INSERT INTO hub_lead_notes(id,lead_id,organization_id,author_id,body) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM hub_leads WHERE id=?)').bind(crypto.randomUUID(), id, org, user.id, note, id)] : []),
   db.prepare("INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action,target_id) SELECT ?,?,?,'lead_created',? WHERE EXISTS(SELECT 1 FROM hub_leads WHERE id=?)").bind(crypto.randomUUID(), org, user.id, id, id),
  ]);
  if (!result.meta.changes) throw new ApiError(409, 'Lead limit reached or access was revoked.');
  const saved = await db.prepare('SELECT * FROM hub_leads WHERE id=?').bind(id).first();
  return json({ lead: leadRow({ ...saved, notes: note ? 1 : 0 }) }, 201);
 }
 if (method === 'PATCH' && item) {
  const guard = await authorize(db, org, user, 'roadmap:write');
  const body = await readJson(request, 6000);
  if (!Number.isInteger(body.version)) throw new ApiError(400, 'Invalid lead revision.');
  const [{ stages }, people] = await Promise.all([stagesFor(db, org), assignees(db, org)]);
  const changes = validLead(body, stages, people, true);
  if (body.archived !== undefined) {
   if (typeof body.archived !== 'boolean') throw new ApiError(400, 'Invalid archive state.');
   changes.archived_at = body.archived ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null;
  }
  const note = clean(body.note, 2000);
  if (!Object.keys(changes).length && !note) throw new ApiError(400, 'Nothing to update.');
  const current = await db.prepare('SELECT stage FROM hub_leads WHERE id=? AND organization_id=?').bind(item, org).first();
  if (!current) throw new ApiError(404, 'Lead not found.');
  const columns = Object.keys(changes);
  const set = [...columns.map(c => `${c}=?`), "updated_at=datetime('now')", 'version=version+1'].join(',');
  const action = changes.archived_at !== undefined ? (changes.archived_at ? 'lead_archived' : 'lead_restored')
   : changes.stage && changes.stage !== current.stage ? 'lead_stage_changed' : columns.length ? 'lead_edited' : 'lead_note_added';
  const statements = [
   db.prepare(`UPDATE hub_leads SET ${set} WHERE id=? AND organization_id=? AND version=? AND ${guard.sql}`).bind(...columns.map(c => changes[c]), item, org, body.version, ...guard.args),
   db.prepare('INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action,target_id) SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(), org, user.id, action, item),
  ];
  if (note) statements.push(db.prepare(`INSERT INTO hub_lead_notes(id,lead_id,organization_id,author_id,body) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM hub_leads WHERE id=? AND organization_id=? AND version=?)
   AND (SELECT count(*) FROM hub_lead_notes WHERE lead_id=?)<${MAX_NOTES}`).bind(crypto.randomUUID(), item, org, user.id, note, item, org, body.version + 1, item));
  const [result] = await db.batch(statements);
  if (!result.meta.changes) throw new ApiError(409, 'This lead changed or access was revoked. Reload before saving.');
  const saved = await db.prepare('SELECT l.*, (SELECT count(*) FROM hub_lead_notes n WHERE n.lead_id=l.id) AS notes FROM hub_leads l WHERE l.id=?').bind(item).first();
  return json({ lead: leadRow(saved) });
 }
 throw new ApiError(405, 'Method not allowed.');
}
