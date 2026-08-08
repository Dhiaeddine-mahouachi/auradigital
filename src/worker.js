const COOKIE_NAME = "aura_admin";
const SESSION_SECONDS = 60 * 60 * 8;
const ALLOWED_SETTINGS = new Set(["nfc_price"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    try {
      await ensureSchema(env.DB);

      if (url.pathname === "/api/settings" && request.method === "GET") {
        const rows = await env.DB.prepare(
          "SELECT key, value FROM settings WHERE key IN ('nfc_price')"
        ).all();
        return json(Object.fromEntries((rows.results || []).map((row) => [row.key, row.value])), 200, {
          "Cache-Control": "public, max-age=30"
        });
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        if (!env.ADMIN_PASSWORD) {
          return json({ error: "Admin password is not configured yet." }, 503);
        }

        const body = await request.json().catch(() => ({}));
        const valid = await safeEqual(String(body.password || ""), env.ADMIN_PASSWORD);
        if (!valid) return json({ error: "Incorrect password." }, 401);

        const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
        const signature = await sign(String(expires), env.ADMIN_PASSWORD);
        return json({ ok: true }, 200, {
          "Set-Cookie": cookieValue(expires + "." + signature, SESSION_SECONDS)
        });
      }

      if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        return json({ ok: true }, 200, {
          "Set-Cookie": cookieValue("", 0)
        });
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        return json({ authenticated: await isAuthenticated(request, env) }, 200, {
          "Cache-Control": "no-store"
        });
      }

      if (!(await isAuthenticated(request, env))) {
        return json({ error: "Unauthorized." }, 401, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/admin/settings" && request.method === "GET") {
        const rows = await env.DB.prepare(
          "SELECT key, value, updated_at FROM settings ORDER BY key"
        ).all();
        return json({ settings: rows.results || [] }, 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname.startsWith("/api/admin/settings/") && request.method === "PUT") {
        const key = decodeURIComponent(url.pathname.slice("/api/admin/settings/".length));
        if (!ALLOWED_SETTINGS.has(key)) return json({ error: "Unknown setting." }, 404);

        const body = await request.json().catch(() => ({}));
        const value = String(body.value || "").trim();

        if (key === "nfc_price") {
          const amount = Number(value);
          if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
            return json({ error: "Enter a valid price." }, 400);
          }
        }

        await env.DB.prepare(
          "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) " +
          "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
        ).bind(key, value).run();

        return json({ ok: true, key, value }, 200, { "Cache-Control": "no-store" });
      }

      return json({ error: "Not found." }, 404);
    } catch (error) {
      console.error("AuraDigital API error", error);
      return json({ error: "Server error." }, 500);
    }
  }
};

async function ensureSchema(db) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS settings (" +
    "key TEXT PRIMARY KEY, " +
    "value TEXT NOT NULL, " +
    "updated_at TEXT NOT NULL DEFAULT (datetime('now'))" +
    ")"
  ).run();

  await db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('nfc_price', '700')"
  ).run();
}

async function isAuthenticated(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return false;

  const split = token.lastIndexOf(".");
  if (split < 1) return false;

  const expiresText = token.slice(0, split);
  const signature = token.slice(split + 1);
  const expires = Number(expiresText);

  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(expiresText, env.ADMIN_PASSWORD);
  return safeEqual(signature, expected);
}

async function sign(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
  return base64url(bytes);
}

async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(a)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(b))
  ]);
  const aa = new Uint8Array(ha);
  const bb = new Uint8Array(hb);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < Math.min(aa.length, bb.length); i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
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

function cookieValue(value, maxAge) {
  return COOKIE_NAME + "=" + value +
    "; Path=/; Max-Age=" + maxAge +
    "; HttpOnly; Secure; SameSite=Strict";
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}
