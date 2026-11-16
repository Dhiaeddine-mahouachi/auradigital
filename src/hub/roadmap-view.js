import { missionAlternative } from '../mission-routes.js';
import { blueprintLabels, commandLabels } from './blueprint-copy.js';
import { eligibleMissions, missionGuide, missionState, roadmapStages } from '../roadmap.js';
import { renderGrowthVisionPath } from './growth-vision-path.js';

const labels = {
 en:['Dashboard','Roadmap','Tasks','Resources','Welcome back','Roadmap progress','Growth stage','Priority actions','Estimated timeline','Your business growth','Your Business Growth Roadmap','My path','Timeline','Current focus','Why it matters','How to do it','Requirements','Do it myself','Get this done with AuraDigital','Ask AURI…','Optional','Blocked','Update my roadmap','Request a service','Start','Mark complete','AURI Assistant','Can AuraDigital help?','Upcoming','Completed','Ask about this task'],
 tr:['Panel','Yol haritası','Görevler','Kaynaklar','Tekrar hoş geldiniz','Yol haritası ilerlemesi','Büyüme aşaması','Öncelikli adımlar','Tahmini süre','İşletmenizin büyümesi','İşletmenizin büyüme yol haritası','Yolum','Zaman çizelgesi','Şu anki odak','Neden önemli','Nasıl yapılır','Gereksinimler','Kendim yapacağım','AuraDigital ile yap','AURI’ye sorun…','İsteğe bağlı','Engellendi','Yol haritasını güncelle','Hizmet iste','Başla','Tamamlandı olarak işaretle','AURI Asistanı','AuraDigital yardımcı olabilir mi?','Yaklaşan','Tamamlanan','Bu görevi sor'],
 fr:['Tableau de bord','Feuille de route','Tâches','Ressources','Bon retour','Progression','Étape de croissance','Actions prioritaires','Délai estimé','La croissance de votre entreprise','Votre feuille de route de croissance','Mon parcours','Chronologie','Priorité actuelle','Pourquoi cette tâche compte','Comment faire','Prérequis','Le faire moi-même','Confier à AuraDigital','Demander à AURI…','Facultatif','Bloqué','Actualiser la feuille de route','Demander un service','Démarrer','Marquer comme terminé','Assistant AURI','AuraDigital peut-il aider ?','À venir','Terminé','Poser une question sur cette tâche'],
 ar:['لوحة التحكم','خارطة الطريق','المهام','الموارد','أهلًا بعودتك','تقدم خارطة الطريق','مرحلة النمو','الإجراءات ذات الأولوية','المدة المقدرة','نمو نشاطك التجاري','خارطة نمو نشاطك التجاري','مساري','الجدول الزمني','التركيز الحالي','لماذا يهم','طريقة التنفيذ','المتطلبات','سأنفذها بنفسي','نفّذ مع AuraDigital','اسأل AURI…','اختياري','متوقف','حدّث خارطة الطريق','اطلب خدمة','ابدأ','علّم كمكتمل','مساعد AURI','هل يمكن لـ AuraDigital المساعدة؟','القادم','المكتمل','اسأل عن هذه المهمة'],
};
export const roadmapLabels = lang => Object.fromEntries([
 'home','journey','tasks','resources','welcome','progress','stage','priority','estimate','root','heading','tree','timeline','focus','why','how','requirements','myself','hire','ask','optional','blocked','refresh','request','start','complete','assistant','help','upcoming','completed','askTask',
].map((key,i)=>[key,labels[lang][i]]));

export function renderRoadmap({host, workspace, t, esc, cap, lang, view, selectedId, overview=false, auriDesk='', evolutionNames=[], onSelect, onContinue, onView, onSave, onEdit, onGenerate, onAsk, onRoute, onEvidence, onExistingEvidence, onAskTask, robot, requestLink}) {
 const l=roadmapLabels(lang), ui=blueprintLabels(lang), command=commandLabels(lang);
 const {missions,profile,analysis,permissions}=workspace;
 const canWrite=permissions.includes('roadmap:write');
 const canAsk=permissions.includes('auri:use');
 const eligible=eligibleMissions(missions,profile).filter(m=>workspace.evidence?.[m.id]!=='pending');
 const selected=missions.find(m=>m.id===selectedId)||eligible[0]||missions[0];
 const completion=items=>items.length?Math.round(items.filter(m=>m.status==='done').length/items.length*100):0;
 const progress=completion(missions);
 const stageOf=m=>Math.max(1,Math.min(Number(m.level)||1,5));
 const title=m=>m.route==='alternative'?missionAlternative(m.capability)?.title||m.objective:m.objective===m.service?cap(m.capability):m.objective;
 const stages=roadmapStages.map((stage,i)=>({...stage,missions:missions.filter(m=>stageOf(m)===i+1)}));
 const stageName=(stage,i)=>lang==='en'?['Build Foundation','Increase Visibility','Convert More Visitors','Improve Operations','Measure & Scale'][i]:t(stage.key);
 const currentStage=stages.findIndex(stage=>stage.missions.some(m=>!m.optional&&!['done','postponed'].includes(m.status)));
 const isBlocked=m=>missionState(m,missions,profile).blocked;
 const displayState=m=>({approved:'verified',pending:'review'})[workspace.evidence?.[m.id]]
  ||(isBlocked(m)?'blocked':m.status==='planned'&&m.id===eligible[0]?.id?'recommended':m.status);
 const status=m=>({verified:ui.approved,review:ui.pending,recommended:command.recommended,planned:command.available,done:command.selfDone,blocked:l.blocked})[displayState(m)]||t(m.status);
 const node=m=>`<button type="button" class="growth-node" data-node="${esc(m.id)}" data-status="${isBlocked(m)?'blocked':m.status}" data-display-state="${displayState(m)}" aria-pressed="${m.id===selected?.id}">
  <span class="growth-dot" aria-hidden="true">${displayState(m)==='verified'||m.status==='done'?'✓':isBlocked(m)?'·':''}</span>
  <span>${esc(title(m))}<small>${esc(status(m))}${m.optional?' · '+l.optional:''}</small></span>
 </button>`;
 const tree=renderGrowthVisionPath({workspace,esc,lang,title,status,displayState,selected,robot});
 const groups=[[l.priority,eligible],[l.upcoming,missions.filter(m=>m.status!=='done'&&!eligible.includes(m))],
  [l.completed,missions.filter(m=>m.status==='done').sort((a,b)=>(b.completedAt||'').localeCompare(a.completedAt||''))]];
 const timeline=`<div class="growth-timeline">${groups.map(([label,items])=>`<section><h3>${label}</h3>${items.map(m=>`<div>${node(m)}
  ${m.completedAt?`<time datetime="${esc(m.completedAt)}">${esc(new Date(m.completedAt).toLocaleDateString(lang))}</time>`:''}
  ${m.dependencies?.length?`<small>${l.requirements} · ${esc(m.dependencies.map(cap).join(', '))}</small>`:''}</div>`).join('')||`<p>${esc(t('empty'))}</p>`}</section>`).join('')}</div>`;
 const metric=(icon,value,label)=>`<article class="growth-card growth-metric"><span class="growth-metric-icon" aria-hidden="true">${icon}</span><div><strong>${esc(value)}</strong><span>${label}</span></div></article>`;
 const existing=[...new Set([...(profile.capabilities||[]),...(profile.website?['website']:[])])]
  .filter(id=>missionAlternative(id)&&!missions.some(m=>m.capability===id));
 const existingProof=canWrite&&existing.length?`<details class="growth-card hub-existing-proof"><summary>${esc(ui.proof)}</summary>
  <form data-existing-evidence class="mission-evidence"><label class="field">${esc(t('capabilities'))}
   <select name="capability">${existing.map(id=>`<option value="${esc(id)}">${esc(cap(id))}</option>`).join('')}</select></label>
   <label class="field">${esc(ui.proofLabel)}<textarea name="proof" required minlength="10" maxlength="1000" rows="2"></textarea></label>
   <button class="growth-secondary">${esc(ui.submit)}</button></form></details>`:'';
 const detail=selected?taskDetails(selected):`<p>${esc(t('empty'))}</p>`;
 const level=workspace.auri?.level||1;
 const next=eligible[0];
 const overviewHero=`<div class="hub-overview-grid ${auriDesk?'has-companion':''}">
  <section class="growth-card hub-overview-intro">
   <p class="hub-section-label">${esc(ui.overview)}</p>
   <h1>${esc(workspace.organization.name)}</h1>
   <ol class="hub-evolution-track" aria-label="${esc(t('level'))}">
    ${evolutionNames.map((name,index)=>`<li data-level-state="${index+1<level?'complete':index+1===level?'current':'locked'}" ${index+1===level?'aria-current="step"':''}>
     <span>${index+1}</span><small>${esc(name)}</small></li>`).join('')}
   </ol>
   <div class="hub-next-mission">
    <div><p class="hub-section-label">${esc(ui.next)}</p><h2>${next?esc(title(next)):esc(t('empty'))}</h2></div>
    ${next?`<button class="growth-primary" type="button" data-next-mission>${esc(command.continue)} <span aria-hidden="true">↗</span></button>`:''}
   </div>
  </section>${auriDesk}
 </div>`;
 host.innerHTML=`${overview?overviewHero:''}
 ${overview&&eligible.length?`<section class="command-priorities" aria-label="${esc(command.priorities)}">${eligible.slice(0,3).map(m=>
  `<article class="growth-card"><small>${esc(status(m))}</small><h2>${esc(title(m))}</h2><p>${esc(m.route==='alternative'?missionAlternative(m.capability)?.steps:missionGuide[m.capability]?.[1]||m.description)}</p>
  <button class="growth-secondary" type="button" data-priority="${esc(m.id)}">${esc(l.focus)}</button></article>`).join('')}</section>`:''}${overview?`<section class="growth-metrics" aria-label="${l.progress}">
 <article class="growth-card growth-metric"><span class="growth-ring" style="--progress:${progress}%">${missions.length?progress+'%':'—'}</span><div><strong>${l.progress}</strong><span>${missions.filter(m=>m.status==='done').length} / ${missions.length} · ${l.completed}</span></div></article>
 ${metric('▥',currentStage<0?'—':stageName(stages[currentStage],currentStage),l.stage)}
 ${metric('◎',eligible.filter(m=>m.priority===1&&!m.optional).length,l.priority)}
 ${metric('✓',workspace.auri?.verifiedMilestones||0,ui.verified)}</section>`:''}
 ${existingProof}<div class="growth-layout vision-layout"><section class="growth-card growth-map vision-map"><header class="growth-panel-head"><div class="growth-tabs">
 <button type="button" data-view="tree" aria-pressed="${view==='tree'}">${l.tree}</button><button type="button" data-view="timeline" aria-pressed="${view==='timeline'}">${l.timeline}</button>
 </div></header>${view==='tree'?`<div class="command-map-viewport vision-path-viewport" tabindex="0" aria-label="${esc(command.vision)}">${tree}</div>`:timeline}
 ${!missions.some(item=>item.planOrder!==undefined)&&analysis.missions.some(m=>!missions.some(item=>item.capability===m.id))&&canWrite?`<button type="button" class="growth-secondary" data-refresh>${l.refresh}</button>`:''}</section>
 <aside class="growth-side"><section class="growth-card growth-focus" id="growth-focus" tabindex="-1">${detail}</section>
</aside></div>`;
 function taskDetails(m) {
  const alternate=m.route==='alternative'?missionAlternative(m.capability):null;
  const guide=alternate?null:missionGuide[m.capability];
  const proof=workspace.evidence?.[m.id];
  const reason=m.reason?.startsWith('This capability has not been reported')?guide?.[1]:m.reason;
  const action=alternate?.steps||(m.nextAction==='Define scope or record your existing solution.'?guide?.[2]:m.nextAction);
  const {requirements,blocked}=missionState(m,missions,profile);
  const copy={
   en:['Next step','Task options','Ask Auri','Request help'],
   fr:['Prochaine étape','Options de la tâche','Demander à Auri','Demander de l’aide'],
   tr:['Sıradaki adım','Görev seçenekleri','Auri’ye sor','Yardım iste'],
   ar:['الخطوة التالية','خيارات المهمة','اسأل أوري','اطلب المساعدة'],
  }[lang];
  return `<div class="growth-focus-top"><h2>${esc(title(m))}</h2><small>${esc(status(m))}${m.optional?' · '+l.optional:''}</small></div>
   ${!alternate?`<p class="focus-benefit">${esc(reason||m.description)}</p>`:''}
   <div class="service-next-step"><strong>${copy[0]}</strong><p>${esc(blocked&&requirements.length?requirements.map(cap).join(' · '):action||guide?.[2]||m.description)}</p></div>
   <div class="growth-actions">
   ${canAsk?`<button type="button" class="growth-primary" data-ask-task>${copy[2]} ↗</button>`:''}
   ${guide?.[0]?`<a class="growth-secondary" data-request-task href="${esc(requestLink(guide[0],m.id))}">${copy[3]} →</a>`:''}
   ${canWrite?`<button type="button" class="growth-secondary" data-quick-status="${m.status==='done'?'planned':blocked?'in_progress':'done'}">${m.status==='done'?esc(t('planned')):blocked?l.start:l.complete}</button>`:''}</div>
   ${proof?`<p class="mission-proof-status" role="status">${esc(ui[proof])}</p>`:''}
   ${canWrite?`<details class="growth-diy task-options"><summary>${copy[1]}</summary>
   <div class="growth-actions"><label><span class="sr-only">${esc(t('status'))}</span><select data-status-change>${['planned','in_progress','done','postponed'].map(value=>`<option value="${value}" ${m.status===value?'selected':''}>${esc(t(value))}</option>`).join('')}</select></label><button type="button" class="growth-secondary" data-edit>${esc(t('edit'))}</button></div>
   ${!blocked&&requirements.length?`<p>${l.requirements} · ${esc(requirements.map(cap).join(', '))}</p>`:''}` :''}
   ${canWrite&&missionAlternative(m.capability)?`<div class="growth-actions">
    ${proof==='pending'||m.status==='done'?'':alternate?`<button type="button" class="growth-secondary" data-route="original">${esc(ui.original)}</button>`:`<button type="button" class="growth-secondary" data-route="alternative">${esc(ui.irrelevant)}</button>`}
    ${m.status==='done'||m.status==='postponed'?'':`<button type="button" class="growth-secondary" data-quick-status="postponed">${esc(ui.later)}</button>`}
   </div>${!alternate&&m.status!=='done'&&proof!=='pending'?`<details class="growth-diy"><summary>${esc(ui.alternative)}</summary>
    <p>${esc(missionAlternative(m.capability).steps)}</p><button type="button" class="growth-secondary" data-route="alternative">${esc(t('continue'))}</button></details>`:''}
${proof==='pending'||proof==='approved'?'':`<details class="growth-diy"><summary>${esc(ui.proof)}</summary>
    <form data-evidence class="mission-evidence"><label class="field">${esc(ui.proofLabel)}<textarea name="proof" required minlength="10" maxlength="1000" rows="3"></textarea></label>
    <button class="growth-secondary">${esc(ui.submit)}</button></form></details>`}`:''}${canWrite?'</details>':''}`;
 }
 host.querySelectorAll('[data-node]').forEach(button=>button.onclick=()=>onSelect(button.dataset.node));
 host.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>onView(button.dataset.view));
 host.querySelector('[data-refresh]')?.addEventListener('click',onGenerate);
 host.querySelector('[data-edit]')?.addEventListener('click',()=>onEdit(selected));
 for(const button of host.querySelectorAll('[data-quick-status]'))button.addEventListener('click',event=>{
  const input=host.querySelector('[data-status-change]');
  input.value=event.currentTarget.dataset.quickStatus;
  onSave(selected,input);
 });
 for(const button of host.querySelectorAll('[data-route]'))button.addEventListener('click',event=>onRoute(selected,event.currentTarget));
 host.querySelector('[data-next-mission]')?.addEventListener('click',()=>onContinue(eligible[0].id));
 for(const button of host.querySelectorAll('[data-priority]'))button.addEventListener('click',()=>onContinue(button.dataset.priority));
 const map=host.querySelector('.command-map-viewport');
 if(map){
  let zoom=100;
  const canvas=map.firstElementChild;
  const update=()=>{
   canvas.style.width=zoom>100?map.clientWidth+'px':'';
   canvas.style.zoom=zoom/100;
   host.querySelector('[data-zoom=reset]').textContent=zoom+'%';
  };
  let drag;
  map.onpointerdown=event=>{
   if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('button,a,input,select,textarea'))return;
   if(map.scrollWidth<=map.clientWidth)return;
   drag={x:event.clientX,y:event.clientY,left:map.scrollLeft,top:map.scrollTop};
   map.setPointerCapture(event.pointerId);
  };
  map.onpointermove=event=>{
   if(!drag)return;
   map.scrollLeft=drag.left+drag.x-event.clientX;
   map.scrollTop=drag.top+drag.y-event.clientY;
  };
  map.onlostpointercapture=()=>{drag=null;};
  for(const button of host.querySelectorAll('[data-zoom]'))button.onclick=()=>{
   const action=button.dataset.zoom;
   zoom=action==='reset'?100:Math.min(150,Math.max(75,zoom+(action==='in'?25:-25)));
   update();
  };
 }
 host.querySelector('[data-existing-evidence]')?.addEventListener('submit',event=>{
  event.preventDefault();
  onExistingEvidence(event.currentTarget);
 });
 host.querySelector('[data-evidence]')?.addEventListener('submit',event=>{
  event.preventDefault();
  onEvidence(selected,event.currentTarget);
 });
 host.querySelector('[data-status-change]')?.addEventListener('change',event=>onSave(selected,event.target));
 host.querySelector('[data-ask-task]')?.addEventListener('click',()=>onAskTask(selected));
}
