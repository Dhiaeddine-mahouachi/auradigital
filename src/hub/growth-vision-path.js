import { hubLabels, hubStage, hubStageNames } from './hub-navigation.js';
// The Growth Vision path is a presentation of existing customer missions and
// server-verified Auri milestones. XP is derived, never a client-writable balance.
const copy = {
 en: {
  subtitle:'Your business growth path, step by step.', xp:'Verified XP', verified:'verified milestones',
  missions:'Level tasks', stage:'Current level', next:'Complete tasks, then submit evidence to unlock XP.',
  auri:'Auri evolution', evolves:'Auri evolves when a growth milestone is verified.',
  empty:'No tasks are assigned to this level yet.', done:'Tasks completed', active:'In progress',
  upcoming:'Upcoming', pending:'Ready for review', reward:'XP when verified', progress:'Roadmap progress',
  descriptions:['Establish your business basics','Help more people find you','Turn interest into customers','Work smarter with connected systems','Measure, improve and scale'],
  names:['Foundation','Visibility','Conversion','Operations','Scale'],
 },
 tr: {
  subtitle:'İşletmenizin büyüme yolu, adım adım.',xp:'Doğrulanmış XP',verified:'doğrulanmış hedef',
  missions:'Seviye görevleri',stage:'Seçili seviye',next:'Görevleri tamamlayın ve XP için kanıt gönderin.',
  auri:'Auri gelişimi',evolves:'Büyüme hedefi doğrulandığında Auri gelişir.',
  empty:'Bu seviyeye henüz görev atanmadı.',done:'Görevler tamamlandı',active:'Devam ediyor',
  upcoming:'Yaklaşan',pending:'İncelemeye hazır',reward:'Doğrulanınca XP',progress:'Yol haritası ilerlemesi',
  descriptions:['İşletmenizin temelleri','Daha fazla kişiye ulaşın','İlgiyi müşteriye dönüştürün','Bağlantılı sistemlerle daha verimli çalışın','Ölçün, iyileştirin ve büyüyün'],
  names:['Temel','Görünürlük','Dönüşüm','Operasyon','Büyüme'],
 },
 fr: {
  subtitle:'Votre parcours de croissance, étape par étape.',xp:'XP vérifiée',verified:'objectifs vérifiés',
  missions:'Missions du niveau',stage:'Niveau sélectionné',next:'Terminez les missions et soumettez des preuves pour obtenir de l’XP.',
  auri:'Évolution d’Auri',evolves:'Auri évolue lorsqu’un objectif est vérifié.',
  empty:'Aucune mission attribuée à ce niveau.',done:'Missions terminées',active:'En cours',
  upcoming:'À venir',pending:'À vérifier',reward:'XP après vérification',progress:'Progression',
  descriptions:['Établir les bases','Améliorer votre visibilité','Transformer les contacts en clients','Travailler avec des systèmes connectés','Mesurer, optimiser et grandir'],
  names:['Fondations','Visibilité','Conversion','Opérations','Croissance'],
 },
 ar: {
  subtitle:'مسار نمو نشاطك التجاري، خطوة بخطوة.',xp:'نقاط XP المعتمدة',verified:'إنجازات تم التحقق منها',
  missions:'مهام المستوى',stage:'المستوى المحدد',next:'أكمل المهام وأرسل الدليل للحصول على نقاط XP.',
  auri:'تطور أوري',evolves:'تتطور أوري عند التحقق من إنجاز مرحلة النمو.',
  empty:'لا توجد مهام في هذا المستوى بعد.',done:'المهام مكتملة',active:'قيد التنفيذ',
  upcoming:'القادم',pending:'بانتظار المراجعة',reward:'نقاط بعد التحقق',progress:'تقدم خارطة الطريق',
  descriptions:['تأسيس النشاط التجاري','الوصول إلى مزيد من العملاء','تحويل الاهتمام إلى عملاء','العمل بكفاءة عبر أنظمة متصلة','القياس والتحسين والتوسع'],
  names:['التأسيس','الظهور','التحويل','العمليات','التوسع'],
 },
};
const rewards=[100,180,260,340,420];

export function renderGrowthVisionPath({workspace,esc,lang='en',title,status,displayState,selected,robot}) {
 const ui=copy[lang]||copy.en;
 const hub=hubLabels(lang);
 const missions=workspace.missions||[];
 const stages=hubStageNames(lang).map((name,index)=>({
  name,missions:missions.filter(m=>hubStage(m.level)===index),
 }));
 const current=stages.findIndex(stage=>stage.missions.some(m=>!m.optional&&!['done','postponed'].includes(m.status)));
 const chosen=selected?hubStage(selected.level):Math.max(current,0);
 const stage=stages[chosen];
 const auriLevel=Math.max(1,Math.min(7,Number(workspace.auri?.level)||1));
 const verified=Math.max(0,Math.min(5,Number(workspace.auri?.verifiedMilestones)||0));
 const xp=rewards.slice(0,verified).reduce((sum,value)=>sum+value,0);
 const maxXp=rewards.reduce((sum,value)=>sum+value,0);
 const complete=stageMissions=>stageMissions.filter(m=>m.status==='done').length;
 const missionRow=m=>`<button class="vision-task" type="button" data-node="${esc(m.id)}" data-display-state="${esc(displayState(m))}" aria-pressed="${selected?.id===m.id}">
  <span class="vision-task-icon" aria-hidden="true">${m.status==='done'?'✓':'○'}</span>
  <span class="vision-task-name">${esc(title(m))}<small>${esc(m.reason||m.description||'')}</small></span>
  <span class="vision-task-status">${esc(status(m))} <span aria-hidden="true">↗</span></span>
 </button>`;
 const stageCard=(item,index)=>{
  const count=complete(item.missions),total=item.missions.length;
  const finished=total>0&&count===total;
  const active=current===index;
  const first=item.missions.find(m=>!m.optional&&!['done','postponed'].includes(m.status))||item.missions[0];
  const state=finished?ui.done:active?hub.current:current<index&&current!==-1?hub.locked:ui.upcoming;
  const content=`<span class="vision-stage-status">${index+1} · ${esc(state)}</span>
    <strong>${esc(item.name)}</strong>
    ${index<3?`<img class="vision-stage-art" src="/hub/stage-${index+1}.webp" alt="" width="140" height="106">`:`<span class="vision-stage-icon vision-stage-fallback" aria-hidden="true">${index===3?"⚙":"▥"}</span>`}
    <small>${count} / ${total} ${esc(ui.missions.toLowerCase())}</small>`;
  return `<li class="vision-stage" data-stage-state="${finished?'done':active?'active':'upcoming'}">
   ${first?`<button type="button" class="vision-stage-button" data-node="${esc(first.id)}" aria-pressed="${chosen===index}">${content}</button>`:`<div class="vision-stage-button">${content}</div>`}
  </li>`;
 };
 return `<div class="growth-path" aria-label="${esc(ui.progress)}">
  <header class="vision-heading">
   <div><h2>${esc(missions.find(m=>m.planGoal)?.planGoal||ui.subtitle)}</h2></div>
   <section class="vision-xp" aria-label="${esc(ui.xp)}">
    <div class="vision-xp-head"><strong>✦ ${esc(ui.xp)}</strong><span>${xp} / ${maxXp} XP</span></div>
    <div class="vision-xp-track" role="progressbar" aria-valuenow="${xp}" aria-valuemin="0" aria-valuemax="${maxXp}" aria-label="${esc(ui.xp)}"><span style="width:${(xp/maxXp*100).toFixed(1)}%"></span></div>
    <small>${verified} / 5 ${esc(ui.verified)}</small>
   </section>
  </header>
  <div class="vision-path-scroll"><ol class="vision-path-cards" aria-label="${esc(ui.progress)}">${stages.map(stageCard).join('')}</ol></div>
  <div class="vision-selected">
   <section class="vision-tasks" aria-label="${esc(ui.missions)}">
    <div class="vision-level-heading"><div>
     <h3>${esc(stage.name)}</h3></div></div>
    <div class="vision-task-list">${stage.missions.map(missionRow).join('')||`<p class="vision-empty">${esc(ui.empty)}</p>`}</div>
    <p class="vision-note">${esc(ui.next)}</p>
   </section>
   <section class="vision-auri" aria-label="${esc(ui.auri)}">
    <div class="vision-auri-portrait">${robot()}</div>
    <div class="vision-auri-description"><span class="vision-kicker">${esc(ui.auri)}</span>
     <h3>Auri · ${auriLevel} / 7</h3><p>${esc(ui.evolves)}</p>
     <div class="vision-auri-pips" aria-label="${esc(ui.auri)} ${auriLevel} / 7">
      ${Array.from({length:7},(_,i)=>`<span class="${i<auriLevel?'is-earned':''}" aria-hidden="true"></span>`).join('')}
     </div>
    </div>
   </section>
  </div>
 </div>`;
}
