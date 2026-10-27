const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function renderShopPanel(root, api) {
  const [data, orderData] = await Promise.all([api('/api/admin/shop/themes'), api('/api/admin/shop/orders')]);
  const themes = data.themes || [], writable = ['owner', 'manager'].includes(data.role);
  root.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>Smart card shop</h2><p>Catalog changes use the existing administrator session. Made-to-order cards use approved personalization before printing.</p></div><a href="/shop" class="btn btn-light" target="_blank" rel="noopener">Preview shop ↗</a></div><div class="notice">Customers sign in, add their contact and delivery details, and pay by bank transfer. Only confirm payment after checking the transfer in your bank account. Reporting a transfer does not mark an order paid.</div><div class="metrics"><div class="metric"><span>Themes</span><strong>${themes.length}</strong></div><div class="metric"><span>Demo themes</span><strong>${themes.filter(t => t.status === 'demo').length}</strong></div><div class="metric"><span>Published themes</span><strong>${themes.filter(t => t.status === 'published').length}</strong></div></div>${writable ? '<button class="btn btn-dark" type="button" id="shop-add">Add theme</button>' : '<p>Read-only catalog access.</p>'}<div class="table-wrap"><table class="data-table"><thead><tr><th>Theme</th><th>Category</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead><tbody>${themes.map(t => `<tr><td>${esc(t.name)}</td><td>${esc(t.category)}</td><td>${esc(t.status)}</td><td>${t.priceMinor === null ? 'Not approved' : esc((t.priceMinor / 100).toFixed(2) + ' TRY')}</td><td><button type="button" class="btn btn-light btn-sm" data-shop-edit="${esc(t.id)}">${writable ? 'Edit' : 'View'}</button></td></tr>`).join('')}</tbody></table></div><div id="shop-editor"></div><h2 style="margin-top:40px">Bank-transfer orders</h2><p>Card totals exclude any separately arranged delivery fee. Payment confirmation moves the order to artwork preparation.</p><div id="shop-bank-orders"></div></section>`;
  const ordersRoot = root.querySelector('#shop-bank-orders');
  const price = amount => (amount / 100).toLocaleString('en') + ' TL';
  ordersRoot.innerHTML = (orderData.orders || []).length ? orderData.orders.map(order => `<details style="padding:20px 0;border-top:1px solid #ddd"><summary><strong>${esc(order.reference)}</strong> · ${esc(order.shipping.name)} · ${price(order.totalMinor)} · ${esc(order.paymentStatus)}</summary><p>${esc(order.shipping.email)} · ${esc(order.shipping.phone)}<br>${esc(order.shipping.business)}<br>${esc(order.shipping.address)}, ${esc(order.shipping.city)} ${esc(order.shipping.postalCode)}, ${esc(order.shipping.country)}</p><p>${esc(order.shipping.billingDetails || '')}</p>${order.items.map(item => `<p><strong>${esc(item.name)} × ${item.quantity}</strong> · ${price(item.subtotalMinor)}<br>${esc(item.personalization.business)} · ${esc(item.personalization.destination)}<br>${esc(item.personalization.instructions || '')}</p>`).join('')}<p>Transfer reported: ${esc(order.transferReportedAt || 'Not reported')}<br>Payment verified: ${esc(order.paidAt || 'Not verified')}<br>Production: ${esc(order.productionStatus)}</p>${writable && order.paymentStatus === 'awaiting_transfer' ? `<button class="btn btn-dark" type="button" data-confirm-bank="${esc(order.id)}">Confirm bank transfer received</button>` : ''}<p role="status" data-bank-notice="${esc(order.id)}"></p></details>`).join('') : '<div class="empty">No bank-transfer orders yet.</div>';
  ordersRoot.querySelectorAll('[data-confirm-bank]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    try { await api('/api/admin/shop/orders/' + button.dataset.confirmBank, { method: 'PATCH', body: JSON.stringify({ action: 'confirm_transfer' }) }); await renderShopPanel(root, api); }
    catch (error) { ordersRoot.querySelector(`[data-bank-notice="${button.dataset.confirmBank}"]`).textContent = error.message || 'Could not confirm payment.'; button.disabled = false; }
  }));
  function edit(theme) {
    const isNew = !theme;
    const draft = theme || { ...themes[0], id: 'new-theme', slug: 'new-theme', name: 'New theme', status: 'demo', approved: false, available: false, priceMinor: null };
    const editor = root.querySelector('#shop-editor');
    editor.innerHTML = `<form id="shop-theme-form"><h3>${isNew ? 'Add' : 'Edit'} theme</h3><p>Enter catalog metadata below. Price is in kuruş (minor TRY units). Archive by setting status to archived. Existing local artwork paths are required; artwork uploads need object storage and are not enabled. Publishing requires approved, existing production assets and a price. Demo assets cannot be published.</p><label>Theme metadata (JSON)<textarea id="shop-theme-json" rows="24" style="width:100%;font-family:monospace" ${writable ? '' : 'readonly'}>${esc(JSON.stringify(draft, null, 2))}</textarea></label>${writable ? '<button class="btn btn-dark" type="submit">Save theme</button>' : ''}<p id="shop-admin-notice" role="status"></p></form>`;
    const input = editor.querySelector('textarea'); input.focus();
    editor.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault(); const notice = editor.querySelector('#shop-admin-notice'), button = editor.querySelector('button');
      try {
        const next = JSON.parse(input.value);
        if (!isNew && next.id !== theme.id) throw new Error('The ID of an existing theme cannot be changed.');
        button.disabled = true; notice.textContent = 'Saving…';
        await api(isNew ? '/api/admin/shop/themes' : `/api/admin/shop/themes/${encodeURIComponent(theme.id)}`, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify({ theme: next }) });
        await renderShopPanel(root, api);
      } catch (error) { notice.textContent = error.message || 'Could not save the theme.'; button.disabled = false; }
    });
  }
  root.querySelectorAll('[data-shop-edit]').forEach(button => button.addEventListener('click', () => edit(themes.find(t => t.id === button.dataset.shopEdit))));
  root.querySelector('#shop-add')?.addEventListener('click', () => edit(null));
}
