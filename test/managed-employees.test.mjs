import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";
import {DatabaseSync} from "node:sqlite";
import {handleManagedEmployeeAdmin,handleManagedEmployeeApi,serveManagedEmployeePortal} from "../src/managed-employees.js";
import {createSession,hashPassword} from "../src/security.js";

function wrap(sqlite){
  class Stmt{
    constructor(sql){this.s=sqlite.prepare(sql);this.args=[];this.sql=sql;}
    bind(...args){this.args=args;return this;}
    async first(){return this.s.get(...this.args)||null;}
    async all(){return {results:this.s.all(...this.args)};}
    async run(){this.s.run(...this.args);return {success:true};}
    async result(){return /^\s*(SELECT|WITH)\b/i.test(this.sql)?this.all():this.run();}
  }
  return {prepare:sql=>new Stmt(sql),async batch(statements){
    sqlite.exec("BEGIN");
    try{const values=[];for(const item of statements)values.push(await item.result());sqlite.exec("COMMIT");return values;}
    catch(error){sqlite.exec("ROLLBACK");throw error;}
  }};
}
function request(path,method="GET",body=null,cookie=""){
  const headers={Origin:"https://auradigitalworks.com"};
  if(cookie)headers.Cookie=cookie;
  if(body!==null)headers["Content-Type"]="application/json";
  return new Request("https://auradigitalworks.com"+path,{method,headers,body:body===null?undefined:JSON.stringify(body)});
}
test("owner creates a new isolated employee workspace in one action and can review its logs",async()=>{
  const sqlite=new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  sqlite.exec("CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,company TEXT DEFAULT '',email TEXT DEFAULT '',phone TEXT DEFAULT '',service TEXT DEFAULT '',status TEXT DEFAULT 'lead',renewal_date TEXT,notes TEXT DEFAULT '',created_at TEXT DEFAULT (datetime('now')),updated_at TEXT DEFAULT (datetime('now')))");
  sqlite.exec(await readFile(new URL("../migrations/0001_admin_security.sql",import.meta.url),"utf8"));
  sqlite.exec(await readFile(new URL("../migrations/0002_employee_portal.sql",import.meta.url),"utf8"));
  const db=wrap(sqlite);
  const ownerId=crypto.randomUUID(),viewerId=crypto.randomUUID();
  await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)").bind(ownerId,"owner","Owner",await hashPassword("Owner-password-2026!"),"owner").run();
  await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)").bind(viewerId,"observer","Observer",await hashPassword("Viewer-password-2026!"),"viewer").run();
  const ownerCookie="__Host-aura_admin="+await createSession(db,ownerId);
  const viewerCookie="__Host-aura_admin="+await createSession(db,viewerId);
  const env={DB:db,LOGIN_RATE_LIMITER:{limit:async()=>({success:true})},ASSETS:{fetch:async req=>{
    const path=new URL(req.url).pathname;
    return new Response(path.includes("index.html")?"<h1>Malek</h1><script src='/malek/app.js'></script>":path.includes("app.js")?'const name="Malek";fetch("/api/employee/malek/session")':"body{}",{headers:{"Content-Type":"text/plain"}});
  }}};
  const rejected=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees","POST",{name:"Test Employee"},viewerCookie),env);
  assert.equal(rejected.status,403);
  const created=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees","POST",{name:"Test Employee"},ownerCookie),env);
  assert.equal(created.status,201);
  const body=await created.json();
  assert.match(body.employee.portal,/^emp-test-employee-[a-f0-9]{8}$/);
  assert.equal(body.temporaryPassword.length>20,true);
  const stored=await db.prepare("SELECT * FROM employee_users WHERE id=?").bind(body.employee.id).first();
  assert.ok(stored.password_hash.startsWith("temp:$2"));
  assert.equal(stored.password_hash.includes(body.temporaryPassword),false);
  const staff=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees","GET",null,ownerCookie),env);
  const listed=await staff.json();
  assert.ok(listed.employees.some(e=>e.portal===body.employee.portal));
  const base="/"+body.employee.portal;
  const html=await serveManagedEmployeePortal(request(base),env);
  assert.equal(html.status,200);
  assert.match(await html.text(),/Test Employee/);
  const script=await serveManagedEmployeePortal(request(base+"/app.js"),env);
  assert.match(await script.text(),new RegExp("/api/employee/"+body.employee.portal+"/session"));
  const login=await handleManagedEmployeeApi(request("/api/employee/"+body.employee.portal+"/login","POST",{password:body.temporaryPassword}),env);
  assert.equal(login.status,200);
  const session=await login.json();
  assert.equal(session.passwordChangeRequired,true);
  const audit=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees","GET",null,ownerCookie),env);
  assert.ok((await audit.json()).logs.some(e=>e.portal===body.employee.portal&&e.action==="login_succeeded"));
  sqlite.close();
});
