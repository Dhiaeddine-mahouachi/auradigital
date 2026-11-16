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
 for(let i=1;i<=6;i++){
  await insert.bind(id,'Outcome '+i,'record-'+i,'operator').run();
  assert.equal((await read()).auri.level,Math.min(7,i+2));
 }
 assert.equal((await read()).auri.verifiedMilestones,6);
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
 assert.deepEqual(data.auri,{level:3,verifiedMilestones:1});
 assert.equal(JSON.stringify(data).includes('record-1'),false);
});
