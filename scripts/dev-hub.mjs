// Local QA only. In-memory fixture; no Cloudflare API, remote D1 or real customer data.
import { createServer } from 'node:http';
import { hubFixture } from '../test/hub-fixture.mjs';
import { handleBusinessHub } from '../src/business-hub.js';
import { handleCustomerIdentity } from '../src/customer-identity.js';
import { handleShop } from '../src/shop.ts';
import { ApiError } from '../src/http.js';
import { secureResponse } from '../src/security-policy.js';
const f=await hubFixture();
const qaUser=await f.user('qa-owner@example.test',true);
const qaOrg=await (await f.call('/api/hub/workspaces',qaUser,'POST',{profile:{name:'Lumen Studio QA',industry:'restaurant',country:'Türkiye',city:'Istanbul',capabilities:['domain'],currency:'USD',goals:'Increase direct reservations'},mode:'myself'})).json();
await f.call('/api/hub/workspaces/'+qaOrg.id+'/missions',qaUser,'POST',{});
const server=createServer(async(req,res)=>{try{
 if(req.url==='/__qa/mobile'||req.url==='/__qa/tablet'){const width=req.url.endsWith('mobile')?390:768;res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(`<html><head><title>Responsive QA</title></head><body style="margin:0;background:#e5e8e1;font-family:Arial"><p style="padding:12px">Synthetic local QA · ${width}px CSS viewport</p><iframe title="Business Hub responsive QA" src="/hub" style="width:${width}px;height:844px;border:1px solid #99a99b;margin:0 16px"></iframe></body></html>`);return;}
 if(req.url==='/__qa/start'){res.writeHead(303,{'Location':'/hub','Set-Cookie':qaUser.cookie.replace('__Host-aura_customer=','aura_qa_customer=')+'; Path=/; HttpOnly; SameSite=Strict','Cache-Control':'no-store'});res.end();return;}
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>220000){res.writeHead(413);res.end();return;}chunks.push(c);}
 const origin=`http://${req.headers.host}`;f.env.CUSTOMER_AUTH_ORIGIN=origin;
 const request=new Request(origin+(req.url==='/'?'/hub':req.url),{method:req.method,headers:{...req.headers,cookie:String(req.headers.cookie||'').replace(/aura_qa_customer=/g,'__Host-aura_customer=')},...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
 const response=secureResponse(await handleCustomerIdentity(request,f.env)||await handleBusinessHub(request,f.env)||await handleShop(request,f.env)||await f.env.ASSETS.fetch(request),request,{},null);
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
