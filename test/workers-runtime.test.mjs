import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Cloudflare Workers rejects fetch(..., { redirect: 'error' }) with
// "Invalid redirect value"; it broke every Ollama call in production.
test('server code never uses the redirect "error" mode unsupported by Workers', () => {
  const root = new URL('../src/', import.meta.url).pathname;
  const files = [];
  const walk = dir => { for (const name of readdirSync(dir)) { const p = join(dir, name); statSync(p).isDirectory() ? walk(p) : /\.(m?js|ts)$/.test(name) && files.push(p); } };
  walk(root);
  const offenders = files.filter(f => /redirect\s*:\s*['"]error['"]/.test(readFileSync(f, 'utf8')));
  assert.deepEqual(offenders, []);
});
