// Orders & billing inside AuraHub, from the records linked to this account
// (invoices, orders, plans, shop orders). Payment itself stays on /account.
import { icon, pill, emptyState, money, shortDate, TONE } from './os-ui.js';
import { osCopy } from './os-copy.js';
import { dashCopy } from './dashboard-view.js';

const C = {
 en: { due: 'Amount due', paid: 'Nothing to pay right now.', invoices: 'Invoices', orders: 'Orders', plans: 'Plans & renewals', shop: 'Shop orders', none: 'Nothing here yet.', number: 'Invoice', amount: 'Amount', status: 'Status', dueDate: 'Due', renews: 'Next billing', pay: 'View & pay on your account', verify: 'Verify your email so we can match invoices sent before you had an account.' },
 tr: { due: 'Ödenecek tutar', paid: 'Şu anda ödenecek bir şey yok.', invoices: 'Faturalar', orders: 'Siparişler', plans: 'Planlar ve yenilemeler', shop: 'Mağaza siparişleri', none: 'Henüz bir şey yok.', number: 'Fatura', amount: 'Tutar', status: 'Durum', dueDate: 'Son tarih', renews: 'Sonraki ödeme', pay: 'Hesabınızda görüntüleyin ve ödeyin', verify: 'Hesap açmadan önce gönderilen faturaları eşleştirmek için e-postanızı doğrulayın.' },
 fr: { due: 'Montant dû', paid: 'Rien à payer pour le moment.', invoices: 'Factures', orders: 'Commandes', plans: 'Abonnements et renouvellements', shop: 'Commandes boutique', none: 'Rien pour le moment.', number: 'Facture', amount: 'Montant', status: 'Statut', dueDate: 'Échéance', renews: 'Prochaine facturation', pay: 'Voir et payer sur votre compte', verify: 'Vérifiez votre e-mail pour retrouver les factures envoyées avant la création du compte.' },
 ar: { due: 'المبلغ المستحق', paid: 'لا شيء للدفع حاليًا.', invoices: 'الفواتير', orders: 'الطلبات', plans: 'الخطط والتجديدات', shop: 'طلبات المتجر', none: 'لا شيء بعد.', number: 'فاتورة', amount: 'المبلغ', status: 'الحالة', dueDate: 'الاستحقاق', renews: 'الفوترة التالية', pay: 'اعرض وادفع من حسابك', verify: 'أكّد بريدك لنطابق الفواتير المرسلة قبل إنشاء حسابك.' },
};

export async function renderBilling({ host, lang, esc, api, endpoint }) {
 const c = C[lang] || C.en, d = dashCopy(lang), o = osCopy(lang);
 const data = await api(endpoint('connected'));
 if (!host.isConnected) return;
 const status = s => pill(d.status[s] || String(s || '').replace(/[_-]/g, ' '), TONE[s] || '', esc);
 const table = (heads, rows) => rows.length ? `<div class="table-scroll"><table class="os-table os-card-table"><thead><tr>${heads.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((cell, i) => `<td data-label="${esc(heads[i])}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : `<p class="os-muted">${esc(c.none)}</p>`;
 const due = data.totals?.amountDue || 0;
 host.innerHTML = `<div class="os-billing-page">
  <section class="os-card os-bill-summary"><div><p class="os-eyebrow">${esc(c.due)}</p><strong class="${due ? 'is-due' : ''}">${esc(money(lang, due, 'TRY'))}</strong><p class="os-muted">${esc(due ? o.billing.invoices(data.totals.invoicesDue) : c.paid)}</p></div>
   <a class="os-btn is-primary is-sm" href="/account">${esc(c.pay)} ${icon('external', 14)}</a></section>
  ${data.verified ? '' : `<p class="os-notice">${icon('mail', 16)}<span>${esc(c.verify)}</span></p>`}
  <section class="os-card"><h2>${esc(c.invoices)}</h2>${table([c.number, c.amount, c.dueDate, c.status], (data.invoices || []).map(i => [esc(i.number || '—'), esc(money(lang, i.amount, 'TRY')), esc(shortDate(lang, i.dueDate) || '—'), status(i.status)]))}</section>
  <section class="os-card"><h2>${esc(c.plans)}</h2>${table([c.plans, c.amount, c.renews, c.status], (data.subscriptions || []).map(s => [esc(s.plan || '—'), esc(s.amount ? money(lang, s.amount, 'TRY') + ' / ' + s.interval : '—'), esc(shortDate(lang, s.nextBillingDate) || '—'), status(s.status)]))}</section>
  <section class="os-card"><h2>${esc(c.orders)}</h2>${table([c.orders, c.amount, c.dueDate, c.status], (data.orders || []).map(x => [esc(`${x.type || '—'}${x.quantity > 1 ? ' × ' + x.quantity : ''}`), esc(x.amount ? money(lang, x.amount, 'TRY') : '—'), esc(shortDate(lang, x.dueDate) || '—'), status(x.status)]))}</section>
  <section class="os-card"><h2>${esc(c.shop)}</h2>${table([c.shop, c.amount, c.status], (data.shopOrders || []).map(x => [`<a class="os-link" href="/shop/orders/${esc(x.id)}">${esc(x.reference)}</a>`, esc(money(lang, Number(x.totalMinor || 0) / 100, 'TRY')), status(x.payment)]))}</section>
  <p class="os-source">${esc(o.billing.note)}</p>
 </div>`;
}
