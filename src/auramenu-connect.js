// AuraMenu sign-in with the AuraDigital customer account.
// The account lives on auradigitalworks.com; auramenu.space gets its OWN host-only session cookie.
// No cookie is shared between the two domains: a one-time code (2 minutes, PKCE S256) is handed over
// in the URL fragment and exchanged by auramenu.space for a session row in customer_sessions.
import { ApiError, json, readJson } from './http.js';
import { authenticatedCustomer, ensureCustomers, tokenHash } from './customer-accounts.ts';
import { identityOrigin, isEmailVerified, randomToken } from './customer-identity.js';

export const AURAMENU_COOKIE = '__Host-auramenu_customer';
const SESSION_SECONDS = 7 * 24 * 60 * 60, CODE_SECONDS = 120;
const MENU_ORIGINS = ['https://auramenu.space', 'https://www.auramenu.space'];
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/, STATE = /^[A-Za-z0-9_-]{16,64}$/, VERIFIER = /^[A-Za-z0-9_-]{43,128}$/, CODE = /^[a-f0-9]{64}$/;
const ready = new WeakSet();

async function ensureConnect(db) {
  if (ready.has(db)) return;
  await ensureCustomers(db);
  await db.prepare('CREATE TABLE IF NOT EXISTS auramenu_connect_codes (code_hash TEXT PRIMARY KEY NOT NULL, customer_id TEXT NOT NULL, challenge TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT)').run();
  ready.add(db);
}
const sqlTime = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
function menuOrigin(env) {
  const configured = String(env.AURAMENU_ORIGIN || 'https://auramenu.space');
  return MENU_ORIGINS.includes(configured) ? configured : 'https://auramenu.space';
}
function cookieValue(request) {
  return (request.headers.get('Cookie') || '').split(';').map(s => s.trim()).find(s => s.startsWith(AURAMENU_COOKIE + '='))?.slice(AURAMENU_COOKIE.length + 1) || '';
}
function sessionCookie(value, seconds = SESSION_SECONDS) {
  return `${AURAMENU_COOKIE}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Lax`;
}
async function s256(verifier) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  return btoa(String.fromCharCode(...digest)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromMenuSite(request) {
  const origin = request.headers.get('Origin');
  return MENU_ORIGINS.includes(origin) || origin === new URL(request.url).origin;
}

async function ensureOwners(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS auramenu_menu_owners (menu_id TEXT PRIMARY KEY NOT NULL, customer_id TEXT NOT NULL, linked_at TEXT NOT NULL DEFAULT (datetime(\'now\')))').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS auramenu_menu_owners_customer ON auramenu_menu_owners(customer_id)').run();
}

// Owner of a menu (AuraDigital customer id) or null.
export async function menuOwner(db, menuId) {
  await ensureOwners(db);
  return (await db.prepare('SELECT customer_id FROM auramenu_menu_owners WHERE menu_id = ?').bind(menuId).first())?.customer_id || null;
}

// Links an unowned menu to the signed-in customer. Never moves a menu that already has another owner.
export async function linkMenuOwner(db, menuId, customerId) {
  await ensureOwners(db);
  await db.prepare('INSERT INTO auramenu_menu_owners (menu_id, customer_id) VALUES (?, ?) ON CONFLICT(menu_id) DO NOTHING').bind(menuId, customerId).run();
  return (await menuOwner(db, menuId)) === customerId;
}

export async function auraMenuCustomer(request, env) {
  const value = cookieValue(request);
  if (!/^[a-f0-9]{64}$/.test(value)) return null;
  await ensureCustomers(env.DB);
  const row = await env.DB.prepare("SELECT u.id, u.email, u.full_name FROM customer_sessions s JOIN customer_users u ON u.id = s.customer_id WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1").bind(await tokenHash(value)).first();
  return row ? { id: row.id, email: row.email, name: row.full_name } : null;
}

export async function handleAuraMenuConnect(request, env) {
  const url = new URL(request.url), path = url.pathname;
  if (!path.startsWith('/api/auramenu/connect') && !path.startsWith('/api/auramenu/account/')) return null;
  await ensureConnect(env.DB);

  // 1. On auradigitalworks.com: signed-in AuraDigital customer → one-time code → back to auramenu.space.
  if (path === '/api/auramenu/connect' && request.method === 'GET') {
    const challenge = url.searchParams.get('challenge') || '', state = url.searchParams.get('state') || '';
    if (!CHALLENGE.test(challenge) || !STATE.test(state)) return json({ error: 'Invalid sign-in request.' }, 400);
    const accounts = identityOrigin(env);
    if (url.origin !== accounts) return new Response(null, { status: 303, headers: { Location: accounts + path + url.search, 'Cache-Control': 'no-store' } });
    const customer = await authenticatedCustomer(request, env);
    if (!customer) {
      const next = `/api/auramenu/connect?${new URLSearchParams({ challenge, state })}`;
      return new Response(null, { status: 303, headers: { Location: `${accounts}/hub/login?${new URLSearchParams({ next })}`, 'Cache-Control': 'no-store' } });
    }
    const back = new URL('/signin.html', menuOrigin(env));
    if (!(await isEmailVerified(env.DB, customer))) {
      back.hash = new URLSearchParams({ error: 'verify', state }).toString();
      return new Response(null, { status: 303, headers: { Location: back.toString(), 'Cache-Control': 'no-store' } });
    }
    const code = randomToken();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM auramenu_connect_codes WHERE expires_at <= ?').bind(sqlTime(Date.now())),
      env.DB.prepare('INSERT INTO auramenu_connect_codes (code_hash, customer_id, challenge, expires_at) VALUES (?, ?, ?, ?)').bind(await tokenHash(code), customer.id, challenge, sqlTime(Date.now() + CODE_SECONDS * 1000)),
    ]);
    back.hash = new URLSearchParams({ code, state }).toString();
    return new Response(null, { status: 303, headers: { Location: back.toString(), 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
  }

  // 2. On auramenu.space: exchange the code (with the PKCE verifier) for an auramenu.space session.
  if (path === '/api/auramenu/connect/exchange' && request.method === 'POST') {
    if (!fromMenuSite(request)) return json({ error: 'Forbidden origin.' }, 403);
    if (env.LOGIN_RATE_LIMITER) {
      const limit = await env.LOGIN_RATE_LIMITER.limit({ key: 'auramenu-connect:' + (request.headers.get('CF-Connecting-IP') || 'unknown') });
      if (!limit.success) return json({ error: 'Too many attempts. Try again in a minute.' }, 429, { 'Retry-After': '60' });
    }
    const body = await readJson(request, 1024);
    const code = String(body.code || ''), verifier = String(body.verifier || '');
    if (!CODE.test(code) || !VERIFIER.test(verifier)) throw new ApiError(400, 'Invalid sign-in code.');
    const hash = await tokenHash(code), now = sqlTime(Date.now());
    const row = await env.DB.prepare('SELECT customer_id, challenge FROM auramenu_connect_codes WHERE code_hash = ? AND used_at IS NULL AND expires_at > ?').bind(hash, now).first();
    if (!row || row.challenge !== await s256(verifier)) return json({ error: 'This sign-in link expired. Please try again.' }, 400);
    const used = await env.DB.prepare('UPDATE auramenu_connect_codes SET used_at = ? WHERE code_hash = ? AND used_at IS NULL').bind(now, hash).run();
    if (!used.meta?.changes) return json({ error: 'This sign-in link expired. Please try again.' }, 400);
    const user = await env.DB.prepare('SELECT id, email, full_name FROM customer_users WHERE id = ? AND active = 1').bind(row.customer_id).first();
    if (!user) return json({ error: 'Account is not active.' }, 403);
    const session = randomToken();
    await env.DB.prepare('INSERT INTO customer_sessions (token_hash, customer_id, expires_at) VALUES (?, ?, ?)').bind(await tokenHash(session), user.id, sqlTime(Date.now() + SESSION_SECONDS * 1000)).run();
    return json({ user: { email: user.email, name: user.full_name, emailVerified: true, account: 'auradigital' } }, 200, { 'Set-Cookie': sessionCookie(session), 'Cache-Control': 'no-store' });
  }

  if (path === '/api/auramenu/account/session' && request.method === 'GET') {
    const user = await auraMenuCustomer(request, env);
    return json({ user: user ? { email: user.email, name: user.name, emailVerified: true, account: 'auradigital' } : null }, 200, { 'Cache-Control': 'no-store' });
  }

  if (path === '/api/auramenu/account/menus' && request.method === 'GET') {
    const user = await auraMenuCustomer(request, env);
    if (!user) return json({ error: 'Sign in required.' }, 401, { 'Cache-Control': 'no-store' });
    await ensureOwners(env.DB);
    const rows = await env.DB.prepare('SELECT r.id, r.slug, r.business_name, r.status, r.payment_status, r.template_id, r.updated_at FROM auramenu_menu_owners o JOIN auramenu_requests r ON r.id = o.menu_id WHERE o.customer_id = ? ORDER BY r.updated_at DESC LIMIT 50').bind(user.id).all();
    const menus = (rows.results || []).map(r => ({ id: r.id, slug: r.slug, businessName: r.business_name, status: r.status, paymentStatus: r.payment_status, templateId: r.template_id, updatedAt: r.updated_at }));
    return json({ menus }, 200, { 'Cache-Control': 'no-store' });
  }

  if (path === '/api/auramenu/account/logout' && request.method === 'POST') {
    if (!fromMenuSite(request)) return json({ error: 'Forbidden origin.' }, 403);
    const value = cookieValue(request);
    if (/^[a-f0-9]{64}$/.test(value)) await env.DB.prepare('DELETE FROM customer_sessions WHERE token_hash = ?').bind(await tokenHash(value)).run();
    return json({ user: null }, 200, { 'Set-Cookie': sessionCookie('', 0), 'Cache-Control': 'no-store' });
  }
  return json({ error: 'Not found.' }, 404);
}
