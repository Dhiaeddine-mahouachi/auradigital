const COOKIE_NAME = "__Host-aura_admin";
export const SESSION_SECONDS = 60 * 60 * 8;
const TOKEN_VERSION = "v1";
const encoder = new TextEncoder();

export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}

export async function createSessionToken(secret) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonceBytes = crypto.getRandomValues(new Uint8Array(18));
  const payload = `${TOKEN_VERSION}.${expires}.${base64url(nonceBytes)}`;
  const signature = await sign(`aura-admin-session:${payload}`, secret);
  return `${payload}.${signature}`;
}

export async function isAuthenticated(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const token = parseCookies(request.headers.get("Cookie") || "")[COOKIE_NAME];
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) return false;
  const [version, expiresText, nonce, signature] = parts;
  const expires = Number(expiresText);
  if (
    !Number.isFinite(expires) ||
    expires < Math.floor(Date.now() / 1000) ||
    !/^[A-Za-z0-9_-]{20,40}$/.test(nonce) ||
    !/^[A-Za-z0-9_-]{40,60}$/.test(signature)
  ) {
    return false;
  }

  const payload = `${version}.${expiresText}.${nonce}`;
  const expected = await sign(`aura-admin-session:${payload}`, env.ADMIN_PASSWORD);
  return safeEqual(signature, expected);
}

export async function safeEqual(a, b) {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(String(a))),
    crypto.subtle.digest("SHA-256", encoder.encode(String(b))),
  ]);
  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);
  let difference = bytesA.length ^ bytesB.length;
  for (let index = 0; index < bytesA.length; index += 1) {
    difference |= bytesA[index] ^ bytesB[index];
  }
  return difference === 0;
}

export function sessionCookie(value, maxAge = SESSION_SECONDS) {
  const expires = maxAge === 0 ? "; Expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}${expires}; HttpOnly; Secure; SameSite=Strict`;
}

async function sign(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return base64url(new Uint8Array(signature));
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parseCookies(header) {
  const result = {};
  for (const item of header.split(";")) {
    const index = item.indexOf("=");
    if (index < 0) continue;
    result[item.slice(0, index).trim()] = item.slice(index + 1).trim();
  }
  return result;
}
