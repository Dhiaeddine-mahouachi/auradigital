import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { d1 } from './d1.mjs';
import { createSession, hashPassword } from '../src/security.js';
import { handleCrm } from '../src/crm.js';

const ORIGIN = 'https://auradigitalworks.com';
function req(path, method = 'GET', body = null, cookie = '') {
  const headers = { Origin: ORIGIN };
  if (cookie) headers.Cookie = cookie;
  if (body !== null) headers['Content-Type'] = 'application/json';
  return new Request(ORIGIN + path, { method, headers, body: body === null ? undefined : JSON.stringify(body) });
}

async function setup() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(await readFile(new URL('../migrations/0001_admin_security.sql', import.meta.url), 'utf8'));
  sqlite.exec(`
    CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, type TEXT, quantity INTEGER, amount REAL, status TEXT, due_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, invoice_number TEXT, amount REAL, status TEXT, due_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, plan TEXT, amount REAL, interval TEXT, status TEXT, next_billing_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE nfc_requests (id TEXT PRIMARY KEY, card_type TEXT, business_name TEXT, contact_name TEXT, contact_phone TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE auramenu_requests (id TEXT PRIMARY KEY, slug TEXT, business_name TEXT, contact_name TEXT, contact_phone TEXT, whatsapp TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE quicksite_projects (id TEXT PRIMARY KEY, slug TEXT, business_name TEXT, contact_name TEXT, phone TEXT, whatsapp TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE customer_users (id TEXT PRIMARY KEY, email TEXT, full_name TEXT, password_hash TEXT, active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE shop_bank_orders (id TEXT PRIMARY KEY, reference TEXT, customer_id TEXT, payment_status TEXT, production_status TEXT, total_minor INTEGER, created_at TEXT DEFAULT (datetime('now')));
  `);
  const db = d1(sqlite);
  const owner = crypto.randomUUID(), viewer = crypto.randomUUID();
  await db.prepare('INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)').bind(owner, 'founder', 'Founder', await hashPassword('SecureFounderPass2026!'), 'owner').run();
  await db.prepare('INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)').bind(viewer, 'viewer', 'Viewer', await hashPassword('SecureViewerPass2026!'), 'viewer').run();
  const cookie = '__Host-aura_admin=' + await createSession(db, owner);
  const viewerCookie = '__Host-aura_admin=' + await createSession(db, viewer);
  sqlite.exec(`
    INSERT INTO clients (id, name, company, email, phone, status) VALUES (1, 'Ayşe Kaya', 'Café Lale', 'ayse@cafelale.test', '+90 532 111 22 33', 'active');
    INSERT INTO orders (client_id, type, quantity, amount, status) VALUES (1, 'NFC', 10, 7000, 'in_production');
    INSERT INTO invoices (client_id, invoice_number, amount, status) VALUES (1, 'INV-1', 7000, 'paid'), (1, 'INV-2', 2500, 'sent');
    INSERT INTO subscriptions (client_id, plan, amount, interval, status) VALUES (1, 'Business Care', 4900, 'monthly', 'active');
    INSERT INTO nfc_requests VALUES ('n1', 'review', 'Café Lale', 'Ayşe', '0532 111 22 33', '', 'pending', 'unpaid', '2026-11-01 10:00:00', '2026-11-01 10:00:00');
    INSERT INTO auramenu_requests VALUES ('m1', 'cafe-lale', 'Café Lale', 'Ayşe', '', '', 'AYSE@cafelale.test', 'approved', 'paid', '2026-11-02 10:00:00', '2026-11-02 10:00:00');
    INSERT INTO quicksite_projects VALUES ('q1', 'kebab', 'Kebap Evi', 'Mehmet', '0555 000 11 22', '', 'mehmet@kebap.test', 'pending', 'unpaid', '2026-11-03 10:00:00', '2026-11-03 10:00:00');
    INSERT INTO customer_users (id, email, full_name, password_hash) VALUES ('u1', 'ayse@cafelale.test', 'Ayşe Kaya', 'x'), ('u2', 'new@shop.test', 'New Person', 'x');
    INSERT INTO shop_bank_orders (id, reference, customer_id, payment_status, production_status, total_minor) VALUES ('s1', 'AD-1001', 'u1', 'paid', 'awaiting_artwork', 70000);
  `);
  return { sqlite, env: { DB: db }, cookie, viewerCookie };
}

test('client view joins every service by email, phone and account', async () => {
  const { env, cookie } = await setup();
  const res = await handleCrm(req('/api/admin/crm/clients/1', 'GET', null, cookie), env);
  assert.equal(res.status, 200);
  const view = await res.json();
  assert.deepEqual(view.services.map(s => s.source).sort(), ['auramenu', 'nfc'], 'NFC matched by phone, AuraMenu by email (case-insensitive)');
  assert.equal(view.accounts[0].id, 'u1');
  assert.equal(view.shopOrders[0].reference, 'AD-1001');
  assert.equal(view.totals.paid, 7000);
  assert.equal(view.totals.outstanding, 2500);
  assert.equal(view.totals.monthlyRecurring, 4900);
  assert.ok(view.timeline.length >= 7);
  assert.equal(view.services.find(s => s.source === 'quicksite'), undefined, 'other customers stay out');
});

test('inbox lists unmatched requests and accounts; linking creates or attaches a client', async () => {
  const { env, cookie, sqlite } = await setup();
  let inbox = await (await handleCrm(req('/api/admin/crm/inbox', 'GET', null, cookie), env)).json();
  assert.deepEqual(inbox.items.map(i => i.source + ':' + i.id).sort(), ['account:u2', 'quicksite:q1']);
  const created = await handleCrm(req('/api/admin/crm/links', 'POST', { source: 'quicksite', sourceId: 'q1' }, cookie), env);
  assert.equal(created.status, 201);
  const { clientId } = await created.json();
  const client = sqlite.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
  assert.equal(client.email, 'mehmet@kebap.test');
  assert.equal(client.company, 'Kebap Evi');
  const attach = await handleCrm(req('/api/admin/crm/links', 'POST', { source: 'account', sourceId: 'u2', clientId: 1 }, cookie), env);
  assert.equal(attach.status, 201);
  const view = await (await handleCrm(req('/api/admin/crm/clients/1', 'GET', null, cookie), env)).json();
  assert.ok(view.accounts.some(a => a.id === 'u2'), 'explicit link shows the account under the client');
  inbox = await (await handleCrm(req('/api/admin/crm/inbox', 'GET', null, cookie), env)).json();
  assert.equal(inbox.items.length, 0);
});

test('search spans clients and services; viewers cannot change links; auth is required', async () => {
  const { env, cookie, viewerCookie } = await setup();
  const hits = (await (await handleCrm(req('/api/admin/crm/search?q=kebap', 'GET', null, cookie), env)).json()).items;
  assert.deepEqual(hits.map(h => h.type), ['quicksite']);
  assert.equal((await handleCrm(req('/api/admin/crm/search?q=lale', 'GET', null, cookie), env).then(r => r.json())).items[0].type, 'client');
  assert.equal((await handleCrm(req('/api/admin/crm/links', 'POST', { source: 'nfc', sourceId: 'n1', clientId: 1 }, viewerCookie), env)).status, 403);
  assert.equal((await handleCrm(req('/api/admin/crm/inbox'), env)).status, 401);
  assert.equal(await handleCrm(req('/api/admin/clients'), env), null, 'other admin routes pass through');
});
