import {themes} from './themes.js?v=20260919-50';

const host=document.querySelector('.wedding-theme-grid');
const filters=document.querySelector('.aw-filters');
const labels={
  fr:{open:'Voir le design',choose:'Choisir ce thème',eyebrow:'Réservez la date',features:'Fonctionnalités',close:'Fermer',note:'50 invitations complètes. Personnalisez les détails et explorez chaque expérience.'},
  en:{open:'Preview design',choose:'Choose this theme',eyebrow:'Save the date',features:'Included features',close:'Close preview',note:'50 complete invitation previews. Personalize above, filter the collection, then open any live experience.'},
  tr:{open:'Tasarımı incele',choose:'Bu temayı seç',eyebrow:'Tarihi kaydedin',features:'Dahil özellikler',close:'Önizlemeyi kapat',note:'50 eksiksiz davetiye önizlemesi. Bilgilerinizi girin, koleksiyonu filtreleyin ve canlı deneyimi açın.'},
  ar:{open:'معاينة التصميم',choose:'اختر هذا التصميم',eyebrow:'احفظوا التاريخ',features:'الميزات المشمولة',close:'إغلاق المعاينة',note:'50 تجربة دعوة كاملة. خصّص التفاصيل، صفِّ المجموعة، ثم افتح أي تجربة مباشرة.'}
};
let language=window.AuraI18n?.current?.()||document.documentElement.lang||'en';
let activeFilter='all';
let searchTerm='';
const features=['Animated opening','Couple photo gallery','Music and countdown','Google Maps location','Event schedule','RSVP demonstration (not saved)'];
const personalizer=document.querySelector('#weddingPersonalizer');
const status=document.querySelector('.aw-personalizer-status');
const defaults={partnerOne:'Amelia',partnerTwo:'Adam',date:'2027-06-29',time:'18:00',venue:'Four Seasons Hotel Bosphorus, Istanbul',lang:'en',theme:'royal-ivory',accent:'#aa8046',message:''};
let couple={...defaults};
const studioTheme=document.querySelector('#studioTheme');
if(studioTheme)studioTheme.innerHTML=themes.map(theme=>`<option value="${theme.slug}">${theme.name}</option>`).join('');
try{const stored=JSON.parse(sessionStorage.getItem('aw-studio')||'null');if(stored && themes.some(theme=>theme.slug===stored.theme)){couple={...defaults,...stored};for(const [key,value]of Object.entries(couple))if(personalizer.elements[key])personalizer.elements[key].value=value}}catch{}
const safe=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formattedDate=()=>{const date=new Date(`${couple.date}T12:00:00`);return Number.isNaN(date.valueOf())?'Date to be announced':new Intl.DateTimeFormat(language==='tr'?'tr-TR':language==='ar'?'ar':language==='fr'?'fr-FR':'en-GB',{day:'numeric',month:'long',year:'numeric'}).format(date)};
const query=()=>new URLSearchParams({one:couple.partnerOne||'Partner one',two:couple.partnerTwo||'Partner two',date:couple.date,venue:couple.venue,time:couple.time,lang:couple.lang,accent:couple.accent,message:couple.message}).toString();

function card(theme,index,t){
  return `<article class="aw-theme" data-category="${theme.category}">
    <button class="aw-preview ${theme.slug} ${theme.kind} ${theme.dark?'dark':''}" style="--paper:${theme.paper};--ink:${theme.color};--accent:${theme.accent}" data-theme="${theme.slug}" aria-label="${t.open}: ${theme.name}">
      <img src="${theme.image}" width="640" height="850" loading="lazy" alt="${theme.name} wedding invitation preview">
      <span class="aw-wash" aria-hidden="true"></span><span class="aw-preview-frame" aria-hidden="true"></span>
      <span class="aw-preview-copy"><small>${t.eyebrow}</small><b>${safe(couple.partnerOne)}<i>&amp;</i>${safe(couple.partnerTwo)}</b><em>${safe(formattedDate())}</em><span class="aw-seal">${safe((couple.partnerOne[0]||'A').toUpperCase())} <i>&amp;</i> ${safe((couple.partnerTwo[0]||'A').toUpperCase())}</span></span>
      <span class="aw-open">${t.open} ↗</span>
    </button>
    <div class="aw-card-meta"><div><small>${String(index+1).padStart(2,'0')} · ${theme.category}</small><h3>${theme.name}</h3></div><span class="aw-color" style="background:${theme.accent}" title="Theme accent"></span></div>
    <p>${theme.note}</p><div class="aw-card-actions"><a href="/weddings/preview.html?theme=${theme.slug}&${query()}">${t.open} ↗</a><button type="button" data-select="${theme.slug}">${t.choose} ↗</button></div>
  </article>`;
}

function render(lang=language){
  if(!host)return;language=lang;const t=labels[lang]||labels.en;
  host.className='wedding-theme-grid aw-gallery';
  host.innerHTML=themes.map((theme,index)=>card(theme,index,t)).join('');
  host.querySelectorAll('.aw-theme').forEach((el,index)=>{const theme=themes[index],matchesFilter=activeFilter==='all'||el.dataset.category===activeFilter,matchesSearch=!searchTerm||`${theme.name} ${theme.note} ${theme.category}`.toLowerCase().includes(searchTerm);el.hidden=!matchesFilter||!matchesSearch});
  const count=host.querySelectorAll('.aw-theme:not([hidden])').length;document.querySelector('#themeResults').textContent=count?`${count} / ${themes.length} designs`:'No matching designs. Try another search or category.';
  let note=document.querySelector('.aw-gallery-note');if(!note){note=document.createElement('p');note.className='aw-gallery-note';host.after(note)}note.textContent=t.note;
}

function openModal(slug){
  const theme=themes.find(item=>item.slug===slug);if(!theme)return;const t=labels[language]||labels.en;
  const dialog=document.createElement('dialog');dialog.className=`aw-theme-dialog ${theme.slug}`;dialog.innerHTML=`<div class="aw-modal-art" style="--paper:${theme.paper};--ink:${theme.color};--accent:${theme.accent}"><img src="${theme.image}" alt="${theme.name} wedding design"><span></span><div><small>${t.eyebrow}</small><strong>${safe(couple.partnerOne)} <i>&amp;</i> ${safe(couple.partnerTwo)}</strong><em>${safe(formattedDate())}</em></div></div><div class="aw-modal-copy"><button class="aw-modal-close" aria-label="${t.close}">×</button><small>${theme.category} collection</small><h2>${theme.name}</h2><p>${theme.note}</p><h3>${t.features}</h3><ul>${features.map(feature=>`<li>${feature}</li>`).join('')}</ul><div class="aw-modal-actions"><a class="aw-live" href="/weddings/preview.html?theme=${theme.slug}&${query()}">${t.open} ↗</a><a class="aw-choose" href="/contact?service=auraweddings&theme=${theme.slug}&${query()}">${t.choose} →</a></div></div>`;
  document.body.append(dialog);dialog.showModal();document.body.classList.add('modal-open');
  const close=()=>{dialog.close();dialog.remove();document.body.classList.remove('modal-open')};
  dialog.querySelector('.aw-modal-close').addEventListener('click',close);dialog.addEventListener('click',event=>{if(event.target===dialog)close()});dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');dialog.remove()});
}

filters?.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]');if(!button)return;activeFilter=button.dataset.filter;filters.querySelectorAll('button').forEach(item=>(item.classList.toggle('active',item===button),item.setAttribute('aria-pressed',String(item===button))));render();});
host?.addEventListener('click',event=>{const preview=event.target.closest('.aw-preview');if(preview)openModal(preview.dataset.theme)});
document.querySelector('#themeSearch')?.addEventListener('input',event=>{searchTerm=event.target.value.trim().toLowerCase();render()});

let updateTimer;
function updateStudio(){
  if(!personalizer)return;
  couple=Object.fromEntries(new FormData(personalizer).entries());
  try{sessionStorage.setItem('aw-studio',JSON.stringify(couple))}catch{}
  status.textContent=`Previewing ${couple.partnerOne||'Partner one'} & ${couple.partnerTwo||'Partner two'} · ${formattedDate()}`;
  const url=`/weddings/preview.html?theme=${couple.theme}&${query()}`;
  document.querySelector('#studioPreview').href=url;
  const frame=document.querySelector('#studioFrame');frame.src=`${url}&embed=1`;frame.onerror=()=>{status.textContent='Preview could not load. Open the full invitation or try again.'};
  render();
}
function selectTheme(slug){
  const theme=themes.find(item=>item.slug===slug);if(!theme)return;
  personalizer.elements.theme.value=theme.slug;personalizer.elements.accent.value=theme.accent;updateStudio();
  document.querySelector('#studio').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
host?.addEventListener('click',event=>{const button=event.target.closest('[data-select]');if(button)selectTheme(button.dataset.select)});
personalizer?.addEventListener('input',event=>{if(event.target.name==='theme'){personalizer.elements.accent.value=themes.find(theme=>theme.slug===event.target.value)?.accent||defaults.accent}clearTimeout(updateTimer);updateTimer=setTimeout(updateStudio,200)});
personalizer?.addEventListener('reset',()=>{clearTimeout(updateTimer);setTimeout(()=>{for(const[key,value]of Object.entries(defaults))personalizer.elements[key].value=value;updateStudio()},0)});
personalizer?.addEventListener('submit',event=>{event.preventDefault();clearTimeout(updateTimer);if(!personalizer.reportValidity())return;updateStudio();location.assign(`/contact?service=auraweddings&theme=${couple.theme}&${query()}`)});
const experience=document.querySelector('#experienceFrame');
let selectedScene='envelope';
experience?.addEventListener('load',()=>{if(selectedScene!=='envelope')experience.contentWindow?.postMessage({type:'aw:scene',scene:selectedScene},location.origin)});
document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-scene]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  selectedScene=button.dataset.scene;
  if(button.dataset.scene==='envelope'){experience.src=experience.src;return}
  experience.contentWindow?.postMessage({type:'aw:scene',scene:button.dataset.scene},location.origin);
}));
document.querySelector('#replayInvitation')?.addEventListener('click',()=>document.querySelector('[data-scene="envelope"]').click());
updateStudio();
window.addEventListener('aura:languagechange',event=>render(event.detail?.lang||'en'));
