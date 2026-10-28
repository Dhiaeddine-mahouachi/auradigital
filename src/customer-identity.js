import { ApiError, json, readJson } from './http.js';
import { authenticatedCustomer, tokenHash, signInCustomer, ensureCustomers } from './customer-accounts.ts';
import { sameOrigin, hashPassword, validatePassword } from './security.js';
const now=()=>Math.floor(Date.now()/1000);
export const randomToken=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
const encode=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),x=>x.charCodeAt(0));
export async function isEmailVerified(db,user) {
 return !!await db.prepare('SELECT customer_id FROM customer_verified_emails WHERE customer_id=? AND email=? COLLATE NOCASE').bind(user.id,user.email).first();
}
export async function requireVerified(db,user) {if(!await isEmailVerified(db,user))throw new ApiError(403,'Verify your email before this action.');}
export function identityOrigin(env) {
 let u;try{u=new URL(env.CUSTOMER_AUTH_ORIGIN);}catch{throw new ApiError(503,'Customer identity origin is not configured.');}
 if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw new ApiError(503,'Customer identity origin is not configured.');
 return u.origin;
}
export async function sendIdentityEmail(env,email,subject,text,key) {
 if(!env.RESEND_API_KEY || env.CUSTOMER_EMAIL_ENABLED!=='true')throw new ApiError(503,'Customer email delivery is not configured and verified.');
 let response;
 try{response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:'AuraDigital <noreply@auradigitalworks.com>',to:[email],subject,text}),signal:AbortSignal.timeout(10000)});}catch{throw new ApiError(503,'Email delivery is temporarily unavailable.');}
 if(!response.ok){await response.body?.cancel();throw new ApiError(503,'Email delivery is temporarily unavailable.');}
 await response.body?.cancel();
}
async function rate(request,env,suffix) {
 if(!env.LOGIN_RATE_LIMITER)throw new ApiError(503,'Identity service unavailable.');
 const result=await env.LOGIN_RATE_LIMITER.limit({key:'identity:'+suffix+':'+(request.headers.get('CF-Connecting-IP')||'unknown')});
 if(!result.success)throw new ApiError(429,'Too many attempts. Please wait.',{'Retry-After':'60'});
}
export async function issueActionToken(env,user,purpose) {
 const origin=identityOrigin(env),token=randomToken(),hash=await tokenHash(token);
 await env.DB.prepare('INSERT INTO customer_action_tokens(token_hash,customer_id,email,purpose,expires_at,created_at) VALUES(?,?,?,?,?,?)').bind(hash,user.id,user.email,purpose,now()+(purpose==='verify'?86400:1800),now()).run();
 try{await sendIdentityEmail(env,user.email,purpose==='verify'?'Verify your AuraDigital email':'Reset your AuraDigital password',`Open this secure link: ${origin}/hub/${purpose}#token=${token}\n\nThis link is single-use and expires in ${purpose==='verify'?'24 hours':'30 minutes'}. If you did not request it, ignore this message.`,hash);}catch(error){await env.DB.prepare('DELETE FROM customer_action_tokens WHERE token_hash=?').bind(hash).run();throw error;}
}
async function consumeAction(env,body,purpose) {
 if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))throw new ApiError(400,'Invalid or expired link.');
 const hash=await tokenHash(body.token),operation=crypto.randomUUID();
 let password;
 if(purpose==='reset'){try{validatePassword(body.password);}catch(e){throw new ApiError(400,e.message);}password=await hashPassword(body.password);}
 const consume=env.DB.prepare(`UPDATE customer_action_tokens SET consumed_by=? WHERE token_hash=? AND purpose=? AND expires_at>? AND consumed_by IS NULL AND EXISTS(SELECT 1 FROM customer_users u WHERE u.id=customer_id AND u.email=customer_action_tokens.email COLLATE NOCASE AND u.active=1)`).bind(operation,hash,purpose,now());
 const valid=`SELECT customer_id FROM customer_action_tokens WHERE token_hash=? AND consumed_by=?`;
 const statements=[consume];
 if(purpose==='verify')statements.push(env.DB.prepare(`INSERT INTO customer_verified_emails(customer_id,email,source) SELECT customer_id,email,'email' FROM customer_action_tokens WHERE token_hash=? AND consumed_by=? ON CONFLICT(customer_id) DO UPDATE SET email=excluded.email,verified_at=datetime('now'),source='email'`).bind(hash,operation));
 else {
  statements.push(env.DB.prepare(`UPDATE customer_users SET password_hash=? WHERE id IN (${valid})`).bind(password,hash,operation));
  statements.push(env.DB.prepare(`DELETE FROM customer_sessions WHERE customer_id IN (${valid})`).bind(hash,operation));
  // All outstanding reset links become invalid after a successful reset.
  statements.push(env.DB.prepare(`UPDATE customer_action_tokens SET consumed_by=? WHERE purpose='reset' AND consumed_by IS NULL AND customer_id IN (${valid})`).bind(operation,hash,operation));
 }
 const result=await env.DB.batch(statements);
 if(!result[0].meta.changes)throw new ApiError(400,'Invalid or expired link.');
 return json({success:true});
}
let cachedKeys=null,keyExpiry=0;
export async function validateGoogleToken(jwt,clientId,nonce,keys) {
 try {
  if(typeof jwt!=='string'||jwt.length>20000)throw Error();
  const parts=jwt.split('.');if(parts.length!==3)throw Error();
  const header=JSON.parse(new TextDecoder().decode(decode(parts[0]))),claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));
  if(header.alg!=='RS256'||typeof header.kid!=='string')throw Error();
  const jwk=keys.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256')&&(!k.use||k.use==='sig'));if(!jwk)throw Error();
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error();
  if(!['https://accounts.google.com','accounts.google.com'].includes(claims.iss)||claims.aud!==clientId||(claims.azp&&claims.azp!==clientId)||!Number.isFinite(claims.exp)||claims.exp<=now()||!Number.isFinite(claims.iat)||claims.iat>now()+60||claims.exp-claims.iat>7200||(claims.nbf!==undefined&&(!Number.isFinite(claims.nbf)||claims.nbf>now()+60))||claims.nonce!==nonce||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>255||claims.email_verified!==true||typeof claims.email!=='string'||!/^\S+@\S+\.\S+$/.test(claims.email)||claims.email.length>254)throw Error();
  const email=claims.email.toLowerCase(),domain=email.split('@')[1];
  // Google is authoritative for Gmail and verified Workspace domains. Other
  // third-party email accounts must prove mailbox ownership through our email link.
  const authoritativeEmail=domain==='gmail.com'||(typeof claims.hd==='string'&&claims.hd.toLowerCase()===domain);
  return {subject:claims.sub,email,name:String(claims.name||claims.email).slice(0,100),authoritativeEmail};
 }catch{throw new ApiError(401,'Google identity verification failed.');}
}
async function googleKeys() {
 if(cachedKeys&&keyExpiry>Date.now())return cachedKeys;
 const response=await fetch('https://www.googleapis.com/oauth2/v3/certs',{signal:AbortSignal.timeout(10000),redirect:'error'});
 if(!response.ok)throw new ApiError(503,'Google identity service unavailable.');
 const result=await readJson(response,64000);if(!Array.isArray(result.keys))throw new ApiError(503,'Google identity service unavailable.');
 cachedKeys=result.keys;keyExpiry=Date.now()+300000;return cachedKeys;
}
const flowCookie=(value,age=600)=>`__Host-aura_oidc=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
async function google(request,env) {
 const url=new URL(request.url),origin=identityOrigin(env),callback=origin+'/api/customer/google/callback';
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||env.GOOGLE_LOGIN_ENABLED!=='true')throw new ApiError(503,'Google sign-in is not configured and verified.');
 if(url.origin!==origin)throw new ApiError(400,'Use the configured account origin.');
 await rate(request,env,'google');
 if(url.pathname.endsWith('/start')) {
  if(url.searchParams.get('acceptTerms')!=='true')throw new ApiError(400,'Accept the account conditions before using Google sign-in.');
  const user=await authenticatedCustomer(request,env);
  if(user)await requireVerified(env.DB,user);
  const state=randomToken(),binding=randomToken(),verifier=randomToken(),nonce=randomToken();
  await env.DB.batch([env.DB.prepare('DELETE FROM customer_oidc_flows WHERE expires_at<=?').bind(now()),env.DB.prepare('INSERT INTO customer_oidc_flows(state_hash,binding_hash,verifier,nonce,customer_id,expires_at,return_path) VALUES(?,?,?,?,?,?,?)').bind(await tokenHash(state),await tokenHash(binding),verifier,nonce,user?.id||null,now()+600,['/hub','/account','/shop/checkout'].includes(url.searchParams.get('next'))?url.searchParams.get('next'):(env.GROWTH_OS_ENABLED==='true'?'/hub':'/account'))]);
  const u=new URL('https://accounts.google.com/o/oauth2/v2/auth');
  for(const [k,v] of Object.entries({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'openid email profile',state,nonce,code_challenge:encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)))),code_challenge_method:'S256',prompt:'select_account'}))u.searchParams.set(k,v);
  return new Response(null,{status:303,headers:{Location:u.toString(),'Set-Cookie':flowCookie(binding),'Cache-Control':'no-store'}});
 }
 const state=url.searchParams.get('state')||'',binding=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-aura_oidc='))?.slice('__Host-aura_oidc='.length)||'';
 if(!/^[a-f0-9]{64}$/.test(state)||!/^[a-f0-9]{64}$/.test(binding))throw new ApiError(401,'Invalid Google sign-in state.');
 const flow=await env.DB.prepare('DELETE FROM customer_oidc_flows WHERE state_hash=? AND binding_hash=? AND expires_at>? RETURNING *').bind(await tokenHash(state),await tokenHash(binding),now()).first();
 if(!flow||!url.searchParams.get('code'))throw new ApiError(401,'Google sign-in expired or canceled.');
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,redirect_uri:callback,grant_type:'authorization_code',code:url.searchParams.get('code'),code_verifier:flow.verifier}),redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!response.ok){await response.body?.cancel();throw new ApiError(401,'Google sign-in failed.');}
 const result=await readJson(response,64000),identity=await validateGoogleToken(result.id_token,env.GOOGLE_CLIENT_ID,flow.nonce,await googleKeys());
 await ensureCustomers(env.DB);
 let user;
 const existing=await env.DB.prepare("SELECT u.id,u.email,u.full_name AS name,u.profile_json,u.active FROM customer_external_identities i JOIN customer_users u ON u.id=i.customer_id WHERE i.provider='google' AND i.subject=?").bind(identity.subject).first();
 if(flow.customer_id) {
  // Lax flow cookie survives Google's callback; the Strict customer cookie may not.
  // The initiation was bound to an authenticated, verified user. Recheck eligibility.
  user=await env.DB.prepare('SELECT id,email,full_name AS name,profile_json,active FROM customer_users WHERE id=?').bind(flow.customer_id).first();
  if(!user?.active||user.email.toLowerCase()!==identity.email||!await isEmailVerified(env.DB,user)||(existing&&existing.id!==user.id))throw new ApiError(409,'Sign in with your verified invited email to link this identity.');
  await env.DB.prepare("INSERT INTO customer_external_identities(provider,subject,customer_id) VALUES('google',?,?) ON CONFLICT(provider,subject) DO NOTHING").bind(identity.subject,user.id).run();
 }else if(existing){if(!existing.active)throw new ApiError(401,'Account unavailable.');user=existing;}
 else {
  const collision=await env.DB.prepare('SELECT id FROM customer_users WHERE email=? COLLATE NOCASE').bind(identity.email).first();
  if(collision)throw new ApiError(409,'Sign in with email first, verify it, then link Google from Settings.');
  const id=crypto.randomUUID();
  const statements=[env.DB.prepare("INSERT INTO customer_users(id,email,full_name,password_hash) VALUES(?,?,?,'!google-only')").bind(id,identity.email,identity.name),env.DB.prepare("INSERT INTO customer_external_identities(provider,subject,customer_id) VALUES('google',?,?)").bind(identity.subject,id)];
  if(identity.authoritativeEmail)statements.push(env.DB.prepare("INSERT INTO customer_verified_emails(customer_id,email,source) VALUES(?,?,'google')").bind(id,identity.email));
  await env.DB.batch(statements);
  user={id,email:identity.email,name:identity.name,profile_json:'{}'};
 }
 // Never overwrite a changed email on an established account merely from Google's email.
 const signed=await signInCustomer(env,{id:user.id,email:user.email,name:user.name,profile:JSON.parse(user.profile_json)});
 const headers=new Headers({'Location':origin+(['/hub','/account','/shop/checkout'].includes(flow.return_path)?flow.return_path:'/account'),'Cache-Control':'no-store'});headers.append('Set-Cookie',signed.headers.get('Set-Cookie'));headers.append('Set-Cookie',flowCookie('',0));
 return new Response(null,{status:303,headers});
}
export async function handleCustomerIdentity(request,env) {
 const path=new URL(request.url).pathname;
 if(!path.startsWith('/api/customer/'))return null;
 if(path==='/api/customer/capabilities'&&request.method==='GET')return json({growth:env.GROWTH_OS_ENABLED==='true',google:env.GOOGLE_LOGIN_ENABLED==='true'&&!!env.GOOGLE_CLIENT_ID&&!!env.GOOGLE_CLIENT_SECRET,email:env.CUSTOMER_EMAIL_ENABLED==='true'&&!!env.RESEND_API_KEY});
 if(['/api/customer/google/start','/api/customer/google/callback'].includes(path)) {
  if(request.method!=='GET')throw new ApiError(405,'Method not allowed.');return google(request,env);
 }
 const actions={'/api/customer/send-verification':'send','/api/customer/verify':'verify','/api/customer/forgot-password':'forgot','/api/customer/reset-password':'reset'};
 const action=actions[path];if(!action)return null;
 if(request.method!=='POST')throw new ApiError(405,'Method not allowed.');if(!sameOrigin(request))throw new ApiError(403,'Forbidden origin.');
 await rate(request,env,action);const body=await readJson(request,4096);
 if(action==='verify'||action==='reset')return consumeAction(env,body,action);
 if(action==='send'){
  const user=await authenticatedCustomer(request,env);if(!user)throw new ApiError(401,'Sign in to verify your email.');
  if(!await isEmailVerified(env.DB,user))await issueActionToken(env,user,'verify');return json({sent:true});
 }
 if(env.CUSTOMER_EMAIL_ENABLED!=='true'||!env.RESEND_API_KEY)throw new ApiError(503,'Password recovery email is not configured and verified.');
 if(typeof body.email!=='string'||body.email.length>254)throw new ApiError(400,'Enter your email.');
 const user=await env.DB.prepare('SELECT id,email FROM customer_users WHERE email=? COLLATE NOCASE AND active=1').bind(body.email.trim().toLowerCase()).first();
 // Reply identically for unknown accounts and provider failures; never log tokens or emails.
 if(user)try{await issueActionToken(env,user,'reset');}catch{console.warn(JSON.stringify({event:'identity_email_unavailable'}));}
 return json({message:'If an eligible account exists, a reset link will be sent.'});
}
