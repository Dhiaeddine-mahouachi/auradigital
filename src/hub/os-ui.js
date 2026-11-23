// AuraHub 4 design-system primitives shared by Aura Command, Journey and
// Studio. Pure string builders: no data access, no global state.
const P = {
 overview: 'M4 4h7v7H4z M13 4h7v4h-7z M13 10h7v10h-7z M4 13h7v7H4z',
 business: 'M4 9.5 5.5 4h13L20 9.5 M4 9.5h16 M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0 M5.5 12v8h13v-8 M10 20v-5h4v5',
 journey: 'M4 20c3-1 4-4 7-4s4 2 6 1 2-4 3-5 M4 20V4 M17 4l3 2-3 2z M20 4v6',
 studio: 'M4 4h4v16H4z M10 4h4v10h-4z M16 4h4v7h-4z',
 services: 'M3 8h18v12H3z M8 8V5h8v3 M3 13h18 M11 13v2h2v-2',
 site: 'M3 5h18v14H3z M3 9h18 M6 7h.01 M9 7h.01',
 analytics: 'M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16v-6 M20 16V6',
 auri: 'M12 3l1.9 4.6L19 9l-4 3.4 1.2 5.1L12 15l-4.2 2.5L9 12.4 5 9l5.1-1.4z',
 settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
 requests: 'M4 13l2-8h12l2 8 M4 13v6h16v-6 M4 13h5l1 2h4l1-2h5',
 menuDrafts: 'M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4',
 orders: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
 team: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21v-1a7 7 0 0 1 14 0v1 M17 11a3 3 0 1 0 0-6 M22 21v-1a5 5 0 0 0-4-5',
 plus: 'M12 5v14 M5 12h14',
 arrow: 'M5 12h14 M13 6l6 6-6 6',
 check: 'M5 12.5l4.5 4.5L19 7',
 clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
 alert: 'M12 3 2 20h20z M12 10v4 M12 17h.01',
 search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4',
 note: 'M5 4h14v12l-4 4H5z M15 20v-4h4 M8 9h8 M8 13h5',
 user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
 external: 'M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6',
 lock: 'M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
 plug: 'M9 3v5 M15 3v5 M6 8h12v3a6 6 0 0 1-12 0z M12 17v4',
 chat: 'M4 5h16v11H9l-5 4z',
 mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
 globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z',
 menu: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M14 14h2v2h-2z M18 18h2v2h-2z M18 13v2 M13 18h2',
 more: 'M5 12h.01 M12 12h.01 M19 12h.01',
 close: 'M6 6l12 12 M18 6 6 18',
 calendar: 'M4 6h16v15H4z M4 10h16 M8 3v4 M16 3v4',
 spark: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5 18 18 M6 18l2.5-2.5 M15.5 8.5 18 6',
 phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
 filter: 'M4 5h16l-6 8v6l-4-2v-4z',
 archive: 'M3 4h18v4H3z M5 8v12h14V8 M10 12h4',
 instagram: 'M4 4h16v16H4z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M17 7h.01',
 whatsapp: 'M4 20l1.4-4A8 8 0 1 1 8 18.7z M9 9.5c.5 2 2 3.6 4 4.4l1.2-1.1 2 1-.5 1.6c-3.3.2-7-3.3-7-6.7L10 8l1 2z',
};
export const icon = (name, size = 18) => `<svg class="os-i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name] || P.overview}"/></svg>`;

export const parseDate = value => {
 if (!value) return null;
 const text = String(value);
 const d = new Date(/T|Z|[+-]\d\d:?\d\d$/.test(text) ? text : text.replace(' ', 'T') + (text.length > 10 ? 'Z' : 'T00:00:00Z'));
 return Number.isFinite(d.getTime()) ? d : null;
};
export const shortDate = (lang, value) => {
 const d = parseDate(value);
 return d ? d.toLocaleDateString(lang, { day: 'numeric', month: 'short' }) : '';
};
export const relative = (lang, value) => {
 const d = parseDate(value);
 if (!d) return '';
 const diff = (d.getTime() - Date.now()) / 1000;
 const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
 for (const [unit, size] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) {
  if (Math.abs(diff) >= size) return rtf.format(Math.round(diff / size), unit);
 }
 return rtf.format(0, 'minute');
};
export const number = (lang, value) => new Intl.NumberFormat(lang).format(Number(value || 0));
export const money = (lang, amount, currency = 'TRY') => {
 try { return new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount || 0)); }
 catch { return number(lang, amount) + ' ' + currency; }
};

// Service delivery stage from any status the CRM, orders or requests use:
// 0 received, 1 in review, 2 in production, 3 live/delivered.
export function deliveryStage(status) {
 const s = String(status || '').toLowerCase();
 if (/approved|active|completed|delivered|live|paid|done/.test(s)) return 3;
 if (/production|progress|in-progress|scheduled|revision/.test(s)) return 2;
 if (/review|waiting|quote|pending|contacted|ready/.test(s)) return 1;
 return 0;
}
export const TONE = { approved: 'good', paid: 'good', active: 'good', completed: 'good', delivered: 'good', done: 'good', won: 'good',
 rejected: 'bad', overdue: 'bad', cancelled: 'bad', unpaid: 'warn', sent: 'warn', pending: 'warn', awaiting_transfer: 'warn',
 waiting: 'warn', waiting_client: 'warn', review: 'warn', quote_ready: 'warn', in_production: 'info', 'in-progress': 'info', in_progress: 'info', production: 'info' };
export const pill = (label, tone = '', esc) => `<span class="os-pill ${tone ? 'is-' + tone : ''}">${esc(label)}</span>`;

export function emptyState({ esc, iconName = 'spark', title, text, actions = '', tone = '' }) {
 return `<div class="os-empty ${tone ? 'is-' + tone : ''}"><span class="os-empty-icon">${icon(iconName, 22)}</span><div><strong>${esc(title)}</strong>${text ? `<p>${esc(text)}</p>` : ''}${actions ? `<div class="os-empty-actions">${actions}</div>` : ''}</div></div>`;
}
export const skeleton = (lines = 3) => `<div class="os-skeleton" aria-hidden="true">${Array.from({ length: lines }, (_, i) => `<span style="width:${92 - i * 17}%"></span>`).join('')}</div>`;
export const loading = (label, esc) => `<div class="os-loading" role="status"><span class="os-spinner" aria-hidden="true"></span><span>${esc(label)}</span></div>`;

// Bars for a time series. Accessible: an SVG for sighted users plus a
// visually-hidden table with the exact values.
export function barChart({ esc, buckets, label, valueLabel, lang }) {
 const max = Math.max(1, ...buckets.map(b => b.value));
 const w = 640, h = 180, pad = 26, gap = buckets.length > 20 ? 3 : 8;
 const bw = Math.max(4, (w - pad * 2 - gap * (buckets.length - 1)) / buckets.length);
 const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
 const y = v => h - pad - (v / max) * (h - pad * 2);
 const every = Math.ceil(buckets.length / 6);
 return `<figure class="os-chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" preserveAspectRatio="none">
  ${ticks.map(v => `<line x1="${pad}" x2="${w - pad}" y1="${y(v)}" y2="${y(v)}" class="os-chart-grid"/><text x="${pad - 8}" y="${y(v) + 4}" class="os-chart-tick" text-anchor="end">${v}</text>`).join('')}
  ${buckets.map((b, i) => { const x = pad + i * (bw + gap); return `<rect class="os-chart-bar${b.value ? '' : ' is-zero'}" x="${x.toFixed(1)}" y="${y(b.value).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(b.value ? 2 : 1, h - pad - y(b.value)).toFixed(1)}" rx="3"><title>${esc(b.label)}: ${b.value}</title></rect>${i % every === 0 ? `<text x="${(x + bw / 2).toFixed(1)}" y="${h - 6}" class="os-chart-tick" text-anchor="middle">${esc(b.short)}</text>` : ''}`; }).join('')}
 </svg><table class="sr-only"><caption>${esc(label)}</caption><thead><tr><th scope="col">${esc(label)}</th><th scope="col">${esc(valueLabel)}</th></tr></thead><tbody>${buckets.map(b => `<tr><th scope="row">${esc(b.label)}</th><td>${number(lang, b.value)}</td></tr>`).join('')}</tbody></table></figure>`;
}

// Group dated items into day/week/month buckets ending today.
export function bucketize(dates, range, lang) {
 const now = new Date();
 const out = [];
 if (range === '12m') {
  for (let i = 11; i >= 0; i--) {
   const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
   out.push({ start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 1), short: d.toLocaleDateString(lang, { month: 'short' }), label: d.toLocaleDateString(lang, { month: 'long', year: 'numeric' }), value: 0 });
  }
 } else {
  const days = range === '90d' ? 90 : 30, size = range === '90d' ? 7 : 1;
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  for (let i = Math.ceil(days / size) - 1; i >= 0; i--) {
   const e = new Date(end.getTime() - i * size * 86400000), s = new Date(e.getTime() - size * 86400000);
   out.push({ start: s, end: e, short: s.toLocaleDateString(lang, { day: 'numeric', month: 'short' }), label: s.toLocaleDateString(lang, { day: 'numeric', month: 'long' }) + (size > 1 ? ' +7' : ''), value: 0 });
  }
 }
 for (const value of dates) {
  const d = parseDate(value);
  if (!d) continue;
  const bucket = out.find(b => d >= b.start && d < b.end);
  if (bucket) bucket.value++;
 }
 return out;
}

// Small inline illustrations for the five Growth Journey stages. Shapes only
// use CSS variables, so they theme with the page and cost no network requests.
const ART = [
 // Launch: a storefront opening with a rising flag
 `<rect x="34" y="58" width="92" height="56" rx="6" class="a-wall"/><path d="M28 58l10-22h84l10 22z" class="a-roof"/><path d="M28 58h104v8c-6 6-14 6-17 0-3 6-11 6-17 0-3 6-11 6-17 0-3 6-11 6-17 0-3 6-11 6-17 0-3 6-13 6-19 0z" class="a-awning"/><rect x="70" y="80" width="22" height="34" rx="3" class="a-door"/><rect x="44" y="78" width="18" height="14" rx="2" class="a-glass"/><rect x="100" y="78" width="18" height="14" rx="2" class="a-glass"/><path d="M80 36V14" class="a-line"/><path d="M80 14h20l-5 6 5 6H80" class="a-flag"/><circle cx="130" cy="24" r="4" class="a-spark"/>`,
 // Get Found: a map with a pin and a search lens
 `<path d="M22 44l36-12 40 12 40-12v74l-40 12-40-12-36 12z" class="a-map"/><path d="M58 32v74 M98 44v74" class="a-fold"/><path d="M80 30c-11 0-19 8-19 18 0 14 19 32 19 32s19-18 19-32c0-10-8-18-19-18z" class="a-pin"/><circle cx="80" cy="48" r="7" class="a-door"/><circle cx="118" cy="88" r="13" class="a-lens"/><path d="M127 97l12 12" class="a-line"/>`,
 // Convert: a chat bubble becoming a confirmed booking
 `<rect x="22" y="34" width="70" height="44" rx="12" class="a-wall"/><path d="M38 78l-6 14 18-14" class="a-wall"/><path d="M36 52h42 M36 62h28" class="a-fold"/><rect x="74" y="62" width="64" height="50" rx="10" class="a-card"/><path d="M74 76h64" class="a-fold"/><circle cx="106" cy="94" r="11" class="a-pin"/><path d="M101 94l4 4 7-8" class="a-check"/>`,
 // Grow: bars rising with a sprout
 `<path d="M24 116h116" class="a-line"/><rect x="34" y="84" width="18" height="32" rx="4" class="a-glass"/><rect x="60" y="68" width="18" height="48" rx="4" class="a-wall"/><rect x="86" y="52" width="18" height="64" rx="4" class="a-awning"/><path d="M122 116V70" class="a-line"/><path d="M122 84c-14 0-18-12-18-20 12 0 18 6 18 20z" class="a-leaf"/><path d="M122 74c0-14 8-22 20-22 0 12-8 22-20 22z" class="a-leaf"/><path d="M30 60l30-14 26 6 34-26" class="a-trend"/><circle cx="120" cy="26" r="4" class="a-spark"/>`,
 // Scale: connected locations network
 `<path d="M80 66L40 40 M80 66l42-28 M80 66l-36 40 M80 66l40 38" class="a-fold"/><circle cx="80" cy="66" r="18" class="a-pin"/><path d="M72 66h16 M80 58v16" class="a-check"/><rect x="26" y="28" width="28" height="24" rx="6" class="a-wall"/><rect x="108" y="26" width="28" height="24" rx="6" class="a-awning"/><rect x="30" y="96" width="28" height="22" rx="6" class="a-glass"/><rect x="106" y="94" width="28" height="22" rx="6" class="a-wall"/><circle cx="140" cy="76" r="4" class="a-spark"/>`,
];
export const stageArt = index => `<svg class="os-stage-art" viewBox="0 0 160 130" aria-hidden="true" focusable="false">${ART[index] || ART[0]}</svg>`;
