import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { permanentSeoRedirect } from '../src/seo.js';

test('HTML asset handling is disabled so the worker controls clean canonical URLs', async () => {
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.assets.html_handling, 'none');
});

test('legacy HTML service URL redirects once to the clean canonical URL', () => {
  const response = permanentSeoRedirect(new Request('https://auradigital.ink/services.html'));
  assert.equal(response?.status, 301);
  assert.equal(response?.headers.get('location'), 'https://auradigital.ink/services');

  const canonicalResponse = permanentSeoRedirect(new Request('https://auradigital.ink/services'));
  assert.equal(canonicalResponse, null);
});

test('admin shortcut redirects to the deployed dashboard entry point', async () => {
  const redirects = await readFile(new URL('../_redirects', import.meta.url), 'utf8');
  assert.match(redirects, /^\/admin \/admin\/index\.html 301$/m);
  assert.match(redirects, /^\/admin\/ \/admin\/index\.html 301$/m);
});
