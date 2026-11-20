import {json,readJson} from "./http.js";
import {getAuthenticatedAdmin,hashPassword,sameOrigin} from "./security.js";
import {managedEmployeePortal} from "./employee-portals.js";

const managedSlug=/^emp-[a-z0-9-]{5,50}$/;
const jsonOut=(data,status=200)=>json(data,status,{"Cache-Control":"no-store"});
const fail=(message,status=400)=>jsonOut({error:message},status);
const clean=(value,max=100)=>String(value??"").trim().slice(0,max);
const encode=(text)=>text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
async function findEmployee(db,slug){
  return db.prepare("SELECT id,portal_slug,display_name,active,last_login_at FROM employee_users WHERE portal_slug=? LIMIT 1").bind(slug).first();
}
async function list(db){
  const [staff,metrics,logs]=await db.batch([
    db.prepare("SELECT id,portal_slug,display_name,active,last_login_at,created_at FROM employee_users ORDER BY created_at"),
    db.prepare("SELECT employee_user_id,COUNT(*) AS total,SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,SUM(CASE WHEN next_follow_up IS NOT NULL AND next_follow_up<=date('now','+7 day') AND status!='completed' THEN 1 ELSE 0 END) AS follow_ups FROM employee_clients GROUP BY employee_user_id"),
    db.prepare("SELECT l.id,l.employee_user_id,l.actor_snapshot,l.action,l.target_id,l.created_at,u.portal_slug FROM employee_audit_log l LEFT JOIN employee_users u ON u.id=l.employee_user_id ORDER BY l.created_at DESC LIMIT 300")
  ]);
  const summaries=new Map((metrics.results||[]).map(m=>[m.employee_user_id,m]));
  const all=staff.results||[];
  const view=u=>({id:u.id,portal:u.portal_slug,name:u.display_name,active:!!u.active,configured:true,managed:u.portal_slug.startsWith("emp-"),url:"/"+u.portal_slug,lastLogin:u.last_login_at,createdAt:u.created_at,clients:Number(summaries.get(u.id)?.total||0),activeClients:Number(summaries.get(u.id)?.active||0),followUps:Number(summaries.get(u.id)?.follow_ups||0)});
  const profiles=["qusai","malek","ala","yessin"].map(p=>all.find(u=>u.portal_slug===p)).filter(Boolean).map(view);
  const extra=all.filter(u=>!["qusai","malek","ala","yessin"].includes(u.portal_slug)).map(view);
  return {employees:[...profiles,...extra],logs:(logs.results||[]).map(e=>({portal:e.portal_slug||"unknown",actor:e.actor_snapshot,action:e.action,target:e.target_id,at:e.created_at}))};
}
export async function handleManagedEmployeeAdmin(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith("/api/admin/managed-employees"))return null;
  if(!env.DB)return fail("Database unavailable.",503);
  const owner=await getAuthenticatedAdmin(request,env.DB);
  if(!owner)return fail("Unauthorized.",401);
  if(owner.role!=="owner")return fail("Owner access required.",403);
  if(request.method==="GET"&&url.pathname==="/api/admin/managed-employees")return jsonOut(await list(env.DB));
  if(request.method==="POST"&&url.pathname==="/api/admin/managed-employees"){
    if(!sameOrigin(request))return fail("Invalid request origin.",403);
    const data=await readJson(request,2048);
    const name=clean(data.name,80);
    if(name.length<2||!/^[-\p{L}\p{M} .']{2,80}$/u.test(name))return fail("Enter a valid employee name (2–80 characters).");
    const root=name.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,28)||"team";
    const suffix=Array.from(crypto.getRandomValues(new Uint8Array(4))).map(x=>x.toString(16).padStart(2,"0")).join("");
    const slug="emp-"+root+"-"+suffix;
    const tempPassword="Aura-"+Array.from(crypto.getRandomValues(new Uint8Array(18))).map(x=>x.toString(16).padStart(2,"0")).join("");
    const id=crypto.randomUUID();
    await env.DB.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash,active) VALUES (?,?,?,?,1)").bind(id,slug,name,"temp:"+await hashPassword(tempPassword)).run();
    await env.DB.prepare("INSERT INTO employee_audit_log(id,employee_user_id,actor_snapshot,action,target_id) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(),id,owner.username,"portal_created",id).run();
    return jsonOut({employee:{id,name,portal:slug,url:"/"+slug},temporaryPassword:tempPassword,passwordChangeRequired:true},201);
  }
  return fail("Not found.",404);
}
export async function serveManagedEmployeePortal(request,env){
  const path=new URL(request.url).pathname;
  const matched=path.match(/^\/(emp-[a-z0-9-]{5,50})(?:\/(app\.js|styles\.css))?\/?$/);
  if(!matched)return null;
  if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed.",{status:405,headers:{Allow:"GET, HEAD"}});
  if(!env.DB||!env.ASSETS)return new Response("Unavailable.",{status:503});
  const profile=await findEmployee(env.DB,matched[1]);
  if(!profile||!profile.active)return new Response("Not found.",{status:404,headers:{"Cache-Control":"no-store"}});
  const asset=matched[2]||"index.html";
  const upstream=await env.ASSETS.fetch(new Request(new URL("/malek/"+asset,request.url),{method:"GET"}));
  if(!upstream.ok)return new Response("Workspace unavailable.",{status:503});
  let content=await upstream.text();
  if(asset==="index.html"){
    content=content.replaceAll("/malek/","/"+profile.portal_slug+"/").replaceAll("Malek",encode(profile.display_name));
  } else if(asset==="app.js"){
    content=content.replaceAll("/api/employee/malek/","/api/employee/"+profile.portal_slug+"/").replaceAll('"Malek"',JSON.stringify(profile.display_name));
  }
  const headers=new Headers({
    "Cache-Control":"no-store, private",
    "Content-Type":asset==="app.js"?"text/javascript; charset=utf-8":asset==="styles.css"?"text/css; charset=utf-8":"text/html; charset=utf-8",
    "X-Content-Type-Options":"nosniff",
    "X-Robots-Tag":"noindex, nofollow, noarchive",
    "Referrer-Policy":"no-referrer",
    "X-Frame-Options":"DENY"
  });
  if(asset==="index.html")headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
  return new Response(request.method==="HEAD"?null:content,{status:200,headers});
}
export async function handleManagedEmployeeApi(request,env){
  const match=new URL(request.url).pathname.match(/^\/api\/employee\/(emp-[a-z0-9-]{5,50})\//);
  if(!match)return null;
  if(!env.DB)return fail("Database unavailable.",503);
  const profile=await findEmployee(env.DB,match[1]);
  if(!profile||!profile.active)return fail("Employee workspace unavailable.",404);
  return managedEmployeePortal(profile.portal_slug,profile.display_name).handleEmployeePortalApi(request,env);
}
