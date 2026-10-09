// Run with Playwright installed. AURA_CHROMIUM_PATH can select an available Chromium.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const output=process.env.AURA_QA_OUTPUT||join(tmpdir(),'aura-qa');await mkdir(output,{recursive:true});
let server;
const base=process.env.AURA_QA_BASE_URL||'https://127.0.0.1:8792';
if(!process.env.AURA_QA_BASE_URL){server=spawn(process.execPath,[new URL('../node_modules/wrangler-cli/bin/wrangler.js',import.meta.url).pathname,'dev','--local','--port','8792','--ip','127.0.0.1','--local-protocol','https','--persist-to',join(tmpdir(),'aura-browser-db'),'--var','ADMIN_PASSWORD:Local-test-fixture-password-2026'],{stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_OPTIONS:process.env.AURA_OS_FALLBACK?`--require=${process.env.AURA_OS_FALLBACK}`:process.env.NODE_OPTIONS||''}});await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Local Worker did not start.')),45000);const watch=chunk=>{const s=chunk.toString();if(s.includes('Ready on')){clearTimeout(timer);resolve();}};server.stdout.on('data',watch);server.stderr.on('data',watch);server.on('exit',code=>{clearTimeout(timer);reject(new Error('Local Worker exited: '+code));});});}
let browser;
const results={pages:[],errors:[],interactions:[],browser:'Chromium',widths:[320,360,375,390,430,768,820,1024,1280,1440,1920]};
try{
 const args=['--no-sandbox','--no-zygote','--single-process','--disable-dev-shm-usage','--in-process-gpu','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 browser=await chromium.launch({headless:true,...(process.env.AURA_CHROMIUM_PATH?{executablePath:process.env.AURA_CHROMIUM_PATH,args}:{})});
 const context=await browser.newContext({reducedMotion:'reduce',ignoreHTTPSErrors:true});await context.addInitScript(()=>{try{localStorage.setItem('aura-cookie-choice-v2','necessary')}catch{}});const page=await context.newPage();
 page.on('console',msg=>{if(msg.type()==='error'&&msg.location().url.startsWith(base)&&!msg.text().includes('401'))results.errors.push({type:'console',message:msg.text(),url:msg.location().url});});
 page.on('pageerror',e=>results.errors.push({type:'exception',message:e.message,url:page.url()}));
 page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/api/projects/')&&!r.url().includes('images.unsplash.com'))results.errors.push({type:'http',status:r.status(),url:r.url()});});
 const routes=['/','/services','/websites','/systems','/portfolio','/about','/pricing','/build','/contact','/aura-menu','/aurapops','/aura-weddings','/nfc','/qr-menu','/packages','/nfc-studio','/nfc-status','/404.html'];
 if(process.env.AURA_QA_WIDTHS)results.widths=process.env.AURA_QA_WIDTHS.split(',').map(Number);
 for(const width of results.widths){await page.setViewportSize({width,height:900});await page.setExtraHTTPHeaders({'CF-Connecting-IP':`192.0.2.${results.widths.indexOf(width)+1}`});
  for(const route of routes){await page.goto(base+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(160);const audit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,duplicateIds:[...document.querySelectorAll('[id]')].map(el=>el.id).filter((v,i,a)=>a.indexOf(v)!==i),h1:document.querySelectorAll('h1').length,missingAlt:[...document.querySelectorAll('img')].filter(el=>!el.hasAttribute('alt')).length}));results.pages.push({route,width,...audit});if([390,1440].includes(width)&&['/','/aura-menu','/aura-weddings','/aurapops','/pricing','/build','/systems','/nfc'].includes(route))await page.screenshot({path:join(output,(route==='/'?'home':route.slice(1))+`-${width}.png`)});if(audit.overflow)console.log('OVERFLOW',route,width,audit.scrollWidth);}
 }
 await page.setViewportSize({width:1440,height:1000});await page.setExtraHTTPHeaders({'CF-Connecting-IP':'192.0.2.200'});await page.goto(base+'/');await page.screenshot({path:join(output,'home-desktop.png')});await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(output,'home-mobile.png')});
 await page.locator('#menuBtn').click();if(await page.locator('#menuBtn').getAttribute('aria-expanded')!=='true')throw new Error('Mobile menu did not open.');await page.keyboard.press('Escape');if(await page.locator('#menuBtn').getAttribute('aria-expanded')!=='false')throw new Error('Mobile menu did not close.');results.interactions.push('mobile navigation and Escape');
 await page.goto(base+'/pricing');await page.locator('[data-country-select]').selectOption('US');await page.waitForTimeout(200);if(!(await page.locator('[data-package-price=static]').textContent()).includes('315'))throw new Error('USA price mismatch');results.interactions.push('localized pricing country switch');
 await page.goto(base+'/build');await page.locator('[name=package][value=static]').check();for(let i=0;i<4;i++)await page.locator('[data-build-next]').click();await page.locator('[name=name]').fill('Browser QA');await page.locator('[name=email]').fill(`browser-${Date.now()}@example.test`);await page.locator('[name=whatsapp]').fill('+123456789');await page.locator('textarea[name=description]').fill('Local regression test only.');await page.locator('[data-build-next]').click();await page.locator('[name=consent]').check();await page.locator('[data-build-submit]').click();await page.waitForFunction(()=>document.querySelector('[data-form-status]').textContent.includes('Request received'));results.interactions.push('configurator steps, validation and actual local D1 request creation');
 await page.goto(base+'/aura-menu');await page.locator('[data-menu-choice]').first().click();if(await page.locator('#menuChoiceModal').getAttribute('aria-hidden')!=='false')throw new Error('Menu modal failed');await page.keyboard.press('Escape');results.interactions.push('AuraMenu choice modal');
 await page.goto(base+'/aura-weddings');await page.waitForSelector('.aw-theme');if(await page.locator('.aw-theme').count()!==50)throw new Error('Wedding themes lost');await page.locator('[data-filter=minimal]').click();await page.locator('#weddingPersonalizer input[name=partnerOne]').fill('Dhia');await page.locator('.aw-preview:visible').first().click();await page.waitForSelector('dialog[open]');results.interactions.push('50 wedding themes, filtering, personalization and preview dialog');
 await page.goto(base+'/nfc');await page.locator('[data-destination="WhatsApp"]').click();if(await page.locator('[data-destination-preview] h3').textContent()!=='WhatsApp')throw new Error('NFC destination failed');await page.locator('[data-tap-demo]').click();results.interactions.push('NFC destination switching and tap demo');
 for(const lang of ['en','tr','ar','fr']){
  await page.goto(base+`/weddings/preview.html?theme=royal-ivory&lang=${lang}&one=Dhia&two=Nour`);
  await page.waitForSelector('.open-card');
  if(await page.locator('html').getAttribute('lang')!==lang)throw new Error('Invitation language mismatch: '+lang);
  if(lang==='ar'&&await page.locator('html').getAttribute('dir')!=='rtl')throw new Error('Arabic invitation is not RTL');
  await page.locator('.open-card').click();await page.locator('.rsvp-open').click();await page.keyboard.press('Escape');
  if(await page.locator('dialog[open]').count())throw new Error('RSVP Escape failed');
 }results.interactions.push('EN/TR/AR/FR invitation, RTL and RSVP dialog Escape');
 await page.route('**/api/public-content',route=>route.fulfill({json:{services:[{name:'Managed service',description:'Editable service'}],portfolio:[{title:'Managed project',type:'Web',description:'Editable project',image:'/media/project-mutlu.webp'}],settings:{},packages:[]}}));
 await page.goto(base+'/portfolio');await page.getByRole('heading',{name:'Managed project'}).waitFor();
 await page.goto(base+'/services');await page.getByRole('heading',{name:'Managed service'}).waitFor();
 results.interactions.push('existing admin-managed services and portfolio content rendering');
 await page.unroute('**/api/public-content');await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/admin/');await page.locator('#username').fill('owner');await page.locator('#password').fill('Local-test-fixture-password-2026');await page.locator('#loginBtn').click();await page.locator('#dashboardView').waitFor({state:'visible'});
 await page.locator('[data-view=requests]').click();await page.locator('[data-studio-details]').first().click();await page.locator('#studioProjectEdit').waitFor();
 await page.locator('#studioProjectEdit [name=status]').selectOption('REVIEWING');await page.locator('#studioProjectEdit [name=notes]').fill('Local browser QA only');await page.locator('#studioProjectEdit button').click();await page.locator('.studio-events').getByText('REVIEWING',{exact:true}).waitFor();
 await page.locator('[data-view=studioPricing]').click();await page.locator('#studioCatalog').waitFor();
 await page.screenshot({path:join(output,'admin-pricing-desktop.png')});
 results.interactions.push('local admin authentication, request details, status update and pricing editor');

 await writeFile(join(output,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({pageChecks:results.pages.length,overflow:results.pages.filter(p=>p.overflow),exceptions:results.errors.filter(e=>e.type==='exception'),httpErrors:results.errors.filter(e=>e.type==='http'),interactions:results.interactions,output},null,2));if(results.pages.some(p=>p.overflow||p.duplicateIds.length||p.missingAlt)||results.errors.length)process.exitCode=1;
}catch(error){console.error(error);await writeFile(join(output,'browser-results.json'),JSON.stringify({...results,fatal:error.message},null,2));process.exitCode=1;}finally{if(browser)await browser.close();server?.kill();}
