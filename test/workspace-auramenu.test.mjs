import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import app from '../src/worker-entry.js';
import { hubFixture, profile } from './hub-fixture.mjs';
import { AURAMENU_COOKIE, linkMenuOwner } from '../src/auramenu-connect.js';
import { activateMenuBilling } from '../src/menu-billing.js';

test('staged AuraMenu can edit a claimed menu, link it to one workspace and preserve the public URL', async t => {
 const f=await hubFixture();
 t.after(()=>f.sqlite.close());
 const origin='https://growth-staging.auradigitalworks.com';
 const menuOrigin='https://staging.auramenu.space';
 Object.assign(f.env,{CUSTOMER_AUTH_ORIGIN:origin,AURAMENU_ORIGIN:menuOrigin,WORKSPACE_AURAMENU_ENABLED:'true',AURAMENU_STANDARD_ENABLED:'true'});
 const owner=await f.user('stage-owner@test.test',true);
 const other=await f.user('stage-other@test.test',true);
 const call=(host,path,method='GET',body,cookie,requestOrigin=host)=>app.fetch(new Request(host+path,{
  method,headers:{Origin:requestOrigin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),
 }),f.env,{waitUntil(promise){void promise.catch(()=>{});}});
 for (const file of ['0041_auramenu_design_settings.sql','0042_workspace_auramenu_links.sql']) {
  f.sqlite.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
 }
 async function createWorkspace(actor,name) {
  const result=await call(origin,'/api/hub/workspaces','POST',{profile:profile(name),mode:'myself'},actor.cookie);
  assert.equal(result.status,201);
  return '/api/hub/workspaces/'+(await result.json()).id+'/auramenu/menus';
 }
 const primary=await createWorkspace(owner,'First business'), secondary=await createWorkspace(owner,'Second business');
 const foreign=await createWorkspace(other,'Unrelated business');
 assert.deepEqual(await (await call(origin,primary,'GET',undefined,owner.cookie)).json(),{menus:[],availableMenus:[]});
 const fixtureMenu={templateId:'std-01',planId:'starter',businessName:'Fixture Cafe',contactName:'Fixture',contactPhone:'111',slug:'fixture-cafe',categories:[{name:'Food',items:[{name:'Bread',price:'80'}]}]};
 assert.equal((await call(menuOrigin,'/api/auramenu/requests','POST',fixtureMenu,undefined,'https://auramenu.space')).status,403);
 const response=await call(menuOrigin,'/api/auramenu/requests','POST',{...fixtureMenu,slug:'linked-fixture-cafe'});
 assert.equal(response.status,201);
 const {request:{id},token}=await response.json();
 const menuCookie=owner.cookie.replace('__Host-aura_customer',AURAMENU_COOKIE);
 const dashboard='/api/auramenu/dashboard/'+id;
 const claim=await call(menuOrigin,dashboard+'/claim','POST',{existingToken:token},menuCookie);
 assert.equal(claim.status,200);
 assert.equal((await claim.json()).owned,true);
 assert.deepEqual((await (await call(origin,primary,'GET',undefined,owner.cookie)).json()).availableMenus.map(m=>m.id),[id]);
 assert.equal((await call(origin,primary,'POST',{menuId:id},other.cookie)).status,404);
 assert.equal((await call(origin,foreign,'POST',{menuId:id},other.cookie)).status,404);
 assert.equal((await call(origin,primary,'POST',{menuId:id},owner.cookie)).status,201);
 assert.equal((await call(origin,primary,'POST',{menuId:id},owner.cookie)).status,200);
 assert.equal((await call(origin,secondary,'POST',{menuId:id},owner.cookie)).status,409);
 assert.deepEqual(await (await call(origin,secondary,'GET',undefined,owner.cookie)).json(),{menus:[],availableMenus:[]});
 assert.equal((await f.DB.prepare("SELECT count(*) AS count FROM member_access_audit_logs WHERE action='auramenu_linked'").first()).count,1);

 const update=await call(menuOrigin,dashboard,'PATCH',{...fixtureMenu,businessName:'Fixture Cafe Updated',revision:1},menuCookie);
 assert.equal(update.status,200,await update.clone().text());
 await activateMenuBilling(f.DB,id);
 await f.DB.prepare("UPDATE auramenu_requests SET status='approved',payment_status='paid',approved_at=datetime('now') WHERE id=?").bind(id).run();
 const linked=await (await call(origin,primary,'GET',undefined,owner.cookie)).json();
 assert.deepEqual(linked.menus.map(m=>[m.businessName,m.publicPath,m.studioPath]),[['Fixture Cafe Updated','/linked-fixture-cafe','/studio.html?id='+id]]);
 const publicMenu=await call(menuOrigin,'/api/auramenu/sites/linked-fixture-cafe');
 assert.equal(publicMenu.status,200,await publicMenu.clone().text());
 assert.equal((await publicMenu.json()).menu.slug,'linked-fixture-cafe');
 assert.equal(await linkMenuOwner(f.DB,id,other.id),false);
 f.env.WORKSPACE_AURAMENU_ENABLED='false';
 assert.equal((await call(origin,primary,'GET',undefined,owner.cookie)).status,404);
});
