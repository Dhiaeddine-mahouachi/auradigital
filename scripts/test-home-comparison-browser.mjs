import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const origin=process.env.COMPARE_TEST_ORIGIN||'http://127.0.0.1:4193';
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
try{
 for(const [label,width,height] of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['small-mobile',320,720]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});
  const section=page.locator('#before-after');
  assert.equal(await section.count(),1);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  assert.equal(await section.locator('.bc-board').count(),1);
  assert.equal(await section.locator('[data-compare-row]').count(),7);
  assert.equal(await section.locator('.ac-transform-card').count(),0);
  assert.equal(await section.locator('.bc-mini-preview').count(),7);
  const colors=await section.locator('[data-compare-row]').evaluateAll(rows=>rows.map(x=>getComputedStyle(x).getPropertyValue('--bc-accent').trim()));
  assert.equal(new Set(colors).size,7,'Expected seven distinct accent colors');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,label+' horizontal overflow '+overflow);
  const cols=await section.locator('.bc-row').first().evaluate(row=>getComputedStyle(row).gridTemplateColumns);
  assert.ok(cols,label+' should render comparison');
  const picture=await section.screenshot({animations:'disabled'});
  assert.ok(picture.byteLength>15000,'Screenshot should be meaningful');
  await section.screenshot({path:'test-output/aura-comparison-'+label+'.png',animations:'disabled'});
  assert.deepEqual(errors,[],label+' browser errors');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1300,height:900},reducedMotion:'reduce'});
 await page.goto(origin+'/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('#before-after').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.bc-board.bc-motion-ready').count(),0,'Reduced motion should disable JS reveal');
 await page.close();
 console.log('PASS: unified colorful Before & After, 7 services, mobile and desktop, no overflow, reduced motion.');
}finally{await browser.close()}
