(() => {
  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const money = (value) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(value || 0));

  function safeUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url) || /^[./]?[a-z0-9_-][a-z0-9_./-]*$/i.test(url)) return url;
    return "";
  }

  function replaceTokens(value, settings) {
    return String(value || "").replace(/\{\{([a-z0-9_]+)\}\}/gi, (_, key) => {
      return key in settings ? money(settings[key]) : "";
    });
  }

  function applySettingTargets(settings) {
    document.querySelectorAll("[data-setting]").forEach((element) => {
      const key = element.dataset.setting;
      if (!(key in settings)) return;
      const prefix = element.dataset.prefix || "";
      const suffix = element.dataset.suffix || "";
      element.textContent = prefix + money(settings[key]) + suffix;
    });
  }

  function renderPackages(items) {
    const grid = document.querySelector("body[data-page='packages'] .pricing-grid");
    if (!grid || !items?.length) return;
    grid.innerHTML = items.map((item) => {
      const features = (item.features || []).map((feature) => `<li>${esc(feature)}</li>`).join("");
      const buttonLabels = { Start: "Bu paketle başla", Growth: "Growth'u seç", Pro: "Pro'yu seç", Scale: "Scale'i seç" };
      const buttonLabel = buttonLabels[item.name] || "Bu paketle başla";
      return `<article class="price-card ${item.featured ? "featured " : ""}reveal in">
        ${item.featured ? '<span class="popular">EN ÇOK TERCİH</span>' : ""}
        <h3>${esc(item.name)}</h3>
        <p class="muted">${esc(item.description)}</p>
        <div class="price"><span data-monthly="${esc(money(item.monthly_price))} TL" data-weekly="${esc(money(item.weekly_price))} TL">${esc(money(item.monthly_price))} TL</span><small data-period>/ ay</small></div>
        <div class="dual-price"><span><b>Aylık</b> · ${esc(money(item.monthly_price))} TL</span><span><b>Haftalık</b> · ${esc(money(item.weekly_price))} TL</span></div>
        <ul>${features}</ul>
        <a class="btn ${item.featured ? "btn-primary" : "btn-ghost"}" href="/contact">${esc(buttonLabel)}</a>
      </article>`;
    }).join("");
  }

  function renderServices(items, settings) {
    const grid = document.querySelector("body[data-page='services'] .services-grid");
    if (!grid || !items?.length) return;
    grid.innerHTML = items.map((item) => {
      const tags = (item.tags || []).map((tag) => `<span>${esc(replaceTokens(tag, settings))}</span>`).join("");
      return `<article class="service-card reveal in"><div>
        <div class="service-icon">${esc(item.icon || "✦")}</div>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.description)}</p>
        <div class="mini-tags">${tags}</div>
      </div></article>`;
    }).join("");
  }

  function renderPortfolio(items) {
    const grid = document.querySelector("body[data-page='portfolio'] .project-grid-full");
    if (!grid || !items?.length) return;
    grid.innerHTML = items.map((item, index) => {
      const image = safeUrl(item.image);
      const url = safeUrl(item.url);
      const tags = (item.tags || []).map((tag) => `<span>${esc(tag)}</span>`).join("");
      return `<article class="project-card project-case reveal in" id="${esc(item.slug || `project-${item.id}`)}">
        ${image ? `<div class="project-media project-screenshot"><img src="${esc(image)}" alt="${esc(item.title)} proje görünümü" loading="lazy"></div>` : ""}
        <div class="project-meta"><div>
          <span class="project-type">${esc(item.type)}</span>
          <h2>${esc(item.title)}</h2>
          <p>${esc(item.description)}</p>
          <div class="mini-tags">${tags}</div>
          ${url ? `<a class="project-live" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Canlı siteyi ziyaret et ↗</a>` : ""}
        </div><span class="project-arrow">${String(index + 1).padStart(2, "0")}</span></div>
      </article>`;
    }).join("");
  }

  async function loadContent() {
    try {
      const response = await fetch("/api/public-content", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const data = await response.json();
      const settings = data.settings || {};
      applySettingTargets(settings);
      renderPackages(data.packages || []);
      renderServices(data.services || [], settings);
      renderPortfolio(data.portfolio || []);
      window.AuraI18n?.setLanguage(window.AuraI18n.current(), false);
    } catch (_) {
      // Static HTML stays visible if the live content API is unavailable.
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadContent);
  else loadContent();
})();
