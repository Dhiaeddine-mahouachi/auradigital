import { catalogue, groups, getItem, quote } from '../pricing/catalogue.js';
import { ApiError } from './http.js';

export const LANGUAGES = ['en','ar','fr','tr'];
export const clean = (v, n=2000) => typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,n) : '';
export const redact = v => clean(v,6000).replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[email]').replace(/(?:\+?\d[\s().-]*){8,}/g,'[phone]');
export const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
export const TEXT = {
  en:{unknown:"I don’t have verified information for that yet. The team can confirm the scope.",fallback:"I couldn’t connect to the AI assistant. Please retry, or contact our team.",contact:"You can reach the team through /contact or WhatsApp +90 538 550 76 74. No message has been sent.",quote:"Indicative estimate in TRY; the team must confirm scope and taxes.",once:"One-time",month:"Monthly",year:"Annual",total:"First-year total",renewal:"Standard infrastructure renewal",greeting:"Hi, I’m AuraDigital’s AI assistant. Tell me what you want to build and I’ll help you choose a suitable solution."},
  ar:{unknown:"لا تتوفر لدي معلومات موثوقة عن ذلك حالياً. يمكن للفريق تأكيد التفاصيل.",fallback:"تعذر الاتصال بمساعد الذكاء الاصطناعي. حاول مجدداً أو تواصل مع الفريق.",contact:"يمكنك التواصل مع الفريق عبر /contact أو WhatsApp +90 538 550 76 74. لم يتم إرسال أي رسالة.",quote:"تقدير بالليرة التركية؛ يجب تأكيد نطاق العمل والضرائب مع الفريق.",once:"مرة واحدة",month:"شهرياً",year:"سنوياً",total:"إجمالي السنة الأولى",renewal:"تجديد البنية التحتية الأساسية",greeting:"مرحباً، أنا مساعد AuraDigital بالذكاء الاصطناعي. أخبرني بما تريد إنشاءه وسأساعدك في اختيار الحل المناسب."},
  fr:{unknown:"Je n’ai pas encore d’information vérifiée à ce sujet. L’équipe peut confirmer les détails.",fallback:"La connexion à l’assistant IA a échoué. Réessayez ou contactez l’équipe.",contact:"Contactez l’équipe via /contact ou WhatsApp +90 538 550 76 74. Aucun message n’a été envoyé.",quote:"Estimation indicative en TRY ; le périmètre et les taxes doivent être confirmés.",once:"Paiement unique",month:"Mensuel",year:"Annuel",total:"Total première année",renewal:"Renouvellement infrastructure standard",greeting:"Bonjour, je suis l’assistant IA d’AuraDigital. Décrivez votre projet et je vous aiderai à choisir une solution adaptée."},
  tr:{unknown:"Bu konuda henüz doğrulanmış bilgim yok. Ekip kapsamı netleştirebilir.",fallback:"Yapay zekâ asistanına bağlanılamadı. Tekrar deneyin veya ekiple iletişime geçin.",contact:"Ekibe /contact veya WhatsApp +90 538 550 76 74 üzerinden ulaşabilirsiniz. Mesaj gönderilmedi.",quote:"TRY cinsinden tahmini fiyat; kapsam ve vergiler ekip tarafından onaylanmalıdır.",once:"Tek seferlik",month:"Aylık",year:"Yıllık",total:"İlk yıl toplamı",renewal:"Standart altyapı yenilemesi",greeting:"Merhaba, ben AuraDigital’in yapay zekâ asistanıyım. Ne yapmak istediğinizi anlatın; uygun çözümü birlikte seçelim."}
};
export function language(message, selected, previous='en') {
  if(LANGUAGES.includes(selected)) return selected;
  if(/\p{Script=Arabic}/u.test(message)) return 'ar';
  if(/\b(bonjour|merci|combien|devis|français|je veux|site pour|parlez|quels services|proposez|tarif)\b/i.test(message)) return 'fr';
  if(/[ğışİçöü]|\b(merhaba|fiyat|istiyorum|teklif|türkçe)\b/i.test(message)) return 'tr';
  if(/\b(hello|hi|how|website|please|english|need|want|both)\b/i.test(message)) return 'en';
  return LANGUAGES.includes(previous)?previous:'en';
}
const PAGE = {'/':'company','/home':'company','/index':'company','/aura-menu':'auramenu','/qr-menu':'auramenu','/aurapops':'aurapops','/nfc':'aurapops','/aura-weddings':'auraweddings','/auraweddings':'auraweddings','/spinflow':'spinflow','/websites':'website','/packages':'care','/services':'services','/portfolio':'portfolio','/contact':'contact','/about':'company'};
export function pageContext(value={}) {
  if(!value||typeof value!=='object'||Array.isArray(value)) value={};
  const path=clean(value.path,80).replace(/\.html$/,'').replace(/\/$/,'')||'/';
  const context={path:PAGE[path]?path:'/',category:PAGE[path]||'company',currency:'TRY',requestedCurrency:clean(value.currency,3),language:LANGUAGES.includes(value.language)?value.language:'en',visiblePackages:Array.isArray(value.visiblePackages)?value.visiblePackages.filter(id=>getItem(id)).slice(0,10):[]};
  if(value.selectedCustomization) {try{context.selectedCustomization=validateSelection(value.selectedCustomization);}catch{}}
  return context;
}
export function intent(message) {
  if(/api.?key|system prompt|ignore .*instructions|other customer|another customer|secret|unauthorized discount/i.test(message)) return 'restricted';
  if(/human|employee|complaint|support|insan|destek|موظف|دعم|humain|plainte/i.test(message)) return 'handoff';
  if(/quote|estimate|devis|teklif|عرض سعر/i.test(message)) return 'quotation';
  if(/price|cost|how much|combien|fiyat|سعر|كم/i.test(message)) return 'pricing';
  if(/compare|difference|différence|fark|فرق/i.test(message)) return 'comparison';
  return 'discovery';
}
export function category(message, page, previous) {
  if(/portfolio|previous projects|client work|réalisations|portföy|أعمالكم/i.test(message)) return 'portfolio';
  for(const [name,re] of [['auramenu',/auramenu|qr menu|digital menu|\ba menu\b|menü|قائمة|menu numérique/i],['aurapops',/aurapops|nfc|business card|بطاقة/i],['auraweddings',/wedding|invitation|düğün|زفاف|mariage/i],['spinflow',/spinflow|erp|inventory|stock|مخزون/i],['care',/maintenance|website management|bakım|صيانة|gestion du site/i],['infrastructure',/hosting|domain|security|email|hébergement|domaine|sécurité|استضافة|نطاق|أمان|barındırma|güvenlik|alan adı/i],['advertising',/google ads|meta ads|advertising|reklam|إعلان|publicité|seo/i],['website',/website|web site|landing|موقع|site web|restaurant|restoran|مطعم|e-commerce|dashboard|réservation|لوحة|web sitesi/i]]) if(re.test(message)) return name;
  return previous||page.category;
}
export function validateSelection(v) {
  if(!v||typeof v!=='object'||Array.isArray(v)||!getItem(v.id)) throw new ApiError(400,'Unknown package.');
  if(v.addons!==undefined&&(!Array.isArray(v.addons)||v.addons.length>10||v.addons.some(x=>typeof x!=='string'))) throw new ApiError(400,'Invalid add-ons.');
  for(const key of ['standardHosting','enhancedHosting','managedErpHosting']) if(v[key]!==undefined&&typeof v[key]!=='boolean') throw new ApiError(400,'Invalid hosting selection.');
  for(const key of ['extraUsers','extraBranches']) if(v[key]!==undefined&&(!Number.isInteger(v[key])||v[key]<0||v[key]>100)) throw new ApiError(400,'Invalid quantity.');
  const selection={id:v.id,addons:v.addons||[],standardHosting:v.standardHosting===true,enhancedHosting:v.enhancedHosting===true,managedErpHosting:v.managedErpHosting!==false,extraUsers:v.extraUsers||0,extraBranches:v.extraBranches||0};
  try { quote(selection); } catch(e) { throw new ApiError(400,e.message); }
  return selection;
}
export function estimate(v) {
  const selection=validateSelection(v), item=getItem(selection.id), totals=quote(selection);
  // The existing catalogue defines Scale Commerce as commerce OR booking, not both included.
  if(selection.id==='scale-commerce'&&selection.addons.includes('ecommerce')&&selection.addons.includes('booking')) throw new ApiError(400,'Commerce plus booking requires a scoped proposal.');
  const lines=[{id:item.id,name:item.name,amount:item.price,billing:item.billing||'once'}];
  for(const id of totals.addons) {const addon=getItem(id);lines.push({id,name:addon.name,amount:addon.price,billing:addon.billing||'once'});}
  if(selection.standardHosting&&!item.infraIncluded) lines.push({id:'standard-infra',name:getItem('standard-infra').name,amount:getItem('standard-infra').price,billing:'year'});
  if(selection.enhancedHosting) lines.push({id:'managed-hosting',name:getItem('managed-hosting').name,amount:getItem('managed-hosting').price,billing:'month'});
  if(catalogue.erp.includes(item)&&selection.managedErpHosting) lines.push({id:'erp-hosting',name:'Managed ERP hosting',amount:item.annualHosting,billing:'year'});
  if(selection.extraUsers) lines.push({id:'saas-user',name:`Additional users × ${selection.extraUsers}`,amount:selection.extraUsers*getItem('saas-user').price,billing:'month'});
  if(selection.extraBranches) lines.push({id:'saas-branch',name:`Additional branches × ${selection.extraBranches}`,amount:selection.extraBranches*getItem('saas-branch').price,billing:'month'});
  if(item.id==='managed-growth'&&selection.addons.includes('advanced-ads')) lines.push({id:'advanced-ads-upgrade',name:'Advanced Ads upgrade',amount:getItem('advanced-ads').price-getItem('basic-ads').price,billing:'month'});
  return {...totals,currency:'TRY',selection,lines,features:item.features||[],availability:item.availability||'subject-to-scope',renewalAnnual:catalogue.website.includes(item)&&item.infraIncluded&&!selection.enhancedHosting?getItem('standard-infra').price:totals.annual,humanReview:true,exclusions:['Taxes pending confirmation','Advertising media spend','Third-party subscriptions','Unscoped integrations']};
}
export function quoteText(q,lang) {
  const t=TEXT[lang]||TEXT.en;
  return [t.quote,...q.lines.map(l=>`${l.name}: ${l.amount.toLocaleString(lang)} TRY (${l.billing==='month'?t.month:l.billing==='year'?t.year:t.once})`),`${t.once}: ${q.once} TRY · ${t.month}: ${q.monthly} TRY · ${t.year}: ${q.annual} TRY`,`${t.total}: ${q.firstYear} TRY`,`${t.renewal}: ${q.renewalAnnual} TRY/year`,...(q.availability==='planned'?['Spinflow: planned, availability must be confirmed.']:[])].join('\n');
}
export const services = () => groups.flatMap(group=>catalogue[group].map(item=>({...item,group})));
export function rankKnowledge(rows,query,cat,lang) {
  const words=clean(query).toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu)||[];
  return rows.filter(r=>r.status==='active'&&r.visibility==='public').map(r=>({...r,score:Math.min(8,words.reduce((s,w)=>s+((r.title+' '+r.content).toLocaleLowerCase().includes(w)?2:0),0))+(r.category===cat?24:0)+(r.source_type==='repository'?10:0)+(r.language===lang?2:0)+Number(r.priority||0)/25+(Date.parse(r.verified_at)>Date.now()-90*86400000?1:0)})).filter(r=>r.score>=4).sort((a,b)=>b.score-a.score).slice(0,5);
}
