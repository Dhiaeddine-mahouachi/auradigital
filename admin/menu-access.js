const api = '/api/admin/auramenu-access';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));
const money = n => new Intl.NumberFormat('tr-TR').format(Number(n || 0)) + ' TL';

function fmt(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleString('tr-TR'); }
  catch { return v; }
}

function options(selected) {
  const base = [1, 2, 3, 5, 7, 14, 30];
  const n = Math.max(1, Number(selected) || 1);
  if (!base.includes(n)) base.push(n);
  return base.sort((a, b) => a - b)
    .map(x => `<option value="${x}" ${x === n ? 'selected' : ''}>${x} gün — ${money(x * 100)}</option>`)
    .join('');
}

function updatePrice(id) {
  const select = document.getElementById(`days-${id}`);
  const price = document.getElementById(`price-${id}`);
  if (select && price) price.textContent = `Toplam: ${money(Number(select.value) * 100)}`;
}
window.updatePrice = updatePrice;

async function load() {
  const status = document.getElementById('status');
  const list = document.getElementById('list');
  try {
    const r = await fetch(api, { credentials: 'same-origin' });
    if (r.status === 401) {
      location.href = '/admin/';
      return;
    }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `Request failed (${r.status})`);
    const items = Array.isArray(d.items) ? d.items : [];
    const requested = items.filter(x => x.request_status === 'requested').length;
    status.className = 'muted';
    status.textContent = `${items.length} menü · ${requested} erişim talebi bekliyor`;

    list.innerHTML = items.map(x => {
      const requestedDays = Math.max(1, Number(x.requested_days) || 1);
      const requestedAmount = Number(x.requested_amount) || (requestedDays * 100);
      const state = x.accessActive
        ? 'Editing active'
        : x.request_status === 'requested'
          ? 'Payment / approval waiting'
          : 'Locked';

      return `<section class="card"><div class="row">
        <div>
          <strong>${esc(x.business_name)}</strong>
          <div class="muted">auramenu.space/${esc(x.slug)}</div>
          <div class="request-number"><strong>Request Number:</strong> ${esc(x.id)}</div>
        </div>
        <div>
          <span class="pill ${x.request_status === 'requested' ? 'requested' : ''} ${x.accessActive ? 'active' : ''}">${state}</span>
          <div class="muted">Requested: ${x.request_status === 'requested' ? `${requestedDays} gün · ${money(requestedAmount)}` : '—'}</div>
          <div class="muted">Access until: ${fmt(x.access_until)}</div>
        </div>
        <div>
          <strong>100 TL / gün</strong>
          <div class="muted">Recorded payment: ${money(x.paid_amount || 0)}</div>
        </div>
        <div class="actions">
          <label>Süre
            <select id="days-${esc(x.id)}" data-access-days="${esc(x.id)}">${options(requestedDays)}</select>
            <span class="price" id="price-${esc(x.id)}">Toplam: ${money(requestedDays * 100)}</span>
          </label>
          <div>
            <button class="approve" data-action="activate" data-id="${esc(x.id)}">Ödemeyi onayla & erişimi aç</button>
            <button class="lock" data-action="lock" data-id="${esc(x.id)}">Kilitle</button>
          </div>
        </div>
      </div></section>`;
    }).join('');

    document.querySelectorAll('[data-access-days]').forEach(select => {
      select.addEventListener('change', () => updatePrice(select.dataset.accessDays));
    });
    document.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', () => act(button.dataset.id, button.dataset.action));
    });
  } catch (e) {
    status.className = 'error';
    status.textContent = e?.message || 'Request failed';
  }
}

async function act(id, action) {
  const days = action === 'activate'
    ? Number(document.getElementById(`days-${id}`)?.value || 1)
    : undefined;

  if (action === 'activate' && !confirm(`${days} gün / ${money(days * 100)} ödeme alındı ve erişim şimdi açılsın mı?`)) return;

  try {
    const r = await fetch(`${api}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action === 'activate' ? { action, days } : { action })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `Failed (${r.status})`);
    await load();
  } catch (e) {
    alert(e?.message || 'Failed');
  }
}

load();
