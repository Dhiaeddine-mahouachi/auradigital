import { defaults, initialVersion, selectRegion, regionalEngine, validateConfig } from '../pricing/regions.js';
import { catalogue, groups } from '../pricing/catalogue.js';
import { getAuthenticatedAdmin, sameOrigin } from './security.js';
import { ApiError, json, readJson } from './http.js';
const schema=[
 `CREATE TABLE IF NOT EXISTS global_pricing_versions (id TEXT PRIMARY KEY, config TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), actor TEXT NOT NULL, action TEXT NOT NULL, previous_id TEXT, changes TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS global_pricing_state (id INTEGER PRIMARY KEY CHECK(id=1), revision TEXT NOT NULL, published TEXT NOT NULL, draft TEXT NOT NULL)`
];
const initialized=new WeakMap();
export async function ensureGlobalPricing(db) {
 if(!db)return;
 if(!initialized.has(db)) initialized.set(db,(async()=>{
  await db.batch(schema.map(s=>db.prepare(s)));
  await db.batch([
   db.prepare('INSERT OR IGNORE INTO global_pricing_versions(id,config,actor,action,changes) VALUES(?,?,?,?,?)').bind(initialVersion,JSON.stringify(defaults),'owner-approved-catalogue','seed','[]'),
   db.prepare('INSERT OR IGNORE INTO global_pricing_state(id,revision,published,draft) VALUES(1,?,?,?)').bind(initialVersion,initialVersion,initialVersion)
  ]);
 })().catch(e=>{initialized.delete(db);throw e;}));
 return initialized.get(db);
}
export async function publishedPricing(db) {
 if(!db)return {config:defaults,version:initialVersion};
 await ensureGlobalPricing(db);
 const row=await db.prepare('SELECT v.id,v.config FROM global_pricing_state s JOIN global_pricing_versions v ON v.id=s.published WHERE s.id=1').first();
 return {config:JSON.parse(row.config),version:row.id};
}
export async function pricingFor(request,env,override) {
 const {config,version}=await publishedPricing(env.DB);
 let region;
 try{region=selectRegion(config,request,override);}catch(e){throw new ApiError(400,e.message);}
 return {engine:regionalEngine(config,region,version),config,region,version};
}
export function checkQuoteVersion(selection,engine) {
 if(selection.currency && selection.currency!==engine.catalogue.currency) throw new ApiError(409,'Currency changed; refresh the estimate before submitting.');
 if(selection.priceVersion && selection.priceVersion!==engine.catalogue.version) throw new ApiError(409,'Prices changed; refresh the estimate before submitting.');
}
function diff(before,after,path='') {
 if(JSON.stringify(before)===JSON.stringify(after))return [];
 if(!before||!after||typeof before!=='object'||typeof after!=='object')return [{field:path,old:before??null,new:after??null}];
 return [...new Set([...Object.keys(before),...Object.keys(after)])].flatMap(k=>diff(before[k],after[k],path?path+'.'+k:k));
}
export async function handleGlobalPricing(request,env) {
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/pricing'&&request.method==='GET') {
  const {engine,config,region,version}=await pricingFor(request,env);
  const saved=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('aura-pricing-region='))?.split('=')[1];
  const selectionNotice=saved&&(!Object.hasOwn(config.regions,saved)||!config.regions[saved].enabled)?'Your previous pricing region is unavailable. Showing '+config.regions[region].name+' prices.':!config.enabled?'Regional pricing is disabled. Showing '+config.regions[region].name+' prices.':null;
  return json({selectionNotice,catalogue:engine.catalogue,region,currency:engine.catalogue.currency,version,regions:Object.entries(config.regions).filter(([,r])=>r.enabled).map(([id,r])=>({id,name:r.name,currency:r.currency}))},200,{'Cache-Control':'private, no-store','Vary':'Cookie'});
 }
 if(!path.startsWith('/api/admin/global-pricing'))return null;
 // Authentication precedes all config/history reads and schema work.
 const admin=await getAuthenticatedAdmin(request,env.DB);
 if(!admin)throw new ApiError(401,'Unauthorized.');
 if(!['owner','manager'].includes(admin.role))throw new ApiError(403,'Pricing administration requires owner or manager access.');
 if(request.method!=='GET'&&!sameOrigin(request))throw new ApiError(403,'Invalid request origin.');
 await ensureGlobalPricing(env.DB);
 const state=await env.DB.prepare('SELECT * FROM global_pricing_state WHERE id=1').first();
 const version=async id=>env.DB.prepare('SELECT * FROM global_pricing_versions WHERE id=?').bind(id).first();
 const current=await version(state.draft);
 if(path==='/api/admin/global-pricing'&&request.method==='GET') {
  const history=await env.DB.prepare('SELECT id,created_at,actor,action,previous_id,changes FROM global_pricing_versions ORDER BY rowid DESC LIMIT 50').all();
  return json({...state,config:JSON.parse(current.config),history:history.results,services:groups.flatMap(g=>catalogue[g].flatMap(p=>[{id:p.id,name:p.name,billing:p.billing||'once'},...(p.annualHosting?[{id:'hosting:'+p.id,name:p.name+' managed hosting',billing:'year'}]:[])]))},200,{'Cache-Control':'no-store'});
 }
 if(path==='/api/admin/global-pricing/preview'&&request.method==='POST') {
  const b=await readJson(request,100000);let config;
  try{config=validateConfig(b.config);}catch(e){throw new ApiError(400,e.message);}
  if(!config.regions[b.region]?.enabled)throw new ApiError(400,'Unsupported preview region');
  return json({catalogue:regionalEngine(config,b.region,'unpublished-preview').catalogue},200,{'Cache-Control':'no-store'});
 }
 if(!['draft','publish','restore'].some(a=>path==='/api/admin/global-pricing/'+a)||request.method!=='POST')throw new ApiError(404,'Unknown pricing action');
 const b=await readJson(request,100000),action=path.split('/').pop();
 if(b.revision!==state.revision)throw new ApiError(409,'Pricing changed in another session. Reload before saving.');
 if(action==='publish'&&admin.role!=='owner')throw new ApiError(403,'Only an owner may publish regional pricing.');
 let config;
 if(action==='restore') {const old=await version(b.version);if(!old)throw new ApiError(404,'Version not found');config=JSON.parse(old.config);}
 else config=action==='publish'?JSON.parse(current.config):b.config;
 try{config=validateConfig(config);}catch(e){throw new ApiError(400,e.message);}
 const id=crypto.randomUUID(),changes=diff(JSON.parse(current.config),config);
 if(action==='publish')changes.push(...diff(JSON.parse((await version(state.published)).config),config,'published'));
 const results=await env.DB.batch([
  env.DB.prepare('INSERT INTO global_pricing_versions(id,config,actor,action,previous_id,changes) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM global_pricing_state WHERE id=1 AND revision=?)').bind(id,JSON.stringify(config),String(admin.id)+':'+admin.username,action,state.draft,JSON.stringify(changes),b.revision),
  env.DB.prepare('UPDATE global_pricing_state SET revision=?,draft=?,published=? WHERE id=1 AND revision=?').bind(id,id,action==='publish'?id:state.published,b.revision)
 ]);
 if(!results[1].meta.changes)throw new ApiError(409,'Concurrent edit; reload pricing.');
 return json({ok:true,revision:id,published:action==='publish'?id:state.published},200,{'Cache-Control':'no-store'});
}
