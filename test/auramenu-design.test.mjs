import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { createSession } from '../src/security.js';
import { standardIds, premiumIds } from '../src/auramenu-designs.js';

test('feature gating, authenticated settings, plan checks, approval and existing menus',async (t) => {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  const DB = d1(sqlite);
  const limiter = {limit:async () => ({success:true})};
  const env = {DB,TRACK_RATE_LIMITER:limiter,LOGIN_RATE_LIMITER:limiter};
  function call(path,method='GET',body,credentials={}) {
    return app.fetch(new Request('https://auradigitalworks.com'+path,{
      method,body:body === undefined ? undefined : JSON.stringify(body),
      headers:{Origin:'https://auradigitalworks.com','Content-Type':'application/json',...credentials},
    }),env,{waitUntil() {}});
  }
  assert.equal((await call('/api/settings')).status,200);
  sqlite.exec(await readFile(new URL('../migrations/0041_auramenu_design_settings.sql',import.meta.url),'utf8'));
  sqlite.exec("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES ('owner','owner','Owner','test','owner')");
  const admin = {Cookie:'__Host-aura_admin=' + await createSession(DB,'owner')};
  sqlite.exec("INSERT INTO auramenu_requests(id,slug,template_id,business_name,contact_name,contact_phone,status,payment_status) VALUES ('legacy','legacy-cafe','modern','Legacy Cafe','Owner','111','approved','paid')");
  const site = '/api/auramenu/sites/';
  assert.equal((await (await call(site+'legacy-cafe')).json()).menu.templateId,'modern');
  const menu = {templateId:'std-08',planId:'starter',businessName:'New Cafe',contactName:'Owner',contactPhone:'222',
    slug:'new-cafe',categories:[{name:'Food',items:[{name:'Bread',price:'80',discountPrice:'75',available:false}],
      subcategories:[{name:'Sides',items:[{name:'Salad',price:'70',allergens:[{ar:'سمسم',en:'Sesame'}]}]}]}],
    design:{primary:'#165943',radius:100,prices:false,play:false},
    restaurant:{logo:'https://example.com/logo.webp',links:{review:'https://www.google.com/maps/'}},
  };
  const requests = '/api/auramenu/requests';
  assert.equal((await call(requests,'POST',menu)).status,403);
  assert.deepEqual((await (await call('/api/auramenu/designs')).json()).standard,[]);
  env.AURAMENU_STANDARD_ENABLED = 'true';
  assert.deepEqual((await (await call('/api/auramenu/designs')).json()).standard,standardIds);
  assert.equal((await call(requests,'POST',{...menu,templateId:'std-16'})).status,400);
  assert.equal((await call(requests,'POST',{...menu,planId:'premium'})).status,400);
  assert.equal((await call(requests,'POST',{...menu,restaurant:{links:{review:'javascript:alert(1)'}}})).status,400);
  const post = await call(requests,'POST',menu);
  assert.equal(post.status,201);
  const {request,token} = await post.json();
  const dashboard = '/api/auramenu/dashboard/'+request.id;
  const owner = {'X-Aura-Menu-Token':token};
  assert.equal((await call(dashboard)).status,401);
  assert.equal((await call(dashboard,'PATCH',menu,{'X-Aura-Menu-Token':'unused'})).status,401);
  assert.equal((await call(dashboard,'PATCH',{...menu,templateId:'prem-01'},owner)).status,400);
  const update = await call(dashboard,'PATCH',{...menu,templateId:'std-02'},owner);
  assert.equal(update.status,200);
  assert.equal((await update.json()).menu.design.radius,32);
  assert.equal((await call(site+'new-cafe')).status,404);
  assert.deepEqual((await (await call('/api/auramenu/designs')).json()).premium,premiumIds);
  const premium = {...menu,templateId:'pre-30',design:{motion:false,ornaments:false}};
  assert.equal((await call(requests,'POST',{...premium,slug:'unentitled-cafe'})).status,403);
  assert.equal((await call(dashboard,'PATCH',premium,owner)).status,403);
  env.AURAMENU_PREMIUM_ENABLED = 'true';
  env.AURAMENU_PREMIUM_MENU_IDS = 'different-restaurant';
  assert.equal((await call(dashboard,'PATCH',premium,owner)).status,403);
  env.AURAMENU_PREMIUM_MENU_IDS = request.id;
  assert.equal((await call(dashboard,'PATCH',premium,{'X-Aura-Menu-Token':'different-restaurant-token'})).status,401);
  assert.deepEqual((await (await call(dashboard,'GET',undefined,owner)).json()).menu.designAccess.premium,premiumIds);
  const premiumUpdate = await call(dashboard,'PATCH',premium,owner);
  assert.equal(premiumUpdate.status,200);
  assert.equal((await premiumUpdate.json()).menu.design.motion,false);
  const approval = '/api/admin/auramenu/'+request.id;
  env.AURAMENU_STANDARD_ENABLED = 'false';
  env.AURAMENU_PREMIUM_ENABLED = 'false';
  assert.equal((await call(approval,'PATCH',{status:'approved',paymentStatus:'paid'},admin)).status,403);
  env.AURAMENU_STANDARD_ENABLED = 'true';
  env.AURAMENU_PREMIUM_ENABLED = 'true';
  assert.equal((await call(approval,'PATCH',{status:'approved',paymentStatus:'paid'},admin)).status,200);
  env.AURAMENU_STANDARD_ENABLED = 'false';
  env.AURAMENU_PREMIUM_ENABLED = 'false';
  assert.equal((await call(dashboard,'PATCH',{...premium,templateId:'pre-25'},owner)).status,403);
  const published = (await (await call(site+'new-cafe')).json()).menu;
  assert.equal(published.templateId,'pre-30');
  assert.equal(published.design.motion,false);
  assert.equal(published.categories[0].items[0].discountPrice,'75');
  assert.equal(published.categories[0].subcategories[0].items[0].allergens[0].ar,'سمسم');
  assert.equal(Object.hasOwn(published,'contactPhone'),false);
  assert.equal((await call(dashboard,'PATCH',{...menu,templateId:'std-03'},owner)).status,403);
  const legacy = (await (await call(site+'legacy-cafe')).json()).menu;
  assert.equal(legacy.templateId,'modern');
  assert.equal(Object.hasOwn(legacy,'design'),false);
});
