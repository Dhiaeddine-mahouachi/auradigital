import { ApiError, json, readJson } from "./http.js";
import {
  getAuthenticatedAdmin,
  hashPassword,
  sameOrigin,
  verifyPassword,
} from "./security.js";

const PORTAL_SLUG = "qusai";
const PORTAL_NAME = "Qusai";
const COOKIE_NAME = "__Host-aura_employee";
const SESSION_SECONDS = 60 * 60 * 8;
const LOGIN_BODY_BYTES = 2 * 1024;
const CLIENT_BODY_BYTES = 12 * 1024;
const CLIENT_STATUSES = new Set(["lead", "contacted", "active", "waiting", "completed"]);
const encoder = new TextEncoder();

export async function serveEmployeePortal(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== "/qusai" && url.pathname !== "/qusai/") return null;
  if (!new Set(["GET", "HEAD"]).has(request.method)) {
    return new Response("Method not allowed.", {
      status: 405,
      headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" },
    });
  }
  if (!env.ASSETS) return new Response("Portal unavailable.", { status: 503 });

  const assetUrl = new URL("/qusai/index.html", request.url);
  const assetResponse = await env.ASSETS.fetch(new Request(assetUrl, {
    method: request.method,
    headers: request.headers,
  }));
  const headers = new Headers(assetResponse.headers);
  headers.set("Cache-Control", "no-store, private");
  headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

export async function handleEmployeePortalApi(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/employee/")) return null;

  if (url.pathname === "/api/employee/portal" && request.method === "GET") {
    const employee = await findEmployeeByPortal(env.DB, PORTAL_SLUG);
    return json({ configured: Boolean(employee), portal: PORTAL_SLUG, displayName: PORTAL_NAME });
  }

  if (url.pathname === "/api/employee/bootstrap" && request.method === "POST") {
    requireSameOrigin(request);
    if (!(await loginAllowed(env, request, "bootstrap"))) return rateLimitResponse();
    const existing = await findEmployeeByPortal(env.DB, PORTAL_SLUG);
    if (existing) return json({ error: "This employee portal is already configured." }, 409);

    const owner = await getAuthenticatedAdmin(request, env.DB);
    if (!owner || owner.role !== "owner") {
      return json({ error: "Sign in to the main dashboard as the owner before setting the employee password." }, 403);
    }

    const body = await readJson(request, LOGIN_BODY_BYTES);
    const password = validateEmployeePassword(body.password);
    const employeeId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    await env.DB.prepare(
      "INSERT INTO employee_users (id, portal_slug, display_name, password_hash, active) VALUES (?, ?, ?, ?, 1)"
    ).bind(employeeId, PORTAL_SLUG, PORTAL_NAME, passwordHash).run();
    await employeeAudit(env.DB, employeeId, owner.username, "portal_created", employeeId, request);
    return json({ configured: true, portal: PORTAL_SLUG, displayName: PORTAL_NAME }, 201);
  }

  if (url.pathname === "/api/employee/login" && request.method === "POST") {
    requireSameOrigin(request);
    if (!(await loginAllowed(env, request, "login"))) return rateLimitResponse();
    const body = await readJson(request, LOGIN_BODY_BYTES);
    const employee = await findEmployeeByPortal(env.DB, PORTAL_SLUG);
    if (!employee) {
      return json({ error: "This employee portal has not been configured by the owner yet.", code: "not_configured" }, 503);
    }
    if (!employee.active || !(await verifyPassword(String(body.password || ""), employee.password_hash))) {
      await employeeAudit(env.DB, employee.id, PORTAL_SLUG, "login_failed", employee.id, request);
      return json({ error: "Incorrect password." }, 401);
    }

    await env.DB.batch([
      env.DB.prepare("UPDATE employee_users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").bind(employee.id),
      env.DB.prepare("DELETE FROM employee_sessions WHERE expires_at <= datetime('now')"),
    ]);
    const token = await createEmployeeSession(env.DB, employee.id);
    await employeeAudit(env.DB, employee.id, PORTAL_SLUG, "login_succeeded", employee.id, request);
    return json({ authenticated: true, user: publicEmployee(employee) }, 200, {
      "Set-Cookie": employeeSessionCookie(token),
    });
  }

  if (url.pathname === "/api/employee/session" && request.method === "GET") {
    const [employee, configured] = await Promise.all([
      getAuthenticatedEmployee(request, env.DB),
      findEmployeeByPortal(env.DB, PORTAL_SLUG),
    ]);
    return json({
      authenticated: Boolean(employee),
      configured: Boolean(configured),
      user: employee ? publicEmployee(employee) : null,
      portal: PORTAL_SLUG,
    });
  }

  if (url.pathname === "/api/employee/logout" && request.method === "POST") {
    requireSameOrigin(request);
    const employee = await getAuthenticatedEmployee(request, env.DB);
    await revokeEmployeeSession(request, env.DB);
    if (employee) await employeeAudit(env.DB, employee.id, employee.portal_slug, "logout", employee.id, request);
    return json({ authenticated: false }, 200, {
      "Set-Cookie": employeeSessionCookie("", 0),
    });
  }

  const employee = await getAuthenticatedEmployee(request, env.DB);
  if (!employee) return json({ error: "Unauthorized." }, 401);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) requireSameOrigin(request);

  const clientMatch = url.pathname.match(/^\/api\/employee\/clients(?:\/([a-f0-9-]+))?$/i);
  if (!clientMatch) return json({ error: "Not found." }, 404);
  const clientId = clientMatch[1] || null;

  if (request.method === "GET" && !clientId) {
    return listEmployeeClients(env.DB, employee.id);
  }

  if (request.method === "GET" && clientId) {
    const row = await findEmployeeClient(env.DB, employee.id, clientId);
    return row ? json({ client: mapClient(row) }) : json({ error: "Customer not found." }, 404);
  }

  if (request.method === "POST" && !clientId) {
    const body = await readJson(request, CLIENT_BODY_BYTES);
    const client = normalizeEmployeeClient(body);
    const id = crypto.randomUUID();
    const mainResult = await env.DB.prepare(
      "INSERT INTO clients (name, company, email, phone, service, status, renewal_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      client.name || client.company,
      client.company,
      client.email,
      client.phone || client.whatsapp,
      client.service,
      mainDashboardStatus(client.status),
      client.nextFollowUp,
      mainDashboardNotes(client),
    ).run();
    const mainClientId = Number(mainResult.meta?.last_row_id || 0);
    if (!Number.isInteger(mainClientId) || mainClientId <= 0) {
      throw new ApiError(500, "The customer could not be connected to the main dashboard.");
    }
    try {
      await env.DB.prepare(
        "INSERT INTO employee_clients (id, employee_user_id, main_client_id, name, company, phone, whatsapp, email, service, status, last_contact, next_follow_up, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        id,
        employee.id,
        mainClientId,
        client.name,
        client.company,
        client.phone,
        client.whatsapp,
        client.email,
        client.service,
        client.status,
        client.lastContact,
        client.nextFollowUp,
        client.notes,
      ).run();
    } catch (error) {
      await env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(mainClientId).run();
      throw error;
    }
    await employeeAudit(env.DB, employee.id, employee.portal_slug, "client_created", id, request);
    await mainDashboardAudit(env.DB, employee.portal_slug, "create", mainClientId, request);
    return json({ client: mapClient(await findEmployeeClient(env.DB, employee.id, id)) }, 201);
  }

  if (request.method === "PATCH" && clientId) {
    const current = await findEmployeeClient(env.DB, employee.id, clientId);
    if (!current) return json({ error: "Customer not found." }, 404);
    const body = await readJson(request, CLIENT_BODY_BYTES);
    const client = normalizeEmployeeClient(body, current);
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE employee_clients SET name = ?, company = ?, phone = ?, whatsapp = ?, email = ?, service = ?, status = ?, last_contact = ?, next_follow_up = ?, notes = ?, updated_at = datetime('now') WHERE id = ? AND employee_user_id = ?"
      ).bind(
        client.name,
        client.company,
        client.phone,
        client.whatsapp,
        client.email,
        client.service,
        client.status,
        client.lastContact,
        client.nextFollowUp,
        client.notes,
        clientId,
        employee.id,
      ),
      env.DB.prepare(
        "UPDATE clients SET name = ?, company = ?, email = ?, phone = ?, service = ?, status = ?, renewal_date = ?, notes = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(
        client.name || client.company,
        client.company,
        client.email,
        client.phone || client.whatsapp,
        client.service,
        mainDashboardStatus(client.status),
        client.nextFollowUp,
        mainDashboardNotes(client),
        current.main_client_id,
      ),
    ]);
    await employeeAudit(env.DB, employee.id, employee.portal_slug, "client_updated", clientId, request);
    await mainDashboardAudit(env.DB, employee.portal_slug, "update", current.main_client_id, request);
    return json({ client: mapClient(await findEmployeeClient(env.DB, employee.id, clientId)) });
  }

  if (request.method === "DELETE" && clientId) {
    const current = await findEmployeeClient(env.DB, employee.id, clientId);
    if (!current) return json({ error: "Customer not found." }, 404);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM employee_clients WHERE id = ? AND employee_user_id = ?").bind(clientId, employee.id),
      env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(current.main_client_id),
    ]);
    await employeeAudit(env.DB, employee.id, employee.portal_slug, "client_deleted", clientId, request);
    await mainDashboardAudit(env.DB, employee.portal_slug, "delete", current.main_client_id, request);
    return json({ ok: true, id: clientId });
  }

  return json({ error: "Method not allowed." }, 405, { Allow: "GET, POST, PATCH, DELETE" });
}

export function normalizeEmployeeClient(body, current = null) {
  const source = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const read = (camel, snake, max) => Object.prototype.hasOwnProperty.call(source, camel)
    ? clean(source[camel], max)
    : clean(current?.[snake], max);
  const name = read("name", "name", 100);
  const company = read("company", "company", 120);
  if (!name && !company) throw new ApiError(400, "Enter a customer name or company name.");

  const email = read("email", "email", 160).toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Enter a valid email address.");
  }
  const requestedStatus = Object.prototype.hasOwnProperty.call(source, "status")
    ? String(source.status || "")
    : String(current?.status || "lead");
  if (!CLIENT_STATUSES.has(requestedStatus)) throw new ApiError(400, "Select a valid customer status.");

  return {
    name,
    company,
    phone: read("phone", "phone", 40),
    whatsapp: read("whatsapp", "whatsapp", 40),
    email,
    service: read("service", "service", 160),
    status: requestedStatus,
    lastContact: readDate(source, "lastContact", current?.last_contact),
    nextFollowUp: readDate(source, "nextFollowUp", current?.next_follow_up),
    notes: read("notes", "notes", 4000),
  };
}

export function employeeSessionCookie(value, maxAge = SESSION_SECONDS) {
  const expires = maxAge === 0 ? "; Expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}${expires}; HttpOnly; Secure; SameSite=Strict`;
}

function requireSameOrigin(request) {
  if (!sameOrigin(request)) throw new ApiError(403, "Invalid request origin.");
}

function validateEmployeePassword(value) {
  const password = String(value || "");
  if (password.length < 12 || password.length > 200) {
    throw new ApiError(400, "The employee password must contain between 12 and 200 characters.");
  }
  return password;
}

function clean(value, max) {
  return typeof value === "string"
    ? value.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max)
    : "";
}

function readDate(source, key, fallback) {
  const value = Object.prototype.hasOwnProperty.call(source, key) ? String(source[key] || "").trim() : String(fallback || "").trim();
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new ApiError(400, `Enter a valid ${key === "lastContact" ? "last-contact" : "follow-up"} date.`);
  }
  return value;
}

async function listEmployeeClients(db, employeeId) {
  const [clientsResult, metricsResult] = await db.batch([
    db.prepare(
      "SELECT id, main_client_id, name, company, phone, whatsapp, email, service, status, last_contact, next_follow_up, notes, created_at, updated_at FROM employee_clients WHERE employee_user_id = ? ORDER BY updated_at DESC LIMIT 500"
    ).bind(employeeId),
    db.prepare(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN status = 'lead' THEN 1 ELSE 0 END) AS leads, SUM(CASE WHEN next_follow_up IS NOT NULL AND next_follow_up <= date('now','+7 day') AND status <> 'completed' THEN 1 ELSE 0 END) AS follow_ups FROM employee_clients WHERE employee_user_id = ?"
    ).bind(employeeId),
  ]);
  const metric = metricsResult.results?.[0] || {};
  return json({
    clients: (clientsResult.results || []).map(mapClient),
    metrics: {
      total: Number(metric.total || 0),
      active: Number(metric.active || 0),
      leads: Number(metric.leads || 0),
      followUps: Number(metric.follow_ups || 0),
    },
  });
}

async function findEmployeeClient(db, employeeId, clientId) {
  return db.prepare(
    "SELECT id, main_client_id, name, company, phone, whatsapp, email, service, status, last_contact, next_follow_up, notes, created_at, updated_at FROM employee_clients WHERE id = ? AND employee_user_id = ? LIMIT 1"
  ).bind(clientId, employeeId).first();
}

function mapClient(row) {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    service: row.service,
    status: row.status,
    lastContact: row.last_contact,
    nextFollowUp: row.next_follow_up,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findEmployeeByPortal(db, portalSlug) {
  return db.prepare(
    "SELECT id, portal_slug, display_name, password_hash, active, created_at, updated_at, last_login_at FROM employee_users WHERE portal_slug = ? COLLATE NOCASE LIMIT 1"
  ).bind(portalSlug).first();
}

async function createEmployeeSession(db, employeeId) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = base64url(bytes);
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString().slice(0, 19).replace("T", " ");
  await db.prepare(
    "INSERT INTO employee_sessions (id, employee_user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), employeeId, tokenHash, expiresAt).run();
  return token;
}

async function getAuthenticatedEmployee(request, db) {
  const token = parseCookies(request.headers.get("Cookie") || "")[COOKIE_NAME];
  if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  const tokenHash = await hashToken(token);
  return db.prepare(
    "SELECT u.id, u.portal_slug, u.display_name, u.active, u.created_at, u.updated_at, u.last_login_at FROM employee_sessions s JOIN employee_users u ON u.id = s.employee_user_id WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1 AND u.portal_slug = ? COLLATE NOCASE LIMIT 1"
  ).bind(tokenHash, PORTAL_SLUG).first();
}

async function revokeEmployeeSession(request, db) {
  const token = parseCookies(request.headers.get("Cookie") || "")[COOKIE_NAME];
  if (!token) return;
  await db.prepare("DELETE FROM employee_sessions WHERE token_hash = ?").bind(await hashToken(token)).run();
}

function publicEmployee(row) {
  return {
    id: row.id,
    portal: row.portal_slug,
    displayName: row.display_name,
    lastLoginAt: row.last_login_at,
  };
}

async function employeeAudit(db, employeeId, actor, action, targetId, request) {
  await db.prepare(
    "INSERT INTO employee_audit_log (id, employee_user_id, actor_snapshot, action, target_id, request_id) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    employeeId || null,
    String(actor || "unknown").slice(0, 64),
    String(action || "unknown").slice(0, 64),
    String(targetId || "").slice(0, 128),
    String(request.headers.get("CF-Ray") || "").slice(0, 80),
  ).run();
}

async function mainDashboardAudit(db, portal, action, targetId, request) {
  await db.prepare(
    "INSERT INTO admin_audit_log (id, admin_user_id, username_snapshot, action, resource, target_id, request_id) VALUES (?, NULL, ?, ?, 'clients', ?, ?)"
  ).bind(
    crypto.randomUUID(),
    `employee:${String(portal || "unknown").slice(0, 48)}`,
    String(action || "unknown").slice(0, 64),
    String(targetId || "").slice(0, 128),
    String(request.headers.get("CF-Ray") || "").slice(0, 80),
  ).run();
}

function mainDashboardStatus(status) {
  return ({ lead: "lead", contacted: "lead", active: "active", waiting: "paused", completed: "closed" })[status] || "lead";
}

function mainDashboardNotes(client) {
  const details = [
    `Registered by ${PORTAL_NAME}`,
    `Employee status: ${client.status}`,
    client.whatsapp ? `WhatsApp: ${client.whatsapp}` : "",
    client.lastContact ? `Last contact: ${client.lastContact}` : "",
    client.notes ? `\n${client.notes}` : "",
  ].filter(Boolean);
  return details.join("\n").slice(0, 4000);
}

async function loginAllowed(env, request, action) {
  if (!env.LOGIN_RATE_LIMITER?.limit) return true;
  const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
  const result = await env.LOGIN_RATE_LIMITER.limit({ key: `employee-${action}:${PORTAL_SLUG}:${clientKey}` });
  return Boolean(result.success);
}

function rateLimitResponse() {
  return json({ error: "Too many attempts. Try again in one minute." }, 429, { "Retry-After": "60" });
}

async function hashToken(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return base64url(new Uint8Array(digest));
}

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parseCookies(header) {
  const cookies = {};
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    cookies[part.slice(0, separator).trim()] = part.slice(separator + 1).trim();
  }
  return cookies;
}
