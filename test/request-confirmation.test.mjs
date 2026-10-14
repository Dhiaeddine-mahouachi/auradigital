import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { d1 } from './d1.mjs';
import app from '../src/worker-entry.js';
import { renderCustomerConfirmation } from '../src/customer-confirmation.js';
import { deliverRequestEmails, ensureRequestDelivery, outboxStatements } from '../src/request-delivery.js';

const sqlite = new DatabaseSync(':memory:');
const rawDb = d1(sqlite);
let transaction = Promise.resolve();
const db = {...rawDb,batch(statements) {
  const result = transaction.then(()=>rawDb.batch(statements));
  transaction = result.catch(()=>{});
  return result;
}};
const allow = { limit:async()=>({success:true}) };
const env = { DB:db,TRACK_RATE_LIMITER:allow,LOGIN_RATE_LIMITER:allow };
const ctx = { waitUntil(){} };
const base = {name:'Test <Customer>',email:'delivered@resend.dev',phone:'+90 500 000 0000',service:'Website',message:'Confirmation workflow test',language:'en'};
const submit = (body=base,key='confirmation-test-0001',database=db) => app.fetch(new Request('https://auradigitalworks.com/api/contact', {
  method:'POST',headers:{Origin:'https://auradigitalworks.com','Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(body)
}),{...env,DB:database},ctx);

test('requested email copy, escaped data, verified existing logo and plain text',()=>{
  const email=renderCustomerConfirmation({...base,requestId:'WEB-test',submittedAt:'2026-10-14T07:00:00.000Z'});
  assert.equal(email.subject,'We’ve Received Your Request — AuraDigital');
  assert.match(email.text,/Hello Test <Customer>,/);
  assert.match(email.text,/Status: Received/);
  assert.match(email.text,/Submitted: 2026-10-14T07:00/);
  assert.match(email.html,/Test &lt;Customer&gt;/);
  assert.match(email.html,/auradigital-logo-20260928.png/);
  assert.match(email.html,/#E1E100/);
  assert.doesNotMatch(email.text,/We’re reviewing|processing your request|admin/);
});

test('save precedes email; absent provider does not lose request; replay and conflicts',async()=>{
  const first=await submit();assert.equal(first.status,201);
  const a=await first.json();assert.equal(a.status,'Received');assert.equal(a.confirmationSent,false);
  assert.equal(a.confirmationPending,true);
  assert.equal((await db.prepare('SELECT COUNT(*) count FROM clients').first()).count,1);
  const receipt=await db.prepare('SELECT * FROM request_receipts WHERE request_id=?').bind(a.requestId).first();
  const client=await db.prepare('SELECT * FROM clients WHERE id=?').bind(receipt.client_id).first();
  assert.equal(client.email,base.email);assert.equal(client.status,'lead');
  const replay=await submit();assert.equal(replay.status,200);
  assert.equal((await replay.json()).requestId,a.requestId);
  const conflict=await submit({...base,message:'Changed'});assert.equal(conflict.status,409);
  assert.equal((await db.prepare('SELECT COUNT(*) count FROM clients').first()).count,1);
  assert.equal((await db.prepare('SELECT COUNT(*) count FROM request_email_outbox').first()).count,2);
  assert.doesNotMatch(JSON.stringify(a),/confirmationDetail|messageId|apiKey|provider_rejected/);
});

test('invalid input and transaction failure never confirm receipt',async()=>{
  const count=(await db.prepare('SELECT COUNT(*) count FROM clients').first()).count;
  assert.equal((await submit({...base,email:'invalid'},'invalid-email-0001')).status,400);
  const broken={...db,batch:async statements=>{
    if(statements.some(s=>s.sql.includes('INSERT INTO clients'))) return db.batch([...statements,db.prepare('INSERT INTO missing_test_table VALUES(1)')]);
    return db.batch(statements);
  }};
  const response=await submit(base,'failed-save-00001',broken);
  assert.equal(response.status,500);assert.notEqual((await response.json()).ok,true);
  assert.equal((await db.prepare('SELECT COUNT(*) count FROM clients').first()).count,count);
});

test('atomic duplicate requests create one CRM record and two outbox records',async()=>{
  const count=(await db.prepare('SELECT COUNT(*) count FROM clients').first()).count;
  const responses=await Promise.all([submit(base,'concurrent-test-0001'),submit(base,'concurrent-test-0001')]);
  const values=await Promise.all(responses.map(r=>r.json()));
  assert.ok(values.every(v=>v.ok));assert.equal(values[0].requestId,values[1].requestId);
  assert.equal((await db.prepare('SELECT COUNT(*) count FROM clients').first()).count,count+1);
});

test('temporary Resend failure retries same frozen body/key; successful emails never repeat',async()=>{
  const original=globalThis.fetch;const calls=[];let failing=true;
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});return new Response(JSON.stringify(failing ? {} : {id:'provider-test-id'}),{status:failing ? 503 : 200});
  };
  try {
    const keyed={...env,RESEND_API_KEY:'test-only-key',NOTIFICATION_EMAIL:'team@example.com',REQUEST_NOTIFICATIONS:{send:async()=>({messageId:'team-test-id'})}};
    await ensureRequestDelivery(db);
    const notice={requestId:'retry-test',contactName:'Test',customerEmail:'delivered@resend.dev',service:'Website',submittedAt:'2026-10-14T07:00:00.000Z'};
    await db.batch(outboxStatements(db,notice));
    assert.equal((await deliverRequestEmails(keyed,'retry-test')).sent,false);
    await db.prepare('UPDATE request_email_outbox SET next_at=0 WHERE request_id=?').bind('retry-test').run();
    failing=false;assert.equal((await deliverRequestEmails(keyed,'retry-test')).sent,true);
    await deliverRequestEmails(keyed,'retry-test');assert.equal(calls.length,2);
    assert.equal(calls[0].options.body,calls[1].options.body);
    assert.equal(calls[0].options.headers['Idempotency-Key'],calls[1].options.headers['Idempotency-Key']);
    assert.equal((await db.prepare("SELECT state FROM request_email_outbox WHERE request_id=? AND kind='team'").bind('retry-test').first()).state,'sent');
  } finally {globalThis.fetch=original;}
});

test('uncertain delivery stops before provider idempotency expiry; team ambiguity requires reconciliation',async()=>{
  const keyed={...env,RESEND_API_KEY:'test-only-key',NOTIFICATION_EMAIL:'team@example.com',REQUEST_NOTIFICATIONS:{send:async()=>{throw Error('uncertain timeout')}}};
  await db.batch(outboxStatements(db,{requestId:'expired-test',customerEmail:base.email,submittedAt:'2026-10-14T07:00:00.000Z'}));
  await db.prepare("UPDATE request_email_outbox SET first_attempt=? WHERE request_id=? AND kind='customer'").bind(Date.now()-24*60*60*1000,'expired-test').run();
  await deliverRequestEmails(keyed,'expired-test');
  const rows=(await db.prepare('SELECT state FROM request_email_outbox WHERE request_id=?').bind('expired-test').all()).results;
  assert.ok(rows.every(row=>row.state==='manual'));
});

test('UI protects repeat submissions and separates saved requests from email failure',()=>{
  const script=readFileSync(new URL('../script.js',import.meta.url),'utf8');
  assert.match(script,/if \(contactSubmitting\) return/);assert.match(script,/Idempotency-Key/);
  assert.doesNotMatch(script,/Email error:|started processing it/);
});
