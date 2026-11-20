import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.ADMIN_CONTROL_TEST_ORIGIN || 'http://127.0.0.1:4196';
const browser = await chromium.launch({ headless:true, executablePath:process.env.CHROMIUM_PATH||undefined });
const requests = {
  '/api/admin/session': role => ({authenticated:true,user:{id:1,username:role,displayName:'Test '+role,role}}),
  '/api/admin/overview': () => ({leads:3,activeClients:2,openOrders:2,unpaidInvoices:1,recurringRevenue:1000}),
  '/api/admin/nfc': () => ({requests:[{id:'nfc-01',businessName:'Test Card Customer',status:'pending',paymentStatus:'unpaid',createdAt:'2026-11-20T08:00:00Z'}]}),
  '/api/admin/auramenu': () => ({requests:[{id:'menu-01',businessName:'Test Cafe',status:'pending',paymentStatus:'unpaid',categories:[],createdAt:'2026-11-20T09:00:00Z'}]}),
  '/api/admin/quicksite': () => ({projects:[]}),
  '/api/admin/aurapops/pops': () => ({items:[]}),
  '/api/admin/orders': () => ({items:[]}),
  '/api/admin/clients': () => ({items:[]}),
  '/api/admin/packages': () => ({items:[]}),
  '/api/admin/services': () => ({items:[]}),
  '/api/admin/portfolio': () => ({items:[]}),
  '/api/admin/settings': () => ({settings:[]}),
  '/api/admin/global-pricing': () => ({config:{regions:{TR:{name:'Türkiye',currency:'TRY'}},prices:{TR:{}}},services:[],history:[],revision:1}),
  '/api/admin/users': () => ({items:[]}),
  '/api/admin/audit-logs': () => ({items:[]}),
  '/api/admin/analytics': () => ({daily:[],pages:[]}),
  '/api/admin/auramenu-access': () => ({items:[]}),
  '/api/admin/workspace/notes': () => ({notes:[]}),
  '/api/admin/shop/themes': () => ({role:'owner',themes:[]}),
  '/api/admin/shop/orders': () => ({orders:[]}),
  '/api/admin/ai': () => ({provider:'test',model:'test',pricing:{version:'test'},limits:{dailyTokens:1000},events:[],sessions:0,entries:[],requests:[],usage:[],failures:[]})
};
function validateNoError(page) {
  return page.locator('#content .notice.error').count().then(count => assert.equal(count,0,'Unexpected dashboard API error'));
}
async function openGroup(page,group,mobile) {
  if (mobile) await page.locator('#mobileNav').selectOption(group);
  else await page.locator('#sideNav [data-view="'+group+'"]').click();
  await page.locator('#content .cc-section-grid, #content .cc-request-links').first().waitFor();
}
async function clickCard(page,name,group,mobile) {
  await openGroup(page,group,mobile);
  const card=page.locator('#content button[data-destination="'+name+'"]');
  assert.equal(await card.isDisabled(),false, name+' was disabled');
  await card.click();
  await page.waitForFunction(view=>location.hash==='#'+view,name);
  await page.locator('#content h2').first().waitFor({timeout:10000});
  await validateNoError(page);
}
try {
  for (const [role,mobile] of [['owner',false],['viewer',false],['owner',true]]) {
    const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900}});
    const pageErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    const writes=[];
    await page.route('**/api/admin/**', async route => {
      const request=route.request();
      const path=new URL(request.url()).pathname;
      if (request.method()!=='GET') {
        writes.push(path);
        return route.fulfill({status:409,contentType:'application/json',body:'{"error":"Test forbids database writes"}'});
      }
      const response = (requests[path]||(()=>({items:[]})))(role);
      await route.fulfill({status:200,contentType:'application/json',headers:{'cache-control':'no-store'},body:JSON.stringify(response)});
    });
    await page.goto(origin+'/admin/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('#dashboardView:not(.hidden)').waitFor();
    await page.locator('#content .cc-request-panel').waitFor();
    assert.ok(await page.locator('#content').innerText().then(t=>t.includes('Test Cafe')),'Existing request should render');
    const goRequests = page.locator('#content .cc-primary[data-destination="requests"]');
    assert.equal(await goRequests.isDisabled(),false);
    await goRequests.click();
    await page.waitForFunction(()=>location.hash==='#requests');
    await page.locator('#content .cc-request-links').waitFor();
    await page.locator('#content .cc-link[data-destination="auramenu"]').click();
    await page.waitForFunction(()=>location.hash==='#auramenu');
    await validateNoError(page);

    if(role==='owner') {
      for(const name of ['global-pricing','pricing','packages','services','portfolio','shop']) {
        await clickCard(page,name,'catalog',mobile);
      }
      for(const name of ['team','audit','workspace']) {
        await clickCard(page,name,'settingsgroup',mobile);
      }
      await openGroup(page,'catalog',mobile);
      await page.locator('#content .cc-section-card[data-destination="global-pricing"]').click();
      try {
        await page.getByRole('button',{name:'Save draft',exact:true}).waitFor({timeout:15000});
      } catch (error) {
        throw new Error('Global Pricing controls missing: '+(await page.locator('#content').innerText()));
      }
    } else {
      await openGroup(page,'catalog',mobile);
      assert.equal(await page.locator('#content button[data-destination="global-pricing"]').count(),0,'Viewer must not see restricted global pricing');
      const packages=page.locator('#content .cc-section-card[data-destination="packages"]');
      assert.equal(await packages.isDisabled(),false,'Read-only users should still navigate');
      await packages.click();
      await page.waitForFunction(()=>location.hash==='#packages');
      await openGroup(page,'settingsgroup',mobile);
      assert.equal(await page.locator('#content button[data-destination="team"]').count(),0,'Viewer must not see team management');
    }
    assert.deepEqual(writes,[],'Dashboard navigation must never mutate persisted records');
    assert.deepEqual(pageErrors,[],'Browser JavaScript runtime errors');
    await page.close();
  }
  console.log('PASS: pricing and settings navigation, requests, read-only access, desktop/mobile, no writes.');
} finally {
  await browser.close();
}
