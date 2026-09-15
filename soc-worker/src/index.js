import {
  createSession,
  getAuthenticatedAdmin,
  normalizeUsername,
  revokeSession,
  sameOrigin,
  sessionCookie,
  verifyPassword,
} from "../../src/security.js";

const MAX_BODY = 4096;

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

async function readJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY) throw new Error("Request body too large");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY) throw new Error("Request body too large");
  return text ? JSON.parse(text) : {};
}

async function owner(request, env) {
  const admin = await getAuthenticatedAdmin(request, env.DB);
  return admin?.role === "owner" ? admin : null;
}

function hardened(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function login(request, env) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const body = await readJson(request);
  const username = normalizeUsername(body.username || "owner");
  const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
  const limit = await env.SOC_LOGIN_RATE_LIMITER.limit({ key: `soc:${clientKey}:${username || "invalid"}` });
  if (!limit.success) return json({ error: "Too many sign-in attempts. Try again shortly." }, 429, { "Retry-After": "60" });

  const user = username
    ? await env.DB.prepare("SELECT id, username, display_name, password_hash, role, active FROM admin_users WHERE username = ? COLLATE NOCASE LIMIT 1").bind(username).first()
    : null;
  if (!user || !user.active || user.role !== "owner" || !(await verifyPassword(String(body.password || ""), user.password_hash))) {
    return json({ error: "Incorrect username or password." }, 401);
  }
  const token = await createSession(env.DB, user.id);
  return json(
    { user: { username: user.username, displayName: user.display_name, role: user.role } },
    200,
    { "Set-Cookie": sessionCookie(token) },
  );
}

async function dashboard(env) {
  const [security, audit, states] = await Promise.all([
    env.DB.prepare(
      "SELECT id, service, event, area, method, status, request_id AS requestId, created_at AS createdAt " +
      "FROM security_events WHERE created_at >= datetime('now','-7 day') ORDER BY created_at DESC LIMIT 1000"
    ).all(),
    env.DB.prepare(
      "SELECT id, username_snapshot AS username, action, resource, target_id AS targetId, request_id AS requestId, created_at AS createdAt " +
      "FROM admin_audit_log WHERE created_at >= datetime('now','-7 day') ORDER BY created_at DESC LIMIT 500"
    ).all(),
    env.DB.prepare(
      "SELECT event_id AS eventId, source, status, note, updated_by AS updatedBy, updated_at AS updatedAt FROM soc_alert_state ORDER BY updated_at DESC LIMIT 1000"
    ).all(),
  ]);

  return {
    securityEvents: security.results || [],
    auditEvents: audit.results || [],
    alertStates: states.results || [],
    sources: [
      { id: "security", name: "Cloudflare Security Events", status: "online", type: "Real-time", detail: "401/403/429, errors and protected mutations" },
      { id: "audit", name: "AuraDigital Admin Audit", status: "online", type: "Audit", detail: "Privileged administration activity" },
      { id: "wazuh", name: "Wazuh Endpoint Telemetry", status: "planned", type: "Endpoint", detail: "Ready when a Linux Wazuh host is attached" },
    ],
    rules: [
      { id: "AUTH-001", name: "Repeated authentication failure", severity: "critical", mitre: "T1110 Brute Force" },
      { id: "ACCESS-001", name: "Repeated access denial", severity: "high", mitre: "T1078 Valid Accounts" },
      { id: "ERROR-001", name: "Application server error", severity: "high", mitre: "Service health" },
      { id: "ADMIN-001", name: "Sensitive administrative change", severity: "medium", mitre: "T1098 Account Manipulation" },
      { id: "RATE-001", name: "Rate limit triggered", severity: "high", mitre: "T1499 Endpoint DoS" },
    ],
  };
}

async function updateAlert(request, env, admin, url) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const match = url.pathname.match(/^\/api\/alerts\/(security|audit)\/([A-Za-z0-9_-]+)$/);
  if (!match) return json({ error: "Invalid alert." }, 400);
  const body = await readJson(request);
  const status = String(body.status || "");
  if (!new Set(["open", "acknowledged", "resolved"]).has(status)) return json({ error: "Invalid alert status." }, 400);
  const note = String(body.note || "").slice(0, 500);
  await env.DB.prepare(
    "INSERT INTO soc_alert_state (event_id, source, status, note, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now')) " +
    "ON CONFLICT(event_id) DO UPDATE SET source=excluded.source,status=excluded.status,note=excluded.note,updated_by=excluded.updated_by,updated_at=datetime('now')"
  ).bind(match[2], match[1], status, note, admin.username).run();
  return json({ ok: true, status });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204 });

    if (url.pathname === "/api/login" && request.method === "POST") return login(request, env);
    if (url.pathname === "/api/session" && request.method === "GET") {
      const admin = await owner(request, env);
      return admin ? json({ user: admin }) : json({ error: "Owner authentication required." }, 401);
    }
    if (url.pathname === "/api/logout" && request.method === "POST") {
      if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
      await revokeSession(request, env.DB);
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
    }

    if (url.pathname.startsWith("/api/")) {
      const admin = await owner(request, env);
      if (!admin) return json({ error: "Owner authentication required." }, 401);
      if (url.pathname === "/api/dashboard" && request.method === "GET") return json(await dashboard(env));
      if (url.pathname.startsWith("/api/alerts/") && request.method === "PATCH") return updateAlert(request, env, admin, url);
      return json({ error: "Not found." }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

export default {
  async fetch(request, env, ctx) {
    try {
      return hardened(await worker.fetch(request, env, ctx));
    } catch (error) {
      console.error("SOC request failed", error instanceof Error ? error.message : "unknown");
      return hardened(json({ error: "SOC service error." }, 500));
    }
  },
};
