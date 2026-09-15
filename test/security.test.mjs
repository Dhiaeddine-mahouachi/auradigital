import assert from "node:assert/strict";
import test from "node:test";
import {
  hashBootstrapPassword,
  hashPassword,
  normalizeUsername,
  safeEqual,
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
