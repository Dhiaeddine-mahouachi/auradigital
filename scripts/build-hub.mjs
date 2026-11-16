import { build } from 'esbuild';
await build({entryPoints:['src/hub/app.js'],bundle:true,format:'esm',target:['es2022'],outfile:'hub/app.js',legalComments:'none',external:['/media/auri/viewer.js']});
await build({entryPoints:['src/hub/auri-model.js'],bundle:true,format:'esm',target:['es2022'],minify:true,outfile:'media/auri/viewer.js',legalComments:'none'});
console.log('Business Hub compiled.');
