// src/hub/settings-view.js
var settingsCopy = {
  en: ["Account", "Change password", "Current password", "New password", "Change email", "New email", "Send confirmation links", "Confirm from both inboxes.", "Email confirmation is currently unavailable.", "Preferences", "Workspace", "Password changed. Sign in again.", "Links sent. Confirm from both inboxes.", "Confirm email change", "Confirmation saved. Open the link from your other inbox.", "Email updated. Sign in with the new address.", "Forgot your password?"],
  fr: ["Compte", "Modifier le mot de passe", "Mot de passe actuel", "Nouveau mot de passe", "Modifier l\u2019adresse e-mail", "Nouvelle adresse e-mail", "Envoyer les liens", "Confirmez depuis les deux bo\xEEtes.", "La confirmation par e-mail est indisponible.", "Pr\xE9f\xE9rences", "Espace de travail", "Mot de passe chang\xE9. Reconnectez-vous.", "Liens envoy\xE9s. Confirmez depuis les deux bo\xEEtes.", "Confirmer le changement d\u2019e-mail", "Confirmation enregistr\xE9e. Ouvrez le lien envoy\xE9 \xE0 l\u2019autre adresse.", "Adresse modifi\xE9e. Connectez-vous avec la nouvelle adresse.", "Mot de passe oubli\xE9 ?"],
  tr: ["Hesap", "\u015Eifreyi de\u011Fi\u015Ftir", "Mevcut \u015Fifre", "Yeni \u015Fifre", "E-postay\u0131 de\u011Fi\u015Ftir", "Yeni e-posta", "Onay ba\u011Flant\u0131lar\u0131n\u0131 g\xF6nder", "Her iki posta kutusundan da onaylay\u0131n.", "E-posta onay\u0131 \u015Fu anda kullan\u0131lam\u0131yor.", "Tercihler", "\xC7al\u0131\u015Fma alan\u0131", "\u015Eifre de\u011Fi\u015Ftirildi. Tekrar giri\u015F yap\u0131n.", "Ba\u011Flant\u0131lar g\xF6nderildi. Her iki posta kutusundan onaylay\u0131n.", "E-posta de\u011Fi\u015Fikli\u011Fini onayla", "Onay kaydedildi. Di\u011Fer posta kutusundaki ba\u011Flant\u0131y\u0131 a\xE7\u0131n.", "E-posta g\xFCncellendi. Yeni adresle giri\u015F yap\u0131n.", "\u015Eifrenizi mi unuttunuz?"],
  ar: ["\u0627\u0644\u062D\u0633\u0627\u0628", "\u063A\u064A\u0651\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", "\u063A\u064A\u0651\u0631 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u062C\u062F\u064A\u062F", "\u0623\u0631\u0633\u0644 \u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u062A\u0623\u0643\u064A\u062F", "\u0623\u0643\u0651\u062F \u0645\u0646 \u0635\u0646\u062F\u0648\u0642\u064E\u064A \u0627\u0644\u0628\u0631\u064A\u062F.", "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u064B\u0627.", "\u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A", "\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644", "\u062A\u063A\u064A\u0651\u0631\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627.", "\u0623\u064F\u0631\u0633\u0644\u062A \u0627\u0644\u0631\u0648\u0627\u0628\u0637. \u0623\u0643\u0651\u062F \u0645\u0646 \u0635\u0646\u062F\u0648\u0642\u064E\u064A \u0627\u0644\u0628\u0631\u064A\u062F.", "\u0623\u0643\u0651\u062F \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0628\u0631\u064A\u062F", "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638. \u0627\u0641\u062A\u062D \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064A \u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0622\u062E\u0631.", "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0628\u0631\u064A\u062F. \u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062C\u062F\u064A\u062F.", "\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F"]
};
var accountSettingsCopy = (lang2) => settingsCopy[lang2] || settingsCopy.en;
function renderAccountSettings({ host, user, lang: lang2, esc: esc3, t: t2, api: api2, link: link2, workspace: workspace2, canEmail, canLinkGoogle, onNewWorkspace, onSignIn, onLanguage }) {
  const [account, password, current, newPassword, email, newEmail, send, confirmBoth, unavailable, preferences, space, passwordSaved, linksSent, , , , forgot] = accountSettingsCopy(lang2);
  const currentField = `<label class="field">${current}<input name="currentPassword" type="password" required maxlength="200" autocomplete="current-password"></label>`;
  host.innerHTML = `<div class="hub-settings-grid">
 <section class="panel hub-settings-account"><h2>${account}</h2><div class="hub-account-address"><strong>${esc3(user.email)}</strong><span>${esc3(t2(user.verified ? "verified" : "verify"))}</span></div>
 <details class="hub-settings-form"><summary>${password}</summary>
 <form data-account-change="password">${currentField}<label class="field">${newPassword}<input name="password" type="password" required minlength="12" maxlength="72" autocomplete="new-password"></label><button type="submit" class="growth-primary">${password}</button></form>
 ${canEmail ? `<a class="hub-settings-link" href="/hub/forgot">${forgot}</a>` : ""}</details>
 <details class="hub-settings-form"><summary>${email}</summary>
 ${canEmail ? `<p>${confirmBoth}</p><form data-account-change="email">${currentField}<label class="field">${newEmail}<input name="email" type="email" required maxlength="254" autocomplete="email"></label><button type="submit" class="growth-primary">${send}</button></form>` : `<p>${unavailable}</p>`}</details>
 ${canLinkGoogle ? `<a class="growth-secondary" href="/api/customer/google/start?acceptTerms=true">${esc3(t2("linkGoogle"))}</a>` : ""}
 <p class="hub-settings-feedback" role="status"></p></section>
 <div class="hub-settings-side"><section class="panel"><h2>${preferences}</h2><label class="field">${{ en: "Language", fr: "Langue", tr: "Dil", ar: "\u0627\u0644\u0644\u063A\u0629" }[lang2]}
 <select data-settings-language>${[["en", "English"], ["fr", "Fran\xE7ais"], ["tr", "T\xFCrk\xE7e"], ["ar", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"]].map(([value, label]) => `<option value="${value}" ${value === lang2 ? "selected" : ""}>${label}</option>`).join("")}</select></label><div class="hub-settings-links">
 ${workspace2 ? `<a href="${esc3(link2("assistant"))}">${esc3(t2("auri"))} \u2197</a>` : ""}<a href="/account">${esc3(t2("orders"))} \u2197</a></div></section>
 <section class="panel"><h2>${space}</h2><div class="hub-settings-links">
 ${workspace2 ? `<a href="${esc3(link2("profile"))}">${esc3(t2("profile"))} \u2197</a><a href="${esc3(link2("team"))}">${esc3(t2("team"))} \u2197</a>` : ""}
 <button type="button" class="growth-secondary" data-add-workspace>${esc3(t2("newWorkspace"))}</button></div></section></div></div>`;
  const feedback = host.querySelector("[role=status]");
  host.querySelector("[data-add-workspace]").onclick = onNewWorkspace;
  host.querySelector("[data-settings-language]").onchange = (event) => onLanguage(event.target.value);
  for (const form of host.querySelectorAll("[data-account-change]")) {
    form.onsubmit = async (event) => {
      event.preventDefault();
      const action = form.dataset.accountChange, submit = form.querySelector("button");
      if (submit.disabled) return;
      submit.disabled = true;
      feedback.textContent = "";
      try {
        await api2("/api/customer/change-" + action, "POST", Object.fromEntries(new FormData(form)));
        form.reset();
        if (action === "password") {
          onSignIn(passwordSaved);
          return;
        }
        feedback.textContent = linksSent;
      } catch (error) {
        feedback.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    };
  }
}

// src/hub/auri-controller.js
var channels = /* @__PURE__ */ new Map();
var subscribers = /* @__PURE__ */ new Set();
function channel(scope) {
  if (!channels.has(scope)) channels.set(scope, { active: /* @__PURE__ */ new Map(), outcome: "idle", timer: null });
  return channels.get(scope);
}
function notify(scope) {
  const state2 = channel(scope);
  const phase = [...state2.active.values()].at(-1)?.phase || state2.outcome;
  for (const subscriber of subscribers) subscriber(scope, phase);
}
function watchAuri(scope, listener) {
  const subscriber = (key, phase) => {
    if (key === scope) listener(phase);
  };
  subscribers.add(subscriber);
  notify(scope);
  return () => subscribers.delete(subscriber);
}
function pulseAuri(scope, phase, duration = 1800) {
  const state2 = channel(scope);
  clearTimeout(state2.timer);
  state2.outcome = phase;
  notify(scope);
  state2.timer = setTimeout(() => {
    state2.outcome = "idle";
    notify(scope);
    if (!state2.active.size) channels.delete(scope);
  }, duration);
}
async function runAuri(scope, phase, operation, success = "success") {
  const state2 = channel(scope);
  const token = /* @__PURE__ */ Symbol();
  const job = { phase, completed: false };
  const latest = () => [...state2.active.keys()].at(-1) === token;
  state2.active.set(token, job);
  clearTimeout(state2.timer);
  state2.outcome = "idle";
  const typing = phase === "working" ? setTimeout(() => {
    if (!job.completed) {
      job.phase = "typing";
      notify(scope);
    }
  }, 420) : null;
  notify(scope);
  try {
    const result2 = await operation();
    if (latest()) pulseAuri(scope, success);
    return result2;
  } catch (error) {
    if (latest()) pulseAuri(scope, "error");
    throw error;
  } finally {
    job.completed = true;
    clearTimeout(typing);
    state2.active.delete(token);
    notify(scope);
    if (!state2.active.size && state2.outcome === "idle") channels.delete(scope);
  }
}

// src/hub/auri-companion.js
var auriCharacter = (level2 = 1, { variant } = {}) => {
  const value = Number.isInteger(level2) && level2 >= 1 && level2 <= 7 ? level2 : 1;
  return `<auri-character class="auri" aria-hidden="true" ${["login", "guide"].includes(variant) ? `data-variant="${variant}"` : ""} level="${value}"><img alt="" width="256" height="256" loading="lazy" decoding="async" src="/media/auri/level-${value}.webp"></auri-character>`;
};
function connectAuri(host, scope, labels3) {
  const status = host.querySelector("[data-auri-status]");
  const character = host.querySelector("auri-character");
  if (!character) return () => {
  };
  return watchAuri(scope, (phase) => {
    character.dataset.phase = phase;
    if (status) status.textContent = labels3[phase] || "";
    host.querySelector("details")?.toggleAttribute("data-auri-pending", ["thinking", "working", "typing", "drafting"].includes(phase));
  });
}

// src/hub/service-ranking.js
var categories = [
  { pattern: /whatsapp/i, kind: "whatsapp", symbol: "WA", capabilities: ["whatsapp"] },
  { pattern: /qr|menu|menü/i, kind: "menu", symbol: "QR", capabilities: ["menu"] },
  { pattern: /google\s*(maps?|business)|business\s*discovery|local\s*listing/i, kind: "discovery", symbol: "MAP", capabilities: ["discovery"] },
  { pattern: /review|rating|avis|yorum/i, kind: "reviews", symbol: "\u2605", capabilities: ["reviews"] },
  { pattern: /google\s*ads|search\s*advert|ad\s*management|campaign|publicit/i, kind: "ads", symbol: "ADS", capabilities: ["ads"] },
  { pattern: /seo|search\s*optim/i, kind: "seo", symbol: "SEO", capabilities: ["seo"] },
  { pattern: /e-?mail|e-posta|courriel|mailbox/i, kind: "email", symbol: "@", capabilities: ["email"] },
  { pattern: /crm|customer\s*management|lead\s*management|pipeline/i, kind: "crm", symbol: "CRM", capabilities: ["crm", "leads"] },
  { pattern: /hosting|domain|security|ssl|website\s*care|maintenance/i, kind: "infrastructure", symbol: "DNS", capabilities: ["domain", "hosting"] },
  { pattern: /automat|chatbot|ai\s*assistant|workflow|spinflow/i, kind: "automation", symbol: "AI", capabilities: ["automation", "followups"] },
  { pattern: /nfc|smart\s*card/i, kind: "card", symbol: "NFC", capabilities: ["branding"] },
  { pattern: /web|website|site|e-?commerce|online\s*shop/i, kind: "website", symbol: "WEB", capabilities: ["website"] },
  { pattern: /brand|logo|video|photo|design|graphic/i, kind: "creative", symbol: "\u2726", capabilities: ["branding"] }
];
var classify = (name) => categories.find((x) => x.pattern.test(String(name || ""))) || { kind: "service", symbol: "\u2726", capabilities: [] };
var baseImportance = { website: 100, infrastructure: 90, email: 85, discovery: 80, whatsapp: 70, seo: 68, crm: 65, reviews: 60, automation: 55, ads: 50, menu: 35, card: 25, creative: 20, service: 10 };
var sectorBoost = {
  restaurant: { menu: 90, discovery: 35, reviews: 25, whatsapp: 23 },
  real_estate: { crm: 75, website: 30, whatsapp: 30, ads: 27 },
  ecommerce: { website: 35, crm: 30, ads: 30, reviews: 30, whatsapp: 25 },
  services: { email: 20, crm: 20, website: 15, discovery: 15 }
};
var validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:$|[T ])/.test(value)) return null;
  const short = value.slice(0, 10);
  const date = Date.parse(short + "T00:00:00Z");
  return Number.isFinite(date) && new Date(date).toISOString().slice(0, 10) === short ? date : null;
};
function rankServicesForBusiness(records, { profile = {}, missions = [], now = Date.now() } = {}) {
  const sector = String(profile.industry || "").toLowerCase();
  const text = [profile.goals, profile.difficulties].filter(Boolean).join(" ").toLowerCase();
  const focus = new Set((Array.isArray(missions) ? missions : []).filter((m) => !m.optional && !["done", "postponed", "cancelled"].includes(m.status)).filter((m) => Number(m.priority) === 1 || ["in_progress", "active"].includes(m.status)).map((m) => m.capability || m.id));
  const score = (record) => {
    const { kind, capabilities: capabilities2 } = classify(record.name);
    let value = (baseImportance[kind] || 10) + (sectorBoost[sector]?.[kind] || 0);
    if (capabilities2.some((c) => focus.has(c))) value += 80;
    if (/reservation|booking|menu/.test(text) && kind === "menu") value += 30;
    if (/leads|sales|clients|customer|booking|appointment/.test(text) && ["crm", "whatsapp", "website"].includes(kind)) value += 20;
    if (/automat|manual|time|efficien|repetit/.test(text) && ["automation", "whatsapp"].includes(kind)) value += 35;
    if (/visib|traffic|search|find|local/.test(text) && ["discovery", "seo", "ads"].includes(kind)) value += 30;
    const status = String(record.status || "").toLowerCase();
    if (["waiting", "waiting_client", "needs_action", "review", "quote_ready"].includes(status)) value += 1e3;
    else if (["in_progress", "production"].includes(status)) value += 70;
    const deadline = validDate(record.dueDate);
    if (deadline !== null && deadline < now + 864e5 * 14) value += deadline < now ? 500 : 260;
    const renewal = validDate(record.renewalDate);
    if (renewal !== null && renewal < now + 864e5 * 14) value += renewal < now ? 420 : 230;
    return value;
  };
  return [...records].sort((a, b) => score(b) - score(a) || String(a.name || "").localeCompare(String(b.name || "")) || String(a.id || "").localeCompare(String(b.id || "")));
}

// src/hub/service-deliverables.js
var deliverables = {
  web: {
    en: ["A website customers can use on their phone", "A mobile-ready website with your key pages", "A clear way to call, message, or enquire", "Launch and access handover"],
    fr: ["Un site accessible sur t\xE9l\xE9phone", "Un site adapt\xE9 au mobile avec vos pages principales", "Un moyen simple de vous joindre", "Mise en ligne et remise des acc\xE8s"],
    tr: ["M\xFC\u015Fterilerinizin telefondan kullanabilece\u011Fi bir site", "Temel sayfalar\u0131 i\xE7eren mobil uyumlu site", "Arama, mesaj veya ileti\u015Fim se\xE7ene\u011Fi", "Yay\u0131nlama ve eri\u015Fim devri"],
    ar: ["\u0645\u0648\u0642\u0639 \u064A\u0639\u0645\u0644 \u0639\u0644\u0649 \u0647\u0648\u0627\u062A\u0641 \u0639\u0645\u0644\u0627\u0626\u0643", "\u0645\u0648\u0642\u0639 \u0645\u062A\u0648\u0627\u0641\u0642 \u0645\u0639 \u0627\u0644\u0647\u0627\u062A\u0641 \u064A\u0636\u0645 \u0635\u0641\u062D\u0627\u062A\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629", "\u0637\u0631\u064A\u0642\u0629 \u0648\u0627\u0636\u062D\u0629 \u0644\u0644\u0627\u062A\u0635\u0627\u0644 \u0623\u0648 \u0627\u0644\u0645\u0631\u0627\u0633\u0644\u0629", "\u0625\u0637\u0644\u0627\u0642 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0648\u0635\u0648\u0644"]
  },
  email: {
    en: ["Email with your business name on it", "A mailbox such as contact@yourbusiness.com", "Domain email records (MX, SPF, DKIM and DMARC as supported)", "Sign-in and mailbox handover instructions"],
    fr: ["Une adresse e-mail au nom de votre entreprise", "Une bo\xEEte comme contact@yourbusiness.com", "Enregistrements du domaine selon le fournisseur", "Consignes de connexion et remise de la bo\xEEte"],
    tr: ["\u0130\u015Fletmenizin ad\u0131n\u0131 ta\u015F\u0131yan e-posta", "contact@yourbusiness.com gibi bir posta kutusu", "Sa\u011Flay\u0131c\u0131n\u0131n destekledi\u011Fi alan ad\u0131 kay\u0131tlar\u0131", "Oturum a\xE7ma ve posta kutusu teslim talimatlar\u0131"],
    ar: ["\u0628\u0631\u064A\u062F \u064A\u062D\u0645\u0644 \u0627\u0633\u0645 \u0646\u0634\u0627\u0637\u0643", "\u0635\u0646\u062F\u0648\u0642 \u0628\u0631\u064A\u062F \u0645\u062B\u0644 contact@yourbusiness.com", "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0628\u0631\u064A\u062F \u0644\u0644\u0646\u0637\u0627\u0642 \u0648\u0641\u0642 \u062F\u0639\u0645 \u0627\u0644\u0645\u0632\u0648\u062F", "\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0635\u0646\u062F\u0648\u0642"]
  },
  menu: {
    en: ["A menu customers open from their phone", "A mobile menu with categories, items and prices", "A shareable menu link and printable QR code", "Guidance for updating your menu"],
    fr: ["Un menu \xE0 ouvrir sur t\xE9l\xE9phone", "Un menu mobile avec cat\xE9gories, articles et prix", "Un lien et un code QR imprimable", "Des instructions pour mettre \xE0 jour le menu"],
    tr: ["Telefondan a\xE7\u0131lan bir men\xFC", "Kategori, \xFCr\xFCn ve fiyatlar\u0131 i\xE7eren mobil men\xFC", "Payla\u015F\u0131labilir ba\u011Flant\u0131 ve yazd\u0131r\u0131labilir QR kod", "Men\xFCy\xFC g\xFCncelleme talimatlar\u0131"],
    ar: ["\u0642\u0627\u0626\u0645\u0629 \u064A\u0641\u062A\u062D\u0647\u0627 \u0627\u0644\u0639\u0645\u064A\u0644 \u0639\u0644\u0649 \u0647\u0627\u062A\u0641\u0647", "\u0642\u0627\u0626\u0645\u0629 \u0644\u0644\u0647\u0627\u062A\u0641 \u0628\u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0648\u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631", "\u0631\u0627\u0628\u0637 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0648\u0631\u0645\u0632 QR \u0644\u0644\u0637\u0628\u0627\u0639\u0629", "\u0625\u0631\u0634\u0627\u062F\u0627\u062A \u0644\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0642\u0627\u0626\u0645\u0629"]
  },
  chat: {
    en: ["A WhatsApp flow that handles routine questions", "A welcome flow with your common questions", "Shortcuts for enquiries, menus or bookings as agreed", "Testing and instructions for handing over to your team"],
    fr: ["Un parcours WhatsApp pour les questions courantes", "Un accueil avec vos questions fr\xE9quentes", "Des raccourcis convenus vers le menu, les demandes ou les r\xE9servations", "Des tests et des instructions pour votre \xE9quipe"],
    tr: ["S\u0131k sorular\u0131 kar\u015F\u0131layan WhatsApp ak\u0131\u015F\u0131", "S\u0131k sorulan sorularla kar\u015F\u0131lama ak\u0131\u015F\u0131", "Anla\u015F\u0131lan men\xFC, talep veya rezervasyon k\u0131sayollar\u0131", "Test ve ekibe devir talimatlar\u0131"],
    ar: ["\u0645\u0633\u0627\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629", "\u062A\u0631\u062D\u064A\u0628 \u0648\u0625\u062C\u0627\u0628\u0627\u062A \u0644\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629", "\u0627\u062E\u062A\u0635\u0627\u0631\u0627\u062A \u0644\u0644\u0642\u0627\u0626\u0645\u0629 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0623\u0648 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0627\u062A\u0641\u0627\u0642", "\u0627\u062E\u062A\u0628\u0627\u0631 \u0648\u062A\u0639\u0644\u064A\u0645\u0627\u062A \u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0625\u0644\u0649 \u0641\u0631\u064A\u0642\u0643"]
  },
  brand: {
    en: ["A consistent identity across your business", "A logo direction with the agreed variations", "A colour and typography guide", "Exported files for the agreed uses"],
    fr: ["Une identit\xE9 coh\xE9rente pour votre entreprise", "Un logo et les variantes convenues", "Un guide des couleurs et de la typographie", "Des fichiers export\xE9s pour les usages convenus"],
    tr: ["\u0130\u015Fletmenizin her yerinde tutarl\u0131 kimlik", "Logo ve kararla\u015Ft\u0131r\u0131lan varyasyonlar", "Renk ve tipografi rehberi", "Kararla\u015Ft\u0131r\u0131lan kullan\u0131mlar i\xE7in dosyalar"],
    ar: ["\u0647\u0648\u064A\u0629 \u0645\u0648\u062D\u062F\u0629 \u0644\u0646\u0634\u0627\u0637\u0643", "\u0634\u0639\u0627\u0631 \u0648\u0627\u0644\u0646\u0633\u062E \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647\u0627", "\u062F\u0644\u064A\u0644 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0648\u0627\u0644\u062E\u0637\u0648\u0637", "\u0645\u0644\u0641\u0627\u062A \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647\u0627"]
  },
  hosting: {
    en: ["A business-owned domain connected to your site", "Domain registration or connection and DNS setup", "Hosting and HTTPS setup for the agreed plan", "An access and renewal handover"],
    fr: ["Un domaine \xE0 votre nom reli\xE9 \xE0 votre site", "Enregistrement ou connexion du domaine et configuration DNS", "H\xE9bergement et HTTPS selon la formule convenue", "Remise des acc\xE8s et informations de renouvellement"],
    tr: ["Sitenize ba\u011Fl\u0131 ve i\u015Fletmenize ait alan ad\u0131", "Alan ad\u0131 kayd\u0131 veya ba\u011Flant\u0131s\u0131 ve DNS kurulumu", "Anla\u015F\u0131lan pakete g\xF6re hosting ve HTTPS kurulumu", "Eri\u015Fim ve yenileme bilgilerinin teslimi"],
    ar: ["\u0646\u0637\u0627\u0642 \u0628\u0627\u0633\u0645 \u0646\u0634\u0627\u0637\u0643 \u0645\u0631\u062A\u0628\u0637 \u0628\u0645\u0648\u0642\u0639\u0643", "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0646\u0637\u0627\u0642 \u0623\u0648 \u0631\u0628\u0637\u0647 \u0648\u0625\u0639\u062F\u0627\u062F DNS", "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629 \u0648HTTPS \u062D\u0633\u0628 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0645\u062A\u0641\u0642 \u0639\u0644\u064A\u0647\u0627", "\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u062C\u062F\u064A\u062F"]
  }
};

// src/hub/service-view.js
var serviceLabels = {
  en: ["My Services", "Track your services, deadlines and renewals in one place.", "All", "In progress", "Needs action", "Delivered", "Active", "No services match this filter.", "Open details", "Payment", "Unavailable", "Delivery deadline", "Awaiting confirmation", "Renewal date", "Created"],
  fr: ["Mes services", "Tout ce qu\u2019AuraDigital cr\xE9e et g\xE8re pour votre entreprise.", "Tous", "En cours", "Action requise", "Livr\xE9", "Actif", "Aucun service dans cette vue.", "Voir les d\xE9tails", "Paiement", "Indisponible", "Date de livraison", "En attente de confirmation", "Date de renouvellement", "Cr\xE9\xE9"],
  tr: ["Hizmetlerim", "AuraDigital\u2019in i\u015Fletmeniz i\xE7in olu\u015Fturdu\u011Fu ve y\xF6netti\u011Fi her \u015Fey.", "T\xFCm\xFC", "Devam eden", "\u0130\u015Flem gerekli", "Teslim edildi", "Aktif", "Bu g\xF6r\xFCn\xFCmde hizmet yok.", "Ayr\u0131nt\u0131lar\u0131 a\xE7", "\xD6deme", "Kullan\u0131lam\u0131yor", "Teslim tarihi", "Onay bekleniyor", "Yenileme tarihi", "Olu\u015Fturuldu"],
  ar: ["\u062E\u062F\u0645\u0627\u062A\u064A", "\u0643\u0644 \u0645\u0627 \u062A\u0646\u0634\u0626\u0647 AuraDigital \u0648\u062A\u062F\u064A\u0631\u0647 \u0644\u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.", "\u0627\u0644\u0643\u0644", "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u064A\u062A\u0637\u0644\u0628 \u0625\u062C\u0631\u0627\u0621\u064B", "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645", "\u0646\u0634\u0637", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636.", "\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644", "\u0627\u0644\u062F\u0641\u0639", "\u063A\u064A\u0631 \u0645\u062A\u0627\u062D", "\u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645", "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u0623\u0643\u064A\u062F", "\u0645\u0648\u0639\u062F \u0627\u0644\u062A\u062C\u062F\u064A\u062F", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621"]
};
var filters = ["all", "progress", "attention", "delivered", "active"];
var statuses = {
  new: "progress",
  "in-progress": "progress",
  scheduled: "progress",
  production: "progress",
  in_progress: "progress",
  in_production: "progress",
  ready: "attention",
  waiting: "attention",
  waiting_client: "attention",
  waiting_for_customer: "attention",
  review: "attention",
  ready_for_review: "attention",
  revisions_requested: "progress",
  blocked: "progress",
  completed: "delivered",
  delivered: "delivered",
  active: "active"
};
var group = (record) => Object.hasOwn(statuses, record.status) ? statuses[record.status] : void 0;
var icons = {
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  web: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  menu: '<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0v3h3v4m4-7v3m0 4h-1"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 2 2-5a8 8 0 1 1 16-5Z"/><path d="M8 11h1m3 0h1m3 0h1"/>',
  hosting: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h2m-2 11h2"/>',
  general: '<path d="m12 2 9 5v10l-9 5-9-5V7zm0 10 9-5m-9 5-9-5m9 5v10"/>'
};
var examples = [
  { kind: "web", service: "Web Design", en: "Website", fr: "Site web", tr: "Web sitesi", ar: "\u0645\u0648\u0642\u0639 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" },
  { kind: "email", service: "Business Email", en: "Business Email", fr: "E-mail professionnel", tr: "\u0130\u015F e-postas\u0131", ar: "\u0628\u0631\u064A\u062F \u0627\u0644\u0623\u0639\u0645\u0627\u0644" },
  { kind: "menu", service: "AuraMenu", en: "QR Menu", fr: "Menu QR", tr: "QR men\xFC", ar: "\u0642\u0627\u0626\u0645\u0629 QR" },
  { kind: "chat", service: "AI & Automation", en: "WhatsApp Automation", fr: "Automatisation WhatsApp", tr: "WhatsApp otomasyonu", ar: "\u0623\u062A\u0645\u062A\u0629 \u0648\u0627\u062A\u0633\u0627\u0628" },
  { kind: "brand", service: "Branding", en: "Branding", fr: "Identit\xE9 visuelle", tr: "Marka kimli\u011Fi", ar: "\u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0628\u0635\u0631\u064A\u0629" },
  { kind: "hosting", service: "Hosting / Security", en: "Hosting & Domain", fr: "H\xE9bergement et domaine", tr: "Hosting ve alan ad\u0131", ar: "\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642" }
];
var previewCopy = {
  en: ["Service examples", "Request this service", "Illustration", "Mailbox", "New message", "Welcome!", "How can we help?"],
  fr: ["Exemples de services", "Demander ce service", "Illustration", "Bo\xEEte mail", "Nouveau message", "Bienvenue !", "Comment vous aider ?"],
  tr: ["Hizmet \xF6rnekleri", "Bu hizmeti iste", "\xD6rnek g\xF6rsel", "Posta kutusu", "Yeni mesaj", "Ho\u015F geldiniz!", "Nas\u0131l yard\u0131mc\u0131 olabiliriz?"],
  ar: ["\u0623\u0645\u062B\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", "\u0627\u0637\u0644\u0628 \u0647\u0630\u0647 \u0627\u0644\u062E\u062F\u0645\u0629", "\u0631\u0633\u0645 \u062A\u0648\u0636\u064A\u062D\u064A", "\u0635\u0646\u062F\u0648\u0642 \u0627\u0644\u0628\u0631\u064A\u062F", "\u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629", "\u0623\u0647\u0644\u0627\u064B \u0628\u0643!", "\u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u0627 \u0645\u0633\u0627\u0639\u062F\u062A\u0643\u061F"]
};
var detailCopy = {
  en: ["Explore services", "See what you get", "What you\u2019ll get", "Scope, price and delivery are confirmed in your quote.", "Start your roadmap to request this service."],
  fr: ["Explorer les services", "Voir le contenu", "Ce que vous recevrez", "Le devis pr\xE9cise le p\xE9rim\xE8tre, le prix et le d\xE9lai.", "Cr\xE9ez votre feuille de route pour demander ce service."],
  tr: ["Hizmetleri ke\u015Ffet", "\u0130\xE7eri\u011Fi g\xF6r", "Neler alacaks\u0131n\u0131z", "Kapsam, fiyat ve teslim s\xFCresi teklifinizde kesinle\u015Fir.", "Bu hizmeti istemek i\xE7in yol haritan\u0131z\u0131 ba\u015Flat\u0131n."],
  ar: ["\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", "\u0627\u0637\u0651\u0644\u0639 \u0639\u0644\u0649 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644", "\u0645\u0627 \u0627\u0644\u0630\u064A \u0633\u062A\u062D\u0635\u0644 \u0639\u0644\u064A\u0647", "\u064A\u0624\u0643\u062F \u0639\u0631\u0636 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0627\u0644\u0633\u0639\u0631 \u0648\u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645.", "\u0627\u0628\u062F\u0623 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642 \u0644\u0637\u0644\u0628 \u0647\u0630\u0647 \u0627\u0644\u062E\u062F\u0645\u0629."]
};
function rankedExamples(profile, missions) {
  return rankServicesForBusiness(examples.map((example) => ({ ...example, name: example.en })), { profile, missions });
}
function serviceShortcuts(lang2, esc3, link2, { profile, missions } = {}) {
  return `<section class="hub-service-shortcuts"><header><h2>${detailCopy[lang2][0]}</h2><a href="${esc3(link2("services"))}">${esc3(serviceLabels[lang2][0])} \u2192</a></header>
 <div class="hub-service-links">${rankedExamples(profile, missions).map((example) => `<a href="${esc3(link2("services", { offer: example.kind }))}"><span class="service-icon">${icon(example.kind)}</span><span>${esc3(example[lang2])}</span><span aria-hidden="true">\u2197</span></a>`).join("")}</div></section>`;
}
function scopeMarkup(kind, lang2) {
  const scope = deliverables[kind]?.[lang2];
  if (!scope) return "";
  return `<section class="service-scope"><h3>${detailCopy[lang2][2]}</h3><ul>${scope.slice(1).map((item) => `<li>${item}</li>`).join("")}</ul><p>${detailCopy[lang2][3]}</p></section>`;
}
var serviceOffer = (offer) => examples.find((item) => item.kind === offer);
function renderServiceOffer({ host, offer, lang: lang2, esc: esc3, link: link2, canRequest, canSetUp, askLabel }) {
  const example = serviceOffer(offer);
  if (!example) return false;
  host.innerHTML = `<a class="service-back" href="${esc3(link2("services"))}">\u2190 ${serviceLabels[lang2][0]}</a>
 <article class="service-offer"><div class="service-offer-visual">${serviceArt(offer, lang2)}</div>
 <div class="service-offer-copy"><span class="service-icon">${icon(offer)}</span><h2>${esc3(example[lang2])}</h2>
 <p>${deliverables[offer][lang2][0]}</p>${scopeMarkup(offer, lang2)}
 <div class="growth-actions offer-actions">
 ${askLabel ? `<a class="growth-primary service-ask-auri" href="${esc3(link2("assistant", { offer }))}">${auriCharacter()}${esc3(askLabel)} <span aria-hidden="true">\u2197</span></a>` : ""}
 ${canRequest ? `<a class="${askLabel ? "growth-secondary" : "growth-primary"}" href="${esc3(link2("requests", { new: "1", service: example.service }))}">${previewCopy[lang2][1]} \u2192</a>` : canSetUp ? `<a class="growth-primary" href="${esc3(link2("onboarding"))}">${detailCopy[lang2][4]}</a>` : ""}</div></div></article>`;
  return true;
}
var serviceKind = (name) => [
  [/e.?mail|mailbox/i, "email"],
  [/menu/i, "menu"],
  [/whatsapp|automation|chat/i, "chat"],
  [/hosting|domain/i, "hosting"],
  [/brand|design identity/i, "brand"],
  [/web/i, "web"]
].find(([pattern]) => pattern.test(name))?.[1] || "general";
function icon(kind) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[kind] || icons.general}</svg>`;
}
function serviceArt(kind, lang2) {
  const [, , label, mailbox, message, welcome, help] = previewCopy[lang2];
  const artwork = {
    web: '<div class="service-laptop"><img src="/project-fifty.png" alt="" loading="lazy"></div>',
    email: `<div class="service-mail-window"><small>${mailbox}</small><strong>${message}</strong><span>contact@yourbusiness.com</span><i></i><i></i></div>${icon("email")}`,
    menu: '<div class="service-menu-stand">' + icon("menu") + '</div><img class="service-menu-phone" src="/qr-menu-phone.svg" alt="" loading="lazy">',
    chat: `<div class="service-chat-phone"><span>${welcome}</span><span>${help}</span></div>${icon("chat")}`,
    brand: '<div class="service-brand-kit"><div></div><span></span><span></span><span>Aa</span></div>',
    hosting: '<div class="service-rack"><i></i><i></i><i></i></div><div class="service-domain">yourbusiness.com</div>'
  };
  return `<div class="service-art service-art--${kind}"><span class="service-art-label">${label}</span><div class="service-artwork" aria-hidden="true">${artwork[kind] || icon(kind)}</div></div>`;
}
function serviceDate(value, lang2, fallback) {
  if (!value) return fallback;
  const parsed = /* @__PURE__ */ new Date(value.replace(" ", "T") + (/^\d{4}-\d{2}-\d{2} \d/.test(value) ? "Z" : ""));
  return Number.isNaN(parsed.valueOf()) ? fallback : new Intl.DateTimeFormat(lang2, { dateStyle: "medium", timeZone: "UTC" }).format(parsed);
}
function serviceStatus(record, labels3) {
  const index = filters.indexOf(group(record));
  if (index >= 3) return labels3[index + 2];
  return String(record.status || labels3[10]).replaceAll("_", " ");
}
function facts(record, lang2, labels3, esc3) {
  const renewal = record.kind === "subscription";
  return `<dl class="service-facts"><div><dt>${labels3[9]}</dt><dd>${labels3[10]}</dd></div>
 <div><dt>${labels3[renewal ? 13 : 11]}</dt><dd>${esc3(serviceDate(renewal ? record.renewalDate : record.dueDate, lang2, labels3[12]))}</dd></div></dl>`;
}
function renderServices({ host, records, lang: lang2, esc: esc3, link: link2, profile, missions }) {
  const labels3 = serviceLabels[lang2] || serviceLabels.en;
  const [examplesTitle] = previewCopy[lang2];
  const headers = (kind, name) => `<header><span class="service-icon">${icon(kind)}</span><h2>${esc3(name)}</h2></header>`;
  host.innerHTML = `<p class="service-intro">${labels3[1]}</p>
 ${records.length ? `<div class="service-filters" role="group" aria-label="${labels3[0]}">${filters.map((filter, index) => `<button type="button" data-service-filter="${filter}" aria-controls="service-grid" aria-pressed="${filter === "all"}">${labels3[index + 2]} <span>${filter === "all" ? records.length : records.filter((record) => group(record) === filter).length}</span></button>`).join("")}</div>
 <div class="service-grid" id="service-grid">${rankServicesForBusiness(records, { profile, missions }).map((record) => {
    const kind = serviceKind(record.name);
    return `<article class="service-card" data-service-group="${group(record) || "other"}">
   ${serviceArt(kind, lang2)}<span class="service-state">${esc3(serviceStatus(record, labels3))}</span>
   <div class="service-card-body">${headers(kind, record.name)}${facts(record, lang2, labels3, esc3)}
   <a class="growth-primary service-card-link" href="${esc3(link2("services", { serviceRecord: record.key }))}">${labels3[8]} <span aria-hidden="true">\u2197</span></a></div>
   </article>`;
  }).join("")}</div><p class="hub-empty" role="status" data-service-empty hidden>${labels3[7]}</p>` : ""}<h2 class="service-example-title">${examplesTitle}</h2>
 <div class="service-grid service-catalogue">${rankedExamples(profile, missions).map((example) => `<article class="service-card">
  ${serviceArt(example.kind, lang2)}<div class="service-card-body">${headers(example.kind, example[lang2])}
  <a class="growth-secondary service-card-link" href="${esc3(link2("services", { offer: example.kind }))}">${detailCopy[lang2][1]} <span aria-hidden="true">\u2197</span></a></div>
 </article>`).join("")}</div>`;
  if (!records.length) return;
  host.querySelector(".service-filters").onclick = (event) => {
    const button2 = event.target.closest("[data-service-filter]");
    if (!button2) return;
    const filter = button2.dataset.serviceFilter;
    for (const item of host.querySelectorAll("[data-service-filter]")) item.setAttribute("aria-pressed", String(item === button2));
    let visible = 0;
    for (const card of host.querySelectorAll("[data-service-group]")) {
      card.hidden = filter !== "all" && card.dataset.serviceGroup !== filter;
      if (!card.hidden) visible++;
    }
    host.querySelector("[data-service-empty]").hidden = visible > 0;
  };
}
function renderServiceDetails({ host, record, lang: lang2, esc: esc3, link: link2, askLabel }) {
  const labels3 = serviceLabels[lang2] || serviceLabels.en;
  host.innerHTML = `<article class="service-card service-detail"><header><h2>${esc3(record.name)}</h2><span class="service-state">${esc3(serviceStatus(record, labels3))}</span></header>
 ${serviceArt(serviceKind(record.name), lang2)}${facts(record, lang2, labels3, esc3)}
 <dl class="service-facts"><div><dt>${labels3[14]}</dt><dd>${esc3(serviceDate(record.createdAt, lang2, labels3[10]))}</dd></div></dl>
 <div class="actions"><a class="growth-secondary" href="${esc3(link2("services"))}">${labels3[0]}</a>
 ${deliverables[serviceKind(record.name)] ? `<a class="growth-secondary" href="${esc3(link2("services", { offer: serviceKind(record.name) }))}">${detailCopy[lang2][1]}</a>` : ""}
 ${askLabel ? `<a class="growth-primary" href="${esc3(link2("assistant", { serviceRecord: record.key }))}">${esc3(askLabel)}</a>` : ""}</div></article>`;
}

// src/hub/guide-view.js
var strings = {
  en: ["Talk to Auri", "Hi, I\u2019m Auri. Tell me about your business and I\u2019ll suggest what to do first. Ask me what AuraDigital can help with or compare published prices.", "What should I do first?", "What can you help with?", "What does a digital menu cost?", "Ask Auri a question", "Send", "Auri is thinking\u2026", "Browse all published prices", "Read reply aloud", "Contact AuraDigital for a custom quote", "One-time", "Monthly", "Annual", "Annual hosting", "Couldn\u2019t load prices. Try again."],
  fr: ["Parler \xE0 Auri", "Bonjour, je suis Auri. D\xE9crivez votre activit\xE9 pour trouver votre prochaine \xE9tape ou comparer les tarifs publi\xE9s.", "Par quoi commencer ?", "Comment peux-tu m\u2019aider ?", "Combien co\xFBte un menu num\xE9rique ?", "Posez une question \xE0 Auri", "Envoyer", "Auri r\xE9fl\xE9chit\u2026", "Voir tous les tarifs publi\xE9s", "Lire la r\xE9ponse \xE0 voix haute", "Contacter AuraDigital pour un devis", "Unique", "Mensuel", "Annuel", "H\xE9bergement annuel", "Impossible de charger les tarifs. R\xE9essayez."],
  tr: ["Auri ile konu\u015F", "Merhaba, ben Auri. \u0130\u015Fletmenizi anlat\u0131n, ilk ad\u0131m\u0131 bulal\u0131m. Hizmetleri ve yay\u0131mlanan fiyatlar\u0131 sorabilirsiniz.", "\u0130lk olarak ne yapmal\u0131y\u0131m?", "Nas\u0131l yard\u0131mc\u0131 olabilirsin?", "Dijital men\xFC fiyat\u0131 nedir?", "Auri\u2019ye soru sorun", "G\xF6nder", "Auri d\xFC\u015F\xFCn\xFCyor\u2026", "Yay\u0131mlanan t\xFCm fiyatlar\u0131 g\xF6r", "Yan\u0131t\u0131 sesli oku", "\xD6zel teklif i\xE7in AuraDigital\u2019e ula\u015F\u0131n", "Tek seferlik", "Ayl\u0131k", "Y\u0131ll\u0131k", "Y\u0131ll\u0131k bar\u0131nd\u0131rma", "Fiyatlar y\xFCklenemedi. Tekrar deneyin."],
  ar: ["\u062A\u062D\u062F\u062B \u0645\u0639 \u0623\u0648\u0631\u064A", "\u0645\u0631\u062D\u0628\u064B\u0627\u060C \u0623\u0646\u0627 \u0623\u0648\u0631\u064A. \u0623\u062E\u0628\u0631\u0646\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0644\u0623\u0642\u062A\u0631\u062D \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0623\u0648\u0644\u0649. \u0627\u0633\u0623\u0644\u0646\u064A \u0639\u0646 \u062E\u062F\u0645\u0627\u062A AuraDigital \u0623\u0648 \u0642\u0627\u0631\u0646 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0629.", "\u0645\u0627 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u0623\u0648\u0644\u0649\u061F", "\u0628\u0645\u0627\u0630\u0627 \u064A\u0645\u0643\u0646\u0643 \u0645\u0633\u0627\u0639\u062F\u062A\u064A\u061F", "\u0643\u0645 \u0633\u0639\u0631 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0642\u0645\u064A\u0629\u061F", "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A", "\u0625\u0631\u0633\u0627\u0644", "\u0623\u0648\u0631\u064A \u064A\u0641\u0643\u0631\u2026", "\u062A\u0635\u0641\u062D \u0643\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0629", "\u0627\u0642\u0631\u0623 \u0627\u0644\u0631\u062F \u0628\u0635\u0648\u062A \u0639\u0627\u0644\u064D", "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 AuraDigital \u0644\u0637\u0644\u0628 \u0639\u0631\u0636 \u062E\u0627\u0635", "\u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629", "\u0634\u0647\u0631\u064A\u064B\u0627", "\u0633\u0646\u0648\u064A\u064B\u0627", "\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629 \u0627\u0644\u0633\u0646\u0648\u064A\u0629", "\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0623\u0633\u0639\u0627\u0631. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627."]
};
var path = "/api/hub/onboarding/guide";
function mountGuide(host, { lang: lang2, esc: esc3, api: api2, turns, scope, context = () => ({}) }) {
  if (!host) return;
  const [title, intro, first, help, price, placeholder, send, thinking, browse, read, contact, once, month, year, hosting, unavailable] = strings[lang2] || strings.en;
  const money4 = (price2, currency) => new Intl.NumberFormat(lang2, { style: "currency", currency }).format(price2);
  const qualifiers = { en: ["From", "Request a quote"], fr: ["D\xE8s", "Demander un devis"], tr: ["Ba\u015Flang\u0131\xE7", "Teklif iste"], ar: ["\u0627\u0628\u062A\u062F\u0627\u0621\u064B \u0645\u0646", "\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631"] }[lang2] || ["From", "Request a quote"];
  const priceLabel = (value, currency, from) => Number.isFinite(value) ? (from ? qualifiers[0] + " " : "") + money4(value, currency) : qualifiers[1];
  const rows = ({ packages, currency }) => packages.map((item) => `<li><strong>${esc3(item.name)}</strong> \xB7 ${esc3(priceLabel(item.price, currency, item.from))} <small>${esc3({ once, month, year }[item.billing] || once)}${item.annualHosting ? ` \xB7 ${esc3(hosting)} ${esc3(priceLabel(item.annualHosting, currency, item.hostingFrom))}` : ""}${item.availability ? ` \xB7 ${esc3(item.availability.replaceAll("-", " "))}` : ""}</small></li>`).join("");
  host.innerHTML = `<section class="hub-guide"><h2>${esc3(title)}</h2><p>${esc3(intro)}</p>
 <div class="hub-guide-prompts">${[first, help, price].map((question) => `<button type="button" class="secondary">${esc3(question)}</button>`).join("")}</div>
 <div class="hub-guide-turns"></div>
 <form><input name="question" required maxlength="700" aria-label="${esc3(placeholder)}" placeholder="${esc3(placeholder)}"><button class="primary">${esc3(send)}</button></form>
 <p class="hub-guide-status" role="status" aria-live="polite"></p>
 ${"speechSynthesis" in window ? `<button class="secondary" type="button" data-guide-read hidden>${esc3(read)}</button>` : ""}
 <details><summary>${esc3(browse)}</summary><ul data-guide-prices></ul></details><a href="/contact">${esc3(contact)}</a></section>`;
  const form = host.querySelector("form");
  const input = form.elements.question, submit = form.querySelector("button"), status = host.querySelector("[role=status]");
  const voice = host.querySelector("[data-guide-read]");
  const output = host.querySelector(".hub-guide-turns");
  const paint = () => {
    output.innerHTML = turns.map((turn) => `<article><strong>${esc3(turn.question)}</strong><p>${esc3(turn.reply)}</p>${turn.packages.length ? `<ul>${rows(turn)}</ul>` : ""}</article>`).join("");
    output.scrollTop = output.scrollHeight;
    if (voice) voice.hidden = !turns.length;
  };
  paint();
  if (voice) voice.onclick = () => {
    const last = turns.at(-1);
    const priceText = last.packages.map((item) => item.name + " " + priceLabel(item.price, last.currency, item.from) + " " + ({ once, month, year }[item.billing] || once));
    const speech = new SpeechSynthesisUtterance([last.reply, ...priceText].join(". "));
    speech.lang = lang2;
    speech.onstart = () => pulseAuri(scope, "speaking", 3e3);
    speech.onend = speech.onerror = () => pulseAuri(scope, "idle", 0);
    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
  };
  for (const button2 of host.querySelectorAll(".hub-guide-prompts button")) {
    button2.onclick = () => {
      input.value = button2.textContent;
      form.requestSubmit();
    };
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || submit.disabled) return;
    submit.disabled = true;
    status.classList.remove("sr-only");
    status.textContent = thinking;
    try {
      const answer = await runAuri(scope, "thinking", () => api2(path, "POST", { question, lang: lang2, history: turns.slice(-6).map(({ question: question2, reply }) => ({ question: question2, reply })), context: context() }));
      turns.push({ question, ...answer });
      if (turns.length > 10) turns.shift();
      if (!host.isConnected) return;
      paint();
      if (input.value.trim() === question) input.value = "";
      status.classList.add("sr-only");
      status.textContent = answer.reply;
    } catch (error) {
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  };
  const catalogue = host.querySelector("details"), prices = host.querySelector("[data-guide-prices]");
  let loaded = false;
  catalogue.ontoggle = async () => {
    if (!catalogue.open || loaded) return;
    loaded = true;
    try {
      prices.innerHTML = rows(await api2(path));
    } catch {
      prices.innerHTML = `<li>${esc3(unavailable)}</li>`;
      loaded = false;
    }
  };
}

// src/hub/hub-navigation.js
var labels = {
  en: ["Home", "Roadmap", "Ask Auri", "My Services", "Build your roadmap", "Tell Auri about your business. Get a clear first step.", "Build my roadmap", "Continue setup", "Next on your roadmap", "Needs your attention", "In progress", "Active services", "Review your menu", "Open request", "No items need your attention.", "No work in progress.", "No active services yet.", "Welcome to", "Roadmap complete", "Return to record", "Helping with", "Start small", "Build systems", "Scale with AI", "Locked", "Current stage", "Record unavailable", "Menu draft ready for review", "Mark reviewed", "Request details", "Tell me about your business."],
  fr: ["Accueil", "Feuille de route", "Demander \xE0 Auri", "Mes services", "Cr\xE9ez votre feuille de route", "Pr\xE9sentez votre activit\xE9 \xE0 Auri pour obtenir votre premi\xE8re \xE9tape.", "Cr\xE9er ma feuille de route", "Poursuivre", "Prochaine \xE9tape", "\xC0 examiner", "En cours", "Services actifs", "Examiner votre menu", "Ouvrir la demande", "Aucun \xE9l\xE9ment \xE0 examiner.", "Aucun travail en cours.", "Aucun service actif pour le moment.", "Bienvenue dans", "Feuille de route termin\xE9e", "Revenir au dossier", "Aide pour", "Commencer simplement", "Structurer votre activit\xE9", "Se d\xE9velopper avec l\u2019IA", "Verrouill\xE9", "\xC9tape actuelle", "Dossier indisponible", "Brouillon du menu \xE0 examiner", "Marquer comme examin\xE9", "D\xE9tails de la demande", "Pr\xE9sentez-moi votre activit\xE9."],
  tr: ["Ana sayfa", "Yol haritas\u0131", "Auri\u2019ye sor", "Hizmetlerim", "Yol haritan\u0131z\u0131 olu\u015Fturun", "\u0130lk ad\u0131m\u0131n\u0131z\u0131 \xF6\u011Frenmek i\xE7in Auri\u2019ye i\u015Fletmenizi anlat\u0131n.", "Yol haritam\u0131 olu\u015Ftur", "Kuruluma devam et", "S\u0131radaki ad\u0131m", "\u0130\u015Flem bekleyenler", "Devam edenler", "Aktif hizmetler", "Men\xFCn\xFCz\xFC inceleyin", "Talebi a\xE7", "\u0130\u015Flem bekleyen \xF6\u011Fe yok.", "Devam eden i\u015F yok.", "Hen\xFCz aktif hizmet yok.", "Ho\u015F geldiniz", "Yol haritas\u0131 tamamland\u0131", "Kayda d\xF6n", "Yard\u0131m konusu", "K\xFC\xE7\xFCk ba\u015Flay\u0131n", "Sistem kurun", "Yapay zek\xE2 ile b\xFCy\xFCy\xFCn", "Kilitli", "Ge\xE7erli a\u015Fama", "Kay\u0131t kullan\u0131lam\u0131yor", "Men\xFC tasla\u011F\u0131 incelemeye haz\u0131r", "\u0130ncelendi olarak i\u015Faretle", "Talep ayr\u0131nt\u0131lar\u0131", "Bana i\u015Fletmenizi anlat\u0131n."],
  ar: ["\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", "\u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A", "\u062E\u062F\u0645\u0627\u062A\u064A", "\u0623\u0646\u0634\u0626 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643", "\u0623\u062E\u0628\u0631 \u0623\u0648\u0631\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0644\u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.", "\u0623\u0646\u0634\u0626 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u064A", "\u062A\u0627\u0628\u0639 \u0627\u0644\u0625\u0639\u062F\u0627\u062F", "\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", "\u064A\u062A\u0637\u0644\u0628 \u0627\u0646\u062A\u0628\u0627\u0647\u0643", "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629", "\u0631\u0627\u062C\u0639 \u0642\u0627\u0626\u0645\u062A\u0643", "\u0627\u0641\u062A\u062D \u0627\u0644\u0637\u0644\u0628", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0646\u0627\u0635\u0631 \u062A\u062A\u0637\u0644\u0628 \u0627\u0646\u062A\u0628\u0627\u0647\u0643.", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0639\u0645\u0627\u0644 \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630.", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0646\u0634\u0637\u0629 \u0628\u0639\u062F.", "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643 \u0641\u064A", "\u0627\u0643\u062A\u0645\u0644\u062A \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u062C\u0644", "\u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0641\u064A", "\u0627\u0628\u062F\u0623 \u0628\u062E\u0637\u0648\u0627\u062A \u0628\u0633\u064A\u0637\u0629", "\u0627\u0628\u0646\u0650 \u0623\u0646\u0638\u0645\u0629", "\u062A\u0648\u0633\u0651\u0639 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", "\u0645\u063A\u0644\u0642", "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", "\u0627\u0644\u0633\u062C\u0644 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D", "\u0645\u0633\u0648\u062F\u0629 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u062A\u0645\u062A \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628", "\u0623\u062E\u0628\u0631\u0646\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A."]
};
var keys = ["home", "journey", "assistant", "services", "build", "buildNote", "buildAction", "continue", "next", "attention", "progress", "active", "reviewMenu", "openRequest", "emptyAttention", "emptyProgress", "emptyActive", "welcome", "complete", "return", "context", "small", "systems", "scale", "locked", "current", "unavailable", "menuReady", "reviewed", "requestDetails", "intake"];
var requests = { en: "Requests", fr: "Demandes", tr: "Talepler", ar: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A" };
var hubLabels = (lang2) => ({ ...Object.fromEntries(keys.map((key, index) => [key, (labels[lang2] || labels.en)[index]])), requests: requests[lang2] || requests.en });
var destinations = { home: "", journey: "roadmap", assistant: "auri", services: "work", requests: "requests", menuDrafts: "menu-drafts", profile: "profile", settings: "settings", resources: "resources", tasks: "tasks", simulator: "simulator", team: "team", insights: "insights", projects: "projects", websites: "websites", hosting: "hosting", files: "files", reports: "reports", invoices: "invoices", rewards: "rewards", support: "support", onboarding: "onboarding", studio: "studio" };
var hubStage = (level2) => Math.max(0, Math.min(4, (Number(level2) || 1) - 1));
var hubStageNames = (lang2) => ({
  en: ["Foundation", "Visibility", "Conversion", "Operations", "Scale"],
  fr: ["Fondations", "Visibilit\xE9", "Conversion", "Op\xE9rations", "Croissance"],
  tr: ["Temel", "G\xF6r\xFCn\xFCrl\xFCk", "D\xF6n\xFC\u015F\xFCm", "Operasyon", "B\xFCy\xFCme"],
  ar: ["\u0627\u0644\u062A\u0623\u0633\u064A\u0633", "\u0627\u0644\u0638\u0647\u0648\u0631", "\u0627\u0644\u062A\u062D\u0648\u064A\u0644", "\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A", "\u0627\u0644\u062A\u0648\u0633\u0639"]
})[lang2] || ["Foundation", "Visibility", "Conversion", "Operations", "Scale"];
var hubIcons = {
  home: '<path d="M3 10 12 3l9 7v10H3z M9 20v-7h6v7"/>',
  journey: '<path d="m2 8 10-5 10 5-10 5z M2 12l10 5 10-5 M2 16l10 5 10-5"/>',
  assistant: '<path d="M4 4h16a2 2 0 0 1 2 2v10H10l-6 4v-4H2V6a2 2 0 0 1 2-2z M7 10h1m3 0h1m3 0h1"/>',
  services: '<path d="M3 7h18v13H3z M8 7V4h8v3 M3 12h18m-11 0v2h4v-2"/>',
  profile: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/>'
};
var hubIcon = (id) => `<svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round" fill="none" aria-hidden="true">${hubIcons[id] || hubIcons.services}</svg>`;
function currentHubLocation() {
  const slug = location.pathname.split("/")[2] || "";
  const known = Object.keys(destinations).find((key) => destinations[key] === slug);
  const page2 = known || (["", "login", "signup", "forgot", "reset", "verify", "invitation", "confirm-email"].includes(slug) ? "home" : "notfound");
  return { page: page2, query: new URLSearchParams(location.search) };
}
function hubLink(page2, workspace2, params = {}) {
  const query2 = new URLSearchParams(workspace2 ? { workspace: workspace2 } : {});
  for (const [key, value] of Object.entries(params)) if (value) query2.set(key, value);
  return "/hub" + (destinations[page2] ? "/" + destinations[page2] : "") + (query2.size ? "?" + query2 : "");
}

// src/hub/work-view.js
var statusKeys = { lead: "Received", new: "Received", contacted: "Contacted", active: "Active", waiting: "Waiting for details", completed: "Completed", cancelled: "Cancelled", production: "In production", in_production: "In production", waiting_client: "Waiting for details", review: "Ready for review", quote_ready: "Quote ready" };
var attentionStatuses = /* @__PURE__ */ new Set(["waiting", "waiting_client", "review", "quote_ready"]);
var terminal = /* @__PURE__ */ new Set(["completed", "cancelled"]);
var state = (r) => attentionStatuses.has(r.status) ? r.status : r.productionStatus || r.status;
var workStatus = (r) => statusKeys[state(r)] || String(state(r) || "").replaceAll("_", " ");
function workRows(drafts, work) {
  const attention = drafts.filter((d) => !d.reviewed && d.state !== "archived").map((d) => ({
    ...d,
    kind: "menu",
    name: d.draft.fields.businessName || "AuraMenu",
    blocking: d.state === "preview"
  }));
  attention.push(...work.requests.filter((r) => attentionStatuses.has(state(r))).map((r) => ({ ...r, kind: "request", blocking: true })));
  const due = (r) => Date.parse(r.dueDate) || Infinity;
  const overdue = (r) => due(r) < Date.now();
  attention.sort((a, b) => Number(overdue(b)) - Number(overdue(a)) || Number(b.blocking) - Number(a.blocking) || (due(a) === due(b) ? 0 : due(a) - due(b)) || a.id.localeCompare(b.id));
  const progress = work.requests.filter((r) => !attentionStatuses.has(state(r)) && !terminal.has(state(r))).map((r) => ({ ...r, kind: "request" }));
  return { attention, progress, services: work.services, records: work.records || [], requests: work.requests };
}
function renderWorkRow(record, { ui, esc: esc3, link: link2 }) {
  const menu2 = record.kind === "menu";
  const action = menu2 ? ui.reviewMenu : ui.openRequest;
  return `<a class="hub-work-row" href="${esc3(link2(menu2 ? "menuDrafts" : "requests", menu2 ? { draft: record.id } : { request: record.id }))}">
  <span class="hub-row-icon">${hubIcon(menu2 ? "journey" : "services")}</span><span><strong>${esc3(record.name)}</strong>
  <small>${esc3(menu2 ? ui.menuReady : workStatus(record))}</small></span><span class="hub-row-action">${esc3(action)} <span aria-hidden="true">\u2197</span></span></a>`;
}
var serviceOptions = ["Web Design", "Website Care", "Pricing / Quote", "Hosting / Security", "Business Email", "Branding", "Spinflow ERP", "NFC Card", "AuraMenu", "AuraWeddings", "Ad Management", "SEO / Google Maps", "AI & Automation", "Other"];
function renderRequestForm({ host, lang: lang2, esc: esc3, me: me2, workspace: workspace2, service, task, draft: draft2, back, submitted }) {
  const ui = hubLabels(lang2);
  const labels3 = {
    en: ["Request a service", "Service", "Phone number", "What would you like us to do?", "Send request", "Cancel"],
    fr: ["Demander un service", "Service", "T\xE9l\xE9phone", "Que souhaitez-vous r\xE9aliser ?", "Envoyer la demande", "Annuler"],
    tr: ["Hizmet iste", "Hizmet", "Telefon", "Ne yapmam\u0131z\u0131 istersiniz?", "Talebi g\xF6nder", "\u0130ptal"],
    ar: ["\u0627\u0637\u0644\u0628 \u062E\u062F\u0645\u0629", "\u0627\u0644\u062E\u062F\u0645\u0629", "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", "\u0645\u0627 \u0627\u0644\u0630\u064A \u062A\u0648\u062F \u0623\u0646 \u0646\u0646\u062C\u0632\u0647\u061F", "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628", "\u0625\u0644\u063A\u0627\u0621"]
  }[lang2];
  host.innerHTML = `<section class="panel"><h2>${labels3[0]}</h2><form data-hub-request>
  <label class="field">${labels3[1]}<select name="service">${serviceOptions.map((value) => `<option ${service === value ? "selected" : ""}>${esc3(value)}</option>`).join("")}</select></label>
  <label class="field">${labels3[2]}<input name="phone" type="tel" maxlength="50" autocomplete="tel" required></label>
  <label class="field">${labels3[3]}<textarea name="message" rows="4" maxlength="1700" required>${esc3(draft2.slice(0, 1700))}</textarea></label>
  <p role="alert"></p><button class="primary">${labels3[4]}</button> <a class="secondary" href="${esc3(back)}">${labels3[5]}</a>
  </form></section>`;
  const form = host.querySelector("form");
  form.onsubmit = async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button");
    if (submit.disabled) return;
    const { phone, message, service: service2 } = Object.fromEntries(new FormData(form));
    const payload = { name: me2.name, email: me2.email, phone, service: service2, message: [task, message].filter(Boolean).join("\n"), language: lang2 === "fr" ? "en" : lang2, workspaceId: workspace2.organization.id };
    const body = JSON.stringify(payload);
    submit.disabled = true;
    try {
      const fingerprint = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body)));
      const storageKey = "aura-hub-request:" + Array.from(fingerprint, (byte) => byte.toString(16).padStart(2, "0")).join("");
      let key = crypto.randomUUID();
      try {
        key = sessionStorage.getItem(storageKey) || key;
        sessionStorage.setItem(storageKey, key);
      } catch {
      }
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body });
      const data = await response.json();
      if (!response.ok || !data.requestId) throw new Error(data.error || ui.unavailable);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
      }
      if (form.isConnected) submitted(data.requestId);
    } catch (error) {
      form.querySelector('[role="alert"]').textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  };
}

// src/hub/onboarding.js
var fields = ["name", "industry", "city", "country", "website", "goals", "industryDetails", "tools", "acquisition"];
var industries = ["restaurant", "services", "ecommerce", "real_estate", "other"];
var steps = ["name", "industry", "goals", "tools"];
var toolsQuestion = { en: "Which tools do you already use?", fr: "Quels outils utilisez-vous d\xE9j\xE0 ?", tr: "Hangi ara\xE7lar\u0131 zaten kullan\u0131yorsunuz?", ar: "\u0645\u0627 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0633\u062A\u062E\u062F\u0645\u0647\u0627 \u0628\u0627\u0644\u0641\u0639\u0644\u061F" };
var copy = {
  en: ["Let's build your business.", "Tell Auri about your business. We\u2019ll build your workspace and growth path.", "Tell me about your business", "Analyze", "Start without documents", "Attach text or CSV", "Add a website", "What\u2019s your business called?", "What kind of business is it?", "Where do you operate?", "What would you like to achieve first?", "Continue", "Skip", "Review your workspace details", "Build my roadmap", "Auri is preparing your roadmap\u2026", "Enter or paste a full HTTPS URL.", "Choose a .txt or .csv file under 16 KB with up to 4,000 characters.", "Auri couldn\u2019t find details in this text. You can add them below.", "Analyzing business information\u2026", "Talk to Auri"],
  fr: ["Cr\xE9ons votre espace professionnel.", "Pr\xE9sentez votre activit\xE9 \xE0 Auri. Nous pr\xE9parerons votre espace et votre parcours de croissance.", "Pr\xE9sentez votre activit\xE9 \xE0 Auri", "Analyser", "Commencer sans documents", "Joindre un texte ou CSV", "Ajouter un site web", "Quel est le nom de votre entreprise ?", "Quel est votre secteur ?", "O\xF9 exercez-vous ?", "Quel est votre premier objectif ?", "Continuer", "Passer", "V\xE9rifiez les informations de votre espace", "Cr\xE9er mon espace", "Cr\xE9ation de votre espace et de votre parcours\u2026", "Saisissez ou collez une URL HTTPS compl\xE8te.", "Choisissez un fichier .txt ou .csv de moins de 16 Ko et 4 000 caract\xE8res maximum.", "Auri n\u2019a trouv\xE9 aucune information dans ce texte. Ajoutez-la ci-dessous.", "Analyse de votre activit\xE9\u2026", "Parler \xE0 Auri"],
  tr: ["\u0130\u015Fletmenizi birlikte kural\u0131m.", "\u0130\u015Fletmenizi Auri\u2019ye anlat\u0131n. \xC7al\u0131\u015Fma alan\u0131n\u0131z\u0131 ve b\xFCy\xFCme plan\u0131n\u0131z\u0131 olu\u015Ftural\u0131m.", "\u0130\u015Fletmenizi Auri\u2019ye anlat\u0131n", "Analiz et", "Belgesiz ba\u015Fla", "Metin veya CSV ekle", "Web sitesi ekle", "\u0130\u015Fletmenizin ad\u0131 nedir?", "Hangi sekt\xF6rde \xE7al\u0131\u015F\u0131yorsunuz?", "Nerede faaliyet g\xF6steriyorsunuz?", "\u0130lk hedefiniz nedir?", "Devam et", "Atla", "\xC7al\u0131\u015Fma alan\u0131 bilgilerini kontrol edin", "\xC7al\u0131\u015Fma alan\u0131 olu\u015Ftur", "\xC7al\u0131\u015Fma alan\u0131n\u0131z ve b\xFCy\xFCme plan\u0131n\u0131z haz\u0131rlan\u0131yor\u2026", "Tam HTTPS adresini yaz\u0131n veya yap\u0131\u015Ft\u0131r\u0131n.", "16 KB alt\u0131nda ve en fazla 4.000 karakter i\xE7eren bir .txt veya .csv dosyas\u0131 se\xE7in.", "Auri bu metinde bilgi bulamad\u0131. Bilgileri a\u015Fa\u011F\u0131dan ekleyebilirsiniz.", "\u0130\u015Fletme bilgileri inceleniyor\u2026", "Auri ile konu\u015F"],
  ar: ["\u0644\u0646\u0628\u062F\u0623 \u0628\u0628\u0646\u0627\u0621 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.", "\u0623\u062E\u0628\u0631 \u0623\u0648\u0631\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0644\u0646\u0639\u062F\u0651 \u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643 \u0648\u0645\u0633\u0627\u0631 \u0646\u0645\u0648\u0643.", "\u0623\u062E\u0628\u0631 \u0623\u0648\u0631\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u062A\u062D\u0644\u064A\u0644", "\u0627\u0644\u0628\u062F\u0621 \u062F\u0648\u0646 \u0645\u0633\u062A\u0646\u062F\u0627\u062A", "\u0625\u0631\u0641\u0627\u0642 \u0645\u0644\u0641 \u0646\u0635\u064A \u0623\u0648 CSV", "\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0642\u0639 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", "\u0645\u0627 \u0627\u0633\u0645 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u061F", "\u0645\u0627 \u0645\u062C\u0627\u0644 \u0646\u0634\u0627\u0637\u0643\u061F", "\u0623\u064A\u0646 \u062A\u0639\u0645\u0644\u061F", "\u0645\u0627 \u0623\u0648\u0644 \u0647\u062F\u0641 \u062A\u0631\u064A\u062F \u062A\u062D\u0642\u064A\u0642\u0647\u061F", "\u0645\u062A\u0627\u0628\u0639\u0629", "\u062A\u062E\u0637\u064A", "\u0631\u0627\u062C\u0639 \u062A\u0641\u0627\u0635\u064A\u0644 \u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643", "\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644", "\u062C\u0627\u0631\u064D \u0625\u0639\u062F\u0627\u062F \u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643 \u0648\u0645\u0633\u0627\u0631 \u0646\u0645\u0648\u0643\u2026", "\u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 HTTPS \u0643\u0627\u0645\u0644\u064B\u0627 \u0623\u0648 \u0627\u0644\u0635\u0642\u0647.", "\u0627\u062E\u062A\u0631 \u0645\u0644\u0641 .txt \u0623\u0648 .csv \u0623\u0635\u063A\u0631 \u0645\u0646 16 \u0643\u064A\u0644\u0648\u0628\u0627\u064A\u062A \u0648\u0628\u062D\u062F \u0623\u0642\u0635\u0649 \u0664\u0660\u0660\u0660 \u062D\u0631\u0641.", "\u0644\u0645 \u064A\u0639\u062B\u0631 \u0623\u0648\u0631\u064A \u0639\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0641\u064A \u0627\u0644\u0646\u0635. \u064A\u0645\u0643\u0646\u0643 \u0625\u0636\u0627\u0641\u062A\u0647\u0627 \u0623\u062F\u0646\u0627\u0647.", "\u062C\u0627\u0631\u064D \u062A\u062D\u0644\u064A\u0644 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0646\u0634\u0627\u0637\u2026", "\u062A\u062D\u062F\u062B \u0645\u0639 \u0623\u0648\u0631\u064A"]
};
var chatCopy = {
  en: {
    status: "Setting up your workspace",
    progress: "Setup progress",
    found: "Here\u2019s what I picked up from that:",
    skipped: "Skipped",
    review: "Check these details \u2014 you can edit anything before I build your roadmap.",
    hints: { industry: "Pick one below, or choose from the list.", goals: "One sentence is enough. Tap a suggestion if it fits.", tools: "For example: Instagram, a printed menu, WhatsApp, Google Maps." },
    goals: { restaurant: ["Get more reservations", "Get more direct orders", "Be found on Google Maps"], services: ["Get more bookings", "Win more quote requests", "Keep clients coming back"], ecommerce: ["Sell more online", "Grow repeat customers", "Reach new customers"], real_estate: ["Get more property inquiries", "Follow up leads faster", "Showcase listings online"], other: ["Reach more customers", "Look more professional online", "Save time on admin"] }
  },
  tr: {
    status: "\xC7al\u0131\u015Fma alan\u0131n\u0131z haz\u0131rlan\u0131yor",
    progress: "Kurulum ilerlemesi",
    found: "Anlatt\u0131klar\u0131n\u0131zdan \u015Funlar\u0131 \xE7\u0131kard\u0131m:",
    skipped: "Atland\u0131",
    review: "Bu bilgileri kontrol edin \u2014 yol haritan\u0131z\u0131 olu\u015Fturmadan \xF6nce her \u015Feyi d\xFCzenleyebilirsiniz.",
    hints: { industry: "A\u015Fa\u011F\u0131dan birini se\xE7in.", goals: "Tek c\xFCmle yeterli. Uyan bir \xF6neriye dokunun.", tools: "\xD6rne\u011Fin: Instagram, bas\u0131l\u0131 men\xFC, WhatsApp, Google Haritalar." },
    goals: { restaurant: ["Daha fazla rezervasyon", "Daha fazla do\u011Frudan sipari\u015F", "Google Haritalar\u2019da bulunmak"], services: ["Daha fazla randevu", "Daha fazla teklif talebi", "M\xFC\u015Fterilerin geri gelmesi"], ecommerce: ["Online daha fazla sat\u0131\u015F", "Tekrar eden m\xFC\u015Fteriler", "Yeni m\xFC\u015Fterilere ula\u015Fmak"], real_estate: ["Daha fazla ilan talebi", "Adaylara h\u0131zl\u0131 d\xF6n\xFC\u015F", "\u0130lanlar\u0131 online sergilemek"], other: ["Daha fazla m\xFC\u015Fteriye ula\u015Fmak", "Online daha profesyonel g\xF6r\xFCnmek", "\u0130dari i\u015Flerde zaman kazanmak"] }
  },
  fr: {
    status: "Pr\xE9paration de votre espace",
    progress: "Progression",
    found: "Voici ce que j\u2019ai retenu :",
    skipped: "Pass\xE9",
    review: "V\xE9rifiez ces informations \u2014 tout est modifiable avant que je cr\xE9e votre feuille de route.",
    hints: { industry: "Choisissez ci-dessous.", goals: "Une phrase suffit. Touchez une suggestion si elle convient.", tools: "Par exemple : Instagram, menu imprim\xE9, WhatsApp, Google Maps." },
    goals: { restaurant: ["Plus de r\xE9servations", "Plus de commandes directes", "\xCAtre trouv\xE9 sur Google Maps"], services: ["Plus de rendez-vous", "Plus de demandes de devis", "Fid\xE9liser les clients"], ecommerce: ["Vendre plus en ligne", "Plus de clients fid\xE8les", "Toucher de nouveaux clients"], real_estate: ["Plus de demandes de biens", "Relancer plus vite", "Mettre en valeur les annonces"], other: ["Toucher plus de clients", "Para\xEEtre plus professionnel", "Gagner du temps"] }
  },
  ar: {
    status: "\u062C\u0627\u0631\u064D \u0625\u0639\u062F\u0627\u062F \u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643",
    progress: "\u062A\u0642\u062F\u0645 \u0627\u0644\u0625\u0639\u062F\u0627\u062F",
    found: "\u0625\u0644\u064A\u0643 \u0645\u0627 \u0641\u0647\u0645\u062A\u0647 \u0645\u0646 \u0630\u0644\u0643:",
    skipped: "\u062A\u0645 \u0627\u0644\u062A\u062E\u0637\u064A",
    review: "\u0631\u0627\u062C\u0639 \u0647\u0630\u0647 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u2014 \u064A\u0645\u0643\u0646\u0643 \u062A\u0639\u062F\u064A\u0644 \u0623\u064A \u0634\u064A\u0621 \u0642\u0628\u0644 \u0623\u0646 \u0623\u0628\u0646\u064A \u062E\u0637\u062A\u0643.",
    hints: { industry: "\u0627\u062E\u062A\u0631 \u0623\u062D\u062F \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0623\u062F\u0646\u0627\u0647.", goals: "\u062C\u0645\u0644\u0629 \u0648\u0627\u062D\u062F\u0629 \u062A\u0643\u0641\u064A. \u0627\u0636\u063A\u0637 \u0627\u0642\u062A\u0631\u0627\u062D\u064B\u0627 \u0645\u0646\u0627\u0633\u0628\u064B\u0627.", tools: "\u0645\u062B\u0644\u064B\u0627: \u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645\u060C \u0642\u0627\u0626\u0645\u0629 \u0645\u0637\u0628\u0648\u0639\u0629\u060C \u0648\u0627\u062A\u0633\u0627\u0628\u060C \u062E\u0631\u0627\u0626\u0637 Google." },
    goals: { restaurant: ["\u062D\u062C\u0648\u0632\u0627\u062A \u0623\u0643\u062B\u0631", "\u0637\u0644\u0628\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629 \u0623\u0643\u062B\u0631", "\u0627\u0644\u0638\u0647\u0648\u0631 \u0639\u0644\u0649 \u062E\u0631\u0627\u0626\u0637 Google"], services: ["\u0645\u0648\u0627\u0639\u064A\u062F \u0623\u0643\u062B\u0631", "\u0637\u0644\u0628\u0627\u062A \u0639\u0631\u0648\u0636 \u0623\u0633\u0639\u0627\u0631 \u0623\u0643\u062B\u0631", "\u0639\u0648\u062F\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621"], ecommerce: ["\u0645\u0628\u064A\u0639\u0627\u062A \u0623\u0643\u062B\u0631 \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A", "\u0639\u0645\u0644\u0627\u0621 \u062F\u0627\u0626\u0645\u0648\u0646", "\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0639\u0645\u0644\u0627\u0621 \u062C\u062F\u062F"], real_estate: ["\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0639\u0642\u0627\u0631\u064A\u0629 \u0623\u0643\u062B\u0631", "\u0645\u062A\u0627\u0628\u0639\u0629 \u0623\u0633\u0631\u0639", "\u0639\u0631\u0636 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A"], other: ["\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0639\u0645\u0644\u0627\u0621 \u0623\u0643\u062B\u0631", "\u0645\u0638\u0647\u0631 \u0627\u062D\u062A\u0631\u0627\u0641\u064A \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A", "\u062A\u0648\u0641\u064A\u0631 \u0627\u0644\u0648\u0642\u062A"] }
  }
};
function createOnboarding() {
  return { phase: "entry", text: "", values: {}, facts: {}, answered: /* @__PURE__ */ new Set(), requestId: crypto.randomUUID() };
}
function renderOnboarding({ app: app2, state: state2, lang: lang2, t: t2, esc: esc3, header, robot: robot2, bind, analyze, complete, guide, save = () => {
} }) {
  const [title, intro, placeholder, analyzeLabel, manual, attach, website2, nameQuestion, industryQuestion, cityQuestion, goalQuestion, next, skip, review, create, creating, urlHint, fileHint, noFacts, analyzing, converse] = copy[lang2];
  const { values, facts: facts2, answered } = state2;
  const label = (key) => t2(key === "name" ? "businessName" : key === "industryDetails" ? "services" : key);
  const input = (key, required = false) => {
    const value = values[key] || "";
    if (key === "industry") {
      return `<select name="industry"><option value="">\u2014</option>${industries.map((id) => `<option value="${id}" ${value === id ? "selected" : ""}>${esc3(t2(id === "services" ? "servicesIndustry" : id))}</option>`).join("")}</select>`;
    }
    const max = { name: 120, city: 100, country: 80, website: 500, tools: 1200, acquisition: 1200 }[key] || 1600;
    return `<input name="${key}" value="${esc3(value)}" type="${key === "website" ? "url" : "text"}" maxlength="${max}" ${required ? "required" : ""}>`;
  };
  const question = steps.find((key) => !values[key] && (key === "name" || !answered.has(key)));
  const confidenceLabels = { en: ["Quoted", "Inferred"], fr: ["Cit\xE9", "D\xE9duit"], tr: ["Al\u0131nt\u0131", "\xC7\u0131kar\u0131m"], ar: ["\u0627\u0642\u062A\u0628\u0627\u0633", "\u0627\u0633\u062A\u0646\u062A\u0627\u062C"] };
  const reviewing = state2.phase === "questions" && !question;
  const entry = state2.phase !== "questions";
  const extra = chatCopy[lang2] || chatCopy.en;
  const questionText = (key) => ({ name: nameQuestion, industry: industryQuestion, city: cityQuestion, goals: goalQuestion, tools: toolsQuestion[lang2] })[key];
  const shown = (key) => key === "industry" && values[key] ? t2(values[key] === "services" ? "servicesIndustry" : values[key]) : values[key];
  const auriMsg = (body, extraClass = "") => `<li class="os-chat-msg is-auri ${extraClass}"><span class="os-chat-avatar" aria-hidden="true"><img src="/media/auri/level-1.webp" alt="" width="32" height="32"></span><div class="os-chat-bubble">${body}</div></li>`;
  const userMsg = (body) => `<li class="os-chat-msg is-user"><div class="os-chat-bubble">${body}</div></li>`;
  const history2 = [];
  history2.push(auriMsg(entry ? `<h1>${esc3(title)}</h1><p>${esc3(intro)}</p>` : `<p><strong>${esc3(title)}</strong></p><p>${esc3(intro)}</p>`));
  if (!entry) {
    if (state2.text.trim()) history2.push(userMsg(`<p>${esc3(state2.text.trim().slice(0, 600))}${state2.text.trim().length > 600 ? "\u2026" : ""}</p>${state2.source ? `<small>\u{1F4CE} ${esc3(state2.source)}</small>` : ""}`));
    const found = Object.keys(facts2).filter((key) => values[key]);
    if (found.length) history2.push(auriMsg(`<p>${esc3(extra.found)}</p><ul class="os-chat-facts">${found.map((key) => `<li><span>${esc3(label(key))}</span><strong>${esc3(shown(key))}</strong></li>`).join("")}</ul>`));
    for (const key of steps) {
      if (key === question) break;
      if (facts2[key] && values[key]) continue;
      history2.push(auriMsg(`<p>${esc3(questionText(key))}</p>`));
      history2.push(userMsg(values[key] ? `<p>${esc3(shown(key))}</p>` : `<p class="is-skipped">${esc3(extra.skipped)}</p>`));
    }
    history2.push(auriMsg(reviewing ? `<h1>${esc3(review)}</h1><p>${esc3(extra.review)}</p>` : `<h1>${esc3(questionText(question))}</h1>${question === "name" && !values.name ? "" : `<p class="os-chat-hint">${esc3(extra.hints[question] || "")}</p>`}`, "is-current"));
  }
  const chips = !entry && !reviewing && question === "industry" ? `<div class="os-chat-chips" role="group" aria-label="${esc3(industryQuestion)}">${industries.map((id) => `<button type="button" class="os-chip" data-quick-industry="${id}">${esc3(t2(id === "services" ? "servicesIndustry" : id))}</button>`).join("")}</div>` : !entry && !reviewing && question === "goals" ? `<div class="os-chat-chips">${(extra.goals[values.industry] || extra.goals.other).map((goal) => `<button type="button" class="os-chip" data-quick-goal="${esc3(goal)}">${esc3(goal)}</button>`).join("")}</div>` : "";
  app2.innerHTML = `${header}<main id="main" class="auri-setup os-chat-setup">
 <div class="os-chat-layout"><section class="os-chat" aria-label="Auri">
 <div class="auri-setup-heading os-chat-head"><div class="auri-setup-character">${robot2()}</div><div><strong>Auri</strong><small><i class="ax-online" aria-hidden="true"></i>${esc3(extra.status)}</small></div>
 ${!entry ? `<ol class="os-chat-progress" aria-label="${esc3(extra.progress)}">${[...steps, "review"].map((key, i) => `<li class="${(key === "review" ? reviewing : key === question) ? "is-now" : (key === "review" ? false : steps.indexOf(question) > i || reviewing) ? "is-done" : ""}"></li>`).join("")}</ol>` : ""}</div>
 <ol class="os-chat-log" role="log" aria-live="polite">${history2.join("")}</ol>
 <form class="auri-setup-form os-chat-composer">
 ${entry ? `<div class="auri-setup-composer">
 <textarea name="businessText" aria-label="${esc3(placeholder)}" placeholder="${esc3(placeholder)}" maxlength="4000" rows="3">${esc3(state2.text)}</textarea>
 <div class="auri-setup-actions"><label class="os-chip">\u{1F4CE} ${esc3(attach)}<input type="file" name="source" accept=".txt,.csv,text/plain,text/csv" class="sr-only"></label>
 <button type="button" class="os-chip" data-setup="website">\u{1F517} ${esc3(website2)}</button>
 <button type="submit" class="primary os-send">${esc3(analyzeLabel)} <span aria-hidden="true">\u2191</span></button></div></div>
 <p class="auri-setup-source" role="status">${esc3(state2.source || "")}</p>
 <div class="os-chat-chips"><button type="button" class="os-chip" data-setup="manual">${esc3(manual)}</button></div>` : reviewing ? `<div class="auri-setup-review">${fields.map((key) => `<label class="field"><span>${esc3(label(key))}</span>${input(key, key === "name")}${facts2[key] ? `<small>${esc3(facts2[key].source)} \xB7 ${confidenceLabels[lang2][Number(facts2[key].confidence === "inferred")]} \xB7 \u201C${esc3(facts2[key].excerpt)}\u201D</small>` : ""}</label>`).join("")}</div>
 <button type="submit" class="primary os-send is-wide">${esc3(create)} <span aria-hidden="true">\u2192</span></button>` : `${chips}<div class="os-chat-input"><label class="field"><span class="sr-only">${esc3(label(question))}</span>${input(question, question === "name")}</label><button type="submit" class="primary os-send">${esc3(next)} <span aria-hidden="true">\u2191</span></button></div>
 <div class="os-chat-chips is-secondary">${question !== "name" ? `<button type="button" class="os-chip" data-setup="skip">${esc3(skip)}</button>` : ""}
 <button type="button" class="os-chip" data-setup="entry">${esc3(converse)}</button></div>`}
 <p role="status" data-setup-status>${esc3(state2.message || "")}</p><p role="alert"></p>
 </form></section><aside class="os-chat-aside" data-onboarding-guide></aside></div></main>`;
  app2.querySelector(".os-chat-log").lastElementChild?.scrollIntoView?.({ block: "nearest" });
  app2.querySelectorAll("[data-quick-industry]").forEach((b) => b.addEventListener("click", () => {
    const sel = app2.querySelector("select[name=industry]");
    sel.value = b.dataset.quickIndustry;
    app2.querySelector(".auri-setup-form").requestSubmit();
  }));
  app2.querySelectorAll("[data-quick-goal]").forEach((b) => b.addEventListener("click", () => {
    const field2 = app2.querySelector("input[name=goals]");
    field2.value = b.dataset.quickGoal;
    field2.focus();
  }));
  bind();
  guide?.(app2.querySelector("[data-onboarding-guide]"));
  const form = app2.querySelector(".auri-setup-form");
  const alert = form.querySelector('[role="alert"]');
  const status = form.querySelector("[data-setup-status]");
  const rerender = () => {
    save(state2);
    renderOnboarding({ app: app2, state: state2, lang: lang2, t: t2, esc: esc3, header, robot: robot2, bind, analyze, complete, guide, save });
    app2.querySelector('.auri-setup-form input:not([type="file"]), .auri-setup-form textarea, .auri-setup-form select')?.focus();
  };
  const composer = form.elements.businessText;
  function record() {
    for (const [key, value] of new FormData(form)) {
      if (!fields.includes(key)) continue;
      const clean = value.trim();
      if (facts2[key]?.value !== clean) delete facts2[key];
      values[key] = clean;
    }
  }
  if (entry) {
    composer.oninput = () => {
      state2.text = composer.value;
      save(state2);
      state2.source = "";
      form.querySelector(".auri-setup-source").textContent = "";
    };
    const readFile = async (file) => {
      if (!file || state2.busy) return;
      if (!/\.(txt|csv)$/i.test(file.name) || file.size > 16e3) {
        alert.textContent = fileHint;
        return;
      }
      const previous = composer.value;
      try {
        const text = await file.text();
        if (text.length > 4e3 || !text.trim() || text.includes("\0")) throw new Error(fileHint);
        if (state2.busy || !form.isConnected || composer.value !== previous) return;
        state2.text = composer.value = text;
        form.querySelector(".auri-setup-source").textContent = state2.source = file.name;
        save(state2);
        alert.textContent = "";
        composer.focus();
      } catch {
        alert.textContent = fileHint;
      }
    };
    form.elements.source.onchange = (event) => {
      void readFile(event.target.files[0]);
    };
    const drop = form.querySelector(".auri-setup-composer");
    drop.ondragover = (event) => {
      if (event.dataTransfer.types.includes("Files")) event.preventDefault();
    };
    drop.ondrop = (event) => {
      if (event.dataTransfer.files.length) {
        event.preventDefault();
        void readFile(event.dataTransfer.files[0]);
      }
    };
    form.querySelector('[data-setup="website"]').onclick = () => {
      composer.focus();
      status.textContent = urlHint;
    };
    form.querySelector('[data-setup="manual"]').onclick = () => {
      state2.phase = "questions";
      state2.message = "";
      rerender();
    };
  } else {
    form.querySelector('[data-setup="entry"]')?.addEventListener("click", () => {
      record();
      save(state2);
      app2.querySelector("[data-onboarding-guide] input")?.focus();
    });
    form.querySelector('[data-setup="skip"]')?.addEventListener("click", () => {
      answered.add(question);
      state2.message = "";
      rerender();
    });
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    if (state2.busy) return;
    alert.textContent = "";
    state2.message = "";
    if (!entry) record();
    if (!entry && !reviewing) {
      if (question === "name" && !values.name) {
        alert.textContent = nameQuestion;
        return;
      }
      answered.add(question);
      rerender();
      return;
    }
    if (entry && !state2.text.trim()) {
      composer.focus();
      return;
    }
    if (reviewing && !values.name) {
      form.elements.name.focus();
      alert.textContent = nameQuestion;
      return;
    }
    save(state2);
    state2.busy = true;
    status.textContent = entry ? analyzing : creating;
    const log = app2.querySelector(".os-chat-log");
    log?.insertAdjacentHTML("beforeend", `<li class="os-chat-msg is-auri is-typing" data-typing><span class="os-chat-avatar" aria-hidden="true"><img src="/media/auri/level-1.webp" alt="" width="32" height="32"></span><div class="os-chat-bubble"><span class="os-typing"><i></i><i></i><i></i></span><small>${esc3(entry ? analyzing : creating)}</small></div></li>`);
    log?.lastElementChild?.scrollIntoView?.({ block: "nearest" });
    const controls2 = [...form.elements, ...app2.querySelectorAll("#language")].filter((control) => !control.disabled);
    controls2.forEach((control) => {
      control.disabled = true;
    });
    try {
      if (entry) {
        const text = state2.text.trim();
        let extracted;
        if (/^https:\/\/\S+$/i.test(text)) {
          const url = new URL(text);
          if (text.length > 500 || url.username || url.password) throw new Error(urlHint);
          extracted = { website: { value: text, excerpt: text, confidence: "quoted" } };
        } else {
          ({ facts: extracted } = await runAuri("setup", "thinking", () => analyze(text)));
        }
        for (const [key, fact] of Object.entries(extracted)) {
          if (!fields.includes(key) || values[key]) continue;
          values[key] = fact.value;
          facts2[key] = { ...fact, source: state2.source || "Auri" };
        }
        state2.message = Object.keys(extracted).length ? "" : noFacts;
        state2.phase = "questions";
        rerender();
      } else {
        await runAuri("setup", "working", () => complete(values, state2.requestId));
      }
    } catch (error) {
      alert.textContent = error.message;
    } finally {
      state2.busy = false;
      status.textContent = "";
      app2.querySelector("[data-typing]")?.remove();
      controls2.forEach((control) => {
        control.disabled = false;
      });
    }
  };
}

// src/hub/blueprint-copy.js
var copy2 = {
  en: ["Overview", "Marketplace", "Insights", "Other way", "Not relevant", "Do later", "I already have this", "Use the original route", "Evidence link or description", "Submit for review", "Under review", "Verified", "Needs new evidence", "Verified outcomes", "Next mission"],
  tr: ["Genel bak\u0131\u015F", "Pazar yeri", "\u0130\xE7g\xF6r\xFCler", "Ba\u015Fka bir yol", "Uygun de\u011Fil", "Daha sonra", "Buna zaten sahibim", "\u0130lk yola d\xF6n", "Kan\u0131t ba\u011Flant\u0131s\u0131 veya a\xE7\u0131klamas\u0131", "\u0130ncelemeye g\xF6nder", "\u0130nceleniyor", "Do\u011Fruland\u0131", "Yeni kan\u0131t gerekli", "Do\u011Frulanan sonu\xE7lar", "Sonraki g\xF6rev"],
  fr: ["Vue d\u2019ensemble", "Marketplace", "Analyses", "Autre m\xE9thode", "Non pertinent", "Plus tard", "Je l\u2019ai d\xE9j\xE0", "Revenir \xE0 la m\xE9thode initiale", "Lien ou description de la preuve", "Envoyer pour examen", "En cours d\u2019examen", "V\xE9rifi\xE9", "Nouvelle preuve requise", "R\xE9sultats v\xE9rifi\xE9s", "Prochaine mission"],
  ar: ["\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", "\u0627\u0644\u0633\u0648\u0642", "\u0627\u0644\u0631\u0624\u0649", "\u0637\u0631\u064A\u0642\u0629 \u0623\u062E\u0631\u0649", "\u063A\u064A\u0631 \u0645\u0646\u0627\u0633\u0628", "\u0644\u0627\u062D\u0642\u064B\u0627", "\u0644\u062F\u064A\u0651 \u0647\u0630\u0627 \u0628\u0627\u0644\u0641\u0639\u0644", "\u0627\u0644\u0631\u062C\u0648\u0639 \u0625\u0644\u0649 \u0627\u0644\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629", "\u0631\u0627\u0628\u0637 \u0623\u0648 \u0648\u0635\u0641 \u0644\u0644\u062F\u0644\u064A\u0644", "\u0625\u0631\u0633\u0627\u0644 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642", "\u064A\u0644\u0632\u0645 \u062F\u0644\u064A\u0644 \u062C\u062F\u064A\u062F", "\u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062D\u0642\u0642\u0629", "\u0627\u0644\u0645\u0647\u0645\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629"]
};
var blueprintLabels = (lang2) => Object.fromEntries(["overview", "marketplace", "insights", "alternative", "irrelevant", "later", "proof", "original", "proofLabel", "submit", "pending", "approved", "rejected", "verified", "next"].map((key, i) => [key, copy2[lang2][i]]));
var commandCopy = {
  en: ["Growth Vision", "Continue roadmap", "Zoom in", "Zoom out", "Reset zoom", "Recommended", "Available", "Customer completed", "Explore solutions", "Your existing tools", "Business performance", "Connect a supported analytics source to see business performance.", "Priority missions", "Let\u2019s build your business growth plan."],
  tr: ["B\xFCy\xFCme Haritas\u0131", "Yol haritas\u0131na devam et", "Yak\u0131nla\u015Ft\u0131r", "Uzakla\u015Ft\u0131r", "Yak\u0131nla\u015Ft\u0131rmay\u0131 s\u0131f\u0131rla", "\xD6nerilen", "Kullan\u0131labilir", "M\xFC\u015Fteri tamamlad\u0131", "\xC7\xF6z\xFCmleri ke\u015Ffedin", "Mevcut ara\xE7lar\u0131n\u0131z", "\u0130\u015F performans\u0131", "\u0130\u015F performans\u0131n\u0131 g\xF6rmek i\xE7in desteklenen bir analiz kayna\u011F\u0131 ba\u011Flay\u0131n.", "\xD6ncelikli g\xF6revler", "\u0130\u015Fletmenizin b\xFCy\xFCme plan\u0131n\u0131 olu\u015Ftural\u0131m."],
  fr: ["Vision de croissance", "Poursuivre la feuille de route", "Agrandir", "R\xE9duire", "R\xE9initialiser le zoom", "Recommand\xE9", "Disponible", "Termin\xE9 par le client", "Explorer les solutions", "Vos outils existants", "Performance de l\u2019entreprise", "Connectez une source d\u2019analyse compatible pour consulter les performances.", "Missions prioritaires", "Cr\xE9ons le plan de croissance de votre entreprise."],
  ar: ["\u0631\u0624\u064A\u0629 \u0627\u0644\u0646\u0645\u0648", "\u0645\u062A\u0627\u0628\u0639\u0629 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u062A\u0643\u0628\u064A\u0631", "\u062A\u0635\u063A\u064A\u0631", "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0627\u0644\u062A\u0643\u0628\u064A\u0631", "\u0645\u0648\u0635\u0649 \u0628\u0647", "\u0645\u062A\u0627\u062D", "\u0623\u0643\u0645\u0644\u0647 \u0627\u0644\u0639\u0645\u064A\u0644", "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062D\u0644\u0648\u0644", "\u0623\u062F\u0648\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", "\u0623\u062F\u0627\u0621 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u0627\u0631\u0628\u0637 \u0645\u0635\u062F\u0631 \u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0645\u062F\u0639\u0648\u0645\u064B\u0627 \u0644\u0639\u0631\u0636 \u0623\u062F\u0627\u0621 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A.", "\u0627\u0644\u0645\u0647\u0627\u0645 \u0630\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", "\u0644\u0646\u0636\u0639 \u062E\u0637\u0629 \u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A."]
};
var commandLabels = (lang2) => Object.fromEntries(["vision", "continue", "zoomIn", "zoomOut", "zoomReset", "recommended", "available", "selfDone", "solutions", "tools", "performance", "connect", "priorities", "onboarding"].map((key, i) => [key, commandCopy[lang2][i]]));

// src/mission-routes.js
var goalByCapability = {
  domain: "foundation",
  email: "foundation",
  branding: "foundation",
  hosting: "foundation",
  website: "visibility",
  seo: "visibility",
  discovery: "visibility",
  ads: "visibility",
  reviews: "visibility",
  leads: "conversion",
  whatsapp: "conversion",
  conversion: "conversion",
  menu: "conversion",
  crm: "operations",
  automation: "operations",
  followups: "operations",
  analytics: "measurement",
  retention: "measurement"
};
var alternatives = {
  foundation: ["Document goals and responsibilities", "Write down the offer, audience, priority and who owns the next step."],
  visibility: ["Use an existing discovery channel", "Publish accurate business information and a contact action in a directory, portfolio, storefront or referral channel your audience uses."],
  conversion: ["Use an existing customer intake channel", "Make the next step clear through a booking, enquiry, ordering or support channel. Test one customer request from start to finish."],
  operations: ["Run a repeatable manual workflow", "Record the handoff, owner and follow-up in a shared checklist or tracker. Test it on a typical request."],
  measurement: ["Review one useful business metric", "Record a baseline, review it after an improvement, and document what you will change next."]
};
var missionOutcome = (capability) => goalByCapability[capability] || null;
function missionAlternative(capability) {
  const option = alternatives[missionOutcome(capability)];
  return option ? { title: option[0], steps: option[1] } : null;
}

// src/hub/auri-copy.js
var states = ["listening", "thinking", "working", "typing", "speaking", "happy", "success", "error", "evolving"];
var actions = {
  en: ["Listening", "Preparing a reply\u2026", "Building your roadmap\u2026", "Building your roadmap\u2026", "Reply ready", "Milestone verified", "Roadmap saved", "Auri could not finish the request", "Auri evolved"],
  tr: ["Dinliyor", "Yan\u0131t haz\u0131rlan\u0131yor\u2026", "Yol haritas\u0131 haz\u0131rlan\u0131yor\u2026", "Yol haritas\u0131 haz\u0131rlan\u0131yor\u2026", "Yan\u0131t haz\u0131r", "Hedef do\u011Fruland\u0131", "Yol haritas\u0131 kaydedildi", "Auri iste\u011Fi tamamlayamad\u0131", "Auri geli\u015Fti"],
  fr: ["\xC0 l\u2019\xE9coute", "Pr\xE9paration de la r\xE9ponse\u2026", "Cr\xE9ation de votre feuille de route\u2026", "Cr\xE9ation de votre feuille de route\u2026", "R\xE9ponse pr\xEAte", "Objectif v\xE9rifi\xE9", "Feuille de route enregistr\xE9e", "Auri n\u2019a pas pu traiter la demande", "Auri a \xE9volu\xE9"],
  ar: ["\u064A\u0633\u062A\u0645\u0639", "\u062C\u0627\u0631\u064D \u062A\u062C\u0647\u064A\u0632 \u0627\u0644\u0631\u062F\u2026", "\u062C\u0627\u0631\u064D \u0625\u0639\u062F\u0627\u062F \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642\u2026", "\u062C\u0627\u0631\u064D \u0625\u0639\u062F\u0627\u062F \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642\u2026", "\u0627\u0644\u0631\u062F \u062C\u0627\u0647\u0632", "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0646\u062C\u0627\u0632", "\u062A\u0645 \u062D\u0641\u0638 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u062A\u0639\u0630\u0631 \u0639\u0644\u0649 \u0623\u0648\u0631\u064A \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u0637\u0644\u0628", "\u062A\u0637\u0648\u0651\u0631 \u0623\u0648\u0631\u064A"]
};
var auriLabels = (lang2) => ({
  ...Object.fromEntries(states.map((state2, i) => [state2, actions[lang2][i]])),
  drafting: auriDraftCopy(lang2).drafting,
  draft_ready: auriDraftCopy(lang2).ready
});
var auriNames = ["Awakening", "Learning", "Helper", "Builder", "Operator", "Strategist", "Aura Master"];
var controls = {
  en: ["AI Workspace", "Hide companion", "Show companion", "Companion name", "Ready to help", "Stop voice", "Companion hidden"],
  tr: ["Yapay Zek\xE2 \xC7al\u0131\u015Fma Alan\u0131", "Asistan\u0131 gizle", "Asistan\u0131 g\xF6ster", "Asistan\u0131n ad\u0131", "Yard\u0131ma haz\u0131r", "Sesi durdur", "Asistan gizli"],
  fr: ["Espace de travail IA", "Masquer le compagnon", "Afficher le compagnon", "Nom du compagnon", "Pr\xEAt \xE0 aider", "Arr\xEAter la lecture", "Compagnon masqu\xE9"],
  ar: ["\u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", "\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0631\u0641\u064A\u0642", "\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0631\u0641\u064A\u0642", "\u0627\u0633\u0645 \u0627\u0644\u0631\u0641\u064A\u0642", "\u062C\u0627\u0647\u0632 \u0644\u0644\u0645\u0633\u0627\u0639\u062F\u0629", "\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062A", "\u0627\u0644\u0631\u0641\u064A\u0642 \u0645\u062E\u0641\u064A"]
};
var auriControls = (lang2) => Object.fromEntries(["workspace", "hide", "show", "name", "ready", "stop", "hidden"].map((key, i) => [key, controls[lang2][i]]));
var draftCopy = {
  en: ["Draft customer follow-up", "Preparing a follow-up draft\u2026", "Draft ready to review", "Recent work", "AI draft", "Template draft", "Saved for review"],
  tr: ["M\xFC\u015Fteri takip mesaj\u0131 tasla\u011F\u0131", "Takip tasla\u011F\u0131 haz\u0131rlan\u0131yor\u2026", "Taslak incelemeye haz\u0131r", "Son \xE7al\u0131\u015Fmalar", "YZ tasla\u011F\u0131", "\u015Eablon tasla\u011F\u0131", "\u0130nceleme i\xE7in kaydedildi"],
  fr: ["R\xE9diger une relance client", "Pr\xE9paration du brouillon\u2026", "Brouillon \xE0 relire", "Travaux r\xE9cents", "Brouillon IA", "Brouillon \xE0 partir d\u2019un mod\xE8le", "Enregistr\xE9 pour relecture"],
  ar: ["\u0625\u0646\u0634\u0627\u0621 \u0645\u0633\u0648\u062F\u0629 \u0645\u062A\u0627\u0628\u0639\u0629 \u0644\u0644\u0639\u0645\u064A\u0644", "\u062C\u0627\u0631\u064D \u0625\u0639\u062F\u0627\u062F \u0645\u0633\u0648\u062F\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629\u2026", "\u0627\u0644\u0645\u0633\u0648\u062F\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0623\u062E\u064A\u0631", "\u0645\u0633\u0648\u062F\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", "\u0645\u0633\u0648\u062F\u0629 \u0645\u0646 \u0642\u0627\u0644\u0628", "\u062D\u064F\u0641\u0638\u062A \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629"]
};
var auriDraftCopy = (lang2) => Object.fromEntries(["create", "drafting", "ready", "history", "ai", "template", "review"].map((key, i) => [key, draftCopy[lang2][i]]));

// src/customer-return.js
function customerReturnPath(value, fallback) {
  if (typeof value === "string" && value.length <= 2048 && /^\/hub(?:\/(?:roadmap|auri|work|requests|menu-drafts|onboarding|profile|settings|tasks|invoices|team|resources|simulator))?(?:\?[^#\r\n]*)?$/.test(value)) return value;
  return ["/hub", "/account", "/shop/checkout"].includes(value) || typeof value === "string" && /^\/shop\/orders\/[a-f0-9-]{36}$/.test(value) ? value : fallback;
}

// src/roadmap.js
var roadmapStages = [
  { key: "foundation", icon: "\u25C7" },
  { key: "visibility", icon: "\u25CE" },
  { key: "conversion", icon: "\u2197" },
  { key: "automation", icon: "\u2699" },
  { key: "scale", icon: "\u25A5" }
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
  const requirements = (mission.route === "alternative" ? [] : mission.dependencies || []).filter((id) => !existing.has(id) && !missions.some((candidate) => candidate.capability === id && candidate.status === "done"));
  return { requirements, blocked: mission.status !== "done" && requirements.length > 0 };
}
function eligibleMissions(missions, profile) {
  return missions.filter((mission) => !["done", "postponed"].includes(mission.status) && !missionState(mission, missions, profile).blocked).sort((a, b) => Number(a.optional || false) - Number(b.optional || false) || a.priority - b.priority || a.position - b.position);
}

// src/hub/growth-vision-path.js
var copy3 = {
  en: {
    subtitle: "Your business growth path, step by step.",
    xp: "Verified XP",
    verified: "verified milestones",
    missions: "Level tasks",
    stage: "Current level",
    next: "Complete tasks, then submit evidence to unlock XP.",
    auri: "Auri evolution",
    evolves: "Auri evolves when a growth milestone is verified.",
    empty: "No tasks are assigned to this level yet.",
    done: "Tasks completed",
    active: "In progress",
    upcoming: "Upcoming",
    pending: "Ready for review",
    reward: "XP when verified",
    progress: "Roadmap progress",
    descriptions: ["Establish your business basics", "Help more people find you", "Turn interest into customers", "Work smarter with connected systems", "Measure, improve and scale"],
    names: ["Foundation", "Visibility", "Conversion", "Operations", "Scale"]
  },
  tr: {
    subtitle: "\u0130\u015Fletmenizin b\xFCy\xFCme yolu, ad\u0131m ad\u0131m.",
    xp: "Do\u011Frulanm\u0131\u015F XP",
    verified: "do\u011Frulanm\u0131\u015F hedef",
    missions: "Seviye g\xF6revleri",
    stage: "Se\xE7ili seviye",
    next: "G\xF6revleri tamamlay\u0131n ve XP i\xE7in kan\u0131t g\xF6nderin.",
    auri: "Auri geli\u015Fimi",
    evolves: "B\xFCy\xFCme hedefi do\u011Fruland\u0131\u011F\u0131nda Auri geli\u015Fir.",
    empty: "Bu seviyeye hen\xFCz g\xF6rev atanmad\u0131.",
    done: "G\xF6revler tamamland\u0131",
    active: "Devam ediyor",
    upcoming: "Yakla\u015Fan",
    pending: "\u0130ncelemeye haz\u0131r",
    reward: "Do\u011Frulan\u0131nca XP",
    progress: "Yol haritas\u0131 ilerlemesi",
    descriptions: ["\u0130\u015Fletmenizin temelleri", "Daha fazla ki\u015Fiye ula\u015F\u0131n", "\u0130lgiyi m\xFC\u015Fteriye d\xF6n\xFC\u015Ft\xFCr\xFCn", "Ba\u011Flant\u0131l\u0131 sistemlerle daha verimli \xE7al\u0131\u015F\u0131n", "\xD6l\xE7\xFCn, iyile\u015Ftirin ve b\xFCy\xFCy\xFCn"],
    names: ["Temel", "G\xF6r\xFCn\xFCrl\xFCk", "D\xF6n\xFC\u015F\xFCm", "Operasyon", "B\xFCy\xFCme"]
  },
  fr: {
    subtitle: "Votre parcours de croissance, \xE9tape par \xE9tape.",
    xp: "XP v\xE9rifi\xE9e",
    verified: "objectifs v\xE9rifi\xE9s",
    missions: "Missions du niveau",
    stage: "Niveau s\xE9lectionn\xE9",
    next: "Terminez les missions et soumettez des preuves pour obtenir de l\u2019XP.",
    auri: "\xC9volution d\u2019Auri",
    evolves: "Auri \xE9volue lorsqu\u2019un objectif est v\xE9rifi\xE9.",
    empty: "Aucune mission attribu\xE9e \xE0 ce niveau.",
    done: "Missions termin\xE9es",
    active: "En cours",
    upcoming: "\xC0 venir",
    pending: "\xC0 v\xE9rifier",
    reward: "XP apr\xE8s v\xE9rification",
    progress: "Progression",
    descriptions: ["\xC9tablir les bases", "Am\xE9liorer votre visibilit\xE9", "Transformer les contacts en clients", "Travailler avec des syst\xE8mes connect\xE9s", "Mesurer, optimiser et grandir"],
    names: ["Fondations", "Visibilit\xE9", "Conversion", "Op\xE9rations", "Croissance"]
  },
  ar: {
    subtitle: "\u0645\u0633\u0627\u0631 \u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u060C \u062E\u0637\u0648\u0629 \u0628\u062E\u0637\u0648\u0629.",
    xp: "\u0646\u0642\u0627\u0637 XP \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629",
    verified: "\u0625\u0646\u062C\u0627\u0632\u0627\u062A \u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627",
    missions: "\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u0633\u062A\u0648\u0649",
    stage: "\u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u062D\u062F\u062F",
    next: "\u0623\u0643\u0645\u0644 \u0627\u0644\u0645\u0647\u0627\u0645 \u0648\u0623\u0631\u0633\u0644 \u0627\u0644\u062F\u0644\u064A\u0644 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0646\u0642\u0627\u0637 XP.",
    auri: "\u062A\u0637\u0648\u0631 \u0623\u0648\u0631\u064A",
    evolves: "\u062A\u062A\u0637\u0648\u0631 \u0623\u0648\u0631\u064A \u0639\u0646\u062F \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0625\u0646\u062C\u0627\u0632 \u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0645\u0648.",
    empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0647\u0627\u0645 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u0628\u0639\u062F.",
    done: "\u0627\u0644\u0645\u0647\u0627\u0645 \u0645\u0643\u062A\u0645\u0644\u0629",
    active: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630",
    upcoming: "\u0627\u0644\u0642\u0627\u062F\u0645",
    pending: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629",
    reward: "\u0646\u0642\u0627\u0637 \u0628\u0639\u062F \u0627\u0644\u062A\u062D\u0642\u0642",
    progress: "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642",
    descriptions: ["\u062A\u0623\u0633\u064A\u0633 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", "\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645 \u0625\u0644\u0649 \u0639\u0645\u0644\u0627\u0621", "\u0627\u0644\u0639\u0645\u0644 \u0628\u0643\u0641\u0627\u0621\u0629 \u0639\u0628\u0631 \u0623\u0646\u0638\u0645\u0629 \u0645\u062A\u0635\u0644\u0629", "\u0627\u0644\u0642\u064A\u0627\u0633 \u0648\u0627\u0644\u062A\u062D\u0633\u064A\u0646 \u0648\u0627\u0644\u062A\u0648\u0633\u0639"],
    names: ["\u0627\u0644\u062A\u0623\u0633\u064A\u0633", "\u0627\u0644\u0638\u0647\u0648\u0631", "\u0627\u0644\u062A\u062D\u0648\u064A\u0644", "\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A", "\u0627\u0644\u062A\u0648\u0633\u0639"]
  }
};
var rewards = [100, 180, 260, 340, 420];
function renderGrowthVisionPath({ workspace: workspace2, esc: esc3, lang: lang2 = "en", title, status, displayState, selected, robot: robot2 }) {
  const ui = copy3[lang2] || copy3.en;
  const hub = hubLabels(lang2);
  const missions = workspace2.missions || [];
  const stages = hubStageNames(lang2).map((name, index) => ({
    name,
    missions: missions.filter((m) => hubStage(m.level) === index)
  }));
  const current = stages.findIndex((stage2) => stage2.missions.some((m) => !m.optional && !["done", "postponed"].includes(m.status)));
  const chosen = selected ? hubStage(selected.level) : Math.max(current, 0);
  const stage = stages[chosen];
  const auriLevel2 = Math.max(1, Math.min(7, Number(workspace2.auri?.level) || 1));
  const verified = Math.max(0, Math.min(5, Number(workspace2.auri?.verifiedMilestones) || 0));
  const xp = rewards.slice(0, verified).reduce((sum, value) => sum + value, 0);
  const maxXp = rewards.reduce((sum, value) => sum + value, 0);
  const complete = (stageMissions) => stageMissions.filter((m) => m.status === "done").length;
  const missionButton = (m) => {
    const state2 = displayState(m);
    const icon3 = { verified: "\u2713", done: "\u2713", review: "\u25F7", recommended: "\u2726", in_progress: "\u25D4", blocked: "\xB7", postponed: "\u2013" }[state2] || "\u25CB";
    return `<button class="vision-task" type="button" data-node="${esc3(m.id)}" data-display-state="${esc3(state2)}" aria-pressed="${selected?.id === m.id}">
   <span class="vision-task-icon" aria-hidden="true">${icon3}</span>
   <span class="vision-task-name">${esc3(title(m))}</span>
   <span class="vision-task-status">${esc3(status(m))}</span>
   <span class="vision-task-arrow" aria-hidden="true">\u203A</span>
  </button>`;
  };
  const stageCard = (item, index) => {
    const count = complete(item.missions), total = item.missions.length;
    const finished = total > 0 && count === total;
    const active = current === index;
    const first = item.missions.find((m) => !m.optional && !["done", "postponed"].includes(m.status)) || item.missions[0];
    const state2 = finished ? ui.done : active ? hub.current : current < index && current !== -1 ? hub.locked : ui.upcoming;
    const content2 = `<span class="vision-stage-status">${index + 1} \xB7 ${esc3(state2)}</span>
    <strong>${esc3(item.name)}</strong>
    ${index < 3 ? `<img class="vision-stage-art" src="/hub/stage-${index + 1}.webp" alt="" width="140" height="106">` : `<span class="vision-stage-icon vision-stage-fallback" aria-hidden="true">${index === 3 ? "\u2699" : "\u25A5"}</span>`}
    <small>${count} / ${total} ${esc3(ui.missions.toLowerCase())}</small>`;
    return `<li class="vision-stage" data-stage-state="${finished ? "done" : active ? "active" : "upcoming"}">
   ${first ? `<button type="button" class="vision-stage-button" data-node="${esc3(first.id)}" aria-pressed="${chosen === index}">${content2}</button>` : `<div class="vision-stage-button">${content2}</div>`}
  </li>`;
  };
  return `<div class="growth-path" aria-label="${esc3(ui.progress)}">
  <header class="vision-heading">
   <div><h2>${esc3(missions.find((m) => m.planGoal)?.planGoal || ui.subtitle)}</h2></div>
   <section class="vision-xp" aria-label="${esc3(ui.xp)}">
    <div class="vision-xp-head"><strong>\u2726 ${esc3(ui.xp)}</strong><span>${xp} / ${maxXp} XP</span></div>
    <div class="vision-xp-track" role="progressbar" aria-valuenow="${xp}" aria-valuemin="0" aria-valuemax="${maxXp}" aria-label="${esc3(ui.xp)}"><span style="width:${(xp / maxXp * 100).toFixed(1)}%"></span></div>
    <small>${verified} / 5 ${esc3(ui.verified)}</small>
   </section>
  </header>
  <div class="vision-path-scroll"><ol class="vision-path-cards" aria-label="${esc3(ui.progress)}">${stages.map(stageCard).join("")}</ol></div>
  <div class="vision-selected">
   <section class="vision-tasks" aria-label="${esc3(ui.missions)}">
    <div class="vision-level-heading"><div>
     <h3>${esc3(stage.name)}</h3></div></div>
    <div class="vision-task-list">${stage.missions.map(missionButton).join("") || `<p class="vision-empty">${esc3(ui.empty)}</p>`}</div>
    <p class="vision-note">${esc3(ui.next)}</p>
   </section>
   <section class="vision-auri" aria-label="${esc3(ui.auri)}">
    <div class="vision-auri-portrait">${robot2()}</div>
    <div class="vision-auri-description"><span class="vision-kicker">${esc3(ui.auri)}</span>
     <h3>Auri \xB7 ${auriLevel2} / 7</h3><p>${esc3(ui.evolves)}</p>
     <div class="vision-auri-pips" aria-label="${esc3(ui.auri)} ${auriLevel2} / 7">
      ${Array.from({ length: 7 }, (_, i) => `<span class="${i < auriLevel2 ? "is-earned" : ""}" aria-hidden="true"></span>`).join("")}
     </div>
    </div>
   </section>
  </div>
 </div>`;
}

// src/hub/roadmap-view.js
var labels2 = {
  en: ["Dashboard", "Roadmap", "Tasks", "Resources", "Welcome back", "Roadmap progress", "Growth stage", "Priority actions", "Estimated timeline", "Your business growth", "Your Business Growth Roadmap", "My path", "Timeline", "Current focus", "Why it matters", "How to do it", "Requirements", "Do it myself", "Get this done with AuraDigital", "Ask Auri\u2026", "Optional", "Blocked", "Update my roadmap", "Request a service", "Start", "Mark complete", "Auri Assistant", "Can AuraDigital help?", "Upcoming", "Completed", "Ask about this task"],
  tr: ["Panel", "Yol haritas\u0131", "G\xF6revler", "Kaynaklar", "Tekrar ho\u015F geldiniz", "Yol haritas\u0131 ilerlemesi", "B\xFCy\xFCme a\u015Famas\u0131", "\xD6ncelikli ad\u0131mlar", "Tahmini s\xFCre", "\u0130\u015Fletmenizin b\xFCy\xFCmesi", "\u0130\u015Fletmenizin b\xFCy\xFCme yol haritas\u0131", "Yolum", "Zaman \xE7izelgesi", "\u015Eu anki odak", "Neden \xF6nemli", "Nas\u0131l yap\u0131l\u0131r", "Gereksinimler", "Kendim yapaca\u011F\u0131m", "AuraDigital ile yap", "Auri\u2019ye sorun\u2026", "\u0130ste\u011Fe ba\u011Fl\u0131", "Engellendi", "Yol haritas\u0131n\u0131 g\xFCncelle", "Hizmet iste", "Ba\u015Fla", "Tamamland\u0131 olarak i\u015Faretle", "Auri Asistan\u0131", "AuraDigital yard\u0131mc\u0131 olabilir mi?", "Yakla\u015Fan", "Tamamlanan", "Bu g\xF6revi sor"],
  fr: ["Tableau de bord", "Feuille de route", "T\xE2ches", "Ressources", "Bon retour", "Progression", "\xC9tape de croissance", "Actions prioritaires", "D\xE9lai estim\xE9", "La croissance de votre entreprise", "Votre feuille de route de croissance", "Mon parcours", "Chronologie", "Priorit\xE9 actuelle", "Pourquoi cette t\xE2che compte", "Comment faire", "Pr\xE9requis", "Le faire moi-m\xEAme", "Confier \xE0 AuraDigital", "Demander \xE0 Auri\u2026", "Facultatif", "Bloqu\xE9", "Actualiser la feuille de route", "Demander un service", "D\xE9marrer", "Marquer comme termin\xE9", "Assistant Auri", "AuraDigital peut-il aider ?", "\xC0 venir", "Termin\xE9", "Poser une question sur cette t\xE2che"],
  ar: ["\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", "\u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0644\u0645\u0647\u0627\u0645", "\u0627\u0644\u0645\u0648\u0627\u0631\u062F", "\u0623\u0647\u0644\u064B\u0627 \u0628\u0639\u0648\u062F\u062A\u0643", "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0645\u0648", "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", "\u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062F\u0631\u0629", "\u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u062E\u0627\u0631\u0637\u0629 \u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u0645\u0633\u0627\u0631\u064A", "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A", "\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0627\u0644\u062D\u0627\u0644\u064A", "\u0644\u0645\u0627\u0630\u0627 \u064A\u0647\u0645", "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A", "\u0633\u0623\u0646\u0641\u0630\u0647\u0627 \u0628\u0646\u0641\u0633\u064A", "\u0646\u0641\u0651\u0630 \u0645\u0639 AuraDigital", "\u0627\u0633\u0623\u0644 Auri\u2026", "\u0627\u062E\u062A\u064A\u0627\u0631\u064A", "\u0645\u062A\u0648\u0642\u0641", "\u062D\u062F\u0651\u062B \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0637\u0644\u0628 \u062E\u062F\u0645\u0629", "\u0627\u0628\u062F\u0623", "\u0639\u0644\u0651\u0645 \u0643\u0645\u0643\u062A\u0645\u0644", "\u0645\u0633\u0627\u0639\u062F Auri", "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0644\u0640 AuraDigital \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629\u061F", "\u0627\u0644\u0642\u0627\u062F\u0645", "\u0627\u0644\u0645\u0643\u062A\u0645\u0644", "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0645\u0629"]
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
].map((key, i) => [key, labels2[lang2][i]]));
function renderRoadmap({ host, workspace: workspace2, t: t2, esc: esc3, cap: cap2, lang: lang2, view, selectedId, overview = false, compact = false, auriDesk = "", evolutionNames = [], onSelect, onContinue, onView, onSave, onEdit, onGenerate, onAsk, onRoute, onEvidence, onExistingEvidence, onAskTask, robot: robot2, requestLink: requestLink2 }) {
  const l = roadmapLabels(lang2), ui = blueprintLabels(lang2), command = commandLabels(lang2);
  const { missions, profile, analysis, permissions } = workspace2;
  const canWrite = permissions.includes("roadmap:write");
  const canAsk = permissions.includes("auri:use");
  const eligible = eligibleMissions(missions, profile).filter((m) => workspace2.evidence?.[m.id] !== "pending");
  const selected = missions.find((m) => m.id === selectedId) || eligible[0] || missions[0];
  const completion = (items) => items.length ? Math.round(items.filter((m) => m.status === "done").length / items.length * 100) : 0;
  const progress = completion(missions);
  const stageOf = (m) => Math.max(1, Math.min(Number(m.level) || 1, 5));
  const title = (m) => m.route === "alternative" ? missionAlternative(m.capability)?.title || m.objective : m.objective === m.service ? cap2(m.capability) : m.objective;
  const stages = roadmapStages.map((stage, i) => ({ ...stage, missions: missions.filter((m) => stageOf(m) === i + 1) }));
  const stageName = (stage, i) => lang2 === "en" ? ["Build Foundation", "Increase Visibility", "Convert More Visitors", "Improve Operations", "Measure & Scale"][i] : t2(stage.key);
  const currentStage = stages.findIndex((stage) => stage.missions.some((m) => !m.optional && !["done", "postponed"].includes(m.status)));
  const isBlocked = (m) => missionState(m, missions, profile).blocked;
  const displayState = (m) => ({ approved: "verified", pending: "review" })[workspace2.evidence?.[m.id]] || (isBlocked(m) ? "blocked" : m.status === "planned" && m.id === eligible[0]?.id ? "recommended" : m.status);
  const status = (m) => ({ verified: ui.approved, review: ui.pending, recommended: command.recommended, planned: command.available, done: command.selfDone, blocked: l.blocked })[displayState(m)] || t2(m.status);
  const node = (m) => `<button type="button" class="growth-node" data-node="${esc3(m.id)}" data-status="${isBlocked(m) ? "blocked" : m.status}" data-display-state="${displayState(m)}" aria-pressed="${m.id === selected?.id}">
  <span class="growth-dot" aria-hidden="true">${displayState(m) === "verified" || m.status === "done" ? "\u2713" : isBlocked(m) ? "\xB7" : ""}</span>
  <span>${esc3(title(m))}<small>${esc3(status(m))}${m.optional ? " \xB7 " + l.optional : ""}</small></span>
 </button>`;
  const tree = renderGrowthVisionPath({ workspace: workspace2, esc: esc3, lang: lang2, title, status, displayState, selected, robot: robot2 });
  const groups = [
    [l.priority, eligible],
    [l.upcoming, missions.filter((m) => m.status !== "done" && !eligible.includes(m))],
    [l.completed, missions.filter((m) => m.status === "done").sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""))]
  ];
  const timeline = `<div class="growth-timeline">${groups.map(([label, items]) => `<section><h3>${label}</h3>${items.map((m) => `<div>${node(m)}
  ${m.completedAt ? `<time datetime="${esc3(m.completedAt)}">${esc3(new Date(m.completedAt).toLocaleDateString(lang2))}</time>` : ""}
  ${m.dependencies?.length ? `<small>${l.requirements} \xB7 ${esc3(m.dependencies.map(cap2).join(", "))}</small>` : ""}</div>`).join("") || `<p>${esc3(t2("empty"))}</p>`}</section>`).join("")}</div>`;
  const metric = (icon3, value, label) => `<article class="growth-card growth-metric"><span class="growth-metric-icon" aria-hidden="true">${icon3}</span><div><strong>${esc3(value)}</strong><span>${label}</span></div></article>`;
  const existing = [.../* @__PURE__ */ new Set([...profile.capabilities || [], ...profile.website ? ["website"] : []])].filter((id) => missionAlternative(id) && !missions.some((m) => m.capability === id));
  const existingProof = canWrite && existing.length ? `<details class="growth-card hub-existing-proof"><summary>${esc3(ui.proof)}</summary>
  <form data-existing-evidence class="mission-evidence"><label class="field">${esc3(t2("capabilities"))}
   <select name="capability">${existing.map((id) => `<option value="${esc3(id)}">${esc3(cap2(id))}</option>`).join("")}</select></label>
   <label class="field">${esc3(ui.proofLabel)}<textarea name="proof" required minlength="10" maxlength="1000" rows="2"></textarea></label>
   <button class="growth-secondary">${esc3(ui.submit)}</button></form></details>` : "";
  const detail = selected ? taskDetails(selected) : `<p>${esc3(t2("empty"))}</p>`;
  const level2 = workspace2.auri?.level || 1;
  const next = eligible[0];
  const overviewHero = `<div class="hub-overview-grid ${auriDesk ? "has-companion" : ""}">
  <section class="growth-card hub-overview-intro">
   <p class="hub-section-label">${esc3(ui.overview)}</p>
   <h1>${esc3(workspace2.organization.name)}</h1>
   <ol class="hub-evolution-track" aria-label="${esc3(t2("level"))}">
    ${evolutionNames.map((name, index) => `<li data-level-state="${index + 1 < level2 ? "complete" : index + 1 === level2 ? "current" : "locked"}" ${index + 1 === level2 ? 'aria-current="step"' : ""}>
     <span>${index + 1}</span><small>${esc3(name)}</small></li>`).join("")}
   </ol>
   <div class="hub-next-mission">
    <div><p class="hub-section-label">${esc3(ui.next)}</p><h2>${next ? esc3(title(next)) : esc3(t2("empty"))}</h2></div>
    ${next ? `<button class="growth-primary" type="button" data-next-mission>${esc3(command.continue)} <span aria-hidden="true">\u2197</span></button>` : ""}
   </div>
  </section>${auriDesk}
 </div>`;
  if (compact) host.innerHTML = `${existingProof}<section class="growth-card growth-focus os-task" id="growth-focus" tabindex="-1">${detail}</section>`;
  else host.innerHTML = `${overview ? overviewHero : ""}
 ${overview && eligible.length ? `<section class="command-priorities" aria-label="${esc3(command.priorities)}">${eligible.slice(0, 3).map((m) => `<article class="growth-card"><small>${esc3(status(m))}</small><h2>${esc3(title(m))}</h2><p>${esc3(m.route === "alternative" ? missionAlternative(m.capability)?.steps : missionGuide[m.capability]?.[1] || m.description)}</p>
  <button class="growth-secondary" type="button" data-priority="${esc3(m.id)}">${esc3(l.focus)}</button></article>`).join("")}</section>` : ""}${overview ? `<section class="growth-metrics" aria-label="${l.progress}">
 <article class="growth-card growth-metric"><span class="growth-ring" style="--progress:${progress}%">${missions.length ? progress + "%" : "\u2014"}</span><div><strong>${l.progress}</strong><span>${missions.filter((m) => m.status === "done").length} / ${missions.length} \xB7 ${l.completed}</span></div></article>
 ${metric("\u25A5", currentStage < 0 ? "\u2014" : stageName(stages[currentStage], currentStage), l.stage)}
 ${metric("\u25CE", eligible.filter((m) => m.priority === 1 && !m.optional).length, l.priority)}
 ${metric("\u2713", workspace2.auri?.verifiedMilestones || 0, ui.verified)}</section>` : ""}
 ${existingProof}<div class="growth-layout vision-layout"><section class="growth-card growth-map vision-map"><header class="growth-panel-head"><div class="growth-tabs">
 <button type="button" data-view="tree" aria-pressed="${view === "tree"}">${l.tree}</button><button type="button" data-view="timeline" aria-pressed="${view === "timeline"}">${l.timeline}</button>
 </div></header>${view === "tree" ? `<div class="command-map-viewport vision-path-viewport" tabindex="0" aria-label="${esc3(command.vision)}">${tree}</div>` : timeline}
 ${!missions.some((item) => item.planOrder !== void 0) && analysis.missions.some((m) => !missions.some((item) => item.capability === m.id)) && canWrite ? `<button type="button" class="growth-secondary" data-refresh>${l.refresh}</button>` : ""}</section>
 <aside class="growth-side"><section class="growth-card growth-focus" id="growth-focus" tabindex="-1">${detail}</section>
</aside></div>`;
  function taskDetails(m) {
    const alternate = m.route === "alternative" ? missionAlternative(m.capability) : null;
    const guide = alternate ? null : missionGuide[m.capability];
    const proof = workspace2.evidence?.[m.id];
    const reason = m.reason?.startsWith("This capability has not been reported") ? guide?.[1] : m.reason;
    const action = alternate?.steps || (m.nextAction === "Define scope or record your existing solution." ? guide?.[2] : m.nextAction);
    const { requirements, blocked } = missionState(m, missions, profile);
    const copy5 = {
      en: ["Next step", "Task options", "Ask Auri", "Request help"],
      fr: ["Prochaine \xE9tape", "Options de la t\xE2che", "Demander \xE0 Auri", "Demander de l\u2019aide"],
      tr: ["S\u0131radaki ad\u0131m", "G\xF6rev se\xE7enekleri", "Auri\u2019ye sor", "Yard\u0131m iste"],
      ar: ["\u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", "\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0647\u0645\u0629", "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A", "\u0627\u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629"]
    }[lang2];
    return `<div class="growth-focus-top"><h2>${esc3(title(m))}</h2><small>${esc3(status(m))}${m.optional ? " \xB7 " + l.optional : ""}</small></div>
   ${!alternate ? `<p class="focus-benefit">${esc3(reason || m.description)}</p>` : ""}
   <div class="service-next-step"><strong>${copy5[0]}</strong><p>${esc3(blocked && requirements.length ? requirements.map(cap2).join(" \xB7 ") : action || guide?.[2] || m.description)}</p></div>
   <div class="growth-actions">
   ${canAsk ? `<button type="button" class="growth-primary" data-ask-task>${copy5[2]} \u2197</button>` : ""}
   ${guide?.[0] ? `<a class="growth-secondary" data-request-task href="${esc3(requestLink2(guide[0], m.id))}">${copy5[3]} \u2192</a>` : ""}
   ${canWrite ? `<button type="button" class="growth-secondary" data-quick-status="${m.status === "done" ? "planned" : blocked ? "in_progress" : "done"}">${m.status === "done" ? esc3(t2("planned")) : blocked ? l.start : l.complete}</button>` : ""}</div>
   ${proof ? `<p class="mission-proof-status" role="status">${esc3(ui[proof])}</p>` : ""}
   ${canWrite ? `<details class="growth-diy task-options"><summary>${copy5[1]}</summary>
   <div class="growth-actions"><label><span class="sr-only">${esc3(t2("status"))}</span><select data-status-change>${["planned", "in_progress", "done", "postponed"].map((value) => `<option value="${value}" ${m.status === value ? "selected" : ""}>${esc3(t2(value))}</option>`).join("")}</select></label><button type="button" class="growth-secondary" data-edit>${esc3(t2("edit"))}</button></div>
   ${!blocked && requirements.length ? `<p>${l.requirements} \xB7 ${esc3(requirements.map(cap2).join(", "))}</p>` : ""}` : ""}
   ${canWrite && missionAlternative(m.capability) ? `<div class="growth-actions">
    ${proof === "pending" || m.status === "done" ? "" : alternate ? `<button type="button" class="growth-secondary" data-route="original">${esc3(ui.original)}</button>` : `<button type="button" class="growth-secondary" data-route="alternative">${esc3(ui.irrelevant)}</button>`}
    ${m.status === "done" || m.status === "postponed" ? "" : `<button type="button" class="growth-secondary" data-quick-status="postponed">${esc3(ui.later)}</button>`}
   </div>${!alternate && m.status !== "done" && proof !== "pending" ? `<details class="growth-diy"><summary>${esc3(ui.alternative)}</summary>
    <p>${esc3(missionAlternative(m.capability).steps)}</p><button type="button" class="growth-secondary" data-route="alternative">${esc3(t2("continue"))}</button></details>` : ""}
${proof === "pending" || proof === "approved" ? "" : `<details class="growth-diy"><summary>${esc3(ui.proof)}</summary>
    <form data-evidence class="mission-evidence"><label class="field">${esc3(ui.proofLabel)}<textarea name="proof" required minlength="10" maxlength="1000" rows="3"></textarea></label>
    <button class="growth-secondary">${esc3(ui.submit)}</button></form></details>`}` : ""}${canWrite ? "</details>" : ""}`;
  }
  host.querySelectorAll("[data-node]").forEach((button2) => button2.onclick = () => onSelect(button2.dataset.node));
  host.querySelectorAll("[data-view]").forEach((button2) => button2.onclick = () => onView(button2.dataset.view));
  host.querySelector("[data-refresh]")?.addEventListener("click", onGenerate);
  host.querySelector("[data-edit]")?.addEventListener("click", () => onEdit(selected));
  for (const button2 of host.querySelectorAll("[data-quick-status]")) button2.addEventListener("click", (event) => {
    const input = host.querySelector("[data-status-change]");
    input.value = event.currentTarget.dataset.quickStatus;
    onSave(selected, input);
  });
  for (const button2 of host.querySelectorAll("[data-route]")) button2.addEventListener("click", (event) => onRoute(selected, event.currentTarget));
  host.querySelector("[data-next-mission]")?.addEventListener("click", () => onContinue(eligible[0].id));
  for (const button2 of host.querySelectorAll("[data-priority]")) button2.addEventListener("click", () => onContinue(button2.dataset.priority));
  const map = host.querySelector(".command-map-viewport");
  if (map) {
    let zoom = 100;
    const canvas = map.firstElementChild;
    const update = () => {
      canvas.style.width = zoom > 100 ? map.clientWidth + "px" : "";
      canvas.style.zoom = zoom / 100;
      host.querySelector("[data-zoom=reset]").textContent = zoom + "%";
    };
    let drag;
    map.onpointerdown = (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("button,a,input,select,textarea")) return;
      if (map.scrollWidth <= map.clientWidth) return;
      drag = { x: event.clientX, y: event.clientY, left: map.scrollLeft, top: map.scrollTop };
      map.setPointerCapture(event.pointerId);
    };
    map.onpointermove = (event) => {
      if (!drag) return;
      map.scrollLeft = drag.left + drag.x - event.clientX;
      map.scrollTop = drag.top + drag.y - event.clientY;
    };
    map.onlostpointercapture = () => {
      drag = null;
    };
    for (const button2 of host.querySelectorAll("[data-zoom]")) button2.onclick = () => {
      const action = button2.dataset.zoom;
      zoom = action === "reset" ? 100 : Math.min(150, Math.max(75, zoom + (action === "in" ? 25 : -25)));
      update();
    };
  }
  host.querySelector("[data-existing-evidence]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    onExistingEvidence(event.currentTarget);
  });
  host.querySelector("[data-evidence]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    onEvidence(selected, event.currentTarget);
  });
  host.querySelector("[data-status-change]")?.addEventListener("change", (event) => onSave(selected, event.target));
  host.querySelector("[data-ask-task]")?.addEventListener("click", () => onAskTask(selected));
}

// src/hub/menu-drafts.js
var esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
async function renderMenuDrafts({ host, api: api2, endpoint: endpoint2, profile, canWrite, draftId, reviewLabel, onDraft, onReviewed }) {
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
    select2.innerHTML = '<option value="">Choose a saved draft</option>' + response.drafts.map((menu2) => `<option value="${esc(menu2.id)}" ${menu2.id === selected?.id ? "selected" : ""}>${esc(menu2.draft.fields.businessName || "Untitled menu")} \xB7 ${esc(menu2.state)} \xB7 v${menu2.version}</option>`).join("");
  }
  function editor() {
    const value = working;
    host.querySelector("#private-menu-editor").innerHTML = `<p>Private ${esc(selected?.state || "draft")} \xB7 ${selected ? "Version " + selected.version : "Not saved"}. Saving never purchases or publishes a menu.</p><fieldset ${canWrite ? "" : "disabled"}><div class="form-grid"><label class="field">Restaurant name<input id="private-menu-name" maxlength="100" value="${esc(value.fields.businessName)}"></label><label class="field">Currency<select id="private-menu-currency">${["TRY", "EUR", "USD", "TND"].map((c) => `<option ${c === value.fields.currency ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="field">Menu language<select id="private-menu-language">${[["en", "English"], ["tr", "Turkish"], ["ar", "Arabic"]].map(([code, label]) => `<option value="${code}" ${code === value.fields.menuLanguage ? "selected" : ""}>${label}</option>`).join("")}</select></label></div><div id="private-menu-categories">${value.categories.map((category, i) => `<section class="panel" data-draft-category="${i}"><label class="field">Category name<input data-category-name maxlength="80" value="${esc(category.name)}"></label>${category.items.map((item, j) => `<div data-draft-item="${j}" class="form-grid"><label class="field">Product<input data-product-name maxlength="100" value="${esc(item.name)}"></label><label class="field">Price<input data-product-price maxlength="40" value="${esc(item.price)}" inputmode="decimal"></label><label class="field">Description<input data-product-description maxlength="300" value="${esc(item.description)}"></label><button class="secondary" type="button" data-remove-product="${i}:${j}">Remove product</button></div>`).join("")}<button class="secondary" type="button" data-add-draft-product="${i}" ${category.items.length >= 20 ? "disabled" : ""}>Add product</button></section>`).join("")}</div><div class="actions"><button id="private-menu-category" type="button" class="secondary" ${value.categories.length >= 12 ? "disabled" : ""}>Add category</button><button id="private-menu-save" type="button" class="primary">Save private draft</button>${selected && !selected.reviewed && selected.state !== "archived" ? `<button id="private-menu-review" type="button" class="secondary">${esc(reviewLabel)}</button>` : ""}${selected ? '<button id="private-menu-archive" type="button" class="secondary">Archive draft</button>' : ""}</div></fieldset><p id="menu-save-status" role="status" aria-live="polite"></p><button id="private-menu-export" type="button" class="secondary">Download draft JSON</button><aside class="panel" id="private-menu-preview" aria-label="Private content preview"></aside>`;
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
    async function save(state2 = "draft") {
      const controls2 = [...host.querySelectorAll("#private-menu-editor button")];
      controls2.forEach((b) => b.disabled = true);
      message("Saving\u2026");
      try {
        const isNew = !selected;
        const value2 = read(), body = { draft: value2, state: state2, ...selected ? { version: selected.version } : {} };
        const response = await api2(base + (selected ? "/" + selected.id : ""), selected ? "PUT" : "POST", body);
        if (isNew && onDraft) {
          onDraft(response.menu.id);
          return;
        }
        selected = response.menu;
        working = structuredClone(selected.draft);
        editor();
        message("Saved privately. No payment or publication occurred.");
        await refresh();
      } catch (error) {
        message(error.status === 409 ? "Draft changed in another session. Download your current draft before reloading the saved copy." : error.message);
      } finally {
        controls2.forEach((b) => b.disabled = false);
      }
    }
    host.querySelector("#private-menu-review")?.addEventListener("click", async (event) => {
      const control = event.currentTarget;
      control.disabled = true;
      try {
        if (JSON.stringify(read()) !== originalEditorValue) {
          message("Save your changes before marking this draft reviewed.");
          return;
        }
        await api2(base + "/" + selected.id, "PATCH", { version: selected.version });
        if (host.isConnected) onReviewed?.();
      } catch (error) {
        message(error.message);
      } finally {
        control.disabled = false;
      }
    });
    host.querySelector("#private-menu-save").onclick = () => save("draft");
    host.querySelector("#private-menu-archive")?.addEventListener("click", () => save("archived"));
    const originalEditorValue = JSON.stringify(read());
    preview();
  }
  host.innerHTML = `<section class="panel"><h2>AuraMenu private drafts</h2><p>Create or continue a menu using your saved business profile. Drafts are visible only to authorized members of this business. Prices and descriptions must come from your business; no payment or publishing happens here.</p><label class="field">Saved menus<select id="private-menu-list"><option>Loading\u2026</option></select></label>${canWrite ? '<button id="private-menu-new" class="secondary" type="button">New private draft</button>' : ""}<div id="private-menu-editor"></div></section>`;
  if (draftId) {
    const response = await api2(base + "/" + encodeURIComponent(draftId));
    if (!host.isConnected) return;
    selected = response.menu;
  }
  working = selected ? structuredClone(selected.draft) : newDraft();
  editor();
  await refresh();
  host.querySelector("#private-menu-new")?.addEventListener("click", () => {
    selected = null;
    working = newDraft();
    editor();
  });
  host.querySelector("#private-menu-list").onchange = async (event) => {
    if (!event.target.value) return;
    if (onDraft) {
      onDraft(event.target.value);
      return;
    }
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
var copy4 = {
  en: { brand: "AuraHub", tag: "Understand. Build. Collaborate. Grow.", welcome: "Welcome to AuraDigital.", choose: "How would you like to build your business journey?", myself: "Build Myself", myselfText: "Set your goals, explore services and shape your own roadmap.", auri: "Build With Auri", auriText: "Take a guided journey, one short question at a time.", home: "Overview", profile: "Business Profile", journey: "Business Journey", simulator: "Growth Simulator", assistant: "Auri Assistant", reports: "Reports & Analytics", projects: "Projects", websites: "My Websites", services: "My Services", hosting: "Domains & Hosting", files: "Files & Documents", orders: "Shop & Orders", invoices: "Invoices & Payments", rewards: "Rewards", team: "Team Members", support: "Support", settings: "Settings", grow: "GROW", manage: "MANAGE", account: "ACCOUNT", menu: "Menu", close: "Close", save: "Save", saved: "Saved", saving: "Saving\u2026", continue: "Continue", back: "Back", skip: "Skip", signIn: "Sign In", signup: "Create Account", email: "Email", password: "Password", name: "Full name", terms: "I accept the account conditions and use of my details to manage my account.", google: "Continue with Google", forgot: "Forgot password?", logout: "Log Out", verify: "Verify email", verifyLater: "You can draft your profile and roadmap now. Verify your email before billing, team invitations or shared private access.", sendVerification: "Send verification link", reset: "Reset password", resetSent: "If an eligible account exists, a reset link will be sent.", newPassword: "New password", confirm: "Confirm", cancel: "Cancel", error: "Something went wrong. Please try again.", noData: "No measured data is connected yet.", next: "Your next step", readiness: "Capability readiness", progress: "Roadmap progress", level: "Level", foundation: "Foundation", visibility: "Visibility", conversion: "Conversion", automation: "Automation", scale: "Scale", createJourney: "Generate my roadmap", noPurchase: "Complete missions using any provider or your own work. AuraDigital purchases are optional.", quote: "Scope & quote required", planned: "Planned", in_progress: "In progress", done: "Done", postponed: "Postponed", up: "Move earlier", down: "Move later", edit: "Edit", objective: "Objective", description: "Description", nextAction: "Next action", why: "Recommended because this capability has not been reported in your profile.", benefit: "Potential improvement; compare results against your own baseline.", assumptions: "Assumptions, not guarantees", calculate: "Calculate scenarios", scenarioName: "Scenario name", saveScenario: "Save scenario", export: "Export JSON", history: "Saved scenarios", conservative: "Conservative", base: "Base", ambitious: "Ambitious", visits: "Monthly website visits", leads: "Monthly website leads", closeRate: "Lead-to-customer conversion (%)", customerValue: "Revenue per customer in this period", margin: "Contribution margin (%)", monthlyCost: "Monthly service cost", setupCost: "One-time setup cost", trafficLift: "Traffic increase (%)", leadRateLift: "Lead-rate increase (%)", closeRateLift: "Closing-rate increase (%)", customers: "Additional customers", revenue: "Additional monthly revenue", profit: "Additional contribution profit", net: "Net monthly contribution after service cost", roi: "First-year ROI", payback: "Setup payback (months)", na: "Not applicable", simNotice: "Illustrative estimates. Enter combined changes once per funnel stage to avoid counting the same benefit twice. Rates are capped at 100%. Costs and revenue must use the same currency and period. Taxes, fixed overhead and financing are excluded.", formula: "Customers = visits \xD7 lead rate \xD7 closing rate. Contribution = additional revenue \xD7 margin. First-year ROI = (12 \xD7 additional contribution \u2212 setup \u2212 12 \xD7 monthly costs) \xF7 (setup + 12 \xD7 monthly costs). Payback = setup \xF7 net monthly contribution, where positive.", teamTitle: "Grow together with your team.", teamText: "Invite trusted people to help manage your business. Each additional member gets their own secure access for $5 USD/month, paid by that member.", blocked: "Live recurring checkout is BLOCKED until billing, taxes, signed webhooks and cancellation terms are configured and verified. Invitations do not grant access or charge anyone.", invite: "Invite Member", role: "Role", message: "Optional invitation message", status: "Status", subscription: "Subscription", paymentDate: "Next payment", remove: "Remove access", removeConfirm: "Immediately revoke this member\u2019s business access? Their personal account and shared business data will be preserved.", cancelInvite: "Cancel invitation", resend: "Replace & resend", inviteAccept: "Accept invitation", recurringConsent: "I accept this invitation and the $5 USD monthly recurring subscription for my own access. Checkout is currently blocked; I will not be charged and access will remain pending.", awaiting: "Awaiting payment", permissions: "Permissions", activity: "Access activity", unavailable: "This integration is not connected to your verified workspace yet.", legacy: "Your existing accounts, products and orders remain available through their existing authorized workflows.", openAccount: "Open my account & orders", contact: "Contact support", aiRules: "Auri guided tools", aiNotice: "Rules-based guidance is available. Generative business advice and private invoice/project tools are not integrated yet.", diagnosis: "Business diagnosis", recommend: "Recommend my next action", strengths: "Reported strengths", missing: "Missing capabilities", source: "Source: customer-entered profile", businessName: "Business name", industry: "Industry", country: "Country", city: "City", stage: "Business stage", website: "Website (HTTPS)", tools: "Existing digital tools", acquisition: "How do customers find you?", difficulties: "Main difficulties", goals: "Business goals", budget: "Approximate budget (optional)", currency: "Currency", timeline: "Desired timeline", industryDetails: "Industry details", capabilities: "Capabilities you already have", restaurant: "Restaurant", ecommerce: "E-commerce", real_estate: "Real estate", other: "Other", servicesIndustry: "Service business", restaurantQuestion: "How do guests discover you, view your menu and make reservations?", ecommerceQuestion: "How do you manage your catalog, checkout and repeat purchases?", realEstateQuestion: "How do you list properties, capture inquiries and follow up?", servicesQuestion: "How do customers book, receive quotes and pay?", otherQuestion: "Describe how you serve customers.", newWorkspace: "New business", switchMode: "Switch onboarding mode", verified: "Email verified", owner: "Owner", admin: "Admin", member: "Member", viewer: "Viewer", readOnly: "Read-only access", supportText: "Send a support request through the existing contact form.", verifiedRequired: "Verify your email to manage team access.", empty: "Nothing here yet.", billingPrivate: "Each member\u2019s payment details stay private. This page shows access status only.", security: "Security settings", linkGoogle: "Link my verified Google identity", rename: "Save changes", refresh: "Reload", serviceNote: "Explore current services and request a scope-specific quote.", openServices: "Explore services", reportNote: "Traffic, revenue, actual-versus-projected reports and rewards cannot be displayed until trustworthy sources and a valid loyalty ledger are connected." },
  fr: { brand: "AuraHub", tag: "Comprendre. Construire. Collaborer. Grandir.", welcome: "Bienvenue chez AuraDigital.", choose: "Comment souhaitez-vous construire votre parcours ?", myself: "Construire moi-m\xEAme", myselfText: "D\xE9finissez vos objectifs et cr\xE9ez votre feuille de route.", auri: "Construire avec Auri", auriText: "Avancez avec des questions courtes et adapt\xE9es.", home: "Vue d\u2019ensemble", profile: "Profil entreprise", journey: "Parcours entreprise", simulator: "Simulateur de croissance", assistant: "Assistant Auri", reports: "Rapports et analyses", projects: "Projets", websites: "Mes sites", services: "Mes services", hosting: "Domaines et h\xE9bergement", files: "Fichiers et documents", orders: "Boutique et commandes", invoices: "Factures et paiements", rewards: "R\xE9compenses", team: "Membres de l\u2019\xE9quipe", support: "Assistance", settings: "Param\xE8tres", grow: "D\xC9VELOPPER", manage: "G\xC9RER", account: "COMPTE", menu: "Menu", close: "Fermer", save: "Enregistrer", saved: "Enregistr\xE9", saving: "Enregistrement\u2026", continue: "Continuer", back: "Retour", skip: "Passer", signIn: "Se connecter", signup: "Cr\xE9er un compte", email: "E-mail", password: "Mot de passe", name: "Nom complet", terms: "J\u2019accepte les conditions du compte et l\u2019utilisation de mes donn\xE9es pour sa gestion.", google: "Continuer avec Google", forgot: "Mot de passe oubli\xE9 ?", logout: "Se d\xE9connecter", verify: "V\xE9rifier l\u2019e-mail", verifyLater: "Cr\xE9ez votre profil et votre parcours maintenant. V\xE9rifiez votre e-mail avant les paiements, invitations ou acc\xE8s priv\xE9s partag\xE9s.", sendVerification: "Envoyer le lien de v\xE9rification", reset: "R\xE9initialiser le mot de passe", newPassword: "Nouveau mot de passe", confirm: "Confirmer", cancel: "Annuler", error: "Une erreur est survenue. R\xE9essayez.", next: "Votre prochaine \xE9tape", readiness: "Capacit\xE9s d\xE9clar\xE9es", progress: "Avancement du parcours", level: "Niveau", foundation: "Fondations", visibility: "Visibilit\xE9", conversion: "Conversion", automation: "Automatisation", scale: "Expansion", createJourney: "G\xE9n\xE9rer mon parcours", noPurchase: "R\xE9alisez vos missions avec le prestataire de votre choix ou vous-m\xEAme. Aucun achat AuraDigital obligatoire.", quote: "Devis n\xE9cessaire", planned: "Pr\xE9vu", in_progress: "En cours", done: "Termin\xE9", postponed: "Report\xE9", up: "Avancer", down: "Reculer", edit: "Modifier", objective: "Objectif", description: "Description", nextAction: "Prochaine action", why: "Recommand\xE9 car cette capacit\xE9 ne figure pas dans votre profil.", benefit: "Am\xE9lioration possible \xE0 comparer \xE0 vos propres r\xE9sultats.", assumptions: "Hypoth\xE8ses, sans garantie", calculate: "Calculer les sc\xE9narios", scenarioName: "Nom du sc\xE9nario", saveScenario: "Enregistrer le sc\xE9nario", export: "Exporter JSON", history: "Sc\xE9narios enregistr\xE9s", conservative: "Prudent", base: "Central", ambitious: "Ambitieux", visits: "Visites mensuelles du site", leads: "Prospects mensuels du site", closeRate: "Conversion prospect-client (%)", customerValue: "Revenu par client sur la p\xE9riode", margin: "Marge contributive (%)", monthlyCost: "Co\xFBt mensuel des services", setupCost: "Co\xFBt initial", trafficLift: "Hausse du trafic (%)", leadRateLift: "Hausse du taux de prospects (%)", closeRateLift: "Hausse du taux de conversion (%)", customers: "Clients suppl\xE9mentaires", revenue: "Revenu mensuel suppl\xE9mentaire", profit: "Contribution suppl\xE9mentaire", net: "Contribution nette apr\xE8s services", roi: "ROI de la premi\xE8re ann\xE9e", payback: "D\xE9lai de retour initial (mois)", na: "Non applicable", teamTitle: "D\xE9veloppez votre entreprise ensemble.", teamText: "Invitez votre \xE9quipe. Chaque membre suppl\xE9mentaire paie son propre abonnement de 5 USD par mois.", blocked: "Paiement r\xE9current BLOQU\xC9 en attendant la configuration et la validation du prestataire, des taxes, des webhooks et des conditions d\u2019annulation. Une invitation ne donne aucun acc\xE8s et ne d\xE9bite rien.", invite: "Inviter un membre", role: "R\xF4le", message: "Message facultatif", status: "Statut", subscription: "Abonnement", paymentDate: "Prochain paiement", remove: "R\xE9voquer l\u2019acc\xE8s", removeConfirm: "R\xE9voquer imm\xE9diatement cet acc\xE8s ? Le compte personnel et les donn\xE9es partag\xE9es seront conserv\xE9s.", cancelInvite: "Annuler l\u2019invitation", resend: "Remplacer et renvoyer", inviteAccept: "Accepter l\u2019invitation", recurringConsent: "J\u2019accepte l\u2019invitation et l\u2019abonnement r\xE9current de 5 USD par mois pour mon acc\xE8s personnel. Le paiement est bloqu\xE9 : aucun d\xE9bit ni acc\xE8s avant validation.", awaiting: "En attente de paiement", permissions: "Autorisations", activity: "Activit\xE9 des acc\xE8s", unavailable: "Cette int\xE9gration n\u2019est pas encore reli\xE9e \xE0 votre espace v\xE9rifi\xE9.", legacy: "Vos comptes, produits et commandes existants restent disponibles dans leurs parcours autoris\xE9s.", openAccount: "Mon compte et mes commandes", contact: "Contacter l\u2019assistance", aiRules: "Outils guid\xE9s Auri", aiNotice: "Conseils fond\xE9s sur des r\xE8gles disponibles. Les conseils g\xE9n\xE9ratifs et les outils priv\xE9s de facturation/projet ne sont pas encore int\xE9gr\xE9s.", diagnosis: "Diagnostic entreprise", recommend: "Recommander la prochaine action", strengths: "Points forts d\xE9clar\xE9s", missing: "Capacit\xE9s manquantes", source: "Source : profil renseign\xE9 par le client", businessName: "Nom de l\u2019entreprise", industry: "Secteur", country: "Pays", city: "Ville", stage: "Stade de d\xE9veloppement", website: "Site web (HTTPS)", tools: "Outils num\xE9riques existants", acquisition: "Comment trouvez-vous vos clients ?", difficulties: "Difficult\xE9s principales", goals: "Objectifs", budget: "Budget approximatif (facultatif)", currency: "Devise", timeline: "D\xE9lai souhait\xE9", industryDetails: "Pr\xE9cisions sur votre secteur", capabilities: "Capacit\xE9s d\xE9j\xE0 disponibles", restaurant: "Restaurant", ecommerce: "Commerce en ligne", real_estate: "Immobilier", other: "Autre", servicesIndustry: "Entreprise de services", restaurantQuestion: "Comment vos clients vous trouvent-ils, consultent-ils le menu et r\xE9servent-ils ?", ecommerceQuestion: "Comment g\xE9rez-vous le catalogue, les paiements et les achats r\xE9p\xE9t\xE9s ?", realEstateQuestion: "Comment publiez-vous les biens et suivez-vous les demandes ?", servicesQuestion: "Comment g\xE9rez-vous r\xE9servations, devis et paiements ?", otherQuestion: "Comment servez-vous vos clients ?", newWorkspace: "Nouvelle entreprise", switchMode: "Changer de mode", verified: "E-mail v\xE9rifi\xE9", owner: "Propri\xE9taire", admin: "Administrateur", member: "Membre", viewer: "Lecteur", readOnly: "Lecture seule", verifiedRequired: "V\xE9rifiez votre e-mail pour g\xE9rer l\u2019\xE9quipe.", empty: "Aucun \xE9l\xE9ment pour le moment.", billingPrivate: "Les d\xE9tails de paiement de chaque membre restent priv\xE9s.", security: "Param\xE8tres de s\xE9curit\xE9", linkGoogle: "Associer mon compte Google v\xE9rifi\xE9", rename: "Enregistrer les modifications", refresh: "Recharger", serviceNote: "D\xE9couvrez nos services et demandez un devis adapt\xE9.", openServices: "D\xE9couvrir les services", reportNote: "Les rapports et r\xE9compenses n\xE9cessitent des sources fiables et un registre de fid\xE9lit\xE9 connect\xE9." },
  tr: { brand: "AuraHub", tag: "Anla. Kur. Birlikte \xE7al\u0131\u015F. B\xFCy\xFC.", welcome: "AuraDigital\u2019e ho\u015F geldiniz.", choose: "\u0130\u015Fletme yolculu\u011Funuzu nas\u0131l olu\u015Fturmak istersiniz?", myself: "Kendim Olu\u015Fturay\u0131m", myselfText: "Hedeflerinizi belirleyin ve yol haritan\u0131z\u0131 olu\u015Fturun.", auri: "Auri ile Olu\u015Ftur", auriText: "K\u0131sa, ilgili sorularla ad\u0131m ad\u0131m ilerleyin.", home: "Genel Bak\u0131\u015F", profile: "\u0130\u015Fletme Profili", journey: "\u0130\u015Fletme Yolculu\u011Fu", simulator: "B\xFCy\xFCme Sim\xFClat\xF6r\xFC", assistant: "Auri Asistan\u0131", reports: "Raporlar ve Analiz", projects: "Projeler", websites: "Web Sitelerim", services: "Hizmetlerim", hosting: "Alan Ad\u0131 ve Hosting", files: "Dosyalar ve Belgeler", orders: "Ma\u011Faza ve Sipari\u015Fler", invoices: "Faturalar ve \xD6demeler", rewards: "\xD6d\xFCller", team: "Ekip \xDCyeleri", support: "Destek", settings: "Ayarlar", grow: "B\xDCY\xDC", manage: "Y\xD6NET", account: "HESAP", menu: "Men\xFC", close: "Kapat", save: "Kaydet", saved: "Kaydedildi", saving: "Kaydediliyor\u2026", continue: "Devam", back: "Geri", skip: "Atla", signIn: "Giri\u015F Yap", signup: "Hesap Olu\u015Ftur", email: "E-posta", password: "\u015Eifre", name: "Ad soyad", terms: "Hesap ko\u015Fullar\u0131n\u0131 ve bilgilerimin hesab\u0131m\u0131 y\xF6netmek i\xE7in kullan\u0131lmas\u0131n\u0131 kabul ediyorum.", google: "Google ile devam et", forgot: "\u015Eifremi unuttum", logout: "\xC7\u0131k\u0131\u015F Yap", verify: "E-postay\u0131 do\u011Frula", verifyLater: "Profil ve yol haritas\u0131 tasla\u011F\u0131 olu\u015Fturabilirsiniz. \xD6deme, ekip daveti ve \xF6zel payla\u015F\u0131ml\u0131 eri\u015Fim \xF6ncesinde e-postan\u0131z\u0131 do\u011Frulay\u0131n.", sendVerification: "Do\u011Frulama ba\u011Flant\u0131s\u0131 g\xF6nder", reset: "\u015Eifreyi s\u0131f\u0131rla", newPassword: "Yeni \u015Fifre", confirm: "Onayla", cancel: "\u0130ptal", error: "Bir hata olu\u015Ftu. Tekrar deneyin.", next: "Sonraki ad\u0131m\u0131n\u0131z", readiness: "Bildirilen yetkinlikler", progress: "Yol haritas\u0131 ilerlemesi", level: "Seviye", foundation: "Temel", visibility: "G\xF6r\xFCn\xFCrl\xFCk", conversion: "D\xF6n\xFC\u015F\xFCm", automation: "Otomasyon", scale: "\xD6l\xE7ekleme", createJourney: "Yol haritam\u0131 olu\u015Ftur", noPurchase: "G\xF6revleri kendiniz veya istedi\u011Finiz sa\u011Flay\u0131c\u0131yla tamamlay\u0131n. AuraDigital\u2019den sat\u0131n alma zorunlu de\u011Fildir.", quote: "Kapsam ve teklif gerekli", planned: "Planland\u0131", in_progress: "Devam ediyor", done: "Tamamland\u0131", postponed: "Ertelendi", up: "\xD6ne ta\u015F\u0131", down: "Geri ta\u015F\u0131", edit: "D\xFCzenle", objective: "Hedef", description: "A\xE7\u0131klama", nextAction: "Sonraki i\u015Flem", why: "Bu yetkinlik profilinizde bildirilmedi\u011Fi i\xE7in \xF6nerildi.", benefit: "Olas\u0131 iyile\u015Fme; kendi ba\u015Flang\u0131\xE7 verinizle kar\u015F\u0131la\u015Ft\u0131r\u0131n.", assumptions: "Varsay\u0131mlar, garanti de\u011Fildir", calculate: "Senaryolar\u0131 hesapla", scenarioName: "Senaryo ad\u0131", saveScenario: "Senaryoyu kaydet", export: "JSON d\u0131\u015Fa aktar", history: "Kay\u0131tl\u0131 senaryolar", conservative: "Temkinli", base: "Temel", ambitious: "\u0130ddial\u0131", visits: "Ayl\u0131k site ziyareti", leads: "Ayl\u0131k site potansiyel m\xFC\u015Fterisi", closeRate: "M\xFC\u015Fteriye d\xF6n\xFC\u015F\xFCm (%)", customerValue: "D\xF6nemde m\xFC\u015Fteri ba\u015F\u0131na gelir", margin: "Katk\u0131 marj\u0131 (%)", monthlyCost: "Ayl\u0131k hizmet maliyeti", setupCost: "Ba\u015Flang\u0131\xE7 maliyeti", trafficLift: "Trafik art\u0131\u015F\u0131 (%)", leadRateLift: "Potansiyel m\xFC\u015Fteri oran\u0131 art\u0131\u015F\u0131 (%)", closeRateLift: "Sat\u0131\u015F d\xF6n\xFC\u015F\xFCm oran\u0131 art\u0131\u015F\u0131 (%)", customers: "Ek m\xFC\u015Fteri", revenue: "Ek ayl\u0131k gelir", profit: "Ek katk\u0131 k\xE2r\u0131", net: "Hizmet maliyeti sonras\u0131 net katk\u0131", roi: "\u0130lk y\u0131l yat\u0131r\u0131m getirisi", payback: "Ba\u015Flang\u0131\xE7 geri \xF6deme s\xFCresi (ay)", na: "Uygulanamaz", teamTitle: "Ekibinizle birlikte b\xFCy\xFCy\xFCn.", teamText: "G\xFCvendi\u011Finiz ki\u015Fileri davet edin. Her ek \xFCye kendi eri\u015Fimi i\xE7in ayda 5 USD \xF6der.", blocked: "Sa\u011Flay\u0131c\u0131, vergiler, imzal\u0131 webhook ve iptal ko\u015Fullar\u0131 yap\u0131land\u0131r\u0131l\u0131p do\u011Frulanana kadar canl\u0131 abonelik \xF6demesi ENGELL\u0130D\u0130R. Davet eri\u015Fim sa\u011Flamaz ve \xFCcret almaz.", invite: "\xDCye Davet Et", role: "Rol", message: "\u0130ste\u011Fe ba\u011Fl\u0131 davet mesaj\u0131", status: "Durum", subscription: "Abonelik", paymentDate: "Sonraki \xF6deme", remove: "Eri\u015Fimi kald\u0131r", removeConfirm: "Bu \xFCyenin i\u015Fletme eri\u015Fimi hemen kald\u0131r\u0131ls\u0131n m\u0131? Ki\u015Fisel hesab\u0131 ve ortak i\u015Fletme verileri korunur.", cancelInvite: "Daveti iptal et", resend: "Yenile ve yeniden g\xF6nder", inviteAccept: "Daveti kabul et", recurringConsent: "Daveti ve ki\u015Fisel eri\u015Fimim i\xE7in ayl\u0131k 5 USD yinelenen aboneli\u011Fi kabul ediyorum. \xD6deme \u015Fu anda engelli; \xFCcret al\u0131nmaz ve eri\u015Fim beklemede kal\u0131r.", awaiting: "\xD6deme bekleniyor", permissions: "\u0130zinler", activity: "Eri\u015Fim hareketleri", unavailable: "Bu entegrasyon do\u011Frulanm\u0131\u015F \xE7al\u0131\u015Fma alan\u0131n\u0131za hen\xFCz ba\u011Fl\u0131 de\u011Fil.", legacy: "Mevcut hesaplar\u0131n\u0131z, \xFCr\xFCnleriniz ve sipari\u015Fleriniz kendi yetkili ak\u0131\u015Flar\u0131nda kullan\u0131labilir.", openAccount: "Hesab\u0131m ve sipari\u015Flerim", contact: "Destek ile ileti\u015Fim", aiRules: "Auri rehber ara\xE7lar\u0131", aiNotice: "Kural tabanl\u0131 rehberlik kullan\u0131labilir. \xDCretken i\u015Fletme \xF6nerileri ile \xF6zel fatura ve proje ara\xE7lar\u0131 hen\xFCz entegre de\u011Fil.", diagnosis: "\u0130\u015Fletme analizi", recommend: "Sonraki ad\u0131m\u0131 \xF6ner", strengths: "Bildirilen g\xFC\xE7l\xFC y\xF6nler", missing: "Eksik yetkinlikler", source: "Kaynak: m\xFC\u015Fteri taraf\u0131ndan girilen profil", businessName: "\u0130\u015Fletme ad\u0131", industry: "Sekt\xF6r", country: "\xDClke", city: "\u015Eehir", stage: "\u0130\u015Fletme a\u015Famas\u0131", website: "Web sitesi (HTTPS)", tools: "Mevcut dijital ara\xE7lar", acquisition: "M\xFC\u015Fteriler sizi nas\u0131l buluyor?", difficulties: "Ba\u015Fl\u0131ca zorluklar", goals: "\u0130\u015Fletme hedefleri", budget: "Yakla\u015F\u0131k b\xFCt\xE7e (iste\u011Fe ba\u011Fl\u0131)", currency: "Para birimi", timeline: "Hedeflenen zaman", industryDetails: "Sekt\xF6r ayr\u0131nt\u0131lar\u0131", capabilities: "Mevcut yetkinlikleriniz", restaurant: "Restoran", ecommerce: "E-ticaret", real_estate: "Gayrimenkul", other: "Di\u011Fer", servicesIndustry: "Hizmet i\u015Fletmesi", restaurantQuestion: "Misafirler sizi nas\u0131l buluyor, men\xFCy\xFC g\xF6r\xFCyor ve rezervasyon yap\u0131yor?", ecommerceQuestion: "Katalo\u011Fu, \xF6demeyi ve tekrar al\u0131\u015Fveri\u015Fi nas\u0131l y\xF6netiyorsunuz?", realEstateQuestion: "\u0130lan, m\xFC\u015Fteri talebi ve takibi nas\u0131l y\xF6netiyorsunuz?", servicesQuestion: "Randevu, teklif ve \xF6demeler nas\u0131l y\xF6netiliyor?", otherQuestion: "M\xFC\u015Fterilere nas\u0131l hizmet veriyorsunuz?", newWorkspace: "Yeni i\u015Fletme", switchMode: "Rehberlik modunu de\u011Fi\u015Ftir", verified: "E-posta do\u011Fruland\u0131", owner: "Sahip", admin: "Y\xF6netici", member: "\xDCye", viewer: "G\xF6r\xFCnt\xFCleyici", readOnly: "Salt okunur", verifiedRequired: "Ekibi y\xF6netmek i\xE7in e-postan\u0131z\u0131 do\u011Frulay\u0131n.", empty: "Hen\xFCz kay\u0131t yok.", billingPrivate: "Her \xFCyenin \xF6deme bilgileri gizli kal\u0131r.", security: "G\xFCvenlik ayarlar\u0131", linkGoogle: "Do\u011Frulanm\u0131\u015F Google hesab\u0131m\u0131 ba\u011Fla", rename: "De\u011Fi\u015Fiklikleri kaydet", refresh: "Yenile", serviceNote: "Hizmetleri inceleyin ve i\u015Fletmenize \xF6zel teklif isteyin.", openServices: "Hizmetleri ke\u015Ffet", reportNote: "Raporlar ve \xF6d\xFCller i\xE7in g\xFCvenilir veri kaynaklar\u0131 ve do\u011Frulanm\u0131\u015F sadakat defteri ba\u011Flanmal\u0131d\u0131r." },
  ar: { brand: "AuraHub", tag: "\u0627\u0641\u0647\u0645. \u0627\u0628\u0646\u0650. \u062A\u0639\u0627\u0648\u0646. \u0627\u0646\u0645\u064F.", welcome: "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643 \u0641\u064A AuraDigital.", choose: "\u0643\u064A\u0641 \u062A\u0631\u064A\u062F \u0628\u0646\u0627\u0621 \u0631\u062D\u0644\u0629 \u0646\u0645\u0648 \u0623\u0639\u0645\u0627\u0644\u0643\u061F", myself: "\u0623\u0628\u0646\u064A \u0628\u0646\u0641\u0633\u064A", myselfText: "\u062D\u062F\u062F \u0623\u0647\u062F\u0627\u0641\u0643 \u0648\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0635\u0645\u0645 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643.", auri: "\u0623\u0628\u0646\u064A \u0645\u0639 Auri", auriText: "\u0627\u0628\u062F\u0623 \u0631\u062D\u0644\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0628\u0633\u0624\u0627\u0644 \u0642\u0635\u064A\u0631 \u0641\u064A \u0643\u0644 \u062E\u0637\u0648\u0629.", home: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", profile: "\u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", journey: "\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", simulator: "\u0645\u062D\u0627\u0643\u064A \u0627\u0644\u0646\u0645\u0648", assistant: "\u0645\u0633\u0627\u0639\u062F Auri", reports: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", projects: "\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", websites: "\u0645\u0648\u0627\u0642\u0639\u064A", services: "\u062E\u062F\u0645\u0627\u062A\u064A", hosting: "\u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629", files: "\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A", orders: "\u0627\u0644\u0645\u062A\u062C\u0631 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A", invoices: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A", rewards: "\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A", team: "\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642", support: "\u0627\u0644\u062F\u0639\u0645", settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", grow: "\u0627\u0644\u0646\u0645\u0648", manage: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629", account: "\u0627\u0644\u062D\u0633\u0627\u0628", menu: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", close: "\u0625\u063A\u0644\u0627\u0642", save: "\u062D\u0641\u0638", saved: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638", saving: "\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638\u2026", continue: "\u0645\u062A\u0627\u0628\u0639\u0629", back: "\u0631\u062C\u0648\u0639", skip: "\u062A\u062E\u0637\u064A", signIn: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", signup: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628", email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", name: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", terms: "\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u064A\u0627\u0646\u0627\u062A\u064A \u0644\u0625\u062F\u0627\u0631\u062A\u0647.", google: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google", forgot: "\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F", logout: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C", verify: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F", verifyLater: "\u064A\u0645\u0643\u0646\u0643 \u0625\u0639\u062F\u0627\u062F \u0645\u0644\u0641\u0643 \u0648\u0645\u0633\u0648\u062F\u0629 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643 \u0627\u0644\u0622\u0646. \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0637\u0644\u0648\u0628 \u0642\u0628\u0644 \u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0648\u062F\u0639\u0648\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629.", sendVerification: "\u0625\u0631\u0633\u0627\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u0623\u0643\u064A\u062F", reset: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", newPassword: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", confirm: "\u062A\u0623\u0643\u064A\u062F", cancel: "\u0625\u0644\u063A\u0627\u0621", error: "\u062D\u062F\u062B \u062E\u0637\u0623. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627.", next: "\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", readiness: "\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A", progress: "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", level: "\u0627\u0644\u0645\u0633\u062A\u0648\u0649", foundation: "\u0627\u0644\u0623\u0633\u0627\u0633", visibility: "\u0627\u0644\u0638\u0647\u0648\u0631", conversion: "\u0627\u0644\u062A\u062D\u0648\u064A\u0644", automation: "\u0627\u0644\u0623\u062A\u0645\u062A\u0629", scale: "\u0627\u0644\u062A\u0648\u0633\u0639", createJourney: "\u0625\u0646\u0634\u0627\u0621 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u064A", noPurchase: "\u064A\u0645\u0643\u0646\u0643 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0645\u0647\u0627\u0645 \u0628\u0646\u0641\u0633\u0643 \u0623\u0648 \u0645\u0639 \u0623\u064A \u0645\u0632\u0648\u062F. \u0634\u0631\u0627\u0621 \u062E\u062F\u0645\u0627\u062A AuraDigital \u0627\u062E\u062A\u064A\u0627\u0631\u064A.", quote: "\u064A\u062A\u0637\u0644\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0639\u0631\u0636 \u0633\u0639\u0631", planned: "\u0645\u062E\u0637\u0637", in_progress: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", done: "\u0645\u0643\u062A\u0645\u0644", postponed: "\u0645\u0624\u062C\u0644", up: "\u062A\u0642\u062F\u064A\u0645", down: "\u062A\u0623\u062E\u064A\u0631", edit: "\u062A\u0639\u062F\u064A\u0644", objective: "\u0627\u0644\u0647\u062F\u0641", description: "\u0627\u0644\u0648\u0635\u0641", nextAction: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A", why: "\u0645\u0648\u0635\u0649 \u0628\u0647 \u0644\u0623\u0646 \u0647\u0630\u0647 \u0627\u0644\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0644\u0645 \u062A\u064F\u0630\u0643\u0631 \u0641\u064A \u0645\u0644\u0641 \u0646\u0634\u0627\u0637\u0643.", benefit: "\u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u062A\u0645\u0644\u060C \u064A\u064F\u0642\u0627\u0631\u0646 \u0628\u0646\u062A\u0627\u0626\u062C\u0643 \u0627\u0644\u0641\u0639\u0644\u064A\u0629.", assumptions: "\u0627\u0641\u062A\u0631\u0627\u0636\u0627\u062A \u0648\u0644\u064A\u0633\u062A \u0636\u0645\u0627\u0646\u0627\u062A", calculate: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A", scenarioName: "\u0627\u0633\u0645 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648", saveScenario: "\u062D\u0641\u0638 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648", export: "\u062A\u0635\u062F\u064A\u0631 JSON", history: "\u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629", conservative: "\u0645\u062A\u062D\u0641\u0638", base: "\u0623\u0633\u0627\u0633\u064A", ambitious: "\u0637\u0645\u0648\u062D", visits: "\u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0634\u0647\u0631\u064A\u0629", leads: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0648\u0646 \u0634\u0647\u0631\u064A\u064B\u0627 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", closeRate: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u062D\u0648\u0644 \u0625\u0644\u0649 \u0639\u0645\u064A\u0644 (%)", customerValue: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0644\u0643\u0644 \u0639\u0645\u064A\u0644 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629", margin: "\u0647\u0627\u0645\u0634 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 (%)", monthlyCost: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629", setupCost: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629", trafficLift: "\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A (%)", leadRateLift: "\u0632\u064A\u0627\u062F\u0629 \u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 (%)", closeRateLift: "\u0632\u064A\u0627\u062F\u0629 \u0645\u0639\u062F\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0628\u064A\u0639 (%)", customers: "\u0639\u0645\u0644\u0627\u0621 \u0625\u0636\u0627\u0641\u064A\u0648\u0646", revenue: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0625\u0636\u0627\u0641\u064A", profit: "\u0631\u0628\u062D \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0625\u0636\u0627\u0641\u064A", net: "\u0635\u0627\u0641\u064A \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0628\u0639\u062F \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u062F\u0645\u0629", roi: "\u0627\u0644\u0639\u0627\u0626\u062F \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0644\u0644\u0633\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649", payback: "\u0641\u062A\u0631\u0629 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0625\u0639\u062F\u0627\u062F (\u0623\u0634\u0647\u0631)", na: "\u063A\u064A\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u062A\u0637\u0628\u064A\u0642", teamTitle: "\u0627\u0646\u0645\u064F \u0645\u0639 \u0641\u0631\u064A\u0642\u0643.", teamText: "\u0627\u062F\u0639\u064F \u0623\u0634\u062E\u0627\u0635\u064B\u0627 \u0645\u0648\u062B\u0648\u0642\u064A\u0646 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u064A\u062F\u0641\u0639 \u0643\u0644 \u0639\u0636\u0648 \u0625\u0636\u0627\u0641\u064A \u0627\u0634\u062A\u0631\u0627\u0643\u0647 \u0627\u0644\u062E\u0627\u0635 \u0628\u0642\u064A\u0645\u0629 5 \u062F\u0648\u0644\u0627\u0631\u0627\u062A \u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0634\u0647\u0631\u064A\u064B\u0627.", blocked: "\u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0645\u062D\u0638\u0648\u0631 \u0625\u0644\u0649 \u062D\u064A\u0646 \u0625\u0639\u062F\u0627\u062F \u0645\u0632\u0648\u062F \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0625\u0644\u063A\u0627\u0621. \u0627\u0644\u062F\u0639\u0648\u0629 \u0644\u0627 \u062A\u0645\u0646\u062D \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0644\u0627 \u062A\u062E\u0635\u0645 \u0623\u064A \u0645\u0628\u0644\u063A.", invite: "\u062F\u0639\u0648\u0629 \u0639\u0636\u0648", role: "\u0627\u0644\u062F\u0648\u0631", message: "\u0631\u0633\u0627\u0644\u0629 \u062F\u0639\u0648\u0629 \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629", status: "\u0627\u0644\u062D\u0627\u0644\u0629", subscription: "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643", paymentDate: "\u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", remove: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0648\u0635\u0648\u0644", removeConfirm: "\u0647\u0644 \u062A\u0631\u064A\u062F \u0625\u0644\u063A\u0627\u0621 \u0648\u0635\u0648\u0644 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 \u0641\u0648\u0631\u064B\u0627\u061F \u0633\u064A\u064F\u062D\u062A\u0641\u0638 \u0628\u062D\u0633\u0627\u0628\u0647 \u0627\u0644\u0634\u062E\u0635\u064A \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629.", cancelInvite: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0639\u0648\u0629", resend: "\u062A\u062C\u062F\u064A\u062F \u0648\u0625\u0639\u0627\u062F\u0629 \u0625\u0631\u0633\u0627\u0644", inviteAccept: "\u0642\u0628\u0648\u0644 \u0627\u0644\u062F\u0639\u0648\u0629", recurringConsent: "\u0623\u0642\u0628\u0644 \u0627\u0644\u062F\u0639\u0648\u0629 \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0628\u0642\u064A\u0645\u0629 5 \u062F\u0648\u0644\u0627\u0631\u0627\u062A \u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0644\u0648\u0635\u0648\u0644\u064A \u0627\u0644\u0634\u062E\u0635\u064A. \u0627\u0644\u062F\u0641\u0639 \u0645\u062D\u0638\u0648\u0631 \u062D\u0627\u0644\u064A\u064B\u0627\u061B \u0644\u0646 \u064A\u064F\u062E\u0635\u0645 \u0645\u0628\u0644\u063A \u0648\u0633\u064A\u0628\u0642\u0649 \u0627\u0644\u0648\u0635\u0648\u0644 \u0645\u0639\u0644\u0642\u064B\u0627.", awaiting: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639", permissions: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A", activity: "\u0633\u062C\u0644 \u0627\u0644\u0648\u0635\u0648\u0644", unavailable: "\u0644\u0645 \u064A\u064F\u0631\u0628\u0637 \u0647\u0630\u0627 \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0628\u0639\u062F \u0628\u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643 \u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627.", legacy: "\u062D\u0633\u0627\u0628\u0627\u062A\u0643 \u0648\u0645\u0646\u062A\u062C\u0627\u062A\u0643 \u0648\u0637\u0644\u0628\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u0636\u0645\u0646 \u0645\u0633\u0627\u0631\u0627\u062A\u0647\u0627 \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647\u0627.", openAccount: "\u0641\u062A\u062D \u062D\u0633\u0627\u0628\u064A \u0648\u0637\u0644\u0628\u0627\u062A\u064A", contact: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062F\u0639\u0645", aiRules: "\u0623\u062F\u0648\u0627\u062A Auri \u0627\u0644\u0645\u0648\u062C\u0647\u0629", aiNotice: "\u0627\u0644\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0642\u0627\u0626\u0645 \u0639\u0644\u0649 \u0627\u0644\u0642\u0648\u0627\u0639\u062F \u0645\u062A\u0627\u062D. \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0648\u0644\u064A\u062F\u064A\u0629 \u0648\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062E\u0627\u0635\u0629 \u0644\u0645 \u062A\u064F\u0631\u0628\u0637 \u0628\u0639\u062F.", diagnosis: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0634\u0627\u0637", recommend: "\u0627\u0642\u062A\u0631\u0627\u062D \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", strengths: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0645\u064F\u0628\u0644\u063A \u0639\u0646\u0647\u0627", missing: "\u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0635\u0629", source: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0628\u064A\u0627\u0646\u0627\u062A \u0623\u062F\u062E\u0644\u0647\u0627 \u0627\u0644\u0639\u0645\u064A\u0644", businessName: "\u0627\u0633\u0645 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", industry: "\u0627\u0644\u0642\u0637\u0627\u0639", country: "\u0627\u0644\u062F\u0648\u0644\u0629", city: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629", stage: "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0634\u0627\u0637", website: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A (HTTPS)", tools: "\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", acquisition: "\u0643\u064A\u0641 \u064A\u062C\u062F\u0643 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u061F", difficulties: "\u0623\u0647\u0645 \u0627\u0644\u0635\u0639\u0648\u0628\u0627\u062A", goals: "\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", budget: "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", currency: "\u0627\u0644\u0639\u0645\u0644\u0629", timeline: "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628", industryDetails: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0642\u0637\u0627\u0639", capabilities: "\u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0643", restaurant: "\u0645\u0637\u0639\u0645", ecommerce: "\u062A\u062C\u0627\u0631\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", real_estate: "\u0639\u0642\u0627\u0631\u0627\u062A", other: "\u0623\u062E\u0631\u0649", servicesIndustry: "\u0646\u0634\u0627\u0637 \u062E\u062F\u0645\u064A", restaurantQuestion: "\u0643\u064A\u0641 \u064A\u062C\u062F\u0643 \u0627\u0644\u0636\u064A\u0648\u0641 \u0648\u064A\u0637\u0644\u0639\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u064A\u062D\u062C\u0632\u0648\u0646\u061F", ecommerceQuestion: "\u0643\u064A\u0641 \u062A\u062F\u064A\u0631 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0648\u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629\u061F", realEstateQuestion: "\u0643\u064A\u0641 \u062A\u0639\u0631\u0636 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u062A\u062A\u0627\u0628\u0639 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u061F", servicesQuestion: "\u0643\u064A\u0641 \u064A\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0648\u0639\u0631\u0648\u0636 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A\u061F", otherQuestion: "\u0635\u0641 \u0637\u0631\u064A\u0642\u0629 \u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0626\u0643.", newWorkspace: "\u0646\u0634\u0627\u0637 \u062C\u062F\u064A\u062F", switchMode: "\u062A\u063A\u064A\u064A\u0631 \u0648\u0636\u0639 \u0627\u0644\u0625\u0631\u0634\u0627\u062F", verified: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F", owner: "\u0627\u0644\u0645\u0627\u0644\u0643", admin: "\u0645\u062F\u064A\u0631", member: "\u0639\u0636\u0648", viewer: "\u0645\u0634\u0627\u0647\u062F", readOnly: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0641\u0642\u0637", verifiedRequired: "\u0623\u0643\u062F \u0628\u0631\u064A\u062F\u0643 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u064A\u0642.", empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0646\u0627\u0635\u0631 \u0628\u0639\u062F.", billingPrivate: "\u062A\u0628\u0642\u0649 \u062A\u0641\u0627\u0635\u064A\u0644 \u062F\u0641\u0639 \u0643\u0644 \u0639\u0636\u0648 \u062E\u0627\u0635\u0629 \u0628\u0647.", security: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646", linkGoogle: "\u0631\u0628\u0637 \u0647\u0648\u064A\u062A\u064A \u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627 \u0641\u064A Google", rename: "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A", refresh: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u062D\u0645\u064A\u0644", serviceNote: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0645\u0646\u0627\u0633\u0628\u064B\u0627 \u0644\u0646\u0634\u0627\u0637\u0643.", openServices: "\u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", reportNote: "\u0644\u0627 \u062A\u064F\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u0642\u0628\u0644 \u0631\u0628\u0637 \u0645\u0635\u0627\u062F\u0631 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0648\u062B\u0648\u0642\u0629 \u0648\u0633\u062C\u0644 \u0648\u0644\u0627\u0621 \u0635\u062D\u064A\u062D." }
};
var capabilityNames = { en: { website: "Website", domain: "Domain & hosting", email: "Business email", seo: "SEO", discovery: "Business discovery", leads: "Lead capture", crm: "CRM", automation: "AI automation", analytics: "Analytics", retention: "Customer retention" }, fr: { website: "Site web", domain: "Domaine et h\xE9bergement", email: "E-mail professionnel", seo: "R\xE9f\xE9rencement", discovery: "Visibilit\xE9 locale", leads: "Acquisition de prospects", crm: "CRM", automation: "Automatisation IA", analytics: "Analyse", retention: "Fid\xE9lisation" }, tr: { website: "Web sitesi", domain: "Alan ad\u0131 ve hosting", email: "Kurumsal e-posta", seo: "SEO", discovery: "\u0130\u015Fletme ke\u015Ffi", leads: "Potansiyel m\xFC\u015Fteri toplama", crm: "CRM", automation: "Yapay zek\xE2 otomasyonu", analytics: "Analitik", retention: "M\xFC\u015Fteri ba\u011Fl\u0131l\u0131\u011F\u0131" }, ar: { website: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", domain: "\u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629", email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0645\u0647\u0646\u064A", seo: "\u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B", discovery: "\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", leads: "\u0627\u0633\u062A\u0642\u0637\u0627\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646", crm: "\u0625\u062F\u0627\u0631\u0629 \u0639\u0644\u0627\u0642\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621", automation: "\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", analytics: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", retention: "\u0627\u0644\u0627\u062D\u062A\u0641\u0627\u0638 \u0628\u0627\u0644\u0639\u0645\u0644\u0627\u0621" } };
Object.assign(copy4.en, { sample: "The starting numbers are illustrative. Replace them with your own business data before making decisions.", solutions: "Selected digital solutions", addSolutions: "Add selected solutions to roadmap", formulaTitle: "How the calculation works", priority: "Priority", high: "High", medium: "Medium", low: "Low", pending: "Pending", active: "Active", removed: "Removed", accepted: "Accepted", canceled: "Canceled", expired: "Expired", sent: "Sent", failed: "Failed", pending_payment: "Pending payment", past_due: "Past due", restrict: "Restrict access", months: "months", seats: "additional seats", googleInvite: "After Google sign-in, reopen your invitation link to continue.", resetSent: "If an eligible account exists, a reset link will be sent." });
Object.assign(copy4.fr, { sample: "Les valeurs initiales sont illustratives. Remplacez-les par vos donn\xE9es avant de prendre une d\xE9cision.", solutions: "Solutions num\xE9riques choisies", addSolutions: "Ajouter les solutions au parcours", formulaTitle: "M\xE9thode de calcul", priority: "Priorit\xE9", high: "Haute", medium: "Moyenne", low: "Basse", pending: "En attente", active: "Actif", removed: "Acc\xE8s r\xE9voqu\xE9", accepted: "Accept\xE9e", canceled: "Annul\xE9e", expired: "Expir\xE9e", sent: "Envoy\xE9e", failed: "\xC9chec", pending_payment: "Paiement en attente", past_due: "En retard", restrict: "Restreindre l\u2019acc\xE8s", months: "mois", seats: "places suppl\xE9mentaires", googleInvite: "Apr\xE8s la connexion Google, rouvrez le lien d\u2019invitation.", resetSent: "Si un compte admissible existe, un lien sera envoy\xE9.", noData: "Aucune donn\xE9e mesur\xE9e n\u2019est connect\xE9e.", supportText: "Envoyez votre demande via le formulaire de contact existant.", simNotice: "Estimations illustratives. Saisissez une seule am\xE9lioration combin\xE9e par \xE9tape pour \xE9viter les doubles comptes. Les taux sont plafonn\xE9s \xE0 100 %. Utilisez la m\xEAme devise et p\xE9riode. Taxes, frais fixes et financement exclus.", formula: "Clients = visites \xD7 taux de prospects \xD7 taux de conversion. Contribution = revenu suppl\xE9mentaire \xD7 marge. ROI annuel = (12 \xD7 contribution suppl\xE9mentaire \u2212 co\xFBt initial \u2212 12 \xD7 co\xFBt mensuel) \xF7 (co\xFBt initial + 12 \xD7 co\xFBt mensuel). Retour = co\xFBt initial \xF7 contribution mensuelle nette positive." });
Object.assign(copy4.tr, { sample: "Ba\u015Flang\u0131\xE7 de\u011Ferleri \xF6rnektir. Karar vermeden \xF6nce kendi i\u015Fletme verilerinizi girin.", solutions: "Se\xE7ilen dijital \xE7\xF6z\xFCmler", addSolutions: "Se\xE7ilen \xE7\xF6z\xFCmleri yol haritas\u0131na ekle", formulaTitle: "Hesaplama y\xF6ntemi", priority: "\xD6ncelik", high: "Y\xFCksek", medium: "Orta", low: "D\xFC\u015F\xFCk", pending: "Beklemede", active: "Etkin", removed: "Eri\u015Fim kald\u0131r\u0131ld\u0131", accepted: "Kabul edildi", canceled: "\u0130ptal edildi", expired: "S\xFCresi doldu", sent: "G\xF6nderildi", failed: "Ba\u015Far\u0131s\u0131z", pending_payment: "\xD6deme bekliyor", past_due: "\xD6deme gecikti", restrict: "Eri\u015Fimi k\u0131s\u0131tla", months: "ay", seats: "ek koltuk", googleInvite: "Google giri\u015Finden sonra devam etmek i\xE7in davet ba\u011Flant\u0131s\u0131n\u0131 yeniden a\xE7\u0131n.", resetSent: "Uygun bir hesap varsa s\u0131f\u0131rlama ba\u011Flant\u0131s\u0131 g\xF6nderilecektir.", noData: "Hen\xFCz \xF6l\xE7\xFClen veri kayna\u011F\u0131 ba\u011Fl\u0131 de\u011Fil.", supportText: "Mevcut ileti\u015Fim formundan destek talebi g\xF6nderin.", simNotice: "\xD6rnek tahminlerdir. Ayn\u0131 fayday\u0131 iki kez saymamak i\xE7in her a\u015Famada tek bir birle\u015Fik art\u0131\u015F girin. Oranlar %100 ile s\u0131n\u0131rl\u0131d\u0131r. Maliyet ve gelir ayn\u0131 para birimi ve d\xF6nemde olmal\u0131d\u0131r. Vergi, sabit gider ve finansman hari\xE7tir.", formula: "M\xFC\u015Fteri = ziyaret \xD7 potansiyel m\xFC\u015Fteri oran\u0131 \xD7 sat\u0131\u015F oran\u0131. Katk\u0131 = ek gelir \xD7 marj. \u0130lk y\u0131l getirisi = (12 \xD7 ek katk\u0131 \u2212 ba\u015Flang\u0131\xE7 \u2212 12 \xD7 ayl\u0131k maliyet) \xF7 (ba\u015Flang\u0131\xE7 + 12 \xD7 ayl\u0131k maliyet). Geri \xF6deme = ba\u015Flang\u0131\xE7 \xF7 pozitif net ayl\u0131k katk\u0131." });
Object.assign(copy4.ar, { sample: "\u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u0623\u0648\u0644\u064A\u0629 \u0623\u0645\u062B\u0644\u0629 \u062A\u0648\u0636\u064A\u062D\u064A\u0629. \u0627\u0633\u062A\u0628\u062F\u0644\u0647\u0627 \u0628\u0628\u064A\u0627\u0646\u0627\u062A \u0646\u0634\u0627\u0637\u0643 \u0642\u0628\u0644 \u0627\u062A\u062E\u0627\u0630 \u0623\u064A \u0642\u0631\u0627\u0631.", solutions: "\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629", addSolutions: "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0645\u062E\u062A\u0627\u0631\u0629 \u0625\u0644\u0649 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", formulaTitle: "\u0643\u064A\u0641 \u064A\u0639\u0645\u0644 \u0627\u0644\u062D\u0633\u0627\u0628", priority: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", high: "\u0645\u0631\u062A\u0641\u0639\u0629", medium: "\u0645\u062A\u0648\u0633\u0637\u0629", low: "\u0645\u0646\u062E\u0641\u0636\u0629", pending: "\u0645\u0639\u0644\u0642", active: "\u0646\u0634\u0637", removed: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0648\u0635\u0648\u0644", accepted: "\u0645\u0642\u0628\u0648\u0644\u0629", canceled: "\u0645\u0644\u063A\u0627\u0629", expired: "\u0645\u0646\u062A\u0647\u064A\u0629", sent: "\u0623\u064F\u0631\u0633\u0644\u062A", failed: "\u0641\u0634\u0644\u062A", pending_payment: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639", past_due: "\u0645\u062A\u0623\u062E\u0631 \u0639\u0646 \u0627\u0644\u062F\u0641\u0639", restrict: "\u062A\u0642\u064A\u064A\u062F \u0627\u0644\u0648\u0635\u0648\u0644", months: "\u0623\u0634\u0647\u0631", seats: "\u0645\u0642\u0627\u0639\u062F \u0625\u0636\u0627\u0641\u064A\u0629", googleInvite: "\u0628\u0639\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google\u060C \u0623\u0639\u062F \u0641\u062A\u062D \u0631\u0627\u0628\u0637 \u0627\u0644\u062F\u0639\u0648\u0629 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629.", resetSent: "\u0625\u0630\u0627 \u0648\u064F\u062C\u062F \u062D\u0633\u0627\u0628 \u0645\u0624\u0647\u0644\u060C \u0641\u0633\u064A\u064F\u0631\u0633\u0644 \u0631\u0627\u0628\u0637 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0639\u064A\u064A\u0646.", noData: "\u0644\u0645 \u062A\u064F\u0631\u0628\u0637 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0642\u0627\u0633\u0629 \u0628\u0639\u062F.", supportText: "\u0623\u0631\u0633\u0644 \u0637\u0644\u0628 \u0627\u0644\u062F\u0639\u0645 \u0639\u0628\u0631 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u062D\u0627\u0644\u064A.", simNotice: "\u062A\u0642\u062F\u064A\u0631\u0627\u062A \u062A\u0648\u0636\u064A\u062D\u064A\u0629. \u0623\u062F\u062E\u0644 \u062A\u062D\u0633\u064A\u0646\u064B\u0627 \u0645\u062C\u0645\u0639\u064B\u0627 \u0648\u0627\u062D\u062F\u064B\u0627 \u0644\u0643\u0644 \u0645\u0631\u062D\u0644\u0629 \u0644\u062A\u062C\u0646\u0628 \u0627\u062D\u062A\u0633\u0627\u0628 \u0627\u0644\u0641\u0627\u0626\u062F\u0629 \u0645\u0631\u062A\u064A\u0646. \u0627\u0644\u0646\u0633\u0628 \u0645\u062D\u062F\u0648\u062F\u0629 \u0628\u0640100\u066A. \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0639\u0645\u0644\u0629 \u0648\u0627\u0644\u0641\u062A\u0631\u0629 \u0646\u0641\u0633\u064A\u0647\u0645\u0627 \u0644\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0648\u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A. \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062B\u0627\u0628\u062A\u0629 \u0648\u0627\u0644\u062A\u0645\u0648\u064A\u0644 \u0645\u0633\u062A\u062B\u0646\u0627\u0629.", formula: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 = \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A \xD7 \u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 \xD7 \u0645\u0639\u062F\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0628\u064A\u0639. \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 = \u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0627\u0644\u0625\u0636\u0627\u0641\u064A \xD7 \u0627\u0644\u0647\u0627\u0645\u0634. \u0639\u0627\u0626\u062F \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 = (12 \xD7 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0625\u0636\u0627\u0641\u064A\u0629 \u2212 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u2212 12 \xD7 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629) \xF7 (\u0627\u0644\u0625\u0639\u062F\u0627\u062F + 12 \xD7 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629). \u0627\u0644\u0627\u0633\u062A\u0631\u062F\u0627\u062F = \u0627\u0644\u0625\u0639\u062F\u0627\u062F \xF7 \u0635\u0627\u0641\u064A \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0634\u0647\u0631\u064A\u0629 \u0627\u0644\u0645\u0648\u062C\u0628." });
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

// src/hub/dashboard-view.js
var COPY = {
  en: {
    planFallback: "Auri is offline right now, so we built your roadmap from your answers. Ask Auri to refine it later.",
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    flow: "Your growth flow",
    flowNote: "Where your business is right now. Tap a step to open it.",
    steps: ["Business profile", "Roadmap", "Requests", "In production", "Live"],
    stepNotes: ["Saved", "{done} of {total} done", "{n} open", "{n} in progress", "{n} live"],
    stepEmpty: ["Add details", "Build with Auri", "Nothing open", "Nothing yet", "Nothing yet"],
    kRoadmap: "Roadmap",
    kRequests: "Open requests",
    kLive: "Live services",
    kDue: "Amount due",
    tasks: "Next on your roadmap",
    allTasks: "Open roadmap",
    tasksDone: "Every task on your roadmap is done.",
    connected: "Connected services",
    connectedNote: "Menus, cards, websites, orders, invoices and plans from your AuraDigital account.",
    connectedEmpty: "Nothing connected yet. Requests you send with your account email and services the team links to your account appear here.",
    connectedVerify: "Verify your email so we can match the requests you sent before you had an account.",
    activity: "Recent activity",
    activityEmpty: "Your activity appears here.",
    askTitle: "Ask Auri",
    askNote: "Your AI guide for this business.",
    askPlaceholder: "Ask about your roadmap, prices, next steps\u2026",
    ask: "Ask",
    prompts: ["What should I do this week?", "Explain my roadmap", "Which service fits me best?"],
    shop: "Shop",
    orders: "Orders & billing",
    newRequest: "New request",
    viewAll: "View all",
    due: "due",
    next: "next",
    kinds: { nfc: "NFC card", auramenu: "AuraMenu", quicksite: "Website", shop: "Shop order", invoice: "Invoice", subscription: "Plan", order: "Order" },
    status: { pending: "Awaiting review", approved: "Live", rejected: "Needs changes", paid: "Paid", unpaid: "Payment due", sent: "Due", overdue: "Overdue", active: "Active", paused: "Paused", cancelled: "Cancelled", new: "Received", "in-progress": "In production", ready: "Ready", completed: "Delivered", awaiting_transfer: "Awaiting transfer", planned: "To do", in_progress: "In progress", done: "Done", postponed: "Later" }
  },
  tr: {
    planFallback: "Auri \u015Fu an \xE7evrimd\u0131\u015F\u0131; yol haritan\u0131z\u0131 yan\u0131tlar\u0131n\u0131zdan olu\u015Fturduk. Daha sonra Auri\u2019den geli\u015Ftirmesini isteyebilirsiniz.",
    morning: "G\xFCnayd\u0131n",
    afternoon: "\u0130yi g\xFCnler",
    evening: "\u0130yi ak\u015Famlar",
    flow: "B\xFCy\xFCme ak\u0131\u015F\u0131n\u0131z",
    flowNote: "\u0130\u015Fletmenizin \u015Fu anki yeri. A\xE7mak i\xE7in bir ad\u0131ma dokunun.",
    steps: ["\u0130\u015Fletme profili", "Yol haritas\u0131", "Talepler", "\xDCretimde", "Yay\u0131nda"],
    stepNotes: ["Kaydedildi", "{total} g\xF6revden {done} tamam", "{n} a\xE7\u0131k", "{n} devam ediyor", "{n} yay\u0131nda"],
    stepEmpty: ["Bilgi ekleyin", "Auri ile olu\u015Fturun", "A\xE7\u0131k talep yok", "Hen\xFCz yok", "Hen\xFCz yok"],
    kRoadmap: "Yol haritas\u0131",
    kRequests: "A\xE7\u0131k talepler",
    kLive: "Yay\u0131ndaki hizmetler",
    kDue: "\xD6denecek tutar",
    tasks: "Yol haritan\u0131zda s\u0131rada",
    allTasks: "Yol haritas\u0131n\u0131 a\xE7",
    tasksDone: "Yol haritan\u0131zdaki t\xFCm g\xF6revler tamamland\u0131.",
    connected: "Ba\u011Fl\u0131 hizmetler",
    connectedNote: "AuraDigital hesab\u0131n\u0131zdaki men\xFCler, kartlar, siteler, sipari\u015Fler, faturalar ve planlar.",
    connectedEmpty: "Hen\xFCz ba\u011Fl\u0131 bir \u015Fey yok. Hesap e-postan\u0131zla g\xF6nderdi\u011Finiz talepler ve ekibin hesab\u0131n\u0131za ba\u011Flad\u0131\u011F\u0131 hizmetler burada g\xF6r\xFCn\xFCr.",
    connectedVerify: "Hesap a\xE7madan \xF6nce g\xF6nderdi\u011Finiz talepleri e\u015Fle\u015Ftirebilmemiz i\xE7in e-postan\u0131z\u0131 do\u011Frulay\u0131n.",
    activity: "Son hareketler",
    activityEmpty: "Hareketleriniz burada g\xF6r\xFCn\xFCr.",
    askTitle: "Auri\u2019ye sor",
    askNote: "Bu i\u015Fletme i\xE7in yapay zek\xE2 rehberiniz.",
    askPlaceholder: "Yol haritas\u0131, fiyatlar, sonraki ad\u0131mlar\u2026",
    ask: "Sor",
    prompts: ["Bu hafta ne yapmal\u0131y\u0131m?", "Yol haritam\u0131 a\xE7\u0131kla", "Bana en uygun hizmet hangisi?"],
    shop: "Ma\u011Faza",
    orders: "Sipari\u015Fler ve faturalar",
    newRequest: "Yeni talep",
    viewAll: "T\xFCm\xFCn\xFC g\xF6r",
    due: "son tarih",
    next: "sonraki",
    kinds: { nfc: "NFC kart", auramenu: "AuraMenu", quicksite: "Web sitesi", shop: "Ma\u011Faza sipari\u015Fi", invoice: "Fatura", subscription: "Plan", order: "Sipari\u015F" },
    status: { pending: "\u0130nceleniyor", approved: "Yay\u0131nda", rejected: "D\xFCzeltme gerekiyor", paid: "\xD6dendi", unpaid: "\xD6deme bekleniyor", sent: "\xD6denecek", overdue: "Gecikmi\u015F", active: "Aktif", paused: "Durduruldu", cancelled: "\u0130ptal", new: "Al\u0131nd\u0131", "in-progress": "\xDCretimde", ready: "Haz\u0131r", completed: "Teslim edildi", awaiting_transfer: "Havale bekleniyor", planned: "Yap\u0131lacak", in_progress: "Devam ediyor", done: "Tamam", postponed: "Sonra" }
  },
  ar: {
    planFallback: "\u0623\u0648\u0631\u064A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0627\u0644\u0622\u0646\u060C \u0644\u0630\u0644\u0643 \u0628\u0646\u064A\u0646\u0627 \u062E\u0637\u062A\u0643 \u0645\u0646 \u0625\u062C\u0627\u0628\u0627\u062A\u0643. \u0627\u0637\u0644\u0628 \u0645\u0646 \u0623\u0648\u0631\u064A \u062A\u062D\u0633\u064A\u0646\u0647\u0627 \u0644\u0627\u062D\u0642\u064B\u0627.",
    morning: "\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631",
    afternoon: "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631",
    evening: "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631",
    flow: "\u0645\u0633\u0627\u0631 \u0646\u0645\u0648\u0643",
    flowNote: "\u0623\u064A\u0646 \u064A\u0642\u0641 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u0622\u0646. \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u062E\u0637\u0648\u0629 \u0644\u0641\u062A\u062D\u0647\u0627.",
    steps: ["\u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", "\u0627\u0644\u062E\u0637\u0629", "\u0627\u0644\u0637\u0644\u0628\u0627\u062A", "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0645\u0628\u0627\u0634\u0631"],
    stepNotes: ["\u0645\u062D\u0641\u0648\u0638", "{done} \u0645\u0646 {total} \u0645\u0643\u062A\u0645\u0644\u0629", "{n} \u0645\u0641\u062A\u0648\u062D\u0629", "{n} \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "{n} \u0645\u0628\u0627\u0634\u0631\u0629"],
    stepEmpty: ["\u0623\u0636\u0641 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644", "\u0627\u0628\u0646\u0647\u0627 \u0645\u0639 \u0623\u0648\u0631\u064A", "\u0644\u0627 \u0637\u0644\u0628\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629", "\u0644\u0627 \u0634\u064A\u0621 \u0628\u0639\u062F", "\u0644\u0627 \u0634\u064A\u0621 \u0628\u0639\u062F"],
    kRoadmap: "\u0627\u0644\u062E\u0637\u0629",
    kRequests: "\u0637\u0644\u0628\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629",
    kLive: "\u062E\u062F\u0645\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629",
    kDue: "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642",
    tasks: "\u0627\u0644\u062A\u0627\u0644\u064A \u0641\u064A \u062E\u0637\u062A\u0643",
    allTasks: "\u0627\u0641\u062A\u062D \u0627\u0644\u062E\u0637\u0629",
    tasksDone: "\u0627\u0643\u062A\u0645\u0644\u062A \u0643\u0644 \u0645\u0647\u0627\u0645 \u062E\u0637\u062A\u0643.",
    connected: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629",
    connectedNote: "\u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u0648\u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062E\u0637\u0637 \u0645\u0646 \u062D\u0633\u0627\u0628\u0643 \u0641\u064A AuraDigital.",
    connectedEmpty: "\u0644\u0627 \u0634\u064A\u0621 \u0645\u0631\u062A\u0628\u0637 \u0628\u0639\u062F. \u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0631\u0633\u0644\u0629 \u0628\u0628\u0631\u064A\u062F \u062D\u0633\u0627\u0628\u0643 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u064A \u064A\u0631\u0628\u0637\u0647\u0627 \u0627\u0644\u0641\u0631\u064A\u0642 \u0628\u062D\u0633\u0627\u0628\u0643.",
    connectedVerify: "\u0623\u0643\u0651\u062F \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0644\u0646\u0637\u0627\u0628\u0642 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u064A \u0623\u0631\u0633\u0644\u062A\u0647\u0627 \u0642\u0628\u0644 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628\u0643.",
    activity: "\u0622\u062E\u0631 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A",
    activityEmpty: "\u0633\u064A\u0638\u0647\u0631 \u0646\u0634\u0627\u0637\u0643 \u0647\u0646\u0627.",
    askTitle: "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A",
    askNote: "\u0645\u0631\u0634\u062F\u0643 \u0627\u0644\u0630\u0643\u064A \u0644\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637.",
    askPlaceholder: "\u0627\u0633\u0623\u0644 \u0639\u0646 \u062E\u0637\u062A\u0643 \u0623\u0648 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0623\u0648 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629\u2026",
    ask: "\u0627\u0633\u0623\u0644",
    prompts: ["\u0645\u0627\u0630\u0627 \u0623\u0641\u0639\u0644 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u061F", "\u0627\u0634\u0631\u062D \u062E\u0637\u062A\u064A", "\u0623\u064A \u062E\u062F\u0645\u0629 \u062A\u0646\u0627\u0633\u0628\u0646\u064A\u061F"],
    shop: "\u0627\u0644\u0645\u062A\u062C\u0631",
    orders: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    newRequest: "\u0637\u0644\u0628 \u062C\u062F\u064A\u062F",
    viewAll: "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644",
    due: "\u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642",
    next: "\u0627\u0644\u062A\u0627\u0644\u064A",
    kinds: { nfc: "\u0628\u0637\u0627\u0642\u0629 NFC", auramenu: "AuraMenu", quicksite: "\u0645\u0648\u0642\u0639", shop: "\u0637\u0644\u0628 \u0645\u062A\u062C\u0631", invoice: "\u0641\u0627\u062A\u0648\u0631\u0629", subscription: "\u062E\u0637\u0629", order: "\u0637\u0644\u0628" },
    status: { pending: "\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629", approved: "\u0645\u0628\u0627\u0634\u0631", rejected: "\u064A\u062D\u062A\u0627\u062C \u062A\u0639\u062F\u064A\u0644\u0627\u062A", paid: "\u0645\u062F\u0641\u0648\u0639", unpaid: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639", sent: "\u0645\u0633\u062A\u062D\u0642", overdue: "\u0645\u062A\u0623\u062E\u0631", active: "\u0646\u0634\u0637", paused: "\u0645\u062A\u0648\u0642\u0641", cancelled: "\u0645\u0644\u063A\u0649", new: "\u0645\u0633\u062A\u0644\u0645", "in-progress": "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", ready: "\u062C\u0627\u0647\u0632", completed: "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645", awaiting_transfer: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062A\u062D\u0648\u064A\u0644", planned: "\u0644\u0644\u062A\u0646\u0641\u064A\u0630", in_progress: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", done: "\u062A\u0645", postponed: "\u0644\u0627\u062D\u0642\u064B\u0627" }
  },
  fr: {
    planFallback: "Auri est indisponible pour le moment : votre feuille de route a \xE9t\xE9 cr\xE9\xE9e \xE0 partir de vos r\xE9ponses. Demandez \xE0 Auri de l\u2019affiner plus tard.",
    morning: "Bonjour",
    afternoon: "Bon apr\xE8s-midi",
    evening: "Bonsoir",
    flow: "Votre parcours de croissance",
    flowNote: "O\xF9 en est votre activit\xE9. Touchez une \xE9tape pour l\u2019ouvrir.",
    steps: ["Profil", "Feuille de route", "Demandes", "En production", "En ligne"],
    stepNotes: ["Enregistr\xE9", "{done} sur {total} faites", "{n} ouvertes", "{n} en cours", "{n} en ligne"],
    stepEmpty: ["Ajouter des d\xE9tails", "Cr\xE9er avec Auri", "Aucune demande", "Rien pour l\u2019instant", "Rien pour l\u2019instant"],
    kRoadmap: "Feuille de route",
    kRequests: "Demandes ouvertes",
    kLive: "Services en ligne",
    kDue: "Montant d\xFB",
    tasks: "Prochaines \xE9tapes",
    allTasks: "Ouvrir la feuille de route",
    tasksDone: "Toutes les \xE9tapes sont termin\xE9es.",
    connected: "Services connect\xE9s",
    connectedNote: "Menus, cartes, sites, commandes, factures et abonnements de votre compte AuraDigital.",
    connectedEmpty: "Rien de connect\xE9 pour l\u2019instant. Les demandes envoy\xE9es avec l\u2019e-mail de votre compte et les services li\xE9s par l\u2019\xE9quipe apparaissent ici.",
    connectedVerify: "V\xE9rifiez votre e-mail pour retrouver les demandes envoy\xE9es avant la cr\xE9ation de votre compte.",
    activity: "Activit\xE9 r\xE9cente",
    activityEmpty: "Votre activit\xE9 appara\xEEtra ici.",
    askTitle: "Demander \xE0 Auri",
    askNote: "Votre guide IA pour cette activit\xE9.",
    askPlaceholder: "Feuille de route, prix, prochaines \xE9tapes\u2026",
    ask: "Demander",
    prompts: ["Que faire cette semaine ?", "Expliquez ma feuille de route", "Quel service me convient ?"],
    shop: "Boutique",
    orders: "Commandes et factures",
    newRequest: "Nouvelle demande",
    viewAll: "Tout voir",
    due: "\xE9ch\xE9ance",
    next: "prochain",
    kinds: { nfc: "Carte NFC", auramenu: "AuraMenu", quicksite: "Site web", shop: "Commande", invoice: "Facture", subscription: "Abonnement", order: "Commande" },
    status: { pending: "En revue", approved: "En ligne", rejected: "\xC0 corriger", paid: "Pay\xE9", unpaid: "Paiement attendu", sent: "\xC0 payer", overdue: "En retard", active: "Actif", paused: "En pause", cancelled: "Annul\xE9", new: "Re\xE7u", "in-progress": "En production", ready: "Pr\xEAt", completed: "Livr\xE9", awaiting_transfer: "Virement attendu", planned: "\xC0 faire", in_progress: "En cours", done: "Fait", postponed: "Plus tard" }
  }
};
var dashCopy = (lang2) => COPY[lang2] || COPY.en;
var NAV = {
  en: { home: "Home", groups: ["Overview", "Grow", "Manage", "Account"], menuDrafts: "Menu drafts", orders: "Orders & billing", profile: "Business profile", team: "Team", settings: "Settings", more: "More", close: "Close", business: "Business", newRequest: "New request" },
  tr: { home: "Ana sayfa", groups: ["Genel bak\u0131\u015F", "B\xFCy\xFCme", "Y\xF6netim", "Hesap"], menuDrafts: "Men\xFC taslaklar\u0131", orders: "Sipari\u015Fler ve faturalar", profile: "\u0130\u015Fletme profili", team: "Ekip", settings: "Ayarlar", more: "Daha fazla", close: "Kapat", business: "\u0130\u015Fletme", newRequest: "Yeni talep" },
  ar: { home: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", groups: ["\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", "\u0627\u0644\u0646\u0645\u0648", "\u0627\u0644\u0625\u062F\u0627\u0631\u0629", "\u0627\u0644\u062D\u0633\u0627\u0628"], menuDrafts: "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645", orders: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631", profile: "\u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", team: "\u0627\u0644\u0641\u0631\u064A\u0642", settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", more: "\u0627\u0644\u0645\u0632\u064A\u062F", close: "\u0625\u063A\u0644\u0627\u0642", business: "\u0627\u0644\u0646\u0634\u0627\u0637", newRequest: "\u0637\u0644\u0628 \u062C\u062F\u064A\u062F" },
  fr: { home: "Accueil", groups: ["Vue d\u2019ensemble", "Croissance", "Gestion", "Compte"], menuDrafts: "Brouillons de menu", orders: "Commandes et factures", profile: "Profil de l\u2019activit\xE9", team: "\xC9quipe", settings: "Param\xE8tres", more: "Plus", close: "Fermer", business: "Activit\xE9", newRequest: "Nouvelle demande" }
};
var navCopy = (lang2) => NAV[lang2] || NAV.en;
var money = (lang2, amount) => new Intl.NumberFormat(lang2 === "ar" ? "ar" : lang2, { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(amount || 0));
var day = (lang2, value) => {
  if (!value) return "";
  const d = new Date(String(value).includes("T") ? value : String(value).replace(" ", "T") + "Z");
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString(lang2, { day: "numeric", month: "short" }) : "";
};
var TONE = { approved: "good", paid: "good", active: "good", completed: "good", ready: "good", done: "good", rejected: "bad", overdue: "bad", cancelled: "bad", unpaid: "warn", sent: "warn", pending: "warn", awaiting_transfer: "warn" };
var statusPill = (c, status, esc3) => `<span class="hx-pill ${TONE[status] || ""}">${esc3(c.status[status] || String(status || "").replace(/[_-]/g, " "))}</span>`;
var KIND_ICON = { nfc: "M4 6h16v12H4z M8 10h4 M8 14h8", auramenu: "M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5", quicksite: "M3 5h18v12H3z M8 21h8 M12 17v4", shop: "M5 7h14l-1 13H6z M9 7a3 3 0 0 1 6 0", invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6", subscription: "M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 1 0 1 6", order: "M3 7h18v13H3z M8 7V4h8v3" };
var kindIcon = (kind) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${KIND_ICON[kind] || KIND_ICON.order}"/></svg>`;
function connectedRows(data, lang2) {
  const c = dashCopy(lang2);
  const rows = [];
  for (const r of data.requests || []) rows.push({ kind: r.kind, title: r.name, meta: c.kinds[r.kind] + (r.slug ? " \xB7 " + r.slug : ""), status: r.status === "approved" || !r.payment ? r.status : r.payment === "unpaid" && r.status === "pending" ? "pending" : r.status, extra: r.payment === "unpaid" && r.status !== "rejected" ? "unpaid" : "", at: r.updatedAt || r.createdAt });
  for (const o of data.orders || []) rows.push({ kind: "order", title: `${o.type} \xD7 ${o.quantity}`, meta: `${c.kinds.order}${o.amount ? " \xB7 " + money(lang2, o.amount) : ""}${o.dueDate ? " \xB7 " + c.due + " " + day(lang2, o.dueDate) : ""}`, status: o.status, at: o.createdAt });
  for (const s of data.subscriptions || []) rows.push({ kind: "subscription", title: s.plan, meta: `${c.kinds.subscription}${s.amount ? " \xB7 " + money(lang2, s.amount) + " / " + s.interval : ""}${s.nextBillingDate ? " \xB7 " + c.next + " " + day(lang2, s.nextBillingDate) : ""}`, status: s.status, at: s.createdAt });
  for (const i of data.invoices || []) rows.push({ kind: "invoice", title: i.number, meta: `${c.kinds.invoice} \xB7 ${money(lang2, i.amount)}${i.dueDate ? " \xB7 " + c.due + " " + day(lang2, i.dueDate) : ""}`, status: i.status, at: i.createdAt, href: "/account" });
  for (const o of data.shopOrders || []) rows.push({ kind: "shop", title: o.reference, meta: `${c.kinds.shop} \xB7 ${money(lang2, Number(o.totalMinor || 0) / 100)}`, status: o.payment, at: o.createdAt, href: "/shop/orders/" + o.id });
  return rows.sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
}
function connectedList(rows, lang2, esc3, limit = 50) {
  const c = dashCopy(lang2);
  return `<ul class="hx-list">${rows.slice(0, limit).map((r) => {
    const inner = `<span class="hx-list-icon">${kindIcon(r.kind)}</span><span class="hx-list-main"><strong>${esc3(r.title)}</strong><small>${esc3(r.meta)}</small></span><span class="hx-list-status">${statusPill(c, r.status, esc3)}${r.extra ? statusPill(c, r.extra, esc3) : ""}</span>`;
    return `<li>${r.href ? `<a class="hx-list-row" href="${esc3(r.href)}">${inner}</a>` : `<div class="hx-list-row">${inner}</div>`}</li>`;
  }).join("")}</ul>`;
}

// src/hub/auri-chat.js
var COPY2 = {
  en: {
    start: "Let Auri start",
    startReply: (s) => `I can take care of \u201C${s}\u201D for you. I\u2019ll write the brief from your business profile and send it to the AuraDigital team for a quote \u2014 you just confirm.`,
    servicesLink: "Open my services",
    billingLink: "Open billing",
    status: "Your AI guide \xB7 online",
    placeholder: "Message Auri\u2026",
    send: "Send",
    thinking: "Auri is thinking\u2026",
    tabs: ["Overview", "Services", "Roadmap", "Billing"],
    open: "Open",
    clear: "New conversation",
    panel: "Details",
    hi: (name, biz) => `Hi ${name}! Here\u2019s where ${biz} stands today:`,
    roadmapLine: (d, t2, next) => `Roadmap: ${d} of ${t2} tasks done${next ? ` \u2014 next: ${next}` : ""}.`,
    openLine: (n) => `${n} request${n === 1 ? "" : "s"} open.`,
    liveLine: (n) => `${n} service${n === 1 ? "" : "s"} live.`,
    dueLine: (a) => `${a} to pay.`,
    attention: (what) => `Needs you now: ${what}.`,
    noRoadmap: "You don\u2019t have a roadmap yet. Tell me about your business and I\u2019ll build one.",
    chips: ["What should I do next?", "Show my services", "What do I owe?", "Request a service"],
    servicesReply: (live, open) => `You have ${live} live and ${open} in progress. I opened your services on the right.`,
    roadmapReply: (next) => next ? `Your next step is \u201C${next}\u201D. I opened your roadmap so you can start it.` : "Your roadmap is complete. Ask me what to grow next.",
    billingReply: (due, n) => due ? `You have ${due} due across ${n} invoice${n === 1 ? "" : "s"}. Billing details are on the right.` : "Nothing is due right now. Your billing is on the right.",
    requestReply: "Tell me what you need, or open the request form \u2014 the AuraDigital team replies with a quote.",
    requestAction: "Open request form",
    roadmapAction: "Open roadmap",
    buildAction: "Build my roadmap",
    reviewAction: "Review now",
    error: "I couldn\u2019t answer that right now. Try again, or message the team.",
    nothing: "Nothing here yet.",
    due: "Amount due",
    plans: "Plans",
    invoices: "Invoices",
    shop: "Shop orders",
    allBilling: "Orders & billing",
    flow: ["Profile", "Roadmap", "Requests", "In production", "Live"]
  },
  tr: {
    start: "Auri ba\u015Flas\u0131n",
    startReply: (s) => `\u201C${s}\u201D i\u015Fini sizin i\xE7in \xFCstlenebilirim. \u0130\u015Fletme profilinizden brifi yazar, teklif i\xE7in AuraDigital ekibine g\xF6nderirim \u2014 siz sadece onaylars\u0131n\u0131z.`,
    servicesLink: "Hizmetlerimi a\xE7",
    billingLink: "\xD6demeleri a\xE7",
    status: "Yapay zek\xE2 rehberiniz \xB7 \xE7evrimi\xE7i",
    placeholder: "Auri\u2019ye yaz\u0131n\u2026",
    send: "G\xF6nder",
    thinking: "Auri d\xFC\u015F\xFCn\xFCyor\u2026",
    tabs: ["Genel", "Hizmetler", "Yol haritas\u0131", "\xD6demeler"],
    open: "A\xE7",
    clear: "Yeni sohbet",
    panel: "Ayr\u0131nt\u0131lar",
    hi: (name, biz) => `Merhaba ${name}! ${biz} bug\xFCn burada:`,
    roadmapLine: (d, t2, next) => `Yol haritas\u0131: ${t2} g\xF6revden ${d} tamam${next ? ` \u2014 s\u0131radaki: ${next}` : ""}.`,
    openLine: (n) => `${n} a\xE7\u0131k talep.`,
    liveLine: (n) => `${n} hizmet yay\u0131nda.`,
    dueLine: (a) => `\xD6denecek: ${a}.`,
    attention: (what) => `\u015Eimdi sizi bekliyor: ${what}.`,
    noRoadmap: "Hen\xFCz yol haritan\u0131z yok. \u0130\u015Fletmenizi anlat\u0131n, sizin i\xE7in olu\u015Fturay\u0131m.",
    chips: ["S\u0131rada ne var?", "Hizmetlerimi g\xF6ster", "Ne kadar borcum var?", "Hizmet iste"],
    servicesReply: (live, open) => `${live} hizmet yay\u0131nda, ${open} devam ediyor. Hizmetlerinizi sa\u011Fda a\xE7t\u0131m.`,
    roadmapReply: (next) => next ? `S\u0131radaki ad\u0131m\u0131n\u0131z \u201C${next}\u201D. Ba\u015Flayabilmeniz i\xE7in yol haritan\u0131z\u0131 a\xE7t\u0131m.` : "Yol haritan\u0131z tamamland\u0131. S\u0131rada neyi b\xFCy\xFCtece\u011Finizi sorun.",
    billingReply: (due, n) => due ? `${n} faturada toplam ${due} \xF6denecek. Ayr\u0131nt\u0131lar sa\u011Fda.` : "\u015Eu an \xF6denecek bir \u015Fey yok. \xD6demeleriniz sa\u011Fda.",
    requestReply: "Neye ihtiyac\u0131n\u0131z oldu\u011Funu yaz\u0131n ya da talep formunu a\xE7\u0131n \u2014 AuraDigital ekibi teklifle d\xF6ner.",
    requestAction: "Talep formunu a\xE7",
    roadmapAction: "Yol haritas\u0131n\u0131 a\xE7",
    buildAction: "Yol haritam\u0131 olu\u015Ftur",
    reviewAction: "\u015Eimdi incele",
    error: "\u015Eu an yan\u0131t veremedim. Tekrar deneyin ya da ekibe yaz\u0131n.",
    nothing: "Hen\xFCz bir \u015Fey yok.",
    due: "\xD6denecek tutar",
    plans: "Planlar",
    invoices: "Faturalar",
    shop: "Ma\u011Faza sipari\u015Fleri",
    allBilling: "Sipari\u015Fler ve faturalar",
    flow: ["Profil", "Yol haritas\u0131", "Talepler", "\xDCretimde", "Yay\u0131nda"]
  },
  ar: {
    start: "\u062F\u0639 \u0623\u0648\u0631\u064A \u064A\u0628\u062F\u0623",
    startReply: (s) => `\u0623\u0633\u062A\u0637\u064A\u0639 \u0627\u0644\u062A\u0643\u0641\u0644 \u0628\u0640\xAB${s}\xBB. \u0633\u0623\u0643\u062A\u0628 \u0627\u0644\u0645\u0644\u062E\u0635 \u0645\u0646 \u0645\u0644\u0641 \u0646\u0634\u0627\u0637\u0643 \u0648\u0623\u0631\u0633\u0644\u0647 \u0625\u0644\u0649 \u0641\u0631\u064A\u0642 AuraDigital \u0644\u0639\u0631\u0636 \u0633\u0639\u0631 \u2014 \u0639\u0644\u064A\u0643 \u0627\u0644\u062A\u0623\u0643\u064A\u062F \u0641\u0642\u0637.`,
    servicesLink: "\u0627\u0641\u062A\u062D \u062E\u062F\u0645\u0627\u062A\u064A",
    billingLink: "\u0627\u0641\u062A\u062D \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    status: "\u0645\u0631\u0634\u062F\u0643 \u0627\u0644\u0630\u0643\u064A \xB7 \u0645\u062A\u0635\u0644",
    placeholder: "\u0627\u0643\u062A\u0628 \u0644\u0623\u0648\u0631\u064A\u2026",
    send: "\u0625\u0631\u0633\u0627\u0644",
    thinking: "\u0623\u0648\u0631\u064A \u064A\u0641\u0643\u0631\u2026",
    tabs: ["\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", "\u0627\u0644\u062E\u0637\u0629", "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631"],
    open: "\u0641\u062A\u062D",
    clear: "\u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629",
    panel: "\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644",
    hi: (name, biz) => `\u0645\u0631\u062D\u0628\u064B\u0627 ${name}! \u0647\u0630\u0627 \u0648\u0636\u0639 ${biz} \u0627\u0644\u064A\u0648\u0645:`,
    roadmapLine: (d, t2, next) => `\u0627\u0644\u062E\u0637\u0629: ${d} \u0645\u0646 ${t2} \u0645\u0647\u0627\u0645 \u0645\u0643\u062A\u0645\u0644\u0629${next ? ` \u2014 \u0627\u0644\u062A\u0627\u0644\u064A: ${next}` : ""}.`,
    openLine: (n) => `${n} \u0637\u0644\u0628\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629.`,
    liveLine: (n) => `${n} \u062E\u062F\u0645\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629.`,
    dueLine: (a) => `\u0627\u0644\u0645\u0633\u062A\u062D\u0642: ${a}.`,
    attention: (what) => `\u0628\u0627\u0646\u062A\u0638\u0627\u0631\u0643 \u0627\u0644\u0622\u0646: ${what}.`,
    noRoadmap: "\u0644\u064A\u0633\u062A \u0644\u062F\u064A\u0643 \u062E\u0637\u0629 \u0628\u0639\u062F. \u0623\u062E\u0628\u0631\u0646\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0648\u0633\u0623\u0628\u0646\u064A\u0647\u0627 \u0644\u0643.",
    chips: ["\u0645\u0627 \u062E\u0637\u0648\u062A\u064A \u0627\u0644\u062A\u0627\u0644\u064A\u0629\u061F", "\u0627\u0639\u0631\u0636 \u062E\u062F\u0645\u0627\u062A\u064A", "\u0643\u0645 \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0639\u0644\u064A\u061F", "\u0627\u0637\u0644\u0628 \u062E\u062F\u0645\u0629"],
    servicesReply: (live, open) => `\u0644\u062F\u064A\u0643 ${live} \u062E\u062F\u0645\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629 \u0648${open} \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630. \u0641\u062A\u062D\u062A \u062E\u062F\u0645\u0627\u062A\u0643 \u0639\u0644\u0649 \u0627\u0644\u062C\u0627\u0646\u0628.`,
    roadmapReply: (next) => next ? `\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \xAB${next}\xBB. \u0641\u062A\u062D\u062A \u062E\u0637\u062A\u0643 \u0644\u062A\u0628\u062F\u0623.` : "\u0627\u0643\u062A\u0645\u0644\u062A \u062E\u0637\u062A\u0643. \u0627\u0633\u0623\u0644\u0646\u064A \u0645\u0627\u0630\u0627 \u062A\u0646\u0645\u0651\u064A \u0628\u0639\u062F \u0630\u0644\u0643.",
    billingReply: (due, n) => due ? `\u0639\u0644\u064A\u0643 ${due} \u0641\u064A ${n} \u0641\u0648\u0627\u062A\u064A\u0631. \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u0639\u0644\u0649 \u0627\u0644\u062C\u0627\u0646\u0628.` : "\u0644\u0627 \u0634\u064A\u0621 \u0645\u0633\u062A\u062D\u0642 \u0627\u0644\u0622\u0646. \u0641\u0648\u0627\u062A\u064A\u0631\u0643 \u0639\u0644\u0649 \u0627\u0644\u062C\u0627\u0646\u0628.",
    requestReply: "\u0623\u062E\u0628\u0631\u0646\u064A \u0628\u0645\u0627 \u062A\u062D\u062A\u0627\u062C\u0647 \u0623\u0648 \u0627\u0641\u062A\u062D \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0637\u0644\u0628 \u2014 \u064A\u0631\u062F \u0641\u0631\u064A\u0642 AuraDigital \u0628\u0639\u0631\u0636 \u0633\u0639\u0631.",
    requestAction: "\u0627\u0641\u062A\u062D \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0637\u0644\u0628",
    roadmapAction: "\u0627\u0641\u062A\u062D \u0627\u0644\u062E\u0637\u0629",
    buildAction: "\u0627\u0628\u0646\u0650 \u062E\u0637\u062A\u064A",
    reviewAction: "\u0631\u0627\u062C\u0639 \u0627\u0644\u0622\u0646",
    error: "\u062A\u0639\u0630\u0631 \u0639\u0644\u064A \u0627\u0644\u0631\u062F \u0627\u0644\u0622\u0646. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627 \u0623\u0648 \u0631\u0627\u0633\u0644 \u0627\u0644\u0641\u0631\u064A\u0642.",
    nothing: "\u0644\u0627 \u0634\u064A\u0621 \u0628\u0639\u062F.",
    due: "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642",
    plans: "\u0627\u0644\u062E\u0637\u0637",
    invoices: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    shop: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631",
    allBilling: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631",
    flow: ["\u0627\u0644\u0645\u0644\u0641", "\u0627\u0644\u062E\u0637\u0629", "\u0627\u0644\u0637\u0644\u0628\u0627\u062A", "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0645\u0628\u0627\u0634\u0631"]
  },
  fr: {
    start: "Laisser Auri d\xE9marrer",
    startReply: (s) => `Je peux m\u2019occuper de \xAB ${s} \xBB. Je r\xE9dige le brief \xE0 partir de votre profil et l\u2019envoie \xE0 l\u2019\xE9quipe AuraDigital pour un devis \u2014 vous n\u2019avez qu\u2019\xE0 confirmer.`,
    servicesLink: "Ouvrir mes services",
    billingLink: "Ouvrir la facturation",
    status: "Votre guide IA \xB7 en ligne",
    placeholder: "\xC9crire \xE0 Auri\u2026",
    send: "Envoyer",
    thinking: "Auri r\xE9fl\xE9chit\u2026",
    tabs: ["Aper\xE7u", "Services", "Feuille de route", "Facturation"],
    open: "Ouvrir",
    clear: "Nouvelle conversation",
    panel: "D\xE9tails",
    hi: (name, biz) => `Bonjour ${name} ! Voici o\xF9 en est ${biz} :`,
    roadmapLine: (d, t2, next) => `Feuille de route : ${d} sur ${t2} \xE9tapes faites${next ? ` \u2014 prochaine : ${next}` : ""}.`,
    openLine: (n) => `${n} demande(s) ouverte(s).`,
    liveLine: (n) => `${n} service(s) en ligne.`,
    dueLine: (a) => `${a} \xE0 payer.`,
    attention: (what) => `\xC0 faire maintenant : ${what}.`,
    noRoadmap: "Vous n\u2019avez pas encore de feuille de route. Pr\xE9sentez votre activit\xE9 et je la cr\xE9e.",
    chips: ["Que faire ensuite ?", "Mes services", "Que dois-je payer ?", "Demander un service"],
    servicesReply: (live, open) => `${live} en ligne et ${open} en cours. J\u2019ai ouvert vos services \xE0 droite.`,
    roadmapReply: (next) => next ? `Votre prochaine \xE9tape : \xAB ${next} \xBB. J\u2019ai ouvert la feuille de route.` : "Feuille de route termin\xE9e. Demandez-moi quoi d\xE9velopper ensuite.",
    billingReply: (due, n) => due ? `${due} \xE0 payer sur ${n} facture(s). D\xE9tails \xE0 droite.` : "Rien \xE0 payer pour l\u2019instant. Votre facturation est \xE0 droite.",
    requestReply: "Dites-moi ce dont vous avez besoin ou ouvrez le formulaire \u2014 l\u2019\xE9quipe AuraDigital r\xE9pond avec un devis.",
    requestAction: "Ouvrir le formulaire",
    roadmapAction: "Ouvrir la feuille de route",
    buildAction: "Cr\xE9er ma feuille de route",
    reviewAction: "Examiner",
    error: "Je n\u2019ai pas pu r\xE9pondre. R\xE9essayez ou \xE9crivez \xE0 l\u2019\xE9quipe.",
    nothing: "Rien pour l\u2019instant.",
    due: "Montant d\xFB",
    plans: "Abonnements",
    invoices: "Factures",
    shop: "Commandes",
    allBilling: "Commandes et factures",
    flow: ["Profil", "Feuille de route", "Demandes", "En production", "En ligne"]
  }
};
var chatCopy2 = (lang2) => COPY2[lang2] || COPY2.en;
var INTENTS = {
  services: /service|hizmet|خدم|site|website|menu|men[üu]|nfc|card|kart/i,
  roadmap: /next|roadmap|step|todo|to do|sıra|yol harita|adım|خطة|التالي|خطوة|prochain|étape|feuille/i,
  billing: /bill|invoice|pay|owe|due|price paid|fatura|ödeme|borç|فاتور|مستحق|دفع|factur|payer|dois/i,
  request: /request|order a|need a|quote|talep|iste|teklif|طلب|عرض سعر|demande|devis/i
};
var SERVICE_IDEAS = [
  { match: /web ?site|web sitesi|موقع|site web|landing/i, service: "Web Design", name: { en: "a website", tr: "web sitesi", ar: "\u0645\u0648\u0642\u0639 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", fr: "un site web" } },
  { match: /menu|menü|قائمة|qr/i, service: "AuraMenu", name: { en: "a QR digital menu", tr: "QR dijital men\xFC", ar: "\u0642\u0627\u0626\u0645\u0629 \u0631\u0642\u0645\u064A\u0629 QR", fr: "un menu QR" } },
  { match: /review|yorum|تقييم|avis|nfc|card|kart|بطاق/i, service: "NFC Card", name: { en: "NFC review cards", tr: "NFC yorum kartlar\u0131", ar: "\u0628\u0637\u0627\u0642\u0627\u062A \u062A\u0642\u064A\u064A\u0645 NFC", fr: "des cartes avis NFC" } },
  { match: /whats ?app|chatbot|automat|otomasyon|أتمتة|واتساب/i, service: "AI & Automation", name: { en: "WhatsApp automation", tr: "WhatsApp otomasyonu", ar: "\u0623\u062A\u0645\u062A\u0629 \u0648\u0627\u062A\u0633\u0627\u0628", fr: "l\u2019automatisation WhatsApp" } },
  { match: /google|maps|seo|harita|خرائط|référencement/i, service: "SEO / Google Maps", name: { en: "Google Maps & SEO", tr: "Google Haritalar ve SEO", ar: "\u062E\u0631\u0627\u0626\u0637 Google \u0648SEO", fr: "Google Maps et SEO" } },
  { match: /\bads?\b|reklam|إعلان|publicit|campaign|kampanya/i, service: "Ad Management", name: { en: "ad campaigns", tr: "reklam kampanyalar\u0131", ar: "\u062D\u0645\u0644\u0627\u062A \u0625\u0639\u0644\u0627\u0646\u064A\u0629", fr: "des campagnes pub" } },
  { match: /logo|brand|marka|هوية|شعار|marque/i, service: "Branding", name: { en: "branding", tr: "marka kimli\u011Fi", ar: "\u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0628\u0635\u0631\u064A\u0629", fr: "l\u2019identit\xE9 de marque" } },
  { match: /e-?mail|e-posta|بريد/i, service: "Business Email", name: { en: "business email", tr: "kurumsal e-posta", ar: "\u0628\u0631\u064A\u062F \u0627\u0644\u0623\u0639\u0645\u0627\u0644", fr: "l\u2019e-mail pro" } },
  { match: /host|domain|alan ad|استضافة|نطاق|hébergement/i, service: "Hosting / Security", name: { en: "hosting & domain", tr: "bar\u0131nd\u0131rma ve alan ad\u0131", ar: "\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629 \u0648\u0627\u0644\u0646\u0637\u0627\u0642", fr: "l\u2019h\xE9bergement" } }
];
var STUDIO_ROUTES = [
  { view: "pipeline", match: /\b(leads?|inquir(y|ies)|pipeline|prospects?)\b|müşteri adayı|talepleri(m)? (gör|kaydet)|استفسار|عملاء محتمل|prospect|demandes? clients?/i, label: { en: "Open the lead pipeline", tr: "Sat\u0131\u015F hatt\u0131n\u0131 a\xE7", ar: "\u0627\u0641\u062A\u062D \u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", fr: "Ouvrir le pipeline" } },
  { view: "analytics", match: /\b(analytics|stats|statistics|numbers|performance)\b|analitik|istatistik|تحليلات|إحصا|statistiques/i, label: { en: "Open analytics", tr: "Analiti\u011Fi a\xE7", ar: "\u0627\u0641\u062A\u062D \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", fr: "Ouvrir les statistiques" } },
  { view: "website", match: /\b(my|update|edit|change)\b.*\b(website|site)\b|web sitemi|sitemi (güncelle|düzenle)|موقعي|mon site/i, label: { en: "Manage your website", tr: "Web sitenizi y\xF6netin", ar: "\u0623\u062F\u0631 \u0645\u0648\u0642\u0639\u0643", fr: "G\xE9rer votre site" } },
  { view: "menu", match: /\b(manage|update|edit|my)\b.*\bmenu\b|menümü|قائمتي|mon menu/i, label: { en: "Manage AuraMenu", tr: "AuraMenu\u2019y\xFC y\xF6net", ar: "\u0623\u062F\u0631 AuraMenu", fr: "G\xE9rer AuraMenu" } }
];
var STUDIO_REPLY = {
  en: (label) => `You can do that in Aura Studio. ${label} \u2014 changes are only saved when you confirm them there.`,
  tr: (label) => `Bunu Aura Studio\u2019da yapabilirsiniz. ${label} \u2014 de\u011Fi\u015Fiklikler yaln\u0131zca orada onaylad\u0131\u011F\u0131n\u0131zda kaydedilir.`,
  ar: (label) => `\u064A\u0645\u0643\u0646\u0643 \u0630\u0644\u0643 \u0641\u064A Aura Studio. ${label} \u2014 \u0644\u0627 \u062A\u064F\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A \u0625\u0644\u0627 \u0639\u0646\u062F \u062A\u0623\u0643\u064A\u062F\u0643 \u0647\u0646\u0627\u0643.`,
  fr: (label) => `Vous pouvez le faire dans Aura Studio. ${label} \u2014 les modifications ne sont enregistr\xE9es qu\u2019apr\xE8s votre confirmation.`
};
var START_WORDS = /\b(build|make|create|set ?up|start|get|launch|need|want|do)\b|oluştur|kur|yap|istiyorum|başlat|ابن|أنشئ|أريد|ابدأ|créer|lancer|faire|veux/i;
var money2 = (lang2, amount) => new Intl.NumberFormat(lang2 === "ar" ? "ar" : lang2, { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(Number(amount || 0));
function mountAuriChat({ host, lang: lang2, esc: esc3, link: link2, me: me2, workspace: workspace2, data, askAuri: askAuri2, auriImage, onBrief, initial, direct = false }) {
  const c = chatCopy2(lang2);
  const id = workspace2?.organization.id || "new";
  const storeKey = "aura-chat:" + id;
  const { snapshot, connected, next, missionTitle: missionTitle2, attention, nextAction } = data;
  const missions = workspace2?.missions || [];
  const done = missions.filter((m) => m.status === "done").length;
  const openCount = data.counts ? data.counts.open : (snapshot?.attention?.length || 0) + (snapshot?.progress?.length || 0) + (connected?.requests || []).filter((r) => r.status === "pending").length;
  const liveCount = data.counts ? data.counts.live : (snapshot?.services?.length || 0) + (connected?.totals?.live || 0);
  const dueAmount = connected?.totals?.amountDue || 0;
  const canRequest = workspace2?.permissions?.includes("roadmap:write");
  let log = [];
  try {
    log = JSON.parse(sessionStorage.getItem(storeKey) || "[]");
  } catch {
  }
  const save = () => {
    try {
      sessionStorage.setItem(storeKey, JSON.stringify(log.slice(-40)));
    } catch {
    }
  };
  const greeting = () => {
    const lines = [c.hi(String(me2.name || "").split(" ")[0], workspace2?.organization.name || "AuraHub")];
    if (attention) lines.push(c.attention(attention.name));
    lines.push(missions.length ? c.roadmapLine(done, missions.length, next ? missionTitle2(next) : "") : c.noRoadmap);
    if (openCount) lines.push(c.openLine(openCount));
    if (liveCount) lines.push(c.liveLine(liveCount));
    if (dueAmount) lines.push(c.dueLine(money2(lang2, dueAmount)));
    const actions2 = [];
    if (attention) actions2.push({ label: attention.label || c.reviewAction, href: attention.href });
    if (nextAction) actions2.push(nextAction);
    if (!missions.length && canRequest !== false) actions2.push({ label: c.buildAction, href: link2("onboarding") });
    return { role: "auri", text: lines.join("\n"), actions: actions2, greeting: true };
  };
  log = [greeting(), ...log.filter((m) => !m.greeting)];
  save();
  host.innerHTML = `<div class="ax-chat">
    <ol class="ax-log" role="log" aria-live="polite" data-ax-log></ol>
    <div class="ax-chips">${c.chips.map((chip, i) => `<button type="button" class="ax-chip" data-ax-chip="${i}">${esc3(chip)}</button>`).join("")}</div>
    <form class="ax-input" data-ax-form>
      <label class="sr-only" for="ax-text">${esc3(c.placeholder)}</label>
      <textarea id="ax-text" name="q" rows="1" maxlength="500" placeholder="${esc3(c.placeholder)}" autocomplete="off"></textarea>
      <button type="submit" class="ax-send" aria-label="${esc3(c.send)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form></div>`;
  const logEl = host.querySelector("[data-ax-log]");
  const bubble = (m) => `<li class="ax-msg ${m.role === "me" ? "ax-me" : "ax-them"}">${m.role === "me" ? "" : `<span class="ax-msg-avatar" aria-hidden="true">${auriImage}</span>`}<div class="ax-bubble${m.pending ? " ax-typing" : ""}"><p>${esc3(m.text).replace(/\n/g, "<br>")}</p>${(m.actions || []).length ? `<div class="ax-actions">${m.actions.map((a, i) => a.brief ? `<button type="button" class="ax-action ax-action-primary" data-ax-brief="${i}">${esc3(a.label)}</button>` : `<a class="ax-action" href="${esc3(a.href)}">${esc3(a.label)}<span aria-hidden="true"> \u2192</span></a>`).join("")}</div>` : ""}</div></li>`;
  const draw = () => {
    logEl.innerHTML = log.map(bubble).join("");
    logEl.querySelectorAll("[data-ax-brief]").forEach((button2) => button2.addEventListener("click", () => {
      const msg = log[[...logEl.children].indexOf(button2.closest("li"))];
      const action = msg?.actions?.[Number(button2.dataset.axBrief)];
      if (action?.brief) onBrief?.(action.brief.service, action.brief.text);
    }));
    logEl.scrollTop = logEl.scrollHeight;
  };
  async function answer(text, { direct: direct2 = false } = {}) {
    log.push({ role: "me", text });
    save();
    draw();
    const t2 = text.toLowerCase();
    const idea = SERVICE_IDEAS.find((s) => s.match.test(t2));
    if (direct2) {
      const pending = { role: "auri", text: c.thinking, pending: true };
      log.push(pending);
      draw();
      let reply;
      try {
        reply = await askAuri2(text);
      } catch {
        reply = "";
      }
      log.splice(log.indexOf(pending), 1, { role: "auri", text: reply || c.error });
    } else if (idea && canRequest && START_WORDS.test(t2)) {
      const name = idea.name[lang2] || idea.name.en;
      const profile = workspace2?.profile || {};
      const brief = [text, profile.name && `Business: ${profile.name}`, profile.industry && `Industry: ${profile.industry}`, [profile.city, profile.country].filter(Boolean).join(", "), profile.goals && `Goal: ${profile.goals}`].filter(Boolean).join("\n");
      log.push({ role: "auri", text: c.startReply(name), actions: [{ label: c.start, brief: { service: idea.service, text: brief } }] });
    } else if (workspace2 && STUDIO_ROUTES.some((r) => r.match.test(t2))) {
      const route2 = STUDIO_ROUTES.find((r) => r.match.test(t2));
      const label = route2.label[lang2] || route2.label.en;
      log.push({ role: "auri", text: (STUDIO_REPLY[lang2] || STUDIO_REPLY.en)(label), actions: [{ label, href: link2("studio", { view: route2.view }) }] });
    } else if (INTENTS.billing.test(t2)) {
      const n = (connected?.invoices || []).filter((i) => ["sent", "overdue"].includes(i.status)).length;
      log.push({ role: "auri", text: c.billingReply(dueAmount ? money2(lang2, dueAmount) : "", n).replace(/ (Billing details are on the right|Your billing is on the right)\./, ""), actions: [{ label: c.billingLink, href: "/account" }] });
    } else if (INTENTS.request.test(t2) && canRequest) {
      log.push({ role: "auri", text: c.requestReply, actions: [{ label: c.requestAction, href: link2("requests", { new: "1" }) }] });
    } else if (INTENTS.roadmap.test(t2) && missions.length) {
      log.push({ role: "auri", text: c.roadmapReply(next ? missionTitle2(next) : ""), actions: [{ label: c.roadmapAction, href: link2("journey", next ? { task: next.id } : {}) }] });
    } else if (INTENTS.services.test(t2) && /show|list|my |göster|hizmetlerim|اعرض|خدماتي|mes /.test(t2)) {
      log.push({ role: "auri", text: c.servicesReply(liveCount, openCount), actions: [{ label: c.servicesLink, href: link2("services") }] });
    } else {
      const pending = { role: "auri", text: c.thinking, pending: true };
      log.push(pending);
      draw();
      let reply;
      try {
        reply = await askAuri2(text);
      } catch {
        reply = "";
      }
      log.splice(log.indexOf(pending), 1, { role: "auri", text: reply || c.error });
    }
    save();
    if (host.isConnected) draw();
  }
  const form = host.querySelector("[data-ax-form]"), input = form.querySelector("textarea");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim().slice(0, 500);
    if (!text) return;
    input.value = "";
    input.style.height = "";
    answer(text);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit?.();
    }
  });
  input.addEventListener("input", () => {
    input.style.height = "";
    input.style.height = Math.min(140, input.scrollHeight) + "px";
  });
  host.querySelectorAll("[data-ax-chip]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.axChip);
    if (i === 3 && canRequest) {
      location.assign(link2("requests", { new: "1" }));
      return;
    }
    answer(c.chips[i]);
  }));
  draw();
  if (initial) answer(initial, { direct });
  else setTimeout(() => input.focus({ preventScroll: true }), 50);
  return {
    reset: () => {
      log = [greeting()];
      save();
      draw();
    },
    ask: (text, options) => answer(text, options)
  };
}

// src/hub/os-copy.js
var EN = {
  notFound: { title: "Page not found", text: "This address doesn\u2019t exist in AuraHub. It may have moved, or the link may be mistyped." },
  billing: { title: "Billing", due: "Amount due", invoices: (n) => n === 1 ? "1 invoice to pay" : `${n} invoices to pay`, none: "Nothing to pay right now.", open: "Open orders & billing", note: "AuraDigital invoices are in Turkish lira (TRY)." },
  photo: { title: "Profile photo", hint: "Shown on your account in AuraHub. JPEG, PNG or WebP; we resize it to 256 \xD7 256.", upload: "Upload photo", change: "Change photo", remove: "Remove", saved: "Profile photo saved.", removed: "Profile photo removed.", invalid: "Choose a JPEG, PNG or WebP image." },
  nav: { overview: "Overview", business: "My Business", journey: "Growth Roadmap", studio: "Aura Studio", services: "My Services", site: "Website & AuraMenu", analytics: "Analytics", assistant: "Auri Assistant", settings: "Settings", requests: "Requests", menuDrafts: "Menu drafts", orders: "Orders & billing", team: "Team", groups: ["Workspace", "Operate", "Account"], more: "More", close: "Close", newRequest: "New request", account: "Account", switchWorkspace: "Switch business" },
  sections: { command: "Aura Command", commandTag: "Understand your business", journey: "Aura Journey", journeyTag: "Know how to grow", studio: "Aura Studio", studioTag: "Manage the work" },
  greet: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", line: (part, name) => `${part}${name ? ", " + name : ""}.`, sub: (biz) => `Let\u2019s grow ${biz}.` },
  quick: { request: "Request a service", website: "Update website", menu: "Manage AuraMenu", roadmap: "View growth roadmap", ask: "Ask Auri" },
  kpi: {
    visitors: "Website visitors",
    inquiries: "Customer inquiries",
    bookings: "Bookings",
    reservations: "Reservations",
    appointments: "Appointments",
    viewings: "Viewings",
    services: "Active services",
    notConnected: "Not connected",
    last30: "Last 30 days",
    live: "Live with AuraDigital",
    none: "None yet",
    visitorsSetup: "Visitor analytics isn\u2019t connected to your website yet.",
    bookingsSetup: "No booking or reservation system is connected.",
    inquiriesSetup: "Log the inquiries you receive to see them here.",
    servicesSetup: "Services appear once AuraDigital starts work for you.",
    connect: "Set up analytics",
    explore: "Explore options",
    logLead: "Log an inquiry",
    browse: "Browse services",
    srcLeads: "Source: Aura Studio pipeline",
    srcServices: "Source: AuraDigital service records",
    srcNone: "No data source",
    delta: (n) => `${n > 0 ? "+" : ""}${n} vs previous 30 days`
  },
  chart: { title: "Performance", note: "Real activity only. Disconnected sources stay empty.", ranges: { "30d": "30 days", "90d": "90 days", "12m": "12 months" }, inquiries: "Inquiries", visitors: "Visitors", bookings: "Bookings", count: "Count", emptyPeriod: "No inquiries logged in this period.", notConnected: "This source isn\u2019t connected, so there is nothing to chart yet.", source: "Data source" },
  activity: { title: "Recent activity", empty: "Activity from your services, roadmap and pipeline appears here.", lead: (n) => `New inquiry logged: ${n}`, mission: (n) => `Roadmap task completed: ${n}`, request: (n) => `Request sent: ${n}`, record: (n) => `Service update: ${n}`, menu: (n) => `Menu draft saved: ${n}`, all: "View all" },
  services: { title: "Active services", empty: "No active services yet.", stages: ["Received", "In review", "In production", "Live"], due: "Due", renews: "Renews", details: "Details", all: "All services" },
  next: { title: "Next actions", empty: "You\u2019re all caught up.", review: "Review", open: "Open", prepare: "Prepare request", why: "Why", roadmap: "From your roadmap", attention: "Needs your attention" },
  auri: { promptNext: (t2) => `What should I do next for \u201C${t2}\u201D?`, promptGeneral: "What should I focus on next for my business?", promptBookings: (l) => `What are my options for taking ${l.toLowerCase()} online?`, title: "Auri suggests", ask: "Ask Auri", more: "Open chat", next: (t2) => `Your most useful next step is \u201C${t2}\u201D.`, attention: (n) => `Start with \u201C${n}\u201D \u2014 it\u2019s waiting on you.`, idle: "Your roadmap is clear. Ask Auri what to improve next.", setup: "Build your roadmap so Auri can suggest the next step." },
  journey: {
    askPrompt: (s) => `Explain the \u201C${s}\u201D stage for my business: what I\u2019ve done, what to do next, and whether I need a service.`,
    title: "Growth Vision",
    kicker: "Aura Journey",
    lead: "Five stages from opening your doors to scaling up. Progress counts only completed and verified work.",
    stages: ["Launch", "Get Found", "Convert", "Grow", "Scale"],
    taglines: ["Open for business online", "Be easy to discover", "Turn interest into customers", "Work smarter, keep customers", "Measure, repeat, expand"],
    objectives: ["Give customers a trustworthy place to learn about you and reach you.", "Show up where nearby customers search and decide.", "Make it effortless to ask, book or buy \u2014 and follow up every time.", "Organize customer work so nothing slips and customers come back.", "Use real numbers to decide what to double down on."],
    why: ["Without the basics, every other investment leaks: people can\u2019t check you out or contact you.", "Most customers search before they visit. If they can\u2019t find you, they choose someone else.", "Visitors who don\u2019t take a next step are lost. Clear actions and quick replies win them.", "Repeat customers cost less to win. Systems free your time for the work only you can do.", "Growth you can measure is growth you can repeat."],
    overall: "Overall progress",
    of: (a, b) => `${a} of ${b} tasks`,
    verified: "verified milestones",
    stageOf: (i) => `Stage ${i} of 5`,
    done: "Completed",
    current: "Current stage",
    upcoming: "Upcoming",
    empty: "No tasks on this stage for your business.",
    objective: "Objective",
    completed: "Completed",
    remaining: "Remaining",
    recommended: "AuraDigital can help",
    examples: "Real AuraDigital work",
    effort: "Estimated effort",
    next: "Next suggested action",
    progress: "Stage progress",
    effortLevels: { done: "Stage complete", light: "Light \u2014 1\u20132 tasks left", moderate: "Moderate \u2014 3\u20134 tasks left", heavy: "Substantial \u2014 5 or more tasks left" },
    effortNote: "Based on the tasks left. Delivery dates are confirmed in each quote.",
    optional: "Optional",
    diy: "You can do every step yourself \u2014 services are optional.",
    request: "Request",
    view: "See what you get",
    openTask: "Open task",
    noneDone: "Nothing completed here yet.",
    allDone: "Every task here is done.",
    askStage: "Ask Auri about this stage",
    explainTitle: "Auri on this stage",
    explain: { matters: "Why it matters", did: "What you\u2019ve done", doNext: "What to do next", help: "Where AuraDigital can help", optional: "Optional or not?" },
    didNone: "No tasks completed on this stage yet.",
    didSome: (n, list) => `${n} done: ${list}.`,
    nextNone: "Nothing left here \u2014 move on to the next stage.",
    helpNone: "No AuraDigital service is needed for this stage.",
    helpSome: (list) => `${list}. Every service is optional; you can follow the steps yourself.`,
    optYes: "This stage includes optional tasks you can skip.",
    optNo: "The tasks here are part of your core roadmap, but you choose who does them.",
    taskDetail: "Task details",
    stagesLabel: "Growth stages",
    inReview: "In review",
    locked: "Upcoming"
  },
  studio: {
    title: "Aura Studio",
    intro: "Your operations workspace: inquiries, delivery, website, menu and messages.",
    tabs: { pipeline: "Lead pipeline", delivery: "Services & delivery", website: "Website", menu: "AuraMenu", inbox: "Inbox", analytics: "Analytics" },
    readOnly: "You can view this workspace. Ask the owner for edit access to change it.",
    pipeline: { add: "Add inquiry", search: "Search inquiries", allSources: "All sources", allPeople: "Everyone", unassigned: "Unassigned", empty: "No inquiries yet", emptyText: "Log inquiries from calls, messages or walk-ins. Automatic capture from your website isn\u2019t connected yet.", none: "No inquiries match your filters.", stageEmpty: "Nothing here", count: (n) => n === 1 ? "1 inquiry" : `${n} inquiries`, value: "Value", configure: "Edit stages", archived: "Archived", showArchived: "Show archived", hideArchived: "Back to pipeline", moveTo: "Move to", archive: "Archive", restore: "Restore", confirmArchive: "Archive this inquiry? You can restore it later." },
    lead: { name: "Name", contact: "Phone or email", source: "Source", interest: "Interested in", value: "Estimated value", stage: "Stage", assignee: "Assigned to", note: "Note", notes: "Notes", addNote: "Add note", save: "Save", cancel: "Cancel", create: "Add inquiry", saved: "Saved", noNotes: "No notes yet.", created: "Created", updated: "Updated", close: "Close" },
    sources: { website: "Website", phone: "Phone", whatsapp: "WhatsApp", instagram: "Instagram", email: "Email", walk_in: "Walk-in", referral: "Referral", other: "Other" },
    stagesEditor: { title: "Pipeline stages", hint: "Rename, add or remove stages. A stage that still has inquiries can\u2019t be removed.", add: "Add stage", remove: "Remove", save: "Save stages", name: "Stage name" },
    delivery: { active: "Active orders", completed: "Completed", deadlines: "Upcoming deadlines", approvals: "Waiting for your approval", revisions: "Requested revisions", messages: "Customer messages", none: "Nothing here right now.", revisionsNone: "No revisions are open. To ask for changes, send a request to the team.", messagesNone: "Messages with the AuraDigital team happen through your requests.", requestChange: "Request a change", reviewMenu: "Review menu", open: "Open", overdue: "Overdue" },
    website: { title: "Your website", preview: "Open live site", domain: "Domain", status: "Publication status", published: "Published", inProgress: "In progress", unknown: "Status not tracked", actions: "Content actions", change: "Request a content change", newPage: "Request a new page", seo: "Ask about Google visibility", none: "No website linked to this business yet", noneText: "Add your website to your business profile, or ask AuraDigital to build one.", addSite: "Add to profile", build: "Request a website", secure: "HTTPS", notOwned: "Only websites linked to this business appear here." },
    menu: { unavailable: "Self-service menu drafts are not available yet. AuraDigital can set up your menu for you.", title: "AuraMenu", drafts: "Menu drafts", open: "Open menu drafts", live: "Menus with AuraDigital", none: "No AuraMenu linked to this business yet", noneText: "Start a private menu draft, or ask the team to set one up for you.", start: "Start a menu draft", request: "Request AuraMenu", manage: "Open", notRestaurant: "AuraMenu is built for restaurants and caf\xE9s." },
    inbox: { title: "Inbox", lead: "One place for conversations \u2014 only from channels that are actually connected.", channels: "Channels", notConnected: "Not connected", connected: "Connected", connectHint: "Ask AuraDigital to connect this channel.", fromPipeline: "Recent inquiry notes", empty: "No conversations yet.", auri: "Auri conversation", teamRequests: "Requests to AuraDigital" },
    analytics: { title: "Analytics", lead: "Validated numbers only, each with its source and date range.", range: "Last 30 days", pipeline: "Pipeline", bySource: "Inquiries by source", byStage: "Open inquiries by stage", won: "Won", conversion: "Won rate", roadmap: "Roadmap completion", services: "Services", site: "Website traffic", siteNone: "Website analytics isn\u2019t connected. Numbers will appear here once tracking is set up and verified.", srcLeads: "Source: Aura Studio pipeline (entries logged by your team)", srcRoadmap: "Source: your Growth Roadmap", srcServices: "Source: AuraDigital service records", noLeads: "Log inquiries in the pipeline to see conversion." }
  },
  state: { skip: "Skip to content", loading: "Loading\u2026", error: "Something went wrong loading this section.", retry: "Try again", offline: "You appear to be offline. Check your connection and try again.", timeout: "The server took too long to answer." }
};
var TR = {
  notFound: { title: "Sayfa bulunamad\u0131", text: "Bu adres AuraHub\u2019da yok. Ta\u015F\u0131nm\u0131\u015F veya ba\u011Flant\u0131 hatal\u0131 yaz\u0131lm\u0131\u015F olabilir." },
  billing: { title: "\xD6demeler", due: "\xD6denecek tutar", invoices: (n) => `${n} \xF6denecek fatura`, none: "\u015Eu anda \xF6denecek bir \u015Fey yok.", open: "Sipari\u015Fler ve faturalar\u0131 a\xE7", note: "AuraDigital faturalar\u0131 T\xFCrk liras\u0131 (TRY) cinsindendir." },
  photo: { title: "Profil foto\u011Fraf\u0131", hint: "AuraHub hesab\u0131n\u0131zda g\xF6r\xFCn\xFCr. JPEG, PNG veya WebP; 256 \xD7 256 boyutuna k\xFC\xE7\xFClt\xFCl\xFCr.", upload: "Foto\u011Fraf y\xFCkle", change: "Foto\u011Fraf\u0131 de\u011Fi\u015Ftir", remove: "Kald\u0131r", saved: "Profil foto\u011Fraf\u0131 kaydedildi.", removed: "Profil foto\u011Fraf\u0131 kald\u0131r\u0131ld\u0131.", invalid: "JPEG, PNG veya WebP bir g\xF6rsel se\xE7in." },
  nav: { overview: "Genel bak\u0131\u015F", business: "\u0130\u015Fletmem", journey: "B\xFCy\xFCme yol haritas\u0131", studio: "Aura Studio", services: "Hizmetlerim", site: "Web sitesi ve AuraMenu", analytics: "Analitik", assistant: "Auri Asistan", settings: "Ayarlar", requests: "Talepler", menuDrafts: "Men\xFC taslaklar\u0131", orders: "Sipari\u015Fler ve faturalar", team: "Ekip", groups: ["\xC7al\u0131\u015Fma alan\u0131", "Y\xF6netim", "Hesap"], more: "Daha fazla", close: "Kapat", newRequest: "Yeni talep", account: "Hesap", switchWorkspace: "\u0130\u015Fletme de\u011Fi\u015Ftir" },
  sections: { command: "Aura Command", commandTag: "\u0130\u015Fletmenizi anlay\u0131n", journey: "Aura Journey", journeyTag: "Nas\u0131l b\xFCy\xFCyece\u011Finizi bilin", studio: "Aura Studio", studioTag: "\u0130\u015Fi y\xF6netin" },
  greet: { morning: "G\xFCnayd\u0131n", afternoon: "\u0130yi g\xFCnler", evening: "\u0130yi ak\u015Famlar", line: (part, name) => `${part}${name ? ", " + name : ""}.`, sub: (biz) => `${biz} i\xE7in b\xFCy\xFCmeye devam edelim.` },
  quick: { request: "Hizmet iste", website: "Web sitesini g\xFCncelle", menu: "AuraMenu\u2019y\xFC y\xF6net", roadmap: "Yol haritas\u0131n\u0131 g\xF6r", ask: "Auri\u2019ye sor" },
  kpi: { visitors: "Web sitesi ziyaret\xE7ileri", inquiries: "M\xFC\u015Fteri talepleri", bookings: "Rezervasyonlar", reservations: "Rezervasyonlar", appointments: "Randevular", viewings: "G\xF6sterimler", services: "Aktif hizmetler", notConnected: "Ba\u011Fl\u0131 de\u011Fil", last30: "Son 30 g\xFCn", live: "AuraDigital ile yay\u0131nda", none: "Hen\xFCz yok", visitorsSetup: "Ziyaret\xE7i analiti\u011Fi web sitenize hen\xFCz ba\u011Fl\u0131 de\u011Fil.", bookingsSetup: "Ba\u011Fl\u0131 bir rezervasyon sistemi yok.", inquiriesSetup: "Ald\u0131\u011F\u0131n\u0131z talepleri kaydedin, burada g\xF6r\xFCns\xFCn.", servicesSetup: "AuraDigital sizin i\xE7in \xE7al\u0131\u015Fmaya ba\u015Flad\u0131\u011F\u0131nda hizmetler burada g\xF6r\xFCn\xFCr.", connect: "Analiti\u011Fi kur", explore: "Se\xE7enekleri incele", logLead: "Talep kaydet", browse: "Hizmetlere g\xF6z at", srcLeads: "Kaynak: Aura Studio sat\u0131\u015F hatt\u0131", srcServices: "Kaynak: AuraDigital hizmet kay\u0131tlar\u0131", srcNone: "Veri kayna\u011F\u0131 yok", delta: (n) => `\xF6nceki 30 g\xFCne g\xF6re ${n > 0 ? "+" : ""}${n}` },
  chart: { title: "Performans", note: "Yaln\u0131zca ger\xE7ek veriler. Ba\u011Fl\u0131 olmayan kaynaklar bo\u015F kal\u0131r.", ranges: { "30d": "30 g\xFCn", "90d": "90 g\xFCn", "12m": "12 ay" }, inquiries: "Talepler", visitors: "Ziyaret\xE7iler", bookings: "Rezervasyonlar", count: "Adet", emptyPeriod: "Bu d\xF6nemde kay\u0131tl\u0131 talep yok.", notConnected: "Bu kaynak ba\u011Fl\u0131 de\u011Fil, g\xF6sterilecek veri yok.", source: "Veri kayna\u011F\u0131" },
  activity: { title: "Son hareketler", empty: "Hizmetlerinizden, yol haritan\u0131zdan ve sat\u0131\u015F hatt\u0131n\u0131zdan hareketler burada g\xF6r\xFCn\xFCr.", lead: (n) => `Yeni talep kaydedildi: ${n}`, mission: (n) => `G\xF6rev tamamland\u0131: ${n}`, request: (n) => `Talep g\xF6nderildi: ${n}`, record: (n) => `Hizmet g\xFCncellemesi: ${n}`, menu: (n) => `Men\xFC tasla\u011F\u0131 kaydedildi: ${n}`, all: "T\xFCm\xFCn\xFC g\xF6r" },
  services: { title: "Aktif hizmetler", empty: "Hen\xFCz aktif hizmet yok.", stages: ["Al\u0131nd\u0131", "\u0130ncelemede", "\xDCretimde", "Yay\u0131nda"], due: "Teslim", renews: "Yenileme", details: "Ayr\u0131nt\u0131lar", all: "T\xFCm hizmetler" },
  next: { title: "S\u0131radaki ad\u0131mlar", empty: "Her \u015Fey yolunda.", review: "\u0130ncele", open: "A\xE7", prepare: "Talep haz\u0131rla", why: "Neden", roadmap: "Yol haritan\u0131zdan", attention: "\u0130lginizi bekliyor" },
  auri: { promptNext: (t2) => `\u201C${t2}\u201D i\xE7in s\u0131rada ne yapmal\u0131y\u0131m?`, promptGeneral: "\u0130\u015Fletmem i\xE7in s\u0131rada neye odaklanmal\u0131y\u0131m?", promptBookings: (l) => `${l} i\xE7in online se\xE7eneklerim neler?`, title: "Auri\u2019nin \xF6nerisi", ask: "Auri\u2019ye sor", more: "Sohbeti a\xE7", next: (t2) => `En faydal\u0131 sonraki ad\u0131m\u0131n\u0131z: \u201C${t2}\u201D.`, attention: (n) => `\u201C${n}\u201D ile ba\u015Flay\u0131n \u2014 sizi bekliyor.`, idle: "Yol haritan\u0131z temiz. Auri\u2019ye neyi geli\u015Ftirebilece\u011Finizi sorun.", setup: "Auri\u2019nin sonraki ad\u0131m\u0131 \xF6nerebilmesi i\xE7in yol haritan\u0131z\u0131 olu\u015Fturun." },
  journey: { askPrompt: (s) => `\u0130\u015Fletmem i\xE7in \u201C${s}\u201D a\u015Famas\u0131n\u0131 a\xE7\u0131kla: neler yapt\u0131m, s\u0131rada ne var ve bir hizmete ihtiyac\u0131m var m\u0131?`, title: "B\xFCy\xFCme Vizyonu", kicker: "Aura Journey", lead: "Kap\u0131lar\u0131n\u0131z\u0131 a\xE7maktan b\xFCy\xFCmeye be\u015F a\u015Fama. \u0130lerleme yaln\u0131zca tamamlanan ve do\u011Frulanan i\u015Fleri sayar.", stages: ["Ba\u015Fla", "Bulun", "D\xF6n\xFC\u015Ft\xFCr", "B\xFCy\xFC", "\xD6l\xE7ekle"], taglines: ["\u0130nternette hizmete a\xE7\u0131l\u0131n", "Kolay bulunun", "\u0130lgiyi m\xFC\u015Fteriye \xE7evirin", "Ak\u0131ll\u0131 \xE7al\u0131\u015F\u0131n, m\xFC\u015Fteriyi tutun", "\xD6l\xE7\xFCn, tekrarlay\u0131n, geni\u015Fleyin"], objectives: ["M\xFC\u015Fterilere sizi tan\u0131yabilecekleri ve ula\u015Fabilecekleri g\xFCvenilir bir yer sunun.", "Yak\u0131ndaki m\xFC\u015Fterilerin aray\u0131p karar verdi\u011Fi yerlerde g\xF6r\xFCn\xFCn.", "Sormay\u0131, rezervasyonu veya sat\u0131n almay\u0131 kolayla\u015Ft\u0131r\u0131n ve her seferinde d\xF6n\xFC\u015F yap\u0131n.", "M\xFC\u015Fteri i\u015Flerini d\xFCzenleyin; hi\xE7bir \u015Fey ka\xE7mas\u0131n, m\xFC\u015Fteriler geri gelsin.", "Neye yat\u0131r\u0131m yapaca\u011F\u0131n\u0131za ger\xE7ek say\u0131larla karar verin."], why: ["Temeller olmadan di\u011Fer her yat\u0131r\u0131m bo\u015Fa gider: insanlar sizi inceleyemez ya da ula\u015Famaz.", "\xC7o\u011Fu m\xFC\u015Fteri ziyaret etmeden \xF6nce arar. Sizi bulamazlarsa ba\u015Fkas\u0131n\u0131 se\xE7erler.", "Bir sonraki ad\u0131m\u0131 atmayan ziyaret\xE7i kaybolur. Net \xE7a\u011Fr\u0131lar ve h\u0131zl\u0131 yan\u0131tlar kazand\u0131r\u0131r.", "Tekrar gelen m\xFC\u015Fteri daha az maliyetlidir. Sistemler zaman\u0131n\u0131z\u0131 a\xE7ar.", "\xD6l\xE7ebildi\u011Finiz b\xFCy\xFCmeyi tekrarlayabilirsiniz."], overall: "Genel ilerleme", of: (a, b) => `${b} g\xF6revden ${a}`, verified: "do\u011Frulanm\u0131\u015F hedef", stageOf: (i) => `A\u015Fama ${i} / 5`, done: "Tamamland\u0131", current: "Ge\xE7erli a\u015Fama", upcoming: "Yakla\u015Fan", empty: "Bu a\u015Famada i\u015Fletmeniz i\xE7in g\xF6rev yok.", objective: "Hedef", completed: "Tamamlanan", remaining: "Kalan", recommended: "AuraDigital yard\u0131mc\u0131 olabilir", examples: "Ger\xE7ek AuraDigital i\u015Fleri", effort: "Tahmini efor", next: "\xD6nerilen sonraki ad\u0131m", progress: "A\u015Fama ilerlemesi", effortLevels: { done: "A\u015Fama tamamland\u0131", light: "Hafif \u2014 1\u20132 g\xF6rev kald\u0131", moderate: "Orta \u2014 3\u20134 g\xF6rev kald\u0131", heavy: "Kapsaml\u0131 \u2014 5+ g\xF6rev kald\u0131" }, effortNote: "Kalan g\xF6revlere g\xF6re. Teslim tarihleri her teklifte kesinle\u015Fir.", optional: "\u0130ste\u011Fe ba\u011Fl\u0131", diy: "Her ad\u0131m\u0131 kendiniz yapabilirsiniz \u2014 hizmetler iste\u011Fe ba\u011Fl\u0131d\u0131r.", request: "\u0130ste", view: "Neler alacaks\u0131n\u0131z", openTask: "G\xF6revi a\xE7", noneDone: "Burada hen\xFCz tamamlanan yok.", allDone: "Buradaki t\xFCm g\xF6revler tamam.", askStage: "Bu a\u015Famay\u0131 Auri\u2019ye sor", explainTitle: "Auri bu a\u015Fama hakk\u0131nda", explain: { matters: "Neden \xF6nemli", did: "Neler yapt\u0131n\u0131z", doNext: "S\u0131rada ne var", help: "AuraDigital nerede yard\u0131mc\u0131 olur", optional: "\u0130ste\u011Fe ba\u011Fl\u0131 m\u0131?" }, didNone: "Bu a\u015Famada hen\xFCz tamamlanan g\xF6rev yok.", didSome: (n, list) => `${n} tamam: ${list}.`, nextNone: "Burada i\u015F kalmad\u0131 \u2014 sonraki a\u015Famaya ge\xE7in.", helpNone: "Bu a\u015Fama i\xE7in AuraDigital hizmeti gerekmiyor.", helpSome: (list) => `${list}. T\xFCm hizmetler iste\u011Fe ba\u011Fl\u0131d\u0131r; ad\u0131mlar\u0131 kendiniz izleyebilirsiniz.`, optYes: "Bu a\u015Famada atlayabilece\u011Finiz iste\u011Fe ba\u011Fl\u0131 g\xF6revler var.", optNo: "Buradaki g\xF6revler temel yol haritan\u0131z\u0131n par\xE7as\u0131; kimin yapaca\u011F\u0131n\u0131 siz se\xE7ersiniz.", taskDetail: "G\xF6rev ayr\u0131nt\u0131lar\u0131", stagesLabel: "B\xFCy\xFCme a\u015Famalar\u0131", inReview: "\u0130ncelemede", locked: "Yakla\u015Fan" },
  studio: { title: "Aura Studio", intro: "Operasyon alan\u0131n\u0131z: talepler, teslimat, web sitesi, men\xFC ve mesajlar.", tabs: { pipeline: "Sat\u0131\u015F hatt\u0131", delivery: "Hizmet ve teslimat", website: "Web sitesi", menu: "AuraMenu", inbox: "Gelen kutusu", analytics: "Analitik" }, readOnly: "Bu \xE7al\u0131\u015Fma alan\u0131n\u0131 g\xF6r\xFCnt\xFCleyebilirsiniz. De\u011Fi\u015Fiklik i\xE7in sahibinden yetki isteyin.", pipeline: { add: "Talep ekle", search: "Taleplerde ara", allSources: "T\xFCm kaynaklar", allPeople: "Herkes", unassigned: "Atanmam\u0131\u015F", empty: "Hen\xFCz talep yok", emptyText: "Telefon, mesaj veya ziyaretlerden gelen talepleri kaydedin. Web sitenizden otomatik aktar\u0131m hen\xFCz ba\u011Fl\u0131 de\u011Fil.", none: "Filtrelere uyan talep yok.", stageEmpty: "Bo\u015F", count: (n) => `${n} talep`, value: "De\u011Fer", configure: "A\u015Famalar\u0131 d\xFCzenle", archived: "Ar\u015Fiv", showArchived: "Ar\u015Fivi g\xF6ster", hideArchived: "Sat\u0131\u015F hatt\u0131na d\xF6n", moveTo: "Ta\u015F\u0131", archive: "Ar\u015Fivle", restore: "Geri al", confirmArchive: "Bu talep ar\u015Fivlensin mi? Daha sonra geri alabilirsiniz." }, lead: { name: "Ad", contact: "Telefon veya e-posta", source: "Kaynak", interest: "\u0130lgilendi\u011Fi", value: "Tahmini de\u011Fer", stage: "A\u015Fama", assignee: "Sorumlu", note: "Not", notes: "Notlar", addNote: "Not ekle", save: "Kaydet", cancel: "Vazge\xE7", create: "Talep ekle", saved: "Kaydedildi", noNotes: "Hen\xFCz not yok.", created: "Olu\u015Fturuldu", updated: "G\xFCncellendi", close: "Kapat" }, sources: { website: "Web sitesi", phone: "Telefon", whatsapp: "WhatsApp", instagram: "Instagram", email: "E-posta", walk_in: "Ziyaret", referral: "Tavsiye", other: "Di\u011Fer" }, stagesEditor: { title: "Sat\u0131\u015F hatt\u0131 a\u015Famalar\u0131", hint: "A\u015Famalar\u0131 yeniden adland\u0131r\u0131n, ekleyin veya kald\u0131r\u0131n. \u0130\xE7inde talep olan a\u015Fama kald\u0131r\u0131lamaz.", add: "A\u015Fama ekle", remove: "Kald\u0131r", save: "A\u015Famalar\u0131 kaydet", name: "A\u015Fama ad\u0131" }, delivery: { active: "Aktif sipari\u015Fler", completed: "Tamamlanan", deadlines: "Yakla\u015Fan teslimler", approvals: "Onay\u0131n\u0131z\u0131 bekleyen", revisions: "\u0130stenen d\xFCzeltmeler", messages: "M\xFC\u015Fteri mesajlar\u0131", none: "\u015Eu an burada bir \u015Fey yok.", revisionsNone: "A\xE7\u0131k d\xFCzeltme yok. De\u011Fi\u015Fiklik i\xE7in ekibe talep g\xF6nderin.", messagesNone: "AuraDigital ekibiyle yaz\u0131\u015Fmalar talepleriniz \xFCzerinden y\xFCr\xFCr.", requestChange: "De\u011Fi\u015Fiklik iste", reviewMenu: "Men\xFCy\xFC incele", open: "A\xE7", overdue: "Gecikmi\u015F" }, website: { title: "Web siteniz", preview: "Canl\u0131 siteyi a\xE7", domain: "Alan ad\u0131", status: "Yay\u0131n durumu", published: "Yay\u0131nda", inProgress: "Haz\u0131rlan\u0131yor", unknown: "Durum izlenmiyor", actions: "\u0130\xE7erik i\u015Flemleri", change: "\u0130\xE7erik de\u011Fi\u015Fikli\u011Fi iste", newPage: "Yeni sayfa iste", seo: "Google g\xF6r\xFCn\xFCrl\xFC\u011F\xFCn\xFC sor", none: "Bu i\u015Fletmeye ba\u011Fl\u0131 web sitesi yok", noneText: "Web sitenizi i\u015Fletme profilinize ekleyin veya AuraDigital\u2019den isteyin.", addSite: "Profile ekle", build: "Web sitesi iste", secure: "HTTPS", notOwned: "Yaln\u0131zca bu i\u015Fletmeye ba\u011Fl\u0131 siteler g\xF6r\xFCn\xFCr." }, menu: { unavailable: "Men\xFC taslaklar\u0131 hen\xFCz kullan\u0131lam\u0131yor. AuraDigital men\xFCn\xFCz\xFC sizin i\xE7in kurabilir.", title: "AuraMenu", drafts: "Men\xFC taslaklar\u0131", open: "Men\xFC taslaklar\u0131n\u0131 a\xE7", live: "AuraDigital\u2019deki men\xFCler", none: "Bu i\u015Fletmeye ba\u011Fl\u0131 AuraMenu yok", noneText: "\xD6zel bir men\xFC tasla\u011F\u0131 ba\u015Flat\u0131n veya ekipten kurulum isteyin.", start: "Men\xFC tasla\u011F\u0131 ba\u015Flat", request: "AuraMenu iste", manage: "A\xE7", notRestaurant: "AuraMenu restoran ve kafeler i\xE7in tasarland\u0131." }, inbox: { title: "Gelen kutusu", lead: "Konu\u015Fmalar tek yerde \u2014 yaln\u0131zca ger\xE7ekten ba\u011Fl\u0131 kanallardan.", channels: "Kanallar", notConnected: "Ba\u011Fl\u0131 de\u011Fil", connected: "Ba\u011Fl\u0131", connectHint: "Bu kanal\u0131n ba\u011Flanmas\u0131 i\xE7in AuraDigital\u2019e yaz\u0131n.", fromPipeline: "Son talep notlar\u0131", empty: "Hen\xFCz konu\u015Fma yok.", auri: "Auri sohbeti", teamRequests: "AuraDigital talepleri" }, analytics: { title: "Analitik", lead: "Yaln\u0131zca do\u011Frulanm\u0131\u015F say\u0131lar; her biri kayna\u011F\u0131 ve tarih aral\u0131\u011F\u0131yla.", range: "Son 30 g\xFCn", pipeline: "Sat\u0131\u015F hatt\u0131", bySource: "Kayna\u011Fa g\xF6re talepler", byStage: "A\u015Famaya g\xF6re a\xE7\u0131k talepler", won: "Kazan\u0131lan", conversion: "Kazanma oran\u0131", roadmap: "Yol haritas\u0131 tamamlanma", services: "Hizmetler", site: "Web sitesi trafi\u011Fi", siteNone: "Web sitesi analiti\u011Fi ba\u011Fl\u0131 de\u011Fil. Takip kurulup do\u011Fruland\u0131\u011F\u0131nda say\u0131lar burada g\xF6r\xFCn\xFCr.", srcLeads: "Kaynak: Aura Studio sat\u0131\u015F hatt\u0131 (ekibinizin kay\u0131tlar\u0131)", srcRoadmap: "Kaynak: B\xFCy\xFCme yol haritan\u0131z", srcServices: "Kaynak: AuraDigital hizmet kay\u0131tlar\u0131", noLeads: "D\xF6n\xFC\u015F\xFCm\xFC g\xF6rmek i\xE7in sat\u0131\u015F hatt\u0131na talep kaydedin." } },
  state: { skip: "\u0130\xE7eri\u011Fe ge\xE7", loading: "Y\xFCkleniyor\u2026", error: "Bu b\xF6l\xFCm y\xFCklenirken bir sorun olu\u015Ftu.", retry: "Tekrar dene", offline: "\xC7evrimd\u0131\u015F\u0131 g\xF6r\xFCn\xFCyorsunuz. Ba\u011Flant\u0131n\u0131z\u0131 kontrol edip tekrar deneyin.", timeout: "Sunucu \xE7ok ge\xE7 yan\u0131t verdi." }
};
var FR = {
  notFound: { title: "Page introuvable", text: "Cette adresse n\u2019existe pas dans AuraHub. Elle a peut-\xEAtre chang\xE9 ou le lien est incorrect." },
  billing: { title: "Facturation", due: "Montant d\xFB", invoices: (n) => n === 1 ? "1 facture \xE0 payer" : `${n} factures \xE0 payer`, none: "Rien \xE0 payer pour le moment.", open: "Commandes et factures", note: "Les factures AuraDigital sont en livres turques (TRY)." },
  photo: { title: "Photo de profil", hint: "Affich\xE9e sur votre compte AuraHub. JPEG, PNG ou WebP ; redimensionn\xE9e en 256 \xD7 256.", upload: "Ajouter une photo", change: "Changer la photo", remove: "Supprimer", saved: "Photo de profil enregistr\xE9e.", removed: "Photo de profil supprim\xE9e.", invalid: "Choisissez une image JPEG, PNG ou WebP." },
  nav: { overview: "Vue d\u2019ensemble", business: "Mon activit\xE9", journey: "Feuille de route", studio: "Aura Studio", services: "Mes services", site: "Site web et AuraMenu", analytics: "Statistiques", assistant: "Assistant Auri", settings: "Param\xE8tres", requests: "Demandes", menuDrafts: "Brouillons de menu", orders: "Commandes et factures", team: "\xC9quipe", groups: ["Espace", "Op\xE9rations", "Compte"], more: "Plus", close: "Fermer", newRequest: "Nouvelle demande", account: "Compte", switchWorkspace: "Changer d\u2019activit\xE9" },
  sections: { command: "Aura Command", commandTag: "Comprendre votre activit\xE9", journey: "Aura Journey", journeyTag: "Savoir comment grandir", studio: "Aura Studio", studioTag: "G\xE9rer le travail" },
  greet: { morning: "Bonjour", afternoon: "Bon apr\xE8s-midi", evening: "Bonsoir", line: (part, name) => `${part}${name ? ", " + name : ""}.`, sub: (biz) => `Faisons grandir ${biz}.` },
  quick: { request: "Demander un service", website: "Mettre \xE0 jour le site", menu: "G\xE9rer AuraMenu", roadmap: "Voir la feuille de route", ask: "Demander \xE0 Auri" },
  kpi: { visitors: "Visiteurs du site", inquiries: "Demandes clients", bookings: "R\xE9servations", reservations: "R\xE9servations", appointments: "Rendez-vous", viewings: "Visites", services: "Services actifs", notConnected: "Non connect\xE9", last30: "30 derniers jours", live: "En ligne avec AuraDigital", none: "Aucun pour l\u2019instant", visitorsSetup: "Les statistiques de visite ne sont pas encore connect\xE9es \xE0 votre site.", bookingsSetup: "Aucun syst\xE8me de r\xE9servation n\u2019est connect\xE9.", inquiriesSetup: "Enregistrez les demandes re\xE7ues pour les voir ici.", servicesSetup: "Les services apparaissent d\xE8s qu\u2019AuraDigital travaille pour vous.", connect: "Configurer les statistiques", explore: "Voir les options", logLead: "Enregistrer une demande", browse: "Voir les services", srcLeads: "Source : pipeline Aura Studio", srcServices: "Source : dossiers de service AuraDigital", srcNone: "Aucune source de donn\xE9es", delta: (n) => `${n > 0 ? "+" : ""}${n} vs 30 jours pr\xE9c\xE9dents` },
  chart: { title: "Performance", note: "Activit\xE9 r\xE9elle uniquement. Les sources non connect\xE9es restent vides.", ranges: { "30d": "30 jours", "90d": "90 jours", "12m": "12 mois" }, inquiries: "Demandes", visitors: "Visiteurs", bookings: "R\xE9servations", count: "Nombre", emptyPeriod: "Aucune demande enregistr\xE9e sur cette p\xE9riode.", notConnected: "Cette source n\u2019est pas connect\xE9e : rien \xE0 afficher pour l\u2019instant.", source: "Source des donn\xE9es" },
  activity: { title: "Activit\xE9 r\xE9cente", empty: "L\u2019activit\xE9 de vos services, feuille de route et pipeline appara\xEEt ici.", lead: (n) => `Nouvelle demande : ${n}`, mission: (n) => `T\xE2che termin\xE9e : ${n}`, request: (n) => `Demande envoy\xE9e : ${n}`, record: (n) => `Mise \xE0 jour du service : ${n}`, menu: (n) => `Brouillon de menu enregistr\xE9 : ${n}`, all: "Tout voir" },
  services: { title: "Services actifs", empty: "Aucun service actif pour le moment.", stages: ["Re\xE7u", "En revue", "En production", "En ligne"], due: "\xC9ch\xE9ance", renews: "Renouvellement", details: "D\xE9tails", all: "Tous les services" },
  next: { title: "Prochaines actions", empty: "Tout est \xE0 jour.", review: "Examiner", open: "Ouvrir", prepare: "Pr\xE9parer la demande", why: "Pourquoi", roadmap: "De votre feuille de route", attention: "Attend votre action" },
  auri: { promptNext: (t2) => `Que dois-je faire ensuite pour \xAB ${t2} \xBB ?`, promptGeneral: "Sur quoi dois-je me concentrer ensuite ?", promptBookings: (l) => `Quelles sont mes options pour g\xE9rer les ${l.toLowerCase()} en ligne ?`, title: "Auri sugg\xE8re", ask: "Demander \xE0 Auri", more: "Ouvrir le chat", next: (t2) => `Votre prochaine \xE9tape la plus utile : \xAB ${t2} \xBB.`, attention: (n) => `Commencez par \xAB ${n} \xBB \u2014 cela vous attend.`, idle: "Votre feuille de route est \xE0 jour. Demandez \xE0 Auri quoi am\xE9liorer.", setup: "Cr\xE9ez votre feuille de route pour qu\u2019Auri propose la prochaine \xE9tape." },
  journey: { askPrompt: (s) => `Explique l\u2019\xE9tape \xAB ${s} \xBB pour mon activit\xE9 : ce que j\u2019ai fait, la suite, et si j\u2019ai besoin d\u2019un service.`, title: "Vision de croissance", kicker: "Aura Journey", lead: "Cinq \xE9tapes, de l\u2019ouverture \xE0 la croissance. La progression ne compte que le travail termin\xE9 et v\xE9rifi\xE9.", stages: ["Lancer", "\xCAtre trouv\xE9", "Convertir", "Grandir", "Passer \xE0 l\u2019\xE9chelle"], taglines: ["Ouvert en ligne", "Facile \xE0 d\xE9couvrir", "Transformer l\u2019int\xE9r\xEAt en clients", "Travailler mieux, fid\xE9liser", "Mesurer, r\xE9p\xE9ter, \xE9tendre"], objectives: ["Offrir un lieu fiable pour vous d\xE9couvrir et vous contacter.", "Appara\xEEtre l\xE0 o\xF9 les clients proches cherchent et d\xE9cident.", "Rendre simple la demande, la r\xE9servation ou l\u2019achat \u2014 et toujours relancer.", "Organiser le travail client pour ne rien oublier et fid\xE9liser.", "D\xE9cider avec de vrais chiffres o\xF9 investir."], why: ["Sans les bases, tout le reste fuit : on ne peut ni vous v\xE9rifier ni vous joindre.", "La plupart des clients cherchent avant de venir. Introuvable, vous \xEAtes remplac\xE9.", "Un visiteur sans prochaine \xE9tape est perdu. Des actions claires et des r\xE9ponses rapides convertissent.", "Un client fid\xE8le co\xFBte moins cher. Les syst\xE8mes lib\xE8rent votre temps.", "Une croissance mesur\xE9e est une croissance reproductible."], overall: "Progression globale", of: (a, b) => `${a} sur ${b} t\xE2ches`, verified: "objectifs v\xE9rifi\xE9s", stageOf: (i) => `\xC9tape ${i} sur 5`, done: "Termin\xE9", current: "\xC9tape actuelle", upcoming: "\xC0 venir", empty: "Aucune t\xE2che \xE0 cette \xE9tape pour votre activit\xE9.", objective: "Objectif", completed: "Termin\xE9", remaining: "Restant", recommended: "AuraDigital peut aider", examples: "R\xE9alisations AuraDigital", effort: "Effort estim\xE9", next: "Prochaine action sugg\xE9r\xE9e", progress: "Progression de l\u2019\xE9tape", effortLevels: { done: "\xC9tape termin\xE9e", light: "L\xE9ger \u2014 1 \xE0 2 t\xE2ches", moderate: "Mod\xE9r\xE9 \u2014 3 \xE0 4 t\xE2ches", heavy: "Important \u2014 5 t\xE2ches ou plus" }, effortNote: "Selon les t\xE2ches restantes. Les d\xE9lais sont confirm\xE9s dans chaque devis.", optional: "Facultatif", diy: "Vous pouvez tout faire vous-m\xEAme \u2014 les services sont facultatifs.", request: "Demander", view: "Ce que vous recevrez", openTask: "Ouvrir la t\xE2che", noneDone: "Rien de termin\xE9 ici pour l\u2019instant.", allDone: "Toutes les t\xE2ches sont faites.", askStage: "Demander \xE0 Auri sur cette \xE9tape", explainTitle: "Auri sur cette \xE9tape", explain: { matters: "Pourquoi c\u2019est important", did: "Ce que vous avez fait", doNext: "Quoi faire ensuite", help: "O\xF9 AuraDigital peut aider", optional: "Facultatif ?" }, didNone: "Aucune t\xE2che termin\xE9e \xE0 cette \xE9tape.", didSome: (n, list) => `${n} termin\xE9e(s) : ${list}.`, nextNone: "Plus rien ici \u2014 passez \xE0 l\u2019\xE9tape suivante.", helpNone: "Aucun service AuraDigital n\u2019est n\xE9cessaire ici.", helpSome: (list) => `${list}. Chaque service est facultatif ; vous pouvez suivre les \xE9tapes vous-m\xEAme.`, optYes: "Cette \xE9tape contient des t\xE2ches facultatives.", optNo: "Ces t\xE2ches font partie de votre feuille de route ; vous choisissez qui les r\xE9alise.", taskDetail: "D\xE9tails de la t\xE2che", stagesLabel: "\xC9tapes de croissance", inReview: "En revue", locked: "\xC0 venir" },
  studio: { title: "Aura Studio", intro: "Votre espace op\xE9rationnel : demandes, livraison, site, menu et messages.", tabs: { pipeline: "Pipeline", delivery: "Services et livraison", website: "Site web", menu: "AuraMenu", inbox: "Messagerie", analytics: "Statistiques" }, readOnly: "Vous pouvez consulter cet espace. Demandez au propri\xE9taire un acc\xE8s en \xE9criture.", pipeline: { add: "Ajouter une demande", search: "Rechercher", allSources: "Toutes les sources", allPeople: "Tout le monde", unassigned: "Non attribu\xE9", empty: "Aucune demande", emptyText: "Enregistrez les demandes re\xE7ues par t\xE9l\xE9phone, message ou en boutique. La capture automatique depuis votre site n\u2019est pas encore connect\xE9e.", none: "Aucune demande ne correspond aux filtres.", stageEmpty: "Vide", count: (n) => n === 1 ? "1 demande" : `${n} demandes`, value: "Valeur", configure: "Modifier les \xE9tapes", archived: "Archiv\xE9es", showArchived: "Voir les archives", hideArchived: "Retour au pipeline", moveTo: "D\xE9placer vers", archive: "Archiver", restore: "Restaurer", confirmArchive: "Archiver cette demande ? Vous pourrez la restaurer." }, lead: { name: "Nom", contact: "T\xE9l\xE9phone ou e-mail", source: "Source", interest: "Int\xE9ress\xE9 par", value: "Valeur estim\xE9e", stage: "\xC9tape", assignee: "Attribu\xE9 \xE0", note: "Note", notes: "Notes", addNote: "Ajouter une note", save: "Enregistrer", cancel: "Annuler", create: "Ajouter", saved: "Enregistr\xE9", noNotes: "Aucune note.", created: "Cr\xE9\xE9", updated: "Mis \xE0 jour", close: "Fermer" }, sources: { website: "Site web", phone: "T\xE9l\xE9phone", whatsapp: "WhatsApp", instagram: "Instagram", email: "E-mail", walk_in: "En boutique", referral: "Recommandation", other: "Autre" }, stagesEditor: { title: "\xC9tapes du pipeline", hint: "Renommez, ajoutez ou supprimez des \xE9tapes. Une \xE9tape contenant des demandes ne peut pas \xEAtre supprim\xE9e.", add: "Ajouter une \xE9tape", remove: "Supprimer", save: "Enregistrer", name: "Nom de l\u2019\xE9tape" }, delivery: { active: "Commandes actives", completed: "Termin\xE9es", deadlines: "\xC9ch\xE9ances \xE0 venir", approvals: "En attente de validation", revisions: "R\xE9visions demand\xE9es", messages: "Messages", none: "Rien pour le moment.", revisionsNone: "Aucune r\xE9vision ouverte. Pour une modification, envoyez une demande.", messagesNone: "Les \xE9changes avec AuraDigital passent par vos demandes.", requestChange: "Demander une modification", reviewMenu: "Examiner le menu", open: "Ouvrir", overdue: "En retard" }, website: { title: "Votre site web", preview: "Ouvrir le site", domain: "Domaine", status: "Statut de publication", published: "Publi\xE9", inProgress: "En cours", unknown: "Statut non suivi", actions: "Actions de contenu", change: "Demander une modification", newPage: "Demander une page", seo: "Visibilit\xE9 Google", none: "Aucun site li\xE9 \xE0 cette activit\xE9", noneText: "Ajoutez votre site au profil ou demandez-en un \xE0 AuraDigital.", addSite: "Ajouter au profil", build: "Demander un site", secure: "HTTPS", notOwned: "Seuls les sites li\xE9s \xE0 cette activit\xE9 apparaissent." }, menu: { unavailable: "Les brouillons de menu ne sont pas encore disponibles. AuraDigital peut cr\xE9er votre menu pour vous.", title: "AuraMenu", drafts: "Brouillons de menu", open: "Ouvrir les brouillons", live: "Menus chez AuraDigital", none: "Aucun AuraMenu li\xE9 \xE0 cette activit\xE9", noneText: "Commencez un brouillon priv\xE9 ou demandez \xE0 l\u2019\xE9quipe de le pr\xE9parer.", start: "Commencer un brouillon", request: "Demander AuraMenu", manage: "Ouvrir", notRestaurant: "AuraMenu est con\xE7u pour les restaurants et caf\xE9s." }, inbox: { title: "Messagerie", lead: "Vos conversations au m\xEAme endroit \u2014 uniquement depuis les canaux r\xE9ellement connect\xE9s.", channels: "Canaux", notConnected: "Non connect\xE9", connected: "Connect\xE9", connectHint: "Demandez \xE0 AuraDigital de connecter ce canal.", fromPipeline: "Notes r\xE9centes", empty: "Aucune conversation.", auri: "Conversation avec Auri", teamRequests: "Demandes \xE0 AuraDigital" }, analytics: { title: "Statistiques", lead: "Uniquement des chiffres v\xE9rifi\xE9s, avec leur source et leur p\xE9riode.", range: "30 derniers jours", pipeline: "Pipeline", bySource: "Demandes par source", byStage: "Demandes ouvertes par \xE9tape", won: "Gagn\xE9es", conversion: "Taux de r\xE9ussite", roadmap: "Feuille de route", services: "Services", site: "Trafic du site", siteNone: "Les statistiques du site ne sont pas connect\xE9es. Les chiffres appara\xEEtront une fois le suivi configur\xE9 et v\xE9rifi\xE9.", srcLeads: "Source : pipeline Aura Studio (saisies de votre \xE9quipe)", srcRoadmap: "Source : votre feuille de route", srcServices: "Source : dossiers de service AuraDigital", noLeads: "Enregistrez des demandes pour voir la conversion." } },
  state: { skip: "Aller au contenu", loading: "Chargement\u2026", error: "Un probl\xE8me est survenu lors du chargement.", retry: "R\xE9essayer", offline: "Vous semblez hors ligne. V\xE9rifiez votre connexion.", timeout: "Le serveur a mis trop de temps \xE0 r\xE9pondre." }
};
var AR = {
  notFound: { title: "\u0627\u0644\u0635\u0641\u062D\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629", text: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A AuraHub. \u0631\u0628\u0645\u0627 \u0646\u064F\u0642\u0644 \u0623\u0648 \u0623\u0646 \u0627\u0644\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D." },
  billing: { title: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631", due: "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642", invoices: (n) => `${n} \u0641\u0648\u0627\u062A\u064A\u0631 \u0644\u0644\u062F\u0641\u0639`, none: "\u0644\u0627 \u0634\u064A\u0621 \u0644\u0644\u062F\u0641\u0639 \u062D\u0627\u0644\u064A\u064B\u0627.", open: "\u0627\u0641\u062A\u062D \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631", note: "\u0641\u0648\u0627\u062A\u064A\u0631 AuraDigital \u0628\u0627\u0644\u0644\u064A\u0631\u0629 \u0627\u0644\u062A\u0631\u0643\u064A\u0629 (TRY)." },
  photo: { title: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A", hint: "\u062A\u0638\u0647\u0631 \u0641\u064A \u062D\u0633\u0627\u0628\u0643 \u0639\u0644\u0649 AuraHub. JPEG \u0623\u0648 PNG \u0623\u0648 WebP\u061B \u0646\u0635\u063A\u0651\u0631\u0647\u0627 \u0625\u0644\u0649 256 \xD7 256.", upload: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629", change: "\u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0635\u0648\u0631\u0629", remove: "\u0625\u0632\u0627\u0644\u0629", saved: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0635\u0648\u0631\u0629.", removed: "\u062A\u0645\u062A \u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u0631\u0629.", invalid: "\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629 JPEG \u0623\u0648 PNG \u0623\u0648 WebP." },
  nav: { overview: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", business: "\u0646\u0634\u0627\u0637\u064A", journey: "\u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0646\u0645\u0648", studio: "Aura Studio", services: "\u062E\u062F\u0645\u0627\u062A\u064A", site: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0648AuraMenu", analytics: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", assistant: "\u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0623\u0648\u0631\u064A", settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", requests: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A", menuDrafts: "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645", orders: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631", team: "\u0627\u0644\u0641\u0631\u064A\u0642", groups: ["\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644", "\u0627\u0644\u062A\u0634\u063A\u064A\u0644", "\u0627\u0644\u062D\u0633\u0627\u0628"], more: "\u0627\u0644\u0645\u0632\u064A\u062F", close: "\u0625\u063A\u0644\u0627\u0642", newRequest: "\u0637\u0644\u0628 \u062C\u062F\u064A\u062F", account: "\u0627\u0644\u062D\u0633\u0627\u0628", switchWorkspace: "\u062A\u0628\u062F\u064A\u0644 \u0627\u0644\u0646\u0634\u0627\u0637" },
  sections: { command: "Aura Command", commandTag: "\u0627\u0641\u0647\u0645 \u0646\u0634\u0627\u0637\u0643", journey: "Aura Journey", journeyTag: "\u0627\u0639\u0631\u0641 \u0643\u064A\u0641 \u062A\u0646\u0645\u0648", studio: "Aura Studio", studioTag: "\u0623\u062F\u0631 \u0627\u0644\u0639\u0645\u0644" },
  greet: { morning: "\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631", afternoon: "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631", evening: "\u0645\u0633\u0627\u0621 \u0627\u0644\u062E\u064A\u0631", line: (part, name) => `${part}${name ? "\u060C " + name : ""}.`, sub: (biz) => `\u0644\u0646\u0646\u0645\u0650\u0651 ${biz}.` },
  quick: { request: "\u0627\u0637\u0644\u0628 \u062E\u062F\u0645\u0629", website: "\u062D\u062F\u0651\u062B \u0627\u0644\u0645\u0648\u0642\u0639", menu: "\u0623\u062F\u0631 AuraMenu", roadmap: "\u0627\u0639\u0631\u0636 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0646\u0645\u0648", ask: "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A" },
  kpi: { visitors: "\u0632\u0648\u0627\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", inquiries: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0627\u0621", bookings: "\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A", reservations: "\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A", appointments: "\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F", viewings: "\u0627\u0644\u0645\u0639\u0627\u064A\u0646\u0627\u062A", services: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629", notConnected: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644", last30: "\u0622\u062E\u0631 30 \u064A\u0648\u0645\u064B\u0627", live: "\u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0639 AuraDigital", none: "\u0644\u0627 \u0634\u064A\u0621 \u0628\u0639\u062F", visitorsSetup: "\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0632\u0648\u0627\u0631 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644\u0629 \u0628\u0645\u0648\u0642\u0639\u0643 \u0628\u0639\u062F.", bookingsSetup: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0646\u0638\u0627\u0645 \u062D\u062C\u0648\u0632\u0627\u062A \u0645\u062A\u0635\u0644.", inquiriesSetup: "\u0633\u062C\u0651\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0635\u0644\u0643 \u0644\u062A\u0638\u0647\u0631 \u0647\u0646\u0627.", servicesSetup: "\u062A\u0638\u0647\u0631 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0639\u0646\u062F\u0645\u0627 \u062A\u0628\u062F\u0623 AuraDigital \u0627\u0644\u0639\u0645\u0644 \u0644\u0643.", connect: "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", explore: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A", logLead: "\u0633\u062C\u0651\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u064B\u0627", browse: "\u062A\u0635\u0641\u062D \u0627\u0644\u062E\u062F\u0645\u0627\u062A", srcLeads: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0645\u0633\u0627\u0631 Aura Studio", srcServices: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0633\u062C\u0644\u0627\u062A \u062E\u062F\u0645\u0627\u062A AuraDigital", srcNone: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0635\u062F\u0631 \u0628\u064A\u0627\u0646\u0627\u062A", delta: (n) => `${n > 0 ? "+" : ""}${n} \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u064030 \u064A\u0648\u0645\u064B\u0627 \u0627\u0644\u0633\u0627\u0628\u0642\u0629` },
  chart: { title: "\u0627\u0644\u0623\u062F\u0627\u0621", note: "\u0646\u0634\u0627\u0637 \u062D\u0642\u064A\u0642\u064A \u0641\u0642\u0637. \u0627\u0644\u0645\u0635\u0627\u062F\u0631 \u063A\u064A\u0631 \u0627\u0644\u0645\u062A\u0635\u0644\u0629 \u062A\u0628\u0642\u0649 \u0641\u0627\u0631\u063A\u0629.", ranges: { "30d": "30 \u064A\u0648\u0645\u064B\u0627", "90d": "90 \u064A\u0648\u0645\u064B\u0627", "12m": "12 \u0634\u0647\u0631\u064B\u0627" }, inquiries: "\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A", visitors: "\u0627\u0644\u0632\u0648\u0627\u0631", bookings: "\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A", count: "\u0627\u0644\u0639\u062F\u062F", emptyPeriod: "\u0644\u0627 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0645\u0633\u062C\u0644\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u062A\u0631\u0629.", notConnected: "\u0647\u0630\u0627 \u0627\u0644\u0645\u0635\u062F\u0631 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644\u060C \u0644\u0630\u0627 \u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0639\u062F.", source: "\u0645\u0635\u062F\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" },
  activity: { title: "\u0622\u062E\u0631 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A", empty: "\u064A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0646\u0634\u0627\u0637 \u062E\u062F\u0645\u0627\u062A\u0643 \u0648\u062E\u0637\u062A\u0643 \u0648\u0645\u0633\u0627\u0631 \u0639\u0645\u0644\u0627\u0626\u0643.", lead: (n) => `\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u062C\u062F\u064A\u062F: ${n}`, mission: (n) => `\u0627\u0643\u062A\u0645\u0644\u062A \u0645\u0647\u0645\u0629: ${n}`, request: (n) => `\u0623\u064F\u0631\u0633\u0644 \u0637\u0644\u0628: ${n}`, record: (n) => `\u062A\u062D\u062F\u064A\u062B \u062E\u062F\u0645\u0629: ${n}`, menu: (n) => `\u062D\u064F\u0641\u0638\u062A \u0645\u0633\u0648\u062F\u0629 \u0642\u0627\u0626\u0645\u0629: ${n}`, all: "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644" },
  services: { title: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629", empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0646\u0634\u0637\u0629 \u0628\u0639\u062F.", stages: ["\u0645\u0633\u062A\u0644\u0645", "\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0645\u0628\u0627\u0634\u0631"], due: "\u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642", renews: "\u0627\u0644\u062A\u062C\u062F\u064A\u062F", details: "\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644", all: "\u0643\u0644 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" },
  next: { title: "\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629", empty: "\u0643\u0644 \u0634\u064A\u0621 \u0645\u062D\u062F\u0651\u062B.", review: "\u0631\u0627\u062C\u0639", open: "\u0627\u0641\u062A\u062D", prepare: "\u062C\u0647\u0651\u0632 \u0627\u0644\u0637\u0644\u0628", why: "\u0644\u0645\u0627\u0630\u0627", roadmap: "\u0645\u0646 \u062E\u0637\u062A\u0643", attention: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631\u0643" },
  auri: { promptNext: (t2) => `\u0645\u0627 \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0644\u0640\xAB${t2}\xBB\u061F`, promptGeneral: "\u0639\u0644\u0649 \u0645\u0627\u0630\u0627 \u0623\u0631\u0643\u0632 \u0628\u0639\u062F \u0630\u0644\u0643 \u0641\u064A \u0646\u0634\u0627\u0637\u064A\u061F", promptBookings: (l) => `\u0645\u0627 \u062E\u064A\u0627\u0631\u0627\u062A\u064A \u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644 ${l} \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A\u061F`, title: "\u0627\u0642\u062A\u0631\u0627\u062D \u0623\u0648\u0631\u064A", ask: "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A", more: "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629", next: (t2) => `\u0623\u0641\u0636\u0644 \u062E\u0637\u0648\u0629 \u062A\u0627\u0644\u064A\u0629 \u0644\u0643: \xAB${t2}\xBB.`, attention: (n) => `\u0627\u0628\u062F\u0623 \u0628\u0640\xAB${n}\xBB \u2014 \u0625\u0646\u0647\u0627 \u0628\u0627\u0646\u062A\u0638\u0627\u0631\u0643.`, idle: "\u062E\u0637\u062A\u0643 \u0645\u062D\u062F\u0651\u062B\u0629. \u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A \u0639\u0645\u0651\u0627 \u064A\u0645\u0643\u0646 \u062A\u062D\u0633\u064A\u0646\u0647.", setup: "\u0623\u0646\u0634\u0626 \u062E\u0637\u062A\u0643 \u0644\u064A\u0642\u062A\u0631\u062D \u0623\u0648\u0631\u064A \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629." },
  journey: { askPrompt: (s) => `\u0627\u0634\u0631\u062D \u0645\u0631\u062D\u0644\u0629 \xAB${s}\xBB \u0644\u0646\u0634\u0627\u0637\u064A: \u0645\u0627 \u0623\u0646\u062C\u0632\u062A\u0647 \u0648\u0645\u0627 \u0627\u0644\u062A\u0627\u0644\u064A \u0648\u0647\u0644 \u0623\u062D\u062A\u0627\u062C \u062E\u062F\u0645\u0629\u061F`, title: "\u0631\u0624\u064A\u0629 \u0627\u0644\u0646\u0645\u0648", kicker: "Aura Journey", lead: "\u062E\u0645\u0633 \u0645\u0631\u0627\u062D\u0644 \u0645\u0646 \u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642 \u0625\u0644\u0649 \u0627\u0644\u062A\u0648\u0633\u0639. \u0627\u0644\u062A\u0642\u062F\u0645 \u064A\u062D\u062A\u0633\u0628 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0643\u062A\u0645\u0644 \u0648\u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647 \u0641\u0642\u0637.", stages: ["\u0627\u0644\u0627\u0646\u0637\u0644\u0627\u0642", "\u0627\u0644\u0638\u0647\u0648\u0631", "\u0627\u0644\u062A\u062D\u0648\u064A\u0644", "\u0627\u0644\u0646\u0645\u0648", "\u0627\u0644\u062A\u0648\u0633\u0639"], taglines: ["\u0627\u0641\u062A\u062D \u0623\u0628\u0648\u0627\u0628\u0643 \u0639\u0644\u0649 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A", "\u0643\u0646 \u0633\u0647\u0644 \u0627\u0644\u0627\u0643\u062A\u0634\u0627\u0641", "\u062D\u0648\u0651\u0644 \u0627\u0644\u0627\u0647\u062A\u0645\u0627\u0645 \u0625\u0644\u0649 \u0639\u0645\u0644\u0627\u0621", "\u0627\u0639\u0645\u0644 \u0628\u0630\u0643\u0627\u0621 \u0648\u0627\u062D\u062A\u0641\u0638 \u0628\u0639\u0645\u0644\u0627\u0626\u0643", "\u0642\u0650\u0633 \u0648\u0643\u0631\u0651\u0631 \u0648\u062A\u0648\u0633\u0651\u0639"], objectives: ["\u0642\u062F\u0651\u0645 \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0645\u0643\u0627\u0646\u064B\u0627 \u0645\u0648\u062B\u0648\u0642\u064B\u0627 \u0644\u0644\u062A\u0639\u0631\u0641 \u0639\u0644\u064A\u0643 \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643.", "\u0627\u0638\u0647\u0631 \u062D\u064A\u062B \u064A\u0628\u062D\u062B \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0642\u0631\u064A\u0628\u0648\u0646 \u0648\u064A\u0642\u0631\u0631\u0648\u0646.", "\u0627\u062C\u0639\u0644 \u0627\u0644\u0633\u0624\u0627\u0644 \u0623\u0648 \u0627\u0644\u062D\u062C\u0632 \u0623\u0648 \u0627\u0644\u0634\u0631\u0627\u0621 \u0633\u0647\u0644\u064B\u0627 \u0648\u062A\u0627\u0628\u0639 \u0643\u0644 \u0645\u0631\u0629.", "\u0646\u0638\u0651\u0645 \u0639\u0645\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u062D\u062A\u0649 \u0644\u0627 \u064A\u0636\u064A\u0639 \u0634\u064A\u0621 \u0648\u064A\u0639\u0648\u062F \u0627\u0644\u0639\u0645\u0644\u0627\u0621.", "\u0627\u0633\u062A\u062E\u062F\u0645 \u0623\u0631\u0642\u0627\u0645\u064B\u0627 \u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u062A\u0642\u0631\u0631 \u0623\u064A\u0646 \u062A\u0633\u062A\u062B\u0645\u0631."], why: ["\u0628\u062F\u0648\u0646 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u064A\u0636\u064A\u0639 \u0643\u0644 \u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0622\u062E\u0631: \u0644\u0627 \u064A\u0633\u062A\u0637\u064A\u0639 \u0627\u0644\u0646\u0627\u0633 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0643 \u0623\u0648 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643.", "\u064A\u0628\u062D\u062B \u0645\u0639\u0638\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0642\u0628\u0644 \u0627\u0644\u0632\u064A\u0627\u0631\u0629. \u0625\u0646 \u0644\u0645 \u064A\u062C\u062F\u0648\u0643 \u0627\u062E\u062A\u0627\u0631\u0648\u0627 \u063A\u064A\u0631\u0643.", "\u0627\u0644\u0632\u0627\u0626\u0631 \u0627\u0644\u0630\u064A \u0644\u0627 \u064A\u062A\u062E\u0630 \u062E\u0637\u0648\u0629 \u062A\u0627\u0644\u064A\u0629 \u064A\u0636\u064A\u0639. \u0627\u0644\u062F\u0639\u0648\u0627\u062A \u0627\u0644\u0648\u0627\u0636\u062D\u0629 \u0648\u0627\u0644\u0631\u062F \u0627\u0644\u0633\u0631\u064A\u0639 \u064A\u0643\u0633\u0628\u0627\u0646\u0647.", "\u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0639\u0627\u0626\u062F \u0623\u0642\u0644 \u062A\u0643\u0644\u0641\u0629. \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u062A\u0648\u0641\u0631 \u0648\u0642\u062A\u0643.", "\u0627\u0644\u0646\u0645\u0648 \u0627\u0644\u0630\u064A \u062A\u0642\u064A\u0633\u0647 \u0646\u0645\u0648 \u064A\u0645\u0643\u0646\u0643 \u062A\u0643\u0631\u0627\u0631\u0647."], overall: "\u0627\u0644\u062A\u0642\u062F\u0645 \u0627\u0644\u0639\u0627\u0645", of: (a, b) => `${a} \u0645\u0646 ${b} \u0645\u0647\u0627\u0645`, verified: "\u0625\u0646\u062C\u0627\u0632\u0627\u062A \u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627", stageOf: (i) => `\u0627\u0644\u0645\u0631\u062D\u0644\u0629 ${i} \u0645\u0646 5`, done: "\u0645\u0643\u062A\u0645\u0644\u0629", current: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", upcoming: "\u0642\u0627\u062F\u0645\u0629", empty: "\u0644\u0627 \u0645\u0647\u0627\u0645 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0644\u0646\u0634\u0627\u0637\u0643.", objective: "\u0627\u0644\u0647\u062F\u0641", completed: "\u0627\u0644\u0645\u0643\u062A\u0645\u0644", remaining: "\u0627\u0644\u0645\u062A\u0628\u0642\u064A", recommended: "\u064A\u0645\u0643\u0646 \u0644\u0640AuraDigital \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629", examples: "\u0623\u0639\u0645\u0627\u0644 \u062D\u0642\u064A\u0642\u064A\u0629 \u0645\u0646 AuraDigital", effort: "\u0627\u0644\u062C\u0647\u062F \u0627\u0644\u0645\u0642\u062F\u0651\u0631", next: "\u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629", progress: "\u062A\u0642\u062F\u0645 \u0627\u0644\u0645\u0631\u062D\u0644\u0629", effortLevels: { done: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0645\u0643\u062A\u0645\u0644\u0629", light: "\u062E\u0641\u064A\u0641 \u2014 1\u20132 \u0645\u0647\u0627\u0645 \u0645\u062A\u0628\u0642\u064A\u0629", moderate: "\u0645\u062A\u0648\u0633\u0637 \u2014 3\u20134 \u0645\u0647\u0627\u0645 \u0645\u062A\u0628\u0642\u064A\u0629", heavy: "\u0643\u0628\u064A\u0631 \u2014 5 \u0645\u0647\u0627\u0645 \u0623\u0648 \u0623\u0643\u062B\u0631" }, effortNote: "\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629. \u062A\u064F\u0624\u0643\u064E\u0651\u062F \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0641\u064A \u0643\u0644 \u0639\u0631\u0636 \u0633\u0639\u0631.", optional: "\u0627\u062E\u062A\u064A\u0627\u0631\u064A", diy: "\u064A\u0645\u0643\u0646\u0643 \u062A\u0646\u0641\u064A\u0630 \u0643\u0644 \u062E\u0637\u0648\u0629 \u0628\u0646\u0641\u0633\u0643 \u2014 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629.", request: "\u0627\u0637\u0644\u0628", view: "\u0645\u0627 \u0627\u0644\u0630\u064A \u0633\u062A\u062D\u0635\u0644 \u0639\u0644\u064A\u0647", openTask: "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0647\u0645\u0629", noneDone: "\u0644\u0627 \u0634\u064A\u0621 \u0645\u0643\u062A\u0645\u0644 \u0647\u0646\u0627 \u0628\u0639\u062F.", allDone: "\u0643\u0644 \u0627\u0644\u0645\u0647\u0627\u0645 \u0647\u0646\u0627 \u0645\u0643\u062A\u0645\u0644\u0629.", askStage: "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A \u0639\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629", explainTitle: "\u0623\u0648\u0631\u064A \u0639\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629", explain: { matters: "\u0644\u0645\u0627\u0630\u0627 \u062A\u0647\u0645", did: "\u0645\u0627 \u0623\u0646\u062C\u0632\u062A\u0647", doNext: "\u0645\u0627\u0630\u0627 \u062A\u0641\u0639\u0644 \u0628\u0639\u062F \u0630\u0644\u0643", help: "\u0623\u064A\u0646 \u062A\u0633\u0627\u0639\u062F AuraDigital", optional: "\u0647\u0644 \u0647\u064A \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629\u061F" }, didNone: "\u0644\u0645 \u062A\u0643\u062A\u0645\u0644 \u0623\u064A \u0645\u0647\u0645\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0628\u0639\u062F.", didSome: (n, list) => `${n} \u0645\u0643\u062A\u0645\u0644\u0629: ${list}.`, nextNone: "\u0644\u0627 \u0634\u064A\u0621 \u0645\u062A\u0628\u0642\u064D \u0647\u0646\u0627 \u2014 \u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629.", helpNone: "\u0644\u0627 \u062D\u0627\u062C\u0629 \u0644\u062E\u062F\u0645\u0629 \u0645\u0646 AuraDigital \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629.", helpSome: (list) => `${list}. \u0643\u0644 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629\u061B \u064A\u0645\u0643\u0646\u0643 \u0627\u062A\u0628\u0627\u0639 \u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0628\u0646\u0641\u0633\u0643.`, optYes: "\u062A\u062A\u0636\u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0645\u0647\u0627\u0645 \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629 \u064A\u0645\u0643\u0646\u0643 \u062A\u062E\u0637\u064A\u0647\u0627.", optNo: "\u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0627\u0645 \u062C\u0632\u0621 \u0645\u0646 \u062E\u0637\u062A\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629\u060C \u0648\u0623\u0646\u062A \u062A\u062E\u062A\u0627\u0631 \u0645\u0646 \u064A\u0646\u0641\u0630\u0647\u0627.", taskDetail: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0647\u0645\u0629", stagesLabel: "\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0646\u0645\u0648", inReview: "\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629", locked: "\u0642\u0627\u062F\u0645\u0629" },
  studio: { title: "Aura Studio", intro: "\u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u064A\u0627\u062A\u0643: \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644.", tabs: { pipeline: "\u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", delivery: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645", website: "\u0627\u0644\u0645\u0648\u0642\u0639", menu: "AuraMenu", inbox: "\u0627\u0644\u0648\u0627\u0631\u062F", analytics: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A" }, readOnly: "\u064A\u0645\u0643\u0646\u0643 \u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u062D\u0629. \u0627\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0645\u0627\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u062A\u0639\u062F\u064A\u0644.", pipeline: { add: "\u0623\u0636\u0641 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u064B\u0627", search: "\u0627\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A", allSources: "\u0643\u0644 \u0627\u0644\u0645\u0635\u0627\u062F\u0631", allPeople: "\u0627\u0644\u062C\u0645\u064A\u0639", unassigned: "\u063A\u064A\u0631 \u0645\u064F\u0633\u0646\u062F", empty: "\u0644\u0627 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0628\u0639\u062F", emptyText: "\u0633\u062C\u0651\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0645\u0646 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A \u0648\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A. \u0627\u0644\u0627\u0644\u062A\u0642\u0627\u0637 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0645\u0646 \u0645\u0648\u0642\u0639\u0643 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u0628\u0639\u062F.", none: "\u0644\u0627 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u062A\u0637\u0627\u0628\u0642 \u0627\u0644\u062A\u0635\u0641\u064A\u0629.", stageEmpty: "\u0641\u0627\u0631\u063A", count: (n) => n === 1 ? "\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0648\u0627\u062D\u062F" : n === 2 ? "\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u0646" : `${n} \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A`, value: "\u0627\u0644\u0642\u064A\u0645\u0629", configure: "\u0639\u062F\u0651\u0644 \u0627\u0644\u0645\u0631\u0627\u062D\u0644", archived: "\u0627\u0644\u0645\u0624\u0631\u0634\u0641\u0629", showArchived: "\u0627\u0639\u0631\u0636 \u0627\u0644\u0623\u0631\u0634\u064A\u0641", hideArchived: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u0627\u0631", moveTo: "\u0627\u0646\u0642\u0644 \u0625\u0644\u0649", archive: "\u0623\u0631\u0634\u0641\u0629", restore: "\u0627\u0633\u062A\u0639\u0627\u062F\u0629", confirmArchive: "\u0623\u0631\u0634\u0641\u0629 \u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u061F \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u0639\u0627\u062F\u062A\u0647 \u0644\u0627\u062D\u0642\u064B\u0627." }, lead: { name: "\u0627\u0644\u0627\u0633\u0645", contact: "\u0627\u0644\u0647\u0627\u062A\u0641 \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F", source: "\u0627\u0644\u0645\u0635\u062F\u0631", interest: "\u0645\u0647\u062A\u0645 \u0628\u0640", value: "\u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0631\u064A\u0629", stage: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629", assignee: "\u0627\u0644\u0645\u0633\u0624\u0648\u0644", note: "\u0645\u0644\u0627\u062D\u0638\u0629", notes: "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A", addNote: "\u0623\u0636\u0641 \u0645\u0644\u0627\u062D\u0638\u0629", save: "\u062D\u0641\u0638", cancel: "\u0625\u0644\u063A\u0627\u0621", create: "\u0623\u0636\u0641", saved: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638", noNotes: "\u0644\u0627 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0628\u0639\u062F.", created: "\u0623\u064F\u0646\u0634\u0626", updated: "\u062D\u064F\u062F\u0651\u062B", close: "\u0625\u063A\u0644\u0627\u0642" }, sources: { website: "\u0627\u0644\u0645\u0648\u0642\u0639", phone: "\u0627\u0644\u0647\u0627\u062A\u0641", whatsapp: "\u0648\u0627\u062A\u0633\u0627\u0628", instagram: "\u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645", email: "\u0627\u0644\u0628\u0631\u064A\u062F", walk_in: "\u0632\u064A\u0627\u0631\u0629", referral: "\u062A\u0648\u0635\u064A\u0629", other: "\u0623\u062E\u0631\u0649" }, stagesEditor: { title: "\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0645\u0633\u0627\u0631", hint: "\u0623\u0639\u062F \u0627\u0644\u062A\u0633\u0645\u064A\u0629 \u0623\u0648 \u0623\u0636\u0641 \u0623\u0648 \u0627\u062D\u0630\u0641 \u0627\u0644\u0645\u0631\u0627\u062D\u0644. \u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u0630\u0641 \u0645\u0631\u062D\u0644\u0629 \u0641\u064A\u0647\u0627 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A.", add: "\u0623\u0636\u0641 \u0645\u0631\u062D\u0644\u0629", remove: "\u0627\u062D\u0630\u0641", save: "\u0627\u062D\u0641\u0638 \u0627\u0644\u0645\u0631\u0627\u062D\u0644", name: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u062D\u0644\u0629" }, delivery: { active: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629", completed: "\u0627\u0644\u0645\u0643\u062A\u0645\u0644\u0629", deadlines: "\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0642\u0627\u062F\u0645\u0629", approvals: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0645\u0648\u0627\u0641\u0642\u062A\u0643", revisions: "\u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629", messages: "\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621", none: "\u0644\u0627 \u0634\u064A\u0621 \u0627\u0644\u0622\u0646.", revisionsNone: "\u0644\u0627 \u062A\u0639\u062F\u064A\u0644\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629. \u0644\u0637\u0644\u0628 \u062A\u063A\u064A\u064A\u0631 \u0623\u0631\u0633\u0644 \u0637\u0644\u0628\u064B\u0627 \u0644\u0644\u0641\u0631\u064A\u0642.", messagesNone: "\u062A\u062A\u0645 \u0627\u0644\u0645\u0631\u0627\u0633\u0644\u0627\u062A \u0645\u0639 \u0641\u0631\u064A\u0642 AuraDigital \u0639\u0628\u0631 \u0637\u0644\u0628\u0627\u062A\u0643.", requestChange: "\u0627\u0637\u0644\u0628 \u062A\u0639\u062F\u064A\u0644\u064B\u0627", reviewMenu: "\u0631\u0627\u062C\u0639 \u0627\u0644\u0642\u0627\u0626\u0645\u0629", open: "\u0627\u0641\u062A\u062D", overdue: "\u0645\u062A\u0623\u062E\u0631" }, website: { title: "\u0645\u0648\u0642\u0639\u0643", preview: "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0628\u0627\u0634\u0631", domain: "\u0627\u0644\u0646\u0637\u0627\u0642", status: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0646\u0634\u0631", published: "\u0645\u0646\u0634\u0648\u0631", inProgress: "\u0642\u064A\u062F \u0627\u0644\u0625\u0639\u062F\u0627\u062F", unknown: "\u0627\u0644\u062D\u0627\u0644\u0629 \u063A\u064A\u0631 \u0645\u062A\u062A\u0628\u0639\u0629", actions: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u062D\u062A\u0648\u0649", change: "\u0627\u0637\u0644\u0628 \u062A\u0639\u062F\u064A\u0644 \u0645\u062D\u062A\u0648\u0649", newPage: "\u0627\u0637\u0644\u0628 \u0635\u0641\u062D\u0629 \u062C\u062F\u064A\u062F\u0629", seo: "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0627\u0644\u0638\u0647\u0648\u0631 \u0641\u064A Google", none: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0648\u0642\u0639 \u0645\u0631\u062A\u0628\u0637 \u0628\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637", noneText: "\u0623\u0636\u0641 \u0645\u0648\u0642\u0639\u0643 \u0625\u0644\u0649 \u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637 \u0623\u0648 \u0627\u0637\u0644\u0628 \u0645\u0646 AuraDigital \u0628\u0646\u0627\u0621\u0647.", addSite: "\u0623\u0636\u0641 \u0625\u0644\u0649 \u0627\u0644\u0645\u0644\u0641", build: "\u0627\u0637\u0644\u0628 \u0645\u0648\u0642\u0639\u064B\u0627", secure: "HTTPS", notOwned: "\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0641\u0642\u0637 \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637." }, menu: { unavailable: "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F. \u064A\u0645\u0643\u0646 \u0644\u0640AuraDigital \u0625\u0639\u062F\u0627\u062F \u0642\u0627\u0626\u0645\u062A\u0643 \u0644\u0643.", title: "AuraMenu", drafts: "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645", open: "\u0627\u0641\u062A\u062D \u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645", live: "\u0642\u0648\u0627\u0626\u0645 \u0644\u062F\u0649 AuraDigital", none: "\u0644\u0627 \u062A\u0648\u062C\u062F AuraMenu \u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0647\u0630\u0627 \u0627\u0644\u0646\u0634\u0627\u0637", noneText: "\u0627\u0628\u062F\u0623 \u0645\u0633\u0648\u062F\u0629 \u0642\u0627\u0626\u0645\u0629 \u062E\u0627\u0635\u0629 \u0623\u0648 \u0627\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0641\u0631\u064A\u0642 \u0625\u0639\u062F\u0627\u062F\u0647\u0627.", start: "\u0627\u0628\u062F\u0623 \u0645\u0633\u0648\u062F\u0629 \u0642\u0627\u0626\u0645\u0629", request: "\u0627\u0637\u0644\u0628 AuraMenu", manage: "\u0627\u0641\u062A\u062D", notRestaurant: "\u0635\u064F\u0645\u0645\u062A AuraMenu \u0644\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0645\u0642\u0627\u0647\u064A." }, inbox: { title: "\u0627\u0644\u0648\u0627\u0631\u062F", lead: "\u0645\u062D\u0627\u062F\u062B\u0627\u062A\u0643 \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F \u2014 \u0645\u0646 \u0627\u0644\u0642\u0646\u0648\u0627\u062A \u0627\u0644\u0645\u062A\u0635\u0644\u0629 \u0641\u0639\u0644\u064B\u0627 \u0641\u0642\u0637.", channels: "\u0627\u0644\u0642\u0646\u0648\u0627\u062A", notConnected: "\u063A\u064A\u0631 \u0645\u062A\u0635\u0644", connected: "\u0645\u062A\u0635\u0644", connectHint: "\u0627\u0637\u0644\u0628 \u0645\u0646 AuraDigital \u0631\u0628\u0637 \u0647\u0630\u0647 \u0627\u0644\u0642\u0646\u0627\u0629.", fromPipeline: "\u0622\u062E\u0631 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A", empty: "\u0644\u0627 \u0645\u062D\u0627\u062F\u062B\u0627\u062A \u0628\u0639\u062F.", auri: "\u0645\u062D\u0627\u062F\u062B\u0629 \u0623\u0648\u0631\u064A", teamRequests: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0625\u0644\u0649 AuraDigital" }, analytics: { title: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", lead: "\u0623\u0631\u0642\u0627\u0645 \u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627 \u0641\u0642\u0637\u060C \u0645\u0639 \u0645\u0635\u062F\u0631\u0647\u0627 \u0648\u0641\u062A\u0631\u062A\u0647\u0627.", range: "\u0622\u062E\u0631 30 \u064A\u0648\u0645\u064B\u0627", pipeline: "\u0627\u0644\u0645\u0633\u0627\u0631", bySource: "\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0645\u0635\u062F\u0631", byStage: "\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0648\u062D\u0629 \u062D\u0633\u0628 \u0627\u0644\u0645\u0631\u062D\u0644\u0629", won: "\u0627\u0644\u0645\u0643\u0633\u0648\u0628\u0629", conversion: "\u0646\u0633\u0628\u0629 \u0627\u0644\u0643\u0633\u0628", roadmap: "\u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u062E\u0637\u0629", services: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", site: "\u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639", siteNone: "\u062A\u062D\u0644\u064A\u0644\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644\u0629. \u0633\u062A\u0638\u0647\u0631 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0628\u0639\u062F \u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062A\u062A\u0628\u0639 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646\u0647.", srcLeads: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0645\u0633\u0627\u0631 Aura Studio (\u0625\u062F\u062E\u0627\u0644\u0627\u062A \u0641\u0631\u064A\u0642\u0643)", srcRoadmap: "\u0627\u0644\u0645\u0635\u062F\u0631: \u062E\u0627\u0631\u0637\u0629 \u0646\u0645\u0648\u0643", srcServices: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0633\u062C\u0644\u0627\u062A \u062E\u062F\u0645\u0627\u062A AuraDigital", noLeads: "\u0633\u062C\u0651\u0644 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0644\u0631\u0624\u064A\u0629 \u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u062D\u0648\u064A\u0644." } },
  state: { skip: "\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u062D\u062A\u0648\u0649", loading: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026", error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645.", retry: "\u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629", offline: "\u064A\u0628\u062F\u0648 \u0623\u0646\u0643 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0648\u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627.", timeout: "\u0627\u0633\u062A\u063A\u0631\u0642 \u0627\u0644\u062E\u0627\u062F\u0645 \u0648\u0642\u062A\u064B\u0627 \u0637\u0648\u064A\u0644\u064B\u0627 \u0644\u0644\u0631\u062F." }
};
var ALL = { en: EN, tr: TR, fr: FR, ar: AR };
var merge = (base, over) => {
  if (over === void 0) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base) || typeof base === "function") return over;
  const out = {};
  for (const key of Object.keys(base)) out[key] = merge(base[key], over?.[key]);
  return out;
};
var cache = {};
var osCopy = (lang2) => cache[lang2] ||= merge(EN, ALL[lang2] || EN);

// src/hub/os-ui.js
var P = {
  overview: "M4 4h7v7H4z M13 4h7v4h-7z M13 10h7v10h-7z M4 13h7v7H4z",
  business: "M4 9.5 5.5 4h13L20 9.5 M4 9.5h16 M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0 M5.5 12v8h13v-8 M10 20v-5h4v5",
  journey: "M4 20c3-1 4-4 7-4s4 2 6 1 2-4 3-5 M4 20V4 M17 4l3 2-3 2z M20 4v6",
  studio: "M4 4h4v16H4z M10 4h4v10h-4z M16 4h4v7h-4z",
  services: "M3 8h18v12H3z M8 8V5h8v3 M3 13h18 M11 13v2h2v-2",
  site: "M3 5h18v14H3z M3 9h18 M6 7h.01 M9 7h.01",
  analytics: "M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16v-6 M20 16V6",
  auri: "M12 3l1.9 4.6L19 9l-4 3.4 1.2 5.1L12 15l-4.2 2.5L9 12.4 5 9l5.1-1.4z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  requests: "M4 13l2-8h12l2 8 M4 13v6h16v-6 M4 13h5l1 2h4l1-2h5",
  menuDrafts: "M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4",
  orders: "M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6",
  team: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21v-1a7 7 0 0 1 14 0v1 M17 11a3 3 0 1 0 0-6 M22 21v-1a5 5 0 0 0-4-5",
  plus: "M12 5v14 M5 12h14",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  alert: "M12 3 2 20h20z M12 10v4 M12 17h.01",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4",
  note: "M5 4h14v12l-4 4H5z M15 20v-4h4 M8 9h8 M8 13h5",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0",
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  lock: "M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  plug: "M9 3v5 M15 3v5 M6 8h12v3a6 6 0 0 1-12 0z M12 17v4",
  chat: "M4 5h16v11H9l-5 4z",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z",
  menu: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M14 14h2v2h-2z M18 18h2v2h-2z M18 13v2 M13 18h2",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  close: "M6 6l12 12 M18 6 6 18",
  calendar: "M4 6h16v15H4z M4 10h16 M8 3v4 M16 3v4",
  spark: "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5 18 18 M6 18l2.5-2.5 M15.5 8.5 18 6",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  filter: "M4 5h16l-6 8v6l-4-2v-4z",
  archive: "M3 4h18v4H3z M5 8v12h14V8 M10 12h4",
  instagram: "M4 4h16v16H4z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M17 7h.01",
  whatsapp: "M4 20l1.4-4A8 8 0 1 1 8 18.7z M9 9.5c.5 2 2 3.6 4 4.4l1.2-1.1 2 1-.5 1.6c-3.3.2-7-3.3-7-6.7L10 8l1 2z"
};
var icon2 = (name, size = 18) => `<svg class="os-i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name] || P.overview}"/></svg>`;
var parseDate = (value) => {
  if (!value) return null;
  const text = String(value);
  const d = new Date(/T|Z|[+-]\d\d:?\d\d$/.test(text) ? text : text.replace(" ", "T") + (text.length > 10 ? "Z" : "T00:00:00Z"));
  return Number.isFinite(d.getTime()) ? d : null;
};
var shortDate = (lang2, value) => {
  const d = parseDate(value);
  return d ? d.toLocaleDateString(lang2, { day: "numeric", month: "short" }) : "";
};
var relative = (lang2, value) => {
  const d = parseDate(value);
  if (!d) return "";
  const diff = (d.getTime() - Date.now()) / 1e3;
  const rtf = new Intl.RelativeTimeFormat(lang2, { numeric: "auto" });
  for (const [unit, size] of [["year", 31536e3], ["month", 2592e3], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
    if (Math.abs(diff) >= size) return rtf.format(Math.round(diff / size), unit);
  }
  return rtf.format(0, "minute");
};
var number = (lang2, value) => new Intl.NumberFormat(lang2).format(Number(value || 0));
var money3 = (lang2, amount, currency = "TRY") => {
  try {
    return new Intl.NumberFormat(lang2, { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount || 0));
  } catch {
    return number(lang2, amount) + " " + currency;
  }
};
function deliveryStage(status) {
  const s = String(status || "").toLowerCase();
  if (/approved|active|completed|delivered|live|paid|done/.test(s)) return 3;
  if (/production|progress|in-progress|scheduled|revision/.test(s)) return 2;
  if (/review|waiting|quote|pending|contacted|ready/.test(s)) return 1;
  return 0;
}
var TONE2 = {
  approved: "good",
  paid: "good",
  active: "good",
  completed: "good",
  delivered: "good",
  done: "good",
  won: "good",
  rejected: "bad",
  overdue: "bad",
  cancelled: "bad",
  unpaid: "warn",
  sent: "warn",
  pending: "warn",
  awaiting_transfer: "warn",
  waiting: "warn",
  waiting_client: "warn",
  review: "warn",
  quote_ready: "warn",
  in_production: "info",
  "in-progress": "info",
  in_progress: "info",
  production: "info"
};
var pill = (label, tone = "", esc3) => `<span class="os-pill ${tone ? "is-" + tone : ""}">${esc3(label)}</span>`;
function emptyState({ esc: esc3, iconName = "spark", title, text, actions: actions2 = "", tone = "" }) {
  return `<div class="os-empty ${tone ? "is-" + tone : ""}"><span class="os-empty-icon">${icon2(iconName, 22)}</span><div><strong>${esc3(title)}</strong>${text ? `<p>${esc3(text)}</p>` : ""}${actions2 ? `<div class="os-empty-actions">${actions2}</div>` : ""}</div></div>`;
}
var loading = (label, esc3) => `<div class="os-loading" role="status"><span class="os-spinner" aria-hidden="true"></span><span>${esc3(label)}</span></div>`;
function barChart({ esc: esc3, buckets, label, valueLabel, lang: lang2 }) {
  const max = Math.max(1, ...buckets.map((b) => b.value));
  const w = 640, h = 180, pad = 26, gap = buckets.length > 20 ? 3 : 8;
  const bw = Math.max(4, (w - pad * 2 - gap * (buckets.length - 1)) / buckets.length);
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  const y = (v) => h - pad - v / max * (h - pad * 2);
  const every = Math.ceil(buckets.length / 6);
  return `<figure class="os-chart"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc3(label)}" preserveAspectRatio="none">
  ${ticks.map((v) => `<line x1="${pad}" x2="${w - pad}" y1="${y(v)}" y2="${y(v)}" class="os-chart-grid"/><text x="${pad - 8}" y="${y(v) + 4}" class="os-chart-tick" text-anchor="end">${v}</text>`).join("")}
  ${buckets.map((b, i) => {
    const x = pad + i * (bw + gap);
    return `<rect class="os-chart-bar${b.value ? "" : " is-zero"}" x="${x.toFixed(1)}" y="${y(b.value).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(b.value ? 2 : 1, h - pad - y(b.value)).toFixed(1)}" rx="3"><title>${esc3(b.label)}: ${b.value}</title></rect>${i % every === 0 ? `<text x="${(x + bw / 2).toFixed(1)}" y="${h - 6}" class="os-chart-tick" text-anchor="middle">${esc3(b.short)}</text>` : ""}`;
  }).join("")}
 </svg><table class="sr-only"><caption>${esc3(label)}</caption><thead><tr><th scope="col">${esc3(label)}</th><th scope="col">${esc3(valueLabel)}</th></tr></thead><tbody>${buckets.map((b) => `<tr><th scope="row">${esc3(b.label)}</th><td>${number(lang2, b.value)}</td></tr>`).join("")}</tbody></table></figure>`;
}
function bucketize(dates, range, lang2) {
  const now = /* @__PURE__ */ new Date();
  const out = [];
  if (range === "12m") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({ start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 1), short: d.toLocaleDateString(lang2, { month: "short" }), label: d.toLocaleDateString(lang2, { month: "long", year: "numeric" }), value: 0 });
    }
  } else {
    const days = range === "90d" ? 90 : 30, size = range === "90d" ? 7 : 1;
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    for (let i = Math.ceil(days / size) - 1; i >= 0; i--) {
      const e = new Date(end.getTime() - i * size * 864e5), s = new Date(e.getTime() - size * 864e5);
      out.push({ start: s, end: e, short: s.toLocaleDateString(lang2, { day: "numeric", month: "short" }), label: s.toLocaleDateString(lang2, { day: "numeric", month: "long" }) + (size > 1 ? " +7" : ""), value: 0 });
    }
  }
  for (const value of dates) {
    const d = parseDate(value);
    if (!d) continue;
    const bucket = out.find((b) => d >= b.start && d < b.end);
    if (bucket) bucket.value++;
  }
  return out;
}
var ART = [
  // Launch: a storefront opening with a rising flag
  `<rect x="34" y="58" width="92" height="56" rx="6" class="a-wall"/><path d="M28 58l10-22h84l10 22z" class="a-roof"/><path d="M28 58h104v8c-6 6-14 6-17 0-3 6-11 6-17 0-3 6-11 6-17 0-3 6-11 6-17 0-3 6-11 6-17 0-3 6-13 6-19 0z" class="a-awning"/><rect x="70" y="80" width="22" height="34" rx="3" class="a-door"/><rect x="44" y="78" width="18" height="14" rx="2" class="a-glass"/><rect x="100" y="78" width="18" height="14" rx="2" class="a-glass"/><path d="M80 36V14" class="a-line"/><path d="M80 14h20l-5 6 5 6H80" class="a-flag"/><circle cx="130" cy="24" r="4" class="a-spark"/>`,
  // Get Found: a map with a pin and a search lens
  `<path d="M22 44l36-12 40 12 40-12v74l-40 12-40-12-36 12z" class="a-map"/><path d="M58 32v74 M98 44v74" class="a-fold"/><path d="M80 30c-11 0-19 8-19 18 0 14 19 32 19 32s19-18 19-32c0-10-8-18-19-18z" class="a-pin"/><circle cx="80" cy="48" r="7" class="a-door"/><circle cx="118" cy="88" r="13" class="a-lens"/><path d="M127 97l12 12" class="a-line"/>`,
  // Convert: a chat bubble becoming a confirmed booking
  `<rect x="22" y="34" width="70" height="44" rx="12" class="a-wall"/><path d="M38 78l-6 14 18-14" class="a-wall"/><path d="M36 52h42 M36 62h28" class="a-fold"/><rect x="74" y="62" width="64" height="50" rx="10" class="a-card"/><path d="M74 76h64" class="a-fold"/><circle cx="106" cy="94" r="11" class="a-pin"/><path d="M101 94l4 4 7-8" class="a-check"/>`,
  // Grow: bars rising with a sprout
  `<path d="M24 116h116" class="a-line"/><rect x="34" y="84" width="18" height="32" rx="4" class="a-glass"/><rect x="60" y="68" width="18" height="48" rx="4" class="a-wall"/><rect x="86" y="52" width="18" height="64" rx="4" class="a-awning"/><path d="M122 116V70" class="a-line"/><path d="M122 84c-14 0-18-12-18-20 12 0 18 6 18 20z" class="a-leaf"/><path d="M122 74c0-14 8-22 20-22 0 12-8 22-20 22z" class="a-leaf"/><path d="M30 60l30-14 26 6 34-26" class="a-trend"/><circle cx="120" cy="26" r="4" class="a-spark"/>`,
  // Scale: connected locations network
  `<path d="M80 66L40 40 M80 66l42-28 M80 66l-36 40 M80 66l40 38" class="a-fold"/><circle cx="80" cy="66" r="18" class="a-pin"/><path d="M72 66h16 M80 58v16" class="a-check"/><rect x="26" y="28" width="28" height="24" rx="6" class="a-wall"/><rect x="108" y="26" width="28" height="24" rx="6" class="a-awning"/><rect x="30" y="96" width="28" height="22" rx="6" class="a-glass"/><rect x="106" y="94" width="28" height="22" rx="6" class="a-wall"/><circle cx="140" cy="76" r="4" class="a-spark"/>`
];
var stageArt = (index) => `<svg class="os-stage-art" viewBox="0 0 160 130" aria-hidden="true" focusable="false">${ART[index] || ART[0]}</svg>`;

// src/hub/aura-command.js
var TERMINAL = /^(completed|cancelled|canceled|rejected|delivered)$/;
var chartRange = "30d";
var chartMetric = "inquiries";
function bookingLabel(c, industry) {
  return industry === "restaurant" ? c.kpi.reservations : industry === "services" ? c.kpi.appointments : industry === "real_estate" ? c.kpi.viewings : c.kpi.bookings;
}
function serviceItems({ snapshot, connected, link: link2, lang: lang2 }) {
  const d = dashCopy(lang2), seen = /* @__PURE__ */ new Set(), items = [];
  const add = (item) => {
    const key = item.kind + ":" + item.id;
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  };
  for (const r of snapshot?.records || []) add({ kind: r.kind, id: String(r.id), title: r.name, status: r.status, due: r.dueDate, renews: r.renewalDate, at: r.createdAt, href: link2("services", { serviceRecord: r.key }) });
  for (const o of connected?.orders || []) add({ kind: "order", id: String(o.id), title: o.type || d.kinds.order, status: o.status, due: o.dueDate, at: o.createdAt, href: link2("services") });
  for (const s of connected?.subscriptions || []) add({ kind: "subscription", id: String(s.id), title: s.plan || d.kinds.subscription, status: s.status, renews: s.nextBillingDate, at: s.createdAt, href: link2("services") });
  for (const r of connected?.requests || []) add({ kind: r.kind, id: String(r.id), title: r.name || d.kinds[r.kind], meta: d.kinds[r.kind], status: r.status, at: r.updatedAt || r.createdAt, slug: r.slug, href: link2("services") });
  return items.map((item) => ({ ...item, stage: deliveryStage(item.status), terminal: TERMINAL.test(String(item.status || "")) }));
}
function activityEvents({ leads = [], workspace: workspace2, snapshot, connected, missionTitle: missionTitle2, link: link2, c }) {
  const events = [];
  for (const l of leads) events.push({ at: l.createdAt, text: c.activity.lead(l.name), icon: "user", href: link2("studio", { view: "pipeline", lead: l.id }) });
  for (const m of workspace2.missions || []) if (m.status === "done" && m.completedAt) events.push({ at: m.completedAt, text: c.activity.mission(missionTitle2(m)), icon: "check", href: link2("journey", { task: m.id }) });
  for (const r of snapshot?.requests || []) events.push({ at: r.createdAt, text: c.activity.request(r.name), icon: "requests", href: link2("requests", { request: r.id }) });
  for (const r of connected?.requests || []) events.push({ at: r.updatedAt || r.createdAt, text: c.activity.record(r.name), icon: "services", href: link2("services") });
  for (const o of connected?.orders || []) events.push({ at: o.createdAt, text: c.activity.record(o.type), icon: "orders", href: link2("services") });
  return events.filter((e) => parseDate(e.at)).sort((a, b) => parseDate(b.at) - parseDate(a.at));
}
var within = (value, from, to) => {
  const d = parseDate(value);
  return d && d >= from && d < to;
};
function renderAuraCommand({ host, lang: lang2, esc: esc3, link: link2, requestLink: requestLink2, me: me2, workspace: workspace2, snapshot, connected, leads, missionTitle: missionTitle2, next, eligible = [], continueLabel, attention, canAsk, canRequest, onAsk, onPrepare }) {
  const c = osCopy(lang2), d = dashCopy(lang2);
  const profile = workspace2.profile || {};
  const perms = workspace2.permissions || [];
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const part = hour < 12 ? c.greet.morning : hour < 18 ? c.greet.afternoon : c.greet.evening;
  const first = String(me2.name || "").trim().split(/\s+/)[0];
  const items = serviceItems({ snapshot, connected, link: link2, lang: lang2 });
  const active = items.filter((i) => !i.terminal);
  const live = active.filter((i) => i.stage === 3);
  const hasWebsite = Boolean(profile.website) || (connected?.requests || []).some((r) => r.kind === "quicksite") || items.some((i) => /web|site/i.test(i.title || ""));
  const hasMenu = profile.industry === "restaurant" || (connected?.requests || []).some((r) => r.kind === "auramenu") || (snapshot?.attention || []).some((r) => r.kind === "menu") || (workspace2.missions || []).some((m) => m.capability === "menu");
  const leadList = leads?.all || [];
  const now = /* @__PURE__ */ new Date(), d30 = new Date(now - 30 * 864e5), d60 = new Date(now - 60 * 864e5);
  const inquiries30 = leadList.filter((l) => within(l.createdAt, d30, new Date(now.getTime() + 6e4))).length;
  const inquiriesPrev = leadList.filter((l) => within(l.createdAt, d60, d30)).length;
  const quick = [
    canRequest && { label: c.quick.request, icon: "plus", href: requestLink2(), primary: true },
    canRequest && hasWebsite && { label: c.quick.website, icon: "site", href: link2("studio", { view: "website" }) },
    hasMenu && { label: c.quick.menu, icon: "menu", href: link2("studio", { view: "menu" }) },
    (workspace2.missions || []).length && { label: c.quick.roadmap, icon: "journey", href: link2("journey") },
    canAsk && { label: c.quick.ask, icon: "auri", ask: true }
  ].filter(Boolean);
  const kpi = ({ key, label, value, foot, source, setup, action, tone }) => `<article class="os-kpi${setup ? " is-setup" : ""}" data-kpi="${key}">
  <header><span class="os-kpi-icon">${icon2(key === "visitors" ? "globe" : key === "inquiries" ? "chat" : key === "bookings" ? "calendar" : "services")}</span><h2>${esc3(label)}</h2></header>
  ${setup ? `<p class="os-kpi-setup"><span class="os-dot" aria-hidden="true"></span>${esc3(c.kpi.notConnected)}</p><p class="os-kpi-note">${esc3(setup)}</p>${action || ""}` : `<p class="os-kpi-value">${esc3(value)}</p><p class="os-kpi-foot ${tone ? "is-" + tone : ""}">${esc3(foot)}</p>`}
  <p class="os-source">${esc3(source)}</p></article>`;
  const leadsAvailable = Array.isArray(leads?.all);
  const kpis = [
    kpi({
      key: "visitors",
      label: c.kpi.visitors,
      setup: c.kpi.visitorsSetup,
      source: c.kpi.srcNone,
      action: canRequest ? `<a class="os-link" href="${esc3(requestLink2("Web Design"))}">${esc3(c.kpi.connect)} ${icon2("arrow", 14)}</a>` : ""
    }),
    leadsAvailable && (leadList.length || !canRequest) ? kpi({ key: "inquiries", label: c.kpi.inquiries, value: number(lang2, inquiries30), foot: leadList.length ? c.kpi.delta(inquiries30 - inquiriesPrev) : c.kpi.none, tone: inquiries30 > inquiriesPrev ? "up" : "", source: c.kpi.srcLeads + " \xB7 " + c.kpi.last30 }) : kpi({
      key: "inquiries",
      label: c.kpi.inquiries,
      setup: leadsAvailable ? c.kpi.inquiriesSetup : c.state.error,
      source: c.kpi.srcLeads,
      action: `<a class="os-link" href="${esc3(link2("studio", { view: "pipeline", new: "1" }))}">${esc3(c.kpi.logLead)} ${icon2("arrow", 14)}</a>`
    }),
    kpi({
      key: "bookings",
      label: bookingLabel(c, profile.industry),
      setup: c.kpi.bookingsSetup,
      source: c.kpi.srcNone,
      action: canAsk ? `<button type="button" class="os-link" data-os-ask="bookings">${esc3(c.kpi.explore)} ${icon2("arrow", 14)}</button>` : ""
    }),
    active.length ? kpi({ key: "services", label: c.kpi.services, value: number(lang2, active.length), foot: `${number(lang2, live.length)} \xB7 ${c.kpi.live}`, source: c.kpi.srcServices }) : kpi({
      key: "services",
      label: c.kpi.services,
      setup: c.kpi.servicesSetup,
      source: c.kpi.srcServices,
      action: `<a class="os-link" href="${esc3(link2("services"))}">${esc3(c.kpi.browse)} ${icon2("arrow", 14)}</a>`
    })
  ].join("");
  const events = activityEvents({ leads: leadList, workspace: workspace2, snapshot, connected, missionTitle: missionTitle2, link: link2, c }).slice(0, 7);
  const nextList = [
    ...attention ? [{ attention: true, title: attention.name, label: attention.label, href: attention.href }] : [],
    ...eligible.slice(0, attention ? 2 : 3).map((m) => ({ mission: m, title: missionTitle2(m), why: missionGuide[m.capability]?.[1] || m.reason || "", href: link2("journey", { task: m.id }), service: missionGuide[m.capability]?.[0] }))
  ];
  const auriLine = attention ? c.auri.attention(attention.name) : next ? c.auri.next(missionTitle2(next)) : (workspace2.missions || []).length ? c.auri.idle : c.auri.setup;
  const stageNames = c.services.stages;
  host.innerHTML = `<div class="os-command">
  <section class="os-hero" aria-labelledby="os-greeting">
   <div class="os-hero-text"><p class="os-eyebrow">${esc3(c.sections.command)} \xB7 ${esc3(c.sections.commandTag)}</p>
    <h1 id="os-greeting">${esc3(c.greet.line(part, first))} <span>${esc3(c.greet.sub(workspace2.organization.name))}</span></h1></div>
   ${quick.length ? `<nav class="os-quick" aria-label="${esc3(c.sections.command)}">${quick.map((q) => q.ask ? `<button type="button" class="os-btn is-quiet" data-os-ask="">${icon2(q.icon)}<span>${esc3(q.label)}</span></button>` : `<a class="os-btn ${q.primary ? "is-primary" : "is-quiet"}" href="${esc3(q.href)}">${icon2(q.icon)}<span>${esc3(q.label)}</span></a>`).join("")}</nav>` : ""}
  </section>
  <section class="os-kpis" aria-label="${esc3(c.chart.title)}">${kpis}</section>
  <div class="os-command-grid">
   <div class="os-col">
    <section class="os-card os-perf" aria-labelledby="os-perf-title">
     <header class="os-card-head"><div><h2 id="os-perf-title">${esc3(c.chart.title)}</h2><p>${esc3(c.chart.note)}</p></div>
      <div class="os-segment" role="group" aria-label="${esc3(c.chart.title)}">${["30d", "90d", "12m"].map((r) => `<button type="button" data-range="${r}" aria-pressed="${chartRange === r}">${esc3(c.chart.ranges[r])}</button>`).join("")}</div></header>
     <div class="os-tabs is-small" role="tablist" aria-label="${esc3(c.chart.source)}">${["inquiries", "visitors", "bookings"].map((m) => `<button type="button" role="tab" id="os-metric-${m}" aria-controls="os-chart-panel" data-metric="${m}" aria-selected="${chartMetric === m}" tabindex="${chartMetric === m ? 0 : -1}">${esc3(m === "bookings" ? bookingLabel(c, profile.industry) : c.chart[m])}</button>`).join("")}</div>
     <div id="os-chart-panel" role="tabpanel" aria-labelledby="os-metric-${chartMetric}" data-chart></div>
    </section>
    <section class="os-card" aria-labelledby="os-act-title">
     <header class="os-card-head"><div><h2 id="os-act-title">${esc3(c.activity.title)}</h2></div></header>
     ${events.length ? `<ol class="os-timeline">${events.map((e) => `<li><span class="os-timeline-icon">${icon2(e.icon, 16)}</span><a href="${esc3(e.href)}">${esc3(e.text)}</a><time datetime="${esc3(parseDate(e.at).toISOString())}" title="${esc3(parseDate(e.at).toLocaleString(lang2))}">${esc3(relative(lang2, e.at))}</time></li>`).join("")}</ol>` : emptyState({ esc: esc3, iconName: "clock", title: c.activity.empty })}
    </section>
   </div>
   <aside class="os-col os-side">
    <section class="os-card os-auri-card" aria-labelledby="os-auri-title">
     <div class="os-auri-row"><span class="os-auri-face" aria-hidden="true"><img src="/media/auri/level-${Math.max(1, Math.min(7, workspace2.auri?.level || 1))}.webp" alt="" width="56" height="56"></span>
      <div><h2 id="os-auri-title">${esc3(c.auri.title)}</h2><p>${esc3(auriLine)}</p></div></div>
     <div class="os-auri-actions">${next && !attention ? `<a class="os-btn is-primary is-sm" href="${esc3(link2("journey", { task: next.id }))}">${esc3(continueLabel)}</a>` : ""}
      ${canAsk ? `<button type="button" class="os-btn is-quiet is-sm" data-os-ask="next">${icon2("auri", 16)}<span>${esc3(c.auri.ask)}</span></button>` : ""}</div>
    </section>
    ${connected ? `<section class="os-card os-billing" aria-labelledby="os-bill-title">
     <header class="os-card-head"><div><h2 id="os-bill-title">${esc3(c.billing.title)}</h2></div><a class="os-link" href="/account">${esc3(c.billing.open)}</a></header>
     ${connected.totals?.amountDue ? `<p class="os-bill-due ${connected.totals.amountDue ? "is-due" : ""}"><span>${esc3(c.billing.due)}</span><strong>${esc3(money3(lang2, connected.totals.amountDue, "TRY"))}</strong></p><p class="os-muted">${esc3(c.billing.invoices(connected.totals.invoicesDue))}</p>` : `<p class="os-muted">${esc3(c.billing.none)}</p>`}
     <p class="os-source">${esc3(c.billing.note)}</p></section>` : ""}
    <section class="os-card" aria-labelledby="os-next-title">
     <header class="os-card-head"><div><h2 id="os-next-title">${esc3(c.next.title)}</h2></div></header>
     ${nextList.length ? `<ul class="os-next">${nextList.map((n, i) => `<li class="${n.attention ? "is-attention" : ""}">
      <span class="os-next-mark">${n.attention ? icon2("alert", 16) : `<b>${i + 1 - (attention ? 1 : 0)}</b>`}</span>
      <div><small>${esc3(n.attention ? c.next.attention : c.next.roadmap)}</small><strong>${esc3(n.title)}</strong>${n.why ? `<p>${esc3(n.why)}</p>` : ""}
       <div class="os-next-actions">${n.attention ? `<a class="os-link" href="${esc3(n.href)}">${esc3(n.label)}</a>` : `<a class="os-link" href="${esc3(n.href)}">${esc3(c.next.open)}</a>${canRequest && n.service ? `<button type="button" class="os-link" data-os-prepare="${esc3(n.mission.id)}">${esc3(c.next.prepare)}</button>` : ""}`}</div></div></li>`).join("")}</ul>` : emptyState({ esc: esc3, iconName: "check", title: c.next.empty, tone: "good" })}
    </section>
    <section class="os-card" aria-labelledby="os-svc-title">
     <header class="os-card-head"><div><h2 id="os-svc-title">${esc3(c.services.title)}</h2></div><a class="os-link" href="${esc3(link2("services"))}">${esc3(c.services.all)}</a></header>
     ${active.length ? `<ul class="os-services">${active.slice(0, 5).map((s) => `<li><div class="os-service-top"><strong>${esc3(s.title)}</strong>${pill(d.status[s.status] || String(s.status || "").replace(/[_-]/g, " "), TONE2[s.status] || (s.stage === 3 ? "good" : s.stage === 2 ? "info" : ""), esc3)}</div>
      <div class="os-steps" role="img" aria-label="${esc3(stageNames[s.stage])}">${stageNames.map((n, i) => `<span class="${i < s.stage ? "is-past" : i === s.stage ? "is-now" : ""}" title="${esc3(n)}"></span>`).join("")}</div>
      <p class="os-service-meta"><span>${esc3(stageNames[s.stage])}</span>${s.due ? `<span>${esc3(c.services.due)} ${esc3(shortDate(lang2, s.due))}</span>` : s.renews ? `<span>${esc3(c.services.renews)} ${esc3(shortDate(lang2, s.renews))}</span>` : ""}<a class="os-link" href="${esc3(s.href)}">${esc3(c.services.details)}</a></p></li>`).join("")}</ul>` : emptyState({ esc: esc3, iconName: "services", title: c.services.empty, actions: `<a class="os-btn is-quiet is-sm" href="${esc3(link2("services"))}">${esc3(c.kpi.browse)}</a>` })}
    </section>
   </aside>
  </div></div>`;
  const chartHost = host.querySelector("[data-chart]");
  const drawChart = () => {
    const panel = host.querySelector("#os-chart-panel");
    panel.setAttribute("aria-labelledby", "os-metric-" + chartMetric);
    if (chartMetric !== "inquiries") {
      chartHost.innerHTML = emptyState({ esc: esc3, iconName: "plug", title: c.kpi.notConnected, text: c.chart.notConnected }) + `<p class="os-source">${esc3(c.kpi.srcNone)}</p>`;
      return;
    }
    if (!leadsAvailable) {
      chartHost.innerHTML = emptyState({ esc: esc3, iconName: "alert", title: c.state.error, tone: "bad" });
      return;
    }
    const buckets = bucketize(leadList.map((l) => l.createdAt), chartRange, lang2);
    const total = buckets.reduce((s, b) => s + b.value, 0);
    chartHost.innerHTML = (total ? barChart({ esc: esc3, buckets, label: `${c.chart.inquiries} \xB7 ${c.chart.ranges[chartRange]}`, valueLabel: c.chart.count, lang: lang2 }) : emptyState({ esc: esc3, iconName: "chat", title: c.chart.emptyPeriod, actions: `<a class="os-btn is-quiet is-sm" href="${esc3(link2("studio", { view: "pipeline", new: "1" }))}">${esc3(c.kpi.logLead)}</a>` })) + `<p class="os-source">${esc3(c.kpi.srcLeads)} \xB7 ${esc3(c.chart.ranges[chartRange])}</p>`;
  };
  drawChart();
  host.querySelectorAll("[data-range]").forEach((b) => b.addEventListener("click", () => {
    chartRange = b.dataset.range;
    host.querySelectorAll("[data-range]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    drawChart();
  }));
  const tabs = [...host.querySelectorAll("[data-metric]")];
  const select2 = (tab) => {
    chartMetric = tab.dataset.metric;
    tabs.forEach((x) => {
      x.setAttribute("aria-selected", String(x === tab));
      x.tabIndex = x === tab ? 0 : -1;
    });
    drawChart();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select2(tab));
    tab.addEventListener("keydown", (e) => {
      const step2 = { ArrowRight: 1, ArrowLeft: -1 }[e.key] * (document.documentElement.dir === "rtl" ? -1 : 1);
      if (!step2) return;
      e.preventDefault();
      const target = tabs[(i + step2 + tabs.length) % tabs.length];
      target.focus();
      select2(target);
    });
  });
  const prompts = {
    next: next ? c.auri.promptNext(missionTitle2(next)) : c.auri.promptGeneral,
    bookings: c.auri.promptBookings(bookingLabel(c, profile.industry))
  };
  host.querySelectorAll("[data-os-ask]").forEach((b) => b.addEventListener("click", () => onAsk(prompts[b.dataset.osAsk] || null)));
  host.querySelectorAll("[data-os-prepare]").forEach((b) => b.addEventListener("click", () => onPrepare(workspace2.missions.find((m) => m.id === b.dataset.osPrepare))));
}

// src/hub/aura-journey.js
var OFFER = { "Web Design": "web", "Business Email": "email", AuraMenu: "menu", "AI & Automation": "chat", Branding: "brand", "Hosting / Security": "hosting" };
var EXAMPLES = {
  0: [
    { img: "/media/landing/showcase-website.webp", name: "D\xE9coration G\xE2teaux", kind: { en: "Pastry shop website", tr: "Pastane web sitesi", fr: "Site de p\xE2tisserie", ar: "\u0645\u0648\u0642\u0639 \u062D\u0644\u0648\u064A\u0627\u062A" }, href: "/portfolio" },
    { img: "/media/redesign/work-bentwalad.jpg", name: "Bent Walad", kind: { en: "Brand website", tr: "Marka web sitesi", fr: "Site de marque", ar: "\u0645\u0648\u0642\u0639 \u0639\u0644\u0627\u0645\u0629 \u062A\u062C\u0627\u0631\u064A\u0629" }, href: "/portfolio" }
  ],
  2: [
    { img: "/media/redesign/work-weddings.jpg", name: "AuraWeddings", kind: { en: "Invitations with RSVP", tr: "LCV\u2019li davetiyeler", fr: "Invitations avec RSVP", ar: "\u062F\u0639\u0648\u0627\u062A \u0645\u0639 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0636\u0648\u0631" }, href: "/aura-weddings" }
  ]
};
var level = (m) => Math.max(1, Math.min(5, Number(m.level) || 1)) - 1;
function journeyModel(workspace2) {
  const missions = workspace2.missions || [];
  const evidence = workspace2.evidence || {};
  const stages = [0, 1, 2, 3, 4].map((i) => {
    const list = missions.filter((m) => level(m) === i);
    const done = list.filter((m) => m.status === "done");
    const required = list.filter((m) => !m.optional && m.status !== "postponed");
    return {
      index: i,
      missions: list,
      done,
      remaining: list.filter((m) => m.status !== "done"),
      required,
      complete: list.length > 0 && required.every((m) => m.status === "done"),
      verified: list.filter((m) => evidence[m.id] === "approved").length
    };
  });
  const current = stages.findIndex((s) => s.required.some((m) => m.status !== "done"));
  const total = missions.length, doneCount = missions.filter((m) => m.status === "done").length;
  return { stages, current, total, doneCount, percent: total ? Math.round(doneCount / total * 100) : 0 };
}
function renderAuraJourney({ host, lang: lang2, esc: esc3, link: link2, requestLink: requestLink2, workspace: workspace2, missionTitle: missionTitle2, cap: cap2, stageParam, selectedId, canAsk, onAsk, onSelect, renderTask }) {
  const c = osCopy(lang2), j = c.journey, d = dashCopy(lang2), rl = roadmapLabels(lang2);
  const model = journeyModel(workspace2);
  const { stages, current } = model;
  const selectedMission2 = (workspace2.missions || []).find((m) => m.id === selectedId);
  const chosen = Number.isInteger(stageParam) && stageParam >= 0 && stageParam < 5 ? stageParam : selectedMission2 ? level(selectedMission2) : Math.max(0, current);
  const stage = stages[chosen];
  const missions = workspace2.missions || [];
  const profile = workspace2.profile || {};
  const evidence = workspace2.evidence || {};
  const stateOf = (m) => evidence[m.id] === "approved" ? "verified" : evidence[m.id] === "pending" ? "review" : m.status !== "done" && missionState(m, missions, profile).blocked ? "blocked" : m.status;
  const statusText = (m) => ({ verified: c.journey.done + " \u2713", review: j.inReview, blocked: rl.blocked })[stateOf(m)] || d.status[m.status] || m.status;
  const tone = (m) => ({ verified: "good", done: "good", review: "warn", blocked: "", in_progress: "info" })[stateOf(m)] || "";
  const pathProgress = (() => {
    if (!model.total) return 0;
    let value = 0;
    for (const s of stages) {
      if (!s.missions.length) {
        value += 1;
        continue;
      }
      const share = s.done.length / s.missions.length;
      value += share;
      if (share < 1) break;
    }
    return Math.min(100, value / 5 * 100);
  })();
  const remainingRequired = stage.remaining.filter((m) => !m.optional && m.status !== "postponed").length;
  const effort = !stage.missions.length || !stage.remaining.length ? j.effortLevels.done : remainingRequired + stage.remaining.filter((m) => m.optional).length <= 2 ? j.effortLevels.light : stage.remaining.length <= 4 ? j.effortLevels.moderate : j.effortLevels.heavy;
  const nextTask = eligibleMissions(missions, profile).find((m) => level(m) === chosen && evidence[m.id] !== "pending") || stage.remaining[0];
  const services = [...new Map(stage.remaining.filter((m) => missionGuide[m.capability]?.[0]).map((m) => [m.capability, m])).values()];
  const examples2 = EXAMPLES[chosen] || [];
  const auriExplain = [
    [j.explain.matters, j.why[chosen]],
    [j.explain.did, stage.done.length ? j.didSome(stage.done.length, stage.done.map(missionTitle2).join(", ")) : j.didNone],
    [j.explain.doNext, nextTask ? `${missionTitle2(nextTask)} \u2014 ${missionGuide[nextTask.capability]?.[2] || nextTask.nextAction || ""}` : j.nextNone],
    [j.explain.help, services.length ? j.helpSome(services.map((m) => cap2(m.capability)).join(", ")) : j.helpNone],
    [j.explain.optional, stage.missions.some((m) => m.optional) ? j.optYes : j.optNo]
  ];
  const stateLabel = (s) => s.complete ? j.done : s.index === current ? j.current : j.upcoming;
  host.innerHTML = `<div class="os-journey">
  <section class="os-journey-hero" aria-labelledby="os-journey-title">
   <div class="os-journey-head">
    <div><p class="os-eyebrow is-light">${esc3(c.sections.journey)} \xB7 ${esc3(c.sections.journeyTag)}</p>
     <h1 id="os-journey-title">${esc3(j.title)}</h1><p class="os-journey-lead">${esc3(missions.find((m) => m.planGoal)?.planGoal || j.lead)}</p></div>
    <dl class="os-journey-stats">
     <div><dt>${esc3(j.overall)}</dt><dd>${model.percent}%</dd><small>${esc3(j.of(model.doneCount, model.total))}</small></div>
     <div><dt>${esc3(j.verified)}</dt><dd>${Math.min(5, Number(workspace2.auri?.verifiedMilestones) || 0)}<span>/5</span></dd><small>Auri ${Math.max(1, Math.min(7, workspace2.auri?.level || 1))}/7</small></div>
    </dl>
   </div>
   <div class="os-path-wrap">
    <div class="os-path-line" aria-hidden="true"><span style="--p:${pathProgress.toFixed(1)}%"></span></div>
    <ol class="os-path vision-path-cards" aria-label="${esc3(j.stagesLabel)}">${stages.map((s) => `<li class="vision-stage os-stage" data-stage-state="${s.complete ? "done" : s.index === current ? "active" : "upcoming"}">
     <button type="button" class="os-stage-btn" data-stage="${s.index}" aria-pressed="${s.index === chosen}" aria-label="${esc3(`${j.stages[s.index]} \u2014 ${stateLabel(s)} \u2014 ${j.of(s.done.length, s.missions.length)}`)}">
      <span class="os-stage-badge">${s.complete ? icon2("check", 14) : s.index + 1}</span>
      ${stageArt(s.index)}
      <strong>${esc3(j.stages[s.index])}</strong><small>${esc3(j.taglines[s.index])}</small>
      <span class="os-stage-meter" aria-hidden="true"><i style="width:${s.missions.length ? Math.round(s.done.length / s.missions.length * 100) : 0}%"></i></span>
      <span class="os-stage-count">${esc3(j.of(s.done.length, s.missions.length))}</span>
     </button></li>`).join("")}</ol>
   </div>
  </section>
  <div class="os-journey-body">
   <section class="os-stage-panel" aria-labelledby="os-stage-title">
    <header class="os-stage-panel-head"><div><p class="os-eyebrow">${esc3(j.stageOf(chosen + 1))} \xB7 ${esc3(stateLabel(stage))}</p><h2 id="os-stage-title">${esc3(j.stages[chosen])}</h2></div>
     <div class="os-stage-progress"><span>${esc3(j.progress)}</span><strong>${esc3(j.of(stage.done.length, stage.missions.length))}</strong></div></header>
    <p class="os-stage-objective"><b>${esc3(j.objective)}</b> ${esc3(j.objectives[chosen])}</p>
    ${stage.missions.length ? `<div class="os-stage-grid">
     <section><h3>${esc3(j.remaining)} <span class="os-count">${stage.remaining.length}</span></h3>
      ${stage.remaining.length ? `<div class="vision-task-list os-task-list">${stage.remaining.map((m) => `<button type="button" class="vision-task os-task-row" data-node="${esc3(m.id)}" aria-pressed="${selectedMission2?.id === m.id}">
       <span class="os-task-check" aria-hidden="true"></span><span class="os-task-name">${esc3(missionTitle2(m))}${m.optional ? ` <em>${esc3(j.optional)}</em>` : ""}</span>${pill(statusText(m), tone(m), esc3)}${icon2("arrow", 14)}</button>`).join("")}</div>` : `<p class="os-muted">${esc3(j.allDone)}</p>`}</section>
     <section><h3>${esc3(j.completed)} <span class="os-count">${stage.done.length}</span></h3>
      ${stage.done.length ? `<div class="vision-task-list os-task-list">${stage.done.map((m) => `<button type="button" class="vision-task os-task-row is-done" data-node="${esc3(m.id)}" aria-pressed="${selectedMission2?.id === m.id}">
       <span class="os-task-check" aria-hidden="true">${icon2("check", 12)}</span><span class="os-task-name">${esc3(missionTitle2(m))}</span>${pill(statusText(m), tone(m), esc3)}</button>`).join("")}</div>` : `<p class="os-muted">${esc3(j.noneDone)}</p>`}</section>
    </div>` : emptyState({ esc: esc3, iconName: "journey", title: j.empty })}
    <dl class="os-stage-facts">
     <div><dt>${esc3(j.next)}</dt><dd>${nextTask ? `<button type="button" class="os-link" data-node="${esc3(nextTask.id)}">${esc3(missionTitle2(nextTask))}</button>` : esc3(j.nextNone)}</dd></div>
     <div><dt>${esc3(j.effort)}</dt><dd>${esc3(effort)}</dd><small>${esc3(j.effortNote)}</small></div>
    </dl>
    ${services.length ? `<section class="os-stage-services"><h3>${esc3(j.recommended)}</h3><p class="os-muted">${esc3(j.diy)}</p><ul>${services.map((m) => {
    const service = missionGuide[m.capability][0], offer = OFFER[service];
    return `<li><span>${icon2("services", 16)}<strong>${esc3(cap2(m.capability))}</strong>${m.optional ? pill(j.optional, "", esc3) : ""}</span>
      <span class="os-stage-service-actions">${offer ? `<a class="os-link" href="${esc3(link2("services", { offer }))}">${esc3(j.view)}</a>` : ""}${workspace2.permissions.includes("roadmap:write") ? `<a class="os-link" href="${esc3(requestLink2(service, m.id))}">${esc3(j.request)}</a>` : ""}</span></li>`;
  }).join("")}</ul></section>` : ""}
    ${examples2.length ? `<section class="os-stage-examples"><h3>${esc3(j.examples)}</h3><div>${examples2.map((e) => `<a href="${esc3(e.href)}" class="os-example"><img src="${esc3(e.img)}" alt="" loading="lazy" decoding="async" width="320" height="200"><span><strong>${esc3(e.name)}</strong><small>${esc3(e.kind[lang2] || e.kind.en)}</small></span></a>`).join("")}</div></section>` : ""}
   </section>
   <aside class="os-journey-auri" aria-labelledby="os-jauri-title">
    <div class="os-auri-row"><span class="os-auri-face is-floating" aria-hidden="true"><img src="/media/auri/level-${Math.max(1, Math.min(7, workspace2.auri?.level || 1))}.webp" alt="" width="56" height="56"></span><h2 id="os-jauri-title">${esc3(j.explainTitle)}</h2></div>
    <dl class="os-explain">${auriExplain.map(([q, a]) => `<div><dt>${esc3(q)}</dt><dd>${esc3(a)}</dd></div>`).join("")}</dl>
    ${canAsk ? `<button type="button" class="os-btn is-primary is-sm" data-ask-stage>${icon2("auri", 16)}<span>${esc3(j.askStage)}</span></button>` : ""}
   </aside>
  </div>
  <section class="os-task-detail" aria-label="${esc3(j.taskDetail)}" data-task-detail></section>
 </div>`;
  requestAnimationFrame(() => host.querySelector(".os-path-line")?.classList.add("is-ready"));
  host.querySelectorAll("[data-stage]").forEach((b) => b.addEventListener("click", () => {
    const index = Number(b.dataset.stage);
    history.pushState(null, "", link2("journey", { stage: String(index) }));
    renderAuraJourney({ host, lang: lang2, esc: esc3, link: link2, requestLink: requestLink2, workspace: workspace2, missionTitle: missionTitle2, cap: cap2, stageParam: index, selectedId: null, canAsk, onAsk, onSelect, renderTask });
    host.querySelector(`[data-stage="${index}"]`)?.focus();
  }));
  host.querySelectorAll(".os-journey-body [data-node]").forEach((b) => b.addEventListener("click", () => onSelect(b.dataset.node)));
  const taskHost = host.querySelector("[data-task-detail]");
  const focusId = selectedMission2 && level(selectedMission2) === chosen ? selectedMission2.id : nextTask?.id || stage.missions[0]?.id;
  if (focusId) renderTask(taskHost, focusId);
  else taskHost.remove();
  host.querySelector("[data-ask-stage]")?.addEventListener("click", () => onAsk(j.askPrompt(j.stages[chosen])));
}

// src/hub/aura-studio.js
var STUDIO_VIEWS = ["pipeline", "delivery", "website", "menu", "inbox", "analytics"];
var TAB_ICON = { pipeline: "studio", delivery: "services", website: "site", menu: "menu", inbox: "chat", analytics: "analytics" };
var showArchived = false;
var filters2 = { q: "", source: "", person: "" };
function renderAuraStudio(ctx) {
  const { host, lang: lang2, esc: esc3, link: link2, view } = ctx;
  const c = osCopy(lang2), s = c.studio;
  const current = STUDIO_VIEWS.includes(view) ? view : "pipeline";
  const canWrite = ctx.workspace.permissions.includes("roadmap:write");
  host.innerHTML = `<div class="os-studio">
  <header class="os-studio-head"><div><p class="os-eyebrow">${esc3(c.sections.studio)} \xB7 ${esc3(c.sections.studioTag)}</p><h1>${esc3(s.tabs[current])}</h1><p class="os-muted">${esc3(s.intro)}</p></div></header>
  <nav class="os-studio-tabs" aria-label="${esc3(s.title)}">${STUDIO_VIEWS.map((v) => `<a href="${esc3(link2("studio", { view: v }))}" ${v === current ? 'aria-current="page"' : ""} data-studio-tab="${v}">${icon2(TAB_ICON[v], 16)}<span>${esc3(s.tabs[v])}</span></a>`).join("")}</nav>
  ${canWrite ? "" : `<p class="os-notice">${icon2("lock", 16)}<span>${esc3(s.readOnly)}</span></p>`}
  <div class="os-studio-body" data-studio-body>${loading(c.state.loading, esc3)}</div></div>`;
  host.querySelector("[data-studio-tab][aria-current]")?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  const body = host.querySelector("[data-studio-body]");
  const run = { pipeline, delivery, website, menu, inbox, analytics }[current];
  return run({ ...ctx, body, c, s, canWrite }).catch((error) => {
    if (!body.isConnected) return;
    body.innerHTML = emptyState({ esc: esc3, iconName: "alert", tone: "bad", title: c.state.error, text: error.message, actions: `<button type="button" class="os-btn is-quiet is-sm" data-retry>${esc3(c.state.retry)}</button>` });
    body.querySelector("[data-retry]").onclick = () => renderAuraStudio(ctx);
  });
}
async function pipeline(ctx) {
  const { body, c, s, esc: esc3, lang: lang2, api: api2, endpoint: endpoint2, canWrite, query: query2, link: link2, toast: toast2, workspace: workspace2 } = ctx;
  const data = await api2(endpoint2("leads") + (showArchived ? "?archived=1" : ""));
  if (!body.isConnected) return;
  const { stages, assignees, sources } = data;
  let leads = data.leads;
  const people = new Map(assignees.map((p) => [p.id, p.name]));
  const currency = workspace2.profile?.currency || "USD";
  const initials = (name) => String(name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const visible = () => leads.filter((l) => (!filters2.source || l.source === filters2.source) && (!filters2.person || (filters2.person === "-" ? !l.assigneeId : l.assigneeId === filters2.person)) && (!filters2.q || [l.name, l.contact, l.interest].join(" ").toLowerCase().includes(filters2.q.toLowerCase())));
  const card = (l) => `<li class="os-lead" data-lead="${esc3(l.id)}" ${canWrite && !showArchived ? 'draggable="true"' : ""}>
  <button type="button" class="os-lead-open" data-open="${esc3(l.id)}"><strong>${esc3(l.name)}</strong>${l.interest ? `<span>${esc3(l.interest)}</span>` : ""}</button>
  <div class="os-lead-meta">${pill(s.sources[l.source] || l.source, "", esc3)}${l.value !== null ? `<span class="os-lead-value">${esc3(money3(lang2, l.value, currency))}</span>` : ""}
   ${l.notes ? `<span class="os-lead-notes" title="${esc3(c.studio.lead.notes)}">${icon2("note", 13)}${l.notes}</span>` : ""}
   ${l.assigneeId ? `<span class="os-avatar is-xs" title="${esc3(people.get(l.assigneeId) || "")}">${esc3(initials(people.get(l.assigneeId)))}</span>` : ""}</div>
  <div class="os-lead-foot"><time datetime="${esc3(parseDate(l.updatedAt)?.toISOString() || "")}">${esc3(relative(lang2, l.updatedAt))}</time>
   ${canWrite && !showArchived ? `<label class="os-move"><span class="sr-only">${esc3(s.pipeline.moveTo)} \u2014 ${esc3(l.name)}</span><select data-move="${esc3(l.id)}" aria-label="${esc3(s.pipeline.moveTo)}: ${esc3(l.name)}">${stages.map((st) => `<option value="${esc3(st.id)}" ${st.id === l.stage ? "selected" : ""}>${esc3(st.label)}</option>`).join("")}</select></label>` : ""}</div></li>`;
  const draw = () => {
    const list = visible();
    const board = showArchived ? list.length ? `<ul class="os-lead-grid">${list.map(card).join("")}</ul>` : emptyState({ esc: esc3, iconName: "archive", title: s.pipeline.none }) : !leads.length ? emptyState({ esc: esc3, iconName: "chat", title: s.pipeline.empty, text: s.pipeline.emptyText, actions: canWrite ? `<button type="button" class="os-btn is-primary is-sm" data-new>${icon2("plus", 16)}<span>${esc3(s.pipeline.add)}</span></button>` : "" }) : `<div class="os-board" role="list" aria-label="${esc3(s.tabs.pipeline)}">${stages.map((st) => {
      const items = list.filter((l) => l.stage === st.id);
      const total = items.reduce((sum, l) => sum + (l.value || 0), 0);
      return `<section class="os-column" role="listitem" data-column="${esc3(st.id)}" aria-labelledby="col-${esc3(st.id)}"><header><h3 id="col-${esc3(st.id)}">${esc3(st.label)}</h3><span class="os-count">${items.length}</span>${total ? `<small>${esc3(money3(lang2, total, currency))}</small>` : ""}</header>
      <ul class="os-column-list">${items.map(card).join("") || `<li class="os-column-empty">${esc3(s.pipeline.stageEmpty)}</li>`}</ul></section>`;
    }).join("")}</div>`;
    body.innerHTML = `<div class="os-toolbar">
   <label class="os-search">${icon2("search", 16)}<span class="sr-only">${esc3(s.pipeline.search)}</span><input type="search" data-filter="q" value="${esc3(filters2.q)}" placeholder="${esc3(s.pipeline.search)}" maxlength="80"></label>
   <label><span class="sr-only">${esc3(c.studio.lead.source)}</span><select data-filter="source"><option value="">${esc3(s.pipeline.allSources)}</option>${sources.map((x) => `<option value="${x}" ${filters2.source === x ? "selected" : ""}>${esc3(s.sources[x] || x)}</option>`).join("")}</select></label>
   <label><span class="sr-only">${esc3(c.studio.lead.assignee)}</span><select data-filter="person"><option value="">${esc3(s.pipeline.allPeople)}</option><option value="-" ${filters2.person === "-" ? "selected" : ""}>${esc3(s.pipeline.unassigned)}</option>${assignees.map((p) => `<option value="${esc3(p.id)}" ${filters2.person === p.id ? "selected" : ""}>${esc3(p.name)}</option>`).join("")}</select></label>
   <span class="os-toolbar-spacer"></span>
   <span class="os-muted os-toolbar-count" role="status">${esc3(s.pipeline.count(list.length))}</span>
   <button type="button" class="os-btn is-quiet is-sm" data-archived aria-pressed="${showArchived}">${icon2("archive", 16)}<span>${esc3(showArchived ? s.pipeline.hideArchived : s.pipeline.showArchived)}</span></button>
   ${canWrite && !showArchived ? `<button type="button" class="os-btn is-quiet is-sm" data-stages>${esc3(s.pipeline.configure)}</button><button type="button" class="os-btn is-primary is-sm" data-new>${icon2("plus", 16)}<span>${esc3(s.pipeline.add)}</span></button>` : ""}
  </div>${leads.length && !list.length && !showArchived ? emptyState({ esc: esc3, iconName: "filter", title: s.pipeline.none }) : board}<dialog class="os-dialog" data-dialog></dialog>`;
    bind();
  };
  const refresh = async () => {
    const next = await api2(endpoint2("leads") + (showArchived ? "?archived=1" : ""));
    leads = next.leads;
    if (body.isConnected) draw();
  };
  const patch = async (lead, changes) => {
    try {
      const { lead: saved } = await api2(endpoint2("leads/" + lead.id), "PATCH", { version: lead.version, ...changes });
      leads = leads.map((l) => l.id === saved.id ? saved : l).filter((l) => l.archived === showArchived);
      return saved;
    } catch (error) {
      toast2(error.message);
      if (error.status === 409) await refresh();
      throw error;
    }
  };
  function bind() {
    body.querySelectorAll("[data-filter]").forEach((input) => input.addEventListener(input.tagName === "INPUT" ? "input" : "change", () => {
      filters2[input.dataset.filter] = input.value;
      const focus = input.dataset.filter, pos = input.selectionStart;
      draw();
      const again = body.querySelector(`[data-filter="${focus}"]`);
      again?.focus();
      if (again?.setSelectionRange && pos !== void 0) again.setSelectionRange(pos, pos);
    }));
    body.querySelector("[data-archived]")?.addEventListener("click", async () => {
      showArchived = !showArchived;
      body.innerHTML = loading(c.state.loading, esc3);
      await refresh();
    });
    body.querySelectorAll("[data-new]").forEach((b) => b.addEventListener("click", () => openForm()));
    body.querySelector("[data-stages]")?.addEventListener("click", openStages);
    body.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => openLead(b.dataset.open)));
    body.querySelectorAll("[data-move]").forEach((sel) => sel.addEventListener("change", async () => {
      const lead = leads.find((l) => l.id === sel.dataset.move);
      sel.disabled = true;
      try {
        await patch(lead, { stage: sel.value });
        draw();
        body.querySelector(`[data-move="${lead.id}"]`)?.focus();
      } catch {
        sel.disabled = false;
        sel.value = lead.stage;
      }
    }));
    let dragged = null;
    body.querySelectorAll(".os-lead[draggable]").forEach((el) => {
      el.addEventListener("dragstart", (e) => {
        dragged = el.dataset.lead;
        el.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", dragged);
      });
      el.addEventListener("dragend", () => {
        el.classList.remove("is-dragging");
        body.querySelectorAll(".is-drop").forEach((x) => x.classList.remove("is-drop"));
      });
    });
    body.querySelectorAll("[data-column]").forEach((col) => {
      col.addEventListener("dragover", (e) => {
        if (!dragged) return;
        e.preventDefault();
        col.classList.add("is-drop");
      });
      col.addEventListener("dragleave", () => col.classList.remove("is-drop"));
      col.addEventListener("drop", async (e) => {
        e.preventDefault();
        col.classList.remove("is-drop");
        const lead = leads.find((l) => l.id === dragged);
        dragged = null;
        if (!lead || lead.stage === col.dataset.column) return;
        try {
          await patch(lead, { stage: col.dataset.column });
          draw();
        } catch {
        }
      });
    });
  }
  const dialog = () => body.querySelector("[data-dialog]");
  const field2 = (name, label, value = "", attrs = "") => `<label class="os-field"><span>${esc3(label)}</span><input name="${name}" value="${esc3(value)}" ${attrs}></label>`;
  const formFields = (l = {}) => `${field2("name", c.studio.lead.name, l.name, 'required minlength="2" maxlength="120" autocomplete="off"')}
  ${field2("contact", c.studio.lead.contact, l.contact, 'maxlength="200" autocomplete="off"')}
  <div class="os-field-row"><label class="os-field"><span>${esc3(c.studio.lead.source)}</span><select name="source">${sources.map((x) => `<option value="${x}" ${(l.source || "other") === x ? "selected" : ""}>${esc3(s.sources[x])}</option>`).join("")}</select></label>
  <label class="os-field"><span>${esc3(c.studio.lead.stage)}</span><select name="stage">${stages.map((st) => `<option value="${esc3(st.id)}" ${(l.stage || stages[0].id) === st.id ? "selected" : ""}>${esc3(st.label)}</option>`).join("")}</select></label></div>
  ${field2("interest", c.studio.lead.interest, l.interest, 'maxlength="160"')}
  <div class="os-field-row">${field2("value", `${c.studio.lead.value} (${currency})`, l.value ?? "", 'type="number" min="0" step="any" inputmode="decimal"')}
  <label class="os-field"><span>${esc3(c.studio.lead.assignee)}</span><select name="assigneeId"><option value="">${esc3(s.pipeline.unassigned)}</option>${assignees.map((p) => `<option value="${esc3(p.id)}" ${l.assigneeId === p.id ? "selected" : ""}>${esc3(p.name)}</option>`).join("")}</select></label></div>`;
  const formValues = (form) => {
    const f = new FormData(form);
    return { name: f.get("name"), contact: f.get("contact"), source: f.get("source"), stage: f.get("stage"), interest: f.get("interest"), value: f.get("value") === "" ? null : Number(f.get("value")), assigneeId: f.get("assigneeId") || null };
  };
  function openForm() {
    const d = dialog();
    d.innerHTML = `<form method="dialog" class="os-dialog-body" data-create><header><h2>${esc3(s.pipeline.add)}</h2><button type="button" class="os-icon-btn" data-close aria-label="${esc3(c.studio.lead.close)}">${icon2("close")}</button></header>
   ${formFields()}<label class="os-field"><span>${esc3(c.studio.lead.note)}</span><textarea name="note" rows="3" maxlength="2000"></textarea></label>
   <p class="os-error" role="alert"></p><footer><button type="button" class="os-btn is-quiet" data-close>${esc3(c.studio.lead.cancel)}</button><button class="os-btn is-primary" value="save">${esc3(c.studio.lead.create)}</button></footer></form>`;
    d.showModal();
    d.querySelector("[name=name]").focus();
    d.querySelectorAll("[data-close]").forEach((b) => b.onclick = () => d.close());
    d.querySelector("[data-create]").onsubmit = async (e) => {
      e.preventDefault();
      const form = e.currentTarget, submit = form.querySelector("[value=save]"), error = form.querySelector("[role=alert]");
      if (!form.reportValidity()) return;
      submit.disabled = true;
      error.textContent = "";
      try {
        const { lead } = await api2(endpoint2("leads"), "POST", { ...formValues(form), note: new FormData(form).get("note") });
        leads = [lead, ...leads];
        d.close();
        toast2(c.studio.lead.saved);
        draw();
      } catch (err) {
        error.textContent = err.message;
        submit.disabled = false;
      }
    };
  }
  async function openLead(id) {
    const d = dialog();
    d.innerHTML = `<div class="os-dialog-body">${loading(c.state.loading, esc3)}</div>`;
    if (!d.open) d.showModal();
    let detail;
    try {
      detail = await api2(endpoint2("leads/" + id));
    } catch (err) {
      d.innerHTML = `<div class="os-dialog-body">${emptyState({ esc: esc3, iconName: "alert", tone: "bad", title: err.message })}<footer><button type="button" class="os-btn is-quiet" data-close>${esc3(c.studio.lead.close)}</button></footer></div>`;
      d.querySelector("[data-close]").onclick = () => d.close();
      return;
    }
    const l = detail.lead;
    history.replaceState(null, "", link2("studio", { view: "pipeline", lead: l.id }));
    d.innerHTML = `<div class="os-dialog-body"><header><div><h2>${esc3(l.name)}</h2><p class="os-muted">${esc3(c.studio.lead.created)} ${esc3(shortDate(lang2, l.createdAt))} \xB7 ${esc3(c.studio.lead.updated)} ${esc3(relative(lang2, l.updatedAt))}</p></div><button type="button" class="os-icon-btn" data-close aria-label="${esc3(c.studio.lead.close)}">${icon2("close")}</button></header>
   ${canWrite && !l.archived ? `<form data-edit>${formFields(l)}<p class="os-error" role="alert"></p><footer><button class="os-btn is-primary is-sm">${esc3(c.studio.lead.save)}</button></footer></form>` : `<dl class="os-lead-facts">${[[c.studio.lead.contact, l.contact], [c.studio.lead.source, s.sources[l.source]], [c.studio.lead.stage, stages.find((x) => x.id === l.stage)?.label || l.stage], [c.studio.lead.interest, l.interest], [c.studio.lead.value, l.value !== null ? money3(lang2, l.value, currency) : ""], [c.studio.lead.assignee, people.get(l.assigneeId) || s.pipeline.unassigned]].filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc3(k)}</dt><dd>${esc3(v)}</dd></div>`).join("")}</dl>`}
   <section class="os-notes"><h3>${esc3(c.studio.lead.notes)}</h3>
    ${canWrite && !l.archived ? `<form data-note class="os-note-form"><label class="sr-only" for="os-note">${esc3(c.studio.lead.addNote)}</label><textarea id="os-note" name="note" rows="2" maxlength="2000" required placeholder="${esc3(c.studio.lead.addNote)}"></textarea><button class="os-btn is-quiet is-sm">${esc3(c.studio.lead.addNote)}</button></form>` : ""}
    ${detail.notes.length ? `<ol>${detail.notes.map((n) => `<li><p>${esc3(n.body)}</p><small>${esc3(n.author || "")} \xB7 ${esc3(relative(lang2, n.createdAt))}</small></li>`).join("")}</ol>` : `<p class="os-muted">${esc3(c.studio.lead.noNotes)}</p>`}</section>
   ${canWrite ? `<footer class="os-dialog-foot"><button type="button" class="os-btn is-quiet is-sm" data-archive>${icon2("archive", 16)}<span>${esc3(l.archived ? s.pipeline.restore : s.pipeline.archive)}</span></button></footer>` : ""}</div>`;
    const close = () => {
      d.close();
    };
    d.onclose = () => {
      if (new URLSearchParams(location.search).get("lead")) history.replaceState(null, "", link2("studio", { view: "pipeline" }));
    };
    d.querySelector("[data-close]").onclick = close;
    d.querySelector("[data-edit]")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.currentTarget, error = form.querySelector("[role=alert]"), submit = form.querySelector("button");
      if (!form.reportValidity()) return;
      submit.disabled = true;
      error.textContent = "";
      try {
        await patch(l, formValues(form));
        toast2(c.studio.lead.saved);
        close();
        draw();
      } catch (err) {
        error.textContent = err.message;
        submit.disabled = false;
      }
    });
    d.querySelector("[data-note]")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const note = new FormData(e.currentTarget).get("note").trim();
      if (!note) return;
      e.currentTarget.querySelector("button").disabled = true;
      try {
        await patch(l, { note });
        draw();
        await openLead(l.id);
      } catch {
        e.currentTarget.querySelector("button").disabled = false;
      }
    });
    d.querySelector("[data-archive]")?.addEventListener("click", async () => {
      if (!l.archived && !confirm(s.pipeline.confirmArchive)) return;
      try {
        await patch(l, { archived: !l.archived });
        close();
        draw();
      } catch {
      }
    });
  }
  function openStages() {
    const d = dialog();
    let list = stages.map((x) => ({ ...x }));
    const paint = () => {
      d.innerHTML = `<form class="os-dialog-body" data-stage-form><header><div><h2>${esc3(s.stagesEditor.title)}</h2><p class="os-muted">${esc3(s.stagesEditor.hint)}</p></div><button type="button" class="os-icon-btn" data-close aria-label="${esc3(c.studio.lead.close)}">${icon2("close")}</button></header>
    <ol class="os-stage-editor">${list.map((x, i) => `<li><label class="os-field"><span class="sr-only">${esc3(s.stagesEditor.name)} ${i + 1}</span><input name="label" data-i="${i}" value="${esc3(x.label)}" required maxlength="40"></label>${list.length > 2 ? `<button type="button" class="os-btn is-quiet is-sm" data-remove="${i}">${esc3(s.stagesEditor.remove)}</button>` : ""}</li>`).join("")}</ol>
    ${list.length < 8 ? `<button type="button" class="os-btn is-quiet is-sm" data-add>${icon2("plus", 16)}<span>${esc3(s.stagesEditor.add)}</span></button>` : ""}
    <p class="os-error" role="alert"></p><footer><button type="button" class="os-btn is-quiet" data-close>${esc3(c.studio.lead.cancel)}</button><button class="os-btn is-primary">${esc3(s.stagesEditor.save)}</button></footer></form>`;
      d.querySelectorAll("[data-close]").forEach((b) => b.onclick = () => d.close());
      d.querySelectorAll("[data-i]").forEach((input) => input.oninput = () => {
        list[Number(input.dataset.i)].label = input.value;
      });
      d.querySelectorAll("[data-remove]").forEach((b) => b.onclick = () => {
        list.splice(Number(b.dataset.remove), 1);
        paint();
      });
      d.querySelector("[data-add]")?.addEventListener("click", () => {
        let n = list.length + 1;
        while (list.some((x) => x.id === "stage_" + n)) n++;
        list.push({ id: "stage_" + n, label: "" });
        paint();
        d.querySelector("[data-i]:last-of-type")?.focus();
        d.querySelectorAll("[data-i]")[list.length - 1]?.focus();
      });
      d.querySelector("[data-stage-form]").onsubmit = async (e) => {
        e.preventDefault();
        if (!e.currentTarget.reportValidity()) return;
        const error = d.querySelector("[role=alert]");
        try {
          await api2(endpoint2("lead-stages"), "PUT", { version: data.stagesVersion, stages: list });
          d.close();
          toast2(c.studio.lead.saved);
          await pipeline(ctx);
        } catch (err) {
          error.textContent = err.message;
        }
      };
    };
    paint();
    if (!d.open) d.showModal();
  }
  draw();
  if (query2.get("new") === "1" && canWrite) {
    history.replaceState(null, "", link2("studio", { view: "pipeline" }));
    openForm();
  } else if (query2.get("lead")) openLead(query2.get("lead"));
}
async function delivery(ctx) {
  const { body, s, esc: esc3, lang: lang2, link: link2, requestLink: requestLink2, canWrite, loadSnapshot, loadConnected } = ctx;
  const [snapshot, connected] = await Promise.all([loadSnapshot(), loadConnected()]);
  if (!body.isConnected) return;
  const d = dashCopy(lang2), c = osCopy(lang2);
  const items = serviceItems({ snapshot, connected, link: link2, lang: lang2 });
  const active = items.filter((i) => !i.terminal), done = items.filter((i) => i.terminal);
  const now = Date.now();
  const deadlines = active.filter((i) => parseDate(i.due)).sort((a, b) => parseDate(a.due) - parseDate(b.due));
  const approvals = snapshot.attention || [];
  const revisions = (snapshot.requests || []).filter((r) => /revision/.test(String(r.productionStatus || r.status)));
  const row = (i) => `<li class="os-row"><span class="os-row-icon">${icon2(i.kind === "subscription" ? "clock" : "services", 16)}</span><span class="os-row-main"><strong>${esc3(i.title)}</strong><small>${esc3([d.kinds[i.kind] || "", c.services.stages[i.stage]].filter(Boolean).join(" \xB7 "))}</small></span>
  ${pill(d.status[i.status] || String(i.status || "").replace(/[_-]/g, " "), TONE2[i.status] || "", esc3)}<a class="os-link" href="${esc3(i.href)}">${esc3(s.delivery.open)}</a></li>`;
  const block = (title, content2, count) => `<section class="os-card"><header class="os-card-head"><div><h2>${esc3(title)}</h2></div>${count !== void 0 ? `<span class="os-count">${count}</span>` : ""}</header>${content2}</section>`;
  body.innerHTML = `<div class="os-split">
  <div class="os-col">
   ${block(s.delivery.approvals, approvals.length ? `<ul class="os-rows">${approvals.map((a) => `<li class="os-row is-attention"><span class="os-row-icon">${icon2("alert", 16)}</span><span class="os-row-main"><strong>${esc3(a.name)}</strong><small>${esc3(a.kind === "menu" ? s.delivery.reviewMenu : d.status[a.status] || a.status)}</small></span><a class="os-btn is-primary is-sm" href="${esc3(a.kind === "menu" ? link2("menuDrafts", { draft: a.id }) : link2("requests", { request: a.id }))}">${esc3(a.kind === "menu" ? s.delivery.reviewMenu : s.delivery.open)}</a></li>`).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.none)}</p>`, approvals.length)}
   ${block(s.delivery.active, active.length ? `<ul class="os-rows">${active.map(row).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.none)}</p>`, active.length)}
   ${block(s.delivery.completed, done.length ? `<ul class="os-rows">${done.map(row).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.none)}</p>`, done.length)}
  </div>
  <aside class="os-col">
   ${block(s.delivery.deadlines, deadlines.length ? `<ul class="os-deadlines">${deadlines.map((i) => {
    const late = parseDate(i.due).getTime() < now;
    return `<li class="${late ? "is-late" : ""}"><time datetime="${esc3(parseDate(i.due).toISOString())}"><b>${esc3(parseDate(i.due).toLocaleDateString(lang2, { day: "numeric" }))}</b>${esc3(parseDate(i.due).toLocaleDateString(lang2, { month: "short" }))}</time><span><strong>${esc3(i.title)}</strong>${late ? `<small class="os-bad">${esc3(s.delivery.overdue)}</small>` : `<small>${esc3(relative(lang2, i.due))}</small>`}</span></li>`;
  }).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.none)}</p>`)}
   ${block(s.delivery.revisions, revisions.length ? `<ul class="os-rows">${revisions.map((r) => `<li class="os-row"><span class="os-row-main"><strong>${esc3(r.name)}</strong></span><a class="os-link" href="${esc3(link2("requests", { request: r.id }))}">${esc3(s.delivery.open)}</a></li>`).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.revisionsNone)}</p>`)}
   ${block(s.delivery.messages, `<p class="os-muted">${esc3(s.delivery.messagesNone)}</p><div class="os-inline-actions"><a class="os-btn is-quiet is-sm" href="${esc3(link2("requests"))}">${esc3(c.nav.requests)}</a>${canWrite ? `<a class="os-btn is-primary is-sm" href="${esc3(requestLink2())}">${esc3(s.delivery.requestChange)}</a>` : ""}</div>`)}
  </aside></div>`;
}
async function website(ctx) {
  const { body, s, esc: esc3, lang: lang2, link: link2, requestLink: requestLink2, canWrite, workspace: workspace2, loadConnected, loadSnapshot } = ctx;
  const [connected, snapshot] = await Promise.all([loadConnected(), loadSnapshot()]);
  if (!body.isConnected) return;
  const w = s.website, d = dashCopy(lang2);
  let url = null;
  try {
    if (workspace2.profile?.website) url = new URL(/^https?:\/\//i.test(workspace2.profile.website) ? workspace2.profile.website : "https://" + workspace2.profile.website);
  } catch {
  }
  const sites = (connected?.requests || []).filter((r) => r.kind === "quicksite");
  const siteServices = serviceItems({ snapshot, connected, link: link2, lang: lang2 }).filter((i) => /web|site|hosting|domain/i.test(i.title || "") && i.kind !== "quicksite");
  if (!url && !sites.length && !siteServices.length) {
    body.innerHTML = emptyState({ esc: esc3, iconName: "site", title: w.none, text: w.noneText, actions: [
      workspace2.permissions.includes("profile:write") ? `<a class="os-btn is-quiet is-sm" href="${esc3(link2("profile"))}">${esc3(w.addSite)}</a>` : "",
      canWrite ? `<a class="os-btn is-primary is-sm" href="${esc3(requestLink2("Web Design"))}">${esc3(w.build)}</a>` : ""
    ].join("") }) + `<p class="os-source">${esc3(w.notOwned)}</p>`;
    return;
  }
  const published = sites.some((r) => r.status === "approved") || Boolean(url);
  const building = sites.some((r) => r.status === "pending") || siteServices.some((i) => i.stage < 3 && !i.terminal);
  body.innerHTML = `<div class="os-split">
  <section class="os-card os-site">
   <div class="os-browser" aria-hidden="true"><span></span><span></span><span></span><b>${esc3(url ? url.host : sites[0]?.slug || w.title)}</b></div>
   <div class="os-site-body"><span class="os-site-mark">${icon2("globe", 28)}</span><div><h2>${esc3(url ? url.host : sites[0]?.name || w.title)}</h2>
    <p>${pill(published ? w.published : building ? w.inProgress : w.unknown, published ? "good" : building ? "info" : "", esc3)}</p></div>
    ${url ? `<a class="os-btn is-primary is-sm" href="${esc3(url.href)}" target="_blank" rel="noopener noreferrer">${esc3(w.preview)} ${icon2("external", 14)}</a>` : ""}</div>
   <dl class="os-facts">
    <div><dt>${esc3(w.domain)}</dt><dd>${esc3(url ? url.host : sites[0]?.slug || "\u2014")}</dd></div>
    <div><dt>${esc3(w.secure)}</dt><dd>${url ? url.protocol === "https:" ? "\u2713" : "\u2014" : "\u2014"}</dd></div>
    <div><dt>${esc3(w.status)}</dt><dd>${esc3(published ? w.published : building ? w.inProgress : w.unknown)}</dd></div>
   </dl>
   ${[...sites.map((r) => ({ title: r.name, meta: d.kinds.quicksite + (r.slug ? " \xB7 " + r.slug : ""), status: r.status, at: r.updatedAt })), ...siteServices.map((i) => ({ title: i.title, meta: d.kinds[i.kind] || "", status: i.status, at: i.at }))].map((r) => `<div class="os-row"><span class="os-row-main"><strong>${esc3(r.title)}</strong><small>${esc3(r.meta)} \xB7 ${esc3(relative(lang2, r.at))}</small></span>${pill(d.status[r.status] || r.status, TONE2[r.status] || "", esc3)}</div>`).join("")}
  </section>
  <aside class="os-card"><header class="os-card-head"><div><h2>${esc3(w.actions)}</h2></div></header>
   ${canWrite ? `<ul class="os-action-list">
    <li><a href="${esc3(requestLink2("Website Care"))}">${icon2("note", 16)}<span>${esc3(w.change)}</span>${icon2("arrow", 14)}</a></li>
    <li><a href="${esc3(requestLink2("Web Design"))}">${icon2("plus", 16)}<span>${esc3(w.newPage)}</span>${icon2("arrow", 14)}</a></li>
    <li><a href="${esc3(requestLink2("SEO / Google Maps"))}">${icon2("search", 16)}<span>${esc3(w.seo)}</span>${icon2("arrow", 14)}</a></li></ul>` : `<p class="os-muted">${esc3(s.readOnly)}</p>`}
   <p class="os-source">${esc3(w.notOwned)}</p></aside></div>`;
}
async function menu(ctx) {
  const { body, s, esc: esc3, lang: lang2, link: link2, requestLink: requestLink2, canWrite, workspace: workspace2, api: api2, endpoint: endpoint2, loadConnected } = ctx;
  const [connected, drafts] = await Promise.all([loadConnected(), api2(endpoint2("menu-drafts")).then((r) => r.drafts || []).catch((e) => {
    if (e.status === 503 || e.status === 404) return null;
    throw e;
  })]);
  if (!body.isConnected) return;
  const m = s.menu, d = dashCopy(lang2);
  const menus = (connected?.requests || []).filter((r) => r.kind === "auramenu");
  const list = (drafts || []).filter((x) => x.state !== "archived");
  const restaurant = workspace2.profile?.industry === "restaurant";
  if (!menus.length && !list.length) {
    body.innerHTML = emptyState({ esc: esc3, iconName: "menu", title: m.none, text: restaurant ? m.noneText : m.notRestaurant, actions: [
      drafts !== null && canWrite ? `<a class="os-btn is-quiet is-sm" href="${esc3(link2("menuDrafts"))}">${esc3(m.start)}</a>` : "",
      canWrite ? `<a class="os-btn is-primary is-sm" href="${esc3(requestLink2("AuraMenu"))}">${esc3(m.request)}</a>` : ""
    ].join("") });
    return;
  }
  body.innerHTML = `<div class="os-split">
  <section class="os-card"><header class="os-card-head"><div><h2>${esc3(m.live)}</h2></div><span class="os-count">${menus.length}</span></header>
   ${menus.length ? `<ul class="os-rows">${menus.map((r) => `<li class="os-row"><span class="os-row-icon">${icon2("menu", 16)}</span><span class="os-row-main"><strong>${esc3(r.name)}</strong><small>${esc3(r.slug || d.kinds.auramenu)} \xB7 ${esc3(relative(lang2, r.updatedAt || r.createdAt))}</small></span>${pill(d.status[r.status] || r.status, TONE2[r.status] || "", esc3)}${r.payment === "unpaid" ? pill(d.status.unpaid, "warn", esc3) : ""}</li>`).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.none)}</p>`}
  </section>
  <section class="os-card"><header class="os-card-head"><div><h2>${esc3(m.drafts)}</h2></div>${drafts !== null ? `<a class="os-link" href="${esc3(link2("menuDrafts"))}">${esc3(m.open)}</a>` : ""}</header>
   ${list.length ? `<ul class="os-rows">${list.map((x) => `<li class="os-row"><span class="os-row-icon">${icon2("menuDrafts", 16)}</span><span class="os-row-main"><strong>${esc3(x.draft?.fields?.businessName || x.name || "AuraMenu")}</strong><small>${esc3(x.state)}</small></span><a class="os-link" href="${esc3(link2("menuDrafts", { draft: x.id }))}">${esc3(m.manage)}</a></li>`).join("")}</ul>` : `<p class="os-muted">${esc3(s.delivery.none)}</p>`}
  </section></div>`;
}
async function inbox(ctx) {
  const { body, s, esc: esc3, lang: lang2, link: link2, api: api2, endpoint: endpoint2, loadSnapshot, onAsk, workspace: workspace2 } = ctx;
  const [snapshot, leads] = await Promise.all([loadSnapshot(), api2(endpoint2("leads")).then((r) => r.leads).catch(() => [])]);
  if (!body.isConnected) return;
  const i = s.inbox;
  const channels2 = [["whatsapp", "WhatsApp"], ["instagram", "Instagram"], ["mail", "Email"], ["globe", s.sources.website]];
  const recent = leads.filter((l) => l.notes > 0).slice(0, 8);
  body.innerHTML = `<p class="os-muted os-lead-in">${esc3(i.lead)}</p><div class="os-split">
  <div class="os-col">
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(i.teamRequests)}</h2></div></header>
    ${(snapshot.requests || []).length ? `<ul class="os-rows">${snapshot.requests.slice(0, 10).map((r) => `<li class="os-row"><span class="os-row-icon">${icon2("requests", 16)}</span><span class="os-row-main"><strong>${esc3(r.name)}</strong><small>${esc3(relative(lang2, r.createdAt))}</small></span><a class="os-link" href="${esc3(link2("requests", { request: r.id }))}">${esc3(s.delivery.open)}</a></li>`).join("")}</ul>` : `<p class="os-muted">${esc3(i.empty)}</p>`}
   </section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(i.fromPipeline)}</h2></div></header>
    ${recent.length ? `<ul class="os-rows">${recent.map((l) => `<li class="os-row"><span class="os-row-icon">${icon2("note", 16)}</span><span class="os-row-main"><strong>${esc3(l.name)}</strong><small>${esc3(s.sources[l.source])} \xB7 ${esc3(relative(lang2, l.updatedAt))}</small></span><a class="os-link" href="${esc3(link2("studio", { view: "pipeline", lead: l.id }))}">${esc3(s.delivery.open)}</a></li>`).join("")}</ul>` : `<p class="os-muted">${esc3(i.empty)}</p>`}
   </section>
  </div>
  <aside class="os-col">
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(i.channels)}</h2></div></header>
    <ul class="os-channels">${channels2.map(([ic, name]) => `<li><span class="os-row-icon">${icon2(ic, 16)}</span><span class="os-row-main"><strong>${esc3(name)}</strong><small>${esc3(i.connectHint)}</small></span>${pill(i.notConnected, "", esc3)}</li>`).join("")}</ul>
   </section>
   ${workspace2.permissions.includes("auri:use") ? `<section class="os-card"><header class="os-card-head"><div><h2>${esc3(i.auri)}</h2></div></header><button type="button" class="os-btn is-quiet is-sm" data-inbox-auri>${icon2("auri", 16)}<span>${esc3(osCopy(lang2).auri.more)}</span></button></section>` : ""}
  </aside></div>`;
  body.querySelector("[data-inbox-auri]")?.addEventListener("click", () => onAsk(null));
}
async function analytics(ctx) {
  const { body, s, esc: esc3, lang: lang2, link: link2, api: api2, endpoint: endpoint2, workspace: workspace2, loadSnapshot, loadConnected } = ctx;
  const [active, archived, snapshot, connected] = await Promise.all([
    api2(endpoint2("leads")),
    api2(endpoint2("leads") + "?archived=1").catch(() => ({ leads: [] })),
    loadSnapshot(),
    loadConnected()
  ]);
  if (!body.isConnected) return;
  const a = s.analytics, c = osCopy(lang2);
  const since = Date.now() - 30 * 864e5;
  const all = [...active.leads, ...archived.leads];
  const recent = all.filter((l) => parseDate(l.createdAt)?.getTime() >= since);
  const wonStage = active.stages.find((x) => x.id === "won")?.id || active.stages.at(-1).id;
  const won = recent.filter((l) => l.stage === wonStage).length;
  const bySource = Object.entries(recent.reduce((m, l) => (m[l.source] = (m[l.source] || 0) + 1, m), {})).sort((x, y) => y[1] - x[1]);
  const openByStage = active.stages.map((st) => [st.label, active.leads.filter((l) => l.stage === st.id).length]);
  const missions = workspace2.missions || [];
  const doneMissions = missions.filter((m) => m.status === "done").length;
  const items = serviceItems({ snapshot, connected, link: link2, lang: lang2 });
  const bars = (rows, total) => `<ul class="os-bars">${rows.map(([label, n]) => `<li><span>${esc3(label)}</span><span class="os-bar"><i style="width:${total ? Math.round(n / total * 100) : 0}%"></i></span><b>${number(lang2, n)}</b></li>`).join("")}</ul>`;
  const stat = (label, value, source) => `<div class="os-stat"><dt>${esc3(label)}</dt><dd>${esc3(value)}</dd><small>${esc3(source)}</small></div>`;
  body.innerHTML = `<p class="os-muted os-lead-in">${esc3(a.lead)}</p>
  <dl class="os-stats">
   ${stat(c.kpi.inquiries, number(lang2, recent.length), a.range)}
   ${stat(a.conversion, recent.length ? Math.round(won / recent.length * 100) + "%" : "\u2014", a.range)}
   ${stat(a.roadmap, missions.length ? Math.round(doneMissions / missions.length * 100) + "%" : "\u2014", `${doneMissions}/${missions.length}`)}
   ${stat(a.services, number(lang2, items.filter((i) => !i.terminal).length), c.kpi.live)}
  </dl>
  <div class="os-split">
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(a.bySource)}</h2><p>${esc3(a.range)}</p></div></header>
    ${recent.length ? bars(bySource.map(([k, n]) => [s.sources[k] || k, n]), recent.length) : emptyState({ esc: esc3, iconName: "chat", title: a.noLeads, actions: `<a class="os-btn is-quiet is-sm" href="${esc3(link2("studio", { view: "pipeline" }))}">${esc3(s.tabs.pipeline)}</a>` })}
    <p class="os-source">${esc3(a.srcLeads)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(a.byStage)}</h2></div></header>
    ${active.leads.length ? bars(openByStage, active.leads.length) : `<p class="os-muted">${esc3(a.noLeads)}</p>`}
    <p class="os-source">${esc3(a.srcLeads)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(a.site)}</h2></div>${pill(c.kpi.notConnected, "", esc3)}</header>
    ${emptyState({ esc: esc3, iconName: "plug", title: c.kpi.notConnected, text: a.siteNone })}<p class="os-source">${esc3(c.kpi.srcNone)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc3(a.roadmap)}</h2></div></header>
    ${bars(c.journey.stages.map((name, i) => {
    const list = missions.filter((m) => Math.max(1, Math.min(5, Number(m.level) || 1)) === i + 1);
    return [name, list.filter((m) => m.status === "done").length, list.length];
  }).map(([n, d, t2]) => [`${n} (${d}/${t2})`, d]), Math.max(1, ...c.journey.stages.map((_, i) => missions.filter((m) => Math.max(1, Math.min(5, Number(m.level) || 1)) === i + 1).length)))}
    <p class="os-source">${esc3(a.srcRoadmap)}</p></section>
  </div>`;
}

// src/hub/server-errors.js
var T = {
  "Sign in to your AuraDigital account.": ["AuraDigital hesab\u0131n\u0131za giri\u015F yap\u0131n.", "Connectez-vous \xE0 votre compte AuraDigital.", "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643 \u0641\u064A AuraDigital."],
  "Account changed. Sign in again.": ["Hesap de\u011Fi\u015Fti. Tekrar giri\u015F yap\u0131n.", "Le compte a chang\xE9. Reconnectez-vous.", "\u062A\u063A\u064A\u0651\u0631 \u0627\u0644\u062D\u0633\u0627\u0628. \u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627."],
  "Account unavailable.": ["Hesap kullan\u0131lam\u0131yor.", "Compte indisponible.", "\u0627\u0644\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D."],
  "Too many attempts. Please wait.": ["\xC7ok fazla deneme. L\xFCtfen bekleyin.", "Trop de tentatives. Patientez un instant.", "\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u062B\u064A\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631."],
  "Too many changes. Please wait.": ["\xC7ok fazla de\u011Fi\u015Fiklik. L\xFCtfen bekleyin.", "Trop de modifications. Patientez un instant.", "\u062A\u063A\u064A\u064A\u0631\u0627\u062A \u0643\u062B\u064A\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631."],
  "Too many invitations. Please wait.": ["\xC7ok fazla davet. L\xFCtfen bekleyin.", "Trop d\u2019invitations. Patientez un instant.", "\u062F\u0639\u0648\u0627\u062A \u0643\u062B\u064A\u0631\u0629. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631."],
  "Too many requests. Wait a moment or enter your details manually.": ["\xC7ok fazla istek. Biraz bekleyin veya bilgileri elle girin.", "Trop de requ\xEAtes. Patientez ou saisissez vos informations.", "\u0637\u0644\u0628\u0627\u062A \u0643\u062B\u064A\u0631\u0629. \u0627\u0646\u062A\u0638\u0631 \u0642\u0644\u064A\u0644\u064B\u0627 \u0623\u0648 \u0623\u062F\u062E\u0644 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u064A\u062F\u0648\u064A\u064B\u0627."],
  "Verify your email before this action.": ["Bu i\u015Flem i\xE7in \xF6nce e-postan\u0131z\u0131 do\u011Frulay\u0131n.", "V\xE9rifiez votre e-mail avant cette action.", "\u0623\u0643\u0651\u062F \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0642\u0628\u0644 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621."],
  "Sign in to verify your email.": ["E-postan\u0131z\u0131 do\u011Frulamak i\xE7in giri\u015F yap\u0131n.", "Connectez-vous pour v\xE9rifier votre e-mail.", "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u062A\u0623\u0643\u064A\u062F \u0628\u0631\u064A\u062F\u0643."],
  "Sign in to submit this request.": ["Bu talebi g\xF6ndermek i\xE7in giri\u015F yap\u0131n.", "Connectez-vous pour envoyer cette demande.", "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0625\u0631\u0633\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628."],
  "Invalid or expired link.": ["Ba\u011Flant\u0131 ge\xE7ersiz veya s\xFCresi dolmu\u015F.", "Lien invalide ou expir\xE9.", "\u0627\u0644\u0631\u0627\u0628\u0637 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629."],
  "Enter a valid email address.": ["Ge\xE7erli bir e-posta adresi girin.", "Saisissez une adresse e-mail valide.", "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u064B\u0627 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u064B\u0627 \u0635\u0627\u0644\u062D\u064B\u0627."],
  "Enter your email.": ["E-postan\u0131z\u0131 girin.", "Saisissez votre e-mail.", "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A."],
  "Enter a new password.": ["Yeni bir \u015Fifre girin.", "Saisissez un nouveau mot de passe.", "\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629."],
  "Enter your current password.": ["Mevcut \u015Fifrenizi girin.", "Saisissez votre mot de passe actuel.", "\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629."],
  "Enter your full name and accept the account conditions.": ["Ad\u0131n\u0131z\u0131 girin ve hesap ko\u015Fullar\u0131n\u0131 kabul edin.", "Saisissez votre nom et acceptez les conditions.", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062D\u0633\u0627\u0628."],
  "Enter a different valid email address.": ["Farkl\u0131 ve ge\xE7erli bir e-posta girin.", "Saisissez une autre adresse e-mail valide.", "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u064B\u0627 \u0645\u062E\u062A\u0644\u0641\u064B\u0627 \u0648\u0635\u0627\u0644\u062D\u064B\u0627."],
  "Email could not be changed.": ["E-posta de\u011Fi\u015Ftirilemedi.", "L\u2019e-mail n\u2019a pas pu \xEAtre modifi\xE9.", "\u062A\u0639\u0630\u0651\u0631 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A."],
  "Email confirmation is unavailable.": ["E-posta onay\u0131 \u015Fu anda kullan\u0131lam\u0131yor.", "La confirmation par e-mail est indisponible.", "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u064B\u0627."],
  "Email delivery is temporarily unavailable.": ["E-posta g\xF6nderimi ge\xE7ici olarak kullan\u0131lam\u0131yor.", "L\u2019envoi d\u2019e-mails est temporairement indisponible.", "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0645\u0624\u0642\u062A\u064B\u0627."],
  "That address cannot be used.": ["Bu adres kullan\u0131lamaz.", "Cette adresse ne peut pas \xEAtre utilis\xE9e.", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646."],
  "That address cannot be used. Start a new email change.": ["Bu adres kullan\u0131lamaz. Yeni bir e-posta de\u011Fi\u015Fikli\u011Fi ba\u015Flat\u0131n.", "Adresse inutilisable. Recommencez le changement d\u2019e-mail.", "\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646. \u0627\u0628\u062F\u0623 \u062A\u063A\u064A\u064A\u0631\u064B\u0627 \u062C\u062F\u064A\u062F\u064B\u0627."],
  "Use your signed-in email.": ["Giri\u015F yapt\u0131\u011F\u0131n\u0131z e-postay\u0131 kullan\u0131n.", "Utilisez l\u2019e-mail de votre compte.", "\u0627\u0633\u062A\u062E\u062F\u0645 \u0628\u0631\u064A\u062F \u062D\u0633\u0627\u0628\u0643."],
  "Accept the account conditions before using Google sign-in.": ["Google ile giri\u015Ften \xF6nce hesap ko\u015Fullar\u0131n\u0131 kabul edin.", "Acceptez les conditions avant d\u2019utiliser Google.", "\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062D\u0633\u0627\u0628 \u0642\u0628\u0644 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google."],
  "Google sign-in expired or canceled.": ["Google giri\u015Fi zaman a\u015F\u0131m\u0131na u\u011Frad\u0131 veya iptal edildi.", "Connexion Google expir\xE9e ou annul\xE9e.", "\u0627\u0646\u062A\u0647\u062A \u0623\u0648 \u0623\u064F\u0644\u063A\u064A\u062A \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 Google."],
  "Google sign-in failed.": ["Google ile giri\u015F ba\u015Far\u0131s\u0131z oldu.", "La connexion Google a \xE9chou\xE9.", "\u0641\u0634\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 Google."],
  "Google sign-in is not configured and verified.": ["Google ile giri\u015F hen\xFCz haz\u0131r de\u011Fil.", "La connexion Google n\u2019est pas encore disponible.", "\u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 Google \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0628\u0639\u062F."],
  "Sign in with email first, verify it, then link Google from Settings.": ["\xD6nce e-postayla giri\u015F yap\u0131p do\u011Frulay\u0131n, sonra Ayarlar\u2019dan Google\u2019\u0131 ba\u011Flay\u0131n.", "Connectez-vous par e-mail, v\xE9rifiez-le, puis liez Google dans les param\xE8tres.", "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0623\u0643\u0651\u062F\u0647 \u0623\u0648\u0644\u064B\u0627\u060C \u062B\u0645 \u0627\u0631\u0628\u0637 Google \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A."],
  "Workspace not found.": ["\xC7al\u0131\u015Fma alan\u0131 bulunamad\u0131.", "Espace introuvable.", "\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629."],
  "Workspace not found or access unavailable.": ["\xC7al\u0131\u015Fma alan\u0131 bulunamad\u0131 veya eri\u015Fiminiz yok.", "Espace introuvable ou acc\xE8s indisponible.", "\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0623\u0648 \u0644\u0627 \u062A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644."],
  "Workspace unavailable.": ["\xC7al\u0131\u015Fma alan\u0131 kullan\u0131lam\u0131yor.", "Espace indisponible.", "\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629."],
  "Workspace access changed.": ["\xC7al\u0131\u015Fma alan\u0131 eri\u015Fiminiz de\u011Fi\u015Fti.", "Votre acc\xE8s \xE0 l\u2019espace a chang\xE9.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0648\u0635\u0648\u0644\u0643."],
  "Workspace changed. Reopen it before retrying.": ["\xC7al\u0131\u015Fma alan\u0131 de\u011Fi\u015Fti. Tekrar denemeden \xF6nce yeniden a\xE7\u0131n.", "L\u2019espace a chang\xE9. Rouvrez-le avant de r\xE9essayer.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644. \u0623\u0639\u062F \u0641\u062A\u062D\u0647\u0627 \u062B\u0645 \u062D\u0627\u0648\u0644."],
  "Workspace writes are temporarily unavailable.": ["De\u011Fi\u015Fiklikler ge\xE7ici olarak kaydedilemiyor.", "Les modifications sont temporairement indisponibles.", "\u0627\u0644\u062D\u0641\u0638 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0645\u0624\u0642\u062A\u064B\u0627."],
  "This setup was already saved. Reload the Hub to open it.": ["Bu kurulum zaten kaydedildi. A\xE7mak i\xE7in sayfay\u0131 yenileyin.", "Cette configuration est d\xE9j\xE0 enregistr\xE9e. Rechargez la page.", "\u062A\u0645 \u062D\u0641\u0638 \u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0628\u0627\u0644\u0641\u0639\u0644. \u0623\u0639\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0635\u0641\u062D\u0629."],
  "The profile changed or access was revoked. Reload before saving.": ["Profil de\u011Fi\u015Fti veya eri\u015Fim kald\u0131r\u0131ld\u0131. Kaydetmeden \xF6nce yenileyin.", "Le profil a chang\xE9 ou l\u2019acc\xE8s a \xE9t\xE9 retir\xE9. Rechargez avant d\u2019enregistrer.", "\u062A\u063A\u064A\u0651\u0631 \u0627\u0644\u0645\u0644\u0641 \u0623\u0648 \u0623\u064F\u0644\u063A\u064A \u0627\u0644\u0648\u0635\u0648\u0644. \u0623\u0639\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u0641\u0638."],
  "Only the verified business owner can manage the team.": ["Ekibi yaln\u0131zca do\u011Frulanm\u0131\u015F i\u015Fletme sahibi y\xF6netebilir.", "Seul le propri\xE9taire v\xE9rifi\xE9 peut g\xE9rer l\u2019\xE9quipe.", "\u064A\u0645\u0643\u0646 \u0644\u0645\u0627\u0644\u0643 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0648\u062B\u0651\u0642 \u0641\u0642\u0637 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u064A\u0642."],
  "Enter a valid email, role and invitation message.": ["Ge\xE7erli bir e-posta, rol ve davet mesaj\u0131 girin.", "Saisissez un e-mail, un r\xF4le et un message valides.", "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u064B\u0627 \u0648\u062F\u0648\u0631\u064B\u0627 \u0648\u0631\u0633\u0627\u0644\u0629 \u062F\u0639\u0648\u0629 \u0635\u0627\u0644\u062D\u0629."],
  "A pending invitation already exists. Cancel it before inviting again.": ["Bekleyen bir davet var. Yeniden davet etmeden \xF6nce iptal edin.", "Une invitation est d\xE9j\xE0 en attente. Annulez-la d\u2019abord.", "\u062A\u0648\u062C\u062F \u062F\u0639\u0648\u0629 \u0645\u0639\u0644\u0651\u0642\u0629. \u0623\u0644\u063A\u0647\u0627 \u0642\u0628\u0644 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062F\u0639\u0648\u0629."],
  "This person already has a membership.": ["Bu ki\u015Fi zaten ekipte.", "Cette personne est d\xE9j\xE0 membre.", "\u0647\u0630\u0627 \u0627\u0644\u0634\u062E\u0635 \u0639\u0636\u0648 \u0628\u0627\u0644\u0641\u0639\u0644."],
  "The owner is already included.": ["\u0130\u015Fletme sahibi zaten dahil.", "Le propri\xE9taire est d\xE9j\xE0 inclus.", "\u0627\u0644\u0645\u0627\u0644\u0643 \u0645\u0636\u0645\u0651\u0646 \u0628\u0627\u0644\u0641\u0639\u0644."],
  "Invitation unavailable, expired or issued to a different email.": ["Davet ge\xE7ersiz, s\xFCresi dolmu\u015F veya ba\u015Fka bir e-postaya g\xF6nderilmi\u015F.", "Invitation indisponible, expir\xE9e ou destin\xE9e \xE0 un autre e-mail.", "\u0627\u0644\u062F\u0639\u0648\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0623\u0648 \u0645\u0646\u062A\u0647\u064A\u0629 \u0623\u0648 \u0645\u0631\u0633\u0644\u0629 \u0644\u0628\u0631\u064A\u062F \u0622\u062E\u0631."],
  "Invitation already used or canceled.": ["Davet zaten kullan\u0131lm\u0131\u015F veya iptal edilmi\u015F.", "Invitation d\xE9j\xE0 utilis\xE9e ou annul\xE9e.", "\u0627\u0644\u062F\u0639\u0648\u0629 \u0645\u0633\u062A\u062E\u062F\u0645\u0629 \u0623\u0648 \u0645\u0644\u063A\u0627\u0629."],
  "Mission not found.": ["G\xF6rev bulunamad\u0131.", "T\xE2che introuvable.", "\u0627\u0644\u0645\u0647\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629."],
  "Mission changed or access revoked.": ["G\xF6rev de\u011Fi\u015Fti veya eri\u015Fim kald\u0131r\u0131ld\u0131.", "La t\xE2che a chang\xE9 ou l\u2019acc\xE8s a \xE9t\xE9 retir\xE9.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0627\u0644\u0645\u0647\u0645\u0629 \u0623\u0648 \u0623\u064F\u0644\u063A\u064A \u0627\u0644\u0648\u0635\u0648\u0644."],
  "Mission order changed. Reload before moving.": ["G\xF6rev s\u0131ras\u0131 de\u011Fi\u015Fti. Ta\u015F\u0131madan \xF6nce yenileyin.", "L\u2019ordre a chang\xE9. Rechargez avant de d\xE9placer.", "\u062A\u063A\u064A\u0651\u0631 \u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0645\u0647\u0627\u0645. \u0623\u0639\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0642\u0628\u0644 \u0627\u0644\u0646\u0642\u0644."],
  "The mission changed or already has evidence under review.": ["G\xF6rev de\u011Fi\u015Fti veya incelemede bir kan\u0131t\u0131 var.", "La t\xE2che a chang\xE9 ou une preuve est d\xE9j\xE0 en revue.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0627\u0644\u0645\u0647\u0645\u0629 \u0623\u0648 \u0644\u062F\u064A\u0647\u0627 \u062F\u0644\u064A\u0644 \u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629."],
  "The mission changed or has evidence under review.": ["G\xF6rev de\u011Fi\u015Fti veya incelemede bir kan\u0131t\u0131 var.", "La t\xE2che a chang\xE9 ou une preuve est en revue.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0627\u0644\u0645\u0647\u0645\u0629 \u0623\u0648 \u0644\u062F\u064A\u0647\u0627 \u062F\u0644\u064A\u0644 \u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629."],
  "The mission changed or cannot accept evidence.": ["G\xF6rev de\u011Fi\u015Fti veya kan\u0131t kabul edemiyor.", "La t\xE2che a chang\xE9 ou n\u2019accepte pas de preuve.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0627\u0644\u0645\u0647\u0645\u0629 \u0623\u0648 \u0644\u0627 \u062A\u0642\u0628\u0644 \u062F\u0644\u064A\u0644\u064B\u0627."],
  "Enter an evidence reference or description of 10\u20131000 characters.": ["10\u20131000 karakterlik bir kan\u0131t veya a\xE7\u0131klama girin.", "Saisissez une preuve ou description de 10 \xE0 1000 caract\xE8res.", "\u0623\u062F\u062E\u0644 \u062F\u0644\u064A\u0644\u064B\u0627 \u0623\u0648 \u0648\u0635\u0641\u064B\u0627 \u0645\u0646 10 \u0625\u0644\u0649 1000 \u062D\u0631\u0641."],
  "Business profile changed. Reload before submitting evidence.": ["\u0130\u015Fletme profili de\u011Fi\u015Fti. Kan\u0131t g\xF6ndermeden \xF6nce yenileyin.", "Le profil a chang\xE9. Rechargez avant d\u2019envoyer la preuve.", "\u062A\u063A\u064A\u0651\u0631 \u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637. \u0623\u0639\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0642\u0628\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062F\u0644\u064A\u0644."],
  "Choose an existing capability from your business profile.": ["\u0130\u015Fletme profilinizdeki mevcut bir \xF6zelli\u011Fi se\xE7in.", "Choisissez une capacit\xE9 de votre profil.", "\u0627\u062E\u062A\u0631 \u0642\u062F\u0631\u0629 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0645\u0644\u0641 \u0646\u0634\u0627\u0637\u0643."],
  "Request not found.": ["Talep bulunamad\u0131.", "Demande introuvable.", "\u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F."],
  "Service not found.": ["Hizmet bulunamad\u0131.", "Service introuvable.", "\u0627\u0644\u062E\u062F\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629."],
  "Choose a service.": ["Bir hizmet se\xE7in.", "Choisissez un service.", "\u0627\u062E\u062A\u0631 \u062E\u062F\u0645\u0629."],
  "Choose a valid service.": ["Ge\xE7erli bir hizmet se\xE7in.", "Choisissez un service valide.", "\u0627\u062E\u062A\u0631 \u062E\u062F\u0645\u0629 \u0635\u0627\u0644\u062D\u0629."],
  "Enter a short roadmap question.": ["K\u0131sa bir soru yaz\u0131n.", "Saisissez une courte question.", "\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u064B\u0627 \u0642\u0635\u064A\u0631\u064B\u0627."],
  "Enter a question for Auri.": ["Auri i\xE7in bir soru yaz\u0131n.", "Posez une question \xE0 Auri.", "\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u064B\u0627 \u0644\u0623\u0648\u0631\u064A."],
  "Auri analysis is unavailable. You can enter your details manually.": ["Auri analizi \u015Fu an kullan\u0131lam\u0131yor. Bilgileri elle girebilirsiniz.", "L\u2019analyse d\u2019Auri est indisponible. Saisissez vos informations.", "\u062A\u062D\u0644\u064A\u0644 \u0623\u0648\u0631\u064A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D. \u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644 \u064A\u062F\u0648\u064A\u064B\u0627."],
  "Auri could not analyze these details. Retry or enter them manually.": ["Auri bu bilgileri analiz edemedi. Tekrar deneyin veya elle girin.", "Auri n\u2019a pas pu analyser ces informations. R\xE9essayez ou saisissez-les.", "\u062A\u0639\u0630\u0651\u0631 \u0639\u0644\u0649 \u0623\u0648\u0631\u064A \u0627\u0644\u062A\u062D\u0644\u064A\u0644. \u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0623\u0648 \u0623\u062F\u062E\u0644\u0647\u0627 \u064A\u062F\u0648\u064A\u064B\u0627."],
  "Auri could not prepare your roadmap. Your answers are saved. Please retry.": ["Auri yol haritan\u0131z\u0131 haz\u0131rlayamad\u0131. Yan\u0131tlar\u0131n\u0131z kaydedildi, tekrar deneyin.", "Auri n\u2019a pas pu pr\xE9parer votre feuille de route. Vos r\xE9ponses sont enregistr\xE9es, r\xE9essayez.", "\u062A\u0639\u0630\u0651\u0631 \u0639\u0644\u0649 \u0623\u0648\u0631\u064A \u0625\u0639\u062F\u0627\u062F \u062E\u0637\u062A\u0643. \u0625\u062C\u0627\u0628\u0627\u062A\u0643 \u0645\u062D\u0641\u0648\u0638\u0629\u060C \u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629."],
  "Auri is busy. Your answers are saved. Please retry shortly.": ["Auri me\u015Fgul. Yan\u0131tlar\u0131n\u0131z kaydedildi, birazdan tekrar deneyin.", "Auri est occup\xE9. Vos r\xE9ponses sont enregistr\xE9es, r\xE9essayez bient\xF4t.", "\u0623\u0648\u0631\u064A \u0645\u0634\u063A\u0648\u0644. \u0625\u062C\u0627\u0628\u0627\u062A\u0643 \u0645\u062D\u0641\u0648\u0638\u0629\u060C \u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0642\u0631\u064A\u0628\u064B\u0627."],
  "Auri is unavailable. Your answers are saved. Please retry later.": ["Auri \u015Fu an kullan\u0131lam\u0131yor. Yan\u0131tlar\u0131n\u0131z kaydedildi.", "Auri est indisponible. Vos r\xE9ponses sont enregistr\xE9es.", "\u0623\u0648\u0631\u064A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D. \u0625\u062C\u0627\u0628\u0627\u062A\u0643 \u0645\u062D\u0641\u0648\u0638\u0629."],
  "Auri returned an incomplete roadmap. Your answers are saved. Please retry.": ["Auri eksik bir yol haritas\u0131 d\xF6nd\xFCrd\xFC. Yan\u0131tlar\u0131n\u0131z kaydedildi, tekrar deneyin.", "Auri a renvoy\xE9 une feuille de route incompl\xE8te. R\xE9essayez.", "\u0623\u0639\u0627\u062F \u0623\u0648\u0631\u064A \u062E\u0637\u0629 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629. \u0625\u062C\u0627\u0628\u0627\u062A\u0643 \u0645\u062D\u0641\u0648\u0638\u0629\u060C \u0623\u0639\u062F \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629."],
  "Auri roadmap generation is unavailable. Your answers are saved. Please retry later.": ["Yol haritas\u0131 olu\u015Fturma \u015Fu an kullan\u0131lam\u0131yor. Yan\u0131tlar\u0131n\u0131z kaydedildi.", "La cr\xE9ation de feuille de route est indisponible. Vos r\xE9ponses sont enregistr\xE9es.", "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062E\u0637\u0629 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u064B\u0627. \u0625\u062C\u0627\u0628\u0627\u062A\u0643 \u0645\u062D\u0641\u0648\u0638\u0629."],
  "Provide up to 4,000 characters of business information.": ["En fazla 4.000 karakter i\u015Fletme bilgisi girin.", "Jusqu\u2019\xE0 4 000 caract\xE8res d\u2019informations.", "\u0623\u062F\u062E\u0644 \u062D\u062A\u0649 4000 \u062D\u0631\u0641 \u0645\u0646 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0646\u0634\u0627\u0637."],
  "Business description is too long.": ["\u0130\u015Fletme a\xE7\u0131klamas\u0131 \xE7ok uzun.", "La description est trop longue.", "\u0648\u0635\u0641 \u0627\u0644\u0646\u0634\u0627\u0637 \u0637\u0648\u064A\u0644 \u062C\u062F\u064B\u0627."],
  "Choose a name of 1\u201324 characters and a visibility preference.": ["1\u201324 karakterlik bir ad se\xE7in.", "Choisissez un nom de 1 \xE0 24 caract\xE8res.", "\u0627\u062E\u062A\u0631 \u0627\u0633\u0645\u064B\u0627 \u0645\u0646 1 \u0625\u0644\u0649 24 \u062D\u0631\u0641\u064B\u0627."],
  "Enter a name of at least 2 characters.": ["En az 2 karakterlik bir ad girin.", "Saisissez un nom d\u2019au moins 2 caract\xE8res.", "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u064B\u0627 \u0645\u0646 \u062D\u0631\u0641\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644."],
  "Choose a valid source.": ["Ge\xE7erli bir kaynak se\xE7in.", "Choisissez une source valide.", "\u0627\u062E\u062A\u0631 \u0645\u0635\u062F\u0631\u064B\u0627 \u0635\u0627\u0644\u062D\u064B\u0627."],
  "Choose a pipeline stage.": ["Bir a\u015Fama se\xE7in.", "Choisissez une \xE9tape.", "\u0627\u062E\u062A\u0631 \u0645\u0631\u062D\u0644\u0629."],
  "Enter a value between 0 and 1,000,000,000.": ["0 ile 1.000.000.000 aras\u0131nda bir de\u011Fer girin.", "Saisissez une valeur entre 0 et 1 000 000 000.", "\u0623\u062F\u062E\u0644 \u0642\u064A\u0645\u0629 \u0628\u064A\u0646 0 \u06481,000,000,000."],
  "Assign the lead to a member of this workspace.": ["Talebi bu \xE7al\u0131\u015Fma alan\u0131ndaki bir ki\u015Fiye atay\u0131n.", "Attribuez la demande \xE0 un membre de l\u2019espace.", "\u0623\u0633\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0625\u0644\u0649 \u0639\u0636\u0648 \u0641\u064A \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644."],
  "Lead not found.": ["Talep bulunamad\u0131.", "Demande introuvable.", "\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F."],
  "Lead limit reached or access was revoked.": ["Talep s\u0131n\u0131r\u0131na ula\u015F\u0131ld\u0131 veya eri\u015Fim kald\u0131r\u0131ld\u0131.", "Limite atteinte ou acc\xE8s retir\xE9.", "\u062A\u0645 \u0628\u0644\u0648\u063A \u0627\u0644\u062D\u062F \u0623\u0648 \u0623\u064F\u0644\u063A\u064A \u0627\u0644\u0648\u0635\u0648\u0644."],
  "This lead changed or access was revoked. Reload before saving.": ["Bu talep de\u011Fi\u015Fti veya eri\u015Fim kald\u0131r\u0131ld\u0131. Kaydetmeden \xF6nce yenileyin.", "Cette demande a chang\xE9. Rechargez avant d\u2019enregistrer.", "\u062A\u063A\u064A\u0651\u0631 \u0647\u0630\u0627 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631. \u0623\u0639\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u0641\u0638."],
  "Move the leads out of a stage before removing it.": ["A\u015Famay\u0131 kald\u0131rmadan \xF6nce i\xE7indeki talepleri ta\u015F\u0131y\u0131n.", "D\xE9placez les demandes avant de supprimer l\u2019\xE9tape.", "\u0627\u0646\u0642\u0644 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0642\u0628\u0644 \u062D\u0630\u0641 \u0627\u0644\u0645\u0631\u062D\u0644\u0629."],
  "Each stage needs a unique id and a name.": ["Her a\u015Faman\u0131n benzersiz bir ad\u0131 olmal\u0131.", "Chaque \xE9tape doit avoir un nom unique.", "\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0644\u0643\u0644 \u0645\u0631\u062D\u0644\u0629 \u0627\u0633\u0645 \u0641\u0631\u064A\u062F."],
  "Stages changed or access was revoked. Reload before saving.": ["A\u015Famalar de\u011Fi\u015Fti. Kaydetmeden \xF6nce yenileyin.", "Les \xE9tapes ont chang\xE9. Rechargez avant d\u2019enregistrer.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0627\u0644\u0645\u0631\u0627\u062D\u0644. \u0623\u0639\u062F \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0642\u0628\u0644 \u0627\u0644\u062D\u0641\u0638."],
  "Nothing to update.": ["G\xFCncellenecek bir \u015Fey yok.", "Rien \xE0 mettre \xE0 jour.", "\u0644\u0627 \u0634\u064A\u0621 \u0644\u0644\u062A\u062D\u062F\u064A\u062B."],
  "Choose a JPEG, PNG or WebP image.": ["JPEG, PNG veya WebP bir g\xF6rsel se\xE7in.", "Choisissez une image JPEG, PNG ou WebP.", "\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629 JPEG \u0623\u0648 PNG \u0623\u0648 WebP."],
  "Private menu drafts are not enabled in this environment.": ["Men\xFC taslaklar\u0131 hen\xFCz kullan\u0131lam\u0131yor.", "Les brouillons de menu ne sont pas encore disponibles.", "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u0628\u0639\u062F."],
  "Draft not found.": ["Taslak bulunamad\u0131.", "Brouillon introuvable.", "\u0627\u0644\u0645\u0633\u0648\u062F\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629."],
  "This draft changed. Reopen it before reviewing.": ["Taslak de\u011Fi\u015Fti. \u0130ncelemeden \xF6nce yeniden a\xE7\u0131n.", "Le brouillon a chang\xE9. Rouvrez-le.", "\u062A\u063A\u064A\u0651\u0631\u062A \u0627\u0644\u0645\u0633\u0648\u062F\u0629. \u0623\u0639\u062F \u0641\u062A\u062D\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629."],
  "Maximum 12 categories.": ["En fazla 12 kategori.", "12 cat\xE9gories maximum.", "12 \u0641\u0626\u0629 \u0643\u062D\u062F \u0623\u0642\u0635\u0649."],
  "Maximum 20 products per category.": ["Kategori ba\u015F\u0131na en fazla 20 \xFCr\xFCn.", "20 produits maximum par cat\xE9gorie.", "20 \u0645\u0646\u062A\u062C\u064B\u0627 \u0643\u062D\u062F \u0623\u0642\u0635\u0649 \u0644\u0643\u0644 \u0641\u0626\u0629."],
  "Maximum 100 products per menu.": ["Men\xFC ba\u015F\u0131na en fazla 100 \xFCr\xFCn.", "100 produits maximum par menu.", "100 \u0645\u0646\u062A\u062C \u0643\u062D\u062F \u0623\u0642\u0635\u0649 \u0644\u0643\u0644 \u0642\u0627\u0626\u0645\u0629."],
  "Name this scenario.": ["Bu senaryoya bir ad verin.", "Nommez ce sc\xE9nario.", "\u0633\u0645\u0650\u0651 \u0647\u0630\u0627 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648."],
  "Scenario limit reached or access revoked.": ["Senaryo s\u0131n\u0131r\u0131na ula\u015F\u0131ld\u0131.", "Limite de sc\xE9narios atteinte.", "\u062A\u0645 \u0628\u0644\u0648\u063A \u062D\u062F \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A."]
};
var IDX = { tr: 0, fr: 1, ar: 2 };
var GENERIC = { tr: "Bir sorun olu\u015Ftu. L\xFCtfen tekrar deneyin.", fr: "Une erreur est survenue. Veuillez r\xE9essayer.", ar: "\u062D\u062F\u062B \u062E\u0637\u0623. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649." };
function localizeError(message, lang2) {
  if (!message || lang2 === "en" || !(lang2 in IDX)) return message;
  const hit = T[message];
  if (hit) return hit[IDX[lang2]];
  if (lang2 === "tr" && /[ığüşöçİĞÜŞÖÇ]/.test(message)) return message;
  console.info("[AuraHub] untranslated server message:", message);
  return GENERIC[lang2];
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
function diagnose(profile) {
  const existing = new Set(profile.capabilities || []);
  if (profile.website) existing.add("website");
  const relevant = capabilities.filter((c) => !c.industry || c.industry === profile.industry);
  const demand = [profile.goals, profile.difficulties].join(" ");
  const visibility = /visibility|search|traffic|local|reservations|customers|görünür|visibilité|عملاء/i.test(demand);
  const conversion = /leads|sales|convert|bookings|ventes|satış|مبيعات/i.test(demand);
  const automation = /automat|follow.up|manual|messag|otomasyon|أتمتة/i.test(demand);
  const missions = relevant.filter((c) => !existing.has(c.id)).map((c) => {
    const [, reason, nextAction] = missionGuide[c.id];
    const prioritized = visibility && ["discovery", "seo", "reviews"].includes(c.id) || conversion && ["leads", "whatsapp", "crm"].includes(c.id) || automation && ["automation", "followups"].includes(c.id) || profile.industry === "restaurant" && ["discovery", "menu"].includes(c.id) || profile.industry === "ecommerce" && ["analytics", "conversion"].includes(c.id);
    const optional = c.optional === true || profile.budget === 0 && c.id === "automation";
    return {
      ...c,
      priority: prioritized && !optional ? 1 : c.priority,
      optional,
      objective: c.service,
      description: reason,
      reason,
      estimatedCost: null,
      currency: profile.currency || "USD",
      expectedBenefit: reason,
      nextAction,
      completionSource: "customer_reported"
    };
  });
  const strengths = relevant.filter((c) => existing.has(c.id)).map((c) => c.service);
  return {
    ruleVersion: "aura-readiness-2",
    source: "customer_entered",
    strengths,
    missing: missions.map((c) => c.id),
    readiness: Math.round(strengths.length / relevant.length * 100),
    budget: profile.budget ?? null,
    currency: profile.currency || "USD",
    missions,
    notice: "Readiness measures reported capabilities. Cost requires an approved quote. No purchase is required to complete a mission."
  };
}
function number2(value, key, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new ApiError(400, `Invalid ${key}.`);
  return value;
}
function simulate(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new ApiError(400, "Simulator inputs required.");
  const inputs = {};
  if (raw.solutions !== void 0 && (!Array.isArray(raw.solutions) || raw.solutions.length > capabilities.length || raw.solutions.some((id) => !capabilities.some((c) => c.id === id)))) throw new ApiError(400, "Invalid selected digital solutions.");
  inputs.solutions = [...new Set(raw.solutions || [])];
  for (const [k, max] of Object.entries({ visits: 1e9, leads: 1e9, customerValue: 1e9, monthlyCost: 1e9, setupCost: 1e9 })) inputs[k] = number2(raw[k], k, 0, max);
  inputs.closeRate = number2(raw.closeRate, "closeRate", 0, 100);
  inputs.margin = number2(raw.margin, "margin", 0, 100);
  if (inputs.leads > inputs.visits) throw new ApiError(400, "Leads cannot exceed visits in this website funnel.");
  inputs.currency = ["USD", "EUR", "TRY", "TND"].includes(raw.currency) ? raw.currency : "USD";
  if (!Array.isArray(raw.assumptions) || raw.assumptions.length !== 3) throw new ApiError(400, "Provide three scenario assumptions.");
  inputs.assumptions = raw.assumptions.map((a, i) => {
    if (!a || typeof a !== "object") throw new ApiError(400, "Invalid scenario.");
    return { name: ["conservative", "base", "ambitious"][i], trafficLift: number2(a.trafficLift, "trafficLift", 0, 300), leadRateLift: number2(a.leadRateLift, "leadRateLift", 0, 300), closeRateLift: number2(a.closeRateLift, "closeRateLift", 0, 300) };
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
var requestedLanguage = new URLSearchParams(location.search).get("lang");
var lang = Object.hasOwn(copy4, requestedLanguage) ? requestedLanguage : localStorage.getItem("aura-hub-language") || localStorage.getItem("aura-lang-choice-v3") || "en";
if (!Object.hasOwn(copy4, lang)) lang = "en";
function saveLanguage(value) {
  localStorage.setItem("aura-hub-language", value);
  if (["en", "tr", "ar"].includes(value)) localStorage.setItem("aura-lang-choice-v3", value);
  const url = new URL(location.href);
  if (value === "en") url.searchParams.delete("lang");
  else url.searchParams.set("lang", value);
  history.replaceState(history.state, "", url.pathname + url.search + url.hash);
}
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
var returnPath = ["login", "signup", "forgot"].includes(route) ? customerReturnPath(new URLSearchParams(location.search).get("next"), "") : customerReturnPath(location.pathname + location.search, "");
var authQuery = returnPath ? "?" + new URLSearchParams({ next: returnPath }) : "";
var authCapabilities = {};
var firstLogin = null;
function resumeShop() {
  if (!returnPath || returnPath === "/hub" || returnPath === location.pathname + location.search) return false;
  location.replace(returnPath);
  return true;
}
if (flowToken) history.replaceState(null, "", location.pathname + location.search);
var t = (k) => k === "menuDrafts" ? { en: "Menu drafts", ar: "\u0645\u0633\u0648\u062F\u0627\u062A \u0627\u0644\u0642\u0648\u0627\u0626\u0645", tr: "Men\xFC taslaklar\u0131", fr: "Brouillons de menus" }[lang] : copy4[lang][k] || copy4.en[k] || k;
var cap = (k) => capabilityNames[lang][k] || capabilities.find((c) => c.id === k)?.service || k;
var toast = (message) => {
  notice.textContent = message;
  notice.classList.add("visible");
  setTimeout(() => notice.classList.remove("visible"), 7e3);
};
var setupScope = "setup";
var disconnectAuri = () => {
};
var disconnectDesk = () => {
};
var auriLevel = () => workspace?.auri?.level || 1;
var feature = (name) => workspace?.features?.[name] !== false;
var auriPreference = () => workspace?.auriPreferences || { name: "Auri", hidden: false };
var auriSessions = /* @__PURE__ */ new Map();
var auriVoice = null;
var setupAuriName = "";
var setupDeferred = [];
var guideCharacter = () => auriCharacter(3, { variant: "guide" });
var guideThreads = /* @__PURE__ */ new Map();
function guideAt(host, scope, context) {
  const key = me.id + ":" + (workspace?.organization.id || "new");
  if (!guideThreads.has(key)) guideThreads.set(key, []);
  mountGuide(host, { lang, esc: esc2, api, turns: guideThreads.get(key), scope, context });
}
var brandMarkup = '<span class="hub-brand-tile"><img class="hub-brand-logo" src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span>';
var robot = () => auriCharacter(auriLevel());
function bindAuri(host, scope) {
  disconnectAuri();
  disconnectAuri = connectAuri(host, scope, { idle: auriControls(lang).ready, ...auriLabels(lang) });
}
async function finishSetup() {
  await runAuri(setupScope, "working", async () => {
    await persistProfile();
    if (mode === "auri" && setupAuriName.trim()) await updateAuriPreferences({ name: setupAuriName });
  });
  setupAuriName = "";
  setupDeferred = [];
  editing = false;
  navigate("home", {}, true, false);
  await loadWorkspace();
  pulseAuri(workspace.organization.id, "success");
}
async function generateRoadmap() {
  const id = workspace.organization.id;
  await runAuri(id, "working", async () => {
    await api(endpoint("missions"), "POST", {});
    await loadWorkspace(id);
  });
}
async function api(path2, method = "GET", body, { timeout = method === "GET" ? 15e3 : 45e3 } = {}) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), timeout);
  let response;
  try {
    response = await fetch(path2, { method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : void 0, signal: controller.signal });
  } catch (cause) {
    const error = new Error(osCopy(lang).state[cause?.name === "AbortError" ? "timeout" : "offline"]);
    error.status = 0;
    error.network = true;
    throw error;
  } finally {
    clearTimeout(timer);
  }
  const data = await response.json().catch(() => ({ error: t("error") }));
  if (!response.ok) {
    if (response.status === 401 && me && path2.startsWith("/api/hub/")) {
      location.assign("/hub/login?" + new URLSearchParams({ next: location.pathname + location.search }));
    }
    const error = new Error(localizeError(data.error, lang) || t("error"));
    error.status = response.status;
    error.serverMessage = data.error;
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
    saveLanguage(lang);
    render();
  });
}
function render() {
  disconnectAuri();
  disconnectDesk();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  const skip = document.querySelector(".skip");
  if (skip) skip.textContent = osCopy(lang).state.skip;
  app.setAttribute("aria-busy", "false");
  if (!me || ["verify", "reset", "forgot", "invitation", "confirm-email"].includes(route)) {
    renderGate();
    return;
  }
  if (page === "onboarding" && (!workspace || !workspace.missions.length && workspace.permissions.includes("profile:write") && workspace.permissions.includes("roadmap:write"))) {
    openFirstLogin();
    return;
  }
  if (editing) {
    renderSetup();
    return;
  }
  renderShell();
}
var intakeKey = () => `aura-intake:${me.id}:${workspace?.organization.id || "new"}`;
function openFirstLogin() {
  const key = intakeKey();
  if (!firstLogin) {
    const initial = createOnboarding();
    if (workspace) {
      initial.values = { ...workspace.profile };
      initial.phase = "entry";
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      firstLogin = saved ? { ...initial, ...saved, answered: new Set(saved.answered) } : initial;
    } catch {
      firstLogin = initial;
    }
  }
  renderOnboarding({
    app,
    state: firstLogin,
    lang,
    t,
    esc: esc2,
    robot: guideCharacter,
    guide: (host) => guideAt(host, setupScope, () => firstLogin?.values),
    header: `<header class="gate-header command-gate-header"><a href="${esc2(link("home"))}" class="wordmark">${brandMarkup}</a>${languageControl()}</header>`,
    bind: () => {
      bindCommon();
      bindAuri(document.querySelector(".auri-setup-character"), setupScope);
    },
    save: ({ busy, ...state2 }) => {
      try {
        sessionStorage.setItem(key, JSON.stringify({ ...state2, answered: [...state2.answered] }));
      } catch {
      }
    },
    analyze: (text) => api("/api/hub/onboarding/analyze", "POST", { text }),
    complete: async (values, requestId) => {
      const profile = { ...emptyProfile(), ...values };
      const source = firstLogin.text.trim();
      const created = workspace ? await api(endpoint("missions"), "POST", { personalized: true, profile, lang, source }) : await api("/api/hub/workspaces", "POST", { profile, mode: "auri", requestId, personalized: true, lang, source });
      const next = await api("/api/hub/workspaces/" + created.id);
      workspace = next;
      if (!workspaces.some((org) => org.id === created.id)) workspaces.push({ ...next.organization });
      try {
        sessionStorage.removeItem(key);
      } catch {
      }
      firstLogin = null;
      navigate("journey");
      pulseAuri(created.id, "success");
      if (created.planFallback) toast(dashCopy(lang).planFallback);
    }
  });
}
function gateFrame(content2) {
  app.innerHTML = `<header class="gate-header command-gate-header"><a href="/hub" class="wordmark">${brandMarkup}</a>${languageControl()}</header><main id="main" class="gate command-gate">${content2}</main>`;
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
  if (route === "confirm-email") {
    const copy5 = accountSettingsCopy(lang);
    gateFrame(`<section class="panel"><h1>${copy5[13]}</h1><p role="status" data-confirm-result></p>${button("confirm", "confirm-email")}<a href="/hub/login">${esc2(t("signIn"))}</a></section>`);
    const action = document.querySelector("[data-action=confirm-email]"), status = document.querySelector("[data-confirm-result]");
    action.onclick = async () => {
      action.disabled = true;
      try {
        const result2 = await api("/api/customer/confirm-email-change", "POST", { token: flowToken });
        flowToken = "";
        status.textContent = copy5[result2.complete ? 15 : 14];
      } catch (error) {
        status.textContent = error.message;
        action.disabled = false;
      }
    };
    return;
  }
  if (route === "verify") {
    gateFrame(`<section class="panel">${robot()}<h1>${t("verify")}</h1><p id="verification-result" role="status"></p>${button("confirm", "verify")}<a href="/hub">${t("brand")}</a></section>`);
    document.querySelector('[data-action="verify"]').onclick = async (e) => {
      const confirmButton = e.target;
      confirmButton.disabled = true;
      try {
        await api("/api/customer/verify", "POST", { token: flowToken });
        flowToken = "";
        document.querySelector("#verification-result").textContent = t("verified");
      } catch (error) {
        document.querySelector("#verification-result").textContent = error.message;
        confirmButton.disabled = false;
      }
    };
    return;
  }
  const signup = route === "signup", forgot = route === "forgot", reset = route === "reset";
  authScreen({ signup, forgot, reset });
}
var AL = {
  en: { side: "Your business, one account.", sideSub: "Roadmap, services, shop orders and Auri \u2014 all in AuraHub.", b1: "Growth roadmap built with Auri", b2: "Track services, requests and approvals", b3: "NFC card and shop orders in one place", b4: "Invoices, deliveries and renewals", signInTab: "Sign in", signupTab: "Create account", hello: "Welcome back", helloSub: "Sign in to continue to AuraHub.", create: "Create your free account", createSub: "Takes less than a minute.", google: "Continue with Google", googleSoon: "Google sign-in is being set up \u2014 please use email for now.", or: "or with email", show: "Show", hide: "Hide", pwHint: "At least 12 characters. Use a short sentence you can remember.", weak: "Too short", ok: "Good", strong: "Strong", human: "Please complete the human verification check.", forgotQ: "Forgot password?", back: "Back to website", help: "Need help?", checkTitle: "Check your inbox", checkSub: "We sent a verification link to", checkTip: "Open the email and tap the link to verify your account. Check spam if you do not see it.", resend: "Resend email", resent: "Verification email sent again.", wait: "You can resend in", continueHub: "Continue to AuraHub", terms: "I accept the AuraDigital account conditions.", forgotTitle: "Reset your password", forgotSub: "Enter your email and we will send you a reset link.", resetTitle: "Choose a new password", secure: "Protected by Cloudflare" },
  tr: { side: "\u0130\u015Fletmeniz, tek hesap.", sideSub: "Yol haritas\u0131, hizmetler, ma\u011Faza sipari\u015Fleri ve Auri \u2014 hepsi AuraHub\u2019da.", b1: "Auri ile b\xFCy\xFCme yol haritas\u0131", b2: "Hizmet, talep ve onaylar\u0131 takip edin", b3: "NFC kart ve ma\u011Faza sipari\u015Fleri tek yerde", b4: "Faturalar, teslimatlar ve yenilemeler", signInTab: "Giri\u015F yap", signupTab: "Hesap olu\u015Ftur", hello: "Tekrar ho\u015F geldiniz", helloSub: "AuraHub\u2019a devam etmek i\xE7in giri\u015F yap\u0131n.", create: "\xDCcretsiz hesab\u0131n\u0131z\u0131 olu\u015Fturun", createSub: "Bir dakikadan k\u0131sa s\xFCrer.", google: "Google ile devam et", googleSoon: "Google ile giri\u015F haz\u0131rlan\u0131yor \u2014 \u015Fimdilik e-posta kullan\u0131n.", or: "veya e-posta ile", show: "G\xF6ster", hide: "Gizle", pwHint: "En az 12 karakter. Hat\u0131rlayabilece\u011Finiz k\u0131sa bir c\xFCmle kullan\u0131n.", weak: "\xC7ok k\u0131sa", ok: "\u0130yi", strong: "G\xFC\xE7l\xFC", human: "L\xFCtfen insan do\u011Frulamas\u0131n\u0131 tamamlay\u0131n.", forgotQ: "\u015Eifremi unuttum", back: "Siteye d\xF6n", help: "Yard\u0131m", checkTitle: "Gelen kutunuzu kontrol edin", checkSub: "Do\u011Frulama ba\u011Flant\u0131s\u0131n\u0131 g\xF6nderdik:", checkTip: "E-postay\u0131 a\xE7\u0131p ba\u011Flant\u0131ya dokunun. G\xF6rm\xFCyorsan\u0131z spam klas\xF6r\xFCne bak\u0131n.", resend: "Tekrar g\xF6nder", resent: "Do\u011Frulama e-postas\u0131 tekrar g\xF6nderildi.", wait: "Tekrar g\xF6nderme:", continueHub: "AuraHub\u2019a devam et", terms: "AuraDigital hesap ko\u015Fullar\u0131n\u0131 kabul ediyorum.", forgotTitle: "\u015Eifrenizi s\u0131f\u0131rlay\u0131n", forgotSub: "E-postan\u0131z\u0131 girin, s\u0131f\u0131rlama ba\u011Flant\u0131s\u0131 g\xF6nderelim.", resetTitle: "Yeni \u015Fifre belirleyin", secure: "Cloudflare ile korunuyor" },
  ar: { side: "\u0639\u0645\u0644\u0643\u060C \u062D\u0633\u0627\u0628 \u0648\u0627\u062D\u062F.", sideSub: "\u0627\u0644\u062E\u0637\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631 \u0648\u0623\u0648\u0631\u064A \u2014 \u0643\u0644\u0647\u0627 \u0641\u064A AuraHub.", b1: "\u062E\u0637\u0629 \u0646\u0645\u0648 \u0645\u0639 \u0623\u0648\u0631\u064A", b2: "\u062A\u0627\u0628\u0639 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0627\u062A", b3: "\u0637\u0644\u0628\u0627\u062A \u0628\u0637\u0627\u0642\u0627\u062A NFC \u0648\u0627\u0644\u0645\u062A\u062C\u0631 \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F", b4: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u062A\u0633\u0644\u064A\u0645\u0627\u062A \u0648\u0627\u0644\u062A\u062C\u062F\u064A\u062F\u0627\u062A", signInTab: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", signupTab: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628", hello: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0639\u0648\u062F\u062A\u0643", helloSub: "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0625\u0644\u0649 AuraHub.", create: "\u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u0645\u062C\u0627\u0646\u064A", createSub: "\u064A\u0633\u062A\u063A\u0631\u0642 \u0623\u0642\u0644 \u0645\u0646 \u062F\u0642\u064A\u0642\u0629.", google: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google", googleSoon: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 Google \u0642\u064A\u062F \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u2014 \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0622\u0646.", or: "\u0623\u0648 \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", show: "\u0625\u0638\u0647\u0627\u0631", hide: "\u0625\u062E\u0641\u0627\u0621", pwHint: "12 \u062D\u0631\u0641\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644. \u0627\u0633\u062A\u062E\u062F\u0645 \u062C\u0645\u0644\u0629 \u0642\u0635\u064A\u0631\u0629 \u062A\u062A\u0630\u0643\u0631\u0647\u0627.", weak: "\u0642\u0635\u064A\u0631\u0629 \u062C\u062F\u0627\u064B", ok: "\u062C\u064A\u062F\u0629", strong: "\u0642\u0648\u064A\u0629", human: "\u064A\u0631\u062C\u0649 \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0628\u0634\u0631\u064A.", forgotQ: "\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F", back: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u0648\u0642\u0639", help: "\u0645\u0633\u0627\u0639\u062F\u0629", checkTitle: "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0628\u0631\u064A\u062F\u0643", checkSub: "\u0623\u0631\u0633\u0644\u0646\u0627 \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u062D\u0642\u0642 \u0625\u0644\u0649", checkTip: "\u0627\u0641\u062A\u062D \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u0636\u063A\u0637 \u0627\u0644\u0631\u0627\u0628\u0637 \u0644\u062A\u0623\u0643\u064A\u062F \u062D\u0633\u0627\u0628\u0643. \u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u063A\u064A\u0631 \u0627\u0644\u0645\u0631\u063A\u0648\u0628\u0629.", resend: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644", resent: "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u062D\u0642\u0642.", wait: "\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0625\u0639\u0627\u062F\u0629 \u0628\u0639\u062F", continueHub: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0625\u0644\u0649 AuraHub", terms: "\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u062D\u0633\u0627\u0628 AuraDigital.", forgotTitle: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", forgotSub: "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u0643 \u0648\u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0627\u0628\u0637\u0627\u064B.", resetTitle: "\u0627\u062E\u062A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629", secure: "\u0645\u062D\u0645\u064A \u0628\u0648\u0627\u0633\u0637\u0629 Cloudflare" },
  fr: { side: "Votre entreprise, un seul compte.", sideSub: "Feuille de route, services, commandes et Auri \u2014 tout dans AuraHub.", b1: "Feuille de route avec Auri", b2: "Suivez services, demandes et validations", b3: "Cartes NFC et commandes au m\xEAme endroit", b4: "Factures, livraisons et renouvellements", signInTab: "Connexion", signupTab: "Cr\xE9er un compte", hello: "Bon retour", helloSub: "Connectez-vous pour continuer vers AuraHub.", create: "Cr\xE9ez votre compte gratuit", createSub: "Moins d\u2019une minute.", google: "Continuer avec Google", googleSoon: "La connexion Google arrive bient\xF4t \u2014 utilisez l\u2019e-mail pour le moment.", or: "ou par e-mail", show: "Afficher", hide: "Masquer", pwHint: "Au moins 12 caract\xE8res. Une courte phrase facile \xE0 retenir.", weak: "Trop court", ok: "Bien", strong: "Fort", human: "Veuillez compl\xE9ter la v\xE9rification humaine.", forgotQ: "Mot de passe oubli\xE9 ?", back: "Retour au site", help: "Aide", checkTitle: "V\xE9rifiez votre bo\xEEte mail", checkSub: "Nous avons envoy\xE9 un lien de v\xE9rification \xE0", checkTip: "Ouvrez l\u2019e-mail et touchez le lien. Pensez aux spams.", resend: "Renvoyer", resent: "E-mail de v\xE9rification renvoy\xE9.", wait: "Renvoi possible dans", continueHub: "Continuer vers AuraHub", terms: "J\u2019accepte les conditions du compte AuraDigital.", forgotTitle: "R\xE9initialiser le mot de passe", forgotSub: "Saisissez votre e-mail pour recevoir un lien.", resetTitle: "Choisissez un nouveau mot de passe", secure: "Prot\xE9g\xE9 par Cloudflare" }
};
var al = (k) => (AL[lang] || AL.en)[k] || AL.en[k];
var tsToken = "";
var tsWidget = null;
function mountTurnstile() {
  const key = authCapabilities.turnstile, el = document.querySelector("#ad-turnstile");
  tsToken = "";
  if (!key || !el) return;
  const render2 = () => {
    try {
      tsWidget = window.turnstile.render(el, { sitekey: key, theme: "auto", language: lang, callback: (v) => {
        tsToken = v;
      }, "expired-callback": () => {
        tsToken = "";
      }, "error-callback": () => {
        tsToken = "";
      } });
    } catch {
    }
  };
  if (window.turnstile) return render2();
  let sc = document.querySelector("script[data-turnstile]");
  if (!sc) {
    sc = document.createElement("script");
    sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    sc.async = true;
    sc.defer = true;
    sc.dataset.turnstile = "1";
    document.head.appendChild(sc);
  }
  sc.addEventListener("load", render2, { once: true });
}
function resetTurnstile() {
  tsToken = "";
  try {
    if (window.turnstile && tsWidget !== null) window.turnstile.reset(tsWidget);
  } catch {
  }
}
var googleIcon = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
function authScreen({ signup, forgot, reset }) {
  const mode2 = reset ? "reset" : forgot ? "forgot" : signup ? "signup" : "login";
  const title = mode2 === "login" ? al("hello") : mode2 === "signup" ? al("create") : mode2 === "forgot" ? al("forgotTitle") : al("resetTitle");
  const sub = mode2 === "login" ? al("helloSub") : mode2 === "signup" ? al("createSub") : mode2 === "forgot" ? al("forgotSub") : al("pwHint");
  const inp = (name, type, label, extra, icon3) => `<label class="ad-field"><span>${esc2(label)}</span><span class="ad-input">${icon3}<input name="${name}" type="${type}" ${extra}></span></label>`;
  const ic = { user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>', mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z"/><path d="m3 6 9 7 9-7"/></svg>', lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' };
  const pw = mode2 === "forgot" ? "" : `<label class="ad-field"><span>${esc2(t(reset ? "newPassword" : "password"))}</span><span class="ad-input">${ic.lock}<input name="password" type="password" required ${mode2 !== "login" ? 'minlength="12" ' : ""}maxlength="72" autocomplete="${mode2 === "login" ? "current-password" : "new-password"}"><button type="button" class="ad-eye" data-eye aria-pressed="false">${al("show")}</button></span>${mode2 !== "login" ? `<span class="ad-hint" id="ad-pw-hint">${al("pwHint")}</span><span class="ad-meter" aria-hidden="true"><i></i></span>` : ""}</label>`;
  const tabs = mode2 === "login" || mode2 === "signup" ? `<nav class="ad-tabs" aria-label="Account"><a href="/hub/login${authQuery}" ${mode2 === "login" ? 'aria-current="page"' : ""}>${al("signInTab")}</a><a href="/hub/signup${authQuery}" ${mode2 === "signup" ? 'aria-current="page"' : ""}>${al("signupTab")}</a></nav>` : "";
  const googleBlock = mode2 === "login" || mode2 === "signup" ? `<button type="button" class="ad-google" data-google ${authCapabilities.google ? "" : 'aria-disabled="true"'}>${googleIcon}<span>${al("google")}</span></button>${authCapabilities.google ? "" : `<p class="ad-note">${al("googleSoon")}</p>`}<div class="ad-or"><span>${al("or")}</span></div>` : "";
  const termsBox = mode2 === "login" || mode2 === "signup" ? `<label class="ad-check"><input type="checkbox" name="terms" ${mode2 === "signup" ? "required" : ""}><span>${al("terms")}</span></label>` : "";
  app.innerHTML = `<div class="ad-auth">
 <aside class="ad-side"><a href="/" class="ad-logo"><span class="hub-brand-tile"><img src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span></a>
  <div class="ad-side-body"><h2>${al("side")}</h2><p>${al("sideSub")}</p><ul>${["b1", "b2", "b3", "b4"].map((k) => `<li><span aria-hidden="true">\u2713</span>${al(k)}</li>`).join("")}</ul></div>
  <div class="ad-side-foot">${robot()}<span>info@auradigitalworks.com \xB7 +90 538 550 76 74</span></div></aside>
 <main id="main" class="ad-main"><div class="ad-top"><a href="/" class="ad-logo ad-logo-sm"><span class="hub-brand-tile"><img src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span></a>${languageControl()}</div>
  <section class="ad-card">${tabs}<h1>${esc2(title)}</h1><p class="ad-sub">${esc2(sub)}</p>${googleBlock}
   <form id="auth-form" novalidate>${mode2 === "signup" ? inp("name", "text", t("name"), 'required minlength="2" maxlength="100" autocomplete="name"', ic.user) : ""}${mode2 === "reset" ? "" : inp("email", "email", t("email"), 'required maxlength="254" autocomplete="email" inputmode="email"', ic.mail)}${pw}
    ${mode2 === "login" && authCapabilities.email ? `<a class="ad-forgot" href="/hub/forgot${authQuery}">${al("forgotQ")}</a>` : ""}
    ${termsBox}
    ${authCapabilities.turnstile && mode2 !== "reset" ? '<div id="ad-turnstile" class="ad-turnstile"></div>' : ""}
    <p class="form-error ad-error" role="alert"></p>
    <button type="submit" class="ad-submit">${esc2(t(reset ? "reset" : forgot ? "continue" : signup ? "signup" : "signIn"))} \u2192</button>
   </form>
   ${mode2 === "forgot" || mode2 === "reset" ? `<a class="ad-switch" href="/hub/login${authQuery}">\u2190 ${al("signInTab")}</a>` : ""}
   ${authCapabilities.turnstile ? `<p class="ad-secure">\u{1F512} ${al("secure")}</p>` : ""}
  </section>
  <footer class="ad-foot"><a href="/">\u2190 ${al("back")}</a><a href="/help">${al("help")}</a><a href="https://wa.me/905385507674">WhatsApp</a></footer>
 </main></div>`;
  bindCommon();
  mountTurnstile();
  const form = document.querySelector("#auth-form"), err = form.querySelector('[role="alert"]');
  const pwInput = form.querySelector('input[name="password"]');
  form.querySelector("[data-eye]")?.addEventListener("click", (e) => {
    const b = e.currentTarget, shown = pwInput.type === "text";
    pwInput.type = shown ? "password" : "text";
    b.textContent = shown ? al("show") : al("hide");
    b.setAttribute("aria-pressed", String(!shown));
  });
  if (pwInput && mode2 !== "login") pwInput.addEventListener("input", () => {
    const n = pwInput.value.length, m = form.querySelector(".ad-meter i"), h = form.querySelector("#ad-pw-hint");
    const lvl = n < 12 ? 1 : n < 16 ? 2 : 3;
    m.style.width = Math.min(100, n / 16 * 100) + "%";
    m.dataset.level = lvl;
    h.textContent = n ? `${al(lvl === 1 ? "weak" : lvl === 2 ? "ok" : "strong")} \xB7 ${n}/12+` : al("pwHint");
  });
  document.querySelector("[data-google]")?.addEventListener("click", () => {
    if (!authCapabilities.google) {
      toast(al("googleSoon"));
      return;
    }
    const terms = form.querySelector('input[name="terms"]');
    if (terms && !terms.checked) {
      err.textContent = al("terms");
      terms.focus();
      return;
    }
    if (route === "invitation") toast(t("googleInvite"));
    location.assign("/api/customer/google/start?" + new URLSearchParams({ acceptTerms: "true", ...returnPath ? { next: returnPath } : {} }));
  });
  form.onsubmit = async (e) => {
    e.preventDefault();
    err.textContent = "";
    if (!form.checkValidity()) {
      const bad = form.querySelector(":invalid");
      err.textContent = bad?.validationMessage || t("required");
      bad?.focus();
      return;
    }
    if (authCapabilities.turnstile && mode2 !== "reset" && !tsToken) {
      err.textContent = al("human");
      return;
    }
    const b = form.querySelector(".ad-submit"), data = new FormData(form);
    b.disabled = true;
    try {
      if (forgot) {
        await api("/api/customer/forgot-password", "POST", { email: data.get("email"), turnstileToken: tsToken });
        toast(t("resetSent"));
        resetTurnstile();
      } else if (reset) {
        await api("/api/customer/reset-password", "POST", { token: flowToken, password: data.get("password") });
        location.assign("/hub/login" + authQuery);
      } else {
        await api("/api/customer/" + (signup ? "register" : "login"), "POST", { name: data.get("name"), email: data.get("email"), password: data.get("password"), acceptTerms: data.has("terms"), turnstileToken: tsToken });
        if (signup && authCapabilities.email) {
          const sent = await api("/api/customer/send-verification", "POST", {}).then(() => true).catch(() => false);
          if (sent) {
            verifyPending(String(data.get("email") || ""));
            return;
          }
        }
        if (route !== "invitation" && resumeShop()) return;
        if (route !== "invitation") {
          const dest = returnPath && returnPath.startsWith("/hub") ? returnPath : "/hub";
          history.replaceState(null, "", dest);
        }
        route = route === "invitation" ? "invitation" : "";
        await load();
      }
    } catch (error) {
      err.textContent = error.message;
      resetTurnstile();
    } finally {
      b.disabled = false;
    }
  };
}
function verifyPending(email) {
  app.innerHTML = `<div class="ad-auth ad-auth-single"><main id="main" class="ad-main"><div class="ad-top"><a href="/" class="ad-logo ad-logo-sm"><span class="hub-brand-tile"><img src="/media/redesign/ad-monogram.png" alt="" width="27" height="13"></span><span>AuraDigital</span></a>${languageControl()}</div>
 <section class="ad-card ad-center"><div class="ad-mail" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><path d="m3 6 9 7 9-7"/></svg></div><h1>${al("checkTitle")}</h1><p class="ad-sub">${al("checkSub")} <strong>${esc2(email)}</strong></p><p class="ad-sub">${al("checkTip")}</p>
 <button type="button" class="ad-google" data-resend>${al("resend")}</button><p class="ad-note" id="ad-resend-note" role="status"></p><button type="button" class="ad-submit" data-continue>${al("continueHub")} \u2192</button></section></main></div>`;
  bindCommon();
  const btn = document.querySelector("[data-resend]"), note = document.querySelector("#ad-resend-note");
  let wait = 30;
  const tick = () => {
    if (wait > 0) {
      btn.disabled = true;
      note.textContent = `${al("wait")} ${wait}s`;
      wait--;
      setTimeout(tick, 1e3);
    } else {
      btn.disabled = false;
      note.textContent = "";
    }
  };
  tick();
  btn.onclick = async () => {
    btn.disabled = true;
    try {
      await api("/api/customer/send-verification", "POST", {});
      note.textContent = al("resent");
    } catch (e) {
      note.textContent = e.message;
    }
    wait = 30;
    setTimeout(tick, 1500);
  };
  document.querySelector("[data-continue]").onclick = async () => {
    if (resumeShop()) return;
    route = "";
    await load();
  };
}
function avatar(cls = "hx-avatar small") {
  const initial = esc2(String(me?.name || "?").trim()[0]?.toUpperCase() || "?");
  return me?.photo ? `<span class="${cls} os-photo" aria-hidden="true"><img src="${esc2(me.photo)}" alt="" width="40" height="40"></span>` : `<span class="${cls}" aria-hidden="true">${initial}</span>`;
}
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file?.type || "") || file.size > 12e6) {
      reject(new Error(osCopy(lang).photo.invalid));
      return;
    }
    const reader = new FileReader(), img = new Image();
    img.onload = () => {
      const size = 256, canvas = Object.assign(document.createElement("canvas"), { width: size, height: size }), ctx = canvas.getContext("2d");
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      let data = canvas.toDataURL("image/webp", 0.84);
      if (!data.startsWith("data:image/webp")) data = canvas.toDataURL("image/jpeg", 0.84);
      resolve(data);
    };
    img.onerror = () => reject(new Error(osCopy(lang).photo.invalid));
    reader.onerror = () => reject(new Error(osCopy(lang).photo.invalid));
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function photoCard(host) {
  const p = osCopy(lang).photo, section = document.createElement("section");
  section.className = "os-card os-photo-card";
  const draw = () => {
    section.innerHTML = `<div class="os-photo-row">${avatar("os-photo-preview")}<div><h2>${esc2(p.title)}</h2><p class="os-muted">${esc2(p.hint)}</p>
   <div class="os-inline-actions"><label class="os-btn is-quiet is-sm">${icon2("user", 16)}<span>${esc2(me.photo ? p.change : p.upload)}</span><input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" data-photo-input></label>
   ${me.photo ? `<button type="button" class="os-btn is-quiet is-sm" data-photo-remove>${esc2(p.remove)}</button>` : ""}</div><p class="os-error" role="alert"></p></div></div>`;
    const alert = section.querySelector("[role=alert]");
    section.querySelector("[data-photo-input]").onchange = async (e) => {
      const input = e.target;
      input.disabled = true;
      alert.textContent = "";
      try {
        const data = await resizePhoto(input.files[0]);
        const r = await api("/api/hub/me/photo", "PUT", { photo: data });
        me.photo = r.photo;
        toast(p.saved);
        render();
      } catch (error) {
        alert.textContent = error.message;
        input.disabled = false;
      }
    };
    section.querySelector("[data-photo-remove]")?.addEventListener("click", async (e) => {
      e.currentTarget.disabled = true;
      try {
        await api("/api/hub/me/photo", "DELETE");
        me.photo = null;
        toast(p.removed);
        render();
      } catch (error) {
        alert.textContent = error.message;
      }
    });
  };
  draw();
  host.prepend(section);
}
var emptyProfile = () => ({ name: "", industry: "other", country: "", city: "", stage: "", website: "", tools: "", acquisition: "", difficulties: "", goals: "", timeline: "", industryDetails: "", budget: null, currency: "USD", capabilities: [] });
function profileField(k) {
  if (k === "roadmapPreview") {
    const proposed = diagnose(draft).missions.map((m) => ({ ...m, capability: m.id, status: "planned" }));
    const labels3 = blueprintLabels(lang);
    const first = eligibleMissions(proposed, draft).slice(0, 3);
    return `<fieldset><legend>${esc2(roadmapLabels(lang).priority)}</legend>${first.length ? first.map((m) => `<label class="check">
   <input type="checkbox" name="deferredMission" value="${esc2(m.id)}" ${setupDeferred.includes(m.id) ? "checked" : ""}>
   ${esc2(labels3.later)} \xB7 ${esc2(cap(m.id))}</label>`).join("") : `<p>${esc2(t("empty"))}</p>`}</fieldset>`;
  }
  if (k === "auriName") return field(k, auriControls(lang).name, setupAuriName, "text", 'maxlength="24"');
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
  const setupKeys = workspace ? profileKeys : mode === "auri" ? ["name", "industry", "industryDetails", "goals", "capabilities", "auriName", "roadmapPreview"] : ["name", "industry", "goals", "budget", "currency", "website", "capabilities"];
  app.innerHTML = `<header class="gate-header command-gate-header"><a href="/hub" class="wordmark">${brandMarkup}</a>${languageControl()}</header><main class="setup command-setup" id="main"><div class="setup-heading"><p class="eyebrow">AuraHub</p><h1>${choosing ? commandLabels(lang).onboarding : esc2(draft.name || t("profile"))}</h1><p>${choosing ? t("choose") : t(mode === "auri" ? "auriText" : "myselfText")}</p></div>${choosing ? `<div class="mode-grid"><button class="mode-card" data-mode="myself"><span class="mode-icon">\u2197</span><h2>${t("myself")}</h2><p>${t("myselfText")}</p><span>${t("continue")} \u2192</span></button><button class="mode-card dark" data-mode="auri">${robot()}<h2>${t("auri")}</h2><p>${t("auriText")}</p><span>${t("continue")} \u2192</span></button></div>` : `<section class="panel profile-panel"><div class="panel-bar"><span>${mode === "auri" ? `Auri \xB7 ${step + 1}/${setupKeys.length}` : t("profile")}</span><span id="save-state" role="status"></span>${button("switchMode", "switch-mode", true)}</div>${mode === "auri" ? `<div class="auri-onboarding">${auriCharacter(auriLevel())}<p data-auri-status role="status"></p></div>` : ""}<form id="profile-form" class="${mode === "auri" ? "guided" : "form-grid"}">${(mode === "auri" ? [setupKeys[step]] : setupKeys).map(profileField).join("")}<div class="actions full">${mode === "auri" ? button("back", "back-step", true, step === 0) + button("skip", "skip-step", true, step === 0) : ""}<button class="primary" type="submit">${t(mode === "auri" && step < setupKeys.length - 1 ? "continue" : "save")}</button>${workspace ? button("home", "leave-setup", true) : ""}</div><p class="form-error full" role="alert"></p></form></section>`}</main>`;
  bindCommon();
  document.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => {
    mode = b.dataset.mode;
    editing = true;
    step = 0;
    setupAuriName = "";
    setupDeferred = [];
    render();
  });
  if (choosing) return;
  const form = document.querySelector("#profile-form");
  const avatar2 = document.querySelector(".auri-onboarding");
  if (avatar2) {
    bindAuri(avatar2, setupScope);
    pulseAuri(setupScope, "listening", 950);
  }
  const collect = () => {
    const data = new FormData(form);
    if (data.has("auriName")) setupAuriName = data.get("auriName");
    if (form.querySelector("[name=deferredMission]")) setupDeferred = data.getAll("deferredMission");
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
        await finishSetup();
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
        await finishSetup();
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
      navigate("home", {}, false, false);
      await loadWorkspace();
    } catch (e) {
      toast(e.message);
    }
  });
}
function persistProfile() {
  if (!draft.name.trim()) return Promise.resolve();
  const snapshot = structuredClone(draft), selectedMode = mode;
  const deferredMissions = selectedMode === "auri" ? setupDeferred.filter((id) => diagnose(snapshot).missions.some((m) => m.id === id)) : [];
  const job = saveQueue.catch(() => {
  }).then(async () => {
    const status = document.querySelector("#save-state");
    if (status) status.textContent = t("saving");
    if (!workspace) {
      const created = await api("/api/hub/workspaces", "POST", { profile: snapshot, mode: selectedMode, deferredMissions });
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
var workspaceSwitch = null;
var requestDrafts = /* @__PURE__ */ new Map();
var pageGroup = { tasks: "journey", projects: "services", websites: "services", hosting: "services", invoices: "orders" };
var moreNavigation = ["profile", "simulator", "menuDrafts", "projects", "websites", "hosting", "files", "reports", "invoices", "rewards", "team", "support"];
var link = (target, params) => hubLink(target, workspace?.organization.id, params);
var requestLink = (service = "", task = "") => link("requests", { new: "1", service, task });
var query = new URLSearchParams(location.search);
function syncLocation() {
  ({ page, query } = currentHubLocation());
  selectedMission = query.get("task");
}
function navigate(target, params, replace = false, doRender = true) {
  history[replace ? "replaceState" : "pushState"](null, "", link(target, params));
  syncLocation();
  editing = false;
  if (doRender) {
    render();
    document.querySelector("#main")?.focus();
  }
}
window.addEventListener("popstate", () => {
  if (me) {
    editing = false;
    firstLogin = null;
    void load();
  }
});
function renderShell() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  const labels3 = hubLabels(lang), l = roadmapLabels(lang), nv = navCopy(lang), oc = osCopy(lang);
  const view = query.get("view") || "pipeline";
  const active = page === "studio" ? ["website", "menu"].includes(view) ? "site" : view === "analytics" ? "analytics" : "studio" : pageGroup[page] || page;
  const can = (permission) => !workspace || workspace.permissions.includes(permission);
  const items = {
    home: { label: oc.nav.overview, icon: "overview" },
    profile: { label: oc.nav.business, icon: "business" },
    journey: { label: oc.nav.journey, icon: "journey" },
    studio: { label: oc.nav.studio, icon: "studio", href: link("studio", { view: "pipeline" }) },
    services: { label: oc.nav.services, icon: "services" },
    site: { label: oc.nav.site, icon: "site", href: link("studio", { view: "website" }) },
    analytics: { label: oc.nav.analytics, icon: "analytics", href: link("studio", { view: "analytics" }) },
    assistant: { label: oc.nav.assistant, icon: "auri" },
    requests: { label: oc.nav.requests, icon: "requests" },
    menuDrafts: { label: oc.nav.menuDrafts, icon: "menuDrafts" },
    orders: { label: oc.nav.orders, icon: "orders", href: "/account" },
    team: { label: oc.nav.team, icon: "team" },
    settings: { label: oc.nav.settings, icon: "settings" }
  };
  const labelOf = (p) => items[p]?.label || labels3[p] || l[p] || t(p);
  const navItem = (p, mobile = false) => `<a class="nav-item os-nav-item ${active === p ? "active" : ""}" data-tip="${esc2(labelOf(p))}" href="${esc2(items[p]?.href || link(p))}"
  data-page="${p}" ${mobile ? `data-mobile-page="${p}"` : ""} ${active === p ? 'aria-current="page"' : ""}>
  ${icon2(items[p]?.icon || p, 20)}<span>${esc2(labelOf(p))}</span></a>`;
  const groups = workspace ? [
    [oc.nav.groups[0], ["home", "profile", "journey", "studio", "services", "site", "analytics", ...can("auri:use") ? ["assistant"] : []]],
    [oc.nav.groups[1], ["requests", ...feature("menuDrafts") ? ["menuDrafts"] : [], "orders"]],
    [oc.nav.groups[2], [...workspace.organization.owner ? ["team"] : [], "settings"]]
  ] : [
    [oc.nav.groups[0], ["home", "journey", "services", "assistant"]],
    [oc.nav.groups[1], ["requests", "orders"]],
    [oc.nav.groups[2], ["settings"]]
  ];
  const mobileMain = workspace ? ["home", "journey", "studio"] : ["home", "journey", "services"];
  const sheetItems = groups.flatMap(([, list]) => list).filter((p) => !mobileMain.includes(p));
  const section = page === "home" ? oc.sections.command : page === "journey" ? oc.sections.journey : page === "studio" ? oc.sections.studio : labelOf(active);
  const title = page === "services" ? serviceLabels[lang][0] : page === "journey" ? commandLabels(lang).vision : labelOf(page);
  const ownHeading = (page === "home" || page === "journey") && workspace?.missions.length || page === "studio" && workspace;
  const initials = String(workspace?.organization.name || me.name || "A").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  app.innerHTML = `<div class="shell growth-shell growth-active aurahub-shell hx-shell wx-shell os-shell ${page === "journey" && workspace?.missions.length ? "os-shell-journey" : ""} ${page === "services" ? "service-shell" : ""}"><aside class="sidebar os-sidebar" id="sidebar">
 <a href="${esc2(link("home"))}" class="wordmark command-wordmark os-brand">${brandMarkup}<small>AuraHub</small></a>
 <nav aria-label="AuraHub">${groups.map(([name, list]) => `<p class="hx-nav-group os-nav-group">${esc2(name)}</p>${list.map((p) => navItem(p)).join("")}`).join("")}</nav>
 ${workspace && can("auri:use") ? `<button type="button" class="os-side-auri" data-ax-open aria-controls="ax-drawer"><img src="/media/auri/level-${auriLevel()}.webp" alt="" width="36" height="36"><span><strong>Auri</strong><small>${esc2(oc.auri.ask)}</small></span></button>` : ""}
 <div class="hx-side-foot os-side-foot">${avatar()}<span><strong>${esc2(me.name)}</strong><small>${esc2(me.email)}</small></span></div></aside>
 <div class="workspace"><header class="topbar growth-topbar hub-topbar os-topbar">
 <a class="hub-mobile-brand wordmark" href="${esc2(link("home"))}">${brandMarkup}</a>
 ${workspace ? `<div class="hx-business os-business"><span class="hx-avatar" aria-hidden="true">${esc2(initials)}</span>
 <label class="field workspace-picker"><span class="sr-only">${esc2(oc.nav.switchWorkspace)}</span>
 <select id="workspace-select" aria-label="${esc2(oc.nav.switchWorkspace)}">${workspaces.map((o) => `<option value="${esc2(o.id)}" ${o.id === workspace.organization.id ? "selected" : ""}>${esc2(o.id === workspace.organization.id ? workspace.organization.name : o.name)}</option>`).join("")}</select></label></div>` : ""}
 <div class="hx-topbar-title os-crumb"><span>${esc2(section)}</span></div>
 ${workspace && can("roadmap:write") ? `<a class="growth-secondary hx-top-action os-top-request" href="${esc2(requestLink())}">${icon2("plus", 16)} <span>${esc2(oc.nav.newRequest)}</span></a>` : ""}
 ${workspace && can("auri:use") ? `<button type="button" class="wx-auri-btn os-top-auri" data-ax-open aria-controls="ax-drawer" aria-expanded="false">${icon2("auri", 18)}<span>Auri</span></button>` : ""}
 <details class="growth-account"><summary aria-label="${esc2(oc.nav.account)}" class="${me.photo ? "has-photo" : ""}">${me.photo ? avatar("os-photo-summary") : hubIcon("profile")}</summary>
 <div class="growth-account-menu"><div class="os-account-head">${avatar()}<span><strong>${esc2(me.name)}</strong><small>${esc2(me.email)}</small></span></div>${languageControl()}
 ${navItem("settings")}${workspace ? navItem("profile") + navItem("orders") : ""}${button("logout", "logout", true)}</div></details></header>
 <main id="main" tabindex="-1">${ownHeading ? "" : `<div class="page-heading"><h1>${page === "home" && (!workspace || !workspace.missions.length) ? `${esc2(labels3.welcome)} <span>AuraHub</span>` : page === "journey" && lang === "en" ? "Growth <span>Vision</span>" : esc2(title)}</h1>
 ${["services", "requests"].includes(page) && workspace?.permissions.includes("roadmap:write") && !query.has("new") ? `<a class="growth-secondary" href="${esc2(requestLink())}">\uFF0B ${esc2(l.request)}</a>` : ""}</div>`}
 ${!me.verified && authCapabilities.email ? `<aside class="verification"><p>${t("verifyLater")}</p>${button("sendVerification", "send-verification", true)}</aside>` : ""}
 <div id="page-content"></div></main>
 <nav class="command-bottom-nav os-bottom-nav" aria-label="AuraHub">${navItem("home", true)}${navItem("journey", true)}${workspace && can("auri:use") ? `<button type="button" class="nav-item wx-bottom-auri" data-ax-open aria-controls="ax-drawer">${icon2("auri", 20)}<span>Auri</span></button>` : ""}${navItem(mobileMain[2], true)}
 <button type="button" class="nav-item hx-more" data-hx-more aria-expanded="false" aria-controls="hx-sheet">${icon2("more", 20)}<span>${esc2(oc.nav.more)}</span></button></nav>
 <div class="hx-sheet" id="hx-sheet" hidden><div class="hx-sheet-panel" role="dialog" aria-modal="true" aria-label="${esc2(oc.nav.more)}">
 <header><strong>${esc2(oc.nav.more)}</strong><button type="button" class="hx-sheet-close" data-hx-close aria-label="${esc2(oc.nav.close)}">\u2715</button></header>
 <nav aria-label="${esc2(oc.nav.more)}">${sheetItems.map((p) => navItem(p)).join("")}</nav></div></div>
 </div>
 <aside class="ax-drawer" id="ax-drawer" hidden aria-label="Auri"><header class="ax-head"><span class="ax-avatar" aria-hidden="true"><img src="/media/auri/level-${auriLevel()}.webp" alt="" width="44" height="44"></span>
 <span class="ax-head-text"><strong>Auri</strong><small><i class="ax-online" aria-hidden="true"></i>${esc2(chatCopy2(lang).status)}</small></span>
 <button type="button" class="ax-icon-btn" data-ax-reset>${esc2(chatCopy2(lang).clear)}</button><button type="button" class="ax-icon-btn" data-ax-close aria-label="${esc2(nv.close)}">\u2715</button></header>
 <div class="ax-body" data-ax-body></div></aside><div class="ax-scrim" data-ax-close hidden></div></div>`;
  bindCommon();
  document.querySelectorAll("[data-ax-open]").forEach((b) => b.addEventListener("click", () => openAuri()));
  document.querySelectorAll("[data-ax-close]").forEach((b) => b.addEventListener("click", closeAuri));
  document.querySelector("[data-ax-reset]")?.addEventListener("click", () => auriChat?.reset());
  if (auriOpen) openAuri();
  const sheet = document.querySelector("#hx-sheet"), more = document.querySelector("[data-hx-more]");
  const openSheet = (open) => {
    sheet.hidden = !open;
    more.setAttribute("aria-expanded", String(open));
    if (open) sheet.querySelector("a")?.focus();
  };
  more.onclick = () => openSheet(sheet.hidden);
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest("[data-hx-close]") || e.target.closest("a")) openSheet(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sheet.hidden) {
      openSheet(false);
      more.focus();
    }
  }, { once: true });
  document.querySelector("#workspace-select")?.addEventListener("change", async (e) => {
    const select2 = e.target, id = select2.value;
    select2.disabled = true;
    workspaceSwitch = id;
    try {
      await loadWorkspace(id);
    } catch (error) {
      select2.value = workspace.organization.id;
      toast(error.message);
    } finally {
      workspaceSwitch = null;
      select2.disabled = false;
    }
  });
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
  const host = document.querySelector("#page-content");
  renderPage().catch((e) => {
    if (!host.isConnected) return;
    host.innerHTML = `<section class="panel os-page-error"><p role="alert">${esc2(e.message)}</p><button type="button" class="secondary" data-retry-page>${esc2(osCopy(lang).state.retry)}</button></section>`;
    host.querySelector("[data-retry-page]").onclick = () => render();
  });
}
var content = (html) => {
  document.querySelector("#page-content").innerHTML = html;
};
app.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[href]");
  if (!me || !anchor || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.origin !== location.origin) return;
  const slug = anchor.pathname.split("/")[2] || "";
  if (!anchor.pathname.startsWith("/hub") || ["login", "signup", "verify", "forgot", "reset", "invitation", "confirm-email"].includes(slug)) return;
  const targetWorkspace = new URL(anchor.href).searchParams.get("workspace");
  if (targetWorkspace && targetWorkspace !== workspace?.organization.id) return;
  event.preventDefault();
  history.pushState(null, "", anchor.pathname + anchor.search);
  syncLocation();
  editing = false;
  render();
  document.querySelector("#main")?.focus();
});
async function workSnapshot() {
  const [work, menus] = await Promise.all([
    api(endpoint("work")),
    api(endpoint("menu-drafts")).catch((error) => {
      if (error.status === 503) return { drafts: [] };
      throw error;
    })
  ]);
  return workRows(menus.drafts, work);
}
function buildCard(ui) {
  const canBuild = !workspace || ["profile:write", "roadmap:write"].every((permission) => workspace.permissions.includes(permission));
  return `<section class="hub-hero hub-welcome"><div>
 <h2>${esc2(ui.build)}</h2><p>${esc2(ui.buildNote)}</p>
 ${canBuild ? `<a class="growth-primary" href="${esc2(link("onboarding"))}">${esc2(ui.buildAction)} <span aria-hidden="true">\u2192</span></a>` : ""}
 <a class="growth-secondary" href="${esc2(link("services"))}">${esc2(serviceLabels[lang][0])}</a></div>
 <div class="hub-hero-art">${guideCharacter()}</div></section>${serviceShortcuts(lang, esc2, link)}<div data-home-guide></div>`;
}
var EMPTY = {
  en: { reqT: "No requests yet", reqP: "Requests you send to the AuraDigital team appear here with their status.", srvT: "No services yet", srvP: "Your websites, menus, email and other services appear here once they start.", build: "Build my roadmap", browse: "Browse services", shop: "Shop NFC cards", auriT: "Ask Auri anything", auriP: "Auri explains services and prices and suggests your best first step." },
  tr: { reqT: "Hen\xFCz talep yok", reqP: "AuraDigital ekibine g\xF6nderdi\u011Finiz talepler durumlar\u0131yla burada g\xF6r\xFCn\xFCr.", srvT: "Hen\xFCz hizmet yok", srvP: "Web siteleri, men\xFCler, e-posta ve di\u011Fer hizmetleriniz ba\u015Flad\u0131\u011F\u0131nda burada g\xF6r\xFCn\xFCr.", build: "Yol haritam\u0131 olu\u015Ftur", browse: "Hizmetlere g\xF6z at", shop: "NFC kart ma\u011Fazas\u0131", auriT: "Auri\u2019ye sorun", auriP: "Auri hizmetleri ve fiyatlar\u0131 anlat\u0131r, en iyi ilk ad\u0131m\u0131 \xF6nerir." },
  ar: { reqT: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0628\u0639\u062F", reqP: "\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0631\u0633\u0644\u0647\u0627 \u0625\u0644\u0649 \u0641\u0631\u064A\u0642 AuraDigital \u0645\u0639 \u062D\u0627\u0644\u062A\u0647\u0627.", srvT: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0628\u0639\u062F", srvP: "\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0645\u0648\u0627\u0642\u0639\u0643 \u0648\u0642\u0648\u0627\u0626\u0645\u0643 \u0648\u0628\u0631\u064A\u062F\u0643 \u0648\u062E\u062F\u0645\u0627\u062A\u0643 \u0627\u0644\u0623\u062E\u0631\u0649 \u0639\u0646\u062F \u0628\u062F\u0626\u0647\u0627.", build: "\u0627\u0628\u0646\u0650 \u062E\u0637\u062A\u064A", browse: "\u062A\u0635\u0641\u062D \u0627\u0644\u062E\u062F\u0645\u0627\u062A", shop: "\u0645\u062A\u062C\u0631 \u0628\u0637\u0627\u0642\u0627\u062A NFC", auriT: "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A", auriP: "\u064A\u0634\u0631\u062D \u0623\u0648\u0631\u064A \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u064A\u0642\u062A\u0631\u062D \u0623\u0641\u0636\u0644 \u062E\u0637\u0648\u0629 \u0623\u0648\u0644\u0649." },
  fr: { reqT: "Aucune demande", reqP: "Vos demandes \xE0 l\u2019\xE9quipe AuraDigital apparaissent ici avec leur statut.", srvT: "Aucun service", srvP: "Vos sites, menus, e-mails et autres services apparaissent ici d\xE8s leur d\xE9marrage.", build: "Cr\xE9er ma feuille de route", browse: "Voir les services", shop: "Cartes NFC", auriT: "Demandez \xE0 Auri", auriP: "Auri explique services et prix et propose votre meilleure premi\xE8re \xE9tape." }
};
var em = (k) => (EMPTY[lang] || EMPTY.en)[k] || EMPTY.en[k];
function renderWorkEmpty(page2) {
  const req = page2 === "requests";
  content(`<section class="panel hub-empty"><div class="hub-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${req ? "M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5" : "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"}"/></svg></div><h2>${esc2(em(req ? "reqT" : "srvT"))}</h2><p>${esc2(em(req ? "reqP" : "srvP"))}</p><div class="hub-empty-actions"><a class="growth-primary" href="${esc2(link("onboarding"))}">${esc2(em("build"))} <span aria-hidden="true">\u2192</span></a><a class="growth-secondary" href="/service-shop">${esc2(em("browse"))}</a><a class="growth-secondary" href="/shop">${esc2(em("shop"))}</a></div></section>${serviceShortcuts(lang, esc2, link)}`);
}
function renderAuriEmpty() {
  content(`<section class="hub-auri-intro"><h2>${esc2(em("auriT"))}</h2><p>${esc2(em("auriP"))}</p></section><div data-home-guide></div>`);
  const scope = workspace?.organization.id || setupScope;
  guideAt(document.querySelector("[data-home-guide]"), scope, () => workspace?.profile);
}
function renderBuildCard(ui) {
  content(buildCard(ui));
  const scope = workspace?.organization.id || setupScope;
  bindAuri(document.querySelector(".hub-welcome"), scope);
  guideAt(document.querySelector("[data-home-guide]"), scope, () => workspace?.profile);
}
function nextMission() {
  return eligibleMissions(workspace.missions, workspace.profile).find((m) => workspace.evidence?.[m.id] !== "pending");
}
var missionTitle = (m) => m.objective === m.service ? cap(m.capability) : m.objective;
var dataCache = null;
var cached = () => dataCache && dataCache.id === workspace?.organization.id && Date.now() - dataCache.at < 6e4 ? dataCache : null;
function loadLeads() {
  return Promise.all([api(endpoint("leads")), api(endpoint("leads") + "?archived=1")]).then(([open, archived]) => ({ all: [...open.leads, ...archived.leads] })).catch(() => ({ all: null }));
}
async function home() {
  const ui = hubLabels(lang), host = document.querySelector("#page-content");
  if (!workspace?.missions.length) {
    renderBuildCard(ui);
    return;
  }
  host.innerHTML = `<div class="os-command-loading" role="status" aria-label="${esc2(osCopy(lang).state.loading)}"><span></span><span></span><span></span><span></span></div>`;
  const [snapshot, connected, leads] = await Promise.all([workSnapshot(), api(endpoint("connected")).catch(() => null), loadLeads()]);
  dataCache = { id: workspace.organization.id, at: Date.now(), snapshot, connected };
  if (!host.isConnected) return;
  const next = nextMission(), item = snapshot.attention[0], menu2 = item?.kind === "menu";
  const eligible = eligibleMissions(workspace.missions, workspace.profile).filter((m) => workspace.evidence?.[m.id] !== "pending");
  renderAuraCommand({
    host,
    lang,
    esc: esc2,
    link,
    requestLink,
    me,
    workspace,
    snapshot,
    connected,
    leads,
    missionTitle,
    next,
    eligible,
    continueLabel: ui.continue,
    canAsk: workspace.permissions.includes("auri:use"),
    canRequest: workspace.permissions.includes("roadmap:write"),
    attention: item ? { name: menu2 ? ui.menuReady : item.name, label: menu2 ? ui.reviewMenu : ui.openRequest, href: link(menu2 ? "menuDrafts" : "requests", menu2 ? { draft: item.id } : { request: item.id }) } : null,
    onAsk: (question) => openAuri(question || void 0, { direct: true }),
    onPrepare: letAuriDo
  });
}
async function studio() {
  return renderAuraStudio({
    host: document.querySelector("#page-content"),
    lang,
    esc: esc2,
    link,
    requestLink,
    api,
    endpoint,
    workspace,
    me,
    toast,
    view: query.get("view"),
    query,
    loadSnapshot: workSnapshot,
    loadConnected: () => api(endpoint("connected")).catch(() => null),
    onAsk: (question) => openAuri(question || void 0)
  });
}
function serviceFor(capability) {
  const c = String(capability || "");
  return /website|conversion|leads/.test(c) ? "Web Design" : /domain|hosting/.test(c) ? "Hosting / Security" : /email/.test(c) ? "Business Email" : /brand/.test(c) ? "Branding" : /menu/.test(c) ? "AuraMenu" : /seo|discovery/.test(c) ? "SEO / Google Maps" : /reviews/.test(c) ? "NFC Card" : /whatsapp|automation|followups/.test(c) ? "AI & Automation" : /ads/.test(c) ? "Ad Management" : /crm|analytics|retention/.test(c) ? "Spinflow ERP" : "Other";
}
function letAuriDo(mission) {
  if (!mission) return;
  const p = workspace.profile || {};
  const brief = [
    `${missionTitle(mission)} \u2014 ${mission.reason || mission.description || ""}`.trim(),
    mission.nextAction ? `Next action: ${mission.nextAction}` : "",
    p.name ? `Business: ${p.name}` : "",
    p.industry ? `Industry: ${p.industry}${p.industryDetails ? " (" + p.industryDetails + ")" : ""}` : "",
    [p.city, p.country].filter(Boolean).join(", "),
    p.goals ? `Goal: ${p.goals}` : "",
    p.website ? `Website: ${p.website}` : ""
  ].filter(Boolean).join("\n");
  requestDrafts.set(workspace.organization.id, brief.slice(0, 1700));
  navigate("requests", { new: "1", service: serviceFor(mission.capability || mission.id), task: mission.id });
}
var auriOpen = false;
var auriChat = null;
async function openAuri(initial, { direct = false } = {}) {
  const drawer = document.querySelector("#ax-drawer");
  if (!drawer || !workspace) return;
  auriOpen = true;
  drawer.hidden = false;
  document.querySelector(".ax-scrim")?.removeAttribute("hidden");
  document.querySelectorAll("[data-ax-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
  document.documentElement.classList.add("ax-is-open");
  const body = drawer.querySelector("[data-ax-body]");
  if (auriChat && body.childElementCount && body.dataset.workspace === workspace.organization.id) {
    if (initial) auriChat.ask(initial, { direct });
    return;
  }
  body.innerHTML = '<p class="ax-loading" role="status">\u2026</p>';
  body.dataset.workspace = workspace.organization.id;
  const ui = hubLabels(lang);
  const hit = cached();
  const [snapshot, connected] = hit ? [hit.snapshot, hit.connected] : await Promise.all([workSnapshot().catch(() => ({ attention: [], progress: [], services: [], records: [], requests: [] })), api(endpoint("connected")).catch(() => null)]);
  if (!drawer.isConnected) return;
  const next = workspace.missions.length ? nextMission() : null;
  const items = serviceItems({ snapshot, connected, link, lang }), activeItems = items.filter((i) => !i.terminal);
  const item = snapshot.attention[0], menu2 = item?.kind === "menu";
  auriChat = mountAuriChat({
    host: body,
    lang,
    esc: esc2,
    link,
    me,
    workspace,
    initial,
    direct,
    data: {
      snapshot,
      connected,
      next,
      missionTitle,
      counts: { live: activeItems.filter((i) => i.stage === 3).length, open: activeItems.filter((i) => i.stage < 3).length + (snapshot.attention || []).length },
      attention: item ? { name: menu2 ? ui.menuReady : item.name, label: menu2 ? ui.reviewMenu : ui.openRequest, href: link(menu2 ? "menuDrafts" : "requests", menu2 ? { draft: item.id } : { request: item.id }) } : null,
      nextAction: next ? { label: ui.continue, href: link("journey", { task: next.id }) } : null
    },
    auriImage: `<img src="/media/auri/level-${auriLevel()}.webp" alt="" width="32" height="32">`,
    askAuri: workspace.permissions.includes("auri:use") ? (question) => askAuri(question) : async () => t("readOnly"),
    onBrief: (service, text) => {
      requestDrafts.set(workspace.organization.id, text.slice(0, 1700));
      closeAuri();
      navigate("requests", { new: "1", service });
    }
  });
}
function closeAuri() {
  auriOpen = false;
  const drawer = document.querySelector("#ax-drawer");
  if (drawer) drawer.hidden = true;
  document.querySelector(".ax-scrim")?.setAttribute("hidden", "");
  document.querySelectorAll("[data-ax-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  document.documentElement.classList.remove("ax-is-open");
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && auriOpen) {
    closeAuri();
    document.querySelector(".os-top-auri,[data-ax-open]")?.focus();
    return;
  }
  if (e.key === "Tab" && auriOpen) {
    const drawer = document.querySelector("#ax-drawer");
    if (!drawer || drawer.hidden) return;
    const items = [...drawer.querySelectorAll('button,a[href],textarea,input,select,[tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items.at(-1);
    if (!drawer.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
async function myWork() {
  const ui = hubLabels(lang), host = document.querySelector("#page-content"), id = workspace.organization.id;
  const task = workspace.missions.find((m) => m.id === query.get("task"));
  if (query.has("new") && workspace.permissions.includes("roadmap:write")) {
    return renderRequestForm({ host, lang, esc: esc2, me, workspace, service: query.get("service"), task: task ? missionTitle(task) : "", draft: requestDrafts.get(id) || "", back: link("requests"), submitted: (request2) => {
      requestDrafts.delete(id);
      navigate("requests", { request: request2 }, true);
    } });
  }
  const serviceRecord = query.get("serviceRecord");
  if (serviceRecord && page === "services") {
    host.innerHTML = '<p role="status">\u2026</p>';
    const record = await api(endpoint("work/" + encodeURIComponent(serviceRecord)));
    if (host.isConnected) renderServiceDetails({ host, record, lang, esc: esc2, link, askLabel: workspace.permissions.includes("auri:use") ? ui.assistant : null });
    return;
  }
  const request = query.get("request");
  const service = query.get("active");
  if (request) {
    const record = await api(endpoint("work/" + encodeURIComponent(request)));
    if (!host.isConnected) return;
    host.innerHTML = `<section class="panel"><h2>${esc2(record.name)}</h2><p>${esc2(workStatus(record))}</p><p>${esc2(record.id)}</p>
  <a class="secondary" href="${esc2(link("services"))}">${esc2(ui.services)}</a>
  ${workspace.permissions.includes("auri:use") ? `<a class="secondary" href="${esc2(link("assistant", { request }))}">${esc2(ui.assistant)}</a>` : ""}</section>`;
    return;
  }
  if (page === "services" && !service) {
    host.innerHTML = '<p role="status">\u2026</p>';
    const [{ records }, connected] = await Promise.all([api(endpoint("work")), api(endpoint("connected")).catch(() => null)]);
    if (!host.isConnected) return;
    renderServices({ host, records: records || [], lang, esc: esc2, link, profile: workspace.profile, missions: workspace.missions });
    const rows = connected ? connectedRows(connected, lang) : [];
    if (rows.length) {
      const c = dashCopy(lang), section2 = document.createElement("section");
      section2.className = "hx-card hx-connected";
      section2.innerHTML = `<header class="hx-card-head"><div><h2>${esc2(c.connected)}</h2><p>${esc2(c.connectedNote)}</p></div></header>${connectedList(rows, lang, esc2)}`;
      host.prepend(section2);
    }
    return;
  }
  const { attention, progress, services, requests: requests2 } = await workSnapshot();
  if (!host.isConnected || workspace.organization.id !== id) return;
  if (service) {
    const record = services.find((item) => String(item.id) === service);
    if (!record) throw new Error(ui.unavailable);
    host.innerHTML = `<section class="panel"><h2>${esc2(record.name)}</h2><p>${esc2(ui.active)}</p><a class="secondary" href="${esc2(link("services"))}">${esc2(ui.services)}</a></section>`;
    return;
  }
  const section = (name, empty, rows) => `<section class="hub-work-section"><h2>${esc2(name)}</h2>${rows || `<p class="hub-empty">${esc2(empty)}</p>`}</section>`;
  if (!attention.length && !requests2.length) {
    host.innerHTML = `<section class="panel hub-page-start hub-requests-empty"><img src="/media/auri/level-1.webp" alt="" width="80" height="80" loading="lazy"><div><h2>${esc2(ui.requests)}</h2>
  <p>${esc2({ en: "Your requests will appear here.", fr: "Vos demandes appara\xEEtront ici.", tr: "Talepleriniz burada g\xF6r\xFCnecek.", ar: "\u0633\u062A\u0638\u0647\u0631 \u0637\u0644\u0628\u0627\u062A\u0643 \u0647\u0646\u0627." }[lang])}</p>
  <a class="growth-primary" href="${esc2(link("services"))}">${esc2(serviceLabels[lang][0])} \u2192</a>
  ${feature("menuDrafts") ? `<a class="growth-secondary" href="${esc2(link("menuDrafts"))}">${esc2(t("menuDrafts"))}</a>` : ""}</div></section>${serviceShortcuts(lang, esc2, link, { profile: workspace.profile, missions: workspace.missions })}`;
    return;
  }
  const displayed = new Set([...attention, ...progress].map((record) => record.id));
  const history2 = requests2.filter((record) => !displayed.has(record.id));
  host.innerHTML = section(ui.attention, ui.emptyAttention, attention.map((record) => renderWorkRow(record, { ui, esc: esc2, link })).join("")) + section(ui.progress, ui.emptyProgress, progress.map((record) => renderWorkRow(record, { ui, esc: esc2, link })).join("")) + (history2.length ? section(hubLabels(lang).requests, "", history2.map((record) => renderWorkRow(record, { ui, esc: esc2, link })).join("")) : "") + (feature("menuDrafts") ? `<a href="${esc2(link("menuDrafts"))}" class="growth-secondary">${esc2(t("menuDrafts"))}</a>` : "");
}
async function renderPage() {
  const label = hubLabels(lang);
  if (page === "notfound") {
    const n = osCopy(lang).notFound;
    content(`<section class="os-card os-notfound"><p class="os-eyebrow">404</p><h2>${esc2(n.title)}</h2><p class="os-muted">${esc2(n.text)}</p><div class="os-inline-actions"><a class="os-btn is-primary is-sm" href="${esc2(link("home"))}">${esc2(osCopy(lang).nav.overview)}</a>${workspace ? `<a class="os-btn is-quiet is-sm" href="${esc2(link("journey"))}">${esc2(osCopy(lang).nav.journey)}</a>` : ""}</div></section>`);
    return;
  }
  if (page === "invoices") return content(`<section class="panel"><a class="primary" href="/account">${esc2(t("orders"))}</a></section>`);
  if (page === "home") return home();
  if (page === "services" && (query.has("offer") || !workspace)) {
    const host = document.querySelector("#page-content");
    if (query.has("offer")) {
      const found = renderServiceOffer({
        host,
        offer: query.get("offer"),
        lang,
        esc: esc2,
        link,
        canRequest: workspace?.permissions.includes("roadmap:write"),
        canSetUp: !workspace,
        askLabel: workspace?.permissions.includes("auri:use") ? label.assistant : null
      });
      if (!found) throw new Error(label.unavailable);
    } else renderServices({ host, records: [], lang, esc: esc2, link });
    return;
  }
  if (page === "settings") {
    const settingsHost = document.querySelector("#page-content");
    const done = renderAccountSettings({
      host: document.querySelector("#page-content"),
      user: me,
      lang,
      esc: esc2,
      t,
      api,
      link,
      workspace,
      canEmail: authCapabilities.email,
      canLinkGoogle: me.verified && authCapabilities.google,
      onSignIn: () => location.assign("/hub/login"),
      onLanguage: (value) => {
        lang = value;
        saveLanguage(lang);
        render();
      },
      onNewWorkspace: () => {
        stopAuriVoice();
        workspace = null;
        editing = true;
        draft = emptyProfile();
        mode = "myself";
        step = 0;
        renderSetup();
      }
    });
    await done;
    if (settingsHost.isConnected) photoCard(settingsHost);
    return;
  }
  if (!workspace && page === "assistant") return renderAuriEmpty();
  if (!workspace && (page === "services" || page === "requests")) return renderWorkEmpty(page);
  if (!workspace) return renderBuildCard(label);
  if (page === "studio") return studio();
  if (page === "services" || page === "requests") return myWork();
  if ((page === "journey" || page === "onboarding") && !workspace.missions.length) return renderBuildCard(label);
  if (page === "onboarding") {
    navigate("journey", {}, true);
    return;
  }
  if (page === "profile" && !workspace.permissions.includes("profile:write")) {
    content(`<section class="panel"><h2>${esc2(workspace.profile.name)}</h2><p>${t("readOnly")}</p><p>${esc2(workspace.profile.goals)}</p></section>`);
    return;
  }
  if (page === "profile") {
    draft = structuredClone(workspace.profile);
    mode = workspace.organization.mode;
    step = 0;
    editing = true;
    renderSetup();
    return;
  }
  if (page === "menuDrafts" && !feature("menuDrafts")) {
    const s = osCopy(lang).studio.menu;
    content(`<section class="os-card"><h2>${esc2(s.title)}</h2><p class="os-muted">${esc2(s.unavailable)}</p><div class="os-inline-actions">${workspace.permissions.includes("roadmap:write") ? `<a class="os-btn is-primary is-sm" href="${esc2(requestLink("AuraMenu"))}">${esc2(s.request)}</a>` : ""}<a class="os-btn is-quiet is-sm" href="${esc2(link("home"))}">${esc2(osCopy(lang).nav.overview)}</a></div></section>`);
    return;
  }
  if (page === "menuDrafts") return renderMenuDrafts({ host: document.querySelector("#page-content"), api, endpoint, profile: workspace.profile, canWrite: workspace.permissions.includes("roadmap:write"), draftId: query.get("draft"), reviewLabel: label.reviewed, onDraft: (id) => navigate("menuDrafts", { draft: id }), onReviewed: () => navigate("home") });
  if (page === "journey") {
    if (selectedMission && !workspace.missions.some((m) => m.id === selectedMission)) throw new Error(label.unavailable);
    return growthDashboard();
  }
  if (page === "tasks") return journey();
  if (page === "insights") {
    content(`<section class="panel"><h2>${esc2(t("reports"))}</h2><a class="secondary" href="${esc2(link("simulator"))}">${esc2(t("simulator"))}</a></section>`);
    return;
  }
  if (page === "resources") {
    content(`<section class="panel"><div class="resource-links"><a class="secondary" href="/shop">AuraShop</a><a class="secondary" href="/account">${esc2(t("orders"))}</a>${moreNavigation.map((p) => `<button type="button" class="secondary" data-resource="${p}">${esc2(t(p))}</button>`).join("")}</div></section>`);
    document.querySelectorAll("[data-resource]").forEach((b) => b.onclick = () => {
      page = b.dataset.resource;
      render();
    });
    return;
  }
  if (page === "simulator") return simulator();
  if (page === "team") return team();
  if (page === "assistant") return assistant();
  const shortcuts = { projects: ["requests", label.requests], websites: ["services", serviceLabels[lang][0], { offer: "web" }], hosting: ["services", serviceLabels[lang][0], { offer: "hosting" }], files: ["services", serviceLabels[lang][0]], reports: ["insights", t("simulator")], rewards: ["journey", commandLabels(lang).vision] };
  const shortcut = shortcuts[page];
  if (shortcut) {
    const [destination, name, params] = shortcut;
    content(`<section class="panel hub-page-start"><span class="hub-row-icon">${hubIcon(destination)}</span><div>
  <h2>${esc2(name)}</h2><a class="growth-primary" href="${esc2(link(destination, params))}">${esc2(name)} \u2192</a></div></section>
  ${["projects", "websites", "hosting", "files"].includes(page) ? serviceShortcuts(lang, esc2, link, { profile: workspace.profile, missions: workspace.missions }) : ""}`);
    return;
  }
  content(`<section class="panel hub-page-start"><span class="hub-row-icon">${hubIcon("assistant")}</span><div>
 <h2>${esc2(t("contact"))}</h2><p>${esc2(t("supportText"))}</p>
 ${workspace.permissions.includes("auri:use") ? `<a class="growth-primary" href="${esc2(link("assistant"))}">${esc2(label.assistant)} \u2197</a>` : ""}
 <a class="growth-secondary" href="/contact">${esc2(t("contact"))}</a></div></section>`);
}
async function askAuri(question, missionId, requestId, serviceKey, offer) {
  const id = workspace.organization.id;
  if (serviceKey) {
    const { data: { service } } = await runAuri(id, "thinking", () => api(endpoint("auri"), "POST", { tool: "service_status", serviceKey }), "speaking");
    const labels3 = serviceLabels[lang];
    const renewal = service.kind === "subscription";
    return `${service.name} \xB7 ${serviceStatus(service, labels3)}. ${labels3[renewal ? 13 : 11]} \xB7 ${serviceDate(renewal ? service.renewalDate : service.dueDate, lang, labels3[12])}.`;
  }
  const { data } = await runAuri(id, "thinking", () => api(endpoint("auri"), "POST", { tool: "guidance", question, lang, ...missionId ? { missionId } : {}, ...requestId ? { requestId } : {}, ...offer ? { offer } : {} }), "speaking");
  if (workspace?.organization.id !== id) return "";
  if (data.reply) return data.reply;
  const fallback = {
    en: "Auri\u2019s AI isn\u2019t available right now (it may have reached today\u2019s limit). Guidance from your roadmap",
    fr: "L\u2019IA d\u2019Auri n\u2019est pas disponible pour le moment (limite du jour peut-\xEAtre atteinte). Conseil de votre feuille de route",
    tr: "Auri\u2019nin yapay zek\xE2s\u0131 \u015Fu an kullan\u0131lam\u0131yor (g\xFCnl\xFCk s\u0131n\u0131ra ula\u015Fm\u0131\u015F olabilir). Yol haritan\u0131zdan \xF6neri",
    ar: "\u0630\u0643\u0627\u0621 \u0623\u0648\u0631\u064A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u0627\u0644\u0622\u0646 (\u0631\u0628\u0645\u0627 \u0628\u0644\u063A \u0627\u0644\u062D\u062F \u0627\u0644\u064A\u0648\u0645\u064A). \u0625\u0631\u0634\u0627\u062F \u0645\u0646 \u062E\u0637\u062A\u0643"
  }[lang];
  const guidance = (message) => fallback + " \xB7 " + message;
  if (data.offerGuidance) return guidance(data.offerGuidance);
  if (/customers|visibility|sales|müşteri|clients|عملاء/i.test(question) && data.priorities?.length) return guidance(data.priorities.map((m) => cap(m.capability)).join(" \xB7 "));
  const task = data.mission || data.nextAction;
  if (requestId) return guidance(hubLabels(lang).requestDetails + " \xB7 " + hubLabels(lang).return);
  if (!task) return guidance(t("empty"));
  const alternate = task.route === "alternative" ? missionAlternative(task.capability) : null;
  if (alternate) return guidance([alternate.title, alternate.steps].join(" \xB7 "));
  const guide = missionGuide[task.capability], requirements = missionState(task, workspace.missions, workspace.profile).requirements;
  const action = task.nextAction === "Define scope or record your existing solution." ? guide?.[2] : task.nextAction;
  return guidance([cap(task.capability), action, requirements.length ? requirements.map(cap).join(", ") : ""].filter(Boolean).join(" \xB7 "));
}
function growthDashboard() {
  disconnectDesk();
  const host = document.querySelector("#page-content");
  const options = {
    workspace,
    t,
    esc: esc2,
    cap,
    lang,
    view: roadmapView,
    robot,
    requestLink,
    onSelect(id, scroll = true) {
      navigate("journey", { task: id }, false, false);
      growthDashboard();
      document.getElementById("growth-focus")?.focus({ preventScroll: !scroll });
    },
    onAskTask(mission) {
      navigate("assistant", { task: mission.id });
    },
    onView(view) {
      roadmapView = view;
      growthDashboard();
      document.querySelector(`[data-view="${view}"]`)?.focus();
    },
    onEdit(mission) {
      navigate("tasks");
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
        await generateRoadmap();
      } catch (error) {
        event.target.disabled = false;
        toast(error.message);
      }
    },
    async onRoute(mission, trigger) {
      trigger.disabled = true;
      const id = workspace.organization.id;
      try {
        await api(endpoint("mission-route/" + mission.id), "PATCH", { version: mission.version, route: trigger.dataset.route });
        await loadWorkspace(id);
      } catch (error) {
        trigger.disabled = false;
        toast(error.message);
      }
    },
    async onEvidence(mission, form) {
      const submit = form.querySelector("button");
      submit.disabled = true;
      const id = workspace.organization.id;
      try {
        await api(endpoint("mission-evidence/" + mission.id), "POST", { version: mission.version, proof: new FormData(form).get("proof") });
        await loadWorkspace(id);
      } catch (error) {
        submit.disabled = false;
        toast(error.message);
      }
    },
    async onExistingEvidence(form) {
      const submit = form.querySelector("button");
      submit.disabled = true;
      const id = workspace.organization.id;
      try {
        const result2 = await api(endpoint("existing-evidence"), "POST", Object.fromEntries(new FormData(form)));
        if (workspace?.organization.id === id) {
          navigate("journey", { task: result2.missionId }, true, false);
          await loadWorkspace(id);
        }
      } catch (error) {
        submit.disabled = false;
        toast(error.message);
      }
    }
  };
  const stage = query.get("stage");
  renderAuraJourney({
    host,
    lang,
    esc: esc2,
    link,
    requestLink,
    workspace,
    missionTitle,
    cap,
    stageParam: stage !== null && /^[0-4]$/.test(stage) ? Number(stage) : null,
    selectedId: selectedMission,
    canAsk: workspace.permissions.includes("auri:use"),
    onAsk: (question) => openAuri(question, { direct: true }),
    onSelect: (id) => options.onSelect(id),
    renderTask: (taskHost, id) => renderRoadmap({ ...options, host: taskHost, selectedId: id, compact: true })
  });
}
function journey() {
  const write = workspace.permissions.includes("roadmap:write");
  content(`<div class="panel-bar"><p>${t("noPurchase")}</p>${button("createJourney", "generate", false, !write)}</div><div class="journey-levels">${[1, 2, 3, 4, 5].map((l) => `<section class="journey-level"><div class="level-heading"><span class="level-number">0${l}</span><div><span class="eyebrow">${t("level")} ${l}</span><h2>${t(["foundation", "visibility", "conversion", "automation", "scale"][l - 1])}</h2></div></div>${workspace.missions.filter((m) => m.level === l).map((m) => `<article class="panel mission" data-mission="${m.id}"><div class="panel-bar"><h3>${esc2(m.objective === m.service ? cap(m.capability) : m.objective)}</h3><span class="pill">${t(m.status)}</span></div><p>${m.description.startsWith("Establish ") ? t("why") : esc2(m.description)}</p><p>${t("benefit")}</p><div class="mission-meta"><span>${t("quote")}</span><span>${t("priority")}: ${t(m.priority === 1 ? "high" : m.priority === 2 ? "medium" : "low")}</span>${m.dependencies?.length ? `<span>\u21B3 ${esc2(m.dependencies.map(cap).join(", "))}</span>` : ""}</div><div class="actions">${select("status", "status", ["planned", "in_progress", "done", "postponed"].map((v) => [v, t(v)]), m.status)}${button("up", "up", true, !write)}${button("down", "down", true, !write)}${button("edit", "edit", true, !write)}</div><p>${m.nextAction === "Define scope or record your existing solution." ? t("nextAction") + ": " + t("quote") : esc2(m.nextAction)}</p></article>`).join("") || `<p class="empty-level">${t("empty")}</p>`}</section>`).join("")}</div>`);
  document.querySelector('[data-action="generate"]').onclick = async (e) => {
    e.target.disabled = true;
    try {
      await generateRoadmap();
    } catch (error) {
      e.target.disabled = false;
      toast(error.message);
    }
  };
  document.querySelectorAll("[data-mission]").forEach((card) => {
    const m = workspace.missions.find((m2) => m2.id === card.dataset.mission), save = async (patch) => {
      try {
        const id = workspace.organization.id;
        await api(endpoint("missions/" + m.id), "PATCH", { version: m.version, status: m.status, position: m.position, ...patch });
        await loadWorkspace(id);
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
  return `<div class="table-scroll"><table><caption>${t("assumptions")} \xB7 ${esc2(data.inputs.currency)}</caption><thead><tr><th scope="col"></th>${data.scenarios.map((s) => `<th scope="col">${t(s.name)}</th>`).join("")}</tr></thead><tbody>${[["additionalCustomers", "customers"], ["additionalRevenue", "revenue", true], ["contributionProfit", "profit", true], ["netMonthly", "net", true], ["firstYearROI", "roi"], ["paybackMonths", "payback"]].map(([key, label, money4]) => `<tr><th scope="row">${t(label)}</th>${data.scenarios.map((s) => `<td>${esc2(format(s[key], money4 ? data.inputs.currency : null))}${key === "firstYearROI" && s[key] !== null ? "%" : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
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
async function updateAuriPreferences(values) {
  const id = workspace.organization.id;
  const result2 = await api(endpoint("auri"), "PATCH", { ...auriPreference(), ...values });
  if (workspace?.organization.id === id) workspace.auriPreferences = result2;
}
function stopAuriVoice() {
  if (!auriVoice) return;
  speechSynthesis.cancel();
  const { scope } = auriVoice;
  auriVoice = null;
  pulseAuri(scope, "idle");
}
function renderCompanion(full = false) {
  const host = document.querySelector(full ? "#auri-workspace" : "#auri-companion");
  const preferences = auriPreference(), controls2 = auriControls(lang);
  if (preferences.hidden && !full) return;
  const id = workspace.organization.id;
  if (!auriSessions.has(id)) auriSessions.set(id, { open: false, reply: "", pending: false, error: "" });
  const missionId = query.get("task"), requestId = query.get("request"), serviceKey = query.get("serviceRecord"), offer = query.get("offer");
  const sessionKey = [id, missionId, requestId, serviceKey, offer].filter(Boolean).join(":");
  if (!auriSessions.has(sessionKey)) auriSessions.set(sessionKey, { open: false, reply: "", pending: false, error: "" });
  const session = auriSessions.get(sessionKey);
  session.turns ??= [];
  const transcript = () => session.turns.map((turn) => `<article class="auri-chat-turn"><strong>${esc2(turn.question)}</strong><p>${esc2(turn.reply)}</p></article>`).join("");
  const level2 = auriLevel(), canAsk = workspace.permissions.includes("auri:use");
  const { ask: label, focus } = roadmapLabels(lang);
  const next = eligibleMissions(workspace.missions, workspace.profile)[0];
  const readAloud = { en: "Read aloud", tr: "Sesli oku", fr: "Lire \xE0 voix haute", ar: "\u0642\u0631\u0627\u0621\u0629 \u0628\u0635\u0648\u062A \u0639\u0627\u0644\u064D" }[lang];
  const send = { en: "Send", tr: "G\xF6nder", fr: "Envoyer", ar: "\u0625\u0631\u0633\u0627\u0644" }[lang];
  const suggested = offer && !session.turns.length ? {
    en: "How would this help my business?",
    fr: "Comment ce service aiderait-il mon entreprise ?",
    tr: "Bu hizmet i\u015Fletmeme nas\u0131l yard\u0131mc\u0131 olur?",
    ar: "\u0643\u064A\u0641 \u0633\u062A\u0633\u0627\u0639\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u062F\u0645\u0629 \u0646\u0634\u0627\u0637\u064A\u061F"
  }[lang] : "";
  const identity = `${auriCharacter(level2)}<span><strong>${esc2(preferences.name)}</strong><small>${esc2(t("level"))} ${level2} \xB7 ${auriNames[level2 - 1]}</small></span>
  <span class="auri-status" role="status" data-auri-status></span>`;
  const body = `<div class="auri-companion-body">
  ${next && !missionId && !requestId && !serviceKey && !offer ? `<p><strong>${esc2(focus)}</strong> \xB7 ${esc2(cap(next.capability))}</p>` : ""}
  ${canAsk ? `<div data-auri-transcript>${transcript()}</div><form data-auri-ask><label><span class="sr-only">${esc2(label)}</span><input name="question" maxlength="500" value="${esc2(suggested)}" placeholder="${esc2(label)}" required></label>
  <button class="primary" ${session.pending ? "disabled" : ""}>${esc2(send)}</button></form><p data-auri-reply role="status" class="${session.error ? "" : "sr-only"}">${esc2(session.error)}</p>
  ${"speechSynthesis" in window ? `<button type="button" class="secondary" data-auri-voice ${session.reply && !session.error ? "" : "hidden"}>${esc2(readAloud)}</button>
  <button type="button" class="secondary" data-auri-stop ${auriVoice?.scope === id ? "" : "hidden"}>${esc2(controls2.stop)}</button>` : ""}` : ""}
  <div class="auri-actions">
  <button type="button" class="secondary" data-auri-roadmap>${esc2(t("journey"))}</button>
  ${canAsk && workspace.permissions.includes("roadmap:write") ? `<button type="button" class="secondary" data-auri-request>${esc2(roadmapLabels(lang).request)}</button>` : ""}
  <button type="button" class="secondary" data-auri-hide>${esc2(preferences.hidden ? controls2.show : controls2.hide)}</button></div>
  ${full ? `<details class="hub-auri-settings"><summary>${esc2(t("settings"))}</summary><form data-auri-name><label>${esc2(controls2.name)}<input name="name" value="${esc2(preferences.name)}" required maxlength="24"></label>
  <button class="secondary">${esc2(t("save"))}</button></form></details>` : ""}
 </div>`;
  host.innerHTML = full ? `<section class="auri-companion auri-workspace-card"><header>${identity}</header>${body}</section>` : `<details class="auri-companion auri-dock" ${session.open ? "open" : ""}><summary>${identity}</summary>${body}</details>`;
  bindAuri(host, id);
  const panel = host.querySelector("details");
  if (panel) {
    panel.ontoggle = () => {
      if (panel.isConnected) session.open = panel.open;
    };
    panel.onkeydown = (event) => {
      if (event.key === "Escape" && panel.open) {
        panel.open = false;
        panel.querySelector("summary").focus();
      }
    };
  }
  function navigate2(target) {
    window.history.pushState(null, "", link(target));
    syncLocation();
    render();
    document.querySelector("#main").focus();
  }
  host.querySelector("[data-auri-roadmap]").onclick = () => navigate2("journey");
  const request = host.querySelector("[data-auri-request]");
  if (request) request.onclick = () => {
    if (session.reply) requestDrafts.set(id, session.reply);
    const mission = workspace.missions.find((item) => item.id === missionId);
    const service = serviceOffer(offer)?.service || missionGuide[mission?.capability]?.[0] || "";
    window.history.pushState(null, "", requestLink(service, mission?.id));
    syncLocation();
    render();
  };
  host.querySelector("[data-auri-hide]").onclick = async (event) => {
    const trigger = event.currentTarget;
    trigger.disabled = true;
    try {
      await updateAuriPreferences({ hidden: !preferences.hidden });
      if (workspace?.organization.id !== id) return;
      stopAuriVoice();
      session.open = false;
      if (trigger.isConnected) {
        render();
        document.querySelector("#main").focus();
      }
    } catch (error) {
      toast(error.message);
      trigger.disabled = false;
    }
  };
  const rename = host.querySelector("[data-auri-name]");
  if (rename) rename.onsubmit = async (event) => {
    event.preventDefault();
    const submit = rename.querySelector("button");
    submit.disabled = true;
    try {
      await updateAuriPreferences({ name: new FormData(rename).get("name") });
      if (rename.isConnected) {
        render();
        document.querySelector("[data-auri-name] input")?.focus();
        toast(t("saved"));
      }
    } catch (error) {
      toast(error.message);
      submit.disabled = false;
    }
  };
  const form = host.querySelector("[data-auri-ask]");
  const voice = host.querySelector("[data-auri-voice]");
  const stop = host.querySelector("[data-auri-stop]");
  if (voice) voice.onclick = () => {
    stopAuriVoice();
    const message = new SpeechSynthesisUtterance(session.reply);
    message.lang = lang;
    auriVoice = { scope: id, message };
    message.onstart = () => pulseAuri(id, "speaking", 3500);
    message.onend = message.onerror = () => {
      if (auriVoice?.message !== message) return;
      auriVoice = null;
      pulseAuri(id, "idle");
      document.querySelector("[data-auri-stop]")?.setAttribute("hidden", "");
    };
    stop.hidden = false;
    speechSynthesis.speak(message);
  };
  if (stop) stop.onclick = () => {
    stopAuriVoice();
    stop.hidden = true;
  };
  if (form) form.onsubmit = async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button"), reply = host.querySelector("[data-auri-reply]");
    const question = new FormData(form).get("question").trim();
    if (!question || session.pending) return;
    stopAuriVoice();
    session.pending = submit.disabled = true;
    if (voice) voice.hidden = true;
    if (stop) stop.hidden = true;
    session.reply = session.error = reply.textContent = "";
    try {
      session.reply = await askAuri(question, missionId, requestId, serviceKey, offer);
      if (session.reply) {
        session.turns.push({ question, reply: session.reply });
        if (session.turns.length > 20) session.turns.shift();
        host.querySelector("[data-auri-transcript]").innerHTML = transcript();
        form.elements.question.value = "";
      }
    } catch (error) {
      session.error = error.message;
    } finally {
      session.pending = submit.disabled = false;
      reply.textContent = session.error || session.reply;
      reply.classList.toggle("sr-only", !session.error);
      if (voice) voice.hidden = !session.reply;
      if (!form.isConnected && workspace?.organization.id === id && page === "assistant") renderCompanion(true);
    }
  };
}
async function assistant() {
  const ui = hubLabels(lang), host = document.querySelector("#page-content");
  const id = workspace.organization.id;
  const missionId = query.get("task"), requestId = query.get("request"), serviceKey = query.get("serviceRecord"), offer = query.get("offer");
  const mission = missionId ? workspace.missions.find((m) => m.id === missionId) : null;
  const offerName = serviceOffer(offer)?.[lang];
  if (missionId && !mission || offer && !offerName) throw new Error(ui.unavailable);
  const record = requestId || serviceKey ? await api(endpoint("work/" + encodeURIComponent(requestId || serviceKey))) : null;
  if (!host.isConnected) return;
  const returnLink = mission ? link("journey", { task: mission.id }) : serviceKey ? link("services", { serviceRecord: serviceKey }) : record ? link("requests", { request: record.id }) : offerName ? link("services", { offer }) : null;
  const canAsk = workspace.permissions.includes("auri:use");
  const labels3 = auriDraftCopy(lang);
  content(`${returnLink ? `<div class="hub-context"><strong>${esc2(ui.context)} \xB7 ${esc2(mission ? missionTitle(mission) : record?.name || offerName)}</strong><a class="growth-secondary" href="${esc2(returnLink)}">${esc2(ui.return)}</a></div>` : ""}<div id="auri-workspace"></div>${canAsk ? `<section class="panel auri-work-log">
  <div class="actions"><button type="button" class="primary" data-auri-draft>${esc2(labels3.create)}</button>${button("diagnosis", "diagnosis", true)}${button("recommend", "next-action", true)}</div><div data-auri-tools-status role="status"></div>
  <p role="status" data-draft-status></p>
  <h2>${esc2(labels3.history)}</h2><div data-auri-drafts></div></section>` : ""}`);
  renderCompanion(true);
  const preset = query.get("ask");
  if (preset && canAsk) {
    const form = document.querySelector("[data-auri-ask]"), input = form?.querySelector("input");
    history.replaceState(null, "", link("assistant"));
    query.delete("ask");
    if (input) {
      input.value = preset.slice(0, 500);
      form.requestSubmit?.();
    }
  }
  if (!canAsk) return;
  const create = document.querySelector("[data-auri-draft]");
  const log = document.querySelector("[data-auri-drafts]");
  const status = document.querySelector("[data-draft-status]");
  const path2 = endpoint("auri");
  const toolsStatus = document.querySelector("[data-auri-tools-status]");
  for (const [action, tool] of [["diagnosis", "diagnosis"], ["next-action", "next_action"]]) {
    const trigger = document.querySelector(`[data-action="${action}"]`);
    trigger.onclick = async () => {
      trigger.disabled = true;
      try {
        const { data } = await runAuri(id, "thinking", () => api(path2, "POST", { tool }), "speaking");
        toolsStatus.textContent = tool === "diagnosis" ? `${t("missing")} \xB7 ${data.missing.map(cap).join(", ") || t("empty")}` : data.nextAction ? cap(data.nextAction.capability) : t("empty");
      } catch (error) {
        toolsStatus.textContent = error.message;
      } finally {
        trigger.disabled = false;
      }
    };
  }
  const session = auriSessions.get(id);
  create.disabled = Boolean(session.draftPending);
  status.textContent = session.draftError || "";
  async function readDrafts() {
    const { drafts } = await api(path2);
    log.innerHTML = drafts.map((draft2) => `<article><strong>${esc2(labels3[draft2.source])}</strong>
   <time datetime="${new Date(draft2.created_at).toISOString()}">${esc2(new Date(draft2.created_at).toLocaleString(lang))}</time>
   <p>${esc2(draft2.body)}</p></article>`).join("");
  }
  readDrafts().catch((error) => {
    status.textContent = error.message;
  });
  create.onclick = async () => {
    if (session.draftPending) return;
    session.draftPending = create.disabled = true;
    session.draftError = status.textContent = "";
    try {
      await runAuri(id, "drafting", () => api(path2, "POST", { tool: "draft_follow_up", lang }), "draft_ready");
      if (create.isConnected) {
        await readDrafts();
        status.textContent = labels3.review;
      }
    } catch (error) {
      session.draftError = status.textContent = error.message;
    } finally {
      session.draftPending = create.disabled = false;
      if (!create.isConnected && page === "assistant" && workspace?.organization.id === id) assistant();
    }
  };
}
async function loadWorkspace(id = workspace.organization.id) {
  if (workspaceSwitch && id !== workspaceSwitch) return;
  const previous = workspace;
  const next = await api("/api/hub/workspaces/" + id);
  if ((workspaceSwitch || workspace.organization.id) !== id) return;
  if (workspace.organization.id !== id) {
    firstLogin = null;
    stopAuriVoice();
    workspace = next;
    navigate("home", {}, false, false);
  }
  result = null;
  scenarioInputs = null;
  workspace = next;
  render();
  if (previous.organization.id === id && next.auri?.verifiedMilestones > previous.auri?.verifiedMilestones) {
    pulseAuri(id, next.auri.level > previous.auri.level ? "evolving" : "happy", 2400);
  }
}
var loadRevision = 0;
async function load() {
  const revision = ++loadRevision;
  try {
    const data = await api("/api/hub/workspaces");
    if (revision !== loadRevision) return;
    me = data.user;
    if (["login", "signup"].includes(route) && resumeShop()) return;
    workspaces = data.workspaces;
    syncLocation();
    const requested = query.get("workspace");
    const selected = requested ? workspaces.find((w) => w.id === requested) : workspaces.find((w) => w.id === workspace?.organization.id) || workspaces[0];
    const next = selected ? await api("/api/hub/workspaces/" + selected.id) : null;
    if (revision !== loadRevision) return;
    workspace = next;
    if (requested && !selected) throw new Error(hubLabels(lang).unavailable);
    if (route === "signup" || route === "login") {
      route = "";
      navigate("home", {}, true, false);
    }
    render();
  } catch (e) {
    if (revision !== loadRevision) return;
    if (e.status === 401) {
      me = null;
      render();
    } else {
      app.setAttribute("aria-busy", "false");
      gateFrame(`<section class="panel hub-load-error"><h1>AuraHub</h1><p role="alert">${esc2(e.message)}</p><div class="actions"><button type="button" class="primary" data-retry-load>${esc2(osCopy(lang).state.retry)}</button><a class="secondary" href="/hub/login">${esc2(t("signIn"))}</a></div></section>`);
      document.querySelector("[data-retry-load]").onclick = () => {
        app.innerHTML = `<p class="initial" role="status">${esc2(osCopy(lang).state.loading)}</p>`;
        void load();
      };
    }
  }
}
async function start() {
  if (["verify", "reset", "forgot", "confirm-email"].includes(route)) {
    render();
    return;
  }
  authCapabilities = await api("/api/customer/capabilities", "GET", void 0, { timeout: 6e3 }).catch(() => ({}));
  await load();
}
start();
