import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { permanentSeoRedirect } from '../src/seo.js';

test('HTML asset handling is disabled so canonical .html URLs do not redirect back', async () => {
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.assets.html_handling, 'none');
});

test('short service URL redirects once to the canonical HTML URL', () => {
  const response = permanentSeoRedirect(new Request('https://auradigital.ink/services'));
  assert.equal(response?.status, 301);
  assert.equal(response?.headers.get('location'), 'https://auradigital.ink/services.html');

  const canonicalResponse = permanentSeoRedirect(new Request('https://auradigital.ink/services.html'));
  assert.equal(canonicalResponse, null);
});
