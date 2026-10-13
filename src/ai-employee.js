import { ApiError, json, readJson } from './http.js';
import { getAuthenticatedAdmin, sameOrigin } from './security.js';
import { catalogue, getItem } from '../pricing/catalogue.js';
import { clean, redact, hash, TEXT, language, pageContext, intent, category, validateSelection, estimate, quoteText, services, rankKnowledge, LANGUAGES } from './ai-core.js';
import { knowledge } from './ai-knowledge.js';
import { pageKnowledge } from './ai-page-knowledge.js';
import { schema } from './ai-schema.js';
import { generate, SYSTEM, tariff, failureReason } from './ai-provider.js';

const COOKIE='__Host-aura_ai';
const initialized=new WeakMap();
const memoryKeys=['businessType','requirements','budget','deadline','constraints'];
const parse=value=>{try{return JSON.parse(value);}catch{return {};}};
const cookie=(value,days=1)=>`${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${days*86400}`;
const event=(db,sid,name,details='',detected='',ms=0)=>db.prepare('INSERT INTO ai_events(session_id,event,intent,latency_ms,details) VALUES(?,?,?,?,?)').bind(sid,name,detected,ms,clean(details,200));

async function initialize(db) {
  if(initialized.has(db)) return initialized.get(db);
  const work=(async()=>{
    await db.batch(schema.map(sql=>db.prepare(sql)));
    const sourceKnowledge=knowledge.concat(pageKnowledge);
    const version=await hash(JSON.stringify(sourceKnowledge));
    const stored=await db.prepare("SELECT value FROM ai_meta WHERE key='repository-version'").first();
    if(stored?.value!==version) {
      const writes=[];
      // Remove only generated page chunks; operator-authored approved documents remain.
      writes.push(db.prepare("DELETE FROM ai_fts WHERE id LIKE 'repo-page-%'"));
      writes.push(db.prepare("DELETE FROM ai_knowledge WHERE id LIKE 'repo-page-%'"));
      for(const k of sourceKnowledge) {
        writes.push(db.prepare('INSERT INTO ai_knowledge(id,title,category,content,source_url,source_type,verified_at,status,language,visibility,priority) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,category=excluded.category,content=excluded.content,source_url=excluded.source_url,verified_at=excluded.verified_at,status=excluded.status,priority=excluded.priority').bind(k.id,k.title,k.category,k.content,k.source_url,k.source_type,k.verified_at,k.status,k.language,k.visibility,k.priority));
        writes.push(db.prepare('DELETE FROM ai_fts WHERE id=?').bind(k.id));
        writes.push(db.prepare('INSERT INTO ai_fts(id,title,content,category) VALUES(?,?,?,?)').bind(k.id,k.title,k.content,k.category));
      }
      writes.push(db.prepare("INSERT INTO ai_meta(key,value) VALUES('repository-version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(version));
      await db.batch(writes);
    }
  })();
  initialized.set(db,work);
  try{await work;}catch(e){initialized.delete(db);throw e;}
}

async function session(request,db) {
  const token=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(!token||!/^[a-f0-9]{64}$/.test(token)) throw new ApiError(401,'Start a new conversation.');
  const row=await db.prepare("SELECT * FROM ai_sessions WHERE token_hash=? AND expires_at>datetime('now')").bind(await hash(token)).first();
  if(!row) throw new ApiError(401,'Conversation expired.');
  return row;
}
async function retrieve(db,query,cat,lang) {
  const tokens=(query.match(/[\p{L}\p{N}]{2,}/gu)||[]).slice(0,12);
  const matches=tokens.map(w=>'"'+w.replaceAll('"','')+'"').join(' OR ');
  let rows=[];
  if(matches) rows=(await db.prepare("SELECT k.* FROM ai_fts f JOIN ai_knowledge k ON k.id=f.id WHERE ai_fts MATCH ? AND k.status='active' AND k.visibility='public' ORDER BY bm25(ai_fts) LIMIT 15").bind(matches).all()).results||[];
  const relevant=(await db.prepare("SELECT * FROM ai_knowledge WHERE category IN (?, 'services','company') AND status='active' AND visibility='public' ORDER BY priority DESC LIMIT 10").bind(cat).all()).results||[];
  const unique=[...new Map([...rows,...relevant].map(k=>[k.id,k])).values()];
  return rankKnowledge(unique,query,cat,lang);
}
async function portfolio(db) {
  try{return (await db.prepare('SELECT title,type,description,url,tags FROM portfolio WHERE active=1 ORDER BY sort_order LIMIT 12').all()).results||[];}catch{return [];}
}
function safeMemory(current,next) {
  const merged={...current};
  for(const k of memoryKeys) if(typeof next?.[k]==='string'&&next[k].trim()) merged[k]=redact(next[k]).slice(0,500);
  return merged;
}
function fallback(docs,lang,detected,cat) {
  if(detected==='handoff') return TEXT[lang].contact;
  if(detected==='restricted') return TEXT[lang].unknown+' '+TEXT[lang].contact;
  return TEXT[lang].fallback;
}
async function message(request,env,s) {
  const started=Date.now(), db=env.DB, b=await readJson(request,12000);
  if(typeof b.message!=='string'||b.message.length>2000) throw new ApiError(400,'Message must contain at most 2000 characters.');
  const user=clean(b.message,2000);
  const requestId=/^[a-zA-Z0-9-]{16,64}$/.test(b.requestId||'')?b.requestId:crypto.randomUUID();
  if(!user) throw new ApiError(400,'Message required.');
  const lease=Date.now()+45000;
  const lock=await db.prepare('UPDATE ai_sessions SET busy_until=? WHERE id=? AND busy_until<? RETURNING id').bind(lease,s.id,Date.now()).first();
  if(!lock) throw new ApiError(409,'Please wait for the current response.');
  try {
    const fresh=await db.prepare('SELECT state FROM ai_sessions WHERE id=?').bind(s.id).first();
    const previous=parse(fresh?.state||s.state);
    if(previous.lastRequestId===requestId) {
      const saved=await db.prepare("SELECT content FROM ai_messages WHERE session_id=? AND role='assistant' ORDER BY id DESC LIMIT 1").bind(s.id).first();
      return json({reply:saved?.content||TEXT[s.language].unknown,mode:'ai',language:s.language,memory:previous,estimate:previous.selection?estimate(previous.selection):null,sources:[],requestId,duplicate:true});
    }
    const page=pageContext(b.page), lang=language(user,b.language,s.language), cat=category(user,page,previous.category);
    let detected=intent(user);
    const docs=detected==='restricted'?[]:await retrieve(db,redact(user),cat,lang);
    const history=(await db.prepare('SELECT role,content FROM ai_messages WHERE session_id=? ORDER BY id DESC LIMIT 8').bind(s.id).all()).results.reverse();
    let selection=b.selection!==undefined?validateSelection(b.selection):previous.selection;
    let state={...previous,category:cat}, reply='',mode='unavailable',usage={input:0,output:0};
    const publicProjects=cat==='portfolio'?await portfolio(db):[];
    if(detected!=='restricted'&&cat==='portfolio') {
      docs.unshift(...publicProjects.slice(0,3).map((p,i)=>({id:'public-portfolio-'+i,title:clean(p.title,160),content:clean(p.type+' · '+p.description,1000),source_url:/^https:\/\//.test(p.url)?p.url:'https://auradigitalworks.com/portfolio',verified_at:new Date().toISOString()})));
      docs.splice(5);
    }
    const relevantGroups={website:['website'],care:['care'],infrastructure:['infrastructure'],advertising:['advertising'],spinflow:['saas','erp'],auramenu:['other'],aurapops:['other']};
    const candidates=services().filter(i=>(relevantGroups[cat]||['website','care','other']).includes(i.group)).filter(i=>cat!=='auramenu'||i.id.startsWith('auramenu-')).map(i=>({id:i.id,name:i.name,price:i.price,currency:'TRY',billing:i.billing||'once',group:i.group,features:i.features,availability:i.availability,includes:i.includes}));
    const data={language:lang,intentHint:detected,page,memory:Object.fromEntries(Object.entries(previous).filter(([key])=>key!=='lastRequestId')),knowledge:docs.filter(k=>k.source_type!=='page').slice(0,4).map(k=>({id:k.id,title:k.title,content:clean(k.content,900),source:k.source_url,verified:k.verified_at})),portfolio:publicProjects,approvedPackages:candidates,approvedAddons:catalogue.websiteAddons.concat(catalogue.erpAddons).map(a=>({id:a.id,name:a.name})),message:redact(user)};
    const messages=[{role:'system',content:SYSTEM+'\nFor this turn, write reply ONLY in '+({en:'English',ar:'Arabic (العربية)',tr:'Turkish (Türkçe)',fr:'French (français)'})[lang]+'. Prior messages may be in a different language. The latest requested language takes precedence. Do not repeat a company introduction. Use approvedPackages price and billing for comparisons, but numerical quotations are displayed by the server from your selection. For a pricing question about a known product, select the applicable approved package; ask one question if the package is ambiguous.'},...history.map(h=>({role:h.role==='user'?'user':'assistant',content:h.content.slice(0,1000)})),{role:'user',content:JSON.stringify(data)}];
    const configured=!!env.AI_MODEL&&['cloudflare','compatible'].includes(env.AI_PROVIDER);
    if(!configured&&detected!=='restricted'&&b.selection===undefined) await event(db,s.id,'provider_failure','provider_configuration',detected).run();
    if(b.selection!==undefined&&detected!=='restricted') {reply=TEXT[lang].quote;mode='deterministic';}
    if(configured&&detected!=='restricted'&&b.selection===undefined) {
      const day=new Date().toISOString().slice(0,10);
      // Reserve a conservative worst-case token count before at most two model attempts.
      const reserve=2*(new TextEncoder().encode(messages.map(m=>m.content).join('')).length+1000);
      let rates;
      try{rates=tariff(env);}catch{rates=null;await event(db,s.id,'provider_failure','tariff_configuration',detected).run();}
      const dailyBudget=Math.max(0,Number(env.AI_DAILY_BUDGET_USD)||1);
      const limit=rates?Math.floor(Math.min(20000000,Number(env.AI_DAILY_TOKEN_LIMIT)||500000,dailyBudget*1000000/rates.max)):0;
      await db.prepare('INSERT INTO ai_usage(day) VALUES(?) ON CONFLICT(day) DO NOTHING').bind(day).run();
      const budget=await db.prepare('UPDATE ai_usage SET reserved_tokens=reserved_tokens+?,calls=calls+1 WHERE day=? AND reserved_tokens+?<=? RETURNING day').bind(reserve,day,reserve,limit).first();
      if(budget) {
        try {
          const output=await generate(env,messages,requestId);
          reply=clean(output.result.reply,4000);mode='ai';usage=output.usage;
          if(['discovery','pricing','comparison','quotation','support','handoff','restricted'].includes(output.result.intent)) detected=output.result.intent;
          state=safeMemory(state,output.result.memory);
          if(b.selection===undefined&&output.result.selection) {try{selection=validateSelection(output.result.selection);}catch{selection=null;reply=TEXT[lang].unknown;}}
          // Provider-reported usage may be absent; retain worst-case reservation then.
          const actual=usage.input+usage.output+(output.attempts===2?reserve/2:0);
          await db.prepare('UPDATE ai_usage SET input_tokens=input_tokens+?,output_tokens=output_tokens+?,reserved_tokens=reserved_tokens-? WHERE day=?').bind(usage.input,usage.output,actual>0&&actual<=reserve?reserve-actual:0,day).run();
        }catch(error) {
          await db.prepare('UPDATE ai_usage SET failures=failures+1 WHERE day=?').bind(day).run();
          await event(db,s.id,'provider_failure',failureReason(error),detected,Date.now()-started).run();
        }
      } else await event(db,s.id,'budget_limit').run();
    }
    if(!reply) {
      reply=fallback(docs,lang,detected,cat);
      if(detected==='restricted') mode='verified-fallback';
      else return json({reply,language:lang,mode:'unavailable',retryable:true,requestId,sources:[],memory:previous,estimate:null},200,{'X-Request-ID':requestId});
    }
    delete state.lastRequestId;
    if(mode==='ai')state.lastRequestId=requestId;
    let calculated=null;
    if(selection) {
      try{calculated=estimate(selection);state.selection=selection;}catch{delete state.selection;reply+='\n'+TEXT[lang].unknown;}
    }
    if(calculated&&(detected==='pricing'||detected==='quotation'||b.selection!==undefined)) reply+='\n\n'+quoteText(calculated,lang);
    if(page.requestedCurrency&&page.requestedCurrency!=='TRY') reply+='\n'+TEXT[lang].unknown;
    await db.batch([
      db.prepare('INSERT INTO ai_messages(session_id,role,content) VALUES(?,?,?)').bind(s.id,'user',redact(user)),
      db.prepare('INSERT INTO ai_messages(session_id,role,content) VALUES(?,?,?)').bind(s.id,'assistant',redact(reply)),
      db.prepare("UPDATE ai_sessions SET state=?,language=?,updated_at=datetime('now') WHERE id=?").bind(JSON.stringify(state),lang,s.id),
      db.prepare('DELETE FROM ai_messages WHERE session_id=? AND id NOT IN (SELECT id FROM ai_messages WHERE session_id=? ORDER BY id DESC LIMIT 40)').bind(s.id,s.id),
      event(db,s.id,mode==='ai'?'response':mode==='deterministic'?'deterministic_quote':'fallback','',detected,Date.now()-started)
    ]);
    return json({requestId,reply,language:lang,mode,intent:detected,estimate:calculated,memory:state,sources:docs.map(k=>({title:k.title,url:k.source_url,verifiedAt:k.verified_at})),actions:['quote','lead','handoff'],usage});
  }finally{await db.prepare('UPDATE ai_sessions SET busy_until=0 WHERE id=? AND busy_until=?').bind(s.id,lease).run();}
}

async function action(request,env,s) {
  const b=await readJson(request,10000),kind=b.kind;
  if(!['lead','quote','handoff','support'].includes(kind)||b.consent!==true) throw new ApiError(400,'Explicit contact-storage and submission consent required.');
  const name=clean(b.name,120),email=clean(b.email,160).toLowerCase(),phone=clean(b.phone,40),company=clean(b.company,120),requirements=clean(b.requirements,2000);
  if(!name||!requirements||(!email&&!phone)||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||(phone&&!/^\+?[\d\s().-]{7,40}$/.test(phone))) throw new ApiError(400,'Please supply a name, valid contact method and requirements.');
  const existing=await env.DB.prepare('SELECT id FROM ai_requests WHERE session_id=? AND kind=?').bind(s.id,kind).first();
  if(existing) return json({ok:true,reference:existing.id,duplicate:true,emailSent:false});
  const state=parse(s.state),q=kind==='quote'&&state.selection?estimate(state.selection):null;
  const id='AI-'+crypto.randomUUID();
  const details={requirements,category:state.category||'project',language:s.language,estimate:q,consentAt:new Date().toISOString(),humanReview:true};
  const notes=JSON.stringify({source:'AuraDigital AI assistant',reference:id,...details});
  // Transactional batch reuses a matching website CRM client without revealing its data.
    try{await env.DB.batch([
    env.DB.prepare("INSERT INTO clients(name,company,email,phone,service,status,notes) SELECT ?,?,?,?,?, 'lead',? WHERE NOT EXISTS (SELECT 1 FROM clients WHERE (?<>'' AND lower(email)=?) OR (?<>'' AND phone=?))").bind(name,company,email,phone,state.category||'project',notes,email,email,phone,phone),
    env.DB.prepare("INSERT INTO ai_requests(id,session_id,kind,client_id,details,consent) VALUES(?,?,?,(SELECT id FROM clients WHERE (?<>'' AND lower(email)=?) OR (?<>'' AND phone=?) ORDER BY id LIMIT 1),?,1)").bind(id,s.id,kind,email,email,phone,phone,JSON.stringify(details)),
    event(env.DB,s.id,'tool_'+kind,'confirmed')
  ]);}catch(error){
    const confirmed=await env.DB.prepare('SELECT id FROM ai_requests WHERE session_id=? AND kind=?').bind(s.id,kind).first();
    if(!confirmed)throw error;
    return json({ok:true,reference:confirmed.id,duplicate:true,emailSent:false});
  }
  return json({ok:true,reference:id,emailSent:false,humanReview:true},201);
}

async function admin(request,env,path) {
  const a=await getAuthenticatedAdmin(request,env.DB);
  if(!a||!['owner','manager'].includes(a.role)) throw new ApiError(a?403:401,'Administrator access required.');
  if(request.method==='GET'&&path==='/api/admin/ai') {
    const [entries,requests,events,usage,sessions,failures]=await Promise.all([
      env.DB.prepare('SELECT * FROM ai_knowledge ORDER BY priority DESC,title LIMIT 200').all(),
      env.DB.prepare('SELECT id,kind,client_id,details,created_at FROM ai_requests ORDER BY created_at DESC LIMIT 50').all(),
      env.DB.prepare('SELECT event,intent,count(*) AS count,avg(latency_ms) AS latency FROM ai_events GROUP BY event,intent').all(),
      env.DB.prepare('SELECT * FROM ai_usage ORDER BY day DESC LIMIT 30').all(),
      env.DB.prepare('SELECT count(*) AS count FROM ai_sessions').first(),
      env.DB.prepare("SELECT details AS reason,intent,latency_ms,created_at FROM ai_events WHERE event='provider_failure' ORDER BY id DESC LIMIT 20").all()
    ]);
    let rates;try{rates=tariff(env);}catch{rates=null;}
    return json({entries:entries.results,requests:requests.results,events:events.results,failures:failures.results,usage:usage.results.map(u=>({...u,estimatedCostUSD:rates?(u.input_tokens*rates.input+u.output_tokens*rates.output)/1000000:null,reservationUpperBoundUSD:rates?u.reserved_tokens*rates.max/1000000:null})),sessions:sessions.count,provider:env.AI_PROVIDER||'disabled',model:env.AI_MODEL||null,pricing:catalogue,limits:{dailyTokens:Number(env.AI_DAILY_TOKEN_LIMIT)||500000,dailyBudgetUSD:Number(env.AI_DAILY_BUDGET_USD)||1},resolutionRate:null,answerQuality:null});
  }
  if(request.method==='POST'&&path==='/api/admin/ai/test') {
    const b=await readJson(request,8000),page=pageContext(b.page);
    return json({entries:await retrieve(env.DB,clean(b.query,2000),page.category,language(b.query,b.language)),note:'Retrieval preview only; draft entries are excluded.'});
  }
  if(request.method==='POST'&&path==='/api/admin/ai/knowledge') {
    const b=await readJson(request,32000),id=clean(b.id,80)||crypto.randomUUID();
    if(!/^[a-zA-Z0-9-]{1,80}$/.test(id)||id.startsWith('repo-')) throw new ApiError(400,'Repository entries are maintained in Git; add a separate approved document.');
    const k={title:clean(b.title,160),category:clean(b.category,40),content:clean(b.content,8000),source_url:clean(b.source_url,400),source_type:'approved-document',language:LANGUAGES.includes(b.language)?b.language:'en',visibility:b.visibility==='internal'?'internal':'public',priority:Math.min(90,Math.max(0,Number(b.priority)||50)),verified_at:new Date().toISOString(),status:'draft'};
    if(!k.title||!k.content||!k.source_url||!k.category) throw new ApiError(400,'Title, category, content and source reference required.');
    await env.DB.batch([env.DB.prepare("INSERT INTO ai_knowledge(id,title,category,content,source_url,source_type,verified_at,status,language,visibility,priority,draft) VALUES(?,?,?,?,?,?,?,'draft',?,?,?,?) ON CONFLICT(id) DO UPDATE SET draft=excluded.draft").bind(id,k.title,k.category,k.content,k.source_url,k.source_type,k.verified_at,k.language,k.visibility,k.priority,JSON.stringify(k)),event(env.DB,null,'knowledge_draft',a.id)]);
    return json({ok:true,id,status:'draft'},201);
  }
  const match=path.match(/^\/api\/admin\/ai\/knowledge\/([a-zA-Z0-9-]+)\/(approve|outdated|archive)$/);
  if(request.method==='POST'&&match) {
    if(match[1].startsWith('repo-')) throw new ApiError(400,'Repository facts must be edited and reviewed in Git.');
    const row=await env.DB.prepare('SELECT * FROM ai_knowledge WHERE id=?').bind(match[1]).first();
    if(!row) throw new ApiError(404,'Knowledge entry not found.');
    const k=row.draft?parse(row.draft):row,status=match[2]==='approve'?'active':match[2]==='archive'?'archived':'outdated';
    const writes=[env.DB.prepare('UPDATE ai_knowledge SET title=?,category=?,content=?,source_url=?,verified_at=?,status=?,language=?,visibility=?,priority=?,draft=NULL,approved_by=? WHERE id=?').bind(k.title,k.category,k.content,k.source_url,k.verified_at,status,k.language,k.visibility,k.priority,a.id,row.id),env.DB.prepare('DELETE FROM ai_fts WHERE id=?').bind(row.id),event(env.DB,null,'knowledge_'+match[2],a.id)];
    if(status==='active'&&k.visibility==='public') writes.push(env.DB.prepare('INSERT INTO ai_fts(id,title,content,category) VALUES(?,?,?,?)').bind(row.id,k.title,k.content,k.category));
    await env.DB.batch(writes);return json({ok:true,status});
  }
  if(request.method==='POST'&&path==='/api/admin/ai/reindex') {
    await env.DB.batch([env.DB.prepare('DELETE FROM ai_fts'),env.DB.prepare("INSERT INTO ai_fts(id,title,content,category) SELECT id,title,content,category FROM ai_knowledge WHERE status='active' AND visibility='public'"),event(env.DB,null,'knowledge_reindex',a.id)]);
    return json({ok:true});
  }
  if(request.method==='GET'&&path==='/api/admin/ai/conversations') {
    const q=redact(new URL(request.url).searchParams.get('q')||'').slice(0,80);
    const result=await env.DB.prepare("SELECT s.id,s.language,s.updated_at,s.state FROM ai_sessions s WHERE EXISTS(SELECT 1 FROM ai_messages m WHERE m.session_id=s.id AND m.content LIKE ?) ORDER BY s.updated_at DESC LIMIT 50").bind('%'+q+'%').all();
    return json({conversations:result.results});
  }
  const conversation=path.match(/^\/api\/admin\/ai\/conversations\/([a-f0-9-]+)$/);
  if(request.method==='GET'&&conversation) {
    await event(env.DB,conversation[1],'admin_review',a.id).run();
    return json({messages:(await env.DB.prepare('SELECT role,content,created_at FROM ai_messages WHERE session_id=? ORDER BY id LIMIT 40').bind(conversation[1]).all()).results});
  }
  throw new ApiError(404,'Unknown AI management endpoint.');
}

export async function handleAiEmployee(request,env,ctx) {
  const path=new URL(request.url).pathname;
  if(!path.startsWith('/api/ai/')&&!path.startsWith('/api/admin/ai')) return null;
  if(!env.DB) return json({error:'AI storage unavailable.'},503);
  if(!['GET','POST','DELETE','PATCH'].includes(request.method)) return json({error:'Method not allowed.'},405);
  if(request.method!=='GET'&&!sameOrigin(request)) return json({error:'Invalid request origin.'},403);
  if(path.startsWith('/api/admin/ai')) {
    const a=await getAuthenticatedAdmin(request,env.DB);
    if(!a||!['owner','manager'].includes(a.role)) return json({error:'Administrator access required.'},a?403:401);
  }
  await initialize(env.DB);
  // Bounded maintenance runs without logging personal content. Requests retain CRM references,
  // not contact fields; existing CRM records follow the CRM's separate retention policy.
  const last=await env.DB.prepare("SELECT value FROM ai_meta WHERE key='cleanup-day'").first();
  const day=new Date().toISOString().slice(0,10);
  if(last?.value!==day) await env.DB.batch([
    env.DB.prepare("DELETE FROM ai_messages WHERE session_id IN(SELECT id FROM ai_sessions WHERE expires_at<=datetime('now'))"),
    env.DB.prepare("DELETE FROM ai_sessions WHERE expires_at<=datetime('now')"),
    env.DB.prepare("DELETE FROM ai_events WHERE created_at<datetime('now','-30 days')"),
    env.DB.prepare("DELETE FROM ai_requests WHERE created_at<datetime('now','-90 days')"),
    env.DB.prepare("INSERT INTO ai_meta(key,value) VALUES('cleanup-day',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(day)
  ]);
  if(path.startsWith('/api/admin/ai')) return admin(request,env,path);
  if(path==='/api/ai/services'&&request.method==='GET') return json({services:services(),currency:'TRY',version:catalogue.version});
  if(path==='/api/ai/session'&&request.method==='POST') {
    try{const s=await session(request,env.DB);return json({language:s.language,memory:parse(s.state),persistent:!!s.persistent,messages:(await env.DB.prepare('SELECT role,content FROM ai_messages WHERE session_id=? ORDER BY id LIMIT 40').bind(s.id).all()).results});}catch(e){if(e.status!==401)throw e;}
    const token=[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join(''),id=crypto.randomUUID();
    await env.DB.prepare("INSERT INTO ai_sessions(id,token_hash,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(id,await hash(token)).run();
    return json({language:'en',memory:{},messages:[],persistent:false},201,{'Set-Cookie':cookie(token)});
  }
  const s=await session(request,env.DB);
  if(path==='/api/ai/message'&&request.method==='POST') {
    if(!env.AI_RATE_LIMITER?.limit) return json({error:'AI rate limiting unavailable.'},503);
    const ip=request.headers.get('CF-Connecting-IP')||'unknown';
    const allowed=await env.AI_RATE_LIMITER.limit({key:'ai:'+ip});
    if(!allowed.success) return json({error:'Too many chat messages. Please wait.'},429,{'Retry-After':'60'});
    return message(request,env,s);
  }
  if(path==='/api/ai/action'&&request.method==='POST') return action(request,env,s);
  if(path==='/api/ai/quote'&&request.method==='POST') {const b=await readJson(request,8000);return json({estimate:estimate(b.selection)});}
  if(path==='/api/ai/feedback'&&request.method==='POST') {const b=await readJson(request,1000);if(!['helpful','inaccurate'].includes(b.rating))throw new ApiError(400,'Invalid feedback.');await event(env.DB,s.id,'feedback_'+b.rating).run();return json({ok:true});}
  if(path==='/api/ai/memory'&&request.method==='PATCH') {
    const b=await readJson(request,5000),state=safeMemory(parse(s.state),b.memory);
    await env.DB.prepare('UPDATE ai_sessions SET state=? WHERE id=?').bind(JSON.stringify(state),s.id).run();return json({memory:state});
  }
  if(path==='/api/ai/memory'&&request.method==='POST') {
    const b=await readJson(request,1000);
    if(b.consent!==true)throw new ApiError(400,'Persistent memory requires consent.');
    await env.DB.prepare("UPDATE ai_sessions SET persistent=1,expires_at=datetime('now','+30 days') WHERE id=?").bind(s.id).run();
    const token=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
    return json({ok:true,persistent:true},200,{'Set-Cookie':cookie(token,30)});
  }
  if(path==='/api/ai/memory'&&request.method==='DELETE') {
    await env.DB.batch([env.DB.prepare('DELETE FROM ai_messages WHERE session_id=?').bind(s.id),env.DB.prepare('DELETE FROM ai_events WHERE session_id=?').bind(s.id),env.DB.prepare('DELETE FROM ai_sessions WHERE id=?').bind(s.id)]);
    return json({ok:true,note:'Conversation and memory deleted. Submitted CRM requests remain with the team; contact us to remove them.'},200,{'Set-Cookie':cookie('',0)});
  }
  throw new ApiError(404,'Unknown assistant endpoint.');
}

export async function cleanupAiData(env) {
  if(!env.DB)return;
  await initialize(env.DB);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM ai_messages WHERE session_id IN(SELECT id FROM ai_sessions WHERE expires_at<=datetime('now'))"),
    env.DB.prepare("DELETE FROM ai_sessions WHERE expires_at<=datetime('now')"),
    env.DB.prepare("DELETE FROM ai_events WHERE created_at<datetime('now','-30 days')"),
    env.DB.prepare("DELETE FROM ai_requests WHERE created_at<datetime('now','-90 days')")
  ]);
}
