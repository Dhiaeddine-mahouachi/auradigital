import { createPricingEngine } from "./catalogue.js";
// Load approved server prices before rendering; browser language never selects a region.
let pricingResponse=await fetch('/api/pricing'+(new URL(location.href).searchParams.has('region')?'?region='+encodeURIComponent(new URL(location.href).searchParams.get('region')):''),{cache:'no-store'});
if(!pricingResponse.ok) throw new Error('Regional pricing unavailable');
let pricingData=await pricingResponse.json();
let {catalogue,getItem,fmt,priceText,quote,firstYearWebsite,firstYearERP}=createPricingEngine(pricingData.catalogue);

const W=window;
const locale=()=>W.__auraLang || document.documentElement.lang || "en";
const tr={
 "Starting from":"Başlangıç","View packages":"Paketleri incele","Choose Package":"Paket seç","Request Quote":"Teklif iste",
 "Book a Call":"Görüşme talep et","One-time":"Tek seferlik","Monthly":"Aylık","Annual":"Yıllık",
 "First year with standard hosting":"Standart barındırma ile ilk yıl","First-year standard infrastructure included":"İlk yıl standart altyapı dahil",
 "Hosting not included":"Barındırma dahil değil","Included in the plan":"Pakete dahil",
 "View full features":"Tüm özellikleri gör","Standard hosting/domain/security optional":"Standart hosting/alan adı/güvenlik isteğe bağlı",
 "Compare packages":"Paketleri karşılaştır","Website add-ons":"Web sitesi eklentileri","Optional standard infrastructure":"İsteğe bağlı standart altyapı",
 "Choose your package":"Paketinizi seçin","Selected additions":"Seçili eklentiler","Estimated one-time":"Tahmini tek seferlik",
 "Estimated monthly":"Tahmini aylık","Estimated annual":"Tahmini yıllık","First-year indicative total":"Tahmini ilk yıl toplamı",
 "Request this estimate":"Bu tahmini fiyat için teklif iste","No duplicate charges for included features.":"Dahil olan özellikler için tekrar ücret alınmaz.",
 "Your selection":"Seçiminiz","Websites & Development":"Web Siteleri ve Geliştirme","Website Management":"Web Sitesi Yönetimi",
 "Hosting & Security":"Barındırma ve Güvenlik","Advertising & Growth":"Reklam ve Büyüme","Business Systems & ERP":"İş Sistemleri ve ERP",
 "Dashboards & Automation":"Paneller ve Otomasyon","Service pricing":"Hizmet fiyatları","Explore website packages":"Web sitesi paketlerini incele",
 "Website care packages":"Web sitesi bakım paketleri","Infrastructure & email":"Altyapı ve e-posta",
 "Ads management":"Reklam yönetimi","ERP & systems":"ERP ve sistemler","Other services":"Diğer hizmetler",
 "Business Email":"Kurumsal e-posta","Web Design & Development":"Web Tasarım ve Geliştirme","Google & Meta Ads":"Google ve Meta Reklamları",
 "Website Care":"Web Sitesi Bakımı","SEO & Google Maps":"SEO ve Google Haritalar","AI & Automation":"Yapay Zeka ve Otomasyon",
 "Brand & Creative Direction":"Marka ve Kreatif Yönetim","NFC & QR":"NFC ve QR","Explore":"İncele",
 "Hosting & domain renewal not included.":"Barındırma ve alan adı yenilemesi dahil değildir.",
 "Advertising media spend is not included.":"Reklam medya bütçesi dahil değildir.",
 "Initial setup and one-channel basic ads management included; do not add them again.":"İlk kurulum ve tek kanallı temel reklam yönetimi dahildir; ikinci kez ücretlendirilmez.",
 "Advanced Ads upgrade from Managed Growth":"Managed Growth üzerinden Gelişmiş Reklam yükseltmesi",
 "SaaS (monthly)":"SaaS (aylık)","Custom ERP (one-time)":"Özel ERP (tek seferlik)",
 "Planned service · request availability":"Planlanan hizmet · uygunluk sorunuz",
 "Includes standard SaaS hosting, security and updates.":"Standart SaaS barındırma, güvenlik ve güncellemeler dahildir.",
 "Managed ERP hosting":"ERP için yönetilen barındırma","Customer-managed hosting available by approval.":"Onayla müşterinin kendi barındırması mümkündür.",
 "First year with managed ERP hosting":"Yönetilen ERP barındırması ile ilk yıl",
 "Custom ERP support":"Özel ERP desteği","Scoped from":"Kapsama göre başlangıç",
 "Module add-ons":"Modül eklentileri","Includes":"Dahil","No hosting double billing.":"Tekrarlanan barındırma ücreti yoktur.",
 "Compare plans":"Planları karşılaştır","Updates / month":"Aylık güncelleme","Hosting renewal":"Barındırma yenileme",
 "Ads management":"Reklam yönetimi","Request consultation":"Görüşme talep et","Request pricing":"Fiyat teklifi iste",
 "Features":"Özellikler","Only choose services you need.":"Yalnızca ihtiyacınız olan hizmetleri seçin.",
 "Standard hosting: first year included; renewal is separate.":"Standart barındırma ilk yıl dahildir; yenileme ayrı ücretlendirilir.",
 "Enhanced hosting replaces the equivalent standard bundle.":"Gelişmiş barındırma aynı standart paketin yerini alır.",
 "Third-party mailbox subscriptions billed separately.":"Üçüncü taraf e-posta abonelikleri ayrıca ücretlendirilir.",
 "A Business Platform is not a complete ERP.":"Business Platform tam bir ERP değildir.",
 "From":"Başlangıç",
};
// Price labels and plan inclusions are translated from the same catalogue records.
Object.assign(tr, {
 "Small businesses launching online":"Çevrimiçi hizmete başlayan küçük işletmeler",
 "Growing brands with multiple services":"Birden fazla hizmet sunan büyüyen markalar",
 "Teams needing secure data access":"Güvenli veri erişimine ihtiyaç duyan ekipler",
 "Shops and service booking businesses":"Mağazalar ve randevulu hizmet işletmeleri",
 "Businesses needing connected digital workflows":"Bağlantılı dijital iş akışlarına ihtiyaç duyan işletmeler",
 "Small sites requiring dependable upkeep":"Düzenli bakıma ihtiyaç duyan küçük siteler",
 "Active businesses needing regular changes":"Düzenli güncelleme isteyen aktif işletmeler",
 "Sites with ongoing conversion improvements":"Sürekli dönüşüm iyileştirmesi isteyen siteler",
 "Businesses combining web care and advertising":"Site bakımı ve reklam yönetimini birleştiren işletmeler",
 "Up to 3 pages":"3 sayfaya kadar",
 "Responsive design":"Mobil uyumlu tasarım",
 "Contact form":"İletişim formu",
 "WhatsApp integration":"WhatsApp entegrasyonu",
 "Basic SEO":"Temel SEO",
 "4–10 pages":"4–10 sayfa",
 "Premium custom design":"Premium özel tasarım",
 "Lead forms":"Potansiyel müşteri formları",
 "Animations":"Animasyonlar",
 "SEO-ready structure":"SEO'ya hazır altyapı",
 "Business website":"Kurumsal web sitesi",
 "Basic dashboard":"Temel yönetim paneli",
 "Login and user roles":"Giriş ve kullanıcı rolleri",
 "Data management":"Veri yönetimi",
 "First-year standard infrastructure":"İlk yıl standart altyapı",
 "E-commerce OR booking website (choose one)":"E-ticaret VEYA rezervasyon sitesi (birini seçin)",
 "Payments":"Ödemeler",
 "Order or appointment management":"Sipariş veya randevu yönetimi",
 "Administration interface":"Yönetim arayüzü",
 "Website":"Web sitesi",
 "Customer dashboard":"Müşteri paneli",
 "Lightweight CRM":"Hafif CRM",
 "Limited workflow automation":"Sınırlı iş akışı otomasyonu",
 "Scoped integrations":"Kapsamı belirlenmiş entegrasyonlar",
 "2 small content updates per month total":"Ayda toplam 2 küçük içerik güncellemesi",
 "Uptime monitoring":"Erişilebilirlik takibi",
 "Basic security checks":"Temel güvenlik kontrolleri",
 "Routine website checks":"Rutin site kontrolleri",
 "Everything in Essential Care":"Essential Care paketindeki her şey",
 "8 content updates per month total":"Ayda toplam 8 içerik güncellemesi",
 "Technical maintenance":"Teknik bakım",
 "Monthly report":"Aylık rapor",
 "Support for one existing business email mailbox":"Mevcut bir kurumsal e-posta kutusu için destek",
 "Everything in Business Care":"Business Care paketindeki her şey",
 "16 updates per month total":"Ayda toplam 16 güncelleme",
 "Performance checks":"Performans kontrolleri",
 "SEO reporting":"SEO raporlaması",
 "Scoped conversion improvements":"Kapsamı belirli dönüşüm iyileştirmeleri",
 "Everything in Growth Care":"Growth Care paketindeki her şey",
 "24 updates per month total":"Ayda toplam 24 güncelleme",
 "Priority support":"Öncelikli destek",
 "Scoped landing-page optimization":"Kapsamı belirli açılış sayfası optimizasyonu",
 "Basic one-channel ads management":"Tek kanallı temel reklam yönetimi",
 "Initial standard ads setup included":"İlk standart reklam kurulumu dahil",
 "Standard website hosting":"Standart web barındırma",
 "Eligible standard domain":"Uygun standart alan adı",
 "DNS configuration":"DNS yapılandırması",
 "SSL":"SSL",
 "Baseline security configuration":"Temel güvenlik yapılandırması",
 "Enhanced managed infrastructure replaces equivalent standard hosting coverage":"Gelişmiş yönetilen altyapı eşdeğer standart barındırmanın yerini alır",
 "Domain registration priced separately unless agreed":"Aksi kararlaştırılmadıkça alan adı kaydı ayrıca ücretlendirilir",
 "First mailbox configuration":"İlk posta kutusunun kurulumu",
 "Third-party mailbox subscriptions charged separately":"Üçüncü taraf e-posta abonelikleri ayrı ücretlendirilir",
 "Per additional mailbox":"Ek posta kutusu başına",
 "Provider subscription not included":"Sağlayıcı aboneliği dahil değil",
 "Scoped security configuration and hardening":"Kapsamı belirlenmiş güvenlik sıkılaştırması",
 "Initial standard campaign setup":"İlk standart kampanya kurulumu",
 "One advertising channel":"Tek reklam kanalı",
 "Campaign oversight and optimization":"Kampanya takibi ve optimizasyonu",
 "Broader scoped campaign management":"Daha geniş kapsamlı kampanya yönetimi",
 "Reporting":"Raporlama",
 "CRM":"CRM",
 "Sales tracking":"Satış takibi",
 "Basic inventory":"Temel stok yönetimi",
 "3 included users":"3 kullanıcı dahil",
 "Standard cloud hosting, security and updates":"Standart bulut barındırma, güvenlik ve güncellemeler",
 "Everything in Start":"Start paketindeki her şey",
 "Advanced inventory":"Gelişmiş stok yönetimi",
 "Purchasing and expenses":"Satın alma ve giderler",
 "Staff permissions":"Personel yetkileri",
 "Workflow automation":"İş akışı otomasyonu",
 "10 included users":"10 kullanıcı dahil",
 "Standard SaaS infrastructure":"Standart SaaS altyapısı",
 "Everything in Business":"Business paketindeki her şey",
 "Advanced reporting":"Gelişmiş raporlama",
 "API access within plan limits":"Paket sınırlarında API erişimi",
 "Up to 3 branches":"3 şubeye kadar",
 "25 included users":"25 kullanıcı dahil",
 "Sales":"Satış",
 "Inventory":"Stok",
 "Dashboard":"Yönetim paneli",
 "User permissions":"Kullanıcı yetkileri",
 "Essential features":"Essential özellikleri",
 "Purchasing":"Satın alma",
 "Expenses":"Giderler",
 "Workflows":"İş akışları",
 "Multi-department architecture":"Çok departmanlı mimari",
 "Custom modules":"Özel modüller",
 "Advanced roles":"Gelişmiş roller",
 "Integrations":"Entegrasyonlar",
 "Standard hosting, eligible domain & baseline security":"Standart barındırma, alan adı ve temel güvenlik",
 "Enhanced managed hosting":"Gelişmiş yönetilen barındırma",
 "First business email mailbox setup":"İlk kurumsal e-posta hesabı kurulumu",
 "Additional business email mailbox setup":"Ek kurumsal e-posta hesabı kurulumu",
 "Advanced security hardening":"Gelişmiş güvenlik sıkılaştırması",
 "Advertising setup":"Reklam kurulumu",
 "Basic Ads Management":"Temel Reklam Yönetimi",
 "Advanced Ads Management":"Gelişmiş Reklam Yönetimi",
 "Reporting dashboard":"Raporlama paneli",
 "Restaurant POS/order module":"Restoran POS/sipariş modülü",
 "HR/attendance module":"İK/devam takibi modülü",
 "Accounting integration":"Muhasebe entegrasyonu",
 "Custom API integration":"Özel API entegrasyonu",
 "Advanced dashboard":"Gelişmiş yönetim paneli",
 "E-commerce module":"E-ticaret modülü",
 "Booking module":"Rezervasyon modülü",
 "Lightweight CRM module":"Hafif CRM modülü",
 "Additional SaaS user":"Ek SaaS kullanıcısı",
 "Additional SaaS branch beyond plan allowance":"Paket sınırını aşan ek SaaS şubesi",
 "Custom ERP maintenance / support":"Özel ERP bakım/destek",
 "Business websites, landing pages and web applications.":"Kurumsal web siteleri, açılış sayfaları ve web uygulamaları.",
 "Campaign setup, conversion tracking and management.":"Kampanya kurulumu, dönüşüm takibi ve yönetimi.",
 "Website maintenance, uptime checks and defined monthly updates.":"Web bakımı, erişilebilirlik kontrolleri ve aylık güncellemeler.",
 "Domain, DNS, SSL, hosting and baseline protection.":"Alan adı, DNS, SSL, barındırma ve temel koruma.",
 "Business mailbox setup; provider subscriptions are separate.":"Kurumsal e-posta kurulumu; sağlayıcı aboneliği ayrı.",
 "Cloud SaaS and scoped custom ERP for business operations.":"Onaylı aylık SaaS planları ve özel ERP seçenekleri.",
 "Local visibility, Google Business profile and on-page SEO.":"Yerel görünürlük, Google İşletme Profili ve site içi SEO.",
 "Lead routing, WhatsApp flows and scoped workflow automation.":"Müşteri yönlendirme, WhatsApp akışları ve iş akışı otomasyonları.",
 "Identity systems, creative direction and advertising assets.":"Kurumsal kimlik, kreatif yönlendirme ve reklam materyalleri.",
 "NFC cards, digital menus and smart customer experiences.":"NFC kartlar, dijital menüler ve akıllı müşteri deneyimleri.",
 "Interactive wedding invitations, themes and RSVP.":"Etkileşimli düğün davetiyeleri, temalar ve LCV."
});
const featuresTR = {
"Small businesses launching online":"İnternette faaliyete geçen küçük işletmeler",
"Growing brands with multiple services":"Birden fazla hizmet sunan büyüyen markalar",
"Teams needing secure data access":"Güvenli veri erişimine ihtiyaç duyan ekipler",
"Shops and service booking businesses":"Mağazalar ve randevulu hizmet işletmeleri",
"Businesses needing connected digital workflows":"Bağlantılı dijital iş akışlarına ihtiyaç duyan işletmeler",
"Up to 3 pages":"En fazla 3 sayfa","Responsive design":"Mobil uyumlu tasarım",
"Contact form":"İletişim formu","WhatsApp integration":"WhatsApp entegrasyonu","Basic SEO":"Temel SEO",
"4–10 pages":"4–10 sayfa","Premium custom design":"Özel premium tasarım","Lead forms":"Potansiyel müşteri formları",
"Animations":"Animasyonlar","SEO-ready structure":"SEO'ya hazır yapı","Business website":"Kurumsal web sitesi",
"Basic dashboard":"Temel yönetim paneli","Login and user roles":"Giriş ve kullanıcı rolleri","Data management":"Veri yönetimi",
"First-year standard infrastructure":"İlk yıl standart altyapı","E-commerce OR booking website (choose one)":"E-ticaret VEYA rezervasyon sitesi (birini seçin)",
"Payments":"Ödemeler","Order or appointment management":"Sipariş veya randevu yönetimi",
"Administration interface":"Yönetim arayüzü","Website":"Web sitesi","Customer dashboard":"Müşteri paneli",
"Lightweight CRM":"Hafif CRM","Limited workflow automation":"Sınırlı iş akışı otomasyonu",
"Scoped integrations":"Kapsamı belirlenmiş entegrasyonlar",
"Small sites requiring dependable upkeep":"Güvenilir bakım ihtiyacı olan küçük siteler",
"Active businesses needing regular changes":"Düzenli güncelleme gerektiren işletmeler",
"Sites with ongoing conversion improvements":"Sürekli dönüşüm iyileştirmesi yapan siteler",
"Businesses combining web care and advertising":"Web sitesi bakımı ve reklamı birleştiren işletmeler",
"2 small content updates per month total":"Ayda toplam 2 küçük içerik güncellemesi",
"Uptime monitoring":"Erişilebilirlik takibi","Basic security checks":"Temel güvenlik kontrolleri",
"Routine website checks":"Rutin web sitesi kontrolleri","Everything in Essential Care":"Essential Care kapsamındaki her şey",
"8 content updates per month total":"Ayda toplam 8 içerik güncellemesi","Technical maintenance":"Teknik bakım",
"Monthly report":"Aylık rapor","Support for one existing business email mailbox":"Mevcut bir kurumsal e-posta kutusuna destek",
"Everything in Business Care":"Business Care kapsamındaki her şey","16 updates per month total":"Ayda toplam 16 güncelleme",
"Performance checks":"Performans kontrolleri","SEO reporting":"SEO raporlaması",
"Scoped conversion improvements":"Kapsamı belirlenmiş dönüşüm iyileştirmeleri",
"Everything in Growth Care":"Growth Care kapsamındaki her şey","24 updates per month total":"Ayda toplam 24 güncelleme",
"Priority support":"Öncelikli destek","Scoped landing-page optimization":"Kapsamlı açılış sayfası optimizasyonu",
"Basic one-channel ads management":"Tek kanalda temel reklam yönetimi",
"Initial standard ads setup included":"İlk standart reklam kurulumu dahil",
"Standard hosting, eligible domain & baseline security":"Standart hosting, uygun alan adı ve temel güvenlik",
"Standard website hosting":"Standart web sitesi barındırma","Eligible standard domain":"Uygun standart alan adı",
"DNS configuration":"DNS yapılandırması","SSL":"SSL","Baseline security configuration":"Temel güvenlik yapılandırması",
"Enhanced managed hosting":"Gelişmiş yönetilen hosting",
"Enhanced managed infrastructure replaces equivalent standard hosting coverage":"Gelişmiş yönetilen altyapı aynı standart barındırmanın yerini alır",
"Domain registration priced separately unless agreed":"Aksi kararlaştırılmadıkça alan adı kaydı ayrı fiyatlandırılır",
"First business email mailbox setup":"İlk kurumsal e-posta kutusu kurulumu",
"First mailbox configuration":"İlk posta kutusunun yapılandırılması",
"Third-party mailbox subscriptions charged separately":"Üçüncü taraf posta kutusu abonelikleri ayrı ücretlendirilir",
"Additional business email mailbox setup":"Ek kurumsal e-posta kutusu kurulumu",
"Per additional mailbox":"Her ek posta kutusu için","Provider subscription not included":"Sağlayıcı aboneliği dahil değil",
"Advanced security hardening":"İleri seviye güvenlik sertleştirme",
"Scoped security configuration and hardening":"Kapsama göre güvenlik ayarları ve sertleştirme",
"Advertising setup":"Reklam kurulumu","Initial standard campaign setup":"İlk standart kampanya kurulumu",
"Basic Ads Management":"Temel Reklam Yönetimi","One advertising channel":"Tek reklam kanalı",
"Campaign oversight and optimization":"Kampanya takibi ve optimizasyonu",
"Advanced Ads Management":"Gelişmiş Reklam Yönetimi",
"Broader scoped campaign management":"Daha geniş kapsamlı kampanya yönetimi","Reporting":"Raporlama",
"CRM":"CRM","Sales tracking":"Satış takibi","Basic inventory":"Temel stok yönetimi",
"3 included users":"3 kullanıcı dahil","Standard cloud hosting, security and updates":"Standart bulut barındırma, güvenlik ve güncellemeler",
"Everything in Start":"Start kapsamındaki her şey","Advanced inventory":"Gelişmiş stok yönetimi",
"Purchasing and expenses":"Satın alma ve giderler","Staff permissions":"Personel yetkileri",
"Workflow automation":"İş akışı otomasyonu","10 included users":"10 kullanıcı dahil",
"Standard SaaS infrastructure":"Standart SaaS altyapısı",
"Everything in Business":"Business kapsamındaki her şey",
"Advanced reporting":"Gelişmiş raporlama","API access within plan limits":"Plan sınırları dahilinde API erişimi",
"Up to 3 branches":"En fazla 3 şube","25 included users":"25 kullanıcı dahil",
"Additional SaaS user":"Ek SaaS kullanıcısı",
"Additional SaaS branch beyond plan allowance":"Plan hakkının üzerindeki ek SaaS şubesi",
"Sales":"Satış","Inventory":"Stok","Dashboard":"Yönetim paneli","User permissions":"Kullanıcı yetkileri",
"Essential features":"Essential özellikleri","Purchasing":"Satın alma","Expenses":"Giderler",
"Workflows":"İş akışları","Multi-department architecture":"Çok departmanlı mimari",
"Custom modules":"Özel modüller","Advanced roles":"Gelişmiş roller",
"Integrations":"Entegrasyonlar","ERP Essential":"ERP Essential","ERP Business":"ERP Business",
"ERP Enterprise":"ERP Enterprise","Reporting dashboard":"Raporlama paneli",
"Restaurant POS/order module":"Restoran POS/sipariş modülü","HR/attendance module":"İK/devam takip modülü",
"Accounting integration":"Muhasebe entegrasyonu","Custom API integration":"Özel API entegrasyonu",
"Advanced dashboard":"Gelişmiş yönetim paneli","E-commerce module":"E-ticaret modülü",
"Booking module":"Rezervasyon modülü","Lightweight CRM module":"Hafif CRM modülü",
"Websites & Development":"Web Siteleri ve Geliştirme",
"Website Management":"Web Sitesi Yönetimi","Hosting & Security":"Barındırma ve Güvenlik",
"Advertising & Growth":"Reklam ve Büyüme","Business Systems & ERP":"İş Sistemleri ve ERP",
"Dashboards & Automation":"Yönetim Panelleri ve Otomasyon",
};
function t(value){ if(locale()!=="tr") return value; return tr[value] || featuresTR[value] || W.AuraI18n?.translate(value) || value; }
const safe=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const money=n=>fmt(n,locale());
const price=p=>priceText(p,locale());
const period=p=>p.billing==="month"?t("Monthly"):p.billing==="year"?t("Annual"):t("One-time");
const features=p=>'<ul class="aura-price-features">'+p.features.map(f=>'<li>'+safe(t(f))+'</li>').join("")+'</ul>';
function linkFor(id, options={}) {
 const u=new URL("/contact",location.origin);
 u.searchParams.set("service","pricing");
 u.searchParams.set("plan",id);
 u.searchParams.set("v",catalogue.version);
 u.searchParams.set("region",catalogue.region);
 if(options.addons?.length)u.searchParams.set("addons",options.addons.join(","));
 if(options.standardHosting)u.searchParams.set("infra","standard");
 if(options.enhancedHosting)u.searchParams.set("infra","enhanced");
 if(options.managedErpHosting===false)u.searchParams.set("erp-hosting","customer");
 if(options.extraUsers)u.searchParams.set("users",String(options.extraUsers));
 if(options.extraBranches)u.searchParams.set("branches",String(options.extraBranches));
 try {
   const q=quote({id,addons:options.addons,standardHosting:options.standardHosting,enhancedHosting:options.enhancedHosting,managedErpHosting:options.managedErpHosting,extraUsers:options.extraUsers||0,extraBranches:options.extraBranches||0});
   for(const key of ["once","monthly","annual"])u.searchParams.set(key,String(q[key]));
 } catch(_) {}
 return u.pathname+u.search;
}
function card(p,{featured=false,extra="",label="Choose Package",options={}}={}) {
 return '<article class="aura-price-card '+(featured?'is-featured':'')+'">'+
 (featured?'<span class="aura-price-tag">POPULAR</span>':'')+
 '<h3>'+safe(p.name)+'</h3>'+
 (p.audience?'<p class="aura-price-audience">'+safe(t(p.audience))+'</p>':'')+
 '<p class="aura-price-money">'+safe(price(p))+'</p><small class="aura-price-period">'+safe(period(p))+'</small>'+
 (p.availability==="planned"?'<p class="aura-price-warning">'+safe(t("Planned service · request availability"))+'</p>':'')+
 (p.features?'<details class="aura-price-details" open><summary>'+safe(t("View full features"))+'</summary>'+features(p)+'</details>':'')+
 extra+
 '<a class="btn '+(featured?'btn-primary':'btn-ghost')+'" href="'+safe(linkFor(p.id,options))+'">'+safe(t(label))+' ↗</a></article>';
}
const $=s=>document.querySelector(s);
function home(){
 const target=$('[data-pricing-view="home"]');if(!target)return;
 const data=[
 ["Websites & Development","launch","/websites"],
 ["Website Management","essential-care","/packages"],
 ["Hosting & Security","standard-infra","/services#infrastructure"],
 ["Advertising & Growth","basic-ads","/services#advertising"],
 ["Business Systems & ERP","spinflow-start","/spinflow"],
 ["Dashboards & Automation","basic-dashboard","/websites#web-addons"]
 ];
 target.innerHTML='<div class="aura-price-mini-grid">'+data.map(([name,id,href])=>
 '<a class="aura-price-mini" href="'+href+'"><span>'+safe(t(name))+'</span><b>'+safe(price(getItem(id)))+
 (id==="spinflow-start"?" <small>"+safe(locale()==="tr"?"Özel ERP: ":"Custom ERP: ")+safe(price(getItem("erp-essential")))+"</small>":"")+
 '</b><span aria-hidden="true">↗</span></a>').join("")+'</div>'+
 '<p class="aura-price-footnote">'+safe(t("Only choose services you need."))+'</p>';
}
function services(){
 const target=$('[data-pricing-view="services"]');if(!target)return;
 const items=[
 ["Web Design & Development","launch","/websites","⌘","Business websites, landing pages and web applications."],
 ["Google & Meta Ads","basic-ads","#advertising","↗","Campaign setup, conversion tracking and management."],
 ["Website Care","essential-care","/packages","◎","Website maintenance, uptime checks and defined monthly updates."],
 ["Hosting & Security","standard-infra","#infrastructure","◇","Domain, DNS, SSL, hosting and baseline protection."],
 ["Business Email","business-email","#infrastructure","✉","Business mailbox setup; provider subscriptions are separate."],
 ["ERP & systems","spinflow-start","/spinflow","▣","Cloud SaaS and scoped custom ERP for business operations."],
 ["SEO & Google Maps",null,"/contact?service=SEO","⌖","Local visibility, Google Business profile and on-page SEO."],
 ["AI & Automation",null,"/contact?service=AI%20%26%20Automation","✦","Lead routing, WhatsApp flows and scoped workflow automation."],
 ["Brand & Creative Direction",null,"/contact?service=Brand%20Design","◈","Identity systems, creative direction and advertising assets."],
 ["NFC & QR","nfc-card","/nfc","◉","NFC cards, digital menus and smart customer experiences."],
 ["AuraWeddings",null,"/aura-weddings","♡","Interactive wedding invitations, themes and RSVP."]
 ];
 target.innerHTML=items.map(([name,id,url,icon,description])=>
 '<article class="service-card reveal in"><div><div class="service-icon">'+icon+'</div><h3>'+safe(t(name))+'</h3><p>'+safe(t(description))+'</p><p class="aura-price-service">'+(id?safe(price(getItem(id))):safe(t("Request Quote")))+
 '</p>'+(id==="spinflow-start"?'<p class="aura-price-footnote">'+safe(locale()==="tr"?"Özel ERP: ":"Custom ERP: ")+safe(price(getItem("erp-essential")))+'</p>':'')+'<a class="service-link" href="'+safe(url)+'">'+safe(t("Explore"))+' ↗</a></div></article>').join("");
}
function infra(){
 const target=$('[data-pricing-view="infrastructure"]');if(!target)return;
 target.innerHTML='<div class="aura-price-compact">'+catalogue.infrastructure.map(p=>
 '<article><div><strong>'+safe(t(p.name))+'</strong><small>'+safe(t(p.features.join(" · ")))+'</small></div><div><b>'+safe(price(p))+'</b><a href="'+safe(linkFor(p.id))+'">'+safe(t("Request Quote"))+' ↗</a></div></article>').join("")+'</div>'+
 '<p class="aura-price-footnote">'+safe(t("Enhanced hosting replaces the equivalent standard bundle."))+' '+safe(t("Third-party mailbox subscriptions billed separately."))+'</p>';
}
function ads(){
 const target=$('[data-pricing-view="advertising"]');if(!target)return;
 target.innerHTML='<div class="aura-price-card-grid">'+catalogue.advertising.map(p=>card(p,{label:"Request Quote"})).join("")+'</div>'+
 '<p class="aura-price-footnote"><b>'+safe(t("Advertising media spend is not included."))+'</b></p>'+
 '<p class="aura-price-footnote">'+safe(t("Advanced Ads upgrade from Managed Growth"))+': '+safe(money(getItem("advanced-ads").price-getItem("basic-ads").price))+'/'+safe(t("Monthly"))+'.</p>';
}
function packages(){
 const target=$('[data-pricing-view="packages"]');if(!target)return;
 target.innerHTML=catalogue.care.map(p=>card(p,{featured:!!p.featured,extra:
 '<p class="aura-price-footnote">'+safe(p.updates)+' '+safe(t("Updates / month"))+'</p>',label:"Choose Package"})).join("");
 const foot=$('[data-pricing-view="packages-note"]');if(foot)foot.textContent=t("Hosting & domain renewal not included.")+" "+t("Advertising media spend is not included.")+" "+t("Initial setup and one-channel basic ads management included; do not add them again.");
}
function websiteCards(){
 const target=$('[data-pricing-view="websites"]');if(!target)return;
 target.innerHTML=catalogue.website.map(p=>{
   const h=p.infraIncluded?t("First-year standard infrastructure included"):t("Standard hosting/domain/security optional");
   const total=p.infraIncluded? p.price : firstYearWebsite(p.id,true);
   return card(p,{featured:p.id==="system",extra:'<p class="aura-price-footnote">'+safe(h)+'</p><p class="aura-price-total">'+safe(t("First year with standard hosting"))+': <b>'+safe(money(total))+'</b></p>'});
 }).join("");
}
function websiteComparison(){
 const target=$('[data-pricing-view="website-compare"]');if(!target)return;
 target.innerHTML='<div class="aura-price-table"><table><thead><tr><th>'+safe(t("Compare packages"))+'</th>'+
 catalogue.website.map(p=>'<th>'+safe(p.name)+'</th>').join("")+'</tr></thead><tbody>'+
 '<tr><th>'+safe(t("One-time"))+'</th>'+catalogue.website.map(p=>'<td>'+safe(money(p.price))+'</td>').join("")+'</tr>'+
 '<tr><th>'+safe(t("Hosting renewal"))+'</th>'+catalogue.website.map(p=>'<td>'+safe(p.infraIncluded?t("First-year standard infrastructure included"):t("Hosting not included"))+'</td>').join("")+'</tr>'+
 '</tbody></table></div><p class="aura-price-footnote">'+safe(t("A Business Platform is not a complete ERP."))+'</p>';
}
function configurator(){
 const target=$('[data-pricing-view="web-addons"]');if(!target)return;
 const baseOptions=catalogue.website.map(p=>'<option value="'+p.id+'">'+safe(p.name)+'</option>').join("");
 target.innerHTML='<div class="aura-price-builder"><div><label class="aura-price-label" for="auraBasePlan">'+safe(t("Choose your package"))+'</label><select id="auraBasePlan">'+baseOptions+'</select>'+
 '<label class="aura-price-check"><input type="checkbox" id="auraHost" checked> '+safe(t("Optional standard infrastructure"))+'</label></div>'+
 '<fieldset><legend>'+safe(t("Website add-ons"))+'</legend><div id="auraAddonChoices"></div></fieldset>'+
 '<aside class="aura-price-estimate"><p id="auraEstimate"></p><p id="auraRecommendation" aria-live="polite"></p><a class="btn btn-primary" id="auraRequestEstimate" href="/contact">'+safe(t("Request this estimate"))+' ↗</a></aside></div>';
 const plan=$('#auraBasePlan'),host=$('#auraHost'), choices=$('#auraAddonChoices'),out=$('#auraEstimate'),rec=$('#auraRecommendation'),cta=$('#auraRequestEstimate');
 const select=()=>{
 const base=catalogue.website.find(p=>p.id===plan.value),rank=catalogue.website.indexOf(base);
 const old=[...choices.querySelectorAll('input:checked')].map(e=>e.value);
 host.disabled=base.infraIncluded;
 host.checked=base.infraIncluded?true:host.checked;
 choices.innerHTML=catalogue.websiteAddons.map(a=>{
 const invalid=rank<a.minRank||base.includes.includes(a.id)||base.includes.includes("commerce-or-booking")&&["ecommerce","booking"].includes(a.id)||
 (a.id==="advanced-dashboard"&&base.includes.includes("basic-dashboard"));
 return '<label class="aura-price-check"><input type="checkbox" value="'+a.id+'" '+(old.includes(a.id)&&!invalid?'checked ':'')+(invalid?'disabled ':'')+'>'+
 safe(t(a.name))+' — '+safe(price(a))+(invalid?' ('+safe(t("Included in the plan"))+' / scoped)':'')+'</label>';
 }).join("");
 const update=()=>{
 const addons=[...choices.querySelectorAll('input:checked')].map(x=>x.value);
 try {
 const options={addons,standardHosting:host.checked&&!base.infraIncluded};
 const q=quote({id:base.id,...options});
 out.innerHTML='<strong>'+safe(t("Estimated one-time"))+': '+safe(money(q.once))+'</strong>'+
 '<span>'+safe(t("Estimated annual"))+': '+safe(money(q.annual))+'</span>'+
 '<strong>'+safe(t("First-year indicative total"))+': '+safe(money(q.firstYear))+'</strong>';
 const better=catalogue.website.find(p=>p.id!==base.id&&(
 addons.includes("basic-dashboard")&&p.id==="system" ||
 addons.some(a=>["ecommerce","booking"].includes(a))&&p.id==="scale-commerce" ||
 addons.includes("crm")&&p.id==="business-platform"
 )&&p.price<q.firstYear);
 rec.textContent=better?'Tip: '+better.name+' ('+money(better.price)+') includes similar functionality and first-year infrastructure.':'';
 cta.href=linkFor(base.id,options);cta.removeAttribute("aria-disabled");
 }catch(err){out.textContent=err.message;cta.href=linkFor(base.id,{addons,standardHosting:host.checked&&!base.infraIncluded});cta.removeAttribute("aria-disabled");}
 };
 choices.onchange=update;host.onchange=update;update();
 };
 plan.onchange=select;select();
}
function spinflow(){
 const target=$('[data-pricing-view="spinflow"]');if(!target)return;
 target.innerHTML='<div class="aura-price-toggle" role="group" aria-label="ERP billing model">'+
 '<button type="button" data-erp-tab="cloud" aria-pressed="true">'+safe(t("SaaS (monthly)"))+'</button>'+
 '<button type="button" data-erp-tab="custom" aria-pressed="false">'+safe(t("Custom ERP (one-time)"))+'</button></div>'+
 '<div id="auraErpBody"></div>';
 const body=$('#auraErpBody');
 const draw=kind=>{
 target.querySelectorAll('[data-erp-tab]').forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.erpTab===kind)));
 if(kind==="cloud"){
 body.innerHTML='<p class="aura-price-footnote">'+safe(t("Planned service · request availability"))+' · '+safe(t("Includes standard SaaS hosting, security and updates."))+'</p>'+
 '<div class="aura-price-card-grid">'+catalogue.saas.map(p=>card(p,{label:"Request consultation"})).join("")+'</div>'+
 '<details class="aura-price-expand"><summary>'+safe(t("Module add-ons"))+'</summary><div class="aura-price-compact">'+catalogue.saasAddons.map(p=>'<p>'+safe(t(p.name))+': <b>'+safe(price(p))+'</b></p>').join("")+'</div></details>'+
 '<p class="aura-price-footnote">'+safe(t("No hosting double billing."))+' Cloud subscriptions do not transfer custom source-code ownership. Additional branch allowances must be confirmed for Start/Business plans.</p>';
 }else{
 body.innerHTML='<div class="aura-price-card-grid">'+catalogue.erp.map(p=>card(p,{extra:'<p class="aura-price-footnote">'+safe(t("Managed ERP hosting"))+': '+safe(money(p.annualHosting))+'/'+safe(t("Annual"))+'</p><p class="aura-price-total">'+safe(t("First year with managed ERP hosting"))+': <b>'+safe(money(firstYearERP(p.id)))+'</b></p>'})).join("")+'</div>'+
 '<p class="aura-price-footnote">'+safe(t("Customer-managed hosting available by approval."))+' '+safe(t("Custom ERP support"))+': '+safe(price(getItem("erp-maintenance")))+'.</p>'+
 '<details class="aura-price-expand"><summary>'+safe(t("Module add-ons"))+'</summary><div class="aura-price-compact">'+catalogue.erpAddons.map(p=>'<article><strong>'+safe(t(p.name))+'</strong><b>'+safe(price(p))+'</b></article>').join("")+'</div></details>';
 }
 };
 target.querySelectorAll('[data-erp-tab]').forEach(b=>b.onclick=()=>draw(b.dataset.erpTab));
 draw("cloud");
}
function contact(){
 const form=$('[data-contact-form]');if(!form)return;
 const url=new URL(location.href),id=url.searchParams.get("plan"),item=id?getItem(id):null;
 if(!item)return;
 const field=form.querySelector('[name="service"]'),message=form.querySelector('[name="message"]');
 if(field){
 const options=[...field.options];
 const best=options.find(o=>o.value==="Pricing / Quote");
 if(best)field.value=best.value;
 }
 if(message && !message.value){
 try{
 const addons=(url.searchParams.get("addons")||"").split(",").filter(Boolean);
 const opts={id,addons,region:catalogue.region,currency:catalogue.currency,priceVersion:catalogue.version,standardHosting:url.searchParams.get("infra")==="standard",enhancedHosting:url.searchParams.get("infra")==="enhanced",managedErpHosting:url.searchParams.get("erp-hosting")!=="customer",extraUsers:Number(url.searchParams.get("users")||0),extraBranches:Number(url.searchParams.get("branches")||0)};
 const q=quote(opts);
 W.AuraPricing.selection=opts;
 const historical=["once","monthly","annual"].some(k=>url.searchParams.has(k)&&url.searchParams.get(k)!==String(q[k]));
 const list=addons.map(a=>getItem(a)?.name||a).join(", ")||"None";
 message.value="Pricing request (indicative, not an accepted quotation)\nCatalogue: "+catalogue.version+"\nPackage: "+item.name+" ("+id+")\nAdd-ons: "+list+"\nInfrastructure: "+q.hosting+"\nOne-time: "+money(q.once)+"\nMonthly: "+money(q.monthly)+"\nAnnual: "+money(q.annual)+"\nFirst-year indicative: "+money(q.firstYear)+
 (historical?"\nLink contained an older/different price snapshot: revalidation required.":"")+
 "\nTaxes and scope to be confirmed.\nPreferred consultation dates/times (optional; no booking is confirmed): \\nProject details: ";
 }catch(e){message.value="Pricing enquiry for "+item.name+". Please verify package details and send a quotation. ";}
 }
}
function chatAnswer(key,lang=locale()){
 const a=catalogue;
 const lines=(items)=>items.map(x=>x.name+" "+priceText(x,lang)).join("; ");
 const tr=lang==="tr";
 if(key==="menu")return (tr?"AuraMenu fiyatları: ":"AuraMenu prices: ")+lines(a.other.filter(x=>x.id.startsWith("auramenu")))+". /aura-menu";
 if(key==="nfc")return (tr?"NFC başlangıç fiyatları: ":"NFC prices: ")+lines(a.other.filter(x=>x.id==="nfc-card"))+". /nfc";
 if(key==="web")return (tr?"Web sitesi paketleri: ":"Website packages: ")+lines(a.website)+". /websites";
 if(key==="package")return (tr?"Aylık bakım planları: ":"Monthly care plans: ")+lines(a.care)+". /packages. "+(tr?"Barındırma ayrı.":"Hosting separate.");
 if(key==="erp")return (tr?"Spinflow SaaS (planlanan): ":"Spinflow SaaS (planned): ")+lines(a.saas)+". "+(tr?"Özel ERP: ":"Custom ERP: ")+lines(a.erp)+". /spinflow";
 if(key==="advertising")return lines(a.advertising)+". "+(tr?"Medya bütçesi hariç. /services#advertising":"Media spend excluded. /services#advertising");
 if(key==="infrastructure")return lines(a.infrastructure)+". /services#infrastructure";
 if(key==="email")return lines(a.infrastructure.filter(x=>["business-email","additional-email"].includes(x.id)))+". "+(tr?"Abonelikler ayrı.":"Mailbox subscriptions separate.");
 if(key==="dashboard")return lines(a.websiteAddons)+". "+(tr?"Uyumlu paketler: Growth ve üstü.":"Eligibility: Growth or above, CRM from System.");
 return null;
}
function publishContext(){W.AuraPricing={catalogue,currency:catalogue.currency,region:catalogue.region,version:catalogue.version,getItem,quote,chatAnswer,linkFor,selection:null};}
publishContext();
window.dispatchEvent(new CustomEvent('aura:pricingchange',{detail:{region:catalogue.region,currency:catalogue.currency}}));
async function regionSelector(){
 const target=document.querySelector('#siteHeader .nav')||document.querySelector('header nav')||document.querySelector('header');
 if(!target||document.getElementById('auraPricingRegion'))return;
 const select=document.createElement('select');select.id='auraPricingRegion';select.setAttribute('aria-label','Pricing country and currency');select.className='aura-region-selector';
 for(const r of pricingData.regions){const o=document.createElement('option');o.value=r.id;o.textContent=r.name+' — '+r.currency;o.selected=r.id===catalogue.region;select.append(o);}
 select.addEventListener('change',async()=>{
  select.disabled=true;const previous=catalogue.region;
  try{
   const response=await fetch('/api/pricing?region='+encodeURIComponent(select.value),{cache:'no-store'});
   if(!response.ok)throw new Error('Pricing unavailable');
   pricingData=await response.json();
   ({catalogue,getItem,fmt,priceText,quote,firstYearWebsite,firstYearERP}=createPricingEngine(pricingData.catalogue));
   document.cookie='aura-pricing-region='+encodeURIComponent(catalogue.region)+'; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
   const current=new URL(location.href);current.searchParams.delete('region');history.replaceState(null,'',current);
   publishContext();refresh();
   const message=document.querySelector('[data-contact-form] [name="message"]');
   if(message?.value.startsWith('Pricing request (indicative'))message.value='';
   contact();window.dispatchEvent(new CustomEvent('aura:pricingchange',{detail:{region:catalogue.region,currency:catalogue.currency}}));
  }catch{select.value=previous;select.setAttribute('aria-label','Pricing unavailable. Please retry.');}
  finally{select.disabled=false;}
 });
 target.append(select);
}
function refresh(){
 home();services();infra();ads();packages();websiteCards();websiteComparison();configurator();spinflow();regionSelector();
 document.querySelectorAll("[data-setting]").forEach(e=>{const id={nfc_price:"nfc-card",auramenu_self_price:"auramenu-self",qr_menu_price:"auramenu-managed",web_single_price:"launch",web_multi_price:"growth",web_dynamic_price:"system"}[e.dataset.setting];if(id)e.textContent=price(getItem(id));});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{refresh();contact();});
else {refresh();contact();}
W.addEventListener("aura:languagechange",()=>refresh());
