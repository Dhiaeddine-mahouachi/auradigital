import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { resolve,extname } from 'node:path';
import { d1 } from './d1.mjs';
import { ensureCustomers, tokenHash } from '../src/customer-accounts.ts';
import { handleBusinessHub } from '../src/business-hub.js';
import { handleCustomerIdentity } from '../src/customer-identity.js';
import { handleShop } from '../src/shop.ts';
import { ApiError } from '../src/http.js';
import { requestPolicy, secureResponse } from '../src/security-policy.js';
export async function hubFixture() {
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');const DB=d1(sqlite);await ensureCustomers(DB);
 sqlite.exec(await readFile(new URL('../migrations/0001_admin_security.sql',import.meta.url),'utf8'));
 sqlite.exec(await readFile(new URL('../migrations/0028_growth_os.sql',import.meta.url),'utf8'));
 const limiter={async limit(){return {success:true};}},root=resolve(new URL('..',import.meta.url).pathname);
 const env={DB,GROWTH_OS_ENABLED:'true',LOGIN_RATE_LIMITER:limiter,TRACK_RATE_LIMITER:limiter,CONTACT_RATE_LIMITER:limiter,HUB_WRITE_RATE_LIMITER:limiter,CUSTOMER_AUTH_ORIGIN:'https://aura.test',ASSETS:{async fetch(request){const path=resolve(root,'.'+new URL(request.url).pathname);if(!path.startsWith(root+'/')||!['/hub/','/shop/'].some(prefix=>new URL(request.url).pathname.startsWith(prefix)))return new Response('Not found',{status:404});try{const data=await readFile(path);return new Response(data,{headers:{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'}[extname(path)]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}}}};
 async function user(email,verified=false){const id=crypto.randomUUID(),token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');await DB.prepare("INSERT INTO customer_users(id,email,full_name,password_hash) VALUES(?,?,?,'!fixture')").bind(id,email,email.split('@')[0]).run();await DB.prepare("INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(await tokenHash(token),id).run();if(verified)await DB.prepare("INSERT INTO customer_verified_emails(customer_id,email,source) VALUES(?,?,'email')").bind(id,email).run();return {id,email,name:email.split('@')[0],cookie:'__Host-aura_customer='+token,token};}
 async function call(path,actor,method='GET',body,headers={}){const request=new Request('https://aura.test'+path,{method,headers:{Origin:'https://aura.test',...(actor?{Cookie:actor.cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});try{return await handleCustomerIdentity(request,env)||await handleBusinessHub(request,env)||await handleShop(request,env)||new Response('Not found',{status:404});}catch(e){if(!(e instanceof ApiError))throw e;return new Response(JSON.stringify({error:e.message}),{status:e.status,headers:{'Content-Type':'application/json',...e.headers}});}}
 return {sqlite,env,DB,user,call};
}
export const profile=(name='Test business')=>({name,industry:'restaurant',country:'Türkiye',city:'Istanbul',goals:'Get more reservations',capabilities:['domain'],currency:'USD'});
export const inputs=()=>({visits:1000,leads:100,closeRate:20,customerValue:100,margin:50,monthlyCost:100,setupCost:500,currency:'USD',assumptions:[{trafficLift:0,leadRateLift:0,closeRateLift:0},{trafficLift:10,leadRateLift:10,closeRateLift:10},{trafficLift:20,leadRateLift:20,closeRateLift:20}]});
