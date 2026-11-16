import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const origin=process.env.PORTFOLIO_TEST_ORIGIN||'http://127.0.0.1:4192';
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  for (const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/portfolio.html',{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('.pf-story').count(),2,'Expected two documented client stories');
    assert.equal(await page.locator('.pf-product').count(),3,'Expected three real AuraHub feature screenshots');
    assert.equal(await page.locator('.client-work-stage,.project-grid').count(),0,'Legacy portfolio should be gone');
    for (const url of ['mutlunakliyat.site','xn--yurtotoelektrikerhankcr-8qdb.com']) {
      assert.equal(await page.locator('.pf-story-action[href*="'+url+'"]').count(),1);
    }
    for (const image of await page.locator('.pf-story-screen img, .pf-product-image img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}});
      assert(await image.evaluate(img=>img.complete&&img.naturalWidth>0),'Real project screenshot did not load: '+await image.getAttribute('src'));
    }
    for (const photo of await page.locator('.pf-hero-visual img,.pf-story-life img,.pf-outro-photo img').all()) {
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}});
      assert(await photo.evaluate(img=>img.naturalWidth>0 || !!img.closest('.pf-media-unavailable')),'Editorial photography must load or have a visible fallback');
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<=2,label+' horizontal overflow: '+overflow);
    assert.deepEqual(errors,[],label+' JavaScript errors');
    await page.screenshot({path:'test-output/portfolio-'+label+'.png',fullPage:true,animations:'disabled',timeout:30000});
    await page.close();
  }
  const reduced=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  await reduced.goto(origin+'/portfolio.html',{waitUntil:'domcontentloaded'});
  assert.equal(await reduced.locator('.pf-reveal-ready').count(),0,'Reduced motion must disable content entrance animations');
  assert.equal(await reduced.locator('.pf-story').count(),2);
  await reduced.close();
  console.log('Portfolio real-client stories, screenshot media, mobile layout, and reduced-motion QA passed.');
} finally {await browser.close()}
