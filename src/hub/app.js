import { accountSettingsCopy, renderAccountSettings } from './settings-view.js';
import { renderServices, renderServiceOffer, serviceOffer, serviceShortcuts, renderServiceDetails, serviceLabels, serviceSummary, serviceDate, serviceStatus } from './service-view.js';
import { mountGuide } from './guide-view.js';
import { currentHubLocation, hubIcon, hubLabels, hubLink, hubStage, hubStageNames } from './hub-navigation.js';
import { renderRequestForm, renderWorkRow, workRows, workStatus } from './work-view.js';
import { createOnboarding, renderOnboarding } from './onboarding.js';
import { blueprintLabels, commandLabels } from './blueprint-copy.js';
import { missionAlternative } from '../mission-routes.js';
import { auriCharacter, connectAuri } from './auri-companion.js';
import { pulseAuri, runAuri } from './auri-controller.js';
import { auriControls, auriDraftCopy, auriLabels, auriNames } from './auri-copy.js';
import { customerReturnPath } from '../customer-return.js';
import { renderRoadmap, roadmapLabels } from './roadmap-view.js';
import { eligibleMissions, missionGuide, missionState } from '../roadmap.js';
import { renderMenuDrafts } from './menu-drafts.js';
import { copy, capabilityNames } from './i18n.js';
import { connectedRows, connectedList, dashCopy, navCopy, navIcon } from './dashboard-view.js';
import { mountAuriChat, chatCopy } from './auri-chat.js';
import { renderCommandHome } from './command-home.js';
import { simulate, capabilities, diagnose } from '../growth-engine.js';
const app=document.querySelector('#app'),notice=document.querySelector('#notice');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const requestedLanguage=new URLSearchParams(location.search).get('lang');
let lang=Object.hasOwn(copy,requestedLanguage)?requestedLanguage:(localStorage.getItem('aura-hub-language')||localStorage.getItem('aura-lang-choice-v3')||'en');if(!Object.hasOwn(copy,lang))lang='en';
function saveLanguage(value){
 localStorage.setItem('aura-hub-language',value);
 if(['en','tr','ar'].includes(value))localStorage.setItem('aura-lang-choice-v3',value);
 const url=new URL(location.href);
 if(value==='en')url.searchParams.delete('lang');else url.searchParams.set('lang',value);
 history.replaceState(history.state,'',url.pathname+url.search+url.hash);
}
let me=null,workspaces=[],workspace=null,page='home',editing=false,mode='myself',step=0,draft={},result=null,scenarioInputs=null,saveQueue=Promise.resolve(),saveTimer;
let route=location.pathname.split('/')[2]||'',flowToken=new URLSearchParams(location.hash.slice(1)).get('token')||'';
const returnPath=['login','signup','forgot'].includes(route)?customerReturnPath(new URLSearchParams(location.search).get('next'),''):customerReturnPath(location.pathname+location.search,'');
const authQuery=returnPath?'?'+new URLSearchParams({next:returnPath}):'';
let authCapabilities={}, firstLogin=null;
function resumeShop(){
 if(!returnPath||returnPath==='/hub'||returnPath===location.pathname+location.search)return false;
 location.replace(returnPath);
 return true;
}
if(flowToken)history.replaceState(null,'',location.pathname+location.search);
const t=k=>k==='menuDrafts'?({en:'Menu drafts',ar:'مسودات القوائم',tr:'Menü taslakları',fr:'Brouillons de menus'})[lang]:copy[lang][k]||copy.en[k]||k,cap=k=>capabilityNames[lang][k]||capabilities.find(c=>c.id===k)?.service||k;
const toast=message=>{notice.textContent=message;notice.classList.add('visible');setTimeout(()=>notice.classList.remove('visible'),7000);};
const setupScope='setup';
let disconnectAuri=()=>{},disconnectDesk=()=>{};
const auriLevel=()=>workspace?.auri?.level||1;
const auriPreference=()=>workspace?.auriPreferences||{name:'Auri',hidden:false};
const auriSessions=new Map();
let auriVoice=null,setupAuriName='',setupDeferred=[];
const guideCharacter=()=>auriCharacter(3,{variant:'guide'});
const guideThreads=new Map();
function guideAt(host,scope,context){
 const key=me.id+':'+(workspace?.organization.id||'new');
 if(!guideThreads.has(key))guideThreads.set(key,[]);
 mountGuide(host,{lang,esc,api,turns:guideThreads.get(key),scope,context});
}
const brandMarkup='<span class="hub-brand-tile"><img class="hub-brand-logo" src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span>';
const robot=()=>auriCharacter(auriLevel());
function bindAuri(host,scope){
 disconnectAuri();
 disconnectAuri=connectAuri(host,scope,{idle:auriControls(lang).ready,...auriLabels(lang)});
}
async function finishSetup(){
 await runAuri(setupScope,'working',async()=>{
  await persistProfile();
  if(mode==='auri'&&setupAuriName.trim())await updateAuriPreferences({name:setupAuriName});
 });
 setupAuriName='';
 setupDeferred=[];
 editing=false;
 navigate('home',{},true,false);
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
function bindCommon(){document.querySelector('#language')?.addEventListener('change',async e=>{clearTimeout(saveTimer);if(editing&&workspace)await persistProfile();lang=e.target.value;saveLanguage(lang);render();});}
function render(){
 disconnectAuri();disconnectDesk();
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 app.setAttribute('aria-busy','false');
 if(!me||['verify','reset','forgot','invitation','confirm-email'].includes(route)){renderGate();return;}
 if(page==='onboarding'&&(!workspace||(!workspace.missions.length&&workspace.permissions.includes('profile:write')&&workspace.permissions.includes('roadmap:write')))){openFirstLogin();return;}
 if(editing){renderSetup();return;}
 renderShell();
}
const intakeKey=()=>`aura-intake:${me.id}:${workspace?.organization.id||'new'}`;
function openFirstLogin(){
 const key=intakeKey();
 if(!firstLogin){
  const initial=createOnboarding();
  if(workspace){initial.values={...workspace.profile};initial.phase='entry';}
  try{
   const saved=JSON.parse(sessionStorage.getItem(key));
   firstLogin=saved?{...initial,...saved,answered:new Set(saved.answered)}:initial;
  }catch{firstLogin=initial;}
 }
 renderOnboarding({
  app,state:firstLogin,lang,t,esc,robot:guideCharacter,
  guide:host=>guideAt(host,setupScope,()=>firstLogin?.values),
  header:`<header class="gate-header command-gate-header"><a href="${esc(link('home'))}" class="wordmark">${brandMarkup}</a>${languageControl()}</header>`,
  bind:()=>{bindCommon();bindAuri(document.querySelector('.auri-setup-character'),setupScope);},
  save:({busy,...state})=>{
   try{sessionStorage.setItem(key,JSON.stringify({...state,answered:[...state.answered]}));}catch{}
  },
  analyze:text=>api('/api/hub/onboarding/analyze','POST',{text}),
  complete:async(values,requestId)=>{
   const profile={...emptyProfile(),...values};
   const source=firstLogin.text.trim();
   const created=workspace
    ?await api(endpoint('missions'),'POST',{personalized:true,profile,lang,source})
    :await api('/api/hub/workspaces','POST',{profile,mode:'auri',requestId,personalized:true,lang,source});
   const next=await api('/api/hub/workspaces/'+created.id);
   workspace=next;
   if(!workspaces.some(org=>org.id===created.id))workspaces.push({...next.organization});
   try{sessionStorage.removeItem(key);}catch{}
   firstLogin=null;
   navigate('journey');
   pulseAuri(created.id,'success');
   if(created.planFallback)toast(dashCopy(lang).planFallback);
  },
 });
}
function gateFrame(content){app.innerHTML=`<header class="gate-header command-gate-header"><a href="/hub" class="wordmark">${brandMarkup}</a>${languageControl()}</header><main id="main" class="gate command-gate">${content}</main>`;bindCommon();}
async function renderGate(){
 if(route==='invitation'&&me){gateFrame(`<section class="panel">${robot()}<h1>${t('inviteAccept')}</h1><div id="invitation-content" role="status">…</div></section>`);try{const data=await api('/api/hub/invitations/preview','POST',{token:flowToken}),i=data.invitation;document.querySelector('#invitation-content').innerHTML=`<h2>${esc(i.business)}</h2><p>${esc(i.email)} · ${esc(t(i.role))}</p><p>${esc(i.message)}</p><p>${t('permissions')}: ${esc(i.permissions.join(', '))}</p><p>${esc(new Date(i.expiresAt*1000).toLocaleString(lang))}</p><p class="warning">${t('blocked')}</p><form id="accept-invitation"><label class="check"><input type="checkbox" name="consent" required>${t('recurringConsent')}</label><button class="primary">${t('inviteAccept')}</button></form>`;document.querySelector('#accept-invitation').onsubmit=async e=>{e.preventDefault();try{const r=await api('/api/hub/invitations/accept','POST',{token:flowToken,acceptInvitation:true,acceptRecurring:true,consentVersion:'seat-5-usd-month-v1'});flowToken='';toast(t('awaiting'));document.querySelector('#invitation-content').textContent=t('blocked');}catch(e){toast(e.message);}};}catch(e){document.querySelector('#invitation-content').textContent=e.message;document.querySelector('#invitation-content').append(Object.assign(document.createElement('a'),{href:'/hub/settings',textContent:t('settings')}));}return;}
 if(route==='confirm-email'){
  const copy=accountSettingsCopy(lang);
  gateFrame(`<section class="panel"><h1>${copy[13]}</h1><p role="status" data-confirm-result></p>${button('confirm','confirm-email')}<a href="/hub/login">${esc(t('signIn'))}</a></section>`);
  const action=document.querySelector('[data-action=confirm-email]'),status=document.querySelector('[data-confirm-result]');
  action.onclick=async()=>{
   action.disabled=true;
   try {
    const result=await api('/api/customer/confirm-email-change','POST',{token:flowToken});
    flowToken='';
    status.textContent=copy[result.complete?15:14];
   }catch(error){status.textContent=error.message;action.disabled=false;}
  };
  return;
 }
 if(route==='verify'){gateFrame(`<section class="panel">${robot()}<h1>${t('verify')}</h1><p id="verification-result" role="status"></p>${button('confirm','verify')}<a href="/hub">${t('brand')}</a></section>`);document.querySelector('[data-action="verify"]').onclick=async e=>{const confirmButton=e.target;confirmButton.disabled=true;try{await api('/api/customer/verify','POST',{token:flowToken});flowToken='';document.querySelector('#verification-result').textContent=t('verified');}catch(error){document.querySelector('#verification-result').textContent=error.message;confirmButton.disabled=false;}};return;}
 const signup=route==='signup',forgot=route==='forgot',reset=route==='reset';
 authScreen({signup,forgot,reset});
}
// ---- 2026 sign-in experience: Google first, Turnstile, email verification ----
const AL={
 en:{side:'Your business, one account.',sideSub:'Roadmap, services, shop orders and Auri — all in AuraHub.',b1:'Growth roadmap built with Auri',b2:'Track services, requests and approvals',b3:'NFC card and shop orders in one place',b4:'Invoices, deliveries and renewals',signInTab:'Sign in',signupTab:'Create account',hello:'Welcome back',helloSub:'Sign in to continue to AuraHub.',create:'Create your free account',createSub:'Takes less than a minute.',google:'Continue with Google',googleSoon:'Google sign-in is being set up — please use email for now.',or:'or with email',show:'Show',hide:'Hide',pwHint:'At least 12 characters. Use a short sentence you can remember.',weak:'Too short',ok:'Good',strong:'Strong',human:'Please complete the human verification check.',forgotQ:'Forgot password?',back:'Back to website',help:'Need help?',checkTitle:'Check your inbox',checkSub:'We sent a verification link to',checkTip:'Open the email and tap the link to verify your account. Check spam if you do not see it.',resend:'Resend email',resent:'Verification email sent again.',wait:'You can resend in',continueHub:'Continue to AuraHub',terms:'I accept the AuraDigital account conditions.',forgotTitle:'Reset your password',forgotSub:'Enter your email and we will send you a reset link.',resetTitle:'Choose a new password',secure:'Protected by Cloudflare'},
 tr:{side:'İşletmeniz, tek hesap.',sideSub:'Yol haritası, hizmetler, mağaza siparişleri ve Auri — hepsi AuraHub’da.',b1:'Auri ile büyüme yol haritası',b2:'Hizmet, talep ve onayları takip edin',b3:'NFC kart ve mağaza siparişleri tek yerde',b4:'Faturalar, teslimatlar ve yenilemeler',signInTab:'Giriş yap',signupTab:'Hesap oluştur',hello:'Tekrar hoş geldiniz',helloSub:'AuraHub’a devam etmek için giriş yapın.',create:'Ücretsiz hesabınızı oluşturun',createSub:'Bir dakikadan kısa sürer.',google:'Google ile devam et',googleSoon:'Google ile giriş hazırlanıyor — şimdilik e-posta kullanın.',or:'veya e-posta ile',show:'Göster',hide:'Gizle',pwHint:'En az 12 karakter. Hatırlayabileceğiniz kısa bir cümle kullanın.',weak:'Çok kısa',ok:'İyi',strong:'Güçlü',human:'Lütfen insan doğrulamasını tamamlayın.',forgotQ:'Şifremi unuttum',back:'Siteye dön',help:'Yardım',checkTitle:'Gelen kutunuzu kontrol edin',checkSub:'Doğrulama bağlantısını gönderdik:',checkTip:'E-postayı açıp bağlantıya dokunun. Görmüyorsanız spam klasörüne bakın.',resend:'Tekrar gönder',resent:'Doğrulama e-postası tekrar gönderildi.',wait:'Tekrar gönderme:',continueHub:'AuraHub’a devam et',terms:'AuraDigital hesap koşullarını kabul ediyorum.',forgotTitle:'Şifrenizi sıfırlayın',forgotSub:'E-postanızı girin, sıfırlama bağlantısı gönderelim.',resetTitle:'Yeni şifre belirleyin',secure:'Cloudflare ile korunuyor'},
 ar:{side:'عملك، حساب واحد.',sideSub:'الخطة والخدمات وطلبات المتجر وأوري — كلها في AuraHub.',b1:'خطة نمو مع أوري',b2:'تابع الخدمات والطلبات والموافقات',b3:'طلبات بطاقات NFC والمتجر في مكان واحد',b4:'الفواتير والتسليمات والتجديدات',signInTab:'تسجيل الدخول',signupTab:'إنشاء حساب',hello:'مرحباً بعودتك',helloSub:'سجّل الدخول للمتابعة إلى AuraHub.',create:'أنشئ حسابك المجاني',createSub:'يستغرق أقل من دقيقة.',google:'المتابعة باستخدام Google',googleSoon:'تسجيل الدخول عبر Google قيد الإعداد — استخدم البريد الآن.',or:'أو عبر البريد الإلكتروني',show:'إظهار',hide:'إخفاء',pwHint:'12 حرفاً على الأقل. استخدم جملة قصيرة تتذكرها.',weak:'قصيرة جداً',ok:'جيدة',strong:'قوية',human:'يرجى إكمال التحقق البشري.',forgotQ:'نسيت كلمة المرور؟',back:'العودة إلى الموقع',help:'مساعدة',checkTitle:'تحقق من بريدك',checkSub:'أرسلنا رابط التحقق إلى',checkTip:'افتح الرسالة واضغط الرابط لتأكيد حسابك. تحقق من الرسائل غير المرغوبة.',resend:'إعادة الإرسال',resent:'تمت إعادة إرسال رسالة التحقق.',wait:'يمكنك الإعادة بعد',continueHub:'المتابعة إلى AuraHub',terms:'أوافق على شروط حساب AuraDigital.',forgotTitle:'إعادة تعيين كلمة المرور',forgotSub:'أدخل بريدك وسنرسل لك رابطاً.',resetTitle:'اختر كلمة مرور جديدة',secure:'محمي بواسطة Cloudflare'},
 fr:{side:'Votre entreprise, un seul compte.',sideSub:'Feuille de route, services, commandes et Auri — tout dans AuraHub.',b1:'Feuille de route avec Auri',b2:'Suivez services, demandes et validations',b3:'Cartes NFC et commandes au même endroit',b4:'Factures, livraisons et renouvellements',signInTab:'Connexion',signupTab:'Créer un compte',hello:'Bon retour',helloSub:'Connectez-vous pour continuer vers AuraHub.',create:'Créez votre compte gratuit',createSub:'Moins d’une minute.',google:'Continuer avec Google',googleSoon:'La connexion Google arrive bientôt — utilisez l’e-mail pour le moment.',or:'ou par e-mail',show:'Afficher',hide:'Masquer',pwHint:'Au moins 12 caractères. Une courte phrase facile à retenir.',weak:'Trop court',ok:'Bien',strong:'Fort',human:'Veuillez compléter la vérification humaine.',forgotQ:'Mot de passe oublié ?',back:'Retour au site',help:'Aide',checkTitle:'Vérifiez votre boîte mail',checkSub:'Nous avons envoyé un lien de vérification à',checkTip:'Ouvrez l’e-mail et touchez le lien. Pensez aux spams.',resend:'Renvoyer',resent:'E-mail de vérification renvoyé.',wait:'Renvoi possible dans',continueHub:'Continuer vers AuraHub',terms:'J’accepte les conditions du compte AuraDigital.',forgotTitle:'Réinitialiser le mot de passe',forgotSub:'Saisissez votre e-mail pour recevoir un lien.',resetTitle:'Choisissez un nouveau mot de passe',secure:'Protégé par Cloudflare'}
};
const al=k=>(AL[lang]||AL.en)[k]||AL.en[k];
let tsToken='',tsWidget=null;
function mountTurnstile(){
 const key=authCapabilities.turnstile,el=document.querySelector('#ad-turnstile');tsToken='';
 if(!key||!el)return;
 const render=()=>{try{tsWidget=window.turnstile.render(el,{sitekey:key,theme:'auto',language:lang,callback:v=>{tsToken=v;},'expired-callback':()=>{tsToken='';},'error-callback':()=>{tsToken='';}});}catch{}};
 if(window.turnstile)return render();
 let sc=document.querySelector('script[data-turnstile]');
 if(!sc){sc=document.createElement('script');sc.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';sc.async=true;sc.defer=true;sc.dataset.turnstile='1';document.head.appendChild(sc);}
 sc.addEventListener('load',render,{once:true});
}
function resetTurnstile(){tsToken='';try{if(window.turnstile&&tsWidget!==null)window.turnstile.reset(tsWidget);}catch{}}
const googleIcon='<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function authScreen({signup,forgot,reset}){
 const mode=reset?'reset':forgot?'forgot':signup?'signup':'login';
 const title=mode==='login'?al('hello'):mode==='signup'?al('create'):mode==='forgot'?al('forgotTitle'):al('resetTitle');
 const sub=mode==='login'?al('helloSub'):mode==='signup'?al('createSub'):mode==='forgot'?al('forgotSub'):al('pwHint');
 const inp=(name,type,label,extra,icon)=>`<label class="ad-field"><span>${esc(label)}</span><span class="ad-input">${icon}<input name="${name}" type="${type}" ${extra}></span></label>`;
 const ic={user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',mail:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="m3 6 9 7 9-7"/></svg>',lock:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'};
 const pw=mode==='forgot'?'':`<label class="ad-field"><span>${esc(t(reset?'newPassword':'password'))}</span><span class="ad-input">${ic.lock}<input name="password" type="password" required ${mode!=='login'?'minlength="12" ':''}maxlength="72" autocomplete="${mode==='login'?'current-password':'new-password'}"><button type="button" class="ad-eye" data-eye aria-pressed="false">${al('show')}</button></span>${mode!=='login'?`<span class="ad-hint" id="ad-pw-hint">${al('pwHint')}</span><span class="ad-meter" aria-hidden="true"><i></i></span>`:''}</label>`;
 const tabs=mode==='login'||mode==='signup'?`<nav class="ad-tabs" aria-label="Account"><a href="/hub/login${authQuery}" ${mode==='login'?'aria-current="page"':''}>${al('signInTab')}</a><a href="/hub/signup${authQuery}" ${mode==='signup'?'aria-current="page"':''}>${al('signupTab')}</a></nav>`:'';
 const googleBlock=(mode==='login'||mode==='signup')&&authCapabilities.google?`<button type="button" class="ad-google" data-google>${googleIcon}<span>${al('google')}</span></button><div class="ad-or"><span>${al('or')}</span></div>`:'';
 const termsBox=mode==='login'||mode==='signup'?`<label class="ad-check"><input type="checkbox" name="terms" ${mode==='signup'?'required':''}><span>${al('terms')}</span></label>`:'';
 app.innerHTML=`<div class="ad-auth">
 <aside class="ad-side"><a href="/" class="ad-logo"><span class="hub-brand-tile"><img src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span></a>
  <div class="ad-side-body"><h2>${al('side')}</h2><p>${al('sideSub')}</p><ul>${['b1','b2','b3','b4'].map(k=>`<li><span aria-hidden="true">✓</span>${al(k)}</li>`).join('')}</ul></div>
  <div class="ad-side-foot">${robot()}<span>info@auradigitalworks.com · +90 538 550 76 74</span></div></aside>
 <main id="main" class="ad-main"><div class="ad-top"><a href="/" class="ad-logo ad-logo-sm"><span class="hub-brand-tile"><img src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span></a>${languageControl()}</div>
  <section class="ad-card">${tabs}<h1>${esc(title)}</h1><p class="ad-sub">${esc(sub)}</p>${googleBlock}
   <form id="auth-form" novalidate>${mode==='signup'?inp('name','text',t('name'),'required minlength="2" maxlength="100" autocomplete="name"',ic.user):''}${mode==='reset'?'':inp('email','email',t('email'),'required maxlength="254" autocomplete="email" inputmode="email"',ic.mail)}${pw}
    ${mode==='login'?(authCapabilities.email?`<a class="ad-forgot" href="/hub/forgot${authQuery}">${al('forgotQ')}</a>`:`<a class="ad-forgot" href="https://wa.me/905385507674?text=${encodeURIComponent('AuraHub password help')}" rel="noopener">${esc(({en:'Forgot your password? Message us on WhatsApp',tr:'Şifrenizi mi unuttunuz? WhatsApp’tan yazın',ar:'نسيت كلمة المرور؟ راسلنا على واتساب',fr:'Mot de passe oublié ? Écrivez-nous sur WhatsApp'})[lang]||'Forgot your password? Message us on WhatsApp')}</a>`):''}
    ${termsBox}
    ${authCapabilities.turnstile&&mode!=='reset'?'<div id="ad-turnstile" class="ad-turnstile"></div>':''}
    <p class="form-error ad-error" role="alert"></p>
    <button type="submit" class="ad-submit">${esc(t(reset?'reset':forgot?'continue':signup?'signup':'signIn'))} →</button>
   </form>
   ${mode==='forgot'||mode==='reset'?`<a class="ad-switch" href="/hub/login${authQuery}">← ${al('signInTab')}</a>`:''}
   ${authCapabilities.turnstile?`<p class="ad-secure">🔒 ${al('secure')}</p>`:''}
  </section>
  <footer class="ad-foot"><a href="/">← ${al('back')}</a><a href="/help">${al('help')}</a><a href="https://wa.me/905385507674">WhatsApp</a></footer>
 </main></div>`;
 bindCommon();mountTurnstile();
 const form=document.querySelector('#auth-form'),err=form.querySelector('[role="alert"]');
 const pwInput=form.querySelector('input[name="password"]');
 form.querySelector('[data-eye]')?.addEventListener('click',e=>{const b=e.currentTarget,shown=pwInput.type==='text';pwInput.type=shown?'password':'text';b.textContent=shown?al('show'):al('hide');b.setAttribute('aria-pressed',String(!shown));});
 if(pwInput&&mode!=='login')pwInput.addEventListener('input',()=>{const n=pwInput.value.length,m=form.querySelector('.ad-meter i'),h=form.querySelector('#ad-pw-hint');const lvl=n<12?1:n<16?2:3;m.style.width=Math.min(100,n/16*100)+'%';m.dataset.level=lvl;h.textContent=n?`${al(lvl===1?'weak':lvl===2?'ok':'strong')} · ${n}/12+`:al('pwHint');});
 document.querySelector('[data-google]')?.addEventListener('click',()=>{
  if(!authCapabilities.google){toast(al('googleSoon'));return;}
  const terms=form.querySelector('input[name="terms"]');
  if(terms&&!terms.checked){err.textContent=al('terms');terms.focus();return;}
  if(route==='invitation')toast(t('googleInvite'));
  location.assign('/api/customer/google/start?'+new URLSearchParams({acceptTerms:'true',...(returnPath?{next:returnPath}:{})}));
 });
 form.onsubmit=async e=>{
  e.preventDefault();err.textContent='';
  if(!form.checkValidity()){const bad=form.querySelector(':invalid');err.textContent=bad?.validationMessage||t('required');bad?.focus();return;}
  if(authCapabilities.turnstile&&mode!=='reset'&&!tsToken){err.textContent=al('human');return;}
  const b=form.querySelector('.ad-submit'),data=new FormData(form);b.disabled=true;
  try{
   if(forgot){await api('/api/customer/forgot-password','POST',{email:data.get('email'),turnstileToken:tsToken});toast(t('resetSent'));resetTurnstile();}
   else if(reset){await api('/api/customer/reset-password','POST',{token:flowToken,password:data.get('password')});location.assign('/hub/login'+authQuery);}
   else{
    await api('/api/customer/'+(signup?'register':'login'),'POST',{name:data.get('name'),email:data.get('email'),password:data.get('password'),acceptTerms:data.has('terms'),turnstileToken:tsToken});
    if(signup&&authCapabilities.email){const sent=await api('/api/customer/send-verification','POST',{}).then(()=>true).catch(()=>false);if(sent){verifyPending(String(data.get('email')||''));return;}}
    if(route!=='invitation'&&resumeShop())return;
    if(route!=='invitation'){const dest=returnPath&&returnPath.startsWith('/hub')?returnPath:'/hub';history.replaceState(null,'',dest);}
    route=route==='invitation'?'invitation':'';await load();
   }
  }catch(error){err.textContent=error.message;resetTurnstile();}
  finally{b.disabled=false;}
 };
}
function verifyPending(email){
 app.innerHTML=`<div class="ad-auth ad-auth-single"><main id="main" class="ad-main"><div class="ad-top"><a href="/" class="ad-logo ad-logo-sm"><span class="hub-brand-tile"><img src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span></a>${languageControl()}</div>
 <section class="ad-card ad-center"><div class="ad-mail" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><path d="m3 6 9 7 9-7"/></svg></div><h1>${al('checkTitle')}</h1><p class="ad-sub">${al('checkSub')} <strong>${esc(email)}</strong></p><p class="ad-sub">${al('checkTip')}</p>
 <button type="button" class="ad-google" data-resend>${al('resend')}</button><p class="ad-note" id="ad-resend-note" role="status"></p><button type="button" class="ad-submit" data-continue>${al('continueHub')} →</button></section></main></div>`;
 bindCommon();
 const btn=document.querySelector('[data-resend]'),note=document.querySelector('#ad-resend-note');
 let wait=30;const tick=()=>{if(wait>0){btn.disabled=true;note.textContent=`${al('wait')} ${wait}s`;wait--;setTimeout(tick,1000);}else{btn.disabled=false;note.textContent='';}};tick();
 btn.onclick=async()=>{btn.disabled=true;try{await api('/api/customer/send-verification','POST',{});note.textContent=al('resent');}catch(e){note.textContent=e.message;}wait=30;setTimeout(tick,1500);};
 document.querySelector('[data-continue]').onclick=async()=>{if(resumeShop())return;route='';await load();};
}
const emptyProfile=()=>({name:'',industry:'other',country:'',city:'',stage:'',website:'',tools:'',acquisition:'',difficulties:'',goals:'',timeline:'',industryDetails:'',budget:null,currency:'USD',capabilities:[]});
function profileField(k){
 if(k==='roadmapPreview'){
  const proposed=diagnose(draft).missions.map(m=>({...m,capability:m.id,status:'planned'}));
  const labels=blueprintLabels(lang);
  const first=eligibleMissions(proposed,draft).slice(0,3);
  return `<fieldset><legend>${esc(roadmapLabels(lang).priority)}</legend>${first.length?first.map(m=>`<label class="check">
   <input type="checkbox" name="deferredMission" value="${esc(m.id)}" ${setupDeferred.includes(m.id)?'checked':''}>
   ${esc(labels.later)} · ${esc(cap(m.id))}</label>`).join(''):`<p>${esc(t('empty'))}</p>`}</fieldset>`;
 }
 if(k==='auriName')return field(k,auriControls(lang).name,setupAuriName,'text','maxlength="24"');
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
 const setupKeys=workspace?profileKeys:mode==='auri'?['name','industry','industryDetails','goals','capabilities','auriName','roadmapPreview']:['name','industry','goals','budget','currency','website','capabilities'];
 app.innerHTML=`<header class="gate-header command-gate-header"><a href="/hub" class="wordmark">${brandMarkup}</a>${languageControl()}</header><main class="setup command-setup" id="main"><div class="setup-heading"><p class="eyebrow">Aura Command</p><h1>${choosing?commandLabels(lang).onboarding:esc(draft.name||t('profile'))}</h1><p>${choosing?t('choose'):t(mode==='auri'?'auriText':'myselfText')}</p></div>${choosing?`<div class="mode-grid"><button class="mode-card" data-mode="myself"><span class="mode-icon">↗</span><h2>${t('myself')}</h2><p>${t('myselfText')}</p><span>${t('continue')} →</span></button><button class="mode-card dark" data-mode="auri">${robot()}<h2>${t('auri')}</h2><p>${t('auriText')}</p><span>${t('continue')} →</span></button></div>`:`<section class="panel profile-panel"><div class="panel-bar"><span>${mode==='auri'?`AURI · ${step+1}/${setupKeys.length}`:t('profile')}</span><span id="save-state" role="status"></span>${button('switchMode','switch-mode',true)}</div>${mode==='auri'?`<div class="auri-onboarding">${auriCharacter(auriLevel())}<p data-auri-status role="status"></p></div>`:''}<form id="profile-form" class="${mode==='auri'?'guided':'form-grid'}">${(mode==='auri'?[setupKeys[step]]:setupKeys).map(profileField).join('')}<div class="actions full">${mode==='auri'?button('back','back-step',true,step===0)+button('skip','skip-step',true,step===0):''}<button class="primary" type="submit">${t(mode==='auri'&&step<setupKeys.length-1?'continue':'save')}</button>${workspace?button('home','leave-setup',true):''}</div><p class="form-error full" role="alert"></p></form></section>`}</main>`;
 bindCommon();document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;editing=true;step=0;setupAuriName='';setupDeferred=[];render();});
 if(choosing)return;
 const form=document.querySelector('#profile-form');
 const avatar=document.querySelector('.auri-onboarding');
 if(avatar){bindAuri(avatar,setupScope);pulseAuri(setupScope,'listening',950);}
 const collect=()=>{const data=new FormData(form);if(data.has('auriName'))setupAuriName=data.get('auriName');if(form.querySelector('[name=deferredMission]'))setupDeferred=data.getAll('deferredMission');for(const k of profileKeys){if(k==='capabilities'){if(form.querySelector('[name="capabilities"]'))draft.capabilities=data.getAll(k);}else if(data.has(k))draft[k]=k==='budget'?(data.get(k)===''?null:Number(data.get(k))):data.get(k);}};
 form.addEventListener('input',()=>{collect();if(!workspace)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>{persistProfile().catch(e=>toast(e.message));},1000);});
 form.addEventListener('change',e=>{collect();if(e.target.name==='industry'&&mode==='myself'){clearTimeout(saveTimer);(workspace?persistProfile():Promise.resolve()).then(render).catch(e=>toast(e.message));}});
 form.onsubmit=async e=>{e.preventDefault();collect();clearTimeout(saveTimer);const b=form.querySelector('[type="submit"]');b.disabled=true;try{if(mode==='auri'&&step<setupKeys.length-1){step++;render();}else{await finishSetup();}}catch(error){form.querySelector('[role="alert"]').textContent=error.message;b.disabled=false;}};
 document.querySelector('[data-action="switch-mode"]').onclick=async()=>{collect();clearTimeout(saveTimer);mode=mode==='auri'?'myself':'auri';try{if(workspace&&draft.name.trim())await persistProfile();render();}catch(e){toast(e.message);}};
 for(const [action,delta]of [['back-step',-1],['skip-step',1]])document.querySelector(`[data-action="${action}"]`)?.addEventListener('click',async()=>{collect();clearTimeout(saveTimer);try{if(workspace&&draft.name.trim())await persistProfile();if(delta>0&&step===setupKeys.length-1){await finishSetup();return;}step=Math.max(0,step+delta);render();}catch(e){toast(e.message);}});
 document.querySelector('[data-action="leave-setup"]')?.addEventListener('click',async()=>{collect();clearTimeout(saveTimer);try{await persistProfile();navigate('home',{},false,false);await loadWorkspace();}catch(e){toast(e.message);}});
}
function persistProfile(){
 if(!draft.name.trim())return Promise.resolve();
 const snapshot=structuredClone(draft),selectedMode=mode;
 const deferredMissions=selectedMode==='auri'?setupDeferred.filter(id=>diagnose(snapshot).missions.some(m=>m.id===id)):[];
 const job=saveQueue.catch(()=>{}).then(async()=>{
  const status=document.querySelector('#save-state');if(status)status.textContent=t('saving');
  if(!workspace){const created=await api('/api/hub/workspaces','POST',{profile:snapshot,mode:selectedMode,deferredMissions});workspace=await api('/api/hub/workspaces/'+created.id);workspaces.push({id:created.id,name:snapshot.name,owner:true});}
  else {await api(endpoint('profile'),'PUT',{profile:snapshot,mode:selectedMode,version:workspace.organization.version});workspace.organization.version++;workspace.profile=snapshot;workspace.organization.mode=selectedMode;workspace.organization.name=snapshot.name;}
  if(status)status.textContent=t('saved');
 });saveQueue=job;return job;
}
let roadmapView='tree',selectedMission=null,workspaceSwitch=null;
const requestDrafts=new Map();
const navigation=['home','journey','services','requests','assistant'];
const pageGroup={tasks:'journey',projects:'services',websites:'services',hosting:'services',invoices:'orders'};
const moreNavigation=['profile','simulator','menuDrafts','projects','websites','hosting','files','reports','invoices','rewards','team','support'];
const link=(target,params)=>hubLink(target,workspace?.organization.id,params);
const requestLink=(service='',task='')=>link('requests',{new:'1',service,task});
let query=new URLSearchParams(location.search);
function syncLocation(){
 ({page,query}=currentHubLocation());
 selectedMission=query.get('task');
}
function navigate(target,params,replace=false,doRender=true){
 history[replace?'replaceState':'pushState'](null,'',link(target,params));
 syncLocation();
 editing=false;
 if(doRender){render();document.querySelector('#main')?.focus();}
}
window.addEventListener('popstate',()=>{if(me){editing=false;firstLogin=null;void load();}});
function renderShell(){
 window.scrollTo({top:0,left:0,behavior:'instant'});
 const labels=hubLabels(lang), l=roadmapLabels(lang), nv=navCopy(lang);
 const active=(pageGroup[page]||page);
 const can=permission=>!workspace||workspace.permissions.includes(permission);
 const labelOf=p=>p==='home'?nv.home:p==='services'?serviceLabels[lang][0]:p==='requests'?labels.requests:p==='assistant'?labels.assistant:p==='journey'?labels.journey:nv[p]||labels[p]||l[p]||t(p);
 const hrefOf=p=>p==='orders'?'/account':link(p);
 const navItem=(p,mobile=false)=>`<a class="nav-item ${active===p?'active':''}" data-tip="${esc(labelOf(p))}" href="${esc(hrefOf(p))}"
  data-page="${p}" ${mobile?`data-mobile-page="${p}"`:''} ${active===p?'aria-current="page"':''}>
  ${navIcon(p)}<span>${esc(labelOf(p))}</span></a>`;
 // Grouped navigation: one place for every part of the business.
 const groups=[
  [nv.groups[0],['home']],
  [nv.groups[1],['journey','assistant']],
  [nv.groups[2],['services','requests',...(workspace&&authCapabilities.menuDrafts?['menuDrafts']:[]),'orders']],
  [nv.groups[3],[...(workspace&&can('profile:write')?['profile']:[]),...(workspace?['team']:[]),'settings']],
 ];
 const mobileMain=['home','journey','services'];
 const sheetItems=groups.flatMap(([,items])=>items).filter(p=>!mobileMain.includes(p));
 const title=page==='services'?serviceLabels[lang][0]:page==='journey'?commandLabels(lang).vision:labelOf(page);
 const initials=String(workspace?.organization.name||me.name||'A').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
 app.innerHTML=`<div class="shell growth-shell growth-active aurahub-shell hx-shell wx-shell ${page==='home'&&workspace?.missions.length?'wx-home':''} ${page==='services'?'service-shell':''}"><aside class="sidebar" id="sidebar">
 <a href="${esc(link('home'))}" class="wordmark command-wordmark">${brandMarkup}</a>
 <nav aria-label="AuraHub">${groups.map(([name,items])=>`<p class="hx-nav-group">${esc(name)}</p>${items.map(p=>navItem(p)).join('')}`).join('')}</nav>
 <div class="hx-side-foot"><span class="hx-avatar small" aria-hidden="true">${esc(String(me.name||'?')[0].toUpperCase())}</span><span><strong>${esc(me.name)}</strong><small>${esc(me.email)}</small></span></div></aside>
 <div class="workspace"><header class="topbar growth-topbar hub-topbar">
 <a class="hub-mobile-brand wordmark" href="${esc(link('home'))}">${brandMarkup}</a>
 ${workspace?`<div class="hx-business"><span class="hx-avatar" aria-hidden="true">${esc(initials)}</span>
 <label class="field workspace-picker"><span class="sr-only">${t('businessName')}</span>
 <select id="workspace-select" aria-label="${t('businessName')}">${workspaces.map(o=>`<option value="${esc(o.id)}" ${o.id===workspace.organization.id?'selected':''}>${esc(o.id===workspace.organization.id?workspace.organization.name:o.name)}</option>`).join('')}</select></label></div>`:''}
 <div class="hx-topbar-title"><strong>${esc(title)}</strong></div>
 ${workspace&&can('roadmap:write')?`<a class="growth-secondary hx-top-action" href="${esc(requestLink())}">＋ <span>${esc(nv.newRequest)}</span></a>`:''}
 ${workspace&&can('auri:use')?`<button type="button" class="wx-auri-btn" data-ax-open aria-controls="ax-drawer" aria-expanded="false">${navIcon('assistant')}<span>${esc(labels.assistant)}</span></button>`:''}
 <details class="growth-account"><summary aria-label="${esc(t('profile'))}">${hubIcon('profile')}</summary>
 <div class="growth-account-menu"><strong>${esc(me.name)}</strong>${languageControl()}
 ${navItem('settings')}${workspace?navItem('profile')+navItem('invoices'):''}${button('logout','logout',true)}</div></details></header>
 <main id="main" tabindex="-1"><div class="page-heading"><h1>${page==='home'&&(!workspace||!workspace.missions.length)
  ?`${esc(labels.welcome)} <span>AuraHub</span>`:page==='journey'&&lang==='en'?'Growth <span>Vision</span>':esc(title)}</h1>
 ${['services','requests'].includes(page)&&workspace?.permissions.includes('roadmap:write')&&!query.has('new')?`<a class="growth-secondary" href="${esc(requestLink())}">＋ ${esc(l.request)}</a>`:''}</div>
 ${!me.verified&&authCapabilities.email?`<aside class="verification"><p>${t('verifyLater')}</p>${button('sendVerification','send-verification',true)}</aside>`:''}
 <div id="page-content"></div></main>
 <nav class="command-bottom-nav" aria-label="AuraHub">${navItem('home',true)}${navItem('journey',true)}${workspace&&can('auri:use')?`<button type="button" class="nav-item wx-bottom-auri" data-ax-open aria-controls="ax-drawer">${navIcon('assistant')}<span>Auri</span></button>`:''}${navItem('services',true)}
 <button type="button" class="nav-item hx-more" data-hx-more aria-expanded="false" aria-controls="hx-sheet">${navIcon('more')}<span>${esc(nv.more)}</span></button></nav>
 <div class="hx-sheet" id="hx-sheet" hidden><div class="hx-sheet-panel" role="dialog" aria-modal="true" aria-label="${esc(nv.more)}">
 <header><strong>${esc(nv.more)}</strong><button type="button" class="hx-sheet-close" data-hx-close aria-label="${esc(nv.close)}">✕</button></header>
 <nav aria-label="${esc(nv.more)}">${sheetItems.map(p=>navItem(p)).join('')}</nav></div></div>
 </div>
 <aside class="ax-drawer" id="ax-drawer" hidden aria-label="Auri"><header class="ax-head"><span class="ax-avatar" aria-hidden="true"><img src="/media/auri/level-${auriLevel()}.webp" alt="" width="44" height="44"></span>
 <span class="ax-head-text"><strong>Auri</strong><small><i class="ax-online" aria-hidden="true"></i>${esc(chatCopy(lang).status)}</small></span>
 <button type="button" class="ax-icon-btn" data-ax-reset>${esc(chatCopy(lang).clear)}</button><button type="button" class="ax-icon-btn" data-ax-close aria-label="${esc(nv.close)}">✕</button></header>
 <div class="ax-body" data-ax-body></div></aside><div class="ax-scrim" data-ax-close hidden></div></div>`;
 bindCommon();
 document.querySelectorAll('[data-ax-open]').forEach(b=>b.addEventListener('click',()=>openAuri()));
 document.querySelectorAll('[data-ax-close]').forEach(b=>b.addEventListener('click',closeAuri));
 document.querySelector('[data-ax-reset]')?.addEventListener('click',()=>auriChat?.reset());
 if(auriOpen)openAuri();
 const sheet=document.querySelector('#hx-sheet'),more=document.querySelector('[data-hx-more]');
 const openSheet=open=>{sheet.hidden=!open;more.setAttribute('aria-expanded',String(open));if(open)sheet.querySelector('a')?.focus();};
 more.onclick=()=>openSheet(sheet.hidden);
 sheet.addEventListener('click',e=>{if(e.target===sheet||e.target.closest('[data-hx-close]')||e.target.closest('a'))openSheet(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.hidden){openSheet(false);more.focus();}},{once:true});
 document.querySelector('#workspace-select')?.addEventListener('change',async e=>{
  const select=e.target,id=select.value;
  select.disabled=true;workspaceSwitch=id;
  try{await loadWorkspace(id);}
  catch(error){select.value=workspace.organization.id;toast(error.message);}
  finally{workspaceSwitch=null;select.disabled=false;}
 });
 document.querySelector('[data-action="logout"]').onclick=async()=>{try{await api('/api/customer/logout','POST',{});location.assign('/hub/login');}catch(e){toast(e.message);}};
 document.querySelector('[data-action="send-verification"]')?.addEventListener('click',async e=>{e.target.disabled=true;try{await api('/api/customer/send-verification','POST',{});toast(t('saved'));}catch(e){toast(e.message);}finally{e.target.disabled=false;}});
 const host=document.querySelector('#page-content');
 renderPage().catch(e=>{if(host.isConnected)host.innerHTML=`<section class="panel"><p role="alert">${esc(e.message)}</p></section>`;});
}
const content=html=>{document.querySelector('#page-content').innerHTML=html;};
app.addEventListener('click',event=>{
 const anchor=event.target.closest('a[href]');
 if(!me||!anchor||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target||anchor.origin!==location.origin)return;
 const slug=anchor.pathname.split('/')[2]||'';
 if(!anchor.pathname.startsWith('/hub')||['login','signup','verify','forgot','reset','invitation','confirm-email'].includes(slug))return;
 const targetWorkspace=new URL(anchor.href).searchParams.get('workspace');
 if(targetWorkspace&&targetWorkspace!==workspace?.organization.id)return;
 event.preventDefault();
 history.pushState(null,'',anchor.pathname+anchor.search);
 syncLocation();editing=false;render();document.querySelector('#main')?.focus();
});
async function workSnapshot(){
 const [work,menus]=await Promise.all([
  api(endpoint('work')),
  api(endpoint('menu-drafts')).catch(error=>{if(error.status===503)return {drafts:[]};throw error;}),
 ]);
 return workRows(menus.drafts,work);
}
function buildCard(ui){
 const canBuild=!workspace||['profile:write','roadmap:write'].every(permission=>workspace.permissions.includes(permission));
 return `<section class="hub-hero hub-welcome"><div>
 <h2>${esc(ui.build)}</h2><p>${esc(ui.buildNote)}</p>
 ${canBuild?`<a class="growth-primary" href="${esc(link('onboarding'))}">${esc(ui.buildAction)} <span aria-hidden="true">→</span></a>`:''}
 <a class="growth-secondary" href="${esc(link('services'))}">${esc(serviceLabels[lang][0])}</a></div>
 <div class="hub-hero-art">${guideCharacter()}</div></section>${serviceShortcuts(lang,esc,link)}<div data-home-guide></div>`;
}
const EMPTY={
 en:{reqT:'No requests yet',reqP:'Requests you send to the AuraDigital team appear here with their status.',srvT:'No services yet',srvP:'Your websites, menus, email and other services appear here once they start.',build:'Build my roadmap',browse:'Browse services',shop:'Shop NFC cards',auriT:'Ask Auri anything',auriP:'Auri explains services and prices and suggests your best first step.'},
 tr:{reqT:'Henüz talep yok',reqP:'AuraDigital ekibine gönderdiğiniz talepler durumlarıyla burada görünür.',srvT:'Henüz hizmet yok',srvP:'Web siteleri, menüler, e-posta ve diğer hizmetleriniz başladığında burada görünür.',build:'Yol haritamı oluştur',browse:'Hizmetlere göz at',shop:'NFC kart mağazası',auriT:'Auri’ye sorun',auriP:'Auri hizmetleri ve fiyatları anlatır, en iyi ilk adımı önerir.'},
 ar:{reqT:'لا توجد طلبات بعد',reqP:'تظهر هنا الطلبات التي ترسلها إلى فريق AuraDigital مع حالتها.',srvT:'لا توجد خدمات بعد',srvP:'تظهر هنا مواقعك وقوائمك وبريدك وخدماتك الأخرى عند بدئها.',build:'ابنِ خطتي',browse:'تصفح الخدمات',shop:'متجر بطاقات NFC',auriT:'اسأل أوري',auriP:'يشرح أوري الخدمات والأسعار ويقترح أفضل خطوة أولى.'},
 fr:{reqT:'Aucune demande',reqP:'Vos demandes à l’équipe AuraDigital apparaissent ici avec leur statut.',srvT:'Aucun service',srvP:'Vos sites, menus, e-mails et autres services apparaissent ici dès leur démarrage.',build:'Créer ma feuille de route',browse:'Voir les services',shop:'Cartes NFC',auriT:'Demandez à Auri',auriP:'Auri explique services et prix et propose votre meilleure première étape.'}
};
const em=k=>(EMPTY[lang]||EMPTY.en)[k]||EMPTY.en[k];
function renderWorkEmpty(page){
 const req=page==='requests';
 content(`<section class="panel hub-empty"><div class="hub-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${req?'M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5':'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'}"/></svg></div><h2>${esc(em(req?'reqT':'srvT'))}</h2><p>${esc(em(req?'reqP':'srvP'))}</p><div class="hub-empty-actions"><a class="growth-primary" href="${esc(link('onboarding'))}">${esc(em('build'))} <span aria-hidden="true">→</span></a><a class="growth-secondary" href="/service-shop">${esc(em('browse'))}</a><a class="growth-secondary" href="/shop">${esc(em('shop'))}</a></div></section>${serviceShortcuts(lang,esc,link)}`);
}
function renderAuriEmpty(){
 content(`<section class="hub-auri-intro"><h2>${esc(em('auriT'))}</h2><p>${esc(em('auriP'))}</p></section><div data-home-guide></div>`);
 const scope=workspace?.organization.id||setupScope;
 guideAt(document.querySelector('[data-home-guide]'),scope,()=>workspace?.profile);
}
function renderBuildCard(ui){
 content(buildCard(ui));
 const scope=workspace?.organization.id||setupScope;
 bindAuri(document.querySelector('.hub-welcome'),scope);
 guideAt(document.querySelector('[data-home-guide]'),scope,()=>workspace?.profile);
}
function nextMission(){
 return eligibleMissions(workspace.missions,workspace.profile).find(m=>workspace.evidence?.[m.id]!=='pending');
}
function menuArtwork(menu){
 const products=menu.draft.categories.flatMap(category=>category.items).filter(product=>product.name).slice(0,4);
 return `<div class="hub-menu-device" aria-hidden="true"><strong>${esc(menu.name)}</strong>${products.map(product=>
  `<small><span>${esc(product.name)}</span><span>${esc(product.price)} ${esc(menu.draft.fields.currency||'')}</span></small>`).join('')}</div>`;
}
const missionTitle=m=>m.objective===m.service?cap(m.capability):m.objective;
async function home(){
 const ui=hubLabels(lang),host=document.querySelector('#page-content');
 if(!workspace?.missions.length){renderBuildCard(ui);return;}
 const [snapshot,connected]=await Promise.all([workSnapshot(),api(endpoint('connected')).catch(()=>null)]);
 if(!host.isConnected)return;
 const next=nextMission(),item=snapshot.attention[0],menu=item?.kind==='menu';
 renderCommandHome({host,lang,esc,link,me,workspace,snapshot,connected,missionTitle,
  canAsk:workspace.permissions.includes('auri:use'),canRequest:workspace.permissions.includes('roadmap:write'),
  auriImage:`<img src="/media/auri/level-${auriLevel()}.webp" alt="" width="72" height="72">`,
  onAsk:question=>openAuri(question),onLetAuri:letAuriDo,
  attention:item?{name:menu?ui.menuReady:item.name,label:menu?ui.reviewMenu:ui.openRequest,href:link(menu?'menuDrafts':'requests',menu?{draft:item.id}:{request:item.id})}:null,
  nextAction:next?{label:ui.continue,href:link('journey',{task:next.id})}:null,nextTitle:next?missionTitle(next):'',
  labels:{attention:ui.attention,next:ui.next}});
}
// Map a roadmap task to the request form's service list.
function serviceFor(capability){
 const c=String(capability||'');
 return /website|conversion|leads/.test(c)?'Web Design':/domain|hosting/.test(c)?'Hosting / Security':/email/.test(c)?'Business Email':/brand/.test(c)?'Branding':
  /menu/.test(c)?'AuraMenu':/seo|discovery/.test(c)?'SEO / Google Maps':/reviews/.test(c)?'NFC Card':/whatsapp|automation|followups/.test(c)?'AI & Automation':
  /ads/.test(c)?'Ad Management':/crm|analytics|retention/.test(c)?'Spinflow ERP':'Other';
}
// "Let Auri do it": Auri writes the brief from the business profile and opens
// the request to the team, ready to send.
function letAuriDo(mission){
 if(!mission)return;
 const p=workspace.profile||{};
 const brief=[`${missionTitle(mission)} — ${mission.reason||mission.description||''}`.trim(),
  mission.nextAction?`Next action: ${mission.nextAction}`:'',
  p.name?`Business: ${p.name}`:'',p.industry?`Industry: ${p.industry}${p.industryDetails?' ('+p.industryDetails+')':''}`:'',
  [p.city,p.country].filter(Boolean).join(', '),p.goals?`Goal: ${p.goals}`:'',p.website?`Website: ${p.website}`:''].filter(Boolean).join('\n');
 requestDrafts.set(workspace.organization.id,brief.slice(0,1700));
 navigate('requests',{new:'1',service:serviceFor(mission.capability||mission.id),task:mission.id});
}
// Auri side panel, available on every page of the hub.
let auriOpen=false,auriChat=null;
async function openAuri(initial){
 const drawer=document.querySelector('#ax-drawer');
 if(!drawer||!workspace)return;
 auriOpen=true;drawer.hidden=false;document.querySelector('.ax-scrim')?.removeAttribute('hidden');
 document.querySelectorAll('[data-ax-open]').forEach(b=>b.setAttribute('aria-expanded','true'));
 document.documentElement.classList.add('ax-is-open');
 const body=drawer.querySelector('[data-ax-body]');
 if(auriChat&&body.childElementCount&&body.dataset.workspace===workspace.organization.id){if(initial)auriChat.ask(initial);return;}
 body.innerHTML='<p class="ax-loading" role="status">…</p>';body.dataset.workspace=workspace.organization.id;
 const ui=hubLabels(lang);
 const [snapshot,connected]=await Promise.all([workSnapshot().catch(()=>({attention:[],progress:[],services:[],records:[],requests:[]})),api(endpoint('connected')).catch(()=>null)]);
 if(!drawer.isConnected)return;
 const next=workspace.missions.length?nextMission():null;
 const item=snapshot.attention[0],menu=item?.kind==='menu';
 auriChat=mountAuriChat({host:body,lang,esc,link,me,workspace,initial,
  data:{snapshot,connected,next,missionTitle,
   attention:item?{name:menu?ui.menuReady:item.name,label:menu?ui.reviewMenu:ui.openRequest,href:link(menu?'menuDrafts':'requests',menu?{draft:item.id}:{request:item.id})}:null,
   nextAction:next?{label:ui.continue,href:link('journey',{task:next.id})}:null},
  auriImage:`<img src="/media/auri/level-${auriLevel()}.webp" alt="" width="32" height="32">`,
  askAuri:workspace.permissions.includes('auri:use')?question=>askAuri(question):async()=>t('readOnly'),
  onBrief:(service,text)=>{requestDrafts.set(workspace.organization.id,text.slice(0,1700));closeAuri();navigate('requests',{new:'1',service});}});
}
function closeAuri(){
 auriOpen=false;
 const drawer=document.querySelector('#ax-drawer');if(drawer)drawer.hidden=true;
 document.querySelector('.ax-scrim')?.setAttribute('hidden','');
 document.querySelectorAll('[data-ax-open]').forEach(b=>b.setAttribute('aria-expanded','false'));
 document.documentElement.classList.remove('ax-is-open');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&auriOpen)closeAuri();});
async function myWork(){
 const ui=hubLabels(lang),host=document.querySelector('#page-content'),id=workspace.organization.id;
 const task=workspace.missions.find(m=>m.id===query.get('task'));
 if(query.has('new')&&workspace.permissions.includes('roadmap:write')){
  return renderRequestForm({host,lang,esc,me,workspace,service:query.get('service'),task:task?missionTitle(task):'',draft:requestDrafts.get(id)||'',back:link('requests'),submitted:request=>{requestDrafts.delete(id);navigate('requests',{request},true);}});
 }
 const serviceRecord=query.get('serviceRecord');
 if(serviceRecord&&page==='services'){
  host.innerHTML='<p role="status">…</p>';
  const record=await api(endpoint('work/'+encodeURIComponent(serviceRecord)));
  if(host.isConnected)renderServiceDetails({host,record,lang,esc,link,askLabel:workspace.permissions.includes('auri:use')?ui.assistant:null});
  return;
 }
 const request=query.get('request');
 const service=query.get('active');
 if(request){
  const record=await api(endpoint('work/'+encodeURIComponent(request)));
  if(!host.isConnected)return;
  host.innerHTML=`<section class="panel"><h2>${esc(record.name)}</h2><p>${esc(workStatus(record))}</p><p>${esc(record.id)}</p>
  <a class="secondary" href="${esc(link('services'))}">${esc(ui.services)}</a>
  ${workspace.permissions.includes('auri:use')?`<a class="secondary" href="${esc(link('assistant',{request}))}">${esc(ui.assistant)}</a>`:''}</section>`;
  return;
 }
 if(page==='services'&&!service){
  host.innerHTML='<p role="status">…</p>';
  const [{records},connected]=await Promise.all([api(endpoint('work')),api(endpoint('connected')).catch(()=>null)]);
  if(!host.isConnected)return;
  renderServices({host,records:records||[],lang,esc,link,profile:workspace.profile,missions:workspace.missions});
  const rows=connected?connectedRows(connected,lang):[];
  if(rows.length){
   const c=dashCopy(lang),section=document.createElement('section');
   section.className='hx-card hx-connected';
   section.innerHTML=`<header class="hx-card-head"><div><h2>${esc(c.connected)}</h2><p>${esc(c.connectedNote)}</p></div></header>${connectedList(rows,lang,esc)}`;
   host.prepend(section);
  }
  return;
 }
 const {attention,progress,services,requests}=await workSnapshot();
 if(!host.isConnected||workspace.organization.id!==id)return;
 if(service){
  const record=services.find(item=>String(item.id)===service);
  if(!record)throw new Error(ui.unavailable);
  host.innerHTML=`<section class="panel"><h2>${esc(record.name)}</h2><p>${esc(ui.active)}</p><a class="secondary" href="${esc(link('services'))}">${esc(ui.services)}</a></section>`;
  return;
 }
 const section=(name,empty,rows)=>`<section class="hub-work-section"><h2>${esc(name)}</h2>${rows||`<p class="hub-empty">${esc(empty)}</p>`}</section>`;
 if(!attention.length&&!requests.length){
  host.innerHTML=`<section class="panel hub-page-start hub-requests-empty"><img src="/media/auri/level-1.webp" alt="" width="80" height="80" loading="lazy"><div><h2>${esc(ui.requests)}</h2>
  <p>${esc(({en:'Your requests will appear here.',fr:'Vos demandes apparaîtront ici.',tr:'Talepleriniz burada görünecek.',ar:'ستظهر طلباتك هنا.'})[lang])}</p>
  <a class="growth-primary" href="${esc(link('services'))}">${esc(serviceLabels[lang][0])} →</a>
  ${authCapabilities.menuDrafts?`<a class="growth-secondary" href="${esc(link('menuDrafts'))}">${esc(t('menuDrafts'))}</a>`:''}</div></section>${serviceShortcuts(lang,esc,link,{profile:workspace.profile,missions:workspace.missions})}`;
  return;
 }
 const displayed=new Set([...attention,...progress].map(record=>record.id));
 const history=requests.filter(record=>!displayed.has(record.id));
 host.innerHTML=section(ui.attention,ui.emptyAttention,attention.map(record=>renderWorkRow(record,{ui,esc,link})).join(''))
  +section(ui.progress,ui.emptyProgress,progress.map(record=>renderWorkRow(record,{ui,esc,link})).join(''))
  +(history.length?section(hubLabels(lang).requests,'',history.map(record=>renderWorkRow(record,{ui,esc,link})).join('')):'')
  +(authCapabilities.menuDrafts?`<a href="${esc(link('menuDrafts'))}" class="growth-secondary">${esc(t('menuDrafts'))}</a>`:'');
}
async function renderPage(){
 const label=hubLabels(lang);
 if(page==='invoices')return content(`<section class="panel"><a class="primary" href="/account">${esc(t('orders'))}</a></section>`);
 if(page==='home')return home();
 if(page==='services'&&(query.has('offer')||!workspace)){
  const host=document.querySelector('#page-content');
  if(query.has('offer')){
   const found=renderServiceOffer({host,offer:query.get('offer'),lang,esc,link,
    canRequest:workspace?.permissions.includes('roadmap:write'),canSetUp:!workspace,askLabel:workspace?.permissions.includes('auri:use')?label.assistant:null});
   if(!found)throw new Error(label.unavailable);
  }else renderServices({host,records:[],lang,esc,link});
  return;
 }
 if(page==='settings')return renderAccountSettings({
  host:document.querySelector('#page-content'),user:me,lang,esc,t,api,link,workspace,
  canEmail:authCapabilities.email,canLinkGoogle:me.verified&&authCapabilities.google,
  onSignIn:()=>location.assign('/hub/login'),
  onLanguage:value=>{lang=value;saveLanguage(lang);render();},
  onNewWorkspace:()=>{stopAuriVoice();workspace=null;editing=true;draft=emptyProfile();mode='myself';step=0;renderSetup();},
 });
 if(!workspace&&page==='assistant')return renderAuriEmpty();
 if(!workspace&&(page==='services'||page==='requests'))return renderWorkEmpty(page);
 if(!workspace)return renderBuildCard(label);
 if(page==='services'||page==='requests')return myWork();
 if((page==='journey'||page==='onboarding')&&!workspace.missions.length)return renderBuildCard(label);
 if(page==='onboarding'){navigate('journey',{},true);return;}
 if(page==='profile'&&!workspace.permissions.includes('profile:write')){content(`<section class="panel"><h2>${esc(workspace.profile.name)}</h2><p>${t('readOnly')}</p><p>${esc(workspace.profile.goals)}</p></section>`);return;}
 if(page==='profile'){draft=structuredClone(workspace.profile);mode=workspace.organization.mode;step=0;editing=true;renderSetup();return;}
 if(page==='menuDrafts'&&!authCapabilities.menuDrafts){content(`<section class="panel hub-page-start"><div><h2>${esc(t('menuDrafts'))}</h2><p>${esc(({en:'Menu drafts are not available yet. Ask the team or Auri to prepare your menu.',tr:'Menü taslakları henüz kullanılamıyor. Menünüzü hazırlamak için ekibe veya Auri’ye yazın.',ar:'مسودات القوائم غير متاحة بعد. اطلب من الفريق أو أوري تجهيز قائمتك.',fr:'Les brouillons de menu ne sont pas encore disponibles. Demandez à l’équipe ou à Auri.'})[lang]||'')}</p><a class="growth-primary" href="${esc(link('requests',{new:'1',service:'AuraMenu'}))}">${esc(hubLabels(lang).requests)} →</a></div></section>`);return;}
 if(page==='menuDrafts')return renderMenuDrafts({host:document.querySelector('#page-content'),api,endpoint,profile:workspace.profile,canWrite:workspace.permissions.includes('roadmap:write'),draftId:query.get('draft'),reviewLabel:label.reviewed,onDraft:id=>navigate('menuDrafts',{draft:id}),onReviewed:()=>navigate('home')});
 if(page==='journey'){if(selectedMission&&!workspace.missions.some(m=>m.id===selectedMission))throw new Error(label.unavailable);return growthDashboard();}
 if(page==='tasks')return journey();
 if(page==='insights'){
  content(`<section class="panel"><h2>${esc(t('reports'))}</h2><a class="secondary" href="${esc(link('simulator'))}">${esc(t('simulator'))}</a></section>`);
  return;
 }
 if(page==='resources'){
  content(`<section class="panel"><div class="resource-links"><a class="secondary" href="/shop">AuraShop</a><a class="secondary" href="/account">${esc(t('orders'))}</a>${moreNavigation.map(p=>`<button type="button" class="secondary" data-resource="${p}">${esc(t(p))}</button>`).join('')}</div></section>`);
  document.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>{page=b.dataset.resource;render();});
  return;
 }
 if(page==='simulator')return simulator();if(page==='team')return team();if(page==='assistant')return assistant();

 const shortcuts={projects:['requests',label.requests],websites:['services',serviceLabels[lang][0],{offer:'web'}],hosting:['services',serviceLabels[lang][0],{offer:'hosting'}],files:['services',serviceLabels[lang][0]],reports:['insights',t('simulator')],rewards:['journey',commandLabels(lang).vision]};
 const shortcut=shortcuts[page];
 if(shortcut){
  const [destination,name,params]=shortcut;
  content(`<section class="panel hub-page-start"><span class="hub-row-icon">${hubIcon(destination)}</span><div>
  <h2>${esc(name)}</h2><a class="growth-primary" href="${esc(link(destination,params))}">${esc(name)} →</a></div></section>
  ${['projects','websites','hosting','files'].includes(page)?serviceShortcuts(lang,esc,link,{profile:workspace.profile,missions:workspace.missions}):''}`);
  return;
 }
 content(`<section class="panel hub-page-start"><span class="hub-row-icon">${hubIcon('assistant')}</span><div>
 <h2>${esc(t('contact'))}</h2><p>${esc(t('supportText'))}</p>
 ${workspace.permissions.includes('auri:use')?`<a class="growth-primary" href="${esc(link('assistant'))}">${esc(label.assistant)} ↗</a>`:''}
 <a class="growth-secondary" href="/contact">${esc(t('contact'))}</a></div></section>`);
}
async function askAuri(question,missionId,requestId,serviceKey,offer) {
 const id=workspace.organization.id;
 if(serviceKey){
  const {data:{service}}=await runAuri(id,'thinking',()=>api(endpoint('auri'),'POST',{tool:'service_status',serviceKey}),'speaking');
  const labels=serviceLabels[lang];
  const renewal=service.kind==='subscription';
  return `${service.name} · ${serviceStatus(service,labels)}. ${labels[renewal?13:11]} · ${serviceDate(renewal?service.renewalDate:service.dueDate,lang,labels[12])}.`;
 }
 const {data}=await runAuri(id,'thinking',()=>api(endpoint('auri'),'POST',{tool:'guidance',question,lang,...(missionId?{missionId}:{}),...(requestId?{requestId}:{}),...(offer?{offer}:{})}),'speaking');
 if(workspace?.organization.id!==id)return '';
 if(data.reply)return data.reply;
 const fallback=({
  en:'Auri AI is unavailable. Roadmap guidance',
  fr:'L’IA d’Auri est indisponible. Conseil de la feuille de route',
  tr:'Auri yapay zekâsı kullanılamıyor. Yol haritası önerisi',
  ar:'ذكاء أوري غير متاح. إرشاد من خارطة الطريق',
 })[lang];
 const guidance=message=>fallback+' · '+message;
 if(data.offerGuidance)return guidance(data.offerGuidance);
 if(/customers|visibility|sales|müşteri|clients|عملاء/i.test(question)&&data.priorities?.length)return guidance(data.priorities.map(m=>cap(m.capability)).join(' · '));
 const task=data.mission||data.nextAction;
 if(requestId)return guidance(hubLabels(lang).requestDetails+' · '+hubLabels(lang).return);
 if(!task)return guidance(t('empty'));
 const alternate=task.route==='alternative'?missionAlternative(task.capability):null;
 if(alternate)return guidance([alternate.title,alternate.steps].join(' · '));
 const guide=missionGuide[task.capability],requirements=missionState(task,workspace.missions,workspace.profile).requirements;
 const action=task.nextAction==='Define scope or record your existing solution.'?guide?.[2]:task.nextAction;
 return guidance([cap(task.capability),action,requirements.length?requirements.map(cap).join(', '):''].filter(Boolean).join(' · '));
}
function growthDashboard(){
 disconnectDesk();
 const host=document.querySelector('#page-content');
 renderRoadmap({host,workspace,t,esc,cap,lang,view:roadmapView,selectedId:selectedMission,robot,requestLink,
  onSelect(id,scroll=true){
   navigate('journey',{task:id},false,false);growthDashboard();
   document.getElementById('growth-focus')?.focus({preventScroll:!scroll});
  },
  onAskTask(mission){navigate('assistant',{task:mission.id});},
  onView(view){roadmapView=view;growthDashboard();document.querySelector(`[data-view="${view}"]`)?.focus();},
  onEdit(mission){navigate('tasks');const card=document.querySelector(`[data-mission="${mission.id}"]`);card?.querySelector('[data-action=edit]').click();card?.querySelector('input')?.focus();},
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
  async onRoute(mission,trigger){
   trigger.disabled=true;
   const id=workspace.organization.id;
   try{await api(endpoint('mission-route/'+mission.id),'PATCH',{version:mission.version,route:trigger.dataset.route});await loadWorkspace(id);}
   catch(error){trigger.disabled=false;toast(error.message);}
  },
  async onEvidence(mission,form){
   const submit=form.querySelector('button');
   submit.disabled=true;
   const id=workspace.organization.id;
   try{await api(endpoint('mission-evidence/'+mission.id),'POST',{version:mission.version,proof:new FormData(form).get('proof')});await loadWorkspace(id);}
   catch(error){submit.disabled=false;toast(error.message);}
  },
  async onExistingEvidence(form){
   const submit=form.querySelector('button');
   submit.disabled=true;
   const id=workspace.organization.id;
   try{
    const result=await api(endpoint('existing-evidence'),'POST',Object.fromEntries(new FormData(form)));
    if(workspace?.organization.id===id){navigate('journey',{task:result.missionId},true,false);await loadWorkspace(id);}
   }catch(error){submit.disabled=false;toast(error.message);}
  },
 });
 /* The full assistant is reached through task links or the primary navigation. */

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
 const missionId=query.get('task'),requestId=query.get('request'),serviceKey=query.get('serviceRecord'),offer=query.get('offer');
 const sessionKey=[id,missionId,requestId,serviceKey,offer].filter(Boolean).join(':');
 if(!auriSessions.has(sessionKey))auriSessions.set(sessionKey,{open:false,reply:'',pending:false,error:''});
 const session=auriSessions.get(sessionKey);
 session.turns??=[];
 const transcript=()=>session.turns.map(turn=>`<article class="auri-chat-turn"><strong>${esc(turn.question)}</strong><p>${esc(turn.reply)}</p></article>`).join('');
 const level=auriLevel(), canAsk=workspace.permissions.includes('auri:use');
 const {ask:label,focus}=roadmapLabels(lang);
 const next=eligibleMissions(workspace.missions,workspace.profile)[0];
 const readAloud=({en:'Read aloud',tr:'Sesli oku',fr:'Lire à voix haute',ar:'قراءة بصوت عالٍ'})[lang];
 const send=({en:'Send',tr:'Gönder',fr:'Envoyer',ar:'إرسال'})[lang];
 const suggested=offer&&!session.turns.length?{
  en:'How would this help my business?',
  fr:'Comment ce service aiderait-il mon entreprise ?',
  tr:'Bu hizmet işletmeme nasıl yardımcı olur?',
  ar:'كيف ستساعد هذه الخدمة نشاطي؟',
 }[lang]:'';

 const identity=`${auriCharacter(level)}<span><strong>${esc(preferences.name)}</strong><small>${esc(t('level'))} ${level} · ${auriNames[level-1]}</small></span>
  <span class="auri-status" role="status" data-auri-status></span>`;
 const body=`<div class="auri-companion-body">
  ${next&&!missionId&&!requestId&&!serviceKey&&!offer?`<p><strong>${esc(focus)}</strong> · ${esc(cap(next.capability))}</p>`:''}
  ${canAsk?`<div data-auri-transcript>${transcript()}</div><form data-auri-ask><label><span class="sr-only">${esc(label)}</span><input name="question" maxlength="500" value="${esc(suggested)}" placeholder="${esc(label)}" required></label>
  <button class="primary" ${session.pending?'disabled':''}>${esc(send)}</button></form><p data-auri-reply role="status" class="${session.error?'':'sr-only'}">${esc(session.error)}</p>
  ${'speechSynthesis' in window?`<button type="button" class="secondary" data-auri-voice ${session.reply&&!session.error?'':'hidden'}>${esc(readAloud)}</button>
  <button type="button" class="secondary" data-auri-stop ${auriVoice?.scope===id?'':'hidden'}>${esc(controls.stop)}</button>`:''}`:''}
  <div class="auri-actions">
  <button type="button" class="secondary" data-auri-roadmap>${esc(t('journey'))}</button>
  ${canAsk&&workspace.permissions.includes('roadmap:write')?`<button type="button" class="secondary" data-auri-request>${esc(roadmapLabels(lang).request)}</button>`:''}
  <button type="button" class="secondary" data-auri-hide>${esc(preferences.hidden?controls.show:controls.hide)}</button></div>
  ${full?`<details class="hub-auri-settings"><summary>${esc(t('settings'))}</summary><form data-auri-name><label>${esc(controls.name)}<input name="name" value="${esc(preferences.name)}" required maxlength="24"></label>
  <button class="secondary">${esc(t('save'))}</button></form></details>`:''}
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
  window.history.pushState(null,'',link(target));syncLocation();render();
  document.querySelector('#main').focus();
 }
 host.querySelector('[data-auri-roadmap]').onclick=()=>navigate('journey');
 const request=host.querySelector('[data-auri-request]');
 if(request)request.onclick=()=>{
  if(session.reply)requestDrafts.set(id,session.reply);
  const mission=workspace.missions.find(item=>item.id===missionId);
  const service=serviceOffer(offer)?.service||missionGuide[mission?.capability]?.[0]||'';
  window.history.pushState(null,'',requestLink(service,mission?.id));syncLocation();render();
 };
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
  try{
   session.reply=await askAuri(question,missionId,requestId,serviceKey,offer);
   if(session.reply){
    session.turns.push({question,reply:session.reply});
    if(session.turns.length>20)session.turns.shift();
    host.querySelector('[data-auri-transcript]').innerHTML=transcript();
    form.elements.question.value='';
   }
  }
  catch(error){session.error=error.message;}
  finally{
   session.pending=submit.disabled=false;
   reply.textContent=session.error||session.reply;
   reply.classList.toggle('sr-only',!session.error);
   if(voice)voice.hidden=!session.reply;
   if(!form.isConnected&&workspace?.organization.id===id&&page==='assistant')renderCompanion(true);
  }
 };
}
async function assistant(){
 const ui=hubLabels(lang),host=document.querySelector('#page-content');
 const id=workspace.organization.id;
 const missionId=query.get('task'),requestId=query.get('request'),serviceKey=query.get('serviceRecord'),offer=query.get('offer');
 const mission=missionId?workspace.missions.find(m=>m.id===missionId):null;
 const offerName=serviceOffer(offer)?.[lang];
 if((missionId&&!mission)||(offer&&!offerName))throw new Error(ui.unavailable);
 const record=requestId||serviceKey?await api(endpoint('work/'+encodeURIComponent(requestId||serviceKey))):null;
 if(!host.isConnected)return;
 const returnLink=mission?link('journey',{task:mission.id}):serviceKey?link('services',{serviceRecord:serviceKey}):record?link('requests',{request:record.id}):offerName?link('services',{offer}):null;

 const canAsk=workspace.permissions.includes('auri:use');
 const labels=auriDraftCopy(lang);
 content(`${returnLink?`<div class="hub-context"><strong>${esc(ui.context)} · ${esc(mission?missionTitle(mission):record?.name||offerName)}</strong><a class="growth-secondary" href="${esc(returnLink)}">${esc(ui.return)}</a></div>`: ''}<div id="auri-workspace"></div>${canAsk?`<section class="panel auri-work-log">
  <div class="actions"><button type="button" class="primary" data-auri-draft>${esc(labels.create)}</button>${button('diagnosis','diagnosis',true)}${button('recommend','next-action',true)}</div><div data-auri-tools-status role="status"></div>
  <p role="status" data-draft-status></p>
  <h2>${esc(labels.history)}</h2><div data-auri-drafts></div></section>`:''}`);
 renderCompanion(true);
 const preset=query.get('ask');
 if(preset&&canAsk){
  const form=document.querySelector('[data-auri-ask]'),input=form?.querySelector('input');
  history.replaceState(null,'',link('assistant'));query.delete('ask');
  if(input){input.value=preset.slice(0,500);form.requestSubmit?.();}
 }
 if(!canAsk)return;
 const create=document.querySelector('[data-auri-draft]');
 const log=document.querySelector('[data-auri-drafts]');
 const status=document.querySelector('[data-draft-status]');
 const path=endpoint('auri');
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
 if(workspace.organization.id!==id){firstLogin=null;stopAuriVoice();workspace=next;navigate('home',{},false,false);}
 result=null;scenarioInputs=null;workspace=next;render();
 if(previous.organization.id===id&&next.auri?.verifiedMilestones>previous.auri?.verifiedMilestones){
  pulseAuri(id,next.auri.level>previous.auri.level?'evolving':'happy',2400);
 }
}
let loadRevision=0;
async function load(){
 const revision=++loadRevision;
 try{
  const data=await api('/api/hub/workspaces');
  if(revision!==loadRevision)return;
  me=data.user;
  if(['login','signup'].includes(route)&&resumeShop())return;
  workspaces=data.workspaces;
  syncLocation();
  const requested=query.get('workspace');
  const selected=requested?workspaces.find(w=>w.id===requested):workspaces.find(w=>w.id===workspace?.organization.id)||workspaces[0];
  const next=selected?await api('/api/hub/workspaces/'+selected.id):null;
  if(revision!==loadRevision)return;
  workspace=next;
  if(requested&&!selected)throw new Error(hubLabels(lang).unavailable);
  if(route==='signup'||route==='login'){route='';navigate('home',{},true,false);}
  render();
 }catch(e){
  if(revision!==loadRevision)return;
  if(e.status===401){me=null;render();}
  else gateFrame(`<section class="panel"><h1>AuraHub</h1><p role="alert">${esc(e.message)}</p><a href="/hub">${esc(hubLabels(lang).home)}</a></section>`);
 }
}
async function start(){
 if(['verify','reset','forgot','confirm-email'].includes(route)){render();return;}
 authCapabilities=await api('/api/customer/capabilities').catch(()=>({}));
 await load();
}
start();
