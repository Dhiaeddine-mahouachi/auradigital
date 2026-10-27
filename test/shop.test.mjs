import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { shopFixture } from './shop-fixture.mjs';
import { handleShop, validateTheme } from '../src/shop.ts';
import { filterThemes, emptyFilters, emptyPersonalization, quoteCart, restoreCart, validateItem } from '../src/shop/model.ts';
import { createSession } from '../src/security.js';

const seeds = JSON.parse(await readFile(new URL('../shop/catalog.seed.json', import.meta.url), 'utf8'));
const item = overrides => ({ id: 'test-cart-item', themeId: seeds[0].id, material: 'PVC', finish: 'Matte', quantity: 2, personalization: { ...emptyPersonalization, business: 'Example Café', destination: 'https://example.com/menu' }, ...overrides });
const request = (path, method = 'GET', data, cookie, origin = 'https://auradigitalworks.com') => new Request(`https://auradigitalworks.com${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });

test('uploaded artwork pairs are valid, demo-only and preserve front/back viewports', async () => {
  assert.equal(seeds.length, 58);
  for (const theme of seeds) {
    assert.deepEqual(validateTheme(theme), theme);
    assert.equal(theme.status, 'demo'); assert.equal(theme.priceMinor, 60000); assert.equal(theme.madeToOrder, true);
    const front = await readFile(new URL('..' + theme.front, import.meta.url));
    if (theme.front.endsWith('.png')) assert.equal(front.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    else if (theme.front.endsWith('.jpg')) assert.equal(front.subarray(0, 2).toString('hex'), 'ffd8');
    else assert.ok(front.toString().includes('<svg'));
    assert.equal(theme.front, theme.back);
    assert.ok(theme.artwork.front.x < theme.artwork.back.x || theme.artwork.front.y < theme.artwork.back.y);
    if (theme.front.endsWith('.png')) {
      assert.equal(front.readUInt32BE(16), theme.artwork.width);
      assert.equal(front.readUInt32BE(20), theme.artwork.height);
    }
  }
});
test('search and every filter combine; null-priced demos never satisfy price limits', () => {
  assert.equal(filterThemes(seeds, { ...emptyFilters, category: 'Restaurants' }).some(t => t.id === 'oliva-bistro'), true);
  assert.equal(filterThemes(seeds, { ...emptyFilters, search: 'BEAUTY', orientation: 'Vertical', style: 'Minimal', color: 'Pink', purpose: 'Booking' }).length, 1);
  assert.equal(filterThemes(seeds, { ...emptyFilters, category: 'Barbershops' }).length, 2);
  assert.equal(filterThemes(seeds, { ...emptyFilters, maxPrice: '599' }).length, 0);
  assert.equal(filterThemes(seeds, { ...emptyFilters, maxPrice: '600' }).length, 58);
  assert.equal(filterThemes([{ ...seeds[0], priceMinor: null }], { ...emptyFilters, maxPrice: '100000' }).length, 0);
  const priced = [{ ...seeds[0], priceMinor: 70000 }, { ...seeds[1], priceMinor: 50000 }];
  assert.equal(filterThemes(priced, { ...emptyFilters, maxPrice: '600' }).length, 1);
  assert.equal(filterThemes(priced, { ...emptyFilters, sort: 'price-low' })[0].priceMinor, 50000);
  assert.equal(filterThemes([{ ...seeds[0], popularity: 2 }, { ...seeds[1], popularity: 5 }], { ...emptyFilters, sort: 'popular' })[0].popularity, 5);
});
test('cart validates quantities, links, field bounds and variant options', () => {
  assert.equal(validateItem(item(), seeds).quantity, 2);
  for (const quantity of [0, -1, 1.5, 101, '2', null, NaN]) assert.throws(() => validateItem(item({ quantity }), seeds));
  assert.throws(() => validateItem(item({ material: 'Gold' }), seeds));
  for (const destination of ['javascript:alert(1)', 'http://example.com', 'https://user:password@example.com', 'invalid']) assert.throws(() => validateItem(item({ personalization: { ...item().personalization, destination } }), seeds));
  assert.throws(() => validateItem(item({ personalization: { ...item().personalization, business: 'x'.repeat(101) } }), seeds));
});
test('cart restoration tolerates corrupt/old storage, deduplicates IDs and drops invalid items', () => {
  assert.deepEqual(restoreCart('not json', seeds), []);
  assert.deepEqual(restoreCart(JSON.stringify({ version: 2, items: [item()] }), seeds), []);
  assert.equal(restoreCart(JSON.stringify({ version: 1, items: [item(), item(), item({ quantity: -5 })] }), seeds).length, 1);
  assert.deepEqual(restoreCart(JSON.stringify({ version: 1, items: [item({ themeId: 'removed' })] }), seeds), []);
});
test('quotes recompute price from catalog and fail closed for demos/unavailable items', () => {
  assert.throws(() => quoteCart([item()], seeds.map(t => ({ ...t, madeToOrder: false }))), /unavailable/);
  assert.equal(quoteCart([item()], seeds).subtotalMinor, 120000);
  const themes = [{ ...seeds[0], priceMinor: 70000, approved: true, available: true, status: 'published' }];
  const result = quoteCart([item({ unitMinor: 1, subtotalMinor: 2, totalMinor: 2 })], themes);
  assert.equal(result.subtotalMinor, 140000); assert.equal(result.totalMinor, null); assert.equal(result.payable, false);
  assert.throws(() => quoteCart([item()], [{ ...themes[0], available: false }]));
});
test('public API has server-priced quotes and requires sign-in before checkout', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const response = await handleShop(request('/api/shop/catalog'), env), data = await response.json();
    assert.equal(response.status, 200); assert.equal(data.themes.length, 58); assert.equal(data.checkout.enabled, true);
    assert.equal((await handleShop(request('/api/shop/catalog', 'POST', {}), env)).status, 405);
    assert.equal((await handleShop(request('/api/shop/quote', 'POST', { items: [item()] }), env)).status, 200);
    assert.equal((await handleShop(request('/api/shop/checkout', 'POST', { paid: true }), env)).status, 401);
    assert.equal((await handleShop(request('/api/shop/checkout', 'POST', {}, null, 'https://attacker.example'), env)).status, 403);
  } finally { sqlite.close(); }
});
async function adminCookie(env, role) {
  await env.DB.prepare('INSERT INTO admin_users (id, username, display_name, password_hash, role) VALUES (?, ?, ?, ?, ?)').bind(role, role, role, 'unused', role).run();
  return `__Host-aura_admin=${await createSession(env.DB, role)}`;
}
test('first catalog request initializes missing shop schema and preserves subsequent catalog edits', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    sqlite.exec('DROP TABLE shop_card_themes');
    const response = await handleShop(request('/api/shop/catalog'), env);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.themes.length, 58);
    assert.equal(data.checkout.enabled, true);
    for (const theme of data.themes) { assert.equal(theme.status, 'demo'); assert.equal(theme.available, true); assert.equal(theme.approved, false); assert.equal(theme.priceMinor, 60000); }
    assert.equal((await handleShop(request('/shop/cards/oliva-bistro'), env)).status, 200);
    const edited = { ...seeds[0], name: 'Preserved edit', status: 'archived' };
    sqlite.prepare('UPDATE shop_card_themes SET data_json = ? WHERE id = ?').run(JSON.stringify(edited), edited.id);
    assert.equal((await (await handleShop(request('/api/shop/catalog'), env)).json()).themes.length, 57);
    assert.equal(JSON.parse(sqlite.prepare('SELECT data_json FROM shop_card_themes WHERE id = ?').get(edited.id).data_json).name, 'Preserved edit');
    // The deployed catalog synchronization restores shipped themes when empty.
    sqlite.exec('DELETE FROM shop_card_themes');
    assert.equal((await (await handleShop(request('/api/shop/catalog'), env)).json()).themes.length, 58);
  } finally { sqlite.close(); }
});
test('a direct admin create initializes missing catalog schema using the existing session', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const cookie = await adminCookie(env, 'manager');
    sqlite.exec('DROP TABLE shop_card_themes');
    const theme = { ...seeds[0], id: 'another-restaurant', slug: 'another-restaurant' };
    assert.equal((await handleShop(request('/api/admin/shop/themes', 'POST', { theme }, cookie), env)).status, 201);
    assert.equal(sqlite.prepare('SELECT count(*) AS total FROM shop_card_themes').get().total, 59);
  } finally { sqlite.close(); }
});
test('unrelated database failures are not hidden or replaced by demo data', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const error = new Error('D1 unavailable');
    const broken = { ...env, DB: { prepare() { throw error; }, batch() { assert.fail('Must not initialize on unrelated errors'); } } };
    await assert.rejects(handleShop(request('/api/shop/catalog'), broken), /D1 unavailable/);
  } finally { sqlite.close(); }
});
test('catalog management reuses admin auth, denies viewers/CSRF and atomically records changes', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    assert.equal((await handleShop(request('/api/admin/shop/themes'), env)).status, 401);
    const viewer = await adminCookie(env, 'viewer'), manager = await adminCookie(env, 'manager');
    assert.equal((await handleShop(request('/api/admin/shop/themes'), env)).status, 401);
    assert.equal((await handleShop(request('/api/admin/shop/themes', 'GET', null, viewer), env)).status, 200);
    assert.equal((await handleShop(request('/api/admin/shop/themes/oliva-bistro', 'PUT', { theme: seeds[0] }, viewer), env)).status, 403);
    assert.equal((await handleShop(request('/api/admin/shop/themes/oliva-bistro', 'PUT', { theme: seeds[0] }, manager, 'https://attacker.example'), env)).status, 403);
    const next = { ...seeds[0], name: 'Changed restaurant', status: 'archived' };
    assert.equal((await handleShop(request('/api/admin/shop/themes/oliva-bistro', 'PUT', { theme: next }, manager), env)).status, 200);
    assert.equal((await (await handleShop(request('/api/shop/catalog'), env)).json()).themes.length, 57);
    assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM admin_audit_log WHERE resource='shop_themes'").get().count, 1);
    assert.equal((await handleShop(request('/api/admin/shop/themes', 'POST', { theme: { ...seeds[0], id: 'another-id' } }, manager), env)).status, 409);
    sqlite.exec("CREATE TRIGGER reject_shop_audit BEFORE INSERT ON admin_audit_log BEGIN SELECT RAISE(ABORT, 'audit unavailable'); END");
    await assert.rejects(handleShop(request('/api/admin/shop/themes/oliva-bistro', 'PUT', { theme: seeds[0] }, manager), env));
    assert.equal(JSON.parse(sqlite.prepare("SELECT data_json FROM shop_card_themes WHERE id='oliva-bistro'").get().data_json).status, 'archived');
  } finally { sqlite.close(); }
});
test('publishing rejects sample/missing artwork and invalid catalog properties', () => {
  assert.throws(() => validateTheme({ ...seeds[0], status: 'published', approved: true, priceMinor: 70000 }), /Demo artwork/);
  assert.throws(() => validateTheme({ ...seeds[0], front: 'https://attacker.example/pixel.svg' }));
  assert.throws(() => validateTheme({ ...seeds[0], palette: ['red;display:none'] }));
  assert.throws(() => validateTheme({ ...seeds[0], slug: '../other' }));
  assert.throws(() => validateTheme({ ...seeds[0], priceMinor: -1 }));
  assert.throws(() => validateTheme({ ...seeds[0], artwork: { ...seeds[0].artwork, front: { x: -1, y: 0, width: 600, height: 900 } } }));
  assert.throws(() => validateTheme({ ...seeds[0], artwork: { ...seeds[0].artwork, back: { x: 1000, y: 0, width: 600, height: 900 } } }));
});
test('uploaded artwork upgrades legacy catalog rows without changing order identity or administrator fields', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const raw = JSON.parse(sqlite.prepare("SELECT data_json FROM shop_card_themes WHERE id='oliva-bistro'").get().data_json);
    assert.match(raw.front, /-front\.svg$/);
    raw.name = 'Preserved restaurant name'; raw.description = 'Preserved custom copy';
    sqlite.prepare("UPDATE shop_card_themes SET data_json = ? WHERE id='oliva-bistro'").run(JSON.stringify(raw));
    const catalog = await (await handleShop(request('/api/shop/catalog'), env)).json();
    const theme = catalog.themes.find(t => t.id === raw.id);
    assert.match(theme.front, /demo-oliva-bistro-pair\.png$/);
    assert.equal(theme.name, raw.name); assert.equal(theme.description, raw.description);
    assert.equal(theme.id, raw.id); assert.equal(theme.orientation, 'Vertical');
    sqlite.exec(await readFile(new URL('../migrations/0023_shop_uploaded_artwork.sql', import.meta.url), 'utf8'));
    const migrated = JSON.parse(sqlite.prepare("SELECT data_json FROM shop_card_themes WHERE id='oliva-bistro'").get().data_json);
    assert.equal(migrated.front, theme.front); assert.deepEqual(migrated.artwork, theme.artwork); assert.equal(migrated.name, raw.name);
    // A different administrator-selected asset must not be replaced.
    migrated.front = '/shop/artwork/custom-front.png';
    sqlite.prepare("UPDATE shop_card_themes SET data_json = ? WHERE id='oliva-bistro'").run(JSON.stringify(migrated));
    const next = await (await handleShop(request('/api/shop/catalog'), env)).json();
    assert.equal(next.themes.find(t => t.id === raw.id).front, migrated.front);
  } finally { sqlite.close(); }
});
test('shop routing serves unique metadata, proper HEAD, canonical redirect and real 404s', async () => {
  const { env, sqlite } = await shopFixture();
  try {
    const page = await handleShop(request('/shop/cards/oliva-bistro'), env), html = await page.text();
    assert.match(html, /Oliva Bistro NFC &amp; QR Card/);
    assert.match(html, /rel="canonical" href="https:\/\/auradigitalworks.com\/shop\/cards\/oliva-bistro"/);
    assert.equal((await handleShop(request('/shop/cards/not-a-theme'), env)).status, 404);
    assert.equal((await handleShop(request('/shop/cart'), env)).headers.get('X-Robots-Tag'), 'noindex, nofollow');
    assert.equal(await (await handleShop(request('/shop', 'HEAD'), env)).text(), '');
    assert.equal((await handleShop(request('/shop/?category=Restaurants'), env)).headers.get('Location'), 'https://auradigitalworks.com/shop?category=Restaurants');
    assert.equal(await handleShop(request('/nfc-studio'), env), null);
    const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
    for (const path of ['/shop', '/shop/', '/shop/cards/*', '/shop/cart']) assert.ok(config.assets.run_worker_first.includes(path));
  } finally { sqlite.close(); }
});
