import test from 'node:test';
import assert from 'node:assert/strict';
import { readCachedMenu, storeCachedMenu, purgeCachedMenu, MENU_CACHE_TTL } from '../src/menu-cache.js';

function fakeCache() {
  const store = new Map();
  return { store, default: {
    async match(req) { const v = store.get(req.url); return v ? new Response(v.body, { headers: v.headers }) : undefined; },
    async put(req, res) { store.set(req.url, { body: await res.text(), headers: Object.fromEntries(res.headers) }); },
    async delete(req) { return store.delete(req.url); },
  } };
}

test('without the Cache API everything is a no-op', async () => {
  delete globalThis.caches;
  assert.equal(await readCachedMenu('https://auramenu.space', 'kebap'), null);
  await storeCachedMenu('https://auramenu.space', 'kebap', { menu: {} });
  await purgeCachedMenu('kebap');
});

test('stores, reads and purges a public menu by slug', async () => {
  const c = fakeCache(); globalThis.caches = c;
  const payload = { menu: { slug: 'kebap', businessName: 'Kebap Evi' } };
  await storeCachedMenu('https://auramenu.space', 'Kebap', payload);
  const [entry] = [...c.store.values()];
  assert.match(entry.headers['cache-control'], new RegExp(`max-age=${MENU_CACHE_TTL}`));
  assert.deepEqual(await readCachedMenu('https://auramenu.space', 'kebap'), payload);
  assert.equal(await readCachedMenu('https://auramenu.space', 'other'), null);
  await purgeCachedMenu('kebap');
  assert.equal(await readCachedMenu('https://auramenu.space', 'kebap'), null);
  delete globalThis.caches;
});

test('purge also clears an unlisted request origin', async () => {
  const c = fakeCache(); globalThis.caches = c;
  await storeCachedMenu('https://preview.example', 'kebap', { menu: {} });
  await purgeCachedMenu('kebap', 'https://preview.example');
  assert.equal(c.store.size, 0);
  delete globalThis.caches;
});
