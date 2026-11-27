// AuraMenu's own sign-in, registration, verification and recovery screens use the central
// AuraDigital identity (same customer_users / customer_sessions / action tokens, same validation,
// rate limits and Turnstile). This adapter only:
//   - accepts calls from the AuraMenu origin,
//   - runs the existing /api/customer/* handler,
//   - maps the session cookie to AuraMenu's host-only cookie, so no cookie is ever shared across domains.
import { ApiError, json } from './http.js';
import { handleCustomerApi } from './customer-accounts.ts';
import { handleCustomerIdentity } from './customer-identity.js';
import { AURAMENU_COOKIE, fromMenuSite } from './auramenu-connect.js';

const ACCOUNT_COOKIE = '__Host-aura_customer';
const ROUTES = Object.freeze({
  login: ['POST', '/api/customer/login', 'api'],
  register: ['POST', '/api/customer/register', 'api'],
  'send-verification': ['POST', '/api/customer/send-verification', 'identity'],
  verify: ['POST', '/api/customer/verify', 'identity'],
  'forgot-password': ['POST', '/api/customer/forgot-password', 'identity'],
  'reset-password': ['POST', '/api/customer/reset-password', 'identity'],
  capabilities: ['GET', '/api/customer/capabilities', 'identity'],
  'verification-status': ['GET', '/api/customer/verification-status', 'identity'],
});

function menuSessionValue(request) {
  return (request.headers.get('Cookie') || '').split(';').map(s => s.trim())
    .find(s => s.startsWith(AURAMENU_COOKIE + '='))?.slice(AURAMENU_COOKIE.length + 1) || '';
}

// Rewrites AuraDigital's session cookie into AuraMenu's host-only cookie (same session row).
function toMenuCookie(setCookie) {
  const match = new RegExp(`^${ACCOUNT_COOKIE}=([a-f0-9]{64}|);.*?Max-Age=(\\d+)`, 'i').exec(setCookie || '');
  if (!match) return null;
  return `${AURAMENU_COOKIE}=${match[1]}; Path=/; Max-Age=${match[1] ? match[2] : 0}; HttpOnly; Secure; SameSite=Lax`;
}

export async function handleAuraMenuAuth(request, env) {
  const url = new URL(request.url);
  const m = /^\/api\/auramenu\/auth\/([a-z-]+)$/.exec(url.pathname);
  if (!m) return null;
  const route = ROUTES[m[1]];
  if (!route) return json({ error: 'Not found.' }, 404);
  const [method, target, handler] = route;
  if (request.method !== method) return json({ error: 'Method not allowed.' }, 405);
  if (method === 'POST' && !fromMenuSite(request, env)) return json({ error: 'Forbidden origin.' }, 403);

  const inner = new URL(target, url.origin);
  const headers = new Headers();
  for (const name of ['Content-Type', 'CF-Connecting-IP', 'Accept-Language']) if (request.headers.get(name)) headers.set(name, request.headers.get(name));
  headers.set('Origin', inner.origin); // origin already validated above
  headers.set('X-Aura-App', 'auramenu');
  const session = menuSessionValue(request);
  if (/^[a-f0-9]{64}$/.test(session)) headers.set('Cookie', `${ACCOUNT_COOKIE}=${session}`);
  const forwarded = new Request(inner, { method, headers, body: method === 'POST' ? await request.arrayBuffer() : undefined });

  let response;
  try {
    response = handler === 'api' ? await handleCustomerApi(forwarded, env) : await handleCustomerIdentity(forwarded, env);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return json({ error: error.message }, error.status, { 'Cache-Control': 'no-store', ...(error.headers || {}) });
  }
  if (!response) return json({ error: 'Not found.' }, 404);
  const out = new Headers(response.headers);
  out.delete('Set-Cookie');
  const mapped = toMenuCookie(response.headers.get('Set-Cookie'));
  if (mapped) out.append('Set-Cookie', mapped);
  out.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, headers: out });
}
