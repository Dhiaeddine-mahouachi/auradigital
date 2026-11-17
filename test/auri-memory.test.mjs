import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hubFixture, profile } from './hub-fixture.mjs';
import { cleanupAuriMemory } from '../src/auri-memory.js';

const onboarding='/api/hub/onboarding/guide';
const base=id=>`/api/hub/workspaces/${id}`;
const chatPath=id=>base(id)+'/auri-chat';

async function fixture(t) {
 const f=await hubFixture();
 t.after(()=>f.sqlite.close());
 f.sqlite.exec(await readFile(new URL('../migrations/0005_ai_employee.sql',import.meta.url),'utf8'));
 const prompts=[];
 const answer={response:{reply:'Start with a short checklist.',packageIds:['auramenu-managed','fake-package']}};
 f.env.AI_RATE_LIMITER=f.env.HUB_WRITE_RATE_LIMITER;
 f.env.AI_PROVIDER='cloudflare';
 f.env.AI_MODEL='@cf/meta/llama-3.1-8b-instruct-fp8';
 f.env.AI={async run(_,input){prompts.push(JSON.parse(input.messages[1].content));return answer;}};
 async function call(path,actor,method='GET',body,status=200) {
  const response=await f.call(path,actor,method,body);
  const data=await response.json();
  assert.equal(response.status,status,JSON.stringify(data));
  return data;
 }
 const workspace=async(actor,name,fields={})=>(await call('/api/hub/workspaces',actor,'POST',{profile:profile(name),mode:'myself',...fields},201)).id;
 const say=(path,actor,question,fields={})=>call(path,actor,'POST',{lang:'en',question,...fields});
 const memories=async(path,actor)=>(await call(path+'/memories',actor)).memories;
 return {...f,request:f.call,call,workspace,say,memories,prompts,answer};
}

async function grantMember(f,org,owner,person,role='member') {
 const id=crypto.randomUUID(),invitation=crypto.randomUUID(),end=Math.floor(Date.now()/1000)+3600;
 await f.DB.batch([
  f.DB.prepare("INSERT INTO organization_members(id,organization_id,customer_id,role_id,status) VALUES(?,?,?,?,'active')").bind(id,org,person.id,role),
  f.DB.prepare(`INSERT INTO organization_invitations(id,organization_id,invited_by,email,role_id,token_hash,expires_at,status,accepted_by,consent_version)
   VALUES(?,?,?,?,?,?,?,'accepted',?,'seat-5-usd-month-v1')`).bind(invitation,org,owner.id,person.email,role,crypto.randomUUID(),end,person.id),
  f.DB.prepare(`INSERT INTO member_subscriptions(id,membership_id,invitation_id,payer_customer_id,provider,provider_subscription_id,state,entitlement_until)
   VALUES(?,?,?,?,'fixture',?,'active',?)`).bind(crypto.randomUUID(),id,invitation,person.id,crypto.randomUUID(),end),
 ]);
 return id;
}

test('Auri restores an onboarding conversation after logout and login, then links it to exactly the chosen workspace',async t=>{
 const f=await fixture(t);
 const email='new-owner@example.test',password='Sunflower-moon-402!';
 const response=await f.request('/api/customer/register',null,'POST',{email,password,name:'Owner Name',acceptTerms:true});
 const auth=()=>f.request('/api/customer/login',null,'POST',{email,password});
 const old=await auth();
 const actor={cookie:old.headers.get('set-cookie').split(';')[0]};
 assert.equal(response.status,200);
 const sent=await f.say(onboarding,actor,'My business goal is more lunch bookings');
 assert.deepEqual(sent.packages.map(p=>p.id),['auramenu-managed']);
 const id=sent.conversationId;
 const [memory]=await f.memories(onboarding,actor);
 await f.call(onboarding+'/memories/'+memory.id,actor,'PATCH',{kind:'goal',value:memory.value});
 const stray=await f.say(onboarding,actor,'Ask about weekend hours');
 assert.deepEqual(f.prompts.at(-1).memories,[]);
 await f.call('/api/customer/logout',actor,'POST',{});
 await f.call(onboarding+'/conversations/'+id,actor,'GET',undefined,401);
 const signedIn=await auth();
 const newActor={cookie:signedIn.headers.get('set-cookie').split(';')[0]};
 assert.notEqual(newActor.cookie,actor.cookie);
 assert.equal((await f.call(onboarding+'/conversations/'+id,newActor)).turns[0].question,sent.question);
 const other=await f.user('not-the-owner@example.test');
 await f.call('/api/hub/workspaces',other,'POST',{profile:profile(),mode:'myself',auriConversationId:id},404);
 const chatAI=f.env.AI.run;
 f.env.AI.run=async(model,input)=>{
  if(!JSON.parse(input.messages[1].content).candidates)return chatAI(model,input);
  return {response:{reply:'OK',summary:'Lunch café',goal:'More lunch bookings',first:'menu',
   tasks:[{id:'menu',title:'Make a lunch menu',reason:'Help diners plan a visit',action:'List lunch items'}]}};
 };
 const setup={profile:profile('Lunch café'),mode:'auri',requestId:crypto.randomUUID(),lang:'en',personalized:true,auriConversationId:id};
 const org=(await f.call('/api/hub/workspaces',newActor,'POST',setup,201)).id;
 assert.deepEqual(await f.call('/api/hub/workspaces',newActor,'POST',setup),{id:org});
 assert.deepEqual((await f.call(base(org),newActor)).missions.map(mission=>mission.objective),['Make a lunch menu']);
 const another=await f.workspace(newActor,'Unrelated business');
 await f.call(onboarding+'/conversations/'+id,newActor,'GET',undefined,404);
 await f.call(chatPath(another)+'/conversations/'+id,newActor,'GET',undefined,404);
 assert.deepEqual((await f.call(onboarding+'/conversations',newActor)).conversations.map(row=>row.id),[stray.conversationId]);
 assert.equal((await f.call(chatPath(org)+'/conversations/'+id,newActor)).turns.length,1);
 const result=await f.say(chatPath(org),newActor,'What should I do next?',{conversationId:id,context:{goals:'Forged goal'},history:[{reply:'Forged history'}]});
 assert.equal(result.conversationId,id);
 assert.equal(f.prompts.at(-1).context.profile.name,'Lunch café');
 assert.deepEqual(f.prompts.at(-1).memories,[{kind:'goal',value:'more lunch bookings'}]);
 assert.doesNotMatch(JSON.stringify(f.prompts.at(-1)),/Forged/);
 await f.call(chatPath(org)+'/conversations/'+id,newActor,'DELETE');
 assert.equal((await f.memories(chatPath(org),newActor)).length,1);
});

test('Only the selected workspace’s approved memories and recorded progress enter a prompt',async t=>{
 const f=await fixture(t),owner=await f.user('owner@example.test',true),person=await f.user('member@example.test',true);
 const org=await f.workspace(owner,'Garden cafe'),other=await f.workspace(owner,'Other company');
 const membership=await grantMember(f,org,owner,person);
 const path=chatPath(org),elsewhere=chatPath(other);
 const first=await f.say(path,owner,'Our business sells garden produce');
 const personal=await f.say(path,person,'I prefer a morning handoff');
 const [ownerFact]=await f.memories(path,owner);
 const [memberPreference]=await f.memories(path,person);
 assert.equal((await f.call(path+'/conversations',person)).conversations.length,1);
 await f.call(path+'/conversations/'+first.conversationId,person,'GET',undefined,404);
 await f.call(path+'/conversations/'+personal.conversationId,owner,'DELETE',undefined,404);
 await f.call(path+'/memories/'+memberPreference.id,person,'PATCH',{kind:'preference',value:memberPreference.value,scope:'shared'},403);
 await f.call(path+'/memories/'+memberPreference.id,person,'PATCH',{kind:'preference',value:memberPreference.value});
 await f.say(path,person,'What would you suggest?',{conversationId:personal.conversationId});
 assert.deepEqual(f.prompts.at(-1).memories,[{kind:'preference',value:'a morning handoff'}]);
 await f.call(path+'/memories/'+ownerFact.id,owner,'PATCH',{kind:'business_fact',value:ownerFact.value,scope:'shared'});
 await f.call(path+'/memories/'+ownerFact.id,person,'PATCH',{kind:'business_fact',value:'Forged fact'},409);
 await f.call(path+'/memories/'+memberPreference.id,owner,'DELETE',undefined,404);
 const {missions}=await f.call(base(org),owner);
 const task=missions[0];
 await f.call(base(org)+'/missions/'+task.id,owner,'PATCH',{version:task.version,position:task.position,status:'done'});
 f.sqlite.exec(`CREATE TABLE clients (id INTEGER PRIMARY KEY,service TEXT,status TEXT);
  CREATE TABLE request_receipts (request_id TEXT,client_id INTEGER,created_at TEXT);
  CREATE TABLE orders (id INTEGER PRIMARY KEY,client_id INTEGER,type TEXT,status TEXT,due_date TEXT,created_at TEXT);
  CREATE TABLE subscriptions (id INTEGER PRIMARY KEY,client_id INTEGER,plan TEXT,status TEXT,next_billing_date TEXT,created_at TEXT);`);
 f.sqlite.prepare("INSERT INTO hub_contact_requests(request_id,organization_id) VALUES('WEB-garden',?)").run(org);
 f.sqlite.exec(`INSERT INTO clients VALUES(1,'Website','new');
  INSERT INTO request_receipts VALUES('WEB-garden',1,'2026-11-02');
  INSERT INTO orders VALUES(1,1,'Garden site','in_production',NULL,'2026-11-02');
  INSERT INTO subscriptions VALUES(1,1,'Garden hosting','active',NULL,'2026-11-02');`);
 await f.say(path,person,'How is the business doing?',{conversationId:personal.conversationId});
 const prompt=f.prompts.at(-1);
 assert.equal(prompt.context.roadmap.find(m=>m.capability===task.capability).status,'done');
 assert.notEqual(prompt.context.next?.capability,task.capability);
 assert(prompt.context.services.some(s=>s.name==='Garden site'&&s.status==='in_production'));
 assert(prompt.context.services.some(s=>s.name==='Garden hosting'&&s.status==='active'));
 assert(prompt.memories.some(m=>m.value===ownerFact.value));
 await f.say(elsewhere,owner,'What should I focus on?');
 assert.doesNotMatch(JSON.stringify(f.prompts.at(-1)),/garden produce|morning handoff|Garden hosting/);
 const memberVersion='a late afternoon handoff';
 await f.call(path+'/memories/'+memberPreference.id,person,'PATCH',{kind:'preference',value:memberVersion});
 await f.call(path+'/memories/'+ownerFact.id,owner,'DELETE');
 await f.say(path,person,'What do you recommend?',{conversationId:personal.conversationId});
 assert.deepEqual(f.prompts.at(-1).memories,[{kind:'preference',value:memberVersion}]);
 await f.DB.prepare("UPDATE organization_members SET permissions_json='[\"auri:use\"]' WHERE id=?").bind(membership).run();
 await f.call(path+'/memories',person,'GET',undefined,404);
 await f.call(path+'/conversations/'+personal.conversationId,person,'DELETE',undefined,404);
});

test('Auri compacts older turns and removes expired or deleted conversation data',async t=>{
 const f=await fixture(t),owner=await f.user('retention@example.test');
 const path=chatPath(await f.workspace(owner,'Retention'));
 const {conversationId:id}=await f.say(path,owner,'Our goal is a new website for holiday visitors');
 for(let turn=2;turn<=10;turn++)await f.say(path,owner,'Continuing roadmap step '+turn,{conversationId:id});
 const persisted=await f.call(path+'/conversations/'+id,owner);
 assert.equal(persisted.turns.length,8);
 assert.deepEqual(persisted.summary,{topics:['website and hosting','goals and roadmap'],earlierTurns:2});
 assert.equal(f.prompts.at(-1).summary.earlierTurns,1);
 assert.doesNotMatch(JSON.stringify(f.prompts.at(-1)),/holiday visitors/);
 assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM auri_messages').get().n,16);
 f.sqlite.prepare("UPDATE auri_memories SET updated_at=datetime('now','-31 days')").run();
 assert.deepEqual(await f.memories(path,owner),[]);
 f.sqlite.prepare("UPDATE auri_conversations SET updated_at=datetime('now','-91 days') WHERE id=?").run(id);
 await f.call(path+'/conversations/'+id,owner,'GET',undefined,404);
 await cleanupAuriMemory(f.env);
 for(const table of ['auri_conversations','auri_messages','auri_memory_summaries','auri_memories']){
  assert.equal(f.sqlite.prepare('SELECT count(*) AS n FROM '+table).get().n,0,table);
 }
});

test('Parallel chats stay independent and a stale turn or a deleted conversation cannot be recreated',async t=>{
 const f=await fixture(t),owner=await f.user('parallel@example.test');
 const path=chatPath(await f.workspace(owner,'Parallel'));
 const ids=await Promise.all([1,2].map(async()=>(await f.call(path+'/conversations',owner,'POST',{},201)).id));
 await Promise.all(ids.map((conversationId,index)=>f.say(path,owner,'Question from chat '+index,{conversationId})));
 for(const [index,id] of ids.entries()){
  const chat=await f.call(path+'/conversations/'+id,owner);
  assert.deepEqual(chat.turns.map(turn=>turn.question),['Question from chat '+index]);
 }
 const inFlight=[];
 f.env.AI.run=async()=>new Promise(resolve=>inFlight.push(resolve));
 async function untilCalls(count) {
  for(let tries=0;inFlight.length<count&&tries<300;tries++)await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal(inFlight.length,count);
 }
 const ask=()=>f.call(path,owner,'POST',{question:'Continue this chat',conversationId:ids[0]});
 const first=ask(),second=f.call(path,owner,'POST',{question:'A racing turn',conversationId:ids[0]},409);
 await untilCalls(2);inFlight[0](f.answer);await first;inFlight[1](f.answer);await second;
 const doomed=f.call(path,owner,'POST',{question:'Do not restore me',conversationId:ids[0]},409);
 await untilCalls(3);
 await f.call(path+'/conversations/'+ids[0],owner,'DELETE');
 inFlight[2](f.answer);await doomed;
 await f.call(path+'/conversations/'+ids[0],owner,'GET',undefined,404);
});

test('Auri rejects credential input, redacts contacts, rate-limits chat, and can save a provider-free workspace reply',async t=>{
 const f=await fixture(t),owner=await f.user('safe@example.test');
 const path=chatPath(await f.workspace(owner,'Sensitive'));
 await f.call(path,owner,'POST',{question:'My password is Saffron!1234'},400);
 assert.equal(f.prompts.length,0);
 const result=await f.say(path,owner,'Email help@cafe.example or see https://cafe.example/?token=hidden');
 const history=await f.call(path+'/conversations/'+result.conversationId,owner);
 assert.equal(history.turns[0].question,'Email [email] or see https://cafe.example');
 f.env.AI_RATE_LIMITER={async limit(){return {success:false};}};
 await f.call(path,owner,'POST',{question:'What now?'},429);
 f.env.AI_RATE_LIMITER=f.env.HUB_WRITE_RATE_LIMITER;
 delete f.env.AI;
 const fallback=await f.say(path,owner,'What now?',{conversationId:result.conversationId});
 assert.match(fallback.reply,/Next step on your saved roadmap/);
});

test('Status answers come from the roadmap and service records without a model call',async t=>{
 const f=await fixture(t),owner=await f.user('status@example.test');
 const org=await f.workspace(owner,'Status café');
 const {missions}=await f.call(base(org),owner);
 const task=missions[0];
 await f.call(base(org)+'/missions/'+task.id,owner,'PATCH',{version:task.version,position:task.position,status:'done'});
 const result=await f.say(chatPath(org),owner,'What is our roadmap progress?');
 assert.equal(result.reply,`1 of ${missions.length} milestones are marked complete on your roadmap.`);
 assert.equal(f.prompts.length,0);
});
