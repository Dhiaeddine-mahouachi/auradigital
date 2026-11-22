import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { handleAdditionalEmployeeApi, serveAdditionalEmployeePortal } from "../src/employee-portals.js";
import { createSession, hashPassword } from "../src/security.js";

const origin = "https://auradigital.ink";
function request(path, method = "GET", body = null, cookie = "") {
  const headers = { Origin: origin };
  if (body !== null) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  return new Request(origin + path, {
    method, headers, body: body === null ? undefined : JSON.stringify(body),
  });
}

test("four additional employee portals are available without changing Qusai", async () => {
  const env = { ASSETS: { fetch: async (request) => new Response("private " + new URL(request.url).pathname, { headers: { "Content-Type": "text/html" } }) } };
  for (const slug of ["malek", "ala", "yessin", "yessine"]) {
    const response = await serveAdditionalEmployeePortal(request("/" + slug), env);
    assert.equal(response.status, 200);
    assert.match(await response.text(), new RegExp(slug + "/index.html"));
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.match(response.headers.get("x-robots-tag"), /noindex/);
  }
  assert.equal(await serveAdditionalEmployeePortal(request("/qusai"), env), null);
});

test("employee sessions and client lists are isolated; temporary passwords must be changed", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec("CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))");
  sqlite.exec(await readFile(new URL("../migrations/0001_admin_security.sql", import.meta.url), "utf8"));
  sqlite.exec(await readFile(new URL("../migrations/0002_employee_portal.sql", import.meta.url), "utf8"));
  const db = d1(sqlite);
  const first = "Malek-temporary-password";
  const second = "Ala-secure-password-2026";
  await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash) VALUES (?,?,?,?)")
    .bind("emp-m", "malek", "Malek", "temp:" + await hashPassword(first)).run();
  await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash) VALUES (?,?,?,?)")
    .bind("emp-a", "ala", "Ala", await hashPassword(second)).run();
  const env = { DB: db, LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  const run = (path, method="GET", body=null, cookie="") => handleAdditionalEmployeeApi(request(path, method, body, cookie), env);

  const login = await run("/api/employee/malek/login", "POST", { password: first });
  assert.equal(login.status, 200);
  const loginData = await login.json();
  assert.equal(loginData.passwordChangeRequired, true);
  const malekCookie = login.headers.get("set-cookie").split(";",1)[0];
  assert.match(malekCookie, /__Host-aura_employee_malek=/);

  const denied = await run("/api/employee/malek/clients", "GET", null, malekCookie);
  assert.equal(denied.status, 403);
  const changed = await run("/api/employee/malek/change-password", "POST", {
    currentPassword: first, newPassword: "Malek-new-secure-password-2026",
  }, malekCookie);
  assert.equal(changed.status, 200);
  const stale = await run("/api/employee/malek/session", "GET", null, malekCookie);
  assert.equal((await stale.json()).authenticated, false);

  const relogin = await run("/api/employee/malek/login", "POST", { password: "Malek-new-secure-password-2026" });
  assert.equal(relogin.status, 200);
  assert.equal((await relogin.clone().json()).passwordChangeRequired, false);
  const freshCookie = relogin.headers.get("set-cookie").split(";",1)[0];
  const created = await run("/api/employee/malek/clients", "POST", {name:"Mina",company:"Mina Coffee",status:"lead"}, freshCookie);
  assert.equal(created.status, 201);
  const id = (await created.json()).client.id;
  assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM clients").first()).total, 1);

  const alaLogin = await run("/api/employee/ala/login", "POST", { password: second });
  assert.equal(alaLogin.status, 200);
  const alaCookie = alaLogin.headers.get("set-cookie").split(";",1)[0];
  assert.match(alaCookie, /__Host-aura_employee_ala=/);
  const list = await run("/api/employee/ala/clients", "GET", null, alaCookie);
  assert.equal((await list.json()).clients.length, 0);
  assert.equal((await run("/api/employee/ala/clients/" + id, "GET", null, alaCookie)).status, 404);
  assert.equal((await run("/api/employee/malek/clients", "GET", null, alaCookie)).status, 401);
  sqlite.close();
});

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


test("new Yessine portal requires owner setup and keeps the existing Yessin account separate", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec("CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))");
  sqlite.exec(await readFile(new URL("../migrations/0001_admin_security.sql", import.meta.url), "utf8"));
  sqlite.exec(await readFile(new URL("../migrations/0002_employee_portal.sql", import.meta.url), "utf8"));
  const db = d1(sqlite);
  const env = { DB: db, LOGIN_RATE_LIMITER: { limit: async () => ({ success: true }) } };
  const run = (path, method="GET", body=null, cookie="") => handleAdditionalEmployeeApi(request(path, method, body, cookie), env);

  const status = await run("/api/employee/yessine/portal");
  assert.deepEqual(await status.json(), { configured: false, portal: "yessine", displayName: "Yessine" });

  const initial = await run("/api/employee/yessine/login", "POST", {password:"New-employee-2026-password"});
  assert.equal(initial.status, 503);
  assert.equal((await initial.json()).code, "not_configured");

  const anonymous = await run("/api/employee/yessine/bootstrap", "POST", { password:"New-employee-2026-password" });
  assert.equal(anonymous.status, 403);

  const ownerId = crypto.randomUUID();
  await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)")
    .bind(ownerId, "owner", "Owner", await hashPassword("Owner-very-secure-password-2026"), "owner").run();
  const ownerCookie="__Host-aura_admin="+await createSession(db, ownerId);
  const created = await run("/api/employee/yessine/bootstrap", "POST", {password:"New-employee-2026-password"}, ownerCookie);
  assert.equal(created.status, 201);
  const duplicate = await run("/api/employee/yessine/bootstrap", "POST", {password:"New-employee-2026-password"}, ownerCookie);
  assert.equal(duplicate.status, 409);

  const yessine = await run("/api/employee/yessine/login", "POST", {password:"New-employee-2026-password"});
  assert.equal(yessine.status, 200);
  const yessineCookie = yessine.headers.get("set-cookie").split(";",1)[0];
  assert.match(yessineCookie, /__Host-aura_employee_yessine=/);
  assert.equal((await yessine.json()).passwordChangeRequired, false);

  const existingYessinId=crypto.randomUUID();
  await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash) VALUES (?,?,?,?)")
    .bind(existingYessinId,"yessin","Yessin",await hashPassword("Legacy-Yessin-private-password")).run();
  const yessin = await run("/api/employee/yessin/login","POST",{password:"Legacy-Yessin-private-password"});
  assert.equal(yessin.status,200);
  const yessinCookie=yessin.headers.get("set-cookie").split(";",1)[0];

  const oldClient=await run("/api/employee/yessin/clients","POST",{name:"Original Yessin prospect",company:"Old account lead",status:"lead"},yessinCookie);
  assert.equal(oldClient.status,201);

  const separate=await run("/api/employee/yessine/clients","GET",null,yessineCookie);
  assert.equal(separate.status,200);
  assert.deepEqual((await separate.json()).clients,[]);
  assert.equal((await run("/api/employee/yessin/clients","GET",null,yessineCookie)).status,401);

  const newClient=await run("/api/employee/yessine/clients","POST",{name:"Yessine prospect",company:"New account lead",status:"lead"},yessineCookie);
  assert.equal(newClient.status,201);
  const oldList=await run("/api/employee/yessin/clients","GET",null,yessinCookie);
  assert.deepEqual((await oldList.json()).clients.map(c=>c.name),["Original Yessin prospect"]);
  const newList=await run("/api/employee/yessine/clients","GET",null,yessineCookie);
  assert.deepEqual((await newList.json()).clients.map(c=>c.name),["Yessine prospect"]);

  sqlite.close();
});


test("Yessine route is handled by the Worker with private asset headers", async () => {
  const config=JSON.parse(await readFile(new URL("../wrangler.jsonc",import.meta.url),"utf8"));
  assert.ok(config.assets.run_worker_first.includes("/yessine"));
  assert.ok(config.assets.run_worker_first.includes("/yessine/"));
  const headers=await readFile(new URL("../_headers",import.meta.url),"utf8");
  assert.match(headers,/\/yessine\*\s+Cache-Control: no-store, private\s+X-Robots-Tag: noindex, nofollow, noarchive/);
});
