import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { d1 } from './d1.mjs';
import { MENU_PLANS, addMonths, ensureMenuBilling, menuBillingInsert, menuBilling, activateMenuBilling, menuEntitlement } from '../src/menu-billing.js';
async function setup(plan='starter') { const db=d1(new DatabaseSync(':memory:')); await ensureMenuBilling(db); if(plan) await menuBillingInsert(db,'menu',MENU_PLANS[plan]).run();return db; }
test('calendar periods clamp end-of-month dates',()=>{
 assert.equal(addMonths('2026-01-31T12:00:00Z',1),'2026-02-28T12:00:00.000Z');
 assert.equal(addMonths('2026-08-31T12:00:00Z',6),'2027-02-28T12:00:00.000Z');
});
test('pending/unpaid menus cannot be live; payment grants one month without double activation',async()=>{
 const db=await setup();assert.equal((await menuBilling(db,'menu')).amount,399);
 assert.equal((await menuEntitlement(db,{id:'menu',status:'approved',payment_status:'paid'})).live,false);
 const first=await activateMenuBilling(db,'menu');assert.equal(first.active,true);
 assert.equal((await activateMenuBilling(db,'menu')).paidUntil,first.paidUntil);
 assert.equal((await menuEntitlement(db,{id:'menu',status:'pending',payment_status:'paid'})).live,false);
 assert.equal((await menuEntitlement(db,{id:'menu',status:'approved',payment_status:'unpaid'})).live,false);
 assert.equal((await menuEntitlement(db,{id:'menu',status:'approved',payment_status:'paid'})).live,true);
});
test('renewal extends paid period and repeated confirmation with stale period is rejected',async()=>{
 const db=await setup('pro');const first=await activateMenuBilling(db,'menu');
 const renewed=await activateMenuBilling(db,'menu',true,first.paidUntil);
 assert.equal(renewed.amount,599);assert.equal(renewed.paidUntil,addMonths(first.paidUntil,1));
 await assert.rejects(()=>activateMenuBilling(db,'menu',true,first.paidUntil),/changed/);
});
test('one-time menu charges 2500 initially and 200 on six-month hosting renewals',async()=>{
 const db=await setup('onetime');assert.equal((await menuBilling(db,'menu')).dueAmount,2500);
 const first=await activateMenuBilling(db,'menu');assert.equal(first.dueAmount,200);
 const renewed=await activateMenuBilling(db,'menu',true,first.paidUntil);assert.equal(renewed.paidUntil,addMonths(first.paidUntil,6));
});
test('expiry disables publishing, while legacy purchases retain their contract',async()=>{
 const db=await setup();await db.prepare('UPDATE auramenu_billing SET paid_until=? WHERE menu_id=?').bind('2020-01-01T00:00:00Z','menu').run();
 assert.equal((await menuEntitlement(db,{id:'menu',status:'approved',payment_status:'paid'})).live,false);
 assert.equal((await menuEntitlement(db,{id:'old',status:'approved',payment_status:'paid'})).live,true);
 const renew=await activateMenuBilling(db,'menu',true,'2020-01-01T00:00:00Z');assert.equal(renew.active,true);
});
