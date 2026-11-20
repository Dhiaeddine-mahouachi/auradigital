import {json,readJson} from "./http.js";
import {getAuthenticatedAdmin,sameOrigin} from "./security.js";
import {catalogue,groups} from "../pricing/catalogue.js";
const stages=new Set(["lead","contacted","quoted","negotiating","won","lost"]);
const taskStates=new Set(["todo","in-progress","blocked","done"]);
const quoteStates=new Set(["draft","sent","accepted","declined"]);
const kinds=new Set(["nfc","menu","website","pop","order"]);
const priorities=new Set(["normal","high","urgent"]);
const respond=(v,status=200)=>json(v,status,{"Cache-Control":"no-store"});
const bad=(message,status=400)=>respond({error:message},status);
const rows=r=>r?.results||[];
const clean=(v,n=180)=>String(v??"").trim().slice(0,n);
const uid=()=>crypto.randomUUID();
let schemaReady=false;
async function ensure(db){
 if(schemaReady)return;
 await db.batch([
   db.prepare("CREATE TABLE IF NOT EXISTS ops_pipeline (client_id INTEGER PRIMARY KEY,stage TEXT NOT NULL,employee_id TEXT,updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
   db.prepare("CREATE TABLE IF NOT EXISTS ops_tasks (id TEXT PRIMARY KEY,client_id INTEGER,employee_id TEXT,title TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'todo',priority TEXT NOT NULL DEFAULT 'normal',due_date TEXT,request_kind TEXT,request_id TEXT,created_by TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')),updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
   db.prepare("CREATE TABLE IF NOT EXISTS ops_quotes (id TEXT PRIMARY KEY,client_id INTEGER NOT NULL,item_id TEXT NOT NULL,item_name TEXT NOT NULL,amount REAL NOT NULL,currency TEXT NOT NULL,billing TEXT NOT NULL,catalogue_version TEXT NOT NULL,notes TEXT NOT NULL DEFAULT '',employee_id TEXT,status TEXT NOT NULL DEFAULT 'draft',created_by TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')),updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
   db.prepare("CREATE TABLE IF NOT EXISTS ops_assignments (kind TEXT NOT NULL,request_id TEXT NOT NULL,employee_id TEXT,notes TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL DEFAULT (datetime('now')),PRIMARY KEY(kind,request_id))"),
   db.prepare("CREATE TABLE IF NOT EXISTS ops_events (id TEXT PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,resource TEXT NOT NULL,target_id TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now')))"),
   db.prepare("CREATE INDEX IF NOT EXISTS idx_ops_tasks_assignee ON ops_tasks(employee_id,status,due_date)")
 ]);
 schemaReady=true;
}
async function log(db,actor,action,kind,id){
 await db.prepare("INSERT INTO ops_events(id,actor,action,resource,target_id) VALUES (?,?,?,?,?)").bind(uid(),clean(actor,80),clean(action,50),clean(kind,35),clean(id,120)).run();
}
async function checkClient(db,value){
 const id=Number(value);
 if(!Number.isInteger(id)||id<1||!(await db.prepare("SELECT id FROM clients WHERE id=?").bind(id).first()))throw Error("Select an existing customer.");
 return id;
}
async function checkEmployee(db,value){
 if(!value)return null;
 const id=clean(value,90);
 if(!(await db.prepare("SELECT id FROM employee_users WHERE id=? AND active=1").bind(id).first()))throw Error("Select an active employee.");
 return id;
}
function dueDate(value){
 if(!value)return null;
 const date=clean(value,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+"T00:00:00Z")))throw Error("Enter a valid date.");
 return date;
}
function priceItems(){
 return groups.flatMap(group=>(catalogue[group]||[]).filter(x=>x.availability!=="planned"&&Number.isFinite(x.price)).map(item=>({id:item.id,name:item.name,amount:item.price,currency:catalogue.currency,billing:item.billing||"once",from:!!item.from,group})));
}
async function snapshot(db){
 const SQL=[
 "SELECT id,name,company,service,status,renewal_date,created_at FROM clients ORDER BY created_at DESC LIMIT 800",
 "SELECT client_id,stage,employee_id FROM ops_pipeline LIMIT 800",
 "SELECT t.*,c.company,e.display_name AS employee_name FROM ops_tasks t LEFT JOIN clients c ON c.id=t.client_id LEFT JOIN employee_users e ON e.id=t.employee_id ORDER BY t.created_at DESC LIMIT 400",
 "SELECT q.*,c.company,e.display_name AS employee_name FROM ops_quotes q LEFT JOIN clients c ON c.id=q.client_id LEFT JOIN employee_users e ON e.id=q.employee_id ORDER BY q.created_at DESC LIMIT 200",
 "SELECT kind,request_id,employee_id,notes FROM ops_assignments LIMIT 500",
 "SELECT id,portal_slug,display_name,active FROM employee_users ORDER BY portal_slug",
 "SELECT id,invoice_number,amount,status,due_date FROM invoices WHERE status NOT IN ('paid','cancelled') AND due_date IS NOT NULL ORDER BY due_date LIMIT 80",
 "SELECT id,plan,amount,status,next_billing_date FROM subscriptions WHERE status='active' AND next_billing_date IS NOT NULL ORDER BY next_billing_date LIMIT 80",
 "SELECT e.company,e.name,e.next_follow_up,u.portal_slug FROM employee_clients e JOIN employee_users u ON e.employee_user_id=u.id WHERE e.next_follow_up <= date('now','+7 day') AND e.status!='completed' ORDER BY e.next_follow_up LIMIT 80",
 "SELECT actor,action,resource,target_id,created_at FROM ops_events ORDER BY created_at DESC LIMIT 60"
 ];
 const [clients,pipeline,tasks,quotes,assignments,employees,invoices,subscriptions,followUps,activity]=(await db.batch(SQL.map(s=>db.prepare(s)))).map(rows);
 const byClient=new Map(pipeline.map(x=>[x.client_id,x]));
 const leads=clients.map(c=>({...c,stage:byClient.get(c.id)?.stage||(c.status==="active"?"won":c.status==="closed"?"lost":"lead"),employeeId:byClient.get(c.id)?.employee_id||null}));
 const now=new Date().toISOString().slice(0,10),soon=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
 const alerts=[
   ...tasks.filter(t=>t.status!=="done"&&t.due_date&&t.due_date<now).map(t=>({type:"task",name:t.title,due:t.due_date})),
   ...invoices.filter(t=>t.due_date<=soon).map(t=>({type:"invoice",name:"Invoice "+t.invoice_number,due:t.due_date})),
   ...subscriptions.filter(t=>t.next_billing_date<=soon).map(t=>({type:"renewal",name:t.plan,due:t.next_billing_date})),
   ...followUps.map(t=>({type:"followup",name:t.company||t.name,due:t.next_follow_up,employee:t.portal_slug}))
 ].sort((a,b)=>a.due.localeCompare(b.due)).slice(0,120);
 const open=tasks.filter(t=>t.status!=="done");
 return {clients:leads,tasks,quotes,assignments,employees:employees.map(e=>({id:e.id,name:e.display_name,portal:e.portal_slug,active:!!e.active})),alerts,activity,catalogue:priceItems(),catalogueVersion:catalogue.version,insights:[
  alerts.length+" time-sensitive reminders from tasks, invoices, renewals and follow-ups.",
  leads.filter(x=>["lead","contacted"].includes(x.stage)).length+" early-stage leads.",
  open.length+" unfinished tasks; "+open.filter(x=>!x.employee_id).length+" unassigned.",
  quotes.filter(x=>x.status==="draft").length+" draft quotations ready for review."
 ]};
}
export async function handleOperations(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith("/api/admin/ops/"))return null;
 if(!env.DB)return bad("Database unavailable.",503);
 const admin=await getAuthenticatedAdmin(request,env.DB);
 if(!admin)return bad("Unauthorized.",401);
 const write=request.method!=="GET";
 if(write&&(admin.role==="viewer"||!sameOrigin(request)))return bad("Write access denied.",403);
 await ensure(env.DB);
 const route=url.pathname.slice("/api/admin/ops/".length);
 if(route==="snapshot"&&request.method==="GET")return respond(await snapshot(env.DB));
 try{
  if(route==="pipeline"&&request.method==="PATCH"){
   const data=await readJson(request,4096);
   if(!stages.has(data.stage))return bad("Invalid sales stage.");
   const client=await checkClient(env.DB,data.clientId),employee=await checkEmployee(env.DB,data.employeeId);
   await env.DB.prepare("INSERT INTO ops_pipeline(client_id,stage,employee_id) VALUES (?,?,?) ON CONFLICT(client_id) DO UPDATE SET stage=excluded.stage,employee_id=excluded.employee_id,updated_at=datetime('now')").bind(client,data.stage,employee).run();
   await log(env.DB,admin.username,"pipeline_updated","client",client);
   return respond({ok:true});
  }
  if(route==="assignments"&&request.method==="PATCH"){
   const data=await readJson(request,4096);
   if(!kinds.has(data.kind)||!clean(data.requestId,100))return bad("Invalid request reference.");
   const employee=await checkEmployee(env.DB,data.employeeId);
   await env.DB.prepare("INSERT INTO ops_assignments(kind,request_id,employee_id,notes) VALUES (?,?,?,?) ON CONFLICT(kind,request_id) DO UPDATE SET employee_id=excluded.employee_id,notes=excluded.notes,updated_at=datetime('now')").bind(data.kind,clean(data.requestId,100),employee,clean(data.notes,500)).run();
   await log(env.DB,admin.username,"request_assigned","request",data.kind+":"+data.requestId);
   return respond({ok:true});
  }
  if(route==="tasks"&&request.method==="POST"){
   const data=await readJson(request,4096),title=clean(data.title,160);
   if(title.length<3)return bad("Task title is required.");
   const client=data.clientId?await checkClient(env.DB,data.clientId):null,employee=await checkEmployee(env.DB,data.employeeId);
   const priority=priorities.has(data.priority)?data.priority:"normal",date=dueDate(data.dueDate),kind=kinds.has(data.kind)?data.kind:null,id=uid();
   await env.DB.prepare("INSERT INTO ops_tasks(id,client_id,employee_id,title,priority,due_date,request_kind,request_id,created_by) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,client,employee,title,priority,date,kind,kind?clean(data.requestId,100):null,admin.username).run();
   await log(env.DB,admin.username,"task_created","task",id);return respond({id});
  }
  const taskId=route.match(/^tasks\/([a-f0-9-]+)$/i);
  if(taskId&&request.method==="PATCH"){
   const data=await readJson(request,4096),existing=await env.DB.prepare("SELECT * FROM ops_tasks WHERE id=?").bind(taskId[1]).first();
   if(!existing)return bad("Task not found.",404);
   const state=data.status===undefined?existing.status:data.status;
   if(!taskStates.has(state))return bad("Invalid task status.");
   const employee=data.employeeId===undefined?existing.employee_id:await checkEmployee(env.DB,data.employeeId);
   const date=data.dueDate===undefined?existing.due_date:dueDate(data.dueDate);
   await env.DB.prepare("UPDATE ops_tasks SET status=?,employee_id=?,due_date=?,updated_at=datetime('now') WHERE id=?").bind(state,employee,date,existing.id).run();
   await log(env.DB,admin.username,"task_updated","task",existing.id);return respond({ok:true});
  }
  if(route==="quotes"&&request.method==="POST"){
   const data=await readJson(request,4096),client=await checkClient(env.DB,data.clientId),item=priceItems().find(x=>x.id===data.itemId);
   if(!item)return bad("Choose a valid catalogue item.");
   if(item.from)return bad("This service requires a manually approved custom quote.",409);
   const employee=await checkEmployee(env.DB,data.employeeId),id=uid();
   await env.DB.prepare("INSERT INTO ops_quotes(id,client_id,item_id,item_name,amount,currency,billing,catalogue_version,notes,employee_id,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id,client,item.id,item.name,item.amount,item.currency,item.billing,catalogue.version,clean(data.notes,500),employee,admin.username).run();
   await log(env.DB,admin.username,"quote_created","quote",id);return respond({id});
  }
  const quoteId=route.match(/^quotes\/([a-f0-9-]+)$/i);
  if(quoteId&&request.method==="PATCH"){
   const data=await readJson(request,2048);
   if(!quoteStates.has(data.status))return bad("Invalid quote status.");
   const quote=await env.DB.prepare("SELECT * FROM ops_quotes WHERE id=?").bind(quoteId[1]).first();
   if(!quote)return bad("Quotation not found.",404);
   if(quote.status==="accepted"&&data.status!=="accepted")return bad("Accepted quotations cannot be reverted.",409);
   if(quote.status!==data.status){
     if(data.status==="accepted"){
       const newTask=uid();
       await env.DB.batch([
        env.DB.prepare("UPDATE ops_quotes SET status=?,updated_at=datetime('now') WHERE id=?").bind(data.status,quote.id),
        env.DB.prepare("INSERT INTO ops_tasks(id,client_id,employee_id,title,created_by) VALUES (?,?,?,?,?)").bind(newTask,quote.client_id,quote.employee_id,"Project kickoff: "+quote.item_name,admin.username),
        env.DB.prepare("INSERT INTO ops_events(id,actor,action,resource,target_id) VALUES (?,?,?,?,?)").bind(uid(),admin.username,"quote_accepted_task_created","quote",quote.id)
       ]);
     }else{
       await env.DB.prepare("UPDATE ops_quotes SET status=?,updated_at=datetime('now') WHERE id=?").bind(data.status,quote.id).run();
       await log(env.DB,admin.username,"quote_"+data.status,"quote",quote.id);
     }
   }
   return respond({ok:true});
  }
 }catch(error){return bad(error.message||"Operation failed.");}
 return bad("Not found.",404);
}
