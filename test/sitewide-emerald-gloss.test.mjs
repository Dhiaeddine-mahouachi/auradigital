import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const load=path=>readFileSync(resolve(base,path),'utf8');
const paths=[
 'index.html','about.html','services.html','websites.html','contact.html','packages.html',
 'portfolio.html','aura-menu.html','nfc.html','qr-menu.html','aurapops.html',
 'aurapops-showcase.html','aura-weddings.html','spinflow.html',
 'nfc-builder.html','nfc-status.html','404.html','shop/index.html','hub/index.html'
];
test('all first-party page entry points load the shared Emerald Gloss theme after their own CSS',()=>{
 for(const path of paths){
  const html=load(path);
  const match=html.match(/<link[^>]+href="\/emerald-gloss-global\.css\?v=20261116-sitewide-1"/g)||[];
  assert.equal(match.length,1,path+' must load one shared theme');
  assert(html.indexOf('emerald-gloss-global.css') < html.indexOf('</head>'),path+' theme must be in head');
 }
});
test('Emerald Gloss covers shop, Hub, builder, weddings marketing and public pages without editing customer artwork',()=>{
 const css=load('emerald-gloss-global.css');
 for(const token of ['body.cinematic-enabled','body.shop-page','.aurahub-shell','.command-gate','body:has(.builder-shell)','body:has(.status-shell)','body[data-page="auraweddings"] .aw-ivory']){
  assert(css.includes(token),token+' must have an Emerald Gloss override');
 }
 assert.match(css,/#dfff4d/i);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert(!css.includes('canvas{'), 'Do not recolor any QR canvas');
 assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,'Theme CSS braces should be balanced');
});
