export const serviceLabels={
 en:['My Services','Everything AuraDigital creates and manages for your business.','All','In progress','Needs action','Delivered','Active','No services match this view.','Open details','Payment','Unavailable','Delivery deadline','Awaiting confirmation','Renewal date','Created'],
 fr:['Mes services','Tout ce qu’AuraDigital crée et gère pour votre entreprise.','Tous','En cours','Action requise','Livré','Actif','Aucun service dans cette vue.','Voir les détails','Paiement','Indisponible','Date de livraison','En attente de confirmation','Date de renouvellement','Créé'],
 tr:['Hizmetlerim','AuraDigital’in işletmeniz için oluşturduğu ve yönettiği her şey.','Tümü','Devam eden','İşlem gerekli','Teslim edildi','Aktif','Bu görünümde hizmet yok.','Ayrıntıları aç','Ödeme','Kullanılamıyor','Teslim tarihi','Onay bekleniyor','Yenileme tarihi','Oluşturuldu'],
 ar:['خدماتي','كل ما تنشئه AuraDigital وتديره لنشاطك التجاري.','الكل','قيد التنفيذ','يتطلب إجراءً','تم التسليم','نشط','لا توجد خدمات في هذا العرض.','عرض التفاصيل','الدفع','غير متاح','موعد التسليم','بانتظار التأكيد','موعد التجديد','تاريخ الإنشاء'],
};

const filters=['all','progress','attention','delivered','active'];
const statuses={
 new:'progress', 'in-progress':'progress', scheduled:'progress', production:'progress', in_progress:'progress', in_production:'progress',
 ready:'attention', waiting:'attention', waiting_client:'attention', waiting_for_customer:'attention', review:'attention',
 ready_for_review:'attention', revisions_requested:'progress', blocked:'progress',
 completed:'delivered', delivered:'delivered', active:'active',
};
const group=record=>statuses[record.status];
const icons={
 email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 web:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
 menu:'<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0v3h3v4m4-7v3m0 4h-1"/>',
 chat:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 2 2-5a8 8 0 1 1 16-5Z"/><path d="M8 11h1m3 0h1m3 0h1"/>',
 hosting:'<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h2m-2 11h2"/>',
 general:'<path d="m12 2 9 5v10l-9 5-9-5V7zm0 10 9-5m-9 5-9-5m9 5v10"/>',
};
function icon(name) {
 const kind=[
  [/e.?mail|mailbox/i,'email'],[/menu/i,'menu'],[/whatsapp|automation|chat/i,'chat'],
  [/hosting|domain/i,'hosting'],[/web/i,'web'],
 ].find(([pattern])=>pattern.test(name))?.[1]||'general';
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[kind]}</svg>`;
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
export function serviceSummary(records,labels,esc) {
 return `<dl class="service-summary">${filters.map((filter,index)=>`<div><dt>${esc(labels[index+2])}</dt><dd>${filter==='all'?records.length:records.filter(record=>group(record)===filter).length}</dd></div>`).join('')}</dl>`;
}
export function renderServices({host,records,lang,esc,link}){
 const labels=serviceLabels[lang]||serviceLabels.en;
 host.innerHTML=`<p class="service-intro">${labels[1]}</p>${serviceSummary(records,labels,esc)}
 <div class="service-filters" role="group" aria-label="${labels[0]}">${filters.map((filter,index)=>`<button type="button" data-service-filter="${filter}" aria-controls="service-grid" aria-pressed="${filter==='all'}">${labels[index+2]}</button>`).join('')}</div>
 <div class="service-grid" id="service-grid">${records.map(record=>`<article class="service-card" data-service-group="${group(record)||'other'}">
 <header><h2>${esc(record.name)}</h2><span class="service-state">${esc(serviceStatus(record,labels))}</span></header>
 <div class="service-art">${icon(record.name)}</div>${facts(record,lang,labels,esc)}
 <a class="growth-secondary" href="${esc(link('services',{serviceRecord:record.key}))}">${labels[8]} <span aria-hidden="true">↗</span></a>
 </article>`).join('')}</div><p class="hub-empty" role="status" data-service-empty ${records.length?'hidden':''}>${labels[7]}</p>`;
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
 <div class="service-art">${icon(record.name)}</div>${facts(record,lang,labels,esc)}
 <dl class="service-facts"><div><dt>${labels[14]}</dt><dd>${esc(serviceDate(record.createdAt,lang,labels[10]))}</dd></div></dl>
 <div class="actions"><a class="growth-secondary" href="${esc(link('services'))}">${labels[0]}</a>
 ${askLabel?`<a class="growth-primary" href="${esc(link('assistant',{serviceRecord:record.key}))}">${esc(askLabel)}</a>`:''}</div></article>`;
}
