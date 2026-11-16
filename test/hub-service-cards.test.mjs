import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOwnedServiceCard, rankServicesForBusiness } from '../src/hub/service-cards.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view=(record,lang='en')=>renderOwnedServiceCard(record,{esc,lang,href:'/hub/work?active=123&workspace=321'});
test('owned service card shows real status and renewal while escaping content',()=>{
 const html=view({name:'Email <script>alert(1)</script>',status:'active',renewalDate:'2027-02-01'});
 assert.match(html,/Email &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>/);
 assert.match(html,/2027-02-01/);
 assert.match(html,/hub\/work\?active=123&amp;workspace=321/);
 assert.match(html,/is-active/);
});
test('unknown billing date is truthful and never invents a paid amount',()=>{
 const html=view({name:'Website',status:'paused',renewalDate:''});
 assert.doesNotMatch(html,/Billing date not available|Renews/);
 assert.doesNotMatch(html,/paid|₺|\$[0-9]/i);
 assert.doesNotMatch(html,/is-active/);
});
test('cards have localized actions for supported Hub languages',()=>{
 for(const lang of ['en','fr','tr','ar']) {
  const html=view({name:'QR Menu',status:'active'},lang);
  assert.match(html,/data-service-kind="menu"/);
  assert.match(html,/hub-service-primary/);
 }
});

// Service ordering is contextual, stable and never mutates backend records.
test('restaurant menus rank before generic websites; real-estate CRM ranks before menus',()=>{
 const records=[{id:'1',name:'Web Design',status:'active'},{id:'2',name:'AuraMenu',status:'active'},{id:'3',name:'CRM',status:'active'}];
 const restaurant=rankServicesForBusiness(records,{profile:{industry:'restaurant'}});
 assert.equal(restaurant[0].name,'AuraMenu');
 const estate=rankServicesForBusiness(records,{profile:{industry:'real_estate'}});
 assert.equal(estate[0].name,'CRM');
 assert.equal(records[0].name,'Web Design');
});
test('urgent renewal and customer action outrank general sector preference',()=>{
 const records=[{name:'AuraMenu',status:'active'},{name:'Business Email',status:'active',renewalDate:'2026-11-18'},{name:'Website',status:'waiting_client'}];
 const ranked=rankServicesForBusiness(records,{profile:{industry:'restaurant'},now:Date.UTC(2026,10,16)});
 assert.deepEqual(ranked.map(r=>r.name),['Website','Business Email','AuraMenu']);
});
test('current roadmap priorities inform the order without changing business data',()=>{
 const records=[{name:'Website',status:'active'},{name:'WhatsApp Automation',status:'active'}];
 const ranked=rankServicesForBusiness(records,{profile:{industry:'services'},missions:[{capability:'whatsapp',priority:1,status:'planned',optional:false}]});
 assert.equal(ranked[0].name,'WhatsApp Automation');
});
test('cards are compact: one primary action, a benefit and only known billing data',()=>{
 const html=view({name:'Web Design',status:'active'});
 assert.match(html,/Your online home/);
 assert.match(html,/data-service-kind="website"/);
 assert.equal((html.match(/hub-service-primary/g)||[]).length,1);
 assert.doesNotMatch(html,/hub-service-secondary|Next billing|Billing date not available/);
});
