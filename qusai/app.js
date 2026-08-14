const $ = (id) => document.getElementById(id);

const state = {
  user: null,
  clients: [],
  metrics: { total: 0, active: 0, leads: 0, followUps: 0 },
  editingId: null,
  lastFocused: null,
};

const statusLabels = {
  lead: "Lead",
  contacted: "Contacted",
  active: "Active",
  waiting: "Waiting",
  completed: "Completed",
};

async function api(path, options = {}) {
  const request = {
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  };
  if (request.body && !request.headers["Content-Type"]) request.headers["Content-Type"] = "application/json";
  const response = await fetch(path, request);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

function setNotice(element, message = "", type = "") {
  element.textContent = message;
  element.className = `notice${type ? ` ${type}` : ""}`;
}

async function start() {
  try {
    const session = await api("/api/employee/session");
    if (session.authenticated) {
      state.user = session.user;
      await showDashboard();
      return;
    }
    showAuth(session.configured);
  } catch {
    showAuth(true);
    setNotice($("loginNotice"), "The workspace is temporarily unavailable. Please try again.", "error");
  }
}

function showAuth(configured = true) {
  $("dashboardView").classList.add("hidden");
  $("authView").classList.remove("hidden");
  $("loginPanel").classList.remove("hidden");
  $("setupPanel").classList.add("hidden");
  $("showSetupButton").textContent = configured ? "Owner: first-time setup" : "Owner: set up this workspace";
  document.body.classList.remove("modal-open");
}

async function showDashboard() {
  $("authView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
  const displayName = state.user?.displayName || "Qusai";
  $("employeeName").textContent = displayName;
  $("heroName").textContent = `${displayName}.`;
  const hour = new Date().getHours();
  $("dayPart").textContent = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  await loadClients();
}

async function loadClients() {
  setNotice($("listNotice"), "Loading customers…");
  try {
    const data = await api("/api/employee/clients");
    state.clients = Array.isArray(data.clients) ? data.clients : [];
    state.metrics = data.metrics || state.metrics;
    renderMetrics();
    renderClients();
    setNotice($("listNotice"));
  } catch (error) {
    if (error.status === 401) {
      state.user = null;
      showAuth(true);
      setNotice($("loginNotice"), "Your session ended. Sign in again.", "error");
      return;
    }
    setNotice($("listNotice"), error.message, "error");
  }
}

function renderMetrics() {
  $("metricTotal").textContent = String(state.metrics.total || 0);
  $("metricActive").textContent = String(state.metrics.active || 0);
  $("metricFollowUps").textContent = String(state.metrics.followUps || 0);
  $("metricLeads").textContent = String(state.metrics.leads || 0);
}

function filteredClients() {
  const query = $("searchInput").value.trim().toLocaleLowerCase("en");
  const status = $("statusFilter").value;
  return state.clients.filter((client) => {
    if (status !== "all" && client.status !== status) return false;
    if (!query) return true;
    return [client.name, client.company, client.service, client.phone, client.email]
      .some((value) => String(value || "").toLocaleLowerCase("en").includes(query));
  });
}

function renderClients() {
  const clients = filteredClients();
  const rows = $("customerRows");
  rows.replaceChildren();

  if (!state.clients.length) {
    $("emptyState").classList.remove("hidden");
    $("tableWrap").classList.add("hidden");
    return;
  }
  $("emptyState").classList.add("hidden");
  $("tableWrap").classList.remove("hidden");

  if (!clients.length) {
    setNotice($("listNotice"), "No customers match this search.");
    return;
  }
  setNotice($("listNotice"));
  clients.forEach((client) => rows.append(createClientRow(client)));
}

function createClientRow(client) {
  const row = document.createElement("tr");

  const customerCell = cell("Customer");
  const customerName = div("customer-name");
  customerName.append(textElement("strong", client.company || client.name || "Unnamed customer"));
  if (client.company && client.name) customerName.append(textElement("small", client.name));
  customerCell.append(customerName);

  const contactCell = cell("Contact");
  const contactLines = div("contact-lines");
  contactLines.append(textElement("span", client.phone || client.whatsapp || "—"));
  if (client.email) contactLines.append(textElement("small", client.email));
  const links = div("contact-links");
  const whatsapp = whatsappUrl(client.whatsapp || client.phone);
  if (whatsapp) links.append(link("WhatsApp", whatsapp));
  if (client.email) links.append(link("Email", `mailto:${client.email}`));
  if (links.childElementCount) contactLines.append(links);
  contactCell.append(contactLines);

  const serviceCell = cell("Service", client.service || "—");
  const statusCell = cell("Status");
  const status = textElement("span", statusLabels[client.status] || client.status || "—", `status-pill ${client.status || ""}`);
  statusCell.append(status);

  const followUpCell = cell("Next follow-up");
  const followUp = textElement("span", formatDate(client.nextFollowUp));
  if (client.nextFollowUp && client.nextFollowUp <= todayString() && client.status !== "completed") followUp.className = "follow-up due";
  followUpCell.append(followUp);

  const actionCell = cell("Actions");
  const actions = div("row-actions");
  const contacted = button("Contacted today", "small-button");
  contacted.addEventListener("click", () => markContacted(client));
  const edit = button("Edit", "small-button primary");
  edit.addEventListener("click", () => openCustomerModal(client));
  actions.append(contacted, edit);
  actionCell.append(actions);

  row.append(customerCell, contactCell, serviceCell, statusCell, followUpCell, actionCell);
  return row;
}

function cell(label, value) {
  const element = document.createElement("td");
  element.dataset.label = label;
  if (value !== undefined) element.textContent = value;
  return element;
}

function div(className) {
  const element = document.createElement("div");
  element.className = className;
  return element;
}

function textElement(tag, value, className = "") {
  const element = document.createElement(tag);
  element.textContent = String(value ?? "");
  if (className) element.className = className;
  return element;
}

function link(label, href) {
  const element = document.createElement("a");
  element.className = "mini-link";
  element.textContent = label;
  element.href = href;
  if (href.startsWith("https://")) {
    element.target = "_blank";
    element.rel = "noopener noreferrer";
  }
  return element;
}

function button(label, className) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = label;
  return element;
}

function whatsappUrl(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 ? `https://wa.me/${digits}` : "";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function todayString() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function openCustomerModal(client = null) {
  state.editingId = client?.id || null;
  state.lastFocused = document.activeElement;
  $("customerForm").reset();
  $("customerId").value = client?.id || "";
  $("customerName").value = client?.name || "";
  $("customerCompany").value = client?.company || "";
  $("customerPhone").value = client?.phone || "";
  $("customerWhatsapp").value = client?.whatsapp || "";
  $("customerEmail").value = client?.email || "";
  $("customerService").value = client?.service || "";
  $("customerStatus").value = client?.status || "lead";
  $("customerLastContact").value = client?.lastContact || "";
  $("customerNextFollowUp").value = client?.nextFollowUp || "";
  $("customerNotes").value = client?.notes || "";
  $("modalTitle").textContent = client ? "Edit customer" : "Add customer";
  $("saveCustomerButton").textContent = client ? "Save changes" : "Save customer";
  $("deleteCustomerButton").classList.toggle("hidden", !client);
  setNotice($("formNotice"));
  $("customerModal").classList.remove("hidden");
  document.body.classList.add("modal-open");
  window.setTimeout(() => $("customerName").focus(), 0);
}

function closeCustomerModal() {
  $("customerModal").classList.add("hidden");
  document.body.classList.remove("modal-open");
  state.editingId = null;
  if (state.lastFocused instanceof HTMLElement) state.lastFocused.focus();
}

function customerPayload(form) {
  const data = new FormData(form);
  return {
    name: String(data.get("name") || ""),
    company: String(data.get("company") || ""),
    phone: String(data.get("phone") || ""),
    whatsapp: String(data.get("whatsapp") || ""),
    email: String(data.get("email") || ""),
    service: String(data.get("service") || ""),
    status: String(data.get("status") || "lead"),
    lastContact: String(data.get("lastContact") || ""),
    nextFollowUp: String(data.get("nextFollowUp") || ""),
    notes: String(data.get("notes") || ""),
  };
}

async function saveCustomer(event) {
  event.preventDefault();
  const payload = customerPayload(event.currentTarget);
  if (!payload.name.trim() && !payload.company.trim()) {
    setNotice($("formNotice"), "Enter a customer name or company name.", "error");
    return;
  }
  const buttonElement = $("saveCustomerButton");
  buttonElement.disabled = true;
  setNotice($("formNotice"), "Saving…");
  try {
    await api(`/api/employee/clients${state.editingId ? `/${encodeURIComponent(state.editingId)}` : ""}`, {
      method: state.editingId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    });
    closeCustomerModal();
    await loadClients();
  } catch (error) {
    setNotice($("formNotice"), error.message, "error");
  } finally {
    buttonElement.disabled = false;
  }
}

async function markContacted(client) {
  try {
    await api(`/api/employee/clients/${encodeURIComponent(client.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ lastContact: todayString(), status: client.status === "lead" ? "contacted" : client.status }),
    });
    await loadClients();
  } catch (error) {
    setNotice($("listNotice"), error.message, "error");
  }
}

async function deleteCustomer() {
  if (!state.editingId || !window.confirm("Delete this customer from Qusai’s workspace and the main dashboard?")) return;
  const buttonElement = $("deleteCustomerButton");
  buttonElement.disabled = true;
  try {
    await api(`/api/employee/clients/${encodeURIComponent(state.editingId)}`, { method: "DELETE" });
    closeCustomerModal();
    await loadClients();
  } catch (error) {
    setNotice($("formNotice"), error.message, "error");
  } finally {
    buttonElement.disabled = false;
  }
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const loginButton = $("loginButton");
  loginButton.disabled = true;
  setNotice($("loginNotice"), "Signing in…");
  try {
    const data = await api("/api/employee/login", {
      method: "POST",
      body: JSON.stringify({ password: $("loginPassword").value }),
    });
    state.user = data.user;
    $("loginPassword").value = "";
    setNotice($("loginNotice"));
    await showDashboard();
  } catch (error) {
    setNotice($("loginNotice"), error.message, "error");
  } finally {
    loginButton.disabled = false;
  }
});

$("setupForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = $("setupPassword").value;
  const confirmation = $("setupPasswordConfirm").value;
  if (password !== confirmation) {
    setNotice($("setupNotice"), "The two passwords do not match.", "error");
    return;
  }
  const setupButton = $("setupButton");
  setupButton.disabled = true;
  setNotice($("setupNotice"), "Creating the private account…");
  try {
    await api("/api/employee/bootstrap", { method: "POST", body: JSON.stringify({ password }) });
    $("setupPassword").value = "";
    $("setupPasswordConfirm").value = "";
    $("setupPanel").classList.add("hidden");
    $("loginPanel").classList.remove("hidden");
    setNotice($("loginNotice"), "Private account created. Qusai can now sign in with the new password.", "success");
  } catch (error) {
    setNotice($("setupNotice"), error.message, "error");
  } finally {
    setupButton.disabled = false;
  }
});

$("logoutButton").addEventListener("click", async () => {
  await api("/api/employee/logout", { method: "POST" }).catch(() => {});
  state.user = null;
  state.clients = [];
  showAuth(true);
  setNotice($("loginNotice"), "You have been logged out.", "success");
});

$("showSetupButton").addEventListener("click", () => {
  $("loginPanel").classList.add("hidden");
  $("setupPanel").classList.remove("hidden");
  setNotice($("setupNotice"));
  $("setupPassword").focus();
});
$("backToLoginButton").addEventListener("click", () => {
  $("setupPanel").classList.add("hidden");
  $("loginPanel").classList.remove("hidden");
  $("loginPassword").focus();
});
$("addCustomerButton").addEventListener("click", () => openCustomerModal());
$("emptyAddButton").addEventListener("click", () => openCustomerModal());
$("closeModalButton").addEventListener("click", closeCustomerModal);
$("cancelModalButton").addEventListener("click", closeCustomerModal);
$("deleteCustomerButton").addEventListener("click", deleteCustomer);
$("customerForm").addEventListener("submit", saveCustomer);
$("searchInput").addEventListener("input", renderClients);
$("statusFilter").addEventListener("change", renderClients);
$("customerModal").addEventListener("click", (event) => {
  if (event.target === $("customerModal")) closeCustomerModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !$("customerModal").classList.contains("hidden")) closeCustomerModal();
});

start();
