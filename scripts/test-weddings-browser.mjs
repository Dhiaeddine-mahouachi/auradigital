// Run after installing Playwright's browser executable. No fake screenshots or benchmark results.
import {chromium} from 'playwright';
import {signatureThemes} from '../weddings/signature-themes.js';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.WEDDINGS_TEST_URL||'https://auradigitalworks.com',folder='test-output/weddings';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});let errors=[];
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  for(const theme of signatureThemes){
   await page.goto(`${base}/weddings/signature.html?theme=${theme.slug}`,{waitUntil:'networkidle'});
   await page.locator('.gate[data-state="sealed"]').waitFor();
   await page.screenshot({path:`${folder}/${theme.slug}-${mobile?'mobile':'desktop'}-sealed.png`});
   await page.getByRole('button',{name:'Open Invitation'}).click();await page.locator('.gate[data-state="opened"]').waitFor();
   assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=window.innerWidth),true,`${theme.slug}: horizontal overflow`);
   await page.screenshot({path:`${folder}/${theme.slug}-${mobile?'mobile':'desktop'}-opened.png`,fullPage:true});
   await page.locator('#replay').click();await page.locator('.gate[data-state="sealed"]').waitFor();await page.getByRole('button',{name:'Skip animation'}).click();
   await page.locator('#language').click();assert.equal(await page.locator('body').getAttribute('dir'),'rtl');
   await page.locator('#rsvp-form [name="name"]').fill('Browser QA guest');await page.locator('#rsvp-form [name="consent"]').check();await page.locator('#rsvp-form button').click();assert.match(await page.locator('#rsvp-form .form-status').textContent(),/لا يتم حفظ/);
   await page.locator('#language').click();await page.locator('#audio-play').click();assert.equal(await page.locator('#audio-play').getAttribute('aria-pressed'),'true');await page.locator('#audio-play').click();
  }
  await context.close();
 }
 const reduced=await browser.newContext({reducedMotion:'reduce'}),p=await reduced.newPage();await p.goto(base+'/weddings/signature.html?theme=obsidian-royal');await p.getByRole('button',{name:'Open Invitation'}).click();await p.locator('.gate[data-state="opened"]').waitFor();await reduced.close();
 const c=await browser.newContext({viewport:{width:1440,height:1000}}),p2=await c.newPage();await p2.goto(base+'/aura-weddings',{waitUntil:'networkidle'});assert.equal(await p2.locator('.signature-card').count(),signatureThemes.length);await p2.screenshot({path:folder+'/collection-desktop.png',fullPage:true});await p2.goto(base+'/weddings/studio.html',{waitUntil:'networkidle'});await p2.locator('#editor [name="partnerOne"]').fill('Amina');await p2.getByRole('button',{name:'Preview full invitation',exact:true}).click();await p2.frameLocator('#preview').locator('.sig-hero h1').filter({hasText:'Amina'}).waitFor();await p2.screenshot({path:folder+'/studio-desktop.png',fullPage:true});await c.close();
 assert.deepEqual(errors,[],'Browser runtime errors');console.log('All 26 desktop/mobile previews, opening/replay/skip, RTL, demo forms, audio, reduced motion, collection and studio browser checks passed.');
}finally{await browser.close()}
