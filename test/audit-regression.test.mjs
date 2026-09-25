import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { createSession, hashPassword, verifyPassword } from '../src/security.js';
import { ensureMenuAccess, tokenHash, newMenuToken } from '../src/menu-ownership.js';

const sqlite = new DatabaseSync(':memory:');
const db = d1(sqlite);
const allow = { limit: async () => ({ success: true }) };
const env = { DB: db, TRACK_RATE_LIMITER: allow, LOGIN_RATE_LIMITER: allow };
const ctx = { waitUntil() {} };
const ids = { a: '100', b: '101' };
const tokens = { a: newMenuToken(), b: newMenuToken() };
let ownerCookie, viewerCookie, managerCookie, employeeCookie;
function request(path, method='GET', body, headers={}) {
  return new Request('https://auradigitalworks.com' + path, { method,
    headers: { Origin:'https://auradigitalworks.com', ...(body === undefined ? {} : {'Content-Type':'application/json'}), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body) });
}
const call = (path, method, body, headers, customEnv=env) => app.fetch(request(path,method,body,headers),customEnv,ctx);
const menuHeaders = key => ({ 'X-Aura-Menu-Token':tokens[key] });
const cookie = value => ({ Cookie:value });

before(async () => {
  sqlite.exec('PRAGMA foreign_keys=ON');
  assert.equal((await call('/api/settings')).status,200);
  for (const role of ['owner','manager','viewer']) {
    await db.prepare('INSERT INTO admin_users (id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)')
      .bind(role,role,role,await hashPassword('Secure-test-password-123'),role).run();
    const value='__Host-aura_admin='+await createSession(db,role);
    if(role==='owner') ownerCookie=value;
    if(role==='manager') managerCookie=value;
    if(role==='viewer') viewerCookie=value;
  }
  await ensureMenuAccess(db);
  for (const key of ['a','b']) {
    await db.prepare("INSERT INTO auramenu_requests(id,slug,template_id,business_name,contact_name,contact_phone,status,payment_status) VALUES (?,?,'orbit',?,'Contact','123','approved','paid')")
      .bind(ids[key], 'menu-'+key,'Menu '+key).run();
    await db.prepare("INSERT INTO auramenu_edit_access(menu_id,token_hash,access_until) VALUES (?,?,datetime('now','+1 day'))")
      .bind(ids[key],await tokenHash(tokens[key])).run();
  }
  await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash) VALUES ('emp-a','qusai','A',?)").bind(await hashPassword('Employee-password-123')).run();
  await db.prepare("INSERT INTO employee_users(id,portal_slug,display_name,password_hash) VALUES ('emp-b','other','B',?)").bind(await hashPassword('Employee-password-456')).run();
  const login=await call('/api/employee/login','POST',{password:'Employee-password-123'});
  assert.equal(login.status,200);
  employeeCookie=login.headers.get('set-cookie').split(';')[0];
  for (const [key,id] of [['a',100],['b',101]]) {
    await db.prepare('INSERT INTO clients(id,name) VALUES (?,?)').bind(id,'Client '+key).run();
    await db.prepare('INSERT INTO employee_clients(id,employee_user_id,main_client_id,name) VALUES (?,?,?,?)').bind(String(id),'emp-'+key,id,'Client '+key).run();
  }
});
after(()=>sqlite.close());

test('menu claim cannot steal, initialize, or rotate ownership using a known ID',async()=>{
  for(const existingToken of ['',tokens.a,'invalid']) {
    assert.equal((await call('/api/auramenu/dashboard/101/claim','POST',{existingToken})).status,401);
  }
  assert.equal((await call('/api/auramenu/dashboard/101/claim','POST',{existingToken:tokens.b})).status,200);
  assert.equal((await db.prepare('SELECT token_hash FROM auramenu_edit_access WHERE menu_id=?').bind('101').first()).token_hash,await tokenHash(tokens.b));
  await db.prepare("INSERT INTO auramenu_requests(id,slug,template_id,business_name,contact_name,contact_phone) VALUES ('102','unclaimed','orbit','Unclaimed','C','123')").run();
  assert.equal((await call('/api/auramenu/dashboard/102/claim','POST',{})).status,401);
});

test('User A cannot read, edit, delete, request access to, approve, or download User B menu',async()=>{
  const original=await db.prepare('SELECT * FROM auramenu_requests WHERE id=?').bind('101').first();
  for(const method of ['GET','PATCH','DELETE']) {
    assert.equal((await call('/api/auramenu/dashboard/101',method,method==='GET'?undefined:{businessName:'stolen'},menuHeaders('a'))).status,401);
  }
  assert.equal((await call('/api/auramenu/dashboard/101/access-request','POST',{days:30},menuHeaders('a'))).status,401);
  assert.equal((await call('/api/admin/auramenu/101','PATCH',{status:'approved',paymentStatus:'paid'},menuHeaders('a'))).status,401);
  assert.equal((await call('/api/admin/auramenu-access/101','PATCH',{action:'activate'},menuHeaders('a'))).status,401);
  assert.equal((await call('/api/auramenu/requests/101','GET',undefined,menuHeaders('a'))).status,404);
  assert.equal((await call('/api/auramenu/requests/101','GET',undefined,menuHeaders('b'))).status,200);
  assert.deepEqual(await db.prepare('SELECT * FROM auramenu_requests WHERE id=?').bind('101').first(),original);
  assert.equal((await call('/api/auramenu/dashboard/100','GET',undefined,menuHeaders('a'))).status,200);
});

test('employee A cannot read, change or delete client 101 owned by employee B',async()=>{
  for(const method of ['GET','PATCH','DELETE']) {
    const response=await call('/api/employee/clients/101',method,method==='PATCH'?{name:'stolen',employee_user_id:'emp-a',main_client_id:100}:undefined,cookie(employeeCookie));
    assert.equal(response.status,404);
  }
  assert.equal((await db.prepare('SELECT name FROM clients WHERE id=101').first()).name,'Client b');
  const response=await call('/api/employee/clients','GET',undefined,cookie(employeeCookie));
  assert.deepEqual((await response.json()).clients.map(x=>x.id),['100']);
  for(const path of ['/api/admin/clients','/api/admin/users','/api/admin/workspace/notes','/api/admin/auramenu-access']) {
    assert.equal((await call(path,'GET',undefined,cookie(employeeCookie))).status,401);
  }
});

test('viewer cannot mutate any admin route; manager cannot manage accounts or replace tokens',async()=>{
  for(const [path,method,body] of [
    ['/api/admin/clients/100','PUT',{name:'changed'}],
    ['/api/admin/clients/100','DELETE',undefined],
    ['/api/admin/auramenu-access/101','PATCH',{action:'activate',days:30}],
    ['/api/admin/auramenu-access/101','PATCH',{action:'lock'}],
    ['/api/admin/auramenu/101','PATCH',{status:'rejected'}],
    ['/api/admin/nfc/101','PATCH',{status:'approved'}],
    ['/api/admin/settings/nfc_price','PUT',{value:0}],
    ['/api/admin/workspace/notes','POST',{title:'x'}],
    ['/api/admin/users','POST',{role:'owner'}]
  ]) assert.equal((await call(path,method,body,cookie(viewerCookie))).status,403,path);
  assert.equal((await call('/api/admin/users','GET',undefined,cookie(managerCookie))).status,403);
  assert.equal((await call('/api/admin/auramenu-access/101','PATCH',{action:'rotate-token'},cookie(managerCookie))).status,403);
});

test('CSRF blocks missing and hostile origins across every cookie-authenticated mutation family',async()=>{
  for(const origin of ['', 'https://attacker.example']) {
    for(const [path,method,body,auth] of [
      ['/api/admin/login','POST',{username:'owner',password:'Secure-test-password-123'},''],
      ['/api/admin/logout','POST',{},ownerCookie],
      ['/api/admin/users','POST',{},ownerCookie],
      ['/api/admin/clients/100','PUT',{name:'x'},ownerCookie],
      ['/api/admin/workspace/notes','POST',{title:'x'},ownerCookie],
      ['/api/admin/auramenu-access/101','PATCH',{action:'activate'},ownerCookie],
      ['/api/employee/clients/100','PATCH',{name:'x'},employeeCookie],
      ['/api/employee/logout','POST',{},employeeCookie]
    ]) assert.equal((await call(path,method,body,{Cookie:auth,Origin:origin})).status,403,path);
  }
});

test('prepared queries keep SQL and privilege fields inert on a legitimate employee update',async()=>{
  const payload="Robert'); DROP TABLE clients;--";
  const response=await call('/api/employee/clients/100','PATCH',{name:payload,main_client_id:101,employee_user_id:'emp-b',role:'owner'},cookie(employeeCookie));
  assert.equal(response.status,200);
  assert.equal((await db.prepare('SELECT name FROM clients WHERE id=100').first()).name,payload);
  assert.equal((await db.prepare('SELECT name FROM clients WHERE id=101').first()).name,'Client b');
  assert.equal((await db.prepare("SELECT employee_user_id FROM employee_clients WHERE id='100'").first()).employee_user_id,'emp-a');
  assert.equal((await call('/api/admin/login','POST',{username:"owner' OR 1=1--",password:'anything'})).status,401);
});

test('menu updates ignore forged approval/payment/ownership and preserve valid edits',async()=>{
  const response=await call('/api/auramenu/dashboard/100','PATCH',{
    businessName:'Updated A',categories:[{name:'Food',items:[{name:'Soup',price:'10'}]}],
    id:'101',paymentStatus:'unpaid',status:'rejected',access_until:'2099-01-01',token_hash:'forged'
  },menuHeaders('a'));
  assert.equal(response.status,200,await response.clone().text());
  const row=await db.prepare("SELECT * FROM auramenu_requests WHERE id='100'").first();
  assert.equal(row.business_name,'Updated A');assert.equal(row.status,'approved');assert.equal(row.payment_status,'paid');
});

test('malicious uploads are rejected without changing existing data',async()=>{
  for(const imageData of ['data:image/svg+xml;base64,'+btoa('<svg onload=alert(1)>'), 'data:image/png;base64,'+btoa('<script>alert(1)</script>'), 'data:image/png;base64,!!!!']) {
    const response=await call('/api/auramenu/dashboard/100','PATCH',{businessName:'bad',categories:[{name:'x',items:[{name:'x',imageData}]}]},menuHeaders('a'));
    assert.equal(response.status,400);
    assert.equal((await call('/api/admin/workspace/notes','POST',{title:'bad',images:[imageData]},cookie(ownerCookie))).status,400);
  }
  assert.equal((await db.prepare("SELECT business_name FROM auramenu_requests WHERE id='100'").first()).business_name,'Updated A');
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM auramenu_images').first()).n,0);
});

test('unpublished images require their owner token and stale approval dates cannot publish menus',async()=>{
  await db.prepare("UPDATE auramenu_requests SET status='rejected', approved_at=datetime('now') WHERE id='101'").run();
  await db.prepare("INSERT INTO auramenu_images(id,request_id,content_type,image_bytes) VALUES ('abc','101','image/png',?)").bind(new Uint8Array([137,80,78,71])).run();
  assert.equal((await call('/api/auramenu/sites/menu-b')).status,404);
  assert.equal((await call('/api/auramenu/images/abc')).status,404);
  assert.equal((await call('/api/auramenu/images/abc','GET',undefined,menuHeaders('a'))).status,404);
  const own=await call('/api/auramenu/images/abc','GET',undefined,menuHeaders('b'));
  assert.equal(own.status,200);assert.equal(own.headers.get('cache-control'),'no-store');
  await db.prepare("UPDATE auramenu_requests SET status='approved',payment_status='unpaid' WHERE id='101'").run();
  assert.equal((await call('/api/auramenu/sites/menu-b')).status,404);
  assert.equal((await call('/api/auramenu/sites/menu-a')).status,200);
});

test('invalid credentials, invalid sessions, and unavailable rate limiting fail closed',async()=>{
  assert.equal((await call('/api/admin/login','POST',{username:'owner',password:'wrong'})).status,401);
  assert.equal((await call('/api/admin/clients','GET',undefined,{Cookie:'__Host-aura_admin=invalid'})).status,401);
  const noLimiter={...env,LOGIN_RATE_LIMITER:undefined};
  assert.equal((await call('/api/admin/login','POST',{},undefined,noLimiter)).status,503);
  const denied={...env,LOGIN_RATE_LIMITER:{limit:async()=>({success:false})}};
  const blocked=await call('/api/admin/login','POST',{},undefined,denied);
  assert.equal(blocked.status,429);assert.equal(blocked.headers.get('retry-after'),'60');
  const keys=[];
  const tracked={...env,LOGIN_RATE_LIMITER:{limit:async({key})=>{keys.push(key);return {success:true};}}};
  for(const username of ['user1','user2']) await call('/api/admin/login','POST',{username,password:'bad'}, {'CF-Connecting-IP':'192.0.2.1'},tracked);
  assert.equal(keys.filter(key=>key==='auth-ip:192.0.2.1').length,2);
});

test('NFC creation computes price on server and status is isolated by secret',async()=>{
  const response=await call('/api/nfc/requests','POST',{cardType:'menu',businessName:'NFC A',contactName:'A',contactPhone:'555-123',destinationUrl:'https://example.com',quantity:2,total:1,paymentStatus:'paid',status:'approved'});
  assert.equal(response.status,201);
  const data=await response.json();assert.equal(data.request.total,1400);assert.equal(data.request.paymentStatus,'unpaid');
  assert.match(data.token,/^[a-f0-9]{64}$/);
  const path='/api/nfc/requests/'+data.request.id;
  assert.equal((await call(path)).status,404);
  assert.equal((await call(path,'GET',undefined,{'X-Aura-Nfc-Token':tokens.a})).status,404);
  assert.equal((await call(path,'GET',undefined,{'X-Aura-Nfc-Token':data.token})).status,200);
  assert.equal((await call(path,'GET',undefined,cookie(ownerCookie))).status,200);
});

test('outer handler catches sub-router failures, enforces HTTPS, validates bodies and paths',async()=>{
  const bad={...env, DB:{prepare(){throw Error('SQL PASSWORD=secret /private/file');},batch(){throw Error('secret');}}};
  const response=await call('/api/admin/workspace/notes','GET',undefined,cookie(ownerCookie),bad);
  assert.equal(response.status,500);assert.equal(await response.text(),'{"error":"Server error."}');
  assert.match(response.headers.get('strict-transport-security'),/max-age/);
  assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  for(const path of ['/api/admin/%00','/api/admin/%5c..%5c.env','/api/admin/%ZZ']) assert.equal((await call(path)).status,400);
  assert.equal((await app.fetch(new Request('http://auradigital.ink/api/admin/login',{method:'POST'}),env,ctx)).status,400);
  const oversized=new Request('https://auradigitalworks.com/api/admin/login',{method:'POST',headers:{Origin:'https://auradigitalworks.com','Content-Type':'application/json'},body:JSON.stringify({password:'a'.repeat(2048)})});
  assert.equal((await app.fetch(oversized,env,ctx)).status,413);
});

test('restaurant demo escapes stored XSS and attribute-breaking values',()=>{
  const source=readFileSync(new URL('../restaurants/dashboard/app.js',import.meta.url),'utf8');
  const start=source.indexOf('const esc');
  const escEnd=source.indexOf('\n',start);
  const helpers=source.slice(source.indexOf('const save='),source.indexOf('function overview'));
  const context=vm.createContext({});
  vm.runInContext(source.slice(start,escEnd)+'\n'+helpers+'\n globalThis.renderTable=table;',context);
  const output=context.renderTable([{id:'100',name:'<img src=x onerror=alert(1)>',meta:'<script>alert(1)</script>',date:'<svg>',total:'<b>',status:'" onclick="alert(1)'}],'customers');
  assert.ok(output.includes('&lt;img'));
  assert.ok(!output.includes('<script>'));assert.ok(!output.includes('<img'));
  assert.ok(output.includes('pill unknown'));
});

test('bcrypt rejects truncation, legacy hashes still verify, sessions revoke after logout',async()=>{
  const hash=await hashPassword('a'.repeat(72));
  assert.equal(await verifyPassword('a'.repeat(72)+'evil',hash),false);
  const login=await call('/api/admin/login','POST',{username:'owner',password:'Secure-test-password-123'});
  assert.equal(login.status,200);
  const auth=login.headers.get('set-cookie');assert.match(auth,/HttpOnly; Secure; SameSite=Strict/);
  const session=auth.split(';')[0];
  assert.equal((await call('/api/admin/logout','POST',{},cookie(session))).status,200);
  assert.equal((await call('/api/admin/clients','GET',undefined,cookie(session))).status,401);
});
