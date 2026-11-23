import { guideText } from './mission-copy.js';
// Aura Journey — "Know how to grow". The illustrated five-stage Growth Vision.
// Stage progress is derived only from the workspace's missions (status set by
// the team or the customer) and server-verified evidence — never a free-form
// percentage. The task detail below reuses the existing roadmap view, so
// status changes, evidence and alternative routes keep their original rules.
import { osCopy } from './os-copy.js';
import { icon, pill, stageArt, emptyState } from './os-ui.js';
import { dashCopy } from './dashboard-view.js';
import { roadmapLabels } from './roadmap-view.js';
import { eligibleMissions, missionGuide, missionState } from '../roadmap.js';

const OFFER = { 'Web Design': 'web', 'Business Email': 'email', AuraMenu: 'menu', 'AI & Automation': 'chat', Branding: 'brand', 'Hosting / Security': 'hosting' };
// Real, published AuraDigital projects only (see /portfolio). Stages without a
// directly relevant public project show no examples rather than mock-ups.
const EXAMPLES = {
 0: [
  { img: '/media/landing/showcase-website.webp', name: 'Décoration Gâteaux', kind: { en: 'Pastry shop website', tr: 'Pastane web sitesi', fr: 'Site de pâtisserie', ar: 'موقع حلويات' }, href: '/portfolio' },
  { img: '/media/redesign/work-bentwalad.jpg', name: 'Bent Walad', kind: { en: 'Brand website', tr: 'Marka web sitesi', fr: 'Site de marque', ar: 'موقع علامة تجارية' }, href: '/portfolio' },
 ],
 2: [
  { img: '/media/redesign/work-weddings.jpg', name: 'AuraWeddings', kind: { en: 'Invitations with RSVP', tr: 'LCV’li davetiyeler', fr: 'Invitations avec RSVP', ar: 'دعوات مع تأكيد الحضور' }, href: '/aura-weddings' },
 ],
};
let allOpen = false;
const level = m => Math.max(1, Math.min(5, Number(m.level) || 1)) - 1;

export function journeyModel(workspace) {
 const missions = workspace.missions || [];
 const evidence = workspace.evidence || {};
 const stages = [0, 1, 2, 3, 4].map(i => {
  const list = missions.filter(m => level(m) === i);
  const done = list.filter(m => m.status === 'done');
  const required = list.filter(m => !m.optional && m.status !== 'postponed');
  return { index: i, missions: list, done, remaining: list.filter(m => m.status !== 'done'), required,
   complete: list.length > 0 && required.every(m => m.status === 'done'),
   verified: list.filter(m => evidence[m.id] === 'approved').length };
 });
 const current = stages.findIndex(s => s.required.some(m => m.status !== 'done'));
 const total = missions.length, doneCount = missions.filter(m => m.status === 'done').length;
 return { stages, current, total, doneCount, percent: total ? Math.round(doneCount / total * 100) : 0 };
}

export function renderAuraJourney({ host, lang, esc, link, requestLink, workspace, missionTitle, cap, stageParam, selectedId, canAsk, onAsk, onSelect, renderTask }) {
 const c = osCopy(lang), j = c.journey, d = dashCopy(lang), rl = roadmapLabels(lang);
 const model = journeyModel(workspace);
 const { stages, current } = model;
 const selectedMission = (workspace.missions || []).find(m => m.id === selectedId);
 const chosen = Number.isInteger(stageParam) && stageParam >= 0 && stageParam < 5 ? stageParam
  : selectedMission ? level(selectedMission) : Math.max(0, current);
 const stage = stages[chosen];
 const missions = workspace.missions || [];
 const profile = workspace.profile || {};
 const evidence = workspace.evidence || {};
 const stateOf = m => evidence[m.id] === 'approved' ? 'verified' : evidence[m.id] === 'pending' ? 'review'
  : m.status !== 'done' && missionState(m, missions, profile).blocked ? 'blocked' : m.status;
 const statusText = m => ({ verified: c.journey.done + ' ✓', review: j.inReview, blocked: rl.blocked })[stateOf(m)] || d.status[m.status] || m.status;
 const tone = m => ({ verified: 'good', done: 'good', review: 'warn', blocked: '', in_progress: 'info' })[stateOf(m)] || '';
 // Continuous progress along the path: finished stages plus the share of the
 // current one, so the line always matches completed tasks.
 const pathProgress = (() => {
  if (!model.total) return 0;
  let value = 0;
  for (const s of stages) {
   if (!s.missions.length) { value += 1; continue; }
   const share = s.done.length / s.missions.length;
   value += share;
   if (share < 1) break;
  }
  return Math.min(100, value / 5 * 100);
 })();
 const remainingRequired = stage.remaining.filter(m => !m.optional && m.status !== 'postponed').length;
 const effort = !stage.missions.length || !stage.remaining.length ? j.effortLevels.done : remainingRequired + stage.remaining.filter(m => m.optional).length <= 2 ? j.effortLevels.light : stage.remaining.length <= 4 ? j.effortLevels.moderate : j.effortLevels.heavy;
 const nextTask = eligibleMissions(missions, profile).find(m => level(m) === chosen && evidence[m.id] !== 'pending') || stage.remaining[0];
 const services = [...new Map(stage.remaining.filter(m => missionGuide[m.capability]?.[0]).map(m => [m.capability, m])).values()];
 const examples = EXAMPLES[chosen] || [];
 const auriExplain = [
  [j.explain.matters, j.why[chosen]],
  [j.explain.did, stage.done.length ? j.didSome(stage.done.length, stage.done.map(missionTitle).join(', ')) : j.didNone],
  [j.explain.doNext, nextTask ? `${missionTitle(nextTask)} — ${guideText(nextTask.capability, 2, lang, missionGuide[nextTask.capability]?.[2] ?? nextTask.nextAction) || ''}` : j.nextNone],
  [j.explain.help, services.length ? j.helpSome(services.map(m => cap(m.capability)).join(', ')) : j.helpNone],
  [j.explain.optional, stage.missions.some(m => m.optional) ? j.optYes : j.optNo],
 ];
 const stateLabel = s => s.complete ? j.done : s.index === current ? j.current : j.upcoming;

 host.innerHTML = `<div class="os-journey">
  <section class="os-journey-hero" aria-labelledby="os-journey-title">
   <div class="os-journey-head">
    <div><p class="os-eyebrow is-light">${esc(c.sections.journey)} · ${esc(c.sections.journeyTag)}</p>
     <h1 id="os-journey-title">${esc(j.title)}</h1><p class="os-journey-lead">${esc(missions.find(m => m.planGoal)?.planGoal || j.lead)}</p></div>
    <dl class="os-journey-stats">
     <div><dt>${esc(j.overall)}</dt><dd>${model.percent}%</dd><small>${esc(j.of(model.doneCount, model.total))}</small></div>
     <div><dt>${esc(j.verified)}</dt><dd>${Math.min(5, Number(workspace.auri?.verifiedMilestones) || 0)}<span>/5</span></dd><small>Auri ${Math.max(1, Math.min(7, workspace.auri?.level || 1))}/7</small></div>
    </dl>
   </div>
   <div class="os-path-wrap">
    <div class="os-path-line" aria-hidden="true"><span style="--p:${pathProgress.toFixed(1)}%"></span></div>
    <ol class="os-path vision-path-cards" aria-label="${esc(j.stagesLabel)}">${stages.map(s => `<li class="vision-stage os-stage" data-stage-state="${s.complete ? 'done' : s.index === current ? 'active' : 'upcoming'}">
     <button type="button" class="os-stage-btn" data-stage="${s.index}" aria-pressed="${s.index === chosen}" aria-label="${esc(`${j.stages[s.index]} — ${stateLabel(s)} — ${j.of(s.done.length, s.missions.length)}`)}">
      <span class="os-stage-badge">${s.complete ? icon('check', 14) : s.index + 1}</span>
      ${stageArt(s.index)}
      <strong>${esc(j.stages[s.index])}</strong><small>${esc(j.taglines[s.index])}</small>
      <span class="os-stage-meter" aria-hidden="true"><i style="width:${s.missions.length ? Math.round(s.done.length / s.missions.length * 100) : 0}%"></i></span>
      <span class="os-stage-count">${esc(j.of(s.done.length, s.missions.length))}</span>
     </button></li>`).join('')}</ol>
   </div>
  </section>
  <div class="os-journey-body">
   <section class="os-stage-panel" aria-labelledby="os-stage-title">
    <header class="os-stage-panel-head"><div><p class="os-eyebrow">${esc(j.stageOf(chosen + 1))} · ${esc(stateLabel(stage))}</p><h2 id="os-stage-title">${esc(j.stages[chosen])}</h2></div>
     <div class="os-stage-progress"><span>${esc(j.progress)}</span><strong>${esc(j.of(stage.done.length, stage.missions.length))}</strong></div></header>
    ${stage.complete ? `<p class="os-celebrate" role="status"><span aria-hidden="true">✦</span> ${esc(j.celebrate(j.stages[chosen]))}</p>` : ''}
    <p class="os-stage-objective"><b>${esc(j.objective)}</b> ${esc(j.objectives[chosen])}</p>
    ${stage.missions.length ? `<div class="os-stage-grid">
     <section><h3>${esc(j.remaining)} <span class="os-count">${stage.remaining.length}</span></h3>
      ${stage.remaining.length ? `<div class="vision-task-list os-task-list">${stage.remaining.map(m => `<button type="button" class="vision-task os-task-row" data-node="${esc(m.id)}" aria-pressed="${selectedMission?.id === m.id}">
       <span class="os-task-check" aria-hidden="true"></span><span class="os-task-name">${esc(missionTitle(m))}${m.optional ? ` <em>${esc(j.optional)}</em>` : ''}</span>${pill(statusText(m), tone(m), esc)}${icon('arrow', 14)}</button>`).join('')}</div>`
       : `<p class="os-muted">${esc(j.allDone)}</p>`}</section>
     <section><h3>${esc(j.completed)} <span class="os-count">${stage.done.length}</span></h3>
      ${stage.done.length ? `<div class="vision-task-list os-task-list">${stage.done.map(m => `<button type="button" class="vision-task os-task-row is-done" data-node="${esc(m.id)}" aria-pressed="${selectedMission?.id === m.id}">
       <span class="os-task-check" aria-hidden="true">${icon('check', 12)}</span><span class="os-task-name">${esc(missionTitle(m))}</span>${pill(statusText(m), tone(m), esc)}</button>`).join('')}</div>`
       : `<p class="os-muted">${esc(j.noneDone)}</p>`}</section>
    </div>` : emptyState({ esc, iconName: 'journey', title: j.empty })}
    <dl class="os-stage-facts">
     <div><dt>${esc(j.next)}</dt><dd>${nextTask ? `<button type="button" class="os-link" data-node="${esc(nextTask.id)}">${esc(missionTitle(nextTask))}</button>` : esc(j.nextNone)}</dd></div>
     <div><dt>${esc(j.effort)}</dt><dd>${esc(effort)}</dd><small>${esc(j.effortNote)}</small></div>
    </dl>
    ${services.length ? `<section class="os-stage-services"><h3>${esc(j.recommended)}</h3><p class="os-muted">${esc(j.diy)}</p><ul>${services.map(m => {
     const service = missionGuide[m.capability][0], offer = OFFER[service];
     return `<li><span>${icon('services', 16)}<strong>${esc(cap(m.capability))}</strong>${m.optional ? pill(j.optional, '', esc) : ''}</span>
      <span class="os-stage-service-actions">${offer ? `<a class="os-link" href="${esc(link('services', { offer }))}">${esc(j.view)}</a>` : ''}${workspace.permissions.includes('roadmap:write') ? `<a class="os-link" href="${esc(requestLink(service, m.id))}">${esc(j.request)}</a>` : ''}</span></li>`;
    }).join('')}</ul></section>` : ''}
    ${examples.length ? `<section class="os-stage-examples"><h3>${esc(j.examples)}</h3><div>${examples.map(e => `<a href="${esc(e.href)}" class="os-example"><img src="${esc(e.img)}" alt="" loading="lazy" decoding="async" width="320" height="200"><span><strong>${esc(e.name)}</strong><small>${esc(e.kind[lang] || e.kind.en)}</small></span></a>`).join('')}</div></section>` : ''}
   </section>
   <aside class="os-journey-auri" aria-labelledby="os-jauri-title">
    <div class="os-auri-row"><span class="os-auri-face is-floating" aria-hidden="true"><img src="/media/auri/level-${Math.max(1, Math.min(7, workspace.auri?.level || 1))}.webp" alt="" width="56" height="56"></span><h2 id="os-jauri-title">${esc(j.explainTitle)}</h2></div>
    <dl class="os-explain">${auriExplain.map(([q, a]) => `<div><dt>${esc(q)}</dt><dd>${esc(a)}</dd></div>`).join('')}</dl>
    ${canAsk ? `<button type="button" class="os-btn is-primary is-sm" data-ask-stage>${icon('auri', 16)}<span>${esc(j.askStage)}</span></button>` : ''}
   </aside>
  </div>
  <section class="os-task-detail" aria-label="${esc(j.taskDetail)}" data-task-detail></section>
  ${missions.length ? (() => {
   const eligible = eligibleMissions(missions, profile).filter(m => evidence[m.id] !== 'pending');
   const groups = [[j.listPriority, eligible], [j.listUpcoming, missions.filter(m => m.status !== 'done' && !eligible.includes(m))],
    [j.listCompleted, missions.filter(m => m.status === 'done').sort((a, b) => String(b.completedAt || '').localeCompare(String(a.completedAt || '')))]];
   return `<details class="os-card os-all-tasks" ${allOpen ? 'open' : ''} data-all-tasks><summary><span>${icon('journey', 18)} ${esc(j.allTasks)}</span><span class="os-count">${missions.length}</span></summary>
    <div class="os-all-grid">${groups.map(([title, list]) => `<section><h3>${esc(title)} <span class="os-count">${list.length}</span></h3>${list.length ? `<ul>${list.map(m => `<li><button type="button" class="os-all-row" data-node="${esc(m.id)}"><span class="os-all-stage">${esc(j.stages[level(m)])}</span><strong>${esc(missionTitle(m))}</strong>${m.completedAt ? `<time datetime="${esc(m.completedAt)}">${esc(new Date(m.completedAt).toLocaleDateString(lang))}</time>` : pill(statusText(m), tone(m), esc)}</button></li>`).join('')}</ul>` : `<p class="os-muted">${esc(j.noneDone)}</p>`}</section>`).join('')}</div></details>`;
  })() : ''}
 </div>`;

 requestAnimationFrame(() => host.querySelector('.os-path-line')?.classList.add('is-ready'));
 host.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => {
  const index = Number(b.dataset.stage);
  history.pushState(null, '', link('journey', { stage: String(index) }));
  renderAuraJourney({ host, lang, esc, link, requestLink, workspace, missionTitle, cap, stageParam: index, selectedId: null, canAsk, onAsk, onSelect, renderTask });
  host.querySelector(`[data-stage="${index}"]`)?.focus();
 }));
 host.querySelectorAll('.os-journey-body [data-node], .os-all-tasks [data-node]').forEach(b => b.addEventListener('click', () => onSelect(b.dataset.node)));
 host.querySelector('[data-all-tasks]')?.addEventListener('toggle', e => { allOpen = e.currentTarget.open; });
 const taskHost = host.querySelector('[data-task-detail]');
 const focusId = selectedMission && level(selectedMission) === chosen ? selectedMission.id : nextTask?.id || stage.missions[0]?.id;
 if (focusId) renderTask(taskHost, focusId);
 else taskHost.remove();
 host.querySelector('[data-ask-stage]')?.addEventListener('click', () => onAsk(j.askPrompt(j.stages[chosen])));
}
