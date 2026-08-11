(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const state = { me: null, view: "dashboard", menu: null, website: null, editor: null };
  const titles = { dashboard: "Panel", menu: "Menüm", website: "Web sitem", account: "Hesabım" };

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof Blob) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    const response = await fetch(path, { ...options, headers, credentials: "same-origin" });
    const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(data.error || "İşlem başarısız oldu."); error.status = response.status; throw error; }
    return data;
  }

  function showNotice(message, error = false) {
    const notice = $("notice"); notice.textContent = message; notice.className = `toast${error ? " error" : ""}`;
    clearTimeout(showNotice.timer); showNotice.timer = setTimeout(() => notice.classList.add("hidden"), 3500);
  }

  async function boot() {
    try { state.me = await api("/api/me"); showApp(); } catch { $("loginView").classList.remove("hidden"); }
  }

  function navItems() {
    const items = [["dashboard", "Dashboard"]];
    if (state.me.products.includes("auramenu")) items.push(["menu", "Menüm"]);
    if (state.me.products.includes("quicksite")) items.push(["website", "Web sitem"]);
    items.push(["account", "Hesabım"]); return items;
  }

  function showApp() {
    $("loginView").classList.add("hidden"); $("appView").classList.remove("hidden");
    $("businessName").textContent = state.me.business?.name || state.me.user.email;
    buildNav(); openView(location.hash.slice(1) || "dashboard");
  }

  function buildNav() {
    const items = navItems();
    $("desktopNav").innerHTML = items.map(([id, label]) => `<button class="nav-button${state.view === id ? " active" : ""}" data-view="${id}">${esc(label)}</button>`).join("");
    $("mobileNav").innerHTML = items.map(([id, label]) => `<option value="${id}"${state.view === id ? " selected" : ""}>${esc(label)}</option>`).join("");
    document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => openView(button.dataset.view)));
  }

  async function openView(view) {
    if (!navItems().some(([id]) => id === view)) view = "dashboard";
    state.view = view; location.hash = view === "dashboard" ? "" : view; buildNav(); $("pageTitle").textContent = titles[view];
    $("content").innerHTML = '<section class="panel"><p class="muted">Yükleniyor…</p></section>';
    try {
      if (view === "dashboard") renderDashboard();
      if (view === "menu") await renderMenu();
      if (view === "website") await renderWebsite();
      if (view === "account") renderAccount();
    } catch (error) { if (error.status === 401) return location.reload(); $("content").innerHTML = `<section class="panel"><p class="notice error">${esc(error.message)}</p></section>`; }
  }

  function renderDashboard() {
    const products = state.me.products;
    $("content").innerHTML = `<div class="metrics">
      <article class="metric"><span>Aktif hizmetler</span><strong>${products.length}</strong></article>
      <article class="metric"><span>Canlı adres</span><strong>${esc(state.me.business?.slug || "—")}</strong></article>
      <article class="metric"><span>Hesap rolü</span><strong>${state.me.user.role === "customer_admin" ? "Yönetici" : "Editör"}</strong></article>
    </div><section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>Değişiklikleriniz canlıya gider</h2><p>Kaydettiğiniz fiyat, ürün, metin ve fotoğraflar yeniden deploy edilmeden yayınlanır.</p></div><span class="status-pill">Güvenli bağlantı</span></div></section>`;
  }

  async function renderMenu() {
    state.menu = await api("/api/menu"); const { business, settings, categories, products } = state.menu;
    const categoryHtml = categories.map((category) => {
      const items = products.filter((product) => product.category_id === category.id);
      return `<section class="category-block"><div class="category-head"><h3>${esc(category.emoji || "🍽️")} ${esc(category.name)}</h3><div class="category-actions"><button class="button ghost small" data-edit-category="${category.id}">Düzenle</button><button class="button danger small" data-delete-category="${category.id}">Sil</button></div></div>
        ${items.length ? `<div class="product-grid">${items.map(productCard).join("")}</div>` : '<div class="empty">Bu kategoride ürün yok.</div>'}</section>`;
    }).join("");
    $("content").innerHTML = `<section class="panel"><div class="panel-head"><div><h2>Menü ayarları</h2><p>İşletme bilgileri ve temel görünüm.</p></div></div><form id="menuSettings" class="form-grid">
      ${field("name", "İşletme adı", business.name, true)}${field("phone", "Telefon", business.phone)}${field("whatsapp", "WhatsApp", business.whatsapp)}${field("email", "E-posta", business.email, false, "email")}${field("address", "Adres", business.address, false, "textarea", "full")}${field("instagram", "Instagram", business.instagram)}${field("facebook", "Facebook", business.facebook)}
      ${selectField("language", "Dil", settings.language, [["tr","Türkçe"],["en","English"],["ar","العربية"]])}${selectField("currency", "Para birimi", settings.currency, [["TRY","TRY"],["EUR","EUR"],["USD","USD"],["TND","TND"]])}${field("primaryColor", "Ana renk", settings.primary_color, false, "color")}${field("secondaryColor", "İkinci renk", settings.secondary_color, false, "color")}
      <label class="switch-line">Fiyatları göster<input name="showPrices" type="checkbox"${settings.show_prices ? " checked" : ""}></label><label class="switch-line">Menü yayında<input name="published" type="checkbox"${settings.published ? " checked" : ""}></label>
      <div class="form-actions"><button class="button primary" type="submit">Ayarları kaydet</button></div></form></section>
      <section class="panel"><div class="panel-head"><div><h2>Kategoriler ve ürünler</h2><p>Fiyat, stok durumu, fotoğraf ve sıralamayı yönetin.</p></div><div class="category-actions"><button id="addCategory" class="button ghost">+ Kategori</button><button id="addProduct" class="button primary"${categories.length ? "" : " disabled"}>+ Ürün</button></div></div><div class="section-stack">${categoryHtml || '<div class="empty">Önce bir kategori ekleyin.</div>'}</div></section>`;
    $("menuSettings").addEventListener("submit", saveMenuSettings); $("addCategory").addEventListener("click", () => editCategory());
    $("addProduct").addEventListener("click", () => editProduct());
    document.querySelectorAll("[data-edit-category]").forEach((button) => button.addEventListener("click", () => editCategory(categories.find((item) => item.id === button.dataset.editCategory))));
    document.querySelectorAll("[data-delete-category]").forEach((button) => button.addEventListener("click", () => removeRecord("categories", button.dataset.deleteCategory, "Kategori ve içindeki ürünler silinsin mi?")));
    document.querySelectorAll("[data-edit-product]").forEach((button) => button.addEventListener("click", () => editProduct(products.find((item) => item.id === button.dataset.editProduct))));
    document.querySelectorAll("[data-delete-product]").forEach((button) => button.addEventListener("click", () => removeRecord("products", button.dataset.deleteProduct, "Ürün silinsin mi?")));
    document.querySelectorAll("[data-toggle-product]").forEach((button) => button.addEventListener("click", () => toggleProduct(products.find((item) => item.id === button.dataset.toggleProduct))));
  }

  function productCard(product) {
    return `<article class="item-card">${product.image ? `<img src="${esc(product.image)}" alt="">` : '<span class="image-placeholder">🍴</span>'}<div class="item-copy"><strong>${esc(product.name)}</strong><p>${esc(product.description)}</p><span class="price">${esc(product.price)} ${esc(state.menu.settings.currency)}</span><br><span class="status-pill${product.available ? "" : " off"}">${product.available ? "Mevcut" : "Tükendi"}</span></div><div class="card-actions"><button class="button ghost small" data-toggle-product="${product.id}">${product.available ? "Tükendi yap" : "Mevcut yap"}</button><button class="button ghost small" data-edit-product="${product.id}">Düzenle</button><button class="button danger small" data-delete-product="${product.id}">Sil</button></div></article>`;
  }

  async function saveMenuSettings(event) {
    event.preventDefault(); const form = event.currentTarget; const body = Object.fromEntries(new FormData(form)); body.showPrices = form.elements.showPrices.checked; body.published = form.elements.published.checked;
    await saveButton(form, () => api("/api/menu/settings", { method: "PUT", body: JSON.stringify(body) }), "Menü ayarları canlıda güncellendi."); state.me.business.name = body.name; $("businessName").textContent = body.name;
  }

  function editCategory(category = null) {
    openEditor(category ? "Kategoriyi düzenle" : "Kategori ekle", `<input type="hidden" name="id" value="${esc(category?.id || "")}">${field("name", "Kategori adı", category?.name || "", true)}${field("emoji", "Emoji", category?.emoji || "")}${field("description", "Açıklama", category?.description || "", false, "textarea", "full")}${field("sortOrder", "Sıra", category?.sort_order || 0, false, "number")}<label class="switch-line full">Aktif<input name="active" type="checkbox"${category?.active !== 0 ? " checked" : ""}></label>`, async (form) => {
      const body = Object.fromEntries(new FormData(form)); body.active = form.elements.active.checked; const recordId = body.id; delete body.id;
      await api(`/api/categories${recordId ? `/${recordId}` : ""}`, { method: recordId ? "PUT" : "POST", body: JSON.stringify(body) }); showNotice("Kategori kaydedildi."); await renderMenu();
    });
  }

  function editProduct(product = null) {
    const options = state.menu.categories.map((category) => [category.id, category.name]);
    openEditor(product ? "Ürünü düzenle" : "Ürün ekle", `<input type="hidden" name="id" value="${esc(product?.id || "")}">${selectField("categoryId", "Kategori", product?.category_id || options[0]?.[0], options)}${field("name", "Ürün adı", product?.name || "", true)}${field("description", "Açıklama", product?.description || "", false, "textarea", "full")}${field("price", "Fiyat", product?.price || 0, true, "number")}${field("sortOrder", "Sıra", product?.sort_order || 0, false, "number")}${field("image", "Fotoğraf URL", product?.image || "", false, "url", "full")}<label class="full">Yeni fotoğraf (JPG, PNG, WebP · max 5 MB)<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="switch-line">Mevcut<input name="available" type="checkbox"${product?.available !== 0 ? " checked" : ""}></label><label class="switch-line">Öne çıkan<input name="featured" type="checkbox"${product?.featured ? " checked" : ""}></label>`, async (form) => {
      const body = Object.fromEntries(new FormData(form)); const file = form.elements.imageFile.files[0]; if (file) body.image = (await uploadImage(file)).url; body.available = form.elements.available.checked; body.featured = form.elements.featured.checked; const recordId = body.id; delete body.id; delete body.imageFile;
      await api(`/api/products${recordId ? `/${recordId}` : ""}`, { method: recordId ? "PUT" : "POST", body: JSON.stringify(body) }); showNotice("Ürün kaydedildi ve canlı menü güncellendi."); await renderMenu();
    });
  }

  async function toggleProduct(product) { await api(`/api/products/${product.id}`, { method: "PUT", body: JSON.stringify({ available: !product.available }) }); showNotice("Ürün durumu güncellendi."); await renderMenu(); }

  async function renderWebsite() {
    state.website = await api("/api/website"); const { business, website, content, services, gallery } = state.website;
    $("content").innerHTML = `<section class="panel"><div class="panel-head"><div><h2>Web sitesi içeriği</h2><p>Şablon AuraDigital tarafından korunur; siz metin, iletişim ve görselleri değiştirirsiniz.</p></div><span class="status-pill">${website.status === "published" ? "Yayında" : "Taslak"}</span></div><form id="websiteForm" class="form-grid">
      ${field("businessName", "İşletme adı", business.name, true)}${field("heroTitle", "Ana başlık", content.hero_title)}${field("heroSubtitle", "Alt başlık", content.hero_subtitle, false, "textarea", "full")}${field("aboutTitle", "Hakkımızda başlığı", content.about_title)}${field("aboutText", "Hakkımızda metni", content.about_text, false, "textarea", "full")}${field("phone", "Telefon", content.phone)}${field("whatsapp", "WhatsApp", content.whatsapp)}${field("email", "E-posta", content.email, false, "email")}${field("address", "Adres", content.address, false, "textarea")}${field("openingHours", "Çalışma saatleri", content.opening_hours, false, "textarea")}${field("instagram", "Instagram", content.instagram)}${field("facebook", "Facebook", content.facebook)}${field("primaryCta", "Ana buton metni", content.primary_cta)}${field("secondaryCta", "İkinci buton metni", content.secondary_cta)}${field("primaryColor", "Ana renk", content.primary_color, false, "color")}${field("heroImage", "Kapak fotoğrafı URL", content.hero_image, false, "url")}${field("logoImage", "Logo URL", content.logo_image, false, "url")}<label>Yeni kapak fotoğrafı<input name="heroFile" type="file" accept="image/jpeg,image/png,image/webp"></label><label>Yeni logo<input name="logoFile" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="switch-line full">Web sitesi yayında<input name="published" type="checkbox"${website.status === "published" ? " checked" : ""}></label><div class="form-actions"><button class="button primary">Değişiklikleri yayınla</button></div></form></section>
      <section class="panel"><div class="panel-head"><div><h2>Hizmetler</h2><p>Sitenizde gösterilen hizmet veya teklifler.</p></div><button id="addService" class="button primary">+ Hizmet</button></div><div class="item-grid">${services.map(serviceCard).join("") || '<div class="empty">Henüz hizmet yok.</div>'}</div></section>
      <section class="panel"><div class="panel-head"><div><h2>Galeri</h2><p>İşletmenizi gösteren fotoğraflar.</p></div><button id="addGallery" class="button primary">+ Fotoğraf</button></div><div class="item-grid">${gallery.map(galleryCard).join("") || '<div class="empty">Henüz fotoğraf yok.</div>'}</div></section>`;
    $("websiteForm").addEventListener("submit", saveWebsite); $("addService").addEventListener("click", () => editService()); $("addGallery").addEventListener("click", () => editGallery());
    document.querySelectorAll("[data-edit-service]").forEach((button) => button.addEventListener("click", () => editService(services.find((item) => item.id === button.dataset.editService))));
    document.querySelectorAll("[data-delete-service]").forEach((button) => button.addEventListener("click", () => removeRecord("services", button.dataset.deleteService, "Hizmet silinsin mi?")));
    document.querySelectorAll("[data-edit-gallery]").forEach((button) => button.addEventListener("click", () => editGallery(gallery.find((item) => item.id === button.dataset.editGallery))));
    document.querySelectorAll("[data-delete-gallery]").forEach((button) => button.addEventListener("click", () => removeRecord("gallery", button.dataset.deleteGallery, "Fotoğraf galeriden silinsin mi?")));
  }

  function serviceCard(item) { return `<article class="item-card">${item.image ? `<img src="${esc(item.image)}" alt="">` : '<span class="image-placeholder">✦</span>'}<div class="item-copy"><strong>${esc(item.title)}</strong><p>${esc(item.description)}</p><span class="price">${esc(item.price)}</span></div><div class="card-actions"><button class="button ghost small" data-edit-service="${item.id}">Düzenle</button><button class="button danger small" data-delete-service="${item.id}">Sil</button></div></article>`; }
  function galleryCard(item) { return `<article class="item-card"><img src="${esc(item.image)}" alt=""><div class="item-copy"><strong>${esc(item.caption || "Galeri fotoğrafı")}</strong></div><div class="card-actions"><button class="button ghost small" data-edit-gallery="${item.id}">Düzenle</button><button class="button danger small" data-delete-gallery="${item.id}">Sil</button></div></article>`; }

  async function saveWebsite(event) {
    event.preventDefault(); const form = event.currentTarget; const body = Object.fromEntries(new FormData(form)); const hero = form.elements.heroFile.files[0], logo = form.elements.logoFile.files[0]; if (hero) body.heroImage = (await uploadImage(hero)).url; if (logo) body.logoImage = (await uploadImage(logo)).url; body.published = form.elements.published.checked; delete body.heroFile; delete body.logoFile;
    await saveButton(form, () => api("/api/website", { method: "PUT", body: JSON.stringify(body) }), "Web siteniz güncellendi."); state.me.business.name = body.businessName; $("businessName").textContent = body.businessName;
  }

  function editService(item = null) {
    openEditor(item ? "Hizmeti düzenle" : "Hizmet ekle", `<input type="hidden" name="id" value="${esc(item?.id || "")}">${field("title", "Başlık", item?.title || "", true)}${field("price", "Fiyat / kısa bilgi", item?.price || "")}${field("description", "Açıklama", item?.description || "", false, "textarea", "full")}${field("image", "Fotoğraf URL", item?.image || "", false, "url", "full")}<label class="full">Yeni fotoğraf<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"></label>${field("sortOrder", "Sıra", item?.sort_order || 0, false, "number")}<label class="switch-line">Aktif<input name="active" type="checkbox"${item?.active !== 0 ? " checked" : ""}></label>`, async (form) => {
      const body = Object.fromEntries(new FormData(form)); const file = form.elements.imageFile.files[0]; if (file) body.image = (await uploadImage(file)).url; body.active = form.elements.active.checked; const recordId = body.id; delete body.id; delete body.imageFile; await api(`/api/services${recordId ? `/${recordId}` : ""}`, { method: recordId ? "PUT" : "POST", body: JSON.stringify(body) }); showNotice("Hizmet kaydedildi."); await renderWebsite();
    });
  }

  function editGallery(item = null) {
    openEditor(item ? "Fotoğrafı düzenle" : "Galeriye ekle", `<input type="hidden" name="id" value="${esc(item?.id || "")}">${field("image", "Fotoğraf URL", item?.image || "", false, "url", "full")}<label class="full">Yeni fotoğraf<input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"></label>${field("caption", "Açıklama", item?.caption || "")}${field("sortOrder", "Sıra", item?.sort_order || 0, false, "number")}`, async (form) => {
      const body = Object.fromEntries(new FormData(form)); const file = form.elements.imageFile.files[0]; if (file) body.image = (await uploadImage(file)).url; if (!body.image) throw new Error("Bir fotoğraf yükleyin veya fotoğraf URL'si girin."); const recordId = body.id; delete body.id; delete body.imageFile; await api(`/api/gallery${recordId ? `/${recordId}` : ""}`, { method: recordId ? "PUT" : "POST", body: JSON.stringify(body) }); showNotice("Galeri güncellendi."); await renderWebsite();
    });
  }

  function renderAccount() {
    $("content").innerHTML = `<section class="panel"><div class="panel-head"><div><h2>Profil</h2><p>${esc(state.me.user.email)} · ${state.me.user.role === "customer_admin" ? "Müşteri yöneticisi" : "Müşteri editörü"}</p></div></div></section><section class="panel"><div class="panel-head"><div><h2>Şifre değiştir</h2><p>En az 12 karakter, bir harf ve bir sayı kullanın. Değişiklikten sonra yeniden giriş yaparsınız.</p></div></div><form id="passwordForm" class="form-grid">${field("currentPassword", "Mevcut şifre", "", true, "password")}${field("newPassword", "Yeni şifre", "", true, "password")}<div class="form-actions"><button class="button primary">Şifreyi değiştir</button></div></form></section>`;
    $("passwordForm").addEventListener("submit", async (event) => { event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget)); await saveButton(event.currentTarget, () => api("/api/account/password", { method: "PUT", body: JSON.stringify(body) }), "Şifre değişti. Yeniden giriş yapın."); setTimeout(() => location.reload(), 900); });
  }

  function field(name, label, value = "", required = false, type = "text", cls = "") { const textarea = type === "textarea"; return `<label class="${cls}">${esc(label)}${textarea ? `<textarea name="${name}"${required ? " required" : ""}>${esc(value)}</textarea>` : `<input name="${name}" type="${type}" value="${esc(value)}"${required ? " required" : ""}${type === "number" ? ' min="0" step="any"' : ""}>`}</label>`; }
  function selectField(name, label, value, options) { return `<label>${esc(label)}<select name="${name}">${options.map(([id, title]) => `<option value="${esc(id)}"${String(id) === String(value) ? " selected" : ""}>${esc(title)}</option>`).join("")}</select></label>`; }

  function openEditor(title, fields, onSave) {
    state.editor = onSave; $("dialogTitle").textContent = title; $("dialogFields").innerHTML = fields; const dialog = $("editorDialog"); dialog.showModal();
  }

  async function uploadImage(file) {
    if (file.size > 5 * 1024 * 1024) throw new Error("Fotoğraf 5 MB veya daha küçük olmalı.");
    return api("/api/uploads", { method: "POST", body: file, headers: { "Content-Type": file.type, "X-File-Name": file.name } });
  }

  async function removeRecord(resource, id, question) { if (!confirm(question)) return; try { await api(`/api/${resource}/${id}`, { method: "DELETE" }); showNotice("Silindi."); await openView(state.view); } catch (error) { showNotice(error.message, true); } }
  async function saveButton(form, action, message) { const button = form.querySelector("button[type=submit],button:not([type])"); if (button) button.disabled = true; try { await action(); showNotice(message); } catch (error) { showNotice(error.message, true); throw error; } finally { if (button) button.disabled = false; } }

  $("loginForm").addEventListener("submit", async (event) => { event.preventDefault(); const button = event.currentTarget.querySelector("button"); button.disabled = true; $("loginNotice").textContent = "Giriş yapılıyor…"; try { await api("/api/customer/login", { method: "POST", body: JSON.stringify({ email: $("loginEmail").value, password: $("loginPassword").value }) }); state.me = await api("/api/me"); showApp(); } catch (error) { $("loginNotice").className = "notice error"; $("loginNotice").textContent = error.message; } finally { button.disabled = false; } });
  $("logoutButton").addEventListener("click", async () => { await api("/api/customer/logout", { method: "POST" }).catch(() => {}); location.reload(); });
  $("mobileNav").addEventListener("change", (event) => openView(event.target.value));
  $("editorForm").addEventListener("submit", async (event) => { event.preventDefault(); if (!state.editor) return; $("dialogSave").disabled = true; try { await state.editor(event.currentTarget); $("editorDialog").close(); } catch (error) { showNotice(error.message, true); } finally { $("dialogSave").disabled = false; } });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => $("editorDialog").close()));
  boot();
})();
