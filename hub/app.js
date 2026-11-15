// src/hub/commerce.js
var copy = {
  en: ["Recent orders", "Orders from this AuraDigital account across workspaces.", "You have no orders yet.", "Awaiting bank transfer", "Cancelled", "Awaiting artwork approval", "In production", "Shipped", "Delivered", "Payment verified", "Check my orders", "NFC fulfillment", "No active card orders.", "Browse cards", "Request a quote", "Service requests", "Received", "No requests have been submitted from this workspace."],
  tr: ["Son sipari\u015Fler", "Bu AuraDigital hesab\u0131n\u0131n t\xFCm \xE7al\u0131\u015Fma alanlar\u0131ndaki sipari\u015Fleri.", "Hen\xFCz sipari\u015Finiz yok.", "Havale bekleniyor", "\u0130ptal edildi", "Tasar\u0131m onay\u0131 bekleniyor", "\xDCretimde", "G\xF6nderildi", "Teslim edildi", "\xD6deme do\u011Fruland\u0131", "Sipari\u015Flerimi kontrol et", "NFC sipari\u015F s\xFCreci", "Aktif kart sipari\u015Finiz yok.", "Kartlara g\xF6z at", "Teklif iste", "Hizmet talepleri", "Al\u0131nd\u0131", "Bu \xE7al\u0131\u015Fma alan\u0131ndan hen\xFCz talep g\xF6nderilmedi."],
  fr: ["Commandes r\xE9centes", "Commandes de ce compte AuraDigital pour tous les espaces.", "Vous n\u2019avez encore aucune commande.", "En attente du virement", "Annul\xE9e", "En attente de validation du visuel", "En production", "Exp\xE9di\xE9e", "Livr\xE9e", "Paiement v\xE9rifi\xE9", "Consulter mes commandes", "Suivi des cartes NFC", "Aucune commande de cartes en cours.", "Voir les cartes", "Demander un devis", "Demandes de service", "Re\xE7ue", "Aucune demande envoy\xE9e depuis cet espace."],
  ar: ["\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u062E\u064A\u0631\u0629", "\u0637\u0644\u0628\u0627\u062A \u062D\u0633\u0627\u0628 AuraDigital \u0647\u0630\u0627 \u0639\u0628\u0631 \u062C\u0645\u064A\u0639 \u0645\u0633\u0627\u062D\u0627\u062A \u0627\u0644\u0639\u0645\u0644.", "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u0637\u0644\u0628\u0627\u062A \u0628\u0639\u062F.", "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0628\u0646\u0643\u064A", "\u0645\u0644\u063A\u0649", "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0635\u0645\u064A\u0645", "\u0642\u064A\u062F \u0627\u0644\u0625\u0646\u062A\u0627\u062C", "\u062A\u0645 \u0627\u0644\u0634\u062D\u0646", "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645", "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062F\u0641\u0639", "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0637\u0644\u0628\u0627\u062A\u064A", "\u0645\u062A\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u0627\u062A NFC", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0628\u0637\u0627\u0642\u0627\u062A \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630.", "\u062A\u0635\u0641\u062D \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A", "\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631", "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062E\u062F\u0645\u0627\u062A", "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645", "\u0644\u0645 \u062A\u064F\u0631\u0633\u0644 \u0623\u064A \u0637\u0644\u0628\u0627\u062A \u0645\u0646 \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u0647\u0630\u0647."]
};
function commerceCopy(lang2) {
  const [
    orders,
    scope,
    empty,
    awaiting_transfer,
    cancelled,
    awaiting_artwork,
    in_production,
    shipped,
    delivered,
    paid,
    ask,
    fulfillment,
    noFulfillment,
    browse,
    quote,
    requests,
    received,
    noRequests
  ] = copy[lang2] || copy.en;
  return {
    orders,
    scope,
    empty,
    ask,
    fulfillment,
    noFulfillment,
    browse,
    quote,
    requests,
    received,
    noRequests,
    payment: { awaiting_transfer, cancelled, paid },
    production: { awaiting_artwork, in_production, shipped, delivered }
  };
}
function orderMarkup(orders, lang2, esc3) {
  const labels2 = commerceCopy(lang2);
  const items = orders.map((order) => {
    const total = new Intl.NumberFormat(lang2, { style: "currency", currency: order.currency }).format(order.totalMinor / 100);
    const production = order.paymentStatus === "paid" ? labels2.production[order.productionStatus] : "";
    const status = [labels2.payment[order.paymentStatus], production].filter(Boolean).join(" \xB7 ");
    return `<li><a href="/shop/orders/${encodeURIComponent(order.id)}"><bdi>${esc3(order.reference)}</bdi></a><span>${esc3(status)}</span><bdi>${esc3(total)}</bdi></li>`;
  });
  return `<ul class="hub-order-list">${items.join("")}</ul>`;
}

// src/customer-return.js
function customerReturnPath(value, fallback) {
  return ["/hub", "/account", "/shop/checkout"].includes(value) || typeof value === "string" && /^\/shop\/orders\/[a-f0-9-]{36}$/.test(value) ? value : fallback;
}

// src/roadmap.js
var roadmapStages = [
  { key: "foundation", icon: "\u25C7" },
  { key: "visibility", icon: "\u25CE" },
  { key: "conversion", icon: "\u2197" },
  { key: "automation", icon: "\u2699" }
];
var missionGuide = {
  website: ["Web Design", "Give customers a place to understand your offer and contact you.", "Choose your main offer and audience. Publish a mobile-friendly page with a clear contact or booking action."],
  domain: ["Hosting / Security", "Give your business a consistent address that you control.", "Choose a domain, register it in your business account, and document renewal and DNS access."],
  email: ["Business Email", "Make customer messages recognizable and improve deliverability.", "Create a branded mailbox and configure SPF, DKIM and DMARC with your email provider."],
  branding: [null, "Help customers recognize your business across listings, messages and your site.", "Prepare your logo, colors and core message in a short brand guide."],
  hosting: ["Hosting / Security", "Keep your website reachable and protect access to its administration.", "Enable HTTPS, automatic backups and MFA. Test restoring a backup."],
  seo: ["SEO / Google Maps", "Make your pages easier to find for the searches your customers use.", "Pick relevant search terms, update page titles and copy, and verify indexing in Search Console."],
  discovery: ["SEO / Google Maps", "Help nearby customers find your hours, location and contact details.", "Claim your Google Business Profile if eligible. Verify it, add accurate details and publish recent photos."],
  ads: ["Ad Management", "Test whether paid search can reach people already looking for your offer.", "Choose one offer and landing page. Set conversion tracking and a test budget before launching."],
  reviews: ["SEO / Google Maps", "Help customers judge what to expect from your business.", "Request honest reviews after service and respond to feedback. Avoid incentives tied to positive ratings."],
  leads: ["Web Design", "Give visitors a direct way to take the next step.", "Add a short contact or booking form. Test submission, confirmation and follow-up on a phone."],
  whatsapp: ["AI & Automation", "Make it easy for customers to start a conversation on their phone.", "Set up a business number, add click-to-chat to your site or listing, and check who handles replies."],
  crm: ["Pricing / Quote", "Keep customer enquiries and follow-up commitments in one place.", "Define your pipeline stages, assign owners, and import current leads with permission."],
  conversion: [null, "Find and remove friction between a visit and an enquiry or sale.", "Review your offer and call to action. Change one element and measure whether more visitors take the next step."],
  automation: ["AI & Automation", "Answer routine questions and route complex requests to a person.", "Write approved answers, identify handoff cases, and test responses with common customer questions."],
  followups: ["AI & Automation", "Reduce missed enquiries and follow up consistently.", "Define when reminders should fire, record consent, and test opt-outs and human overrides."],
  analytics: [null, "See which acquisition channels and pages lead to useful customer actions.", "Choose the actions that matter, configure privacy-aware tracking, and verify sample events."],
  retention: [null, "Make it easier for existing customers to return.", "Choose a reason to return, test it with existing customers, and measure repeat purchases or bookings."],
  menu: ["AuraMenu", "Give diners an easy way to view current items and prices on their phones.", "Gather your categories, item names, prices and photos. Publish and test a QR link on a phone."]
};
function missionState(mission, missions, profile) {
  const existing = new Set(profile.capabilities || []);
  if (profile.website) existing.add("website");
  const requirements = (mission.dependencies || []).filter((id) => !existing.has(id) && !missions.some((candidate) => candidate.capability === id && candidate.status === "done"));
  return { requirements, blocked: mission.status !== "done" && requirements.length > 0 };
}
function eligibleMissions(missions, profile) {
  return missions.filter((mission) => !["done", "postponed"].includes(mission.status) && !missionState(mission, missions, profile).blocked).sort((a, b) => Number(a.optional || false) - Number(b.optional || false) || a.priority - b.priority || a.position - b.position);
}

// src/hub/roadmap-view.js
var labels = {
  en: ["Dashboard", "Roadmap", "Tasks", "Resources", "Welcome back", "Roadmap progress", "Growth stage", "Priority actions", "Estimated timeline", "Your business growth", "Your Business Growth Roadmap", "Tree view", "Timeline", "Current focus", "Why it matters", "How to do it", "Requirements", "Do it myself", "Get this done with AuraDigital", "Ask AURI\u2026", "Optional", "Blocked", "Update my roadmap", "Request a service", "Start", "Mark complete", "AURI Assistant", "Can AuraDigital help?", "Upcoming", "Completed", "Ask about this task"],
  tr: ["Panel", "Yol haritas\u0131", "G\xF6revler", "Kaynaklar", "Tekrar ho\u015F geldiniz", "Yol haritas\u0131 ilerlemesi", "B\xFCy\xFCme a\u015Famas\u0131", "\xD6ncelikli ad\u0131mlar", "Tahmini s\xFCre", "\u0130\u015Fletmenizin b\xFCy\xFCmesi", "\u0130\u015Fletmenizin b\xFCy\xFCme yol haritas\u0131", "A\u011Fa\xE7 g\xF6r\xFCn\xFCm\xFC", "Zaman \xE7izelgesi", "\u015Eu anki odak", "Neden \xF6nemli", "Nas\u0131l yap\u0131l\u0131r", "Gereksinimler", "Kendim yapaca\u011F\u0131m", "AuraDigital ile yap", "AURI\u2019ye sorun\u2026", "\u0130ste\u011Fe ba\u011Fl\u0131", "Engellendi", "Yol haritas\u0131n\u0131 g\xFCncelle", "Hizmet iste", "Ba\u015Fla", "Tamamland\u0131 olarak i\u015Faretle", "AURI Asistan\u0131", "AuraDigital yard\u0131mc\u0131 olabilir mi?", "Yakla\u015Fan", "Tamamlanan", "Bu g\xF6revi sor"],
  fr: ["Tableau de bord", "Feuille de route", "T\xE2ches", "Ressources", "Bon retour", "Progression", "\xC9tape de croissance", "Actions prioritaires", "D\xE9lai estim\xE9", "La croissance de votre entreprise", "Votre feuille de route de croissance", "Vue en arbre", "Chronologie", "Priorit\xE9 actuelle", "Pourquoi cette t\xE2che compte", "Comment faire", "Pr\xE9requis", "Le faire moi-m\xEAme", "Confier \xE0 AuraDigital", "Demander \xE0 AURI\u2026", "Facultatif", "Bloqu\xE9", "Actualiser la feuille de route", "Demander un service", "D\xE9marrer", "Marquer comme termin\xE9", "Assistant AURI", "AuraDigital peut-il aider ?", "\xC0 venir", "Termin\xE9", "Poser une question sur cette t\xE2che"],
  ar: ["\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", "\u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0644\u0645\u0647\u0627\u0645", "\u0627\u0644\u0645\u0648\u0627\u0631\u062F", "\u0623\u0647\u0644\u064B\u0627 \u0628\u0639\u0648\u062F\u062A\u0643", "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0645\u0648", "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", "\u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062F\u0631\u0629", "\u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u062E\u0627\u0631\u0637\u0629 \u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u0639\u0631\u0636 \u0627\u0644\u0634\u062C\u0631\u0629", "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A", "\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0627\u0644\u062D\u0627\u0644\u064A", "\u0644\u0645\u0627\u0630\u0627 \u064A\u0647\u0645", "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A", "\u0633\u0623\u0646\u0641\u0630\u0647\u0627 \u0628\u0646\u0641\u0633\u064A", "\u0646\u0641\u0651\u0630 \u0645\u0639 AuraDigital", "\u0627\u0633\u0623\u0644 AURI\u2026", "\u0627\u062E\u062A\u064A\u0627\u0631\u064A", "\u0645\u062A\u0648\u0642\u0641", "\u062D\u062F\u0651\u062B \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0637\u0644\u0628 \u062E\u062F\u0645\u0629", "\u0627\u0628\u062F\u0623", "\u0639\u0644\u0651\u0645 \u0643\u0645\u0643\u062A\u0645\u0644", "\u0645\u0633\u0627\u0639\u062F AURI", "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0644\u0640 AuraDigital \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629\u061F", "\u0627\u0644\u0642\u0627\u062F\u0645", "\u0627\u0644\u0645\u0643\u062A\u0645\u0644", "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0645\u0629"]
};
var roadmapLabels = (lang2) => Object.fromEntries([
  "home",
  "journey",
  "tasks",
  "resources",
  "welcome",
  "progress",
  "stage",
  "priority",
  "estimate",
  "root",
  "heading",
  "tree",
  "timeline",
  "focus",
  "why",
  "how",
  "requirements",
  "myself",
  "hire",
  "ask",
  "optional",
  "blocked",
  "refresh",
  "request",
  "start",
  "complete",
  "assistant",
  "help",
  "upcoming",
  "completed",
  "askTask"
].map((key, i) => [key, labels[lang2][i]]));
function renderRoadmap({ host, workspace: workspace2, t: t2, esc: esc3, cap: cap2, lang: lang2, view, selectedId, onSelect, onView, onSave, onEdit, onGenerate, onAsk, robot: robot2, requestLink: requestLink2 }) {
  const l = roadmapLabels(lang2);
  const { missions, profile, analysis, permissions } = workspace2;
  const canWrite = permissions.includes("roadmap:write");
  const canAsk = permissions.includes("auri:use");
  const eligible = eligibleMissions(missions, profile);
  const selected = missions.find((m) => m.id === selectedId) || eligible[0] || missions[0];
  const completion = (items) => items.length ? Math.round(items.filter((m) => m.status === "done").length / items.length * 100) : 0;
  const progress = completion(missions);
  const stageOf = (m) => Math.min(m.level, 4);
  const title = (m) => m.objective === m.service ? cap2(m.capability) : m.objective;
  const stages = roadmapStages.map((stage, i) => ({ ...stage, missions: missions.filter((m) => stageOf(m) === i + 1) }));
  const stageName = (stage, i) => lang2 === "en" ? ["Build Foundation", "Increase Visibility", "Convert More Visitors", "Automate & Scale"][i] : t2(stage.key);
  const currentStage = stages.findIndex((stage) => stage.missions.some((m) => !m.optional && !["done", "postponed"].includes(m.status)));
  const isBlocked = (m) => missionState(m, missions, profile).blocked;
  const status = (m) => isBlocked(m) ? l.blocked : t2(m.status);
  const node = (m) => `<button type="button" class="growth-node" data-node="${esc3(m.id)}" data-status="${isBlocked(m) ? "blocked" : m.status}" aria-pressed="${m.id === selected?.id}">
  <span class="growth-dot" aria-hidden="true">${m.status === "done" ? "\u2713" : isBlocked(m) ? "\xB7" : ""}</span>
  <span>${esc3(title(m))}<small>${esc3(status(m))}${m.optional ? " \xB7 " + l.optional : ""}</small></span>
 </button>`;
  const tree = `<div class="growth-tree">
  <div class="growth-root"><span aria-hidden="true">\u2726</span>${l.root}</div>
  <svg class="growth-lines" viewBox="0 0 800 90" preserveAspectRatio="none" aria-hidden="true">
   <path pathLength="1" d="M400 0 C390 65 100 6 100 90" /><path pathLength="1" d="M400 0 C395 60 300 10 300 90" />
   <path pathLength="1" d="M400 0 C405 60 500 10 500 90" /><path pathLength="1" d="M400 0 C410 65 700 6 700 90" />
  </svg>
  <div class="growth-branches">${stages.map((stage, i) => `<section class="growth-branch" data-stage="${i}">
    <h3><span aria-hidden="true">${stage.icon}</span>${i + 1}. ${esc3(stageName(stage, i))}<small>${stage.missions.length ? completion(stage.missions) + "%" : "\u2014"}</small></h3>
    <div class="growth-nodes">${stage.missions.map(node).join("") || `<p>${esc3(t2("empty"))}</p>`}</div></section>`).join("")}</div>
 </div>`;
  const groups = [
    [l.priority, eligible],
    [l.upcoming, missions.filter((m) => m.status !== "done" && !eligible.includes(m))],
    [l.completed, missions.filter((m) => m.status === "done").sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))]
  ];
  const timeline = `<div class="growth-timeline">${groups.map(([label, items]) => `<section><h3>${label}</h3>${items.map((m) => `<div>${node(m)}
  ${m.completedAt ? `<time datetime="${esc3(m.completedAt)}">${esc3(new Date(m.completedAt).toLocaleDateString(lang2))}</time>` : ""}
  ${m.dependencies?.length ? `<small>${l.requirements} \xB7 ${esc3(m.dependencies.map(cap2).join(", "))}</small>` : ""}</div>`).join("") || `<p>${esc3(t2("empty"))}</p>`}</section>`).join("")}</div>`;
  const metric = (icon, value, label) => `<article class="growth-card growth-metric"><span class="growth-metric-icon" aria-hidden="true">${icon}</span><div><strong>${esc3(value)}</strong><span>${label}</span></div></article>`;
  const detail = selected ? taskDetails(selected) : `<p>${esc3(t2("empty"))}</p>`;
  host.innerHTML = `<section class="growth-metrics" aria-label="${l.progress}">
 <article class="growth-card growth-metric"><span class="growth-ring" style="--progress:${progress}%">${missions.length ? progress + "%" : "\u2014"}</span><div><strong>${l.progress}</strong><span>${missions.filter((m) => m.status === "done").length} / ${missions.length} \xB7 ${l.completed}</span></div></article>
 ${metric("\u25A5", currentStage < 0 ? "\u2014" : stageName(stages[currentStage], currentStage), l.stage)}
 ${metric("\u25CE", eligible.filter((m) => m.priority === 1 && !m.optional).length, l.priority)}
 ${metric("\u25A6", "\u2014", l.estimate)}</section>
 <div class="growth-layout"><section class="growth-card growth-map"><header class="growth-panel-head"><h2>${l.heading}</h2><div class="growth-tabs">
 <button type="button" data-view="tree" aria-pressed="${view === "tree"}">${l.tree}</button><button type="button" data-view="timeline" aria-pressed="${view === "timeline"}">${l.timeline}</button>
 </div></header>${view === "tree" ? tree : timeline}
 ${analysis.missions.some((m) => !missions.some((item) => item.capability === m.id)) && canWrite ? `<button type="button" class="growth-secondary" data-refresh>${l.refresh}</button>` : ""}</section>
 <aside class="growth-side"><section class="growth-card growth-focus" id="growth-focus" tabindex="-1">${detail}</section>
 <section class="growth-card growth-auri"><header>${robot2()}<h2>${l.assistant}</h2></header>
 <div class="growth-answer" role="status"></div>${canAsk ? `<form><input name="question" aria-label="${l.ask}" placeholder="${l.ask}" maxlength="500" required><button class="growth-primary" aria-label="${l.ask}">\u27A4</button></form>` : ""}</section></aside></div>`;
  function taskDetails(m) {
    const guide = missionGuide[m.capability];
    const reason = m.reason?.startsWith("This capability has not been reported") ? guide?.[1] : m.reason;
    const action = m.nextAction === "Define scope or record your existing solution." ? guide?.[2] : m.nextAction;
    const { requirements, blocked } = missionState(m, missions, profile);
    const row = (label, body) => `<div class="growth-detail-row"><h3>${label}</h3><p>${esc3(body)}</p></div>`;
    return `<div class="growth-focus-top"><span>${l.focus}</span><small>${esc3(status(m))}${m.optional ? " \xB7 " + l.optional : ""}</small></div>
   <h2>${esc3(title(m))}</h2>
   ${m.description !== reason && !m.description.startsWith("Establish ") ? `<p>${esc3(m.description)}</p>` : ""}
   ${row(l.why, reason || m.description)}
   ${row(l.requirements, m.dependencies?.length ? m.dependencies.map(cap2).join(", ") : "\u2014")}
   ${guide?.[0] ? row(l.help, guide[0] + " \xB7 " + t2("quote")) : ""}
   <details class="growth-diy" open><summary>${l.myself}</summary>${row(l.how, action)}
   ${blocked ? `<p>${l.blocked} \xB7 ${esc3(requirements.map(cap2).join(", "))}</p>` : ""}</details>
   <div class="growth-actions">
   ${guide?.[0] ? `<a class="growth-primary" href="${esc3(requestLink2(guide[0], title(m)))}">${l.hire} \u2192</a>` : ""}
   ${canWrite ? `<button class="growth-secondary" data-quick-status="${m.status === "done" ? "planned" : blocked ? "in_progress" : "done"}">${m.status === "done" ? esc3(t2("planned")) : blocked ? l.start : l.complete}</button><label><span class="sr-only">${esc3(t2("status"))}</span><select data-status-change>${["planned", "in_progress", "done", "postponed"].map((value) => `<option value="${value}" ${m.status === value ? "selected" : ""}>${esc3(t2(value))}</option>`).join("")}</select></label><button class="growth-secondary" data-edit>${esc3(t2("edit"))}</button>` : ""}
   ${canAsk ? `<button class="growth-secondary" data-ask-task>${l.askTask}</button>` : ""}</div>`;
  }
  async function ask(question, missionId) {
    const response = host.querySelector(".growth-answer");
    response.textContent = "\u2026";
    try {
      response.textContent = await onAsk(question, missionId);
    } catch (error) {
      response.textContent = error.message;
    }
  }
  host.querySelectorAll("[data-node]").forEach((button2) => button2.onclick = () => onSelect(button2.dataset.node));
  host.querySelectorAll("[data-view]").forEach((button2) => button2.onclick = () => onView(button2.dataset.view));
  host.querySelector("[data-refresh]")?.addEventListener("click", onGenerate);
  host.querySelector("[data-edit]")?.addEventListener("click", () => onEdit(selected));
  host.querySelector("[data-quick-status]")?.addEventListener("click", (event) => {
    const input = host.querySelector("[data-status-change]");
    input.value = event.currentTarget.dataset.quickStatus;
    onSave(selected, input);
  });
  host.querySelector("[data-status-change]")?.addEventListener("change", (event) => onSave(selected, event.target));
  host.querySelector("[data-ask-task]")?.addEventListener("click", () => ask("", selected.id));
  host.querySelector(".growth-auri form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget, submit = form.querySelector("button");
    submit.disabled = true;
    try {
      await ask(new FormData(form).get("question"));
    } finally {
      submit.disabled = false;
    }
  });
}

// src/hub/menu-drafts.js
var esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
async function renderMenuDrafts({ host, api: api2, endpoint: endpoint2, profile, canWrite }) {
  let selected = null, working = null;
  const base = endpoint2("menu-drafts");
  function message(text) {
    host.querySelector("#menu-save-status").textContent = text;
  }
  function newDraft() {
    return { fields: { businessName: profile.name || "", currency: ["TRY", "EUR", "USD", "TND"].includes(profile.currency) ? profile.currency : "TRY", menuLanguage: "en", templateId: "modern" }, categories: [] };
  }
  function download2() {
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, draft: read() }, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = "auramenu-draft.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }
  function read() {
    const next = structuredClone(working);
    next.fields.businessName = host.querySelector("#private-menu-name").value;
    next.fields.currency = host.querySelector("#private-menu-currency").value;
    next.fields.menuLanguage = host.querySelector("#private-menu-language").value;
    next.categories = [...host.querySelectorAll("[data-draft-category]")].map((element, i) => ({ ...next.categories[i], name: element.querySelector("[data-category-name]").value, items: [...element.querySelectorAll("[data-draft-item]")].map((row, j) => ({ ...next.categories[i].items[j], name: row.querySelector("[data-product-name]").value, price: row.querySelector("[data-product-price]").value, description: row.querySelector("[data-product-description]").value })) }));
    return next;
  }
  function preview() {
    const value = read(), container = host.querySelector("#private-menu-preview");
    container.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = value.fields.businessName || "Your restaurant";
    container.append(heading);
    for (const category of value.categories) {
      const h = document.createElement("h4");
      h.textContent = category.name || "Unnamed category";
      container.append(h);
      for (const item of category.items) {
        const p = document.createElement("p");
        p.textContent = [item.name || "Unnamed product", item.price || "Price missing", value.fields.currency].join(" \xB7 ");
        container.append(p);
      }
    }
  }
  async function refresh() {
    const response = await api2(base), select2 = host.querySelector("#private-menu-list");
    select2.innerHTML = '<option value="">Choose a saved draft</option>' + response.drafts.map((menu) => `<option value="${esc(menu.id)}" ${menu.id === selected?.id ? "selected" : ""}>${esc(menu.draft.fields.businessName || "Untitled menu")} \xB7 ${esc(menu.state)} \xB7 v${menu.version}</option>`).join("");
  }
  function editor() {
    const value = working;
    host.querySelector("#private-menu-editor").innerHTML = `<p>Private ${esc(selected?.state || "draft")} \xB7 ${selected ? "Version " + selected.version : "Not saved"}. Saving never purchases or publishes a menu.</p><fieldset ${canWrite ? "" : "disabled"}><div class="form-grid"><label class="field">Restaurant name<input id="private-menu-name" maxlength="100" value="${esc(value.fields.businessName)}"></label><label class="field">Currency<select id="private-menu-currency">${["TRY", "EUR", "USD", "TND"].map((c) => `<option ${c === value.fields.currency ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="field">Menu language<select id="private-menu-language">${[["en", "English"], ["tr", "Turkish"], ["ar", "Arabic"]].map(([code, label]) => `<option value="${code}" ${code === value.fields.menuLanguage ? "selected" : ""}>${label}</option>`).join("")}</select></label></div><div id="private-menu-categories">${value.categories.map((category, i) => `<section class="panel" data-draft-category="${i}"><label class="field">Category name<input data-category-name maxlength="80" value="${esc(category.name)}"></label>${category.items.map((item, j) => `<div data-draft-item="${j}" class="form-grid"><label class="field">Product<input data-product-name maxlength="100" value="${esc(item.name)}"></label><label class="field">Price<input data-product-price maxlength="40" value="${esc(item.price)}" inputmode="decimal"></label><label class="field">Description<input data-product-description maxlength="300" value="${esc(item.description)}"></label><button class="secondary" type="button" data-remove-product="${i}:${j}">Remove product</button></div>`).join("")}<button class="secondary" type="button" data-add-draft-product="${i}" ${category.items.length >= 20 ? "disabled" : ""}>Add product</button></section>`).join("")}</div><div class="actions"><button id="private-menu-category" type="button" class="secondary" ${value.categories.length >= 12 ? "disabled" : ""}>Add category</button><button id="private-menu-save" type="button" class="primary">Save private draft</button>${selected ? '<button id="private-menu-archive" type="button" class="secondary">Archive draft</button>' : ""}</div></fieldset><p id="menu-save-status" role="status" aria-live="polite"></p><button id="private-menu-export" type="button" class="secondary">Download draft JSON</button><aside class="panel" id="private-menu-preview" aria-label="Private content preview"></aside>`;
    host.querySelector("#private-menu-editor").oninput = preview;
    host.querySelector("#private-menu-export").onclick = download2;
    host.querySelector("#private-menu-category").onclick = () => {
      working = read();
      working.categories.push({ name: "", emoji: "", items: [] });
      editor();
    };
    host.querySelectorAll("[data-add-draft-product]").forEach((button2) => button2.onclick = () => {
      working = read();
      working.categories[Number(button2.dataset.addDraftProduct)].items.push({ name: "", price: "", description: "", imageUrl: "", featured: false });
      editor();
    });
    host.querySelectorAll("[data-remove-product]").forEach((button2) => button2.onclick = () => {
      const [i, j] = button2.dataset.removeProduct.split(":").map(Number);
      working = read();
      working.categories[i].items.splice(j, 1);
      editor();
    });
    async function save(state = "draft") {
      const controls = [...host.querySelectorAll("#private-menu-editor button")];
      controls.forEach((b) => b.disabled = true);
      message("Saving\u2026");
      try {
        const value2 = read(), body = { draft: value2, state, ...selected ? { version: selected.version } : {} };
        const response = await api2(base + (selected ? "/" + selected.id : ""), selected ? "PUT" : "POST", body);
        selected = response.menu;
        working = structuredClone(selected.draft);
        editor();
        message("Saved privately. No payment or publication occurred.");
        await refresh();
      } catch (error) {
        message(error.status === 409 ? "Draft changed in another session. Download your current draft before reloading the saved copy." : error.message);
      } finally {
        controls.forEach((b) => b.disabled = false);
      }
    }
    host.querySelector("#private-menu-save").onclick = () => save("draft");
    host.querySelector("#private-menu-archive")?.addEventListener("click", () => save("archived"));
    preview();
  }
  host.innerHTML = `<section class="panel"><h2>AuraMenu private drafts</h2><p>Create or continue a menu using your saved business profile. Drafts are visible only to authorized members of this business. Prices and descriptions must come from your business; no payment or publishing happens here.</p><label class="field">Saved menus<select id="private-menu-list"><option>Loading\u2026</option></select></label>${canWrite ? '<button id="private-menu-new" class="secondary" type="button">New private draft</button>' : ""}<div id="private-menu-editor"></div></section>`;
  working = newDraft();
  editor();
  await refresh();
  host.querySelector("#private-menu-new")?.addEventListener("click", () => {
    selected = null;
    working = newDraft();
    editor();
  });
  host.querySelector("#private-menu-list").onchange = async (event) => {
    if (!event.target.value) return;
    try {
      const response = await api2(base + "/" + encodeURIComponent(event.target.value));
      selected = response.menu;
      working = structuredClone(selected.draft);
      editor();
    } catch (error) {
      message(error.message);
    }
  };
}

// src/hub/i18n.js
var copy2 = {
  en: { brand: "Business Hub", tag: "Understand. Build. Collaborate. Grow.", welcome: "Welcome to AuraDigital.", choose: "How would you like to build your business journey?", myself: "Build Myself", myselfText: "Set your goals, explore services and shape your own roadmap.", auri: "Build With AURI", auriText: "Take a guided journey, one short question at a time.", home: "Overview", profile: "Business Profile", journey: "Business Journey", simulator: "Growth Simulator", assistant: "AURI Assistant", reports: "Reports & Analytics", projects: "Projects", websites: "My Websites", services: "My Services", hosting: "Domains & Hosting", files: "Files & Documents", orders: "Shop & Orders", invoices: "Invoices & Payments", rewards: "Rewards", team: "Team Members", support: "Support", settings: "Settings", grow: "GROW", manage: "MANAGE", account: "ACCOUNT", menu: "Menu", close: "Close", save: "Save", saved: "Saved", saving: "Saving\u2026", continue: "Continue", back: "Back", skip: "Skip", signIn: "Sign In", signup: "Create Account", email: "Email", password: "Password", name: "Full name", terms: "I accept the account conditions and use of my details to manage my account.", google: "Continue with Google", forgot: "Forgot password?", logout: "Log Out", verify: "Verify email", verifyLater: "You can draft your profile and roadmap now. Verify your email before billing, team invitations or shared private access.", sendVerification: "Send verification link", reset: "Reset password", resetSent: "If an eligible account exists, a reset link will be sent.", newPassword: "New password", confirm: "Confirm", cancel: "Cancel", error: "Something went wrong. Please try again.", noData: "No measured data is connected yet.", next: "Your next step", readiness: "Capability readiness", progress: "Roadmap progress", level: "Level", foundation: "Foundation", visibility: "Visibility", conversion: "Conversion", automation: "Automation", scale: "Scale", createJourney: "Generate my roadmap", noPurchase: "Complete missions using any provider or your own work. AuraDigital purchases are optional.", quote: "Scope & quote required", planned: "Planned", in_progress: "In progress", done: "Done", postponed: "Postponed", up: "Move earlier", down: "Move later", edit: "Edit", objective: "Objective", description: "Description", nextAction: "Next action", why: "Recommended because this capability has not been reported in your profile.", benefit: "Potential improvement; compare results against your own baseline.", assumptions: "Assumptions, not guarantees", calculate: "Calculate scenarios", scenarioName: "Scenario name", saveScenario: "Save scenario", export: "Export JSON", history: "Saved scenarios", conservative: "Conservative", base: "Base", ambitious: "Ambitious", visits: "Monthly website visits", leads: "Monthly website leads", closeRate: "Lead-to-customer conversion (%)", customerValue: "Revenue per customer in this period", margin: "Contribution margin (%)", monthlyCost: "Monthly service cost", setupCost: "One-time setup cost", trafficLift: "Traffic increase (%)", leadRateLift: "Lead-rate increase (%)", closeRateLift: "Closing-rate increase (%)", customers: "Additional customers", revenue: "Additional monthly revenue", profit: "Additional contribution profit", net: "Net monthly contribution after service cost", roi: "First-year ROI", payback: "Setup payback (months)", na: "Not applicable", simNotice: "Illustrative estimates. Enter combined changes once per funnel stage to avoid counting the same benefit twice. Rates are capped at 100%. Costs and revenue must use the same currency and period. Taxes, fixed overhead and financing are excluded.", formula: "Customers = visits \xD7 lead rate \xD7 closing rate. Contribution = additional revenue \xD7 margin. First-year ROI = (12 \xD7 additional contribution \u2212 setup \u2212 12 \xD7 monthly costs) \xF7 (setup + 12 \xD7 monthly costs). Payback = setup \xF7 net monthly contribution, where positive.", teamTitle: "Grow together with your team.", teamText: "Invite trusted people to help manage your business. Each additional member gets their own secure access for $5 USD/month, paid by that member.", blocked: "Live recurring checkout is BLOCKED until billing, taxes, signed webhooks and cancellation terms are configured and verified. Invitations do not grant access or charge anyone.", invite: "Invite Member", role: "Role", message: "Optional invitation message", status: "Status", subscription: "Subscription", paymentDate: "Next payment", remove: "Remove access", removeConfirm: "Immediately revoke this member\u2019s business access? Their personal account and shared business data will be preserved.", cancelInvite: "Cancel invitation", resend: "Replace & resend", inviteAccept: "Accept invitation", recurringConsent: "I accept this invitation and the $5 USD monthly recurring subscription for my own access. Checkout is currently blocked; I will not be charged and access will remain pending.", awaiting: "Awaiting payment", permissions: "Permissions", activity: "Access activity", unavailable: "This integration is not connected to your verified workspace yet.", legacy: "Your existing accounts, products and orders remain available through their existing authorized workflows.", openAccount: "Open my account & orders", contact: "Contact support", aiRules: "AURI guided tools", aiNotice: "Rules-based guidance is available. Generative business advice and private invoice/project tools are not integrated yet.", diagnosis: "Business diagnosis", recommend: "Recommend my next action", strengths: "Reported strengths", missing: "Missing capabilities", source: "Source: customer-entered profile", businessName: "Business name", industry: "Industry", country: "Country", city: "City", stage: "Business stage", website: "Website (HTTPS)", tools: "Existing digital tools", acquisition: "How do customers find you?", difficulties: "Main difficulties", goals: "Business goals", budget: "Approximate budget (optional)", currency: "Currency", timeline: "Desired timeline", industryDetails: "Industry details", capabilities: "Capabilities you already have", restaurant: "Restaurant", ecommerce: "E-commerce", real_estate: "Real estate", other: "Other", servicesIndustry: "Service business", restaurantQuestion: "How do guests discover you, view your menu and make reservations?", ecommerceQuestion: "How do you manage your catalog, checkout and repeat purchases?", realEstateQuestion: "How do you list properties, capture inquiries and follow up?", servicesQuestion: "How do customers book, receive quotes and pay?", otherQuestion: "Describe how you serve customers.", newWorkspace: "New business", switchMode: "Switch onboarding mode", verified: "Email verified", owner: "Owner", admin: "Admin", member: "Member", viewer: "Viewer", readOnly: "Read-only access", supportText: "Send a support request through the existing contact form.", verifiedRequired: "Verify your email to manage team access.", empty: "Nothing here yet.", billingPrivate: "Each member\u2019s payment details stay private. This page shows access status only.", security: "Security settings", linkGoogle: "Link my verified Google identity", rename: "Save changes", refresh: "Reload", serviceNote: "Explore current services and request a scope-specific quote.", openServices: "Explore services", reportNote: "Traffic, revenue, actual-versus-projected reports and rewards cannot be displayed until trustworthy sources and a valid loyalty ledger are connected." },
  fr: { brand: "Espace entreprise", tag: "Comprendre. Construire. Collaborer. Grandir.", welcome: "Bienvenue chez AuraDigital.", choose: "Comment souhaitez-vous construire votre parcours ?", myself: "Construire moi-m\xEAme", myselfText: "D\xE9finissez vos objectifs et cr\xE9ez votre feuille de route.", auri: "Construire avec AURI", auriText: "Avancez avec des questions courtes et adapt\xE9es.", home: "Vue d\u2019ensemble", profile: "Profil entreprise", journey: "Parcours entreprise", simulator: "Simulateur de croissance", assistant: "Assistant AURI", reports: "Rapports et analyses", projects: "Projets", websites: "Mes sites", services: "Mes services", hosting: "Domaines et h\xE9bergement", files: "Fichiers et documents", orders: "Boutique et commandes", invoices: "Factures et paiements", rewards: "R\xE9compenses", team: "Membres de l\u2019\xE9quipe", support: "Assistance", settings: "Param\xE8tres", grow: "D\xC9VELOPPER", manage: "G\xC9RER", account: "COMPTE", menu: "Menu", close: "Fermer", save: "Enregistrer", saved: "Enregistr\xE9", saving: "Enregistrement\u2026", continue: "Continuer", back: "Retour", skip: "Passer", signIn: "Se connecter", signup: "Cr\xE9er un compte", email: "E-mail", password: "Mot de passe", name: "Nom complet", terms: "J\u2019accepte les conditions du compte et l\u2019utilisation de mes donn\xE9es pour sa gestion.", google: "Continuer avec Google", forgot: "Mot de passe oubli\xE9 ?", logout: "Se d\xE9connecter", verify: "V\xE9rifier l\u2019e-mail", verifyLater: "Cr\xE9ez votre profil et votre parcours maintenant. V\xE9rifiez votre e-mail avant les paiements, invitations ou acc\xE8s priv\xE9s partag\xE9s.", sendVerification: "Envoyer le lien de v\xE9rification", reset: "R\xE9initialiser le mot de passe", newPassword: "Nouveau mot de passe", confirm: "Confirmer", cancel: "Annuler", error: "Une erreur est survenue. R\xE9essayez.", next: "Votre prochaine \xE9tape", readiness: "Capacit\xE9s d\xE9clar\xE9es", progress: "Avancement du parcours", level: "Niveau", foundation: "Fondations", visibility: "Visibilit\xE9", conversion: "Conversion", automation: "Automatisation", scale: "Expansion", createJourney: "G\xE9n\xE9rer mon parcours", noPurchase: "R\xE9alisez vos missions avec le prestataire de votre choix ou vous-m\xEAme. Aucun achat AuraDigital obligatoire.", quote: "Devis n\xE9cessaire", planned: "Pr\xE9vu", in_progress: "En cours", done: "Termin\xE9", postponed: "Report\xE9", up: "Avancer", down: "Reculer", edit: "Modifier", objective: "Objectif", description: "Description", nextAction: "Prochaine action", why: "Recommand\xE9 car cette capacit\xE9 ne figure pas dans votre profil.", benefit: "Am\xE9lioration possible \xE0 comparer \xE0 vos propres r\xE9sultats.", assumptions: "Hypoth\xE8ses, sans garantie", calculate: "Calculer les sc\xE9narios", scenarioName: "Nom du sc\xE9nario", saveScenario: "Enregistrer le sc\xE9nario", export: "Exporter JSON", history: "Sc\xE9narios enregistr\xE9s", conservative: "Prudent", base: "Central", ambitious: "Ambitieux", visits: "Visites mensuelles du site", leads: "Prospects mensuels du site", closeRate: "Conversion prospect-client (%)", customerValue: "Revenu par client sur la p\xE9riode", margin: "Marge contributive (%)", monthlyCost: "Co\xFBt mensuel des services", setupCost: "Co\xFBt initial", trafficLift: "Hausse du trafic (%)", leadRateLift: "Hausse du taux de prospects (%)", closeRateLift: "Hausse du taux de conversion (%)", customers: "Clients suppl\xE9mentaires", revenue: "Revenu mensuel suppl\xE9mentaire", profit: "Contribution suppl\xE9mentaire", net: "Contribution nette apr\xE8s services", roi: "ROI de la premi\xE8re ann\xE9e", payback: "D\xE9lai de retour initial (mois)", na: "Non applicable", teamTitle: "D\xE9veloppez votre entreprise ensemble.", teamText: "Invitez votre \xE9quipe. Chaque membre suppl\xE9mentaire paie son propre abonnement de 5 USD par mois.", blocked: "Paiement r\xE9current BLOQU\xC9 en attendant la configuration et la validation du prestataire, des taxes, des webhooks et des conditions d\u2019annulation. Une invitation ne donne aucun acc\xE8s et ne d\xE9bite rien.", invite: "Inviter un membre", role: "R\xF4le", message: "Message facultatif", status: "Statut", subscription: "Abonnement", paymentDate: "Prochain paiement", remove: "R\xE9voquer l\u2019acc\xE8s", removeConfirm: "R\xE9voquer imm\xE9diatement cet acc\xE8s ? Le compte personnel et les donn\xE9es partag\xE9es seront conserv\xE9s.", cancelInvite: "Annuler l\u2019invitation", resend: "Remplacer et renvoyer", inviteAccept: "Accepter l\u2019invitation", recurringConsent: "J\u2019accepte l\u2019invitation et l\u2019abonnement r\xE9current de 5 USD par mois pour mon acc\xE8s personnel. Le paiement est bloqu\xE9 : aucun d\xE9bit ni acc\xE8s avant validation.", awaiting: "En attente de paiement", permissions: "Autorisations", activity: "Activit\xE9 des acc\xE8s", unavailable: "Cette int\xE9gration n\u2019est pas encore reli\xE9e \xE0 votre espace v\xE9rifi\xE9.", legacy: "Vos comptes, produits et commandes existants restent disponibles dans leurs parcours autoris\xE9s.", openAccount: "Mon compte et mes commandes", contact: "Contacter l\u2019assistance", aiRules: "Outils guid\xE9s AURI", aiNotice: "Conseils fond\xE9s sur des r\xE8gles disponibles. Les conseils g\xE9n\xE9ratifs et les outils priv\xE9s de facturation/projet ne sont pas encore int\xE9gr\xE9s.", diagnosis: "Diagnostic entreprise", recommend: "Recommander la prochaine action", strengths: "Points forts d\xE9clar\xE9s", missing: "Capacit\xE9s manquantes", source: "Source : profil renseign\xE9 par le client", businessName: "Nom de l\u2019entreprise", industry: "Secteur", country: "Pays", city: "Ville", stage: "Stade de d\xE9veloppement", website: "Site web (HTTPS)", tools: "Outils num\xE9riques existants", acquisition: "Comment trouvez-vous vos clients ?", difficulties: "Difficult\xE9s principales", goals: "Objectifs", budget: "Budget approximatif (facultatif)", currency: "Devise", timeline: "D\xE9lai souhait\xE9", industryDetails: "Pr\xE9cisions sur votre secteur", capabilities: "Capacit\xE9s d\xE9j\xE0 disponibles", restaurant: "Restaurant", ecommerce: "Commerce en ligne", real_estate: "Immobilier", other: "Autre", servicesIndustry: "Entreprise de services", restaurantQuestion: "Comment vos clients vous trouvent-ils, consultent-ils le menu et r\xE9servent-ils ?", ecommerceQuestion: "Comment g\xE9rez-vous le catalogue, les paiements et les achats r\xE9p\xE9t\xE9s ?", realEstateQuestion: "Comment publiez-vous les biens et suivez-vous les demandes ?", servicesQuestion: "Comment g\xE9rez-vous r\xE9servations, devis et paiements ?", otherQuestion: "Comment servez-vous vos clients ?", newWorkspace: "Nouvelle entreprise", switchMode: "Changer de mode", verified: "E-mail v\xE9rifi\xE9", owner: "Propri\xE9taire", admin: "Administrateur", member: "Membre", viewer: "Lecteur", readOnly: "Lecture seule", verifiedRequired: "V\xE9rifiez votre e-mail pour g\xE9rer l\u2019\xE9quipe.", empty: "Aucun \xE9l\xE9ment pour le moment.", billingPrivate: "Les d\xE9tails de paiement de chaque membre restent priv\xE9s.", security: "Param\xE8tres de s\xE9curit\xE9", linkGoogle: "Associer mon compte Google v\xE9rifi\xE9", rename: "Enregistrer les modifications", refresh: "Recharger", serviceNote: "D\xE9couvrez nos services et demandez un devis adapt\xE9.", openServices: "D\xE9couvrir les services", reportNote: "Les rapports et r\xE9compenses n\xE9cessitent des sources fiables et un registre de fid\xE9lit\xE9 connect\xE9." },
  tr: { brand: "\u0130\u015Fletme Merkezi", tag: "Anla. Kur. Birlikte \xE7al\u0131\u015F. B\xFCy\xFC.", welcome: "AuraDigital\u2019e ho\u015F geldiniz.", choose: "\u0130\u015Fletme yolculu\u011Funuzu nas\u0131l olu\u015Fturmak istersiniz?", myself: "Kendim Olu\u015Fturay\u0131m", myselfText: "Hedeflerinizi belirleyin ve yol haritan\u0131z\u0131 olu\u015Fturun.", auri: "AURI ile Olu\u015Ftur", auriText: "K\u0131sa, ilgili sorularla ad\u0131m ad\u0131m ilerleyin.", home: "Genel Bak\u0131\u015F", profile: "\u0130\u015Fletme Profili", journey: "\u0130\u015Fletme Yolculu\u011Fu", simulator: "B\xFCy\xFCme Sim\xFClat\xF6r\xFC", assistant: "AURI Asistan\u0131", reports: "Raporlar ve Analiz", projects: "Projeler", websites: "Web Sitelerim", services: "Hizmetlerim", hosting: "Alan Ad\u0131 ve Hosting", files: "Dosyalar ve Belgeler", orders: "Ma\u011Faza ve Sipari\u015Fler", invoices: "Faturalar ve \xD6demeler", rewards: "\xD6d\xFCller", team: "Ekip \xDCyeleri", support: "Destek", settings: "Ayarlar", grow: "B\xDCY\xDC", manage: "Y\xD6NET", account: "HESAP", menu: "Men\xFC", close: "Kapat", save: "Kaydet", saved: "Kaydedildi", saving: "Kaydediliyor\u2026", continue: "Devam", back: "Geri", skip: "Atla", signIn: "Giri\u015F Yap", signup: "Hesap Olu\u015Ftur", email: "E-posta", password: "\u015Eifre", name: "Ad soyad", terms: "Hesap ko\u015Fullar\u0131n\u0131 ve bilgilerimin hesab\u0131m\u0131 y\xF6netmek i\xE7in kullan\u0131lmas\u0131n\u0131 kabul ediyorum.", google: "Google ile devam et", forgot: "\u015Eifremi unuttum", logout: "\xC7\u0131k\u0131\u015F Yap", verify: "E-postay\u0131 do\u011Frula", verifyLater: "Profil ve yol haritas\u0131 tasla\u011F\u0131 olu\u015Fturabilirsiniz. \xD6deme, ekip daveti ve \xF6zel payla\u015F\u0131ml\u0131 eri\u015Fim \xF6ncesinde e-postan\u0131z\u0131 do\u011Frulay\u0131n.", sendVerification: "Do\u011Frulama ba\u011Flant\u0131s\u0131 g\xF6nder", reset: "\u015Eifreyi s\u0131f\u0131rla", newPassword: "Yeni \u015Fifre", confirm: "Onayla", cancel: "\u0130ptal", error: "Bir hata olu\u015Ftu. Tekrar deneyin.", next: "Sonraki ad\u0131m\u0131n\u0131z", readiness: "Bildirilen yetkinlikler", progress: "Yol haritas\u0131 ilerlemesi", level: "Seviye", foundation: "Temel", visibility: "G\xF6r\xFCn\xFCrl\xFCk", conversion: "D\xF6n\xFC\u015F\xFCm", automation: "Otomasyon", scale: "\xD6l\xE7ekleme", createJourney: "Yol haritam\u0131 olu\u015Ftur", noPurchase: "G\xF6revleri kendiniz veya istedi\u011Finiz sa\u011Flay\u0131c\u0131yla tamamlay\u0131n. AuraDigital\u2019den sat\u0131n alma zorunlu de\u011Fildir.", quote: "Kapsam ve teklif gerekli", planned: "Planland\u0131", in_progress: "Devam ediyor", done: "Tamamland\u0131", postponed: "Ertelendi", up: "\xD6ne ta\u015F\u0131", down: "Geri ta\u015F\u0131", edit: "D\xFCzenle", objective: "Hedef", description: "A\xE7\u0131klama", nextAction: "Sonraki i\u015Flem", why: "Bu yetkinlik profilinizde bildirilmedi\u011Fi i\xE7in \xF6nerildi.", benefit: "Olas\u0131 iyile\u015Fme; kendi ba\u015Flang\u0131\xE7 verinizle kar\u015F\u0131la\u015Ft\u0131r\u0131n.", assumptions: "Varsay\u0131mlar, garanti de\u011Fildir", calculate: "Senaryolar\u0131 hesapla", scenarioName: "Senaryo ad\u0131", saveScenario: "Senaryoyu kaydet", export: "JSON d\u0131\u015Fa aktar", history: "Kay\u0131tl\u0131 senaryolar", conservative: "Temkinli", base: "Temel", ambitious: "\u0130ddial\u0131", visits: "Ayl\u0131k site ziyareti", leads: "Ayl\u0131k site potansiyel m\xFC\u015Fterisi", closeRate: "M\xFC\u015Fteriye d\xF6n\xFC\u015F\xFCm (%)", customerValue: "D\xF6nemde m\xFC\u015Fteri ba\u015F\u0131na gelir", margin: "Katk\u0131 marj\u0131 (%)", monthlyCost: "Ayl\u0131k hizmet maliyeti", setupCost: "Ba\u015Flang\u0131\xE7 maliyeti", trafficLift: "Trafik art\u0131\u015F\u0131 (%)", leadRateLift: "Potansiyel m\xFC\u015Fteri oran\u0131 art\u0131\u015F\u0131 (%)", closeRateLift: "Sat\u0131\u015F d\xF6n\xFC\u015F\xFCm oran\u0131 art\u0131\u015F\u0131 (%)", customers: "Ek m\xFC\u015Fteri", revenue: "Ek ayl\u0131k gelir", profit: "Ek katk\u0131 k\xE2r\u0131", net: "Hizmet maliyeti sonras\u0131 net katk\u0131", roi: "\u0130lk y\u0131l yat\u0131r\u0131m getirisi", payback: "Ba\u015Flang\u0131\xE7 geri \xF6deme s\xFCresi (ay)", na: "Uygulanamaz", teamTitle: "Ekibinizle birlikte b\xFCy\xFCy\xFCn.", teamText: "G\xFCvendi\u011Finiz ki\u015Fileri davet edin. Her ek \xFCye kendi eri\u015Fimi i\xE7in ayda 5 USD \xF6der.", blocked: "Sa\u011Flay\u0131c\u0131, vergiler, imzal\u0131 webhook ve iptal ko\u015Fullar\u0131 yap\u0131land\u0131r\u0131l\u0131p do\u011Frulanana kadar canl\u0131 abonelik \xF6demesi ENGELL\u0130D\u0130R. Davet eri\u015Fim sa\u011Flamaz ve \xFCcret almaz.", invite: "\xDCye Davet Et", role: "Rol", message: "\u0130ste\u011Fe ba\u011Fl\u0131 davet mesaj\u0131", status: "Durum", subscription: "Abonelik", paymentDate: "Sonraki \xF6deme", remove: "Eri\u015Fimi kald\u0131r", removeConfirm: "Bu \xFCyenin i\u015Fletme eri\u015Fimi hemen kald\u0131r\u0131ls\u0131n m\u0131? Ki\u015Fisel hesab\u0131 ve ortak i\u015Fletme verileri korunur.", cancelInvite: "Daveti iptal et", resend: "Yenile ve yeniden g\xF6nder", inviteAccept: "Daveti kabul et", recurringConsent: "Daveti ve ki\u015Fisel eri\u015Fimim i\xE7in ayl\u0131k 5 USD yinelenen aboneli\u011Fi kabul ediyorum. \xD6deme \u015Fu anda engelli; \xFCcret al\u0131nmaz ve eri\u015Fim beklemede kal\u0131r.", awaiting: "\xD6deme bekleniyor", permissions: "\u0130zinler", activity: "Eri\u015Fim hareketleri", unavailable: "Bu entegrasyon do\u011Frulanm\u0131\u015F \xE7al\u0131\u015Fma alan\u0131n\u0131za hen\xFCz ba\u011Fl\u0131 de\u011Fil.", legacy: "Mevcut hesaplar\u0131n\u0131z, \xFCr\xFCnleriniz ve sipari\u015Fleriniz kendi yetkili ak\u0131\u015Flar\u0131nda kullan\u0131labilir.", openAccount: "Hesab\u0131m ve sipari\u015Flerim", contact: "Destek ile ileti\u015Fim", aiRules: "AURI rehber ara\xE7lar\u0131", aiNotice: "Kural tabanl\u0131 rehberlik kullan\u0131labilir. \xDCretken i\u015Fletme \xF6nerileri ile \xF6zel fatura ve proje ara\xE7lar\u0131 hen\xFCz entegre de\u011Fil.", diagnosis: "\u0130\u015Fletme analizi", recommend: "Sonraki ad\u0131m\u0131 \xF6ner", strengths: "Bildirilen g\xFC\xE7l\xFC y\xF6nler", missing: "Eksik yetkinlikler", source: "Kaynak: m\xFC\u015Fteri taraf\u0131ndan girilen profil", businessName: "\u0130\u015Fletme ad\u0131", industry: "Sekt\xF6r", country: "\xDClke", city: "\u015Eehir", stage: "\u0130\u015Fletme a\u015Famas\u0131", website: "Web sitesi (HTTPS)", tools: "Mevcut dijital ara\xE7lar", acquisition: "M\xFC\u015Fteriler sizi nas\u0131l buluyor?", difficulties: "Ba\u015Fl\u0131ca zorluklar", goals: "\u0130\u015Fletme hedefleri", budget: "Yakla\u015F\u0131k b\xFCt\xE7e (iste\u011Fe ba\u011Fl\u0131)", currency: "Para birimi", timeline: "Hedeflenen zaman", industryDetails: "Sekt\xF6r ayr\u0131nt\u0131lar\u0131", capabilities: "Mevcut yetkinlikleriniz", restaurant: "Restoran", ecommerce: "E-ticaret", real_estate: "Gayrimenkul", other: "Di\u011Fer", servicesIndustry: "Hizmet i\u015Fletmesi", restaurantQuestion: "Misafirler sizi nas\u0131l buluyor, men\xFCy\xFC g\xF6r\xFCyor ve rezervasyon yap\u0131yor?", ecommerceQuestion: "Katalo\u011Fu, \xF6demeyi ve tekrar al\u0131\u015Fveri\u015Fi nas\u0131l y\xF6netiyorsunuz?", realEstateQuestion: "\u0130lan, m\xFC\u015Fteri talebi ve takibi nas\u0131l y\xF6netiyorsunuz?", servicesQuestion: "Randevu, teklif ve \xF6demeler nas\u0131l y\xF6netiliyor?", otherQuestion: "M\xFC\u015Fterilere nas\u0131l hizmet veriyorsunuz?", newWorkspace: "Yeni i\u015Fletme", switchMode: "Rehberlik modunu de\u011Fi\u015Ftir", verified: "E-posta do\u011Fruland\u0131", owner: "Sahip", admin: "Y\xF6netici", member: "\xDCye", viewer: "G\xF6r\xFCnt\xFCleyici", readOnly: "Salt okunur", verifiedRequired: "Ekibi y\xF6netmek i\xE7in e-postan\u0131z\u0131 do\u011Frulay\u0131n.", empty: "Hen\xFCz kay\u0131t yok.", billingPrivate: "Her \xFCyenin \xF6deme bilgileri gizli kal\u0131r.", security: "G\xFCvenlik ayarlar\u0131", linkGoogle: "Do\u011Frulanm\u0131\u015F Google hesab\u0131m\u0131 ba\u011Fla", rename: "De\u011Fi\u015Fiklikleri kaydet", refresh: "Yenile", serviceNote: "Hizmetleri inceleyin ve i\u015Fletmenize \xF6zel teklif isteyin.", openServices: "Hizmetleri ke\u015Ffet", reportNote: "Raporlar ve \xF6d\xFCller i\xE7in g\xFCvenilir veri kaynaklar\u0131 ve do\u011Frulanm\u0131\u015F sadakat defteri ba\u011Flanmal\u0131d\u0131r." },
  ar: { brand: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", tag: "\u0627\u0641\u0647\u0645. \u0627\u0628\u0646\u0650. \u062A\u0639\u0627\u0648\u0646. \u0627\u0646\u0645\u064F.", welcome: "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643 \u0641\u064A AuraDigital.", choose: "\u0643\u064A\u0641 \u062A\u0631\u064A\u062F \u0628\u0646\u0627\u0621 \u0631\u062D\u0644\u0629 \u0646\u0645\u0648 \u0623\u0639\u0645\u0627\u0644\u0643\u061F", myself: "\u0623\u0628\u0646\u064A \u0628\u0646\u0641\u0633\u064A", myselfText: "\u062D\u062F\u062F \u0623\u0647\u062F\u0627\u0641\u0643 \u0648\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0635\u0645\u0645 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643.", auri: "\u0623\u0628\u0646\u064A \u0645\u0639 AURI", auriText: "\u0627\u0628\u062F\u0623 \u0631\u062D\u0644\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0628\u0633\u0624\u0627\u0644 \u0642\u0635\u064A\u0631 \u0641\u064A \u0643\u0644 \u062E\u0637\u0648\u0629.", home: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", profile: "\u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", journey: "\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", simulator: "\u0645\u062D\u0627\u0643\u064A \u0627\u0644\u0646\u0645\u0648", assistant: "\u0645\u0633\u0627\u0639\u062F AURI", reports: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", projects: "\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", websites: "\u0645\u0648\u0627\u0642\u0639\u064A", services: "\u062E\u062F\u0645\u0627\u062A\u064A", hosting: "\u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629", files: "\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A", orders: "\u0627\u0644\u0645\u062A\u062C\u0631 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A", invoices: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A", rewards: "\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A", team: "\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642", support: "\u0627\u0644\u062F\u0639\u0645", settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", grow: "\u0627\u0644\u0646\u0645\u0648", manage: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629", account: "\u0627\u0644\u062D\u0633\u0627\u0628", menu: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", close: "\u0625\u063A\u0644\u0627\u0642", save: "\u062D\u0641\u0638", saved: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638", saving: "\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638\u2026", continue: "\u0645\u062A\u0627\u0628\u0639\u0629", back: "\u0631\u062C\u0648\u0639", skip: "\u062A\u062E\u0637\u064A", signIn: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", signup: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628", email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", name: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", terms: "\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u064A\u0627\u0646\u0627\u062A\u064A \u0644\u0625\u062F\u0627\u0631\u062A\u0647.", google: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google", forgot: "\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F", logout: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C", verify: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F", verifyLater: "\u064A\u0645\u0643\u0646\u0643 \u0625\u0639\u062F\u0627\u062F \u0645\u0644\u0641\u0643 \u0648\u0645\u0633\u0648\u062F\u0629 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643 \u0627\u0644\u0622\u0646. \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0637\u0644\u0648\u0628 \u0642\u0628\u0644 \u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0648\u062F\u0639\u0648\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629.", sendVerification: "\u0625\u0631\u0633\u0627\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u0623\u0643\u064A\u062F", reset: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", newPassword: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", confirm: "\u062A\u0623\u0643\u064A\u062F", cancel: "\u0625\u0644\u063A\u0627\u0621", error: "\u062D\u062F\u062B \u062E\u0637\u0623. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627.", next: "\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", readiness: "\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A", progress: "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", level: "\u0627\u0644\u0645\u0633\u062A\u0648\u0649", foundation: "\u0627\u0644\u0623\u0633\u0627\u0633", visibility: "\u0627\u0644\u0638\u0647\u0648\u0631", conversion: "\u0627\u0644\u062A\u062D\u0648\u064A\u0644", automation: "\u0627\u0644\u0623\u062A\u0645\u062A\u0629", scale: "\u0627\u0644\u062A\u0648\u0633\u0639", createJourney: "\u0625\u0646\u0634\u0627\u0621 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u064A", noPurchase: "\u064A\u0645\u0643\u0646\u0643 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0645\u0647\u0627\u0645 \u0628\u0646\u0641\u0633\u0643 \u0623\u0648 \u0645\u0639 \u0623\u064A \u0645\u0632\u0648\u062F. \u0634\u0631\u0627\u0621 \u062E\u062F\u0645\u0627\u062A AuraDigital \u0627\u062E\u062A\u064A\u0627\u0631\u064A.", quote: "\u064A\u062A\u0637\u0644\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0639\u0631\u0636 \u0633\u0639\u0631", planned: "\u0645\u062E\u0637\u0637", in_progress: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", done: "\u0645\u0643\u062A\u0645\u0644", postponed: "\u0645\u0624\u062C\u0644", up: "\u062A\u0642\u062F\u064A\u0645", down: "\u062A\u0623\u062E\u064A\u0631", edit: "\u062A\u0639\u062F\u064A\u0644", objective: "\u0627\u0644\u0647\u062F\u0641", description: "\u0627\u0644\u0648\u0635\u0641", nextAction: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A", why: "\u0645\u0648\u0635\u0649 \u0628\u0647 \u0644\u0623\u0646 \u0647\u0630\u0647 \u0627\u0644\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0644\u0645 \u062A\u064F\u0630\u0643\u0631 \u0641\u064A \u0645\u0644\u0641 \u0646\u0634\u0627\u0637\u0643.", benefit: "\u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u062A\u0645\u0644\u060C \u064A\u064F\u0642\u0627\u0631\u0646 \u0628\u0646\u062A\u0627\u0626\u062C\u0643 \u0627\u0644\u0641\u0639\u0644\u064A\u0629.", assumptions: "\u0627\u0641\u062A\u0631\u0627\u0636\u0627\u062A \u0648\u0644\u064A\u0633\u062A \u0636\u0645\u0627\u0646\u0627\u062A", calculate: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A", scenarioName: "\u0627\u0633\u0645 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648", saveScenario: "\u062D\u0641\u0638 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648", export: "\u062A\u0635\u062F\u064A\u0631 JSON", history: "\u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629", conservative: "\u0645\u062A\u062D\u0641\u0638", base: "\u0623\u0633\u0627\u0633\u064A", ambitious: "\u0637\u0645\u0648\u062D", visits: "\u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0634\u0647\u0631\u064A\u0629", leads: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0648\u0646 \u0634\u0647\u0631\u064A\u064B\u0627 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", closeRate: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u062D\u0648\u0644 \u0625\u0644\u0649 \u0639\u0645\u064A\u0644 (%)", customerValue: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0644\u0643\u0644 \u0639\u0645\u064A\u0644 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629", margin: "\u0647\u0627\u0645\u0634 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 (%)", monthlyCost: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629", setupCost: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629", trafficLift: "\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A (%)", leadRateLift: "\u0632\u064A\u0627\u062F\u0629 \u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 (%)", closeRateLift: "\u0632\u064A\u0627\u062F\u0629 \u0645\u0639\u062F\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0628\u064A\u0639 (%)", customers: "\u0639\u0645\u0644\u0627\u0621 \u0625\u0636\u0627\u0641\u064A\u0648\u0646", revenue: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0625\u0636\u0627\u0641\u064A", profit: "\u0631\u0628\u062D \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0625\u0636\u0627\u0641\u064A", net: "\u0635\u0627\u0641\u064A \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0628\u0639\u062F \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u062F\u0645\u0629", roi: "\u0627\u0644\u0639\u0627\u0626\u062F \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0644\u0644\u0633\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649", payback: "\u0641\u062A\u0631\u0629 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0625\u0639\u062F\u0627\u062F (\u0623\u0634\u0647\u0631)", na: "\u063A\u064A\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u062A\u0637\u0628\u064A\u0642", teamTitle: "\u0627\u0646\u0645\u064F \u0645\u0639 \u0641\u0631\u064A\u0642\u0643.", teamText: "\u0627\u062F\u0639\u064F \u0623\u0634\u062E\u0627\u0635\u064B\u0627 \u0645\u0648\u062B\u0648\u0642\u064A\u0646 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u064A\u062F\u0641\u0639 \u0643\u0644 \u0639\u0636\u0648 \u0625\u0636\u0627\u0641\u064A \u0627\u0634\u062A\u0631\u0627\u0643\u0647 \u0627\u0644\u062E\u0627\u0635 \u0628\u0642\u064A\u0645\u0629 5 \u062F\u0648\u0644\u0627\u0631\u0627\u062A \u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0634\u0647\u0631\u064A\u064B\u0627.", blocked: "\u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0645\u062D\u0638\u0648\u0631 \u0625\u0644\u0649 \u062D\u064A\u0646 \u0625\u0639\u062F\u0627\u062F \u0645\u0632\u0648\u062F \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0625\u0644\u063A\u0627\u0621. \u0627\u0644\u062F\u0639\u0648\u0629 \u0644\u0627 \u062A\u0645\u0646\u062D \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0644\u0627 \u062A\u062E\u0635\u0645 \u0623\u064A \u0645\u0628\u0644\u063A.", invite: "\u062F\u0639\u0648\u0629 \u0639\u0636\u0648", role: "\u0627\u0644\u062F\u0648\u0631", message: "\u0631\u0633\u0627\u0644\u0629 \u062F\u0639\u0648\u0629 \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629", status: "\u0627\u0644\u062D\u0627\u0644\u0629", subscription: "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643", paymentDate: "\u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", remove: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0648\u0635\u0648\u0644", removeConfirm: "\u0647\u0644 \u062A\u0631\u064A\u062F \u0625\u0644\u063A\u0627\u0621 \u0648\u0635\u0648\u0644 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 \u0641\u0648\u0631\u064B\u0627\u061F \u0633\u064A\u064F\u062D\u062A\u0641\u0638 \u0628\u062D\u0633\u0627\u0628\u0647 \u0627\u0644\u0634\u062E\u0635\u064A \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629.", cancelInvite: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0639\u0648\u0629", resend: "\u062A\u062C\u062F\u064A\u062F \u0648\u0625\u0639\u0627\u062F\u0629 \u0625\u0631\u0633\u0627\u0644", inviteAccept: "\u0642\u0628\u0648\u0644 \u0627\u0644\u062F\u0639\u0648\u0629", recurringConsent: "\u0623\u0642\u0628\u0644 \u0627\u0644\u062F\u0639\u0648\u0629 \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0628\u0642\u064A\u0645\u0629 5 \u062F\u0648\u0644\u0627\u0631\u0627\u062A \u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0644\u0648\u0635\u0648\u0644\u064A \u0627\u0644\u0634\u062E\u0635\u064A. \u0627\u0644\u062F\u0641\u0639 \u0645\u062D\u0638\u0648\u0631 \u062D\u0627\u0644\u064A\u064B\u0627\u061B \u0644\u0646 \u064A\u064F\u062E\u0635\u0645 \u0645\u0628\u0644\u063A \u0648\u0633\u064A\u0628\u0642\u0649 \u0627\u0644\u0648\u0635\u0648\u0644 \u0645\u0639\u0644\u0642\u064B\u0627.", awaiting: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639", permissions: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A", activity: "\u0633\u062C\u0644 \u0627\u0644\u0648\u0635\u0648\u0644", unavailable: "\u0644\u0645 \u064A\u064F\u0631\u0628\u0637 \u0647\u0630\u0627 \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0628\u0639\u062F \u0628\u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643 \u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627.", legacy: "\u062D\u0633\u0627\u0628\u0627\u062A\u0643 \u0648\u0645\u0646\u062A\u062C\u0627\u062A\u0643 \u0648\u0637\u0644\u0628\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u0636\u0645\u0646 \u0645\u0633\u0627\u0631\u0627\u062A\u0647\u0627 \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647\u0627.", openAccount: "\u0641\u062A\u062D \u062D\u0633\u0627\u0628\u064A \u0648\u0637\u0644\u0628\u0627\u062A\u064A", contact: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062F\u0639\u0645", aiRules: "\u0623\u062F\u0648\u0627\u062A AURI \u0627\u0644\u0645\u0648\u062C\u0647\u0629", aiNotice: "\u0627\u0644\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0642\u0627\u0626\u0645 \u0639\u0644\u0649 \u0627\u0644\u0642\u0648\u0627\u0639\u062F \u0645\u062A\u0627\u062D. \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0648\u0644\u064A\u062F\u064A\u0629 \u0648\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062E\u0627\u0635\u0629 \u0644\u0645 \u062A\u064F\u0631\u0628\u0637 \u0628\u0639\u062F.", diagnosis: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0634\u0627\u0637", recommend: "\u0627\u0642\u062A\u0631\u0627\u062D \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", strengths: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0645\u064F\u0628\u0644\u063A \u0639\u0646\u0647\u0627", missing: "\u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0635\u0629", source: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0628\u064A\u0627\u0646\u0627\u062A \u0623\u062F\u062E\u0644\u0647\u0627 \u0627\u0644\u0639\u0645\u064A\u0644", businessName: "\u0627\u0633\u0645 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", industry: "\u0627\u0644\u0642\u0637\u0627\u0639", country: "\u0627\u0644\u062F\u0648\u0644\u0629", city: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629", stage: "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0634\u0627\u0637", website: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A (HTTPS)", tools: "\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", acquisition: "\u0643\u064A\u0641 \u064A\u062C\u062F\u0643 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u061F", difficulties: "\u0623\u0647\u0645 \u0627\u0644\u0635\u0639\u0648\u0628\u0627\u062A", goals: "\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", budget: "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", currency: "\u0627\u0644\u0639\u0645\u0644\u0629", timeline: "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628", industryDetails: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0642\u0637\u0627\u0639", capabilities: "\u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0643", restaurant: "\u0645\u0637\u0639\u0645", ecommerce: "\u062A\u062C\u0627\u0631\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", real_estate: "\u0639\u0642\u0627\u0631\u0627\u062A", other: "\u0623\u062E\u0631\u0649", servicesIndustry: "\u0646\u0634\u0627\u0637 \u062E\u062F\u0645\u064A", restaurantQuestion: "\u0643\u064A\u0641 \u064A\u062C\u062F\u0643 \u0627\u0644\u0636\u064A\u0648\u0641 \u0648\u064A\u0637\u0644\u0639\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u064A\u062D\u062C\u0632\u0648\u0646\u061F", ecommerceQuestion: "\u0643\u064A\u0641 \u062A\u062F\u064A\u0631 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0648\u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629\u061F", realEstateQuestion: "\u0643\u064A\u0641 \u062A\u0639\u0631\u0636 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u062A\u062A\u0627\u0628\u0639 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u061F", servicesQuestion: "\u0643\u064A\u0641 \u064A\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0648\u0639\u0631\u0648\u0636 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A\u061F", otherQuestion: "\u0635\u0641 \u0637\u0631\u064A\u0642\u0629 \u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0626\u0643.", newWorkspace: "\u0646\u0634\u0627\u0637 \u062C\u062F\u064A\u062F", switchMode: "\u062A\u063A\u064A\u064A\u0631 \u0648\u0636\u0639 \u0627\u0644\u0625\u0631\u0634\u0627\u062F", verified: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F", owner: "\u0627\u0644\u0645\u0627\u0644\u0643", admin: "\u0645\u062F\u064A\u0631", member: "\u0639\u0636\u0648", viewer: "\u0645\u0634\u0627\u0647\u062F", readOnly: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0641\u0642\u0637", verifiedRequired: "\u0623\u0643\u062F \u0628\u0631\u064A\u062F\u0643 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u064A\u0642.", empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0646\u0627\u0635\u0631 \u0628\u0639\u062F.", billingPrivate: "\u062A\u0628\u0642\u0649 \u062A\u0641\u0627\u0635\u064A\u0644 \u062F\u0641\u0639 \u0643\u0644 \u0639\u0636\u0648 \u062E\u0627\u0635\u0629 \u0628\u0647.", security: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646", linkGoogle: "\u0631\u0628\u0637 \u0647\u0648\u064A\u062A\u064A \u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627 \u0641\u064A Google", rename: "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A", refresh: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u062D\u0645\u064A\u0644", serviceNote: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0645\u0646\u0627\u0633\u0628\u064B\u0627 \u0644\u0646\u0634\u0627\u0637\u0643.", openServices: "\u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", reportNote: "\u0644\u0627 \u062A\u064F\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u0642\u0628\u0644 \u0631\u0628\u0637 \u0645\u0635\u0627\u062F\u0631 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0648\u062B\u0648\u0642\u0629 \u0648\u0633\u062C\u0644 \u0648\u0644\u0627\u0621 \u0635\u062D\u064A\u062D." }
};
var capabilityNames = { en: { website: "Website", domain: "Domain & hosting", email: "Business email", seo: "SEO", discovery: "Business discovery", leads: "Lead capture", crm: "CRM", automation: "AI automation", analytics: "Analytics", retention: "Customer retention" }, fr: { website: "Site web", domain: "Domaine et h\xE9bergement", email: "E-mail professionnel", seo: "R\xE9f\xE9rencement", discovery: "Visibilit\xE9 locale", leads: "Acquisition de prospects", crm: "CRM", automation: "Automatisation IA", analytics: "Analyse", retention: "Fid\xE9lisation" }, tr: { website: "Web sitesi", domain: "Alan ad\u0131 ve hosting", email: "Kurumsal e-posta", seo: "SEO", discovery: "\u0130\u015Fletme ke\u015Ffi", leads: "Potansiyel m\xFC\u015Fteri toplama", crm: "CRM", automation: "Yapay zek\xE2 otomasyonu", analytics: "Analitik", retention: "M\xFC\u015Fteri ba\u011Fl\u0131l\u0131\u011F\u0131" }, ar: { website: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", domain: "\u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629", email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0645\u0647\u0646\u064A", seo: "\u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B", discovery: "\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", leads: "\u0627\u0633\u062A\u0642\u0637\u0627\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646", crm: "\u0625\u062F\u0627\u0631\u0629 \u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621", automation: "\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", analytics: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", retention: "\u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0627\u0644\u0639\u0645\u0644\u0627\u0621" } };
Object.assign(copy2.en, { sample: "The starting numbers are illustrative. Replace them with your own business data before making decisions.", solutions: "Selected digital solutions", addSolutions: "Add selected solutions to roadmap", formulaTitle: "How the calculation works", priority: "Priority", high: "High", medium: "Medium", low: "Low", pending: "Pending", active: "Active", removed: "Removed", accepted: "Accepted", canceled: "Canceled", expired: "Expired", sent: "Sent", failed: "Failed", pending_payment: "Pending payment", past_due: "Past due", restrict: "Restrict access", months: "months", seats: "additional seats", googleInvite: "After Google sign-in, reopen your invitation link to continue.", resetSent: "If an eligible account exists, a reset link will be sent." });
Object.assign(copy2.fr, { sample: "Les valeurs initiales sont illustratives. Remplacez-les par vos donn\xE9es avant de prendre une d\xE9cision.", solutions: "Solutions num\xE9riques choisies", addSolutions: "Ajouter les solutions au parcours", formulaTitle: "M\xE9thode de calcul", priority: "Priorit\xE9", high: "Haute", medium: "Moyenne", low: "Basse", pending: "En attente", active: "Actif", removed: "Acc\xE8s r\xE9voqu\xE9", accepted: "Accept\xE9e", canceled: "Annul\xE9e", expired: "Expir\xE9e", sent: "Envoy\xE9e", failed: "\xC9chec", pending_payment: "Paiement en attente", past_due: "En retard", restrict: "Restreindre l\u2019acc\xE8s", months: "mois", seats: "places suppl\xE9mentaires", googleInvite: "Apr\xE8s la connexion Google, rouvrez le lien d\u2019invitation.", resetSent: "Si un compte admissible existe, un lien sera envoy\xE9.", noData: "Aucune donn\xE9e mesur\xE9e n\u2019est connect\xE9e.", supportText: "Envoyez votre demande via le formulaire de contact existant.", simNotice: "Estimations illustratives. Saisissez une seule am\xE9lioration combin\xE9e par \xE9tape pour \xE9viter les doubles comptes. Les taux sont plafonn\xE9s \xE0 100 %. Utilisez la m\xEAme devise et p\xE9riode. Taxes, frais fixes et financement exclus.", formula: "Clients = visites \xD7 taux de prospects \xD7 taux de conversion. Contribution = revenu suppl\xE9mentaire \xD7 marge. ROI annuel = (12 \xD7 contribution suppl\xE9mentaire \u2212 co\xFBt initial \u2212 12 \xD7 co\xFBt mensuel) \xF7 (co\xFBt initial + 12 \xD7 co\xFBt mensuel). Retour = co\xFBt initial \xF7 contribution mensuelle nette positive." });
Object.assign(copy2.tr, { sample: "Ba\u015Flang\u0131\xE7 de\u011Ferleri \xF6rnektir. Karar vermeden \xF6nce kendi i\u015Fletme verilerinizi girin.", solutions: "Se\xE7ilen dijital \xE7\xF6z\xFCmler", addSolutions: "Se\xE7ilen \xE7\xF6z\xFCmleri yol haritas\u0131na ekle", formulaTitle: "Hesaplama y\xF6ntemi", priority: "\xD6ncelik", high: "Y\xFCksek", medium: "Orta", low: "D\xFC\u015F\xFCk", pending: "Beklemede", active: "Etkin", removed: "Eri\u015Fim kald\u0131r\u0131ld\u0131", accepted: "Kabul edildi", canceled: "\u0130ptal edildi", expired: "S\xFCresi doldu", sent: "G\xF6nderildi", failed: "Ba\u015Far\u0131s\u0131z", pending_payment: "\xD6deme bekliyor", past_due: "\xD6deme gecikti", restrict: "Eri\u015Fimi k\u0131s\u0131tla", months: "ay", seats: "ek koltuk", googleInvite: "Google giri\u015Finden sonra devam etmek i\xE7in davet ba\u011Flant\u0131s\u0131n\u0131 yeniden a\xE7\u0131n.", resetSent: "Uygun bir hesap varsa s\u0131f\u0131rlama ba\u011Flant\u0131s\u0131 g\xF6nderilecektir.", noData: "Hen\xFCz \xF6l\xE7\xFClen veri kayna\u011F\u0131 ba\u011Fl\u0131 de\u011Fil.", supportText: "Mevcut ileti\u015Fim formundan destek talebi g\xF6nderin.", simNotice: "\xD6rnek tahminlerdir. Ayn\u0131 fayday\u0131 iki kez saymamak i\xE7in her a\u015Famada tek bir birle\u015Fik art\u0131\u015F girin. Oranlar %100 ile s\u0131n\u0131rl\u0131d\u0131r. Maliyet ve gelir ayn\u0131 para birimi ve d\xF6nemde olmal\u0131d\u0131r. Vergi, sabit gider ve finansman hari\xE7tir.", formula: "M\xFC\u015Fteri = ziyaret \xD7 potansiyel m\xFC\u015Fteri oran\u0131 \xD7 sat\u0131\u015F oran\u0131. Katk\u0131 = ek gelir \xD7 marj. \u0130lk y\u0131l getirisi = (12 \xD7 ek katk\u0131 \u2212 ba\u015Flang\u0131\xE7 \u2212 12 \xD7 ayl\u0131k maliyet) \xF7 (ba\u015Flang\u0131\xE7 + 12 \xD7 ayl\u0131k maliyet). Geri \xF6deme = ba\u015Flang\u0131\xE7 \xF7 pozitif net ayl\u0131k katk\u0131." });
Object.assign(copy2.ar, { sample: "\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0623\u0648\u0644\u064A\u0629 \u0623\u0645\u062B\u0644\u0629 \u062A\u0648\u0636\u064A\u062D\u064A\u0629. \u0627\u0633\u062A\u0628\u062F\u0644\u0647\u0627 \u0628\u0628\u064A\u0627\u0646\u0627\u062A \u0646\u0634\u0627\u0637\u0643 \u0642\u0628\u0644 \u0627\u062A\u062E\u0627\u0630 \u0623\u064A \u0642\u0631\u0627\u0631.", solutions: "\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629", addSolutions: "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u0625\u0644\u0649 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", formulaTitle: "\u0643\u064A\u0641 \u064A\u0639\u0645\u0644 \u0627\u0644\u062D\u0633\u0627\u0628", priority: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", high: "\u0645\u0631\u062A\u0641\u0639\u0629", medium: "\u0645\u062A\u0648\u0633\u0637\u0629", low: "\u0645\u0646\u062E\u0641\u0636\u0629", pending: "\u0645\u0639\u0644\u0642", active: "\u0646\u0634\u0637", removed: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0648\u0635\u0648\u0644", accepted: "\u0645\u0642\u0628\u0648\u0644\u0629", canceled: "\u0645\u0644\u063A\u0627\u0629", expired: "\u0645\u0646\u062A\u0647\u064A\u0629", sent: "\u0623\u064F\u0631\u0633\u0644\u062A", failed: "\u0641\u0634\u0644\u062A", pending_payment: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639", past_due: "\u0645\u062A\u0623\u062E\u0631 \u0639\u0646 \u0627\u0644\u062F\u0641\u0639", restrict: "\u062A\u0642\u064A\u064A\u062F \u0627\u0644\u0648\u0635\u0648\u0644", months: "\u0623\u0634\u0647\u0631", seats: "\u0645\u0642\u0627\u0639\u062F \u0625\u0636\u0627\u0641\u064A\u0629", googleInvite: "\u0628\u0639\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google\u060C \u0623\u0639\u062F \u0641\u062A\u062D \u0631\u0627\u0628\u0637 \u0627\u0644\u062F\u0639\u0648\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629.", resetSent: "\u0625\u0630\u0627 \u0648\u064F\u062C\u062F \u062D\u0633\u0627\u0628 \u0645\u0624\u0647\u0644\u060C \u0641\u0633\u064A\u064F\u0631\u0633\u0644 \u0631\u0627\u0628\u0637 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0639\u064A\u064A\u0646.", noData: "\u0644\u0645 \u062A\u064F\u0631\u0628\u0637 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0642\u0627\u0633\u0629 \u0628\u0639\u062F.", supportText: "\u0623\u0631\u0633\u0644 \u0637\u0644\u0628 \u0627\u0644\u062F\u0639\u0645 \u0639\u0628\u0631 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u062D\u0627\u0644\u064A.", simNotice: "\u062A\u0642\u062F\u064A\u0631\u0627\u062A \u062A\u0648\u0636\u064A\u062D\u064A\u0629. \u0623\u062F\u062E\u0644 \u062A\u062D\u0633\u064A\u0646\u064B\u0627 \u0645\u062C\u0645\u0639\u064B\u0627 \u0648\u0627\u062D\u062F\u064B\u0627 \u0644\u0643\u0644 \u0645\u0631\u062D\u0644\u0629 \u0644\u062A\u062C\u0646\u0628 \u0627\u062D\u062A\u0633\u0627\u0628 \u0627\u0644\u0641\u0627\u0626\u062F\u0629 \u0645\u0631\u062A\u064A\u0646. \u0627\u0644\u0646\u0633\u0628 \u0645\u062D\u062F\u0648\u062F\u0629 \u0628\u0640100\u066A. \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0639\u0645\u0644\u0629 \u0648\u0627\u0644\u0641\u062A\u0631\u0629 \u0646\u0641\u0633\u064A\u0647\u0645\u0627 \u0644\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0648\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A. \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062B\u0627\u0628\u062A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0645\u0633\u062A\u062B\u0646\u0627\u0629.", formula: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 = \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A \xD7 \u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 \xD7 \u0645\u0639\u062F\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0628\u064A\u0639. \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 = \u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0627\u0644\u0625\u0636\u0627\u0641\u064A \xD7 \u0627\u0644\u0647\u0627\u0645\u0634. \u0639\u0627\u0626\u062F \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 = (12 \xD7 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629 \u2212 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u2212 12 \xD7 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629) \xF7 (\u0627\u0644\u0625\u0639\u062F\u0627\u062F + 12 \xD7 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629). \u0627\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F = \u0627\u0644\u0625\u0639\u062F\u0627\u062F \xF7 \u0635\u0627\u0641\u064A \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0627\u0644\u0645\u0648\u062C\u0628." });
var addedCapabilityNames = {
  en: ["Brand identity", "Hosting & security", "Search advertising", "Online reviews", "WhatsApp integration", "Conversion optimization", "Automated follow-ups", "Digital menu"],
  tr: ["Marka kimli\u011Fi", "Bar\u0131nd\u0131rma ve g\xFCvenlik", "Arama reklamlar\u0131", "\xC7evrimi\xE7i yorumlar", "WhatsApp entegrasyonu", "D\xF6n\xFC\u015F\xFCm optimizasyonu", "Otomatik takip", "Dijital men\xFC"],
  fr: ["Identit\xE9 de marque", "H\xE9bergement et s\xE9curit\xE9", "Publicit\xE9 sur les moteurs de recherche", "Avis en ligne", "Int\xE9gration WhatsApp", "Optimisation des conversions", "Relances automatiques", "Menu num\xE9rique"],
  ar: ["\u0647\u0648\u064A\u0629 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629", "\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629 \u0648\u0627\u0644\u0623\u0645\u0627\u0646", "\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u062D\u062B", "\u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A", "\u062F\u0645\u062C \u0648\u0627\u062A\u0633\u0627\u0628", "\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u062A\u062D\u0648\u064A\u0644", "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0622\u0644\u064A\u0629", "\u0642\u0627\u0626\u0645\u0629 \u0631\u0642\u0645\u064A\u0629"]
};
var addedCapabilities = ["branding", "hosting", "ads", "reviews", "whatsapp", "conversion", "followups", "menu"];
for (const [locale, names] of Object.entries(addedCapabilityNames)) {
  for (const [index, key] of addedCapabilities.entries()) capabilityNames[locale][key] = names[index];
}

// src/http.js
var ApiError = class extends Error {
  constructor(status, message, headers = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.headers = headers;
  }
};

// src/growth-engine.js
var FORMULA_VERSION = "aura-funnel-1";
var capabilities = [
  { id: "website", level: 1, service: "Website Development", dependencies: [], priority: 1 },
  { id: "domain", level: 1, service: "Domains and Hosting", dependencies: [], priority: 1 },
  { id: "email", level: 1, service: "Business Email", dependencies: ["domain"], priority: 2 },
  { id: "seo", level: 2, service: "SEO", dependencies: ["website"], priority: 2 },
  { id: "discovery", level: 2, service: "Business Discovery", dependencies: [], priority: 2 },
  { id: "leads", level: 3, service: "Lead Capture", dependencies: ["website"], priority: 2 },
  { id: "crm", level: 3, service: "CRM", dependencies: ["leads"], priority: 3 },
  { id: "automation", level: 4, service: "AI Automation", dependencies: ["crm"], priority: 3 },
  { id: "analytics", level: 5, service: "Analytics", dependencies: ["website"], priority: 2 },
  { id: "retention", level: 5, service: "Customer Retention", dependencies: ["crm"], priority: 3 },
  { id: "branding", level: 1, service: "Brand identity", dependencies: [], priority: 3 },
  { id: "hosting", level: 1, service: "Hosting and security", dependencies: ["website"], priority: 3 },
  { id: "ads", level: 2, service: "Search advertising", dependencies: ["leads"], priority: 3, optional: true },
  { id: "reviews", level: 2, service: "Online reviews", dependencies: ["discovery"], priority: 3 },
  { id: "whatsapp", level: 3, service: "WhatsApp integration", dependencies: [], priority: 3 },
  { id: "conversion", level: 3, service: "Conversion optimization", dependencies: ["leads"], priority: 3 },
  { id: "followups", level: 4, service: "Automated follow-ups", dependencies: ["crm"], priority: 3, optional: true },
  { id: "menu", level: 1, service: "Digital menu", dependencies: [], priority: 2, industry: "restaurant" }
];
function number(value, key, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new ApiError(400, `Invalid ${key}.`);
  return value;
}
function simulate(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ApiError(400, "Simulator inputs required.");
  const inputs = {};
  if (raw.solutions !== void 0 && (!Array.isArray(raw.solutions) || raw.solutions.length > capabilities.length || raw.solutions.some((id) => !capabilities.some((c) => c.id === id)))) throw new ApiError(400, "Invalid selected digital solutions.");
  inputs.solutions = [...new Set(raw.solutions || [])];
  for (const [k, max] of Object.entries({ visits: 1e9, leads: 1e9, customerValue: 1e9, monthlyCost: 1e9, setupCost: 1e9 })) inputs[k] = number(raw[k], k, 0, max);
  inputs.closeRate = number(raw.closeRate, "closeRate", 0, 100);
  inputs.margin = number(raw.margin, "margin", 0, 100);
  if (inputs.leads > inputs.visits) throw new ApiError(400, "Leads cannot exceed visits in this website funnel.");
  inputs.currency = ["USD", "EUR", "TRY", "TND"].includes(raw.currency) ? raw.currency : "USD";
  if (!Array.isArray(raw.assumptions) || raw.assumptions.length !== 3) throw new ApiError(400, "Provide three scenario assumptions.");
  inputs.assumptions = raw.assumptions.map((a, i) => {
    if (!a || typeof a !== "object") throw new ApiError(400, "Invalid scenario.");
    return { name: ["conservative", "base", "ambitious"][i], trafficLift: number(a.trafficLift, "trafficLift", 0, 300), leadRateLift: number(a.leadRateLift, "leadRateLift", 0, 300), closeRateLift: number(a.closeRateLift, "closeRateLift", 0, 300) };
  });
  const baselineCustomers = inputs.leads * inputs.closeRate / 100, baselineRevenue = baselineCustomers * inputs.customerValue;
  const scenarios = inputs.assumptions.map((a) => {
    const visits = inputs.visits * (1 + a.trafficLift / 100), leadRate = inputs.visits ? inputs.leads / inputs.visits : 0;
    const leads = visits * Math.min(1, leadRate * (1 + a.leadRateLift / 100)), customers = leads * Math.min(1, inputs.closeRate / 100 * (1 + a.closeRateLift / 100));
    const revenue = customers * inputs.customerValue, additionalRevenue = revenue - baselineRevenue, contributionProfit = additionalRevenue * inputs.margin / 100, netMonthly = contributionProfit - inputs.monthlyCost;
    const firstYearCost = inputs.setupCost + 12 * inputs.monthlyCost;
    if ([revenue, additionalRevenue, contributionProfit, netMonthly, firstYearCost, 12 * contributionProfit].some((value) => !Number.isSafeInteger(Math.round(value * 100)))) throw new ApiError(400, "Reduce the input amounts; the result exceeds safe monetary precision.");
    return { name: a.name, visits, leads, customers, additionalCustomers: customers - baselineCustomers, additionalLeads: leads - inputs.leads, revenue, additionalRevenue, contributionProfit, monthlyCost: inputs.monthlyCost, setupCost: inputs.setupCost, netMonthly, firstYearROI: firstYearCost ? (12 * contributionProfit - firstYearCost) / firstYearCost * 100 : null, paybackMonths: netMonthly > 0 ? inputs.setupCost / netMonthly : null };
  });
  return { formulaVersion: FORMULA_VERSION, inputs, baseline: { customers: baselineCustomers, revenue: baselineRevenue }, scenarios, source: "customer_entered_and_assumptions", notice: "Illustrative monthly funnel, not guaranteed growth. Apply one combined lift per funnel stage; overlapping service effects must not be added. Revenue uses a consistent customer-value period. Contribution excludes fixed overhead, taxes and financing." };
}

// src/hub/app.js
var app = document.querySelector("#app");
var notice = document.querySelector("#notice");
var esc2 = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var lang = localStorage.getItem("aura-hub-language") || "en";
if (!copy2[lang]) lang = "en";
var me = null;
var workspaces = [];
var workspace = null;
var page = "home";
var editing = false;
var mode = "myself";
var step = 0;
var draft = {};
var result = null;
var scenarioInputs = null;
var saveQueue = Promise.resolve();
var saveTimer;
var route = location.pathname.split("/")[2] || "";
var flowToken = new URLSearchParams(location.hash.slice(1)).get("token") || "";
var returnPath = ["login", "signup", "forgot"].includes(route) ? customerReturnPath(new URLSearchParams(location.search).get("next"), "") : "";
var authQuery = returnPath ? "?" + new URLSearchParams({ next: returnPath }) : "";
var authCapabilities = {};
function resumeShop() {
  if (!returnPath || returnPath === "/hub") return false;
  location.replace(returnPath);
  return true;
}
if (flowToken) history.replaceState(null, "", location.pathname + location.search);
var t = (k) => k === "menuDrafts" ? { en: "Menu drafts", ar: "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645", tr: "Men\xFC taslaklar\u0131", fr: "Brouillons de menus" }[lang] : copy2[lang][k] || copy2.en[k] || k;
var cap = (k) => capabilityNames[lang][k] || capabilities.find((c) => c.id === k)?.service || k;
var toast = (message) => {
  notice.textContent = message;
  notice.classList.add("visible");
  setTimeout(() => notice.classList.remove("visible"), 7e3);
};
var robot = () => `<svg class="auri" viewBox="0 0 160 170" role="img" aria-label="AURI"><defs><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#fffef9"/><stop offset="1" stop-color="#bfc7bf"/></linearGradient></defs><ellipse cx="80" cy="157" rx="43" ry="6" fill="#003d2b" opacity=".12"/><path d="M47 125Q42 91 80 91T113 125L108 145H52Z" fill="url(#metal)"/><rect x="23" y="29" width="114" height="78" rx="33" fill="url(#metal)"/><rect x="32" y="38" width="96" height="60" rx="26" fill="#0f241c"/><g fill="#e1e100" class="eyes"><rect x="49" y="58" width="18" height="19" rx="8"/><rect x="93" y="58" width="18" height="19" rx="8"/></g><path d="M72 85Q80 90 88 85" fill="none" stroke="#e1e100" stroke-width="2" stroke-linecap="round"/><path d="M80 29V18" stroke="#a7b7ad" stroke-width="5"/><circle cx="80" cy="13" r="5" fill="#e1e100"/><path d="M36 113L25 134M124 113L135 134" stroke="#d4dbd1" stroke-width="15" stroke-linecap="round"/><circle cx="80" cy="124" r="7" fill="#003d2b"/></svg>`;
async function api(path, method = "GET", body) {
  const response = await fetch(path, { method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : void 0 });
  const data = await response.json().catch(() => ({ error: t("error") }));
  if (!response.ok) {
    const error = new Error(data.error || t("error"));
    error.status = response.status;
    throw error;
  }
  return data;
}
var endpoint = (s) => "/api/hub/workspaces/" + workspace.organization.id + (s ? "/" + s : "");
var button = (label, action, secondary = false, disabled = false) => `<button type="button" data-action="${action}" class="${secondary ? "secondary" : "primary"}" ${disabled ? "disabled" : ""}>${esc2(t(label))}</button>`;
function field(key, label, value = "", type = "text", extra = "") {
  return `<label class="field">${esc2(t(label))}<input name="${key}" type="${type}" value="${esc2(value)}" ${extra}></label>`;
}
var select = (key, label, options, value) => `<label class="field">${esc2(t(label))}<select name="${key}">${options.map(([v, l]) => `<option value="${esc2(v)}" ${v === value ? "selected" : ""}>${esc2(l)}</option>`).join("")}</select></label>`;
function languageControl() {
  return `<label class="language"><span class="sr-only">Language</span><select id="language" aria-label="Language">${[["en", "EN \xB7 English"], ["ar", "AR \xB7 \u0627\u0644\u0639\u0631\u0628\u064A\u0629"], ["fr", "FR \xB7 Fran\xE7ais"], ["tr", "TR \xB7 T\xFCrk\xE7e"]].map(([v, l]) => `<option value="${v}" ${lang === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>`;
}
function bindCommon() {
  document.querySelector("#language")?.addEventListener("change", async (e) => {
    clearTimeout(saveTimer);
    if (editing && workspace) await persistProfile();
    lang = e.target.value;
    localStorage.setItem("aura-hub-language", lang);
    render();
  });
}
function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  app.setAttribute("aria-busy", "false");
  if (!me || ["verify", "reset", "forgot", "invitation"].includes(route)) {
    renderGate();
    return;
  }
  if (!workspace || editing) {
    renderSetup();
    return;
  }
  renderShell();
}
function gateFrame(content2) {
  app.innerHTML = `<header class="gate-header"><a href="/" class="wordmark">aura<span>digital</span></a>${languageControl()}</header><main id="main" class="gate">${content2}</main>`;
  bindCommon();
}
async function renderGate() {
  if (route === "invitation" && me) {
    gateFrame(`<section class="panel">${robot()}<h1>${t("inviteAccept")}</h1><div id="invitation-content" role="status">\u2026</div></section>`);
    try {
      const data = await api("/api/hub/invitations/preview", "POST", { token: flowToken }), i = data.invitation;
      document.querySelector("#invitation-content").innerHTML = `<h2>${esc2(i.business)}</h2><p>${esc2(i.email)} \xB7 ${esc2(t(i.role))}</p><p>${esc2(i.message)}</p><p>${t("permissions")}: ${esc2(i.permissions.join(", "))}</p><p>${esc2(new Date(i.expiresAt * 1e3).toLocaleString(lang))}</p><p class="warning">${t("blocked")}</p><form id="accept-invitation"><label class="check"><input type="checkbox" name="consent" required>${t("recurringConsent")}</label><button class="primary">${t("inviteAccept")}</button></form>`;
      document.querySelector("#accept-invitation").onsubmit = async (e) => {
        e.preventDefault();
        try {
          const r = await api("/api/hub/invitations/accept", "POST", { token: flowToken, acceptInvitation: true, acceptRecurring: true, consentVersion: "seat-5-usd-month-v1" });
          flowToken = "";
          toast(t("awaiting"));
          document.querySelector("#invitation-content").textContent = t("blocked");
        } catch (e2) {
          toast(e2.message);
        }
      };
    } catch (e) {
      document.querySelector("#invitation-content").textContent = e.message;
      document.querySelector("#invitation-content").append(Object.assign(document.createElement("a"), { href: "/hub/settings", textContent: t("settings") }));
    }
    return;
  }
  if (route === "verify") {
    gateFrame(`<section class="panel">${robot()}<h1>${t("verify")}</h1><p id="verification-result" role="status"></p>${button("confirm", "verify")}<a href="/hub">${t("brand")}</a></section>`);
    document.querySelector('[data-action="verify"]').onclick = async (e) => {
      e.target.disabled = true;
      try {
        await api("/api/customer/verify", "POST", { token: flowToken });
        flowToken = "";
        document.querySelector("#verification-result").textContent = t("verified");
      } catch (error) {
        document.querySelector("#verification-result").textContent = error.message;
      }
    };
    return;
  }
  const signup = route === "signup", forgot = route === "forgot", reset = route === "reset";
  gateFrame(`<section class="auth-intro"><p class="eyebrow">AURADIGITAL / ${t("brand")}</p><h1>${t("welcome")}</h1><p>${t("tag")}</p>${robot()}</section><section class="panel auth-panel"><h2>${t(reset ? "reset" : forgot ? "forgot" : signup ? "signup" : "signIn")}</h2><form id="auth-form">${signup ? field("name", "name", "", "text", 'required minlength="2" maxlength="100" autocomplete="name"') : ""}${reset ? "" : field("email", "email", "", "email", 'required maxlength="254" autocomplete="email"')}${forgot ? "" : field("password", reset ? "newPassword" : "password", "", "password", "required " + (signup || reset ? 'minlength="12" ' : "") + 'maxlength="72" autocomplete="' + (signup || reset ? "new-password" : "current-password") + '"')}${signup ? `<label class="check"><input type="checkbox" name="terms" required>${t("terms")}</label>` : ""}<p class="form-error" role="alert"></p><button class="primary">${t(reset ? "reset" : forgot ? "continue" : signup ? "signup" : "signIn")}</button></form>${!forgot && !reset ? `${authCapabilities.google ? `<hr><label class="check"><input id="google-terms" type="checkbox">${t("terms")}</label>${button("google", "google", true)}` : ""}<div class="auth-links"><a href="/hub/${signup ? "login" : "signup"}${authQuery}">${t(signup ? "signIn" : "signup")}</a>${authCapabilities.email ? `<a href="/hub/forgot${authQuery}">${t("forgot")}</a>` : ""}</div>` : `<a href="/hub/login${authQuery}">${t("signIn")}</a>`}</section>`);
  document.querySelector("#auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target, b = form.querySelector("button"), data = new FormData(form);
    b.disabled = true;
    try {
      if (forgot) {
        const r = await api("/api/customer/forgot-password", "POST", { email: data.get("email") });
        toast(t("resetSent"));
      } else if (reset) {
        await api("/api/customer/reset-password", "POST", { token: flowToken, password: data.get("password") });
        location.assign("/hub/login" + authQuery);
      } else {
        await api("/api/customer/" + (signup ? "register" : "login"), "POST", { name: data.get("name"), email: data.get("email"), password: data.get("password"), acceptTerms: data.has("terms") });
        if (route !== "invitation" && resumeShop()) return;
        route = route === "invitation" ? "invitation" : "";
        await load();
      }
    } catch (error) {
      form.querySelector('[role="alert"]').textContent = error.message;
    } finally {
      b.disabled = false;
    }
  };
  document.querySelector('[data-action="google"]')?.addEventListener("click", () => {
    if (!document.querySelector("#google-terms").checked) {
      toast(t("terms"));
      return;
    }
    if (route === "invitation") {
      toast(t("googleInvite"));
    }
    location.assign("/api/customer/google/start?" + new URLSearchParams({ acceptTerms: "true", ...returnPath ? { next: returnPath } : {} }));
  });
}
var emptyProfile = () => ({ name: "", industry: "other", country: "", city: "", stage: "", website: "", tools: "", acquisition: "", difficulties: "", goals: "", timeline: "", industryDetails: "", budget: null, currency: "USD", capabilities: [] });
function profileField(k) {
  const value = draft[k] ?? "";
  if (k === "industry") return select(k, k, [["restaurant", t("restaurant")], ["services", t("servicesIndustry")], ["ecommerce", t("ecommerce")], ["real_estate", t("real_estate")], ["other", t("other")]], value);
  if (k === "currency") return select(k, k, ["USD", "EUR", "TRY", "TND"].map((x) => [x, x]), value);
  if (k === "capabilities") return `<fieldset><legend>${t(k)}</legend><div class="checks">${capabilities.map((c) => `<label class="check"><input type="checkbox" name="capabilities" value="${c.id}" ${(draft.capabilities || []).includes(c.id) ? "checked" : ""}>${esc2(cap(c.id))}</label>`).join("")}</div></fieldset>`;
  if (["tools", "acquisition", "difficulties", "goals", "industryDetails"].includes(k)) {
    const question = k === "industryDetails" ? { restaurant: "restaurantQuestion", ecommerce: "ecommerceQuestion", real_estate: "realEstateQuestion", services: "servicesQuestion" }[draft.industry] || "otherQuestion" : k;
    return `<label class="field">${t(question)}<textarea name="${k}" rows="4" maxlength="${k === "tools" || k === "acquisition" ? 1200 : 1600}">${esc2(value)}</textarea></label>`;
  }
  return field(k, k === "name" ? "businessName" : k, value, k === "budget" ? "number" : k === "website" ? "url" : "text", k === "name" ? 'required maxlength="120"' : k === "budget" ? 'min="0" max="100000000" step="any"' : `maxlength="${{ country: 80, city: 100, stage: 80, website: 500, timeline: 200 }[k] || 200}"`);
}
var profileKeys = ["name", "industry", "industryDetails", "country", "city", "stage", "website", "tools", "acquisition", "difficulties", "goals", "currency", "budget", "timeline", "capabilities"];
function renderSetup() {
  if (!editing) {
    draft = workspace ? structuredClone(workspace.profile) : emptyProfile();
    mode = workspace?.organization.mode || "myself";
  }
  const choosing = !editing;
  const setupKeys = workspace ? profileKeys : ["name", "industry", "goals", "budget", "currency", "website", "capabilities"];
  app.innerHTML = `<header class="gate-header"><a href="/" class="wordmark">aura<span>digital</span></a>${languageControl()}</header><main class="setup" id="main"><div class="setup-heading"><p class="eyebrow">${t("brand")}</p><h1>${choosing ? t("welcome") : esc2(draft.name || t("profile"))}</h1><p>${choosing ? t("choose") : t(mode === "auri" ? "auriText" : "myselfText")}</p></div>${choosing ? `<div class="mode-grid"><button class="mode-card" data-mode="myself"><span class="mode-icon">\u2197</span><h2>${t("myself")}</h2><p>${t("myselfText")}</p><span>${t("continue")} \u2192</span></button><button class="mode-card dark" data-mode="auri">${robot()}<h2>${t("auri")}</h2><p>${t("auriText")}</p><span>${t("continue")} \u2192</span></button></div>` : `<section class="panel profile-panel"><div class="panel-bar"><span>${mode === "auri" ? `AURI \xB7 ${step + 1}/${setupKeys.length}` : t("profile")}</span><span id="save-state" role="status"></span>${button("switchMode", "switch-mode", true)}</div><form id="profile-form" class="${mode === "auri" ? "guided" : "form-grid"}">${(mode === "auri" ? [setupKeys[step]] : setupKeys).map(profileField).join("")}<div class="actions full">${mode === "auri" ? button("back", "back-step", true, step === 0) + button("skip", "skip-step", true, step === 0) : ""}<button class="primary" type="submit">${t(mode === "auri" && step < setupKeys.length - 1 ? "continue" : "save")}</button>${workspace ? button("home", "leave-setup", true) : ""}</div><p class="form-error full" role="alert"></p></form></section>`}</main>`;
  bindCommon();
  document.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => {
    mode = b.dataset.mode;
    editing = true;
    step = 0;
    render();
  });
  if (choosing) return;
  const form = document.querySelector("#profile-form");
  const collect = () => {
    const data = new FormData(form);
    for (const k of profileKeys) {
      if (k === "capabilities") {
        if (form.querySelector('[name="capabilities"]')) draft.capabilities = data.getAll(k);
      } else if (data.has(k)) draft[k] = k === "budget" ? data.get(k) === "" ? null : Number(data.get(k)) : data.get(k);
    }
  };
  form.addEventListener("input", () => {
    collect();
    if (!workspace) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      persistProfile().catch((e) => toast(e.message));
    }, 1e3);
  });
  form.addEventListener("change", (e) => {
    collect();
    if (e.target.name === "industry" && mode === "myself") {
      clearTimeout(saveTimer);
      (workspace ? persistProfile() : Promise.resolve()).then(render).catch((e2) => toast(e2.message));
    }
  });
  form.onsubmit = async (e) => {
    e.preventDefault();
    collect();
    clearTimeout(saveTimer);
    const b = form.querySelector('[type="submit"]');
    b.disabled = true;
    try {
      if (mode === "auri" && step < setupKeys.length - 1) {
        step++;
        render();
      } else {
        await persistProfile();
        editing = false;
        page = "home";
        await loadWorkspace();
      }
    } catch (error) {
      form.querySelector('[role="alert"]').textContent = error.message;
      b.disabled = false;
    }
  };
  document.querySelector('[data-action="switch-mode"]').onclick = async () => {
    collect();
    clearTimeout(saveTimer);
    mode = mode === "auri" ? "myself" : "auri";
    try {
      if (workspace && draft.name.trim()) await persistProfile();
      render();
    } catch (e) {
      toast(e.message);
    }
  };
  for (const [action, delta] of [["back-step", -1], ["skip-step", 1]]) document.querySelector(`[data-action="${action}"]`)?.addEventListener("click", async () => {
    collect();
    clearTimeout(saveTimer);
    try {
      if (workspace && draft.name.trim()) await persistProfile();
      if (delta > 0 && step === setupKeys.length - 1) {
        await persistProfile();
        editing = false;
        page = "home";
        await loadWorkspace();
        return;
      }
      step = Math.max(0, step + delta);
      render();
    } catch (e) {
      toast(e.message);
    }
  });
  document.querySelector('[data-action="leave-setup"]')?.addEventListener("click", async () => {
    collect();
    clearTimeout(saveTimer);
    try {
      await persistProfile();
      editing = false;
      await loadWorkspace();
    } catch (e) {
      toast(e.message);
    }
  });
}
function persistProfile() {
  if (!draft.name.trim()) return Promise.resolve();
  const snapshot = structuredClone(draft), selectedMode = mode;
  const job = saveQueue.catch(() => {
  }).then(async () => {
    const status = document.querySelector("#save-state");
    if (status) status.textContent = t("saving");
    if (!workspace) {
      const created = await api("/api/hub/workspaces", "POST", { profile: snapshot, mode: selectedMode });
      workspace = await api("/api/hub/workspaces/" + created.id);
      workspaces.push({ id: created.id, name: snapshot.name, owner: true });
    } else {
      await api(endpoint("profile"), "PUT", { profile: snapshot, mode: selectedMode, version: workspace.organization.version });
      workspace.organization.version++;
      workspace.profile = snapshot;
      workspace.organization.mode = selectedMode;
      workspace.organization.name = snapshot.name;
    }
    if (status) status.textContent = t("saved");
  });
  saveQueue = job;
  return job;
}
var roadmapView = "tree";
var selectedMission = null;
var requestLink = (service = "", task = "") => "/contact#" + new URLSearchParams({
  hub: "1",
  ...workspace.organization.owner ? { workspace: workspace.organization.id } : {},
  service,
  business: workspace.organization.name,
  task,
  name: me.name,
  email: me.email
});
var navigation = ["home", "journey", "tasks", "assistant", "services", "orders", "resources", "settings"];
var moreNavigation = ["profile", "simulator", "menuDrafts", "projects", "websites", "hosting", "files", "reports", "invoices", "rewards", "team", "support"];
function renderShell() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  const l = roadmapLabels(lang), growth = ["home", "journey"].includes(page);
  const alerts = workspace.missions.filter((m) => m.priority === 1 && !m.optional && !["done", "postponed"].includes(m.status) && !missionState(m, workspace.missions, workspace.profile).blocked);
  const navItem = (p) => `<button class="nav-item ${page === p ? "active" : ""}" data-page="${p}" ${page === p ? 'aria-current="page"' : ""}>
 <span aria-hidden="true">${{ home: "\u2302", journey: "\u2667", tasks: "\u2611", assistant: "\u2727", services: "\u25C7", orders: "\u25A4", resources: "\u25A4", settings: "\u2699" }[p] || "\xB7"}</span>${esc2(l[p] || t(p))}</button>`;
  app.innerHTML = `<div class="shell growth-shell ${growth ? "growth-active" : ""}"><aside class="sidebar" id="sidebar">
 <a href="/" class="wordmark">aura<span>digital.</span></a><label class="field workspace-picker"><span class="sr-only">${t("businessName")}</span>
 <select id="workspace-select" aria-label="${t("businessName")}">${workspaces.map((o) => `<option value="${o.id}" ${o.id === workspace.organization.id ? "selected" : ""}>${esc2(o.id === workspace.organization.id ? workspace.organization.name : o.name)}</option>`).join("")}</select></label>
 <nav aria-label="${t("brand")}">${navigation.map(navItem).join("")}</nav><div class="growth-request"><a class="growth-primary" href="${esc2(requestLink())}">${l.request} \u2192</a></div></aside>
 <div class="workspace"><header class="topbar growth-topbar"><button class="menu-button secondary" id="toggle-menu" aria-controls="sidebar" aria-expanded="false">${t("menu")}</button>
 <div class="growth-greeting"><strong>${esc2(l.welcome)}, ${esc2(me.name.split(" ")[0])}</strong><span>${esc2(workspace.organization.name)}</span></div>
 ${languageControl()}
 <details class="growth-notifications"><summary class="growth-secondary" aria-label="${esc2(t("activity"))}">
 <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/></svg></summary>
 <div class="growth-account-menu"><strong>${l.priority}</strong>
 ${alerts.length ? `<ul>${alerts.map((m) => `<li>${esc2(m.objective === m.service ? cap(m.capability) : m.objective)}</li>`).join("")}</ul>` : `<p>${esc2(t("empty"))}</p>`}
 ${navItem("journey")}</div></details>
 <details class="growth-account"><summary><span class="avatar">${esc2(me.name.slice(0, 1))}</span><span>${esc2(me.name)}</span></summary>
 <div class="growth-account-menu">${navItem("profile")}${navItem("settings")}${button("logout", "logout", true)}</div></details></header>
 <main id="main" tabindex="-1">${growth ? `<h1 class="sr-only">${l[page]}</h1>` : `<div class="page-heading"><h1>${esc2(l[page] || t(page))}</h1></div>`}
 ${!me.verified && authCapabilities.email ? `<aside class="verification"><p>${t("verifyLater")}</p>${button("sendVerification", "send-verification", true)}</aside>` : ""}
 <div id="page-content"></div></main></div></div>`;
  bindCommon();
  document.querySelectorAll("[data-page]").forEach((b) => b.onclick = () => {
    page = b.dataset.page;
    document.body.classList.remove("menu-open");
    render();
    document.querySelector("#main").focus();
  });
  document.querySelector("#toggle-menu").onclick = (e) => {
    const open = document.body.classList.toggle("menu-open");
    e.target.setAttribute("aria-expanded", String(open));
    syncSidebar();
  };
  document.querySelector("#workspace-select").onchange = async (e) => {
    selectedMission = null;
    await loadWorkspace(e.target.value);
  };
  document.querySelector('[data-action="logout"]').onclick = async () => {
    try {
      await api("/api/customer/logout", "POST", {});
      location.assign("/hub/login");
    } catch (e) {
      toast(e.message);
    }
  };
  document.querySelector('[data-action="send-verification"]')?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    try {
      await api("/api/customer/send-verification", "POST", {});
      toast(t("saved"));
    } catch (e2) {
      toast(e2.message);
    } finally {
      e.target.disabled = false;
    }
  });
  syncSidebar();
  renderPage().catch((e) => {
    document.querySelector("#page-content").innerHTML = `<section class="panel"><p role="alert">${esc2(e.message)}</p>${button("refresh", "refresh", true)}</section>`;
    document.querySelector('[data-action="refresh"]').onclick = () => loadWorkspace().catch((e2) => toast(e2.message));
  });
}
var content = (html) => {
  document.querySelector("#page-content").innerHTML = html;
};
function syncSidebar() {
  const sidebar = document.querySelector("#sidebar");
  if (!sidebar) return;
  const closed = matchMedia("(max-width:800px)").matches && !document.body.classList.contains("menu-open");
  sidebar.inert = closed;
  sidebar.setAttribute("aria-hidden", String(closed));
}
window.addEventListener("resize", syncSidebar);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
    document.body.classList.remove("menu-open");
    syncSidebar();
    document.querySelector("#toggle-menu")?.setAttribute("aria-expanded", "false");
    document.querySelector("#toggle-menu")?.focus();
  }
});
async function renderPage() {
  if (page === "profile" && !workspace.permissions.includes("profile:write")) {
    content(`<section class="panel"><h2>${esc2(workspace.profile.name)}</h2><p>${t("readOnly")}</p><p>${esc2(workspace.profile.goals)}</p></section>`);
    return;
  }
  if (page === "profile") {
    draft = structuredClone(workspace.profile);
    mode = workspace.organization.mode;
    editing = true;
    renderSetup();
    return;
  }
  if (page === "menuDrafts") return renderMenuDrafts({ host: document.querySelector("#page-content"), api, endpoint, profile: workspace.profile, canWrite: workspace.permissions.includes("roadmap:write") });
  if (page === "home" || page === "journey") return growthDashboard();
  if (page === "tasks") return journey();
  if (page === "orders" || page === "projects") return showOrders(page === "projects");
  if (page === "services") {
    const labels2 = commerceCopy(lang);
    const offerings = [
      ["AuraWeb", cap("website"), "/websites"],
      ["AuraMenu", cap("menu"), "/aura-menu"],
      ["AuraAds", cap("ads"), requestLink("Ad Management")],
      ["AuraShop", "NFC", "/shop"],
      [cap("automation"), cap("whatsapp"), requestLink("AI & Automation")]
    ];
    content(`<div class="hub-marketplace">${offerings.map(([name, description, href]) => `<article class="panel"><h2>${esc2(name)}</h2><p>${esc2(description)}</p><a class="secondary" href="${esc2(href)}">${esc2(href.startsWith("/contact") ? labels2.quote : href === "/shop" ? labels2.browse : t("openServices"))} \u2197</a></article>`).join("")}</div>`);
    return;
  }
  if (page === "resources") {
    content(`<section class="panel"><div class="resource-links"><a class="secondary" href="/shop">AuraShop</a><button type="button" class="secondary" data-resource="orders">${esc2(t("orders"))}</button>${moreNavigation.map((p) => `<button type="button" class="secondary" data-resource="${p}">${esc2(t(p))}</button>`).join("")}</div></section>`);
    document.querySelectorAll("[data-resource]").forEach((b) => b.onclick = () => {
      page = b.dataset.resource;
      render();
    });
    return;
  }
  if (page === "simulator") return simulator();
  if (page === "team") return team();
  if (page === "assistant") return assistant();
  if (page === "settings") {
    content(`<section class="panel"><h2>${t("security")}</h2><p>${esc2(me.email)} \xB7 ${me.verified ? t("verified") : t("verify")}</p>${authCapabilities.email ? `<a class="secondary" href="/hub/forgot">${t("reset")}</a>` : ""}${me.verified && authCapabilities.google ? `<p><a class="secondary" href="/api/customer/google/start?acceptTerms=true">${t("linkGoogle")}</a></p>` : ""}<hr>${button("team", "open-team", true)}${button("newWorkspace", "new-workspace", true)}</section>`);
    document.querySelector('[data-action="open-team"]').onclick = () => {
      page = "team";
      render();
    };
    document.querySelector('[data-action="new-workspace"]').onclick = () => {
      workspace = null;
      editing = false;
      render();
    };
    return;
  }
  const support = page === "support", reports = ["reports", "rewards"].includes(page);
  content(`<section class="panel quiet-panel"><span class="eyebrow">${reports ? "NOT CONNECTED" : "INTEGRATION PENDING"}</span><h2>${t(page)}</h2><p>${t(support ? "supportText" : reports ? "reportNote" : "unavailable")}</p><a class="primary" href="/contact">${t("contact")} \u2197</a></section>`);
}
async function showOrders(fulfillment) {
  const host = document.querySelector("#page-content"), labels2 = commerceCopy(lang);
  host.setAttribute("aria-busy", "true");
  try {
    const quoteLink = requestLink();
    const [{ orders }, requestData] = await Promise.all([
      api("/api/shop/orders?view=summary"),
      fulfillment ? api(endpoint("requests")) : null
    ]);
    const shown = fulfillment ? orders.filter((order) => order.paymentStatus === "paid" && order.productionStatus !== "delivered") : orders;
    host.innerHTML = `<section class="panel"><h2>${esc2(fulfillment ? labels2.fulfillment : labels2.orders)}</h2><p>${esc2(labels2.scope)}</p>
   ${shown.length ? orderMarkup(shown, lang, esc2) : `<p>${esc2(fulfillment ? labels2.noFulfillment : labels2.empty)}</p>`}
   <a class="secondary" href="/shop">${esc2(labels2.browse)} \u2197</a></section>
   ${requestData ? `<section class="panel"><h2>${esc2(labels2.requests)}</h2>
   ${requestData.requests.length ? `<ul class="hub-order-list">${requestData.requests.map((row) => `<li><strong>${esc2(row.service)}</strong><span>${esc2(labels2.received)}</span><bdi>${esc2(row.reference)}</bdi></li>`).join("")}</ul>` : `<p>${esc2(labels2.noRequests)}</p>`}
   <a class="secondary" href="${esc2(quoteLink)}">${esc2(labels2.quote)} \u2197</a></section>` : ""}`;
  } catch (error) {
    host.innerHTML = `<section class="panel"><p role="alert">${esc2(error.message)}</p></section>`;
  } finally {
    host.removeAttribute("aria-busy");
  }
}
async function askAuri(question, missionId) {
  const { data } = await api(endpoint("auri"), "POST", missionId ? { tool: "task", missionId } : { tool: "guidance", question, lang });
  if (data.reply) return data.reply;
  if (/customers|visibility|sales|müşteri|clients|عملاء/i.test(question) && data.priorities?.length) return data.priorities.map((m) => cap(m.capability)).join(" \xB7 ");
  const task = data.mission || data.nextAction;
  if (!task) return t("empty");
  const guide = missionGuide[task.capability], requirements = missionState(task, workspace.missions, workspace.profile).requirements;
  if (!missionId && /website|web site|site web|موقع/i.test(question)) {
    const website = workspace.missions.find((m) => m.capability === "website");
    if (website) {
      selectedMission = website.id;
      return [cap("website"), missionGuide.website[2], t("quote")].join(" \xB7 ");
    }
  }
  const action = task.nextAction === "Define scope or record your existing solution." ? guide?.[2] : task.nextAction;
  return [cap(task.capability), action, requirements.length ? requirements.map(cap).join(", ") : ""].filter(Boolean).join(" \xB7 ");
}
function growthDashboard() {
  renderRoadmap({
    host: document.querySelector("#page-content"),
    workspace,
    t,
    esc: esc2,
    cap,
    lang,
    view: roadmapView,
    selectedId: selectedMission,
    robot,
    requestLink,
    onSelect(id) {
      selectedMission = id;
      growthDashboard();
      const detail = document.getElementById("growth-focus");
      detail.focus({ preventScroll: !matchMedia("(max-width: 800px)").matches });
    },
    onView(view) {
      roadmapView = view;
      growthDashboard();
      document.querySelector(`[data-view="${view}"]`)?.focus();
    },
    onEdit(mission) {
      page = "tasks";
      render();
      const card = document.querySelector(`[data-mission="${mission.id}"]`);
      card?.querySelector("[data-action=edit]").click();
      card?.querySelector("input")?.focus();
    },
    async onSave(mission, input) {
      input.disabled = true;
      const workspaceId = workspace.organization.id;
      try {
        const { version, position } = mission;
        await api(endpoint("missions/" + mission.id), "PATCH", { version, position, status: input.value });
        if (workspace.organization.id === workspaceId) await loadWorkspace();
      } catch (error) {
        input.value = mission.status;
        input.disabled = false;
        toast(error.message);
      }
    },
    async onGenerate(event) {
      event.target.disabled = true;
      try {
        await api(endpoint("missions"), "POST", {});
        await loadWorkspace();
      } catch (error) {
        event.target.disabled = false;
        toast(error.message);
      }
    },
    onAsk: askAuri
  });
}
function journey() {
  const write = workspace.permissions.includes("roadmap:write");
  content(`<div class="panel-bar"><p>${t("noPurchase")}</p>${button("createJourney", "generate", false, !write)}</div><div class="journey-levels">${[1, 2, 3, 4, 5].map((l) => `<section class="journey-level"><div class="level-heading"><span class="level-number">0${l}</span><div><span class="eyebrow">${t("level")} ${l}</span><h2>${t(["foundation", "visibility", "conversion", "automation", "scale"][l - 1])}</h2></div></div>${workspace.missions.filter((m) => m.level === l).map((m) => `<article class="panel mission" data-mission="${m.id}"><div class="panel-bar"><h3>${esc2(m.objective === m.service ? cap(m.capability) : m.objective)}</h3><span class="pill">${t(m.status)}</span></div><p>${m.description.startsWith("Establish ") ? t("why") : esc2(m.description)}</p><p>${t("benefit")}</p><div class="mission-meta"><span>${t("quote")}</span><span>${t("priority")}: ${t(m.priority === 1 ? "high" : m.priority === 2 ? "medium" : "low")}</span>${m.dependencies?.length ? `<span>\u21B3 ${esc2(m.dependencies.map(cap).join(", "))}</span>` : ""}</div><div class="actions">${select("status", "status", ["planned", "in_progress", "done", "postponed"].map((v) => [v, t(v)]), m.status)}${button("up", "up", true, !write)}${button("down", "down", true, !write)}${button("edit", "edit", true, !write)}</div><p>${m.nextAction === "Define scope or record your existing solution." ? t("nextAction") + ": " + t("quote") : esc2(m.nextAction)}</p></article>`).join("") || `<p class="empty-level">${t("empty")}</p>`}</section>`).join("")}</div>`);
  document.querySelector('[data-action="generate"]').onclick = async (e) => {
    e.target.disabled = true;
    try {
      await api(endpoint("missions"), "POST", {});
      await loadWorkspace();
    } catch (e2) {
      toast(e2.message);
    }
  };
  document.querySelectorAll("[data-mission]").forEach((card) => {
    const m = workspace.missions.find((m2) => m2.id === card.dataset.mission), save = async (patch) => {
      try {
        await api(endpoint("missions/" + m.id), "PATCH", { version: m.version, status: m.status, position: m.position, ...patch });
        await loadWorkspace();
      } catch (e) {
        toast(e.message);
      }
    };
    card.querySelector("select").disabled = !write;
    card.querySelector("select").onchange = (e) => save({ status: e.target.value });
    card.querySelector('[data-action="up"]').onclick = () => save({ direction: "up" });
    card.querySelector('[data-action="down"]').onclick = () => save({ direction: "down" });
    card.querySelector('[data-action="edit"]').onclick = () => {
      card.insertAdjacentHTML("beforeend", `<form class="mission-edit">${field("objective", "objective", m.objective, "text", 'required maxlength="160"')}${field("description", "description", m.description, "text", 'required maxlength="1600"')}${field("nextAction", "nextAction", m.nextAction, "text", 'required maxlength="500"')}<button class="primary">${t("save")}</button></form>`);
      card.querySelector(".mission-edit").onsubmit = (e) => {
        e.preventDefault();
        save(Object.fromEntries(new FormData(e.target)));
      };
      card.querySelector('[data-action="edit"]').disabled = true;
    };
  });
}
var initialInputs = () => ({ visits: 1e3, leads: 30, closeRate: 20, customerValue: 100, margin: 40, monthlyCost: 50, setupCost: 200, solutions: [], currency: workspace.profile.currency || "USD", assumptions: [{ trafficLift: 5, leadRateLift: 5, closeRateLift: 0 }, { trafficLift: 15, leadRateLift: 10, closeRateLift: 5 }, { trafficLift: 30, leadRateLift: 20, closeRateLift: 10 }] });
function format(value, currency) {
  return value === null ? t("na") : new Intl.NumberFormat(lang, { maximumFractionDigits: 2, ...currency ? { style: "currency", currency } : {} }).format(value);
}
function resultsHTML(data) {
  return `<div class="table-scroll"><table><caption>${t("assumptions")} \xB7 ${esc2(data.inputs.currency)}</caption><thead><tr><th scope="col"></th>${data.scenarios.map((s) => `<th scope="col">${t(s.name)}</th>`).join("")}</tr></thead><tbody>${[["additionalCustomers", "customers"], ["additionalRevenue", "revenue", true], ["contributionProfit", "profit", true], ["netMonthly", "net", true], ["firstYearROI", "roi"], ["paybackMonths", "payback"]].map(([key, label, money]) => `<tr><th scope="row">${t(label)}</th>${data.scenarios.map((s) => `<td>${esc2(format(s[key], money ? data.inputs.currency : null))}${key === "firstYearROI" && s[key] !== null ? "%" : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
async function simulator() {
  scenarioInputs = scenarioInputs || initialInputs();
  const s = scenarioInputs, write = workspace.permissions.includes("simulation:write");
  content(`<div class="panel"><span class="eyebrow">${t("assumptions")}</span><p>${t("simNotice")}</p><p class="warning">${t("sample")}</p><details><summary>${t("formulaTitle")}</summary><p>${t("formula")}</p></details><form id="simulator-form"><div class="form-grid">${["visits", "leads", "closeRate", "customerValue", "margin", "monthlyCost", "setupCost"].map((k) => field(k, k, s[k], "number", `required min="0" max="${["margin", "closeRate"].includes(k) ? 100 : 1e9}" step="any"`)).join("")}${select("currency", "currency", ["USD", "EUR", "TRY", "TND"].map((c) => [c, c]), s.currency)}</div><fieldset class="solution-choices"><legend>${t("solutions")}</legend><div class="checks">${capabilities.map((c) => `<label class="check"><input type="checkbox" name="solutions" value="${c.id}" ${(s.solutions || []).includes(c.id) ? "checked" : ""}>${esc2(cap(c.id))}</label>`).join("")}</div></fieldset><div class="scenario-inputs">${s.assumptions.map((a, i) => `<fieldset><legend>${t(["conservative", "base", "ambitious"][i])}</legend>${["trafficLift", "leadRateLift", "closeRateLift"].map((k) => field(k + "-" + i, k, a[k], "number", 'required min="0" max="300" step="any"')).join("")}</fieldset>`).join("")}</div><button class="primary">${t("calculate")}</button><p class="form-error" role="alert"></p></form><div id="sim-results">${result ? resultsHTML(result) : ""}</div><form id="save-scenario" ${result ? "" : "hidden"} class="save-scenario">${field("name", "scenarioName", "", "text", 'required maxlength="120"')}<button class="primary" ${write ? "" : "disabled"}>${t("saveScenario")}</button>${button("export", "export", true)}${button("addSolutions", "add-solutions", true, !workspace.permissions.includes("roadmap:write"))}</form></div><section class="panel"><h2>${t("history")}</h2><div id="scenario-history">\u2026</div></section>`);
  document.querySelector("#simulator-form").onsubmit = (e) => {
    e.preventDefault();
    const form = e.target, data2 = new FormData(form), inputs = { currency: data2.get("currency"), solutions: data2.getAll("solutions"), assumptions: [0, 1, 2].map((i) => Object.fromEntries(["trafficLift", "leadRateLift", "closeRateLift"].map((k) => [k, Number(data2.get(k + "-" + i))]))) };
    for (const k of ["visits", "leads", "closeRate", "customerValue", "margin", "monthlyCost", "setupCost"]) inputs[k] = Number(data2.get(k));
    try {
      result = simulate(inputs);
      scenarioInputs = inputs;
      document.querySelector("#sim-results").innerHTML = resultsHTML(result);
      document.querySelector("#save-scenario").hidden = false;
      form.querySelector('[role="alert"]').textContent = "";
    } catch (error) {
      form.querySelector('[role="alert"]').textContent = error.message;
    }
  };
  document.querySelector("#simulator-form").addEventListener("input", () => {
    result = null;
    document.querySelector("#save-scenario").hidden = true;
    document.querySelector("#sim-results").innerHTML = "";
  });
  document.querySelector('[data-action="add-solutions"]').onclick = async () => {
    try {
      if (!result.inputs.solutions.length) {
        toast(t("solutions"));
        return;
      }
      await api(endpoint("missions"), "POST", { services: result.inputs.solutions });
      toast(t("saved"));
    } catch (e) {
      toast(e.message);
    }
  };
  document.querySelector("#save-scenario").onsubmit = async (e) => {
    e.preventDefault();
    const b = e.target.querySelector("button");
    b.disabled = true;
    try {
      await api(endpoint("scenarios"), "POST", { name: new FormData(e.target).get("name"), inputs: result.inputs });
      toast(t("saved"));
      await simulator();
    } catch (e2) {
      toast(e2.message);
    } finally {
      b.disabled = false;
    }
  };
  document.querySelector('[data-action="export"]').onclick = () => download(result, "aura-growth-scenario.json");
  const data = await api(endpoint("scenarios"));
  document.querySelector("#scenario-history").innerHTML = data.scenarios.map((s2) => `<button class="history-item secondary" data-scenario="${s2.id}"><span>${esc2(s2.name)}</span><small>${esc2(s2.createdAt)}</small> \u2197</button>`).join("") || `<p>${t("empty")}</p>`;
  document.querySelectorAll("[data-scenario]").forEach((b) => b.onclick = () => {
    const saved = data.scenarios.find((s2) => s2.id === b.dataset.scenario);
    result = saved.result;
    scenarioInputs = saved.inputs;
    simulator().catch((e) => toast(e.message));
  });
}
function download(data, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })), a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function team() {
  if (!workspace.organization.owner || !me.verified) {
    content(`<section class="panel"><h2>${t("teamTitle")}</h2><p>${t("teamText")}</p><p>${t(!me.verified ? "verifiedRequired" : "readOnly")}</p></section>`);
    return;
  }
  const data = await api(endpoint("team"));
  content(`<section class="team-intro"><div><span class="eyebrow">AURA TEAM ACCESS</span><h2>${t("teamTitle")}</h2><p>${t("teamText")}</p></div><div class="price">$5<small>USD / month / member</small></div></section><p class="warning">${t("blocked")}</p><section class="panel"><h2>${t("invite")}</h2><form id="invite-form" class="form-grid">${field("email", "email", "", "email", 'required maxlength="254"')}${select("role", "role", ["viewer", "member", "admin"].map((v) => [v, t(v)]), "viewer")}${field("message", "message", "", "text", 'maxlength="800"')}<div class="field"><span>${t("permissions")}</span><p id="role-explanation"></p></div><button class="primary">${t("invite")}</button><p class="form-error" role="alert"></p></form></section><section class="panel"><div class="panel-bar"><h2>${t("team")}</h2><span class="pill">${data.members.filter((m) => m.status !== "removed").length} ${t("seats")}</span></div><p>${t("billingPrivate")}</p><div class="table-scroll"><table><thead><tr>${["name", "email", "role", "status", "subscription", "paymentDate"].map((k) => `<th scope="col">${t(k)}</th>`).join("")}<th scope="col">${t("edit")}</th></tr></thead><tbody>${data.members.map((m) => `<tr data-member="${m.id}"><td>${esc2(m.name)}</td><td>${esc2(m.email)}</td><td>${esc2(t(m.role))}</td><td>${esc2(t(m.status))}</td><td>${esc2(m.subscriptionStatus ? t(m.subscriptionStatus) : t("awaiting"))}</td><td>${m.nextPaymentAt ? esc2(new Date(m.nextPaymentAt * 1e3).toLocaleDateString(lang)) : "\u2014"}</td><td>${m.status === "removed" ? "" : button("edit", "edit-member", true) + button("remove", "remove-member", true)}</td></tr>`).join("") || `<tr><td colspan="7">${t("empty")}</td></tr>`}</tbody></table></div><h3>${t("invite")}</h3>${data.invitations.map((i) => `<div class="invitation-row"><div><strong>${esc2(i.email)}</strong><small>${esc2(t(i.role))} \xB7 ${esc2(t(i.status))} \xB7 ${esc2(t(i.deliveryStatus))}</small></div>${i.status === "pending" ? `<div class="actions"><button class="secondary" data-cancel="${i.id}">${t("cancelInvite")}</button><button class="secondary" data-resend="${i.id}">${t("resend")}</button></div>` : ""}</div>`).join("") || `<p>${t("empty")}</p>`}<details><summary>${t("activity")}</summary><div id="activity"></div></details></section>`);
  const explain = () => {
    const role = document.querySelector('[name="role"]').value;
    document.querySelector("#role-explanation").textContent = role === "admin" ? ["profile", "journey", "simulator", "assistant"].map(t).join(" \xB7 ") : role === "member" ? [t("readOnly"), t("assistant")].join(" \xB7 ") : t("readOnly");
  };
  explain();
  document.querySelector('[name="role"]').onchange = explain;
  document.querySelector("#invite-form").onsubmit = async (e) => {
    e.preventDefault();
    const b = e.target.querySelector("button");
    b.disabled = true;
    try {
      await api(endpoint("invitations"), "POST", Object.fromEntries(new FormData(e.target)));
      toast(t("saved"));
      await team();
    } catch (error) {
      e.target.querySelector('[role="alert"]').textContent = error.message;
    } finally {
      b.disabled = false;
    }
  };
  document.querySelectorAll("[data-cancel]").forEach((b) => b.onclick = async () => {
    try {
      await api(endpoint("invitations/" + b.dataset.cancel), "DELETE");
      await team();
    } catch (e) {
      toast(e.message);
    }
  });
  document.querySelectorAll("[data-resend]").forEach((b) => b.onclick = async () => {
    b.disabled = true;
    try {
      const i = data.invitations.find((i2) => i2.id === b.dataset.resend);
      await api(endpoint("invitations/" + i.id), "DELETE");
      await api(endpoint("invitations"), "POST", { email: i.email, role: i.role, message: "" });
      await team();
    } catch (e) {
      toast(e.message);
      b.disabled = false;
    }
  });
  document.querySelectorAll("[data-member]").forEach((row) => {
    const m = data.members.find((m2) => m2.id === row.dataset.member);
    row.querySelector('[data-action="remove-member"]')?.addEventListener("click", async () => {
      if (!confirm(t("removeConfirm"))) return;
      try {
        const r = await api(endpoint("team/" + m.id), "DELETE");
        if (r.subscriptionCancellation === "BLOCKED_PROVIDER_RECONCILIATION_REQUIRED") toast(r.subscriptionCancellation);
        await team();
      } catch (e) {
        toast(e.message);
      }
    });
    row.querySelector('[data-action="edit-member"]')?.addEventListener("click", () => {
      const cell = row.lastElementChild;
      cell.innerHTML = `<form>${select("role", "role", rolesForUI(), m.role)}<fieldset><legend>${t("restrict")}</legend>${["profile:write", "roadmap:write", "simulation:write", "workspace:read", "auri:use"].map((p) => `<label class="check"><input type="checkbox" name="denied" value="${p}" ${m.deniedPermissions.includes(p) ? "checked" : ""}>${esc2(t({ "profile:write": "profile", "roadmap:write": "journey", "simulation:write": "simulator", "workspace:read": "home", "auri:use": "assistant" }[p]))}</label>`).join("")}</fieldset><button class="primary">${t("save")}</button></form>`;
      cell.querySelector("form").onsubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        try {
          await api(endpoint("team/" + m.id), "PATCH", { role: f.get("role"), deniedPermissions: f.getAll("denied") });
          await team();
        } catch (e2) {
          toast(e2.message);
        }
      };
    });
  });
  const a = await api(endpoint("activity"));
  document.querySelector("#activity").innerHTML = a.events.map((e) => `<p>${esc2(e.created_at)} \xB7 ${esc2(e.action)}</p>`).join("") || t("empty");
}
var rolesForUI = () => ["viewer", "member", "admin"].map((v) => [v, t(v)]);
function assistant() {
  const labels2 = commerceCopy(lang);
  content(`<section class="panel assistant-panel">${robot()}<div><span class="eyebrow">AURI</span><h2>${t("aiRules")}</h2><p>${t("aiNotice")}</p><div class="actions">${button("diagnosis", "diagnosis", true)}${button("recommend", "next-action", true)}${workspace.organization.owner ? '<button type="button" class="secondary" data-action="order-status">' + esc2(labels2.ask) + "</button>" : ""}</div><div id="auri-response" role="status"></div></div></section>`);
  const response = document.querySelector("#auri-response");
  for (const [action, tool] of [["diagnosis", "diagnosis"], ["next-action", "next_action"], ["order-status", "order_status"]]) {
    document.querySelector(`[data-action="${action}"]`)?.addEventListener("click", async (e) => {
      const control = e.currentTarget;
      control.disabled = true;
      try {
        const { data } = await api(endpoint("auri"), "POST", { tool });
        if (tool === "diagnosis") response.innerHTML = `<h3>${t("missing")}</h3><ul>${data.missing.map((k) => `<li>${esc2(cap(k))}</li>`).join("")}</ul>`;
        else if (tool === "order_status") response.innerHTML = data.orders.length ? orderMarkup(data.orders, lang, esc2) : esc2(labels2.empty);
        else {
          const mission = data.nextAction;
          const guide = mission && missionGuide[mission.capability];
          if (!response.isConnected) return;
          response.innerHTML = mission ? `<h3>${esc2(cap(mission.capability))}</h3><p>${esc2(guide?.[2] || mission.nextAction)}</p>
      ${guide?.[0] ? `<a class="secondary" href="${esc2(requestLink(guide[0], mission.objective))}">${esc2(labels2.quote)} \u2197</a>` : ""}` : esc2(t("empty"));
        }
      } catch (error) {
        if (response.isConnected) toast(error.message);
      } finally {
        control.disabled = false;
      }
    });
  }
}
async function loadWorkspace(id) {
  result = null;
  scenarioInputs = null;
  workspace = await api("/api/hub/workspaces/" + (id || workspace.organization.id));
  render();
}
async function load() {
  try {
    const data = await api("/api/hub/workspaces");
    me = data.user;
    if (["login", "signup"].includes(route) && resumeShop()) return;
    workspaces = data.workspaces;
    if (workspaces.length) {
      const selected = workspace && workspaces.find((w) => w.id === workspace.organization.id);
      workspace = await api("/api/hub/workspaces/" + (selected?.id || workspaces[0].id));
    }
    if (route === "settings") {
      page = "settings";
      route = "";
    }
    if (route === "signup" || route === "login") route = "";
    render();
  } catch (e) {
    if (e.status === 401) {
      me = null;
      render();
    } else {
      gateFrame(`<section class="panel"><h1>${t("brand")}</h1><p role="alert">${esc2(e.message)}</p><a href="/account">${t("openAccount")}</a></section>`);
    }
  }
}
async function start() {
  if (["verify", "reset", "forgot"].includes(route)) {
    render();
    return;
  }
  authCapabilities = await api("/api/customer/capabilities").catch(() => ({}));
  await load();
}
start();
