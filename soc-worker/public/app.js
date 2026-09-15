const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  user: null,
  data: { securityEvents: [], auditEvents: [], alertStates: [], sources: [], rules: [] },
  view: "overview",
  search: "",
};

const titles = {
  overview: ["Overview", "Real-time visibility. Smarter detection. A more secure tomorrow."],
  alerts: ["Alert Queue", "Triage, acknowledge and resolve prioritized security activity."],
  events: ["Event Explorer", "Search and investigate normalized production telemetry."],
  sources: ["Log Sources", "Visibility into connected and planned telemetry sources."],
  rules: ["Detection Rules", "Active detection logic mapped to real AuraDigital events."],
  audit: ["Audit Trail", "Owner-only record of privileged administrative actions."],
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
}

function humanize(value) {
  return String(value || "unknown").replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function timeAgo(value) {
  const ms = Date.now() - new Date(String(value).replace(" ", "T") + (String(value).includes("Z") ? "" : "Z")).getTime();
  if (!Number.isFinite(ms)) return "—";
  const minutes = Math.max(0, Math.floor(ms / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(value) {
  const d = new Date(String(value).replace(" ", "T") + (String(value).includes("Z") ? "" : "Z"));
  return Number.isFinite(d.getTime()) ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || `HTTP ${response.status}`), { status: response.status });
  return body;
}

function severityFor(item) {
  if (item.source === "security") {
    const event = String(item.event || "");
    const status = Number(item.statusCode || 0);
    if ((event === "request_error" && status >= 500) || /malware|exfiltration|compromise/i.test(event)) return "critical";
    if (event === "login_failed" || status === 429 || /brute|token|privilege/i.test(event)) return "high";
    if (event === "request_denied" || event === "request_error") return "medium";
    return "low";
  }
  if (/delete|remove|disable|deactivate|revoke|password|role|permission|owner|token/i.test(item.event)) return "high";
  if (/create|update|edit|approve|publish|login/i.test(item.event)) return "medium";
  return "low";
}

function normalizedEvents() {
  const security = state.data.securityEvents.map(row => ({
    id: row.id,
    source: "security",
    event: row.event,
    title: humanize(row.event),
    area: row.area || "other",
    method: row.method || "",
    statusCode: Number(row.status || 0),
    requestId: row.requestId || "",
    createdAt: row.createdAt,
    detail: `${row.method || "EVENT"} · ${row.area || "other"}${row.status ? ` · HTTP ${row.status}` : ""}`,
  }));
  const audit = state.data.auditEvents.map(row => ({
    id: row.id,
    source: "audit",
    event: row.action,
    title: humanize(row.action),
    area: row.resource || "admin",
    method: "AUDIT",
    statusCode: 200,
    requestId: row.requestId || "",
    createdAt: row.createdAt,
    username: row.username || "unknown",
    detail: `${row.username || "unknown"} · ${row.resource || "resource"}${row.targetId ? ` · ${row.targetId}` : ""}`,
  }));
  return [...security, ...audit]
    .map(item => ({ ...item, severity: severityFor(item) }))
    .sort((a, b) => new Date(String(b.createdAt).replace(" ", "T")) - new Date(String(a.createdAt).replace(" ", "T")));
}

function alertStateMap() {
  return new Map(state.data.alertStates.map(row => [`${row.source}:${row.eventId}`, row]));
}

function eventState(item) {
  return alertStateMap().get(`${item.source}:${item.id}`)?.status || "open";
}

function eventsInWindow(hours, offsetHours = 0) {
  const end = Date.now() - offsetHours * 3600000;
  const start = end - hours * 3600000;
  return normalizedEvents().filter(item => {
    const t = new Date(String(item.createdAt).replace(" ", "T") + (String(item.createdAt).includes("Z") ? "" : "Z")).getTime();
    return t >= start && t < end;
  });
}

function delta(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function sparkline(values, severity = "low") {
  const width = 72, height = 28;
  const max = Math.max(1, ...values);
  const points = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * width},${height - (v / max) * (height - 4) - 2}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${width} ${height}" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${severity === "critical" ? "#ff4545" : severity === "high" ? "#ff8d21" : severity === "good" ? "#42ee85" : "#19d8ff"}" stroke-width="2"/></svg>`;
}

function hourlySeries(events, hours = 12) {
  const now = Date.now();
  return Array.from({ length: hours }, (_, index) => {
    const end = now - (hours - index - 1) * 2 * 3600000;
    const start = end - 2 * 3600000;
    return events.filter(item => {
      const t = new Date(String(item.createdAt).replace(" ", "T") + (String(item.createdAt).includes("Z") ? "" : "Z")).getTime();
      return t >= start && t < end;
    }).length;
  });
}

function metricCard({ label, value, icon, tone, current, previous, series }) {
  const change = delta(current, previous);
  const sign = change > 0 ? "+" : "";
  return `<article class="metric ${tone}">
    <div class="metric-head"><span>${escapeHtml(label)}</span><b class="metric-icon">${escapeHtml(icon)}</b></div>
    <div class="metric-body"><strong class="metric-value">${escapeHtml(value)}</strong>${sparkline(series, tone)}</div>
    <div class="metric-foot"><strong>${sign}${change}%</strong> &nbsp; vs. previous 24h</div>
  </article>`;
}

function renderMetrics() {
  const current = eventsInWindow(24), previous = eventsInWindow(24, 24);
  const currentSec = current.filter(x => x.source === "security"), previousSec = previous.filter(x => x.source === "security");
  const critical = current.filter(x => x.severity === "critical");
  const high = current.filter(x => x.severity === "high");
  const blocked = currentSec.filter(x => x.event === "request_denied");
  const failed = currentSec.filter(x => x.event === "login_failed");
  const errors = currentSec.filter(x => x.event === "request_error" && x.statusCode >= 500).length;
  const health = currentSec.length ? Math.max(85, 100 - (errors / currentSec.length) * 100) : 100;
  const specs = [
    { label: "Critical Alerts", value: critical.length, icon: "!", tone: "critical", current: critical.length, previous: previous.filter(x => x.severity === "critical").length, series: hourlySeries(critical) },
    { label: "High Alerts", value: high.length, icon: "△", tone: "high", current: high.length, previous: previous.filter(x => x.severity === "high").length, series: hourlySeries(high) },
    { label: "Events Last 24h", value: current.length.toLocaleString(), icon: "▤", tone: "", current: current.length, previous: previous.length, series: hourlySeries(current) },
    { label: "Blocked Requests", value: blocked.length.toLocaleString(), icon: "◇", tone: "", current: blocked.length, previous: previousSec.filter(x => x.event === "request_denied").length, series: hourlySeries(blocked) },
    { label: "Failed Logins", value: failed.length.toLocaleString(), icon: "◎", tone: "critical", current: failed.length, previous: previousSec.filter(x => x.event === "login_failed").length, series: hourlySeries(failed) },
    { label: "System Health", value: `${health.toFixed(1)}%`, icon: "♡", tone: "good", current: Math.round(health), previous: Math.round(health), series: Array.from({ length: 12 }, (_, i) => Math.max(1, Math.round(health - 2 + (i % 4)))) },
  ];
  $("#metricGrid").innerHTML = specs.map(metricCard).join("");
}

function renderTrend() {
  const all = eventsInWindow(24);
  const critical = all.filter(x => x.severity === "critical");
  const buckets = 12;
  const a = hourlySeries(all, buckets), c = hourlySeries(critical, buckets);
  const max = Math.max(1, ...a);
  const W = 620, H = 160, L = 34, R = 8, T = 8, B = 22;
  const x = i => L + (i / (buckets - 1)) * (W - L - R);
  const y = v => T + (1 - v / max) * (H - T - B);
  const line = values => values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${L},${H-B} ${line(a)} ${x(buckets-1)},${H-B}`;
  const grid = [0,.25,.5,.75,1].map(p => `<line class="grid-line" x1="${L}" y1="${T+p*(H-T-B)}" x2="${W-R}" y2="${T+p*(H-T-B)}"/>`).join("");
  const labels = [0,3,6,9,11].map(i => `<text class="axis-text" x="${x(i)}" y="${H-6}" text-anchor="middle">${String((new Date(Date.now()-(11-i)*2*3600000)).getHours()).padStart(2,"0")}:00</text>`).join("");
  $("#trendChart").innerHTML = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a17" stop-opacity=".34"/><stop offset="1" stop-color="#ff7a17" stop-opacity="0"/></linearGradient></defs>${grid}<polygon class="trend-area" points="${area}"/><polyline class="trend-line" points="${line(a)}"/><polyline class="trend-critical" points="${line(c)}"/>${labels}</svg>`;
}

function renderSeverity() {
  const events = eventsInWindow(24);
  const levels = ["critical","high","medium","low"];
  const colors = { critical: "#ff4545", high: "#ff8d21", medium: "#ffd42a", low: "#19d8ff" };
  const counts = Object.fromEntries(levels.map(level => [level, events.filter(x => x.severity === level).length]));
  const total = Math.max(1, levels.reduce((sum, level) => sum + counts[level], 0));
  const radius = 48, C = 2 * Math.PI * radius;
  let offset = 0;
  const circles = levels.map(level => {
    const size = counts[level] / total * C;
    const circle = `<circle class="donut-seg" cx="65" cy="65" r="${radius}" stroke="${colors[level]}" stroke-dasharray="${size} ${C-size}" stroke-dashoffset="${-offset}"/>`;
    offset += size;
    return circle;
  }).join("");
  const legend = levels.map(level => `<div class="legend-row"><i data-color="${level}"></i><span>${humanize(level)}</span><strong>${counts[level]}</strong></div>`).join("");
  $("#severityChart").innerHTML = `<svg class="donut-svg" viewBox="0 0 130 130"><circle class="donut-bg" cx="65" cy="65" r="${radius}"/>${circles}<text class="donut-total" x="65" y="62">${levels.reduce((s,l)=>s+counts[l],0)}</text><text class="donut-label" x="65" y="77">Total Alerts</text></svg><div>${legend}</div>`;
  $$(".legend-row i", $("#severityChart")).forEach(el => { const key = el.dataset.color; el.setAttribute("style", `background:${colors[key]}`); });
}

function renderTargets() {
  const events = eventsInWindow(24);
  const map = new Map();
  events.forEach(item => map.set(item.area || "other", (map.get(item.area || "other") || 0) + 1));
  const entries = [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  const max = Math.max(1,...entries.map(x=>x[1]));
  const W=420,H=160,L=22,B=34,bar=48,gap=26;
  const rects = entries.map(([name,value],i) => { const h=(value/max)*(H-B-18); const x=L+i*(bar+gap); const y=H-B-h; const color=i<2?"#ff7d1d":i===2?"#ffd42a":"#17c7db"; return `<rect x="${x}" y="${y}" width="${bar}" height="${h}" rx="2" fill="${color}"/><text class="axis-text" x="${x+bar/2}" y="${Math.max(10,y-5)}" text-anchor="middle">${value}</text><text class="axis-text" x="${x+bar/2}" y="${H-17}" text-anchor="middle">${escapeHtml(name.slice(0,10))}</text>`; }).join("");
  $("#targetChart").innerHTML = entries.length ? `<svg class="chart-svg" viewBox="0 0 ${W} ${H}">${rects}</svg>` : `<div class="empty">No targeted-area data yet.</div>`;
}

function alertCandidates() {
  return normalizedEvents().filter(item => item.severity !== "low");
}

function renderPriority() {
  const items = alertCandidates().slice(0,3);
  $("#priorityAlerts").innerHTML = items.length ? `<div class="priority-list">${items.map(item => `<div class="priority-item ${item.severity}"><div class="alert-icon">!</div><div><div class="priority-title">${escapeHtml(item.title)}</div><div class="priority-sub">${escapeHtml(item.detail)}</div></div><div><span class="severity-pill ${item.severity}">${item.severity}</span><div class="freshness">${timeAgo(item.createdAt)}</div></div></div>`).join("")}</div>` : `<div class="empty">No priority alerts in the current window.</div>`;
}

function tableHtml(rows, columns) {
  if (!rows.length) return `<div class="empty">No events to display.</div>`;
  return `<div class="table-wrap"><table><thead><tr>${columns.map(c=>`<th>${escapeHtml(c.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${columns.map(c=>`<td>${c.render ? c.render(row) : escapeHtml(row[c.key] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderRecentEvents() {
  const rows = normalizedEvents().slice(0,8);
  $("#recentEvents").innerHTML = tableHtml(rows, [
    { label:"Time", render:r=>escapeHtml(formatTime(r.createdAt)) },
    { label:"Event", render:r=>`<span class="event-dot ${r.severity}"></span>${escapeHtml(r.event)}` },
    { label:"Source", render:r=>escapeHtml(r.source === "security" ? r.area : r.username || "admin") },
    { label:"Details", render:r=>escapeHtml(r.detail) },
  ]);
}

function renderIncidents() {
  const rows = alertCandidates().slice(0,6);
  $("#incidentTable").innerHTML = tableHtml(rows, [
    { label:"ID", render:r=>escapeHtml(`INC-${String(r.id).slice(0,8).toUpperCase()}`) },
    { label:"Title", render:r=>escapeHtml(r.title) },
    { label:"Severity", render:r=>`<span class="severity-pill ${r.severity}">${r.severity}</span>` },
    { label:"Status", render:r=>escapeHtml(eventState(r)) },
    { label:"Source", render:r=>escapeHtml(r.source) },
    { label:"Opened", render:r=>escapeHtml(timeAgo(r.createdAt)) },
  ]);
}

async function setAlert(item, status) {
  await api(`/api/alerts/${encodeURIComponent(item.source)}/${encodeURIComponent(item.id)}`, { method:"PATCH", body:JSON.stringify({ status }) });
  await refreshData(false);
}

function renderAlertQueue() {
  const filter = $("#alertFilter").value;
  let rows = alertCandidates();
  if (filter !== "all") rows = rows.filter(item => eventState(item) === filter);
  $("#alertTable").innerHTML = tableHtml(rows, [
    { label:"Severity", render:r=>`<span class="severity-pill ${r.severity}">${r.severity}</span>` },
    { label:"Alert", render:r=>escapeHtml(r.title) },
    { label:"Area", key:"area" },
    { label:"Source", key:"source" },
    { label:"Status", render:r=>escapeHtml(eventState(r)) },
    { label:"Time", render:r=>escapeHtml(timeAgo(r.createdAt)) },
    { label:"Actions", render:r=>`<div class="alert-actions"><button data-alert-source="${escapeHtml(r.source)}" data-alert-id="${escapeHtml(r.id)}" data-alert-status="acknowledged">Acknowledge</button><button data-alert-source="${escapeHtml(r.source)}" data-alert-id="${escapeHtml(r.id)}" data-alert-status="resolved">Resolve</button></div>` },
  ]);
  $$('[data-alert-id]', $("#alertTable")).forEach(button => button.addEventListener("click", () => {
    const item = normalizedEvents().find(x => x.source === button.dataset.alertSource && x.id === button.dataset.alertId);
    if (item) setAlert(item, button.dataset.alertStatus).catch(showError);
  }));
}

function filteredEvents() {
  const q = state.search.trim().toLowerCase();
  const severity = $("#severityFilter").value;
  const source = $("#sourceFilter").value;
  return normalizedEvents().filter(item => (!q || JSON.stringify(item).toLowerCase().includes(q)) && (severity === "all" || item.severity === severity) && (source === "all" || item.source === source));
}

function renderExplorer() {
  $("#eventTable").innerHTML = tableHtml(filteredEvents(), [
    { label:"Time", render:r=>escapeHtml(new Date(String(r.createdAt).replace(" ","T")+"Z").toLocaleString()) },
    { label:"Severity", render:r=>`<span class="severity-pill ${r.severity}">${r.severity}</span>` },
    { label:"Event", key:"event" }, { label:"Area", key:"area" }, { label:"Source", key:"source" }, { label:"Details", key:"detail" },
  ]);
}

function renderSources() {
  $("#sourceCards").innerHTML = state.data.sources.map(source => `<article class="source-card"><span class="source-status ${source.status === "planned" ? "planned" : ""}">${source.status === "online" ? "● Online" : "◌ Planned"}</span><h3>${escapeHtml(source.name)}</h3><p>${escapeHtml(source.detail)}</p><div class="rule-mitre">${escapeHtml(source.type)}</div></article>`).join("");
}

function renderRules() {
  $("#ruleCards").innerHTML = state.data.rules.map(rule => `<article class="rule-card"><div class="rule-code">${escapeHtml(rule.id)}</div><h3>${escapeHtml(rule.name)}</h3><span class="severity-pill ${rule.severity}">${escapeHtml(rule.severity)}</span><div class="rule-mitre">${escapeHtml(rule.mitre)}</div></article>`).join("");
}

function renderAudit() {
  const rows = state.data.auditEvents;
  $("#auditTable").innerHTML = tableHtml(rows, [
    { label:"Time", render:r=>escapeHtml(new Date(String(r.createdAt).replace(" ","T")+"Z").toLocaleString()) },
    { label:"User", key:"username" }, { label:"Action", key:"action" }, { label:"Resource", key:"resource" }, { label:"Target", key:"targetId" }, { label:"Request", key:"requestId" },
  ]);
}

function renderAll() {
  renderMetrics(); renderTrend(); renderSeverity(); renderTargets(); renderPriority(); renderRecentEvents(); renderIncidents(); renderAlertQueue(); renderExplorer(); renderSources(); renderRules(); renderAudit();
  const open = alertCandidates().filter(item => eventState(item) === "open").length;
  $("#alertBadge").textContent = String(open);
  $("#analystName").textContent = state.user?.displayName || state.user?.username || "Owner";
}

function switchView(view) {
  state.view = view;
  $$(".view").forEach(section => section.classList.toggle("active-view", section.id === view));
  $$('[data-view]').forEach(button => button.classList.toggle("active", button.dataset.view === view));
  $("#viewTitle").textContent = titles[view][0];
  $("#viewSubtitle").textContent = titles[view][1];
}

function showError(error) {
  console.error(error);
  if (error?.status === 401) showLogin();
}

async function refreshData(showLoading = true) {
  if (showLoading) $("#recentEvents").innerHTML = `<div class="loading">Loading production telemetry</div>`;
  state.data = await api("/api/dashboard");
  renderAll();
}

function showLogin() { $("#appView").classList.add("hidden"); $("#loginView").classList.remove("hidden"); }
function showApp() { $("#loginView").classList.add("hidden"); $("#appView").classList.remove("hidden"); switchView(state.view); }

async function bootstrap() {
  try {
    const session = await api("/api/session");
    state.user = session.user;
    showApp();
    await refreshData();
  } catch { showLogin(); }
}

$("#loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = $("#loginMessage"); message.textContent = "";
  try {
    const result = await api("/api/login", { method:"POST", body:JSON.stringify({ username:$("#username").value, password:$("#password").value }) });
    state.user = result.user; $("#password").value = ""; showApp(); await refreshData();
  } catch (error) { message.textContent = error.message; }
});

$("#logoutBtn").addEventListener("click", async () => { try { await api("/api/logout", { method:"POST", body:"{}" }); } finally { state.user = null; showLogin(); } });
$("#refreshBtn").addEventListener("click", () => refreshData(false).catch(showError));
$("#alertFilter").addEventListener("change", renderAlertQueue);
$("#severityFilter").addEventListener("change", renderExplorer);
$("#sourceFilter").addEventListener("change", renderExplorer);
$("#globalSearch").addEventListener("input", event => { state.search = event.target.value; renderExplorer(); });
$$('[data-view]').forEach(button => button.addEventListener("click", () => switchView(button.dataset.view)));
$$('[data-jump]').forEach(button => button.addEventListener("click", () => switchView(button.dataset.jump)));
document.addEventListener("keydown", event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#globalSearch").focus(); } });

function tickClock() {
  const now = new Date();
  $("#clockDate").textContent = now.toLocaleDateString([], { month:"short", day:"2-digit", year:"numeric" });
  $("#clockTime").textContent = now.toLocaleTimeString([], { hour12:false }) + " local";
}
setInterval(tickClock, 1000); tickClock();
setInterval(() => { if (state.user) refreshData(false).catch(showError); }, 30000);
bootstrap();
