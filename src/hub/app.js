import { auriCharacter, connectAuri } from './auri-companion.js';
import { pulseAuri, runAuri } from './auri-controller.js';
import { auriControls, auriDraftCopy, auriLabels, auriNames } from './auri-copy.js';
import { customerReturnPath } from '../customer-return.js';
import { renderRoadmap, roadmapLabels } from './roadmap-view.js';
import { eligibleMissions, missionGuide, missionState } from '../roadmap.js';
import { renderMenuDrafts } from './menu-drafts.js';
import { copy, capabilityNames } from './i18n.js';
import { simulate, capabilities } from '../growth-engine.js';
const app=document.querySelector('#app'),notice=document.querySelector('#notice');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang=localStorage.getItem('aura-hub-language')||'en';if(!copy[lang])lang='en';
let me=null,workspaces=[],workspace=null,page='home',editing=false,mode='myself',step=0,draft={},result=null,scenarioInputs=null,saveQueue=Promise.resolve(),saveTimer;
let route=location.pathname.split('/')[2]||'',flowToken=new URLSearchParams(location.hash.slice(1)).get('token')||'';
const returnPath=['login','signup','forgot'].includes(route)?customerReturnPath(new URLSearchParams(location.search).get('next'),''):'';
const authQuery=returnPath?'?'+new URLSearchParams({next:returnPath}):'';
let authCapabilities={};
function resumeShop(){
 if(!returnPath||returnPath==='/hub')return false;
 location.replace(returnPath);
 return true;
}
if(flowToken)history.replaceState(null,'',location.pathname+location.search);
const t=k=>k==='menuDrafts'?({en:'Menu drafts',ar:'مسودات القوائم',tr:'Menü taslakları',fr:'Brouillons de menus'})[lang]:copy[lang][k]||copy.en[k]||k,cap=k=>capabilityNames[lang][k]||capabilities.find(c=>c.id===k)?.service||k;
const toast=message=>{notice.textContent=message;notice.classList.add('visible');setTimeout(()=>notice.classList.remove('visible'),7000);};
const setupScope='setup';
let disconnectAuri=()=>{};
const auriLevel=()=>workspace?.auri?.level||1;
const auriPreference=()=>workspace?.auriPreferences||{name:'Auri',hidden:false};
const auriSessions=new Map();
let auriVoice=null;
const robot=()=>auriCharacter(auriLevel(),{posterOnly:true});
function bindAuri(host,scope){
 disconnectAuri();
 disconnectAuri=connectAuri(host,scope,{idle:auriControls(lang).ready,...auriLabels(lang)});
}
async function finishSetup(){
 await runAuri(setupScope,'working',persistProfile);
 editing=false;
 page='home';
 await loadWorkspace();
 pulseAuri(workspace.organization.id,'success');
}
async function generateRoadmap(){
 const id=workspace.organization.id;
 await runAuri(id,'working',async()=>{
  await api(endpoint('missions'),'POST',{});
  await loadWorkspace(id);
 });
}
async function api(path,method='GET',body) {const response=await fetch(path,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await response.json().catch(()=>({error:t('error')}));if(!response.ok){const error=new Error(data.error||t('error'));error.status=response.status;throw error;}return data;}
const endpoint=s=>'/api/hub/workspaces/'+workspace.organization.id+(s?'/'+s:'');
const button=(label,action,secondary=false,disabled=false)=>`<button type="button" data-action="${action}" class="${secondary?'secondary':'primary'}" ${disabled?'disabled':''}>${esc(t(label))}</button>`;
function field(key,label,value='',type='text',extra='') {return `<label class="field">${esc(t(label))}<input name="${key}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
const select=(key,label,options,value)=>`<label class="field">${esc(t(label))}<select name="${key}">${options.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
function languageControl(){return `<label class="language"><span class="sr-only">Language</span><select id="language" aria-label="Language">${[['en','EN · English'],['ar','AR · العربية'],['fr','FR · Français'],['tr','TR · Türkçe']].map(([v,l])=>`<option value="${v}" ${lang===v?'selected':''}>${l}</option>`).join('')}</select></label>`;}
function bindCommon(){document.querySelector('#language')?.addEventListener('change',async e=>{clearTimeout(saveTimer);if(editing&&workspace)await persistProfile();lang=e.target.value;localStorage.setItem('aura-hub-language',lang);render();});}
function render(){disconnectAuri();document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';app.setAttribute('aria-busy','false');if(!me||['verify','reset','forgot','invitation'].includes(route)){renderGate();return;}if(!workspace||editing){renderSetup();return;}renderShell();}
function gateFrame(content){app.innerHTML=`<header class="gate-header"><a href="/" class="wordmark">aura<span>digital</span></a>${languageControl()}</header><main id="main" class="gate">${content}</main>`;bindCommon();}
async function renderGate(){
 if(route==='invitation'&&me){gateFrame(`<section class="panel">${robot()}<h1>${t('inviteAccept')}</h1><div id="invitation-content" role="status">…</div></section>`);try{const data=await api('/api/hub/invitations/preview','POST',{token:flowToken}),i=data.invitation;document.querySelector('#invitation-content').innerHTML=`<h2>${esc(i.business)}</h2><p>${esc(i.email)} · ${esc(t(i.role))}</p><p>${esc(i.message)}</p><p>${t('permissions')}: ${esc(i.permissions.join(', '))}</p><p>${esc(new Date(i.expiresAt*1000).toLocaleString(lang))}</p><p class="warning">${t('blocked')}</p><form id="accept-invitation"><label class="check"><input type="checkbox" name="consent" required>${t('recurringConsent')}</label><button class="primary">${t('inviteAccept')}</button></form>`;document.querySelector('#accept-invitation').onsubmit=async e=>{e.preventDefault();try{const r=await api('/api/hub/invitations/accept','POST',{token:flowToken,acceptInvitation:true,acceptRecurring:true,consentVersion:'seat-5-usd-month-v1'});flowToken='';toast(t('awaiting'));document.querySelector('#invitation-content').textContent=t('blocked');}catch(e){toast(e.message);}};}catch(e){document.querySelector('#invitation-content').textContent=e.message;document.querySelector('#invitation-content').append(Object.assign(document.createElement('a'),{href:'/hub/settings',textContent:t('settings')}));}return;}
 if(route==='verify'){gateFrame(`<section class="panel">${robot()}<h1>${t('verify')}</h1><p id="verification-result" role="status"></p>${button('confirm','verify')}<a href="/hub">${t('brand')}</a></section>`);document.querySelector('[data-action="verify"]').onclick=async e=>{const confirmButton=e.target;confirmButton.disabled=true;try{await api('/api/customer/verify','POST',{token:flowToken});flowToken='';document.querySelector('#verification-result').textContent=t('verified');}catch(error){document.querySelector('#verification-result').textContent=error.message;confirmButton.disabled=false;}};return;}
 const signup=route==='signup',forgot=route==='forgot',reset=route==='reset';
 gateFrame(`<section class="auth-intro"><p class="eyebrow">AURADIGITAL / ${t('brand')}</p><h1>${t('welcome')}</h1><p>${t('tag')}</p>${robot()}</section><section class="panel auth-panel"><h2>${t(reset?'reset':forgot?'forgot':signup?'signup':'signIn')}</h2><form id="auth-form">${signup?field('name','name','','text','required minlength="2" maxlength="100" autocomplete="name"'):''}${reset?'':field('email','email','','email','required maxlength="254" autocomplete="email"')}${forgot?'':field('password',reset?'newPassword':'password','','password','required '+(signup||reset?'minlength="12" ':'')+'maxlength="72" autocomplete="'+(signup||reset?'new-password':'current-password')+'"')}${signup?`<label class="check"><input type="checkbox" name="terms" required>${t('terms')}</label>`:''}<p class="form-error" role="alert"></p><button class="primary">${t(reset?'reset':forgot?'continue':signup?'signup':'signIn')}</button></form>${!forgot&&!reset?`${authCapabilities.google?`<hr><label class="check"><input id="google-terms" type="checkbox">${t('terms')}</label>${button('google','google',true)}`:''}<div class="auth-links"><a href="/hub/${signup?'login':'signup'}${authQuery}">${t(signup?'signIn':'signup')}</a>${authCapabilities.email?`<a href="/hub/forgot${authQuery}">${t('forgot')}</a>`:''}</div>`:`<a href="/hub/login${authQuery}">${t('signIn')}</a>`}</section>`);
 document.querySelector('#auth-form').onsubmit=async e=>{e.preventDefault();const form=e.target,b=form.querySelector('button'),data=new FormData(form);b.disabled=true;try{if(forgot){const r=await api('/api/customer/forgot-password','POST',{email:data.get('email')});toast(t('resetSent'));}else if(reset){await api('/api/customer/reset-password','POST',{token:flowToken,password:data.get('password')});location.assign('/hub/login'+authQuery);}else{await api('/api/customer/'+(signup?'register':'login'),'POST',{name:data.get('name'),email:data.get('email'),password:data.get('password'),acceptTerms:data.has('terms')});if(route!=='invitation'&&resumeShop())return;route=route==='invitation'?'invitation':'';await load();}}catch(error){form.querySelector('[role="alert"]').textContent=error.message;}finally{b.disabled=false;}};
 document.querySelector('[data-action="google"]')?.addEventListener('click',()=>{if(!document.querySelector('#google-terms').checked){toast(t('terms'));return;}if(route==='invitation'){toast(t('googleInvite'));}location.assign('/api/customer/google/start?'+new URLSearchParams({acceptTerms:'true',...(returnPath?{next:returnPath}:{})}));});
}
const emptyProfile=()=>({name:'',industry:'other',country:'',city:'',stage:'',website:'',tools:'',acquisition:'',difficulties:'',goals:'',timeline:'',industryDetails:'',budget:null,currency:'USD',capabilities:[]});
function profileField(k){
 const value=draft[k]??'';
 if(k==='industry')return select(k,k,[['restaurant',t('restaurant')],['services',t('servicesIndustry')],['ecommerce',t('ecommerce')],['real_estate',t('real_estate')],['other',t('other')]],value);
 if(k==='currency')return select(k,k,['USD','EUR','TRY','TND'].map(x=>[x,x]),value);
 if(k==='capabilities')return `<fieldset><legend>${t(k)}</legend><div class="checks">${capabilities.map(c=>`<label class="check"><input type="checkbox" name="capabilities" value="${c.id}" ${(draft.capabilities||[]).includes(c.id)?'checked':''}>${esc(cap(c.id))}</label>`).join('')}</div></fieldset>`;
 if(['tools','acquisition','difficulties','goals','industryDetails'].includes(k)){const question=k==='industryDetails'?({restaurant:'restaurantQuestion',ecommerce:'ecommerceQuestion',real_estate:'realEstateQuestion',services:'servicesQuestion'}[draft.industry]||'otherQuestion'):k;return `<label class="field">${t(question)}<textarea name="${k}" rows="4" maxlength="${k==='tools'||k==='acquisition'?1200:1600}">${esc(value)}</textarea></label>`;}
 return field(k,k==='name'?'businessName':k,value,k==='budget'?'number':k==='website'?'url':'text',k==='name'?'required maxlength="120"':k==='budget'?'min="0" max="100000000" step="any"':`maxlength="${({country:80,city:100,stage:80,website:500,timeline:200})[k]||200}"`);
}
const profileKeys=['name','industry','industryDetails','country','city','stage','website','tools','acquisition','difficulties','goals','currency','budget','timeline','capabilities'];
function renderSetup(){
 if(!editing){draft=workspace?structuredClone(workspace.profile):emptyProfile();mode=workspace?.organization.mode||'myself';}
 const choosing=!editing;
 const setupKeys=workspace?profileKeys:['name','industry','goals','budget','currency','website','capabilities'];
 app.innerHTML=`<header class="gate-header"><a href="/" class="wordmark">aura<span>digital</span></a>${languageControl()}</header><main class="setup" id="main"><div class="setup-heading"><p class="eyebrow">${t('brand')}</p><h1>${choosing?t('welcome'):esc(draft.name||t('profile'))}</h1><p>${choosing?t('choose'):t(mode==='auri'?'auriText':'myselfText')}</p></div>${choosing?`<div class="mode-grid"><button class="mode-card" data-mode="myself"><span class="mode-icon">↗</span><h2>${t('myself')}</h2><p>${t('myselfText')}</p><span>${t('continue')} →</span></button><button class="mode-card dark" data-mode="auri">${robot()}<h2>${t('auri')}</h2><p>${t('auriText')}</p><span>${t('continue')} →</span></button></div>`:`<section class="panel profile-panel"><div class="panel-bar"><span>${mode==='auri'?`AURI · ${step+1}/${setupKeys.length}`:t('profile')}</span><span id="save-state" role="status"></span>${button('switchMode','switch-mode',true)}</div>${mode==='auri'?`<div class="auri-onboarding">${auriCharacter(auriLevel())}<p data-auri-status role="status"></p></div>`:''}<form id="profile-form" class="${mode==='auri'?'guided':'form-grid'}">${(mode==='auri'?[setupKeys[step]]:setupKeys).map(profileField).join('')}<div class="actions full">${mode==='auri'?button('back','back-step',true,step===0)+button('skip','skip-step',true,step===0):''}<button class="primary" type="submit">${t(mode==='auri'&&step<setupKeys.length-1?'continue':'save')}</button>${workspace?button('home','leave-setup',true):''}</div><p class="form-error full" role="alert"></p></form></section>`}</main>`;
 bindCommon();document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;editing=true;step=0;render();});
 if(choosing)return;
 const form=document.querySelector('#profile-form');
 const avatar=document.querySelector('.auri-onboarding');
 if(avatar){bindAuri(avatar,setupScope);pulseAuri(setupScope,'listening',950);}
 const collect=()=>{const data=new FormData(form);for(const k of profileKeys){if(k==='capabilities'){if(form.querySelector('[name="capabilities"]'))draft.capabilities=data.getAll(k);}else if(data.has(k))draft[k]=k==='budget'?(data.get(k)===''?null:Number(data.get(k))):data.get(k);}};
 form.addEventListener('input',()=>{collect();if(!workspace)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>{persistProfile().catch(e=>toast(e.message));},1000);});
 form.addEventListener('change',e=>{collect();if(e.target.name==='industry'&&mode==='myself'){clearTimeout(saveTimer);(workspace?persistProfile():Promise.resolve()).then(render).catch(e=>toast(e.message));}});
 form.onsubmit=async e=>{e.preventDefault();collect();clearTimeout(saveTimer);const b=form.querySelector('[type="submit"]');b.disabled=true;try{if(mode==='auri'&&step<setupKeys.length-1){step++;render();}else{await finishSetup();}}catch(error){form.querySelector('[role="alert"]').textContent=error.message;b.disabled=false;}};
 document.querySelector('[data-action="switch-mode"]').onclick=async()=>{collect();clearTimeout(saveTimer);mode=mode==='auri'?'myself':'auri';try{if(workspace&&draft.name.trim())await persistProfile();render();}catch(e){toast(e.message);}};
 for(const [action,delta]of [['back-step',-1],['skip-step',1]])document.querySelector(`[data-action="${action}"]`)?.addEventListener('click',async()=>{collect();clearTimeout(saveTimer);try{if(workspace&&draft.name.trim())await persistProfile();if(delta>0&&step===setupKeys.length-1){await finishSetup();return;}step=Math.max(0,step+delta);render();}catch(e){toast(e.message);}});
 document.querySelector('[data-action="leave-setup"]')?.addEventListener('click',async()=>{collect();clearTimeout(saveTimer);try{await persistProfile();editing=false;await loadWorkspace();}catch(e){toast(e.message);}});
}
function persistProfile(){
 if(!draft.name.trim())return Promise.resolve();
 const snapshot=structuredClone(draft),selectedMode=mode;
 const job=saveQueue.catch(()=>{}).then(async()=>{
  const status=document.querySelector('#save-state');if(status)status.textContent=t('saving');
  if(!workspace){const created=await api('/api/hub/workspaces','POST',{profile:snapshot,mode:selectedMode});workspace=await api('/api/hub/workspaces/'+created.id);workspaces.push({id:created.id,name:snapshot.name,owner:true});}
  else {await api(endpoint('profile'),'PUT',{profile:snapshot,mode:selectedMode,version:workspace.organization.version});workspace.organization.version++;workspace.profile=snapshot;workspace.organization.mode=selectedMode;workspace.organization.name=snapshot.name;}
  if(status)status.textContent=t('saved');
 });saveQueue=job;return job;
}
let roadmapView='tree',selectedMission=null,workspaceSwitch=null;
const requestLink=(service='',task='')=>'/contact#'+new URLSearchParams({
 hub:'1',service,business:workspace.organization.name,task,name:me.name,email:me.email,
});
const navigation=['home','journey','tasks','assistant','services','resources','settings'];
const moreNavigation=['profile','simulator','menuDrafts','projects','websites','hosting','files','reports','invoices','rewards','team','support'];
function renderShell(){
 window.scrollTo({top:0,left:0,behavior:'instant'});
 const l=roadmapLabels(lang),growth=['home','journey'].includes(page);
 const alerts=workspace.missions.filter(m=>m.priority===1&&!m.optional&&!['done','postponed'].includes(m.status)&&!missionState(m,workspace.missions,workspace.profile).blocked);
 const navItem=p=>`<button class="nav-item ${page===p?'active':''}" data-page="${p}" ${page===p?'aria-current="page"':''}>
 <span aria-hidden="true">${({home:'⌂',journey:'♧',tasks:'☑',assistant:'✧',services:'◇',resources:'▤',settings:'⚙'})[p]||'·'}</span>${esc(p==='assistant'?auriControls(lang).workspace:l[p]||t(p))}</button>`;
 app.innerHTML=`<div class="shell growth-shell ${growth?'growth-active':''}"><aside class="sidebar" id="sidebar">
 <a href="/" class="wordmark">aura<span>digital.</span></a><label class="field workspace-picker"><span class="sr-only">${t('businessName')}</span>
 <select id="workspace-select" aria-label="${t('businessName')}">${workspaces.map(o=>`<option value="${o.id}" ${o.id===workspace.organization.id?'selected':''}>${esc(o.id===workspace.organization.id?workspace.organization.name:o.name)}</option>`).join('')}</select></label>
 <nav aria-label="${t('brand')}">${navigation.map(navItem).join('')}</nav><div class="growth-request"><a class="growth-primary" href="${esc(requestLink())}">${l.request} →</a></div></aside>
 <div class="workspace"><header class="topbar growth-topbar"><button class="menu-button secondary" id="toggle-menu" aria-controls="sidebar" aria-expanded="false">${t('menu')}</button>
 <div class="growth-greeting"><strong>${esc(l.welcome)}, ${esc(me.name.split(' ')[0])}</strong><span>${esc(workspace.organization.name)}</span></div>
 ${languageControl()}
 <details class="growth-notifications"><summary class="growth-secondary" aria-label="${esc(t('activity'))}">
 <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/></svg></summary>
 <div class="growth-account-menu"><strong>${l.priority}</strong>
 ${alerts.length?`<ul>${alerts.map(m=>`<li>${esc(m.objective===m.service?cap(m.capability):m.objective)}</li>`).join('')}</ul>`:`<p>${esc(t('empty'))}</p>`}
 ${navItem('journey')}</div></details>
 <details class="growth-account"><summary><span class="avatar">${esc(me.name.slice(0,1))}</span><span>${esc(me.name)}</span></summary>
 <div class="growth-account-menu">${navItem('profile')}${navItem('settings')}${button('logout','logout',true)}</div></details></header>
 <main id="main" tabindex="-1">${growth?`<h1 class="sr-only">${l[page]}</h1>`:`<div class="page-heading"><h1>${esc(page==='assistant'?auriControls(lang).workspace:l[page]||t(page))}</h1></div>`}
 ${!me.verified&&authCapabilities.email?`<aside class="verification"><p>${t('verifyLater')}</p>${button('sendVerification','send-verification',true)}</aside>`:''}
 <div id="page-content"></div></main><div id="auri-companion"></div></div></div>`;
 bindCommon();document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;document.body.classList.remove('menu-open');render();document.querySelector('#main').focus();});
 document.querySelector('#toggle-menu').onclick=e=>{const open=document.body.classList.toggle('menu-open');e.target.setAttribute('aria-expanded',String(open));syncSidebar();};
 document.querySelector('#workspace-select').onchange=async e=>{
  const select=e.target, id=select.value;
  select.disabled=true;
  workspaceSwitch=id;
  try{await loadWorkspace(id);}
  catch(error){select.value=workspace.organization.id;toast(error.message);}
  finally{workspaceSwitch=null;select.disabled=false;}
 };
 document.querySelector('[data-action="logout"]').onclick=async()=>{try{await api('/api/customer/logout','POST',{});location.assign('/hub/login');}catch(e){toast(e.message);}};
 document.querySelector('[data-action="send-verification"]')?.addEventListener('click',async e=>{e.target.disabled=true;try{await api('/api/customer/send-verification','POST',{});toast(t('saved'));}catch(e){toast(e.message);}finally{e.target.disabled=false;}});
 syncSidebar();
 if(page!=='assistant')renderCompanion();
 renderPage().catch(e=>{document.querySelector('#page-content').innerHTML=`<section class="panel"><p role="alert">${esc(e.message)}</p>${button('refresh','refresh',true)}</section>`;document.querySelector('[data-action="refresh"]').onclick=()=>loadWorkspace().catch(e=>toast(e.message));});
}
const content=html=>{document.querySelector('#page-content').innerHTML=html;};
function syncSidebar(){const sidebar=document.querySelector('#sidebar');if(!sidebar)return;const closed=matchMedia('(max-width:800px)').matches&&!document.body.classList.contains('menu-open');sidebar.inert=closed;sidebar.setAttribute('aria-hidden',String(closed));}
window.addEventListener('resize',syncSidebar);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu-open')){document.body.classList.remove('menu-open');syncSidebar();document.querySelector('#toggle-menu')?.setAttribute('aria-expanded','false');document.querySelector('#toggle-menu')?.focus();}});
async function renderPage(){
 if(page==='profile'&&!workspace.permissions.includes('profile:write')){content(`<section class="panel"><h2>${esc(workspace.profile.name)}</h2><p>${t('readOnly')}</p><p>${esc(workspace.profile.goals)}</p></section>`);return;}
 if(page==='profile'){draft=structuredClone(workspace.profile);mode=workspace.organization.mode;editing=true;renderSetup();return;}
 if(page==='menuDrafts')return renderMenuDrafts({host:document.querySelector('#page-content'),api,endpoint,profile:workspace.profile,canWrite:workspace.permissions.includes('roadmap:write')});
 if(page==='home'||page==='journey')return growthDashboard();
 if(page==='tasks')return journey();
 if(page==='resources'){
  content(`<section class="panel"><div class="resource-links"><a class="secondary" href="/shop">AuraShop</a><a class="secondary" href="/account">${esc(t('orders'))}</a>${moreNavigation.map(p=>`<button type="button" class="secondary" data-resource="${p}">${esc(t(p))}</button>`).join('')}</div></section>`);
  document.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>{page=b.dataset.resource;render();});
  return;
 }
 if(page==='simulator')return simulator();if(page==='team')return team();if(page==='assistant')return assistant();
 if(page==='settings'){content(`<section class="panel"><h2>${t('security')}</h2><p>${esc(me.email)} · ${me.verified?t('verified'):t('verify')}</p>${authCapabilities.email?`<a class="secondary" href="/hub/forgot">${t('reset')}</a>`:''}${me.verified&&authCapabilities.google?`<p><a class="secondary" href="/api/customer/google/start?acceptTerms=true">${t('linkGoogle')}</a></p>`:''}<hr>${button('team','open-team',true)}${button('newWorkspace','new-workspace',true)}</section>`);document.querySelector('[data-action="open-team"]').onclick=()=>{page='team';render();};document.querySelector('[data-action="new-workspace"]').onclick=()=>{stopAuriVoice();workspace=null;editing=false;render();};return;}
 const service=page==='services',support=page==='support',reports=['reports','rewards'].includes(page);
 content(`<section class="panel quiet-panel"><span class="eyebrow">${reports?'NOT CONNECTED':service?'SERVICE CATALOGUE':'INTEGRATION PENDING'}</span><h2>${t(page)}</h2><p>${t(service?'serviceNote':support?'supportText':reports?'reportNote':'unavailable')}</p><a class="primary" href="${service?'/services':'/contact'}">${t(service?'openServices':'contact')} ↗</a></section>`);
}
async function askAuri(question,missionId) {
 const id=workspace.organization.id;
 const {data}=await runAuri(id,'thinking',()=>api(endpoint('auri'),'POST',missionId?{tool:'task',missionId}:{tool:'guidance',question,lang}),'speaking');
 if(workspace?.organization.id!==id)return '';
 if(data.reply)return data.reply;
 if(/customers|visibility|sales|müşteri|clients|عملاء/i.test(question)&&data.priorities?.length)return data.priorities.map(m=>cap(m.capability)).join(' · ');
 const task=data.mission||data.nextAction;
 if(!task)return t('empty');
 const guide=missionGuide[task.capability],requirements=missionState(task,workspace.missions,workspace.profile).requirements;
 if(!missionId&&/website|web site|site web|موقع/i.test(question)) {
  const website=workspace.missions.find(m=>m.capability==='website');
  if(website){selectedMission=website.id;return [cap('website'),missionGuide.website[2],t('quote')].join(' · ');}
 }
 const action=task.nextAction==='Define scope or record your existing solution.'?guide?.[2]:task.nextAction;
 return [cap(task.capability),action,requirements.length?requirements.map(cap).join(', '):''].filter(Boolean).join(' · ');
}
function growthDashboard(){
 renderRoadmap({host:document.querySelector('#page-content'),workspace,t,esc,cap,lang,view:roadmapView,selectedId:selectedMission,robot,requestLink,
  onSelect(id){selectedMission=id;growthDashboard();const detail=document.getElementById('growth-focus');detail.focus({preventScroll:!matchMedia('(max-width: 800px)').matches});},
  onView(view){roadmapView=view;growthDashboard();document.querySelector(`[data-view="${view}"]`)?.focus();},
  onEdit(mission){page='tasks';render();const card=document.querySelector(`[data-mission="${mission.id}"]`);card?.querySelector('[data-action=edit]').click();card?.querySelector('input')?.focus();},
  async onSave(mission,input){
   input.disabled=true;
   const workspaceId=workspace.organization.id;
   try{const {version,position}=mission;await api(endpoint('missions/'+mission.id),'PATCH',{version,position,status:input.value});if(workspace.organization.id===workspaceId)await loadWorkspace();}
   catch(error){input.value=mission.status;input.disabled=false;toast(error.message);}
  },
  async onGenerate(event){
   event.target.disabled=true;
   try{await generateRoadmap();}
   catch(error){event.target.disabled=false;toast(error.message);}
  },
  onAsk:askAuri,
 });
}
function journey(){
 const write=workspace.permissions.includes('roadmap:write');
 content(`<div class="panel-bar"><p>${t('noPurchase')}</p>${button('createJourney','generate',false,!write)}</div><div class="journey-levels">${[1,2,3,4,5].map(l=>`<section class="journey-level"><div class="level-heading"><span class="level-number">0${l}</span><div><span class="eyebrow">${t('level')} ${l}</span><h2>${t(['foundation','visibility','conversion','automation','scale'][l-1])}</h2></div></div>${workspace.missions.filter(m=>m.level===l).map(m=>`<article class="panel mission" data-mission="${m.id}"><div class="panel-bar"><h3>${esc((m.objective===m.service?cap(m.capability):m.objective))}</h3><span class="pill">${t(m.status)}</span></div><p>${m.description.startsWith('Establish ')?t('why'):esc(m.description)}</p><p>${t('benefit')}</p><div class="mission-meta"><span>${t('quote')}</span><span>${t('priority')}: ${t(m.priority===1?'high':m.priority===2?'medium':'low')}</span>${m.dependencies?.length?`<span>↳ ${esc(m.dependencies.map(cap).join(', '))}</span>`:''}</div><div class="actions">${select('status','status',['planned','in_progress','done','postponed'].map(v=>[v,t(v)]),m.status)}${button('up','up',true,!write)}${button('down','down',true,!write)}${button('edit','edit',true,!write)}</div><p>${m.nextAction==='Define scope or record your existing solution.'?t('nextAction')+': '+t('quote'):esc(m.nextAction)}</p></article>`).join('')||`<p class="empty-level">${t('empty')}</p>`}</section>`).join('')}</div>`);
 document.querySelector('[data-action="generate"]').onclick=async e=>{e.target.disabled=true;try{await generateRoadmap();}catch(error){e.target.disabled=false;toast(error.message);}};
 document.querySelectorAll('[data-mission]').forEach(card=>{
  const m=workspace.missions.find(m=>m.id===card.dataset.mission),save=async patch=>{try{const id=workspace.organization.id;await api(endpoint('missions/'+m.id),'PATCH',{version:m.version,status:m.status,position:m.position,...patch});await loadWorkspace(id);}catch(e){toast(e.message);}};
  card.querySelector('select').disabled=!write;card.querySelector('select').onchange=e=>save({status:e.target.value});
  card.querySelector('[data-action="up"]').onclick=()=>save({direction:'up'});
  card.querySelector('[data-action="down"]').onclick=()=>save({direction:'down'});
  card.querySelector('[data-action="edit"]').onclick=()=>{card.insertAdjacentHTML('beforeend',`<form class="mission-edit">${field('objective','objective',m.objective,'text','required maxlength="160"')}${field('description','description',m.description,'text','required maxlength="1600"')}${field('nextAction','nextAction',m.nextAction,'text','required maxlength="500"')}<button class="primary">${t('save')}</button></form>`);card.querySelector('.mission-edit').onsubmit=e=>{e.preventDefault();save(Object.fromEntries(new FormData(e.target)));};card.querySelector('[data-action="edit"]').disabled=true;};
 });
}
const initialInputs=()=>({visits:1000,leads:30,closeRate:20,customerValue:100,margin:40,monthlyCost:50,setupCost:200,solutions:[],currency:workspace.profile.currency||'USD',assumptions:[{trafficLift:5,leadRateLift:5,closeRateLift:0},{trafficLift:15,leadRateLift:10,closeRateLift:5},{trafficLift:30,leadRateLift:20,closeRateLift:10}]});
function format(value,currency){return value===null?t('na'):new Intl.NumberFormat(lang,{maximumFractionDigits:2,...(currency?{style:'currency',currency}:{})}).format(value);}
function resultsHTML(data){return `<div class="table-scroll"><table><caption>${t('assumptions')} · ${esc(data.inputs.currency)}</caption><thead><tr><th scope="col"></th>${data.scenarios.map(s=>`<th scope="col">${t(s.name)}</th>`).join('')}</tr></thead><tbody>${[['additionalCustomers','customers'],['additionalRevenue','revenue',true],['contributionProfit','profit',true],['netMonthly','net',true],['firstYearROI','roi'],['paybackMonths','payback']].map(([key,label,money])=>`<tr><th scope="row">${t(label)}</th>${data.scenarios.map(s=>`<td>${esc(format(s[key],money?data.inputs.currency:null))}${key==='firstYearROI'&&s[key]!==null?'%':''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
async function simulator(){
 scenarioInputs=scenarioInputs||initialInputs();const s=scenarioInputs,write=workspace.permissions.includes('simulation:write');
 content(`<div class="panel"><span class="eyebrow">${t('assumptions')}</span><p>${t('simNotice')}</p><p class="warning">${t('sample')}</p><details><summary>${t('formulaTitle')}</summary><p>${t('formula')}</p></details><form id="simulator-form"><div class="form-grid">${['visits','leads','closeRate','customerValue','margin','monthlyCost','setupCost'].map(k=>field(k,k,s[k],'number',`required min="0" max="${['margin','closeRate'].includes(k)?100:1e9}" step="any"`)).join('')}${select('currency','currency',['USD','EUR','TRY','TND'].map(c=>[c,c]),s.currency)}</div><fieldset class="solution-choices"><legend>${t('solutions')}</legend><div class="checks">${capabilities.map(c=>`<label class="check"><input type="checkbox" name="solutions" value="${c.id}" ${(s.solutions||[]).includes(c.id)?'checked':''}>${esc(cap(c.id))}</label>`).join('')}</div></fieldset><div class="scenario-inputs">${s.assumptions.map((a,i)=>`<fieldset><legend>${t(['conservative','base','ambitious'][i])}</legend>${['trafficLift','leadRateLift','closeRateLift'].map(k=>field(k+'-'+i,k,a[k],'number','required min="0" max="300" step="any"')).join('')}</fieldset>`).join('')}</div><button class="primary">${t('calculate')}</button><p class="form-error" role="alert"></p></form><div id="sim-results">${result?resultsHTML(result):''}</div><form id="save-scenario" ${result?'':'hidden'} class="save-scenario">${field('name','scenarioName','','text','required maxlength="120"')}<button class="primary" ${write?'':'disabled'}>${t('saveScenario')}</button>${button('export','export',true)}${button('addSolutions','add-solutions',true,!workspace.permissions.includes('roadmap:write'))}</form></div><section class="panel"><h2>${t('history')}</h2><div id="scenario-history">…</div></section>`);
 document.querySelector('#simulator-form').onsubmit=e=>{e.preventDefault();const form=e.target,data=new FormData(form),inputs={currency:data.get('currency'),solutions:data.getAll('solutions'),assumptions:[0,1,2].map(i=>Object.fromEntries(['trafficLift','leadRateLift','closeRateLift'].map(k=>[k,Number(data.get(k+'-'+i))])))};for(const k of ['visits','leads','closeRate','customerValue','margin','monthlyCost','setupCost'])inputs[k]=Number(data.get(k));try{result=simulate(inputs);scenarioInputs=inputs;document.querySelector('#sim-results').innerHTML=resultsHTML(result);document.querySelector('#save-scenario').hidden=false;form.querySelector('[role="alert"]').textContent='';}catch(error){form.querySelector('[role="alert"]').textContent=error.message;}};
 document.querySelector('#simulator-form').addEventListener('input',()=>{result=null;document.querySelector('#save-scenario').hidden=true;document.querySelector('#sim-results').innerHTML='';});
 document.querySelector('[data-action="add-solutions"]').onclick=async()=>{try{if(!result.inputs.solutions.length){toast(t('solutions'));return;}await api(endpoint('missions'),'POST',{services:result.inputs.solutions});toast(t('saved'));}catch(e){toast(e.message);}};
 document.querySelector('#save-scenario').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await api(endpoint('scenarios'),'POST',{name:new FormData(e.target).get('name'),inputs:result.inputs});toast(t('saved'));await simulator();}catch(e){toast(e.message);}finally{b.disabled=false;}};
 document.querySelector('[data-action="export"]').onclick=()=>download(result,'aura-growth-scenario.json');
 const data=await api(endpoint('scenarios'));document.querySelector('#scenario-history').innerHTML=data.scenarios.map(s=>`<button class="history-item secondary" data-scenario="${s.id}"><span>${esc(s.name)}</span><small>${esc(s.createdAt)}</small> ↗</button>`).join('')||`<p>${t('empty')}</p>`;
 document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>{const saved=data.scenarios.find(s=>s.id===b.dataset.scenario);result=saved.result;scenarioInputs=saved.inputs;simulator().catch(e=>toast(e.message));});
}
function download(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function team(){
 if(!workspace.organization.owner||!me.verified){content(`<section class="panel"><h2>${t('teamTitle')}</h2><p>${t('teamText')}</p><p>${t(!me.verified?'verifiedRequired':'readOnly')}</p></section>`);return;}
 const data=await api(endpoint('team'));
 content(`<section class="team-intro"><div><span class="eyebrow">AURA TEAM ACCESS</span><h2>${t('teamTitle')}</h2><p>${t('teamText')}</p></div><div class="price">$5<small>USD / month / member</small></div></section><p class="warning">${t('blocked')}</p><section class="panel"><h2>${t('invite')}</h2><form id="invite-form" class="form-grid">${field('email','email','','email','required maxlength="254"')}${select('role','role',['viewer','member','admin'].map(v=>[v,t(v)]),'viewer')}${field('message','message','','text','maxlength="800"')}<div class="field"><span>${t('permissions')}</span><p id="role-explanation"></p></div><button class="primary">${t('invite')}</button><p class="form-error" role="alert"></p></form></section><section class="panel"><div class="panel-bar"><h2>${t('team')}</h2><span class="pill">${data.members.filter(m=>m.status!=='removed').length} ${t('seats')}</span></div><p>${t('billingPrivate')}</p><div class="table-scroll"><table><thead><tr>${['name','email','role','status','subscription','paymentDate'].map(k=>`<th scope="col">${t(k)}</th>`).join('')}<th scope="col">${t('edit')}</th></tr></thead><tbody>${data.members.map(m=>`<tr data-member="${m.id}"><td>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${esc(t(m.role))}</td><td>${esc(t(m.status))}</td><td>${esc(m.subscriptionStatus?t(m.subscriptionStatus):t('awaiting'))}</td><td>${m.nextPaymentAt?esc(new Date(m.nextPaymentAt*1000).toLocaleDateString(lang)):'—'}</td><td>${m.status==='removed'?'':button('edit','edit-member',true)+button('remove','remove-member',true)}</td></tr>`).join('')||`<tr><td colspan="7">${t('empty')}</td></tr>`}</tbody></table></div><h3>${t('invite')}</h3>${data.invitations.map(i=>`<div class="invitation-row"><div><strong>${esc(i.email)}</strong><small>${esc(t(i.role))} · ${esc(t(i.status))} · ${esc(t(i.deliveryStatus))}</small></div>${i.status==='pending'?`<div class="actions"><button class="secondary" data-cancel="${i.id}">${t('cancelInvite')}</button><button class="secondary" data-resend="${i.id}">${t('resend')}</button></div>`:''}</div>`).join('')||`<p>${t('empty')}</p>`}<details><summary>${t('activity')}</summary><div id="activity"></div></details></section>`);
 const explain=()=>{const role=document.querySelector('[name="role"]').value;document.querySelector('#role-explanation').textContent=role==='admin'?['profile','journey','simulator','assistant'].map(t).join(' · '):role==='member'?[t('readOnly'),t('assistant')].join(' · '):t('readOnly');};explain();document.querySelector('[name="role"]').onchange=explain;
 document.querySelector('#invite-form').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;try{await api(endpoint('invitations'),'POST',Object.fromEntries(new FormData(e.target)));toast(t('saved'));await team();}catch(error){e.target.querySelector('[role="alert"]').textContent=error.message;}finally{b.disabled=false;}};
 document.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=async()=>{try{await api(endpoint('invitations/'+b.dataset.cancel),'DELETE');await team();}catch(e){toast(e.message);}});
 document.querySelectorAll('[data-resend]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const i=data.invitations.find(i=>i.id===b.dataset.resend);await api(endpoint('invitations/'+i.id),'DELETE');await api(endpoint('invitations'),'POST',{email:i.email,role:i.role,message:''});await team();}catch(e){toast(e.message);b.disabled=false;}});
 document.querySelectorAll('[data-member]').forEach(row=>{const m=data.members.find(m=>m.id===row.dataset.member);row.querySelector('[data-action="remove-member"]')?.addEventListener('click',async()=>{if(!confirm(t('removeConfirm')))return;try{const r=await api(endpoint('team/'+m.id),'DELETE');if(r.subscriptionCancellation==='BLOCKED_PROVIDER_RECONCILIATION_REQUIRED')toast(r.subscriptionCancellation);await team();}catch(e){toast(e.message);}});row.querySelector('[data-action="edit-member"]')?.addEventListener('click',()=>{const cell=row.lastElementChild;cell.innerHTML=`<form>${select('role','role',rolesForUI(),m.role)}<fieldset><legend>${t('restrict')}</legend>${['profile:write','roadmap:write','simulation:write','workspace:read','auri:use'].map(p=>`<label class="check"><input type="checkbox" name="denied" value="${p}" ${m.deniedPermissions.includes(p)?'checked':''}>${esc(t(({'profile:write':'profile','roadmap:write':'journey','simulation:write':'simulator','workspace:read':'home','auri:use':'assistant'})[p]))}</label>`).join('')}</fieldset><button class="primary">${t('save')}</button></form>`;cell.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api(endpoint('team/'+m.id),'PATCH',{role:f.get('role'),deniedPermissions:f.getAll('denied')});await team();}catch(e){toast(e.message);}};});});
 const a=await api(endpoint('activity'));document.querySelector('#activity').innerHTML=a.events.map(e=>`<p>${esc(e.created_at)} · ${esc(e.action)}</p>`).join('')||t('empty');
}
const rolesForUI=()=>['viewer','member','admin'].map(v=>[v,t(v)]);
async function updateAuriPreferences(values) {
 const id=workspace.organization.id;
 const result=await api(endpoint('auri'),'PATCH',{...auriPreference(),...values});
 if(workspace?.organization.id===id)workspace.auriPreferences=result;
}

function stopAuriVoice() {
 if(!auriVoice)return;
 speechSynthesis.cancel();
 const {scope}=auriVoice;
 auriVoice=null;
 pulseAuri(scope,'idle');
}

function renderCompanion(full=false){
 const host=document.querySelector(full?'#auri-workspace':'#auri-companion');
 const preferences=auriPreference(), controls=auriControls(lang);
 if(preferences.hidden&&!full)return;
 const id=workspace.organization.id;
 if(!auriSessions.has(id))auriSessions.set(id,{open:false,reply:'',pending:false,error:''});
 const session=auriSessions.get(id);
 const level=auriLevel(), canAsk=workspace.permissions.includes('auri:use');
 const {ask:label,focus}=roadmapLabels(lang);
 const next=eligibleMissions(workspace.missions,workspace.profile)[0];
 const readAloud=({en:'Read aloud',tr:'Sesli oku',fr:'Lire à voix haute',ar:'قراءة بصوت عالٍ'})[lang];
 const send=({en:'Send',tr:'Gönder',fr:'Envoyer',ar:'إرسال'})[lang];
 const identity=`${auriCharacter(level)}<span><strong>${esc(preferences.name)}</strong><small>${esc(t('level'))} ${level} · ${auriNames[level-1]}</small></span>
  <span class="auri-status" role="status" data-auri-status></span>`;
 const body=`<div class="auri-companion-body">
  ${next?`<p><strong>${esc(focus)}</strong> · ${esc(cap(next.capability))}</p>`:''}
  ${canAsk?`<form data-auri-ask><label><span class="sr-only">${esc(label)}</span><input name="question" maxlength="500" placeholder="${esc(label)}" required></label>
  <button class="primary" ${session.pending?'disabled':''}>${esc(send)}</button></form><p data-auri-reply role="status">${esc(session.error||session.reply)}</p>
  ${'speechSynthesis' in window?`<button type="button" class="secondary" data-auri-voice ${session.reply&&!session.error?'':'hidden'}>${esc(readAloud)}</button>
  <button type="button" class="secondary" data-auri-stop ${auriVoice?.scope===id?'':'hidden'}>${esc(controls.stop)}</button>`:''}`:''}
  <div class="auri-actions">
  <button type="button" class="secondary" data-auri-roadmap>${esc(t('journey'))}</button>
  ${full?'':`<button type="button" class="secondary" data-auri-open-workspace>${esc(controls.workspace)}</button>`}
  <button type="button" class="secondary" data-auri-hide>${esc(preferences.hidden?controls.show:controls.hide)}</button></div>
  ${full?`<form data-auri-name><label>${esc(controls.name)}<input name="name" value="${esc(preferences.name)}" required maxlength="24"></label>
  <button class="secondary">${esc(t('save'))}</button></form>`:''}
 </div>`;
 host.innerHTML=full?`<section class="auri-companion auri-workspace-card"><header>${identity}</header>${body}</section>`:
  `<details class="auri-companion auri-dock" ${session.open?'open':''}><summary>${identity}</summary>${body}</details>`;
 bindAuri(host,id);
 const panel=host.querySelector('details');
 if(panel){
  panel.ontoggle=()=>{if(panel.isConnected)session.open=panel.open;};
  panel.onkeydown=event=>{
   if(event.key==='Escape'&&panel.open){panel.open=false;panel.querySelector('summary').focus();}
  };
 }
 function navigate(target){
  page=target;
  render();
  document.querySelector('#main').focus();
 }
 host.querySelector('[data-auri-roadmap]').onclick=()=>navigate('journey');
 const open=host.querySelector('[data-auri-open-workspace]');
 if(open)open.onclick=()=>navigate('assistant');
 host.querySelector('[data-auri-hide]').onclick=async event=>{
  const trigger=event.currentTarget;
  trigger.disabled=true;
  try{
   await updateAuriPreferences({hidden:!preferences.hidden});
   if(workspace?.organization.id!==id)return;
   stopAuriVoice();
   session.open=false;
   if(trigger.isConnected){render();document.querySelector('#main').focus();}
  }catch(error){toast(error.message);trigger.disabled=false;}
 };
 const rename=host.querySelector('[data-auri-name]');
 if(rename)rename.onsubmit=async event=>{
  event.preventDefault();
  const submit=rename.querySelector('button');
  submit.disabled=true;
  try{
   await updateAuriPreferences({name:new FormData(rename).get('name')});
   if(rename.isConnected){render();document.querySelector('[data-auri-name] input')?.focus();toast(t('saved'));}
  }catch(error){toast(error.message);submit.disabled=false;}
 };
 const form=host.querySelector('[data-auri-ask]');
 const voice=host.querySelector('[data-auri-voice]');
 const stop=host.querySelector('[data-auri-stop]');
 if(voice)voice.onclick=()=>{
  stopAuriVoice();
  const message=new SpeechSynthesisUtterance(session.reply);
  message.lang=lang;
  auriVoice={scope:id,message};
  message.onstart=()=>pulseAuri(id,'speaking',3500);
  message.onend=message.onerror=()=>{
   if(auriVoice?.message!==message)return;
   auriVoice=null;
   pulseAuri(id,'idle');
   document.querySelector('[data-auri-stop]')?.setAttribute('hidden','');
  };
  stop.hidden=false;
  speechSynthesis.speak(message);
 };
 if(stop)stop.onclick=()=>{stopAuriVoice();stop.hidden=true;};
 if(form)form.onsubmit=async event=>{
  event.preventDefault();
  const submit=form.querySelector('button'), reply=host.querySelector('[data-auri-reply]');
  const question=new FormData(form).get('question').trim();
  if(!question||session.pending)return;
  stopAuriVoice();
  session.pending=submit.disabled=true;
  if(voice)voice.hidden=true;
  if(stop)stop.hidden=true;
  session.reply=session.error=reply.textContent='';
  try{session.reply=await askAuri(question);}
  catch(error){session.error=error.message;}
  finally{
   session.pending=submit.disabled=false;
   reply.textContent=session.error||session.reply;
   if(voice)voice.hidden=!session.reply;
   if(!form.isConnected&&workspace?.organization.id===id)renderCompanion(page==='assistant');
  }
 };
}
function assistant(){
 const canAsk=workspace.permissions.includes('auri:use');
 const labels=auriDraftCopy(lang);
 content(`<div id="auri-workspace"></div>${canAsk?`<section class="panel auri-work-log">
  <div class="actions"><button type="button" class="primary" data-auri-draft>${esc(labels.create)}</button>${button('diagnosis','diagnosis',true)}${button('recommend','next-action',true)}</div><div data-auri-tools-status role="status"></div>
  <p role="status" data-draft-status></p>
  <h2>${esc(labels.history)}</h2><div data-auri-drafts></div></section>`:''}`);
 renderCompanion(true);
 if(!canAsk)return;
 const create=document.querySelector('[data-auri-draft]');
 const log=document.querySelector('[data-auri-drafts]');
 const status=document.querySelector('[data-draft-status]');
 const path=endpoint('auri'),id=workspace.organization.id;
 const toolsStatus=document.querySelector('[data-auri-tools-status]');
 for(const [action,tool] of [['diagnosis','diagnosis'],['next-action','next_action']]){
  const trigger=document.querySelector(`[data-action="${action}"]`);
  trigger.onclick=async()=>{
   trigger.disabled=true;
   try{
    const {data}=await runAuri(id,'thinking',()=>api(path,'POST',{tool}),'speaking');
    toolsStatus.textContent=tool==='diagnosis'
     ? `${t('missing')} · ${data.missing.map(cap).join(', ')||t('empty')}`
     : data.nextAction?cap(data.nextAction.capability):t('empty');
   }catch(error){toolsStatus.textContent=error.message;}
   finally{trigger.disabled=false;}
  };
 }
 const session=auriSessions.get(id);
 create.disabled=Boolean(session.draftPending);
 status.textContent=session.draftError||'';
 async function readDrafts(){
  const {drafts}=await api(path);
  log.innerHTML=drafts.map(draft=>`<article><strong>${esc(labels[draft.source])}</strong>
   <time datetime="${new Date(draft.created_at).toISOString()}">${esc(new Date(draft.created_at).toLocaleString(lang))}</time>
   <p>${esc(draft.body)}</p></article>`).join('');
 }
 readDrafts().catch(error=>{status.textContent=error.message;});
 create.onclick=async()=>{
  if(session.draftPending)return;
  session.draftPending=create.disabled=true;
  session.draftError=status.textContent='';
  try{
   await runAuri(id,'drafting',()=>api(path,'POST',{tool:'draft_follow_up',lang}),'draft_ready');
   if(create.isConnected){await readDrafts();status.textContent=labels.review;}
  }catch(error){session.draftError=status.textContent=error.message;}
  finally{
   session.draftPending=create.disabled=false;
   if(!create.isConnected&&page==='assistant'&&workspace?.organization.id===id)assistant();
  }
 };
}

async function loadWorkspace(id=workspace.organization.id){
 if(workspaceSwitch&&id!==workspaceSwitch)return;
 const previous=workspace;
 const next=await api('/api/hub/workspaces/'+id);
 if((workspaceSwitch||workspace.organization.id)!==id)return;
 if(workspace.organization.id!==id){selectedMission=null;stopAuriVoice();}
 result=null;scenarioInputs=null;workspace=next;render();
 if(previous.organization.id===id&&next.auri?.verifiedMilestones>previous.auri?.verifiedMilestones){
  pulseAuri(id,next.auri.level>previous.auri.level?'evolving':'happy',2400);
 }
}
async function load(){try{const data=await api('/api/hub/workspaces');me=data.user;if(['login','signup'].includes(route)&&resumeShop())return;workspaces=data.workspaces;if(workspaces.length){const selected=workspace&&workspaces.find(w=>w.id===workspace.organization.id);workspace=await api('/api/hub/workspaces/'+(selected?.id||workspaces[0].id));}if(route==='settings'){page='settings';route='';}if(route==='signup'||route==='login')route='';render();}catch(e){if(e.status===401){me=null;render();}else{gateFrame(`<section class="panel"><h1>${t('brand')}</h1><p role="alert">${esc(e.message)}</p><a href="/account">${t('openAccount')}</a></section>`);}}}
async function start(){
 if(['verify','reset','forgot'].includes(route)){render();return;}
 authCapabilities=await api('/api/customer/capabilities').catch(()=>({}));
 await load();
}
start();
