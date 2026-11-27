// Short edge cache for public AuraMenu pages (QR scans).
// Cloudflare's Cache API is per data centre: a purge clears the local copy at once,
// other locations refresh within MENU_CACHE_TTL seconds.
export const MENU_CACHE_TTL = 60;
const ORIGINS = ['https://auramenu.space', 'https://www.auramenu.space', 'https://auradigitalworks.com', 'https://www.auradigitalworks.com'];

function edgeCache() {
  try { return typeof caches !== 'undefined' && caches.default ? caches.default : null; } catch { return null; }
}

function cacheKey(origin, slug) {
  return new Request(`${origin}/api/auramenu/sites/${encodeURIComponent(String(slug || '').trim().toLowerCase())}?edge-cache=1`);
}

export async function readCachedMenu(origin, slug) {
  const cache = edgeCache();
  if (!cache || !slug) return null;
  try {
    const hit = await cache.match(cacheKey(origin, slug));
    return hit ? await hit.json() : null;
  } catch { return null; }
}

export async function storeCachedMenu(origin, slug, payload) {
  const cache = edgeCache();
  if (!cache || !slug) return;
  try {
    await cache.put(cacheKey(origin, slug), new Response(JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${MENU_CACHE_TTL}` },
    }));
  } catch { /* caching is best-effort */ }
}

export async function purgeCachedMenu(slug, origin) {
  const cache = edgeCache();
  if (!cache || !slug) return;
  const origins = new Set([...ORIGINS, ...(origin ? [origin] : [])]);
  await Promise.all([...origins].map(o => cache.delete(cacheKey(o, slug)).catch(() => false)));
}
