import test from 'node:test';
import assert from 'node:assert/strict';
import { hubFixture, profile } from './hub-fixture.mjs';

test('onboarding is private, resumable and completes once even when retried', async () => {
 const {call,user,sqlite}=await hubFixture();
 try {
  const first=await user('onboarding@example.test');
  const second=await user('unrelated@example.test');
  const path='/api/hub/onboarding';
  assert.equal((await call(path)).status,401);
  assert.deepEqual(await (await call(path,first)).json(),{draft:null});
  const draft={mode:'auri',step:3,profile:profile()};
  assert.equal((await call(path,first,'PUT',draft,{Origin:'https://different.test'})).status,403);
  assert.equal((await call(path,first,'PUT',{...draft,step:-1})).status,400);
  assert.equal((await call(path,first,'PUT',draft)).status,200);
  const saved=(await (await call(path,first)).json()).draft;
  assert.equal(saved.profile.name,draft.profile.name);
  assert.equal(saved.mode,'auri');
  assert.equal(saved.step,3);
  assert.deepEqual(await (await call(path,second)).json(),{draft:null});
  const finish={mode:'myself',profile:draft.profile,finishOnboarding:true};
  const completed=await Promise.all([1,2].map(()=>call('/api/hub/workspaces',first,'POST',finish)));
  assert.deepEqual(completed.map(r=>r.status).sort(),[200,201]);
  const [{id},retry]=await Promise.all(completed.map(r=>r.json()));
  assert.equal(retry.id,id);
  const workspace=await (await call('/api/hub/workspaces/'+id,first)).json();
  assert.equal(workspace.organization.mode,'myself');
  assert.ok(workspace.missions.some(m=>m.capability==='menu'));
  assert.equal((await (await call('/api/hub/workspaces',first)).json()).workspaces.length,1);
  assert.deepEqual(await (await call(path,first)).json(),{draft:null});
 } finally {
  sqlite.close();
 }
});
