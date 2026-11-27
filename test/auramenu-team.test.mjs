import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { ensureCustomers, tokenHash } from '../src/customer-accounts.ts';
import { activateMenuBilling } from '../src/menu-billing.js';

let shared;
async function setup() {
  if (shared) return shared;
  const sqlite = new DatabaseSync(':memory:');
  const DB = d1(sqlite), limiter = { limit: async () => ({ success: true }) };
  const env = { DB, TRACK_RATE_LIMITER: limiter, LOGIN_RATE_LIMITER: limiter, AURAMENU_STANDARD_ENABLED: 'true', CUSTOMER_IDENTITY_ENABLED: 'true', CUSTOMER_AUTH_ORIGIN: 'https://auradigitalworks.com' };
  const call = (path, method = 'GET', body, headers = {}, host = 'https://auradigitalworks.com') => app.fetch(new Request(host + path, {
    method, body: body === undefined ? undefined : JSON.stringify(body),
    headers: { Origin: host, 'Content-Type': 'application/json', ...headers },
  }), env, { waitUntil() {} });
  assert.equal((await call('/api/settings')).status, 200);
  sqlite.exec(await readFile(new URL('../migrations/0041_auramenu_design_settings.sql', import.meta.url), 'utf8'));
  sqlite.exec(await readFile(new URL('../migrations/0028_growth_os.sql', import.meta.url), 'utf8').catch(() => ''));
  await ensureCustomers(DB);
  await DB.prepare("CREATE TABLE IF NOT EXISTS customer_verified_emails (customer_id TEXT NOT NULL, email TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'email', verified_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (customer_id))").run().catch(() => {});
  async function account(email, verified = true) {
    const id = crypto.randomUUID(), raw = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '');
    await DB.prepare("INSERT INTO customer_users(id,email,full_name,password_hash) VALUES(?,?,?,'!x')").bind(id, email, email).run();
    await DB.prepare("INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(await tokenHash(raw), id).run();
    if (verified) await DB.prepare("INSERT INTO customer_verified_emails(customer_id,email,source) VALUES(?,?,'email')").bind(id, email).run();
    return { id, email, menu: { Cookie: '__Host-auramenu_customer=' + raw }, hub: { Cookie: '__Host-aura_customer=' + raw } };
  }
  const post = await call('/api/auramenu/requests', 'POST', { templateId: 'std-01', planId: 'annual', businessName: 'Cafe A', contactName: 'A', contactPhone: '111', slug: 'cafe-a', tagline: 'Old tagline', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] });
  assert.equal(post.status, 201);
  const { request, token } = await post.json();
  return (shared = { DB, call, account, id: request.id, token });
}

test('owner adds manager and editor; each role can do only its part; outsiders see nothing', async (t) => {
  const { DB, call, account, id, token } = await setup();
  await DB.prepare("UPDATE auramenu_requests SET status='approved', payment_status='paid' WHERE id=?").bind(id).run();
  await activateMenuBilling(DB, id);
  const owner = await account('owner@test.test'), mgr = await account('mgr@test.test'), ed = await account('ed@test.test'), out = await account('out@test.test'), unverified = await account('new@test.test', false);
  const dash = '/api/auramenu/dashboard/' + id, members = `/api/auramenu/account/menus/${id}/members`;
  assert.equal((await (await call(dash + '/claim', 'POST', { existingToken: token }, owner.menu)).json()).owned, true);

  assert.equal((await call(members, 'POST', { email: 'mgr@test.test', role: 'manager' }, owner.menu)).status, 201);
  assert.equal((await call(members, 'POST', { email: 'ED@test.test', role: 'editor' }, owner.menu)).status, 201);
  assert.equal((await call(members, 'POST', { email: 'new@test.test', role: 'editor' }, owner.menu)).status, 404, 'unverified accounts cannot be added');
  assert.equal((await call(members, 'POST', { email: 'nobody@test.test', role: 'editor' }, owner.menu)).status, 404);
  assert.equal((await call(members, 'POST', { email: 'out@test.test', role: 'owner' }, owner.menu)).status, 400, 'owner role cannot be granted');
  assert.equal((await call(members, 'POST', { email: 'out@test.test', role: 'editor' }, mgr.menu)).status, 403, 'manager cannot add people');
  assert.equal((await call(members, 'GET', undefined, ed.menu)).status, 404, 'editor cannot see the team');
  const list = await (await call(members, 'GET', undefined, mgr.menu)).json();
  assert.deepEqual(list.members.map(m => [m.email, m.role]), [['owner@test.test', 'owner'], ['mgr@test.test', 'manager'], ['ed@test.test', 'editor']]);

  // Editor: content changes saved, other fields ignored, template unchanged, plan actions refused.
  const editorSave = await call(dash, 'PATCH', { templateId: 'std-05', businessName: 'Hacked', tagline: 'New', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '95' }] }] }, ed.menu);
  assert.equal(editorSave.status, 200);
  assert.equal((await editorSave.json()).menu.role, 'editor');
  let row = await DB.prepare('SELECT template_id, business_name, tagline, categories_json FROM auramenu_requests WHERE id=?').bind(id).first();
  assert.equal(row.template_id, 'std-01'); assert.equal(row.business_name, 'Cafe A'); assert.equal(row.tagline, 'Old tagline');
  assert.match(row.categories_json, /"95"/);
  assert.equal((await (await call(dash, 'GET', undefined, ed.menu)).json()).menu.role, 'editor');
  assert.equal((await call(dash + '/access-request', 'POST', { days: 1 }, ed.menu)).status, 403);
  // Manager: may change info and design.
  const managerSave = await call(dash, 'PATCH', { templateId: 'std-05', businessName: 'Cafe A+', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '95' }] }] }, mgr.menu);
  assert.equal(managerSave.status, 200);
  assert.equal((await managerSave.json()).menu.role, 'manager');
  row = await DB.prepare('SELECT template_id, business_name FROM auramenu_requests WHERE id=?').bind(id).first();
  assert.equal(row.template_id, 'std-05'); assert.equal(row.business_name, 'Cafe A+');
  assert.equal((await call(dash + '/access-request', 'POST', { days: 1 }, mgr.menu)).status, 403);
  // Outsider: nothing.
  assert.equal((await call(dash, 'GET', undefined, out.menu)).status, 401);
  assert.equal((await call(dash, 'PATCH', { categories: [] }, out.menu)).status, 401);
  assert.equal((await call(members, 'GET', undefined, out.menu)).status, 404);
  // My menus shows roles; AuraHub shows the same list with the AuraDigital session.
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, ed.menu)).json()).menus.map(m => m.role), ['editor']);
  const hub = await (await call('/api/auramenu/hub/menus', 'GET', undefined, owner.hub)).json();
  assert.deepEqual(hub.menus.map(m => [m.slug, m.role]), [['cafe-a', 'owner']]);
  assert.equal((await call('/api/auramenu/hub/menus', 'GET', undefined, owner.menu)).status, 401, 'AuraMenu cookie is not an AuraDigital session');
  // Removal: owner removes the editor; editor loses access at once. A member can leave on their own.
  assert.equal((await call(`${members}/${ed.id}`, 'DELETE', undefined, mgr.menu)).status, 403);
  assert.equal((await call(`${members}/${ed.id}`, 'DELETE', undefined, owner.menu)).status, 200);
  assert.equal((await call(dash, 'GET', undefined, ed.menu)).status, 401);
  assert.equal((await call(`${members}/${mgr.id}`, 'DELETE', undefined, mgr.menu)).status, 200);
  assert.equal((await call(dash, 'GET', undefined, mgr.menu)).status, 401);
  // Cross-site writes are refused.
  assert.equal((await call(members, 'POST', { email: 'out@test.test', role: 'editor' }, { ...owner.menu, Origin: 'https://evil.test' })).status, 403);
});

test('cloud drafts are private, versioned and limited', async (t) => {
  const { call, account } = await setup();
  const a = await account('a2@test.test'), b = await account('b2@test.test');
  const url = '/api/auramenu/account/drafts/builder', data = { fields: { businessName: 'Kebap Evi' }, categories: [] };
  assert.equal((await call(url, 'GET', undefined, a.menu)).status, 404);
  assert.equal((await call(url, 'PUT', { name: 'Kebap Evi', data }, a.menu)).status, 201);
  const got = await (await call(url, 'GET', undefined, a.menu)).json();
  assert.deepEqual(got.draft.data, data); assert.equal(got.draft.version, 1);
  assert.equal((await call(url, 'GET', undefined, b.menu)).status, 404, 'other accounts cannot read it');
  assert.equal((await (await call(url, 'PUT', { name: 'x', data, baseVersion: 1 }, a.menu)).json()).version, 2);
  assert.equal((await call(url, 'PUT', { name: 'x', data, baseVersion: 1 }, a.menu)).status, 409, 'stale device gets a conflict');
  const savedVersion = 2;
  assert.equal((await (await call(url, 'PUT', { name: 'x', data }, a.menu)).json()).version, savedVersion);
  assert.equal((await call(url + '?baseVersion=1', 'DELETE', undefined, a.menu)).status, 409);
  assert.equal((await (await call(url, 'GET', undefined, a.menu)).json()).draft.version, savedVersion);
  const concurrent = await Promise.all(['Device one', 'Device two'].map(name =>
    call(url, 'PUT', { name, data, baseVersion: savedVersion }, a.menu)
  ));
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
  assert.equal((await call(url, 'PUT', { data: { big: 'x'.repeat(300 * 1024) } }, a.menu)).status, 413);
  assert.equal((await call(url, 'PUT', { data: [] }, a.menu)).status, 400);
  assert.equal((await call(url, 'GET')).status, 401);
  for (const n of [1, 2, 3, 4]) assert.equal((await call(`/api/auramenu/account/drafts/d${n}`, 'PUT', { data }, a.menu)).status, 201);
  assert.equal((await call('/api/auramenu/account/drafts/d5', 'PUT', { data }, a.menu)).status, 409);
  assert.equal((await (await call('/api/auramenu/account/drafts', 'GET', undefined, a.menu)).json()).drafts.length, 5);
  assert.equal((await call(url + '?baseVersion=3', 'DELETE', undefined, a.menu)).status, 200);
  assert.equal((await call(url, 'GET', undefined, a.menu)).status, 404);
  assert.equal((await call(url, 'PUT', { data, baseVersion: 3 }, a.menu)).status, 409, 'a stale edit cannot recreate a removed draft');
});
