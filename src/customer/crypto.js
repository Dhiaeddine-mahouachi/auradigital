const encoder = new TextEncoder();
const PASSWORD_ITERATIONS = 210_000;

export async function hashPassword(password, salt = randomToken(18), iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bytes = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: decodeBase64Url(salt), iterations },
    key,
    256,
  );
  return { hash: encodeBase64Url(new Uint8Array(bytes)), salt, iterations };
}

export async function verifyPassword(password, expectedHash, salt, iterations) {
  const result = await hashPassword(password, salt, Number(iterations));
  return constantTimeEqual(result.hash, expectedHash);
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return encodeBase64Url(new Uint8Array(digest));
}

export function randomToken(size = 32) {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(size)));
}

export function constantTimeEqual(a, b) {
  const left = encoder.encode(String(a));
  const right = encoder.encode(String(b));
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] || 0) ^ (right[index] || 0);
  }
  return difference === 0;
}

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const padded = String(value).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
