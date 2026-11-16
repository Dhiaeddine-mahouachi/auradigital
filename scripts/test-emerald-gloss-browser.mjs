import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const origin=process.env.AURA_THEME_TEST_ORIGIN||'http://127.0.0.1:4195';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
const pages=[
 ['/about.html','.page-hero'],
 ['/services.html','.page-hero'],
 ['/contact.html','.contact-form'],
 ['/portfolio.html','.pf-intro'],
 ['/aura-menu.html','.page-hero'],
 ['/aura-weddings.html','.aw-ivory'],
 ['/nfc-builder.html','.form-card'],
 ['/nfc-status.html','.status-card'],
 ['/shop/','.shop-page'],
 ['/hub/','body']
];
try{
 for(const [path,selector] of pages){
  const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
  await page.goto(origin+path,{waitUntil:'domcontentloaded'});
  const theme=await page.evaluate(()=>{
   const root=getComputedStyle(document.documentElement);
   return {lime:root.getPropertyValue('--eg-lime').trim(),text:root.getPropertyValue('--eg-ink').trim(),
    css:[...document.querySelectorAll('link[rel="stylesheet"]')].some(x=>x.href.includes('emerald-gloss-global.css'))}
  });
  assert.equal(theme.css,true,path+' missing shared CSS');
  assert.equal(theme.text,'#f2f8ed',path+' no unified colors');
  assert.equal(theme.lime,'#dfff4d',path+' missing lime accent');
  const node=page.locator(selector).first();
  assert.equal(await node.count(),1,path+' missing visible target '+selector);
  const bg=await node.evaluate(el=>{
   const s=getComputedStyle(el);
   return {background:s.backgroundImage,color:s.color};
  });
  assert(bg.background.includes('gradient'),path+' lost dark gradient on '+selector);
  await page.close();
 }
 console.log('Emerald Gloss styling verified on all 10 representative page types.');
}finally{await browser.close()}
