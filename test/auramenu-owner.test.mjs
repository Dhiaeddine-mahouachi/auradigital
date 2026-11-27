import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { ensureCustomers, tokenHash } from '../src/customer-accounts.ts';
import { createSession } from '../src/security.js';

test('menus belong to the AuraDigital account that claims them; other accounts are isolated', async (t) => {
  const sqlite = new DatabaseSync(':memory:'); t.after(() => sqlite.close());
  const DB = d1(sqlite), limiter = { limit: async () => ({ success: true }) };
  const env = { DB, TRACK_RATE_LIMITER: limiter, LOGIN_RATE_LIMITER: limiter, AURAMENU_STANDARD_ENABLED: 'true', CUSTOMER_IDENTITY_ENABLED: 'true', CUSTOMER_AUTH_ORIGIN: 'https://auradigitalworks.com' };
  const call = (path, method = 'GET', body, headers = {}) => app.fetch(new Request('https://auradigitalworks.com' + path, {
    method, body: body === undefined ? undefined : JSON.stringify(body),
    headers: { Origin: 'https://auradigitalworks.com', 'Content-Type': 'application/json', ...headers },
  }), env, { waitUntil() {} });
  assert.equal((await call('/api/settings')).status, 200);
  sqlite.exec(await readFile(new URL('../migrations/0041_auramenu_design_settings.sql', import.meta.url), 'utf8'));
  await ensureCustomers(DB);
  async function account(email) {
    const id = crypto.randomUUID(), raw = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '');
    await DB.prepare("INSERT INTO customer_users(id,email,full_name,password_hash) VALUES(?,?,?,'!x')").bind(id, email, email).run();
    await DB.prepare("INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(await tokenHash(raw), id).run();
    return { Cookie: '__Host-auramenu_customer=' + raw };
  }
  const a = await account('a@test.test'), b = await account('b@test.test');
  const post = await call('/api/auramenu/requests', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe A', contactName: 'A', contactPhone: '111', slug: 'cafe-a', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] });
  assert.equal(post.status, 201);
  const { request, token } = await post.json();
  const dash = '/api/auramenu/dashboard/' + request.id, claim = dash + '/claim';

  // Account alone is not enough before the menu is linked.
  assert.equal((await call(dash, 'GET', undefined, a)).status, 401);
  assert.equal((await call(claim, 'POST', { existingToken: '' }, a)).status, 401);
  // Token + account A links the menu to A.
  let r = await (await call(claim, 'POST', { existingToken: token }, a)).json();
  assert.equal(r.owned, true); assert.equal(r.token, token);
  // A now opens it on any device without the token; the token is not handed out again.
  assert.equal((await call(dash, 'GET', undefined, a)).status, 200);
  r = await (await call(claim, 'POST', { existingToken: '' }, a)).json();
  assert.equal(r.token, ''); assert.equal(r.menu.businessName ?? r.menu.business_name ?? 'Cafe A', 'Cafe A');
  // B cannot read or claim it, and cannot take ownership even with the token.
  assert.equal((await call(dash, 'GET', undefined, b)).status, 401);
  assert.equal((await call(claim, 'POST', { existingToken: '' }, b)).status, 401);
  assert.equal((await (await call(claim, 'POST', { existingToken: token }, b)).json()).owned, false);
  assert.equal((await call(dash, 'GET', undefined, b)).status, 401);
  // "My menus" lists only the owner's menus.
  const mineA = await (await call('/api/auramenu/account/menus', 'GET', undefined, a)).json();
  assert.deepEqual(mineA.menus.map(m => m.slug), ['cafe-a']);
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, b)).json()).menus, []);
  assert.equal((await call('/api/auramenu/account/menus')).status, 401);
  // A forged / AuraDigital-domain cookie name does not count as an AuraMenu session.
  assert.equal((await call(dash, 'GET', undefined, { Cookie: a.Cookie.replace('__Host-auramenu_customer', '__Host-aura_customer') })).status, 401);

  const created = await call('/api/auramenu/requests', 'POST', {
    templateId: 'std-02', planId: 'annual', businessName: 'Cafe B', contactName: 'A',
    contactPhone: '222', slug: 'cafe-b', categories: [{ name: 'Food', items: [{ name: 'Toast', price: '90' }] }],
  }, a);
  assert.equal(created.status, 201);
  const { request: secondMenu } = await created.json();
  assert.equal((await call('/api/auramenu/dashboard/' + secondMenu.id, 'GET', undefined, a)).status, 200);
  const studioMenus = await (await call('/api/auramenu/account/menus', 'GET', undefined, a)).json();
  const hubMenus = await (await call('/api/auramenu/hub/menus', 'GET', undefined, {
    Cookie: a.Cookie.replace('__Host-auramenu_customer', '__Host-aura_customer'),
  })).json();
  assert.deepEqual(studioMenus.menus, hubMenus.menus);
  assert.deepEqual(studioMenus.menus.map(m => m.slug).sort(), ['cafe-a', 'cafe-b']);
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, b)).json()).menus, []);

  const publicPath = '/api/auramenu/sites/cafe-b';
  const publish = '/api/auramenu/dashboard/' + secondMenu.id + '/publish';
  assert.equal((await call(publicPath)).status, 404);
  assert.equal((await call(publish, 'POST', undefined, a)).status, 409);
  sqlite.exec("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES ('owner','owner','Owner','test','owner')");
  const admin = { Cookie: '__Host-aura_admin=' + await createSession(DB, 'owner') };
  assert.equal((await call('/api/admin/auramenu/' + secondMenu.id, 'PATCH', { paymentStatus: 'paid' }, admin)).status, 200);
  assert.equal((await call(publicPath)).status, 404);
  assert.equal((await call(publish, 'POST', undefined, b)).status, 401);
  assert.equal((await call(publish, 'POST', undefined, a)).status, 200);
  const before = (await (await call(publicPath)).json()).menu;
  assert.equal(before.status, 'approved');
  assert.equal((await call(publish, 'POST', undefined, a)).status, 200);
  const unchanged = (await (await call(publicPath)).json()).menu;
  assert.equal(unchanged.revision, before.revision);
  const update = await call('/api/auramenu/dashboard/' + secondMenu.id, 'PATCH', {
    categories: [{ name: 'Food', items: [{ name: 'Toast', price: '95', available: false }] }],
  }, a);
  assert.equal(update.status, 200);
  const published = (await (await call(publicPath)).json()).menu;
  assert.equal(published.categories[0].items[0].price, '95');
  assert.equal(published.categories[0].items[0].available, false);
});
