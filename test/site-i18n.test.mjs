import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const PAGES = ['index.html', 'solutions.html', 'service-shop.html', 'packages.html', 'aura-menu.html', 'portfolio.html', 'help.html', 'about.html', 'contact.html', '404.html', 'shop/index.html'];

test('public pages load the translator and offer a working language switcher', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.match(html, /<script src="\/redesign\/i18n\.js\?v=\w+" defer><\/script>/, page + ' loads i18n.js');
    for (const lang of ['en', 'tr', 'ar']) assert.match(html, new RegExp(`data-set-lang="${lang}"`), page + ' has ' + lang + ' button');
    assert.doesNotMatch(html, /<!--(CSS|FONTS)-->/, page + ' has its shared styles');
    assert.doesNotMatch(html, /left: -9999px/, page + ' hides labels without RTL overflow');
  }
});

test('Turkish and Arabic phrase tables are complete and in sync with their sources', () => {
  const tr = JSON.parse(read('i18n/tr.json')), ar = JSON.parse(read('i18n/ar.json'));
  assert.deepEqual(Object.keys(tr).sort(), Object.keys(ar).sort());
  assert.ok(Object.keys(tr).length > 500);
  for (const key of ['Start your path', 'Packages', 'Contact', 'Log in', 'Open Auri chat']) {
    assert.ok(tr[key] && tr[key] !== key, 'tr ' + key);
    assert.match(ar[key], /[؀-ۿ]/, 'ar ' + key);
  }
  execFileSync(process.execPath, [new URL('../tools/i18n/build.mjs', import.meta.url).pathname]);
  assert.deepEqual(JSON.parse(read('i18n/tr.json')), tr, 'i18n/tr.json is rebuilt from tools/i18n');
});

test('site language choice is shared with AuraHub', () => {
  const runtime = read('redesign/i18n.js'), hub = read('src/hub/app.js');
  assert.match(runtime, /aura-lang-choice-v3/);
  assert.match(hub, /aura-lang-choice-v3/);
});

test('public pages report anonymous page views and the server accepts current page paths', async () => {
  for (const page of PAGES) assert.match(read(page), /<script src="\/redesign\/track\.js\?v=\w+" defer><\/script>/, page + ' loads track.js');
  const worker = read('src/worker.js');
  for (const path of ['/solutions', '/service-shop', '/help', '/shop']) assert.match(worker, new RegExp(`"${path}"`), path + ' is trackable');
});

test('hub hides switched-off features: menu drafts and Google sign-in', () => {
  const identity = read('src/customer-identity.js'), hub = read('src/hub/app.js');
  assert.match(identity, /menuDrafts:env\.MENU_DRAFTS_ENABLED==='true'/);
  assert.match(hub, /authCapabilities\.menuDrafts\?\['menuDrafts'\]/);
  assert.match(hub, /\(mode==='login'\|\|mode==='signup'\)&&authCapabilities\.google\?/);
});
