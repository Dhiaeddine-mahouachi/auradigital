import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { permanentSeoRedirect } from '../src/seo.js';

test('AuraDigital keeps exact AuraPops routes without taking AuraPops app subroutes', async () => {
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  for (const path of ['/aurapops', '/aurapops/', '/aurapops.html', '/aurapops-showcase.html']) {
    assert.ok(config.routes.some(route => route.pattern === `auradigitalworks.com${path}`), path);
  }
  assert.ok(!config.routes.some(route => route.pattern === 'auradigitalworks.com/aurapops*'));
});

test('Old AuraPops pages redirect to aurapops.online and keep tracking parameters', () => {
  for (const path of ['/aurapops', '/aurapops/', '/aurapops.html', '/aurapops-showcase.html']) {
    const response = permanentSeoRedirect(new Request(`https://auradigitalworks.com${path}?utm_source=qr`));
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get('location'), 'https://aurapops.online/?utm_source=qr', path);
  }
  assert.equal(permanentSeoRedirect(new Request('https://auradigitalworks.com/aurapops/admin')), null);
});

test('Retired old-design pages redirect to their 2026 equivalents', () => {
  for (const [from, to] of [['/services', '/solutions'], ['/services.html', '/solutions'], ['/hizmetler', '/solutions'], ['/websites', '/packages'], ['/spinflow', '/solutions'], ['/qr-menu', '/aura-menu'], ['/nfc', '/service-shop'], ['/nfc.html', '/service-shop']]) {
    const response = permanentSeoRedirect(new Request(`https://auradigitalworks.com${from}`));
    assert.equal(response?.status, 301, from);
    assert.equal(response.headers.get('location'), `https://auradigitalworks.com${to}`, from);
  }
});
