import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { d1 } from './d1.mjs';
import { activationMail, handleSupport, deliverMail, ensureMail } from '../src/service-mail.js';
const setup=()=>({DB:d1(new DatabaseSync(':memory:')),RESEND_API_KEY:'test-key'});
const report=(data={},origin='https://auramenu.space')=>new Request('https://auradigitalworks.com/api/support/report',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify({email:'client@example.com',problem:'Menu picture is missing <script>alert(1)</script>',page:origin+'/builder.html?token=private#secret',...data})});
test('report stores details, queues both emails, strips sensitive URLs and escapes HTML',async()=>{
 const env=setup();const response=await handleSupport(report(),env);assert.equal(response.status,202);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://auramenu.space');
 const reports=await env.DB.prepare('SELECT * FROM aura_support_reports').all();assert.equal(reports.results[0].page_url,'https://auramenu.space/builder.html');
 const rows=await env.DB.prepare('SELECT payload FROM aura_mail_outbox ORDER BY id').all();assert.equal(rows.results.length,2);const messages=rows.results.map(x=>JSON.parse(x.payload));
 assert.ok(messages.some(x=>x.to[0]==='info@auradigitalworks.com'&&x.reply_to==='client@example.com'));
 assert.ok(messages.some(x=>x.to[0]==='client@example.com'&&x.from.includes('noreply@auradigitalworks.com')));
 assert.ok(messages.every(x=>!x.html.includes('<script>')));
});
test('support rejects foreign origins, invalid email, short problem and abuse',async()=>{
 const env=setup();assert.equal((await handleSupport(report({},'https://evil.example'),env)).status,403);
 assert.equal((await handleSupport(report({email:'bad'}),env)).status,400);assert.equal((await handleSupport(report({problem:'x'}),env)).status,400);
 for(let i=0;i<5;i++)assert.equal((await handleSupport(report(),env)).status,202);
 assert.equal((await handleSupport(report(),env)).status,429);
 assert.equal((await handleSupport(report(),{DB:env.DB})).status,503);
});
test('activation only queues paid newly approved resources, with safe dashboard link and no duplicate',async()=>{
 const env=setup(),current={id:'menu1',status:'pending',payment_status:'unpaid',email:'client@example.com',business_name:'Café',slug:'cafe'};
 const updated={...current,status:'approved',payment_status:'paid',approved_at:'2026-10-03T00:00:00Z'};
 assert.equal(await activationMail(env.DB,'menu',current,{...updated,payment_status:'unpaid'}),null);
 await (await activationMail(env.DB,'menu',current,updated)).run();await (await activationMail(env.DB,'menu',current,updated)).run();
 assert.equal(await activationMail(env.DB,'menu',updated,updated),null);
 const rows=await env.DB.prepare('SELECT * FROM aura_mail_outbox').all();assert.equal(rows.results.length,1);assert.ok(JSON.parse(rows.results[0].payload).html.includes('https://auramenu.space/account'));
 await env.DB.batch([env.DB.prepare('CREATE TABLE aurapops_ownership (pop_id TEXT, customer_id TEXT)'),env.DB.prepare('CREATE TABLE aurapops_customers (id TEXT, email TEXT)'),env.DB.prepare("INSERT INTO aurapops_ownership VALUES ('pop1','owner')"),env.DB.prepare("INSERT INTO aurapops_customers VALUES ('owner','owner@example.com')")]);
 const pop={id:'pop1',status:'pending',payment_status:'unpaid',slug:'profile',title:'Profile'};
 await (await activationMail(env.DB,'pop',pop,{...pop,status:'approved',payment_status:'paid',approved_at:'now'})).run();
 const queued=await env.DB.prepare("SELECT payload FROM aura_mail_outbox WHERE id LIKE 'activation/pop/%'").first();assert.equal(JSON.parse(queued.payload).to[0],'owner@example.com');assert.ok(queued.payload.includes('https://aurapops.online/dashboard'));
});
test('provider failure preserves retry; sent mail is not delivered again',async()=>{
 const env=setup();await handleSupport(report(),env);const original=globalThis.fetch;let calls=0;
 try {
  globalThis.fetch=async()=>{calls++;return new Response('{}',{status:503});};await deliverMail(env);
  assert.equal((await env.DB.prepare('SELECT count(*) AS n FROM aura_mail_outbox WHERE sent_at IS NULL').first()).n,2);
  await env.DB.prepare("UPDATE aura_mail_outbox SET next_attempt=datetime('now','-1 minute')").run();calls=0;
  globalThis.fetch=async()=>{calls++;return new Response('{"id":"accepted"}',{status:200});};
  // Schema creation is independent of competing message leases.
  await ensureMail(env.DB);await deliverMail(env);await deliverMail(env);assert.equal(calls,2);
  assert.equal((await env.DB.prepare('SELECT count(*) AS n FROM aura_mail_outbox WHERE sent_at IS NOT NULL').first()).n,2);
 }finally{globalThis.fetch=original;}
});
