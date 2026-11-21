import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hubFixture, profile } from './hub-fixture.mjs';

const route='/api/hub/workspaces';
const endpoint='https://aurahub-model.example.test/api/chat';

test('a failed Ollama plan leaves no partial workspace, and concurrent retry saves one ordered plan',async t=>{
 const fixture=await hubFixture();
 fixture.sqlite.exec(await readFile(new URL('../migrations/0005_ai_employee.sql',import.meta.url),'utf8'));
 const actor=await fixture.user('roadmap@example.test',true);
 Object.assign(fixture.env,{HUB_OLLAMA_URL:endpoint,HUB_OLLAMA_MODEL:'fixture',AI_RATE_LIMITER:{async limit(){return {success:true};}}});
 let valid=false,calls=0;
 t.mock.method(globalThis,'fetch',async (url,options)=>{
  assert.equal(String(url),endpoint);
  assert.equal(JSON.parse(options.body).model,'fixture');
  const [,message]=JSON.parse(options.body).messages;
  assert.equal(JSON.parse(message.content).profile.name,'Istanbul Coffee');
  calls++;
  const task=(id,title)=>({id,title,reason:'Help customers in Istanbul.',action:'Prepare current details.'});
  return Response.json({message:{content:JSON.stringify({
   reply:'OK',summary:'A coffee shop in Istanbul.',goal:'Increase reservations',first:'menu',
   tasks:valid?[task('menu','Prepare your coffee menu'),task('discovery','Update your Maps listing')]:[task('automation','Skip prerequisites')],
  })}});
 });
 const body={requestId:crypto.randomUUID(),mode:'auri',personalized:true,lang:'en',profile:profile('Istanbul Coffee')};
 assert.equal((await fixture.call(route,actor,'POST',body)).status,502);
 assert.equal((await (await fixture.call(route,actor)).json()).workspaces.length,0);
 valid=true;
 const results=await Promise.all([fixture.call(route,actor,'POST',body),fixture.call(route,actor,'POST',body)]);
 assert.deepEqual(results.map(response=>response.status).sort(),[200,201]);
 const before=await (await fixture.call(route+'/'+body.requestId,actor)).json();
 assert.deepEqual(before.missions.map(m=>m.capability),['menu','discovery']);
 assert.equal(before.missions[0].planGoal,'Increase reservations');
 assert.equal(before.auri.verifiedMilestones,0);
 const count=calls;
 delete fixture.env.HUB_OLLAMA_URL;
 assert.equal((await fixture.call(route,actor,'POST',body)).status,200);
 const after=await (await fixture.call(route+'/'+body.requestId,actor)).json();
 assert.deepEqual(after.missions,before.missions);
 assert.equal(calls,count);
});

test('the additive work migration preserves legacy mission IDs and menu drafts',async()=>{
 const fixture=await hubFixture();
 fixture.env.MENU_DRAFTS_ENABLED='true';
 fixture.sqlite.exec('DROP TABLE hub_menu_reviews; DROP TABLE hub_contact_requests;');
 const actor=await fixture.user('legacy@example.test',true);
 const {id}=await (await fixture.call(route,actor,'POST',{mode:'myself',profile:profile('Legacy café')})).json();
 const base=route+'/'+id;
 const {menu}=await (await fixture.call(base+'/menu-drafts',actor,'POST',{state:'preview',draft:{fields:{businessName:'Legacy café'},categories:[]}})).json();
 const before=await (await fixture.call(base,actor)).json();
 const migration=await readFile(new URL('../migrations/0034_aurahub_work.sql',import.meta.url),'utf8');
 fixture.sqlite.exec(migration);
 fixture.sqlite.exec(migration);
 const after=await (await fixture.call(base,actor)).json();
 assert.deepEqual(after.missions,before.missions);
 assert.deepEqual(after.auri,before.auri);
 const menuPath=base+'/menu-drafts/'+menu.id;
 assert.equal((await (await fixture.call(menuPath,actor)).json()).menu.reviewed,false);
 assert.equal((await fixture.call(menuPath,actor,'PATCH',{version:menu.version})).status,200);
 assert.equal((await (await fixture.call(menuPath,actor)).json()).menu.reviewed,true);
 await fixture.call(menuPath,actor,'PUT',{version:menu.version,state:'preview',draft:menu.draft});
 assert.equal((await (await fixture.call(menuPath,actor)).json()).menu.reviewed,false);
});

test('when Auri is unavailable, an Auri setup still saves the standard roadmap',async()=>{
 const fixture=await hubFixture();
 fixture.sqlite.exec(await readFile(new URL('../migrations/0005_ai_employee.sql',import.meta.url),'utf8'));
 const actor=await fixture.user('no-ai@example.test',true);
 delete fixture.env.HUB_OLLAMA_URL;delete fixture.env.AI;fixture.env.AI_PROVIDER='ollama';
 const body={requestId:crypto.randomUUID(),mode:'auri',personalized:true,lang:'en',profile:profile('Offline Bakery')};
 const response=await fixture.call(route,actor,'POST',body);
 assert.equal(response.status,201,await response.clone().text());
 assert.equal((await response.json()).planFallback,true);
 const saved=await (await fixture.call(route+'/'+body.requestId,actor)).json();
 assert.ok(saved.missions.length>0,'standard roadmap saved');
});
