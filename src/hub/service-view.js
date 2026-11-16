import { rankServicesForBusiness } from './service-ranking.js';
import { deliverables } from './service-deliverables.js';

export const serviceLabels={
 en:['My Services','Track your services, deadlines and renewals in one place.','All','In progress','Needs action','Delivered','Active','No services match this filter.','Open details','Payment','Unavailable','Delivery deadline','Awaiting confirmation','Renewal date','Created'],
 fr:['Mes services','Tout ce qu’AuraDigital crée et gère pour votre entreprise.','Tous','En cours','Action requise','Livré','Actif','Aucun service dans cette vue.','Voir les détails','Paiement','Indisponible','Date de livraison','En attente de confirmation','Date de renouvellement','Créé'],
 tr:['Hizmetlerim','AuraDigital’in işletmeniz için oluşturduğu ve yönettiği her şey.','Tümü','Devam eden','İşlem gerekli','Teslim edildi','Aktif','Bu görünümde hizmet yok.','Ayrıntıları aç','Ödeme','Kullanılamıyor','Teslim tarihi','Onay bekleniyor','Yenileme tarihi','Oluşturuldu'],
 ar:['خدماتي','كل ما تنشئه AuraDigital وتديره لنشاطك التجاري.','الكل','قيد التنفيذ','يتطلب إجراءً','تم التسليم','نشط','لا توجد خدمات في هذا العرض.','عرض التفاصيل','الدفع','غير متاح','موعد التسليم','بانتظار التأكيد','موعد التجديد','تاريخ الإنشاء'],
};

const filters=['all','progress','attention','delivered','active'];
const totalLabels={en:'Total services',fr:'Total des services',tr:'Toplam hizmet',ar:'إجمالي الخدمات'};
const statuses={
 new:'progress', 'in-progress':'progress', scheduled:'progress', production:'progress', in_progress:'progress', in_production:'progress',
 ready:'attention', waiting:'attention', waiting_client:'attention', waiting_for_customer:'attention', review:'attention',
 ready_for_review:'attention', revisions_requested:'progress', blocked:'progress',
 completed:'delivered', delivered:'delivered', active:'active',
};
const group=record=>Object.hasOwn(statuses,record.status)?statuses[record.status]:undefined;
const icons={
 email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 web:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
 menu:'<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0v3h3v4m4-7v3m0 4h-1"/>',
 chat:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 2 2-5a8 8 0 1 1 16-5Z"/><path d="M8 11h1m3 0h1m3 0h1"/>',
 hosting:'<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h2m-2 11h2"/>',
 general:'<path d="m12 2 9 5v10l-9 5-9-5V7zm0 10 9-5m-9 5-9-5m9 5v10"/>',
};
const examples=[
 {kind:'web',service:'Web Design',en:'Website',fr:'Site web',tr:'Web sitesi',ar:'موقع إلكتروني'},
 {kind:'email',service:'Business Email',en:'Business Email',fr:'E-mail professionnel',tr:'İş e-postası',ar:'بريد الأعمال'},
 {kind:'menu',service:'AuraMenu',en:'QR Menu',fr:'Menu QR',tr:'QR menü',ar:'قائمة QR'},
 {kind:'chat',service:'AI & Automation',en:'WhatsApp Automation',fr:'Automatisation WhatsApp',tr:'WhatsApp otomasyonu',ar:'أتمتة واتساب'},
 {kind:'brand',service:'Branding',en:'Branding',fr:'Identité visuelle',tr:'Marka kimliği',ar:'الهوية البصرية'},
 {kind:'hosting',service:'Hosting / Security',en:'Hosting & Domain',fr:'Hébergement et domaine',tr:'Hosting ve alan adı',ar:'الاستضافة والنطاق'},
];
const previewCopy={
 en:['Service examples','Request this service','Illustration','Mailbox','New message','Welcome!','How can we help?'],
 fr:['Exemples de services','Demander ce service','Illustration','Boîte mail','Nouveau message','Bienvenue !','Comment vous aider ?'],
 tr:['Hizmet örnekleri','Bu hizmeti iste','Örnek görsel','Posta kutusu','Yeni mesaj','Hoş geldiniz!','Nasıl yardımcı olabiliriz?'],
 ar:['أمثلة على الخدمات','اطلب هذه الخدمة','رسم توضيحي','صندوق البريد','رسالة جديدة','أهلاً بك!','كيف يمكننا مساعدتك؟'],
};
const detailCopy={
 en:['Explore services','See what you get','What you’ll get','Scope, price and delivery are confirmed in your quote.','Start your roadmap to request this service.'],
 fr:['Explorer les services','Voir le contenu','Ce que vous recevrez','Le devis précise le périmètre, le prix et le délai.','Créez votre feuille de route pour demander ce service.'],
 tr:['Hizmetleri keşfet','İçeriği gör','Neler alacaksınız','Kapsam, fiyat ve teslim süresi teklifinizde kesinleşir.','Bu hizmeti istemek için yol haritanızı başlatın.'],
 ar:['استكشف الخدمات','اطّلع على التفاصيل','ما الذي ستحصل عليه','يؤكد عرض السعر النطاق والسعر وموعد التسليم.','ابدأ خارطة الطريق لطلب هذه الخدمة.'],
};
function rankedExamples(profile,missions){
 return rankServicesForBusiness(examples.map(example=>({...example,name:example.en})),{profile,missions});
}
export function serviceShortcuts(lang,esc,link,{profile,missions}={}){
 return `<section class="hub-service-shortcuts"><header><h2>${detailCopy[lang][0]}</h2><a href="${esc(link('services'))}">${esc(serviceLabels[lang][0])} →</a></header>
 <div class="hub-service-links">${rankedExamples(profile,missions).map(example=>`<a href="${esc(link('services',{offer:example.kind}))}"><span class="service-icon">${icon(example.kind)}</span><span>${esc(example[lang])}</span><span aria-hidden="true">↗</span></a>`).join('')}</div></section>`;
}
function scopeMarkup(kind,lang){
 const scope=deliverables[kind]?.[lang];
 if(!scope)return '';
 return `<section class="service-scope"><h3>${detailCopy[lang][2]}</h3><ul>${scope.slice(1).map(item=>`<li>${item}</li>`).join('')}</ul><p>${detailCopy[lang][3]}</p></section>`;
}
export const serviceOffer=(offer)=>examples.find(item=>item.kind===offer);
export function renderServiceOffer({host,offer,lang,esc,link,canRequest,canSetUp,askLabel}){
 const example=serviceOffer(offer);
 if(!example)return false;
 host.innerHTML=`<a class="service-back" href="${esc(link('services'))}">← ${serviceLabels[lang][0]}</a>
 <article class="service-offer"><div class="service-offer-visual">${serviceArt(offer,lang)}</div>
 <div class="service-offer-copy"><span class="service-icon">${icon(offer)}</span><h2>${esc(example[lang])}</h2>
 <p>${deliverables[offer][lang][0]}</p>${scopeMarkup(offer,lang)}
 <div class="growth-actions offer-actions">
 ${askLabel?`<a class="growth-primary service-ask-auri" href="${esc(link('assistant',{offer}))}"><img src="/media/auri/level-1.webp" alt="" width="25" height="25" loading="lazy">${esc(askLabel)} <span aria-hidden="true">↗</span></a>`:''}
 ${canRequest?`<a class="${askLabel?'growth-secondary':'growth-primary'}" href="${esc(link('requests',{new:'1',service:example.service}))}">${previewCopy[lang][1]} →</a>`:
  canSetUp?`<a class="growth-primary" href="${esc(link('onboarding'))}">${detailCopy[lang][4]}</a>`:''}</div></div></article>`;
 return true;
}
const serviceKind=name=>[
 [/e.?mail|mailbox/i,'email'],[/menu/i,'menu'],[/whatsapp|automation|chat/i,'chat'],
 [/hosting|domain/i,'hosting'],[/brand|design identity/i,'brand'],[/web/i,'web'],
].find(([pattern])=>pattern.test(name))?.[1]||'general';
function icon(kind) {
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[kind]||icons.general}</svg>`;
}
function serviceArt(kind,lang){
 const [, ,label,mailbox,message,welcome,help]=previewCopy[lang];
 const artwork={
  web:'<div class="service-laptop"><img src="/project-fifty.png" alt="" loading="lazy"></div>',
  email:`<div class="service-mail-window"><small>${mailbox}</small><strong>${message}</strong><span>contact@yourbusiness.com</span><i></i><i></i></div>${icon('email')}`,
  menu:'<div class="service-menu-stand">'+icon('menu')+'</div><img class="service-menu-phone" src="/qr-menu-phone.svg" alt="" loading="lazy">',
  chat:`<div class="service-chat-phone"><span>${welcome}</span><span>${help}</span></div>${icon('chat')}`,
  brand:'<div class="service-brand-kit"><div></div><span></span><span></span><span>Aa</span></div>',
  hosting:'<div class="service-rack"><i></i><i></i><i></i></div><div class="service-domain">yourbusiness.com</div>',
 };
 return `<div class="service-art service-art--${kind}"><span class="service-art-label">${label}</span><div class="service-artwork" aria-hidden="true">${artwork[kind]||icon(kind)}</div></div>`;
}
export function serviceDate(value,lang,fallback) {
 if(!value)return fallback;
 const parsed=new Date(value.replace(' ','T')+(/^\d{4}-\d{2}-\d{2} \d/.test(value)?'Z':''));
 return Number.isNaN(parsed.valueOf())?fallback:new Intl.DateTimeFormat(lang,{dateStyle:'medium',timeZone:'UTC'}).format(parsed);
}
export function serviceStatus(record,labels) {
 const index=filters.indexOf(group(record));
 // These groups collect several distinct statuses. Preserve a specific status where available.
 if(index>=3)return labels[index+2];
 return String(record.status||labels[10]).replaceAll('_',' ');
}
function facts(record,lang,labels,esc){
 const renewal=record.kind==='subscription';
 return `<dl class="service-facts"><div><dt>${labels[9]}</dt><dd>${labels[10]}</dd></div>
 <div><dt>${labels[renewal?13:11]}</dt><dd>${esc(serviceDate(renewal?record.renewalDate:record.dueDate,lang,labels[12]))}</dd></div></dl>`;
}
export function serviceSummary(records,labels,esc,lang) {
 return `<dl class="service-summary">${filters.map((filter,index)=>`<div><dt>${esc(filter==='all'?totalLabels[lang]||totalLabels.en:labels[index+2])}</dt><dd>${filter==='all'?records.length:records.filter(record=>group(record)===filter).length}</dd></div>`).join('')}</dl>`;
}
export function renderServices({host,records,lang,esc,link,profile,missions}){
 const labels=serviceLabels[lang]||serviceLabels.en;
 const [examplesTitle]=previewCopy[lang];
 const headers=(kind,name)=>`<header><span class="service-icon">${icon(kind)}</span><h2>${esc(name)}</h2></header>`;
 host.innerHTML=`<p class="service-intro">${labels[1]}</p>
 ${records.length?`<div class="service-filters" role="group" aria-label="${labels[0]}">${filters.map((filter,index)=>`<button type="button" data-service-filter="${filter}" aria-controls="service-grid" aria-pressed="${filter==='all'}">${labels[index+2]} <span>${filter==='all'?records.length:records.filter(record=>group(record)===filter).length}</span></button>`).join('')}</div>
 <div class="service-grid" id="service-grid">${rankServicesForBusiness(records,{profile,missions}).map(record=>{
  const kind=serviceKind(record.name);
  return `<article class="service-card" data-service-group="${group(record)||'other'}">
   ${serviceArt(kind,lang)}<span class="service-state">${esc(serviceStatus(record,labels))}</span>
   <div class="service-card-body">${headers(kind,record.name)}${facts(record,lang,labels,esc)}
   <a class="growth-primary service-card-link" href="${esc(link('services',{serviceRecord:record.key}))}">${labels[8]} <span aria-hidden="true">↗</span></a></div>
   </article>`;
 }).join('')}</div><p class="hub-empty" role="status" data-service-empty hidden>${labels[7]}</p>`:''}<h2 class="service-example-title">${examplesTitle}</h2>
 <div class="service-grid service-catalogue">${rankedExamples(profile,missions).map(example=>`<article class="service-card">
  ${serviceArt(example.kind,lang)}<div class="service-card-body">${headers(example.kind,example[lang])}
  <a class="growth-secondary service-card-link" href="${esc(link('services',{offer:example.kind}))}">${detailCopy[lang][1]} <span aria-hidden="true">↗</span></a></div>
 </article>`).join('')}</div>`;
 if(!records.length)return;
 host.querySelector('.service-filters').onclick=event=>{
  const button=event.target.closest('[data-service-filter]');
  if(!button)return;
  const filter=button.dataset.serviceFilter;
  for(const item of host.querySelectorAll('[data-service-filter]'))item.setAttribute('aria-pressed',String(item===button));
  let visible=0;
  for(const card of host.querySelectorAll('[data-service-group]')){
   card.hidden=filter!=='all'&&card.dataset.serviceGroup!==filter;
   if(!card.hidden)visible++;
  }
  host.querySelector('[data-service-empty]').hidden=visible>0;
 };
}
export function renderServiceDetails({host,record,lang,esc,link,askLabel}){
 const labels=serviceLabels[lang]||serviceLabels.en;
 host.innerHTML=`<article class="service-card service-detail"><header><h2>${esc(record.name)}</h2><span class="service-state">${esc(serviceStatus(record,labels))}</span></header>
 ${serviceArt(serviceKind(record.name),lang)}${facts(record,lang,labels,esc)}
 <dl class="service-facts"><div><dt>${labels[14]}</dt><dd>${esc(serviceDate(record.createdAt,lang,labels[10]))}</dd></div></dl>
 <div class="actions"><a class="growth-secondary" href="${esc(link('services'))}">${labels[0]}</a>
 ${deliverables[serviceKind(record.name)]?`<a class="growth-secondary" href="${esc(link('services',{offer:serviceKind(record.name)}))}">${detailCopy[lang][1]}</a>`:''}
 ${askLabel?`<a class="growth-primary" href="${esc(link('assistant',{serviceRecord:record.key}))}">${esc(askLabel)}</a>`:''}</div></article>`;
}
