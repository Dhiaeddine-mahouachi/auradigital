import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/hub/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../hub/os.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../hub/index.html', import.meta.url), 'utf8');

test('mobile Hub uses the same navigation groups as the desktop sidebar', () => {
  assert.match(source, /groups\.map\(\(\[name,list\]\)=>/);
  assert.match(source, /os-mobile-menu/);
  assert.match(source, /os-mobile-sidebar-close/);
  assert.match(source, /data-os-menu-close/);
  assert.match(source, /os-mobile-nav-open/);
  assert.match(source, /mobileSidebar\.inert=mobileQuery\.matches&&!enabled/);
  assert.match(source, /if\(e\.key==='Escape'&&mobileShell\.classList/);
});

test('mobile Hub exposes the same header actions without the old bottom tabs', () => {
  for (const name of ['os-business', 'os-top-search', 'os-bell', 'os-top-request', 'os-top-auri']) {
    assert.ok(source.includes(name), name + ' must remain rendered');
  }
  assert.match(css, /AuraHub responsive parity/);
  assert.match(css, /grid-template-areas:"menu brand search bell account" "business business business request auri"/);
  assert.match(css, /\.aurahub-shell\.os-shell \.command-bottom-nav,[\s\S]*?\.aurahub-shell\.os-shell \.hx-sheet\{display:none!important\}/);
  assert.match(css, /\.aurahub-shell\.os-shell\.os-mobile-nav-open \.os-sidebar/);
  assert.match(css, /body\.os-hub-menu-open\{overflow:hidden\}/);
});

test('responsive Hub keeps all screens on the modern desktop design system', () => {
  assert.match(html, /\/hub\/os\.css\?v=[a-f0-9]+/);
  assert.match(html, /\/hub\/app\.js\?v=[a-f0-9]+/);
  assert.match(css, /grid-template-columns:42px minmax\(0,1fr\) repeat\(3,40px\)/);
  assert.match(css, /@media\(max-width:370px\)/);
  assert.match(css, /--os-emerald:#003D2B/);
  assert.match(css, /\.aurahub-shell\.os-shell \.os-topbar \.os-top-auri\{/);
});