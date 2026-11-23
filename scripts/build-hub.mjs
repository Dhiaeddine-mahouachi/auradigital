import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
await build({entryPoints:['src/hub/app.js'],bundle:true,format:'esm',target:['es2022'],minify:true,outfile:'hub/app.js',legalComments:'none',external:['/media/auri/viewer.js']});
await build({entryPoints:['src/hub/auri-model.js'],bundle:true,format:'esm',target:['es2022'],minify:true,outfile:'media/auri/viewer.js',legalComments:'none'});
const entry='hub/index.html';
const original=await readFile(entry,'utf8');
let html=original;
for(const asset of ['hub.css','os.css','app.js','boot.js']){
 const hash=createHash('sha256').update(await readFile('hub/'+asset)).digest('hex').slice(0,12);
 const path='/hub/'+asset;
 html=html.replace(new RegExp(path.replaceAll('.','\\.')+'(?:\\?v=[a-f0-9]+)?(?=")','g'),path+'?v='+hash);
}
if(html!==original)await writeFile(entry,html);
console.log('Business Hub compiled.');
