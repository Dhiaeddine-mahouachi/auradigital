import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const css=readFileSync(new URL('public-luminous.css',root),'utf8');
const publicPages=['index.html','portfolio.html','services.html','websites.html','about.html','contact.html','aura-menu.html','packages.html'];

test('luminous marketing palette is included after existing page styles',()=>{
  for(const file of publicPages){
    const html=readFileSync(new URL(file,root),'utf8');
    const luminous='/public-luminous.css?v=20261116-color-rhythm-1';
    assert.ok(html.includes(luminous),file+' missing palette');
    assert.equal((html.match(/public-luminous\.css/g)||[]).length,1,file+' loaded duplicate palette');
    assert.ok(html.indexOf('public-luminous.css')<html.indexOf('</head>'),file+' stylesheet must load in head');
    assert.match(html,/cinematic-enabled/);
  }
});

test('palette uses several complementary hues and light/dark section contrast',()=>{
  for(const token of ['--shine-ivory','#f8f9f2','--shine-mint','#e6f5ee','--shine-blue','#a4d6ef','--shine-teal','#79dfd0','--shine-peach','#f4ceaa','--shine-lime','#e1e100']){
    assert.ok(css.includes(token),'missing palette value '+token);
  }
  for(const component of ['.ac-hero','.ac-feature-strip','.hx-persona','.ac-how','.ac-partner','.hx-inside','.bc-section','.ac-final','.pf-hero','.pf-platform','.service-card']){
    assert.ok(css.includes(component),'missing component '+component);
  }
  assert.ok(css.includes('.ac-how .ac-flow-step:nth-child(2)'));
  assert.ok(css.includes('.ac-how .ac-flow-step:nth-child(3)'));
  assert.match(css,/\.ac-final h2/);
});

test('signed-in application CSS and auth pages are not modified by this palette',()=>{
  assert.doesNotMatch(css,/\b\.hub-shell\b|\b\.hub-dashboard\b|body\[data-page="hub"\]/);
  const html=readFileSync(new URL('hub/index.html',root),'utf8');
  assert.doesNotMatch(html,/public-luminous\.css/);
});

test('light AuraMenu and Packages heroes retain dark text and mobile keeps dark-light rhythm',()=>{
  assert.match(css,/data-page="packages"\],\[data-page="auramenu"/);
  assert.match(css,/\.page-hero \.display \{\s*color:#18372a/);
  assert.match(css,/\.hx-persona \.hx-section-head h2 \{\s*color:#18392c/);
  assert.match(css,/\.ac-how \.ac-section-heading h2 \{\s*color:#18362c/);
  assert.match(css,/@media \(max-width:760px\)/);
  assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
});
