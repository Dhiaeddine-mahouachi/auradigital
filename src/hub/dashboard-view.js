// AuraHub dashboard: the business "flow" from profile to live services, the
// next best action, key numbers, roadmap tasks, everything connected from
// other AuraDigital services, and recent activity.
import { hubIcon } from './hub-navigation.js';

const COPY = {
  en: {
    planFallback: 'Auri is offline right now, so we built your roadmap from your answers. Ask Auri to refine it later.',
    morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
    flow: 'Your growth flow', flowNote: 'Where your business is right now. Tap a step to open it.',
    steps: ['Business profile', 'Roadmap', 'Requests', 'In production', 'Live'],
    stepNotes: ['Saved', '{done} of {total} done', '{n} open', '{n} in progress', '{n} live'],
    stepEmpty: ['Add details', 'Build with Auri', 'Nothing open', 'Nothing yet', 'Nothing yet'],
    kRoadmap: 'Roadmap', kRequests: 'Open requests', kLive: 'Live services', kDue: 'Amount due',
    tasks: 'Next on your roadmap', allTasks: 'Open roadmap', tasksDone: 'Every task on your roadmap is done.',
    connected: 'Connected services', connectedNote: 'Menus, cards, websites, orders, invoices and plans from your AuraDigital account.',
    connectedEmpty: 'Nothing connected yet. Requests you send with your account email and services the team links to your account appear here.',
    connectedVerify: 'Verify your email so we can match the requests you sent before you had an account.',
    activity: 'Recent activity', activityEmpty: 'Your activity appears here.',
    askTitle: 'Ask Auri', askNote: 'Your AI guide for this business.', askPlaceholder: 'Ask about your roadmap, prices, next steps…', ask: 'Ask',
    prompts: ['What should I do this week?', 'Explain my roadmap', 'Which service fits me best?'],
    shop: 'Shop', orders: 'Orders & billing', newRequest: 'New request', viewAll: 'View all', due: 'due', next: 'next',
    kinds: { nfc: 'NFC card', auramenu: 'AuraMenu', quicksite: 'Website', shop: 'Shop order', invoice: 'Invoice', subscription: 'Plan', order: 'Order' },
    status: { pending: 'Awaiting review', approved: 'Live', rejected: 'Needs changes', paid: 'Paid', unpaid: 'Payment due', sent: 'Due', overdue: 'Overdue', active: 'Active', paused: 'Paused', cancelled: 'Cancelled', new: 'Received', 'in-progress': 'In production', ready: 'Ready', completed: 'Delivered', awaiting_transfer: 'Awaiting transfer', planned: 'To do', in_progress: 'In progress', done: 'Done', postponed: 'Later' },
  },
  tr: {
    planFallback: 'Auri şu an çevrimdışı; yol haritanızı yanıtlarınızdan oluşturduk. Daha sonra Auri’den geliştirmesini isteyebilirsiniz.',
    morning: 'Günaydın', afternoon: 'İyi günler', evening: 'İyi akşamlar',
    flow: 'Büyüme akışınız', flowNote: 'İşletmenizin şu anki yeri. Açmak için bir adıma dokunun.',
    steps: ['İşletme profili', 'Yol haritası', 'Talepler', 'Üretimde', 'Yayında'],
    stepNotes: ['Kaydedildi', '{total} görevden {done} tamam', '{n} açık', '{n} devam ediyor', '{n} yayında'],
    stepEmpty: ['Bilgi ekleyin', 'Auri ile oluşturun', 'Açık talep yok', 'Henüz yok', 'Henüz yok'],
    kRoadmap: 'Yol haritası', kRequests: 'Açık talepler', kLive: 'Yayındaki hizmetler', kDue: 'Ödenecek tutar',
    tasks: 'Yol haritanızda sırada', allTasks: 'Yol haritasını aç', tasksDone: 'Yol haritanızdaki tüm görevler tamamlandı.',
    connected: 'Bağlı hizmetler', connectedNote: 'AuraDigital hesabınızdaki menüler, kartlar, siteler, siparişler, faturalar ve planlar.',
    connectedEmpty: 'Henüz bağlı bir şey yok. Hesap e-postanızla gönderdiğiniz talepler ve ekibin hesabınıza bağladığı hizmetler burada görünür.',
    connectedVerify: 'Hesap açmadan önce gönderdiğiniz talepleri eşleştirebilmemiz için e-postanızı doğrulayın.',
    activity: 'Son hareketler', activityEmpty: 'Hareketleriniz burada görünür.',
    askTitle: 'Auri’ye sor', askNote: 'Bu işletme için yapay zekâ rehberiniz.', askPlaceholder: 'Yol haritası, fiyatlar, sonraki adımlar…', ask: 'Sor',
    prompts: ['Bu hafta ne yapmalıyım?', 'Yol haritamı açıkla', 'Bana en uygun hizmet hangisi?'],
    shop: 'Mağaza', orders: 'Siparişler ve faturalar', newRequest: 'Yeni talep', viewAll: 'Tümünü gör', due: 'son tarih', next: 'sonraki',
    kinds: { nfc: 'NFC kart', auramenu: 'AuraMenu', quicksite: 'Web sitesi', shop: 'Mağaza siparişi', invoice: 'Fatura', subscription: 'Plan', order: 'Sipariş' },
    status: { pending: 'İnceleniyor', approved: 'Yayında', rejected: 'Düzeltme gerekiyor', paid: 'Ödendi', unpaid: 'Ödeme bekleniyor', sent: 'Ödenecek', overdue: 'Gecikmiş', active: 'Aktif', paused: 'Durduruldu', cancelled: 'İptal', new: 'Alındı', 'in-progress': 'Üretimde', ready: 'Hazır', completed: 'Teslim edildi', awaiting_transfer: 'Havale bekleniyor', planned: 'Yapılacak', in_progress: 'Devam ediyor', done: 'Tamam', postponed: 'Sonra' },
  },
  ar: {
    planFallback: 'أوري غير متاح الآن، لذلك بنينا خطتك من إجاباتك. اطلب من أوري تحسينها لاحقًا.',
    morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء الخير',
    flow: 'مسار نموك', flowNote: 'أين يقف نشاطك الآن. اضغط على خطوة لفتحها.',
    steps: ['ملف النشاط', 'الخطة', 'الطلبات', 'قيد التنفيذ', 'مباشر'],
    stepNotes: ['محفوظ', '{done} من {total} مكتملة', '{n} مفتوحة', '{n} قيد التنفيذ', '{n} مباشرة'],
    stepEmpty: ['أضف التفاصيل', 'ابنها مع أوري', 'لا طلبات مفتوحة', 'لا شيء بعد', 'لا شيء بعد'],
    kRoadmap: 'الخطة', kRequests: 'طلبات مفتوحة', kLive: 'خدمات مباشرة', kDue: 'المبلغ المستحق',
    tasks: 'التالي في خطتك', allTasks: 'افتح الخطة', tasksDone: 'اكتملت كل مهام خطتك.',
    connected: 'الخدمات المرتبطة', connectedNote: 'القوائم والبطاقات والمواقع والطلبات والفواتير والخطط من حسابك في AuraDigital.',
    connectedEmpty: 'لا شيء مرتبط بعد. تظهر هنا الطلبات المرسلة ببريد حسابك والخدمات التي يربطها الفريق بحسابك.',
    connectedVerify: 'أكّد بريدك الإلكتروني لنطابق الطلبات التي أرسلتها قبل إنشاء حسابك.',
    activity: 'آخر النشاطات', activityEmpty: 'سيظهر نشاطك هنا.',
    askTitle: 'اسأل أوري', askNote: 'مرشدك الذكي لهذا النشاط.', askPlaceholder: 'اسأل عن خطتك أو الأسعار أو الخطوات التالية…', ask: 'اسأل',
    prompts: ['ماذا أفعل هذا الأسبوع؟', 'اشرح خطتي', 'أي خدمة تناسبني؟'],
    shop: 'المتجر', orders: 'الطلبات والفواتير', newRequest: 'طلب جديد', viewAll: 'عرض الكل', due: 'الاستحقاق', next: 'التالي',
    kinds: { nfc: 'بطاقة NFC', auramenu: 'AuraMenu', quicksite: 'موقع', shop: 'طلب متجر', invoice: 'فاتورة', subscription: 'خطة', order: 'طلب' },
    status: { pending: 'قيد المراجعة', approved: 'مباشر', rejected: 'يحتاج تعديلات', paid: 'مدفوع', unpaid: 'بانتظار الدفع', sent: 'مستحق', overdue: 'متأخر', active: 'نشط', paused: 'متوقف', cancelled: 'ملغى', new: 'مستلم', 'in-progress': 'قيد التنفيذ', ready: 'جاهز', completed: 'تم التسليم', awaiting_transfer: 'بانتظار التحويل', planned: 'للتنفيذ', in_progress: 'قيد التنفيذ', done: 'تم', postponed: 'لاحقًا' },
  },
  fr: {
    planFallback: 'Auri est indisponible pour le moment : votre feuille de route a été créée à partir de vos réponses. Demandez à Auri de l’affiner plus tard.',
    morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir',
    flow: 'Votre parcours de croissance', flowNote: 'Où en est votre activité. Touchez une étape pour l’ouvrir.',
    steps: ['Profil', 'Feuille de route', 'Demandes', 'En production', 'En ligne'],
    stepNotes: ['Enregistré', '{done} sur {total} faites', '{n} ouvertes', '{n} en cours', '{n} en ligne'],
    stepEmpty: ['Ajouter des détails', 'Créer avec Auri', 'Aucune demande', 'Rien pour l’instant', 'Rien pour l’instant'],
    kRoadmap: 'Feuille de route', kRequests: 'Demandes ouvertes', kLive: 'Services en ligne', kDue: 'Montant dû',
    tasks: 'Prochaines étapes', allTasks: 'Ouvrir la feuille de route', tasksDone: 'Toutes les étapes sont terminées.',
    connected: 'Services connectés', connectedNote: 'Menus, cartes, sites, commandes, factures et abonnements de votre compte AuraDigital.',
    connectedEmpty: 'Rien de connecté pour l’instant. Les demandes envoyées avec l’e-mail de votre compte et les services liés par l’équipe apparaissent ici.',
    connectedVerify: 'Vérifiez votre e-mail pour retrouver les demandes envoyées avant la création de votre compte.',
    activity: 'Activité récente', activityEmpty: 'Votre activité apparaîtra ici.',
    askTitle: 'Demander à Auri', askNote: 'Votre guide IA pour cette activité.', askPlaceholder: 'Feuille de route, prix, prochaines étapes…', ask: 'Demander',
    prompts: ['Que faire cette semaine ?', 'Expliquez ma feuille de route', 'Quel service me convient ?'],
    shop: 'Boutique', orders: 'Commandes et factures', newRequest: 'Nouvelle demande', viewAll: 'Tout voir', due: 'échéance', next: 'prochain',
    kinds: { nfc: 'Carte NFC', auramenu: 'AuraMenu', quicksite: 'Site web', shop: 'Commande', invoice: 'Facture', subscription: 'Abonnement', order: 'Commande' },
    status: { pending: 'En revue', approved: 'En ligne', rejected: 'À corriger', paid: 'Payé', unpaid: 'Paiement attendu', sent: 'À payer', overdue: 'En retard', active: 'Actif', paused: 'En pause', cancelled: 'Annulé', new: 'Reçu', 'in-progress': 'En production', ready: 'Prêt', completed: 'Livré', awaiting_transfer: 'Virement attendu', planned: 'À faire', in_progress: 'En cours', done: 'Fait', postponed: 'Plus tard' },
  },
};
export const dashCopy = lang => COPY[lang] || COPY.en;
// Navigation labels for the AuraHub shell.
const NAV = {
  en: { home: 'Home', groups: ['Overview', 'Grow', 'Manage', 'Account'], menuDrafts: 'Menu drafts', orders: 'Orders & billing', profile: 'Business profile', team: 'Team', settings: 'Settings', more: 'More', close: 'Close', business: 'Business', newRequest: 'New request' },
  tr: { home: 'Ana sayfa', groups: ['Genel bakış', 'Büyüme', 'Yönetim', 'Hesap'], menuDrafts: 'Menü taslakları', orders: 'Siparişler ve faturalar', profile: 'İşletme profili', team: 'Ekip', settings: 'Ayarlar', more: 'Daha fazla', close: 'Kapat', business: 'İşletme', newRequest: 'Yeni talep' },
  ar: { home: 'الرئيسية', groups: ['نظرة عامة', 'النمو', 'الإدارة', 'الحساب'], menuDrafts: 'مسودات القوائم', orders: 'الطلبات والفواتير', profile: 'ملف النشاط', team: 'الفريق', settings: 'الإعدادات', more: 'المزيد', close: 'إغلاق', business: 'النشاط', newRequest: 'طلب جديد' },
  fr: { home: 'Accueil', groups: ['Vue d’ensemble', 'Croissance', 'Gestion', 'Compte'], menuDrafts: 'Brouillons de menu', orders: 'Commandes et factures', profile: 'Profil de l’activité', team: 'Équipe', settings: 'Paramètres', more: 'Plus', close: 'Fermer', business: 'Activité', newRequest: 'Nouvelle demande' },
};
export const navCopy = lang => NAV[lang] || NAV.en;
const NAV_ICONS = {
  requests: 'M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5',
  menuDrafts: 'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',
  orders: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
  team: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21v-1a7 7 0 0 1 14 0v1 M17 11a3 3 0 1 0 0-6 M22 21v-1a5 5 0 0 0-4-5',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  assistant: 'M12 3l2.2 5.2L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.8z',
};
export const navIcon = id => NAV_ICONS[id] ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${NAV_ICONS[id]}"/></svg>` : hubIcon(id);
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');
const money = (lang, amount) => new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang, { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(amount || 0));
const day = (lang, value) => {
  if (!value) return '';
  const d = new Date(String(value).includes('T') ? value : String(value).replace(' ', 'T') + 'Z');
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString(lang, { day: 'numeric', month: 'short' }) : '';
};
const TONE = { approved: 'good', paid: 'good', active: 'good', completed: 'good', ready: 'good', done: 'good', rejected: 'bad', overdue: 'bad', cancelled: 'bad', unpaid: 'warn', sent: 'warn', pending: 'warn', awaiting_transfer: 'warn' };
export const statusPill = (c, status, esc) => `<span class="hx-pill ${TONE[status] || ''}">${esc(c.status[status] || String(status || '').replace(/[_-]/g, ' '))}</span>`;
const KIND_ICON = { nfc: 'M4 6h16v12H4z M8 10h4 M8 14h8', auramenu: 'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5', quicksite: 'M3 5h18v12H3z M8 21h8 M12 17v4', shop: 'M5 7h14l-1 13H6z M9 7a3 3 0 0 1 6 0', invoice: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6', subscription: 'M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 1 0 1 6', order: 'M3 7h18v13H3z M8 7V4h8v3' };
const kindIcon = kind => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${KIND_ICON[kind] || KIND_ICON.order}"/></svg>`;

// Everything connected, as rows the dashboard and the services page share.
export function connectedRows(data, lang) {
  const c = dashCopy(lang);
  const rows = [];
  for (const r of data.requests || []) rows.push({ kind: r.kind, title: r.name, meta: c.kinds[r.kind] + (r.slug ? ' · ' + r.slug : ''), status: r.status === 'approved' || !r.payment ? r.status : (r.payment === 'unpaid' && r.status === 'pending' ? 'pending' : r.status), extra: r.payment === 'unpaid' && r.status !== 'rejected' ? 'unpaid' : '', at: r.updatedAt || r.createdAt });
  for (const o of data.orders || []) rows.push({ kind: 'order', title: `${o.type} × ${o.quantity}`, meta: `${c.kinds.order}${o.amount ? ' · ' + money(lang, o.amount) : ''}${o.dueDate ? ' · ' + c.due + ' ' + day(lang, o.dueDate) : ''}`, status: o.status, at: o.createdAt });
  for (const s of data.subscriptions || []) rows.push({ kind: 'subscription', title: s.plan, meta: `${c.kinds.subscription}${s.amount ? ' · ' + money(lang, s.amount) + ' / ' + s.interval : ''}${s.nextBillingDate ? ' · ' + c.next + ' ' + day(lang, s.nextBillingDate) : ''}`, status: s.status, at: s.createdAt });
  for (const i of data.invoices || []) rows.push({ kind: 'invoice', title: i.number, meta: `${c.kinds.invoice} · ${money(lang, i.amount)}${i.dueDate ? ' · ' + c.due + ' ' + day(lang, i.dueDate) : ''}`, status: i.status, at: i.createdAt, href: '/account' });
  for (const o of data.shopOrders || []) rows.push({ kind: 'shop', title: o.reference, meta: `${c.kinds.shop} · ${money(lang, Number(o.totalMinor || 0) / 100)}`, status: o.payment, at: o.createdAt, href: '/shop/orders/' + o.id });
  return rows.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
}
export function connectedList(rows, lang, esc, limit = 50) {
  const c = dashCopy(lang);
  return `<ul class="hx-list">${rows.slice(0, limit).map(r => {
    const inner = `<span class="hx-list-icon">${kindIcon(r.kind)}</span><span class="hx-list-main"><strong>${esc(r.title)}</strong><small>${esc(r.meta)}</small></span><span class="hx-list-status">${statusPill(c, r.status, esc)}${r.extra ? statusPill(c, r.extra, esc) : ''}</span>`;
    return `<li>${r.href ? `<a class="hx-list-row" href="${esc(r.href)}">${inner}</a>` : `<div class="hx-list-row">${inner}</div>`}</li>`;
  }).join('')}</ul>`;
}
