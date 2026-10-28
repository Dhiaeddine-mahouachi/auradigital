// src/shop/model.ts
var categories = ["Restaurants", "Coffee Shops & Caf\xE9s", "Corporate & Business", "Beauty Salons & Spas", "Barbershops", "Gyms & Fitness", "Automotive & Car Detailing", "Real Estate", "Dental & Medical Clinics", "Hotels & Hospitality", "Retail & Fashion", "Events & Weddings", "Freelancers & Creators", "General Business", "Travel & Tourism", "Education", "Legal Services", "Technology & IT", "Pet Services"];
var purposes = ["Business Profile", "Digital Menu", "Google Reviews", "Booking", "Loyalty", "Social Media"];
var styles = ["Minimal", "Luxury", "Modern", "Corporate", "Colorful", "Futuristic"];
var emptyFilters = { search: "", category: "", purpose: "", style: "", color: "", orientation: "", maxPrice: "", sort: "newest" };
var destinationTypes = ["Website", "AuraPops digital profile", "AuraMenu digital menu", "Booking page", "Google review page", "Link hub"];
var emptyPersonalization = { business: "", destination: "", destinationType: "Website", contact: "", phone: "", whatsapp: "", social: "", instructions: "" };
function money(amount, currency = "TRY") {
  return amount === null ? "Price on approval" : currency === "TRY" ? new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(amount / 100) + " TL" : new Intl.NumberFormat("en", { style: "currency", currency }).format(amount / 100);
}
function canPurchase(theme) {
  return theme.status !== "archived" && (theme.madeToOrder === true || theme.status === "published" && theme.approved) && theme.available && Number.isSafeInteger(theme.priceMinor) && Number(theme.priceMinor) > 0;
}
function filterThemes(themes2, filters) {
  const search = filters.search.trim().toLocaleLowerCase();
  const found = themes2.filter((t) => t.status !== "archived" && (!search || [t.name, t.category, t.description, t.purpose].join(" ").toLocaleLowerCase().includes(search)) && (!filters.category || t.category === filters.category) && (!filters.purpose || t.purpose === filters.purpose) && (!filters.style || t.style === filters.style) && (!filters.color || t.colors.includes(filters.color)) && (!filters.orientation || t.orientation === filters.orientation) && (!filters.maxPrice || t.priceMinor !== null && t.priceMinor <= Number(filters.maxPrice) * 100));
  return found.sort((a, b) => filters.sort === "price-low" ? (a.priceMinor ?? Infinity) - (b.priceMinor ?? Infinity) : filters.sort === "alphabetical" ? a.name.localeCompare(b.name) : filters.sort === "price-high" ? (b.priceMinor ?? 0) - (a.priceMinor ?? 0) : filters.sort === "popular" ? b.popularity - a.popularity || a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));
}
function safeUrl(value, optional = false) {
  if (optional && value === "") return "";
  if (typeof value !== "string" || value.length > 800) throw new Error("Enter a valid https:// destination URL.");
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid https:// destination URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Use an HTTPS link without embedded credentials.");
  return url.href;
}
function validateItem(input, themes2, requirePersonalization = true) {
  if (!input || typeof input !== "object") throw new Error("Invalid cart item.");
  const item = input;
  const theme = themes2.find((t) => t.id === item.themeId && t.status !== "archived");
  if (!theme) throw new Error("This theme is no longer available.");
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error("Quantity must be a whole number from 1 to 100.");
  if (!theme.materials.includes(item.material) || !theme.finishes.includes(item.finish)) throw new Error("Select a valid material and finish.");
  const raw = item.personalization;
  if (!raw || typeof raw !== "object" || typeof raw.business !== "string" || requirePersonalization && !raw.business.trim()) throw new Error("Enter your business name.");
  const personalization = { ...emptyPersonalization };
  for (const key of Object.keys(personalization)) {
    if (typeof raw[key] !== "string" || raw[key].length > (key === "instructions" ? 1e3 : key === "destination" || key === "social" ? 800 : 100)) throw new Error("A personalization field is invalid or too long.");
    personalization[key] = raw[key].trim();
  }
  if (!destinationTypes.includes(personalization.destinationType)) throw new Error("Select a valid destination type.");
  personalization.destination = safeUrl(personalization.destination, !requirePersonalization);
  personalization.social = safeUrl(personalization.social, true);
  return { id: typeof item.id === "string" && /^[a-zA-Z0-9-]{1,60}$/.test(item.id) ? item.id : crypto.randomUUID(), themeId: theme.id, quantity: item.quantity, material: item.material, finish: item.finish, personalization };
}
function restoreCart(raw, themes2) {
  try {
    const data = JSON.parse(raw || "null");
    if (data?.version !== 1 || !Array.isArray(data.items) || data.items.length > 50) return [];
    const ids = /* @__PURE__ */ new Set();
    return data.items.flatMap((item) => {
      try {
        const valid = validateItem(item, themes2, false);
        if (ids.has(valid.id)) return [];
        ids.add(valid.id);
        return [valid];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

// src/shop/app.ts
var app = document.querySelector("#shop-app");
var dialog = document.querySelector("#shop-dialog");
var drawer = document.querySelector("#shop-cart");
var storageKey = "aura.shop.cart.v1";
function cartId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
var themes = [];
var cart = [];
var serial = 0;
var customer = null;
var toastTimer;
var esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var options = (values, selected = "") => values.map((value) => `<option value="${esc(value)}"${value === selected ? " selected" : ""}>${esc(value)}</option>`).join("");
var getTheme = (id) => themes.find((t) => t.id === id);
function notify(message) {
  document.querySelector("#shop-status").textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    document.querySelector("#shop-status").textContent = "";
  }, 6e3);
}
function count() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(cart.reduce((sum, i) => sum + i.quantity, 0));
  });
}
async function api(path, method = "GET", body) {
  const response = await fetch(path, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...body === void 0 ? {} : { body: JSON.stringify(body) } });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || "Request failed. Please try again."), { status: response.status });
  return data;
}
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, items: cart }));
  } catch {
    notify("Your browser could not save this cart. Keep this page open to retain it.");
  }
  count();
  const inline = document.querySelector("#shop-inline-cart-body");
  if (inline) refreshCart(inline);
}
function artworkImage(t, side, alt) {
  const crop = t.artwork?.[side];
  const style = crop ? ` style="position:absolute;max-width:none;width:${t.artwork.width / crop.width * 100}%;height:${t.artwork.height / crop.height * 100}%;left:${-crop.x / crop.width * 100}%;top:${-crop.y / crop.height * 100}%;object-fit:fill"` : "";
  return `<img src="${esc(t[side])}" alt="${esc(alt)}" loading="lazy" decoding="async"${style}>`;
}
function viewer(t, large = false) {
  const id = `card-${++serial}`;
  const ratio = t.artwork ? t.artwork.front.width / t.artwork.front.height : t.orientation === "Vertical" ? 540 / 856 : 856 / 540;
  return `<div class="shop-viewer" data-theme="${esc(t.id)}"><div class="shop-card-space"><div class="shop-scene" style="--card-ratio:${ratio};aspect-ratio:${ratio}" data-orientation="${t.orientation}" data-flipped="false" id="${id}"><div class="shop-flipper"><div class="shop-face shop-face-front">${artworkImage(t, "front", `${t.name} front: QR and NFC together`)}</div><div class="shop-face shop-face-back" aria-hidden="true">${artworkImage(t, "back", `${t.name} back`)}</div></div></div></div><div class="shop-preview-controls"><button type="button" data-flip aria-controls="${id}" aria-pressed="false" aria-label="Flip ${esc(t.name)} card">Flip card \u21BB</button><span data-side>Front side</span>${large ? "" : `<button type="button" data-enlarge="${esc(t.id)}" aria-label="Enlarge ${esc(t.name)} preview">Enlarge \u2197</button>`}</div></div>`;
}
function bindViewers(root) {
  root.querySelectorAll(".shop-viewer").forEach((el) => {
    let pinned = false, hovering = false;
    const scene = el.querySelector(".shop-scene"), button = el.querySelector("[data-flip]");
    function update() {
      const flipped = pinned || hovering;
      scene.dataset.flipped = String(flipped);
      button.setAttribute("aria-pressed", String(flipped));
      el.querySelector(".shop-face-front").setAttribute("aria-hidden", String(flipped));
      el.querySelector(".shop-face-back").setAttribute("aria-hidden", String(!flipped));
      el.querySelector("[data-side]").textContent = flipped ? "Back side" : "Front side";
    }
    scene.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && matchMedia("(hover:hover)").matches) {
        hovering = true;
        update();
      }
    });
    scene.addEventListener("pointerleave", () => {
      hovering = false;
      update();
    });
    const flipCard = () => {
      pinned = !pinned;
      hovering = false;
      update();
    };
    button.addEventListener("click", flipCard);
    scene.tabIndex = 0;
    scene.setAttribute("role", "button");
    scene.setAttribute("aria-label", `Flip ${getTheme(el.dataset.theme).name} card preview`);
    scene.addEventListener("click", flipCard);
    scene.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flipCard();
      }
    });
    el.querySelector("[data-enlarge]")?.addEventListener("click", () => showPreview(getTheme(el.dataset.theme)));
  });
}
function dialogHead(title, id = "shop-dialog-title") {
  return `<div class="shop-dialog-header"><h2 id="${id}">${esc(title)}</h2><button type="button" class="shop-close" data-close aria-label="Close dialog">\xD7</button></div>`;
}
function openDialog(markup) {
  dialog.innerHTML = markup;
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.showModal();
}
function showPreview(t) {
  openDialog(dialogHead(t.name) + viewer(t, true) + "<p>Sample artwork. Both sides are shown at the card\u2019s original proportions. This is not a finalized print proof.</p>");
  bindViewers(dialog);
}
function product(t) {
  return `<article class="shop-product"><div class="shop-product-stage"><span class="shop-badge">${t.madeToOrder ? "MADE TO ORDER \xB7 NFC + QR" : t.status === "demo" ? "DEMO THEME" : "NFC + QR"}</span>${viewer(t)}</div><div class="shop-product-info"><a href="/shop/cards/${esc(t.slug)}">${esc(t.name)} <span aria-hidden="true">\u2197</span></a><p>${esc(t.category)} \xB7 ${esc(t.style)}</p><div class="shop-product-meta"><strong>${esc(money(t.priceMinor, t.currency))}</strong><span class="shop-palette" aria-label="${esc(t.colors.join(", "))}">${t.palette.map((c) => `<i style="background:${esc(c)}"></i>`).join("")}</span></div><button class="shop-add" type="button" data-add="${esc(t.id)}" aria-label="Add ${esc(t.name)} to cart" ${canPurchase(t) ? "" : "disabled"}>Add to Cart <span aria-hidden="true">+</span></button></div></article>`;
}
function quickAdd(id) {
  const theme = getTheme(id);
  if (!canPurchase(theme)) return;
  const existing = cart.find((i) => i.themeId === id && !i.personalization.business && !i.personalization.destination);
  if (existing) {
    if (existing.quantity >= 100) {
      notify("Maximum 100 cards per design.");
      return;
    }
    existing.quantity++;
  } else {
    if (cart.length >= 50) {
      notify("Your cart can contain up to 50 designs.");
      return;
    }
    cart.push(validateItem({ id: cartId(), themeId: id, quantity: 1, material: theme.materials[0], finish: theme.finishes[0], personalization: { ...emptyPersonalization } }, themes, false));
  }
  persist();
  notify(`${theme.name} added \xB7 ${money(theme.priceMinor)}`);
}
function filterSelect(key, label, values) {
  return `<label class="shop-field">${label}<select name="${key}"><option value="">All ${label.toLowerCase()}</option>${options(values)}</select></label>`;
}
function benefitIcon(name) {
  const paths = { tap: '<path d="M8 8a6 6 0 0 0 0 8m8-8a6 6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/><circle cx="12" cy="12" r="2"/>', quality: '<path d="m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18"/>', design: '<path d="m4 15 11-11 5 5L9 20l-6 1 1-6Zm9-9 5 5"/>', delivery: '<path d="M2 5h12v12H2Zm12 5h4l4 5v2h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>' };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
}
function catalog() {
  const filters = { ...emptyFilters };
  const initial = new URLSearchParams(location.search);
  for (const key of Object.keys(filters)) if (initial.has(key)) filters[key] = initial.get(key);
  const collections = [{ label: "Business", category: "Corporate & Business" }, { label: "Restaurants", category: "Restaurants" }, { label: "Caf\xE9s", category: "Coffee Shops & Caf\xE9s" }, { label: "Personal", category: "Freelancers & Creators" }, { label: "Luxury", style: "Luxury" }, { label: "Other Industries", other: true }];
  let collection = initial.get("collection") || "";
  const heroThemes = [...themes.filter((t) => t.id === "northbridge-consulting"), ...themes.filter((t) => t.orientation === "Horizontal" && (!t.artwork || t.artwork.front.width / t.artwork.front.height > 1.3))].filter((t, i, a) => a.findIndex((x) => x.id === t.id) === i).slice(0, 2);
  const collectionTiles = collections.slice(0, 5).map((c) => {
    const t = themes.find((t2) => c.style ? t2.style === c.style : t2.category === c.category);
    return t ? `<a class="shop-collection-tile" href="/shop?collection=${encodeURIComponent(c.label)}#collection"><div class="shop-collection-art">${artworkImage(t, "front", t.name)}</div><span>${c.label} <b>\u2197</b></span></a>` : "";
  }).join("");
  app.innerHTML = `<div class="shop-shell"><section class="shop-hero"><div class="shop-hero-copy"><div class="shop-kicker">NFC Business Cards</div><h1>Your Identity.<br><em>One Tap Away.</em></h1><p>Modern NFC cards designed for professionals, businesses, and creative minds. Share your world instantly.</p><a class="shop-primary" href="/shop#collection">Shop Now <span>\u2192</span></a><div class="shop-hero-note">DESIGNED TO MAKE AN IMPRESSION</div></div><div class="shop-hero-art">${heroThemes.map((t, i) => `<div class="shop-hero-card hero-card-${i}" style="aspect-ratio:${t.artwork ? t.artwork.front.width / t.artwork.front.height : 856 / 540}">${artworkImage(t, "front", t.name).replace('loading="lazy"', 'loading="eager" fetchpriority="high"')}</div>`).join("")}<span class="shop-art-caption">A small card.<br>A world of possibilities.</span></div></section><div class="shop-benefits">${[["tap", "Tap & Share", "Share your information instantly."], ["quality", "Premium Quality", "Professional PVC NFC cards."], ["design", "Custom Designs", "Styles for every industry."], ["delivery", "Delivery", "Order your physical NFC cards."]].map(([icon, title, copy]) => `<div>${benefitIcon(icon)}<div><strong>${title}</strong><small>${copy}</small></div></div>`).join("")}</div><section id="collection" aria-labelledby="collection-title"><div class="shop-section-head"><div><div class="shop-kicker">THE CARD COLLECTION</div><h2 id="collection-title">Shop NFC Cards</h2></div><label class="shop-search"><span class="shop-sr-only">Search card designs</span><input id="shop-search" type="search" name="search" placeholder="Search designs, businesses\u2026" maxlength="100"></label></div><div class="shop-category-tabs" aria-label="Card collections">${["All Cards", ...collections.map((c) => c.label)].map((label) => `<button type="button" data-collection="${label === "All Cards" ? "" : label}">${label}</button>`).join("")}</div><div class="shop-catalog"><aside class="shop-filters"><button class="shop-mobile-filters" type="button" aria-expanded="false" aria-controls="shop-filter-body">Filters <span>+</span></button><form id="shop-filters"><div class="shop-filter-body" id="shop-filter-body">${filterSelect("category", "Business category", categories)}${filterSelect("purpose", "Purpose", purposes)}${filterSelect("style", "Style", styles)}${filterSelect("color", "Color", [...new Set(themes.flatMap((t) => t.colors))].sort())}${filterSelect("orientation", "Orientation", ["Horizontal", "Vertical"])}<label class="shop-field">Maximum price (TRY)<input name="maxPrice" type="number" min="0" max="1000000" step="1" placeholder="No limit"><small>Every card is 600 TL.</small></label><button class="shop-filter-reset" type="reset">Clear all filters</button></div></form></aside><div><div class="shop-results-head"><span id="shop-result-count" role="status" aria-live="polite"></span><div class="shop-orientation" aria-label="Card orientation">${["", "Horizontal", "Vertical"].map((o) => `<button type="button" data-orientation-filter="${o}">${o || "All formats"}</button>`).join("")}</div><label><span class="shop-sr-only">Sort by</span><select id="shop-sort" name="sort"><option value="newest">Newest designs</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="alphabetical">Name: A\u2013Z</option><option value="popular">Popularity</option></select></label></div><div class="shop-filter-chips" id="shop-filter-chips"></div><div class="shop-grid" id="shop-grid"></div></div></div></section><section class="shop-collections"><div class="shop-section-head"><div><div class="shop-kicker">FIND YOUR SIGNATURE</div><h2>Designed for <em>Every Profession.</em></h2><p>From your first introduction to your next opportunity.</p></div></div><div class="shop-collection-grid">${collectionTiles}</div></section><section id="how-it-works" class="shop-how"><div class="shop-kicker">SIMPLE BY DESIGN</div><h2>Three steps. Endless connections.</h2><div>${[["01", "Choose Your Card.", "Find a design that feels like you."], ["02", "Place Your Order.", "Add your details and pay by bank transfer."], ["03", "Receive, Tap & Share.", "Approve your artwork, then start connecting."]].map(([n, t, d]) => `<article><span>${n}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></section><section class="shop-faq" id="faq"><div><div class="shop-kicker">GOOD TO KNOW</div><h2>A few helpful answers.</h2><a href="/contact">Need a hand? Contact us \u2197</a></div><div>${[["Will my phone work with NFC?", "NFC works with compatible NFC-enabled smartphones. NFC may need to be enabled in phone settings. The printed QR code offers an alternative: scan it with your camera to open the same link."], ["Can I customize my card?", "Yes. Add your business details and destination link at checkout, and send us your logo with your order reference. Final artwork is approved before printing."], ["How does delivery work?", "Delivery is arranged separately. We confirm timing and any delivery fee before shipping. Contact us for details for your address."], ["How do I order and pay?", "Browse and add cards freely. Sign in or register at checkout, add your shipping details, and create your order. Transfer the total using the displayed IBAN and order reference. Payment remains pending until verified."]].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></section><section class="shop-inline-cart" id="panier" aria-labelledby="panier-title"><div class="shop-section-head"><div><h2 id="panier-title">Your shopping cart.</h2><p>Your next connection starts here.</p></div><span class="shop-unit-price">600 TL / card</span></div><div id="shop-inline-cart-body"></div></section><div class="shop-note"><strong>Made for your business.</strong> Final business details and artwork are approved before printing. Delivery fees are confirmed separately. <a href="/contact">Talk to us \u2197</a></div></div>`;
  const form = document.querySelector("#shop-filters"), search = document.querySelector("#shop-search"), sort = document.querySelector("#shop-sort");
  function syncControls() {
    search.value = filters.search;
    sort.value = filters.sort;
    for (const key of ["category", "purpose", "style", "color", "orientation", "maxPrice"]) form.elements.namedItem(key).value = filters[key];
  }
  function update() {
    const selected = collections.find((c) => c.label === collection);
    const results = filterThemes(themes, filters).filter((t) => !selected || (selected.other ? !collections.slice(0, 4).some((c) => c.category === t.category) && t.style !== "Luxury" : selected.style ? t.style === selected.style : t.category === selected.category));
    document.querySelectorAll("[data-collection]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.collection === collection)));
    document.querySelectorAll("[data-orientation-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.orientationFilter === filters.orientation)));
    document.querySelector("#shop-result-count").textContent = `${results.length} ${results.length === 1 ? "design" : "designs"}`;
    document.querySelector("#shop-grid").innerHTML = results.length ? results.map(product).join("") : '<div class="shop-empty"><h2>No matching designs yet.</h2><p>Try another category or clear your filters.</p><button type="button" class="shop-secondary" data-clear>Clear filters</button></div>';
    const labels = { search: "Search", category: "Category", purpose: "Purpose", style: "Style", color: "Color", orientation: "Orientation", maxPrice: "Max TRY" };
    document.querySelector("#shop-filter-chips").innerHTML = Object.entries(labels).filter(([key]) => filters[key]).map(([key, label]) => `<button type="button" data-remove-filter="${key}" aria-label="Remove ${label} filter">${label}: ${esc(filters[key])} \xD7</button>`).join("");
    document.querySelectorAll("[data-remove-filter]").forEach((b) => b.addEventListener("click", () => {
      filters[b.dataset.removeFilter] = "";
      syncControls();
      update();
    }));
    document.querySelector("[data-clear]")?.addEventListener("click", clear);
    const params = new URLSearchParams();
    if (collection) params.set("collection", collection);
    for (const [key, value] of Object.entries(filters)) if (value && value !== emptyFilters[key]) params.set(key, value);
    history.replaceState(null, "", "/shop" + (params.size ? `?${params}` : "") + location.hash);
    bindViewers(document.querySelector("#shop-grid"));
    document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => quickAdd(button.dataset.add)));
  }
  document.querySelectorAll("[data-collection]").forEach((b) => b.addEventListener("click", () => {
    collection = b.dataset.collection;
    filters.category = "";
    filters.style = "";
    syncControls();
    update();
  }));
  document.querySelectorAll("[data-orientation-filter]").forEach((b) => b.addEventListener("click", () => {
    filters.orientation = b.dataset.orientationFilter;
    syncControls();
    update();
  }));
  function clear() {
    collection = "";
    Object.assign(filters, emptyFilters);
    syncControls();
    update();
  }
  search.addEventListener("input", () => {
    filters.search = search.value;
    update();
  });
  sort.addEventListener("change", () => {
    filters.sort = sort.value;
    update();
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("change", () => {
    for (const [key, value] of new FormData(form)) filters[key] = String(value);
    update();
  });
  form.addEventListener("reset", (e) => {
    e.preventDefault();
    clear();
  });
  document.querySelector(".shop-mobile-filters").addEventListener("click", (e) => {
    const button = e.currentTarget, open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    document.querySelector(".shop-filters").dataset.open = String(open);
  });
  syncControls();
  update();
  refreshCart(document.querySelector("#shop-inline-cart-body"));
}
function textField(key, label, value, attrs = "", wide = false) {
  return `<label class="shop-field${wide ? " wide" : ""}">${label}<input name="${key}" value="${esc(value)}" ${attrs}></label>`;
}
function detail(t) {
  const editing = cart.find((i) => i.id === new URLSearchParams(location.search).get("edit") && i.themeId === t.id);
  const p = editing?.personalization || emptyPersonalization;
  app.innerHTML = `<div class="shop-shell"><nav class="shop-breadcrumb" aria-label="Breadcrumb"><a href="/shop">Shop</a><span>/</span><span>${esc(t.name)}</span></nav><div class="shop-detail"><section class="shop-detail-art" aria-label="Card preview"><span class="shop-badge">${t.madeToOrder ? "MADE TO ORDER \xB7 NFC + QR" : "ARTWORK PREVIEW"}</span>${viewer(t)}<p>Hover the card or use Flip Card to explore both sides.<br>Original proportions \xB7 ${t.orientation} \xB7 NFC + QR on the front</p></section><section class="shop-detail-copy"><div class="shop-kicker">${esc(t.category)} / ${esc(t.style)}</div><h1>${esc(t.name)}</h1><p>${esc(t.description)}</p><div class="shop-price">${esc(money(t.priceMinor, t.currency))}</div><p class="shop-variant-label">Available orientation: <strong>${esc(t.orientation)}</strong></p><p class="shop-storage-note">Tap with a compatible NFC-enabled smartphone, or scan the printed QR code using your camera. Both open your chosen link.</p><form id="shop-personalize"><div class="shop-fields">${filterDetailSelect("material", "Material", t.materials, editing?.material)}${filterDetailSelect("finish", "Finish", t.finishes, editing?.finish)}${textField("quantity", "Quantity", String(editing?.quantity || 1), 'type="number" min="1" max="100" step="1" required', true)}</div><div class="shop-form-section"><h2>01 / Make it yours</h2><div class="shop-fields">${textField("business", "Business name *", p.business, 'required maxlength="100" autocomplete="organization"', true)}${filterDetailSelect("destinationType", "Destination type", destinationTypes, p.destinationType, true)}${textField("destination", "NFC + QR destination *", p.destination, 'type="url" required maxlength="800" placeholder="https://your-business.com"', true)}<p class="shop-storage-note wide">NFC and QR will use the same link. Separate destinations require a supported production configuration.</p><label class="shop-field wide">Business logo<input type="file" disabled accept="image/png,image/jpeg,image/webp"><small>After ordering, email your logo to info@auradigitalworks.com with your order reference. We confirm placement during artwork approval.</small></label></div></div><div class="shop-form-section"><h2>02 / Optional details</h2><div class="shop-fields">${textField("contact", "Contact name", p.contact, 'maxlength="100" autocomplete="name"')}${textField("phone", "Phone", p.phone, 'type="tel" maxlength="100" autocomplete="tel"')}${textField("whatsapp", "WhatsApp", p.whatsapp, 'type="tel" maxlength="100"')}${textField("social", "Instagram / social URL", p.social, 'type="url" maxlength="800" placeholder="https://"')}<label class="shop-field wide">Custom instructions<textarea name="instructions" maxlength="1000">${esc(p.instructions)}</textarea></label></div></div><p class="shop-storage-note">The preview remains sample artwork. Your text does not generate a print proof. Personalization is saved in this browser; avoid entering sensitive information on a shared device.</p><p class="shop-error shop-form-error" role="alert"></p><button class="shop-primary" type="button" id="shop-detail-add" ${canPurchase(t) ? "" : "disabled"}>Add to Cart</button><button class="shop-primary" type="submit">${editing ? "Review changes" : "Review personalization"} <span>\u2197</span></button></form></section></div></div>`;
  bindViewers(app);
  app.querySelector(".shop-shell").insertAdjacentHTML("beforeend", `<section class="shop-related"><h2>You may also like</h2><div class="shop-grid">${themes.filter((x) => x.id !== t.id && x.category === t.category).slice(0, 4).map(product).join("")}</div></section>`);
  bindViewers(app.querySelector(".shop-related"));
  app.querySelectorAll(".shop-related [data-add]").forEach((b) => b.addEventListener("click", () => quickAdd(b.dataset.add)));
  const form = document.querySelector("#shop-personalize");
  document.querySelector("#shop-detail-add").addEventListener("click", () => {
    try {
      const data = Object.fromEntries(new FormData(form));
      if (cart.length >= 50) throw new Error("Your cart can contain up to 50 designs.");
      const item = validateItem({ id: cartId(), themeId: t.id, quantity: Number(data.quantity), material: data.material, finish: data.finish, personalization: Object.fromEntries(Object.keys(emptyPersonalization).map((key) => [key, data[key]])) }, themes, false);
      cart.push(item);
      persist();
      notify(`${t.name} added to cart.`);
    } catch (error) {
      form.querySelector(".shop-form-error").textContent = error instanceof Error ? error.message : "Check your details.";
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      const item = validateItem({ id: editing?.id || cartId(), themeId: t.id, quantity: Number(data.quantity), material: data.material, finish: data.finish, personalization: Object.fromEntries(Object.keys(emptyPersonalization).map((key) => [key, data[key]])) }, themes);
      openDialog(dialogHead("Your personalization") + `<p>${esc(t.name)} \xB7 ${item.quantity} \xD7 ${esc(money(t.priceMinor))}</p><dl class="shop-summary">${[["Business", item.personalization.business], ["Destination type", item.personalization.destinationType], ["NFC + QR link", item.personalization.destination], ["Material / finish", `${item.material} / ${item.finish}`], ["Contact", item.personalization.contact], ["Phone", item.personalization.phone], ["WhatsApp", item.personalization.whatsapp], ["Social URL", item.personalization.social], ["Instructions", item.personalization.instructions]].filter(([, v]) => v).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl><p>Sample artwork requires approval. Your order is paid by bank transfer. Final artwork is approved before printing.</p><button type="button" class="shop-primary" id="shop-confirm">${editing ? "Save changes" : "Add to cart"}</button>`);
      document.querySelector("#shop-confirm").addEventListener("click", () => {
        if (!editing && cart.length >= 50) {
          notify("Your cart can contain up to 50 different designs.");
          return;
        }
        if (editing) cart = cart.map((i) => i.id === editing.id ? item : i);
        else cart.push(item);
        persist();
        dialog.close();
        notify(editing ? "Personalization updated." : "Card added to your panier.");
        if (editing) location.assign("/shop/cart");
      }, { once: true });
    } catch (error) {
      form.querySelector(".shop-form-error").textContent = error instanceof Error ? error.message : "Check your details.";
    }
  });
}
function filterDetailSelect(name, label, values, selected, wide = false) {
  return `<label class="shop-field${wide ? " wide" : ""}">${label}<select name="${name}">${options(values, selected || values[0])}</select></label>`;
}
function cartMarkup() {
  if (!cart.length) return '<div class="shop-empty"><h2>Your panier is ready for its first card.</h2><p>Use the + button under any design to add it here.</p><a class="shop-secondary" href="/shop#collection">Explore cards \u2197</a></div>';
  const allPriced = cart.every((i) => canPurchase(getTheme(i.themeId)));
  const subtotal = allPriced ? cart.reduce((sum, i) => sum + getTheme(i.themeId).priceMinor * i.quantity, 0) : null;
  return `<div class="shop-cart-layout"><div>${cart.map((i) => {
    const t = getTheme(i.themeId);
    return `<article class="shop-cart-row"><div class="shop-cart-art" style="aspect-ratio:${t.artwork ? t.artwork.front.width / t.artwork.front.height : t.orientation === "Vertical" ? 540 / 856 : 856 / 540}">${artworkImage(t, "front", `${t.name} front`)}</div><div><h3>${esc(t.name)}</h3><p>${esc(i.personalization.business || "Personalize at checkout")}<br>${esc(t.orientation)} \xB7 ${esc(i.material)} / ${esc(i.finish)} \xB7 ${esc(money(t.priceMinor))} each<br><strong>${esc(money(t.priceMinor === null ? null : t.priceMinor * i.quantity))}</strong></p><div class="shop-cart-actions"><button type="button" class="shop-quantity-step" data-adjust="${i.id}" data-delta="-1" aria-label="Decrease quantity for ${esc(t.name)}" ${i.quantity === 1 ? "disabled" : ""}>\u2212</button><label><span class="shop-sr-only">Quantity for ${esc(t.name)}</span><input type="number" min="1" max="100" step="1" value="${i.quantity}" data-quantity="${i.id}"></label><button type="button" class="shop-quantity-step" data-adjust="${i.id}" data-delta="1" aria-label="Increase quantity for ${esc(t.name)}" ${i.quantity === 100 ? "disabled" : ""}>+</button><a href="/shop/cards/${esc(t.slug)}?edit=${i.id}">Personalize</a><button type="button" data-remove="${i.id}" aria-label="Remove ${esc(t.name)}">Remove</button></div></div></article>`;
  }).join("")}</div><aside class="shop-cart-summary"><div class="shop-kicker">Order summary</div><div class="shop-cart-total"><span>Cards total</span><strong>${esc(money(subtotal))}</strong></div><p class="shop-storage-note">Bank transfer \xB7 Payment verified by AuraDigital.<br>Delivery is arranged separately; any delivery fee is confirmed before shipping.</p>${allPriced ? '<a class="shop-primary" href="/shop/checkout">Proceed to checkout <span>\u2197</span></a>' : '<button class="shop-primary" disabled>One or more designs are unavailable</button>'}<p class="shop-storage-note">${customer ? `Continue as ${esc(customer.name)}.` : "Sign in or create your AuraDigital account to continue. Your panier will stay saved."}</p><a class="shop-secondary" href="/shop#collection">Continue Shopping</a><button type="button" class="shop-filter-reset" data-clear-cart>Clear panier</button></aside></div>`;
}
function bindCart(root) {
  root.querySelectorAll("[data-adjust]").forEach((button) => button.addEventListener("click", () => {
    const item = cart.find((i) => i.id === button.dataset.adjust);
    try {
      const next = validateItem({ ...item, quantity: item.quantity + Number(button.dataset.delta) }, themes, false);
      cart = cart.map((i) => i.id === next.id ? next : i);
      persist();
      refreshCart(root);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Invalid quantity.");
    }
  }));
  root.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => {
    cart = cart.filter((i) => i.id !== b.dataset.remove);
    persist();
    refreshCart(root);
    notify("Design removed.");
  }));
  root.querySelectorAll("[data-quantity]").forEach((input) => input.addEventListener("change", () => {
    const item = cart.find((i) => i.id === input.dataset.quantity);
    try {
      const next = validateItem({ ...item, quantity: Number(input.value) }, themes, false);
      cart = cart.map((i) => i.id === next.id ? next : i);
      persist();
      refreshCart(root);
    } catch (error) {
      input.value = String(item.quantity);
      notify(error instanceof Error ? error.message : "Invalid quantity.");
    }
  }));
  root.querySelector("[data-clear-cart]")?.addEventListener("click", () => {
    cart = [];
    persist();
    refreshCart(root);
    notify("Saved cart cleared.");
  });
}
function refreshCart(root) {
  root.innerHTML = root === drawer ? dialogHead("Your panier", "shop-cart-title") + cartMarkup() + (cart.length ? '<a class="shop-secondary" href="/shop/cart">Open full cart \u2197</a>' : "") : cartMarkup();
  root.querySelector("[data-close]")?.addEventListener("click", () => drawer.close());
  bindCart(root);
}
function cartPage() {
  app.innerHTML = '<div class="shop-shell"><div class="shop-cart-page"><nav class="shop-breadcrumb" aria-label="Breadcrumb"><a href="/shop">Shop</a><span>/</span><span>Your collection</span></nav><h1>Your panier.</h1><div id="shop-cart-page"></div></div></div>';
  refreshCart(document.querySelector("#shop-cart-page"));
}
function nextPage() {
  const next = new URLSearchParams(location.search).get("next") || "/account";
  return next === "/hub" || next === "/shop/checkout" || /^\/shop\/orders\/[a-f0-9-]{36}$/.test(next) ? next : "/account";
}
function signInRequired(next) {
  location.replace("/account/login?next=" + encodeURIComponent(next));
}
function accountAuth() {
  if (customer) {
    location.replace(nextPage());
    return;
  }
  const signup = location.pathname === "/account/signup", next = encodeURIComponent(nextPage());
  app.innerHTML = `<div class="shop-shell"><section class="shop-auth"><div class="shop-kicker">AuraDigital account</div><h1>${signup ? "Your business.<br>Your account." : "Welcome back."}</h1><p>${signup ? "Create your account to complete your order, save delivery details and track your cards." : "Sign in to continue. Your saved panier is waiting for you."}</p><form id="shop-auth-form">${signup ? textField("name", "Full name", "", 'required maxlength="100" autocomplete="name"') : ""}${textField("email", "Email", "", 'type="email" required maxlength="254" autocomplete="email"')}${textField("password", "Password", "", `type="password" required minlength="12" maxlength="72" autocomplete="${signup ? "new-password" : "current-password"}"`)}${signup ? '<p class="shop-storage-note">Use at least 12 characters, up to 72 UTF-8 bytes.</p><label class="shop-check"><input type="checkbox" name="acceptTerms" required><span>I agree to create an AuraDigital account and allow my contact and delivery details to be used to manage my orders.</span></label>' : ""}<p class="shop-error" role="alert"></p><button type="submit" class="shop-primary">${signup ? "Create account & continue" : "Sign in & continue"} <span>\u2197</span></button></form><p>${signup ? "Already have an account?" : "New to AuraDigital?"} <a href="/account/${signup ? "login" : "signup"}?next=${next}">${signup ? "Sign in" : "Create an account"} \u2197</a></p><a class="shop-storage-note" href="/shop">\u2190 Continue shopping</a></section></div>`;
  api("/api/customer/capabilities").then((capabilities) => {
    const authPanel = document.querySelector(".shop-auth");
    if (capabilities.email) authPanel?.insertAdjacentHTML("beforeend", '<p><a href="/hub/forgot">Forgot password?</a></p>');
    if (capabilities.google) {
      authPanel?.insertAdjacentHTML("beforeend", '<label class="shop-check"><input type="checkbox" id="shop-google-terms"><span>I accept the AuraDigital account conditions.</span></label><button class="shop-secondary" id="shop-google-signin" type="button">Continue with Google</button>');
      document.querySelector("#shop-google-signin")?.addEventListener("click", () => {
        const consent = document.querySelector("#shop-google-terms");
        if (!consent.checked) {
          consent.reportValidity();
          consent.required = true;
          consent.reportValidity();
          return;
        }
        location.assign("/api/customer/google/start?acceptTerms=true&next=" + encodeURIComponent(nextPage()));
      });
    }
  }).catch(() => {
  });
  const form = document.querySelector("#shop-auth-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form), button = form.querySelector("button");
    button.disabled = true;
    try {
      await api(signup ? "/api/customer/register" : "/api/customer/login", "POST", { name: data.get("name"), email: data.get("email"), password: data.get("password"), acceptTerms: data.has("acceptTerms") });
      location.assign(nextPage());
    } catch (error) {
      form.querySelector('[role="alert"]').textContent = error instanceof Error ? error.message : "Could not sign in.";
      button.disabled = false;
    }
  });
}
async function accountPage() {
  if (!customer) {
    signInRequired("/account");
    return;
  }
  const data = await api("/api/shop/orders");
  app.innerHTML = `<div class="shop-shell"><section class="shop-account"><div class="shop-section-head"><div><div class="shop-kicker">AuraDigital Business Account</div><h1>Hello, ${esc(customer.name)}.</h1><p>${esc(customer.email)}</p></div><button type="button" class="shop-secondary" id="shop-signout">Sign out</button></div><div class="shop-benefits"><div><b>\u25CE</b><div><strong>Your cards</strong><small>Orders and bank transfers</small></div></div><div><b>\u2197</b><div><strong>Your business</strong><small>Personalization saved with every order</small></div></div><div><b>\u2302</b><div><strong>Your delivery details</strong><small>Autofilled at your next checkout</small></div></div></div><h2>My orders</h2>${data.orders.length ? data.orders.map((order) => `<a class="shop-order-link" href="/shop/orders/${order.id}"><div><strong>${esc(order.reference)}</strong><small>${esc(statusLabel(order))}</small></div><strong>${money(order.totalMinor)} \u2197</strong></a>`).join("") : '<div class="shop-empty"><p>You have no orders yet.</p><a class="shop-primary" href="/shop">Explore cards \u2197</a></div>'}${customer.profile.address ? `<div class="shop-note"><strong>Saved delivery details</strong><p>${esc(customer.profile.name)} \xB7 ${esc(customer.profile.phone)}<br>${esc(customer.profile.address)}<br>${esc(customer.profile.city)} ${esc(customer.profile.postalCode)}, ${esc(customer.profile.country)}</p></div>` : ""}</section></div>`;
  const hubCapabilities = await api("/api/customer/capabilities").catch(() => null);
  if (hubCapabilities?.growth) document.querySelector(".shop-account h2")?.insertAdjacentHTML("beforebegin", '<p><a class="shop-primary" href="/hub">Open Business Hub \u2197</a></p>');
  document.querySelector("#shop-signout").addEventListener("click", async () => {
    await api("/api/customer/logout", "POST", {});
    location.assign("/shop");
  });
}
async function checkoutPage() {
  if (!customer) {
    signInRequired("/shop/checkout");
    return;
  }
  if (!cart.length) {
    cartPage();
    return;
  }
  const quote = await api("/api/shop/quote", "POST", { items: cart });
  const profile = customer.profile;
  app.innerHTML = `<div class="shop-shell"><nav class="shop-breadcrumb" aria-label="Breadcrumb"><a href="/shop">Shop</a><span>/</span><a href="/shop/cart">Panier</a><span>/</span><span>Checkout</span></nav><div class="shop-checkout"><div><div class="shop-kicker">01 Account \u2713 \xB7 02 Details \xB7 03 Bank transfer</div><h1>Make it yours.</h1><p>Signed in as ${esc(customer.email)}. Complete your details to create the order and receive payment instructions.</p><form id="shop-checkout-form"><div class="shop-form-section"><h2>Contact & delivery</h2><div class="shop-fields">${textField("name", "Full name *", profile.name || customer.name, 'required maxlength="100" autocomplete="name"')}${textField("phone", "Phone / WhatsApp *", profile.phone || "", 'type="tel" required maxlength="40" autocomplete="tel"')}${textField("business", "Business / company name *", profile.business || "", 'required maxlength="100" autocomplete="organization"', true)}${textField("country", "Country *", profile.country || "T\xFCrkiye", 'required maxlength="80" autocomplete="country-name"')}${textField("city", "City *", profile.city || "", 'required maxlength="100" autocomplete="address-level2"')}${textField("address", "Full delivery address *", profile.address || "", 'required maxlength="500" autocomplete="street-address"', true)}${textField("postalCode", "Postal code *", profile.postalCode || "", 'required maxlength="20" autocomplete="postal-code"')}<label class="shop-field wide">Billing details (optional)<textarea name="billingDetails" maxlength="600">${esc(profile.billingDetails || "")}</textarea></label></div></div><div class="shop-form-section"><h2>Your card links</h2><label class="shop-field">Order notes (optional)<textarea name="orderNotes" maxlength="1000"></textarea></label><p class="shop-storage-note">NFC and QR use the same link. We prepare your business artwork for approval before printing.</p>${cart.map((item) => `<label class="shop-field">${esc(getTheme(item.themeId).name)} \xB7 ${item.quantity} card${item.quantity > 1 ? "s" : ""}<input type="url" name="destination-${item.id}" required maxlength="800" placeholder="https://your-business.com" value="${esc(item.personalization.destination)}"></label>`).join("")}</div><label class="shop-check"><input type="checkbox" name="acceptConditions" required><span>I confirm my order details and understand payment is verified manually after my bank transfer. Final artwork requires approval before printing. Delivery is arranged separately and any delivery fee is confirmed before shipping. My account details are used to fulfill this order.</span></label><p class="shop-error" role="alert"></p><button type="submit" class="shop-primary">Create order & show bank details <span>\u2197</span></button></form></div><aside class="shop-cart-summary"><div class="shop-kicker">Order summary</div>${quote.lines.map((line) => `<div class="shop-cart-total"><span>${esc(line.name)} \xD7 ${line.quantity}</span><strong>${money(line.subtotalMinor)}</strong></div>`).join("")}<div class="shop-checkout-total"><span>Total for cards</span><strong>${money(quote.subtotalMinor)}</strong></div><p>600 TL per card \xB7 Payment by bank transfer.<br>Delivery fees, if needed, are confirmed separately before shipping.</p><p class="shop-storage-note">Your order is saved to your AuraDigital account. Creating it does not mark it paid.</p></aside></div></div>`;
  const form = document.querySelector("#shop-checkout-form"), key = cartId();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form), button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const shipping = Object.fromEntries(["name", "phone", "business", "country", "city", "address", "postalCode", "billingDetails"].map((name) => [name, String(data.get(name) || "")]));
      const items = cart.map((item) => ({ ...item, personalization: { ...item.personalization, business: item.personalization.business || shipping.business, destination: String(data.get("destination-" + item.id)), instructions: [item.personalization.instructions, String(data.get("orderNotes") || "")].filter(Boolean).join("\n").slice(0, 1e3) } }));
      const result = await api("/api/shop/checkout", "POST", { items, shipping, idempotencyKey: key, acceptConditions: data.has("acceptConditions") });
      cart = [];
      persist();
      location.assign("/shop/orders/" + result.order.id);
    } catch (error) {
      form.querySelector('[role="alert"]').textContent = error instanceof Error ? error.message : "Could not create the order.";
      button.disabled = false;
    }
  });
}
function statusLabel(order) {
  return order.paymentStatus === "paid" ? "Payment verified \xB7 Awaiting artwork approval" : order.paymentStatus === "cancelled" ? "Cancelled" : order.transferReportedAt ? "Transfer reported \xB7 Awaiting verification" : "Pending Payment \xB7 Awaiting bank transfer";
}
async function orderPage(id) {
  if (!customer) {
    signInRequired("/shop/orders/" + id);
    return;
  }
  const { order } = await api("/api/shop/orders/" + id);
  app.innerHTML = `<div class="shop-shell"><section class="shop-receipt"><div class="shop-kicker">Your AuraDigital order</div><h1>${order.paymentStatus === "paid" ? "Payment verified." : "Your order is saved."}</h1><p class="shop-payment-status">${esc(statusLabel(order))}</p><p>Order reference <strong>${esc(order.reference)}</strong></p><div class="shop-bank-card"><div class="shop-kicker">Pay by bank transfer</div><h2>${money(order.totalMinor)}</h2><p>Total for cards \xB7 TRY</p><label class="shop-field">Recipient<input readonly value="${esc(order.bank.holder)}"></label><label class="shop-field">IBAN<input readonly class="shop-iban" value="${esc(order.bank.iban.match(/.{1,4}/g)?.join(" ") || order.bank.iban)}"></label><button type="button" class="shop-secondary" data-copy="${esc(order.bank.iban)}">Copy IBAN</button><label class="shop-field">Transfer description / reference<input readonly value="${esc(order.reference)}"></label><button type="button" class="shop-secondary" data-copy="${esc(order.reference)}">Copy reference</button><p>Send the exact card total to this account and include your order reference in the transfer description. Your order remains unpaid until AuraDigital checks the bank receipt.</p>${order.paymentStatus === "awaiting_transfer" ? `<button type="button" class="shop-primary" id="shop-report-transfer" ${order.transferReportedAt ? "disabled" : ""}>${order.transferReportedAt ? "Transfer reported \xB7 Awaiting verification" : "I have sent the transfer"}</button>` : ""}</div><div class="shop-note"><strong>Delivery details</strong><p>${esc(order.shipping.name)} \xB7 ${esc(order.shipping.phone)}<br>${esc(order.shipping.address)}<br>${esc(order.shipping.city)} ${esc(order.shipping.postalCode)}, ${esc(order.shipping.country)}</p><p>Delivery is arranged separately. Any delivery fee is confirmed before shipping. We will prepare your personalized artwork for approval before printing.</p></div><a class="shop-secondary" href="/account">My account & orders \u2197</a></section></div>`;
  document.querySelectorAll("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      notify("Copied.");
    } catch {
      notify("Select and copy the details from the field above.");
    }
  }));
  document.querySelector("#shop-report-transfer")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await api("/api/shop/orders/" + id + "/report-transfer", "POST", {});
      await orderPage(id);
      notify("Transfer reported. AuraDigital will verify receipt.");
    } catch (error) {
      button.disabled = false;
      notify(error instanceof Error ? error.message : "Could not report transfer.");
    }
  });
}
document.querySelectorAll(".shop-cart-toggle").forEach((b) => b.addEventListener("click", () => {
  refreshCart(drawer);
  drawer.showModal();
}));
for (const modal of [dialog, drawer]) modal.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  const box = modal.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
});
window.addEventListener("storage", (event) => {
  if (event.key === storageKey && themes.length) {
    cart = restoreCart(event.newValue, themes);
    count();
    if (drawer.open) refreshCart(drawer);
    const inline = document.querySelector("#shop-inline-cart-body");
    if (inline) refreshCart(inline);
    const root = document.querySelector("#shop-cart-page");
    if (root) refreshCart(root);
  }
});
async function init() {
  try {
    const response = await fetch("/api/shop/catalog", { credentials: "same-origin" });
    if (!response.ok) throw new Error("The card catalog is temporarily unavailable. Please try again shortly.");
    const data = await response.json();
    themes = data.themes;
    const session = await api("/api/customer/session");
    customer = session.user;
    const accountLink = document.querySelector(".shop-account-link");
    if (accountLink) accountLink.textContent = customer ? `${customer.name.split(" ")[0]}'s account \u2197` : "My account \u2197";
    try {
      cart = restoreCart(localStorage.getItem(storageKey), themes);
    } catch {
      notify("Browser storage is unavailable. Your cart will last for this visit only.");
    }
    count();
    const slug = /^\/shop\/cards\/([a-z0-9-]+)$/.exec(location.pathname)?.[1];
    const orderId = /^\/shop\/orders\/([a-f0-9-]{36})$/.exec(location.pathname)?.[1];
    if (location.pathname === "/account/login" || location.pathname === "/account/signup") accountAuth();
    else if (location.pathname === "/account") await accountPage();
    else if (location.pathname === "/shop/checkout") await checkoutPage();
    else if (orderId) await orderPage(orderId);
    else if (location.pathname === "/shop/cart") cartPage();
    else if (slug) {
      const theme = themes.find((t) => t.slug === slug);
      if (theme) detail(theme);
      else app.innerHTML = '<div class="shop-empty"><h1>Theme not found.</h1><a href="/shop">Back to the shop</a></div>';
    } else catalog();
  } catch (error) {
    app.innerHTML = `<div class="shop-shell"><div class="shop-empty"><h1>We couldn\u2019t load the collection.</h1><p>${esc(error instanceof Error ? error.message : "Please try again.")}</p><button type="button" class="shop-primary" id="shop-retry">Try again</button> <a class="shop-secondary" href="/contact">Contact us</a></div></div>`;
    document.querySelector("#shop-retry").addEventListener("click", init, { once: true });
  }
}
void init();
