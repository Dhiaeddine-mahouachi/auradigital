import { build } from 'esbuild';
await build({ entryPoints: ['src/shop/app.ts'], bundle: true, format: 'esm', target: ['es2022'], outfile: 'shop/app.js', legalComments: 'none' });
console.log('Shop TypeScript compiled.');
