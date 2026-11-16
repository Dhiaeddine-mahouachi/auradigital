import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const origin=process.env.PORTFOLIO_TEST_ORIGIN||'http://127.0.0.1:4192';
await mkdir('test-output',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [label,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/portfolio.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('[data-work-stage]').count(),4);
  assert.equal(await page.locator('.project-grid').count(),0);
  assert.equal(await page.locator('.portfolio-person').count(),2);
  for(const image of await page.locator('.client-work-media img').all()){
   await image.scrollIntoViewIfNeeded();
   await image.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}});
   assert(await image.evaluate(img=>img.complete&&img.naturalWidth>0),'Project image did not load: '+await image.getAttribute('src'));
  }
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('#auramenu').offsetTop));
  await page.waitForTimeout(100);
  assert.match(await page.locator('[data-work-current]').innerText(),/0[1-4]/);
  for(const photo of await page.locator('.portfolio-person-photo img').all()){
   await photo.scrollIntoViewIfNeeded();
   await photo.evaluate(async img=>{img.loading='eager';try{await img.decode()}catch{}});
   assert(await photo.evaluate(img=>img.naturalWidth>0||img.parentElement.classList.contains('portfolio-media-unavailable')),'People image must load or show fallback');
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert(overflow<=2,label+' horizontal overflow: '+overflow);
  assert.deepEqual(errors,[],label+' page errors');
  await page.screenshot({path:'test-output/portfolio-'+label+'.png',fullPage:true,animations:'disabled'});
  await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
 await reduced.goto(origin+'/portfolio.html',{waitUntil:'domcontentloaded'});
 await reduced.evaluate(()=>scrollTo(0,800));
 await reduced.waitForTimeout(75);
 assert.equal(await reduced.locator('[data-work-stage]').first().locator('.client-work-card').evaluate(x=>x.style.transform),'');
 await reduced.close();
 console.log('Portfolio scroll, images, responsive layout and reduced-motion QA passed.');
}finally{await browser.close()}
