const labels={
 en:['Home','Roadmap','Ask Auri','My Services','Build your roadmap','Tell Auri about your business to get your first step.','Build my roadmap','Continue setup','Next on your roadmap','Needs your attention','In progress','Active services','Review your menu','Open request','No items need your attention.','No work in progress.','No active services yet.','Welcome to','Roadmap complete','Return to record','Helping with','Start small','Build systems','Scale with AI','Locked','Current stage','Record unavailable','Menu draft ready for review','Mark reviewed','Request details','Tell me about your business.'],
 fr:['Accueil','Feuille de route','Demander à Auri','Mes services','Créez votre feuille de route','Présentez votre activité à Auri pour obtenir votre première étape.','Créer ma feuille de route','Poursuivre','Prochaine étape','À examiner','En cours','Services actifs','Examiner votre menu','Ouvrir la demande','Aucun élément à examiner.','Aucun travail en cours.','Aucun service actif pour le moment.','Bienvenue dans','Feuille de route terminée','Revenir au dossier','Aide pour','Commencer simplement','Structurer votre activité','Se développer avec l’IA','Verrouillé','Étape actuelle','Dossier indisponible','Brouillon du menu à examiner','Marquer comme examiné','Détails de la demande','Présentez-moi votre activité.'],
 tr:['Ana sayfa','Yol haritası','Auri’ye sor','Hizmetlerim','Yol haritanızı oluşturun','İlk adımınızı öğrenmek için Auri’ye işletmenizi anlatın.','Yol haritamı oluştur','Kuruluma devam et','Sıradaki adım','İşlem bekleyenler','Devam edenler','Aktif hizmetler','Menünüzü inceleyin','Talebi aç','İşlem bekleyen öğe yok.','Devam eden iş yok.','Henüz aktif hizmet yok.','Hoş geldiniz','Yol haritası tamamlandı','Kayda dön','Yardım konusu','Küçük başlayın','Sistem kurun','Yapay zekâ ile büyüyün','Kilitli','Geçerli aşama','Kayıt kullanılamıyor','Menü taslağı incelemeye hazır','İncelendi olarak işaretle','Talep ayrıntıları','Bana işletmenizi anlatın.'],
 ar:['الرئيسية','خارطة الطريق','اسأل أوري','خدماتي','أنشئ خارطة طريقك','أخبر أوري عن نشاطك لتحصل على خطوتك الأولى.','أنشئ خارطة طريقي','تابع الإعداد','خطوتك التالية','يتطلب انتباهك','قيد التنفيذ','الخدمات النشطة','راجع قائمتك','افتح الطلب','لا توجد عناصر تتطلب انتباهك.','لا توجد أعمال قيد التنفيذ.','لا توجد خدمات نشطة بعد.','مرحبًا بك في','اكتملت خارطة الطريق','العودة إلى السجل','المساعدة في','ابدأ بخطوات بسيطة','ابنِ أنظمة','توسّع بالذكاء الاصطناعي','مغلق','المرحلة الحالية','السجل غير متاح','مسودة القائمة جاهزة للمراجعة','تمت المراجعة','تفاصيل الطلب','أخبرني عن نشاطك التجاري.'],
};
const keys=['home','journey','assistant','services','build','buildNote','buildAction','continue','next','attention','progress','active','reviewMenu','openRequest','emptyAttention','emptyProgress','emptyActive','welcome','complete','return','context','small','systems','scale','locked','current','unavailable','menuReady','reviewed','requestDetails','intake'];
export const hubLabels=lang=>Object.fromEntries(keys.map((key,index)=>[key,(labels[lang]||labels.en)[index]]));
export const destinations={home:'',journey:'roadmap',assistant:'auri',services:'work',menuDrafts:'menu-drafts',profile:'profile',settings:'settings',resources:'resources',tasks:'tasks',simulator:'simulator',team:'team',insights:'insights',projects:'projects',websites:'websites',hosting:'hosting',files:'files',reports:'reports',invoices:'invoices',rewards:'rewards',support:'support',onboarding:'onboarding'};
export const hubStage=level=>Math.max(0,Math.min(4,(Number(level)||1)-1));
export const hubStageNames=lang=>({
 en:['Foundation','Visibility','Conversion','Operations','Scale'],
 fr:['Fondations','Visibilité','Conversion','Opérations','Croissance'],
 tr:['Temel','Görünürlük','Dönüşüm','Operasyon','Büyüme'],
 ar:['التأسيس','الظهور','التحويل','العمليات','التوسع'],
}[lang]||['Foundation','Visibility','Conversion','Operations','Scale']);
export const hubIcons={
 home:'<path d="M3 10 12 3l9 7v10H3z M9 20v-7h6v7"/>',
 journey:'<path d="m2 8 10-5 10 5-10 5z M2 12l10 5 10-5 M2 16l10 5 10-5"/>',
 assistant:'<path d="M4 4h16a2 2 0 0 1 2 2v10H10l-6 4v-4H2V6a2 2 0 0 1 2-2z M7 10h1m3 0h1m3 0h1"/>',
 services:'<path d="M3 7h18v13H3z M8 7V4h8v3 M3 12h18m-11 0v2h4v-2"/>',
 profile:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/>',
};
export const hubIcon=id=>`<svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round" fill="none" aria-hidden="true">${hubIcons[id]||hubIcons.services}</svg>`;
export function currentHubLocation() {
 const slug=location.pathname.split('/')[2]||'';
 const page=Object.keys(destinations).find(key=>destinations[key]===slug)||'home';
 return {page,query:new URLSearchParams(location.search)};
}
export function hubLink(page,workspace,params={}) {
 const query=new URLSearchParams(workspace?{workspace}:{});
 for(const [key,value] of Object.entries(params))if(value)query.set(key,value);
 return '/hub'+(destinations[page]?'/'+destinations[page]:'')+(query.size?'?'+query:'');
}
