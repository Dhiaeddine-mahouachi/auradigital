// Offline Auri animation baker. The production browser never creates a WebGL context.
// Run after npm run build:hub with: node scripts/bake-auri-animation.mjs
// Serves the repository locally and records poses from the real rigged GLB.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=process.cwd();
const out=resolve(root,'media/auri/frames');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.css':'text/css','.webp':'image/webp'};
const server=createServer(async (req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  const abs=resolve(root,'.'+decodeURI(url.pathname));
  if(!abs.startsWith(root)||!(await stat(abs)).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',mime[extname(abs)]||'application/octet-stream');
  res.end(await readFile(abs));
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/scripts/auri-bake.html';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:process.platform==='win32'?{channel:'chrome'}:{}),args:['--enable-unsafe-swiftshader','--use-angle=swiftshader']});
let count=0;
const phases=['idle','welcome','thinking','working','speaking','success'];
try{
 const page=await browser.newPage({viewport:{width:192,height:192},deviceScaleFactor:1,reducedMotion:'no-preference'});
 page.on('pageerror',e=>console.error('BROWSER ERROR',e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.auriBakeReady||window.auriBakeError,{timeout:25000});
 const error=await page.evaluate(()=>window.auriBakeError);
 if(error)throw new Error(error);
 for(let level=1;level<=7;level++){
  for(const phase of phases){
   await page.evaluate(({level,phase})=>{
    const el=document.getElementById('auri');
    el.setAttribute('level',String(level));
    el.dataset.phase=phase;
   },{level,phase});
   await page.waitForTimeout(100);
   for(let frame=0;frame<12;frame++){
    await page.waitForTimeout(105);
    const data=await page.evaluate(()=>document.querySelector('#auri canvas').toDataURL('image/png'));
    if(!data.startsWith('data:image/png;base64,'))throw new Error('Canvas readback failed');
    const bytes=Buffer.from(data.slice('data:image/png;base64,'.length),'base64');
    await writeFile(resolve(out,'level-'+level+'-'+phase+'-'+String(frame).padStart(2,'0')+'.png'),bytes);
    count++;
   }
   console.log('Baked',level,phase,'('+count+' frames)');
  }
 }
}finally{
 await browser.close();
 await new Promise(r=>server.close(r));
}
console.log('DONE',count,'frames. Package with python scripts/pack-auri-animation.py');
