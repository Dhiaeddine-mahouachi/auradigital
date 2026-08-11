const COOKIE_NAME = "__Host-aura_admin";
export const SESSION_SECONDS = 60 * 60 * 8;
export const ADMIN_ROLES = new Set(["owner", "manager", "viewer"]);
const PASSWORD_ALGORITHM = "PBKDF2";
const PASSWORD_DIGEST = "SHA-256";
const PASSWORD_ITERATIONS = 600_000;
const PASSWORD_HASH_BYTES = 32;
const encoder = new TextEncoder();

export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}

export function normalizeUsername(value) {
  const username = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{2,63}$/.test(username) ? username : "";
}

export function validatePassword(value) {
  const password = String(value || "");
  if (password.length < 12 || password.length > 200) {
    throw new Error("Password must contain between 12 and 200 characters.");
  }
  return password;
}

export async function hashPassword(value) {
  const password = validatePassword(value);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${base64url(salt)}$${base64url(hash)}`;
}

export async function verifyPassword(value, storedHash) {
  const password = String(value || "");
  const parts = String(storedHash || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2-sha256") return false;

  const iterations = Number(parts[1]);
  const salt = fromBase64url(parts[2]);
  const expected = fromBase64url(parts[3]);
  if (
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    iterations > 2_000_000 ||
    salt.length < 16 ||
    expected.length !== PASSWORD_HASH_BYTES
  ) {
    return false;
  }

  const actual = await derivePassword(password, salt, iterations);
  return safeEqualBytes(actual, expected);
}

export async function createSession(db, userId) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = base64url(tokenBytes);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString().slice(0, 19).replace("T", " ");
  await db.prepare(
    "INSERT INTO admin_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), userId, tokenHash, expiresAt).run();
  return token;
}

export async function getAuthenticatedAdmin(request, db) {
  const token = parseCookies(request.headers.get("Cookie") || "")[COOKIE_NAME];
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  const tokenHash = await sha256(token);
  const row = await db.prepare(
    "SELECT u.id, u.username, u.display_name, u.role " +
    "FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id " +
    "WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1 LIMIT 1"
  ).bind(tokenHash).first();
  if (!row || !ADMIN_ROLES.has(row.role)) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
  };
}

export async function revokeSession(request, db) {
  const token = parseCookies(request.headers.get("Cookie") || "")[COOKIE_NAME];
  if (!token) return;
  const tokenHash = await sha256(token);
  await db.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export function sessionCookie(value, maxAge = SESSION_SECONDS) {
  const expires = maxAge === 0 ? "; Expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}${expires}; HttpOnly; Secure; SameSite=Strict`;
}

export async function safeEqual(a, b) {
  const [hashA, hashB] = await Promise.all([sha256(String(a)), sha256(String(b))]);
  return safeEqualBytes(fromBase64url(hashA), fromBase64url(hashB));
}

async function derivePassword(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: PASSWORD_ALGORITHM },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: PASSWORD_ALGORITHM, hash: PASSWORD_DIGEST, salt, iterations },
    key,
    PASSWORD_HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

async function sha256(value) {
  const data = typeof value === "string" ? encoder.encode(value) : value;
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", data)));
}

function safeEqualBytes(a, b) {
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (a[index] || 0) ^ (b[index] || 0);
  }
  return difference === 0;
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64url(value) {
  try {
    const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return new Uint8Array();
  }
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
