import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {d1} from './d1.mjs';
import {defaults,initialVersion,regionalEngine,selectRegion,validateConfig} from '../pricing/regions.js';
import {ensureGlobalPricing,handleGlobalPricing,pricingFor,checkQuoteVersion} from '../src/global-pricing.js';
import {createSession,sessionCookie} from '../src/security.js';
import {estimate,quoteText} from '../src/ai-core.js';
import {renderPricingFallback} from '../src/pricing-html.js';
import {readFileSync} from 'node:fs';
const origin='https://auradigitalworks.com';
function request(path,body,token,method) {return new Request(origin+path,{method:method||(body?'POST':'GET'),headers:{Origin:origin,'Content-Type':'application/json',...(token?{Cookie:sessionCookie(token,3600)}:{})},...(body?{body:JSON.stringify(body)}:{})});}
function geo(country,headers={}) {const r=new Request(origin,{headers});Object.defineProperty(r,'cf',{value:{country}});return r;}
for(const [country,region,currency,price] of [['TR','TR','TRY',6750],['TN','TN','TND',600],['US','US','USD',315],['FR','EU','EUR',288],['GB','GB','GBP',252],['BG','EU','EUR',288]])test('approved geolocation pricing '+country,()=>{
 assert.equal(selectRegion(defaults,geo(country)),region);
 const e=regionalEngine(defaults,region);assert.equal(e.catalogue.currency,currency);assert.equal(e.getItem('launch').price,price);
 const q=e.quote({id:'launch'});assert.equal(q.once,price);assert.equal(q.currency,currency);assert.equal(q.minor.once,price*(currency==='TND'?1000:100));
 assert.ok(renderPricingFallback('websites',e).includes(e.fmt(price)));
 assert.doesNotMatch(renderPricingFallback('home',e),/NaN|undefined/);
});
test('trusted CF only, exact eurozone mapping, deterministic fallback and manual override',()=>{
 for(const c of ['CH','NO','SE','PL','RO','HU','ZZ',undefined])assert.equal(selectRegion(defaults,geo(c)),'TR');
 assert.equal(selectRegion(defaults,geo('ZZ',{'CF-IPCountry':'TN','Accept-Language':'fr-TN'})),'TR');
 assert.equal(selectRegion(defaults,geo('TR',{Cookie:'aura-pricing-region=TN'})),'TN');
 assert.equal(selectRegion(defaults,geo('US'),'GB'),'GB');
 assert.throws(()=>selectRegion(defaults,geo('TR'),'__proto__'));
 const disabled=structuredClone(defaults);disabled.enabled=false;assert.equal(selectRegion(disabled,geo('TN')),'TR');
});
test('missing approvals never produce mixed-currency or zero-priced estimates',()=>{
 const e=regionalEngine(defaults,'TN');
 assert.match(e.priceText(e.getItem('business-email')),/Request Quote/);
 assert.throws(()=>e.quote({id:'launch',standardHosting:true}),/Request Quote/);
 assert.throws(()=>e.quote({id:'growth',addons:['basic-dashboard']}),/Request Quote/);
 assert.equal(e.quote({id:'system',addons:['basic-dashboard'],standardHosting:true}).once,2000);
 assert.equal(e.quote({id:'scale-commerce',addons:['booking']}).once,2400);
 assert.throws(()=>e.quote({id:'scale-commerce',addons:['booking','ecommerce']}),/scoped/);
 assert.throws(()=>e.quote({id:'growth',addons:['basic-dashboard','advanced-dashboard']}),/one dashboard/);
 assert.throws(()=>checkQuoteVersion({currency:'TRY'},e),/Currency/);
 assert.throws(()=>checkQuoteVersion({priceVersion:'old'},e),/Prices changed/);
});
test('TND precision and promotion validity use approved integer units',()=>{
 const c=structuredClone(defaults);c.prices.TN.launch={minor:600125,promoMinor:500005,promoFrom:'2026-10-01T00:00:00Z',promoUntil:'2026-11-01T00:00:00Z'};
 assert.equal(regionalEngine(c,'TN','v',Date.parse('2026-10-15')).quote({id:'launch'}).minor.once,500005);
 assert.equal(regionalEngine(c,'TN','v',Date.parse('2026-11-02')).quote({id:'launch'}).minor.once,600125);
 assert.equal(regionalEngine(c,'TN','v',Date.parse('2026-11-02')).fmt(600.125),'600.125 DT');
 c.prices.TN.launch.minor=1.2;assert.throws(()=>validateConfig(c),/minor units/);
});
test('AI estimate and line text use the selected approved region',()=>{
 const e=regionalEngine(defaults,'TN'),q=estimate({id:'launch'},e);
 assert.equal(q.once,600);assert.equal(q.currency,'TND');assert.match(quoteText(q,'en'),/600 TND/);assert.doesNotMatch(quoteText(q,'en'),/TRY/);
 assert.throws(()=>estimate({id:'launch',standardHosting:true},e),/Request Quote/);
});
test('private drafts, strict permissions, optimistic publication, audit and restore preserve contracts',async()=>{
 const sqlite=new DatabaseSync(':memory:'),db=d1(sqlite),env={DB:db};
 sqlite.exec(`CREATE TABLE admin_users(id TEXT PRIMARY KEY,username TEXT,display_name TEXT,role TEXT,active INTEGER);CREATE TABLE admin_sessions(id TEXT PRIMARY KEY,token_hash TEXT UNIQUE,user_id TEXT,expires_at TEXT);CREATE TABLE invoices(id TEXT,amount INTEGER,currency TEXT);INSERT INTO invoices VALUES('contract',12345,'TRY');`);
 for(const role of ['owner','manager','viewer'])sqlite.prepare('INSERT INTO admin_users VALUES(?,?,?,?,1)').run(role,role,role,role);
 const owner=await createSession(db,'owner'),manager=await createSession(db,'manager'),viewer=await createSession(db,'viewer');
 const call=(path,body,token)=>handleGlobalPricing(request('/api/admin/global-pricing'+path,body,token),env);
 try {
  await assert.rejects(()=>call('',null),e=>e.status===401);await assert.rejects(()=>call('',null,viewer),e=>e.status===403);
  await ensureGlobalPricing(db);let state=await (await call('',null,owner)).json();
  const config=structuredClone(state.config);config.prices.TN.launch.minor=650000;config.research={privateNote:'unpublished market research'};
  await call('/draft',{revision:state.revision,config},manager);
  assert.equal((await pricingFor(geo('TN'),env)).engine.getItem('launch').price,600);
  const publicData=await (await handleGlobalPricing(request('/api/pricing?region=TN'),env)).json();
  assert.doesNotMatch(JSON.stringify(publicData),/privateNote|650000|unpublished/);
  await assert.rejects(()=>call('/draft',{revision:state.revision,config},owner),e=>e.status===409);
  state=await (await call('',null,owner)).json();
  await assert.rejects(()=>call('/publish',{revision:state.revision},manager),e=>e.status===403);
  const badOrigin=new Request(origin+'/api/admin/global-pricing/publish',{method:'POST',headers:{Origin:'https://evil.example',Cookie:sessionCookie(owner,3600)}});
  await assert.rejects(()=>handleGlobalPricing(badOrigin,env),e=>e.status===403);
  await call('/publish',{revision:state.revision},owner);
  assert.equal((await pricingFor(geo('TN'),env)).engine.getItem('launch').price,650);
  state=await (await call('',null,owner)).json();assert.ok(state.history.some(v=>v.action==='draft'&&v.changes.includes('prices.TN.launch.minor')&&v.actor.includes('manager')));
  await call('/restore',{revision:state.revision,version:initialVersion},owner);
  assert.equal((await pricingFor(geo('TN'),env)).engine.getItem('launch').price,650);
  state=await (await call('',null,owner)).json();await call('/publish',{revision:state.revision},owner);
  assert.equal((await pricingFor(geo('TN'),env)).engine.getItem('launch').price,600);
  assert.deepEqual({...sqlite.prepare('SELECT * FROM invoices').get()},{id:'contract',amount:12345,currency:'TRY'});
 }finally{sqlite.close();}
});
test('manual selector persistence and single-engine frontend wiring are present',()=>{
 const ui=readFileSync(new URL('../pricing/ui.js',import.meta.url),'utf8');
 assert.match(ui,/aura-pricing-region=.*Max-Age=31536000/);assert.match(ui,/aura:pricingchange/);assert.match(ui,/aria-label','Pricing country and currency/);
 for(const page of ['index','websites','services','packages','spinflow','contact','aura-menu','nfc','qr-menu'])assert.match(readFileSync(new URL('../'+page+'.html',import.meta.url),'utf8'),/pricing\/ui.js/);
});
test('live worker routes return Tunisian prices and deterministic regional chatbot answers',async()=>{
 const {default:app}=await import('../src/worker-entry.js');
 const sqlite=new DatabaseSync(':memory:'),env={DB:d1(sqlite),LOGIN_RATE_LIMITER:{limit:async()=>({success:true})},AI_RATE_LIMITER:{limit:async()=>({success:true})},TRACK_RATE_LIMITER:{limit:async()=>({success:true})}},ctx={waitUntil(){}};
 try{
  const p=await app.fetch(request('/api/pricing?region=TN'),env,ctx),published=await p.json();assert.equal(p.status,200,JSON.stringify(published));assert.equal(published.catalogue.website[0].price,600);assert.match(p.headers.get('Cache-Control'),/no-store/);
  const start=await app.fetch(request('/api/ai/session',{}),env,ctx),cookie=start.headers.get('Set-Cookie');assert.equal(start.status,201);
  const msg=new Request(origin+'/api/ai/message',{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({message:'How much does a website cost?',language:'en',region:'TN',selection:{id:'launch'}})});
  const result=await app.fetch(msg,env,ctx),data=await result.json();assert.equal(result.status,200,JSON.stringify(data));assert.equal(data.estimate.currency,'TND');assert.equal(data.estimate.once,600);assert.match(data.reply,/600 TND/);assert.doesNotMatch(data.reply,/6750|6,750|TRY/);
 }finally{sqlite.close();}
});
