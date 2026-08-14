import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import {
  employeeSessionCookie,
  handleEmployeePortalApi,
  normalizeEmployeeClient,
  serveEmployeePortal,
} from "../src/employee-portal.js";
import { hashPassword } from "../src/security.js";

test("employee customer input is normalized and bounded", () => {
  const client = normalizeEmployeeClient({
    name: "  Ada Lovelace  ",
    company: "  Analytical Studio  ",
    email: "  ADA@EXAMPLE.COM  ",
    phone: " +90 555 000 00 00 ",
    status: "active",
    lastContact: "2026-08-14",
    nextFollowUp: "2026-08-20",
    notes: "  Requested a Growth package.  ",
  });

  assert.equal(client.name, "Ada Lovelace");
  assert.equal(client.company, "Analytical Studio");
  assert.equal(client.email, "ada@example.com");
  assert.equal(client.status, "active");
  assert.equal(client.nextFollowUp, "2026-08-20");
  assert.equal(client.notes, "Requested a Growth package.");
});

test("employee customer input rejects invalid records", () => {
  assert.throws(() => normalizeEmployeeClient({ status: "lead" }), /customer name or company/i);
  assert.throws(() => normalizeEmployeeClient({ name: "Test", status: "owner" }), /valid customer status/i);
  assert.throws(() => normalizeEmployeeClient({ name: "Test", status: "lead", email: "not-email" }), /valid email/i);
  assert.throws(() => normalizeEmployeeClient({ name: "Test", status: "lead", nextFollowUp: "tomorrow" }), /follow-up date/i);
});

test("employee sessions use an isolated secure cookie", () => {
  const cookie = employeeSessionCookie("token-value");
  assert.match(cookie, /^__Host-aura_employee=token-value;/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\//);
});

test("the worker handles the extensionless private portal route", async () => {
  const config = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  assert.ok(config.assets.run_worker_first.includes("/qusai"));
  assert.ok(config.assets.run_worker_first.includes("/api/*"));
});

test("the private portal is served with no-store and anti-indexing headers", async () => {
  const response = await serveEmployeePortal(
    new Request("https://auradigital.ink/qusai"),
    { ASSETS: { fetch: async () => new Response("<h1>Portal</h1>", { headers: { "Content-Type": "text/html" } }) } },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store, private");
  assert.match(response.headers.get("x-robots-tag"), /noindex/);
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
});

test("employee-created customers are mirrored to the main dashboard", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec("CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))) ");
  sqlite.exec(await readFile(new URL("../migrations/0001_admin_security.sql", import.meta.url), "utf8"));
  sqlite.exec(await readFile(new URL("../migrations/0002_employee_portal.sql", import.meta.url), "utf8"));
  const db = d1(sqlite);
  const employeeId = crypto.randomUUID();
  const password = "Qusai-test-password-2026";
  await db.prepare("INSERT INTO employee_users (id, portal_slug, display_name, password_hash, active) VALUES (?, 'qusai', 'Qusai', ?, 1)")
    .bind(employeeId, await hashPassword(password)).run();
  const env = { DB: db, LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) } };

  const login = await handleEmployeePortalApi(jsonRequest("/api/employee/login", { password }), env);
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";", 1)[0];

  const created = await handleEmployeePortalApi(jsonRequest("/api/employee/clients", {
    name: "Mina Kaya",
    company: "Mina Coffee",
    phone: "+90 555 100 20 30",
    whatsapp: "+90 555 100 20 30",
    email: "mina@example.com",
    service: "Growth package",
    status: "active",
    nextFollowUp: "2026-08-20",
    notes: "Asked for a campaign review.",
  }, cookie), env);
  assert.equal(created.status, 201);
  const employeeClient = (await created.json()).client;

  const mainClient = await db.prepare("SELECT * FROM clients LIMIT 1").first();
  assert.equal(mainClient.company, "Mina Coffee");
  assert.equal(mainClient.status, "active");
  assert.match(mainClient.notes, /Registered by Qusai/);
  assert.match(mainClient.notes, /Asked for a campaign review/);

  const updated = await handleEmployeePortalApi(jsonRequest(`/api/employee/clients/${employeeClient.id}`, {
    status: "waiting",
    notes: "Waiting for customer assets.",
  }, cookie, "PATCH"), env);
  assert.equal(updated.status, 200);
  const mirroredUpdate = await db.prepare("SELECT * FROM clients LIMIT 1").first();
  assert.equal(mirroredUpdate.status, "paused");
  assert.match(mirroredUpdate.notes, /Waiting for customer assets/);

  const deleted = await handleEmployeePortalApi(jsonRequest(`/api/employee/clients/${employeeClient.id}`, null, cookie, "DELETE"), env);
  assert.equal(deleted.status, 200);
  assert.equal((await db.prepare("SELECT COUNT(*) AS value FROM clients").first()).value, 0);
  assert.equal((await db.prepare("SELECT COUNT(*) AS value FROM employee_clients").first()).value, 0);
  sqlite.close();
});

function jsonRequest(path, body, cookie = "", method = "POST") {
  const headers = { Origin: "https://auradigital.ink" };
  if (body !== null) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return new Request(`https://auradigital.ink${path}`, {
    method,
    headers,
    body: body === null ? undefined : JSON.stringify(body),
  });
}

function d1(sqlite) {
  class BoundStatement {
    constructor(sql) {
      this.sql = sql;
      this.statement = sqlite.prepare(sql);
      this.args = [];
    }

    bind(...args) {
      this.args = args;
      return this;
    }

    async first() {
      return this.statement.get(...this.args) || null;
    }

    async all() {
      return { results: this.statement.all(...this.args) };
    }

    async run() {
      const result = this.statement.run(...this.args);
      return {
        success: true,
        meta: {
          changes: Number(result.changes || 0),
          last_row_id: Number(result.lastInsertRowid || 0),
        },
      };
    }

    async batchResult() {
      if (/^\s*(SELECT|WITH|PRAGMA)\b/i.test(this.sql)) return this.all();
      return this.run();
    }
  }

  return {
    prepare(sql) { return new BoundStatement(sql); },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.batchResult());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
