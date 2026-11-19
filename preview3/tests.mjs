import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';

test('isolated subscriber lifecycle, owner publishing and workspace persistence',async t=>{
 const key=randomUUID();
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'0',PREVIEW_DB:':memory:',PREVIEW_ADMIN:key}});
 t.after(()=>child.kill());
 const [ready]=await once(child.stdout,'data');
 const origin='http://127.0.0.1:'+String(ready).match(/port (\d+)/)[1];
 const post=async(path,body={},headers={})=>{const r=await fetch(origin+'/api/'+path,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
 const admin=(path,b)=>post('admin/'+path,b,{Authorization:'Bearer '+key});
 const sub={email:' Preview@example.test ',source:'footer',consent:true};
 await t.test('consent and owner authentication',async()=>{assert.equal((await post('subscribe',{...sub,consent:false})).status,400);assert.equal((await post('admin/overview')).status,403)});
 await t.test('resend, replay, duplicate signup, publishing and immediate opt-out',async()=>{
 const first=await post('subscribe',sub);assert.equal(first.status,200);
 const inbox=async()=>(await admin('overview')).data.inbox;
 const token=async()=> (await inbox())[0].body.split('=').pop();
 const prior=await token();await post('subscribe',sub);const current=await token();
 assert.equal((await post('confirm',{token:prior})).status,410);
 assert.equal((await post('confirm',{token:current})).status,200);
 assert.equal((await post('confirm',{token:current})).status,410);
 const unsub=await token();assert.deepEqual((await post('subscribe',sub)).data,first.data);
 const issue=(await admin('save',{subject:'Draft',body:'Test newsletter'})).data.issues[0].id;
 await admin('publish',{id:issue});await admin('publish',{id:issue});assert.equal((await inbox()).filter(m=>m.subject==='Draft').length,1);
 assert.equal((await post('unsubscribe',{token:unsub})).status,200);
 const next=(await admin('save',{subject:'Second',body:'Test'})).data.issues[0].id;await admin('publish',{id:next});assert.equal((await inbox()).filter(m=>m.subject==='Second').length,0)
 });
 await t.test('guest isolation, saved plans and independent requests',async()=>{
 const creds={email:'owner@example.test',password:'preview-only-password'};
 const {cookie,status}=await post('workspace/register',creds);assert.equal(status,200);
 const plan={ids:['web'],business:0,goal:1,packages:{}};await post('workspace/save',{plan},{cookie});await post('workspace/request',{service:'web',package:'Launch'},{cookie});
 assert.equal((await post('workspace/state')).status,401);
 const login=await post('workspace/login',creds);assert.deepEqual(login.data.plan,plan);assert.equal(login.data.requests.length,1);
 assert.deepEqual((await admin('overview')).data.counts,[{status:'unsubscribed',n:1}])
 });
});
