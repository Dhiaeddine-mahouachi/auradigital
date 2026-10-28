import { requireVerified } from '../customer-identity.js';
import { ApiError, json, readJson } from '../http.js';
import { getAuthenticatedAdmin, sameOrigin } from '../security.js';
import { authenticatedCustomer, tokenHash, type CustomerEnv } from '../customer-accounts.ts';
import { quoteCart, validateItem, type Theme } from './model.ts';

export const bankDetails = { iban: 'TR940001009010394706205001', holder: 'Dhiaeddine Mahouachi', method: 'bank_transfer' };
export const bankOrderSchema = [
  "CREATE TABLE IF NOT EXISTS shop_bank_orders (id TEXT PRIMARY KEY NOT NULL, reference TEXT NOT NULL UNIQUE, customer_id TEXT NOT NULL REFERENCES customer_users(id), idempotency_key TEXT NOT NULL, request_hash TEXT NOT NULL, items_json TEXT NOT NULL, shipping_json TEXT NOT NULL, bank_json TEXT NOT NULL, total_minor INTEGER NOT NULL CHECK(total_minor > 0), currency TEXT NOT NULL DEFAULT 'TRY' CHECK(currency = 'TRY'), payment_status TEXT NOT NULL DEFAULT 'awaiting_transfer' CHECK(payment_status IN ('awaiting_transfer','paid','cancelled')), production_status TEXT NOT NULL DEFAULT 'awaiting_payment', transfer_reported_at TEXT, paid_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(customer_id, idempotency_key))",
  'CREATE INDEX IF NOT EXISTS idx_shop_orders_customer ON shop_bank_orders(customer_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_shop_orders_payment ON shop_bank_orders(payment_status, created_at)',
];
type Env = CustomerEnv & { CONTACT_RATE_LIMITER?: { limit(input: { key: string }): Promise<{ success: boolean }> } };
type Row = { id: string; reference: string; customer_id: string; request_hash: string; items_json: string; shipping_json: string; bank_json: string; total_minor: number; payment_status: string; production_status: string; transfer_reported_at: string | null; paid_at: string | null; created_at: string };
const ready = new WeakSet<object>();
async function ensureOrders(env: Env) { if (!ready.has(env.DB)) { await env.DB.batch(bankOrderSchema.map(sql => env.DB.prepare(sql))); ready.add(env.DB); } }
function publicOrder(row: Row) {
  return { id: row.id, reference: row.reference, items: JSON.parse(row.items_json), shipping: JSON.parse(row.shipping_json), bank: JSON.parse(row.bank_json), totalMinor: row.total_minor, currency: 'TRY', paymentStatus: row.payment_status, productionStatus: row.production_status, transferReportedAt: row.transfer_reported_at, paidAt: row.paid_at, createdAt: row.created_at };
}
export function validateShipping(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'Enter your contact and delivery details.');
  const raw = input as Record<string, unknown>, result: Record<string, string> = {};
  for (const [key, max, required] of [['name', 100, true], ['phone', 40, true], ['business', 100, true], ['country', 80, true], ['address', 500, true], ['city', 100, true], ['postalCode', 20, true], ['billingDetails', 600, false]] as const) {
    if (typeof raw[key] !== 'string' || raw[key].length > max || (required && !raw[key].trim())) throw new ApiError(400, `Enter a valid ${key}.`);
    result[key] = raw[key].trim();
  }
  if (!/^[+\d][\d\s().-]{5,39}$/.test(result.phone)) throw new ApiError(400, 'Enter a valid phone number.');
  return result;
}
export async function handleBankOrders(request: Request, env: Env, themes: () => Promise<Theme[]>): Promise<Response | null> {
  const path = new URL(request.url).pathname, method = request.method;
  const admin = path === '/api/admin/shop/orders' || /^\/api\/admin\/shop\/orders\/[a-f0-9-]{36}$/.test(path);
  const match = /^\/api\/shop\/orders\/([a-f0-9-]{36})(\/report-transfer)?$/.exec(path);
  if (!admin && path !== '/api/shop/checkout' && path !== '/api/shop/orders' && !match) return null;
  if (!['GET', 'HEAD'].includes(method) && !sameOrigin(request)) return json({ error: 'Forbidden origin.' }, 403);
  if (admin) {
    const user = await getAuthenticatedAdmin(request, env.DB); if (!user) return json({ error: 'Unauthorized.' }, 401);
    await ensureOrders(env);
    if (method === 'GET' && path === '/api/admin/shop/orders') {
      const { results } = await env.DB.prepare('SELECT * FROM shop_bank_orders ORDER BY created_at DESC LIMIT 100').all<Row>();
      return json({ orders: results.map(publicOrder), role: user.role });
    }
    if (method !== 'PATCH') return json({ error: 'Method not allowed.' }, 405);
    if (!['owner', 'manager'].includes(user.role)) return json({ error: 'Read-only access.' }, 403);
    const id = path.split('/').at(-1)!, row = await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE id = ?').bind(id).first<Row>();
    if (!row) return json({ error: 'Order not found.' }, 404);
    const body = await readJson(request, 2048);
    if (body.action !== 'confirm_transfer') return json({ error: 'Invalid action.' }, 400);
    if (row.payment_status === 'cancelled') return json({ error: 'A cancelled order cannot be paid.' }, 409);
    if (row.payment_status === 'awaiting_transfer') {
      await env.DB.batch([
        env.DB.prepare("UPDATE shop_bank_orders SET payment_status = 'paid', production_status = 'awaiting_artwork', paid_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND payment_status = 'awaiting_transfer'").bind(id),
        env.DB.prepare("INSERT INTO admin_audit_log (id, admin_user_id, username_snapshot, action, resource, target_id, request_id) SELECT ?, ?, ?, 'confirm_bank_transfer', 'shop_orders', ?, ? WHERE changes() > 0").bind(crypto.randomUUID(), user.id, user.username, id, (request.headers.get('CF-Ray') || '').slice(0, 80)),
      ]);
    }
    return json({ order: publicOrder((await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE id = ?').bind(id).first<Row>())!) });
  }
  const user = await authenticatedCustomer(request, env);
  if (!user) return json({ error: 'Sign in or create your AuraDigital account before checkout.', code: 'SIGN_IN_REQUIRED' }, 401);
  await ensureOrders(env);
  if (path === '/api/shop/orders' && method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50').bind(user.id).all<Row>();
    return json({ orders: results.map(publicOrder) });
  }
  if (match) {
    const row = await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE id = ? AND customer_id = ?').bind(match[1], user.id).first<Row>();
    if (!row) return json({ error: 'Order not found.' }, 404);
    if (!match[2] && method === 'GET') return json({ order: publicOrder(row) });
    if (match[2] && method === 'POST') {
      if ((env.GROWTH_OS_ENABLED === 'true' || env.CUSTOMER_IDENTITY_ENABLED === 'true')) await requireVerified(env.DB, user);
      if (row.payment_status === 'awaiting_transfer') await env.DB.prepare("UPDATE shop_bank_orders SET transfer_reported_at = COALESCE(transfer_reported_at, datetime('now')), updated_at = datetime('now') WHERE id = ? AND customer_id = ? AND payment_status = 'awaiting_transfer'").bind(row.id, user.id).run();
      return json({ order: publicOrder((await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE id = ?').bind(row.id).first<Row>())!) });
    }
    return json({ error: 'Method not allowed.' }, 405);
  }
  if ((env.GROWTH_OS_ENABLED === 'true' || env.CUSTOMER_IDENTITY_ENABLED === 'true')) await requireVerified(env.DB, user);
  if (path !== '/api/shop/checkout' || method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  if (!env.CONTACT_RATE_LIMITER) return json({ error: 'Checkout is temporarily unavailable.' }, 503);
  const limit = await env.CONTACT_RATE_LIMITER.limit({ key: 'shop-orders:' + user.id });
  if (!limit.success) return json({ error: 'Too many order attempts. Please wait a minute.' }, 429, { 'Retry-After': '60' });
  const body = await readJson(request, 200000);
  if (body.acceptConditions !== true) throw new ApiError(400, 'Accept the order and bank-transfer conditions.');
  if (typeof body.idempotencyKey !== 'string' || !/^[a-f0-9-]{36}$/.test(body.idempotencyKey)) throw new ApiError(400, 'Invalid checkout request.');
  const shipping = { ...validateShipping(body.shipping), email: user.email };
  let quote;
  try {
    const activeThemes = await themes();
    if (!Array.isArray(body.items)) throw new Error('Your cart is empty.');
    const items = body.items.map((item: unknown) => validateItem(item, activeThemes));
    quote = quoteCart(items, activeThemes);
  } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : 'Check your cart.'); }
  const hash = await tokenHash(JSON.stringify({ shipping, lines: quote.lines }));
  const previous = await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE customer_id = ? AND idempotency_key = ?').bind(user.id, body.idempotencyKey).first<Row>();
  if (previous) return previous.request_hash === hash ? json({ order: publicOrder(previous) }) : json({ error: 'Checkout details changed. Start a new order.' }, 409);
  const id = crypto.randomUUID(), reference = 'AD-' + id.replaceAll('-', '').slice(0, 12).toUpperCase();
  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO shop_bank_orders (id, reference, customer_id, idempotency_key, request_hash, items_json, shipping_json, bank_json, total_minor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, reference, user.id, body.idempotencyKey, hash, JSON.stringify(quote.lines), JSON.stringify(shipping), JSON.stringify(bankDetails), quote.subtotalMinor),
    env.DB.prepare('UPDATE customer_users SET profile_json = ? WHERE id = ? AND EXISTS (SELECT 1 FROM shop_bank_orders WHERE customer_id = ? AND idempotency_key = ? AND request_hash = ?)').bind(JSON.stringify(shipping), user.id, user.id, body.idempotencyKey, hash),
  ]);
  const created = (await env.DB.prepare('SELECT * FROM shop_bank_orders WHERE customer_id = ? AND idempotency_key = ?').bind(user.id, body.idempotencyKey).first<Row>())!;
  if (created.request_hash !== hash) return json({ error: 'Checkout details changed. Start a new order.' }, 409);
  return json({ order: publicOrder(created) }, 201);
}
