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
  const money = (price2, currency) => new Intl.NumberFormat(lang2, { style: "currency", currency }).format(price2);
  const qualifiers = { en: ["From", "Request a quote"], fr: ["D\xE8s", "Demander un devis"], tr: ["Ba\u015Flang\u0131\xE7", "Teklif iste"], ar: ["\u0627\u0628\u062A\u062F\u0627\u0621\u064B \u0645\u0646", "\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631"] }[lang2] || ["From", "Request a quote"];
  const priceLabel = (value, currency, from) => Number.isFinite(value) ? (from ? qualifiers[0] + " " : "") + money(value, currency) : qualifiers[1];
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
  en: ["Home", "Roadmap", "Ask Auri", "My Work", "Build your roadmap", "Tell Auri about your business to get your first step.", "Build my roadmap", "Continue setup", "Next on your roadmap", "Needs your attention", "In progress", "Active services", "Review your menu", "Open request", "No items need your attention.", "No work in progress.", "No active services yet.", "Welcome to", "Roadmap complete", "Return to record", "Helping with", "Start small", "Build systems", "Scale with AI", "Locked", "Current stage", "Record unavailable", "Menu draft ready for review", "Mark reviewed", "Request details", "Tell me about your business."],
  fr: ["Accueil", "Feuille de route", "Demander \xE0 Auri", "Mon activit\xE9", "Cr\xE9ez votre feuille de route", "Pr\xE9sentez votre activit\xE9 \xE0 Auri pour obtenir votre premi\xE8re \xE9tape.", "Cr\xE9er ma feuille de route", "Poursuivre", "Prochaine \xE9tape", "\xC0 examiner", "En cours", "Services actifs", "Examiner votre menu", "Ouvrir la demande", "Aucun \xE9l\xE9ment \xE0 examiner.", "Aucun travail en cours.", "Aucun service actif pour le moment.", "Bienvenue dans", "Feuille de route termin\xE9e", "Revenir au dossier", "Aide pour", "Commencer simplement", "Structurer votre activit\xE9", "Se d\xE9velopper avec l\u2019IA", "Verrouill\xE9", "\xC9tape actuelle", "Dossier indisponible", "Brouillon du menu \xE0 examiner", "Marquer comme examin\xE9", "D\xE9tails de la demande", "Pr\xE9sentez-moi votre activit\xE9."],
  tr: ["Ana sayfa", "Yol haritas\u0131", "Auri\u2019ye sor", "\u0130\u015Flerim", "Yol haritan\u0131z\u0131 olu\u015Fturun", "\u0130lk ad\u0131m\u0131n\u0131z\u0131 \xF6\u011Frenmek i\xE7in Auri\u2019ye i\u015Fletmenizi anlat\u0131n.", "Yol haritam\u0131 olu\u015Ftur", "Kuruluma devam et", "S\u0131radaki ad\u0131m", "\u0130\u015Flem bekleyenler", "Devam edenler", "Aktif hizmetler", "Men\xFCn\xFCz\xFC inceleyin", "Talebi a\xE7", "\u0130\u015Flem bekleyen \xF6\u011Fe yok.", "Devam eden i\u015F yok.", "Hen\xFCz aktif hizmet yok.", "Ho\u015F geldiniz", "Yol haritas\u0131 tamamland\u0131", "Kayda d\xF6n", "Yard\u0131m konusu", "K\xFC\xE7\xFCk ba\u015Flay\u0131n", "Sistem kurun", "Yapay zek\xE2 ile b\xFCy\xFCy\xFCn", "Kilitli", "Ge\xE7erli a\u015Fama", "Kay\u0131t kullan\u0131lam\u0131yor", "Men\xFC tasla\u011F\u0131 incelemeye haz\u0131r", "\u0130ncelendi olarak i\u015Faretle", "Talep ayr\u0131nt\u0131lar\u0131", "Bana i\u015Fletmenizi anlat\u0131n."],
  ar: ["\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", "\u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0633\u0623\u0644 \u0623\u0648\u0631\u064A", "\u0623\u0639\u0645\u0627\u0644\u064A", "\u0623\u0646\u0634\u0626 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643", "\u0623\u062E\u0628\u0631 \u0623\u0648\u0631\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0644\u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u0623\u0648\u0644\u0649.", "\u0623\u0646\u0634\u0626 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u064A", "\u062A\u0627\u0628\u0639 \u0627\u0644\u0625\u0639\u062F\u0627\u062F", "\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", "\u064A\u062A\u0637\u0644\u0628 \u0627\u0646\u062A\u0628\u0627\u0647\u0643", "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629", "\u0631\u0627\u062C\u0639 \u0642\u0627\u0626\u0645\u062A\u0643", "\u0627\u0641\u062A\u062D \u0627\u0644\u0637\u0644\u0628", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0646\u0627\u0635\u0631 \u062A\u062A\u0637\u0644\u0628 \u0627\u0646\u062A\u0628\u0627\u0647\u0643.", "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0639\u0645\u0627\u0644 \u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630.", "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0646\u0634\u0637\u0629 \u0628\u0639\u062F.", "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643 \u0641\u064A", "\u0627\u0643\u062A\u0645\u0644\u062A \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u062C\u0644", "\u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629 \u0641\u064A", "\u0627\u0628\u062F\u0623 \u0628\u062E\u0637\u0648\u0627\u062A \u0628\u0633\u064A\u0637\u0629", "\u0627\u0628\u0646\u0650 \u0623\u0646\u0638\u0645\u0629", "\u062A\u0648\u0633\u0651\u0639 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", "\u0645\u063A\u0644\u0642", "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", "\u0627\u0644\u0633\u062C\u0644 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D", "\u0645\u0633\u0648\u062F\u0629 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u062A\u0645\u062A \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629", "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628", "\u0623\u062E\u0628\u0631\u0646\u064A \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A."]
};
var keys = ["home", "journey", "assistant", "services", "build", "buildNote", "buildAction", "continue", "next", "attention", "progress", "active", "reviewMenu", "openRequest", "emptyAttention", "emptyProgress", "emptyActive", "welcome", "complete", "return", "context", "small", "systems", "scale", "locked", "current", "unavailable", "menuReady", "reviewed", "requestDetails", "intake"];
var hubLabels = (lang2) => Object.fromEntries(keys.map((key, index) => [key, (labels[lang2] || labels.en)[index]]));
var destinations = { home: "", journey: "roadmap", assistant: "auri", services: "work", menuDrafts: "menu-drafts", profile: "profile", settings: "settings", resources: "resources", tasks: "tasks", simulator: "simulator", team: "team", insights: "insights", projects: "projects", websites: "websites", hosting: "hosting", files: "files", reports: "reports", invoices: "invoices", rewards: "rewards", support: "support", onboarding: "onboarding" };
var hubStage = (level) => Math.max(0, Math.min(4, (Number(level) || 1) - 1));
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
  const page2 = Object.keys(destinations).find((key) => destinations[key] === slug) || "home";
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
  return { attention, progress, services: work.services };
}
function renderWorkRow(record, { ui, esc: esc3, link: link2 }) {
  const menu = record.kind === "menu";
  const action = menu ? ui.reviewMenu : ui.openRequest;
  return `<a class="hub-work-row" href="${esc3(link2(menu ? "menuDrafts" : "services", menu ? { draft: record.id } : { request: record.id }))}">
  <span class="hub-row-icon">${hubIcon(menu ? "journey" : "services")}</span><span><strong>${esc3(record.name)}</strong>
  <small>${esc3(menu ? ui.menuReady : workStatus(record))}</small></span><span class="hub-row-action">${esc3(action)} <span aria-hidden="true">\u2197</span></span></a>`;
}
var serviceOptions = ["Web Design", "Website Care", "Pricing / Quote", "Hosting / Security", "Business Email", "Spinflow ERP", "NFC Card", "AuraMenu", "AuraWeddings", "Ad Management", "SEO / Google Maps", "AI & Automation", "Other"];
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
function createOnboarding() {
  return { phase: "entry", text: "", values: {}, facts: {}, answered: /* @__PURE__ */ new Set(), requestId: crypto.randomUUID() };
}
function renderOnboarding({ app: app2, state: state2, lang: lang2, t: t2, esc: esc3, header, robot: robot2, bind, analyze, complete, guide, save = () => {
} }) {
  const [title, intro, placeholder, analyzeLabel, manual, attach, website, nameQuestion, industryQuestion, cityQuestion, goalQuestion, next, skip, review, create, creating, urlHint, fileHint, noFacts, analyzing, converse] = copy[lang2];
  const { values, facts, answered } = state2;
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
  app2.innerHTML = `${header}<main id="main" class="auri-setup">
 <div class="auri-setup-heading"><div class="auri-setup-character">${robot2()}</div>
 <h1>${esc3(entry ? title : reviewing ? review : { name: nameQuestion, industry: industryQuestion, city: cityQuestion, goals: goalQuestion, tools: toolsQuestion[lang2] }[question])}</h1>
 ${entry ? `<p>${esc3(intro)}</p>` : ""}</div>
 <form class="auri-setup-form">
 ${entry ? `<div class="auri-setup-composer">
 <textarea name="businessText" aria-label="${esc3(placeholder)}" placeholder="${esc3(placeholder)}" maxlength="4000" rows="4">${esc3(state2.text)}</textarea>
 <div class="auri-setup-actions"><label class="secondary">${esc3(attach)}<input type="file" name="source" accept=".txt,.csv,text/plain,text/csv" class="sr-only"></label>
 <button type="button" class="secondary" data-setup="website">${esc3(website)}</button>
 <button type="submit" class="primary">${esc3(analyzeLabel)}</button></div></div>
 <p class="auri-setup-source" role="status">${esc3(state2.source || "")}</p>
 <button type="button" class="secondary" data-setup="manual">${esc3(manual)}</button>` : reviewing ? `<div class="auri-setup-review">${fields.map((key) => `<label class="field"><span>${esc3(label(key))}</span>${input(key, key === "name")}${facts[key] ? `<small>${esc3(facts[key].source)} \xB7 ${confidenceLabels[lang2][Number(facts[key].confidence === "inferred")]} \xB7 \u201C${esc3(facts[key].excerpt)}\u201D</small>` : ""}</label>`).join("")}</div>
 <button type="submit" class="primary">${esc3(create)}</button>` : `<label class="field">${esc3(label(question))}${input(question, question === "name")}</label><button type="submit" class="primary">${esc3(next)}</button>
 ${question !== "name" ? `<button type="button" class="secondary" data-setup="skip">${esc3(skip)}</button>` : ""}
 <button type="button" class="secondary" data-setup="entry">${esc3(converse)}</button>`}
 <p role="status" data-setup-status>${esc3(state2.message || "")}</p><p role="alert"></p>
 </form><div data-onboarding-guide></div></main>`;
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
      if (facts[key]?.value !== clean) delete facts[key];
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
          facts[key] = { ...fact, source: state2.source || "Auri" };
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

// src/hub/auri-companion.js
var lowBandwidth = () => navigator.connection?.saveData || ["slow-2g", "2g"].includes(navigator.connection?.effectiveType);
var AuriCharacter = class extends HTMLElement {
  connectedCallback() {
    if (this.hasAttribute("poster-only") || lowBandwidth() || !("IntersectionObserver" in window) || !window.WebGL2RenderingContext) return;
    this.observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      this.observer.disconnect();
      try {
        const { mountAuri } = await import("/media/auri/viewer.js");
        if (this.isConnected) this.disposeModel = await mountAuri(this);
      } catch {
      }
    }, { rootMargin: "100px" });
    this.observer.observe(this);
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    this.disposeModel?.();
  }
};
customElements.define("auri-character", AuriCharacter);
var auriCharacter = (level = 1, { posterOnly = false, variant } = {}) => {
  const value = Number.isInteger(level) && level >= 1 && level <= 7 ? level : 1;
  return `<auri-character class="auri" aria-hidden="true" ${["login", "guide"].includes(variant) ? `data-variant="${variant}"` : ""} level="${value}" ${posterOnly ? "poster-only" : ""}><img alt="" width="256" height="256" decoding="async" src="/media/auri/level-${value}.webp"></auri-character>`;
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
  if (typeof value === "string" && value.length <= 2048 && /^\/hub(?:\/(?:roadmap|auri|work|menu-drafts|onboarding|profile|settings|tasks|invoices|team|resources|simulator))?(?:\?[^#\r\n]*)?$/.test(value)) return value;
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
  const missionRow = (m) => `<button class="vision-task" type="button" data-node="${esc3(m.id)}" data-display-state="${esc3(displayState(m))}" aria-pressed="${selected?.id === m.id}">
  <span class="vision-task-icon" aria-hidden="true">${m.status === "done" ? "\u2713" : "\u25CB"}</span>
  <span class="vision-task-name">${esc3(title(m))}<small>${esc3(m.reason || m.description || "")}</small></span>
  <span class="vision-task-status">${esc3(status(m))} <span aria-hidden="true">\u2197</span></span>
 </button>`;
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
    <div class="vision-task-list">${stage.missions.map(missionRow).join("") || `<p class="vision-empty">${esc3(ui.empty)}</p>`}</div>
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
  en: ["Dashboard", "Roadmap", "Tasks", "Resources", "Welcome back", "Roadmap progress", "Growth stage", "Priority actions", "Estimated timeline", "Your business growth", "Your Business Growth Roadmap", "My path", "Timeline", "Current focus", "Why it matters", "How to do it", "Requirements", "Do it myself", "Get this done with AuraDigital", "Ask AURI\u2026", "Optional", "Blocked", "Update my roadmap", "Request a service", "Start", "Mark complete", "AURI Assistant", "Can AuraDigital help?", "Upcoming", "Completed", "Ask about this task"],
  tr: ["Panel", "Yol haritas\u0131", "G\xF6revler", "Kaynaklar", "Tekrar ho\u015F geldiniz", "Yol haritas\u0131 ilerlemesi", "B\xFCy\xFCme a\u015Famas\u0131", "\xD6ncelikli ad\u0131mlar", "Tahmini s\xFCre", "\u0130\u015Fletmenizin b\xFCy\xFCmesi", "\u0130\u015Fletmenizin b\xFCy\xFCme yol haritas\u0131", "Yolum", "Zaman \xE7izelgesi", "\u015Eu anki odak", "Neden \xF6nemli", "Nas\u0131l yap\u0131l\u0131r", "Gereksinimler", "Kendim yapaca\u011F\u0131m", "AuraDigital ile yap", "AURI\u2019ye sorun\u2026", "\u0130ste\u011Fe ba\u011Fl\u0131", "Engellendi", "Yol haritas\u0131n\u0131 g\xFCncelle", "Hizmet iste", "Ba\u015Fla", "Tamamland\u0131 olarak i\u015Faretle", "AURI Asistan\u0131", "AuraDigital yard\u0131mc\u0131 olabilir mi?", "Yakla\u015Fan", "Tamamlanan", "Bu g\xF6revi sor"],
  fr: ["Tableau de bord", "Feuille de route", "T\xE2ches", "Ressources", "Bon retour", "Progression", "\xC9tape de croissance", "Actions prioritaires", "D\xE9lai estim\xE9", "La croissance de votre entreprise", "Votre feuille de route de croissance", "Mon parcours", "Chronologie", "Priorit\xE9 actuelle", "Pourquoi cette t\xE2che compte", "Comment faire", "Pr\xE9requis", "Le faire moi-m\xEAme", "Confier \xE0 AuraDigital", "Demander \xE0 AURI\u2026", "Facultatif", "Bloqu\xE9", "Actualiser la feuille de route", "Demander un service", "D\xE9marrer", "Marquer comme termin\xE9", "Assistant AURI", "AuraDigital peut-il aider ?", "\xC0 venir", "Termin\xE9", "Poser une question sur cette t\xE2che"],
  ar: ["\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", "\u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0644\u0645\u0647\u0627\u0645", "\u0627\u0644\u0645\u0648\u0627\u0631\u062F", "\u0623\u0647\u0644\u064B\u0627 \u0628\u0639\u0648\u062F\u062A\u0643", "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0645\u0648", "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0630\u0627\u062A \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", "\u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0642\u062F\u0631\u0629", "\u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u062E\u0627\u0631\u0637\u0629 \u0646\u0645\u0648 \u0646\u0634\u0627\u0637\u0643 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", "\u0645\u0633\u0627\u0631\u064A", "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A", "\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0627\u0644\u062D\u0627\u0644\u064A", "\u0644\u0645\u0627\u0630\u0627 \u064A\u0647\u0645", "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u0646\u0641\u064A\u0630", "\u0627\u0644\u0645\u062A\u0637\u0644\u0628\u0627\u062A", "\u0633\u0623\u0646\u0641\u0630\u0647\u0627 \u0628\u0646\u0641\u0633\u064A", "\u0646\u0641\u0651\u0630 \u0645\u0639 AuraDigital", "\u0627\u0633\u0623\u0644 AURI\u2026", "\u0627\u062E\u062A\u064A\u0627\u0631\u064A", "\u0645\u062A\u0648\u0642\u0641", "\u062D\u062F\u0651\u062B \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", "\u0627\u0637\u0644\u0628 \u062E\u062F\u0645\u0629", "\u0627\u0628\u062F\u0623", "\u0639\u0644\u0651\u0645 \u0643\u0645\u0643\u062A\u0645\u0644", "\u0645\u0633\u0627\u0639\u062F AURI", "\u0647\u0644 \u064A\u0645\u0643\u0646 \u0644\u0640 AuraDigital \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629\u061F", "\u0627\u0644\u0642\u0627\u062F\u0645", "\u0627\u0644\u0645\u0643\u062A\u0645\u0644", "\u0627\u0633\u0623\u0644 \u0639\u0646 \u0647\u0630\u0647 \u0627\u0644\u0645\u0647\u0645\u0629"]
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
function renderRoadmap({ host, workspace: workspace2, t: t2, esc: esc3, cap: cap2, lang: lang2, view, selectedId, overview = false, auriDesk = "", evolutionNames = [], onSelect, onContinue, onView, onSave, onEdit, onGenerate, onAsk, onRoute, onEvidence, onExistingEvidence, onAskTask, robot: robot2, requestLink: requestLink2 }) {
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
  const metric = (icon, value, label) => `<article class="growth-card growth-metric"><span class="growth-metric-icon" aria-hidden="true">${icon}</span><div><strong>${esc3(value)}</strong><span>${label}</span></div></article>`;
  const existing = [.../* @__PURE__ */ new Set([...profile.capabilities || [], ...profile.website ? ["website"] : []])].filter((id) => missionAlternative(id) && !missions.some((m) => m.capability === id));
  const existingProof = canWrite && existing.length ? `<details class="growth-card hub-existing-proof"><summary>${esc3(ui.proof)}</summary>
  <form data-existing-evidence class="mission-evidence"><label class="field">${esc3(t2("capabilities"))}
   <select name="capability">${existing.map((id) => `<option value="${esc3(id)}">${esc3(cap2(id))}</option>`).join("")}</select></label>
   <label class="field">${esc3(ui.proofLabel)}<textarea name="proof" required minlength="10" maxlength="1000" rows="2"></textarea></label>
   <button class="growth-secondary">${esc3(ui.submit)}</button></form></details>` : "";
  const detail = selected ? taskDetails(selected) : `<p>${esc3(t2("empty"))}</p>`;
  const level = workspace2.auri?.level || 1;
  const next = eligible[0];
  const overviewHero = `<div class="hub-overview-grid ${auriDesk ? "has-companion" : ""}">
  <section class="growth-card hub-overview-intro">
   <p class="hub-section-label">${esc3(ui.overview)}</p>
   <h1>${esc3(workspace2.organization.name)}</h1>
   <ol class="hub-evolution-track" aria-label="${esc3(t2("level"))}">
    ${evolutionNames.map((name, index) => `<li data-level-state="${index + 1 < level ? "complete" : index + 1 === level ? "current" : "locked"}" ${index + 1 === level ? 'aria-current="step"' : ""}>
     <span>${index + 1}</span><small>${esc3(name)}</small></li>`).join("")}
   </ol>
   <div class="hub-next-mission">
    <div><p class="hub-section-label">${esc3(ui.next)}</p><h2>${next ? esc3(title(next)) : esc3(t2("empty"))}</h2></div>
    ${next ? `<button class="growth-primary" type="button" data-next-mission>${esc3(command.continue)} <span aria-hidden="true">\u2197</span></button>` : ""}
   </div>
  </section>${auriDesk}
 </div>`;
  host.innerHTML = `${overview ? overviewHero : ""}
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
    const row = (label, body) => `<div class="growth-detail-row"><h3>${label}</h3><p>${esc3(body)}</p></div>`;
    return `<div class="growth-focus-top"><span>${l.focus}</span><small>${esc3(status(m))}${m.optional ? " \xB7 " + l.optional : ""}</small></div>
   <h2>${esc3(title(m))}</h2>
   ${!alternate && m.description !== reason && !m.description.startsWith("Establish ") ? `<p>${esc3(m.description)}</p>` : ""}
   ${alternate ? "" : row(l.why, reason || m.description)}
   ${!alternate && m.dependencies?.length ? row(l.requirements, m.dependencies.map(cap2).join(", ")) : ""}
   ${guide?.[0] ? row(l.help, guide[0] + " \xB7 " + t2("quote")) : ""}
   <details class="growth-diy" open><summary>${l.myself}</summary>${row(l.how, action)}
   ${blocked ? `<p>${l.blocked} \xB7 ${esc3(requirements.map(cap2).join(", "))}</p>` : ""}</details>
   <div class="growth-actions">
   ${guide?.[0] ? `<a class="growth-primary" href="${esc3(requestLink2(guide[0], m.id))}">${l.hire} \u2192</a>` : ""}
   ${canWrite ? `<button class="growth-secondary" data-quick-status="${m.status === "done" ? "planned" : blocked ? "in_progress" : "done"}">${m.status === "done" ? esc3(t2("planned")) : blocked ? l.start : l.complete}</button><label><span class="sr-only">${esc3(t2("status"))}</span><select data-status-change>${["planned", "in_progress", "done", "postponed"].map((value) => `<option value="${value}" ${m.status === value ? "selected" : ""}>${esc3(t2(value))}</option>`).join("")}</select></label><button class="growth-secondary" data-edit>${esc3(t2("edit"))}</button>` : ""}
   ${canAsk ? `<button class="growth-secondary" data-ask-task>${l.askTask}</button>` : ""}</div>
   ${proof ? `<p class="mission-proof-status" role="status">${esc3(ui[proof])}</p>` : ""}
   ${canWrite && missionAlternative(m.capability) ? `<div class="growth-actions">
    ${proof === "pending" || m.status === "done" ? "" : alternate ? `<button type="button" class="growth-secondary" data-route="original">${esc3(ui.original)}</button>` : `<button type="button" class="growth-secondary" data-route="alternative">${esc3(ui.irrelevant)}</button>`}
    ${m.status === "done" || m.status === "postponed" ? "" : `<button type="button" class="growth-secondary" data-quick-status="postponed">${esc3(ui.later)}</button>`}
   </div>${!alternate && m.status !== "done" && proof !== "pending" ? `<details class="growth-diy"><summary>${esc3(ui.alternative)}</summary>
    <p>${esc3(missionAlternative(m.capability).steps)}</p><button type="button" class="growth-secondary" data-route="alternative">${esc3(t2("continue"))}</button></details>` : ""}
${proof === "pending" || proof === "approved" ? "" : `<details class="growth-diy"><summary>${esc3(ui.proof)}</summary>
    <form data-evidence class="mission-evidence"><label class="field">${esc3(ui.proofLabel)}<textarea name="proof" required minlength="10" maxlength="1000" rows="3"></textarea></label>
    <button class="growth-secondary">${esc3(ui.submit)}</button></form></details>`}` : ""}`;
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
    select2.innerHTML = '<option value="">Choose a saved draft</option>' + response.drafts.map((menu) => `<option value="${esc(menu.id)}" ${menu.id === selected?.id ? "selected" : ""}>${esc(menu.draft.fields.businessName || "Untitled menu")} \xB7 ${esc(menu.state)} \xB7 v${menu.version}</option>`).join("");
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
  en: { brand: "Business Hub", tag: "Understand. Build. Collaborate. Grow.", welcome: "Welcome to AuraDigital.", choose: "How would you like to build your business journey?", myself: "Build Myself", myselfText: "Set your goals, explore services and shape your own roadmap.", auri: "Build With AURI", auriText: "Take a guided journey, one short question at a time.", home: "Overview", profile: "Business Profile", journey: "Business Journey", simulator: "Growth Simulator", assistant: "AURI Assistant", reports: "Reports & Analytics", projects: "Projects", websites: "My Websites", services: "My Services", hosting: "Domains & Hosting", files: "Files & Documents", orders: "Shop & Orders", invoices: "Invoices & Payments", rewards: "Rewards", team: "Team Members", support: "Support", settings: "Settings", grow: "GROW", manage: "MANAGE", account: "ACCOUNT", menu: "Menu", close: "Close", save: "Save", saved: "Saved", saving: "Saving\u2026", continue: "Continue", back: "Back", skip: "Skip", signIn: "Sign In", signup: "Create Account", email: "Email", password: "Password", name: "Full name", terms: "I accept the account conditions and use of my details to manage my account.", google: "Continue with Google", forgot: "Forgot password?", logout: "Log Out", verify: "Verify email", verifyLater: "You can draft your profile and roadmap now. Verify your email before billing, team invitations or shared private access.", sendVerification: "Send verification link", reset: "Reset password", resetSent: "If an eligible account exists, a reset link will be sent.", newPassword: "New password", confirm: "Confirm", cancel: "Cancel", error: "Something went wrong. Please try again.", noData: "No measured data is connected yet.", next: "Your next step", readiness: "Capability readiness", progress: "Roadmap progress", level: "Level", foundation: "Foundation", visibility: "Visibility", conversion: "Conversion", automation: "Automation", scale: "Scale", createJourney: "Generate my roadmap", noPurchase: "Complete missions using any provider or your own work. AuraDigital purchases are optional.", quote: "Scope & quote required", planned: "Planned", in_progress: "In progress", done: "Done", postponed: "Postponed", up: "Move earlier", down: "Move later", edit: "Edit", objective: "Objective", description: "Description", nextAction: "Next action", why: "Recommended because this capability has not been reported in your profile.", benefit: "Potential improvement; compare results against your own baseline.", assumptions: "Assumptions, not guarantees", calculate: "Calculate scenarios", scenarioName: "Scenario name", saveScenario: "Save scenario", export: "Export JSON", history: "Saved scenarios", conservative: "Conservative", base: "Base", ambitious: "Ambitious", visits: "Monthly website visits", leads: "Monthly website leads", closeRate: "Lead-to-customer conversion (%)", customerValue: "Revenue per customer in this period", margin: "Contribution margin (%)", monthlyCost: "Monthly service cost", setupCost: "One-time setup cost", trafficLift: "Traffic increase (%)", leadRateLift: "Lead-rate increase (%)", closeRateLift: "Closing-rate increase (%)", customers: "Additional customers", revenue: "Additional monthly revenue", profit: "Additional contribution profit", net: "Net monthly contribution after service cost", roi: "First-year ROI", payback: "Setup payback (months)", na: "Not applicable", simNotice: "Illustrative estimates. Enter combined changes once per funnel stage to avoid counting the same benefit twice. Rates are capped at 100%. Costs and revenue must use the same currency and period. Taxes, fixed overhead and financing are excluded.", formula: "Customers = visits \xD7 lead rate \xD7 closing rate. Contribution = additional revenue \xD7 margin. First-year ROI = (12 \xD7 additional contribution \u2212 setup \u2212 12 \xD7 monthly costs) \xF7 (setup + 12 \xD7 monthly costs). Payback = setup \xF7 net monthly contribution, where positive.", teamTitle: "Grow together with your team.", teamText: "Invite trusted people to help manage your business. Each additional member gets their own secure access for $5 USD/month, paid by that member.", blocked: "Live recurring checkout is BLOCKED until billing, taxes, signed webhooks and cancellation terms are configured and verified. Invitations do not grant access or charge anyone.", invite: "Invite Member", role: "Role", message: "Optional invitation message", status: "Status", subscription: "Subscription", paymentDate: "Next payment", remove: "Remove access", removeConfirm: "Immediately revoke this member\u2019s business access? Their personal account and shared business data will be preserved.", cancelInvite: "Cancel invitation", resend: "Replace & resend", inviteAccept: "Accept invitation", recurringConsent: "I accept this invitation and the $5 USD monthly recurring subscription for my own access. Checkout is currently blocked; I will not be charged and access will remain pending.", awaiting: "Awaiting payment", permissions: "Permissions", activity: "Access activity", unavailable: "This integration is not connected to your verified workspace yet.", legacy: "Your existing accounts, products and orders remain available through their existing authorized workflows.", openAccount: "Open my account & orders", contact: "Contact support", aiRules: "AURI guided tools", aiNotice: "Rules-based guidance is available. Generative business advice and private invoice/project tools are not integrated yet.", diagnosis: "Business diagnosis", recommend: "Recommend my next action", strengths: "Reported strengths", missing: "Missing capabilities", source: "Source: customer-entered profile", businessName: "Business name", industry: "Industry", country: "Country", city: "City", stage: "Business stage", website: "Website (HTTPS)", tools: "Existing digital tools", acquisition: "How do customers find you?", difficulties: "Main difficulties", goals: "Business goals", budget: "Approximate budget (optional)", currency: "Currency", timeline: "Desired timeline", industryDetails: "Industry details", capabilities: "Capabilities you already have", restaurant: "Restaurant", ecommerce: "E-commerce", real_estate: "Real estate", other: "Other", servicesIndustry: "Service business", restaurantQuestion: "How do guests discover you, view your menu and make reservations?", ecommerceQuestion: "How do you manage your catalog, checkout and repeat purchases?", realEstateQuestion: "How do you list properties, capture inquiries and follow up?", servicesQuestion: "How do customers book, receive quotes and pay?", otherQuestion: "Describe how you serve customers.", newWorkspace: "New business", switchMode: "Switch onboarding mode", verified: "Email verified", owner: "Owner", admin: "Admin", member: "Member", viewer: "Viewer", readOnly: "Read-only access", supportText: "Send a support request through the existing contact form.", verifiedRequired: "Verify your email to manage team access.", empty: "Nothing here yet.", billingPrivate: "Each member\u2019s payment details stay private. This page shows access status only.", security: "Security settings", linkGoogle: "Link my verified Google identity", rename: "Save changes", refresh: "Reload", serviceNote: "Explore current services and request a scope-specific quote.", openServices: "Explore services", reportNote: "Traffic, revenue, actual-versus-projected reports and rewards cannot be displayed until trustworthy sources and a valid loyalty ledger are connected." },
  fr: { brand: "Espace entreprise", tag: "Comprendre. Construire. Collaborer. Grandir.", welcome: "Bienvenue chez AuraDigital.", choose: "Comment souhaitez-vous construire votre parcours ?", myself: "Construire moi-m\xEAme", myselfText: "D\xE9finissez vos objectifs et cr\xE9ez votre feuille de route.", auri: "Construire avec AURI", auriText: "Avancez avec des questions courtes et adapt\xE9es.", home: "Vue d\u2019ensemble", profile: "Profil entreprise", journey: "Parcours entreprise", simulator: "Simulateur de croissance", assistant: "Assistant AURI", reports: "Rapports et analyses", projects: "Projets", websites: "Mes sites", services: "Mes services", hosting: "Domaines et h\xE9bergement", files: "Fichiers et documents", orders: "Boutique et commandes", invoices: "Factures et paiements", rewards: "R\xE9compenses", team: "Membres de l\u2019\xE9quipe", support: "Assistance", settings: "Param\xE8tres", grow: "D\xC9VELOPPER", manage: "G\xC9RER", account: "COMPTE", menu: "Menu", close: "Fermer", save: "Enregistrer", saved: "Enregistr\xE9", saving: "Enregistrement\u2026", continue: "Continuer", back: "Retour", skip: "Passer", signIn: "Se connecter", signup: "Cr\xE9er un compte", email: "E-mail", password: "Mot de passe", name: "Nom complet", terms: "J\u2019accepte les conditions du compte et l\u2019utilisation de mes donn\xE9es pour sa gestion.", google: "Continuer avec Google", forgot: "Mot de passe oubli\xE9 ?", logout: "Se d\xE9connecter", verify: "V\xE9rifier l\u2019e-mail", verifyLater: "Cr\xE9ez votre profil et votre parcours maintenant. V\xE9rifiez votre e-mail avant les paiements, invitations ou acc\xE8s priv\xE9s partag\xE9s.", sendVerification: "Envoyer le lien de v\xE9rification", reset: "R\xE9initialiser le mot de passe", newPassword: "Nouveau mot de passe", confirm: "Confirmer", cancel: "Annuler", error: "Une erreur est survenue. R\xE9essayez.", next: "Votre prochaine \xE9tape", readiness: "Capacit\xE9s d\xE9clar\xE9es", progress: "Avancement du parcours", level: "Niveau", foundation: "Fondations", visibility: "Visibilit\xE9", conversion: "Conversion", automation: "Automatisation", scale: "Expansion", createJourney: "G\xE9n\xE9rer mon parcours", noPurchase: "R\xE9alisez vos missions avec le prestataire de votre choix ou vous-m\xEAme. Aucun achat AuraDigital obligatoire.", quote: "Devis n\xE9cessaire", planned: "Pr\xE9vu", in_progress: "En cours", done: "Termin\xE9", postponed: "Report\xE9", up: "Avancer", down: "Reculer", edit: "Modifier", objective: "Objectif", description: "Description", nextAction: "Prochaine action", why: "Recommand\xE9 car cette capacit\xE9 ne figure pas dans votre profil.", benefit: "Am\xE9lioration possible \xE0 comparer \xE0 vos propres r\xE9sultats.", assumptions: "Hypoth\xE8ses, sans garantie", calculate: "Calculer les sc\xE9narios", scenarioName: "Nom du sc\xE9nario", saveScenario: "Enregistrer le sc\xE9nario", export: "Exporter JSON", history: "Sc\xE9narios enregistr\xE9s", conservative: "Prudent", base: "Central", ambitious: "Ambitieux", visits: "Visites mensuelles du site", leads: "Prospects mensuels du site", closeRate: "Conversion prospect-client (%)", customerValue: "Revenu par client sur la p\xE9riode", margin: "Marge contributive (%)", monthlyCost: "Co\xFBt mensuel des services", setupCost: "Co\xFBt initial", trafficLift: "Hausse du trafic (%)", leadRateLift: "Hausse du taux de prospects (%)", closeRateLift: "Hausse du taux de conversion (%)", customers: "Clients suppl\xE9mentaires", revenue: "Revenu mensuel suppl\xE9mentaire", profit: "Contribution suppl\xE9mentaire", net: "Contribution nette apr\xE8s services", roi: "ROI de la premi\xE8re ann\xE9e", payback: "D\xE9lai de retour initial (mois)", na: "Non applicable", teamTitle: "D\xE9veloppez votre entreprise ensemble.", teamText: "Invitez votre \xE9quipe. Chaque membre suppl\xE9mentaire paie son propre abonnement de 5 USD par mois.", blocked: "Paiement r\xE9current BLOQU\xC9 en attendant la configuration et la validation du prestataire, des taxes, des webhooks et des conditions d\u2019annulation. Une invitation ne donne aucun acc\xE8s et ne d\xE9bite rien.", invite: "Inviter un membre", role: "R\xF4le", message: "Message facultatif", status: "Statut", subscription: "Abonnement", paymentDate: "Prochain paiement", remove: "R\xE9voquer l\u2019acc\xE8s", removeConfirm: "R\xE9voquer imm\xE9diatement cet acc\xE8s ? Le compte personnel et les donn\xE9es partag\xE9es seront conserv\xE9s.", cancelInvite: "Annuler l\u2019invitation", resend: "Remplacer et renvoyer", inviteAccept: "Accepter l\u2019invitation", recurringConsent: "J\u2019accepte l\u2019invitation et l\u2019abonnement r\xE9current de 5 USD par mois pour mon acc\xE8s personnel. Le paiement est bloqu\xE9 : aucun d\xE9bit ni acc\xE8s avant validation.", awaiting: "En attente de paiement", permissions: "Autorisations", activity: "Activit\xE9 des acc\xE8s", unavailable: "Cette int\xE9gration n\u2019est pas encore reli\xE9e \xE0 votre espace v\xE9rifi\xE9.", legacy: "Vos comptes, produits et commandes existants restent disponibles dans leurs parcours autoris\xE9s.", openAccount: "Mon compte et mes commandes", contact: "Contacter l\u2019assistance", aiRules: "Outils guid\xE9s AURI", aiNotice: "Conseils fond\xE9s sur des r\xE8gles disponibles. Les conseils g\xE9n\xE9ratifs et les outils priv\xE9s de facturation/projet ne sont pas encore int\xE9gr\xE9s.", diagnosis: "Diagnostic entreprise", recommend: "Recommander la prochaine action", strengths: "Points forts d\xE9clar\xE9s", missing: "Capacit\xE9s manquantes", source: "Source : profil renseign\xE9 par le client", businessName: "Nom de l\u2019entreprise", industry: "Secteur", country: "Pays", city: "Ville", stage: "Stade de d\xE9veloppement", website: "Site web (HTTPS)", tools: "Outils num\xE9riques existants", acquisition: "Comment trouvez-vous vos clients ?", difficulties: "Difficult\xE9s principales", goals: "Objectifs", budget: "Budget approximatif (facultatif)", currency: "Devise", timeline: "D\xE9lai souhait\xE9", industryDetails: "Pr\xE9cisions sur votre secteur", capabilities: "Capacit\xE9s d\xE9j\xE0 disponibles", restaurant: "Restaurant", ecommerce: "Commerce en ligne", real_estate: "Immobilier", other: "Autre", servicesIndustry: "Entreprise de services", restaurantQuestion: "Comment vos clients vous trouvent-ils, consultent-ils le menu et r\xE9servent-ils ?", ecommerceQuestion: "Comment g\xE9rez-vous le catalogue, les paiements et les achats r\xE9p\xE9t\xE9s ?", realEstateQuestion: "Comment publiez-vous les biens et suivez-vous les demandes ?", servicesQuestion: "Comment g\xE9rez-vous r\xE9servations, devis et paiements ?", otherQuestion: "Comment servez-vous vos clients ?", newWorkspace: "Nouvelle entreprise", switchMode: "Changer de mode", verified: "E-mail v\xE9rifi\xE9", owner: "Propri\xE9taire", admin: "Administrateur", member: "Membre", viewer: "Lecteur", readOnly: "Lecture seule", verifiedRequired: "V\xE9rifiez votre e-mail pour g\xE9rer l\u2019\xE9quipe.", empty: "Aucun \xE9l\xE9ment pour le moment.", billingPrivate: "Les d\xE9tails de paiement de chaque membre restent priv\xE9s.", security: "Param\xE8tres de s\xE9curit\xE9", linkGoogle: "Associer mon compte Google v\xE9rifi\xE9", rename: "Enregistrer les modifications", refresh: "Recharger", serviceNote: "D\xE9couvrez nos services et demandez un devis adapt\xE9.", openServices: "D\xE9couvrir les services", reportNote: "Les rapports et r\xE9compenses n\xE9cessitent des sources fiables et un registre de fid\xE9lit\xE9 connect\xE9." },
  tr: { brand: "\u0130\u015Fletme Merkezi", tag: "Anla. Kur. Birlikte \xE7al\u0131\u015F. B\xFCy\xFC.", welcome: "AuraDigital\u2019e ho\u015F geldiniz.", choose: "\u0130\u015Fletme yolculu\u011Funuzu nas\u0131l olu\u015Fturmak istersiniz?", myself: "Kendim Olu\u015Fturay\u0131m", myselfText: "Hedeflerinizi belirleyin ve yol haritan\u0131z\u0131 olu\u015Fturun.", auri: "AURI ile Olu\u015Ftur", auriText: "K\u0131sa, ilgili sorularla ad\u0131m ad\u0131m ilerleyin.", home: "Genel Bak\u0131\u015F", profile: "\u0130\u015Fletme Profili", journey: "\u0130\u015Fletme Yolculu\u011Fu", simulator: "B\xFCy\xFCme Sim\xFClat\xF6r\xFC", assistant: "AURI Asistan\u0131", reports: "Raporlar ve Analiz", projects: "Projeler", websites: "Web Sitelerim", services: "Hizmetlerim", hosting: "Alan Ad\u0131 ve Hosting", files: "Dosyalar ve Belgeler", orders: "Ma\u011Faza ve Sipari\u015Fler", invoices: "Faturalar ve \xD6demeler", rewards: "\xD6d\xFCller", team: "Ekip \xDCyeleri", support: "Destek", settings: "Ayarlar", grow: "B\xDCY\xDC", manage: "Y\xD6NET", account: "HESAP", menu: "Men\xFC", close: "Kapat", save: "Kaydet", saved: "Kaydedildi", saving: "Kaydediliyor\u2026", continue: "Devam", back: "Geri", skip: "Atla", signIn: "Giri\u015F Yap", signup: "Hesap Olu\u015Ftur", email: "E-posta", password: "\u015Eifre", name: "Ad soyad", terms: "Hesap ko\u015Fullar\u0131n\u0131 ve bilgilerimin hesab\u0131m\u0131 y\xF6netmek i\xE7in kullan\u0131lmas\u0131n\u0131 kabul ediyorum.", google: "Google ile devam et", forgot: "\u015Eifremi unuttum", logout: "\xC7\u0131k\u0131\u015F Yap", verify: "E-postay\u0131 do\u011Frula", verifyLater: "Profil ve yol haritas\u0131 tasla\u011F\u0131 olu\u015Fturabilirsiniz. \xD6deme, ekip daveti ve \xF6zel payla\u015F\u0131ml\u0131 eri\u015Fim \xF6ncesinde e-postan\u0131z\u0131 do\u011Frulay\u0131n.", sendVerification: "Do\u011Frulama ba\u011Flant\u0131s\u0131 g\xF6nder", reset: "\u015Eifreyi s\u0131f\u0131rla", newPassword: "Yeni \u015Fifre", confirm: "Onayla", cancel: "\u0130ptal", error: "Bir hata olu\u015Ftu. Tekrar deneyin.", next: "Sonraki ad\u0131m\u0131n\u0131z", readiness: "Bildirilen yetkinlikler", progress: "Yol haritas\u0131 ilerlemesi", level: "Seviye", foundation: "Temel", visibility: "G\xF6r\xFCn\xFCrl\xFCk", conversion: "D\xF6n\xFC\u015F\xFCm", automation: "Otomasyon", scale: "\xD6l\xE7ekleme", createJourney: "Yol haritam\u0131 olu\u015Ftur", noPurchase: "G\xF6revleri kendiniz veya istedi\u011Finiz sa\u011Flay\u0131c\u0131yla tamamlay\u0131n. AuraDigital\u2019den sat\u0131n alma zorunlu de\u011Fildir.", quote: "Kapsam ve teklif gerekli", planned: "Planland\u0131", in_progress: "Devam ediyor", done: "Tamamland\u0131", postponed: "Ertelendi", up: "\xD6ne ta\u015F\u0131", down: "Geri ta\u015F\u0131", edit: "D\xFCzenle", objective: "Hedef", description: "A\xE7\u0131klama", nextAction: "Sonraki i\u015Flem", why: "Bu yetkinlik profilinizde bildirilmedi\u011Fi i\xE7in \xF6nerildi.", benefit: "Olas\u0131 iyile\u015Fme; kendi ba\u015Flang\u0131\xE7 verinizle kar\u015F\u0131la\u015Ft\u0131r\u0131n.", assumptions: "Varsay\u0131mlar, garanti de\u011Fildir", calculate: "Senaryolar\u0131 hesapla", scenarioName: "Senaryo ad\u0131", saveScenario: "Senaryoyu kaydet", export: "JSON d\u0131\u015Fa aktar", history: "Kay\u0131tl\u0131 senaryolar", conservative: "Temkinli", base: "Temel", ambitious: "\u0130ddial\u0131", visits: "Ayl\u0131k site ziyareti", leads: "Ayl\u0131k site potansiyel m\xFC\u015Fterisi", closeRate: "M\xFC\u015Fteriye d\xF6n\xFC\u015F\xFCm (%)", customerValue: "D\xF6nemde m\xFC\u015Fteri ba\u015F\u0131na gelir", margin: "Katk\u0131 marj\u0131 (%)", monthlyCost: "Ayl\u0131k hizmet maliyeti", setupCost: "Ba\u015Flang\u0131\xE7 maliyeti", trafficLift: "Trafik art\u0131\u015F\u0131 (%)", leadRateLift: "Potansiyel m\xFC\u015Fteri oran\u0131 art\u0131\u015F\u0131 (%)", closeRateLift: "Sat\u0131\u015F d\xF6n\xFC\u015F\xFCm oran\u0131 art\u0131\u015F\u0131 (%)", customers: "Ek m\xFC\u015Fteri", revenue: "Ek ayl\u0131k gelir", profit: "Ek katk\u0131 k\xE2r\u0131", net: "Hizmet maliyeti sonras\u0131 net katk\u0131", roi: "\u0130lk y\u0131l yat\u0131r\u0131m getirisi", payback: "Ba\u015Flang\u0131\xE7 geri \xF6deme s\xFCresi (ay)", na: "Uygulanamaz", teamTitle: "Ekibinizle birlikte b\xFCy\xFCy\xFCn.", teamText: "G\xFCvendi\u011Finiz ki\u015Fileri davet edin. Her ek \xFCye kendi eri\u015Fimi i\xE7in ayda 5 USD \xF6der.", blocked: "Sa\u011Flay\u0131c\u0131, vergiler, imzal\u0131 webhook ve iptal ko\u015Fullar\u0131 yap\u0131land\u0131r\u0131l\u0131p do\u011Frulanana kadar canl\u0131 abonelik \xF6demesi ENGELL\u0130D\u0130R. Davet eri\u015Fim sa\u011Flamaz ve \xFCcret almaz.", invite: "\xDCye Davet Et", role: "Rol", message: "\u0130ste\u011Fe ba\u011Fl\u0131 davet mesaj\u0131", status: "Durum", subscription: "Abonelik", paymentDate: "Sonraki \xF6deme", remove: "Eri\u015Fimi kald\u0131r", removeConfirm: "Bu \xFCyenin i\u015Fletme eri\u015Fimi hemen kald\u0131r\u0131ls\u0131n m\u0131? Ki\u015Fisel hesab\u0131 ve ortak i\u015Fletme verileri korunur.", cancelInvite: "Daveti iptal et", resend: "Yenile ve yeniden g\xF6nder", inviteAccept: "Daveti kabul et", recurringConsent: "Daveti ve ki\u015Fisel eri\u015Fimim i\xE7in ayl\u0131k 5 USD yinelenen aboneli\u011Fi kabul ediyorum. \xD6deme \u015Fu anda engelli; \xFCcret al\u0131nmaz ve eri\u015Fim beklemede kal\u0131r.", awaiting: "\xD6deme bekleniyor", permissions: "\u0130zinler", activity: "Eri\u015Fim hareketleri", unavailable: "Bu entegrasyon do\u011Frulanm\u0131\u015F \xE7al\u0131\u015Fma alan\u0131n\u0131za hen\xFCz ba\u011Fl\u0131 de\u011Fil.", legacy: "Mevcut hesaplar\u0131n\u0131z, \xFCr\xFCnleriniz ve sipari\u015Fleriniz kendi yetkili ak\u0131\u015Flar\u0131nda kullan\u0131labilir.", openAccount: "Hesab\u0131m ve sipari\u015Flerim", contact: "Destek ile ileti\u015Fim", aiRules: "AURI rehber ara\xE7lar\u0131", aiNotice: "Kural tabanl\u0131 rehberlik kullan\u0131labilir. \xDCretken i\u015Fletme \xF6nerileri ile \xF6zel fatura ve proje ara\xE7lar\u0131 hen\xFCz entegre de\u011Fil.", diagnosis: "\u0130\u015Fletme analizi", recommend: "Sonraki ad\u0131m\u0131 \xF6ner", strengths: "Bildirilen g\xFC\xE7l\xFC y\xF6nler", missing: "Eksik yetkinlikler", source: "Kaynak: m\xFC\u015Fteri taraf\u0131ndan girilen profil", businessName: "\u0130\u015Fletme ad\u0131", industry: "Sekt\xF6r", country: "\xDClke", city: "\u015Eehir", stage: "\u0130\u015Fletme a\u015Famas\u0131", website: "Web sitesi (HTTPS)", tools: "Mevcut dijital ara\xE7lar", acquisition: "M\xFC\u015Fteriler sizi nas\u0131l buluyor?", difficulties: "Ba\u015Fl\u0131ca zorluklar", goals: "\u0130\u015Fletme hedefleri", budget: "Yakla\u015F\u0131k b\xFCt\xE7e (iste\u011Fe ba\u011Fl\u0131)", currency: "Para birimi", timeline: "Hedeflenen zaman", industryDetails: "Sekt\xF6r ayr\u0131nt\u0131lar\u0131", capabilities: "Mevcut yetkinlikleriniz", restaurant: "Restoran", ecommerce: "E-ticaret", real_estate: "Gayrimenkul", other: "Di\u011Fer", servicesIndustry: "Hizmet i\u015Fletmesi", restaurantQuestion: "Misafirler sizi nas\u0131l buluyor, men\xFCy\xFC g\xF6r\xFCyor ve rezervasyon yap\u0131yor?", ecommerceQuestion: "Katalo\u011Fu, \xF6demeyi ve tekrar al\u0131\u015Fveri\u015Fi nas\u0131l y\xF6netiyorsunuz?", realEstateQuestion: "\u0130lan, m\xFC\u015Fteri talebi ve takibi nas\u0131l y\xF6netiyorsunuz?", servicesQuestion: "Randevu, teklif ve \xF6demeler nas\u0131l y\xF6netiliyor?", otherQuestion: "M\xFC\u015Fterilere nas\u0131l hizmet veriyorsunuz?", newWorkspace: "Yeni i\u015Fletme", switchMode: "Rehberlik modunu de\u011Fi\u015Ftir", verified: "E-posta do\u011Fruland\u0131", owner: "Sahip", admin: "Y\xF6netici", member: "\xDCye", viewer: "G\xF6r\xFCnt\xFCleyici", readOnly: "Salt okunur", verifiedRequired: "Ekibi y\xF6netmek i\xE7in e-postan\u0131z\u0131 do\u011Frulay\u0131n.", empty: "Hen\xFCz kay\u0131t yok.", billingPrivate: "Her \xFCyenin \xF6deme bilgileri gizli kal\u0131r.", security: "G\xFCvenlik ayarlar\u0131", linkGoogle: "Do\u011Frulanm\u0131\u015F Google hesab\u0131m\u0131 ba\u011Fla", rename: "De\u011Fi\u015Fiklikleri kaydet", refresh: "Yenile", serviceNote: "Hizmetleri inceleyin ve i\u015Fletmenize \xF6zel teklif isteyin.", openServices: "Hizmetleri ke\u015Ffet", reportNote: "Raporlar ve \xF6d\xFCller i\xE7in g\xFCvenilir veri kaynaklar\u0131 ve do\u011Frulanm\u0131\u015F sadakat defteri ba\u011Flanmal\u0131d\u0131r." },
  ar: { brand: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", tag: "\u0627\u0641\u0647\u0645. \u0627\u0628\u0646\u0650. \u062A\u0639\u0627\u0648\u0646. \u0627\u0646\u0645\u064F.", welcome: "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643 \u0641\u064A AuraDigital.", choose: "\u0643\u064A\u0641 \u062A\u0631\u064A\u062F \u0628\u0646\u0627\u0621 \u0631\u062D\u0644\u0629 \u0646\u0645\u0648 \u0623\u0639\u0645\u0627\u0644\u0643\u061F", myself: "\u0623\u0628\u0646\u064A \u0628\u0646\u0641\u0633\u064A", myselfText: "\u062D\u062F\u062F \u0623\u0647\u062F\u0627\u0641\u0643 \u0648\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0635\u0645\u0645 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643.", auri: "\u0623\u0628\u0646\u064A \u0645\u0639 AURI", auriText: "\u0627\u0628\u062F\u0623 \u0631\u062D\u0644\u0629 \u0645\u0648\u062C\u0647\u0629\u060C \u0628\u0633\u0624\u0627\u0644 \u0642\u0635\u064A\u0631 \u0641\u064A \u0643\u0644 \u062E\u0637\u0648\u0629.", home: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629", profile: "\u0645\u0644\u0641 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", journey: "\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", simulator: "\u0645\u062D\u0627\u0643\u064A \u0627\u0644\u0646\u0645\u0648", assistant: "\u0645\u0633\u0627\u0639\u062F AURI", reports: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644\u0627\u062A", projects: "\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639", websites: "\u0645\u0648\u0627\u0642\u0639\u064A", services: "\u062E\u062F\u0645\u0627\u062A\u064A", hosting: "\u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0627\u0633\u062A\u0636\u0627\u0641\u0629", files: "\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0646\u062F\u0627\u062A", orders: "\u0627\u0644\u0645\u062A\u062C\u0631 \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062A", invoices: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A", rewards: "\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A", team: "\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642", support: "\u0627\u0644\u062F\u0639\u0645", settings: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", grow: "\u0627\u0644\u0646\u0645\u0648", manage: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629", account: "\u0627\u0644\u062D\u0633\u0627\u0628", menu: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", close: "\u0625\u063A\u0644\u0627\u0642", save: "\u062D\u0641\u0638", saved: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638", saving: "\u062C\u0627\u0631\u064D \u0627\u0644\u062D\u0641\u0638\u2026", continue: "\u0645\u062A\u0627\u0628\u0639\u0629", back: "\u0631\u062C\u0648\u0639", skip: "\u062A\u062E\u0637\u064A", signIn: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", signup: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628", email: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", name: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", terms: "\u0623\u0648\u0627\u0641\u0642 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0628\u064A\u0627\u0646\u0627\u062A\u064A \u0644\u0625\u062F\u0627\u0631\u062A\u0647.", google: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Google", forgot: "\u0646\u0633\u064A\u062A \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061F", logout: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C", verify: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F", verifyLater: "\u064A\u0645\u0643\u0646\u0643 \u0625\u0639\u062F\u0627\u062F \u0645\u0644\u0641\u0643 \u0648\u0645\u0633\u0648\u062F\u0629 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u0643 \u0627\u0644\u0622\u0646. \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0637\u0644\u0648\u0628 \u0642\u0628\u0644 \u0627\u0644\u0641\u0648\u062A\u0631\u0629 \u0648\u062F\u0639\u0648\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629.", sendVerification: "\u0625\u0631\u0633\u0627\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u062A\u0623\u0643\u064A\u062F", reset: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", newPassword: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629", confirm: "\u062A\u0623\u0643\u064A\u062F", cancel: "\u0625\u0644\u063A\u0627\u0621", error: "\u062D\u062F\u062B \u062E\u0637\u0623. \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u064B\u0627.", next: "\u062E\u0637\u0648\u062A\u0643 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", readiness: "\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A", progress: "\u062A\u0642\u062F\u0645 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642", level: "\u0627\u0644\u0645\u0633\u062A\u0648\u0649", foundation: "\u0627\u0644\u0623\u0633\u0627\u0633", visibility: "\u0627\u0644\u0638\u0647\u0648\u0631", conversion: "\u0627\u0644\u062A\u062D\u0648\u064A\u0644", automation: "\u0627\u0644\u0623\u062A\u0645\u062A\u0629", scale: "\u0627\u0644\u062A\u0648\u0633\u0639", createJourney: "\u0625\u0646\u0634\u0627\u0621 \u062E\u0627\u0631\u0637\u0629 \u0637\u0631\u064A\u0642\u064A", noPurchase: "\u064A\u0645\u0643\u0646\u0643 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0645\u0647\u0627\u0645 \u0628\u0646\u0641\u0633\u0643 \u0623\u0648 \u0645\u0639 \u0623\u064A \u0645\u0632\u0648\u062F. \u0634\u0631\u0627\u0621 \u062E\u062F\u0645\u0627\u062A AuraDigital \u0627\u062E\u062A\u064A\u0627\u0631\u064A.", quote: "\u064A\u062A\u0637\u0644\u0628 \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0639\u0631\u0636 \u0633\u0639\u0631", planned: "\u0645\u062E\u0637\u0637", in_progress: "\u0642\u064A\u062F \u0627\u0644\u062A\u0646\u0641\u064A\u0630", done: "\u0645\u0643\u062A\u0645\u0644", postponed: "\u0645\u0624\u062C\u0644", up: "\u062A\u0642\u062F\u064A\u0645", down: "\u062A\u0623\u062E\u064A\u0631", edit: "\u062A\u0639\u062F\u064A\u0644", objective: "\u0627\u0644\u0647\u062F\u0641", description: "\u0627\u0644\u0648\u0635\u0641", nextAction: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u0627\u0644\u064A", why: "\u0645\u0648\u0635\u0649 \u0628\u0647 \u0644\u0623\u0646 \u0647\u0630\u0647 \u0627\u0644\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0644\u0645 \u062A\u064F\u0630\u0643\u0631 \u0641\u064A \u0645\u0644\u0641 \u0646\u0634\u0627\u0637\u0643.", benefit: "\u062A\u062D\u0633\u064A\u0646 \u0645\u062D\u062A\u0645\u0644\u060C \u064A\u064F\u0642\u0627\u0631\u0646 \u0628\u0646\u062A\u0627\u0626\u062C\u0643 \u0627\u0644\u0641\u0639\u0644\u064A\u0629.", assumptions: "\u0627\u0641\u062A\u0631\u0627\u0636\u0627\u062A \u0648\u0644\u064A\u0633\u062A \u0636\u0645\u0627\u0646\u0627\u062A", calculate: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A", scenarioName: "\u0627\u0633\u0645 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648", saveScenario: "\u062D\u0641\u0638 \u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648", export: "\u062A\u0635\u062F\u064A\u0631 JSON", history: "\u0627\u0644\u0633\u064A\u0646\u0627\u0631\u064A\u0648\u0647\u0627\u062A \u0627\u0644\u0645\u062D\u0641\u0648\u0638\u0629", conservative: "\u0645\u062A\u062D\u0641\u0638", base: "\u0623\u0633\u0627\u0633\u064A", ambitious: "\u0637\u0645\u0648\u062D", visits: "\u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0634\u0647\u0631\u064A\u0629", leads: "\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0648\u0646 \u0634\u0647\u0631\u064A\u064B\u0627 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639", closeRate: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u062D\u0648\u0644 \u0625\u0644\u0649 \u0639\u0645\u064A\u0644 (%)", customerValue: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0644\u0643\u0644 \u0639\u0645\u064A\u0644 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629", margin: "\u0647\u0627\u0645\u0634 \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 (%)", monthlyCost: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0634\u0647\u0631\u064A\u0629", setupCost: "\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0625\u0639\u062F\u0627\u062F \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629", trafficLift: "\u0632\u064A\u0627\u062F\u0629 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A (%)", leadRateLift: "\u0632\u064A\u0627\u062F\u0629 \u0645\u0639\u062F\u0644 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 (%)", closeRateLift: "\u0632\u064A\u0627\u062F\u0629 \u0645\u0639\u062F\u0644 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0628\u064A\u0639 (%)", customers: "\u0639\u0645\u0644\u0627\u0621 \u0625\u0636\u0627\u0641\u064A\u0648\u0646", revenue: "\u0627\u0644\u0625\u064A\u0631\u0627\u062F \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0625\u0636\u0627\u0641\u064A", profit: "\u0631\u0628\u062D \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0627\u0644\u0625\u0636\u0627\u0641\u064A", net: "\u0635\u0627\u0641\u064A \u0627\u0644\u0645\u0633\u0627\u0647\u0645\u0629 \u0628\u0639\u062F \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062E\u062F\u0645\u0629", roi: "\u0627\u0644\u0639\u0627\u0626\u062F \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631 \u0644\u0644\u0633\u0646\u0629 \u0627\u0644\u0623\u0648\u0644\u0649", payback: "\u0641\u062A\u0631\u0629 \u0627\u0633\u062A\u0631\u062F\u0627\u062F \u0627\u0644\u0625\u0639\u062F\u0627\u062F (\u0623\u0634\u0647\u0631)", na: "\u063A\u064A\u0631 \u0642\u0627\u0628\u0644 \u0644\u0644\u062A\u0637\u0628\u064A\u0642", teamTitle: "\u0627\u0646\u0645\u064F \u0645\u0639 \u0641\u0631\u064A\u0642\u0643.", teamText: "\u0627\u062F\u0639\u064F \u0623\u0634\u062E\u0627\u0635\u064B\u0627 \u0645\u0648\u062B\u0648\u0642\u064A\u0646 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643. \u064A\u062F\u0641\u0639 \u0643\u0644 \u0639\u0636\u0648 \u0625\u0636\u0627\u0641\u064A \u0627\u0634\u062A\u0631\u0627\u0643\u0647 \u0627\u0644\u062E\u0627\u0635 \u0628\u0642\u064A\u0645\u0629 5 \u062F\u0648\u0644\u0627\u0631\u0627\u062A \u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0634\u0647\u0631\u064A\u064B\u0627.", blocked: "\u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0645\u062D\u0638\u0648\u0631 \u0625\u0644\u0649 \u062D\u064A\u0646 \u0625\u0639\u062F\u0627\u062F \u0645\u0632\u0648\u062F \u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0634\u0631\u0648\u0637 \u0627\u0644\u0625\u0644\u063A\u0627\u0621. \u0627\u0644\u062F\u0639\u0648\u0629 \u0644\u0627 \u062A\u0645\u0646\u062D \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0644\u0627 \u062A\u062E\u0635\u0645 \u0623\u064A \u0645\u0628\u0644\u063A.", invite: "\u062F\u0639\u0648\u0629 \u0639\u0636\u0648", role: "\u0627\u0644\u062F\u0648\u0631", message: "\u0631\u0633\u0627\u0644\u0629 \u062F\u0639\u0648\u0629 \u0627\u062E\u062A\u064A\u0627\u0631\u064A\u0629", status: "\u0627\u0644\u062D\u0627\u0644\u0629", subscription: "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643", paymentDate: "\u0627\u0644\u062F\u0641\u0639\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", remove: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0648\u0635\u0648\u0644", removeConfirm: "\u0647\u0644 \u062A\u0631\u064A\u062F \u0625\u0644\u063A\u0627\u0621 \u0648\u0635\u0648\u0644 \u0647\u0630\u0627 \u0627\u0644\u0639\u0636\u0648 \u0641\u0648\u0631\u064B\u0627\u061F \u0633\u064A\u064F\u062D\u062A\u0641\u0638 \u0628\u062D\u0633\u0627\u0628\u0647 \u0627\u0644\u0634\u062E\u0635\u064A \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0634\u062A\u0631\u0643\u0629.", cancelInvite: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0639\u0648\u0629", resend: "\u062A\u062C\u062F\u064A\u062F \u0648\u0625\u0639\u0627\u062F\u0629 \u0625\u0631\u0633\u0627\u0644", inviteAccept: "\u0642\u0628\u0648\u0644 \u0627\u0644\u062F\u0639\u0648\u0629", recurringConsent: "\u0623\u0642\u0628\u0644 \u0627\u0644\u062F\u0639\u0648\u0629 \u0648\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u0634\u0647\u0631\u064A \u0627\u0644\u0645\u062A\u0643\u0631\u0631 \u0628\u0642\u064A\u0645\u0629 5 \u062F\u0648\u0644\u0627\u0631\u0627\u062A \u0623\u0645\u0631\u064A\u0643\u064A\u0629 \u0644\u0648\u0635\u0648\u0644\u064A \u0627\u0644\u0634\u062E\u0635\u064A. \u0627\u0644\u062F\u0641\u0639 \u0645\u062D\u0638\u0648\u0631 \u062D\u0627\u0644\u064A\u064B\u0627\u061B \u0644\u0646 \u064A\u064F\u062E\u0635\u0645 \u0645\u0628\u0644\u063A \u0648\u0633\u064A\u0628\u0642\u0649 \u0627\u0644\u0648\u0635\u0648\u0644 \u0645\u0639\u0644\u0642\u064B\u0627.", awaiting: "\u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u062F\u0641\u0639", permissions: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A", activity: "\u0633\u062C\u0644 \u0627\u0644\u0648\u0635\u0648\u0644", unavailable: "\u0644\u0645 \u064A\u064F\u0631\u0628\u0637 \u0647\u0630\u0627 \u0627\u0644\u062A\u0643\u0627\u0645\u0644 \u0628\u0639\u062F \u0628\u0645\u0633\u0627\u062D\u0629 \u0639\u0645\u0644\u0643 \u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627.", legacy: "\u062D\u0633\u0627\u0628\u0627\u062A\u0643 \u0648\u0645\u0646\u062A\u062C\u0627\u062A\u0643 \u0648\u0637\u0644\u0628\u0627\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u0636\u0645\u0646 \u0645\u0633\u0627\u0631\u0627\u062A\u0647\u0627 \u0627\u0644\u0645\u0635\u0631\u062D \u0628\u0647\u0627.", openAccount: "\u0641\u062A\u062D \u062D\u0633\u0627\u0628\u064A \u0648\u0637\u0644\u0628\u0627\u062A\u064A", contact: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062F\u0639\u0645", aiRules: "\u0623\u062F\u0648\u0627\u062A AURI \u0627\u0644\u0645\u0648\u062C\u0647\u0629", aiNotice: "\u0627\u0644\u0625\u0631\u0634\u0627\u062F \u0627\u0644\u0642\u0627\u0626\u0645 \u0639\u0644\u0649 \u0627\u0644\u0642\u0648\u0627\u0639\u062F \u0645\u062A\u0627\u062D. \u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0648\u0644\u064A\u062F\u064A\u0629 \u0648\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u062E\u0627\u0635\u0629 \u0644\u0645 \u062A\u064F\u0631\u0628\u0637 \u0628\u0639\u062F.", diagnosis: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0634\u0627\u0637", recommend: "\u0627\u0642\u062A\u0631\u0627\u062D \u0627\u0644\u062E\u0637\u0648\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", strengths: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629 \u0627\u0644\u0645\u064F\u0628\u0644\u063A \u0639\u0646\u0647\u0627", missing: "\u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0627\u0644\u0646\u0627\u0642\u0635\u0629", source: "\u0627\u0644\u0645\u0635\u062F\u0631: \u0628\u064A\u0627\u0646\u0627\u062A \u0623\u062F\u062E\u0644\u0647\u0627 \u0627\u0644\u0639\u0645\u064A\u0644", businessName: "\u0627\u0633\u0645 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u062A\u062C\u0627\u0631\u064A", industry: "\u0627\u0644\u0642\u0637\u0627\u0639", country: "\u0627\u0644\u062F\u0648\u0644\u0629", city: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629", stage: "\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0646\u0634\u0627\u0637", website: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A (HTTPS)", tools: "\u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0631\u0642\u0645\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629", acquisition: "\u0643\u064A\u0641 \u064A\u062C\u062F\u0643 \u0627\u0644\u0639\u0645\u0644\u0627\u0621\u061F", difficulties: "\u0623\u0647\u0645 \u0627\u0644\u0635\u0639\u0648\u0628\u0627\u062A", goals: "\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0646\u0634\u0627\u0637", budget: "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0628\u064A\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", currency: "\u0627\u0644\u0639\u0645\u0644\u0629", timeline: "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0632\u0645\u0646\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628", industryDetails: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0642\u0637\u0627\u0639", capabilities: "\u0627\u0644\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0643", restaurant: "\u0645\u0637\u0639\u0645", ecommerce: "\u062A\u062C\u0627\u0631\u0629 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", real_estate: "\u0639\u0642\u0627\u0631\u0627\u062A", other: "\u0623\u062E\u0631\u0649", servicesIndustry: "\u0646\u0634\u0627\u0637 \u062E\u062F\u0645\u064A", restaurantQuestion: "\u0643\u064A\u0641 \u064A\u062C\u062F\u0643 \u0627\u0644\u0636\u064A\u0648\u0641 \u0648\u064A\u0637\u0644\u0639\u0648\u0646 \u0639\u0644\u0649 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u064A\u062D\u062C\u0632\u0648\u0646\u061F", ecommerceQuestion: "\u0643\u064A\u0641 \u062A\u062F\u064A\u0631 \u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0648\u0627\u0644\u062F\u0641\u0639 \u0648\u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u0629\u061F", realEstateQuestion: "\u0643\u064A\u0641 \u062A\u0639\u0631\u0636 \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0648\u062A\u062A\u0627\u0628\u0639 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u061F", servicesQuestion: "\u0643\u064A\u0641 \u064A\u062F\u064A\u0631 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0648\u0639\u0631\u0648\u0636 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0648\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A\u061F", otherQuestion: "\u0635\u0641 \u0637\u0631\u064A\u0642\u0629 \u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0626\u0643.", newWorkspace: "\u0646\u0634\u0627\u0637 \u062C\u062F\u064A\u062F", switchMode: "\u062A\u063A\u064A\u064A\u0631 \u0648\u0636\u0639 \u0627\u0644\u0625\u0631\u0634\u0627\u062F", verified: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F", owner: "\u0627\u0644\u0645\u0627\u0644\u0643", admin: "\u0645\u062F\u064A\u0631", member: "\u0639\u0636\u0648", viewer: "\u0645\u0634\u0627\u0647\u062F", readOnly: "\u0644\u0644\u0642\u0631\u0627\u0621\u0629 \u0641\u0642\u0637", verifiedRequired: "\u0623\u0643\u062F \u0628\u0631\u064A\u062F\u0643 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u064A\u0642.", empty: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0646\u0627\u0635\u0631 \u0628\u0639\u062F.", billingPrivate: "\u062A\u0628\u0642\u0649 \u062A\u0641\u0627\u0635\u064A\u0644 \u062F\u0641\u0639 \u0643\u0644 \u0639\u0636\u0648 \u062E\u0627\u0635\u0629 \u0628\u0647.", security: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0623\u0645\u0627\u0646", linkGoogle: "\u0631\u0628\u0637 \u0647\u0648\u064A\u062A\u064A \u0627\u0644\u0645\u062A\u062D\u0642\u0642 \u0645\u0646\u0647\u0627 \u0641\u064A Google", rename: "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A", refresh: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u062D\u0645\u064A\u0644", serviceNote: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0648\u0627\u0637\u0644\u0628 \u0639\u0631\u0636 \u0633\u0639\u0631 \u0645\u0646\u0627\u0633\u0628\u064B\u0627 \u0644\u0646\u0634\u0627\u0637\u0643.", openServices: "\u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", reportNote: "\u0644\u0627 \u062A\u064F\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u0645\u0643\u0627\u0641\u0622\u062A \u0642\u0628\u0644 \u0631\u0628\u0637 \u0645\u0635\u0627\u062F\u0631 \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0648\u062B\u0648\u0642\u0629 \u0648\u0633\u062C\u0644 \u0648\u0644\u0627\u0621 \u0635\u062D\u064A\u062D." }
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
if (!copy4[lang]) lang = "en";
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
var robot = () => auriCharacter(auriLevel(), { posterOnly: true });
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
async function api(path2, method = "GET", body) {
  const response = await fetch(path2, { method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : void 0 });
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
  disconnectAuri();
  disconnectDesk();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  app.setAttribute("aria-busy", "false");
  if (!me || ["verify", "reset", "forgot", "invitation"].includes(route)) {
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
    header: `<header class="gate-header command-gate-header"><a href="${esc2(link("home"))}" class="wordmark">AuraHub</a>${languageControl()}</header>`,
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
    }
  });
}
function gateFrame(content2) {
  app.innerHTML = `<header class="gate-header command-gate-header"><a href="/hub" class="wordmark">Aura <span>Command</span></a>${languageControl()}</header><main id="main" class="gate command-gate">${content2}</main>`;
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
  const loginCharacter = !forgot && !reset ? auriCharacter(3, { variant: "login" }) : robot();
  gateFrame(`<section class="auth-intro"><p class="eyebrow">Aura Command</p><h1>${t("welcome")}</h1><p>${t("tag")}</p>${loginCharacter}</section><section class="panel auth-panel"><h2>${t(reset ? "reset" : forgot ? "forgot" : signup ? "signup" : "signIn")}</h2><form id="auth-form">${signup ? field("name", "name", "", "text", 'required minlength="2" maxlength="100" autocomplete="name"') : ""}${reset ? "" : field("email", "email", "", "email", 'required maxlength="254" autocomplete="email"')}${forgot ? "" : field("password", reset ? "newPassword" : "password", "", "password", "required " + (signup || reset ? 'minlength="12" ' : "") + 'maxlength="72" autocomplete="' + (signup || reset ? "new-password" : "current-password") + '"')}${signup ? `<label class="check"><input type="checkbox" name="terms" required>${t("terms")}</label>` : ""}<p class="form-error" role="alert"></p><button class="primary">${t(reset ? "reset" : forgot ? "continue" : signup ? "signup" : "signIn")}</button></form>${!forgot && !reset ? `${authCapabilities.google ? `<hr><label class="check"><input id="google-terms" type="checkbox">${t("terms")}</label>${button("google", "google", true)}` : ""}<div class="auth-links"><a href="/hub/${signup ? "login" : "signup"}${authQuery}">${t(signup ? "signIn" : "signup")}</a>${authCapabilities.email ? `<a href="/hub/forgot${authQuery}">${t("forgot")}</a>` : ""}</div>` : `<a href="/hub/login${authQuery}">${t("signIn")}</a>`}</section>`);
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
  app.innerHTML = `<header class="gate-header command-gate-header"><a href="/hub" class="wordmark">Aura <span>Command</span></a>${languageControl()}</header><main class="setup command-setup" id="main"><div class="setup-heading"><p class="eyebrow">Aura Command</p><h1>${choosing ? commandLabels(lang).onboarding : esc2(draft.name || t("profile"))}</h1><p>${choosing ? t("choose") : t(mode === "auri" ? "auriText" : "myselfText")}</p></div>${choosing ? `<div class="mode-grid"><button class="mode-card" data-mode="myself"><span class="mode-icon">\u2197</span><h2>${t("myself")}</h2><p>${t("myselfText")}</p><span>${t("continue")} \u2192</span></button><button class="mode-card dark" data-mode="auri">${robot()}<h2>${t("auri")}</h2><p>${t("auriText")}</p><span>${t("continue")} \u2192</span></button></div>` : `<section class="panel profile-panel"><div class="panel-bar"><span>${mode === "auri" ? `AURI \xB7 ${step + 1}/${setupKeys.length}` : t("profile")}</span><span id="save-state" role="status"></span>${button("switchMode", "switch-mode", true)}</div>${mode === "auri" ? `<div class="auri-onboarding">${auriCharacter(auriLevel())}<p data-auri-status role="status"></p></div>` : ""}<form id="profile-form" class="${mode === "auri" ? "guided" : "form-grid"}">${(mode === "auri" ? [setupKeys[step]] : setupKeys).map(profileField).join("")}<div class="actions full">${mode === "auri" ? button("back", "back-step", true, step === 0) + button("skip", "skip-step", true, step === 0) : ""}<button class="primary" type="submit">${t(mode === "auri" && step < setupKeys.length - 1 ? "continue" : "save")}</button>${workspace ? button("home", "leave-setup", true) : ""}</div><p class="form-error full" role="alert"></p></form></section>`}</main>`;
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
  const avatar = document.querySelector(".auri-onboarding");
  if (avatar) {
    bindAuri(avatar, setupScope);
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
var navigation = ["home", "journey", "assistant", "services"];
var pageGroup = { tasks: "journey", menuDrafts: "services", projects: "services", websites: "services", hosting: "services" };
var moreNavigation = ["profile", "simulator", "menuDrafts", "projects", "websites", "hosting", "files", "reports", "invoices", "rewards", "team", "support"];
var link = (target, params) => hubLink(target, workspace?.organization.id, params);
var requestLink = (service = "", task = "") => link("services", { new: "1", service, task });
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
  const labels3 = hubLabels(lang), l = roadmapLabels(lang);
  const active = pageGroup[page] || page;
  const navItem = (p, mobile = false) => `<a class="nav-item ${active === p ? "active" : ""}" href="${esc2(link(p))}"
  data-page="${p}" ${mobile ? `data-mobile-page="${p}"` : ""} ${active === p ? 'aria-current="page"' : ""}>
  ${hubIcon(p)}<span>${esc2(labels3[p] || l[p] || t(p))}</span></a>`;
  const title = page === "journey" ? commandLabels(lang).vision : labels3[page] || l[page] || t(page);
  app.innerHTML = `<div class="shell growth-shell growth-active aurahub-shell"><aside class="sidebar" id="sidebar">
 <a href="${esc2(link("home"))}" class="wordmark command-wordmark"><svg viewBox="0 0 32 29" width="34" height="31" aria-hidden="true" fill="currentColor"><path d="M15.9 1.2a3.4 3.4 0 0 1 2.9 1.8L32 27.8l-9.2-4.1L15.9 10l-5.4 10.5 8.4-2.3 3 5.5L0 29 13 3a3.3 3.3 0 0 1 2.9-1.8Z"/></svg>AuraHub</a>
 <nav aria-label="AuraHub">${navigation.map((p) => navItem(p)).join("")}</nav></aside>
 <div class="workspace"><header class="topbar growth-topbar hub-topbar">
 <a class="hub-mobile-brand wordmark" href="${esc2(link("home"))}">AuraHub</a>
 ${workspace ? `<label class="field workspace-picker"><span class="sr-only">${t("businessName")}</span>
 <select id="workspace-select" aria-label="${t("businessName")}">${workspaces.map((o) => `<option value="${esc2(o.id)}" ${o.id === workspace.organization.id ? "selected" : ""}>${esc2(o.id === workspace.organization.id ? workspace.organization.name : o.name)}</option>`).join("")}</select></label>` : ""}
 <details class="growth-account"><summary aria-label="${esc2(t("profile"))}">${hubIcon("profile")}</summary>
 <div class="growth-account-menu"><strong>${esc2(me.name)}</strong>${languageControl()}
 ${workspace ? navItem("profile") + navItem("settings") + navItem("invoices") : ""}${button("logout", "logout", true)}</div></details></header>
 <main id="main" tabindex="-1"><div class="page-heading"><h1>${page === "home" && (!workspace || !workspace.missions.length) ? `${esc2(labels3.welcome)} <span>AuraHub</span>` : page === "journey" && lang === "en" ? "Growth <span>Vision</span>" : esc2(title)}</h1>
 ${page === "services" && workspace?.permissions.includes("roadmap:write") && !query.has("new") ? `<a class="growth-secondary" href="${esc2(requestLink())}">\uFF0B ${esc2(l.request)}</a>` : ""}</div>
 ${!me.verified && authCapabilities.email ? `<aside class="verification"><p>${t("verifyLater")}</p>${button("sendVerification", "send-verification", true)}</aside>` : ""}
 <div id="page-content"></div></main>
 <nav class="command-bottom-nav" aria-label="AuraHub">${navigation.map((p) => navItem(p, true)).join("")}</nav>
 </div></div>`;
  bindCommon();
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
    if (host.isConnected) host.innerHTML = `<section class="panel"><p role="alert">${esc2(e.message)}</p></section>`;
  });
}
var content = (html) => {
  document.querySelector("#page-content").innerHTML = html;
};
app.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[href]");
  if (!me || !anchor || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target || anchor.origin !== location.origin) return;
  const slug = anchor.pathname.split("/")[2] || "";
  if (!anchor.pathname.startsWith("/hub") || ["login", "signup", "verify", "forgot", "reset", "invitation"].includes(slug)) return;
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
  return `<section class="hub-hero hub-welcome">${guideCharacter()}<h2>${esc2(ui.build)}</h2>
 <p>${esc2(ui.buildNote)}</p>${canBuild ? `<a class="growth-primary" href="${esc2(link("onboarding"))}">${esc2(ui.buildAction)} <span aria-hidden="true">\u2192</span></a>` : ""}</section><div data-home-guide></div>`;
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
function menuArtwork(menu) {
  const products = menu.draft.categories.flatMap((category) => category.items).filter((product) => product.name).slice(0, 4);
  return `<div class="hub-menu-device" aria-hidden="true"><strong>${esc2(menu.name)}</strong>${products.map((product) => `<small><span>${esc2(product.name)}</span><span>${esc2(product.price)} ${esc2(menu.draft.fields.currency || "")}</span></small>`).join("")}</div>`;
}
var missionTitle = (m) => m.objective === m.service ? cap(m.capability) : m.objective;
async function home() {
  const ui = hubLabels(lang), host = document.querySelector("#page-content");
  if (!workspace?.missions.length) {
    renderBuildCard(ui);
    return;
  }
  const next = nextMission();
  const { attention, progress } = await workSnapshot();
  if (!host.isConnected) return;
  const item = attention[0], menu = item?.kind === "menu";
  const hero = (menu ? ui.menuReady : item?.name) || (next ? missionTitle(next) : workspace.missions.every((m) => m.status === "done") ? ui.complete : ui.journey);
  const destination = item ? link(menu ? "menuDrafts" : "services", menu ? { draft: item.id } : { request: item.id }) : link("journey", { task: next?.id });
  const label = item ? menu ? ui.reviewMenu : ui.openRequest : next ? ui.continue : ui.journey;
  const complete = !item && !next && workspace.missions.every((m) => m.status === "done");
  const note = item ? menu ? item.name : workStatus(item) : next ? next.reason || next.description : "";
  const done = workspace.missions.filter((m) => m.status === "done").length;
  const stage = next ? hubStageNames(lang)[hubStage(next.level)] : ui.journey;
  host.innerHTML = `<section class="hub-hero"><div>
 ${item ? `<span class="hub-highlight">${esc2(ui.attention)}</span>` : next ? `<span class="hub-highlight">${esc2(ui.next)}</span>` : ""}
 <h2>${esc2(hero)}</h2>${note ? `<p>${esc2(note)}</p>` : ""}
 <a class="growth-primary" href="${esc2(destination)}">${esc2(label)} <span aria-hidden="true">\u2192</span></a>${complete ? ` <a class="growth-secondary" href="${esc2(link("services"))}">${esc2(ui.services)}</a>` : ""}</div>
 <div class="hub-hero-art">${menu ? menuArtwork(item) : robot()}</div></section>
 <div class="hub-work-rows">
 <a class="hub-work-row" href="${esc2(link("journey"))}"><span class="hub-row-icon">${hubIcon("journey")}</span><span><strong>${esc2(ui.journey)}</strong><small>${esc2(stage)} \xB7 ${done} / ${workspace.missions.length} ${esc2(roadmapLabels(lang).completed)}</small></span><span aria-hidden="true">\u203A</span></a>
 ${item && next ? `<a class="hub-work-row" href="${esc2(link("journey", { task: next.id }))}"><span class="hub-row-icon">${hubIcon("journey")}</span><span><strong>${esc2(ui.next)}</strong><small>${esc2(missionTitle(next))}</small></span><span aria-hidden="true">\u203A</span></a>` : ""}
 ${progress.slice(0, 2).map((record) => renderWorkRow(record, { ui, esc: esc2, link })).join("")}</div>`;
}
async function myWork() {
  const ui = hubLabels(lang), host = document.querySelector("#page-content"), id = workspace.organization.id;
  const task = workspace.missions.find((m) => m.id === query.get("task"));
  if (query.has("new") && workspace.permissions.includes("roadmap:write")) {
    return renderRequestForm({ host, lang, esc: esc2, me, workspace, service: query.get("service"), task: task ? missionTitle(task) : "", draft: requestDrafts.get(id) || "", back: link("services"), submitted: (request2) => {
      requestDrafts.delete(id);
      navigate("services", { request: request2 }, true);
    } });
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
  const { attention, progress, services } = await workSnapshot();
  if (!host.isConnected || workspace.organization.id !== id) return;
  if (service) {
    const record = services.find((item) => String(item.id) === service);
    if (!record) throw new Error(ui.unavailable);
    host.innerHTML = `<section class="panel"><h2>${esc2(record.name)}</h2><p>${esc2(ui.active)}</p><a class="secondary" href="${esc2(link("services"))}">${esc2(ui.services)}</a></section>`;
    return;
  }
  const section = (name, empty, rows) => `<section class="hub-work-section"><h2>${esc2(name)}</h2>${rows || `<p class="hub-empty">${esc2(empty)}</p>`}</section>`;
  host.innerHTML = section(ui.attention, ui.emptyAttention, attention.map((record) => renderWorkRow(record, { ui, esc: esc2, link })).join("")) + section(ui.progress, ui.emptyProgress, progress.map((record) => renderWorkRow(record, { ui, esc: esc2, link })).join("")) + section(ui.active, ui.emptyActive, services.map((record) => `<a class="hub-work-row" href="${esc2(link("services", { active: record.id }))}"><span class="hub-row-icon">${hubIcon("services")}</span><span><strong>${esc2(record.name)}</strong><small>${esc2(workStatus(record))}</small></span><span aria-hidden="true">\u203A</span></a>`).join("")) + `<a href="${esc2(link("menuDrafts"))}" class="growth-secondary">${esc2(t("menuDrafts"))}</a>`;
}
async function renderPage() {
  const label = hubLabels(lang);
  if (page === "invoices") return content(`<section class="panel"><a class="primary" href="/account">${esc2(t("orders"))}</a></section>`);
  if (page === "home") return home();
  if (!workspace) return renderBuildCard(label);
  if (page === "services") return myWork();
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
  if (page === "settings") {
    content(`<section class="panel"><h2>${t("security")}</h2><p>${esc2(me.email)} \xB7 ${me.verified ? t("verified") : t("verify")}</p>${authCapabilities.email ? `<a class="secondary" href="/hub/forgot">${t("reset")}</a>` : ""}${me.verified && authCapabilities.google ? `<p><a class="secondary" href="/api/customer/google/start?acceptTerms=true">${t("linkGoogle")}</a></p>` : ""}<hr>${button("profile", "open-profile", true)}${button("auri", "open-auri-settings", true)}${button("team", "open-team", true)}${button("resources", "open-resources", true)}${button("newWorkspace", "new-workspace", true)}</section>`);
    document.querySelector('[data-action="open-profile"]').onclick = () => navigate("profile");
    document.querySelector('[data-action="open-auri-settings"]').onclick = () => navigate("assistant");
    document.querySelector('[data-action="open-resources"]').onclick = () => navigate("resources");
    document.querySelector('[data-action="open-team"]').onclick = () => navigate("team");
    document.querySelector('[data-action="new-workspace"]').onclick = () => {
      stopAuriVoice();
      workspace = null;
      editing = true;
      draft = emptyProfile();
      mode = "myself";
      step = 0;
      renderSetup();
    };
    return;
  }
  const service = page === "services", support = page === "support", reports = ["reports", "rewards"].includes(page);
  content(`<section class="panel quiet-panel"><span class="eyebrow">${reports ? "NOT CONNECTED" : service ? "SERVICE CATALOGUE" : "INTEGRATION PENDING"}</span><h2>${t(page)}</h2><p>${t(service ? "serviceNote" : support ? "supportText" : reports ? "reportNote" : "unavailable")}</p><a class="primary" href="${service ? "/services" : "/contact"}">${t(service ? "openServices" : "contact")} \u2197</a></section>`);
}
async function askAuri(question, missionId, requestId) {
  const id = workspace.organization.id;
  const { data } = await runAuri(id, "thinking", () => api(endpoint("auri"), "POST", { tool: "guidance", question, lang, ...missionId ? { missionId } : {}, ...requestId ? { requestId } : {} }), "speaking");
  if (workspace?.organization.id !== id) return "";
  if (data.reply) return data.reply;
  if (/customers|visibility|sales|müşteri|clients|عملاء/i.test(question) && data.priorities?.length) return data.priorities.map((m) => cap(m.capability)).join(" \xB7 ");
  const task = data.mission || data.nextAction;
  if (requestId) return hubLabels(lang).requestDetails + " \xB7 " + hubLabels(lang).return;
  if (!task) return t("empty");
  const alternate = task.route === "alternative" ? missionAlternative(task.capability) : null;
  if (alternate) return [alternate.title, alternate.steps].join(" \xB7 ");
  const guide = missionGuide[task.capability], requirements = missionState(task, workspace.missions, workspace.profile).requirements;
  const action = task.nextAction === "Define scope or record your existing solution." ? guide?.[2] : task.nextAction;
  return [cap(task.capability), action, requirements.length ? requirements.map(cap).join(", ") : ""].filter(Boolean).join(" \xB7 ");
}
function growthDashboard() {
  disconnectDesk();
  const host = document.querySelector("#page-content");
  renderRoadmap({
    host,
    workspace,
    t,
    esc: esc2,
    cap,
    lang,
    view: roadmapView,
    selectedId: selectedMission,
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
  const missionId = query.get("task"), requestId = query.get("request");
  const sessionKey = [id, missionId, requestId].filter(Boolean).join(":");
  if (!auriSessions.has(sessionKey)) auriSessions.set(sessionKey, { open: false, reply: "", pending: false, error: "" });
  const session = auriSessions.get(sessionKey);
  session.turns ??= [];
  const transcript = () => session.turns.map((turn) => `<article class="auri-chat-turn"><strong>${esc2(turn.question)}</strong><p>${esc2(turn.reply)}</p></article>`).join("");
  const level = auriLevel(), canAsk = workspace.permissions.includes("auri:use");
  const { ask: label, focus } = roadmapLabels(lang);
  const next = eligibleMissions(workspace.missions, workspace.profile)[0];
  const readAloud = { en: "Read aloud", tr: "Sesli oku", fr: "Lire \xE0 voix haute", ar: "\u0642\u0631\u0627\u0621\u0629 \u0628\u0635\u0648\u062A \u0639\u0627\u0644\u064D" }[lang];
  const send = { en: "Send", tr: "G\xF6nder", fr: "Envoyer", ar: "\u0625\u0631\u0633\u0627\u0644" }[lang];
  const identity = `${auriCharacter(level, { posterOnly: page === "home" && !matchMedia("(max-width:800px)").matches })}<span><strong>${esc2(preferences.name)}</strong><small>${esc2(t("level"))} ${level} \xB7 ${auriNames[level - 1]}</small></span>
  <span class="auri-status" role="status" data-auri-status></span>`;
  const body = `<div class="auri-companion-body">
  ${next && !missionId && !requestId ? `<p><strong>${esc2(focus)}</strong> \xB7 ${esc2(cap(next.capability))}</p>` : ""}
  ${canAsk ? `<div data-auri-transcript>${transcript()}</div><form data-auri-ask><label><span class="sr-only">${esc2(label)}</span><input name="question" maxlength="500" placeholder="${esc2(label)}" required></label>
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
    const service = missionGuide[mission?.capability]?.[0] || "";
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
      session.reply = await askAuri(question, missionId, requestId);
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
  const missionId = query.get("task"), requestId = query.get("request");
  const mission = missionId ? workspace.missions.find((m) => m.id === missionId) : null;
  if (missionId && !mission) throw new Error(ui.unavailable);
  const record = requestId ? await api(endpoint("work/" + encodeURIComponent(requestId))) : null;
  if (!host.isConnected) return;
  const returnLink = mission ? link("journey", { task: mission.id }) : record ? link("services", { request: record.id }) : null;
  const canAsk = workspace.permissions.includes("auri:use");
  const labels3 = auriDraftCopy(lang);
  content(`${returnLink ? `<div class="hub-context"><strong>${esc2(ui.context)} \xB7 ${esc2(mission ? missionTitle(mission) : record.name)}</strong><a class="growth-secondary" href="${esc2(returnLink)}">${esc2(ui.return)}</a></div>` : ""}<div id="auri-workspace"></div>${canAsk ? `<section class="panel auri-work-log">
  <div class="actions"><button type="button" class="primary" data-auri-draft>${esc2(labels3.create)}</button>${button("diagnosis", "diagnosis", true)}${button("recommend", "next-action", true)}</div><div data-auri-tools-status role="status"></div>
  <p role="status" data-draft-status></p>
  <h2>${esc2(labels3.history)}</h2><div data-auri-drafts></div></section>` : ""}`);
  renderCompanion(true);
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
    } else gateFrame(`<section class="panel"><h1>AuraHub</h1><p role="alert">${esc2(e.message)}</p><a href="/hub">${esc2(hubLabels(lang).home)}</a></section>`);
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
