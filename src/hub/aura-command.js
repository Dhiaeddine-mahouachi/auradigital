import { guideText } from './mission-copy.js';
// Aura Command — "Understand your business". The default page after sign-in.
// Every number here comes from a real record: the Aura Studio pipeline, the
// AuraDigital service records connected to this account, or the roadmap.
// Sources that are not connected show a setup state, never a sample number.
import { osCopy } from './os-copy.js';
import { icon, pill, emptyState, barChart, bucketize, parseDate, relative, shortDate, number, money, deliveryStage, TONE } from './os-ui.js';
import { dashCopy } from './dashboard-view.js';
import { missionGuide } from '../roadmap.js';
import { profileCompleteness } from './business-view.js';

const TERMINAL = /^(completed|cancelled|canceled|rejected|delivered)$/;
let chartRange = '30d', chartMetric = 'inquiries';

export function bookingLabel(c, industry) {
 return industry === 'restaurant' ? c.kpi.reservations : ['services', 'salon', 'professional'].includes(industry) ? c.kpi.appointments : industry === 'real_estate' ? c.kpi.viewings : c.kpi.bookings;
}

// One de-duplicated list of the services AuraDigital delivers for this
// business, from the workspace-linked records and the account-linked CRM.
export function serviceItems({ snapshot, connected, link, lang }) {
 const d = dashCopy(lang), seen = new Set(), items = [];
 const add = item => { const key = item.kind + ':' + item.id; if (seen.has(key)) return; seen.add(key); items.push(item); };
 for (const r of snapshot?.records || []) add({ kind: r.kind, id: String(r.id), title: r.name, status: r.status, due: r.dueDate, renews: r.renewalDate, at: r.createdAt, href: link('services', { serviceRecord: r.key }) });
 for (const o of connected?.orders || []) add({ kind: 'order', id: String(o.id), title: o.type || d.kinds.order, status: o.status, due: o.dueDate, at: o.createdAt, href: link('services') });
 for (const s of connected?.subscriptions || []) add({ kind: 'subscription', id: String(s.id), title: s.plan || d.kinds.subscription, status: s.status, renews: s.nextBillingDate, at: s.createdAt, href: link('services') });
 for (const r of connected?.requests || []) add({ kind: r.kind, id: String(r.id), title: r.name || d.kinds[r.kind], meta: d.kinds[r.kind], status: r.status, at: r.updatedAt || r.createdAt, slug: r.slug, href: link('services') });
 return items.map(item => ({ ...item, stage: deliveryStage(item.status), terminal: TERMINAL.test(String(item.status || '')) }));
}

export function activityEvents({ leads = [], workspace, snapshot, connected, missionTitle, link, c }) {
 const events = [];
 for (const l of leads) events.push({ at: l.createdAt, text: c.activity.lead(l.name), icon: 'user', href: link('studio', { view: 'pipeline', lead: l.id }) });
 for (const m of workspace.missions || []) if (m.status === 'done' && m.completedAt) events.push({ at: m.completedAt, text: c.activity.mission(missionTitle(m)), icon: 'check', href: link('journey', { task: m.id }) });
 for (const r of snapshot?.requests || []) events.push({ at: r.createdAt, text: c.activity.request(r.name), icon: 'requests', href: link('requests', { request: r.id }) });
 for (const r of connected?.requests || []) events.push({ at: r.updatedAt || r.createdAt, text: c.activity.record(r.name), icon: 'services', href: link('services') });
 for (const o of connected?.orders || []) events.push({ at: o.createdAt, text: c.activity.record(o.type), icon: 'orders', href: link('services') });
 return events.filter(e => parseDate(e.at)).sort((a, b) => parseDate(b.at) - parseDate(a.at));
}

const within = (value, from, to) => { const d = parseDate(value); return d && d >= from && d < to; };

export function renderAuraCommand({ host, lang, esc, link, requestLink, me, workspace, snapshot, connected, leads, missionTitle, next, eligible = [], continueLabel, attention, canAsk, canRequest, onAsk, onChat = onAsk, onPrepare }) {
 const c = osCopy(lang), d = dashCopy(lang);
 const profile = workspace.profile || {};
 const perms = workspace.permissions || [];
 const hour = new Date().getHours();
 const part = hour < 12 ? c.greet.morning : hour < 18 ? c.greet.afternoon : c.greet.evening;
 const first = String(me.name || '').trim().split(/\s+/)[0];
 const items = serviceItems({ snapshot, connected, link, lang });
 const active = items.filter(i => !i.terminal);
 const live = active.filter(i => i.stage === 3);
 const hasWebsite = Boolean(profile.website) || (connected?.requests || []).some(r => r.kind === 'quicksite') || items.some(i => /web|site/i.test(i.title || ''));
 const hasMenu = profile.industry === 'restaurant' || (connected?.requests || []).some(r => r.kind === 'auramenu') || (snapshot?.attention || []).some(r => r.kind === 'menu') || (workspace.missions || []).some(m => m.capability === 'menu');
 const leadList = leads?.all || [];
 const now = new Date(), d30 = new Date(now - 30 * 86400000), d60 = new Date(now - 60 * 86400000);
 const inquiries30 = leadList.filter(l => within(l.createdAt, d30, new Date(now.getTime() + 60000))).length;
 const inquiriesPrev = leadList.filter(l => within(l.createdAt, d60, d30)).length;

 const quick = [
  canRequest && { label: c.quick.request, icon: 'plus', href: requestLink(), primary: true },
  canRequest && hasWebsite && { label: c.quick.website, icon: 'site', href: link('studio', { view: 'website' }) },
  hasMenu && { label: c.quick.menu, icon: 'menu', href: link('studio', { view: 'menu' }) },
  (workspace.missions || []).length && { label: c.quick.roadmap, icon: 'journey', href: link('journey') },
  canAsk && { label: c.quick.ask, icon: 'auri', ask: true },
 ].filter(Boolean);

 const kpi = ({ key, label, value, foot, source, setup, action, tone }) => `<article class="os-kpi${setup ? ' is-setup' : ''}" data-kpi="${key}">
  <header><span class="os-kpi-icon">${icon(key === 'visitors' ? 'globe' : key === 'inquiries' ? 'chat' : key === 'bookings' ? 'calendar' : 'services')}</span><h2>${esc(label)}</h2></header>
  ${setup ? `<p class="os-kpi-setup"><span class="os-dot" aria-hidden="true"></span>${esc(c.kpi.notConnected)}</p><p class="os-kpi-note">${esc(setup)}</p>${action || ''}`
   : `<p class="os-kpi-value">${esc(value)}</p><p class="os-kpi-foot ${tone ? 'is-' + tone : ''}">${esc(foot)}</p>`}
  <p class="os-source">${esc(source)}</p></article>`;
 const leadsAvailable = Array.isArray(leads?.all);
 const kpis = [
  kpi({ key: 'visitors', label: c.kpi.visitors, setup: c.kpi.visitorsSetup, source: c.kpi.srcNone,
   action: canRequest ? `<a class="os-link" href="${esc(requestLink('Web Design'))}">${esc(c.kpi.connect)} ${icon('arrow', 14)}</a>` : '' }),
  leadsAvailable && (leadList.length || !canRequest)
   ? kpi({ key: 'inquiries', label: c.kpi.inquiries, value: number(lang, inquiries30), foot: leadList.length ? c.kpi.delta(inquiries30 - inquiriesPrev) : c.kpi.none, tone: inquiries30 > inquiriesPrev ? 'up' : '', source: c.kpi.srcLeads + ' · ' + c.kpi.last30 })
   : kpi({ key: 'inquiries', label: c.kpi.inquiries, setup: leadsAvailable ? c.kpi.inquiriesSetup : c.state.error, source: c.kpi.srcLeads,
    action: `<a class="os-link" href="${esc(link('studio', { view: 'pipeline', new: '1' }))}">${esc(c.kpi.logLead)} ${icon('arrow', 14)}</a>` }),
  kpi({ key: 'bookings', label: bookingLabel(c, profile.industry), setup: c.kpi.bookingsSetup, source: c.kpi.srcNone,
   action: canAsk ? `<button type="button" class="os-link" data-os-ask="bookings">${esc(c.kpi.explore)} ${icon('arrow', 14)}</button>` : '' }),
  active.length
   ? kpi({ key: 'services', label: c.kpi.services, value: number(lang, active.length), foot: `${number(lang, live.length)} · ${c.kpi.live}`, source: c.kpi.srcServices })
   : kpi({ key: 'services', label: c.kpi.services, setup: c.kpi.servicesSetup, source: c.kpi.srcServices,
    action: `<a class="os-link" href="${esc(link('services'))}">${esc(c.kpi.browse)} ${icon('arrow', 14)}</a>` }),
 ].join('');

 const events = activityEvents({ leads: leadList, workspace, snapshot, connected, missionTitle, link, c }).slice(0, 7);
 // "Today": real, dated things that need the customer now.
 const soon = Date.now() + 7 * 86400000;
 const today = [
  ...(connected?.totals?.invoicesDue ? [{ attention: true, tag: c.today.tag, title: c.billing.invoices(connected.totals.invoicesDue), label: c.billing.open, href: '/account', icon: 'orders' }] : []),
  ...active.filter(i => { const d = parseDate(i.due); return d && d.getTime() < soon; }).slice(0, 2).map(i => ({ attention: true, tag: c.today.tag, title: c.today.due(i.title, shortDate(lang, i.due)), label: c.services.details, href: i.href, icon: 'clock' })),
  ...(() => { const stale = leadList.filter(l => !l.archived && l.stage !== 'won' && parseDate(l.updatedAt) && Date.now() - parseDate(l.updatedAt).getTime() > 3 * 86400000); return stale.length ? [{ attention: true, tag: c.today.tag, title: c.today.stale(stale.length), label: c.today.openPipeline, href: link('studio', { view: 'pipeline' }), icon: 'user' }] : []; })(),
 ];
 const completeness = profileCompleteness(profile, null, { ignoreLogo: true });
 const nextList = [
  ...(attention ? [{ attention: true, title: attention.name, label: attention.label, href: attention.href }] : []),
  ...today,
  ...(completeness < 70 && perms.includes('profile:write') ? [{ attention: true, tag: c.today.profileTag, title: c.today.profile(completeness), label: c.today.completeProfile, href: link('profile'), icon: 'business' }] : []),
  ...eligible.slice(0, attention ? 2 : 3).map(m => ({ mission: m, title: missionTitle(m), why: guideText(m.capability, 1, lang, missionGuide[m.capability]?.[1] ?? m.reason) || '', href: link('journey', { task: m.id }), service: missionGuide[m.capability]?.[0] })),
 ];
 const auriLine = attention ? c.auri.attention(attention.name) : next ? c.auri.next(missionTitle(next)) : (workspace.missions || []).length ? c.auri.idle : c.auri.setup;
 const stageNames = c.services.stages;

 host.innerHTML = `<div class="os-command">
  <section class="os-hero" aria-labelledby="os-greeting">
   <div class="os-hero-text"><p class="os-eyebrow">${esc(c.sections.command)} · ${esc(c.sections.commandTag)}</p>
    <h1 id="os-greeting">${esc(c.greet.line(part, first))} <span>${esc(c.greet.sub(workspace.organization.name))}</span></h1></div>
   ${quick.length ? `<nav class="os-quick" aria-label="${esc(c.sections.command)}">${quick.map(q => q.ask
    ? `<button type="button" class="os-btn is-quiet" data-os-ask="">${icon(q.icon)}<span>${esc(q.label)}</span></button>`
    : `<a class="os-btn ${q.primary ? 'is-primary' : 'is-quiet'}" href="${esc(q.href)}">${icon(q.icon)}<span>${esc(q.label)}</span></a>`).join('')}</nav>` : ''}
   ${canAsk ? `<form class="os-askbar" data-os-askbar><label class="sr-only" for="os-askbar-q">${esc(c.auri.ask)}</label>${icon('auri', 18)}<input id="os-askbar-q" name="q" maxlength="500" autocomplete="off" placeholder="${esc(c.auri.placeholder)}"><button class="os-btn is-primary is-sm">${esc(c.auri.ask)}</button></form>` : ''}
  </section>
  <section class="os-kpis" aria-label="${esc(c.chart.title)}">${kpis}</section>
  <p class="os-updated">${icon('clock', 14)} ${esc(c.today.updated(new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })))}</p>
  <div class="os-command-grid">
   <div class="os-col">
    <section class="os-card os-perf" aria-labelledby="os-perf-title">
     <header class="os-card-head"><div><h2 id="os-perf-title">${esc(c.chart.title)}</h2><p>${esc(c.chart.note)}</p></div>
      <div class="os-segment" role="group" aria-label="${esc(c.chart.title)}">${['30d', '90d', '12m'].map(r => `<button type="button" data-range="${r}" aria-pressed="${chartRange === r}">${esc(c.chart.ranges[r])}</button>`).join('')}</div></header>
     <div class="os-tabs is-small" role="tablist" aria-label="${esc(c.chart.source)}">${['inquiries', 'visitors', 'bookings'].map(m => `<button type="button" role="tab" id="os-metric-${m}" aria-controls="os-chart-panel" data-metric="${m}" aria-selected="${chartMetric === m}" tabindex="${chartMetric === m ? 0 : -1}">${esc(m === 'bookings' ? bookingLabel(c, profile.industry) : c.chart[m])}</button>`).join('')}</div>
     <div id="os-chart-panel" role="tabpanel" aria-labelledby="os-metric-${chartMetric}" data-chart></div>
    </section>
    <section class="os-card" aria-labelledby="os-act-title">
     <header class="os-card-head"><div><h2 id="os-act-title">${esc(c.activity.title)}</h2></div></header>
     ${events.length ? `<ol class="os-timeline">${events.map(e => `<li><span class="os-timeline-icon">${icon(e.icon, 16)}</span><a href="${esc(e.href)}">${esc(e.text)}</a><time datetime="${esc(parseDate(e.at).toISOString())}" title="${esc(parseDate(e.at).toLocaleString(lang))}">${esc(relative(lang, e.at))}</time></li>`).join('')}</ol>`
      : emptyState({ esc, iconName: 'clock', title: c.activity.empty })}
    </section>
   </div>
   <aside class="os-col os-side">
    <section class="os-card os-auri-card" aria-labelledby="os-auri-title">
     <div class="os-auri-row"><span class="os-auri-face" aria-hidden="true"><img src="/media/auri/level-${Math.max(1, Math.min(7, workspace.auri?.level || 1))}.webp" alt="" width="56" height="56"></span>
      <div><h2 id="os-auri-title">${esc(c.auri.title)}</h2><p>${esc(auriLine)}</p></div></div>
     <div class="os-auri-actions">${next && !attention ? `<a class="os-btn is-primary is-sm" href="${esc(link('journey', { task: next.id }))}">${esc(continueLabel)}</a>` : ''}
      ${canAsk ? `<button type="button" class="os-btn is-quiet is-sm" data-os-ask="next">${icon('auri', 16)}<span>${esc(c.auri.ask)}</span></button>` : ''}</div>
    </section>
    ${connected ? `<section class="os-card os-billing" aria-labelledby="os-bill-title">
     <header class="os-card-head"><div><h2 id="os-bill-title">${esc(c.billing.title)}</h2></div><a class="os-link" href="/account">${esc(c.billing.open)}</a></header>
     ${connected.totals?.amountDue ? `<p class="os-bill-due ${connected.totals.amountDue ? 'is-due' : ''}"><span>${esc(c.billing.due)}</span><strong>${esc(money(lang, connected.totals.amountDue, 'TRY'))}</strong></p><p class="os-muted">${esc(c.billing.invoices(connected.totals.invoicesDue))}</p>` : `<p class="os-muted">${esc(c.billing.none)}</p>`}
     <p class="os-source">${esc(c.billing.note)}</p></section>` : ''}
    <section class="os-card" aria-labelledby="os-next-title">
     <header class="os-card-head"><div><h2 id="os-next-title">${esc(c.next.title)}</h2></div></header>
     ${nextList.length ? `<ul class="os-next">${nextList.map((n, i) => `<li class="${n.attention ? 'is-attention' : ''}">
      <span class="os-next-mark">${n.attention ? icon(n.icon || 'alert', 16) : `<b>${i + 1 - nextList.filter(x => x.attention).length}</b>`}</span>
      <div><small>${esc(n.attention ? n.tag || c.next.attention : c.next.roadmap)}</small><strong>${esc(n.title)}</strong>${n.why ? `<p>${esc(n.why)}</p>` : ''}
       <div class="os-next-actions">${n.attention ? `<a class="os-link" href="${esc(n.href)}">${esc(n.label)}</a>`
        : `<a class="os-link" href="${esc(n.href)}">${esc(c.next.open)}</a>${canRequest && n.service ? `<button type="button" class="os-link" data-os-prepare="${esc(n.mission.id)}">${esc(c.next.prepare)}</button>` : ''}`}</div></div></li>`).join('')}</ul>`
      : emptyState({ esc, iconName: 'check', title: c.next.empty, tone: 'good' })}
    </section>
    <section class="os-card" aria-labelledby="os-svc-title">
     <header class="os-card-head"><div><h2 id="os-svc-title">${esc(c.services.title)}</h2></div><a class="os-link" href="${esc(link('services'))}">${esc(c.services.all)}</a></header>
     ${active.length ? `<ul class="os-services">${active.slice(0, 5).map(s => `<li><div class="os-service-top"><strong>${esc(s.title)}</strong>${pill(d.status[s.status] || String(s.status || '').replace(/[_-]/g, ' '), TONE[s.status] || (s.stage === 3 ? 'good' : s.stage === 2 ? 'info' : ''), esc)}</div>
      <div class="os-steps" role="img" aria-label="${esc(stageNames[s.stage])}">${stageNames.map((n, i) => `<span class="${i < s.stage ? 'is-past' : i === s.stage ? 'is-now' : ''}" title="${esc(n)}"></span>`).join('')}</div>
      <p class="os-service-meta"><span>${esc(stageNames[s.stage])}</span>${s.due ? `<span>${esc(c.services.due)} ${esc(shortDate(lang, s.due))}</span>` : s.renews ? `<span>${esc(c.services.renews)} ${esc(shortDate(lang, s.renews))}</span>` : ''}<a class="os-link" href="${esc(s.href)}">${esc(c.services.details)}</a></p></li>`).join('')}</ul>`
      : emptyState({ esc, iconName: 'services', title: c.services.empty, actions: `<a class="os-btn is-quiet is-sm" href="${esc(link('services'))}">${esc(c.kpi.browse)}</a>` })}
    </section>
   </aside>
  </div></div>`;

 const chartHost = host.querySelector('[data-chart]');
 const drawChart = () => {
  const panel = host.querySelector('#os-chart-panel');
  panel.setAttribute('aria-labelledby', 'os-metric-' + chartMetric);
  if (chartMetric !== 'inquiries') {
   chartHost.innerHTML = emptyState({ esc, iconName: 'plug', title: c.kpi.notConnected, text: c.chart.notConnected }) + `<p class="os-source">${esc(c.kpi.srcNone)}</p>`;
   return;
  }
  if (!leadsAvailable) { chartHost.innerHTML = emptyState({ esc, iconName: 'alert', title: c.state.error, tone: 'bad' }); return; }
  const buckets = bucketize(leadList.map(l => l.createdAt), chartRange, lang);
  const total = buckets.reduce((s, b) => s + b.value, 0);
  chartHost.innerHTML = (total ? barChart({ esc, buckets, label: `${c.chart.inquiries} · ${c.chart.ranges[chartRange]}`, valueLabel: c.chart.count, lang })
   : emptyState({ esc, iconName: 'chat', title: c.chart.emptyPeriod, actions: `<a class="os-btn is-quiet is-sm" href="${esc(link('studio', { view: 'pipeline', new: '1' }))}">${esc(c.kpi.logLead)}</a>` }))
   + `<p class="os-source">${esc(c.kpi.srcLeads)} · ${esc(c.chart.ranges[chartRange])}</p>`;
 };
 drawChart();
 host.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => {
  chartRange = b.dataset.range;
  host.querySelectorAll('[data-range]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  drawChart();
 }));
 const tabs = [...host.querySelectorAll('[data-metric]')];
 const select = tab => {
  chartMetric = tab.dataset.metric;
  tabs.forEach(x => { x.setAttribute('aria-selected', String(x === tab)); x.tabIndex = x === tab ? 0 : -1; });
  drawChart();
 };
 tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', e => {
   const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key] * (document.documentElement.dir === 'rtl' ? -1 : 1);
   if (!step) return;
   e.preventDefault();
   const target = tabs[(i + step + tabs.length) % tabs.length];
   target.focus(); select(target);
  });
 });
 const prompts = {
  next: next ? c.auri.promptNext(missionTitle(next)) : c.auri.promptGeneral,
  bookings: c.auri.promptBookings(bookingLabel(c, profile.industry)),
 };
 host.querySelectorAll('[data-os-ask]').forEach(b => b.addEventListener('click', () => onAsk(prompts[b.dataset.osAsk] || null)));
 host.querySelector('[data-os-askbar]')?.addEventListener('submit', e => { e.preventDefault(); const q = String(new FormData(e.currentTarget).get('q') || '').trim(); if (q) { onChat(q.slice(0, 500)); e.currentTarget.reset(); } });
 host.querySelectorAll('[data-os-prepare]').forEach(b => b.addEventListener('click', () => onPrepare(workspace.missions.find(m => m.id === b.dataset.osPrepare))));
}
