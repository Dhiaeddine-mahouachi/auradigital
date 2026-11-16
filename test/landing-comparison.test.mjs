import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../home-transformations.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../home-comparison.js',import.meta.url),'utf8');
const section=html.slice(html.indexOf('id="before-after"'),html.indexOf('id="product-examples"'));
test('landing has one shared Before and After board, not seven cards',()=>{
 assert.match(section,/class="bc-board"/);
 assert.equal((section.match(/class="bc-board"/g)||[]).length,1);
 assert.equal((section.match(/data-compare-row/g)||[]).length,7);
 assert.doesNotMatch(section,/ac-transform-card|ac-transform-grid|hx-before-desk|hx-after-board/);
 assert.match(section,/WITH AURADIGITAL/);
 assert.match(section,/BEFORE/);
});
test('one comparison includes seven connected services, outcomes, and visual examples',()=>{
 for(const service of ['Website','AuraMenu','AI &amp; WhatsApp','Google Maps &amp; SEO','Business email','Hosting &amp; security','Brand &amp; creative']){
   assert.ok(section.includes(service),'Missing service '+service);
 }
 assert.equal((section.match(/class="bc-mini-preview"/g)||[]).length,7);
 assert.equal((section.match(/class="bc-before"/g)||[]).length,7);
 assert.equal((section.match(/class="bc-after"/g)||[]).length,7);
 assert.match(section,/Illustrative examples/);
 assert.match(section,/Build your roadmap/);
});
test('comparison design is colored and respects mobile and reduced motion',()=>{
 for(const hue of ['#dfff62','#72f3d1','#89baff','#ffc477','#c8b0ff','#67e6e9','#ffa9c7']){
   assert.ok(section.includes(hue),'Missing accent '+hue);
 }
 assert.match(css,/\.bc-row/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(html,/home-comparison\.js\?v=20261116-unified-1/);
 assert.match(html,/home-transformations\.css\?v=20261116-unified-1/);
});
