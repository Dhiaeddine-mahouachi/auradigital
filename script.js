const AURA = {
  email: "info@auradigital.ink",
  domain: "auradigital.ink",
  whatsapp: "905385507674",
};
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo(0, 0);
addEventListener(
  "pageshow",
  () => requestAnimationFrame(() => scrollTo(0, 0)),
  { once: true },
);
const page = document.body.dataset.page || "home";
const pages = [
  ["home", "index.html", "Ana Sayfa"],
  ["services", "services.html", "Hizmetler"],
  ["portfolio", "portfolio.html", "Portfolio"],
  ["auramenu", "aura-menu.html", "AuraMenu"],
  ["packages", "packages.html", "Paketler"],
  ["about", "about.html", "Hakkımızda"],
];
const header = document.getElementById("siteHeader");
if (header) {
  header.className = "site-header";
  header.innerHTML = `<div class="container nav"><a class="brand brand-wordmark" href="index.html" aria-label="AuraDigital ana sayfa"><img class="brand-logo" src="logo.svg" alt="" aria-hidden="true"><strong>auradigital</strong></a><div class="nav-links" id="navLinks">${pages
    .map(
      ([id, href, label]) =>
        `<a class="${page === id ? "active" : ""}" href="${href}">${label}</a>`,
    )
    .join(
      "",
    )}</div><div class="lang-switcher"><button class="lang-current" type="button" aria-label="Dil" aria-expanded="false"><span class="lang-globe">◎</span><span class="lang-current-label">TR</span><span class="lang-chevron">⌄</span></button><div class="lang-menu"><button type="button" data-lang="tr"><span>🇹🇷</span> Türkçe</button><button type="button" data-lang="en"><span>🇬🇧</span> English</button><button type="button" data-lang="ar"><span>🇸🇦</span> العربية</button></div></div><a class="nav-cta" href="contact.html">Projenizi Konuşalım <span>↗</span></a><button class="menu-btn" id="menuBtn" aria-label="Menüyü aç" aria-expanded="false">☰</button></div>`;
}
const footer = document.getElementById("siteFooter");
if (footer) {
  footer.className = "site-footer";
  footer.innerHTML = `<div class="container"><div class="footer-top"><div><a class="brand brand-wordmark footer-wordmark" href="index.html"><img class="brand-logo" src="logo.svg" alt="" aria-hidden="true"><strong>auradigital</strong></a><p class="footer-blurb">Web tasarımından reklam yönetimine, NFC deneyimlerinden AuraMenu'ye kadar markanızın dijital sistemini tek bir profesyonel ekip gibi kuruyoruz.</p></div><div class="footer-col"><h4>Hizmetler</h4><a href="services.html">Web & Growth</a><a href="nfc.html">NFC Kartlar</a><a href="aura-menu.html">AuraMenu</a><a href="packages.html">Abonelikler</a></div><div class="footer-col"><h4>Şirket</h4><a href="portfolio.html">Portfolio</a><a href="about.html">Hakkımızda</a><a href="contact.html">İletişim</a><a href="packages.html#faq">Sık Sorulanlar</a></div><div class="footer-col"><h4>Başlayalım</h4><a href="https://wa.me/${AURA.whatsapp}" target="_blank" rel="noopener">WhatsApp · +90 538 550 76 74</a><a href="mailto:${AURA.email}">Email · ${AURA.email}</a><a href="https://${AURA.domain}" target="_blank" rel="noopener">${AURA.domain}</a></div></div><div class="footer-bottom"><span>© 2026 AuraDigital. Tüm hakları saklıdır.</span><span>İstanbul · Türkiye</span></div></div>`;
}
document.body.insertAdjacentHTML(
  "afterbegin",
  '<div class="scroll-progress" aria-hidden="true"><i></i></div><div class="page-wipe" aria-hidden="true"></div><div class="motion-orb" aria-hidden="true"></div>',
);
requestAnimationFrame(() => document.body.classList.add("is-ready"));
const progressBar = document.querySelector(".scroll-progress i");
const onScroll = () => {
  header?.classList.toggle("scrolled", scrollY > 24);
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  progressBar?.style.setProperty("--progress", p);
};
onScroll();
addEventListener("scroll", onScroll, { passive: true });
const menuBtn = document.getElementById("menuBtn"),
  navLinks = document.getElementById("navLinks");
menuBtn?.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "×" : "☰";
});
const langCurrent = document.querySelector(".lang-current"),
  langMenu = document.querySelector(".lang-menu");
langCurrent?.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = langMenu.classList.toggle("open");
  langCurrent.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".lang-switcher")) {
    langMenu?.classList.remove("open");
    langCurrent?.setAttribute("aria-expanded", "false");
  }
});
document
  .querySelectorAll(".services-grid,.pricing-grid,.detail-grid,.process")
  .forEach((group) =>
    group
      .querySelectorAll(".reveal")
      .forEach((el, i) =>
        el.style.setProperty("--reveal-delay", `${i * 65}ms`),
      ),
  );
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObserver.unobserve(e.target);
      }
    }),
  { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
);
document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));
const metricObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / 950);
        el.textContent = String(
          Math.round(target * (1 - Math.pow(1 - progress, 3))),
        );
        if (progress < 1) requestAnimationFrame(tick);
      };
      el.textContent = "0";
      requestAnimationFrame(tick);
      metricObserver.unobserve(el);
    }),
  { threshold: 0.6 },
);
document
  .querySelectorAll("[data-count]")
  .forEach((el) => metricObserver.observe(el));
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addEventListener(
    "scroll",
    () =>
      document.querySelectorAll(".parallax").forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate3d(0,${(innerHeight / 2 - r.top) * 0.025}px,0)`;
      }),
    { passive: true },
  );
}
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const precisePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
if (!reducedMotion && precisePointer) {
  document.body.classList.add("has-pointer");
  const orb = document.querySelector(".motion-orb");
  addEventListener(
    "pointermove",
    (e) => {
      orb?.style.setProperty("--orb-x", `${e.clientX}px`);
      orb?.style.setProperty("--orb-y", `${e.clientY}px`);
    },
    { passive: true },
  );
  document
    .querySelectorAll(
      ".service-card,.price-card,.detail-card,.feature-panel,.contact-card,.contact-form",
    )
    .forEach((card) => {
      card.classList.add("tilt-card");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect(),
          x = (e.clientX - r.left) / r.width,
          y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.setProperty("--rx", `${(0.5 - y) * 4}deg`);
        card.style.setProperty("--ry", `${(x - 0.5) * 5}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  document.querySelectorAll(".btn,.nav-cta").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect(),
        x = (e.clientX - (r.left + r.width / 2)) * 0.08,
        y = (e.clientY - (r.top + r.height / 2)) * 0.12;
      btn.style.transform = `translate3d(${x}px,${y}px,0)`;
    });
    btn.addEventListener("pointerleave", () =>
      btn.style.removeProperty("transform"),
    );
  });
}
document.querySelectorAll("[data-price-mode]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("[data-price-mode]")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.priceMode;
    document
      .querySelectorAll("[data-monthly][data-weekly]")
      .forEach(
        (el) =>
          (el.textContent =
            mode === "weekly" ? el.dataset.weekly : el.dataset.monthly),
      );
    document
      .querySelectorAll("[data-period]")
      .forEach(
        (el) =>
          (el.textContent =
            window.AuraI18n?.period(mode) ||
            (mode === "weekly" ? "/ hafta" : "/ ay")),
      );
  }),
);
const form = document.querySelector("[data-contact-form]");
if (form) {
  const design = new URLSearchParams(location.search).get("design");
  if (design) {
    const service = form.querySelector('[name="service"]');
    const message = form.querySelector('[name="message"]');
    if (service) service.value = "AuraMenu";
    if (message && !message.value)
      message.value = `AuraMenu design: ${design.replaceAll("-", " ")}`;
  }
}
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const body = encodeURIComponent(
    `Merhaba AuraDigital 👋\n\nAd / İşletme: ${fd.get("name")}\nTelefon: ${fd.get("phone")}\nHizmet: ${fd.get("service")}\n\nProje / Mesaj:\n${fd.get("message")}`,
  );
  location.href = `https://wa.me/${AURA.whatsapp}?text=${body}`;
});

/* COOKIE CONSENT */
const consentKey = "aura-cookie-choice-v2";
const readConsent = () => {
  try {
    return localStorage.getItem(consentKey);
  } catch {
    return null;
  }
};
const saveConsent = (choice) => {
  try {
    localStorage.setItem(consentKey, choice);
  } catch {}
  if (location.protocol !== "file:") {
    document.cookie = `aura_consent=${choice}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }
};
document.body.insertAdjacentHTML(
  "beforeend",
  `<aside class="cookie-consent" id="cookieConsent" aria-label="Çerez tercihleri" aria-hidden="true">
    <div class="cookie-copy"><span class="cookie-icon">◉</span><div><strong>Çerez tercihleri</strong><p>Daha iyi bir site deneyimi için gerekli depolamayı ve, izin verirseniz, gelecekteki performans ölçümlerini kullanabiliriz. Tercihinizi istediğiniz zaman değiştirebilirsiniz.</p></div></div>
    <div class="cookie-actions"><button class="btn btn-primary" type="button" data-cookie="all">Tümünü kabul et</button><button class="btn cookie-necessary" type="button" data-cookie="necessary">Sadece gerekli</button><button class="btn cookie-reject" type="button" data-cookie="reject">Hepsini reddet</button></div>
  </aside>`,
);
const cookieConsent = document.getElementById("cookieConsent");
const openCookieConsent = () => {
  cookieConsent?.classList.add("show");
  cookieConsent?.setAttribute("aria-hidden", "false");
};
const closeCookieConsent = () => {
  cookieConsent?.classList.remove("show");
  cookieConsent?.setAttribute("aria-hidden", "true");
};
if (!readConsent()) setTimeout(openCookieConsent, 650);
cookieConsent?.addEventListener("click", (e) => {
  const choice = e.target.closest("[data-cookie]")?.dataset.cookie;
  if (!choice) return;
  saveConsent(choice);
  closeCookieConsent();
});
const footerBottom = document.querySelector(".footer-bottom");
if (footerBottom) {
  const settings = document.createElement("button");
  settings.type = "button";
  settings.className = "cookie-settings-link";
  settings.textContent = "Çerez ayarları";
  settings.addEventListener("click", openCookieConsent);
  footerBottom.appendChild(settings);
}

/* AURA FAQ CHAT */
const chatCopy = {
  tr: {
    intro:
      "Merhaba 👋 Ben Aura Assistant. Web, NFC, AuraMenu, paketler veya fiyatlar hakkında kısa soruları yanıtlayabilirim.",
    web: "Web sitesi projeleri tek sayfa için 5.000 TL'den, çok sayfalı siteler için 8.000 TL'den ve dinamik projeler için 12.000 TL'den başlıyor. Kesin fiyat kapsamdan sonra netleşir.",
    menu: "AuraMenu restoran ve kafeler için mobil dijital menü sistemimizdir. 4 farklı tasarım yönünü inceleyebilir, beğendiğinizi markanıza uyarlatabilirsiniz. Kurulum 2.500 TL'den başlar.",
    nfc: "Standart NFC kartlar 700 TL'den başlar. Google yorumları, AuraMenu, sosyal medya, iletişim bilgileri veya özel bir sayfaya tek dokunuşla yönlendirebilir.",
    package:
      "Aylık paketler 3.590 TL'den başlıyor ve sosyal medya, reklam, içerik, web desteği ve optimizasyon seviyesine göre büyüyor. Paketler sayfasında 4 seviye var.",
    portfolio:
      "Seçili çalışmalarımız arasında Mutlu Nakliyat, Erhan Oto, Fifty ve Decoration Gateaux var. Portfolio sayfasından proje sunumlarını görebilirsiniz.",
    language:
      "AuraDigital sitesi Türkçe, İngilizce ve Arapça kullanılabilir. AuraMenu projelerine de ihtiyaca göre çoklu dil eklenebilir.",
    contact:
      "Tabii. Projenizi doğrudan AuraDigital'e WhatsApp üzerinden gönderebilirsiniz. Mesajınız +90 538 550 76 74 numarasına yönlendirilir.",
    fallback:
      "Bu sorunun kısa cevabı bende yok. İsterseniz sorunuzu AuraDigital'e gönderebilirsiniz; ekip kapsamı sizinle netleştirir.",
    send: "AuraDigital'e gönder",
    contactBtn: "İletişime geç",
  },
  en: {
    intro:
      "Hi 👋 I'm Aura Assistant. I can answer quick questions about websites, NFC, AuraMenu, packages and pricing.",
    web: "Website projects start at 5,000 TL for one-page sites, 8,000 TL for multi-page sites and 12,000 TL for dynamic projects. Final pricing depends on scope.",
    menu: "AuraMenu is our mobile digital menu system for restaurants and cafés. You can browse 4 design directions and adapt your favorite to your brand. Setup starts at 2,500 TL.",
    nfc: "Standard NFC cards start at 700 TL. One tap can open Google Reviews, AuraMenu, social profiles, contact details or a custom page.",
    package:
      "Monthly packages start at 3,590 TL and scale with social media, ads, content, web support and optimization. There are 4 levels on the Packages page.",
    portfolio:
      "Selected work includes Mutlu Nakliyat, Erhan Oto, Fifty and Decoration Gateaux. Visit Portfolio to see the project presentations.",
    language:
      "AuraDigital is available in Turkish, English and Arabic. AuraMenu projects can also support multiple languages when needed.",
    contact:
      "Of course. You can send your project directly to AuraDigital on WhatsApp. Your message will be directed to +90 538 550 76 74.",
    fallback:
      "I don't have a short answer for that yet. You can send the question to AuraDigital and the team can clarify the scope with you.",
    send: "Send to AuraDigital",
    contactBtn: "Contact us",
  },
  ar: {
    intro:
      "مرحباً 👋 أنا Aura Assistant. يمكنني الإجابة عن أسئلة سريعة حول المواقع وNFC وAuraMenu والباقات والأسعار.",
    web: "تبدأ مشاريع المواقع من 5,000 TL للصفحة الواحدة، و8,000 TL للمواقع متعددة الصفحات، و12,000 TL للمشاريع الديناميكية. السعر النهائي يعتمد على النطاق.",
    menu: "AuraMenu هو نظام القوائم الرقمية للمطاعم والمقاهي. يمكنك استعراض 4 اتجاهات تصميم وتخصيص التصميم الذي يعجبك لعلامتك. يبدأ الإعداد من 2,500 TL.",
    nfc: "تبدأ بطاقات NFC القياسية من 700 TL. بلمسة واحدة يمكن فتح تقييمات Google أو AuraMenu أو حسابات التواصل أو بيانات الاتصال أو صفحة مخصصة.",
    package:
      "تبدأ الباقات الشهرية من 3,590 TL وتتوسع حسب إدارة التواصل والإعلانات والمحتوى ودعم الموقع والتحسين. توجد 4 مستويات في صفحة الباقات.",
    portfolio:
      "من أعمالنا المختارة Mutlu Nakliyat وErhan Oto وFifty وDecoration Gateaux. يمكنك مشاهدة المشاريع في صفحة أعمالنا.",
    language:
      "موقع AuraDigital متاح بالتركية والإنجليزية والعربية، ويمكن أيضاً إضافة عدة لغات إلى مشاريع AuraMenu حسب الحاجة.",
    contact:
      "بالتأكيد. يمكنك إرسال مشروعك مباشرة إلى AuraDigital عبر WhatsApp على الرقم +90 538 550 76 74.",
    fallback:
      "لا أملك إجابة مختصرة لهذا السؤال حالياً. يمكنك إرسال سؤالك إلى AuraDigital وسيوضح الفريق التفاصيل معك.",
    send: "أرسل إلى AuraDigital",
    contactBtn: "تواصل معنا",
  },
};
const chatLang = () =>
  document.documentElement.lang === "ar"
    ? "ar"
    : document.documentElement.lang === "en"
      ? "en"
      : "tr";
const getChatCopy = () => chatCopy[chatLang()];
document.body.insertAdjacentHTML(
  "beforeend",
  `<button class="chat-launcher" id="chatLauncher" type="button" aria-label="Aura Assistant" aria-expanded="false"><span class="chat-launcher-icon">✦</span><span class="chat-dot"></span></button>
   <aside class="chat-panel" id="chatPanel" aria-label="Aura Assistant" aria-hidden="true">
    <div class="chat-head"><div class="chat-avatar">A</div><div><strong>Aura Assistant</strong><span><i></i> Online · Quick answers</span></div><button class="chat-close" type="button" aria-label="Sohbeti kapat">×</button></div>
    <div class="chat-messages" id="chatMessages"></div>
    <div class="chat-quick" id="chatQuick"><button data-question="web">Web</button><button data-question="menu">AuraMenu</button><button data-question="nfc">NFC</button><button data-question="package">Paketler</button><button data-question="portfolio">Portfolio</button><button data-question="contact">İletişim</button></div>
    <form class="chat-form" id="chatForm"><input id="chatInput" autocomplete="off" maxlength="240" placeholder="Sorunuzu yazın…" aria-label="Sorunuzu yazın" /><button type="submit" aria-label="Gönder">↗</button></form>
   </aside>`,
);
const chatLauncher = document.getElementById("chatLauncher");
const chatPanel = document.getElementById("chatPanel");
const chatMessages = document.getElementById("chatMessages");
const chatQuick = document.getElementById("chatQuick");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
let chatStarted = false;
let lastQuestion = "";
const addChatMessage = (text, role = "bot", actions = false) => {
  const bubble = document.createElement("div");
  bubble.className = `chat-message ${role}`;
  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);
  if (actions) {
    const row = document.createElement("div");
    row.className = "chat-actions";
    const contactLink = document.createElement("a");
    contactLink.href = `contact.html?lang=${chatLang()}`;
    contactLink.textContent = getChatCopy().contactBtn;
    const mailLink = document.createElement("a");
    const body = encodeURIComponent(
      `Merhaba AuraDigital 👋\n\nWebsite chatbot sorusu:\n${lastQuestion || "Daha fazla bilgi almak istiyorum."}`,
    );
    mailLink.href = `https://wa.me/${AURA.whatsapp}?text=${body}`;
    mailLink.target = "_blank";
    mailLink.rel = "noopener";
    mailLink.textContent = getChatCopy().send;
    row.append(contactLink, mailLink);
    bubble.appendChild(row);
  }
  chatMessages?.appendChild(bubble);
  chatMessages?.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth",
  });
};
const classifyQuestion = (raw) => {
  const q = raw.toLocaleLowerCase("tr-TR");
  if (/auramenu|qr|menü|menu|restaurant|restoran|مطعم|قائمة/.test(q))
    return "menu";
  if (/nfc|kart|card|بطاق/.test(q)) return "nfc";
  if (/paket|package|abonelik|monthly|aylık|باقة|اشتراك/.test(q))
    return "package";
  if (/portfolio|proje|project|mutlu|erhan|fifty|gateaux|أعمال|مشروع/.test(q))
    return "portfolio";
  if (/dil|language|english|arabic|turkish|türk|arap|لغة|عربي/.test(q))
    return "language";
  if (/iletişim|contact|email|mail|ulaş|teklif|quote|تواصل|بريد|عرض/.test(q))
    return "contact";
  if (/web|website|site|landing|fiyat|price|cost|ücret|موقع|سعر/.test(q))
    return "web";
  return "fallback";
};
const answerChat = (key, raw = "") => {
  if (raw) lastQuestion = raw;
  const copy = getChatCopy();
  addChatMessage(
    copy[key] || copy.fallback,
    "bot",
    key === "contact" || key === "fallback",
  );
};
const openChat = () => {
  chatPanel?.classList.add("open");
  chatPanel?.setAttribute("aria-hidden", "false");
  chatLauncher?.setAttribute("aria-expanded", "true");
  if (!chatStarted) {
    addChatMessage(getChatCopy().intro);
    chatStarted = true;
  }
  setTimeout(() => chatInput?.focus(), 180);
};
const closeChat = () => {
  chatPanel?.classList.remove("open");
  chatPanel?.setAttribute("aria-hidden", "true");
  chatLauncher?.setAttribute("aria-expanded", "false");
};
chatLauncher?.addEventListener("click", () =>
  chatPanel?.classList.contains("open") ? closeChat() : openChat(),
);
chatPanel?.querySelector(".chat-close")?.addEventListener("click", closeChat);
chatQuick?.addEventListener("click", (e) => {
  const key = e.target.closest("[data-question]")?.dataset.question;
  if (!key) return;
  answerChat(key);
});
chatForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = chatInput?.value.trim();
  if (!value) return;
  addChatMessage(value, "user");
  chatInput.value = "";
  setTimeout(() => answerChat(classifyQuestion(value), value), 260);
});
const i18nScript = document.createElement("script");
i18nScript.src = "i18n.js";
document.head.appendChild(i18nScript);


// AuraDigital aggregate analytics: stores only page + day + view count.
if (!location.pathname.startsWith("/admin")) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: location.pathname }),
    keepalive: true,
  }).catch(() => {});
}
