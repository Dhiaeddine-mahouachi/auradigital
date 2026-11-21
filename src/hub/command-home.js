// AuraHub home: an AI command center. Ask Auri for anything, follow the
// "Set up your business" checklist where Auri can take each step on, see what
// Auri and the team are working on, and keep the business snapshot in view.
import { connectedRows, dashCopy, statusPill } from './dashboard-view.js';

const COPY = {
  en: {
    ask: biz => `What should Auri do for ${biz} today?`, askNote: 'Describe it in your own words. Auri plans it, writes the brief and gets the team moving.',
    placeholder: 'e.g. Build me a website with online booking', go: 'Ask Auri',
    ideas: ['Build me a website', 'Create my QR menu', 'Get more Google reviews', 'Automate WhatsApp replies'],
    setup: 'Set up your business', setupNote: (d, t) => `${d} of ${t} steps done`, letAuri: 'Let Auri do it', details: 'Details', doneLabel: 'Done', more: n => `+ ${n} more steps in your roadmap`,
    working: 'Auri is working on', workingNote: 'Live progress of your requests and services.', idle: 'Nothing in progress yet. Pick a step above and let Auri start it.',
    stages: ['Received', 'In review', 'In production', 'Live'],
    business: 'Your business', edit: 'Edit profile', live: 'Live services', due: 'Amount due', open: 'Open requests', services: 'Services', allServices: 'All services', billing: 'Billing',
  },
  tr: {
    ask: biz => `Auri bugün ${biz} için ne yapsın?`, askNote: 'Kendi kelimelerinizle anlatın. Auri planlar, brifi yazar ve ekibi harekete geçirir.',
    placeholder: 'ör. Online randevulu bir web sitesi kur', go: 'Auri’ye sor',
    ideas: ['Bana web sitesi kur', 'QR menümü oluştur', 'Daha fazla Google yorumu', 'WhatsApp yanıtlarını otomatikleştir'],
    setup: 'İşletmenizi kurun', setupNote: (d, t) => `${t} adımdan ${d} tamam`, letAuri: 'Auri yapsın', details: 'Ayrıntılar', doneLabel: 'Tamam', more: n => `+ yol haritanızda ${n} adım daha`,
    working: 'Auri’nin üzerinde çalıştıkları', workingNote: 'Talep ve hizmetlerinizin canlı durumu.', idle: 'Henüz devam eden bir şey yok. Yukarıdan bir adım seçin, Auri başlatsın.',
    stages: ['Alındı', 'İncelemede', 'Üretimde', 'Yayında'],
    business: 'İşletmeniz', edit: 'Profili düzenle', live: 'Yayındaki hizmetler', due: 'Ödenecek', open: 'Açık talepler', services: 'Hizmetler', allServices: 'Tüm hizmetler', billing: 'Ödemeler',
  },
  ar: {
    ask: biz => `ماذا يفعل أوري لـ ${biz} اليوم؟`, askNote: 'صفه بكلماتك. يخطط أوري ويكتب الملخص ويحرّك الفريق.',
    placeholder: 'مثلًا: ابنِ لي موقعًا مع حجز أونلاين', go: 'اسأل أوري',
    ideas: ['ابنِ لي موقعًا', 'أنشئ قائمتي QR', 'تقييمات Google أكثر', 'أتمتة ردود واتساب'],
    setup: 'جهّز نشاطك', setupNote: (d, t) => `${d} من ${t} خطوات مكتملة`, letAuri: 'دع أوري ينجزها', details: 'التفاصيل', doneLabel: 'تم', more: n => `+ ${n} خطوات أخرى في خطتك`,
    working: 'ما يعمل عليه أوري', workingNote: 'تقدم مباشر لطلباتك وخدماتك.', idle: 'لا شيء قيد التنفيذ بعد. اختر خطوة بالأعلى ودع أوري يبدأ.',
    stages: ['مستلم', 'قيد المراجعة', 'قيد التنفيذ', 'مباشر'],
    business: 'نشاطك', edit: 'تعديل الملف', live: 'خدمات مباشرة', due: 'المستحق', open: 'طلبات مفتوحة', services: 'الخدمات', allServices: 'كل الخدمات', billing: 'الفواتير',
  },
  fr: {
    ask: biz => `Que doit faire Auri pour ${biz} aujourd’hui ?`, askNote: 'Décrivez-le avec vos mots. Auri planifie, rédige le brief et lance l’équipe.',
    placeholder: 'ex. Crée-moi un site avec réservation en ligne', go: 'Demander à Auri',
    ideas: ['Crée-moi un site web', 'Crée mon menu QR', 'Plus d’avis Google', 'Automatise WhatsApp'],
    setup: 'Configurez votre activité', setupNote: (d, t) => `${d} sur ${t} étapes faites`, letAuri: 'Laisser Auri faire', details: 'Détails', doneLabel: 'Fait', more: n => `+ ${n} autres étapes dans votre feuille de route`,
    working: 'Auri travaille sur', workingNote: 'Avancement en direct de vos demandes et services.', idle: 'Rien en cours. Choisissez une étape et laissez Auri la lancer.',
    stages: ['Reçu', 'En revue', 'En production', 'En ligne'],
    business: 'Votre activité', edit: 'Modifier le profil', live: 'Services en ligne', due: 'Montant dû', open: 'Demandes ouvertes', services: 'Services', allServices: 'Tous les services', billing: 'Facturation',
  },
};
const IDEA_ICONS = ['M3 5h18v12H3z M8 21h8 M12 17v4', 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M14 14h2v2h-2z M18 18h2v2h-2z', 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z', 'M4 5h16v10H9l-5 4z M8 10h.01 M12 10h.01 M16 10h.01'];
const svg = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const sparkle = svg('M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5 18 18 M6 18l2.5-2.5 M15.5 8.5 18 6');
const money = (lang, amount) => new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang, { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(amount || 0));
// Which stage a record is in: 0 received, 1 review, 2 production, 3 live.
function stageOf(status) {
  const s = String(status || '').toLowerCase();
  if (/approved|active|completed|delivered|live|paid|done|ready/.test(s)) return 3;
  if (/production|progress|in-progress|in_production/.test(s)) return 2;
  if (/review|waiting|quote|pending|contacted/.test(s)) return 1;
  return 0;
}

export function renderCommandHome({ host, lang, esc, link, me, workspace, snapshot, connected, missionTitle, canAsk, canRequest, onAsk, onLetAuri, auriImage, attention, nextAction, nextTitle, labels }) {
  const c = COPY[lang] || COPY.en, d = dashCopy(lang);
  const missions = workspace.missions || [];
  const done = missions.filter(m => m.status === 'done').length;
  const pct = missions.length ? Math.round(100 * done / missions.length) : 0;
  const open = missions.filter(m => m.status !== 'done');
  const shown = [...open.slice(0, 5), ...missions.filter(m => m.status === 'done').slice(-2)];
  const rows = connectedRows(connected || {}, lang);
  const work = [
    ...(snapshot.attention || []).map(r => ({ title: r.name || r.draft?.fields?.businessName || 'AuraMenu', meta: r.kind === 'menu' ? d.kinds.auramenu : d.kinds.order, status: r.kind === 'menu' ? 'review' : r.status, stage: 1 })),
    ...(snapshot.progress || []).map(r => ({ title: r.name, meta: d.kinds.order, status: r.productionStatus || r.status, stage: stageOf(r.productionStatus || r.status) })),
    ...rows.filter(r => !['invoice', 'subscription'].includes(r.kind)).map(r => ({ title: r.title, meta: r.meta, status: r.status, stage: stageOf(r.status) })),
  ].slice(0, 6);
  const liveCount = (snapshot.services?.length || 0) + (connected?.totals?.live || 0);
  const openCount = (snapshot.attention?.length || 0) + (snapshot.progress?.length || 0) + (connected?.requests || []).filter(r => r.status === 'pending').length;
  const due = connected?.totals?.amountDue || 0;
  const profile = workspace.profile || {};
  const initials = String(workspace.organization.name || 'A').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  host.innerHTML = `<div class="ac">
    ${canAsk ? `<section class="ac-hero">
      <div class="ac-hero-top"><span class="ac-hero-auri" aria-hidden="true">${auriImage}</span><div>
        <h2>${esc(c.ask(workspace.organization.name))}</h2><p>${esc(c.askNote)}</p></div></div>
      <form class="ac-prompt" data-ac-prompt><label class="sr-only" for="ac-q">${esc(c.go)}</label>
        <span class="ac-prompt-icon">${sparkle}</span>
        <input id="ac-q" name="q" maxlength="500" placeholder="${esc(c.placeholder)}" autocomplete="off">
        <button type="submit" class="ac-go">${esc(c.go)}</button></form>
      <div class="ac-ideas">${c.ideas.map((idea, i) => `<button type="button" class="ac-idea" data-ac-idea="${i}">${svg(IDEA_ICONS[i])}<span>${esc(idea)}</span></button>`).join('')}</div>
    </section>` : ''}
    ${attention || nextAction ? `<section class="ac-next${attention ? ' is-attention' : ''}"><span class="ac-next-dot" aria-hidden="true"></span>
      <div><small>${esc(attention ? labels.attention : labels.next)}</small><strong>${esc(attention ? attention.name : nextTitle)}</strong></div>
      ${attention ? `<a class="ac-next-btn" href="${esc(attention.href)}">${esc(attention.label)}</a>` : ''}${nextAction ? `<a class="ac-next-btn${attention ? ' ghost' : ''}" href="${esc(nextAction.href)}">${esc(nextAction.label)}</a>` : ''}</section>` : ''}
    <div class="ac-grid">
      <div class="ac-main">
        <section class="ac-card">
          <header class="ac-card-head"><div><h2>${esc(c.setup)}</h2><p>${esc(c.setupNote(done, missions.length))}</p></div><span class="ac-pct">${pct}%</span></header>
          <div class="ac-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(c.setup)}"><i style="width:${pct}%"></i></div>
          <ol class="ac-steps">${shown.map(m => {
            const isDone = m.status === 'done';
            return `<li class="ac-step${isDone ? ' is-done' : ''}"><span class="ac-tick" aria-hidden="true">${isDone ? '✓' : ''}</span>
              <span class="ac-step-text"><strong>${esc(missionTitle(m))}</strong>${isDone ? '' : `<small>${esc(m.reason || m.description || '')}</small>`}</span>
              <span class="ac-step-actions">${isDone ? `<span class="hx-pill good">${esc(c.doneLabel)}</span>` : `${canRequest ? `<button type="button" class="ac-auri-btn" data-ac-let="${esc(m.id)}">${sparkle}<span>${esc(c.letAuri)}</span></button>` : ''}<a class="ac-link" href="${esc(link('journey', { task: m.id }))}">${esc(c.details)}</a>`}</span></li>`;
          }).join('')}</ol>
          ${open.length > 5 ? `<a class="ac-more" href="${esc(link('journey'))}">${esc(c.more(open.length - 5))} →</a>` : ''}
        </section>
        <section class="ac-card">
          <header class="ac-card-head"><div><h2>${esc(c.working)}</h2><p>${esc(c.workingNote)}</p></div></header>
          ${work.length ? `<ul class="ac-work">${work.map(w => `<li><div class="ac-work-top"><strong>${esc(w.title)}</strong>${statusPill(d, w.status, esc)}</div><small>${esc(w.meta || '')}</small>
            <ol class="ac-stages" aria-label="${esc(c.stages[w.stage])}">${c.stages.map((s, i) => `<li class="${i < w.stage ? 'past' : i === w.stage ? 'now' : ''}"><span>${esc(s)}</span></li>`).join('')}</ol></li>`).join('')}</ul>`
            : `<p class="hx-empty">${esc(c.idle)}</p>`}
        </section>
      </div>
      <aside class="ac-side">
        <section class="ac-card ac-biz">
          <div class="ac-biz-head"><span class="ac-biz-avatar" aria-hidden="true">${esc(initials)}</span><div><strong>${esc(workspace.organization.name)}</strong><small>${esc([profile.industry, profile.city].filter(Boolean).join(' · '))}</small></div></div>
          <dl class="ac-biz-stats">
            <div><dt>${esc(c.live)}</dt><dd>${liveCount}</dd></div>
            <div><dt>${esc(c.open)}</dt><dd>${openCount}</dd></div>
            <div class="${due ? 'warn' : ''}"><dt>${esc(c.due)}</dt><dd>${esc(money(lang, due))}</dd></div>
          </dl>
          <div class="ac-biz-links">${workspace.permissions.includes('profile:write') ? `<a href="${esc(link('profile'))}">${esc(c.edit)}</a>` : ''}<a href="/account">${esc(c.billing)}</a></div>
        </section>
        <section class="ac-card">
          <header class="ac-card-head"><div><h2>${esc(c.services)}</h2></div><a class="ac-link" href="${esc(link('services'))}">${esc(c.allServices)} →</a></header>
          ${rows.length ? `<ul class="ac-mini">${rows.slice(0, 5).map(r => `<li><span><strong>${esc(r.title)}</strong><small>${esc(r.meta)}</small></span>${statusPill(d, r.status, esc)}</li>`).join('')}</ul>` : `<p class="hx-empty">${esc(d.connectedEmpty)}</p>`}
        </section>
      </aside>
    </div>
  </div>`;
  host.querySelector('[data-ac-prompt]')?.addEventListener('submit', event => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get('q') || '').trim();
    if (q) onAsk(q.slice(0, 500));
  });
  host.querySelectorAll('[data-ac-idea]').forEach(b => b.addEventListener('click', () => onAsk(c.ideas[Number(b.dataset.acIdea)])));
  host.querySelectorAll('[data-ac-let]').forEach(b => b.addEventListener('click', () => onLetAuri(missions.find(m => m.id === b.dataset.acLet))));
}
