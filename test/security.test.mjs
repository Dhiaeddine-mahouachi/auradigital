import assert from "node:assert/strict";
import test from "node:test";
import { secureResponse } from "../src/security-policy.js";
import {
  hashBootstrapPassword,
  hashPassword,
  normalizeUsername,
  safeEqual,
  sameOrigin,
  validatePassword,
  verifyPassword,
} from "../src/security.js";

test('publication failures emit a credential-free monitoring event', (t) => {
  const log = t.mock.method(console, 'log', () => {});
  const request = new Request('https://auramenu.space/api/auramenu/dashboard/a1/publish?private=1', { method: 'POST' });
  secureResponse(new Response(null, { status: 503 }), request, {}, {});
  secureResponse(new Response(null, { status: 409 }), request, {}, {});
  assert.equal(log.mock.callCount(), 1);
  const record = JSON.parse(log.mock.calls[0].arguments[0]);
  assert.equal(record.event, 'auramenu_publication_failed');
  assert.equal(record.status, 503);
  assert.doesNotMatch(JSON.stringify(record), /private=1|a1\/publish/);
});

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
