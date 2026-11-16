import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=name=>readFileSync(resolve(root,name),'utf8');
const html=source('portfolio.html');

test('portfolio shows two documented business stories and independent product previews',()=>{
 assert.match(html,/id="mutlu"/);
 assert.match(html,/id="yurt-oto"/);
 assert.equal((html.match(/class="pf-story pf-story--/g)||[]).length,2);
 for(const name of ['Mutlu Nakliyat','Yurt Oto Elektrik','AuraHub'])assert.match(html,new RegExp(name));
 assert.match(html,/https:\/\/mutlunakliyat\.site\//);
 assert.match(html,/xn--yurtotoelektrikerhankcr-8qdb\.com/);
 assert.match(html,/THE DELIVERED WEBSITE/);
 assert.match(html,/not a claim that the clients above use every feature/i);
 assert.match(html,/client-showcase\.css/);
 assert.match(html,/client-showcase\.js/);
 assert.doesNotMatch(html,/client-showcase-stack|project-grid-full|data-work-stage/);
});

test('real project screenshots and real AuraHub interface screenshots exist',()=>{
 const imgs=[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
 const local=imgs.filter(src=>src.startsWith('/'));
 assert.equal(local.length,5);
 for(const image of local) {
   const file=resolve(root,'.'+image);
   assert.ok(statSync(file).size>1024,'Missing or unexpectedly small project image: '+image);
 }
});

test('photography is real-life editorial, not fabricated customer testimony',()=>{
 const unsplash=[...html.matchAll(/src="https:\/\/images\.unsplash\.com\/photo-[^"]+"/g)];
 assert.ok(unsplash.length>=3);
 assert.match(html,/People photographed are illustrative, not identified as clients/);
 assert.match(html,/not the clients or their staff/);
 assert.match(html,/no testimonial, business performance claim/);
 assert.doesNotMatch(html,/we doubled|verified testimonial|five-star reviews|100% satisfaction/i);
});

test('portfolio layout works on mobile and respects reduced motion',()=>{
 const css=source('client-showcase.css');
 const js=source('client-showcase.js');
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(js,/reduced\.matches/);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/pf-media-unavailable/);
});
