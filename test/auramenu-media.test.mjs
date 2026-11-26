import test from 'node:test';
import assert from 'node:assert/strict';
import { ownMenuImageUrl, readPublicCache, writePublicCache, withHeaders, PUBLIC_MENU_CACHE_CONTROL } from '../src/auramenu-media.js';

const ID = 'c22977f1-0d0b-4ad7-bac8-0039a4a0b747';

test('keeps AuraMenu-hosted photo URLs', () => {
  const own = `https://auradigital.ink/api/auramenu/images/${ID}`;
  assert.equal(ownMenuImageUrl(own), own);
  assert.equal(ownMenuImageUrl(`https://www.auradigitalworks.com/api/auramenu/images/${ID}`), `https://www.auradigitalworks.com/api/auramenu/images/${ID}`);
});

test('keeps photos from the same origin as the request (staging, local dev)', () => {
  const staging = `https://auradigital-staging.example.workers.dev/api/auramenu/images/${ID}`;
  assert.equal(ownMenuImageUrl(staging, 'https://auradigital-staging.example.workers.dev'), staging);
  const local = `http://localhost:8787/api/auramenu/images/${ID}`;
  assert.equal(ownMenuImageUrl(local, 'http://localhost:8787'), local);
});

test('drops external and malformed image URLs', () => {
  for (const bad of [
    'https://example.com/photo.jpg',
    `https://evil.example/api/auramenu/images/${ID}`,
    `http://auradigital.ink/api/auramenu/images/${ID}`,
    `https://auradigital.ink/api/auramenu/images/${ID}?x=1`,
    'https://auradigital.ink/admin/',
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    ') ; background:url(https://evil.example',
    '',
    null,
    42,
  ]) {
    assert.equal(ownMenuImageUrl(bad), '', String(bad));
  }
});

test('public cache helpers store without CORS and add CORS per request', async () => {
  const store = new Map();
  globalThis.caches = {
    default: {
      match: async (req) => store.get(req.url)?.clone(),
      put: async (req, res) => { store.set(req.url, res); },
    },
  };
  const pending = [];
  const ctx = { waitUntil: (p) => pending.push(p) };
  const request = new Request('https://auradigital.ink/api/auramenu/sites/moka?utm=x');
  assert.equal(await readPublicCache(request), null);
  const response = new Response('{"menu":{}}', { headers: { 'Cache-Control': PUBLIC_MENU_CACHE_CONTROL } });
  writePublicCache(request, response, ctx);
  await Promise.all(pending);
  const hit = await readPublicCache(new Request('https://auradigital.ink/api/auramenu/sites/moka'));
  assert.ok(hit, 'second scan is served from cache, query string ignored');
  const out = withHeaders(hit, { 'Access-Control-Allow-Origin': 'https://auramenu.space' });
  assert.equal(out.headers.get('Access-Control-Allow-Origin'), 'https://auramenu.space');
  assert.equal(store.get('https://auradigital.ink/api/auramenu/sites/moka').headers.get('Access-Control-Allow-Origin'), null);
  delete globalThis.caches;
});

test('does not cache error responses', async () => {
  const store = new Map();
  globalThis.caches = { default: { match: async () => undefined, put: async (r, s) => store.set(r.url, s) } };
  const pending = [];
  writePublicCache(new Request('https://auradigital.ink/api/auramenu/sites/x'), new Response('no', { status: 404 }), { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  assert.equal(store.size, 0);
  delete globalThis.caches;
});

test('last-good copy is kept 7 days and served marked as a fallback', async () => {
  const { writeLastGood, readLastGood } = await import('../src/auramenu-media.js');
  const store = new Map();
  globalThis.caches = { default: { match: async (r) => store.get(r.url)?.clone(), put: async (r, s) => { store.set(r.url, s); } } };
  const pending = [];
  const request = new Request('https://auradigital.ink/api/auramenu/sites/moka');
  assert.equal(await readLastGood(request), null);
  writeLastGood(request, new Response('{"menu":{"slug":"moka"}}', { headers: { 'Cache-Control': 'public, max-age=60' } }), { waitUntil: (p) => pending.push(p) });
  await Promise.all(pending);
  const stored = store.get('https://auradigital.ink/__auramenu-last-good/api/auramenu/sites/moka');
  assert.equal(stored.headers.get('Cache-Control'), 'public, max-age=604800');
  const fallback = await readLastGood(request);
  assert.equal(fallback.headers.get('X-AuraMenu-Fallback'), 'last-good');
  assert.equal(fallback.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(await fallback.json(), { menu: { slug: 'moka' } });
  delete globalThis.caches;
});

function workerEnv(db) {
  const limiter = { async limit() { return { success: true }; } };
  return { DB: db, TRACK_RATE_LIMITER: limiter, LOGIN_RATE_LIMITER: limiter, CONTACT_RATE_LIMITER: limiter, ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } };
}

test('/api/health reports ok when the database answers', async () => {
  const worker = (await import('../src/worker-entry.js')).default;
  const db = { prepare: () => ({ bind() { return this; }, first: async () => ({ ok: 1 }), run: async () => ({}), all: async () => ({ results: [] }) }), batch: async () => [] };
  const response = await worker.fetch(new Request('https://aura.test/api/health'), workerEnv(db), { waitUntil() {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.database, 'ok');
});

test('/api/health returns 503 without details when the database fails', async () => {
  const worker = (await import('../src/worker-entry.js')).default;
  const boom = async () => { throw new Error('D1_ERROR: secret internals'); };
  const failing = { prepare: () => ({ bind() { return this; }, first: boom, run: boom, all: boom }), batch: boom };
  const response = await worker.fetch(new Request('https://aura.test/api/health'), workerEnv(failing), { waitUntil() {} });
  assert.equal(response.status, 503);
  const text = await response.text();
  assert.doesNotMatch(text, /secret internals/);
  assert.equal(JSON.parse(text).ok, false);
});

test('a published menu still loads from its last good copy when the database is down', async () => {
  const worker = (await import('../src/worker-entry.js')).default;
  const store = new Map();
  globalThis.caches = { default: { match: async (r) => store.get(r.url)?.clone(), put: async (r, s) => { store.set(r.url, s); } } };
  const lastGood = new Response(JSON.stringify({ menu: { slug: 'moka', businessName: 'mokaf' } }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=604800' } });
  store.set('https://aura.test/__auramenu-last-good/api/auramenu/sites/moka', lastGood);
  const boom = async () => { throw new Error('D1 down'); };
  const failing = { prepare: () => ({ bind() { return this; }, first: boom, run: boom, all: boom }), batch: boom };
  const quiet = console.error; console.error = () => {};
  try {
    const response = await worker.fetch(new Request('https://aura.test/api/auramenu/sites/moka'), workerEnv(failing), { waitUntil() {} });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-AuraMenu-Fallback'), 'last-good');
    assert.equal((await response.json()).menu.businessName, 'mokaf');
    const other = await worker.fetch(new Request('https://aura.test/api/auramenu/sites/unknown'), workerEnv(failing), { waitUntil() {} });
    assert.equal(other.status, 503);
  } finally {
    console.error = quiet;
    delete globalThis.caches;
  }
});
