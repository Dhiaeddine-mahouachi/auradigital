import type { D1Database } from '@cloudflare/workers-types';
import { ApiError, json, readJson } from './http.js';
import { hashPassword, validatePassword, verifyPassword, sameOrigin } from './security.js';

export type CustomerEnv = { GROWTH_OS_ENABLED?: string; CUSTOMER_IDENTITY_ENABLED?: string; DB: D1Database; LOGIN_RATE_LIMITER?: { limit(input: { key: string }): Promise<{ success: boolean }> } };
export type Customer = { id: string; email: string; name: string; profile: Record<string, string> };
const cookieName = '__Host-aura_customer', sessionSeconds = 7 * 24 * 60 * 60;
const ready = new WeakSet<object>();
export const customerSchema = [
  "CREATE TABLE IF NOT EXISTS customer_users (id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, full_name TEXT NOT NULL, password_hash TEXT NOT NULL, profile_json TEXT NOT NULL DEFAULT '{}', active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  "CREATE TABLE IF NOT EXISTS customer_sessions (token_hash TEXT PRIMARY KEY NOT NULL, customer_id TEXT NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
  'CREATE INDEX IF NOT EXISTS idx_customer_sessions_expiry ON customer_sessions(expires_at)',
];
export async function ensureCustomers(db: D1Database) {
  if (ready.has(db)) return;
  await db.batch(customerSchema.map(sql => db.prepare(sql))); ready.add(db);
}
export async function tokenHash(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');
}
function token(request: Request) { return (request.headers.get('Cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(cookieName + '='))?.slice(cookieName.length + 1) || ''; }
function cookie(value: string, seconds = sessionSeconds) { return `${cookieName}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Strict`; }
export async function authenticatedCustomer(request: Request, env: CustomerEnv): Promise<Customer | null> {
  const value = token(request); if (!/^[a-f0-9]{64}$/.test(value)) return null;
  await ensureCustomers(env.DB);
  const row = await env.DB.prepare("SELECT u.id, u.email, u.full_name, u.profile_json FROM customer_sessions s JOIN customer_users u ON u.id = s.customer_id WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1").bind(await tokenHash(value)).first<{ id: string; email: string; full_name: string; profile_json: string }>();
  return row ? { id: row.id, email: row.email, name: row.full_name, profile: JSON.parse(row.profile_json) } : null;
}
export async function signInCustomer(env: CustomerEnv, customer: Customer) {
  const value = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
  await env.DB.batch([
    env.DB.prepare('INSERT INTO customer_sessions (token_hash, customer_id, expires_at) VALUES (?, ?, ?)').bind(await tokenHash(value), customer.id, new Date(Date.now() + sessionSeconds * 1000).toISOString().slice(0, 19).replace('T', ' ')),
    env.DB.prepare("DELETE FROM customer_sessions WHERE expires_at <= datetime('now')"),
  ]);
  return json({ authenticated: true, user: customer }, 200, { 'Set-Cookie': cookie(value) });
}
export async function handleCustomerApi(request: Request, env: CustomerEnv): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (!path.startsWith('/api/customer/')) return null;
  if (path === '/api/customer/session' && request.method === 'GET') return json({ user: await authenticatedCustomer(request, env) });
  if (!['/api/customer/register', '/api/customer/login', '/api/customer/logout'].includes(path) || request.method !== 'POST') return json({ error: 'Not found.' }, 404);
  if (!sameOrigin(request)) return json({ error: 'Forbidden origin.' }, 403);
  await ensureCustomers(env.DB);
  if (path === '/api/customer/logout') {
    const value = token(request);
    if (value) await env.DB.prepare('DELETE FROM customer_sessions WHERE token_hash = ?').bind(await tokenHash(value)).run();
    return json({ authenticated: false }, 200, { 'Set-Cookie': cookie('', 0) });
  }
  if (!env.LOGIN_RATE_LIMITER) return json({ error: 'Sign-in is temporarily unavailable.' }, 503);
  const limit = await env.LOGIN_RATE_LIMITER.limit({ key: 'customer-auth:' + (request.headers.get('CF-Connecting-IP') || 'unknown') });
  if (!limit.success) return json({ error: 'Too many attempts. Try again in a minute.' }, 429, { 'Retry-After': '60' });
  const body = await readJson(request, 4096), email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '', password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new ApiError(400, 'Enter a valid email address.');
  if (path === '/api/customer/register') {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 100 || body.acceptTerms !== true) throw new ApiError(400, 'Enter your full name and accept the account conditions.');
    try { validatePassword(password); } catch (error) { throw new ApiError(400, error instanceof Error ? error.message : 'Invalid password.'); }
    const id = crypto.randomUUID(), hash = await hashPassword(password);
    const result = await env.DB.prepare('INSERT OR IGNORE INTO customer_users (id, email, full_name, password_hash) VALUES (?, ?, ?, ?)').bind(id, email, name, hash).run();
    if (!result.meta.changes) return json({ error: 'An account with these details could not be created. Try signing in.' }, 409);
    return signInCustomer(env, { id, email, name, profile: {} });
  }
  const row = await env.DB.prepare('SELECT id, email, full_name, password_hash, profile_json, active FROM customer_users WHERE email = ? COLLATE NOCASE').bind(email).first<{ id: string; email: string; full_name: string; password_hash: string; profile_json: string; active: number }>();
  const valid = await verifyPassword(password, row?.password_hash || '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5D2sOiTt4br.7QFl1YSiGUpJwY9.Nge');
  if (!row || !row.active || !valid) return json({ error: 'Email or password is incorrect.' }, 401);
  return signInCustomer(env, { id: row.id, email: row.email, name: row.full_name, profile: JSON.parse(row.profile_json) });
}
