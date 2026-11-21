// AuraDigital CRM: connects each client to every service (NFC, AuraMenu,
// websites, shop, AuraHub, orders, invoices, subscriptions) and lets the team
// change those records from the client page. Loaded before client-panel.js.
(() => {
  "use strict";
  const e = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tl = value => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(value || 0)) + " TL";
  const day = value => {
    if (!value) return "—";
    const d = new Date(String(value).includes("T") ? value : String(value).replace(" ", "T") + "Z");
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  };
  const writable = () => typeof canWrite === "function" ? canWrite() : false;
  const options = (list, current) => list.map(v => `<option value="${e(v)}"${v === current ? " selected" : ""}>${e(v.replace(/[-_]/g, " "))}</option>`).join("");
  const statusOptions = resource => {
    try { return (RESOURCE[resource].fields.find(f => f[0] === "status") || [])[4] || []; } catch { return []; }
  };
  const SERVICE_ENDPOINT = { nfc: "/api/admin/nfc/", auramenu: "/api/admin/auramenu/", quicksite: "/api/admin/quicksite/" };
  const REQUEST_STATUSES = ["pending", "approved", "rejected"];
  const PAYMENT = ["unpaid", "paid"];
  const ICON = { nfc: "▣", auramenu: "◫", quicksite: "◎", order: "▤", invoice: "₺", subscription: "↻", contact: "✉", auri: "✦", account: "♙", workspace: "◈", shop: "🛒" };

  function pill(status) {
    const s = String(status || "").toLowerCase();
    const tone = /paid|approved|active|completed|delivered|ready/.test(s) ? "good" : /reject|cancel|overdue|lost|disabled/.test(s) ? "bad" : /pending|unpaid|sent|new|progress|awaiting|lead/.test(s) ? "warn" : "";
    return `<span class="crm-pill ${tone}">${e(s.replace(/[-_]/g, " ") || "—")}</span>`;
  }

  function section(title, hint, body, count) {
    return `<section class="panel crm-section"><div class="panel-head"><div><h2>${e(title)}${count != null ? ` <span class="crm-count">${count}</span>` : ""}</h2>${hint ? `<p>${e(hint)}</p>` : ""}</div></div>${body}</section>`;
  }

  function serviceRows(items) {
    if (!items.length) return '<div class="empty">No NFC, AuraMenu or website requests match this client yet. Requests with the same email or phone appear here automatically.</div>';
    return `<div class="crm-rows">${items.map(item => `
      <div class="crm-row" data-crm-service="${e(item.source)}" data-id="${e(item.id)}">
        <span class="crm-icon" aria-hidden="true">${ICON[item.source] || "•"}</span>
        <div class="crm-main"><strong>${e(item.title || item.label)}</strong><small>${e(item.label)}${item.detail ? " · " + e(item.detail) : ""} · ${day(item.createdAt)}${item.linked ? " · linked manually" : ""}</small></div>
        ${writable() ? `<label class="crm-select"><span>Status</span><select data-field="status">${options(REQUEST_STATUSES, item.status)}</select></label>
        <label class="crm-select"><span>Payment</span><select data-field="paymentStatus">${options(PAYMENT, item.paymentStatus)}</select></label>` : `${pill(item.status)} ${pill(item.paymentStatus)}`}
        <button type="button" class="btn btn-light btn-sm" data-crm-open="${e(item.view)}">Open</button>
        ${writable() && item.linked ? `<button type="button" class="btn btn-light btn-sm" data-crm-unlink="${e(item.source)}:${e(item.id)}">Unlink</button>` : ""}
      </div>`).join("")}</div>`;
  }

  function resourceRows(items, resource, describe) {
    if (!items.length) return '<div class="empty">Nothing yet.</div>';
    const statuses = statusOptions(resource);
    return `<div class="crm-rows">${items.map(item => `
      <div class="crm-row" data-crm-resource="${e(resource)}" data-id="${e(item.id)}">
        <span class="crm-icon" aria-hidden="true">${ICON[resource.replace(/s$/, "")] || "•"}</span>
        <div class="crm-main">${describe(item)}</div>
        ${writable() && statuses.length ? `<label class="crm-select"><span>Status</span><select data-field="status">${options(statuses.includes(item.status) ? statuses : [item.status, ...statuses], item.status)}</select></label>` : pill(item.status)}
      </div>`).join("")}</div>`;
  }

  function shopRows(items) {
    if (!items.length) return '<div class="empty">No NFC shop orders from this client\'s AuraHub account.</div>';
    return `<div class="crm-rows">${items.map(order => `
      <div class="crm-row" data-shop-order="${e(order.id)}">
        <span class="crm-icon" aria-hidden="true">${ICON.shop}</span>
        <div class="crm-main"><strong>${e(order.reference)}</strong><small>${tl(Number(order.totalMinor || 0) / 100)} · ${day(order.createdAt)}${order.productionStatus ? " · " + e(String(order.productionStatus).replace(/_/g, " ")) : ""}</small></div>
        ${pill(order.paymentStatus)}
        ${writable() && order.paymentStatus === "awaiting_transfer" ? '<button type="button" class="btn btn-dark btn-sm" data-shop-confirm>Confirm transfer</button>' : ""}
      </div>`).join("")}</div>`;
  }

  function hubRows(view) {
    const accounts = view.accounts.map(a => `<div class="crm-row"><span class="crm-icon" aria-hidden="true">${ICON.account}</span><div class="crm-main"><strong>${e(a.name || a.email)}</strong><small>${e(a.email)} · joined ${day(a.createdAt)}</small></div>${pill(a.active ? "active" : "disabled")}${writable() ? `<button type="button" class="btn btn-light btn-sm" data-crm-unlink="account:${e(a.id)}" title="Only removes a manual link">Unlink</button>` : ""}</div>`);
    const workspaces = view.workspaces.map(w => {
      const pct = w.progress.total ? Math.round(100 * w.progress.done / w.progress.total) : 0;
      return `<div class="crm-row"><span class="crm-icon" aria-hidden="true">${ICON.workspace}</span><div class="crm-main"><strong>${e(w.name)}</strong><small>${e([w.industry, w.city].filter(Boolean).join(" · ") || "Workspace")} · roadmap ${w.progress.done}/${w.progress.total}</small><span class="crm-bar"><i style="width:${pct}%"></i></span></div></div>`;
    });
    const rows = [...accounts, ...workspaces];
    return rows.length ? `<div class="crm-rows">${rows.join("")}</div>` : '<div class="empty">This client has no AuraHub account with the same email yet.</div>';
  }

  function timeline(items) {
    if (!items.length) return '<div class="empty">No activity yet.</div>';
    return `<ol class="crm-timeline">${items.map(t => `<li><span class="crm-icon" aria-hidden="true">${ICON[t.kind] || "•"}</span><div><strong>${e(t.text)}</strong><small>${day(t.at)}</small></div>${pill(t.status)}</li>`).join("")}</ol>`;
  }

  async function renderConnected(host, clientId) {
    host.innerHTML = '<section class="panel"><p>Loading everything connected to this client…</p></section>';
    let view;
    try { view = await api(`/api/admin/crm/clients/${encodeURIComponent(clientId)}`); }
    catch (error) { host.innerHTML = `<section class="panel"><div class="notice error">${e(error.message)}</div></section>`; return; }
    const t = view.totals;
    host.innerHTML = `
      <div class="client-finance-grid crm-totals">
        <div class="client-finance-card good"><span>Paid</span><strong>${tl(t.paid)}</strong></div>
        <div class="client-finance-card warn"><span>Outstanding</span><strong>${tl(t.outstanding)}</strong></div>
        <div class="client-finance-card"><span>Monthly recurring</span><strong>${tl(t.monthlyRecurring)}</strong></div>
        <div class="client-finance-card"><span>Open work</span><strong>${t.openWork}</strong></div>
      </div>
      <div class="crm-grid">
        <div class="crm-col">
          ${section("Service requests", "NFC cards, AuraMenu and websites. Change status or payment here; approving needs payment first.", serviceRows(view.services), view.services.length)}
          ${section("Orders", "", resourceRows(view.orders, "orders", o => `<strong>${e(o.type)} × ${e(o.quantity)}</strong><small>${tl(o.amount)} · due ${day(o.dueDate)}</small>`), view.orders.length)}
          ${section("Invoices", "", resourceRows(view.invoices, "invoices", i => `<strong>${e(i.number)}</strong><small>${tl(i.amount)} · due ${day(i.dueDate)}</small>`), view.invoices.length)}
          ${section("Subscriptions", "", resourceRows(view.subscriptions, "subscriptions", s => `<strong>${e(s.plan)}</strong><small>${tl(s.amount)} / ${e(s.interval)} · next ${day(s.nextBillingDate)}</small>`), view.subscriptions.length)}
          ${section("NFC shop orders", "Bank-transfer orders from the online card shop.", shopRows(view.shopOrders), view.shopOrders.length)}
        </div>
        <div class="crm-col">
          ${section("AuraHub", "Customer account, workspaces and roadmap progress.", hubRows(view), view.accounts.length + view.workspaces.length)}
          ${section("Activity across services", "", timeline(view.timeline))}
        </div>
      </div>`;

    const reload = () => renderConnected(host, clientId);
    const fail = error => { alert(error.message); reload(); };
    host.querySelectorAll("[data-crm-service] select").forEach(select => select.addEventListener("change", async () => {
      const row = select.closest("[data-crm-service]");
      try { await api(SERVICE_ENDPOINT[row.dataset.crmService] + encodeURIComponent(row.dataset.id), { method: "PATCH", body: JSON.stringify({ [select.dataset.field]: select.value }) }); reload(); }
      catch (error) { fail(error); }
    }));
    host.querySelectorAll("[data-crm-resource] select").forEach(select => select.addEventListener("change", async () => {
      const row = select.closest("[data-crm-resource]");
      try { await api(`/api/admin/${row.dataset.crmResource}/${encodeURIComponent(row.dataset.id)}`, { method: "PUT", body: JSON.stringify({ status: select.value }) }); reload(); }
      catch (error) { fail(error); }
    }));
    host.querySelectorAll("[data-shop-confirm]").forEach(button => button.addEventListener("click", async () => {
      const id = button.closest("[data-shop-order]").dataset.shopOrder;
      if (!confirm("Confirm that the bank transfer for this order has arrived?")) return;
      try { await api(`/api/admin/shop/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ action: "confirm_transfer" }) }); reload(); }
      catch (error) { fail(error); }
    }));
    host.querySelectorAll("[data-crm-unlink]").forEach(button => button.addEventListener("click", async () => {
      const [source, ...rest] = button.dataset.crmUnlink.split(":");
      try { await api("/api/admin/crm/links", { method: "DELETE", body: JSON.stringify({ source, sourceId: rest.join(":") }) }); reload(); }
      catch (error) { fail(error); }
    }));
    host.querySelectorAll("[data-crm-open]").forEach(button => button.addEventListener("click", () => openView(button.dataset.crmOpen)));
  }

  async function renderInbox(host, clients, openClient) {
    let items = [];
    try { items = (await api("/api/admin/crm/inbox")).items || []; }
    catch (error) { host.innerHTML = `<div class="notice error">${e(error.message)}</div>`; return; }
    if (!items.length) { host.innerHTML = ""; return; }
    const clientOptions = clients.map(c => `<option value="${e(c.id)}">${e(c.company || c.name)}</option>`).join("");
    host.innerHTML = `<section class="panel crm-inbox">
      <div class="panel-head"><div><h2>New from your services <span class="crm-count">${items.length}</span></h2><p>Requests and AuraHub sign-ups that are not linked to a client yet. Add them to the CRM or attach them to an existing client.</p></div></div>
      <div class="crm-rows">${items.slice(0, 25).map(item => `
        <div class="crm-row" data-inbox="${e(item.source)}" data-id="${e(item.id)}">
          <span class="crm-icon" aria-hidden="true">${ICON[item.source] || "•"}</span>
          <div class="crm-main"><strong>${e(item.title || item.contact || item.email)}</strong><small>${e(item.label)} · ${e([item.contact, item.email, item.phone].filter(Boolean).join(" · "))} · ${day(item.createdAt)}</small></div>
          ${pill(item.status)}
          ${writable() ? `<button type="button" class="btn btn-dark btn-sm" data-inbox-create>Add to CRM</button>
          <label class="crm-select"><span class="sr-only">Attach to client</span><select data-inbox-link><option value="">Attach to…</option>${clientOptions}</select></label>` : ""}
        </div>`).join("")}</div>
      ${items.length > 25 ? `<p class="crm-more">Showing 25 of ${items.length}. Handle these first and the rest will appear.</p>` : ""}
    </section>`;
    const link = async (row, clientId) => {
      try {
        const result = await api("/api/admin/crm/links", { method: "POST", body: JSON.stringify({ source: row.dataset.inbox, sourceId: row.dataset.id, ...(clientId ? { clientId: Number(clientId) } : {}) }) });
        await openClient(result.clientId);
      } catch (error) { alert(error.message); }
    };
    host.querySelectorAll("[data-inbox-create]").forEach(b => b.addEventListener("click", () => link(b.closest("[data-inbox]"))));
    host.querySelectorAll("[data-inbox-link]").forEach(s => s.addEventListener("change", () => s.value && link(s.closest("[data-inbox]"), s.value)));
  }

  // Global search across the CRM and every service, in the dashboard top bar.
  function mountSearch(openClient) {
    const bar = document.querySelector(".top-actions");
    if (!bar || document.getElementById("crmSearch")) return;
    const wrap = document.createElement("div");
    wrap.className = "crm-search-wrap";
    wrap.innerHTML = '<input id="crmSearch" type="search" placeholder="Search clients, requests, accounts…" aria-label="Search everything" autocomplete="off"><div id="crmSearchResults" class="crm-search-results" role="listbox" hidden></div>';
    bar.prepend(wrap);
    const input = wrap.querySelector("input"), list = wrap.querySelector("#crmSearchResults");
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { list.hidden = true; return; }
      timer = setTimeout(async () => {
        try {
          const items = (await api("/api/admin/crm/search?q=" + encodeURIComponent(q))).items || [];
          list.innerHTML = items.length ? items.map((h, i) => `<button type="button" role="option" data-hit="${i}"><span class="crm-icon" aria-hidden="true">${ICON[h.type] || "♙"}</span><span><strong>${e(h.title)}</strong><small>${e(h.subtitle)}</small></span>${pill(h.status)}</button>`).join("") : '<p class="crm-none">No matches.</p>';
          list.hidden = false;
          list.querySelectorAll("[data-hit]").forEach(b => b.addEventListener("click", () => {
            const hit = items[Number(b.dataset.hit)];
            list.hidden = true; input.value = "";
            if (hit.clientId) openClient(hit.clientId); else if (hit.view) openView(hit.view); else openView("clients");
          }));
        } catch (error) { list.innerHTML = `<p class="crm-none">${e(error.message)}</p>`; list.hidden = false; }
      }, 220);
    });
    document.addEventListener("click", event => { if (!wrap.contains(event.target)) list.hidden = true; });
  }

  window.AuraCRM = { renderConnected, renderInbox, mountSearch };
})();
