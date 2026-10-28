import { build } from 'esbuild';
await build({entryPoints:['src/hub/app.js'],bundle:true,format:'esm',target:['es2022'],outfile:'hub/app.js',legalComments:'none'});
console.log('Business Hub compiled.');
