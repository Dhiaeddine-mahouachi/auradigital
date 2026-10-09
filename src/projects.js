import {queueRequestNotification} from './notifications.js';
import {initializeDatabase} from './worker.js';
import {ApiError,json,readJson} from './http.js';
import {getAuthenticatedAdmin,sameOrigin} from './security.js';
import {newMenuToken,tokenHash} from './menu-ownership.js';
import {INITIAL_CATALOG,validateCatalog,calculateQuote,STATUSES} from '../ui/quote-model.js';
import {PROJECT_SCHEMA} from './project-schema.js';
import {queueProjectEmail,deliverProjectEmail} from './project-email.js';
const noStore={'Cache-Control':'no-store'};
const reply=(data,status=200)=>json(data,status,noStore);
const clean=(v,max=200)=>typeof v==='string'?v.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').trim().slice(0,max):'';
const emailValid=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const safeURL=v=>{if(!v)return '';try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
const EVENT={ 'QUOTE SENT':'quote','DEPOSIT PAID':'deposit',DESIGN:'started',DEVELOPMENT:'started','CLIENT REVIEW':'review','FINAL PAYMENT':'final',DELIVERED:'delivered'};
const COOKIE='__Host-aura_project';
const initialized=new WeakMap();
async function ensureSchema(db){if(!initialized.has(db)){const task=(async()=>{await initializeDatabase(db);await db.batch(PROJECT_SCHEMA.map(sql=>db.prepare(sql)));const columns=await db.prepare("PRAGMA table_info(project_emails)").all();if(!columns.results.some(column=>column.name==='payload_json'))await db.prepare("ALTER TABLE project_emails ADD COLUMN payload_json TEXT NOT NULL DEFAULT ''").run();await db.prepare('INSERT OR IGNORE INTO project_catalog(id,catalog_json) VALUES(1,?)').bind(JSON.stringify(INITIAL_CATALOG)).run();})().catch(error=>{initialized.delete(db);throw error;});initialized.set(db,task);}await initialized.get(db);}
async function catalogRow(db){return db.prepare('SELECT * FROM project_catalog WHERE id=1').first();}
function present(row,admin=false){const out={id:row.id,client:JSON.parse(row.client_json),configuration:JSON.parse(row.configuration_json),quote:JSON.parse(row.quote_json),status:row.status,paid:row.paid,paymentUrl:row.payment_url,previewUrl:row.preview_url,revision:row.revision,createdAt:row.created_at,updatedAt:row.updated_at};if(admin)out.notes=row.notes;return out;}
async function details(db,id,admin=false){const row=await db.prepare('SELECT * FROM studio_projects WHERE id=?').bind(id).first();if(!row)return null;const [events,files,emails]=await db.batch([db.prepare('SELECT status,created_at FROM project_events WHERE project_id=? ORDER BY created_at,rowid').bind(id),db.prepare('SELECT id,name,mime,length(bytes) size FROM project_files WHERE project_id=?').bind(id),db.prepare('SELECT id,event,state,attempts,created_at FROM project_emails WHERE project_id=? ORDER BY created_at DESC').bind(id)]);return {...present(row,admin),timeline:events.results,files:files.results,emails:admin?emails.results:undefined};}
function decodeFiles(files){if(files===undefined)return [];if(!Array.isArray(files)||files.length>3)throw new ApiError(400,'Attach up to three files.');return files.map(file=>{if(!file||typeof file!=='object'||typeof file.data!=='string')throw new ApiError(400,'Invalid upload.');const name=clean(file.name,120).replace(/[\/\\]/g,'_'),mime=file.mime;const match=/^[A-Za-z0-9+/]+={0,2}$/.test(file.data||'');if(!name||!match||file.data.length>700000)throw new ApiError(400,'Invalid or oversized upload.');let bytes;try{bytes=Uint8Array.from(atob(file.data),c=>c.charCodeAt(0));}catch{throw new ApiError(400,'Invalid upload.');}const has=(values,offset=0)=>values.every((n,i)=>bytes[i+offset]===n);const valid=(mime==='image/png'&&has([137,80,78,71,13,10,26,10]))||(mime==='image/jpeg'&&has([255,216,255]))||(mime==='image/webp'&&has([82,73,70,70])&&has([87,69,66,80],8))||(mime==='application/pdf'&&has([37,80,68,70,45]));if(!valid||bytes.length>500*1024)throw new ApiError(400,'Use JPG, PNG, WebP or PDF, up to 500 KB per file.');return {id:crypto.randomUUID(),name,mime,bytes:bytes.buffer};});}
async function throttle(db,key,seconds=60){await db.prepare("DELETE FROM project_rate_limits WHERE created_at<datetime('now','-1 day')").run();const accepted=await db.prepare("INSERT INTO project_rate_limits(key) VALUES(?) ON CONFLICT(key) DO UPDATE SET created_at=datetime('now') WHERE project_rate_limits.created_at<=datetime('now',?) RETURNING key").bind(key,`-${seconds} seconds`).first();if(!accepted)throw new ApiError(429,'Please wait before sending another request.');}
async function session(request,db,id){const value=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';if(!/^[a-f0-9]{64}$/i.test(value))return false;return Boolean(await db.prepare("SELECT id FROM project_access WHERE project_id=? AND token_hash=? AND kind='session' AND expires_at>datetime('now')").bind(id,await tokenHash(value)).first());}
function allowedPaymentURL(value,env){if(!value)return '';const url=safeURL(value);if(!url||!url.startsWith('https:'))throw new ApiError(400,'Payment links must use HTTPS.');const hosts=String(env.PAYMENT_LINK_HOSTS||'').split(',').map(x=>x.trim()).filter(Boolean);if(!hosts.includes(new URL(url).hostname))throw new ApiError(400,'Configure PAYMENT_LINK_HOSTS with the exact trusted provider hostname first.');return url;}
export async function handleProjects(request,env,ctx){
 const url=new URL(request.url),path=url.pathname;
 if(!(path==='/api/website-pricing'||path.startsWith('/api/projects')||path.startsWith('/api/admin/studio')))return null;
 await ensureSchema(env.DB);const db=env.DB;
 if(path==='/api/website-pricing'&&request.method==='GET'){const row=await catalogRow(db);const cfCountry=request.cf?.country;return reply({catalog:JSON.parse(row.catalog_json),revision:row.revision,suggestedCountry:['TR','TN','US','GB'].includes(cfCountry)?cfCountry:'EU'});}
 if(!['GET','HEAD'].includes(request.method)&&!sameOrigin(request))return reply({error:'Invalid request origin.'},403);
 if(path==='/api/projects'&&request.method==='POST'){
  const body=await readJson(request,2200*1024),client=body.client||{},config=body.configuration||{};
  const key=clean(body.submissionKey,80);if(!/^[a-f0-9-]{36}$/i.test(key))return reply({error:'Invalid request key.'},400);
  const existing=await db.prepare('SELECT id FROM studio_projects WHERE submission_key=?').bind(key).first();if(existing)return reply({id:existing.id,duplicate:true},200);
  const data={name:clean(client.name,120),company:clean(client.company,160),email:clean(client.email,254).toLowerCase(),whatsapp:clean(client.whatsapp,50),industry:clean(client.industry,120),deadline:clean(client.deadline,30),website:safeURL(clean(client.website,500)),reference:safeURL(clean(client.reference,500)),description:clean(client.description,4000),budget:clean(client.budget,120)};
  if(!data.name||!emailValid(data.email)||!data.whatsapp||!data.description)return reply({error:'Add your name, a valid email, WhatsApp number and project description.'},400);
  const product=clean(config.product,40)||'Website';if(!['Website','Dashboard','E-commerce','AuraMenu','AuraPops','AuraWeddings','NFC','Automation','Other'].includes(product))return reply({error:'Invalid product.'},400);
  const row=await catalogRow(db);let quote;try{quote=calculateQuote(config,JSON.parse(row.catalog_json));}catch(error){return reply({error:error.message},400);}if(product!=='Website')quote={...quote,amount:null,state:'Custom Quote',delivery:null};
  const files=decodeFiles(body.files);await throttle(db,`submit:${await tokenHash(data.email)}`,120);
  const id=`AD-${crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()}`;
  const configuration={package:config.package,pages:config.pages,design:config.design,country:config.country,features:[...new Set(config.features)],product,context:clean(config.context,500),catalogRevision:row.revision};
  await db.batch([db.prepare("INSERT INTO clients(name,company,email,phone,service,status,notes) SELECT ?,?,?,?,?,'lead',? WHERE NOT EXISTS(SELECT 1 FROM clients WHERE email=?)").bind(data.name,data.company,data.email,data.whatsapp,product,`[${id}] ${data.description}`,data.email),db.prepare('INSERT INTO studio_projects(id,client_json,configuration_json,quote_json,submission_key) VALUES(?,?,?,?,?)').bind(id,JSON.stringify(data),JSON.stringify(configuration),JSON.stringify(quote),key),db.prepare("INSERT INTO project_events(id,project_id,status,actor) VALUES(?,?,'NEW REQUEST','customer')").bind(crypto.randomUUID(),id),...files.map(f=>db.prepare('INSERT INTO project_files(id,project_id,name,mime,bytes) VALUES(?,?,?,?,?)').bind(f.id,id,f.name,f.mime,f.bytes))]);
  // Durable record exists before any provider call. Returning success never depends on email delivery.
  try{queueRequestNotification(ctx,env,{requestType:product,requestId:id,businessName:data.company||data.name,contactName:data.name,customerEmail:data.email,phone:data.whatsapp,dashboardUrl:'https://auradigitalworks.com/admin/#projects',details:[['Scope',data.description],['Country',config.country]]});await queueProjectEmail(env,ctx,id,'request');}catch{console.warn('Project email queue unavailable');}
  return reply({id,quote,email:env.RESEND_API_KEY?'queued':'not_configured',message:'Request received. Keep this project ID. Secure access will arrive by email; contact us with the ID if it does not.'},201);
 }
 if(path==='/api/projects/access'&&request.method==='POST'){
  const body=await readJson(request,1024),id=clean(body.id,30),email=clean(body.email,254).toLowerCase();
  await throttle(db,`access:${await tokenHash(id+email)}`,120);
  const row=await db.prepare('SELECT client_json FROM studio_projects WHERE id=?').bind(id).first();
  if(row&&JSON.parse(row.client_json).email===email){try{await queueProjectEmail(env,ctx,id,'access');}catch{}}
  return reply({message:'If these details match a project, a secure access email will be sent.'},202);
 }
 if(path==='/api/projects/logout'&&request.method==='POST'){
  const token=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';
  if(token)await db.prepare("DELETE FROM project_access WHERE token_hash=? AND kind='session'").bind(await tokenHash(token)).run();
  return json({ok:true},200,{...noStore,'Set-Cookie':`${COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict`});
 }
 const exchange=/^\/api\/projects\/([^/]+)\/session$/.exec(path);
 if(exchange&&request.method==='POST'){
  const body=await readJson(request,1024);if(!/^[a-f0-9]{64}$/i.test(body.token||''))return reply({error:'This access link is invalid or expired.'},401);
  const hash=await tokenHash(body.token);
  const invite=await db.prepare("DELETE FROM project_access WHERE project_id=? AND token_hash=? AND kind='invite' AND expires_at>datetime('now') RETURNING id").bind(exchange[1],hash).first();
  if(!invite)return reply({error:'This access link is invalid or expired.'},401);
  const token=newMenuToken();await db.prepare("INSERT INTO project_access(id,project_id,token_hash,kind,expires_at) VALUES(?,?,?,'session',datetime('now','+8 hours'))").bind(crypto.randomUUID(),exchange[1],await tokenHash(token)).run();
  return json({ok:true},200,{...noStore,'Set-Cookie':`${COOKIE}=${token}; Path=/; Max-Age=28800; Secure; HttpOnly; SameSite=Strict`});
 }
 const customer=/^\/api\/projects\/([^/]+)(?:\/files\/([^/]+))?$/.exec(path);
 if(customer){if(!await session(request,db,customer[1]))return reply({error:'Sign in through your secure email link.'},401);if(request.method==='GET'){if(customer[2])return serveFile(db,customer[1],customer[2]);const project=await details(db,customer[1]);return project?reply({project}):reply({error:'Project unavailable.'},404);}}
 if(!path.startsWith('/api/admin/studio'))return reply({error:'Not found.'},404);
 const admin=await getAuthenticatedAdmin(request,db);if(!admin)return reply({error:'Unauthorized.'},401);if(request.method!=='GET'&&admin.role==='viewer')return reply({error:'Read-only account.'},403);
 if(path==='/api/admin/studio/pricing'){
  if(request.method==='GET'){const row=await catalogRow(db);return reply({catalog:JSON.parse(row.catalog_json),revision:row.revision});}
  if(request.method==='PUT'){const body=await readJson(request,16000);try{validateCatalog(body.catalog);}catch(e){return reply({error:e.message},400);}const result=await db.prepare("UPDATE project_catalog SET catalog_json=?,revision=revision+1,updated_at=datetime('now') WHERE id=1 AND revision=?").bind(JSON.stringify(body.catalog),Number(body.revision)).run();return result.meta.changes?reply({ok:true}):reply({error:'Pricing changed in another session. Reload before saving.'},409);}
 }
 if(path==='/api/admin/studio/projects'&&request.method==='GET'){const status=url.searchParams.get('status')||'',search=clean(url.searchParams.get('q'),100);const rows=await db.prepare("SELECT * FROM studio_projects WHERE (?='' OR status=?) AND (?='' OR id LIKE ? OR client_json LIKE ?) ORDER BY created_at DESC LIMIT 200").bind(status,status,search,`%${search}%`,`%${search}%`).all();return reply({projects:rows.results.map(row=>present(row,true))});}
 if(path==='/api/admin/studio/overview'&&request.method==='GET'){const rows=(await db.prepare('SELECT status,quote_json,paid FROM studio_projects').all()).results;const revenue={};for(const r of rows){const q=JSON.parse(r.quote_json);revenue[q.currency]=(revenue[q.currency]||0)+r.paid;}return reply({total:rows.length,new:rows.filter(r=>r.status==='NEW REQUEST').length,active:rows.filter(r=>['DESIGN','DEVELOPMENT','CLIENT REVIEW'].includes(r.status)).length,pending:rows.filter(r=>{const q=JSON.parse(r.quote_json);return q.amount!==null&&q.amount>r.paid;}).length,conversion:rows.length?Math.round(rows.filter(r=>STATUSES.indexOf(r.status)>=3).length/rows.length*100):0,revenue});}
 const retry=/^\/api\/admin\/studio\/emails\/([^/]+)\/retry$/.exec(path);if(retry&&request.method==='POST'){const row=await db.prepare('SELECT state FROM project_emails WHERE id=?').bind(retry[1]).first();if(!row)return reply({error:'Email not found.'},404);if(!['failed','not_configured','queued'].includes(row.state))return reply({error:'Only pending or failed emails may be retried.'},409);if(ctx?.waitUntil)ctx.waitUntil(deliverProjectEmail(env,retry[1]));return reply({ok:true});}
 const match=/^\/api\/admin\/studio\/projects\/([^/]+)(?:\/files\/([^/]+)|\/email)?$/.exec(path);
 if(match){const id=match[1];if(match[2]&&request.method==='GET')return serveFile(db,id,match[2]);if(request.method==='GET'){const project=await details(db,id,true);return project?reply({project}):reply({error:'Project not found.'},404);}
  if(path.endsWith('/email')&&request.method==='POST'){const body=await readJson(request,1024);if(!['quote','updated','design','information','access','payment'].includes(body.event))return reply({error:'Invalid email event.'},400);const project=await details(db,id,true);if(!project)return reply({error:'Project not found.'},404);if(body.event==='payment'&&!project.paymentUrl)return reply({error:'Set a trusted payment provider link first.'},400);if(body.event==='quote'&&project.quote.amount===null)return reply({error:'Set a reviewed price before sending a quote.'},400);await queueProjectEmail(env,ctx,id,body.event);return reply({ok:true});}
  if(request.method==='PATCH'){
   const current=await db.prepare('SELECT * FROM studio_projects WHERE id=?').bind(id).first();if(!current)return reply({error:'Project not found.'},404);
   const body=await readJson(request,12000);if(Number(body.revision)!==current.revision)return reply({error:'Project changed in another session. Reload before saving.'},409);
   const status=body.status||current.status;if(!STATUSES.includes(status))return reply({error:'Invalid project status.'},400);
   const quote=JSON.parse(current.quote_json);let priceChanged=false;
   if(body.amount!==undefined){if(body.amount===null||!Number.isFinite(body.amount)||body.amount<=0||body.amount>1e8)return reply({error:'Invalid reviewed price.'},400);priceChanged=quote.amount!==body.amount;quote.amount=body.amount;quote.state='Reviewed Quote';}
   if(body.paymentStages!==undefined){if(!Array.isArray(body.paymentStages)||body.paymentStages.length<1||body.paymentStages.length>5||body.paymentStages.some(n=>!Number.isInteger(n)||n<=0)||body.paymentStages.reduce((a,b)=>a+b,0)!==100)return reply({error:'Payment stages must total 100%.'},400);quote.paymentStages=body.paymentStages;}
   if(status==='QUOTE SENT'&&quote.amount===null)return reply({error:'Set a reviewed price before sending a quote.'},400);
   const paid=body.paid===undefined?current.paid:body.paid;if(!Number.isFinite(paid)||paid<0||(paid>0&&(quote.amount===null||paid>quote.amount)))return reply({error:'Paid amount must be between zero and the project total.'},400);
   const paymentUrl=body.paymentUrl===undefined?current.payment_url:allowedPaymentURL(body.paymentUrl,env),previewUrl=body.previewUrl===undefined?current.preview_url:safeURL(body.previewUrl);
   if(body.previewUrl&& !previewUrl)return reply({error:'Enter a valid preview URL.'},400);
   const result=await db.batch([db.prepare("UPDATE studio_projects SET quote_json=?,status=?,notes=?,paid=?,payment_url=?,preview_url=?,revision=revision+1,updated_at=datetime('now') WHERE id=? AND revision=?").bind(JSON.stringify(quote),status,body.notes===undefined?current.notes:clean(body.notes,4000),paid,paymentUrl,previewUrl,id,current.revision),db.prepare('INSERT INTO project_events(id,project_id,status,actor) SELECT ?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),id,status,admin.username)]);
   if(!result[0].meta.changes)return reply({error:'Project changed in another session.'},409);
   const event=priceChanged?'updated':status!==current.status?EVENT[status]:null;if(event)try{await queueProjectEmail(env,ctx,id,event);}catch{}
   return reply({ok:true});
  }
 }
 return reply({error:'Not found.'},404);
}
async function serveFile(db,project,id){const file=await db.prepare('SELECT * FROM project_files WHERE project_id=? AND id=?').bind(project,id).first();if(!file)return reply({error:'File not found.'},404);const bytes=file.bytes instanceof ArrayBuffer?file.bytes:Uint8Array.from(file.bytes).buffer;const filename=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');return new Response(bytes,{headers:{...noStore,'Content-Type':file.mime,'Content-Disposition':`attachment; filename="${filename}"`,'X-Content-Type-Options':'nosniff'}});}
