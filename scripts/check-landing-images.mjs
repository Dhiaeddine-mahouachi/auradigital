/* Validate every first-party image used by the public landing page.
 * Local file/header checks are always run; set LANDING_LIVE_ORIGIN to additionally
 * test HTTP image delivery from the deployed website. */
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const html=await readFile('index.html','utf8');
const imageMatches=[
  ...html.matchAll(/<img\\b[^>]*?\\bsrc=["']([^"']+)["']/gi),
  ...html.matchAll(/<a\\b[^>]*?\\bhref=["']([^"']+\\.(?:png|jpe?g|webp|svg)(?:\\?[^"']*)?)["']/gi),
];
const paths=[...new Set(imageMatches.map(m=>m[1].split('?')[0]).filter(x=>x.startsWith('/')||(!x.startsWith('http')&&!x.startsWith('data:'))))];
let failures=0;
function checkHeader(path,bytes){
  if(path.endsWith('.png'))return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(path.endsWith('.webp'))return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  if(path.endsWith('.jpg')||path.endsWith('.jpeg'))return bytes[0]===0xff&&bytes[1]===0xd8;
  if(path.endsWith('.svg'))return bytes.toString('utf8',0,200).includes('<svg');
  return false;
}
for(const path of paths){
  const local=resolve(process.cwd(),'.'+(path.startsWith('/')?path:'/'+path));
  try{
    const size=(await stat(local)).size;
    const bytes=await readFile(local);
    if(!checkHeader(path,bytes))throw Error('Invalid image header');
    console.log('LOCAL OK',path,'bytes='+size);
  }catch(error){failures++;console.error('LOCAL BROKEN',path,error.message);}
}
const origin=process.env.LANDING_LIVE_ORIGIN;
if(origin){
  const results=await Promise.all(paths.map(async path=>{
    try{
      const url=new URL(path,origin);
      url.searchParams.set('_aura_asset_audit','20261116');
      const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(18000)});
      const type=response.headers.get('content-type')||'';
      const bytes=Buffer.from(await response.arrayBuffer());
      const valid=response.ok&&/image\//.test(type)&&checkHeader(path,bytes);
      return {path,status:response.status,type,bytes:bytes.length,valid};
    }catch(error){return {path,error:String(error),valid:false}}
  }));
  for(const result of results){
    if(!result.valid)failures++;
    console.log(result.valid?'LIVE OK':'LIVE BROKEN',JSON.stringify(result));
  }
}
console.log('Landing asset audit:',paths.length,'unique image paths;',failures,'failures');
if(failures)process.exitCode=1;
