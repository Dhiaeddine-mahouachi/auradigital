import { randomToken, sha256 } from "./crypto.js";

const COOKIE_NAME = "__Host-aura_customer";
const SESSION_SECONDS = 60 * 60 * 12;

export async function createCustomerSession(request, db, user) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  const userAgent = (request.headers.get("User-Agent") || "").slice(0, 240);
  await db.prepare("INSERT INTO customer_sessions (id, user_id, tenant_id, token_hash, expires_at, user_agent) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, user.id, user.tenant_id, tokenHash, expiresAt, userAgent).run();
  return { cookie: customerCookie(token), expiresAt };
}

export async function getCustomerSession(request, db) {
  const token = readCookie(request.headers.get("Cookie") || "", COOKIE_NAME);
  if (!token || token.length < 40 || token.length > 100) return null;
  const tokenHash = await sha256(token);
  const row = await db.prepare(
    "SELECT s.id AS session_id, s.expires_at, u.id AS user_id, u.tenant_id, u.email, u.role, u.status AS user_status, t.status AS tenant_status " +
    "FROM customer_sessions s JOIN users u ON u.id = s.user_id LEFT JOIN tenants t ON t.id = u.tenant_id " +
    "WHERE s.token_hash = ? AND s.expires_at > datetime('now') LIMIT 1",
  ).bind(tokenHash).first();
  if (!row || row.user_status !== "active" || (row.tenant_id && row.tenant_status !== "active")) return null;
  return row;
}

export async function revokeCustomerSession(request, db) {
  const token = readCookie(request.headers.get("Cookie") || "", COOKIE_NAME);
  if (!token) return;
  await db.prepare("DELETE FROM customer_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

export async function revokeAllUserSessions(db, userId) {
  await db.prepare("DELETE FROM customer_sessions WHERE user_id = ?").bind(userId).run();
}

export function customerCookie(value, maxAge = SESSION_SECONDS) {
  const expires = maxAge === 0 ? "; Expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}${expires}; HttpOnly; Secure; SameSite=Strict`;
}

function readCookie(header, name) {
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return "";
}
