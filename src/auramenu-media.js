// AuraMenu media and public-menu caching helpers.

const IMAGE_PATH = /^\/api\/auramenu\/images\/[a-f0-9-]+$/i;
const IMAGE_HOSTS = new Set([
  'auradigital.ink',
  'www.auradigital.ink',
  'app.auradigital.ink',
  'auradigitalworks.com',
  'www.auradigitalworks.com',
]);

// Menus may only show photos uploaded to AuraMenu itself. External image URLs are dropped:
// they leak diners' IP addresses to third parties and can be swapped after a menu is approved.
export function ownMenuImageUrl(value, requestOrigin = '') {
  const text = typeof value === 'string' ? value.trim().slice(0, 800) : '';
  if (!text) return '';
  let parsed;
  try {
    parsed = new URL(text);
  } catch {
    return '';
  }
  if (parsed.protocol !== 'https:' && parsed.origin !== requestOrigin) return '';
  if (!IMAGE_PATH.test(parsed.pathname) || parsed.search || parsed.hash) return '';
  const sameOrigin = requestOrigin && parsed.origin === requestOrigin;
  if (!sameOrigin && !IMAGE_HOSTS.has(parsed.hostname)) return '';
  return parsed.toString();
}

export const PUBLIC_MENU_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';
export const PUBLIC_IMAGE_CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400';

function cacheKey(request) {
  const url = new URL(request.url);
  return new Request(`${url.origin}${url.pathname}`, { method: 'GET' });
}

function edgeCache() {
  return typeof caches !== 'undefined' && caches.default ? caches.default : null;
}

// Returns a cached public response (without CORS headers) or null.
export async function readPublicCache(request) {
  const cache = edgeCache();
  if (!cache) return null;
  try {
    return (await cache.match(cacheKey(request))) || null;
  } catch {
    return null;
  }
}

// Stores a copy of a public response. CORS headers are added per request, never cached.
export function writePublicCache(request, response, ctx) {
  const cache = edgeCache();
  if (!cache || !ctx?.waitUntil || response.status !== 200) return;
  ctx.waitUntil(cache.put(cacheKey(request), response.clone()).catch(() => {}));
}

export function withHeaders(response, headers) {
  const out = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers || {})) out.headers.set(key, value);
  return out;
}

// Last-good copies: if the database is unreachable, a published menu is served from its
// most recent successful response (kept 7 days per Cloudflare data center) instead of failing.
const LAST_GOOD_SECONDS = 7 * 24 * 60 * 60;

function lastGoodKey(request) {
  const url = new URL(request.url);
  return new Request(`${url.origin}/__auramenu-last-good${url.pathname}`, { method: 'GET' });
}

export function writeLastGood(request, response, ctx) {
  const cache = edgeCache();
  if (!cache || !ctx?.waitUntil || response.status !== 200) return;
  const copy = new Response(response.clone().body, response);
  copy.headers.set('Cache-Control', `public, max-age=${LAST_GOOD_SECONDS}`);
  ctx.waitUntil(cache.put(lastGoodKey(request), copy).catch(() => {}));
}

export async function readLastGood(request) {
  const cache = edgeCache();
  if (!cache) return null;
  try {
    const hit = await cache.match(lastGoodKey(request));
    if (!hit) return null;
    const out = new Response(hit.body, hit);
    out.headers.set('Cache-Control', 'no-store');
    out.headers.set('X-AuraMenu-Fallback', 'last-good');
    return out;
  } catch {
    return null;
  }
}
