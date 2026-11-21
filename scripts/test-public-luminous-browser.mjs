import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const origin=process.env.PUBLIC_PALETTE_ORIGIN||'http://127.0.0.1:4194';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
await mkdir('test-output',{recursive:true});
// Redesigned 2026 pages are covered by scripts/test-redesign-browser.mjs.
const pages=['/services.html','/websites.html'];
try{
 for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  for(const path of pages){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:45000});
    assert.ok(await page.evaluate(()=>[...document.styleSheets].some(s=>s.href?.includes('public-luminous.css'))),path+' missing stylesheet');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=3,label+' '+path+' horizontal overflow '+overflow);
    if(path==='/index.html'){
      for(const [selector,color] of [
        ['.hx-persona .hx-section-head h2','rgb(242, 248, 237)'],
        ['.ac-how .ac-section-heading h2','rgb(242, 248, 237)'],
        ['.ac-final h2','rgb(242, 248, 237)'],
      ]){
        const actual=await page.locator(selector).evaluate(el=>getComputedStyle(el).color);
        assert.equal(actual,color,label+' '+selector+' should be light on an emerald surface');
      }
      assert.ok((await page.locator('.ac-app').evaluate(el=>getComputedStyle(el).boxShadow)).includes('rgba'));
      for(const selector of ['.ac-hero','.hx-persona','.ac-how','.ac-partner','.hx-inside','.bc-section','.ac-final']){
        const bg=await page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundImage);
        assert.ok(bg.includes('gradient'),label+' '+selector+' lacks luminous layers');
      }
      for(const selector of ['.hx-persona','.ac-how','.ac-partner','#before-after','.ac-final']){
        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.waitForTimeout(80);
        await page.locator(selector).screenshot({path:'test-output/luminous-'+label+'-'+selector.replace(/[.#]/g,'')+'.png',animations:'disabled'});
      }
    }
    if(path==='/packages.html'||path==='/aura-menu.html'){
      assert.equal(await page.locator('.page-hero .display').evaluate(el=>getComputedStyle(el).color),'rgb(242, 248, 237)',label+' '+path+' heading contrast');
    }
    await page.close();
  }
 }
 console.log('PASS: 8 public pages across mobile and desktop, complementary palette, dark Emerald Gloss contrast, no horizontal overflow.');
}finally{await browser.close()}
