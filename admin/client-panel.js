(() => {
  const META_PREFIX = "__AURA_CLIENT_V2__";
  const SERVICES = [
    "Website Management",
    "Social Media",
    "Google Maps",
    "Google Ads",
    "Meta Ads",
    "WhatsApp Automation",
    "SEO",
    "AuraMenu",
    "NFC / QR",
  ];
  const STATUS_OPTIONS = ["lead", "contacted", "negotiating", "active", "paused", "completed", "lost"];
  const previousOpenView = openView;
  let currentClientId = null;
  let currentTab = "overview";

  const clientTheme = document.createElement("link");
  clientTheme.rel = "stylesheet";
  clientTheme.href = "/admin/client-panel.css";
  document.head.appendChild(clientTheme);

  function emptyMeta() {
    return {
      whatsapp: "",
      language: "",
      address: "",
      website: "",
      instagram: "",
      googleMaps: "",
      package: "",
      manager: "",
      monthlyFee: 0,
      setupFee: 0,
      internalCost: 0,
      adBudget: 0,
      paymentStatus: "unpaid",
      nextPaymentDate: "",
      services: [],
      tasks: [],
      activity: [],
    };
  }

  function unpackNotes(value) {
    const raw = String(value || "");
    if (!raw.startsWith(META_PREFIX)) return { meta: emptyMeta(), plain: raw };
    const lineBreak = raw.indexOf("\n");
    const jsonPart = lineBreak === -1 ? raw.slice(META_PREFIX.length) : raw.slice(META_PREFIX.length, lineBreak);
    const plain = lineBreak === -1 ? "" : raw.slice(lineBreak + 1);
    try {
      const parsed = JSON.parse(jsonPart || "{}");
      const meta = { ...emptyMeta(), ...parsed };
      meta.services = Array.isArray(meta.services) ? meta.services.filter(value => SERVICES.includes(value)) : [];
      meta.tasks = Array.isArray(meta.tasks) ? meta.tasks.slice(0, 8) : [];
      meta.activity = Array.isArray(meta.activity) ? meta.activity.slice(0, 8) : [];
      return { meta, plain };
    } catch {
      return { meta: emptyMeta(), plain: raw };
    }
  }

  function packNotes(meta, plain) {
    const compact = {
      ...emptyMeta(),
      ...meta,
      services: Array.isArray(meta.services) ? meta.services.slice(0, SERVICES.length) : [],
      tasks: Array.isArray(meta.tasks) ? meta.tasks.slice(0, 8) : [],
      activity: Array.isArray(meta.activity) ? meta.activity.slice(0, 8) : [],
    };
    let note = String(plain || "").trim().slice(0, 600);
    let serialized = META_PREFIX + JSON.stringify(compact) + "\n" + note;
    while (serialized.length > 3900 && compact.activity.length > 3) {
      compact.activity.pop();
      serialized = META_PREFIX + JSON.stringify(compact) + "\n" + note;
    }
    while (serialized.length > 3900 && compact.tasks.length > 4) {
      const doneIndex = compact.tasks.findIndex(task => task.done);
      compact.tasks.splice(doneIndex >= 0 ? doneIndex : compact.tasks.length - 1, 1);
      serialized = META_PREFIX + JSON.stringify(compact) + "\n" + note;
    }
    if (serialized.length > 3900) {
      note = note.slice(0, Math.max(0, 600 - (serialized.length - 3900)));
      serialized = META_PREFIX + JSON.stringify(compact) + "\n" + note;
    }
    return serialized;
  }

  function num(value) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function prettyDate(value, withTime = false) {
    if (!value) return "—";
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return withTime ? date.toLocaleString("tr-TR") : date.toLocaleDateString("tr-TR");
    } catch { return String(value); }
  }

  function statusPill(status) {
    const value = String(status || "lead");
    const good = value === "active" || value === "completed";
    const warn = ["lead", "contacted", "negotiating", "paused"].includes(value);
    return `<span class="pill ${good ? "ok" : warn ? "warn" : ""}">${esc(value)}</span>`;
  }

  function paymentPill(value) {
    const paid = value === "paid";
    return `<span class="pill ${paid ? "ok" : "warn"}">${paid ? "Paid" : value === "partial" ? "Partial" : "Unpaid"}</span>`;
  }

  function addActivity(meta, text) {
    const item = { id: crypto.randomUUID(), text: String(text || "").slice(0, 120), at: new Date().toISOString() };
    meta.activity = [item, ...(Array.isArray(meta.activity) ? meta.activity : [])].slice(0, 8);
  }

  function clientLabel(client) {
    return client.company || client.name || `Client #${client.id}`;
  }

  async function loadClients() {
    const data = await api("/api/admin/clients");
    state.clients = Array.isArray(data.items) ? data.items : [];
    return state.clients;
  }

  function clientById(id) {
    return (state.clients || []).find(client => String(client.id) === String(id));
  }

  function activeServices(client) {
    const { meta } = unpackNotes(client.notes);
    return meta.services || [];
  }

  function listRow(client) {
    const { meta } = unpackNotes(client.notes);
    const services = meta.services || [];
    const monthly = num(meta.monthlyFee);
    const search = [client.name, client.company, client.email, client.phone, meta.whatsapp, meta.package, meta.manager, client.status, ...services].join(" ").toLowerCase();
    return `<tr data-client-row data-search="${esc(search)}">
      <td><button type="button" class="client-link-button" data-client-open="${esc(client.id)}"><span class="client-table-name"><strong>${esc(clientLabel(client))}</strong><small>${esc(client.name || "No contact name")}</small></span></button></td>
      <td><div class="client-services-mini">${services.length ? services.slice(0, 3).map(service => `<span class="pill">${esc(service)}</span>`).join("") + (services.length > 3 ? `<span class="pill">+${services.length - 3}</span>` : "") : '<span class="client-empty-services">Not set</span>'}</div></td>
      <td>${statusPill(client.status)}</td>
      <td><strong>${money(monthly)}</strong><small style="display:block;color:var(--muted)">${esc(meta.package || "No package")}</small></td>
      <td>${paymentPill(meta.paymentStatus)}<small style="display:block;color:var(--muted);margin-top:4px">${prettyDate(meta.nextPaymentDate)}</small></td>
      <td>${esc(meta.manager || "—")}</td>
      <td><div class="row-actions"><button type="button" class="btn btn-light btn-sm" data-client-open="${esc(client.id)}">Open</button>${canWrite() ? `<button type="button" class="btn btn-light btn-sm" data-client-edit="${esc(client.id)}">Edit</button>` : ""}</div></td>
    </tr>`;
  }

  async function renderClients() {
    currentClientId = null;
    currentTab = "overview";
    $("pageTitle").textContent = "Clients";
    $("pageSubtitle").textContent = "Contacts, services, costs, tasks and client history in one place.";
    const clients = await loadClients();
    const parsed = clients.map(client => ({ client, meta: unpackNotes(client.notes).meta }));
    const active = clients.filter(client => client.status === "active").length;
    const monthlyRevenue = parsed.filter(item => item.client.status === "active").reduce((sum, item) => sum + num(item.meta.monthlyFee), 0);
    const pending = parsed.filter(item => item.meta.paymentStatus !== "paid" && num(item.meta.monthlyFee) > 0).length;
    const rows = clients.map(listRow).join("");

    $("content").innerHTML = `
      <div class="metrics">
        <div class="metric"><span>Total clients</span><strong>${clients.length}</strong></div>
        <div class="metric good"><span>Active</span><strong>${active}</strong></div>
        <div class="metric good"><span>Active monthly value</span><strong>${money(monthlyRevenue)}</strong></div>
        <div class="metric warn"><span>Payment attention</span><strong>${pending}</strong></div>
      </div>
      <section class="panel">
        <div class="panel-head"><div><h2>Client workspace</h2><p>Open a client to manage everything inside this dashboard.</p></div>${canWrite() ? '<button id="clientAdd" class="btn btn-dark" type="button">+ Add client</button>' : '<span class="pill">Read-only access</span>'}</div>
        <div class="client-toolbar"><input id="clientSearch" class="client-search" type="search" placeholder="Search client, service, manager…" aria-label="Search clients"><span class="pill">${clients.length} records</span></div>
        ${clients.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Client</th><th>Services</th><th>Status</th><th>Monthly</th><th>Payment</th><th>Manager</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="empty">No clients yet. Add your first client.</div>'}
      </section>`;

    if (canWrite() && $("clientAdd")) $("clientAdd").addEventListener("click", () => renderClientForm(null));
    document.querySelectorAll("[data-client-open]").forEach(button => button.addEventListener("click", () => renderClientDetail(button.dataset.clientOpen, "overview")));
    document.querySelectorAll("[data-client-edit]").forEach(button => button.addEventListener("click", () => renderClientForm(clientById(button.dataset.clientEdit))));
    if ($("clientSearch")) $("clientSearch").addEventListener("input", event => {
      const query = event.currentTarget.value.trim().toLowerCase();
      document.querySelectorAll("[data-client-row]").forEach(row => row.classList.toggle("hidden", query && !row.dataset.search.includes(query)));
    });
    applyReadOnlyUi();
  }

  function profileHeader(client, meta) {
    const manager = meta.manager ? ` · ${esc(meta.manager)}` : "";
    return `<button type="button" class="btn btn-light btn-sm client-back" id="clientBack">← Clients</button>
      <div class="client-profile-head">
        <div><div class="client-profile-kicker">${statusPill(client.status)}${meta.package ? `<span class="pill">${esc(meta.package)}</span>` : ""}</div><h2>${esc(clientLabel(client))}</h2><p>${esc(client.name || "No contact")}${manager}</p></div>
        <div class="client-profile-actions">${canWrite() ? `<button id="clientEdit" class="btn btn-light" type="button">Edit client</button>` : ""}${client.phone ? `<a class="btn btn-primary" href="tel:${encodeURIComponent(client.phone)}">Call</a>` : ""}${meta.whatsapp ? `<a class="btn btn-primary" href="https://wa.me/${encodeURIComponent(String(meta.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}</div>
      </div>`;
  }

  function tabsHtml() {
    const tabs = [["overview", "Overview"], ["services", "Services"], ["finance", "Finance"], ["contact", "Contact"], ["tasks", "Tasks"], ["activity", "Activity"]];
    return `<div class="client-tabs">${tabs.map(([id, label]) => `<button type="button" class="client-tab ${id === currentTab ? "active" : ""}" data-client-tab="${id}">${label}</button>`).join("")}</div>`;
  }

  function infoItem(label, value, link = "") {
    const rendered = link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(value || "Open")}</a>` : `<strong>${esc(value || "—")}</strong>`;
    return `<div class="client-info-item"><span>${esc(label)}</span>${rendered}</div>`;
  }

  function overviewTab(client, meta, plain) {
    const margin = num(meta.monthlyFee) - num(meta.internalCost);
    const nextTasks = (meta.tasks || []).filter(task => !task.done).slice(0, 4);
    const web = safeLink(meta.website);
    const ig = safeLink(meta.instagram);
    const maps = safeLink(meta.googleMaps);
    return `<div class="client-finance-grid">
      <div class="client-finance-card"><span>Monthly fee</span><strong>${money(meta.monthlyFee)}</strong></div>
      <div class="client-finance-card good"><span>Monthly margin</span><strong>${money(margin)}</strong></div>
      <div class="client-finance-card"><span>Active services</span><strong>${(meta.services || []).length}</strong></div>
      <div class="client-finance-card"><span>Next payment</span><strong style="font-size:16px">${prettyDate(meta.nextPaymentDate)}</strong></div>
    </div>
    <div class="client-grid" style="margin-top:18px">
      <section class="panel"><div class="panel-head"><div><h2>Contact & business</h2><p>Main information for this client.</p></div></div><div class="client-info-grid">
        ${infoItem("Contact", client.name)}${infoItem("Phone", client.phone)}${infoItem("WhatsApp", meta.whatsapp)}${infoItem("Email", client.email)}${infoItem("Language", meta.language)}${infoItem("Address", meta.address)}${web ? infoItem("Website", meta.website, web) : infoItem("Website", meta.website)}${ig ? infoItem("Instagram", meta.instagram, ig) : infoItem("Instagram", meta.instagram)}${maps ? infoItem("Google Maps", "Open map ↗", maps) : infoItem("Google Maps", meta.googleMaps)}${infoItem("Manager", meta.manager)}
      </div></section>
      <section class="panel"><div class="panel-head"><div><h2>Services</h2><p>What AuraDigital currently handles.</p></div></div><div class="client-service-grid">${SERVICES.map(service => `<div class="client-service-card ${(meta.services || []).includes(service) ? "active" : ""}"><div><strong>${esc(service)}</strong><small>${(meta.services || []).includes(service) ? "Active for this client" : "Not included"}</small></div><span class="client-service-dot"></span></div>`).join("")}</div></section>
      <section class="panel"><div class="panel-head"><div><h2>Next tasks</h2><p>Open work for this client.</p></div></div>${nextTasks.length ? `<div class="client-task-list">${nextTasks.map(taskHtml).join("")}</div>` : '<div class="empty">No open tasks.</div>'}</section>
      <section class="panel"><div class="panel-head"><div><h2>Notes</h2><p>Private client notes. Do not store passwords here.</p></div></div>${plain ? `<div class="client-notes">${esc(plain)}</div>` : '<div class="empty">No notes yet.</div>'}</section>
    </div>`;
  }

  function servicesTab(meta) {
    return `<section class="panel"><div class="panel-head"><div><h2>Client services</h2><p>Active services are managed from Edit client.</p></div>${canWrite() ? '<button id="clientServicesEdit" class="btn btn-dark" type="button">Edit services</button>' : ""}</div><div class="client-service-grid">${SERVICES.map(service => { const active = (meta.services || []).includes(service); return `<div class="client-service-card ${active ? "active" : ""}"><div><strong>${esc(service)}</strong><small>${active ? "Included / active" : "Not included"}</small></div><div style="display:flex;align-items:center;gap:9px"><span class="pill ${active ? "ok" : ""}">${active ? "Active" : "Off"}</span><span class="client-service-dot"></span></div></div>`; }).join("")}</div></section>`;
  }

  function financeTab(meta) {
    const monthlyMargin = num(meta.monthlyFee) - num(meta.internalCost);
    const setupMargin = num(meta.setupFee);
    return `<div class="client-finance-grid">
      <div class="client-finance-card"><span>Monthly client fee</span><strong>${money(meta.monthlyFee)}</strong></div>
      <div class="client-finance-card"><span>Internal monthly cost</span><strong>${money(meta.internalCost)}</strong></div>
      <div class="client-finance-card good"><span>Monthly margin</span><strong>${money(monthlyMargin)}</strong></div>
      <div class="client-finance-card"><span>Ad budget</span><strong>${money(meta.adBudget)}</strong></div>
    </div>
    <section class="panel" style="margin-top:18px"><div class="panel-head"><div><h2>Billing details</h2><p>Commercial information for this client.</p></div>${canWrite() ? '<button id="clientFinanceEdit" class="btn btn-dark" type="button">Edit finance</button>' : ""}</div><div class="client-info-grid">${infoItem("Package", meta.package)}${infoItem("Setup fee", money(meta.setupFee))}${infoItem("Setup value", money(setupMargin))}${infoItem("Payment status", meta.paymentStatus)}${infoItem("Next payment", prettyDate(meta.nextPaymentDate))}${infoItem("Client renewal", prettyDate(clientById(currentClientId)?.renewal_date))}</div></section>`;
  }

  function contactTab(client, meta) {
    const web = safeLink(meta.website);
    const ig = safeLink(meta.instagram);
    const maps = safeLink(meta.googleMaps);
    return `<section class="panel"><div class="panel-head"><div><h2>Contact & account data</h2><p>Keep the operational links your team needs. Never save raw passwords in this dashboard.</p></div>${canWrite() ? '<button id="clientContactEdit" class="btn btn-dark" type="button">Edit data</button>' : ""}</div><div class="client-info-grid">${infoItem("Business", client.company)}${infoItem("Contact person", client.name)}${infoItem("Phone", client.phone)}${infoItem("WhatsApp", meta.whatsapp)}${infoItem("Email", client.email)}${infoItem("Preferred language", meta.language)}${infoItem("Address", meta.address)}${infoItem("Assigned manager", meta.manager)}${web ? infoItem("Website", meta.website, web) : infoItem("Website", meta.website)}${ig ? infoItem("Instagram", meta.instagram, ig) : infoItem("Instagram", meta.instagram)}${maps ? infoItem("Google Maps", "Open map ↗", maps) : infoItem("Google Maps", meta.googleMaps)}${infoItem("Renewal", prettyDate(client.renewal_date))}</div><div class="client-contact-actions">${client.phone ? `<a class="btn btn-light" href="tel:${encodeURIComponent(client.phone)}">Call</a>` : ""}${client.email ? `<a class="btn btn-light" href="mailto:${encodeURIComponent(client.email)}">Email</a>` : ""}${meta.whatsapp ? `<a class="btn btn-light" href="https://wa.me/${encodeURIComponent(String(meta.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}${web ? `<a class="btn btn-light" href="${esc(web)}" target="_blank" rel="noopener noreferrer">Website ↗</a>` : ""}</div><div class="client-warning" style="margin-top:16px">Use a password manager for Google, Meta, hosting and domain credentials. Save only account links or IDs here.</div></section>`;
  }

  function taskHtml(task) {
    return `<div class="client-task ${task.done ? "done" : ""}" data-task-id="${esc(task.id)}"><button type="button" class="client-task-state" data-task-toggle="${esc(task.id)}" aria-label="Toggle task">${task.done ? "✓" : ""}</button><div><div class="client-task-title">${esc(task.title)}</div><div class="client-task-meta">${esc(task.service || "General")} · ${esc(task.priority || "normal")} priority${task.assignedTo ? ` · ${esc(task.assignedTo)}` : ""}${task.dueDate ? ` · due ${esc(prettyDate(task.dueDate))}` : ""}</div></div>${canWrite() ? `<div class="client-task-actions"><button type="button" class="btn btn-danger btn-sm" data-task-delete="${esc(task.id)}">Delete</button></div>` : ""}</div>`;
  }

  function tasksTab(meta) {
    const tasks = Array.isArray(meta.tasks) ? meta.tasks : [];
    return `<section class="panel"><div class="panel-head"><div><h2>Client tasks</h2><p>Track what AuraDigital still needs to deliver.</p></div><span class="pill">${tasks.filter(task => !task.done).length} open</span></div>${canWrite() ? `<form id="clientTaskForm" class="client-task-form"><label class="client-task-title-input">Task<input name="title" maxlength="60" required placeholder="Example: Send monthly report"></label><label>Due<input name="dueDate" type="date"></label><label>Priority<select name="priority"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label>Assigned to<input name="assignedTo" maxlength="40" placeholder="Employee"></label><button class="btn btn-dark" type="submit">+ Add</button></form>` : ""}<div class="client-task-list" style="margin-top:16px">${tasks.length ? tasks.map(taskHtml).join("") : '<div class="empty">No tasks yet.</div>'}</div></section>`;
  }

  function activityTab(meta) {
    const activity = Array.isArray(meta.activity) ? meta.activity : [];
    return `<section class="panel"><div class="panel-head"><div><h2>Client activity</h2><p>Recent changes made from the client workspace.</p></div><span class="pill">Latest ${activity.length}</span></div><div class="client-activity-list">${activity.length ? activity.map(item => `<div class="client-activity"><span class="client-activity-dot"></span><p>${esc(item.text || "Update")}</p><small>${esc(prettyDate(item.at, true))}</small></div>`).join("") : '<div class="empty">No activity yet.</div>'}</div></section>`;
  }

  async function renderClientDetail(id, tab = "overview") {
    const client = clientById(id) || (await loadClients(), clientById(id));
    if (!client) return renderClients();
    currentClientId = String(client.id);
    currentTab = tab;
    const { meta, plain } = unpackNotes(client.notes);
    $("pageTitle").textContent = clientLabel(client);
    $("pageSubtitle").textContent = "Client profile inside the AuraDigital dashboard.";
    let body = overviewTab(client, meta, plain);
    if (tab === "services") body = servicesTab(meta);
    if (tab === "finance") body = financeTab(meta);
    if (tab === "contact") body = contactTab(client, meta);
    if (tab === "tasks") body = tasksTab(meta);
    if (tab === "activity") body = activityTab(meta);
    $("content").innerHTML = profileHeader(client, meta) + tabsHtml() + `<div id="clientTabBody">${body}</div>`;

    $("clientBack").addEventListener("click", renderClients);
    if (canWrite() && $("clientEdit")) $("clientEdit").addEventListener("click", () => renderClientForm(client));
    document.querySelectorAll("[data-client-tab]").forEach(button => button.addEventListener("click", () => renderClientDetail(client.id, button.dataset.clientTab)));
    ["clientServicesEdit", "clientFinanceEdit", "clientContactEdit"].forEach(idValue => { if (canWrite() && $(idValue)) $(idValue).addEventListener("click", () => renderClientForm(client)); });
    if (tab === "tasks") bindTaskActions(client, meta, plain);
    applyReadOnlyUi();
  }

  async function saveMetaOnly(client, meta, plain, activityText = "Client updated") {
    addActivity(meta, activityText);
    const notes = packNotes(meta, plain);
    await api(`/api/admin/clients/${encodeURIComponent(client.id)}`, { method: "PUT", body: JSON.stringify({ notes }) });
    client.notes = notes;
  }

  function bindTaskActions(client, meta, plain) {
    if (!canWrite()) return;
    const form = $("clientTaskForm");
    if (form) form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = new FormData(form);
      const title = String(data.get("title") || "").trim().slice(0, 60);
      if (!title) return;
      const task = { id: crypto.randomUUID(), title, dueDate: String(data.get("dueDate") || ""), priority: String(data.get("priority") || "normal"), assignedTo: String(data.get("assignedTo") || "").trim().slice(0, 40), service: "General", done: false };
      meta.tasks = [task, ...(meta.tasks || [])].slice(0, 8);
      try { await saveMetaOnly(client, meta, plain, `Task added: ${title}`); await renderClientDetail(client.id, "tasks"); }
      catch (error) { alert(error.message); }
    });
    document.querySelectorAll("[data-task-toggle]").forEach(button => button.addEventListener("click", async () => {
      const task = (meta.tasks || []).find(item => item.id === button.dataset.taskToggle);
      if (!task) return;
      task.done = !task.done;
      try { await saveMetaOnly(client, meta, plain, `${task.done ? "Task completed" : "Task reopened"}: ${task.title}`); await renderClientDetail(client.id, "tasks"); }
      catch (error) { alert(error.message); }
    }));
    document.querySelectorAll("[data-task-delete]").forEach(button => button.addEventListener("click", async () => {
      const task = (meta.tasks || []).find(item => item.id === button.dataset.taskDelete);
      if (!task || !confirm(`Delete task “${task.title}”?`)) return;
      meta.tasks = (meta.tasks || []).filter(item => item.id !== task.id);
      try { await saveMetaOnly(client, meta, plain, `Task deleted: ${task.title}`); await renderClientDetail(client.id, "tasks"); }
      catch (error) { alert(error.message); }
    }));
  }

  function serviceChecks(selected) {
    const values = Array.isArray(selected) ? selected : [];
    return `<div class="client-service-checks">${SERVICES.map(service => `<label class="client-service-check"><input type="checkbox" name="services" value="${esc(service)}" ${values.includes(service) ? "checked" : ""}>${esc(service)}</label>`).join("")}</div>`;
  }

  function renderClientForm(client) {
    if (!canWrite()) return;
    const existing = client ? unpackNotes(client.notes) : { meta: emptyMeta(), plain: "" };
    const meta = existing.meta;
    $("pageTitle").textContent = client ? `Edit ${clientLabel(client)}` : "Add client";
    $("pageSubtitle").textContent = "Save the client, services, commercial data and contacts in one record.";
    $("content").innerHTML = `<button type="button" class="btn btn-light btn-sm client-back" id="clientFormBack">← ${client ? "Client" : "Clients"}</button><section class="panel"><div class="panel-head"><div><h2>${client ? "Edit client profile" : "New client"}</h2><p>Everything below stays inside the main AuraDigital dashboard.</p></div><span class="status">CRM</span></div><form id="clientProfileForm" class="client-form">
      <div class="client-form-section"><h3>Business & contact</h3><p>Main client identity and communication details.</p></div>
      <label>Business / company<input name="company" maxlength="120" value="${esc(client?.company || "")}" placeholder="Restaurant ABC"></label>
      <label>Contact person<input name="name" maxlength="120" value="${esc(client?.name || "")}" required placeholder="Owner or manager"></label>
      <label>Phone<input name="phone" maxlength="50" value="${esc(client?.phone || "")}"></label>
      <label>WhatsApp<input name="whatsapp" maxlength="50" value="${esc(meta.whatsapp || "")}"></label>
      <label>Email<input name="email" type="email" maxlength="160" value="${esc(client?.email || "")}"></label>
      <label>Preferred language<input name="language" maxlength="40" value="${esc(meta.language || "")}" placeholder="Arabic / Turkish / English"></label>
      <label class="span-2">Address<input name="address" maxlength="220" value="${esc(meta.address || "")}"></label>
      <div class="client-form-section"><h3>Online accounts</h3><p>Links only. Keep passwords in a password manager.</p></div>
      <label>Website URL<input name="website" type="url" maxlength="500" value="${esc(meta.website || "")}"></label>
      <label>Instagram URL<input name="instagram" type="url" maxlength="500" value="${esc(meta.instagram || "")}"></label>
      <label class="span-2">Google Maps URL<input name="googleMaps" type="url" maxlength="500" value="${esc(meta.googleMaps || "")}"></label>
      <div class="client-form-section"><h3>Services</h3><p>Select everything AuraDigital currently manages for this client.</p></div>
      <div class="span-2">${serviceChecks(meta.services)}</div>
      <div class="client-form-section"><h3>Commercial & ownership</h3><p>Package, manager, costs and payment tracking.</p></div>
      <label>Status<select name="status">${STATUS_OPTIONS.map(status => `<option value="${status}" ${String(client?.status || "lead") === status ? "selected" : ""}>${status}</option>`).join("")}</select></label>
      <label>Package<input name="package" maxlength="80" value="${esc(meta.package || "")}" placeholder="Start / Growth / Pro / Custom"></label>
      <label>Assigned employee / manager<input name="manager" maxlength="80" value="${esc(meta.manager || "")}"></label>
      <label>Renewal date<input name="renewalDate" type="date" value="${esc(client?.renewal_date || "")}"></label>
      <label>Monthly fee (TL)<input name="monthlyFee" type="number" min="0" step="any" value="${esc(meta.monthlyFee || 0)}"></label>
      <label>Setup fee (TL)<input name="setupFee" type="number" min="0" step="any" value="${esc(meta.setupFee || 0)}"></label>
      <label>Internal monthly cost (TL)<input name="internalCost" type="number" min="0" step="any" value="${esc(meta.internalCost || 0)}"></label>
      <label>Ad budget (TL)<input name="adBudget" type="number" min="0" step="any" value="${esc(meta.adBudget || 0)}"></label>
      <label>Payment status<select name="paymentStatus"><option value="unpaid" ${meta.paymentStatus === "unpaid" ? "selected" : ""}>Unpaid</option><option value="partial" ${meta.paymentStatus === "partial" ? "selected" : ""}>Partial</option><option value="paid" ${meta.paymentStatus === "paid" ? "selected" : ""}>Paid</option></select></label>
      <label>Next payment date<input name="nextPaymentDate" type="date" value="${esc(meta.nextPaymentDate || "")}"></label>
      <div class="client-form-section"><h3>Notes</h3><p>Requests, preferences and useful context. Do not save credentials.</p></div>
      <label class="span-2">Private notes<textarea name="plainNotes" maxlength="600" placeholder="Client requests, preferences, important reminders…">${esc(existing.plain || "")}</textarea></label>
      <div class="client-form-actions"><button type="button" id="clientFormCancel" class="btn btn-light">Cancel</button><button type="submit" class="btn btn-dark">${client ? "Save changes" : "Create client"}</button></div>
    </form></section>`;

    const goBack = () => client ? renderClientDetail(client.id, currentTab || "overview") : renderClients();
    $("clientFormBack").addEventListener("click", goBack);
    $("clientFormCancel").addEventListener("click", goBack);
    $("clientProfileForm").addEventListener("submit", event => saveClientForm(event, client, existing));
  }

  async function saveClientForm(event, client, existing) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("button[type=submit]");
    const data = new FormData(form);
    const meta = { ...emptyMeta(), ...existing.meta };
    meta.whatsapp = String(data.get("whatsapp") || "").trim().slice(0, 50);
    meta.language = String(data.get("language") || "").trim().slice(0, 40);
    meta.address = String(data.get("address") || "").trim().slice(0, 220);
    meta.website = String(data.get("website") || "").trim().slice(0, 500);
    meta.instagram = String(data.get("instagram") || "").trim().slice(0, 500);
    meta.googleMaps = String(data.get("googleMaps") || "").trim().slice(0, 500);
    meta.package = String(data.get("package") || "").trim().slice(0, 80);
    meta.manager = String(data.get("manager") || "").trim().slice(0, 80);
    meta.monthlyFee = num(data.get("monthlyFee"));
    meta.setupFee = num(data.get("setupFee"));
    meta.internalCost = num(data.get("internalCost"));
    meta.adBudget = num(data.get("adBudget"));
    meta.paymentStatus = ["unpaid", "partial", "paid"].includes(String(data.get("paymentStatus"))) ? String(data.get("paymentStatus")) : "unpaid";
    meta.nextPaymentDate = String(data.get("nextPaymentDate") || "");
    meta.services = data.getAll("services").map(String).filter(service => SERVICES.includes(service));
    addActivity(meta, client ? "Client profile updated" : "Client created");
    const plain = String(data.get("plainNotes") || "").trim().slice(0, 600);
    const body = {
      name: String(data.get("name") || "").trim().slice(0, 120),
      company: String(data.get("company") || "").trim().slice(0, 120),
      email: String(data.get("email") || "").trim().slice(0, 160),
      phone: String(data.get("phone") || "").trim().slice(0, 50),
      service: meta.services.join(", "),
      status: String(data.get("status") || "lead"),
      renewal_date: String(data.get("renewalDate") || "") || null,
      notes: packNotes(meta, plain),
    };
    if (!body.name) return alert("Contact person is required.");
    submit.disabled = true;
    try {
      if (client) {
        await api(`/api/admin/clients/${encodeURIComponent(client.id)}`, { method: "PUT", body: JSON.stringify(body) });
        await loadClients();
        await renderClientDetail(client.id, "overview");
      } else {
        const result = await api("/api/admin/clients", { method: "POST", body: JSON.stringify(body) });
        await loadClients();
        const created = result?.id ? clientById(result.id) : state.clients[0];
        if (created) await renderClientDetail(created.id, "overview"); else await renderClients();
      }
    } catch (error) {
      alert(error.message);
      submit.disabled = false;
    }
  }

  openView = async function(view) {
    if (view !== "clients") return previousOpenView(view);
    state.view = "clients";
    location.hash = "clients";
    buildNav();
    $("content").innerHTML = '<section class="panel"><p>Loading clients…</p></section>';
    try { await renderClients(); }
    catch (error) {
      if (error.status === 401) return checkSession();
      $("content").innerHTML = `<section class="panel"><div class="notice error">${esc(error.message)}</div></section>`;
    }
  };

  if (!$("dashboardView").classList.contains("hidden") && state.view === "clients") openView("clients");
})();