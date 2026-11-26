import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const output = 'auri-preview/studio.js';
await build({
  entryPoints: ['src/auri-studio/main.js'],
  outfile: output,
  bundle: true,
  format: 'iife',
  target: ['chrome109', 'firefox115', 'safari16.4'],
  minify: true,
  legalComments: 'linked',
  loader: { '.png': 'dataurl' },
});
const version = createHash('sha256').update(await readFile(output)).digest('hex').slice(0, 12);
const index = 'auri-preview/index.html';
const html = await readFile(index, 'utf8');
await writeFile(index, html.replace(/\.\/studio\.js(?:\?v=[a-f\d]+)?"/, `./studio.js?v=${version}"`));
