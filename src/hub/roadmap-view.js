import { eligibleMissions, missionGuide, missionState, roadmapStages } from '../roadmap.js';

const labels = {
 en:['Dashboard','Roadmap','Tasks','Resources','Welcome back','Roadmap progress','Growth stage','Priority actions','Estimated timeline','Your business growth','Your Business Growth Roadmap','Tree view','Timeline','Current focus','Why it matters','How to do it','Requirements','Do it myself','Get this done with AuraDigital','Ask AURI…','Optional','Blocked','Update my roadmap','Request a service','Start','Mark complete','AURI Assistant','Can AuraDigital help?','Upcoming','Completed','Ask about this task'],
 tr:['Panel','Yol haritası','Görevler','Kaynaklar','Tekrar hoş geldiniz','Yol haritası ilerlemesi','Büyüme aşaması','Öncelikli adımlar','Tahmini süre','İşletmenizin büyümesi','İşletmenizin büyüme yol haritası','Ağaç görünümü','Zaman çizelgesi','Şu anki odak','Neden önemli','Nasıl yapılır','Gereksinimler','Kendim yapacağım','AuraDigital ile yap','AURI’ye sorun…','İsteğe bağlı','Engellendi','Yol haritasını güncelle','Hizmet iste','Başla','Tamamlandı olarak işaretle','AURI Asistanı','AuraDigital yardımcı olabilir mi?','Yaklaşan','Tamamlanan','Bu görevi sor'],
 fr:['Tableau de bord','Feuille de route','Tâches','Ressources','Bon retour','Progression','Étape de croissance','Actions prioritaires','Délai estimé','La croissance de votre entreprise','Votre feuille de route de croissance','Vue en arbre','Chronologie','Priorité actuelle','Pourquoi cette tâche compte','Comment faire','Prérequis','Le faire moi-même','Confier à AuraDigital','Demander à AURI…','Facultatif','Bloqué','Actualiser la feuille de route','Demander un service','Démarrer','Marquer comme terminé','Assistant AURI','AuraDigital peut-il aider ?','À venir','Terminé','Poser une question sur cette tâche'],
 ar:['لوحة التحكم','خارطة الطريق','المهام','الموارد','أهلًا بعودتك','تقدم خارطة الطريق','مرحلة النمو','الإجراءات ذات الأولوية','المدة المقدرة','نمو نشاطك التجاري','خارطة نمو نشاطك التجاري','عرض الشجرة','الجدول الزمني','التركيز الحالي','لماذا يهم','طريقة التنفيذ','المتطلبات','سأنفذها بنفسي','نفّذ مع AuraDigital','اسأل AURI…','اختياري','متوقف','حدّث خارطة الطريق','اطلب خدمة','ابدأ','علّم كمكتمل','مساعد AURI','هل يمكن لـ AuraDigital المساعدة؟','القادم','المكتمل','اسأل عن هذه المهمة'],
};
export const roadmapLabels = lang => Object.fromEntries([
 'home','journey','tasks','resources','welcome','progress','stage','priority','estimate','root','heading','tree','timeline','focus','why','how','requirements','myself','hire','ask','optional','blocked','refresh','request','start','complete','assistant','help','upcoming','completed','askTask',
].map((key,i)=>[key,labels[lang][i]]));

export function renderRoadmap({host, workspace, t, esc, cap, lang, view, selectedId, onSelect, onView, onSave, onEdit, onGenerate, onAsk, robot, requestLink}) {
 const l=roadmapLabels(lang);
 const {missions,profile,analysis,permissions}=workspace;
 const canWrite=permissions.includes('roadmap:write');
 const canAsk=permissions.includes('auri:use');
 const eligible=eligibleMissions(missions,profile);
 const selected=missions.find(m=>m.id===selectedId)||eligible[0]||missions[0];
 const completion=items=>items.length?Math.round(items.filter(m=>m.status==='done').length/items.length*100):0;
 const progress=completion(missions);
 const stageOf=m=>Math.min(m.level,4);
 const title=m=>m.objective===m.service?cap(m.capability):m.objective;
 const stages=roadmapStages.map((stage,i)=>({...stage,missions:missions.filter(m=>stageOf(m)===i+1)}));
 const stageName=(stage,i)=>lang==='en'?['Build Foundation','Increase Visibility','Convert More Visitors','Automate & Scale'][i]:t(stage.key);
 const currentStage=stages.findIndex(stage=>stage.missions.some(m=>!m.optional&&!['done','postponed'].includes(m.status)));
 const isBlocked=m=>missionState(m,missions,profile).blocked;
 const status=m=>isBlocked(m)?l.blocked:t(m.status);
 const node=m=>`<button type="button" class="growth-node" data-node="${esc(m.id)}" data-status="${isBlocked(m)?'blocked':m.status}" aria-pressed="${m.id===selected?.id}">
  <span class="growth-dot" aria-hidden="true">${m.status==='done'?'✓':isBlocked(m)?'·':''}</span>
  <span>${esc(title(m))}<small>${esc(status(m))}${m.optional?' · '+l.optional:''}</small></span>
 </button>`;
 const tree=`<div class="growth-tree">
  <div class="growth-root"><span aria-hidden="true">✦</span>${l.root}</div>
  <svg class="growth-lines" viewBox="0 0 800 90" preserveAspectRatio="none" aria-hidden="true">
   <path pathLength="1" d="M400 0 C390 65 100 6 100 90" /><path pathLength="1" d="M400 0 C395 60 300 10 300 90" />
   <path pathLength="1" d="M400 0 C405 60 500 10 500 90" /><path pathLength="1" d="M400 0 C410 65 700 6 700 90" />
  </svg>
  <div class="growth-branches">${stages.map((stage,i)=>`<section class="growth-branch" data-stage="${i}">
    <h3><span aria-hidden="true">${stage.icon}</span>${i+1}. ${esc(stageName(stage,i))}<small>${stage.missions.length?completion(stage.missions)+'%':'—'}</small></h3>
    <div class="growth-nodes">${stage.missions.map(node).join('')||`<p>${esc(t('empty'))}</p>`}</div></section>`).join('')}</div>
 </div>`;
 // Keep numbered milestones in their original growth stage instead of moving
 // completed work into a separate group. This preserves a stable journey.
 const timeline=`<div class="growth-timeline growth-numbered" role="list" aria-label="${esc(l.timeline)}">
  ${stages.map((stage,i)=>`<section class="growth-timeline-stage" role="listitem" data-stage="${i+1}">
   <header class="growth-stage-heading"><span class="growth-stage-number">${String(i+1).padStart(2,'0')}</span>
    <div><h3>${esc(stageName(stage,i))}</h3><small>${stage.missions.filter(m=>m.status==='done').length} / ${stage.missions.length} · ${l.completed}</small></div>
    <span class="growth-stage-percent">${stage.missions.length?completion(stage.missions)+'%':'—'}</span>
   </header>
   <div class="growth-stage-track">
    ${stage.missions.map((m,j)=>`<div class="growth-milestone" data-milestone-status="${esc(m.status)}">
      <span class="growth-milestone-index" aria-hidden="true">${i+1}.${j+1}</span>
      ${node(m)}
      ${m.completedAt?`<time datetime="${esc(m.completedAt)}">${esc(new Date(m.completedAt).toLocaleDateString(lang))}</time>`:''}
      ${isBlocked(m)?`<small class="growth-milestone-blocked">${l.requirements} · ${esc(missionState(m,missions,profile).requirements.map(cap).join(', '))}</small>`:''}
     </div>`).join('')||`<p>${esc(t('empty'))}</p>`}
   </div>
  </section>`).join('')}
 </div>`;
 const metric=(icon,value,label)=>`<article class="growth-card growth-metric"><span class="growth-metric-icon" aria-hidden="true">${icon}</span><div><strong>${esc(value)}</strong><span>${label}</span></div></article>`;
 const detail=selected?taskDetails(selected):`<p>${esc(t('empty'))}</p>`;
 host.innerHTML=`<section class="growth-metrics" aria-label="${l.progress}">
 <article class="growth-card growth-metric"><span class="growth-ring" style="--progress:${progress}%">${missions.length?progress+'%':'—'}</span><div><strong>${l.progress}</strong><span>${missions.filter(m=>m.status==='done').length} / ${missions.length} · ${l.completed}</span></div></article>
 ${metric('▥',currentStage<0?'—':stageName(stages[currentStage],currentStage),l.stage)}
 ${metric('◎',eligible.filter(m=>m.priority===1&&!m.optional).length,l.priority)}
 ${metric('▦','—',l.estimate)}</section>
 <div class="growth-layout"><section class="growth-card growth-map"><header class="growth-panel-head"><h2>${l.heading}</h2><div class="growth-tabs">
 <button type="button" data-view="tree" aria-pressed="${view==='tree'}">${l.tree}</button><button type="button" data-view="timeline" aria-pressed="${view==='timeline'}">${l.timeline}</button>
 </div></header>${view==='tree'?tree:timeline}
 ${analysis.missions.some(m=>!missions.some(item=>item.capability===m.id))&&canWrite?`<button type="button" class="growth-secondary" data-refresh>${l.refresh}</button>`:''}</section>
 <aside class="growth-side"><section class="growth-card growth-focus" id="growth-focus" tabindex="-1">${detail}</section>
 <section class="growth-card growth-auri"><header>${robot()}<h2>${l.assistant}</h2></header>
 <div class="growth-answer" role="status"></div>${canAsk?`<form><input name="question" aria-label="${l.ask}" placeholder="${l.ask}" maxlength="500" required><button class="growth-voice" type="button" data-voice aria-label="Dictate your question" title="Dictate your question" hidden>🎙</button><button class="growth-primary" aria-label="${l.ask}">➤</button></form>`:''}</section></aside></div>`;
 function taskDetails(m) {
  const guide=missionGuide[m.capability];
  const reason=m.reason?.startsWith('This capability has not been reported')?guide?.[1]:m.reason;
  const action=m.nextAction==='Define scope or record your existing solution.'?guide?.[2]:m.nextAction;
  const {requirements,blocked}=missionState(m,missions,profile);
  const row=(label,body)=>`<div class="growth-detail-row"><h3>${label}</h3><p>${esc(body)}</p></div>`;
  return `<div class="growth-focus-top"><span>${l.focus}</span><small>${esc(status(m))}${m.optional?' · '+l.optional:''}</small></div>
   <h2>${esc(title(m))}</h2>
   ${m.description!==reason&&!m.description.startsWith('Establish ')?`<p>${esc(m.description)}</p>`:''}
   ${row(l.why,reason||m.description)}
   ${row(l.requirements,m.dependencies?.length?m.dependencies.map(cap).join(', '):'—')}
   ${guide?.[0]?row(l.help,guide[0]+' · '+t('quote')):''}
   <details class="growth-diy" open><summary>${l.myself}</summary>${row(l.how,action)}
   ${blocked?`<p>${l.blocked} · ${esc(requirements.map(cap).join(', '))}</p>`:''}</details>
   <div class="growth-actions">
   ${guide?.[0]?`<a class="growth-primary" href="${esc(requestLink(guide[0],title(m)))}">${l.hire} →</a>`:''}
   ${canWrite?`<button class="growth-secondary" data-quick-status="${m.status==='done'?'planned':blocked?'in_progress':'done'}">${m.status==='done'?esc(t('planned')):blocked?l.start:l.complete}</button><label><span class="sr-only">${esc(t('status'))}</span><select data-status-change>${['planned','in_progress','done','postponed'].map(value=>`<option value="${value}" ${m.status===value?'selected':''}>${esc(t(value))}</option>`).join('')}</select></label><button class="growth-secondary" data-edit>${esc(t('edit'))}</button>`:''}
   ${canAsk?`<button class="growth-secondary" data-ask-task>${l.askTask}</button>`:''}</div>`;
 }
 async function ask(question,missionId) {
  const response=host.querySelector('.growth-answer');
  response.textContent='…';
  try { response.textContent=await onAsk(question,missionId); }
  catch(error) { response.textContent=error.message; }
 }
 host.querySelectorAll('[data-node]').forEach(button=>button.onclick=()=>onSelect(button.dataset.node));
 host.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>onView(button.dataset.view));
 host.querySelector('[data-refresh]')?.addEventListener('click',onGenerate);
 host.querySelector('[data-edit]')?.addEventListener('click',()=>onEdit(selected));
 host.querySelector('[data-quick-status]')?.addEventListener('click',event=>{
  const input=host.querySelector('[data-status-change]');
  input.value=event.currentTarget.dataset.quickStatus;
  onSave(selected,input);
 });
 host.querySelector('[data-status-change]')?.addEventListener('change',event=>onSave(selected,event.target));
 host.querySelector('[data-ask-task]')?.addEventListener('click',()=>ask('',selected.id));
 // Optional browser-native dictation: only microphone activation from a user click.
 // Transcription stays editable; no message is sent until the user submits.
 const VoiceRecognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
 const voiceButton=host.querySelector('[data-voice]');
 if(voiceButton&&VoiceRecognition&&canAsk) {
  voiceButton.hidden=false;
  const language={en:'en-US',tr:'tr-TR',fr:'fr-FR',ar:'ar-SA'}[lang]||'en-US';
  let listening=false,recognition=null;
  voiceButton.addEventListener('click',()=>{
   if(listening){recognition?.stop();return;}
   recognition=new VoiceRecognition();
   recognition.lang=language;
   recognition.interimResults=false;
   recognition.maxAlternatives=1;
   recognition.onresult=event=>{
    const transcript=event.results?.[0]?.[0]?.transcript?.trim();
    if(!transcript)return;
    const input=host.querySelector('.growth-auri input[name="question"]');
    if(input){input.value=(input.value+' '+transcript).trim().slice(0,500);input.focus();}
   };
   recognition.onerror=event=>{
    const response=host.querySelector('.growth-answer');
    if(response) response.textContent=event.error==='not-allowed'?'Microphone permission was denied.':'Voice input unavailable. You can type your question.';
   };
   recognition.onend=()=>{listening=false;voiceButton.setAttribute('aria-pressed','false');voiceButton.classList.remove('listening');};
   try{recognition.start();listening=true;voiceButton.setAttribute('aria-pressed','true');voiceButton.classList.add('listening');}
   catch{listening=false;voiceButton.setAttribute('aria-pressed','false');}
  });
 }
 host.querySelector('.growth-auri form')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget,submit=form.querySelector('button');
  submit.disabled=true;
  try { await ask(new FormData(form).get('question')); }
  finally { submit.disabled=false; }
 });
}
