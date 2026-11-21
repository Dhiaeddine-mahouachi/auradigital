// AuraDigital CRM: one view of a client across every service.
// A record belongs to a client when its email or phone matches the client,
// or when an administrator linked it explicitly (crm_links). Status changes
// reuse each service's own admin endpoint, so their rules stay in one place.
import { getAuthenticatedAdmin, sameOrigin } from './security.js';

const noStore = { 'Cache-Control': 'no-store' };
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...noStore },
});
const clean = (value, max = 200) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const email = value => clean(value, 254).toLowerCase();
// Compare phones on their last 9 digits so +90 532…, 0532… and 532… match.
const phoneKey = value => { const d = String(value || '').replace(/\D/g, ''); return d.length >= 9 ? d.slice(-9) : ''; };

export const CRM_SOURCES = {
  nfc: { label: 'NFC card', table: 'nfc_requests', view: 'nfc', phones: ['contact_phone'], name: 'business_name', contact: 'contact_name', kind: 'card_type' },
  auramenu: { label: 'AuraMenu', table: 'auramenu_requests', view: 'auramenu', phones: ['contact_phone', 'whatsapp'], name: 'business_name', contact: 'contact_name', kind: 'slug' },
  quicksite: { label: 'Website', table: 'quicksite_projects', view: 'quicksite', phones: ['phone', 'whatsapp'], name: 'business_name', contact: 'contact_name', kind: 'slug' },
};
const LINKABLE = new Set([...Object.keys(CRM_SOURCES), 'shop', 'account']);

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS crm_links (
    source TEXT NOT NULL, source_id TEXT NOT NULL, client_id INTEGER NOT NULL,
    created_by TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (source, source_id))`,
  'CREATE INDEX IF NOT EXISTS crm_links_client ON crm_links(client_id)',
];

async function tablesIn(db) {
  const rows = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return new Set((rows.results || []).map(row => row.name));
}
async function columnsOf(db, table) {
  const rows = await db.prepare(`PRAGMA table_info(${table})`).all();
  return new Set((rows.results || []).map(row => row.name));
}

async function linksFor(db, clientId) {
  const rows = await db.prepare('SELECT source, source_id FROM crm_links WHERE client_id = ?').bind(clientId).all();
  const map = {};
  for (const row of rows.results || []) (map[row.source] ||= []).push(row.source_id);
  return map;
}

// Service requests (NFC, AuraMenu, websites) that match the client.
async function serviceRecords(db, tables, key, links) {
  const out = [];
  for (const [source, meta] of Object.entries(CRM_SOURCES)) {
    if (!tables.has(meta.table)) continue;
    const cols = await columnsOf(db, meta.table);
    const phones = meta.phones.filter(c => cols.has(c));
    const where = [], binds = [];
    if (key.email && cols.has('email')) { where.push('lower(email) = ?'); binds.push(key.email); }
    for (const col of phones) if (key.phone) { where.push(`substr(replace(replace(replace(replace(${col},' ',''),'-',''),'(',''),')',''),-9) = ?`); binds.push(key.phone); }
    const ids = links[source] || [];
    if (ids.length) { where.push(`id IN (${ids.map(() => '?').join(',')})`); binds.push(...ids); }
    if (!where.length) continue;
    const select = ['id', `${meta.name} AS title`, cols.has(meta.contact) ? `${meta.contact} AS contact` : "'' AS contact",
      cols.has('email') ? 'email' : "'' AS email", cols.has(meta.kind) ? `${meta.kind} AS detail` : "'' AS detail",
      'status', cols.has('payment_status') ? 'payment_status AS paymentStatus' : "'' AS paymentStatus",
      'created_at AS createdAt', cols.has('updated_at') ? 'updated_at AS updatedAt' : 'created_at AS updatedAt'].join(', ');
    const rows = await db.prepare(`SELECT ${select} FROM ${meta.table} WHERE ${where.join(' OR ')} ORDER BY created_at DESC LIMIT 50`).bind(...binds).all();
    for (const row of rows.results || []) out.push({ source, label: meta.label, view: meta.view, linked: ids.includes(String(row.id)), ...row });
  }
  return out;
}

async function accountRecords(db, tables, key, links) {
  if (!tables.has('customer_users')) return { accounts: [], workspaces: [], shopOrders: [] };
  const ids = links.account || [];
  const where = [], binds = [];
  if (key.email) { where.push('lower(email) = ?'); binds.push(key.email); }
  if (ids.length) { where.push(`id IN (${ids.map(() => '?').join(',')})`); binds.push(...ids); }
  if (!where.length) return { accounts: [], workspaces: [], shopOrders: [] };
  const accounts = (await db.prepare(`SELECT id, email, full_name AS name, active, created_at AS createdAt FROM customer_users WHERE ${where.join(' OR ')} LIMIT 10`).bind(...binds).all()).results || [];
  const accountIds = accounts.map(a => a.id);
  const workspaces = [], shopOrders = [];
  if (accountIds.length && tables.has('organizations')) {
    const marks = accountIds.map(() => '?').join(',');
    const memberJoin = tables.has('organization_members')
      ? ` OR id IN (SELECT organization_id FROM organization_members WHERE status='active' AND customer_id IN (${marks}))` : '';
    const rows = await db.prepare(`SELECT id, name, profile_json AS profile, created_at AS createdAt, updated_at AS updatedAt FROM organizations WHERE owner_id IN (${marks})${memberJoin} ORDER BY updated_at DESC LIMIT 20`)
      .bind(...accountIds, ...(memberJoin ? accountIds : [])).all();
    for (const row of rows.results || []) {
      let profile = {}; try { profile = JSON.parse(row.profile || '{}'); } catch {}
      let progress = { done: 0, total: 0 };
      if (tables.has('business_missions')) {
        const m = await db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS done FROM business_missions WHERE organization_id = ?").bind(row.id).first();
        progress = { done: Number(m?.done || 0), total: Number(m?.total || 0) };
      }
      workspaces.push({ id: row.id, name: row.name, industry: clean(profile.industry, 60), city: clean(profile.city, 60), progress, createdAt: row.createdAt, updatedAt: row.updatedAt });
    }
  }
  if (accountIds.length && tables.has('shop_bank_orders')) {
    const marks = accountIds.map(() => '?').join(',');
    const cols = await columnsOf(db, 'shop_bank_orders');
    const rows = await db.prepare(`SELECT id, reference, payment_status AS paymentStatus, ${cols.has('production_status') ? 'production_status' : "''"} AS productionStatus, total_minor AS totalMinor, created_at AS createdAt FROM shop_bank_orders WHERE customer_id IN (${marks}) ORDER BY created_at DESC LIMIT 50`).bind(...accountIds).all();
    shopOrders.push(...(rows.results || []));
  }
  return { accounts, workspaces, shopOrders };
}

async function byClientId(db, tables, table, select, clientId, order = 'created_at DESC') {
  if (!tables.has(table)) return [];
  return (await db.prepare(`SELECT ${select} FROM ${table} WHERE client_id = ? ORDER BY ${order} LIMIT 100`).bind(clientId).all()).results || [];
}

export async function clientView(db, clientId) {
  const client = await db.prepare('SELECT * FROM clients WHERE id = ?').bind(clientId).first();
  if (!client) return null;
  const tables = await tablesIn(db);
  const links = await linksFor(db, clientId);
  const key = { email: email(client.email), phone: phoneKey(client.phone) };
  const [services, account, orders, invoices, subscriptions, requests, aiRequests] = await Promise.all([
    serviceRecords(db, tables, key, links),
    accountRecords(db, tables, key, links),
    byClientId(db, tables, 'orders', 'id, type, quantity, amount, status, due_date AS dueDate, created_at AS createdAt', clientId),
    byClientId(db, tables, 'invoices', 'id, invoice_number AS number, amount, status, due_date AS dueDate, created_at AS createdAt', clientId),
    byClientId(db, tables, 'subscriptions', 'id, plan, amount, interval, status, next_billing_date AS nextBillingDate, created_at AS createdAt', clientId),
    byClientId(db, tables, 'request_receipts', 'request_id AS id, created_at AS createdAt', clientId),
    byClientId(db, tables, 'ai_requests', 'id, kind, created_at AS createdAt', clientId),
  ]);
  const sum = (rows, f) => rows.filter(f).reduce((t, r) => t + Number(r.amount || 0), 0);
  const monthly = subscriptions.filter(s => s.status === 'active').reduce((t, s) => t + Number(s.amount || 0) * (s.interval === 'weekly' ? 52 / 12 : 1), 0);
  const totals = {
    invoiced: sum(invoices, i => i.status !== 'cancelled' && i.status !== 'draft'),
    paid: sum(invoices, i => i.status === 'paid'),
    outstanding: sum(invoices, i => ['sent', 'overdue'].includes(i.status)),
    monthlyRecurring: Math.round(monthly),
    openWork: services.filter(s => s.status === 'pending').length + orders.filter(o => !['delivered', 'completed', 'cancelled'].includes(o.status)).length,
    shopOrders: account.shopOrders.length,
  };
  const timeline = [
    ...services.map(s => ({ at: s.createdAt, kind: s.source, text: `${s.label} request · ${s.title}`, status: s.status })),
    ...orders.map(o => ({ at: o.createdAt, kind: 'order', text: `Order · ${o.type}`, status: o.status })),
    ...invoices.map(i => ({ at: i.createdAt, kind: 'invoice', text: `Invoice ${i.number}`, status: i.status })),
    ...subscriptions.map(s => ({ at: s.createdAt, kind: 'subscription', text: `Subscription · ${s.plan}`, status: s.status })),
    ...requests.map(r => ({ at: r.createdAt, kind: 'contact', text: `Contact request ${r.id}`, status: 'received' })),
    ...aiRequests.map(r => ({ at: r.createdAt, kind: 'auri', text: `Auri ${r.kind} request`, status: 'received' })),
    ...account.accounts.map(a => ({ at: a.createdAt, kind: 'account', text: `AuraHub account · ${a.email}`, status: a.active ? 'active' : 'disabled' })),
    ...account.workspaces.map(w => ({ at: w.createdAt, kind: 'workspace', text: `Workspace · ${w.name}`, status: `${w.progress.done}/${w.progress.total} missions` })),
    ...account.shopOrders.map(o => ({ at: o.createdAt, kind: 'shop', text: `Shop order ${o.reference}`, status: o.paymentStatus })),
  ].filter(e => e.at).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 80);
  return { client, totals, services, orders, invoices, subscriptions, requests, aiRequests, ...account, timeline };
}

// Requests and accounts that no client matches yet: the CRM inbox.
export async function crmInbox(db) {
  const tables = await tablesIn(db);
  const clients = (await db.prepare('SELECT id, email, phone FROM clients').all()).results || [];
  const emails = new Map(), phones = new Map();
  for (const c of clients) { if (email(c.email)) emails.set(email(c.email), c.id); if (phoneKey(c.phone)) phones.set(phoneKey(c.phone), c.id); }
  const linked = new Set(((await db.prepare('SELECT source, source_id FROM crm_links').all()).results || []).map(r => r.source + ':' + r.source_id));
  const items = [];
  for (const [source, meta] of Object.entries(CRM_SOURCES)) {
    if (!tables.has(meta.table)) continue;
    const cols = await columnsOf(db, meta.table);
    const phoneCols = meta.phones.filter(c => cols.has(c));
    const rows = (await db.prepare(`SELECT id, ${meta.name} AS title, ${cols.has(meta.contact) ? meta.contact : "''"} AS contact, ${cols.has('email') ? 'email' : "''"} AS email, ${phoneCols.length ? phoneCols.map((c, i) => `${c} AS p${i}`).join(', ') : "'' AS p0"}, status, created_at AS createdAt FROM ${meta.table} ORDER BY created_at DESC LIMIT 200`).all()).results || [];
    for (const row of rows) {
      if (linked.has(source + ':' + row.id)) continue;
      const rawPhones = Object.keys(row).filter(k => /^p\d$/.test(k)).map(k => row[k]).filter(Boolean);
      const phonesOfRow = rawPhones.map(phoneKey).filter(Boolean);
      if (emails.has(email(row.email)) || phonesOfRow.some(p => phones.has(p))) continue;
      items.push({ source, label: meta.label, id: String(row.id), title: row.title, contact: row.contact, email: row.email, phone: String(row.phone || '').trim().split(/\s{1}(?=\+|0|\d{9})/)[0], status: row.status, createdAt: row.createdAt });
    }
  }
  if (tables.has('customer_users')) {
    const rows = (await db.prepare('SELECT id, email, full_name AS name, created_at AS createdAt FROM customer_users ORDER BY created_at DESC LIMIT 200').all()).results || [];
    for (const row of rows) {
      if (linked.has('account:' + row.id) || emails.has(email(row.email))) continue;
      items.push({ source: 'account', label: 'AuraHub account', id: row.id, title: row.name, contact: row.name, email: row.email, phone: '', status: 'registered', createdAt: row.createdAt });
    }
  }
  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 150);
}

// One search box for clients and every service record.
export async function crmSearch(db, query) {
  const q = clean(query, 80).toLowerCase();
  if (q.length < 2) return [];
  const like = '%' + q.replace(/[%_]/g, '') + '%';
  const tables = await tablesIn(db);
  const hits = [];
  const clients = (await db.prepare("SELECT id, name, company, email, phone, status FROM clients WHERE lower(name) LIKE ? OR lower(company) LIKE ? OR lower(email) LIKE ? OR phone LIKE ? ORDER BY updated_at DESC LIMIT 20").bind(like, like, like, like).all()).results || [];
  for (const c of clients) hits.push({ type: 'client', id: String(c.id), title: c.company || c.name, subtitle: [c.name, c.email, c.phone].filter(Boolean).join(' · '), status: c.status, clientId: c.id });
  for (const [source, meta] of Object.entries(CRM_SOURCES)) {
    if (!tables.has(meta.table)) continue;
    const cols = await columnsOf(db, meta.table);
    const fields = [meta.name, meta.contact, 'email', ...meta.phones].filter(c => cols.has(c));
    const rows = (await db.prepare(`SELECT id, ${meta.name} AS title, ${cols.has('email') ? 'email' : "''"} AS email, status FROM ${meta.table} WHERE ${fields.map(f => `lower(${f}) LIKE ?`).join(' OR ')} ORDER BY created_at DESC LIMIT 10`).bind(...fields.map(() => like)).all()).results || [];
    for (const r of rows) hits.push({ type: source, id: String(r.id), title: r.title, subtitle: `${meta.label}${r.email ? ' · ' + r.email : ''}`, status: r.status, view: meta.view });
  }
  if (tables.has('customer_users')) {
    const rows = (await db.prepare('SELECT id, email, full_name AS name FROM customer_users WHERE lower(email) LIKE ? OR lower(full_name) LIKE ? LIMIT 10').bind(like, like).all()).results || [];
    for (const r of rows) hits.push({ type: 'account', id: r.id, title: r.name, subtitle: 'AuraHub account · ' + r.email, status: 'account' });
  }
  return hits.slice(0, 50);
}

async function sourceRecord(db, source, id) {
  if (CRM_SOURCES[source]) {
    const meta = CRM_SOURCES[source];
    const cols = await columnsOf(db, meta.table);
    const phone = meta.phones.find(c => cols.has(c));
    return db.prepare(`SELECT id, ${meta.name} AS company, ${cols.has(meta.contact) ? meta.contact : "''"} AS name, ${cols.has('email') ? 'email' : "''"} AS email, ${phone || "''"} AS phone FROM ${meta.table} WHERE id = ?`).bind(id).first();
  }
  if (source === 'account') return db.prepare("SELECT id, '' AS company, full_name AS name, email, '' AS phone FROM customer_users WHERE id = ?").bind(id).first();
  if (source === 'shop') return db.prepare("SELECT o.id, '' AS company, u.full_name AS name, u.email, '' AS phone FROM shop_bank_orders o JOIN customer_users u ON u.id = o.customer_id WHERE o.id = ?").bind(id).first();
  return null;
}

async function audit(db, admin, action, target, request) {
  try {
    await db.prepare('INSERT INTO admin_audit_log (id, admin_user_id, username_snapshot, action, resource, target_id, request_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), admin.id, admin.username, action, 'crm', String(target).slice(0, 120), request.headers.get('CF-Ray') || '').run();
  } catch { /* the audit table is optional in local fixtures */ }
}

const SERVICE_LABEL = { nfc: 'NFC / QR', auramenu: 'AuraMenu', quicksite: 'Website Management', account: 'Website Management', shop: 'NFC / QR' };

export async function handleCrm(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/admin/crm/')) return null;
  const db = env.DB;
  if (!db) return json({ error: 'Database unavailable.' }, 503);
  const admin = await getAuthenticatedAdmin(request, db);
  if (!admin) return json({ error: 'Unauthorized.' }, 401);
  const write = request.method !== 'GET';
  if (write && !sameOrigin(request)) return json({ error: 'Invalid request origin.' }, 403);
  if (write && admin.role === 'viewer') return json({ error: 'This account has read-only access.' }, 403);
  for (const sql of SCHEMA) await db.prepare(sql).run();

  const clientMatch = url.pathname.match(/^\/api\/admin\/crm\/clients\/(\d+)$/);
  if (clientMatch && request.method === 'GET') {
    const view = await clientView(db, Number(clientMatch[1]));
    return view ? json(view) : json({ error: 'Client not found.' }, 404);
  }
  if (url.pathname === '/api/admin/crm/inbox' && request.method === 'GET') return json({ items: await crmInbox(db) });
  if (url.pathname === '/api/admin/crm/search' && request.method === 'GET') return json({ items: await crmSearch(db, url.searchParams.get('q')) });

  if (url.pathname === '/api/admin/crm/links' && ['POST', 'DELETE'].includes(request.method)) {
    let body; try { body = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }
    const source = clean(body.source, 20), sourceId = clean(body.sourceId, 80);
    if (!LINKABLE.has(source) || !sourceId) return json({ error: 'Unknown record.' }, 400);
    if (request.method === 'DELETE') {
      await db.prepare('DELETE FROM crm_links WHERE source = ? AND source_id = ?').bind(source, sourceId).run();
      await audit(db, admin, 'unlink', `${source}:${sourceId}`, request);
      return json({ ok: true });
    }
    const record = await sourceRecord(db, source, sourceId);
    if (!record) return json({ error: 'Record not found.' }, 404);
    let clientId = Number(body.clientId) || 0;
    if (clientId) {
      if (!(await db.prepare('SELECT id FROM clients WHERE id = ?').bind(clientId).first())) return json({ error: 'Client not found.' }, 404);
    } else {
      // Create the client from the request's own contact details.
      const created = await db.prepare("INSERT INTO clients (name, company, email, phone, service, status, notes) VALUES (?, ?, ?, ?, ?, 'lead', '') RETURNING id")
        .bind(clean(record.name || record.company || record.email, 120) || 'New client', clean(record.company, 120), clean(record.email, 254), clean(record.phone, 40), SERVICE_LABEL[source] || '').first();
      clientId = created.id;
    }
    await db.prepare('INSERT INTO crm_links (source, source_id, client_id, created_by) VALUES (?, ?, ?, ?) ON CONFLICT(source, source_id) DO UPDATE SET client_id = excluded.client_id')
      .bind(source, sourceId, clientId, admin.username).run();
    await audit(db, admin, 'link', `${source}:${sourceId}->${clientId}`, request);
    return json({ ok: true, clientId }, 201);
  }
  return json({ error: 'Not found.' }, 404);
}
