const translations = {
 en:{view:'View details',billing:'Billing',renewal:'Next billing',status:'Status',noRenewal:'Billing date not available'},
 fr:{view:'Voir les détails',billing:'Facturation',renewal:'Prochaine facture',status:'Statut',noRenewal:'Date indisponible'},
 tr:{view:'Ayrıntıları gör',billing:'Faturalama',renewal:'Sonraki fatura',status:'Durum',noRenewal:'Fatura tarihi mevcut değil'},
 ar:{view:'عرض التفاصيل',billing:'الفوترة',renewal:'الفاتورة التالية',status:'الحالة',noRenewal:'لا يتوفر تاريخ الفوترة'},
};
const categories=[
 {pattern:/email|mail|e-posta|courriel/i,kind:'email',symbol:'@'},
 {pattern:/whatsapp|message|automation|chatbot/i,kind:'automation',symbol:'AI'},
 {pattern:/qr|menu|menü/i,kind:'menu',symbol:'QR'},
 {pattern:/hosting|domain|security|ssl/i,kind:'infrastructure',symbol:'DNS'},
 {pattern:/seo|ads|google|review|marketing/i,kind:'marketing',symbol:'↗'},
 {pattern:/nfc|card/i,kind:'card',symbol:'NFC'},
 {pattern:/video|photo|brand|design|graphic/i,kind:'creative',symbol:'✦'},
 {pattern:/web|website|site/i,kind:'website',symbol:'WWW'},
];
const classify=name=>categories.find(item=>item.pattern.test(String(name||'')))||{kind:'service',symbol:'✦'};
export function renderOwnedServiceCard(record,{esc,href,lang='en'}){
 const labels=translations[lang]||translations.en;
 const title=String(record.name||'Service');
 const category=classify(title);
 const state=String(record.status||'unknown');
 const billing=typeof record.renewalDate==='string'&&/^\d{4}-\d{2}-\d{2}/.test(record.renewalDate)
  ?record.renewalDate.slice(0,10):null;
 const active=state.toLowerCase()==='active';
 return `<article class="hub-service-card" data-service-kind="${category.kind}">
  <div class="hub-service-preview" aria-hidden="true"><span class="hub-service-mark">${esc(category.symbol)}</span></div>
  <div class="hub-service-card-body"><div class="hub-service-card-heading"><h3>${esc(title)}</h3><span class="hub-service-status ${active?'is-active':''}">${esc(state)}</span></div>
  <div class="hub-service-facts"><span>${esc(labels.renewal)}</span><strong>${esc(billing||labels.noRenewal)}</strong></div>
  <div class="hub-service-card-actions"><a class="hub-service-primary" href="${esc(href)}">${esc(labels.view)} <span aria-hidden="true">↗</span></a>
  <a class="hub-service-secondary" href="/account">${esc(labels.billing)}</a></div></div>
 </article>`;
}
