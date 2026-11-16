import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOwnedServiceCard } from '../src/hub/service-cards.js';
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
 assert.match(html,/Billing date not available/);
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
