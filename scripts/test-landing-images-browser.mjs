/* Playwright image-delivery QA. Does not use customer accounts or write data. */
import { chromium } from 'playwright';

const origin=process.env.LANDING_ORIGIN||'https://auradigitalworks.com';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
let failures=0;
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const network=[];
  page.on('response',response=>{
   const url=response.url();
   if(/\\.(png|webp|svg|jpg|jpeg)(?:\\?|$)/i.test(url)&&response.status()>=400)
    network.push({url,status:response.status()});
  });
  page.on('requestfailed',request=>{
   if(/\\.(png|webp|svg|jpg|jpeg)(?:\\?|$)/i.test(request.url()))
    network.push({url:request.url(),error:request.failure()});
  });
  await page.goto(origin,{waitUntil:'domcontentloaded',timeout:45000});
  for(const button of await page.locator('[data-hub-feature]').all()){
    await button.click();
    await page.waitForTimeout(200);
  }
  await page.locator('[data-hub-feature="roadmap"]').click();
  await page.evaluate(async()=>{
    const images=Array.from(document.images);
    for(const image of images)image.loading='eager';
    await Promise.all(images.map(async image=>{
      image.scrollIntoView({block:'nearest'});
      try{await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Image timeout')),8000))]);}catch{}
    }));
  });
  const results=await page.locator('img').evaluateAll(images=>images.map(img=>({
    src:img.currentSrc||img.src,ok:img.complete&&img.naturalWidth>0,
    naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
    displayed:!!(img.offsetWidth||img.offsetHeight||img.getClientRects().length)
  })));
  const bad=results.filter(r=>!r.ok);
  failures+=bad.length+network.length;
  console.log(JSON.stringify({viewport,images:results.length,loaded:results.length-bad.length,broken:bad,network},null,2));
  await page.close();
 }
}finally{await browser.close()}
if(failures)process.exitCode=1;
