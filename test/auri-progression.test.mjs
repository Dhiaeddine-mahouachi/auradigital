import assert from 'node:assert/strict';
import test from 'node:test';
import {hubFixture,profile} from './hub-fixture.mjs';

test('Auri progression uses per-workspace verified evidence and remains separate from self-reported tasks',async()=>{
 const {call,DB,user}=await hubFixture();
 const owner=await user('owner@example.test');
 const stranger=await user('stranger@example.test');
 const created=await call('/api/hub/workspaces',owner,'POST',{mode:'auri',profile:profile()});
 const {id}=await created.json();
 const path='/api/hub/workspaces/'+id;
 const read=async()=> (await call(path,owner)).json();
 const initial=await read();
 assert.deepEqual(initial.auri,{level:2,verifiedMilestones:0});
 const mission=initial.missions[0];
 const update=await call(path+'/missions/'+mission.id,owner,'PATCH',{
  position:mission.position,version:mission.version,status:'done',auri:{level:7},
 });
 assert.equal(update.status,200);
 assert.deepEqual((await read()).auri,{level:2,verifiedMilestones:0});
 assert.equal((await call(path,stranger)).status,404);
 assert.equal((await call(path+'/auri',owner,'POST',{tool:'verify_milestone'})).status,400);
 const insert=DB.prepare('INSERT INTO auri_verified_milestones(organization_id,outcome,evidence_ref,verified_by) VALUES(?,?,?,?)');
 await insert.bind(id,'measurement','record-5','operator').run();
 assert.deepEqual((await read()).auri,{level:2,verifiedMilestones:1});
 const remaining=['foundation','visibility','conversion','operations'];
 for(const [i,outcome] of remaining.entries()){
  await insert.bind(id,outcome,'record-'+(i+1),'operator').run();
  assert.equal((await read()).auri.level,i===3?7:3+i);
 }
 assert.equal((await read()).auri.verifiedMilestones,5);
 await assert.rejects(insert.bind(id,'Duplicate','record-1','operator').run());
});

test('Only an authenticated AuraDigital operator can verify an outcome',async()=>{
 const {call,DB,env,user}=await hubFixture();
 const {handleAdminWorkspace}=await import('../src/admin-workspace.js');
 const {createSession}=await import('../src/security.js');
 const owner=await user('owner@example.test');
 const {id}=await (await call('/api/hub/workspaces',owner,'POST',{mode:'auri',profile:profile()})).json();
 const request=(cookie,origin='https://aura.test',evidenceRef='record-1')=>new Request('https://aura.test/api/admin/workspace/auri-milestones',{
  method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},
  body:JSON.stringify({organizationId:id,outcome:'visibility',evidenceRef}),
 });
 for(const role of ['owner','viewer']){
  await DB.prepare('INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES(?,?,?,?,?)').bind(role,role,role,'!test',role).run();
 }
 const adminCookie='__Host-aura_admin='+await createSession(DB,'owner');
 const viewerCookie='__Host-aura_admin='+await createSession(DB,'viewer');
 const submit=async(...args)=>(await handleAdminWorkspace(request(...args),env)).status;
 assert.equal(await submit(owner.cookie),401);
 assert.equal(await submit(viewerCookie),403);
 assert.equal(await submit(adminCookie,'https://elsewhere.test'),403);
 assert.equal(await submit(adminCookie),201);
 assert.equal(await submit(adminCookie),200);
 assert.equal(await submit(adminCookie,'https://aura.test','other-record'),409);
 const data=await (await call('/api/hub/workspaces/'+id,owner)).json();
 assert.deepEqual(data.auri,{level:2,verifiedMilestones:1});
 assert.equal(JSON.stringify(data).includes('record-1'),false);
});

test('Auri saves the member’s name, visibility and review-only drafts within their workspace',async()=>{
 const {call,user}=await hubFixture();
 const owner=await user('owner@example.test');
 const stranger=await user('stranger@example.test');
 const {id}=await (await call('/api/hub/workspaces',owner,'POST',{mode:'auri',profile:profile()})).json();
 const path='/api/hub/workspaces/'+id;
 assert.equal((await call(path+'/auri',stranger,'PATCH',{name:'Milo',hidden:true})).status,404);
 assert.equal((await call(path+'/auri',owner,'PATCH',{name:'<b>',hidden:true})).status,400);
 assert.equal((await call(path+'/auri',owner,'PATCH',{name:'Milo',hidden:true})).status,200);
 const data=await (await call(path,owner)).json();
 assert.deepEqual(data.auriPreferences,{name:'Milo',hidden:true});
 assert.equal(data.auri.level,2);
 const response=await call(path+'/auri',owner,'POST',{tool:'draft_follow_up',lang:'en'});
 assert.equal(response.status,201);
 const {draft}=await response.json();
 assert.equal(draft.source,'template');
 assert.match(draft.body,/\{name\}/);
 assert.equal((await call(path+'/auri',stranger)).status,404);
 assert.deepEqual((await (await call(path+'/auri',owner)).json()).drafts,[draft]);
});

test('A manual alternative preserves the outcome and only staff review awards credit',async()=>{
 const {call,DB,env,user}=await hubFixture();
 const {handleAdminWorkspace}=await import('../src/admin-workspace.js');
 const {createSession}=await import('../src/security.js');
 const owner=await user('owner@example.test');
 const other=await user('other@example.test');
 const {id}=await (await call('/api/hub/workspaces',owner,'POST',{mode:'auri',profile:profile()})).json();
 const path='/api/hub/workspaces/'+id;
 const read=async()=>(await call(path,owner)).json();
 const original=(await read()).missions.find(m=>m.capability==='menu');
 assert.ok(original);
 const route=path+'/mission-route/'+original.id,proof=path+'/mission-evidence/'+original.id;
 assert.equal((await call(route,owner,'PATCH',{version:original.version,route:'alternative'})).status,200);
 const manual=(await read()).missions.find(m=>m.id===original.id);
 assert.equal(manual.route,'alternative');
 assert.equal(manual.capability,'menu');
 const body={version:manual.version,proof:'Restaurant’s existing reservation workflow and follow-up checklist.'};
 assert.equal((await call(proof,other,'POST',body)).status,404);
 const response=await call(proof,owner,'POST',body);
 assert.equal(response.status,201);
 const evidence=await response.json();
 assert.equal((await read()).evidence[original.id],'pending');
 assert.equal((await read()).auri.verifiedMilestones,0);
 assert.equal((await call(proof,owner,'POST',body)).status,409);
 assert.equal((await call(route,owner,'PATCH',{version:manual.version,route:'original'})).status,409);
 await DB.prepare("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES('reviewer','reviewer','Reviewer','!test','manager')").run();
 const cookie='__Host-aura_admin='+await createSession(DB,'reviewer');
 const endpoint='https://aura.test/api/admin/workspace/mission-evidence';
 const reviewBody=JSON.stringify({id:evidence.id,status:'approved'});
 const review=()=>handleAdminWorkspace(new Request(endpoint,{method:'PATCH',headers:{Cookie:cookie,Origin:'https://aura.test','Content-Type':'application/json'},body:reviewBody}),env);
 assert.equal((await review()).status,200);
 await assert.rejects(review(),error=>error.status===409);
 const updated=await read();
 assert.equal(updated.evidence[original.id],'approved');
 assert.equal(updated.auri.verifiedMilestones,1);
 assert.equal(updated.auri.level,2); // Conversion cannot skip foundation and visibility.
 assert.equal(JSON.stringify(updated).includes(body.proof),false);
});

test('Existing website evidence can enter review without creating a purchase requirement',async()=>{
 const {call,user}=await hubFixture();
 const owner=await user('owner@example.test');
 const {id}=await (await call('/api/hub/workspaces',owner,'POST',{
  mode:'auri',profile:{...profile(),industry:'real_estate',website:'https://example.com'},
  deferredMissions:['email'],
 })).json();
 const path='/api/hub/workspaces/'+id;
 const read=async()=>(await call(path,owner)).json();
 const before=await read();
 assert.equal(before.missions.find(m=>m.capability==='email').status,'postponed');
 assert.equal(before.missions.some(m=>m.capability==='website'),false);
 const result=await call(path+'/existing-evidence',owner,'POST',{capability:'website',proof:'Published property listing website with live enquiry form.'});
 assert.equal(result.status,201);
 const {missionId}=await result.json();
 const after=await read();
 assert.equal(after.missions.find(m=>m.id===missionId).status,'postponed');
 assert.equal(after.evidence[missionId],'pending');
 assert.equal(after.auri.verifiedMilestones,0);
});

test('Auri bootstraps the additive schema on an existing workspace and keeps customer data',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {auriSchema}=await import('../src/auri-schema.js');
 const files=['0030_auri_milestones','0031_auri_preferences','0032_auri_drafts','0033_mission_evidence'];
 const migrations=await Promise.all(files.map(name=>readFile(new URL(`../migrations/${name}.sql`,import.meta.url),'utf8')));
 assert.equal(auriSchema.replace(/\r\n/g,'\n'),migrations.map(sql=>sql.trim().replace(/\r\n/g,'\n')).join('\n'));
 const {call,sqlite,user}=await hubFixture();
 const owner=await user('release-owner@example.test');
 const created=await call('/api/hub/workspaces',owner,'POST',{mode:'auri',profile:profile('Existing business')});
 const {id}=await created.json();
 sqlite.exec('DROP TABLE mission_evidence; DROP TABLE auri_drafts; DROP TABLE auri_preferences; DROP TABLE auri_verified_milestones;');
 const first=await call('/api/hub/workspaces/'+id,owner);
 assert.equal(first.status,200);
 assert.equal((await first.json()).profile.name,'Existing business');
 const next=await call('/api/hub/workspaces/'+id+'/auri',owner,'PATCH',{name:'Pebble',hidden:false});
 assert.equal(next.status,200);
});
