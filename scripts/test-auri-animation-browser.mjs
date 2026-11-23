// Browser smoke tests for the GPU-safe Auri animation player.
// Run with AURI_TEST_ORIGIN=http://127.0.0.1:4176 node scripts/test-auri-animation-browser.mjs
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.AURI_TEST_ORIGIN||'http://127.0.0.1:4176';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:process.platform==='win32'?{channel:'chrome'}:{}),args:['--disable-webgl']});
const errors=[];
const open=async(options={})=>{
 const page=await browser.newPage(options);
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.webglContextsRequested=0;
  const old=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   if(String(type).includes('webgl'))window.webglContextsRequested++;
   return old.call(this,type,...args);
  };
 });
 await page.goto(base+'/scripts/auri-player-test.html');
 await page.waitForFunction(()=>Boolean(customElements.get('auri-character')));
 return page;
};
try{
 console.log('TEST: animations load without WebGL');
 const page=await open();
 await page.locator('auri-character[data-motion-ready]').waitFor({timeout:18000});
 assert.match(await page.locator('img.auri-motion').getAttribute('src'),/level-3-idle\.webp$/);
 assert.equal(await page.evaluate(()=>webglContextsRequested),0);
 console.log('TEST: state changes switch to animated poses');
 await page.locator('auri-character').evaluate(el=>el.dataset.phase='working');
 await page.waitForFunction(()=>document.querySelector('img.auri-motion')?.src.endsWith('level-3-working.webp'));
 await page.locator('auri-character').evaluate(el=>el.setAttribute('level','7'));
 await page.waitForFunction(()=>document.querySelector('img.auri-motion')?.src.endsWith('level-7-working.webp'));
 assert.match(await page.locator('auri-character>img:first-child').getAttribute('src'),/level-7\.webp$/);
 console.log('TEST: sleeping and recovery preserve fallback poster');
 await page.locator('auri-character').evaluate(el=>el.dataset.phase='sleeping');
 await page.waitForFunction(()=>!document.querySelector('auri-character').hasAttribute('data-motion-ready'));
 await page.locator('auri-character').evaluate(el=>el.dataset.phase='success');
 await page.waitForFunction(()=>document.querySelector('img.auri-motion')?.src.endsWith('level-7-success.webp'));
 assert.equal(await page.evaluate(()=>webglContextsRequested),0);
 await page.close();
 console.log('TEST: broken animation fails safely');
 const failed=await browser.newPage();
 await failed.route('**/media/auri/anim/**',r=>r.fulfill({status:404,body:'Not found'}));
 await failed.goto(base+'/scripts/auri-player-test.html');
 await failed.waitForTimeout(600);
 assert.equal(await failed.locator('auri-character[data-motion-ready]').count(),0);
 assert.equal(await failed.locator('auri-character>img:first-child').isVisible(),true);
 await failed.close();
 console.log('TEST: reduced motion uses the still poster');
 const reduced=await open({reducedMotion:'reduce'});
 await reduced.waitForTimeout(600);
 assert.equal(await reduced.locator('auri-character[data-motion-ready]').count(),0);
 assert.equal(await reduced.locator('auri-character>img:first-child').isVisible(),true);
 await reduced.close();
 console.log('TEST: mobile loads animation without WebGL');
 const mobile=await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.locator('auri-character[data-motion-ready]').waitFor({timeout:18000});
 assert.equal(await mobile.evaluate(()=>webglContextsRequested),0);
 await mobile.close();
 assert.deepEqual(errors,[],'Browser console exceptions');
 console.log('PASS: Auri sprite safety checks');
}finally{await browser.close();}
