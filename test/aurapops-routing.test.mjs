import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { permanentSeoRedirect } from '../src/seo.js';

test('AuraDigital owns exact product page routes without taking AuraPops app subroutes', async () => {
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  for (const path of ['/aurapops', '/aurapops/', '/aurapops.html', '/aurapops-showcase.html']) {
    assert.ok(config.routes.some(route => route.pattern === `auradigitalworks.com${path}`), path);
  }
  assert.ok(!config.routes.some(route => route.pattern === 'auradigitalworks.com/aurapops*'));
  const html = await readFile(new URL('../aurapops-showcase.html', import.meta.url), 'utf8');
  assert.match(html, /href="pops-product.css\?/);
  assert.match(html, /src="pops-product.js\?/);
});

test('AuraPops trailing slash redirects to the canonical product page and retains tracking parameters', () => {
  const response = permanentSeoRedirect(new Request('https://auradigitalworks.com/aurapops/?utm_source=qr'));
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), 'https://auradigitalworks.com/aurapops?utm_source=qr');
  assert.equal(permanentSeoRedirect(new Request('https://auradigitalworks.com/aurapops/admin')), null);
});
