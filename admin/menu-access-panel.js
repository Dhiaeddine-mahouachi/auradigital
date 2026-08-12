(() => {
  const VIEW_ID = "menuaccess";
  const VIEW_LABEL = "Menu Editing Access";

  if (!Array.isArray(NAV) || NAV.some(([id]) => id === VIEW_ID)) return;
  const auraIndex = NAV.findIndex(([id]) => id === "auramenu");
  NAV.splice(auraIndex >= 0 ? auraIndex + 1 : 1, 0, [VIEW_ID, VIEW_LABEL]);

  const originalOpenView = openView;

  function formatDate(value) {
    if (!value) return "—";
    try { return new Date(value).toLocaleString("tr-TR"); }
    catch { return String(value); }
  }

  function dayOptions(selected) {
    const options = [1, 2, 3, 5, 7, 14, 30];
    const current = Math.max(1, Number(selected) || 1);
    if (!options.includes(current)) options.push(current);
    return options.sort((a, b) => a - b).map(days =>
      `<option value="${days}" ${days === current ? "selected" : ""}>${days} day${days === 1 ? "" : "s"} · ${money(days * 100)}</option>`
    ).join("");
  }

  async function renderMenuAccess() {
    const data = await api("/api/admin/auramenu-access");
    const items = Array.isArray(data.items) ? data.items : [];
    const waiting = items.filter(item => item.request_status === "requested" && !item.accessActive).length;
    const active = items.filter(item => item.accessActive).length;
    const locked = items.filter(item => !item.accessActive && item.request_status !== "requested").length;

    const rows = items.map(item => {
      const requestedDays = Math.max(1, Number(item.requested_days) || 1);
      const requestedAmount = Number(item.requested_amount) || requestedDays * 100;
      const status = item.accessActive ? "Active" : item.request_status === "requested" ? "Waiting payment" : "Locked";
      const statusClass = item.accessActive ? "ok" : item.request_status === "requested" ? "warn" : "";
      return `<tr>
        <td><strong>${esc(item.business_name || "Menu")}</strong><small style="display:block;color:#6b7280">auramenu.space/${esc(item.slug || "")}</small></td>
        <td><code style="font-size:11px;word-break:break-all">${esc(item.id)}</code></td>
        <td><span class="pill ${statusClass}">${status}</span><small style="display:block;color:#6b7280;margin-top:5px">${item.request_status === "requested" ? `${requestedDays} day${requestedDays === 1 ? "" : "s"} · ${money(requestedAmount)}` : "No pending request"}</small></td>
        <td>${formatDate(item.access_until)}<small style="display:block;color:#6b7280">Paid: ${money(item.paid_amount || 0)}</small></td>
        <td>
          <select data-access-days="${esc(item.id)}" style="min-width:145px">${dayOptions(requestedDays)}</select>
          <small data-access-total="${esc(item.id)}" style="display:block;color:#6b7280;margin-top:5px">Total: ${money(requestedDays * 100)}</small>
        </td>
        <td><div class="row-actions">
          <button class="btn btn-dark btn-sm" data-access-action="activate" data-access-id="${esc(item.id)}">Confirm payment & open</button>
          <button class="btn btn-danger btn-sm" data-access-action="lock" data-access-id="${esc(item.id)}">Lock</button>
          ${item.slug ? `<a class="btn btn-light btn-sm" href="https://auramenu.space/${encodeURIComponent(item.slug)}" target="_blank" rel="noopener noreferrer">Live menu ↗</a>` : ""}
        </div></td>
      </tr>`;
    }).join("");

    $("content").innerHTML = `<div class="metrics">
      <div class="metric warn"><span>Waiting payment</span><strong>${waiting}</strong></div>
      <div class="metric good"><span>Editing active</span><strong>${active}</strong></div>
      <div class="metric"><span>Locked</span><strong>${locked}</strong></div>
      <div class="metric"><span>Price / day</span><strong>100 TL</strong></div>
    </div>
    <section class="panel">
      <div class="panel-head"><div><h2>AuraMenu editing access</h2><p>Customers request access using only their Request Number. Confirm payment to start the paid timer. When the timer expires, editing locks automatically while the public menu and QR keep working.</p></div><span class="status">Server timed</span></div>
      ${items.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Menu</th><th>Request Number</th><th>Status</th><th>Access until</th><th>Duration</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">No AuraMenu menus yet.</div>'}
    </section>`;

    document.querySelectorAll("[data-access-days]").forEach(select => {
      select.addEventListener("change", () => {
        const total = document.querySelector(`[data-access-total="${CSS.escape(select.dataset.accessDays)}"]`);
        if (total) total.textContent = `Total: ${money(Number(select.value) * 100)}`;
      });
    });

    document.querySelectorAll("[data-access-action]").forEach(button => {
      button.addEventListener("click", async () => {
        if (!canWrite()) return;
        const id = button.dataset.accessId;
        const action = button.dataset.accessAction;
        const select = document.querySelector(`[data-access-days="${CSS.escape(id)}"]`);
        const days = Math.max(1, Number(select?.value || 1));
        if (action === "activate" && !confirm(`Confirm ${money(days * 100)} payment and open editing for ${days} day${days === 1 ? "" : "s"}?`)) return;
        button.disabled = true;
        try {
          await api(`/api/admin/auramenu-access/${encodeURIComponent(id)}`, {
            method: "PATCH",
            body: JSON.stringify(action === "activate" ? { action, days } : { action })
          });
          await renderMenuAccess();
          applyReadOnlyUi();
        } catch (error) {
          alert(error.message);
          button.disabled = false;
        }
      });
    });
  }

  openView = async function(view) {
    if (view !== VIEW_ID) return originalOpenView(view);
    state.view = VIEW_ID;
    location.hash = VIEW_ID;
    buildNav();
    $("pageTitle").textContent = "Menu Editing Access";
    $("pageSubtitle").textContent = "Approve paid AuraMenu editing time and control automatic expiry.";
    $("content").innerHTML = '<section class="panel"><p>Loading…</p></section>';
    try {
      await renderMenuAccess();
      applyReadOnlyUi();
    } catch (error) {
      if (error.status === 401) return checkSession();
      $("content").innerHTML = `<section class="panel"><div class="notice error">${esc(error.message)}</div></section>`;
    }
  };

  if (!$("dashboardView").classList.contains("hidden")) buildNav();
})();
