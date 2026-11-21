// Chat-first AuraHub home: a conversation with Auri on the left and a context
// panel (Overview, Services, Roadmap, Billing) on the right. Auri summarises
// the business, opens the right panel for what you ask, and answers free text
// through the workspace Auri endpoint (which falls back to roadmap guidance).
import { connectedRows, connectedList, dashCopy, statusPill } from './dashboard-view.js';

const COPY = {
  en: {
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
const money = (lang, amount) => new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang, { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(amount || 0));

export function renderChatHome({ host, lang, esc, link, me, workspace, snapshot, connected, next, missionTitle, attention, nextAction, askAuri, auriImage, shortcuts = '' }) {
  const c = chatCopy(lang), d = dashCopy(lang);
  const id = workspace?.organization.id || 'new';
  const storeKey = 'aura-chat:' + id;
  const missions = workspace?.missions || [];
  const done = missions.filter(m => m.status === 'done').length;
  const rows = connectedRows(connected || {}, lang);
  const openCount = (snapshot?.attention?.length || 0) + (snapshot?.progress?.length || 0) + (connected?.requests || []).filter(r => r.status === 'pending').length;
  const liveCount = (snapshot?.services?.length || 0) + (connected?.totals?.live || 0);
  const dueAmount = connected?.totals?.amountDue || 0;
  const canRequest = workspace?.permissions?.includes('roadmap:write');

  // Conversation (kept for this browser tab so moving around the hub keeps it).
  let log = [];
  try { log = JSON.parse(sessionStorage.getItem(storeKey) || '[]'); } catch {}
  const save = () => { try { sessionStorage.setItem(storeKey, JSON.stringify(log.slice(-40))); } catch {} };
  const greeting = () => {
    const lines = [c.hi(String(me.name || '').split(' ')[0], workspace?.organization.name || 'AuraHub')];
    if (attention) lines.push(c.attention(attention.name));
    if (missions.length) lines.push(c.roadmapLine(done, missions.length, next ? missionTitle(next) : ''));
    else lines.push(c.noRoadmap);
    if (openCount) lines.push(c.openLine(openCount));
    if (liveCount) lines.push(c.liveLine(liveCount));
    if (dueAmount) lines.push(c.dueLine(money(lang, dueAmount)));
    const actions = [];
    if (attention) actions.push({ label: attention.label || c.reviewAction, href: attention.href });
    if (nextAction) actions.push(nextAction);
    if (!missions.length && canRequest !== false) actions.push({ label: c.buildAction, href: link('onboarding') });
    return { role: 'auri', text: lines.join('\n'), actions, greeting: true };
  };
  // The greeting always reflects the business as it is now; the rest of the
  // conversation is kept.
  log = [greeting(), ...log.filter(m => !m.greeting)];
  save();

  const panelTab = (() => { try { return sessionStorage.getItem('aura-chat-panel') || 'overview'; } catch { return 'overview'; } })();
  host.innerHTML = `<div class="cx">
    <section class="cx-chat" aria-label="Auri">
      <header class="cx-head">
        <span class="cx-avatar">${auriImage}</span>
        <span class="cx-head-text"><strong>Auri</strong><small><i class="cx-online" aria-hidden="true"></i>${esc(c.status)}</small></span>
        <button type="button" class="cx-ghost cx-panel-toggle" data-cx-panel-open aria-controls="cx-panel">${esc(c.panel)}</button>
        <button type="button" class="cx-ghost" data-cx-clear>${esc(c.clear)}</button>
      </header>
      <ol class="cx-log" role="log" aria-live="polite" data-cx-log></ol>
      <div class="cx-chips" data-cx-chips>${c.chips.map((chip, i) => `<button type="button" class="cx-chip" data-cx-chip="${i}">${esc(chip)}</button>`).join('')}</div>
      <form class="cx-input" data-cx-form>
        <label class="sr-only" for="cx-text">${esc(c.placeholder)}</label>
        <textarea id="cx-text" name="q" rows="1" maxlength="500" placeholder="${esc(c.placeholder)}" autocomplete="off"></textarea>
        <button type="submit" class="cx-send" aria-label="${esc(c.send)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
      </form>
    </section>
    <aside class="cx-panel" id="cx-panel" data-cx-panel>
      <div class="cx-panel-grab" aria-hidden="true"></div>
      <div class="cx-tabs" role="tablist">${['overview', 'services', 'roadmap', 'billing'].map((tab, i) => `<button type="button" role="tab" class="cx-tab" data-cx-tab="${tab}" aria-selected="${tab === panelTab}">${esc(c.tabs[i])}</button>`).join('')}<button type="button" class="cx-ghost cx-panel-close" data-cx-panel-close aria-label="✕">✕</button></div>
      <div class="cx-panel-body" data-cx-body role="tabpanel"></div>
    </aside>
  </div>`;

  const logEl = host.querySelector('[data-cx-log]');
  const bubble = m => `<li class="cx-msg ${m.role === 'me' ? 'cx-me' : 'cx-them'}">${m.role === 'me' ? '' : `<span class="cx-msg-avatar" aria-hidden="true">${auriImage}</span>`}<div class="cx-bubble"><p>${esc(m.text).replace(/\n/g, '<br>')}</p>${(m.actions || []).length ? `<div class="cx-actions">${m.actions.map(a => a.href ? `<a class="cx-action" href="${esc(a.href)}">${esc(a.label)}<span aria-hidden="true"> →</span></a>` : `<button type="button" class="cx-action" data-cx-open="${esc(a.panel)}">${esc(a.label)}</button>`).join('')}</div>` : ''}</div></li>`;
  const draw = () => {
    logEl.innerHTML = log.map(bubble).join('');
    logEl.querySelectorAll('[data-cx-open]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.cxOpen, true)));
    logEl.scrollTop = logEl.scrollHeight;
  };

  // Context panel
  const body = host.querySelector('[data-cx-body]');
  const panel = host.querySelector('[data-cx-panel]');
  const listOr = html => html || `<p class="hx-empty">${esc(c.nothing)}</p>`;
  const panels = {
    overview: () => {
      const states = ['done', !missions.length ? 'todo' : done === missions.length ? 'done' : 'active', openCount ? 'active' : 'todo', (snapshot?.progress?.length || 0) ? 'active' : 'todo', liveCount ? 'done' : 'todo'];
      const targets = [link('profile'), link('journey'), link('requests'), link('services'), link('services')];
      return `<ol class="cx-flow">${c.flow.map((name, i) => `<li data-state="${states[i]}"><a href="${esc(targets[i])}"><span aria-hidden="true">${states[i] === 'done' ? '✓' : i + 1}</span>${esc(name)}</a></li>`).join('')}</ol>
        <div class="cx-stats">
          <a href="${esc(link('journey'))}"><small>${esc(d.kRoadmap)}</small><strong>${missions.length ? Math.round(100 * done / missions.length) : 0}%</strong></a>
          <a href="${esc(link('requests'))}"><small>${esc(d.kRequests)}</small><strong>${openCount}</strong></a>
          <a href="${esc(link('services'))}"><small>${esc(d.kLive)}</small><strong>${liveCount}</strong></a>
          <a href="/account" class="${dueAmount ? 'warn' : ''}"><small>${esc(d.kDue)}</small><strong>${esc(money(lang, dueAmount))}</strong></a>
        </div>`;
    },
    services: () => `${listOr(rows.filter(r => !['invoice'].includes(r.kind)).length ? connectedList(rows.filter(r => r.kind !== 'invoice'), lang, esc, 12) : '')}
      <a class="cx-more" href="${esc(link('services'))}">${esc(d.viewAll)} →</a>${shortcuts}`,
    roadmap: () => {
      const upcoming = missions.filter(m => m.status !== 'done').slice(0, 8);
      return `${listOr(upcoming.length ? `<ul class="hx-list">${upcoming.map(m => `<li><a class="hx-list-row" href="${esc(link('journey', { task: m.id }))}"><span class="hx-check" data-state="${esc(m.status)}" aria-hidden="true"></span><span class="hx-list-main"><strong>${esc(missionTitle(m))}</strong><small>${esc(m.reason || m.description || '')}</small></span>${statusPill(d, m.status, esc)}</a></li>`).join('')}</ul>` : '')}
        <a class="cx-more" href="${esc(link(missions.length ? 'journey' : 'onboarding'))}">${esc(missions.length ? c.roadmapAction : c.buildAction)} →</a>`;
    },
    billing: () => {
      const bill = rows.filter(r => ['invoice', 'subscription', 'shop'].includes(r.kind));
      return `<div class="cx-due ${dueAmount ? 'warn' : ''}"><small>${esc(c.due)}</small><strong>${esc(money(lang, dueAmount))}</strong></div>
        ${listOr(bill.length ? connectedList(bill, lang, esc, 12) : '')}
        <a class="cx-more" href="/account">${esc(c.allBilling)} →</a>`;
    },
  };
  function showPanel(tab, openOnMobile) {
    if (!panels[tab]) tab = 'overview';
    host.querySelectorAll('[data-cx-tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.cxTab === tab)));
    body.innerHTML = panels[tab]();
    try { sessionStorage.setItem('aura-chat-panel', tab); } catch {}
    if (openOnMobile) panel.classList.add('open');
  }
  host.querySelectorAll('[data-cx-tab]').forEach(t => t.addEventListener('click', () => showPanel(t.dataset.cxTab)));
  host.querySelector('[data-cx-panel-open]').addEventListener('click', () => showPanel(panelTab, true));
  host.querySelector('[data-cx-panel-close]').addEventListener('click', () => panel.classList.remove('open'));
  host.querySelector('[data-cx-clear]').addEventListener('click', () => { log = [greeting()]; save(); draw(); });

  // Answers: open the right panel for known topics, ask Auri for everything else.
  async function answer(text) {
    log.push({ role: 'me', text }); save(); draw();
    const t = text.toLowerCase();
    if (INTENTS.billing.test(t)) {
      const n = (connected?.invoices || []).filter(i => ['sent', 'overdue'].includes(i.status)).length;
      log.push({ role: 'auri', text: c.billingReply(dueAmount ? money(lang, dueAmount) : '', n), actions: [{ label: c.tabs[3], panel: 'billing' }] }); showPanel('billing', false);
    } else if (INTENTS.request.test(t) && canRequest) {
      log.push({ role: 'auri', text: c.requestReply, actions: [{ label: c.requestAction, href: link('requests', { new: '1' }) }] });
    } else if (INTENTS.roadmap.test(t) && missions.length) {
      log.push({ role: 'auri', text: c.roadmapReply(next ? missionTitle(next) : ''), actions: [{ label: c.roadmapAction, href: link('journey', next ? { task: next.id } : {}) }] }); showPanel('roadmap', false);
    } else if (INTENTS.services.test(t) && /show|list|my |göster|hizmetlerim|اعرض|خدماتي|mes /.test(t)) {
      log.push({ role: 'auri', text: c.servicesReply(liveCount, openCount), actions: [{ label: c.tabs[1], panel: 'services' }] }); showPanel('services', false);
    } else {
      const pending = { role: 'auri', text: c.thinking, pending: true };
      log.push(pending); draw();
      let reply;
      try { reply = await askAuri(text); } catch { reply = ''; }
      log.splice(log.indexOf(pending), 1, { role: 'auri', text: reply || c.error });
    }
    save(); if (host.isConnected) draw();
  }
  const form = host.querySelector('[data-cx-form]'), input = form.querySelector('textarea');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value.trim().slice(0, 500);
    if (!text) return;
    input.value = ''; input.style.height = '';
    answer(text);
  });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit?.(); } });
  input.addEventListener('input', () => { input.style.height = ''; input.style.height = Math.min(140, input.scrollHeight) + 'px'; });
  host.querySelectorAll('[data-cx-chip]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.cxChip);
    if (i === 3 && canRequest) { location.assign(link('requests', { new: '1' })); return; }
    answer(c.chips[i]);
  }));
  draw();
  showPanel(panelTab, false);
}
