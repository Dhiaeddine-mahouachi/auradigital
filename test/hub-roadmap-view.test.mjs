import test from 'node:test';
import assert from 'node:assert/strict';
import { renderRoadmap } from '../src/hub/roadmap-view.js';

const mission = (id, capability, level, status) => ({
  id, capability, level, status, optional:false, priority:1,
  objective: capability, service: capability, description:'Improve your business presence.',
  reason:'Current capabilities need improvement.', nextAction:'Review this task.',
  dependencies:[], position: level, completedAt:status==='done'?'2026-11-15T09:00:00Z':null
});
function render(view='timeline') {
  const host={
    innerHTML:'',
    querySelectorAll:()=>[],
    querySelector:()=>null
  };
  renderRoadmap({
    host,
    workspace:{
      missions:[mission('mission-1','website',1,'done'),mission('mission-2','crm',2,'planned')],
      profile:{capabilities:[]},
      analysis:{missions:[]},
      permissions:[]
    },
    t:key=>key, esc:value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;'),
    cap:key=>key, lang:'en', view, selectedId:'mission-2',
    onSelect:()=>{},onView:()=>{},onSave:()=>{},onEdit:()=>{},onGenerate:()=>{},onAsk:()=>{},
    robot:()=>'',requestLink:()=>'/shop'
  });
  return host.innerHTML;
}
test('timeline preserves original growth stages and stable numbered milestones',()=>{
  const html=render();
  assert.match(html,/growth-numbered/);
  assert.match(html,/1\.1<\/span>/);
  assert.match(html,/2\.1<\/span>/);
  assert.match(html,/Build Foundation/);
  assert.match(html,/Increase Visibility/);
  assert.match(html,/data-milestone-status="done"/);
  assert.match(html,/data-milestone-status="planned"/);
  assert.match(html,/1 \/ 2 · Completed/);
});
test('growth tree remains accessible as an alternative view',()=>{
  const html=render('tree');
  assert.match(html,/growth-tree/);
  assert.match(html,/data-view="tree" aria-pressed="true"/);
});
