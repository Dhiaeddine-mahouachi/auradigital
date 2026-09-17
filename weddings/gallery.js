import {themes} from './themes.js?v=20260917-3';

const host=document.querySelector('.wedding-theme-grid');
const filters=document.querySelector('.aw-filters');
const labels={
  en:{open:'Preview design',choose:'Choose this theme',eyebrow:'Save the date',features:'Included features',close:'Close preview',note:'Ten complete invitation previews. Tap a design to see its details, then open the live experience.'},
  tr:{open:'Tasarımı incele',choose:'Bu temayı seç',eyebrow:'Tarihi kaydedin',features:'Dahil özellikler',close:'Önizlemeyi kapat',note:'On tam davetiye önizlemesi. Detayları görmek için tasarıma dokunun, ardından canlı deneyimi açın.'},
  ar:{open:'معاينة التصميم',choose:'اختر هذا التصميم',eyebrow:'احفظوا التاريخ',features:'الميزات المشمولة',close:'إغلاق المعاينة',note:'عشر تجارب دعوة كاملة. اضغط على التصميم لرؤية التفاصيل ثم افتح التجربة الحية.'}
};
let language=window.AuraI18n?.current?.()||document.documentElement.lang||'en';
let activeFilter='all';
const features=['Animated opening','Couple photo gallery','Music and countdown','Google Maps location','Event schedule','RSVP-ready experience'];

function card(theme,index,t){
  return `<article class="aw-theme" data-category="${theme.category}">
    <button class="aw-preview ${theme.slug} ${theme.kind} ${theme.dark?'dark':''}" style="--paper:${theme.paper};--ink:${theme.color};--accent:${theme.accent}" data-theme="${theme.slug}" aria-label="${t.open}: ${theme.name}">
      <img src="${theme.image}" width="640" height="850" loading="lazy" alt="${theme.name} wedding invitation preview">
      <span class="aw-wash" aria-hidden="true"></span><span class="aw-preview-frame" aria-hidden="true"></span>
      <span class="aw-preview-copy"><small>${t.eyebrow}</small><b>Amelia<i>&amp;</i>Adam</b><em>29 · JUNE · 2027</em><span class="aw-seal">A <i>&amp;</i> A</span></span>
      <span class="aw-open">${t.open} ↗</span>
    </button>
    <div class="aw-card-meta"><div><small>${String(index+1).padStart(2,'0')} · ${theme.category}</small><h3>${theme.name}</h3></div><span class="aw-color" style="background:${theme.accent}" title="Theme accent"></span></div>
    <p>${theme.note}</p>
  </article>`;
}

function render(lang=language){
  if(!host)return;language=lang;const t=labels[lang]||labels.en;
  host.className='wedding-theme-grid aw-gallery';
  host.innerHTML=themes.map((theme,index)=>card(theme,index,t)).join('');
  host.querySelectorAll('.aw-theme').forEach(el=>el.hidden=activeFilter!=='all'&&el.dataset.category!==activeFilter);
  let note=document.querySelector('.aw-gallery-note');if(!note){note=document.createElement('p');note.className='aw-gallery-note';host.after(note)}note.textContent=t.note;
}

function openModal(slug){
  const theme=themes.find(item=>item.slug===slug);if(!theme)return;const t=labels[language]||labels.en;
  const dialog=document.createElement('dialog');dialog.className=`aw-theme-dialog ${theme.slug}`;dialog.innerHTML=`<div class="aw-modal-art" style="--paper:${theme.paper};--ink:${theme.color};--accent:${theme.accent}"><img src="${theme.image}" alt="${theme.name} wedding design"><span></span><div><small>${t.eyebrow}</small><strong>Amelia <i>&amp;</i> Adam</strong><em>29 · 06 · 2027</em></div></div><div class="aw-modal-copy"><button class="aw-modal-close" aria-label="${t.close}">×</button><small>${theme.category} collection</small><h2>${theme.name}</h2><p>${theme.note}</p><h3>${t.features}</h3><ul>${features.map(feature=>`<li>${feature}</li>`).join('')}</ul><div class="aw-modal-actions"><a class="aw-live" href="/weddings/${theme.slug}.html">${t.open} ↗</a><a class="aw-choose" href="/contact?service=auraweddings&theme=${theme.slug}">${t.choose} →</a></div></div>`;
  document.body.append(dialog);dialog.showModal();document.body.classList.add('modal-open');
  const close=()=>{dialog.close();dialog.remove();document.body.classList.remove('modal-open')};
  dialog.querySelector('.aw-modal-close').addEventListener('click',close);dialog.addEventListener('click',event=>{if(event.target===dialog)close()});dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
}

filters?.addEventListener('click',event=>{const button=event.target.closest('button[data-filter]');if(!button)return;activeFilter=button.dataset.filter;filters.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));render();});
host?.addEventListener('click',event=>{const preview=event.target.closest('.aw-preview');if(preview)openModal(preview.dataset.theme)});
render();
window.addEventListener('aura:languagechange',event=>render(event.detail?.lang||'en'));
