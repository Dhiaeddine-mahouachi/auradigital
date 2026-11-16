import { createContactRequest } from '../src/worker.js';
// Local QA only. In-memory fixture; no Cloudflare API, remote D1 or real customer data.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { hubFixture } from '../test/hub-fixture.mjs';
import { handleBusinessHub } from '../src/business-hub.js';
import { handleCustomerIdentity } from '../src/customer-identity.js';
import { handleShop } from '../src/shop.ts';
import { tokenHash } from '../src/customer-accounts.ts';
import { ApiError } from '../src/http.js';
import { secureResponse } from '../src/security-policy.js';
const f=await hubFixture();
f.sqlite.exec(await readFile(new URL('../migrations/0005_ai_employee.sql',import.meta.url),'utf8'));
f.sqlite.exec(`CREATE TABLE clients (id INTEGER PRIMARY KEY, name TEXT, company TEXT, email TEXT, phone TEXT, service TEXT, status TEXT, notes TEXT);
 CREATE TABLE subscriptions (id INTEGER PRIMARY KEY, client_id INTEGER, plan TEXT, status TEXT, next_billing_date TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE orders (id INTEGER PRIMARY KEY, client_id INTEGER, type TEXT, status TEXT, due_date TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
f.env.AI_RATE_LIMITER={async limit(){return {success:true};}};
if(process.env.HUB_OLLAMA_URL&&process.env.HUB_OLLAMA_MODEL){
 Object.assign(f.env,{HUB_OLLAMA_URL:process.env.HUB_OLLAMA_URL,HUB_OLLAMA_MODEL:process.env.HUB_OLLAMA_MODEL,HUB_OLLAMA_TOKEN:process.env.HUB_OLLAMA_TOKEN});
}else{
 Object.assign(f.env,{HUB_OLLAMA_URL:'https://ollama-fixture.example.test/api/chat',HUB_OLLAMA_MODEL:'fixture'});
 const realFetch=globalThis.fetch;
 globalThis.fetch=async(input,init)=>{
  if(String(input)!==f.env.HUB_OLLAMA_URL)return realFetch(input,init);
  const {messages}=JSON.parse(init.body);
  const data=JSON.parse(messages.at(-1).content);
  let result;
  if(data.businessText){
   const text=data.businessText;
   result={reply:'OK',facts:{industry:{value:'restaurant',excerpt:text},industryDetails:{value:text,excerpt:text}}};
  }else if(data.candidates){
   const pick=data.profile.industry==='restaurant'?'menu':'website';
   const first=data.candidates.find(task=>task.id===pick)?.id||data.candidates.find(task=>!task.optional)?.id;
   const title=pick==='menu'?'Prepare your digital menu':'Publish a business website';
   result={reply:'OK',summary:data.profile.industryDetails||data.profile.name,goal:data.profile.goals||'Reach more customers',first,tasks:[
    {id:first,title,reason:'Give customers a clear way to explore what your business offers.',action:'Gather the services, products and contact details you want customers to see.'},
    {id:'whatsapp',title:'Set up WhatsApp Business',reason:'Make it easier for customers to get answers.',action:'Add a business number and set a welcome message.'},
   ]};
   if(data.profile.name==='Retry Studio'&&!fixtureFailures.has(data.profile.name)){
    fixtureFailures.add(data.profile.name);result.tasks=[{id:'unknown'}];
   }
  }else if(data.catalogue)result={reply:'Start by deciding who will update your menu. I can help compare the two digital menu options.',packageIds:['auramenu-self','auramenu-managed']};
  else result={reply:'Start by gathering the information customers need. I can help you turn it into a short checklist.'};
  return Response.json({message:{content:JSON.stringify(result)},prompt_eval_count:120,eval_count:140});
 };
}
const fixtureFailures=new Set();
f.env.MENU_DRAFTS_ENABLED='true'; // Synthetic in-memory QA only.
const qaUser=await f.user('qa-owner@example.test',true);
const qaOrg=await (await f.call('/api/hub/workspaces',qaUser,'POST',{profile:{name:'Lumen Studio QA',industry:'restaurant',country:'Türkiye',city:'Istanbul',capabilities:['domain'],currency:'USD',goals:'Increase direct reservations'},mode:'myself'})).json();
await f.call('/api/hub/workspaces/'+qaOrg.id+'/missions',qaUser,'POST',{});
const qaDraft=await (await f.call('/api/hub/workspaces/'+qaOrg.id+'/menu-drafts',qaUser,'POST',{state:'preview',draft:{
 fields:{businessName:'Lumen Studio QA',currency:'TRY',menuLanguage:'en',templateId:'modern'},
 categories:[{name:'Café menu',items:[{name:'Turkish coffee',price:'90',description:'Traditionally brewed.'}]}],
}})).json();
const qaContact=await createContactRequest(new Request('https://aura.test/api/contact',{
 method:'POST',headers:{Origin:'https://aura.test',Cookie:qaUser.cookie,'Content-Type':'application/json'},
 body:JSON.stringify({workspaceId:qaOrg.id,name:'Lumen Studio QA',email:qaUser.email,phone:'+90 555 555 00 00',
  service:'Web Design',message:'Build a website for our neighborhood café.',language:'en'}),
}),f.DB,f.env);
const qaReceipt=await qaContact.json();
if(!qaContact.ok)throw new Error('Local CRM seed failed: '+qaReceipt.error);
const qaClient=await f.DB.prepare('SELECT client_id FROM request_receipts WHERE request_id=?').bind(qaReceipt.requestId).first();
await f.DB.batch([
 f.DB.prepare("INSERT INTO orders(client_id,type,status,due_date) VALUES (?,'Website','in_production','2026-12-02')").bind(qaClient.client_id),
 f.DB.prepare("INSERT INTO subscriptions(client_id,plan,status) VALUES (?,'Website hosting','active')").bind(qaClient.client_id),
]);
const server=createServer(async(req,res)=>{try{
 if(req.url==='/__qa/mobile'||req.url==='/__qa/tablet'){const width=req.url.endsWith('mobile')?390:768;res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(`<html><head><title>Responsive QA</title></head><body style="margin:0;background:#e5e8e1;font-family:Arial"><p style="padding:12px">Synthetic local QA · ${width}px CSS viewport</p><iframe title="Business Hub responsive QA" src="/hub" style="width:${width}px;height:844px;border:1px solid #99a99b;margin:0 16px"></iframe></body></html>`);return;}
 if(req.url==='/__qa/start'||req.url==='/__qa/start?review=1'){res.writeHead(303,{'Location':req.url.endsWith('=1')?'/hub/menu-drafts?'+new URLSearchParams({workspace:qaOrg.id,draft:qaDraft.menu.id}):'/hub','Set-Cookie':qaUser.cookie.replace('__Host-aura_customer=','aura_qa_customer=')+'; Path=/; HttpOnly; SameSite=Strict','Cache-Control':'no-store'});res.end();return;}
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>220000){res.writeHead(413);res.end();return;}chunks.push(c);}
 const origin=`http://${req.headers.host}`;f.env.CUSTOMER_AUTH_ORIGIN=origin;
 const request=new Request(origin+(req.url==='/'?'/hub':req.url),{method:req.method,headers:{...req.headers,cookie:String(req.headers.cookie||'').replace(/aura_qa_customer=/g,'__Host-aura_customer=')},...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
 if(req.url==='/__qa/password-reset'&&req.method==='POST'){
  const {email}=await request.json();
  const user=await f.DB.prepare('SELECT id,email FROM customer_users WHERE email=?').bind(email).first();
  if(!user||!user.email.endsWith('@example.test')){res.writeHead(404);res.end();return;}
  const token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
  const now=Math.floor(Date.now()/1000);
  await f.DB.prepare('INSERT INTO customer_action_tokens(token_hash,customer_id,email,purpose,expires_at,created_at) VALUES(?,?,?,?,?,?)')
   .bind(await tokenHash(token),user.id,user.email,'reset',now+1800,now).run();
  res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify({path:'/hub/reset#token='+token}));return;
 }
 const publicFixture=new Map([['/contact','contact.html'],['/script.js','script.js'],['/auradigital-mark.svg','auradigital-mark.svg'],['/qr-menu-phone.svg','qr-menu-phone.svg']]);
 const publicAsset=publicFixture.get(new URL(request.url).pathname);
 const fallback=async()=>publicAsset?new Response(await readFile(new URL('../'+publicAsset,import.meta.url)),
  {headers:{'Content-Type':publicAsset.endsWith('.svg')?'image/svg+xml':publicAsset.endsWith('.js')?'text/javascript':'text/html'}}):f.env.ASSETS.fetch(request);
 const contactResponse=req.url==='/api/contact'&&req.method==='POST'?await createContactRequest(request,f.DB,f.env):null;
 const response=secureResponse(contactResponse||await handleCustomerIdentity(request,f.env)||await handleBusinessHub(request,f.env)||await handleShop(request,f.env)||await fallback(),request,{},null);
 // The preview gateway is HTTP. Only this isolated in-memory QA harness maps
 // the Secure __Host session to an unprefixed local cookie. Production is unchanged.
 const headers=new Headers(response.headers);
 headers.set('X-Frame-Options','SAMEORIGIN');
 if(headers.has('Content-Security-Policy'))headers.set('Content-Security-Policy',headers.get('Content-Security-Policy').replace(/frame-ancestors 'none'/g,"frame-ancestors 'self'"));
 if(headers.has('Set-Cookie'))headers.set('Set-Cookie',headers.get('Set-Cookie').replace(/__Host-aura_customer=/g,'aura_qa_customer=').replace(/; Secure/g,''));
 if(headers.has('Content-Security-Policy'))headers.set('Content-Security-Policy',headers.get('Content-Security-Policy').replace(/; upgrade-insecure-requests/g,''));
 res.writeHead(response.status,Object.fromEntries(headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch(e){res.writeHead(e instanceof ApiError?e.status:500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e instanceof ApiError?e.message:'Local QA server error.'}));if(!(e instanceof ApiError))console.error(e);}});
const port=Number(process.env.PORT||process.argv[process.argv.indexOf('--port')+1]||5173);server.listen(port,'0.0.0.0',()=>console.log(`Local QA: http://0.0.0.0:${port}/hub (synthetic, in-memory records only)`));
