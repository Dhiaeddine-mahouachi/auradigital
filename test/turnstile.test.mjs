import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTurnstile, turnstileSiteKey, turnstileCsp } from '../src/turnstile.js';

const req = new Request('https://auradigitalworks.com/api/customer/login', { headers: { 'CF-Connecting-IP': '203.0.113.9' } });
const env = { TURNSTILE_SITE_KEY: 'site', TURNSTILE_SECRET_KEY: 'secret' };

test('Turnstile is off until both keys are configured', async () => {
  assert.equal(turnstileSiteKey({}), '');
  assert.equal(turnstileSiteKey({ TURNSTILE_SITE_KEY: 'site' }), '');
  assert.equal(await verifyTurnstile(req, {}, undefined), true);
});

test('missing token is rejected when enabled', async () => {
  await assert.rejects(verifyTurnstile(req, env, ''), /human verification/);
});

test('token is verified with Cloudflare siteverify', async () => {
  const real = globalThis.fetch; let sent;
  globalThis.fetch = async (url, init) => { sent = { url, body: String(init.body) }; return Response.json({ success: true }); };
  try {
    assert.equal(await verifyTurnstile(req, env, 'tok'), true);
    assert.equal(sent.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.match(sent.body, /secret=secret/); assert.match(sent.body, /response=tok/); assert.match(sent.body, /remoteip=203\.0\.113\.9/);
  } finally { globalThis.fetch = real; }
});

test('failed challenge is rejected', async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: false, 'error-codes': ['invalid-input-response'] });
  try { await assert.rejects(verifyTurnstile(req, env, 'bad'), /failed/); } finally { globalThis.fetch = real; }
});

test('CSP allows the Turnstile script and frame only', () => {
  const p = turnstileCsp("default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'");
  assert.match(p, /script-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.match(p, /connect-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.match(p, /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(p, /frame-ancestors 'none'/);
});
