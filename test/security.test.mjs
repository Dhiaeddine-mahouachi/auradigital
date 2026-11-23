import assert from "node:assert/strict";
import test from "node:test";
import {
  hashBootstrapPassword,
  hashPassword,
  normalizeUsername,
  safeEqual,
  sameOrigin,
  validatePassword,
  verifyPassword,
} from "../src/security.js";

test("password hashes are salted and verifiable", async () => {
  const password = "correct horse battery staple";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("incorrect password", first), false);
  assert.match(first, /^\$2b\$12\$/);
});

test("password and username validation rejects weak input", () => {
  assert.throws(() => validatePassword("1234567"));
  assert.equal(validatePassword("123456789012"), "123456789012");
  assert.equal(normalizeUsername(" Owner "), "owner");
  assert.equal(normalizeUsername("bad username"), "");
});

test("legacy bootstrap comparison does not short-circuit on length", async () => {
  assert.equal(await safeEqual("same-value", "same-value"), true);
  assert.equal(await safeEqual("short", "a much longer secret"), false);
});

test("owner bootstrap rejects weak passwords", async () => {
  await assert.rejects(() => hashBootstrapPassword("short"));
  await assert.rejects(() => hashBootstrapPassword(""));
});


test("same-origin validation supports Cloudflare-routed public requests", () => {
  const exact = new Request("https://auradigitalworks.com/api/admin/login", {
    method: "POST",
    headers: { Origin: "https://auradigitalworks.com" },
  });
  assert.equal(sameOrigin(exact), true);

  const routed = new Request("https://internal-worker.example/api/admin/login", {
    method: "POST",
    headers: {
      Origin: "https://auradigitalworks.com",
      "Sec-Fetch-Site": "same-origin",
    },
  });
  assert.equal(sameOrigin(routed), true);

  const omittedOrigin = new Request("https://auradigitalworks.com/api/admin/login", {
    method: "POST",
    headers: { "Sec-Fetch-Site": "same-origin" },
  });
  assert.equal(sameOrigin(omittedOrigin), true);

  const crossSite = new Request("https://auradigitalworks.com/api/admin/login", {
    method: "POST",
    headers: {
      Origin: "https://evil.example",
      "Sec-Fetch-Site": "cross-site",
    },
  });
  assert.equal(sameOrigin(crossSite), false);
});

test('customer sign-in is limited per account as well as per IP', async () => {
 const { hubFixture } = await import('./hub-fixture.mjs');
 const f = await hubFixture();
 const seen = new Map();
 f.env.LOGIN_RATE_LIMITER = { async limit({ key }) { const n = (seen.get(key) || 0) + 1; seen.set(key, n); return { success: !key.startsWith('customer-auth-account:') || n <= 5 }; } };
 const attempt = ip => f.call('/api/customer/login', null, 'POST', { email: 'victim@example.test', password: 'wrong-password-123' }, { 'CF-Connecting-IP': ip });
 for (let i = 0; i < 5; i++) assert.equal((await attempt('10.0.0.' + i)).status, 401);
 assert.equal((await attempt('10.0.9.9')).status, 429, 'a new IP cannot continue guessing the same account');
});

test('the Hub page allows the microphone for Auri voice input only on its own origin', async () => {
 const { hubFixture } = await import('./hub-fixture.mjs');
 const f = await hubFixture();
 const r = await f.call('/hub', null);
 assert.equal(r.headers.get('Permissions-Policy'), 'camera=(), microphone=(self), geolocation=(), payment=(), usb=()');
});
