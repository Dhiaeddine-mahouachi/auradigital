import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { ensureCustomers, tokenHash } from '../src/customer-accounts.ts';

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
  // Registering without an account is refused.
  const anon = await call('/api/auramenu/requests', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe Z', contactPhone: '999', slug: 'cafe-z', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] });
  assert.equal(anon.status, 401); assert.equal((await anon.json()).signIn, true);
  const anon2 = await call('/api/auramenu/register', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe Y', contactPhone: '998', slug: 'cafe-y', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] });
  assert.equal(anon2.status, 401);
  const viaRegister = await call('/api/auramenu/register', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe Y', contactPhone: '998', slug: 'cafe-y', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] }, b);
  assert.equal(viaRegister.status, 201);
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, b)).json()).menus.map(m => m.slug), ['cafe-y']);
  const post = await call('/api/auramenu/requests', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe A', contactPhone: '111', slug: 'cafe-a', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] }, a);
  assert.equal(post.status, 201);
  const { request, token } = await post.json();
  const dash = '/api/auramenu/dashboard/' + request.id, claim = dash + '/claim';
  // The account that registered the menu owns it at once and opens it without the token.
  assert.equal((await call(dash, 'GET', undefined, a)).status, 200);
  const row = await DB.prepare('SELECT email, contact_name FROM auramenu_requests WHERE id=?').bind(request.id).first();
  assert.equal(row.email, 'a@test.test');
  let r = await (await call(claim, 'POST', { existingToken: '' }, a)).json();
  assert.equal(r.token, '');
  // B cannot read or claim it, and cannot take ownership even with the token.
  assert.equal((await call(dash, 'GET', undefined, b)).status, 401);
  assert.equal((await call(claim, 'POST', { existingToken: '' }, b)).status, 401);
  assert.equal((await (await call(claim, 'POST', { existingToken: token }, b)).json()).owned, false);
  assert.equal((await call(dash, 'GET', undefined, b)).status, 401);
  // "My menus" lists only the owner's menus.
  const mineA = await (await call('/api/auramenu/account/menus', 'GET', undefined, a)).json();
  assert.deepEqual(mineA.menus.map(m => m.slug), ['cafe-a']);
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, b)).json()).menus.map(m => m.slug), ['cafe-y']);
  assert.equal((await call('/api/auramenu/account/menus')).status, 401);
  // A forged / AuraDigital-domain cookie name does not count as an AuraMenu session.
  assert.equal((await call(dash, 'GET', undefined, { Cookie: a.Cookie.replace('__Host-auramenu_customer', '__Host-aura_customer') })).status, 401);
});
