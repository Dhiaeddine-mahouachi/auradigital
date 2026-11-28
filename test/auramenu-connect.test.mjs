import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { hubFixture } from './hub-fixture.mjs';
import { handleAuraMenuConnect, AURAMENU_COOKIE } from '../src/auramenu-connect.js';
import { customerReturnPath } from '../src/customer-return.js';

const b64 = buf => Buffer.from(buf).toString('base64url');
function pkce() { const verifier = b64(randomBytes(32)); return { verifier, challenge: b64(createHash('sha256').update(verifier).digest()), state: b64(randomBytes(18)) }; }
async function call(f, url, { method = 'GET', cookie, origin, body } = {}) {
  const headers = { ...(cookie ? { Cookie: cookie } : {}), ...(origin ? { Origin: origin } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) };
  return handleAuraMenuConnect(new Request(url, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) }), f.env);
}
async function authorize(f, actor, p) {
  const r = await call(f, `https://aura.test/api/auramenu/connect?challenge=${p.challenge}&state=${p.state}`, { cookie: actor?.cookie });
  return { r, hash: new URLSearchParams(new URL(r.headers.get('Location'), 'https://x.test').hash.slice(1)) };
}
const exchange = (f, body, origin = 'https://auramenu.space') => call(f, 'https://auramenu.space/api/auramenu/connect/exchange', { method: 'POST', origin, body });

test('signed-out visitors are sent to AuraHub login with a return path the login page accepts', async () => {
  const f = await hubFixture(), p = pkce();
  const { r } = await authorize(f, null, p);
  assert.equal(r.status, 303);
  const login = new URL(r.headers.get('Location'));
  assert.equal(login.origin + login.pathname, 'https://aura.test/hub/login');
  assert.equal(customerReturnPath(login.searchParams.get('next'), ''), login.searchParams.get('next'));
  assert.equal(customerReturnPath('/api/auramenu/connect?challenge=x&state=y', ''), '');
});

test('the connect step only runs on the account origin', async () => {
  const f = await hubFixture(), p = pkce();
  const r = await call(f, `https://auramenu.space/api/auramenu/connect?challenge=${p.challenge}&state=${p.state}`);
  assert.equal(r.status, 303);
  assert.match(r.headers.get('Location'), /^https:\/\/aura\.test\/api\/auramenu\/connect\?/);
});

test('unverified accounts get no code', async () => {
  const f = await hubFixture(), u = await f.user('new@test.test'), p = pkce();
  const { r, hash } = await authorize(f, u, p);
  assert.match(r.headers.get('Location'), /^https:\/\/auramenu\.space\/signin\.html#/);
  assert.equal(hash.get('error'), 'verify'); assert.equal(hash.get('code'), null);
});

test('verified account → one-time code → host-only auramenu.space session; no AuraDigital cookie is set', async () => {
  const f = await hubFixture(), u = await f.user('chef@test.test', true), p = pkce();
  const { hash } = await authorize(f, u, p);
  assert.equal(hash.get('state'), p.state);
  const code = hash.get('code'); assert.match(code, /^[a-f0-9]{64}$/);
  const r = await exchange(f, { code, verifier: p.verifier });
  assert.equal(r.status, 200);
  const setCookie = r.headers.get('Set-Cookie');
  assert.match(setCookie, new RegExp(`^${AURAMENU_COOKIE}=[a-f0-9]{64}; Path=/; Max-Age=\\d+; HttpOnly; Secure; SameSite=Lax$`));
  assert.doesNotMatch(setCookie, /Domain=|aura_customer=/);
  assert.equal((await r.json()).user.email, 'chef@test.test');
  const cookie = setCookie.split(';')[0];
  const session = await (await call(f, 'https://auramenu.space/api/auramenu/account/session', { cookie })).json();
  assert.equal(session.user.email, 'chef@test.test');
  // The AuraDigital session cookie is not accepted as an AuraMenu session, and vice versa is a different name.
  assert.equal((await (await call(f, 'https://auramenu.space/api/auramenu/account/session', { cookie: u.cookie })).json()).user, null);
  // Replay of the same code fails.
  assert.equal((await exchange(f, { code, verifier: p.verifier })).status, 400);
  // Logout removes the session.
  await call(f, 'https://auramenu.space/api/auramenu/account/logout', { method: 'POST', origin: 'https://auramenu.space', cookie });
  assert.equal((await (await call(f, 'https://auramenu.space/api/auramenu/account/session', { cookie })).json()).user, null);
});

test('wrong verifier, foreign origin and expired codes are refused', async () => {
  const f = await hubFixture(), u = await f.user('chef2@test.test', true);
  let p = pkce(), { hash } = await authorize(f, u, p);
  assert.equal((await exchange(f, { code: hash.get('code'), verifier: pkce().verifier })).status, 400);
  p = pkce(); ({ hash } = await authorize(f, u, p));
  assert.equal((await exchange(f, { code: hash.get('code'), verifier: p.verifier }, 'https://evil.test')).status, 403);
  await f.DB.prepare("UPDATE auramenu_connect_codes SET expires_at='2000-01-01 00:00:00'").run();
  assert.equal((await exchange(f, { code: hash.get('code'), verifier: p.verifier })).status, 400);
});

test('malformed challenge or state is rejected', async () => {
  const f = await hubFixture();
  assert.equal((await call(f, 'https://aura.test/api/auramenu/connect?challenge=short&state=abc')).status, 400);
});

test('staging PKCE returns to its isolated host and blocks a production origin', async () => {
  const f = await hubFixture(), p = pkce();
  const accounts = 'https://auradigital-staging.fixture.workers.dev';
  const menu = 'https://auramenu-staging.fixture.workers.dev';
  Object.assign(f.env, { AURA_ENVIRONMENT: 'staging', CUSTOMER_AUTH_ORIGIN: accounts, AURAMENU_ORIGIN: menu });
  const customer = await f.user('staging-chef@test.test', true);
  const result = await call(f, `${accounts}/api/auramenu/connect?challenge=${p.challenge}&state=${p.state}`, { cookie: customer.cookie });
  const callback = new URL(result.headers.get('Location'));
  assert.equal(callback.origin, menu);
  const code = new URLSearchParams(callback.hash.slice(1)).get('code');
  const body = { code, verifier: p.verifier };
  const url = menu + '/api/auramenu/connect/exchange';
  assert.equal((await call(f, url, { method: 'POST', origin: 'https://auramenu.space', body })).status, 403);
  const authenticated = await call(f, url, { method: 'POST', origin: menu, body });
  assert.equal(authenticated.status, 200);
  assert.doesNotMatch(authenticated.headers.get('Set-Cookie'), /Domain=/);
  f.env.AURAMENU_ORIGIN = 'https://auramenu.space';
  assert.equal((await call(f, menu + '/api/auramenu/account/session')).status, 503);
});

test('staging accepts staging.auramenu.space but never the production menu host', async () => {
  const f = await hubFixture(), p = pkce();
  const accounts = 'https://auradigital-staging.fixture.workers.dev';
  const menu = 'https://staging.auramenu.space';
  Object.assign(f.env, { AURA_ENVIRONMENT: 'staging', CUSTOMER_AUTH_ORIGIN: accounts, AURAMENU_ORIGIN: menu });
  const customer = await f.user('staging-domain@test.test', true);
  const result = await call(f, `${accounts}/api/auramenu/connect?challenge=${p.challenge}&state=${p.state}`, { cookie: customer.cookie });
  const callback = new URL(result.headers.get('Location'));
  assert.equal(callback.origin, menu);
  const code = new URLSearchParams(callback.hash.slice(1)).get('code');
  const url = menu + '/api/auramenu/connect/exchange';
  assert.equal((await call(f, url, { method: 'POST', origin: 'https://auramenu.space', body: { code, verifier: p.verifier } })).status, 403);
  assert.equal((await call(f, url, { method: 'POST', origin: menu, body: { code, verifier: p.verifier } })).status, 200);
  f.env.AURA_ENVIRONMENT = 'production';
  f.env.AURAMENU_ORIGIN = 'https://staging.auramenu.space';
  assert.notEqual((await call(f, `https://auradigitalworks.com/api/auramenu/connect?challenge=${p.challenge}&state=${p.state}`, { cookie: customer.cookie })).headers.get('Location')?.startsWith(menu), true);
});
