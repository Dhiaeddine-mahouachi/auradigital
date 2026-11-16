// Customer-owned services share a compact view; sorting uses existing business data only.
const translations={
 en:{open:'Open',renewal:'Renews',benefits:{website:'Your online home',infrastructure:'Keep your site online',email:'Professional communication',menu:'Share your menu',whatsapp:'Reply to customers',crm:'Manage leads',discovery:'Help customers find you',ads:'Reach new customers',seo:'Improve search visibility',reviews:'Build customer trust',automation:'Save repetitive work',card:'Share contact details',creative:'Show your business',service:'Manage your service'}},
 fr:{open:'Ouvrir',renewal:'Renouvellement',benefits:{website:'Votre vitrine en ligne',infrastructure:'Gardez votre site actif',email:'Communication professionnelle',menu:'Partagez votre menu',whatsapp:'Répondez aux clients',crm:'Suivez vos prospects',discovery:'Soyez plus visible',ads:'Touchez de nouveaux clients',seo:'Visibilité sur Google',reviews:'Inspirez confiance',automation:'Automatisez les tâches',card:'Partagez vos contacts',creative:'Présentez votre activité',service:'Gérez votre service'}},
 tr:{open:'Aç',renewal:'Yenileme',benefits:{website:'Dijital vitrininiz',infrastructure:'Siteniz yayında kalsın',email:'Profesyonel iletişim',menu:'Menünüzü paylaşın',whatsapp:'Müşterileri yanıtlayın',crm:'Potansiyel müşterileri yönetin',discovery:'Kolay bulunabilin',ads:'Yeni müşterilere ulaşın',seo:'Aramada görünür olun',reviews:'Güven oluşturun',automation:'Tekrarlanan işleri azaltın',card:'İletişim bilgilerini paylaşın',creative:'İşletmenizi tanıtın',service:'Hizmetinizi yönetin'}},
 ar:{open:'فتح',renewal:'التجديد',benefits:{website:'واجهة عملك الرقمية',infrastructure:'أبق موقعك متاحًا',email:'تواصل احترافي',menu:'شارك قائمتك',whatsapp:'رد على العملاء',crm:'نظم العملاء المحتملين',discovery:'سهّل العثور عليك',ads:'اجذب عملاء جدد',seo:'اظهر في البحث',reviews:'عزز ثقة العملاء',automation:'وفر وقت المهام',card:'شارك بيانات التواصل',creative:'اعرض نشاطك',service:'أدر خدمتك'}},
};
const categories=[
 {pattern:/whatsapp/i,kind:'whatsapp',symbol:'WA',capabilities:['whatsapp']},
 {pattern:/qr|menu|menü/i,kind:'menu',symbol:'QR',capabilities:['menu']},
 {pattern:/google\s*(maps?|business)|business\s*discovery|local\s*listing/i,kind:'discovery',symbol:'MAP',capabilities:['discovery']},
 {pattern:/review|rating|avis|yorum/i,kind:'reviews',symbol:'★',capabilities:['reviews']},
 {pattern:/google\s*ads|search\s*advert|ad\s*management|campaign|publicit/i,kind:'ads',symbol:'ADS',capabilities:['ads']},
 {pattern:/seo|search\s*optim/i,kind:'seo',symbol:'SEO',capabilities:['seo']},
 {pattern:/e-?mail|e-posta|courriel|mailbox/i,kind:'email',symbol:'@',capabilities:['email']},
 {pattern:/crm|customer\s*management|lead\s*management|pipeline/i,kind:'crm',symbol:'CRM',capabilities:['crm','leads']},
 {pattern:/hosting|domain|security|ssl|website\s*care|maintenance/i,kind:'infrastructure',symbol:'DNS',capabilities:['domain','hosting']},
 {pattern:/automat|chatbot|ai\s*assistant|workflow|spinflow/i,kind:'automation',symbol:'AI',capabilities:['automation','followups']},
 {pattern:/nfc|smart\s*card/i,kind:'card',symbol:'NFC',capabilities:['branding']},
 {pattern:/web|website|site|e-?commerce|online\s*shop/i,kind:'website',symbol:'WEB',capabilities:['website']},
 {pattern:/brand|logo|video|photo|design|graphic/i,kind:'creative',symbol:'✦',capabilities:['branding']},
];
const classify=name=>categories.find(x=>x.pattern.test(String(name||'')))||{kind:'service',symbol:'✦',capabilities:[]};
const baseImportance={website:100,infrastructure:90,email:85,discovery:80,whatsapp:70,seo:68,crm:65,reviews:60,automation:55,ads:50,menu:35,card:25,creative:20,service:10};
const sectorBoost={
 restaurant:{menu:90,discovery:35,reviews:25,whatsapp:23},
 real_estate:{crm:75,website:30,whatsapp:30,ads:27},
 ecommerce:{website:35,crm:30,ads:30,reviews:30,whatsapp:25},
 services:{email:20,crm:20,website:15,discovery:15},
};
const validDate=value=>{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}(?:$|[T ])/.test(value))return null;
 const short=value.slice(0,10);
 const date=Date.parse(short+'T00:00:00Z');
 return Number.isFinite(date)&&new Date(date).toISOString().slice(0,10)===short?date:null;
};
export function rankServicesForBusiness(records,{profile={},missions=[],now=Date.now()}={}){
 const sector=String(profile.industry||'').toLowerCase();
 const text=[profile.goals,profile.difficulties].filter(Boolean).join(' ').toLowerCase();
 const focus=new Set((Array.isArray(missions)?missions:[])
  .filter(m=>!m.optional&&!['done','postponed','cancelled'].includes(m.status))
  .filter(m=>Number(m.priority)===1||['in_progress','active'].includes(m.status))
  .map(m=>m.capability||m.id));
 const score=record=>{
  const {kind,capabilities}=classify(record.name);
  let value=(baseImportance[kind]||10)+(sectorBoost[sector]?.[kind]||0);
  if(capabilities.some(c=>focus.has(c)))value+=80;
  if(/reservation|booking|menu/.test(text)&&kind==='menu')value+=30;
  if(/leads|sales|clients|customer|booking|appointment/.test(text)&&['crm','whatsapp','website'].includes(kind))value+=20;
  if(/automat|manual|time|efficien|repetit/.test(text)&&['automation','whatsapp'].includes(kind))value+=35;
  if(/visib|traffic|search|find|local/.test(text)&&['discovery','seo','ads'].includes(kind))value+=30;
  const status=String(record.status||'').toLowerCase();
  if(['waiting','waiting_client','needs_action','review','quote_ready'].includes(status))value+=1000;
  else if(['in_progress','production'].includes(status))value+=70;
  const deadline=validDate(record.dueDate);
  if(deadline!==null&&deadline<now+86400000*14)value+=deadline<now?500:260;
  const renewal=validDate(record.renewalDate);
  if(renewal!==null&&renewal<now+86400000*14)value+=renewal<now?420:230;
  return value;
 };
 return [...records].sort((a,b)=>score(b)-score(a)||String(a.name||'').localeCompare(String(b.name||''))||String(a.id||'').localeCompare(String(b.id||'')));
}
export function renderOwnedServiceCard(record,{esc,href,lang='en'}){
 const labels=translations[lang]||translations.en;
 const category=classify(record.name);
 const active=String(record.status||'').toLowerCase()==='active';
 const renewal=validDate(record.renewalDate)!==null?record.renewalDate.slice(0,10):null;
 return `<article class="hub-service-card hub-service-compact" data-service-kind="${category.kind}">
  <div class="hub-service-preview" aria-hidden="true"><span class="hub-service-mark">${esc(category.symbol)}</span></div>
  <div class="hub-service-card-body">
   <div class="hub-service-card-heading"><h3>${esc(record.name||'Service')}</h3><span class="hub-service-status ${active?'is-active':''}">${esc(record.status||'Pending')}</span></div>
   <p class="hub-service-benefit">${esc(labels.benefits[category.kind]||labels.benefits.service)}</p>
   ${renewal?`<p class="hub-service-renewal">${esc(labels.renewal)} · ${esc(renewal)}</p>`:''}
   <a class="hub-service-primary" href="${esc(href)}">${esc(labels.open)} <span aria-hidden="true">↗</span></a>
  </div>
 </article>`;
}
