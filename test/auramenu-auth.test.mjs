import test from 'node:test';
import assert from 'node:assert/strict';
import { hubFixture } from './hub-fixture.mjs';
import { handleAuraMenuAuth } from '../src/auramenu-auth.js';
import { handleAuraMenuConnect, AURAMENU_COOKIE } from '../src/auramenu-connect.js';
import { tokenHash } from '../src/customer-accounts.ts';

const MENU = 'https://auramenu.space';
async function call(f, action, { method = 'POST', body, cookie, origin = MENU } = {}) {
  const headers = { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) };
  return handleAuraMenuAuth(new Request(`${MENU}/api/auramenu/auth/${action}`, { method, headers, body: body ? JSON.stringify(body) : undefined }), f.env);
}
const menuCookie = r => (r.headers.get('Set-Cookie') || '').split(';')[0];

test('AuraMenu registration and login use the AuraDigital account and set only an AuraMenu host-only cookie', async () => {
  const f = await hubFixture();
  const reg = await call(f, 'register', { body: { name: 'Chef Ali', email: 'Chef@Test.test', password: 'Saffron-lake-0142!', acceptTerms: true } });
  assert.equal(reg.status, 200);
  const set = reg.headers.get('Set-Cookie');
  assert.match(set, new RegExp(`^${AURAMENU_COOKIE}=[a-f0-9]{64}; Path=/; Max-Age=\\d+; HttpOnly; Secure; SameSite=Lax$`));
  assert.doesNotMatch(set, /aura_customer=|Domain=/);
  const user = await f.DB.prepare('SELECT id, email FROM customer_users WHERE email=?').bind('chef@test.test').first();
  assert.ok(user, 'account lives in the central customer_users table');
  // The AuraMenu session is a normal AuraDigital session row and works with AuraMenu account routes.
  const session = await (await handleAuraMenuConnect(new Request(`${MENU}/api/auramenu/account/session`, { headers: { Cookie: menuCookie(reg) } }), f.env)).json();
  assert.equal(session.user.email, 'chef@test.test');
  // Login with the same credentials; wrong password refused; duplicate registration refused.
  assert.equal((await call(f, 'login', { body: { email: 'chef@test.test', password: 'Saffron-lake-0142!' } })).status, 200);
  assert.equal((await call(f, 'login', { body: { email: 'chef@test.test', password: 'wrong-password-123' } })).status, 401);
  assert.equal((await call(f, 'register', { body: { name: 'X', email: 'chef@test.test', password: 'Saffron-lake-0142!', acceptTerms: true } })).status, 400);
  // The same account signs in on AuraDigital too (shared identity, separate cookies).
  const hub = await f.call('/api/customer/login', null, 'POST', { email: 'chef@test.test', password: 'Saffron-lake-0142!' });
  assert.equal(hub.status, 200); assert.match(hub.headers.get('Set-Cookie'), /^__Host-aura_customer=/);
});

test('foreign origins are refused and GET-only routes reject POST', async () => {
  const f = await hubFixture();
  assert.equal((await call(f, 'login', { origin: 'https://evil.test', body: { email: 'a@b.c', password: 'x' } })).status, 403);
  assert.equal((await call(f, 'capabilities', { method: 'POST', body: {} })).status, 405);
  assert.equal((await call(f, 'nope', { body: {} })).status, 404);
  const caps = await (await call(f, 'capabilities', { method: 'GET' })).json();
  assert.equal(typeof caps.google, 'boolean');
});

test('verification and reset tokens work from AuraMenu screens; reset signs out every session', async () => {
  const f = await hubFixture(), u = await f.user('reset@test.test');
  const raw = 'c'.repeat(64), now = Math.floor(Date.now() / 1000);
  await f.DB.prepare('INSERT INTO customer_action_tokens(token_hash,customer_id,email,purpose,expires_at,created_at) VALUES(?,?,?,?,?,?)').bind(await tokenHash(raw), u.id, 'reset@test.test', 'verify', now + 3600, now).run();
  assert.equal((await call(f, 'verify', { body: { token: raw } })).status, 200);
  assert.ok(await f.DB.prepare('SELECT 1 FROM customer_verified_emails WHERE customer_id=?').bind(u.id).first());
  assert.equal((await call(f, 'verify', { body: { token: raw } })).status, 400, 'single use');
  const reset = 'd'.repeat(64);
  await f.DB.prepare('INSERT INTO customer_action_tokens(token_hash,customer_id,email,purpose,expires_at,created_at) VALUES(?,?,?,?,?,?)').bind(await tokenHash(reset), u.id, 'reset@test.test', 'reset', now + 1800, now).run();
  assert.equal((await call(f, 'reset-password', { body: { token: reset, password: 'New-saffron-lake-77!' } })).status, 200);
  assert.equal((await f.DB.prepare('SELECT COUNT(*) n FROM customer_sessions WHERE customer_id=?').bind(u.id).first()).n, 0);
  assert.equal((await call(f, 'login', { body: { email: 'reset@test.test', password: 'New-saffron-lake-77!' } })).status, 200);
});

test('verification and recovery emails link to AuraMenu-branded pages on the AuraMenu origin', async (t) => {
  const f = await hubFixture(), u = await f.user('mail@test.test');
  Object.assign(f.env, { RESEND_API_KEY: 'fixture', CUSTOMER_EMAIL_ENABLED: 'true' });
  const sent = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => { if (String(url).includes('resend')) { sent.push(JSON.parse(init.body)); return new Response('{}', { status: 200 }); } return real(url, init); };
  t.after(() => { globalThis.fetch = real; });
  assert.equal((await call(f, 'send-verification', { body: {}, cookie: `${AURAMENU_COOKIE}=${u.cookie.split('=')[1]}` })).status, 200);
  assert.equal((await call(f, 'forgot-password', { body: { email: 'mail@test.test' } })).status, 200);
  assert.equal(sent.length, 2);
  assert.match(sent[0].subject, /^AuraMenu/); assert.match(sent[0].text, /https:\/\/auramenu\.space\/signin\.html\?mode=verify#token=[a-f0-9]{64}/);
  assert.match(sent[1].text, /https:\/\/auramenu\.space\/signin\.html\?mode=reset#token=[a-f0-9]{64}/);
  // AuraDigital's own flows keep AuraDigital links.
  const hub = await f.call('/api/customer/forgot-password', null, 'POST', { email: 'mail@test.test' });
  assert.equal(hub.status, 200);
  assert.match(sent[2].text, /https:\/\/aura\.test\/hub\/reset#token=/);
});

test('Google failures from an AuraMenu sign-in return to AuraMenu, not the AuraDigital Hub', async () => {
  const f = await hubFixture();
  const next = '/api/auramenu/connect?challenge=' + 'A'.repeat(43) + '&state=' + 'b'.repeat(20);
  const r = await f.call('/api/customer/google/start?' + new URLSearchParams({ acceptTerms: 'true', next }), null);
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('Location'), 'https://auramenu.space/signin.html#google=off');
  const hub = await f.call('/api/customer/google/start?acceptTerms=true', null);
  assert.match(hub.headers.get('Location'), /^https:\/\/aura\.test\/hub\/login\?google=off$/);
});
