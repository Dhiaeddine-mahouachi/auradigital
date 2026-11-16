import test from 'node:test';
import assert from 'node:assert/strict';
import { hubFixture, profile } from './hub-fixture.mjs';

test('service directory exposes independently scoped order and subscription records',async()=>{
 const f=await hubFixture();
 const owner=await f.user('owner@example.test',true);
 const stranger=await f.user('stranger@example.test',true);
 const create=async actor=>(await (await f.call('/api/hub/workspaces',actor,'POST',{mode:'myself',profile:profile()})).json()).id;
 const org=await create(owner);
 const other=await create(stranger);
 const path=id=>'/api/hub/workspaces/'+id+'/work';
 assert.deepEqual((await (await f.call(path(org),owner)).json()).records,[]);
 f.sqlite.exec(`
  CREATE TABLE request_receipts (request_id TEXT PRIMARY KEY,client_id INTEGER);
  CREATE TABLE orders (id INTEGER PRIMARY KEY,client_id INTEGER,type TEXT,status TEXT,due_date TEXT,created_at TEXT,amount REAL,notes TEXT);
  CREATE TABLE subscriptions (id INTEGER PRIMARY KEY,client_id INTEGER,plan TEXT,status TEXT,next_billing_date TEXT,created_at TEXT);
  INSERT INTO request_receipts VALUES ('a',2),('b',2),('c',3);
  INSERT INTO orders VALUES (1,2,'Website','in_production','2026-12-02','2026-11-16',2000,'Internal'),
   (2,2,'Website','completed',NULL,'2026-11-16',3000,'Internal'),(3,3,'Other website','completed',NULL,'2026-11-16',4000,'Internal');
  INSERT INTO subscriptions VALUES (1,2,'Hosting','active','2026-12-22','2026-11-16');
 `);
 const link=f.sqlite.prepare('INSERT INTO hub_contact_requests VALUES (?,?)');
 link.run('a',org);link.run('b',org);link.run('c',other);
 const {records}=await (await f.call(path(org),owner)).json();
 assert.deepEqual(records.map(r=>r.key),['order-2','order-1','subscription-1']);
 const record=await (await f.call(path(org)+'/order-1',owner)).json();
 assert.deepEqual(record,{id:1,name:'Website',dueDate:'2026-12-02',createdAt:'2026-11-16',status:'in_production',kind:'order',key:'order-1'});
 assert.equal((await f.call(path(org)+'/order-1',null)).status,401);
 assert.equal((await f.call(path(org)+'/order-1',stranger)).status,404);
 assert.equal((await f.call(path(other)+'/order-1',stranger)).status,404);
 const lookup=(id,actor)=>f.call('/api/hub/workspaces/'+id+'/auri',actor,'POST',{tool:'service_status',serviceKey:'order-1'});
 assert.deepEqual((await (await lookup(org,owner)).json()).data.service,record);
 assert.equal((await lookup(other,stranger)).status,404);
});
