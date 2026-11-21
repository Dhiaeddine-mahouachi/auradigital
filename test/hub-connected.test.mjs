import test from 'node:test';
import assert from 'node:assert/strict';
import { hubFixture, profile } from './hub-fixture.mjs';

async function setup() {
  const f = await hubFixture();
  f.sqlite.exec(`
    CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT, service TEXT, status TEXT, notes TEXT, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, client_id INTEGER, type TEXT, quantity INTEGER, amount REAL, status TEXT, due_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, client_id INTEGER, invoice_number TEXT, amount REAL, status TEXT, due_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY, client_id INTEGER, plan TEXT, amount REAL, interval TEXT, status TEXT, next_billing_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS nfc_requests (id TEXT PRIMARY KEY, card_type TEXT, business_name TEXT, contact_name TEXT, contact_phone TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE IF NOT EXISTS crm_links (source TEXT, source_id TEXT, client_id INTEGER, created_by TEXT, created_at TEXT DEFAULT (datetime('now')), PRIMARY KEY(source, source_id));
  `);
  return f;
}
const route = id => '/api/hub/workspaces/' + id + '/connected';

test('a verified customer sees requests sent with their email and the CRM records of their client', async () => {
  const f = await setup();
  const u = await f.user('owner@cafe.test', true);
  const { id } = await (await f.call('/api/hub/workspaces', u, 'POST', { mode: 'myself', profile: profile('Cafe') })).json();
  f.sqlite.exec(`
    INSERT INTO clients (id, name, email, status) VALUES (5, 'Cafe', 'OWNER@cafe.test', 'active'), (6, 'Other', 'other@x.test', 'active');
    INSERT INTO invoices (client_id, invoice_number, amount, status) VALUES (5, 'INV-9', 1200, 'sent'), (5, 'INV-D', 99, 'draft'), (6, 'INV-X', 5, 'sent');
    INSERT INTO subscriptions (client_id, plan, amount, interval, status) VALUES (5, 'Business Care', 4900, 'monthly', 'active');
    INSERT INTO nfc_requests VALUES ('n1','review','Cafe','A','','owner@cafe.test','pending','unpaid','2026-11-01','2026-11-01'), ('n2','review','Other','B','','other@x.test','pending','unpaid','2026-11-01','2026-11-01');
  `);
  const res = await f.call(route(id), u);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.deepEqual(data.requests.map(r => r.id), ['n1']);
  assert.deepEqual(data.invoices.map(i => i.number), ['INV-9'], 'own non-draft invoices only');
  assert.equal(data.totals.amountDue, 1200);
  assert.equal(data.subscriptions[0].plan, 'Business Care');
});

test('an unverified email matches nothing, but a link made by the team does', async () => {
  const f = await setup();
  const u = await f.user('new@cafe.test', false);
  const { id } = await (await f.call('/api/hub/workspaces', u, 'POST', { mode: 'myself', profile: profile('New Cafe') })).json();
  f.sqlite.exec(`INSERT INTO clients (id, name, email) VALUES (7, 'New Cafe', 'new@cafe.test');
    INSERT INTO invoices (client_id, invoice_number, amount, status) VALUES (7, 'INV-7', 300, 'paid');
    INSERT INTO nfc_requests VALUES ('n7','review','New Cafe','A','','new@cafe.test','approved','paid','2026-11-01','2026-11-01');`);
  let data = await (await f.call(route(id), u)).json();
  assert.equal(data.verified, false);
  assert.equal(data.invoices.length + data.requests.length, 0);
  f.sqlite.prepare("INSERT INTO crm_links (source, source_id, client_id) VALUES ('account', ?, 7), ('nfc', 'n7', 7)").run(u.id);
  data = await (await f.call(route(id), u)).json();
  assert.deepEqual(data.invoices.map(i => i.number), ['INV-7']);
  assert.deepEqual(data.requests.map(r => r.id), ['n7']);
});

test('other customers cannot read a workspace they do not belong to', async () => {
  const f = await setup();
  const owner = await f.user('a@cafe.test', true), stranger = await f.user('b@cafe.test', true);
  const { id } = await (await f.call('/api/hub/workspaces', owner, 'POST', { mode: 'myself', profile: profile('A') })).json();
  assert.equal((await f.call(route(id), stranger)).status, 404);
});
