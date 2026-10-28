import { ApiError, json, readJson } from './http.js';
import { authenticatedCustomer, tokenHash } from './customer-accounts.ts';
import { sameOrigin } from './security.js';
import { randomToken, requireVerified, isEmailVerified, identityOrigin, sendIdentityEmail } from './customer-identity.js';
import { validateProfile, diagnose, simulate, capabilities } from './growth-engine.js';
const epoch=()=>Math.floor(Date.now()/1000);
const roles=['admin','member','viewer'];
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const billing={status:'BLOCKED',enabled:false,priceMinor:500,currency:'USD',interval:'month',payer:'invited_member',reason:'A supported recurring provider, signed webhooks, tax configuration and cancellation/refund policy must be configured and verified before paid access is released.'};
// Every authorization is resolved from current database rows. No role or entitlement from the browser is used.
export function accessGuard(db,org,user,permission='workspace:read') {
 return {sql:`EXISTS(SELECT 1 FROM organizations ao WHERE ao.id=? AND (ao.owner_id=? OR EXISTS(
 SELECT 1 FROM organization_members am JOIN member_subscriptions s ON s.membership_id=am.id
 JOIN customer_users au ON au.id=am.customer_id
 JOIN organization_invitations ai ON ai.id=s.invitation_id AND ai.organization_id=am.organization_id AND ai.accepted_by=am.customer_id AND ai.email=au.email COLLATE NOCASE AND ai.status='accepted' AND ai.consent_version='seat-5-usd-month-v1'
 JOIN customer_verified_emails v ON v.customer_id=au.id AND v.email=au.email COLLATE NOCASE
 JOIN organization_permissions p ON p.role_id=am.role_id AND p.permission=?
 WHERE am.organization_id=ao.id AND am.customer_id=? AND am.status='active' AND au.active=1
 AND s.payer_customer_id=am.customer_id AND s.provider<>'unconfigured' AND s.provider_subscription_id IS NOT NULL
 AND s.state IN ('active','past_due','canceled') AND s.entitlement_until>?
 AND NOT EXISTS(SELECT 1 FROM json_each(am.permissions_json) WHERE value=?))))`,args:[org,user.id,permission,user.id,epoch(),permission]};
}
async function authorize(db,org,user,permission='workspace:read') {
 if(!uuid(org))throw new ApiError(404,'Workspace not found.');
 const guard=accessGuard(db,org,user,permission);
 if(!await db.prepare(`SELECT id FROM organizations WHERE id=? AND ${guard.sql}`).bind(org,...guard.args).first())throw new ApiError(404,'Workspace not found or access unavailable.');
 return guard;
}
function audit(db,org,user,action,target=null) {return db.prepare('INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action,target_id) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),org,user.id,action,target);}
async function owner(db,org,user) {
 await requireVerified(db,user);
 if(!await db.prepare('SELECT id FROM organizations WHERE id=? AND owner_id=?').bind(org,user.id).first())throw new ApiError(403,'Only the verified business owner can manage the team.');
}
async function limit(request,env,user) {
 if(!env.HUB_WRITE_RATE_LIMITER?.limit)throw new ApiError(503,'Workspace writes are temporarily unavailable.');
 if(!(await env.HUB_WRITE_RATE_LIMITER.limit({key:'hub-write:'+user.id})).success)throw new ApiError(429,'Too many changes. Please wait.');
}
async function invite(env,org,user,body) {
 if(!env.CONTACT_RATE_LIMITER?.limit)throw new ApiError(503,'Invitation delivery unavailable.');
 if(!(await env.CONTACT_RATE_LIMITER.limit({key:'hub-invite:'+user.id})).success)throw new ApiError(429,'Too many invitations. Please wait.');
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!roles.includes(body.role)||typeof (body.message??'')!=='string'||(body.message||'').length>800)throw new ApiError(400,'Enter a valid email, role and invitation message.');
 if(email===user.email.toLowerCase())throw new ApiError(409,'The owner is already included.');
 const active=await env.DB.prepare("SELECT m.id FROM organization_members m JOIN customer_users u ON u.id=m.customer_id WHERE m.organization_id=? AND u.email=? COLLATE NOCASE AND m.status<>'removed'").bind(org,email).first();
 if(active)throw new ApiError(409,'This person already has a membership.');
 const name=(await env.DB.prepare('SELECT name FROM organizations WHERE id=?').bind(org).first()).name;
 const origin=identityOrigin(env),id=crypto.randomUUID(),token=randomToken(),hash=await tokenHash(token),expires=epoch()+7*86400;
 if(env.CUSTOMER_EMAIL_ENABLED!=='true'||!env.RESEND_API_KEY)throw new ApiError(503,'Invitation email is not configured and verified.');
 const statements=[env.DB.prepare("UPDATE organization_invitations SET status='expired' WHERE organization_id=? AND email=? AND status='pending' AND expires_at<=?").bind(org,email,epoch()),env.DB.prepare("INSERT OR IGNORE INTO organization_invitations(id,organization_id,invited_by,email,role_id,message,token_hash,expires_at) VALUES(?,?,?,?,?,?,?,?)").bind(id,org,user.id,email,body.role,body.message||'',hash,expires)];
 const results=await env.DB.batch(statements);if(!results[1].meta.changes)throw new ApiError(409,'A pending invitation already exists. Cancel it before inviting again.');
 const permissions=(await env.DB.prepare('SELECT permission FROM organization_permissions WHERE role_id=?').bind(body.role).all()).results.map(p=>p.permission);
 try {
  await sendIdentityEmail(env,email,`Invitation to ${String(name).replace(/[\r\n]/g,' ')} — AuraDigital`,`${name} invites you as ${body.role}.\nPermissions: ${permissions.map(p=>({'workspace:read':'Read the shared business workspace','profile:write':'Edit the business profile','roadmap:write':'Edit the business roadmap','simulation:write':'Create growth scenarios','auri:use':'Use scoped AURI guidance'})[p]||'Restricted access').join(', ')}.\n\n${body.message||''}\n\nEach additional member pays $5 USD per month for their own recurring subscription. Taxes, if applicable, must be disclosed at checkout. The owner is not the default payer. Sign in with this exact verified email and explicitly accept the invitation and recurring terms. Access activates only after trusted backend payment verification. Live recurring checkout is currently BLOCKED; accepting does not charge you or grant workspace access.\n\nOpen: ${origin}/hub/invitation#token=${token}\nExpires: ${new Date(expires*1000).toISOString()}. The link is single-use.`,id);
  await env.DB.prepare("UPDATE organization_invitations SET delivery_status='sent' WHERE id=?").bind(id).run();
 }catch(error){await env.DB.prepare("UPDATE organization_invitations SET delivery_status='failed',status='canceled' WHERE id=? AND status='pending'").bind(id).run();throw error;}
 await audit(env.DB,org,user,'invitation_sent',id).run();return json({invitation:{id,email,role:body.role,status:'pending',expiresAt:expires},billing},201);
}
async function invitation(request,env,user,body,accept) {
 await requireVerified(env.DB,user);
 if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))throw new ApiError(400,'Invalid invitation.');
 const hash=await tokenHash(body.token);
 const row=await env.DB.prepare("SELECT i.*,o.name,o.owner_id FROM organization_invitations i JOIN organizations o ON o.id=i.organization_id WHERE i.token_hash=? AND i.email=? COLLATE NOCASE AND i.status='pending' AND i.expires_at>?").bind(hash,user.email,epoch()).first();
 if(!row)throw new ApiError(404,'Invitation unavailable, expired or issued to a different email.');
 const permissions=(await env.DB.prepare('SELECT permission FROM organization_permissions WHERE role_id=?').bind(row.role_id).all()).results.map(p=>p.permission);
 if(!accept)return json({invitation:{business:row.name,role:row.role_id,email:row.email,message:row.message,expiresAt:row.expires_at,permissions},billing});
 if(body.acceptInvitation!==true||body.acceptRecurring!==true||body.consentVersion!=='seat-5-usd-month-v1')throw new ApiError(400,'Explicit invitation and recurring subscription acceptance is required.');
 const operation=crypto.randomUUID(),membership=crypto.randomUUID();
 // One batch is atomic. A replay or cancellation cannot create a membership.
 const accepted=`SELECT 1 FROM organization_invitations WHERE id=? AND accepted_by=? AND acceptance_id=? AND status='accepted'`;
 const args=[row.id,user.id,operation];
 const results=await env.DB.batch([
  env.DB.prepare("UPDATE organization_invitations SET status='accepted',accepted_by=?,accepted_at=datetime('now'),consent_version='seat-5-usd-month-v1',acceptance_id=? WHERE id=? AND status='pending' AND expires_at>? AND email=? COLLATE NOCASE").bind(user.id,operation,row.id,epoch(),user.email),
  env.DB.prepare(`INSERT INTO organization_members(id,organization_id,customer_id,role_id) SELECT ?,?,?,? WHERE EXISTS(${accepted}) ON CONFLICT(organization_id,customer_id) DO UPDATE SET status='pending',role_id=excluded.role_id,permissions_json='[]',removed_at=NULL WHERE organization_members.status='removed'`).bind(membership,row.organization_id,user.id,row.role_id,...args),
  // There is deliberately no active subscription or checkout URL from an unconfigured provider.
  audit(env.DB,row.organization_id,user,'invitation_accepted_pending_payment',row.id),
 ]);
 if(!results[0].meta.changes)throw new ApiError(409,'Invitation already used or canceled.');
 return json({accepted:true,access:false,billing},202);
}
export async function handleBusinessHub(request,env) {
 const url=new URL(request.url),path=url.pathname;
 if(['/hub/app.js','/hub/hub.css'].includes(path)&&['GET','HEAD'].includes(request.method))return env.ASSETS.fetch(request);
 if(path==='/hub'||path.startsWith('/hub/')) {
  if(!['GET','HEAD'].includes(request.method))throw new ApiError(405,'Method not allowed.');
  const asset=await env.ASSETS.fetch(new Request(new URL('/hub/index.html',url)));
  const headers=new Headers(asset.headers);headers.set('Cache-Control','private, no-store');headers.set('X-Robots-Tag','noindex, nofollow');
  return new Response(request.method==='HEAD'?null:asset.body,{status:asset.status,headers});
 }
 if(!path.startsWith('/api/hub/'))return null;
 const user=await authenticatedCustomer(request,env);if(!user)throw new ApiError(401,'Sign in to your AuraDigital account.');
 const write=!['GET','HEAD'].includes(request.method);
 if(write){if(!sameOrigin(request))throw new ApiError(403,'Forbidden origin.');await limit(request,env,user);}
 if(path==='/api/hub/workspaces'&&request.method==='GET') {
  // Only entitled memberships are included; pending invites are not shared workspaces.
  const owned=(await env.DB.prepare('SELECT id,name,mode FROM organizations WHERE owner_id=? ORDER BY created_at,id').bind(user.id).all()).results;
  const candidates=(await env.DB.prepare("SELECT o.id,o.name,o.mode FROM organizations o JOIN organization_members m ON m.organization_id=o.id WHERE m.customer_id=? AND m.status='active' ORDER BY o.created_at LIMIT 100").bind(user.id).all()).results;
  const shared=[];for(const o of candidates){try{await authorize(env.DB,o.id,user);shared.push({...o,owner:false});}catch(e){if(e.status!==404)throw e;}}
  return json({user:{id:user.id,name:user.name,email:user.email,verified:await isEmailVerified(env.DB,user)},workspaces:[...owned.map(o=>({...o,owner:true})),...shared],billing});
 }
 if(path==='/api/hub/workspaces'&&request.method==='POST') {
  const body=await readJson(request,16000),profile=validateProfile(body.profile),id=crypto.randomUUID();
  if(!['myself','auri'].includes(body.mode))throw new ApiError(400,'Choose an onboarding mode.');
  const result=await env.DB.prepare('INSERT INTO organizations(id,owner_id,name,profile_json,mode) SELECT ?,?,?,?,? WHERE (SELECT count(*) FROM organizations WHERE owner_id=?)<10').bind(id,user.id,profile.name,JSON.stringify(profile),body.mode,user.id).run();
  if(!result.meta.changes)throw new ApiError(409,'Workspace limit reached.');return json({id},201);
 }
 if(['/api/hub/invitations/preview','/api/hub/invitations/accept'].includes(path)&&request.method==='POST')return invitation(request,env,user,await readJson(request,4096),path.endsWith('/accept'));
 const match=/^\/api\/hub\/workspaces\/([a-f0-9-]{36})(?:\/(profile|diagnosis|missions|scenarios|team|invitations|activity|auri)(?:\/([a-f0-9-]{36}))?)?$/.exec(path);
 if(!match)throw new ApiError(404,'Not found.');
 const [,org,section,item]=match;
 await authorize(env.DB,org,user);
 if(!section&&request.method==='GET'){
  const guard=accessGuard(env.DB,org,user),o=await env.DB.prepare(`SELECT id,name,profile_json,mode,version,owner_id FROM organizations WHERE id=? AND ${guard.sql}`).bind(org,...guard.args).first();
  if(!o)throw new ApiError(404,'Workspace unavailable.');
  await env.DB.prepare("INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action) SELECT ?,?,?,'workspace_opened' WHERE NOT EXISTS(SELECT 1 FROM member_access_audit_logs WHERE organization_id=? AND actor_id=? AND action='workspace_opened' AND created_at>=date('now'))").bind(crypto.randomUUID(),org,user.id,org,user.id).run();
  const profile=JSON.parse(o.profile_json),analysis=diagnose(profile);
  const missions=(await env.DB.prepare('SELECT id,data_json,status,position,version FROM business_missions WHERE organization_id=? ORDER BY position,id').bind(org).all()).results.map(m=>({...JSON.parse(m.data_json),capability:JSON.parse(m.data_json).id,id:m.id,status:m.status,position:m.position,version:m.version}));
  const perms=o.owner_id===user.id?['profile:write','roadmap:write','simulation:write','team:manage','workspace:read','auri:use']:(await env.DB.prepare(`SELECT p.permission FROM organization_permissions p JOIN organization_members m ON p.role_id=m.role_id WHERE m.organization_id=? AND m.customer_id=? AND NOT EXISTS(SELECT 1 FROM json_each(m.permissions_json) WHERE value=p.permission)`).bind(org,user.id).all()).results.map(p=>p.permission);
  return json({organization:{id:o.id,name:o.name,mode:o.mode,version:o.version,owner:o.owner_id===user.id},profile,analysis,missions,permissions:perms,billing});
 }
 if(section==='profile'&&request.method==='PUT') {
  const guard=await authorize(env.DB,org,user,'profile:write'),b=await readJson(request,16000),profile=validateProfile(b.profile);
  if(!['myself','auri'].includes(b.mode)||!Number.isInteger(b.version))throw new ApiError(400,'Invalid profile revision.');
  const result=await env.DB.prepare(`UPDATE organizations SET name=?,profile_json=?,mode=?,version=version+1,updated_at=datetime('now') WHERE id=? AND version=? AND ${guard.sql}`).bind(profile.name,JSON.stringify(profile),b.mode,org,b.version,...guard.args).run();
  if(!result.meta.changes)throw new ApiError(409,'The profile changed or access was revoked. Reload before saving.');return json({saved:true});
 }
 if(section==='diagnosis'&&request.method==='GET')return json(diagnose(JSON.parse((await env.DB.prepare('SELECT profile_json FROM organizations WHERE id=?').bind(org).first()).profile_json)));
 if(section==='missions'&&!item&&request.method==='POST') {
  const guard=await authorize(env.DB,org,user,'roadmap:write');const body=await readJson(request,2048);
  if(body.services!==undefined&&(!Array.isArray(body.services)||body.services.length>capabilities.length||body.services.some(id=>!capabilities.some(c=>c.id===id))))throw new ApiError(400,'Invalid selected services.');
  const profile=JSON.parse((await env.DB.prepare('SELECT profile_json FROM organizations WHERE id=?').bind(org).first()).profile_json),analysis=diagnose(profile);
  await env.DB.batch(analysis.missions.filter(m=>body.services===undefined||body.services.includes(m.id)).map((m,i)=>env.DB.prepare(`INSERT OR IGNORE INTO business_missions(id,organization_id,capability,data_json,position) SELECT ?,?,?,?,? WHERE ${guard.sql}`).bind(crypto.randomUUID(),org,m.id,JSON.stringify(m),i,...guard.args)));
  return json({saved:true});
 }
 if(section==='missions'&&item&&request.method==='PATCH') {
  const guard=await authorize(env.DB,org,user,'roadmap:write'),b=await readJson(request,6000);
  if(!['planned','in_progress','done','postponed'].includes(b.status)||!Number.isInteger(b.position)||b.position<0||b.position>1000||!Number.isInteger(b.version))throw new ApiError(400,'Invalid mission changes.');
  const current=await env.DB.prepare('SELECT data_json FROM business_missions WHERE id=? AND organization_id=?').bind(item,org).first();if(!current)throw new ApiError(404,'Mission not found.');
  const data=JSON.parse(current.data_json);
  if(b.direction!==undefined) {
   if(!['up','down'].includes(b.direction))throw new ApiError(400,'Invalid order direction.');
   const all=(await env.DB.prepare('SELECT id,position,version,data_json FROM business_missions WHERE organization_id=? ORDER BY position,id').bind(org).all()).results.filter(m=>JSON.parse(m.data_json).level===data.level);
   const index=all.findIndex(m=>m.id===item),neighbor=all[index+(b.direction==='up'?-1:1)];
   if(!neighbor)return json({saved:true});
   const currentRow=all[index];
   const r=await env.DB.prepare(`WITH eligible AS MATERIALIZED (SELECT id FROM business_missions WHERE organization_id=? AND ((id=? AND version=?) OR (id=? AND version=?))) UPDATE business_missions SET position=CASE WHEN id=? THEN ? ELSE ? END,version=version+1 WHERE organization_id=? AND id IN (SELECT id FROM eligible) AND (SELECT count(*) FROM eligible)=2 AND ${guard.sql}`).bind(org,item,b.version,neighbor.id,neighbor.version,item,neighbor.position,currentRow.position,org,...guard.args).run();
   if(r.meta.changes!==2)throw new ApiError(409,'Mission order changed. Reload before moving.');return json({saved:true});
  }
  for(const [key,max] of Object.entries({objective:160,description:1600,nextAction:500}))if(b[key]!==undefined){if(typeof b[key]!=='string'||!b[key].trim()||b[key].length>max)throw new ApiError(400,'Invalid mission text.');data[key]=b[key].trim();}
  const result=await env.DB.prepare(`UPDATE business_missions SET data_json=?,status=?,position=?,version=version+1 WHERE id=? AND organization_id=? AND version=? AND ${guard.sql}`).bind(JSON.stringify(data),b.status,b.position,item,org,b.version,...guard.args).run();
  if(!result.meta.changes)throw new ApiError(409,'Mission changed or access revoked.');return json({saved:true});
 }
 if(section==='scenarios'&&request.method==='GET')return json({scenarios:(await env.DB.prepare('SELECT id,name,inputs_json,results_json,formula_version,created_at FROM growth_scenarios WHERE organization_id=? ORDER BY created_at DESC,id LIMIT 100').bind(org).all()).results.map(s=>({id:s.id,name:s.name,inputs:JSON.parse(s.inputs_json),result:JSON.parse(s.results_json),createdAt:s.created_at}))});
 if(section==='scenarios'&&request.method==='POST') {
  const guard=await authorize(env.DB,org,user,'simulation:write'),b=await readJson(request,12000),result=simulate(b.inputs),id=crypto.randomUUID();
  if(typeof b.name!=='string'||!b.name.trim()||b.name.length>120)throw new ApiError(400,'Name this scenario.');
  const saved=await env.DB.prepare(`INSERT INTO growth_scenarios(id,organization_id,created_by,name,inputs_json,results_json,formula_version) SELECT ?,?,?,?,?,?,? WHERE ${guard.sql} AND (SELECT count(*) FROM growth_scenarios WHERE organization_id=?)<100`).bind(id,org,user.id,b.name,JSON.stringify(result.inputs),JSON.stringify(result),result.formulaVersion,...guard.args,org).run();
  if(!saved.meta.changes)throw new ApiError(409,'Scenario limit reached or access revoked.');return json({id,result},201);
 }
 if(['team','invitations','activity'].includes(section)) {
  await owner(env.DB,org,user);
  if(section==='team'&&!item&&request.method==='GET') {
   const members=(await env.DB.prepare(`SELECT m.id,u.full_name AS name,u.email,m.role_id AS role,m.status,m.permissions_json,s.state AS subscriptionStatus,s.next_payment_at AS nextPaymentAt FROM organization_members m JOIN customer_users u ON u.id=m.customer_id LEFT JOIN member_subscriptions s ON s.membership_id=m.id WHERE m.organization_id=? ORDER BY m.created_at`).bind(org).all()).results;
   const invitations=(await env.DB.prepare('SELECT id,email,role_id AS role,status,expires_at AS expiresAt,delivery_status AS deliveryStatus FROM organization_invitations WHERE organization_id=? ORDER BY created_at DESC LIMIT 100').bind(org).all()).results.map(i=>({...i,status:i.status==='pending'&&i.expiresAt<=epoch()?'expired':i.status}));
   return json({members:members.map(m=>({...m,deniedPermissions:JSON.parse(m.permissions_json),permissions_json:undefined})),invitations,billing});
  }
  if(section==='invitations'&&!item&&request.method==='POST')return invite(env,org,user,await readJson(request,5000));
  if(section==='invitations'&&item&&request.method==='DELETE') {
   const r=await env.DB.prepare("UPDATE organization_invitations SET status='canceled' WHERE id=? AND organization_id=? AND status='pending'").bind(item,org).run();if(!r.meta.changes)throw new ApiError(404,'Pending invitation not found.');await audit(env.DB,org,user,'invitation_canceled',item).run();return json({canceled:true});
  }
  if(section==='team'&&item&&request.method==='PATCH') {
   const b=await readJson(request,2000);if(!roles.includes(b.role)||!Array.isArray(b.deniedPermissions)||b.deniedPermissions.length>20||b.deniedPermissions.some(p=>!['profile:write','roadmap:write','simulation:write','workspace:read','auri:use'].includes(p)))throw new ApiError(400,'Invalid role or permission restrictions.');
   const r=await env.DB.prepare("UPDATE organization_members SET role_id=?,permissions_json=? WHERE id=? AND organization_id=? AND status<>'removed'").bind(b.role,JSON.stringify([...new Set(b.deniedPermissions)]),item,org).run();if(!r.meta.changes)throw new ApiError(404,'Member not found.');await audit(env.DB,org,user,'member_permissions_changed',item).run();return json({saved:true});
  }
  if(section==='team'&&item&&request.method==='DELETE') {
   // No external provider is supported in this increment. Never falsely report a live cancellation.
   const live=await env.DB.prepare('SELECT s.id FROM member_subscriptions s JOIN organization_members m ON m.id=s.membership_id WHERE m.id=? AND m.organization_id=? AND s.provider_subscription_id IS NOT NULL').bind(item,org).first();
   const r=await env.DB.batch([
    env.DB.prepare("UPDATE organization_members SET status='removed',removed_at=datetime('now') WHERE id=? AND organization_id=? AND status<>'removed'").bind(item,org),
    env.DB.prepare("UPDATE member_subscriptions SET entitlement_until=0 WHERE membership_id IN(SELECT id FROM organization_members WHERE id=? AND organization_id=?)").bind(item,org),
    env.DB.prepare("UPDATE organization_invitations SET status='canceled' WHERE organization_id=? AND status='pending' AND email IN(SELECT u.email FROM customer_users u JOIN organization_members m ON m.customer_id=u.id WHERE m.id=? AND m.organization_id=?)").bind(org,item,org),
    audit(env.DB,org,user,'member_removed',item),
   ]);if(!r[0].meta.changes)throw new ApiError(404,'Member not found.');return json({removed:true,subscriptionCancellation:live?'BLOCKED_PROVIDER_RECONCILIATION_REQUIRED':'no_live_subscription'});
  }
  if(section==='activity'&&request.method==='GET')return json({events:(await env.DB.prepare('SELECT action,target_id,created_at FROM member_access_audit_logs WHERE organization_id=? ORDER BY created_at DESC,id LIMIT 100').bind(org).all()).results});
 }
 if(section==='auri'&&request.method==='POST') {
  await authorize(env.DB,org,user,'auri:use');const b=await readJson(request,4000);
  if(!['diagnosis','next_action','simulation'].includes(b.tool))throw new ApiError(400,'Choose an authorized AURI tool.');
  // Deterministic, narrowly scoped tools; no SQL, arbitrary tool names or provider output executes.
  const profile=JSON.parse((await env.DB.prepare('SELECT profile_json FROM organizations WHERE id=?').bind(org).first()).profile_json),analysis=diagnose(profile);
  const data=b.tool==='diagnosis'?analysis:b.tool==='simulation'?simulate(b.inputs):{nextAction:analysis.missions[0]||null};
  return json({mode:'rules',providerStatus:'NOT_INTEGRATED',tool:b.tool,data,notice:'AURI rules-based guidance. Generative business advice is not configured for this workspace.'});
 }
 throw new ApiError(405,'Method not allowed.');
}
