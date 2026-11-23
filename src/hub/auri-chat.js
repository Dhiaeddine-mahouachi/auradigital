// Auri chat: the AuraHub assistant, opened as a side panel from anywhere in
// the hub. Auri summarises the business, answers about services, roadmap and
// billing from the customer's data, offers to start work ("Let Auri start"
// writes the brief for a request to the team), and sends other questions to
// the workspace Auri endpoint, which falls back to roadmap guidance.
const COPY = {
  en: {
    start: 'Let Auri start', startReply: s => `I can take care of “${s}” for you. I’ll write the brief from your business profile and send it to the AuraDigital team for a quote — you just confirm.`, servicesLink: 'Open my services', billingLink: 'Open billing',
    status: 'Your AI guide · online', placeholder: 'Message Auri…', send: 'Send', thinking: 'Auri is thinking…',
    tabs: ['Overview', 'Services', 'Roadmap', 'Billing'], open: 'Open', clear: 'New conversation', panel: 'Details',
    hi: (name, biz) => `Hi ${name}! Here’s where ${biz} stands today:`,
    roadmapLine: (d, t, next) => `Roadmap: ${d} of ${t} tasks done${next ? ` — next: ${next}` : ''}.`,
    openLine: n => `${n} request${n === 1 ? '' : 's'} open.`, liveLine: n => `${n} service${n === 1 ? '' : 's'} live.`, dueLine: a => `${a} to pay.`,
    attention: what => `Needs you now: ${what}.`, noRoadmap: 'You don’t have a roadmap yet. Tell me about your business and I’ll build one.',
    chips: ['What should I do next?', 'Show my services', 'What do I owe?', 'Request a service'],
    servicesReply: (live, open) => `You have ${live} live and ${open} in progress. I opened your services on the right.`,
    roadmapReply: next => next ? `Your next step is “${next}”. I opened your roadmap so you can start it.` : 'Your roadmap is complete. Ask me what to grow next.',
    billingReply: (due, n) => due ? `You have ${due} due across ${n} invoice${n === 1 ? '' : 's'}. Billing details are on the right.` : 'Nothing is due right now. Your billing is on the right.',
    requestReply: 'Tell me what you need, or open the request form — the AuraDigital team replies with a quote.',
    requestAction: 'Open request form', roadmapAction: 'Open roadmap', buildAction: 'Build my roadmap', reviewAction: 'Review now',
    error: 'I couldn’t answer that right now. Try again, or message the team.',
    nothing: 'Nothing here yet.', due: 'Amount due', plans: 'Plans', invoices: 'Invoices', shop: 'Shop orders', allBilling: 'Orders & billing',
    flow: ['Profile', 'Roadmap', 'Requests', 'In production', 'Live'],
  },
  tr: {
    start: 'Auri başlasın', startReply: s => `“${s}” işini sizin için üstlenebilirim. İşletme profilinizden brifi yazar, teklif için AuraDigital ekibine gönderirim — siz sadece onaylarsınız.`, servicesLink: 'Hizmetlerimi aç', billingLink: 'Ödemeleri aç',
    status: 'Yapay zekâ rehberiniz · çevrimiçi', placeholder: 'Auri’ye yazın…', send: 'Gönder', thinking: 'Auri düşünüyor…',
    tabs: ['Genel', 'Hizmetler', 'Yol haritası', 'Ödemeler'], open: 'Aç', clear: 'Yeni sohbet', panel: 'Ayrıntılar',
    hi: (name, biz) => `Merhaba ${name}! ${biz} bugün burada:`,
    roadmapLine: (d, t, next) => `Yol haritası: ${t} görevden ${d} tamam${next ? ` — sıradaki: ${next}` : ''}.`,
    openLine: n => `${n} açık talep.`, liveLine: n => `${n} hizmet yayında.`, dueLine: a => `Ödenecek: ${a}.`,
    attention: what => `Şimdi sizi bekliyor: ${what}.`, noRoadmap: 'Henüz yol haritanız yok. İşletmenizi anlatın, sizin için oluşturayım.',
    chips: ['Sırada ne var?', 'Hizmetlerimi göster', 'Ne kadar borcum var?', 'Hizmet iste'],
    servicesReply: (live, open) => `${live} hizmet yayında, ${open} devam ediyor. Hizmetlerinizi sağda açtım.`,
    roadmapReply: next => next ? `Sıradaki adımınız “${next}”. Başlayabilmeniz için yol haritanızı açtım.` : 'Yol haritanız tamamlandı. Sırada neyi büyüteceğinizi sorun.',
    billingReply: (due, n) => due ? `${n} faturada toplam ${due} ödenecek. Ayrıntılar sağda.` : 'Şu an ödenecek bir şey yok. Ödemeleriniz sağda.',
    requestReply: 'Neye ihtiyacınız olduğunu yazın ya da talep formunu açın — AuraDigital ekibi teklifle döner.',
    requestAction: 'Talep formunu aç', roadmapAction: 'Yol haritasını aç', buildAction: 'Yol haritamı oluştur', reviewAction: 'Şimdi incele',
    error: 'Şu an yanıt veremedim. Tekrar deneyin ya da ekibe yazın.',
    nothing: 'Henüz bir şey yok.', due: 'Ödenecek tutar', plans: 'Planlar', invoices: 'Faturalar', shop: 'Mağaza siparişleri', allBilling: 'Siparişler ve faturalar',
    flow: ['Profil', 'Yol haritası', 'Talepler', 'Üretimde', 'Yayında'],
  },
  ar: {
    start: 'دع أوري يبدأ', startReply: s => `أستطيع التكفل بـ«${s}». سأكتب الملخص من ملف نشاطك وأرسله إلى فريق AuraDigital لعرض سعر — عليك التأكيد فقط.`, servicesLink: 'افتح خدماتي', billingLink: 'افتح الفواتير',
    status: 'مرشدك الذكي · متصل', placeholder: 'اكتب لأوري…', send: 'إرسال', thinking: 'أوري يفكر…',
    tabs: ['نظرة عامة', 'الخدمات', 'الخطة', 'الفواتير'], open: 'فتح', clear: 'محادثة جديدة', panel: 'التفاصيل',
    hi: (name, biz) => `مرحبًا ${name}! هذا وضع ${biz} اليوم:`,
    roadmapLine: (d, t, next) => `الخطة: ${d} من ${t} مهام مكتملة${next ? ` — التالي: ${next}` : ''}.`,
    openLine: n => `${n} طلبات مفتوحة.`, liveLine: n => `${n} خدمات مباشرة.`, dueLine: a => `المستحق: ${a}.`,
    attention: what => `بانتظارك الآن: ${what}.`, noRoadmap: 'ليست لديك خطة بعد. أخبرني عن نشاطك وسأبنيها لك.',
    chips: ['ما خطوتي التالية؟', 'اعرض خدماتي', 'كم المستحق علي؟', 'اطلب خدمة'],
    servicesReply: (live, open) => `لديك ${live} خدمات مباشرة و${open} قيد التنفيذ. فتحت خدماتك على الجانب.`,
    roadmapReply: next => next ? `خطوتك التالية «${next}». فتحت خطتك لتبدأ.` : 'اكتملت خطتك. اسألني ماذا تنمّي بعد ذلك.',
    billingReply: (due, n) => due ? `عليك ${due} في ${n} فواتير. التفاصيل على الجانب.` : 'لا شيء مستحق الآن. فواتيرك على الجانب.',
    requestReply: 'أخبرني بما تحتاجه أو افتح نموذج الطلب — يرد فريق AuraDigital بعرض سعر.',
    requestAction: 'افتح نموذج الطلب', roadmapAction: 'افتح الخطة', buildAction: 'ابنِ خطتي', reviewAction: 'راجع الآن',
    error: 'تعذر علي الرد الآن. حاول مجددًا أو راسل الفريق.',
    nothing: 'لا شيء بعد.', due: 'المبلغ المستحق', plans: 'الخطط', invoices: 'الفواتير', shop: 'طلبات المتجر', allBilling: 'الطلبات والفواتير',
    flow: ['الملف', 'الخطة', 'الطلبات', 'قيد التنفيذ', 'مباشر'],
  },
  fr: {
    start: 'Laisser Auri démarrer', startReply: s => `Je peux m’occuper de « ${s} ». Je rédige le brief à partir de votre profil et l’envoie à l’équipe AuraDigital pour un devis — vous n’avez qu’à confirmer.`, servicesLink: 'Ouvrir mes services', billingLink: 'Ouvrir la facturation',
    status: 'Votre guide IA · en ligne', placeholder: 'Écrire à Auri…', send: 'Envoyer', thinking: 'Auri réfléchit…',
    tabs: ['Aperçu', 'Services', 'Feuille de route', 'Facturation'], open: 'Ouvrir', clear: 'Nouvelle conversation', panel: 'Détails',
    hi: (name, biz) => `Bonjour ${name} ! Voici où en est ${biz} :`,
    roadmapLine: (d, t, next) => `Feuille de route : ${d} sur ${t} étapes faites${next ? ` — prochaine : ${next}` : ''}.`,
    openLine: n => `${n} demande(s) ouverte(s).`, liveLine: n => `${n} service(s) en ligne.`, dueLine: a => `${a} à payer.`,
    attention: what => `À faire maintenant : ${what}.`, noRoadmap: 'Vous n’avez pas encore de feuille de route. Présentez votre activité et je la crée.',
    chips: ['Que faire ensuite ?', 'Mes services', 'Que dois-je payer ?', 'Demander un service'],
    servicesReply: (live, open) => `${live} en ligne et ${open} en cours. J’ai ouvert vos services à droite.`,
    roadmapReply: next => next ? `Votre prochaine étape : « ${next} ». J’ai ouvert la feuille de route.` : 'Feuille de route terminée. Demandez-moi quoi développer ensuite.',
    billingReply: (due, n) => due ? `${due} à payer sur ${n} facture(s). Détails à droite.` : 'Rien à payer pour l’instant. Votre facturation est à droite.',
    requestReply: 'Dites-moi ce dont vous avez besoin ou ouvrez le formulaire — l’équipe AuraDigital répond avec un devis.',
    requestAction: 'Ouvrir le formulaire', roadmapAction: 'Ouvrir la feuille de route', buildAction: 'Créer ma feuille de route', reviewAction: 'Examiner',
    error: 'Je n’ai pas pu répondre. Réessayez ou écrivez à l’équipe.',
    nothing: 'Rien pour l’instant.', due: 'Montant dû', plans: 'Abonnements', invoices: 'Factures', shop: 'Commandes', allBilling: 'Commandes et factures',
    flow: ['Profil', 'Feuille de route', 'Demandes', 'En production', 'En ligne'],
  },
};
export const chatCopy = lang => COPY[lang] || COPY.en;

const INTENTS = {
  services: /service|hizmet|خدم|site|website|menu|men[üu]|nfc|card|kart/i,
  roadmap: /next|roadmap|step|todo|to do|sıra|yol harita|adım|خطة|التالي|خطوة|prochain|étape|feuille/i,
  billing: /bill|invoice|pay|owe|due|price paid|fatura|ödeme|borç|فاتور|مستحق|دفع|factur|payer|dois/i,
  request: /request|order a|need a|quote|talep|iste|teklif|طلب|عرض سعر|demande|devis/i,
};
// Requests Auri can start for the customer, mapped to the request form's services.
export const SERVICE_IDEAS = [
  { match: /web ?site|web sitesi|موقع|site web|landing/i, service: 'Web Design', name: { en: 'a website', tr: 'web sitesi', ar: 'موقع إلكتروني', fr: 'un site web' } },
  { match: /menu|menü|قائمة|qr/i, service: 'AuraMenu', name: { en: 'a QR digital menu', tr: 'QR dijital menü', ar: 'قائمة رقمية QR', fr: 'un menu QR' } },
  { match: /review|yorum|تقييم|avis|nfc|card|kart|بطاق/i, service: 'NFC Card', name: { en: 'NFC review cards', tr: 'NFC yorum kartları', ar: 'بطاقات تقييم NFC', fr: 'des cartes avis NFC' } },
  { match: /whats ?app|chatbot|automat|otomasyon|أتمتة|واتساب/i, service: 'AI & Automation', name: { en: 'WhatsApp automation', tr: 'WhatsApp otomasyonu', ar: 'أتمتة واتساب', fr: 'l’automatisation WhatsApp' } },
  { match: /google|maps|seo|harita|خرائط|référencement/i, service: 'SEO / Google Maps', name: { en: 'Google Maps & SEO', tr: 'Google Haritalar ve SEO', ar: 'خرائط Google وSEO', fr: 'Google Maps et SEO' } },
  { match: /\bads?\b|reklam|إعلان|publicit|campaign|kampanya/i, service: 'Ad Management', name: { en: 'ad campaigns', tr: 'reklam kampanyaları', ar: 'حملات إعلانية', fr: 'des campagnes pub' } },
  { match: /logo|brand|marka|هوية|شعار|marque/i, service: 'Branding', name: { en: 'branding', tr: 'marka kimliği', ar: 'الهوية البصرية', fr: 'l’identité de marque' } },
  { match: /e-?mail|e-posta|بريد/i, service: 'Business Email', name: { en: 'business email', tr: 'kurumsal e-posta', ar: 'بريد الأعمال', fr: 'l’e-mail pro' } },
  { match: /host|domain|alan ad|استضافة|نطاق|hébergement/i, service: 'Hosting / Security', name: { en: 'hosting & domain', tr: 'barındırma ve alan adı', ar: 'الاستضافة والنطاق', fr: 'l’hébergement' } },
];
// Auri can take the customer to an Aura Studio module. Navigation only: any
// change is made by the customer on that page, with its own permission checks.
const STUDIO_ROUTES = [
  { view: 'pipeline', match: /\b(leads?|inquir(y|ies)|pipeline|prospects?)\b|müşteri adayı|talepleri(m)? (gör|kaydet)|استفسار|عملاء محتمل|prospect|demandes? clients?/i, label: { en: 'Open the lead pipeline', tr: 'Satış hattını aç', ar: 'افتح مسار العملاء', fr: 'Ouvrir le pipeline' } },
  { view: 'analytics', match: /\b(analytics|stats|statistics|numbers|performance)\b|analitik|istatistik|تحليلات|إحصا|statistiques/i, label: { en: 'Open analytics', tr: 'Analitiği aç', ar: 'افتح التحليلات', fr: 'Ouvrir les statistiques' } },
  { view: 'website', match: /\b(my|update|edit|change)\b.*\b(website|site)\b|web sitemi|sitemi (güncelle|düzenle)|موقعي|mon site/i, label: { en: 'Manage your website', tr: 'Web sitenizi yönetin', ar: 'أدر موقعك', fr: 'Gérer votre site' } },
  { view: 'menu', match: /\b(manage|update|edit|my)\b.*\bmenu\b|menümü|قائمتي|mon menu/i, label: { en: 'Manage AuraMenu', tr: 'AuraMenu’yü yönet', ar: 'أدر AuraMenu', fr: 'Gérer AuraMenu' } },
];
const STUDIO_REPLY = {
  en: label => `You can do that in Aura Studio. ${label} — changes are only saved when you confirm them there.`,
  tr: label => `Bunu Aura Studio’da yapabilirsiniz. ${label} — değişiklikler yalnızca orada onayladığınızda kaydedilir.`,
  ar: label => `يمكنك ذلك في Aura Studio. ${label} — لا تُحفظ التغييرات إلا عند تأكيدك هناك.`,
  fr: label => `Vous pouvez le faire dans Aura Studio. ${label} — les modifications ne sont enregistrées qu’après votre confirmation.`,
};
const START_WORDS = /\b(build|make|create|set ?up|start|get|launch|need|want|do)\b|oluştur|kur|yap|istiyorum|başlat|ابن|أنشئ|أريد|ابدأ|créer|lancer|faire|veux/i;
const money = (lang, amount) => new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang, { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(amount || 0));

export function mountAuriChat({ host, lang, esc, link, me, workspace, data, askAuri, auriImage, onBrief, initial, direct = false, history = null }) {
  const c = chatCopy(lang);
  const id = workspace?.organization.id || 'new';
  const storeKey = 'aura-chat:' + id;
  const { snapshot, connected, next, missionTitle, attention, nextAction } = data;
  const missions = workspace?.missions || [];
  const done = missions.filter(m => m.status === 'done').length;
  const openCount = data.counts ? data.counts.open : (snapshot?.attention?.length || 0) + (snapshot?.progress?.length || 0) + (connected?.requests || []).filter(r => r.status === 'pending').length;
  const liveCount = data.counts ? data.counts.live : (snapshot?.services?.length || 0) + (connected?.totals?.live || 0);
  const dueAmount = connected?.totals?.amountDue || 0;
  const canRequest = workspace?.permissions?.includes('roadmap:write');
  let log = [];
  try { log = JSON.parse(sessionStorage.getItem(storeKey) || '[]'); } catch {}
  const save = () => { try { sessionStorage.setItem(storeKey, JSON.stringify(log.slice(-40))); } catch {} };
  const greeting = () => {
    const lines = [c.hi(String(me.name || '').split(' ')[0], workspace?.organization.name || 'AuraHub')];
    if (attention) lines.push(c.attention(attention.name));
    lines.push(missions.length ? c.roadmapLine(done, missions.length, next ? missionTitle(next) : '') : c.noRoadmap);
    if (openCount) lines.push(c.openLine(openCount));
    if (liveCount) lines.push(c.liveLine(liveCount));
    if (dueAmount) lines.push(c.dueLine(money(lang, dueAmount)));
    const actions = [];
    if (attention) actions.push({ label: attention.label || c.reviewAction, href: attention.href });
    if (nextAction) actions.push(nextAction);
    if (!missions.length && canRequest !== false) actions.push({ label: c.buildAction, href: link('onboarding') });
    return { role: 'auri', text: lines.join('\n'), actions, greeting: true };
  };
  log = [greeting(), ...log.filter(m => !m.greeting)];
  save();
  // Saved conversation from the server (follows the customer across devices).
  history?.load().then(messages => {
    if (!messages?.length || !host.isConnected) return;
    log = [greeting(), ...messages.map(m => ({ role: m.role, text: m.text }))];
    save(); draw();
  }).catch(() => {});

  host.innerHTML = `<div class="ax-chat">
    <ol class="ax-log" role="log" aria-live="polite" data-ax-log></ol>
    <div class="ax-chips">${c.chips.map((chip, i) => `<button type="button" class="ax-chip" data-ax-chip="${i}">${esc(chip)}</button>`).join('')}</div>
    <form class="ax-input" data-ax-form>
      <label class="sr-only" for="ax-text">${esc(c.placeholder)}</label>
      <textarea id="ax-text" name="q" rows="1" maxlength="500" placeholder="${esc(c.placeholder)}" autocomplete="off"></textarea>
      <button type="submit" class="ax-send" aria-label="${esc(c.send)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form></div>`;
  const logEl = host.querySelector('[data-ax-log]');
  const bubble = m => `<li class="ax-msg ${m.role === 'me' ? 'ax-me' : 'ax-them'}">${m.role === 'me' ? '' : `<span class="ax-msg-avatar" aria-hidden="true">${auriImage}</span>`}<div class="ax-bubble${m.pending ? ' ax-typing' : ''}"><p>${esc(m.text).replace(/\n/g, '<br>')}</p>${(m.actions || []).length ? `<div class="ax-actions">${m.actions.map((a, i) => a.brief ? `<button type="button" class="ax-action ax-action-primary" data-ax-brief="${i}">${esc(a.label)}</button>` : `<a class="ax-action" href="${esc(a.href)}">${esc(a.label)}<span aria-hidden="true"> →</span></a>`).join('')}</div>` : ''}</div></li>`;
  const draw = () => {
    logEl.innerHTML = log.map(bubble).join('');
    logEl.querySelectorAll('[data-ax-brief]').forEach(button => button.addEventListener('click', () => {
      const msg = log[[...logEl.children].indexOf(button.closest('li'))];
      const action = msg?.actions?.[Number(button.dataset.axBrief)];
      if (action?.brief) onBrief?.(action.brief.service, action.brief.text);
    }));
    logEl.scrollTop = logEl.scrollHeight;
  };

  // `direct` questions come from a page's own context (a roadmap stage, the
  // dashboard) and always go to the real guidance endpoint, not a shortcut.
  async function answer(text, { direct = false } = {}) {
    const start = log.length;
    log.push({ role: 'me', text }); save(); draw();
    const t = text.toLowerCase();
    const idea = SERVICE_IDEAS.find(s => s.match.test(t));
    if (direct) {
      const pending = { role: 'auri', text: c.thinking, pending: true };
      log.push(pending); draw();
      let reply;
      try { reply = await askAuri(text); } catch { reply = ''; }
      log.splice(log.indexOf(pending), 1, { role: 'auri', text: reply || c.error });
    } else if (idea && canRequest && START_WORDS.test(t)) {
      const name = idea.name[lang] || idea.name.en;
      const profile = workspace?.profile || {};
      const brief = [text, profile.name && `Business: ${profile.name}`, profile.industry && `Industry: ${profile.industry}`, [profile.city, profile.country].filter(Boolean).join(', '), profile.goals && `Goal: ${profile.goals}`].filter(Boolean).join('\n');
      log.push({ role: 'auri', text: c.startReply(name), actions: [{ label: c.start, brief: { service: idea.service, text: brief } }] });
    } else if (workspace && STUDIO_ROUTES.some(r => r.match.test(t))) {
      const route = STUDIO_ROUTES.find(r => r.match.test(t));
      const label = (route.label[lang] || route.label.en);
      log.push({ role: 'auri', text: (STUDIO_REPLY[lang] || STUDIO_REPLY.en)(label), actions: [{ label, href: link('studio', { view: route.view }) }] });
    } else if (INTENTS.billing.test(t)) {
      const n = (connected?.invoices || []).filter(i => ['sent', 'overdue'].includes(i.status)).length;
      log.push({ role: 'auri', text: c.billingReply(dueAmount ? money(lang, dueAmount) : '', n).replace(/ (Billing details are on the right|Your billing is on the right)\./, ''), actions: [{ label: c.billingLink, href: '/account' }] });
    } else if (INTENTS.request.test(t) && canRequest) {
      log.push({ role: 'auri', text: c.requestReply, actions: [{ label: c.requestAction, href: link('requests', { new: '1' }) }] });
    } else if (INTENTS.roadmap.test(t) && missions.length) {
      log.push({ role: 'auri', text: c.roadmapReply(next ? missionTitle(next) : ''), actions: [{ label: c.roadmapAction, href: link('journey', next ? { task: next.id } : {}) }] });
    } else if (INTENTS.services.test(t) && /show|list|my |göster|hizmetlerim|اعرض|خدماتي|mes /.test(t)) {
      log.push({ role: 'auri', text: c.servicesReply(liveCount, openCount), actions: [{ label: c.servicesLink, href: link('services') }] });
    } else {
      const pending = { role: 'auri', text: c.thinking, pending: true };
      log.push(pending); draw();
      let reply;
      try { reply = await askAuri(text); } catch { reply = ''; }
      log.splice(log.indexOf(pending), 1, { role: 'auri', text: reply || c.error });
    }
    save(); if (host.isConnected) draw();
    history?.save(log.slice(start).filter(m => !m.pending && m.text).map(m => ({ role: m.role === 'me' ? 'me' : 'auri', text: m.text }))).catch(() => {});
  }
  const form = host.querySelector('[data-ax-form]'), input = form.querySelector('textarea');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim().slice(0, 500);
    if (!text) return;
    input.value = ''; input.style.height = '';
    answer(text);
  });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit?.(); } });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(140, input.scrollHeight) + 'px'; });
  host.querySelectorAll('[data-ax-chip]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.axChip);
    if (i === 3 && canRequest) { location.assign(link('requests', { new: '1' })); return; }
    answer(c.chips[i]);
  }));
  draw();
  if (initial) answer(initial, { direct }); else setTimeout(() => input.focus({ preventScroll: true }), 50);
  return {
    reset: () => { log = [greeting()]; save(); draw(); history?.clear().catch(() => {}); },
    ask: (text, options) => answer(text, options),
  };
}
