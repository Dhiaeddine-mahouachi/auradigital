import test from 'node:test';
import assert from 'node:assert/strict';
import { handleShop } from '../src/shop.ts';
import { ApiError, json } from '../src/http.js';
import { createSession } from '../src/security.js';
import { shopFixture } from './shop-fixture.mjs';
import { emptyPersonalization } from '../src/shop/model.ts';

const password = 'A-real-customer-password-42';
async function call(env, path, method = 'GET', body, cookie = '', origin = 'https://auradigitalworks.com') {
  const req = new Request('https://auradigitalworks.com' + path, { method, headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: cookie }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  try { return await handleShop(req, env); } catch (error) { if (error instanceof ApiError) return json({ error: error.message }, error.status); throw error; }
}
async function signup(env, email = 'buyer@example.com') {
  const response = await call(env, '/api/customer/register', 'POST', { name: 'Test Buyer', email, password, acceptTerms: true });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}
function payload() { return { items: [{ id: crypto.randomUUID(), themeId: 'oliva-bistro', quantity: 2, material: 'PVC', finish: 'Matte', unitMinor: 1, paymentStatus: 'paid', personalization: { ...emptyPersonalization, business: 'Buyer Bistro', destination: 'https://example.com/menu' } }], shipping: { name: 'Test Buyer', phone: '+90 555 555 55 55', business: 'Buyer Bistro', country: 'Türkiye', address: 'Example Street 10', city: 'Istanbul', postalCode: '34000', billingDetails: '' }, idempotencyKey: crypto.randomUUID(), acceptConditions: true, totalMinor: 1, paid: true, email: 'attacker@example.com', customerId: 'attacker' }; }

test('AuraDigital signup/login/logout uses hashed passwords and revocable secure customer sessions', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const response = await call(env, '/api/customer/register', 'POST', { name: 'Buyer Name', email: 'Buyer@Example.com', password, acceptTerms: true });
    assert.equal(response.status, 200);
    const header = response.headers.get('set-cookie'), cookie = header.split(';')[0];
    assert.match(header, /__Host-aura_customer=/); assert.match(header, /HttpOnly; Secure; SameSite=Strict/);
    const user = sqlite.prepare('SELECT * FROM customer_users').get();
    assert.equal(user.email, 'buyer@example.com'); assert.notEqual(user.password_hash, password); assert.match(user.password_hash, /^\$2/);
    assert.notEqual(sqlite.prepare('SELECT token_hash FROM customer_sessions').get().token_hash, cookie.split('=')[1]);
    const session = await (await call(env, '/api/customer/session', 'GET', undefined, cookie)).json();
    assert.equal(session.user.id, user.id); assert.equal(session.user.password_hash, undefined);
    assert.equal((await call(env, '/api/customer/login', 'POST', { email: user.email, password: 'Wrong password 123' })).status, 401);
    const login = await call(env, '/api/customer/login', 'POST', { email: 'BUYER@example.com', password });
    assert.equal(login.status, 200);
    await call(env, '/api/customer/logout', 'POST', {}, cookie);
    assert.equal((await (await call(env, '/api/customer/session', 'GET', undefined, cookie)).json()).user, null);
    assert.equal((await call(env, '/api/shop/orders', 'GET', undefined, cookie)).status, 401);
  } finally { sqlite.close(); }
});
test('customer auth enforces CSRF, password bounds, terms, unique email and rate limits', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const body = { name: 'Buyer', email: 'buyer@example.com', password, acceptTerms: true };
    assert.equal((await call(env, '/api/customer/register', 'POST', body, '', 'https://attacker.example')).status, 403);
    assert.equal((await call(env, '/api/customer/register', 'POST', { ...body, password: 'short' })).status, 400);
    assert.equal((await call(env, '/api/customer/register', 'POST', { ...body, acceptTerms: false })).status, 400);
    await signup(env);
    assert.equal((await call(env, '/api/customer/register', 'POST', body)).status, 409);
    const limited = { ...env, LOGIN_RATE_LIMITER: { async limit() { return { success: false }; } } };
    assert.equal((await call(limited, '/api/customer/login', 'POST', { email: body.email, password })).status, 429);
    assert.equal(sqlite.prepare('SELECT count(*) AS n FROM customer_users').get().n, 1);
  } finally { sqlite.close(); }
});
test('checkout requires a customer account, valid address and complete card personalization', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const body = payload();
    assert.equal((await call(env, '/api/shop/checkout', 'POST', body)).status, 401);
    const cookie = await signup(env);
    assert.equal((await call(env, '/api/shop/checkout', 'POST', { ...body, shipping: { ...body.shipping, address: '' } }, cookie)).status, 400);
    assert.equal((await call(env, '/api/shop/checkout', 'POST', { ...body, acceptConditions: false }, cookie)).status, 400);
    assert.equal((await call(env, '/api/shop/checkout', 'POST', { ...body, items: [{ ...body.items[0], personalization: emptyPersonalization }] }, cookie)).status, 400);
    assert.equal((await call(env, '/api/shop/checkout', 'POST', body, cookie, 'https://attacker.example')).status, 403);
    assert.equal(sqlite.prepare('SELECT count(*) AS n FROM shop_bank_orders').get().n, 0);
  } finally { sqlite.close(); }
});
test('bank orders use catalog totals and account ownership, retain address, and replay without duplicates', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const cookie = await signup(env), body = payload();
    const response = await call(env, '/api/shop/checkout', 'POST', body, cookie);
    assert.equal(response.status, 201);
    const { order } = await response.json();
    assert.equal(order.totalMinor, 120000); assert.equal(order.items[0].unitMinor, 60000);
    assert.equal(order.paymentStatus, 'awaiting_transfer'); assert.equal(order.productionStatus, 'awaiting_payment');
    assert.equal(order.bank.iban, 'TR940001009010394706205001'); assert.equal(order.bank.holder, 'Dhiaeddine Mahouachi');
    assert.equal(order.shipping.email, 'buyer@example.com');
    const replay = await (await call(env, '/api/shop/checkout', 'POST', body, cookie)).json();
    assert.equal(replay.order.id, order.id); assert.equal(sqlite.prepare('SELECT count(*) AS n FROM shop_bank_orders').get().n, 1);
    assert.equal((await call(env, '/api/shop/checkout', 'POST', { ...body, shipping: { ...body.shipping, city: 'Ankara' } }, cookie)).status, 409);
    const session = await (await call(env, '/api/customer/session', 'GET', undefined, cookie)).json();
    assert.equal(session.user.profile.address, body.shipping.address);
    const other = await signup(env, 'other@example.com');
    assert.equal((await call(env, '/api/shop/orders/' + order.id, 'GET', undefined, other)).status, 404);
    assert.equal((await (await call(env, '/api/shop/orders', 'GET', undefined, other)).json()).orders.length, 0);
    assert.equal((await call(env, '/api/shop/orders/' + order.id, 'GET')).status, 401);
    assert.equal((await call(env, '/api/shop/checkout', 'POST', { ...payload(), items: [{ ...body.items[0], quantity: 1.5 }] }, cookie)).status, 400);
  } finally { sqlite.close(); }
});
test('reporting a transfer never pays an order; only authorized manual confirmation does, with one audit event', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const cookie = await signup(env), { order } = await (await call(env, '/api/shop/checkout', 'POST', payload(), cookie)).json();
    const reported = await (await call(env, `/api/shop/orders/${order.id}/report-transfer`, 'POST', { paid: true }, cookie)).json();
    assert.equal(reported.order.paymentStatus, 'awaiting_transfer'); assert.ok(reported.order.transferReportedAt); assert.equal(reported.order.paidAt, null);
    assert.equal((await call(env, '/api/admin/shop/orders/' + order.id, 'PATCH', { action: 'confirm_transfer' }, cookie)).status, 401);
    for (const role of ['viewer', 'manager']) await env.DB.prepare('INSERT INTO admin_users (id, username, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?)').bind(role, role, role, 'unused', role).run();
    const viewer = `__Host-aura_admin=${await createSession(env.DB, 'viewer')}`, manager = `__Host-aura_admin=${await createSession(env.DB, 'manager')}`;
    assert.equal((await call(env, '/api/admin/shop/orders/' + order.id, 'PATCH', { action: 'confirm_transfer' }, viewer)).status, 403);
    const paid = await (await call(env, '/api/admin/shop/orders/' + order.id, 'PATCH', { action: 'confirm_transfer' }, manager)).json();
    assert.equal(paid.order.paymentStatus, 'paid'); assert.equal(paid.order.productionStatus, 'awaiting_artwork'); assert.ok(paid.order.paidAt);
    await call(env, '/api/admin/shop/orders/' + order.id, 'PATCH', { action: 'confirm_transfer' }, manager);
    assert.equal(sqlite.prepare("SELECT count(*) AS n FROM admin_audit_log WHERE action='confirm_bank_transfer'").get().n, 1);
  } finally { sqlite.close(); }
});
