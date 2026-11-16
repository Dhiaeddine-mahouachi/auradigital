import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGrowthVisionPath } from '../src/hub/growth-vision-path.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
 '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
})[ch]);

const missions = [
 {id:'foundation',level:1,status:'done',objective:'Verify business details'},
 {id:'visibility',level:2,status:'in_progress',objective:'Create <site> & menu'},
 {id:'conversion',level:3,status:'planned',objective:'Capture leads'},
 {id:'operations',level:4,status:'planned',objective:'Handle follow-ups'},
 {id:'measurement',level:5,status:'planned',objective:'Review analytics'},
];

function render(overrides = {}, selected = missions[1]) {
 return renderGrowthVisionPath({
  workspace:{missions,auri:{level:4,verifiedMilestones:2},...overrides},
  lang:'en',esc,title:mission=>mission.objective,status:mission=>mission.status,
  displayState:mission=>mission.status,selected,
  robot:()=>'<span class="model-poster"></span>',
 });
}

test('groups five existing mission levels into three customer stages',()=>{
 const html=render();
 assert.equal((html.match(/class="vision-stage"/g)||[]).length,3);
 assert.match(html,/Create &lt;site&gt; &amp; menu/);
 assert.match(render({},missions[4]),/Review analytics/);
 assert.match(html,/data-node="measurement"/);
 assert.match(html,/Build systems/);
 assert.match(html,/aria-pressed="true"/);
});

test('credits XP from verified milestones only, never customer-reported task completion',()=>{
 const html=render();
 assert.match(html,/280 \/ 1300 XP/);
 assert.match(html,/Auri · 4 \/ 7/);
 const unverified=render({auri:{level:2,verifiedMilestones:0}});
 assert.match(unverified,/0 \/ 1300 XP/);
 assert.doesNotMatch(unverified,/280 \/ 1300 XP/);
});

test('escapes customer mission content and supports all Hub languages',()=>{
 const html=render();
 assert.match(html,/Create &lt;site&gt; &amp; menu/);
 assert.doesNotMatch(html,/Create <site>/);
 for(const lang of ['en','tr','fr','ar']){
  const rendered=renderGrowthVisionPath({
   workspace:{missions,auri:{level:2,verifiedMilestones:0}},lang,esc,
   title:mission=>mission.objective,status:mission=>mission.status,
   displayState:mission=>mission.status,selected:missions[1],robot:()=>'<span></span>',
  });
  assert.equal((rendered.match(/class="vision-stage"/g)||[]).length,3,lang);
  assert.match(rendered,/data-node="visibility"/);
 }
});
