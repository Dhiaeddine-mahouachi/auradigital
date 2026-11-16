import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=name=>readFileSync(resolve(root,name),'utf8');
const html=source('portfolio.html');

test('portfolio replaces old cards with four real, scroll-driven work stories',()=>{
 assert.doesNotMatch(html,/project-grid|project-case|id="gateaux"|id="fifty"|Decoration Gateaux|>Fifty</);
 assert.equal((html.match(/data-work-stage/g)||[]).length,4);
 for(const title of ['AuraHub','AuraMenu','Mutlu Nakliyat','Yurt Oto Elektrik'])assert.match(html,new RegExp(title));
 assert.match(html,/client-showcase\.css/);
 assert.match(html,/client-showcase\.js/);
});
test('all internal portfolio images exist and are nonempty',()=>{
 const imgs=[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
 const internal=imgs.filter(src=>src.startsWith('/'));
 assert.ok(internal.length>=4);
 for(const path of internal){
   const file=resolve(root,'.'+path);
   assert.ok(statSync(file).size>1024,'Missing or unexpectedly small image: '+path);
 }
});
test('people are presented as illustrative, never as fabricated reviews',()=>{
 assert.equal((html.match(/class="portfolio-person portfolio-person--/g)||[]).length,2);
 assert.match(html,/not identified as AuraDigital customers/);
 assert.match(html,/not client testimonials/);
 assert.doesNotMatch(html, /five-star reviews|★★★★★|100% satisfaction|we doubled|verified testimonial/i);
});
test('scroll motion is gated for mobile and reduced-motion preferences',()=>{
 const css=source('client-showcase.css');
 const js=source('client-showcase.js');
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
 assert.match(js,/reduced\.matches/);
 assert.match(js,/requestAnimationFrame\(render\)/);
 assert.match(js,/data-work-current/);
 assert.match(js,/portfolio-media-unavailable/);
});
