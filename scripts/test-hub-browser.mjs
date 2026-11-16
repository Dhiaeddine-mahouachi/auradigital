import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base=process.env.HUB_TEST_ORIGIN||'http://127.0.0.1:4173';
const output=process.env.HUB_SCREENSHOT_DIR||'test-output';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
try {
 const desktopContext=await browser.newContext({viewport:{width:1600,height:1000}});
 const desktop=await desktopContext.newPage();
 const exceptions=[];
 desktop.on('pageerror',error=>exceptions.push(error.message));
 await desktop.goto(base+'/account/signup');
 await desktop.waitForURL('**/hub/signup');
 await desktop.locator('.command-gate-header .wordmark').filter({hasText:'Aura Command'}).waitFor();
 assert.match(await desktop.locator('script[src*="/hub/app.js"]').getAttribute('src'),/\?v=[a-f0-9]{12}$/);
 assert.match(await desktop.locator('link[href*="/hub/hub.css"]').getAttribute('href'),/\?v=[a-f0-9]{12}$/);

 assert.equal(await desktop.locator('[data-action=google]').count(),0);
 await desktop.locator('[name=name]').fill('Samir QA');
 await desktop.locator('[name=email]').fill('samir-'+crypto.randomUUID()+'@example.test');
 const email=await desktop.locator('[name=email]').inputValue();
 await desktop.locator('[name=password]').fill('Saffron-lake-0142!');
 await desktop.locator('[name=terms]').check();
 await desktop.locator('#auth-form button').click();
 await desktop.getByRole('heading',{name:"Let's build your business."}).waitFor();
 await desktop.locator('[name=source]').setInputFiles({
  name:'business.txt',mimeType:'text/plain',buffer:Buffer.from('TechStyle sells clothing online.'),
 });
 await desktop.getByText('business.txt',{exact:true}).waitFor();
 await desktop.getByRole('button',{name:'Start without documents'}).click();
 await desktop.locator('[name=name]').fill('TechStyle Store');
 await desktop.getByRole('button',{name:'Continue'}).click();
 await desktop.locator('[name=industry]').selectOption('ecommerce');
 await desktop.getByRole('button',{name:'Continue'}).click();
 await desktop.getByRole('button',{name:'Skip'}).click();
 await desktop.locator('[name=goals]').fill('Increase sales');
 await desktop.getByRole('button',{name:'Continue'}).click();
 await desktop.getByRole('heading',{name:'Review your workspace details'}).waitFor();
 await desktop.getByRole('button',{name:'Create workspace'}).click();
 await desktop.locator('.growth-path').waitFor();
 await desktop.locator('.hub-overview-intro h1').filter({hasText:'TechStyle Store'}).waitFor();
 assert.equal(await desktop.locator('.hub-evolution-track li').count(),7);
 assert.equal(await desktop.locator('.hub-evolution-track [aria-current=step] span').innerText(),'2');
 assert.equal(await desktop.locator('.hub-auri-desk').isVisible(),true);
 await desktop.locator('[data-next-mission]').click();
 await desktop.getByRole('heading',{name:'Growth Vision',exact:true}).first().waitFor();
 assert.equal(await desktop.locator('.vision-stage').count(),5);
 assert.equal(await desktop.locator('.vision-stage [aria-pressed=true]').count(),1);
 assert.equal(await desktop.getByRole('progressbar').getAttribute('aria-valuenow'),'0');
 await desktop.locator('.sidebar [data-page=home]').click();


 const companion=desktop.locator('.auri-companion');
 await companion.locator('summary').click();
 assert.match(await companion.locator('summary').innerText(),/Level 2/);
 const avatar=companion.locator('auri-character');
 await desktop.waitForFunction(()=>document.querySelector('.auri-companion img')?.naturalWidth>0);
 await desktop.route('**/api/hub/workspaces/*/auri',async route=>{
  await new Promise(resolve=>setTimeout(resolve,350));
  await route.continue();
 },{times:1});
 await companion.locator('[name=question]').fill('What should I do next?');
 await companion.locator('form button').click();
 await desktop.waitForFunction(()=>document.querySelector('.auri-companion auri-character')?.dataset.phase==='thinking');
 await desktop.waitForFunction(()=>document.querySelector('[data-auri-reply]')?.textContent.length>5);
 assert.equal(await avatar.getAttribute('level'),'2');
 await companion.locator('summary').click();

 assert.equal(await desktop.locator('.vision-stage').count(),5);
 await desktop.locator('[data-page=assistant]').click();
 await desktop.locator('[data-auri-name] input').fill('Pebble');
 await desktop.locator('[data-auri-name] button').click();
 await desktop.locator('.auri-workspace-card header strong').filter({hasText:'Pebble'}).waitFor();
 await desktop.locator('[data-auri-draft]').click();
 await desktop.locator('[data-auri-drafts] article').filter({hasText:'Template draft'}).waitFor();
 await desktop.locator('[data-auri-hide]').click();
 await desktop.locator('[data-auri-hide]').filter({hasText:'Show companion'}).waitFor();
 await desktop.locator('[data-page=home]').click();
 assert.equal(await desktop.locator('.auri-dock').count(),0);
 await desktop.locator('[data-page=assistant]').click();
 await desktop.locator('[data-auri-hide]').click();
 await desktop.locator('[data-auri-hide]').filter({hasText:'Hide companion'}).waitFor();
 await desktop.locator('[data-page=home]').click();
 await desktop.locator('.auri-dock summary strong').filter({hasText:'Pebble'}).waitFor();
 const website=desktop.locator('.vision-task').filter({hasText:/website/i}).first();
 await website.click();
 await desktop.locator('#growth-focus h2').filter({hasText:/website/i}).waitFor();
 assert.equal(await desktop.locator('.sidebar nav [data-page]').count(),6);
 await desktop.locator('#growth-focus').getByRole('button',{name:'Not relevant',exact:true}).click();
 await desktop.locator('#growth-focus h2').filter({hasText:'Use an existing discovery channel'}).waitFor();
 await desktop.locator('#growth-focus').getByRole('button',{name:'Use the original route'}).click();
 await desktop.locator('#growth-focus h2').filter({hasText:/website/i}).waitFor();
 await desktop.locator('#growth-focus').getByText('I already have this',{exact:true}).click();
 await desktop.locator('#growth-focus [data-evidence] textarea').fill('A published landing page and working contact form.');
 await desktop.locator('#growth-focus [data-evidence] button').click();
 await desktop.locator('#growth-focus .mission-proof-status').filter({hasText:'Under review'}).waitFor();

 await desktop.locator('[data-status-change]').selectOption('done');
 await desktop.locator('.growth-ring').filter({hasNotText:'0%'}).waitFor();
 await desktop.locator('[data-view=timeline]').click();
 await desktop.locator('.growth-timeline time').waitFor();
 await desktop.locator('.growth-auri input').fill('What should I do next?');
 await desktop.locator('.growth-auri form button').click();
 await desktop.waitForFunction(()=>document.querySelector('.growth-answer')?.textContent.length>5);
 const link=new URL(await desktop.locator('#growth-focus a.growth-primary').getAttribute('href'),base);
 const handoff=new URLSearchParams(link.hash.slice(1));
 assert.equal(link.pathname,'/contact');
 assert.equal(handoff.get('service'),'Web Design');
 assert.equal(handoff.get('business'),'TechStyle Store');
 assert.equal(handoff.get('email'),email);
 const contact=await desktop.context().newPage();
 await contact.goto(link.href);
 await contact.waitForFunction(()=>document.querySelector('[name=service]')?.value==='Web Design'&&!location.hash);
 assert.equal(await contact.locator('[name=email]').inputValue(),email);
 assert.match(await contact.locator('[name=message]').inputValue(),/Business: TechStyle Store/);
 await contact.close();
 await desktop.locator('.growth-account summary').click();
 await desktop.locator('[data-action=logout]').click();
 await desktop.locator('#auth-form').waitFor();
 await desktop.goto(base+'/account/login?next=%2Fshop%2Fcheckout');
 await desktop.waitForURL('**/hub/login?next=*');
 await desktop.locator('a[href^="/hub/signup"]').click();
 await desktop.waitForURL('**/hub/signup?next=*');
 await desktop.locator('a[href^="/hub/login"]').click();
 await desktop.locator('[name=email]').fill(email);
 await desktop.locator('[name=password]').fill('Saffron-lake-0142!');
 await desktop.locator('#auth-form button').click();
 await desktop.waitForURL('**/shop/checkout');
 await desktop.goto(base+'/account/login');
 await desktop.waitForURL('**/hub/login');
 await desktop.locator('.growth-ring').filter({hasNotText:'0%'}).waitFor();
 assert.equal(await desktop.locator('.auri-setup').count(),0);
 await desktop.locator('[data-view=timeline]').click();
 await desktop.locator('[data-status=done]').first().waitFor();
 // Exercise the real reset endpoint with a token seeded only in the in-memory QA database.
 const recovery=await desktopContext.newPage();
 const resetLink=await (await recovery.request.post(base+'/__qa/password-reset',{data:{email}})).json();
 await recovery.goto(base+resetLink.path);
 await recovery.waitForFunction(()=>!location.hash);
 await recovery.locator('[name=password]').fill('Saffron-lake-0143!');
 await recovery.locator('#auth-form button').click();
 await recovery.waitForURL('**/hub/login');
 await recovery.locator('[name=email]').fill(email);
 await recovery.locator('[name=password]').fill('Saffron-lake-0142!');
 await recovery.locator('#auth-form button').click();
 await recovery.locator('.form-error').filter({hasText:/incorrect/i}).waitFor();
 await recovery.locator('[name=password]').fill('Saffron-lake-0143!');
 await recovery.locator('#auth-form button').click();
 await recovery.locator('[data-view=timeline]').click();
 await recovery.locator('[data-status=done]').first().waitFor();
 await recovery.close();
 assert.deepEqual(exceptions,[]);

 // Use only the synthetic fixture in the screenshots.
 await desktop.goto(base+'/__qa/start');
 await desktop.locator('.growth-path').waitFor();
 await desktop.locator('[data-view=tree]').click();
 const active=desktop.locator('.vision-task').filter({hasText:/website/i}).first();
 await active.click();
 await desktop.locator('[data-status-change]').selectOption('done');
 await desktop.locator('.growth-ring').filter({hasNotText:'0%'}).waitFor();
 await desktop.locator('.vision-stage').nth(1).locator('button').click();
 const seo=desktop.locator('.vision-task').filter({hasText:/SEO/i}).first();
 await seo.click();
 await desktop.locator('[data-status-change]').selectOption('in_progress');
 await desktop.locator('.vision-task[data-display-state=in_progress]').waitFor();
 await desktop.screenshot({path:output+'/AuraDigital-Desktop.png',fullPage:true,animations:'disabled'});

 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await mobile.goto(base+'/__qa/start');
 await mobile.locator('.growth-path').waitFor();
 assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(await mobile.locator('.hub-auri-desk').isVisible(),false);
 assert.equal(await mobile.locator('.auri-dock summary').isVisible(),true);
 await mobile.locator('#toggle-menu').click();
 await mobile.locator('.sidebar [data-page=journey]').click();
 await mobile.locator('.vision-stage [data-node]').first().click();
 await mobile.locator('#growth-focus h2').waitFor();
 await mobile.locator('[data-ask-task]').click();
 await mobile.waitForFunction(()=>document.querySelector('.growth-answer')?.textContent.length>5);
 await mobile.evaluate(()=>window.scrollTo(0,0));
 await mobile.screenshot({path:output+'/AuraDigital-Mobile.png',fullPage:true,animations:'disabled'});
 for(const [device,screen] of [['desktop',desktop],['mobile',mobile]]){
  for(const section of ['home','journey','assistant','services','insights','settings']){
   if(device==='mobile')await screen.locator('#toggle-menu').click();
   await screen.locator(`.sidebar [data-page=${section}]`).click();
   await screen.locator('#page-content > *').first().waitFor();
   await screen.screenshot({path:`${output}/aura-command-${device}-${section}.png`,fullPage:true,animations:'disabled'});
  }
 }
 await mobile.locator('#language').selectOption('ar');
 assert.equal(await mobile.locator('html').getAttribute('dir'),'rtl');
 assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 console.log('Hub browser QA passed: signup, login, confirmed onboarding, Growth Vision, timeline, persisted progress, AURI, service handoff and mobile.');
} finally {
 await browser.close();
}
