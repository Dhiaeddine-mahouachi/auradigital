(() => {
  const form = document.getElementById("popBuilder");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const linkList = $("linkList");
  const previewLinks = $("previewLinks");
  const previewCard = $("previewCard");
  const previewAvatar = $("previewAvatar");
  const statusEl = $("builderStatus");
  const activation = $("activationPanel");
  const STORAGE_KEY = "aurapops:draft:v1";

  const presets = {
    website: ["Website", "↗"],
    menu: ["Menu", "☰"],
    instagram: ["Instagram", "IG"],
    facebook: ["Facebook", "f"],
    tiktok: ["TikTok", "♪"],
    whatsapp: ["WhatsApp", "WA"],
    maps: ["Google Maps", "⌖"],
    custom: ["Link", "↗"],
    snake: ["Play Snake", "S"],
    tetris: ["Play Tetris", "T"],
  };

  const state = {
    id: "",
    token: "",
    slug: "",
    links: [],
    avatarData: undefined,
    backgroundData: undefined,
    avatarObjectUrl: "",
    backgroundObjectUrl: "",
    status: "pending",
    paymentStatus: "unpaid",
  };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  }

  function slug(value) {
    return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,54);
  }

  function isGame(type) {
    return type === "snake" || type === "tetris";
  }

  function defaultUrl() {
    return "";
  }

  function setNotice(message, kind = "") {
    statusEl.textContent = message;
    statusEl.className = "pop-builder-status" + (kind ? " " + kind : "");
  }

  function revokeUrl(key) {
    if (state[key]) URL.revokeObjectURL(state[key]);
    state[key] = "";
  }

  async function fileData(file) {
    if (!file) return "";
    if (file.size > 420 * 1024) throw new Error("Image must be smaller than 420 KB.");
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) throw new Error("Use JPG, PNG or WebP.");
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
  }

  function addItem(type, label, url) {
    if (state.links.length >= 12) return setNotice("You can add up to 12 items.", "error");
    const preset = presets[type] || presets.custom;
    state.links.push({
      type,
      label: label || preset[0],
      url: isGame(type) ? "" : (url || defaultUrl(type)),
    });
    renderLinks();
    renderPreview();
  }

  function renderLinks() {
    if (!state.links.length) {
      linkList.innerHTML = '<div class="pop-preview-empty">No items yet. Choose something above and add it.</div>';
      return;
    }
    linkList.innerHTML = state.links.map((item, index) => `
      <div class="pop-link-row" data-index="${index}">
        <select class="pop-link-type" aria-label="Item type">
          ${Object.keys(presets).map(type => `<option value="${type}" ${type === item.type ? "selected" : ""}>${esc(presets[type][0])}</option>`).join("")}
        </select>
        <input class="pop-link-label" maxlength="60" value="${esc(item.label)}" aria-label="Button label" />
        ${isGame(item.type)
          ? '<input class="pop-link-url" value="Runs inside AuraPop" disabled aria-label="Game runs inside AuraPop" />'
          : `<input class="pop-link-url" maxlength="1000" value="${esc(item.url)}" placeholder="https://..." aria-label="Link URL" />`}
        <button class="pop-remove" type="button" aria-label="Remove item">×</button>
      </div>
    `).join("");

    linkList.querySelectorAll(".pop-link-row").forEach(row => {
      const index = Number(row.dataset.index);
      row.querySelector(".pop-link-type").addEventListener("change", event => {
        const type = event.target.value;
        state.links[index].type = type;
        state.links[index].label = presets[type][0];
        state.links[index].url = isGame(type) ? "" : defaultUrl(type);
        renderLinks();
        renderPreview();
      });
      row.querySelector(".pop-link-label").addEventListener("input", event => {
        state.links[index].label = event.target.value;
        renderPreview();
      });
      row.querySelector(".pop-link-url")?.addEventListener("input", event => {
        if (!isGame(state.links[index].type)) state.links[index].url = event.target.value;
      });
      row.querySelector(".pop-remove").addEventListener("click", () => {
        state.links.splice(index,1);
        renderLinks();
        renderPreview();
      });
    });
  }

  function icon(type) {
    return presets[type]?.[1] || "↗";
  }

  function renderPreview() {
    const data = new FormData(form);
    const title = String(data.get("title") || "Your Business");
    const subtitle = String(data.get("subtitle") || "");
    const bgMode = String(data.get("backgroundMode") || "color");
    const bgColor = String(data.get("backgroundColor") || "#0b1610");
    const cardColor = String(data.get("cardColor") || "#111a16");
    const textColor = String(data.get("textColor") || "#ffffff");
    const accentColor = String(data.get("accentColor") || "#e1e100");

    $("previewTitle").textContent = title;
    $("previewSubtitle").textContent = subtitle;
    previewCard.style.setProperty("--pop-bg", bgColor);
    previewCard.style.setProperty("--pop-card", cardColor);
    previewCard.style.setProperty("--pop-text", textColor);
    previewCard.style.setProperty("--pop-accent", accentColor);

    const background = state.backgroundObjectUrl;
    previewCard.style.backgroundImage = bgMode === "image" && background
      ? `linear-gradient(rgba(2,8,4,.15),rgba(2,8,4,.46)),url("${background}")`
      : "none";
    previewCard.style.backgroundColor = bgColor;

    if (state.avatarObjectUrl) {
      previewAvatar.innerHTML = `<img src="${state.avatarObjectUrl}" alt="" />`;
    } else {
      const initials = title.split(/\s+/).filter(Boolean).slice(0,2).map(word => word[0]).join("").toUpperCase() || "AP";
      previewAvatar.innerHTML = `<span>${esc(initials)}</span>`;
    }

    previewLinks.innerHTML = state.links.length
      ? state.links.map(item => `<div class="pop-preview-link"><i>${esc(icon(item.type))}</i><span>${esc(item.label || presets[item.type]?.[0] || "Open")}</span></div>`).join("")
      : '<div class="pop-preview-empty">Add links, maps, a menu or a game.</div>';
  }

  async function protectedImage(url) {
    if (!url || !state.token) return "";
    const response = await fetch(url,{headers:{"X-Aura-Pop-Token":state.token}});
    if (!response.ok) return "";
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  function activationUi(pop) {
    if (!pop?.publicUrl) return;
    activation.classList.add("is-visible");
    $("publicLink").textContent = pop.publicUrl;
    $("publicLink").href = pop.publicUrl;
    $("popQr").src = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=0&data=" + encodeURIComponent(pop.publicUrl);
    const active = pop.status === "approved" && pop.paymentStatus === "paid";
    $("activationStatus").textContent = active ? "Active" : pop.paymentStatus === "paid" ? "Payment confirmed" : "Awaiting activation";
    $("activationStatus").classList.toggle("active",active);
    $("activationText").textContent = active
      ? "Your AuraPop is live. The QR can now be shared."
      : pop.paymentStatus === "paid"
        ? "Payment is confirmed. AuraDigital approval will make the QR live."
        : "Complete payment and approval to make it live.";
  }

  async function restore() {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { saved = null; }
    if (!saved?.id || !saved?.token) return;
    state.id = saved.id;
    state.token = saved.token;
    try {
      const response = await fetch("/api/aurapops/" + encodeURIComponent(state.id),{headers:{"X-Aura-Pop-Token":state.token}});
      if (!response.ok) throw new Error("expired");
      const data = await response.json();
      const pop = data.pop;
      state.slug = pop.slug;
      state.status = pop.status;
      state.paymentStatus = pop.paymentStatus;
      state.links = Array.isArray(pop.links) ? pop.links : [];

      form.elements.title.value = pop.title || "";
      form.elements.slug.value = pop.slug || "";
      form.elements.slug.readOnly = true;
      form.elements.subtitle.value = pop.subtitle || "";
      form.elements.backgroundColor.value = pop.backgroundColor || "#0b1610";
      form.elements.cardColor.value = pop.cardColor || "#111a16";
      form.elements.textColor.value = pop.textColor || "#ffffff";
      form.elements.accentColor.value = pop.accentColor || "#e1e100";
      [...form.elements.backgroundMode].forEach(input => { input.checked = input.value === pop.backgroundMode; });
      $("backgroundUploadWrap").hidden = pop.backgroundMode !== "image";
      $("savePop").textContent = "Save AuraPop changes";
      $("newPop").hidden = false;

      revokeUrl("avatarObjectUrl");
      revokeUrl("backgroundObjectUrl");
      state.avatarObjectUrl = await protectedImage(pop.avatarUrl);
      state.backgroundObjectUrl = await protectedImage(pop.backgroundImageUrl);

      renderLinks();
      renderPreview();
      activationUi(pop);
      setNotice("Draft restored.", "success");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      state.id = "";
      state.token = "";
    }
  }

  function validateLinks() {
    for (let i = 0; i < state.links.length; i++) {
      const item = state.links[i];
      if (isGame(item.type)) continue;
      const value = String(item.url || "").trim();
      let parsed;
      try { parsed = new URL(value); } catch { parsed = null; }
      if (!parsed || !["http:","https:","mailto:","tel:"].includes(parsed.protocol)) {
        const row = linkList.querySelector(`[data-index="${i}"]`);
        row?.querySelector(".pop-link-url")?.focus();
        throw new Error(`Add a valid link for "${item.label || presets[item.type]?.[0] || "this item"}".`);
      }
    }
  }

  function payload() {
    const data = new FormData(form);
    const body = {
      title: String(data.get("title") || "").trim(),
      subtitle: String(data.get("subtitle") || "").trim(),
      backgroundMode: String(data.get("backgroundMode") || "color"),
      backgroundColor: String(data.get("backgroundColor") || "#0b1610"),
      cardColor: String(data.get("cardColor") || "#111a16"),
      textColor: String(data.get("textColor") || "#ffffff"),
      accentColor: String(data.get("accentColor") || "#e1e100"),
      links: state.links.map(item => ({type:item.type,label:String(item.label || "").trim(),url:String(item.url || "").trim()})),
    };
    if (!state.id) body.slug = slug(data.get("slug") || data.get("title"));
    if (state.avatarData !== undefined) body.avatarData = state.avatarData;
    if (state.backgroundData !== undefined) body.backgroundData = state.backgroundData;
    return body;
  }

  $("addLink").addEventListener("click", () => addItem($("linkPreset").value));
  form.addEventListener("input", event => {
    if (event.target.name === "title" && !state.id && !form.elements.slug.dataset.touched) {
      form.elements.slug.value = slug(event.target.value);
    }
    renderPreview();
  });
  form.elements.slug.addEventListener("input", event => {
    event.target.dataset.touched = "1";
    event.target.value = slug(event.target.value);
  });
  form.querySelectorAll('input[name="backgroundMode"]').forEach(input => input.addEventListener("change", () => {
    $("backgroundUploadWrap").hidden = input.value !== "image" || !input.checked;
    renderPreview();
  }));

  $("avatarInput").addEventListener("change", async event => {
    try {
      state.avatarData = await fileData(event.target.files?.[0]);
      revokeUrl("avatarObjectUrl");
      if (event.target.files?.[0]) state.avatarObjectUrl = URL.createObjectURL(event.target.files[0]);
      renderPreview();
    } catch (error) {
      event.target.value = "";
      setNotice(error.message,"error");
    }
  });

  $("backgroundInput").addEventListener("change", async event => {
    try {
      state.backgroundData = await fileData(event.target.files?.[0]);
      revokeUrl("backgroundObjectUrl");
      if (event.target.files?.[0]) state.backgroundObjectUrl = URL.createObjectURL(event.target.files[0]);
      renderPreview();
    } catch (error) {
      event.target.value = "";
      setNotice(error.message,"error");
    }
  });

  $("newPop").addEventListener("click", () => {
    if (!confirm("Start a new AuraPop? Your existing AuraPop stays saved and active according to its current status.")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = $("savePop");
    button.disabled = true;
    setNotice(state.id ? "Saving changes…" : "Preparing your AuraPop…");
    try {
      validateLinks();
      const options = {
        method: state.id ? "PATCH" : "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(payload()),
      };
      if (state.id) options.headers["X-Aura-Pop-Token"] = state.token;
      const response = await fetch(state.id ? "/api/aurapops/" + encodeURIComponent(state.id) : "/api/aurapops", options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save AuraPop.");

      if (!state.id) {
        state.id = data.pop.id;
        state.token = data.token;
        state.slug = data.pop.slug;
        localStorage.setItem(STORAGE_KEY,JSON.stringify({id:state.id,token:state.token}));
        form.elements.slug.value = state.slug;
        form.elements.slug.readOnly = true;
        $("newPop").hidden = false;
        $("savePop").textContent = "Save AuraPop changes";
      }

      state.avatarData = undefined;
      state.backgroundData = undefined;
      state.status = data.pop.status;
      state.paymentStatus = data.pop.paymentStatus;
      activationUi(data.pop);
      setNotice(state.id ? "Saved. Your QR is ready." : "AuraPop prepared.", "success");
      activation.scrollIntoView({behavior:"smooth",block:"nearest"});
    } catch (error) {
      setNotice(error.message,"error");
    } finally {
      button.disabled = false;
    }
  });

  renderLinks();
  renderPreview();
  restore();
})();