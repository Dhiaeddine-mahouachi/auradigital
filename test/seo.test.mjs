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

  const trackedResponse = permanentSeoRedirect(new Request('https://auradigitalworks.com/services.html?utm_source=google'));
  assert.equal(trackedResponse?.headers.get('location'), 'https://auradigitalworks.com/services?utm_source=google');
});

test('public pages declare their visible default language in source HTML', async () => {
  const pages = ['index', 'services', 'portfolio', 'aura-menu', 'aura-weddings', 'nfc', 'nfc-builder', 'qr-menu', 'packages', 'about', 'contact'];
  for (const name of pages) {
    const html = await readFile(new URL(`../${name}.html`, import.meta.url), 'utf8');
    assert.match(html, /^<!doctype html>\s*<html lang="en">/i, name);
  }
});

test('admin shortcut redirects to the deployed dashboard entry point', async () => {
  const redirects = await readFile(new URL('../_redirects', import.meta.url), 'utf8');
  assert.match(redirects, /^\/admin \/admin\/index\.html 301$/m);
  assert.match(redirects, /^\/admin\/ \/admin\/index\.html 301$/m);
});
