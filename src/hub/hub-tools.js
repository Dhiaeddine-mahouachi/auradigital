// Global search (Ctrl/Cmd+K) and the notifications panel. Both read the same
// records as the rest of the Hub; nothing here writes data.
import { icon, relative, parseDate } from './os-ui.js';

const C = {
 en: { menuReady: n => `Menu draft ready for review: ${n}`, needsYou: n => `Waiting for you: ${n}`, sent: n => `Request sent: ${n}`, search: 'Search AuraHub', placeholder: 'Search pages, tasks, inquiries, requests, services…', none: 'No results.', pages: 'Pages', tasks: 'Roadmap tasks', leads: 'Inquiries', work: 'Requests & services', hint: 'Use ↑ ↓ and Enter', notifications: 'Notifications', empty: 'You’re all caught up.', markRead: 'Mark all as read', invoices: n => `${n} invoice${n === 1 ? '' : 's'} to pay`, followUp: n => `Follow up with ${n}`, updated: n => `${n} was updated`, newLead: n => `New inquiry: ${n}`, verified: n => `Milestone verified: ${n}`, close: 'Close' },
 tr: { menuReady: n => `Menü taslağı incelemeye hazır: ${n}`, needsYou: n => `Sizi bekliyor: ${n}`, sent: n => `Talep gönderildi: ${n}`, search: 'AuraHub’da ara', placeholder: 'Sayfa, görev, talep, hizmet ara…', none: 'Sonuç yok.', pages: 'Sayfalar', tasks: 'Yol haritası görevleri', leads: 'Müşteri talepleri', work: 'Talepler ve hizmetler', hint: '↑ ↓ ve Enter kullanın', notifications: 'Bildirimler', empty: 'Her şey güncel.', markRead: 'Tümünü okundu say', invoices: n => `${n} ödenecek fatura`, followUp: n => `${n} ile takip zamanı`, updated: n => `${n} güncellendi`, newLead: n => `Yeni talep: ${n}`, verified: n => `Hedef doğrulandı: ${n}`, close: 'Kapat' },
 fr: { menuReady: n => `Brouillon de menu à examiner : ${n}`, needsYou: n => `En attente de vous : ${n}`, sent: n => `Demande envoyée : ${n}`, search: 'Rechercher dans AuraHub', placeholder: 'Pages, tâches, demandes, services…', none: 'Aucun résultat.', pages: 'Pages', tasks: 'Tâches', leads: 'Demandes clients', work: 'Demandes et services', hint: '↑ ↓ puis Entrée', notifications: 'Notifications', empty: 'Tout est à jour.', markRead: 'Tout marquer comme lu', invoices: n => `${n} facture${n === 1 ? '' : 's'} à payer`, followUp: n => `Relancer ${n}`, updated: n => `${n} a été mis à jour`, newLead: n => `Nouvelle demande : ${n}`, verified: n => `Objectif vérifié : ${n}`, close: 'Fermer' },
 ar: { menuReady: n => `مسودة قائمة جاهزة للمراجعة: ${n}`, needsYou: n => `بانتظارك: ${n}`, sent: n => `أُرسل الطلب: ${n}`, search: 'ابحث في AuraHub', placeholder: 'ابحث في الصفحات والمهام والاستفسارات والخدمات…', none: 'لا نتائج.', pages: 'الصفحات', tasks: 'مهام الخطة', leads: 'الاستفسارات', work: 'الطلبات والخدمات', hint: 'استخدم ↑ ↓ وEnter', notifications: 'الإشعارات', empty: 'كل شيء محدّث.', markRead: 'تعليم الكل كمقروء', invoices: n => `${n} فواتير للدفع`, followUp: n => `تابع مع ${n}`, updated: n => `تم تحديث ${n}`, newLead: n => `استفسار جديد: ${n}`, verified: n => `تم التحقق من إنجاز: ${n}`, close: 'إغلاق' },
};
const norm = t => String(t || '').toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const go = href => { const a = Object.assign(document.createElement('a'), { href }); document.querySelector('#app').append(a); a.click(); a.remove(); };

export function openSearch({ lang, esc, pages, missions, missionTitle, link, loadLeads, loadWork }) {
 const c = C[lang] || C.en;
 document.querySelector('.os-search-dialog')?.remove();
 const dialog = document.createElement('dialog');
 dialog.className = 'os-dialog os-search-dialog';
 dialog.setAttribute('aria-label', c.search);
 dialog.innerHTML = `<div class="os-search-box">${icon('search', 18)}<input type="search" placeholder="${esc(c.placeholder)}" aria-label="${esc(c.search)}" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="os-search-results"><kbd>Esc</kbd></div>
  <div id="os-search-results" class="os-search-results" role="listbox" aria-label="${esc(c.search)}"></div><p class="os-search-hint">${esc(c.hint)}</p>`;
 document.body.append(dialog);
 dialog.showModal();
 const input = dialog.querySelector('input'), results = dialog.querySelector('.os-search-results');
 let leads = [], work = [], active = 0, items = [];
 Promise.all([loadLeads().catch(() => []), loadWork().catch(() => [])]).then(([l, w]) => { leads = l; work = w; draw(); });
 function draw() {
  const q = norm(input.value.trim());
  const match = text => !q || norm(text).includes(q);
  const groups = [
   [c.pages, pages.filter(p => match(p.label)).map(p => ({ label: p.label, href: p.href, icon: p.icon }))],
   [c.tasks, (missions || []).filter(m => match(missionTitle(m))).slice(0, 6).map(m => ({ label: missionTitle(m), meta: m.status, href: link('journey', { task: m.id }), icon: 'journey' }))],
   [c.leads, leads.filter(l => q && match([l.name, l.contact, l.interest].join(' '))).slice(0, 6).map(l => ({ label: l.name, meta: l.interest || l.contact, href: link('studio', { view: 'pipeline', lead: l.id }), icon: 'user' }))],
   [c.work, work.filter(w => q && match(w.title)).slice(0, 6).map(w => ({ label: w.title, meta: w.meta, href: w.href, icon: 'services' }))],
  ].filter(([, list]) => list.length);
  items = groups.flatMap(([, list]) => list);
  active = Math.min(active, Math.max(0, items.length - 1));
  let n = -1;
  results.innerHTML = items.length ? groups.map(([title, list]) => `<section><h3>${esc(title)}</h3>${list.map(it => { n++; return `<a role="option" id="os-sr-${n}" class="os-sr ${n === active ? 'is-active' : ''}" aria-selected="${n === active}" href="${esc(it.href)}" data-i="${n}">${icon(it.icon, 16)}<span>${esc(it.label)}</span>${it.meta ? `<small>${esc(it.meta)}</small>` : ''}</a>`; }).join('')}</section>`).join('') : `<p class="os-muted">${esc(c.none)}</p>`;
  input.setAttribute('aria-activedescendant', items.length ? 'os-sr-' + active : '');
 }
 input.addEventListener('input', () => { active = 0; draw(); });
 input.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(1, items.length); draw(); results.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' }); }
  if (e.key === 'Enter' && items[active]) { e.preventDefault(); dialog.close(); go(items[active].href); }
 });
 results.addEventListener('click', e => { const a = e.target.closest('a[data-i]'); if (!a) return; e.preventDefault(); dialog.close(); go(a.getAttribute('href')); });
 dialog.addEventListener('close', () => dialog.remove());
 dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
 draw();
 input.focus();
}

// Notifications are derived from real records. "Unread" is remembered per
// browser (a convenience only; nothing is lost if it is cleared).
export function notificationItems({ lang, workspace, snapshot, connected, leads, missionTitle, link, seenAt }) {
 const c = C[lang] || C.en, out = [];
 if (connected?.totals?.invoicesDue) out.push({ text: c.invoices(connected.totals.invoicesDue), href: link('billing'), icon: 'orders', urgent: true });
 for (const a of snapshot?.attention || []) out.push({ text: a.kind === 'menu' ? c.menuReady(a.draft?.fields?.businessName || a.name) : c.needsYou(a.name), href: a.kind === 'menu' ? link('menuDrafts', { draft: a.id }) : link('requests', { request: a.id }), icon: 'alert', urgent: true });
 const today = new Date().toISOString().slice(0, 10);
 for (const l of leads || []) if (l.followUpAt && l.followUpAt <= today && !l.archived) out.push({ text: c.followUp(l.name), href: link('studio', { view: 'pipeline', lead: l.id }), icon: 'calendar', urgent: true });
 for (const r of connected?.requests || []) if (r.updatedAt) out.push({ text: c.updated(r.name), href: link('services'), icon: 'services', at: r.updatedAt });
 for (const r of snapshot?.requests || []) if (r.createdAt) out.push({ text: c.sent(r.name), href: link('requests', { request: r.id }), icon: 'requests', at: r.createdAt });
 for (const l of leads || []) out.push({ text: c.newLead(l.name), href: link('studio', { view: 'pipeline', lead: l.id }), icon: 'user', at: l.createdAt });
 for (const m of workspace.missions || []) if (workspace.evidence?.[m.id] === 'approved') out.push({ text: c.verified(missionTitle(m)), href: link('journey', { task: m.id }), icon: 'check', at: m.completedAt });
 return out.map(n => ({ ...n, unread: n.urgent || (n.at && parseDate(n.at) && parseDate(n.at).getTime() > seenAt) }))
  .sort((a, b) => Number(b.urgent || 0) - Number(a.urgent || 0) || (parseDate(b.at)?.getTime() || 0) - (parseDate(a.at)?.getTime() || 0)).slice(0, 25);
}

export function renderNotifications({ host, lang, esc, items, onRead }) {
 const c = C[lang] || C.en;
 host.innerHTML = `<header><strong>${esc(c.notifications)}</strong>${items.some(i => i.unread && !i.urgent) ? `<button type="button" class="os-link" data-read>${esc(c.markRead)}</button>` : ''}</header>
  ${items.length ? `<ul>${items.map(n => `<li class="${n.unread ? 'is-unread' : ''}"><a href="${esc(n.href)}">${icon(n.icon, 16)}<span>${esc(n.text)}${n.at ? `<small>${esc(relative(lang, n.at))}</small>` : ''}</span></a></li>`).join('')}</ul>` : `<p class="os-muted">${esc(c.empty)}</p>`}`;
 host.querySelector('[data-read]')?.addEventListener('click', onRead);
}
export const toolsCopy = lang => C[lang] || C.en;
