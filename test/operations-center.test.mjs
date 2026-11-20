import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";
import {DatabaseSync} from "node:sqlite";
import {createSession,hashPassword} from "../src/security.js";
import {handleOperations,handleEmployeeTasks} from "../src/operations-center.js";

function d1(db){
 class Statement{
  constructor(text){this.text=text;this.values=[];}
  bind(...values){this.values=values;return this;}
  async first(){return db.prepare(this.text).get(...this.values)||null;}
  async all(){return {results:db.prepare(this.text).all(...this.values)};}
  async run(){db.prepare(this.text).run(...this.values);return {success:true};}
  async exec(){return /^\s*(SELECT|WITH)\b/i.test(this.text)?this.all():this.run();}
 }
 return {prepare:sql=>new Statement(sql),async batch(statements){
   db.exec("BEGIN");try{const result=[];for(const stmt of statements)result.push(await stmt.exec());db.exec("COMMIT");return result;}
   catch(error){db.exec("ROLLBACK");throw error;}
 }};
}
function req(path,method="GET",body=null,cookie=""){
 const headers={Origin:"https://auradigitalworks.com"};
 if(cookie)headers.Cookie=cookie;
 if(body!==null)headers["Content-Type"]="application/json";
 return new Request("https://auradigitalworks.com"+path,{method,headers,body:body===null?undefined:JSON.stringify(body)});
}
test("owner operations use existing records and require explicit changes",async()=>{
 const sqlite=new DatabaseSync(":memory:");
 sqlite.exec("CREATE TABLE clients(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,company TEXT,service TEXT,status TEXT,renewal_date TEXT,created_at TEXT DEFAULT (datetime('now')))");
 sqlite.exec("CREATE TABLE invoices(id INTEGER PRIMARY KEY AUTOINCREMENT,invoice_number TEXT,amount REAL,status TEXT,due_date TEXT)");
 sqlite.exec("CREATE TABLE subscriptions(id INTEGER PRIMARY KEY AUTOINCREMENT,plan TEXT,amount REAL,status TEXT,next_billing_date TEXT)");
 sqlite.exec(await readFile(new URL("../migrations/0001_admin_security.sql",import.meta.url),"utf8"));
 sqlite.exec(await readFile(new URL("../migrations/0002_employee_portal.sql",import.meta.url),"utf8"));
 sqlite.prepare("INSERT INTO clients(name,company,service,status) VALUES (?,?,?,?)").run("Example","Example Cafe","Website","lead");
 const db=d1(sqlite),ownerId=crypto.randomUUID(),viewerId=crypto.randomUUID(),employeeId=crypto.randomUUID();
 await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash) VALUES (?,?,?,?)").bind(employeeId,"ala","Ala","test-hash").run();
 await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)").bind(ownerId,"founder","Founder",await hashPassword("SecureFounderPass2026!"),"owner").run();
 await db.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)").bind(viewerId,"viewer","Viewer",await hashPassword("SecureViewerPass2026!"),"viewer").run();
 const ownerCookie="__Host-aura_admin="+await createSession(db,ownerId);
 const viewerCookie="__Host-aura_admin="+await createSession(db,viewerId);
 const env={DB:db};
 const base="/api/admin/ops/";
 const readonly=await handleOperations(req(base+"tasks","POST",{title:"Example task"},viewerCookie),env);
 assert.equal(readonly.status,403);
 const initial=await handleOperations(req(base+"snapshot","GET",null,ownerCookie),env);
 assert.equal(initial.status,200);
 assert.equal((await initial.json()).clients.length,1);
 const task=await handleOperations(req(base+"tasks","POST",{title:"Prepare quote",clientId:1,employeeId,priority:"high",dueDate:"2026-11-30"},ownerCookie),env);
 assert.equal(task.status,200);
 const taskId=(await task.json()).id;
 const pipeline=await handleOperations(req(base+"pipeline","PATCH",{clientId:1,stage:"quoted",employeeId},ownerCookie),env);
 assert.equal(pipeline.status,200);
 const assignment=await handleOperations(req(base+"assignments","PATCH",{kind:"menu",requestId:"existing-menu-id",employeeId},ownerCookie),env);
 assert.equal(assignment.status,200);
 const quote=await handleOperations(req(base+"quotes","POST",{clientId:1,itemId:"launch",employeeId},ownerCookie),env);
 assert.equal(quote.status,200);
 const q=(await quote.json()).id;
 const accepted=await handleOperations(req(base+"quotes/"+q,"PATCH",{status:"accepted"},ownerCookie),env);
 assert.equal(accepted.status,200);
 const final=await handleOperations(req(base+"snapshot","GET",null,ownerCookie),env);
 const s=await final.json();
 assert.equal(s.clients[0].stage,"quoted");
 assert.equal(s.tasks.length,2);
 assert.ok(s.tasks.some(x=>x.id===taskId&&x.employee_id===employeeId));
 assert.equal(s.quotes[0].status,"accepted");
 assert.ok(s.activity.some(x=>x.action==="quote_accepted_task_created"));
 const employee={id:employeeId,portal_slug:"ala"};
 const privateList=await handleEmployeeTasks(req("/api/employee/ala/tasks","GET"),env,employee);
 assert.equal(privateList.status,200);
 assert.equal((await privateList.json()).tasks.length,2);
 const changed=await handleEmployeeTasks(req("/api/employee/ala/tasks/"+taskId,"PATCH",{status:"done"}),env,employee);
 assert.equal(changed.status,200);
 assert.ok((await db.prepare("SELECT * FROM employee_audit_log WHERE target_id=?").bind(taskId).first()).action==="task_done");
 assert.equal(sqlite.prepare("SELECT count(*) n FROM clients").get().n,1);
 sqlite.close();
});
