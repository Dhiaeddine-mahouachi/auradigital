import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { catalogue } from '../pricing/catalogue.js';

const root = new URL('../', import.meta.url);
const read = (f) => readFileSync(new URL(f, root), 'utf8');
const PAGES = ['index.html', 'solutions.html', 'service-shop.html', 'packages.html', 'aura-menu.html', 'portfolio.html', 'help.html', 'about.html', 'contact.html'];
const bundle = read('redesign/app.js');
const price = (id) => {
  for (const group of Object.values(catalogue)) if (Array.isArray(group)) { const item = group.find((x) => x && x.id === id); if (item) return item.price; }
  throw new Error('missing ' + id);
};
const tl = (n) => '₺' + n.toLocaleString('en-US');

test('every redesigned page is pre-rendered and hydrates from the shared bundle', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.match(html, /<div id="app" data-page="[A-Za-z]+"><[a-z]/, page + ' must be pre-rendered');
    assert.match(html, /<script src="\/redesign\/app\.js\?v=\d+" defer><\/script>/, page);
    assert.match(html, /<meta name="viewport"/, page);
    assert.doesNotMatch(html, /\.dc\.html|\/_blob\/|\{\{/, page + ' must not contain design-tool links or template holes');
    assert.doesNotMatch(html, /\[(YOUR|PRICE|DATE|ADDRESS|TEAM)[^\]]*\]/, page + ' must not contain placeholders');
  }
});

test('local images and videos referenced by redesigned pages exist', () => {
  for (const page of PAGES) {
    for (const m of read(page).matchAll(/(?:src|poster)="(\/[^"?]+)/g)) {
      if (m[1].startsWith('/redesign/app.js')) continue;
      assert.ok(existsSync(new URL('.' + m[1], root)), page + ' references missing ' + m[1]);
    }
  }
});

test('prices shown on redesigned pages match the shared catalogue', () => {
  const pkg = read('packages.html');
  for (const id of ['launch', 'growth', 'system']) assert.ok(pkg.includes(tl(price(id))), 'packages shows ' + id);
  assert.ok(read('aura-menu.html').includes(tl(price('auramenu-self'))));
  assert.ok(read('aura-menu.html').includes(tl(price('auramenu-managed'))));
  assert.ok(bundle.includes(String(price('nfc-card'))));
  for (const page of PAGES) assert.doesNotMatch(read(page), /₺5,000|₺8,000|₺12,000|5\.000 TL/, page + ' must not show retired prices');
});

test('discontinued social media retainers are not offered', () => {
  for (const page of ['index.html', 'solutions.html', 'service-shop.html']) assert.doesNotMatch(read(page), /Social media management|Content &amp; management/, page);
});

test('navigation reaches the real AuraHub and every new route', () => {
  const home = read('index.html');
  for (const href of ['/hub/signup', '/hub', '/solutions', '/service-shop', '/packages', '/portfolio', '/help', '/about', '/contact', '/aura-menu']) assert.ok(home.includes('href="' + href + '"'), 'home links ' + href);
  // The simplified homepage keeps product sites in the footer; client sites live on Our Work.
  for (const site of ['https://auramenu.space', 'https://aurapops.online', 'https://bentwalad.online']) assert.ok(home.includes(site), 'home links ' + site);
  const work = read('portfolio.html');
  for (const site of ['https://mutlunakliyat.site', 'https://auramenu.space', 'https://bentwalad.online']) assert.ok(work.includes(site), 'work links ' + site);
  assert.ok(!work.includes('decorationgateaux'), 'Décoration Gâteaux is not shown');
});

test('contact form posts to the CRM endpoint with an idempotency key and honeypot', () => {
  assert.match(bundle, /\/api\/contact/);
  assert.match(bundle, /Idempotency-Key/);
  assert.match(read('contact.html'), /id="c-web"/);
  assert.match(read('contact.html'), /\+90 538 550 76 74/);
  assert.match(read('contact.html'), /info@auradigitalworks\.com/);
});

test('Auri talks to the AI endpoint and always has a local fallback', () => {
  assert.match(bundle, /\/api\/ai\/session/);
  assert.match(bundle, /\/api\/ai\/message/);
  assert.match(bundle, /pointermove/, 'eyes follow the cursor');
  assert.match(bundle, /text:[A-Za-z_$]+\|\|[A-Za-z_$]+\.text/, 'falls back to the built-in answer');
});

test('every redesigned route reaches the Worker (no static 404)', () => {
  const cfg = read('wrangler.jsonc');
  const list = cfg.slice(cfg.indexOf('"run_worker_first"'), cfg.indexOf(']', cfg.indexOf('"run_worker_first"')));
  for (const route of ['/', '/solutions', '/service-shop', '/packages', '/aura-menu', '/portfolio', '/help', '/about', '/contact', '/hub', '/hub/*']) {
    assert.ok(list.includes('"' + route + '"'), route + ' must be listed in assets.run_worker_first');
  }
});

test('shop page lists every NFC card design and links to the account-linked shop', async () => {
  const seed = JSON.parse(read('shop/catalog.seed.json'));
  for (const card of seed) {
    assert.ok(bundle.includes('"' + card.slug + '"'), 'card ' + card.slug + ' in shop');
    assert.ok(existsSync(new URL('media/redesign/cards/' + card.slug + '.webp', root)), 'thumbnail for ' + card.slug);
  }
  assert.ok(bundle.includes('/shop/cards/'));
  assert.ok(read('service-shop.html').includes('href="/account"') || bundle.includes('"/account"'));
  // The homepage no longer shows a card carousel; any card it does link must be publicly listed.
  const listed = seed.filter((c) => c.orientation === "Horizontal").map((c) => c.slug);
  const linked = [...read("index.html").matchAll(/href="\/shop\/cards\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const slug of linked) assert.ok(listed.includes(slug), "homepage links unlisted card " + slug);
});

import { existsSync as __ex } from 'node:fs';
function require_exists(p) { return __ex(new URL('../' + p, import.meta.url)); }

test('landing page starts with an email that carries over to AuraHub sign-up', () => {
  const main = read('tools/redesign/design/Main.dc.html');
  assert.match(main, /sessionStorage\.setItem\('aura-start-email'/);
  assert.match(main, /location\.assign\('Hub\.dc\.html'\)/);
  const boot = read('hub/boot.js');
  assert.match(boot, /'aura-start-email'/);
  assert.match(boot, /15 \* 60 \* 1000|900000/, 'the saved email expires');
});

test('mobile Auri chat sits above the page and fits the viewport', () => {
  const css = read('tools/redesign/design/css.txt');
  const auri = read('tools/redesign/design/Auri.dc.html');
  assert.match(auri, /class="auri-wrap \{\{ chatOpenClass \}\}"/);
  assert.match(auri, /chatOpenClass: s\.open \? "auri-chat-open"/);
  assert.match(css, /\.auri-wrap\.auri-chat-open\{z-index:160 !important\}/);
  assert.ok(!require_exists('tools/redesign/inject/index.head.html'), 'old sale bar is gone');
});

test('grids collapse without fixed minimums at 320px', () => {
  const css = read('tools/redesign/design/css.txt');
  assert.match(css, /grid-template-columns:repeat\(var\(--cols,3\),minmax\(0,1fr\)\)/);
  assert.match(read('tools/redesign/design/Main.dc.html'), /\.bento \.tile\{grid-column:1\/-1/);
});

