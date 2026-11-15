const messages = {
 en: ['Let’s build your business roadmap.', 'Tell us about your business. Aura will take care of the plan.', 'Build with Aura AI', 'Build myself', 'Does your business have a website?', 'Do you have a Google Business Profile?', 'Do you already use a CRM?', 'Yes', 'No', 'Aura is preparing your business headquarters.', 'Business profile validated', 'Personalized roadmap saved', 'Open Aura Command', 'Use microphone', 'Review the transcribed answer before continuing.'],
 tr: ['İşletmenizin yol haritasını oluşturalım.', 'İşletmenizi anlatın. Aura planınızı hazırlasın.', 'Aura AI ile oluştur', 'Kendim oluşturayım', 'İşletmenizin web sitesi var mı?', 'Google İşletme Profiliniz var mı?', 'CRM kullanıyor musunuz?', 'Evet', 'Hayır', 'Aura işletme merkezinizi hazırlıyor.', 'İşletme profili doğrulandı', 'Kişisel yol haritası kaydedildi', 'Aura Command’u aç', 'Mikrofonu kullan', 'Devam etmeden önce yazıya dökülen yanıtı kontrol edin.'],
 fr: ['Créons la feuille de route de votre entreprise.', 'Parlez-nous de votre entreprise. Aura prépare votre plan.', 'Créer avec Aura IA', 'Créer moi-même', 'Votre entreprise a-t-elle un site web ?', 'Avez-vous une fiche Google Business ?', 'Utilisez-vous déjà un CRM ?', 'Oui', 'Non', 'Aura prépare votre espace de travail.', 'Profil d’entreprise validé', 'Feuille de route personnalisée enregistrée', 'Ouvrir Aura Command', 'Utiliser le microphone', 'Vérifiez la transcription avant de continuer.'],
 ar: ['لننشئ خارطة طريق لنشاطك التجاري.', 'أخبرنا عن نشاطك. ستعدّ أورا الخطة.', 'إنشاء باستخدام ذكاء أورا', 'إنشاء بنفسي', 'هل لديك موقع إلكتروني لنشاطك؟', 'هل لديك ملف نشاط تجاري على Google؟', 'هل تستخدم نظامًا لإدارة العملاء؟', 'نعم', 'لا', 'تجهّز أورا مقرّ نشاطك التجاري.', 'تم التحقق من ملف النشاط', 'تم حفظ خارطة الطريق المخصصة', 'فتح Aura Command', 'استخدام الميكروفون', 'راجع النص قبل المتابعة.'],
};
const binary = { website:4, discovery:5, crm:6 };
const locales = {en:'en-US',tr:'tr-TR',fr:'fr-FR',ar:'ar'};

export function mountOnboarding({app, api, lang, t, esc, header, bindCommon, field, profileField, initialProfile, saved, onComplete}) {
 const m=messages[lang];
 let draft=saved||{profile:initialProfile,mode:null,step:0};
 let pending=false, timer, request=Promise.resolve(), recognition, finishedId;
 const save=()=>{
  clearTimeout(timer);
  const snapshot=structuredClone(draft);
  request=request.catch(()=>{}).then(()=>api('/api/hub/onboarding','PUT',snapshot));
  return request;
 };
 const questions=()=>['name','industry',...(draft.profile.industry==='other'?[]:['industryDetails']),'city','website','discovery','crm','goals','currency','budget'];
 const choice=key=>`<fieldset><legend id="question">${m[binary[key]]}</legend><div class="actions">${[true,false].map(yes=>`<button type="button" class="secondary" data-answer="${yes}" aria-pressed="${draft.profile.capabilities.includes(key)===yes}">${m[yes?7:8]}</button>`).join('')}</div>${key==='website'&&draft.profile.capabilities.includes(key)?field('website','website',draft.profile.website,'url','maxlength="500"'):''}</fieldset>`;
 function draw(focus=false){
  app.classList.add('aura-os');
  const keys=questions();
  draft.step=Math.min(draft.step,keys.length-1);
  const key=keys[draft.step], final=draft.step===keys.length-1;
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  const voice=Speech&&draft.mode==='auri'&&['name','industryDetails','city','goals'].includes(key);
  app.innerHTML=`${header}<main class="setup onboarding" id="main">${draft.mode
   ?`<section class="panel profile-panel" aria-labelledby="setup-title"><div class="panel-bar"><span>${draft.step+1} / ${keys.length}</span><span id="save-state" role="status"></span><button type="button" class="secondary" data-switch>${m[draft.mode==='auri'?3:2]}</button></div><progress aria-label="${m[0]}" max="${keys.length}" value="${draft.step+1}"></progress><h1 id="setup-title" tabindex="-1">${m[0]}</h1><form id="profile-form" class="guided">${key in binary?choice(key):profileField(key,draft.profile)}${voice?`<button type="button" class="secondary" data-voice>${m[13]}</button>`:''}<div class="actions"><button type="button" class="secondary" data-back>${t('back')}</button><button type="submit" class="primary">${t(final?'save':'continue')}</button></div><p role="alert" class="form-error"></p></form></section>`
   :`<div class="setup-heading"><h1>${m[0]}</h1><p>${m[1]}</p></div><div class="mode-grid"><button class="mode-card" data-mode="auri"><h2>${m[2]}</h2><span>${t('continue')} →</span></button><button class="mode-card" data-mode="myself"><h2>${m[3]}</h2><span>${t('continue')} →</span></button></div>`}</main>`;
  bindCommon();
  app.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{draft.mode=button.dataset.mode;draw(true);save().catch(showError);});
  if(!draft.mode)return;
  const form=app.querySelector('form'), input=form.elements.namedItem(key);
  const status=app.querySelector('#save-state');
  if(focus)app.querySelector('#setup-title').focus();
  const collect=()=>{if(input)draft.profile[key]=key==='budget'?(input.value===''?null:input.valueAsNumber):input.value;};
  form.oninput=()=>{
   if(pending)return;
   collect();
   clearTimeout(timer);
   if(!form.matches(':valid')||(key==='website'&&input?.value&&!input.value.startsWith('https://')))return;
   status.textContent=t('saving');
   timer=setTimeout(()=>save().then(()=>{status.textContent=t('saved');}).catch(showError),500);
  };
  form.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
   if(pending)return;
   collect();
   const capabilities=new Set(draft.profile.capabilities);
   if(button.dataset.answer==='true')capabilities.add(key);
   else {capabilities.delete(key);if(key==='website')draft.profile.website='';}
   draft.profile.capabilities=[...capabilities];
   draw();
   app.querySelector(`[data-answer="${button.dataset.answer}"]`)?.focus();
   save().then(()=>{app.querySelector('#save-state').textContent=t('saved');}).catch(showError);
  });
  const transition=async change=>{
   if(pending)return;
   pending=true;
   recognition?.abort();
   collect();
   const previous={...draft};
   change();
   try{await save();draw(true);}
   catch(error){draft=previous;showError(error);}
   finally{pending=false;}
  };
  app.querySelector('[data-switch]').onclick=()=>transition(()=>{draft.mode=draft.mode==='auri'?'myself':'auri';});
  form.querySelector('[data-back]').onclick=()=>{
   if(pending)return;
   if(draft.step===0){clearTimeout(timer);draft.mode=null;draw();return;}
   transition(()=>{draft.step--;});
  };
  const mic=form.querySelector('[data-voice]');
  if(mic)mic.onclick=()=>{
   recognition=new Speech();
   recognition.lang=locales[lang];
   recognition.onresult=event=>{input.value=event.results[0][0].transcript.slice(0,input.maxLength>0?input.maxLength:1600);input.dispatchEvent(new Event('input',{bubbles:true}));status.textContent=m[14];};
   recognition.onend=()=>{mic.disabled=false;};
   recognition.onerror=()=>{mic.disabled=false;showError(new Error(t('error')));};
   try{mic.disabled=true;recognition.start();}catch(error){mic.disabled=false;showError(error);}
  };
  form.onsubmit=async event=>{
   event.preventDefault();
   if(!final){await transition(()=>{draft.step++;});return;}
   if(pending)return;
   pending=true;
   collect();
   const submit=form.querySelector('[type=submit]');
   submit.disabled=true;
   try{
    if(!finishedId)await save();
    form.hidden=true;
    const panel=form.closest('section');
    panel.querySelector('h1').textContent=m[9];
    const progress=document.createElement('ol');
    progress.className='setup-stages';
    progress.setAttribute('aria-live','polite');
    panel.append(progress);
    const addStage=label=>{const item=document.createElement('li');item.textContent=label;progress.append(item);};
    addStage(m[10]);
    if(!finishedId)finishedId=(await api('/api/hub/workspaces','POST',{profile:draft.profile,mode:draft.mode,finishOnboarding:true})).id;
    addStage(m[11]);
    const workspace=await api('/api/hub/workspaces/'+finishedId);
    if(draft.mode==='auri'){
     const guidance=await api('/api/hub/workspaces/'+finishedId+'/auri','POST',{
      tool:'guidance',question:draft.profile.goals.slice(0,500)||'What should I do first?',lang,
     }).catch(()=>null);
     if(guidance?.data?.reply){
      const recommendation=document.createElement('p');
      recommendation.textContent=guidance.data.reply;
      panel.append(recommendation);
     }
    }
    const open=document.createElement('button');
    open.type='button';open.className='primary';open.textContent=m[12];
    open.onclick=()=>onComplete(workspace);
    panel.append(open);
    open.focus();
   }catch(error){
    form.hidden=false;
    form.closest('section').querySelector('.setup-stages')?.remove();
    form.closest('section').querySelector('h1').textContent=m[0];
    submit.disabled=false;
    showError(error);
   }finally{pending=false;}
  };
 }
 function showError(error){const target=app.querySelector('.form-error');if(target)target.textContent=error.message;}
 draw();
 return ()=>{clearTimeout(timer);recognition?.abort();return draft;};
}
