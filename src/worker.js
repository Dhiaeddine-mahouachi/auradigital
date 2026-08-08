const COOKIE_NAME = "aura_admin";
const SESSION_SECONDS = 60 * 60 * 8;
const PUBLIC_SETTING_KEYS = [
  "nfc_price",
  "qr_menu_price",
  "web_single_price",
  "web_multi_price",
  "web_dynamic_price",
];

const RESOURCES = {
  packages: {
    table: "packages",
    fields: ["name", "description", "monthly_price", "weekly_price", "features", "featured", "active", "sort_order"],
    json: new Set(["features"]),
    numeric: new Set(["monthly_price", "weekly_price", "featured", "active", "sort_order"]),
    order: "sort_order ASC, id ASC",
  },
  services: {
    table: "services",
    fields: ["icon", "name", "description", "tags", "active", "sort_order"],
    json: new Set(["tags"]),
    numeric: new Set(["active", "sort_order"]),
    order: "sort_order ASC, id ASC",
  },
  portfolio: {
    table: "portfolio",
    fields: ["slug", "title", "type", "description", "image", "url", "tags", "active", "sort_order"],
    json: new Set(["tags"]),
    numeric: new Set(["active", "sort_order"]),
    order: "sort_order ASC, id ASC",
  },
  clients: {
    table: "clients",
    fields: ["name", "company", "email", "phone", "service", "status", "renewal_date", "notes"],
    json: new Set(),
    numeric: new Set(),
    order: "created_at DESC, id DESC",
  },
  orders: {
    table: "orders",
    fields: ["client_id", "type", "quantity", "amount", "status", "due_date", "notes"],
    json: new Set(),
    numeric: new Set(["client_id", "quantity", "amount"]),
    order: "created_at DESC, id DESC",
  },
  invoices: {
    table: "invoices",
    fields: ["client_id", "invoice_number", "amount", "status", "due_date", "notes"],
    json: new Set(),
    numeric: new Set(["client_id", "amount"]),
    order: "created_at DESC, id DESC",
  },
  subscriptions: {
    table: "subscriptions",
    fields: ["client_id", "plan", "amount", "interval", "status", "next_billing_date"],
    json: new Set(),
    numeric: new Set(["client_id", "amount"]),
    order: "created_at DESC, id DESC",
  },
  expenses: {
    table: "expenses",
    fields: ["category", "description", "amount", "date", "notes"],
    json: new Set(),
    numeric: new Set(["amount"]),
    order: "date DESC, id DESC",
  },
};

let schemaPromise;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      await ensureSchema(env.DB);

      if (url.pathname === "/api/settings" && request.method === "GET") {
        return json(await getPublicSettings(env.DB), 200, { "Cache-Control": "public, max-age=30" });
      }

      if (url.pathname === "/api/public-content" && request.method === "GET") {
        const [settings, packages, services, portfolio] = await Promise.all([
          getPublicSettings(env.DB),
          listPublic(env.DB, "packages"),
          listPublic(env.DB, "services"),
          listPublic(env.DB, "portfolio"),
        ]);
        return json({ settings, packages, services, portfolio }, 200, {
          "Cache-Control": "public, max-age=30",
        });
      }

      if (url.pathname === "/api/track" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const path = cleanPath(body.path);
        if (path && !path.startsWith("/admin")) {
          await env.DB.prepare(
            "INSERT INTO analytics_daily (date, path, views) VALUES (date('now'), ?, 1) " +
            "ON CONFLICT(date, path) DO UPDATE SET views = views + 1"
          ).bind(path).run();
        }
        return new Response(null, { status: 204 });
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        if (!env.ADMIN_PASSWORD) return json({ error: "Admin password is not configured yet." }, 503);
        const body = await request.json().catch(() => ({}));
        if (!(await safeEqual(String(body.password || ""), env.ADMIN_PASSWORD))) {
          return json({ error: "Incorrect password." }, 401);
        }
        const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
        const signature = await sign(String(expires), env.ADMIN_PASSWORD);
        return json({ ok: true }, 200, { "Set-Cookie": cookieValue(expires + "." + signature, SESSION_SECONDS) });
      }

      if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        return json({ ok: true }, 200, { "Set-Cookie": cookieValue("", 0) });
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        return json({ authenticated: await isAuthenticated(request, env) }, 200, { "Cache-Control": "no-store" });
      }

      if (!(await isAuthenticated(request, env))) {
        return json({ error: "Unauthorized." }, 401, { "Cache-Control": "no-store" });
      }

      if (["POST", "PUT", "DELETE"].includes(request.method) && !sameOrigin(request)) {
        return json({ error: "Invalid request origin." }, 403);
      }

      if (url.pathname === "/api/admin/overview" && request.method === "GET") {
        return json(await getOverview(env.DB), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/admin/analytics" && request.method === "GET") {
        return json(await getAnalytics(env.DB), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/admin/settings" && request.method === "GET") {
        const rows = await env.DB.prepare("SELECT key, value, updated_at FROM settings ORDER BY key").all();
        return json({ settings: rows.results || [] }, 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname.startsWith("/api/admin/settings/") && request.method === "PUT") {
        const key = decodeURIComponent(url.pathname.slice("/api/admin/settings/".length));
        if (!PUBLIC_SETTING_KEYS.includes(key)) return json({ error: "Unknown setting." }, 404);
        const body = await request.json().catch(() => ({}));
        const value = String(body.value ?? "").trim();
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount < 0 || amount > 10000000) {
          return json({ error: "Enter a valid price." }, 400);
        }
        await env.DB.prepare(
          "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) " +
          "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
        ).bind(key, String(Math.round(amount))).run();
        return json({ ok: true, key, value: String(Math.round(amount)) }, 200, { "Cache-Control": "no-store" });
      }

      const match = url.pathname.match(/^\/api\/admin\/(packages|services|portfolio|clients|orders|invoices|subscriptions|expenses)(?:\/(\d+))?$/);
      if (match) {
        const [, resource, idText] = match;
        return handleResource(request, env.DB, resource, idText ? Number(idText) : null);
      }

      return json({ error: "Not found." }, 404);
    } catch (error) {
      console.error("AuraDigital API error", error);
      return json({ error: "Server error." }, 500);
    }
  },
};

async function ensureSchema(db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', monthly_price INTEGER NOT NULL DEFAULT 0, weekly_price INTEGER NOT NULL DEFAULT 0, features TEXT NOT NULL DEFAULT '[]', featured INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, icon TEXT NOT NULL DEFAULT '✦', name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS portfolio (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, type TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, type TEXT NOT NULL DEFAULT 'NFC', quantity INTEGER NOT NULL DEFAULT 1, amount REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'new', due_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, invoice_number TEXT NOT NULL, amount REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft', due_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, plan TEXT NOT NULL DEFAULT '', amount REAL NOT NULL DEFAULT 0, interval TEXT NOT NULL DEFAULT 'monthly', status TEXT NOT NULL DEFAULT 'active', next_billing_date TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL DEFAULT 'General', description TEXT NOT NULL DEFAULT '', amount REAL NOT NULL DEFAULT 0, date TEXT NOT NULL DEFAULT (date('now')), notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS analytics_daily (date TEXT NOT NULL, path TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (date, path))"),
    ]);

    await db.batch([
      settingSeed(db, "nfc_price", "700"),
      settingSeed(db, "qr_menu_price", "2500"),
      settingSeed(db, "web_single_price", "5000"),
      settingSeed(db, "web_multi_price", "8000"),
      settingSeed(db, "web_dynamic_price", "12000"),
    ]);

    const marker = await db.prepare("SELECT value FROM settings WHERE key = 'dashboard_seed_v2'").first();
    if (!marker) {
      await seedPublicContent(db);
      await db.prepare("INSERT INTO settings (key, value) VALUES ('dashboard_seed_v2', '1')").run();
    }
  })().catch((error) => {
    schemaPromise = null;
    throw error;
  });
  return schemaPromise;
}

function settingSeed(db, key, value) {
  return db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").bind(key, value);
}

async function seedPublicContent(db) {
  const packages = [
    ["Start", "Dijital düzenini kurmak isteyen küçük işletmeler.", 3590, 959, ["Temel sosyal medya yönetimi", "İçerik planı ve düzenleme", "Web küçük güncellemeler", "Temel performans takibi"], 0, 1],
    ["Growth", "Düzenli müşteri kazanımı isteyen işletmeler.", 5590, 1459, ["Sosyal medya + reklam yönetimi", "Kreatif ve içerik desteği", "Aylık performans raporu", "Landing / web desteği", "Kampanya optimizasyonu"], 1, 2],
    ["Pro", "Birden fazla kanalda büyümek isteyen markalar.", 7590, 1959, ["Çok kanallı büyüme yönetimi", "Daha yoğun içerik planı", "SEO & Google Maps takibi", "Reklam optimizasyonu", "Öncelikli destek"], 0, 3],
    ["Scale", "Dijital tarafı dış ekip gibi yönetmek isteyenler.", 9590, 2459, ["Tam dijital yönetim", "İleri kampanya optimizasyonu", "AI / automation desteği", "Strateji görüşmeleri", "Öncelikli üretim sırası"], 0, 4],
  ];
  const services = [
    ["⌘", "Web Tasarım & Geliştirme", "Kurumsal web siteleri, landing page'ler, portfolyolar ve satış odaklı sayfalar. Mobil uyum, hız, SEO temeli ve net CTA yapısı standart.", ["1 Sayfa · {{web_single_price}} TL+", "Multi-page · {{web_multi_price}} TL+", "Dynamic · {{web_dynamic_price}} TL+"], 1],
    ["↗", "Google & Meta Ads", "Kampanya kurulumu, hedef kitle, kreatif, dönüşüm takibi, bütçe kontrolü ve sürekli optimizasyon.", ["Google Ads", "Meta Ads", "Landing Pages"], 2],
    ["◎", "Sosyal Medya & İçerik", "İçerik planı, tasarım dili, kısa video fikirleri, kampanya görselleri ve hesabınızın düzenli yönetimi.", ["Instagram", "Facebook", "Creative"], 3],
    ["⌖", "SEO & Google Maps", "Yerel işletmeler için görünürlük, Google Business optimizasyonu, web içi SEO ve içerik fırsatları.", ["Local SEO", "Google Maps", "On-page SEO"], 4],
    ["✦", "AI & Automation", "Lead toplama akışları, WhatsApp yönlendirmeleri, basit CRM yapıları ve tekrar eden süreçleri azaltan otomasyonlar.", ["Lead Flow", "WhatsApp", "Workflow"], 5],
    ["◈", "Brand & Creative Direction", "Renk, tipografi, sosyal görünüm ve kampanya kreatiflerini markanın tek bir profesyonel sistem gibi hissettirmesi için düzenliyoruz.", ["Visual System", "Campaign", "Content"], 6],
  ];
  const portfolio = [
    ["mutlu", "Mutlu Nakliyat", "Web · Local Business", "Hizmetleri net anlatan, mobilde hızlı aksiyon veren ve yerel güven hissini güçlendiren dijital görünüm.", "project-mutlu.png", "https://mutlunakliyat.site/", ["Responsive Web", "Service UX", "Local Presence"], 1],
    ["gateaux", "Decoration Gateaux", "Visual · Web Concept", "Ürünü öne çıkaran, daha yumuşak ve görsel ağırlıklı bir dijital vitrin yaklaşımı.", "project-gateaux.png", "https://decorationgateaux.shop/", ["Creative Web", "Visual Story", "Mobile"], 2],
    ["erhan", "Erhan Oto", "Web · Automotive", "Otomotiv sektörüne uygun daha teknik, net ve güven veren bir web sunumu.", "project-erhan.png", "https://xn--yurtotoelektrikerhankcr-8qdb.com/", ["Web Design", "Automotive", "Mobile UX"], 3],
    ["fifty", "Fifty", "Brand · Digital Experience", "Güçlü bir görsel karakter etrafında şekillenen marka ve dijital deneyim çalışması.", "project-fifty.png", "", ["Visual Direction", "Digital", "Experience"], 4],
  ];

  const statements = [];
  for (const [name, description, monthly, weekly, features, featured, sort] of packages) {
    statements.push(db.prepare("INSERT INTO packages (name, description, monthly_price, weekly_price, features, featured, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)").bind(name, description, monthly, weekly, JSON.stringify(features), featured, sort));
  }
  for (const [icon, name, description, tags, sort] of services) {
    statements.push(db.prepare("INSERT INTO services (icon, name, description, tags, active, sort_order) VALUES (?, ?, ?, ?, 1, ?)").bind(icon, name, description, JSON.stringify(tags), sort));
  }
  for (const [slug, title, type, description, image, url, tags, sort] of portfolio) {
    statements.push(db.prepare("INSERT INTO portfolio (slug, title, type, description, image, url, tags, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)").bind(slug, title, type, description, image, url, JSON.stringify(tags), sort));
  }
  await db.batch(statements);
}

async function getPublicSettings(db) {
  const placeholders = PUBLIC_SETTING_KEYS.map(() => "?").join(",");
  const rows = await db.prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`).bind(...PUBLIC_SETTING_KEYS).all();
  return Object.fromEntries((rows.results || []).map((row) => [row.key, row.value]));
}

async function listPublic(db, resource) {
  const config = RESOURCES[resource];
  const rows = await db.prepare(`SELECT * FROM ${config.table} WHERE active = 1 ORDER BY ${config.order}`).all();
  return (rows.results || []).map((row) => parseRow(row, config));
}

async function handleResource(request, db, resource, id) {
  const config = RESOURCES[resource];
  if (request.method === "GET" && id === null) {
    const rows = await db.prepare(`SELECT * FROM ${config.table} ORDER BY ${config.order}`).all();
    return json({ items: (rows.results || []).map((row) => parseRow(row, config)) }, 200, { "Cache-Control": "no-store" });
  }

  if (request.method === "POST" && id === null) {
    const body = await request.json().catch(() => ({}));
    const values = normalizeBody(body, config);
    const columns = config.fields;
    const placeholders = columns.map(() => "?").join(",");
    const result = await db.prepare(`INSERT INTO ${config.table} (${columns.join(",")}) VALUES (${placeholders})`).bind(...columns.map((field) => values[field])).run();
    return json({ ok: true, id: result.meta?.last_row_id }, 201);
  }

  if (request.method === "PUT" && id !== null) {
    const body = await request.json().catch(() => ({}));
    const fields = config.fields.filter((field) => Object.prototype.hasOwnProperty.call(body, field));
    if (!fields.length) return json({ error: "Nothing to update." }, 400);
    const values = normalizeBody(body, config);
    const assignments = fields.map((field) => `${field} = ?`).join(",");
    await db.prepare(`UPDATE ${config.table} SET ${assignments}, updated_at = datetime('now') WHERE id = ?`).bind(...fields.map((field) => values[field]), id).run();
    return json({ ok: true, id }, 200);
  }

  if (request.method === "DELETE" && id !== null) {
    await db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).bind(id).run();
    return json({ ok: true, id }, 200);
  }

  return json({ error: "Method not allowed." }, 405);
}

function normalizeBody(body, config) {
  const values = {};
  for (const field of config.fields) {
    let value = Object.prototype.hasOwnProperty.call(body, field) ? body[field] : null;
    if (config.json.has(field)) value = JSON.stringify(Array.isArray(value) ? value : []);
    if (config.numeric.has(field)) {
      if (value === "" || value === null || value === undefined) value = null;
      else {
        const number = Number(value);
        value = Number.isFinite(number) ? number : 0;
      }
    }
    if (typeof value === "string") value = value.trim();
    values[field] = value;
  }
  return values;
}

function parseRow(row, config) {
  const copy = { ...row };
  for (const field of config.json) {
    try { copy[field] = JSON.parse(copy[field] || "[]"); }
    catch { copy[field] = []; }
  }
  return copy;
}

async function getOverview(db) {
  const results = await db.batch([
    db.prepare("SELECT COUNT(*) AS value FROM clients WHERE status = 'lead'"),
    db.prepare("SELECT COUNT(*) AS value FROM clients WHERE status = 'active'"),
    db.prepare("SELECT COUNT(*) AS value FROM orders WHERE status NOT IN ('completed','cancelled')"),
    db.prepare("SELECT COUNT(*) AS value FROM invoices WHERE status NOT IN ('paid','cancelled')"),
    db.prepare("SELECT COALESCE(SUM(amount),0) AS value FROM invoices WHERE status = 'paid'"),
    db.prepare("SELECT COALESCE(SUM(amount),0) AS value FROM expenses"),
    db.prepare("SELECT COALESCE(SUM(CASE WHEN interval = 'weekly' THEN amount * 4.33 ELSE amount END),0) AS value FROM subscriptions WHERE status = 'active'"),
    db.prepare("SELECT COALESCE(SUM(views),0) AS value FROM analytics_daily WHERE date >= date('now','-29 day')"),
  ]);
  const values = results.map((result) => Number(result.results?.[0]?.value || 0));
  return {
    leads: values[0], activeClients: values[1], openOrders: values[2], unpaidInvoices: values[3],
    revenue: values[4], expenses: values[5], profit: values[4] - values[5], recurringRevenue: values[6], views30d: values[7],
  };
}

async function getAnalytics(db) {
  const [daily, pages] = await db.batch([
    db.prepare("SELECT date, SUM(views) AS views FROM analytics_daily WHERE date >= date('now','-29 day') GROUP BY date ORDER BY date ASC"),
    db.prepare("SELECT path, SUM(views) AS views FROM analytics_daily WHERE date >= date('now','-29 day') GROUP BY path ORDER BY views DESC LIMIT 10"),
  ]);
  return { daily: daily.results || [], pages: pages.results || [] };
}

function cleanPath(value) {
  if (typeof value !== "string") return "";
  const path = value.trim().slice(0, 160);
  return path.startsWith("/") && !path.includes("?") ? path : "";
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

async function isAuthenticated(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const token = parseCookies(request.headers.get("Cookie") || "")[COOKIE_NAME];
  if (!token) return false;
  const split = token.lastIndexOf(".");
  if (split < 1) return false;
  const expiresText = token.slice(0, split);
  const signature = token.slice(split + 1);
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, await sign(expiresText, env.ADMIN_PASSWORD));
}

async function sign(message, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message))));
}

async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(a)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(b)),
  ]);
  const aa = new Uint8Array(ha), bb = new Uint8Array(hb);
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
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}
