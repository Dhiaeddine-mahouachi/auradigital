import baseWorker from "./worker.js";

const ADMIN_COOKIE = "__Host-aura_admin";
const ROLE_COOKIE = "__Host-aura_role";
const PREVIEW_COOKIE = "__Host-aura_preview";
const SESSION_SECONDS = 60 * 60 * 8;
const PREVIEW_SECONDS = 60 * 60 * 24 * 30;
const USER_BODY_BYTES = 16 * 1024;
const TEAM_ROLES = new Set(["admin", "sales", "designer", "accountant"]);
const PBKDF2_ITERATIONS = 210000;

let securitySchemaReady = false;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/api/")) await ensureSecuritySchema(env.DB);

      if (url.pathname === "/api/security/team-login" && request.method === "POST") {
        return teamLogin(request, env);
      }

      if (url.pathname === "/api/security/admin-users" || url.pathname.startsWith("/api/security/admin-users/")) {
        return handleAdminUsers(request, env, url);
      }

      if (url.pathname === "/api/security/activity" && request.method === "GET") {
        return handleActivity(request, env);
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        const response = await baseWorker.fetch(request, env, ctx);
        if (!response.ok) return response;
        const headers = new Headers(response.headers);
        headers.append("Set-Cookie", await makeRoleCookie("owner", "owner", env.ADMIN_PASSWORD, SESSION_SECONDS));
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }

      if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        const response = await baseWorker.fetch(request, env, ctx);
        const headers = new Headers(response.headers);
        headers.append("Set-Cookie", clearCookie(ROLE_COOKIE));
        headers.append("Set-Cookie", clearCookie(PREVIEW_COOKIE));
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        const actor = await resolveActor(request, env);
        return secureJson({
          authenticated: Boolean(actor),
          user: actor ? { id: actor.id, email: actor.email || "", role: actor.role } : null,
        }, 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname.startsWith("/api/admin/")) {
        const actor = await resolveActor(request, env);
        if (!actor) return secureJson({ error: "Unauthorized." }, 401);
        if (!canAccess(actor.role, request.method, url.pathname)) {
          return secureJson({ error: "Forbidden for this role." }, 403);
        }
        const response = await baseWorker.fetch(request, env, ctx);
        if (response.ok && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
          ctx?.waitUntil?.(logActivity(env.DB, actor, request.method, url.pathname));
        }
        return response;
      }

      if (url.pathname === "/api/quicksite/projects" && request.method === "POST") {
        const response = await baseWorker.fetch(request, env, ctx);
        return attachPreviewToken(response, env, "quicksite", request);
      }

      const quickPreview = url.pathname.match(/^\/api\/quicksite\/projects\/([a-f0-9-]+)$/i);
      if (quickPreview && request.method === "GET") {
        const allowed = await authorizePreview(request, env.DB, "quicksite", quickPreview[1]);
        if (!allowed) return secureJson({ error: "Private preview token required." }, 403, { "Cache-Control": "no-store" });
        return baseWorker.fetch(request, env, ctx);
      }

      if (url.pathname === "/api/auramenu/requests" && request.method === "POST") {
        const response = await baseWorker.fetch(request, env, ctx);
        return attachPreviewToken(response, env, "auramenu", request);
      }

      const auraImage = url.pathname.match(/^\/api\/auramenu\/images\/([a-f0-9-]+)$/i);
      if (auraImage && request.method === "GET") {
        const privacy = await env.DB.prepare(
          "SELECT r.id AS request_id, r.status AS status, p.token_hash AS token_hash " +
          "FROM auramenu_images i INNER JOIN auramenu_requests r ON r.id = i.request_id " +
          "LEFT JOIN preview_tokens p ON p.resource_type = 'auramenu' AND p.resource_id = r.id AND p.revoked_at IS NULL " +
          "WHERE i.id = ? LIMIT 1"
        ).bind(auraImage[1]).first();
        if (privacy && privacy.status !== "approved" && privacy.token_hash) {
          const allowed = await verifyPreviewCredential(request, "auramenu", privacy.request_id, privacy.token_hash);
          if (!allowed) return secureJson({ error: "Private image token required." }, 403, { "Cache-Control": "private, no-store" });
        }
        return baseWorker.fetch(request, env, ctx);
      }

      return baseWorker.fetch(request, env, ctx);
    } catch (error) {
      console.error("security-wrapper", error);
      return secureJson({ error: "Security layer error." }, 500, { "Cache-Control": "no-store" });
    }
  },
};

async function ensureSecuritySchema(db) {
  if (securitySchemaReady) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS preview_tokens (
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      revoked_at TEXT,
      PRIMARY KEY (resource_type, resource_id)
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id TEXT NOT NULL,
      actor_email TEXT NOT NULL DEFAULT '',
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity(created_at DESC)"),
  ]);
  securitySchemaReady = true;
}

async function attachPreviewToken(response, env, resourceType, request) {
  if (!response.ok) return response;
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) return response;

  let payload;
  try { payload = await response.clone().json(); }
  catch { return response; }

  const id = String(payload?.request?.id || "");
  if (!/^[a-f0-9-]{20,}$/i.test(id)) return response;

  const token = randomToken(32);
  const tokenHash = await sha256(token);
  await env.DB.prepare(
    "INSERT INTO preview_tokens (resource_type, resource_id, token_hash, created_at, revoked_at) VALUES (?, ?, ?, datetime('now'), NULL) " +
    "ON CONFLICT(resource_type, resource_id) DO UPDATE SET token_hash = excluded.token_hash, created_at = datetime('now'), revoked_at = NULL"
  ).bind(resourceType, id, tokenHash).run();

  payload.request.previewToken = token;
  payload.request.previewProtected = true;
  if (resourceType === "quicksite") {
    payload.request.previewUrl = `${new URL(request.url).origin}/api/quicksite/projects/${id}?token=${encodeURIComponent(token)}`;
  }

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  if (new URL(request.url).origin === request.headers.get("Origin") || !request.headers.get("Origin")) {
    headers.append("Set-Cookie", previewCookie(resourceType, id, token));
  }
  headers.delete("Content-Length");
  return new Response(JSON.stringify(payload), { status: response.status, statusText: response.statusText, headers });
}

async function authorizePreview(request, db, resourceType, resourceId) {
  const row = await db.prepare(
    "SELECT token_hash FROM preview_tokens WHERE resource_type = ? AND resource_id = ? AND revoked_at IS NULL LIMIT 1"
  ).bind(resourceType, resourceId).first();

  // Migration compatibility: projects created before this security layer have no token row.
  if (!row?.token_hash) return true;
  return verifyPreviewCredential(request, resourceType, resourceId, row.token_hash);
}

async function verifyPreviewCredential(request, resourceType, resourceId, expectedHash) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") || request.headers.get("X-Preview-Token") || "";
  if (!token) {
    const cookie = parseCookies(request.headers.get("Cookie") || "")[PREVIEW_COOKIE] || "";
    const parts = cookie.split(".");
    if (parts.length === 3 && parts[0] === resourceType && parts[1] === resourceId) token = parts[2];
  }
  if (!token || token.length < 30 || token.length > 200) return false;
  return safeEqual(await sha256(token), String(expectedHash));
}

async function teamLogin(request, env) {
  if (!sameOrigin(request)) return secureJson({ error: "Invalid request origin." }, 403);
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (env.LOGIN_RATE_LIMITER) {
    const limit = await env.LOGIN_RATE_LIMITER.limit({ key: `team-login:${ip}` });
    if (!limit.success) return secureJson({ error: "Too many sign-in attempts. Try again in one minute." }, 429, { "Retry-After": "60" });
  }

  const body = await readJson(request, USER_BODY_BYTES);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const password = String(body.password || "");
  if (!email || !password) return secureJson({ error: "Email and password are required." }, 400);

  const user = await env.DB.prepare(
    "SELECT id, email, display_name, role, password_hash, password_salt, active FROM admin_users WHERE email = ? LIMIT 1"
  ).bind(email).first();
  if (!user || !user.active || !TEAM_ROLES.has(user.role)) return secureJson({ error: "Incorrect email or password." }, 401);

  const valid = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) return secureJson({ error: "Incorrect email or password." }, 401);

  await env.DB.prepare("UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();
  await logActivity(env.DB, { id: user.id, email: user.email, role: user.role }, "LOGIN", "/api/security/team-login");

  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  headers.append("Set-Cookie", await makeBaseAdminCookie(env.ADMIN_PASSWORD));
  headers.append("Set-Cookie", await makeRoleCookie(user.id, user.role, env.ADMIN_PASSWORD, SESSION_SECONDS, user.email));
  return new Response(JSON.stringify({ ok: true, user: { id: user.id, email: user.email, name: user.display_name, role: user.role } }), { status: 200, headers });
}

async function handleAdminUsers(request, env, url) {
  const actor = await resolveActor(request, env);
  if (!actor) return secureJson({ error: "Unauthorized." }, 401);
  if (actor.role !== "owner") return secureJson({ error: "Only the owner can manage team accounts." }, 403);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !sameOrigin(request)) {
    return secureJson({ error: "Invalid request origin." }, 403);
  }

  const match = url.pathname.match(/^\/api\/security\/admin-users(?:\/([a-f0-9-]+))?$/i);
  if (!match) return secureJson({ error: "Not found." }, 404);
  const id = match[1] || null;

  if (request.method === "GET" && !id) {
    const rows = await env.DB.prepare(
      "SELECT id, email, display_name, role, active, created_at, updated_at, last_login_at FROM admin_users ORDER BY created_at DESC"
    ).all();
    return secureJson({ users: rows.results || [] }, 200, { "Cache-Control": "no-store" });
  }

  if (request.method === "POST" && !id) {
    const body = await readJson(request, USER_BODY_BYTES);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
    const displayName = String(body.displayName || "").trim().slice(0, 100);
    const role = String(body.role || "");
    const password = String(body.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return secureJson({ error: "Enter a valid email." }, 400);
    if (!TEAM_ROLES.has(role)) return secureJson({ error: "Invalid role." }, 400);
    if (!strongPassword(password)) return secureJson({ error: "Password must be at least 12 characters and include upper/lowercase, a number and a symbol." }, 400);

    const salt = randomToken(18);
    const passwordHash = await hashPassword(password, salt);
    const userId = crypto.randomUUID();
    try {
      await env.DB.prepare(
        "INSERT INTO admin_users (id, email, display_name, role, password_hash, password_salt, active) VALUES (?, ?, ?, ?, ?, ?, 1)"
      ).bind(userId, email, displayName, role, passwordHash, salt).run();
    } catch (error) {
      if (String(error).toLowerCase().includes("unique")) return secureJson({ error: "That email already has an account." }, 409);
      throw error;
    }
    await logActivity(env.DB, actor, "CREATE_USER", `/api/security/admin-users/${userId}`);
    return secureJson({ ok: true, user: { id: userId, email, displayName, role, active: 1 } }, 201);
  }

  if (request.method === "PATCH" && id) {
    const body = await readJson(request, USER_BODY_BYTES);
    const current = await env.DB.prepare("SELECT id, email, display_name, role, active FROM admin_users WHERE id = ? LIMIT 1").bind(id).first();
    if (!current) return secureJson({ error: "User not found." }, 404);

    const role = body.role === undefined ? current.role : String(body.role);
    const active = body.active === undefined ? Number(current.active) : (body.active ? 1 : 0);
    const displayName = body.displayName === undefined ? current.display_name : String(body.displayName || "").trim().slice(0, 100);
    if (!TEAM_ROLES.has(role)) return secureJson({ error: "Invalid role." }, 400);

    if (body.password !== undefined) {
      const password = String(body.password || "");
      if (!strongPassword(password)) return secureJson({ error: "New password does not meet the security requirements." }, 400);
      const salt = randomToken(18);
      const passwordHash = await hashPassword(password, salt);
      await env.DB.prepare(
        "UPDATE admin_users SET display_name = ?, role = ?, active = ?, password_hash = ?, password_salt = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(displayName, role, active, passwordHash, salt, id).run();
    } else {
      await env.DB.prepare(
        "UPDATE admin_users SET display_name = ?, role = ?, active = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(displayName, role, active, id).run();
    }
    await logActivity(env.DB, actor, "UPDATE_USER", `/api/security/admin-users/${id}`);
    return secureJson({ ok: true }, 200);
  }

  return secureJson({ error: "Method not allowed." }, 405);
}

async function handleActivity(request, env) {
  const actor = await resolveActor(request, env);
  if (!actor) return secureJson({ error: "Unauthorized." }, 401);
  if (!new Set(["owner", "admin"]).has(actor.role)) return secureJson({ error: "Forbidden." }, 403);
  const rows = await env.DB.prepare(
    "SELECT id, actor_id, actor_email, actor_role, action, path, created_at FROM admin_activity ORDER BY id DESC LIMIT 200"
  ).all();
  return secureJson({ activity: rows.results || [] }, 200, { "Cache-Control": "no-store" });
}

async function resolveActor(request, env) {
  if (!env.ADMIN_PASSWORD) return null;
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const roleToken = cookies[ROLE_COOKIE];
  if (roleToken) {
    const actor = await verifyRoleCookie(roleToken, env.ADMIN_PASSWORD);
    if (actor) {
      if (actor.role === "owner") return actor;
      const user = await env.DB.prepare("SELECT id, email, role, active FROM admin_users WHERE id = ? LIMIT 1").bind(actor.id).first();
      if (user && user.active && user.role === actor.role) return { id: user.id, email: user.email, role: user.role };
      return null;
    }
  }

  // Existing owner sessions remain valid after this upgrade.
  if (await isBaseAdminAuthenticated(request, env.ADMIN_PASSWORD)) return { id: "owner", email: "", role: "owner" };
  return null;
}

function canAccess(role, method, path) {
  if (role === "owner") return true;
  const write = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (role === "admin") {
    if (path.startsWith("/api/admin/settings")) return !write;
    return true;
  }

  if (role === "designer") {
    return /^\/api\/admin\/(quicksite|auramenu|nfc)(\/|$)/.test(path) && ["GET", "PATCH"].includes(method);
  }

  if (role === "sales") {
    if (path === "/api/admin/overview") return method === "GET";
    if (/^\/api\/admin\/(clients|orders)(\/|$)/.test(path)) return true;
    if (/^\/api\/admin\/(quicksite|auramenu|nfc)(\/|$)/.test(path)) return method === "GET";
    return false;
  }

  if (role === "accountant") {
    if (path === "/api/admin/overview") return method === "GET";
    return /^\/api\/admin\/(orders|invoices|subscriptions|expenses)(\/|$)/.test(path);
  }

  return false;
}

async function logActivity(db, actor, action, path) {
  try {
    await db.prepare(
      "INSERT INTO admin_activity (actor_id, actor_email, actor_role, action, path) VALUES (?, ?, ?, ?, ?)"
    ).bind(String(actor.id || ""), String(actor.email || ""), String(actor.role || ""), String(action), String(path).slice(0, 500)).run();
  } catch (error) {
    console.error("activity-log", error);
  }
}

async function makeBaseAdminCookie(secret) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = await sign(String(expires), secret);
  return `${ADMIN_COOKIE}=${expires}.${signature}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

async function makeRoleCookie(id, role, secret, maxAge, email = "") {
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, "");
  const safeRole = String(role).replace(/[^a-z]/g, "");
  const emailHash = email ? (await sha256(email)).slice(0, 16) : "none";
  const message = `${expires}|${safeId}|${safeRole}|${emailHash}`;
  const signature = await sign(message, secret);
  return `${ROLE_COOKIE}=${expires}.${safeId}.${safeRole}.${emailHash}.${signature}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

async function verifyRoleCookie(token, secret) {
  const parts = String(token).split(".");
  if (parts.length !== 5) return null;
  const [expiresText, id, role, emailHash, signature] = parts;
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  if (!(role === "owner" || TEAM_ROLES.has(role))) return null;
  const expected = await sign(`${expiresText}|${id}|${role}|${emailHash}`, secret);
  if (!(await safeEqual(signature, expected))) return null;
  return { id, role };
}

async function isBaseAdminAuthenticated(request, secret) {
  const token = parseCookies(request.headers.get("Cookie") || "")[ADMIN_COOKIE];
  if (!token) return false;
  const split = token.lastIndexOf(".");
  if (split < 1) return false;
  const expiresText = token.slice(0, split);
  const signature = token.slice(split + 1);
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, await sign(expiresText, secret));
}

function previewCookie(resourceType, resourceId, token) {
  return `${PREVIEW_COOKIE}=${resourceType}.${resourceId}.${token}; Path=/; Max-Age=${PREVIEW_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

function clearCookie(name) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

function strongPassword(value) {
  const password = String(value || "");
  return password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    hash: "SHA-256",
    salt: new TextEncoder().encode(salt),
    iterations: PBKDF2_ITERATIONS,
  }, key, 256);
  return base64url(new Uint8Array(bits));
}

async function verifyPassword(password, salt, expected) {
  return safeEqual(await hashPassword(password, salt), String(expected));
}

async function sign(message, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64url(new Uint8Array(signature));
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value)));
  return base64url(new Uint8Array(digest));
}

async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(a))),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(b))),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function randomToken(bytes) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64url(data);
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parseCookies(header) {
  const result = {};
  for (const item of String(header).split(";")) {
    const index = item.indexOf("=");
    if (index < 0) continue;
    result[item.slice(0, index).trim()] = item.slice(index + 1).trim();
  }
  return result;
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}

async function readJson(request, maxBytes) {
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new Error("Request body is too large.");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new Error("Request body is too large.");
  if (!text.trim()) return {};
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("JSON object required.");
  return body;
}

function secureJson(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      ...extraHeaders,
    },
  });
}
