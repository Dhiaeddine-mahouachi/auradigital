(() => {
  const VIEW_ID = "aurapops";
  const VIEW_LABEL = "AuraPops Requests";
  const POP_API = "/api/admin/aurapops";

  if (!Array.isArray(NAV) || NAV.some(([id]) => id === VIEW_ID)) return;
  const auraMenuIndex = NAV.findIndex(([id]) => id === "auramenu");
  NAV.splice(auraMenuIndex >= 0 ? auraMenuIndex + 1 : 1, 0, [VIEW_ID, VIEW_LABEL]);

  const originalOpenView = openView;
  const originalRenderOverview = renderOverview;

  const style = document.createElement("style");
  style.textContent = `
    .nav-item[data-view="aurapops"]::before{content:"◉"}
    .aurapop-visual{position:relative;width:76px;height:76px;border-radius:16px;overflow:hidden;background:#173126;border:1px solid var(--line);box-shadow:0 8px 20px rgba(24,57,44,.12)}
    .aurapop-visual>.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.48}
    .aurapop-visual>.shade{position:absolute;inset:0;background:linear-gradient(145deg,rgba(7,24,15,.08),rgba(7,24,15,.62))}
    .aurapop-visual>.avatar{position:absolute;left:50%;top:50%;width:48px;height:48px;transform:translate(-50%,-50%);border-radius:50%;object-fit:cover;background:#fff;border:2px solid #e1e100;box-shadow:0 5px 15px rgba(0,0,0,.22)}
    .aurapop-visual>.fallback{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#e1e100;color:#152116;font-size:12px;font-weight:950}
    .aurapop-title{display:grid;gap:3px}.aurapop-title small{color:var(--muted)}
    .aurapop-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
    @media(max-width:620px){.aurapop-visual{width:64px;height:64px}.aurapop-visual>.avatar,.aurapop-visual>.fallback{width:42px;height:42px}}
  `;
  document.head.appendChild(style);

  function initials(value) {
    return String(value || "AP").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  }

  function visual(item) {
    const bg = item.backgroundImageUrl ? `<img class="bg" src="${esc(item.backgroundImageUrl)}" alt="">` : "";
    const avatar = item.avatarUrl
      ? `<img class="avatar" src="${esc(item.avatarUrl)}" alt="">`
      : `<span class="fallback">${esc(initials(item.title))}</span>`;
    return `<div class="aurapop-visual">${bg}<span class="shade"></span>${avatar}</div>`;
  }

  async function updateAuraPop(id, patch) {
    await api(POP_API + "/pops/" + encodeURIComponent(id), {
      method: "PATCH",
      body: JSON.stringify(patch)
    });
  }

  async function renderAuraPops() {
    const data = await api(POP_API + "/pops");
    const items = Array.isArray(data.items) ? data.items : [];
    const pending = items.filter(item => item.status === "pending").length;
    const unpaid = items.filter(item => item.paymentStatus !== "paid").length;
    const active = items.filter(item => item.status === "approved" && item.paymentStatus === "paid").length;

    const rows = items.map(item => {
      const live = item.status === "approved" && item.paymentStatus === "paid";
      return `<tr>
        <td>${visual(item)}</td>
        <td><span class="request-state ${live ? "approved" : esc(item.status)}"><i></i>${live ? "active" : esc(item.status)}</span></td>
        <td><div class="aurapop-title"><strong>${esc(item.title)}</strong><small>aurapops.online/pops/${esc(item.slug)}</small></div></td>
        <td><span class="pill ${item.paymentStatus === "paid" ? "ok" : "warn"}">${item.paymentStatus === "paid" ? "Paid" : "Unpaid"}</span></td>
        <td>${Array.isArray(item.links) ? item.links.length : 0}</td>
        <td><small>${esc(item.updatedAt || "—")}</small></td>
        <td><div class="aurapop-actions">
          <a class="btn btn-light btn-sm" href="${esc(item.publicUrl)}" target="_blank" rel="noopener noreferrer">Open ↗</a>
          <button class="btn btn-light btn-sm" data-pop-pay="${esc(item.id)}">${item.paymentStatus === "paid" ? "Mark unpaid" : "Payment received"}</button>
          <button class="btn btn-dark btn-sm" data-pop-activate="${esc(item.id)}" ${item.paymentStatus !== "paid" || live ? "disabled" : ""}>Activate</button>
          <button class="btn btn-light btn-sm" data-pop-pause="${esc(item.id)}" ${item.status === "pending" ? "disabled" : ""}>Pause</button>
          <button class="btn btn-danger btn-sm" data-pop-reject="${esc(item.id)}">Reject</button>
        </div></td>
      </tr>`;
    }).join("");

    $("content").innerHTML = `
      <div class="metrics">
        <div class="metric warn"><span>Pending requests</span><strong>${pending}</strong></div>
        <div class="metric warn"><span>Waiting payment</span><strong>${unpaid}</strong></div>
        <div class="metric good"><span>Active AuraPops</span><strong>${active}</strong></div>
        <div class="metric"><span>Total</span><strong>${items.length}</strong></div>
      </div>
      <section class="panel">
        <div class="panel-head">
          <div><h2>AuraPops requests</h2><p>Review each popup, confirm payment, activate it, pause it or reject it directly from the main AuraDigital dashboard.</p></div>
          <a class="btn btn-dark" href="https://aurapops.online/" target="_blank" rel="noopener noreferrer">Open AuraPops Studio ↗</a>
        </div>
        ${items.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Preview</th><th>Status</th><th>AuraPop</th><th>Payment</th><th>Items</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">No AuraPops requests yet.</div>'}
      </section>`;

    document.querySelectorAll("[data-pop-pay]").forEach(button => button.addEventListener("click", async () => {
      if (!canWrite()) return;
      const item = items.find(value => value.id === button.dataset.popPay);
      if (!item) return;
      const next = item.paymentStatus === "paid" ? "unpaid" : "paid";
      button.disabled = true;
      try {
        await updateAuraPop(item.id, { paymentStatus: next, status: next === "unpaid" && item.status === "approved" ? "pending" : item.status });
        await renderAuraPops(); applyReadOnlyUi();
      } catch (error) { alert(error.message); button.disabled = false; }
    }));

    document.querySelectorAll("[data-pop-activate]").forEach(button => button.addEventListener("click", async () => {
      if (!canWrite()) return;
      button.disabled = true;
      try {
        await updateAuraPop(button.dataset.popActivate, { status: "approved", paymentStatus: "paid" });
        await renderAuraPops(); applyReadOnlyUi();
      } catch (error) { alert(error.message); button.disabled = false; }
    }));

    document.querySelectorAll("[data-pop-pause]").forEach(button => button.addEventListener("click", async () => {
      if (!canWrite()) return;
      button.disabled = true;
      try {
        await updateAuraPop(button.dataset.popPause, { status: "pending" });
        await renderAuraPops(); applyReadOnlyUi();
      } catch (error) { alert(error.message); button.disabled = false; }
    }));

    document.querySelectorAll("[data-pop-reject]").forEach(button => button.addEventListener("click", async () => {
      if (!canWrite()) return;
      button.disabled = true;
      try {
        await updateAuraPop(button.dataset.popReject, { status: "rejected" });
        await renderAuraPops(); applyReadOnlyUi();
      } catch (error) { alert(error.message); button.disabled = false; }
    }));
  }

  renderOverview = async function() {
    await originalRenderOverview();
    try {
      const data = await api(POP_API + "/pops");
      const items = Array.isArray(data.items) ? data.items : [];
      const pending = items.filter(item => item.status !== "approved" || item.paymentStatus !== "paid").length;
      const metrics = document.querySelector("#content .metrics");
      if (metrics) metrics.insertAdjacentHTML("afterbegin", `<div class="metric warn"><span>AuraPops requests</span><strong>${pending}</strong></div>`);
    } catch (_) {}
  };

  openView = async function(view) {
    if (view !== VIEW_ID) return originalOpenView(view);
    state.view = VIEW_ID;
    location.hash = VIEW_ID;
    buildNav();
    $("pageTitle").textContent = "AuraPops Requests";
    $("pageSubtitle").textContent = "Review popup requests, confirm payment and activate them.";
    $("content").innerHTML = '<section class="panel"><p>Loading…</p></section>';
    try {
      await renderAuraPops();
      applyReadOnlyUi();
    } catch (error) {
      if (error.status === 401) return checkSession();
      $("content").innerHTML = `<section class="panel"><div class="notice error">${esc(error.message)}</div></section>`;
    }
  };

  if (!$("dashboardView").classList.contains("hidden")) buildNav();
})();
