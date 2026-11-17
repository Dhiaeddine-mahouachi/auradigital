import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { general, pagePaths } from '../marketing/src/pages.mjs';
import { services, industries } from '../marketing/src/content.mjs';

const root = new URL('../', import.meta.url);
const require = createRequire(import.meta.url);
const manifest = require.resolve('astro/package.json');
const { bin } = require(manifest);
const build = spawnSync(process.execPath, [resolve(dirname(manifest),bin.astro),'build'], {
  cwd: fileURLToPath(root),
  stdio: 'inherit',
  env: {...process.env, ASTRO_TELEMETRY_DISABLED:'1'},
});
if (build.status !== 0) process.exit(build.status || 1);

const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const social = new URL('command-pages/social/', root);
await mkdir(social, {recursive:true});
for (const path of pagePaths) {
  const key = path === '/' ? 'home' : path.slice(1);
  const slug = key.split('/').at(-1);
  const subject = [...services,...industries].find(item=>item.slug===slug);
  const title = general[key]?.[0] || subject.name;
  const illustration = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#101414"/><rect x="48" y="48" width="1104" height="534" rx="32" fill="#1a1f1f" stroke="#3a4845" stroke-width="2"/>
    <path d="M850 105v420m82-420v420m82-420v420m82-420v420M815 200h300m-300 80h300m-300 80h300m-300 80h300" stroke="#3a4845"/>
    <path d="m855 423 76-78 77 20 81-122" fill="none" stroke="#e6ff3d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="1089" cy="243" r="10" fill="#e6ff3d"/>
    <text x="102" y="188" font-family="DejaVu Sans,sans-serif" font-size="28" font-weight="700" fill="#e6ff3d">AURADIGITAL</text>
    <text x="102" y="330" font-family="DejaVu Sans,sans-serif" font-size="52" font-weight="700" fill="#f6f5ef">${escape(title)}</text>
    <text x="102" y="391" font-family="DejaVu Sans,sans-serif" font-size="25" fill="#b1bcba">Plan with Auri. Build with AuraDigital.</text>
  </svg>`;
  await sharp(Buffer.from(illustration)).png().toFile(fileURLToPath(new URL(key.replaceAll('/','-')+'.png',social)));
}
