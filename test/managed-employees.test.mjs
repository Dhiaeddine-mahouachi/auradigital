import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";
import {DatabaseSync} from "node:sqlite";
import {handleManagedEmployeeAdmin,handleManagedEmployeeApi,serveManagedEmployeePortal} from "../src/managed-employees.js";
import {createSession,hashPassword,verifyPassword} from "../src/security.js";

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
  const reset=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+body.employee.id,"PATCH",{action:"reset-password"},ownerCookie),env);
  assert.equal(reset.status,200);
  const resetValue=await reset.json();
  assert.notEqual(resetValue.temporaryPassword,body.temporaryPassword);
  assert.equal((await handleManagedEmployeeApi(request("/api/employee/"+body.employee.portal+"/session"),env)).status,200);
  const disabled=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+body.employee.id,"PATCH",{action:"deactivate"},ownerCookie),env);
  assert.equal(disabled.status,200);
  assert.equal((await serveManagedEmployeePortal(request(base),env)).status,404);
  assert.equal((await handleManagedEmployeeApi(request("/api/employee/"+body.employee.portal+"/session"),env)).status,404);
  const restored=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+body.employee.id,"PATCH",{action:"activate"},ownerCookie),env);
  assert.equal(restored.status,200);
  sqlite.close();
});

test("owner can reset each built-in employee portal without changing customer data",async()=>{
  const sqlite=new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys=ON");
  sqlite.exec("CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,company TEXT DEFAULT '',email TEXT DEFAULT '',phone TEXT DEFAULT '',service TEXT DEFAULT '',status TEXT DEFAULT 'lead',renewal_date TEXT,notes TEXT DEFAULT '',created_at TEXT DEFAULT (datetime('now')),updated_at TEXT DEFAULT (datetime('now')))");
  sqlite.exec(await readFile(new URL("../migrations/0001_admin_security.sql",import.meta.url),"utf8"));
  sqlite.exec(await readFile(new URL("../migrations/0002_employee_portal.sql",import.meta.url),"utf8"));
  const db=wrap(sqlite);
  const ownerId=crypto.randomUUID(),viewerId=crypto.randomUUID();
  await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)").bind(ownerId,"owner","Owner",await hashPassword("Owner-password-2026!"),"owner").run();
  await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)").bind(viewerId,"viewer","Viewer",await hashPassword("Viewer-password-2026!"),"viewer").run();
  const ownerCookie="__Host-aura_admin="+await createSession(db,ownerId);
  const viewerCookie="__Host-aura_admin="+await createSession(db,viewerId);
  await db.prepare("INSERT INTO clients(name) VALUES (?)").bind("Persistent prospect").run();
  const client=(await db.prepare("SELECT id FROM clients LIMIT 1").first()).id;
  for(const portal of ["qusai","malek","ala","yessin"]){
    const id=crypto.randomUUID();
    const oldHash=await hashPassword("Previous-employee-password-2026!");
    await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash,active) VALUES (?,?,?,?,1)").bind(id,portal,portal,oldHash).run();
    await db.prepare("INSERT INTO employee_clients(id,employee_user_id,main_client_id,name) VALUES (?,?,?,?)").bind(crypto.randomUUID(),id,client,"Retained prospect").run();
    await db.prepare("INSERT INTO employee_sessions(id,employee_user_id,token_hash,expires_at) VALUES (?,?,?,?)").bind(crypto.randomUUID(),id,"test-token-"+portal,"2099-01-01 00:00:00").run();

    // Neither unauthenticated nor non-owner callers may reset fixed portal accounts.
    const anonymous=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+id,"PATCH",{action:"reset-password",newPassword:"Test-unique-password-2026!"}),{DB:db});
    assert.equal(anonymous.status,401);
    const viewer=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+id,"PATCH",{action:"reset-password",newPassword:"Test-unique-password-2026!"},viewerCookie),{DB:db});
    assert.equal(viewer.status,403);
    const short=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+id,"PATCH",{action:"reset-password",newPassword:"short"},ownerCookie),{DB:db});
    assert.equal(short.status,400);
    assert.equal((await db.prepare("SELECT password_hash FROM employee_users WHERE id=?").bind(id).first()).password_hash,oldHash);
    const forbidden=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+id,"PATCH",{action:"deactivate"},ownerCookie),{DB:db});
    assert.equal(forbidden.status,403);

    const chosen="Temporary-reset-for-"+portal+"-2026!";
    const updated=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+id,"PATCH",{action:"reset-password",newPassword:chosen},ownerCookie),{DB:db});
    assert.equal(updated.status,200);
    const response=await updated.json();
    assert.equal(response.passwordChangeRequired,true);
    assert.equal(Object.hasOwn(response,"temporaryPassword"),false);
    const employee=await db.prepare("SELECT password_hash,active FROM employee_users WHERE id=?").bind(id).first();
    assert.equal(employee.active,1);
    assert.ok(employee.password_hash.startsWith("temp:"));
    assert.equal(await verifyPassword(chosen,employee.password_hash.slice(5)),true);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM employee_sessions WHERE employee_user_id=?").bind(id).first()).total,0);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM employee_clients WHERE employee_user_id=?").bind(id).first()).total,1);
    assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM employee_audit_log WHERE employee_user_id=? AND action='password_reset_by_owner'").bind(id).first()).total,1);
  }
  const yessinId=(await db.prepare("SELECT id FROM employee_users WHERE portal_slug='yessin'").first()).id;
  const generated=await handleManagedEmployeeAdmin(request("/api/admin/managed-employees/"+yessinId,"PATCH",{action:"reset-password"},ownerCookie),{DB:db});
  assert.equal(generated.status,200);
  const generatedBody=await generated.json();
  assert.ok(generatedBody.temporaryPassword.length>=30);
  assert.equal(await verifyPassword(generatedBody.temporaryPassword,(await db.prepare("SELECT password_hash FROM employee_users WHERE id=?").bind(yessinId).first()).password_hash.slice(5)),true);
  sqlite.close();
});
