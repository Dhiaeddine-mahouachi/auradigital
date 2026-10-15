const AURA = {
  email: "info@auradigitalworks.com",
  domain: "auradigitalworks.com",
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
  ["home", "/", "Home"],
  ["services", "/services", "Services"],
  ["portfolio", "/portfolio", "Portfolio"],
  ["auramenu", "/aura-menu", "AuraMenu"],
  ["aurapops", "/aurapops", "AuraPops"],
  ["auraweddings", "/aura-weddings", "AuraWeddings"],
  ["packages", "/packages", "Packages"],
  ["about", "/about", "About"],
];
const header = document.getElementById("siteHeader");
if (header) {
  header.className = "site-header";
  header.innerHTML = `<div class="container nav"><a class="brand brand-wordmark" href="/" aria-label="AuraDigital home"><img class="brand-logo" src="auradigital-logo-20260928.png" alt=""><span class="brand-name"><strong>Aura</strong>Digital</span></a><div class="nav-links" id="navLinks">${pages
    .map(
      ([id, href, label]) =>
        `<a class="${page === id ? "active" : ""}" href="${href}">${label}</a>`,
    )
    .join(
      "",
    )}</div><div class="lang-switcher"><button class="lang-current" type="button" aria-label="Language" aria-expanded="false"><span class="lang-globe">◎</span><span class="lang-current-label">EN</span><span class="lang-chevron">⌄</span></button><div class="lang-menu"><button type="button" data-lang="tr"><span>🇹🇷</span> Türkçe</button><button type="button" data-lang="en"><span>🇬🇧</span> English</button><button type="button" data-lang="ar"><span>🇸🇦</span> العربية</button></div></div><a class="nav-cta" href="/contact">Let's Talk <span>↗</span></a><button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">☰</button></div>`;
}
const footer = document.getElementById("siteFooter");
if (footer) {
  footer.className = "site-footer";
  footer.innerHTML = `<div class="container"><div class="footer-top"><div><a class="brand brand-wordmark footer-wordmark" href="/" aria-label="AuraDigital home"><img class="brand-logo" src="auradigital-logo-20260928.png" alt="AuraDigital"></a><p class="footer-blurb">From websites and advertising to NFC experiences, AuraMenu and AuraWeddings, we build your brand’s digital system as one professional team.</p></div><div class="footer-col"><h4>Services</h4><a href="/services">Web & Growth</a><a href="/nfc">NFC Cards</a><a href="/aura-menu">AuraMenu</a><a href="/aurapops">AuraPops</a><a href="/aura-weddings">AuraWeddings</a><a href="/packages">Subscriptions</a></div><div class="footer-col"><h4>Company</h4><a href="/portfolio">Portfolio</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/packages#faq">FAQ</a></div><div class="footer-col"><h4>Let's start</h4><a href="https://wa.me/${AURA.whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp · +90 538 550 76 74</a><a href="mailto:${AURA.email}">Email · ${AURA.email}</a><a href="https://${AURA.domain}" target="_blank" rel="noopener noreferrer">${AURA.domain}</a></div></div><div class="footer-bottom"><span>© 2026 AuraDigital. All rights reserved.</span><span>Istanbul · Turkey</span></div></div>`;
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
const mobileViewport = matchMedia("(max-width: 700px)").matches;
const backgroundVideos = [...document.querySelectorAll("[data-background-video]")];
const heroBackgroundVideo = document.querySelector(".hero-media video[data-background-video]");
const markVideoReady = (video) => video.parentElement?.classList.add("is-video-ready");

const playBackgroundVideo = (video) => {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.play().catch(() => {});
};

backgroundVideos.forEach((video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.playbackRate = 1;
  video.addEventListener("loadeddata", () => markVideoReady(video), { once: true });
  video.addEventListener("canplay", () => markVideoReady(video), { once: true });
  video.addEventListener("playing", () => markVideoReady(video), { once: true });
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) markVideoReady(video);

  // Keep the landing hero autoplaying on phones. Other background videos still
  // respect the visitor's reduced-motion preference.
  if (reducedMotion && !(mobileViewport && video === heroBackgroundVideo)) {
    video.pause();
    video.removeAttribute("autoplay");
  } else {
    playBackgroundVideo(video);
  }
});

if (mobileViewport && heroBackgroundVideo) {
  heroBackgroundVideo.setAttribute("autoplay", "");
  heroBackgroundVideo.preload = "auto";

  const startMobileHeroVideo = () => playBackgroundVideo(heroBackgroundVideo);
  heroBackgroundVideo.addEventListener("loadedmetadata", startMobileHeroVideo);
  heroBackgroundVideo.addEventListener("canplay", startMobileHeroVideo);
  addEventListener("pageshow", startMobileHeroVideo);
  addEventListener("load", startMobileHeroVideo, { once: true });

  // iOS may defer media startup until the page receives its first interaction.
  // Retry immediately on that interaction without changing sound state.
  ["touchstart", "pointerdown"].forEach((eventName) => {
    document.addEventListener(eventName, startMobileHeroVideo, {
      once: true,
      passive: true,
    });
  });
}

document.addEventListener("visibilitychange", () => {
  backgroundVideos.forEach((video) => {
    if (document.hidden) {
      video.pause();
      return;
    }
    if (reducedMotion && !(mobileViewport && video === heroBackgroundVideo)) return;
    playBackgroundVideo(video);
  });
});
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
  const params = new URLSearchParams(location.search);
  const design = params.get("design");
  const requestedService = params.get("service");
  if (requestedService === "auraweddings") {
    const service = form.querySelector('[name="service"]');
    const message = form.querySelector('[name="message"]');
    if (service) service.value = "AuraWeddings";
    if (message && !message.value) {
      const chosenTheme = params.get("theme");
      const details = ['one', 'two', 'date', 'time', 'venue', 'lang', 'message'].map(key => [key, (params.get(key) || '').slice(0, 400)]).filter(([, value]) => value);
      message.value = `AuraWeddings request${chosenTheme && /^[a-z0-9-]{1,60}$/.test(chosenTheme) ? ` — selected theme: ${chosenTheme.replaceAll("-", " ")}` : ''}.\n${details.map(([key, value]) => `${key}: ${value}`).join('\n')}`;

    }
  } else if (requestedService === "auramenu-custom") {
    const service = form.querySelector('[name="service"]');
    const message = form.querySelector('[name="message"]');
    if (service) service.value = "AuraMenu";
    if (message && !message.value) message.value = "Custom AuraMenu request: Business name: ... Design requirements: ... Menu content: ... Languages: ...";
  } else if (design) {
    const service = form.querySelector('[name="service"]');
    const message = form.querySelector('[name="message"]');
    if (service) service.value = "AuraMenu";
    if (message && !message.value)
      message.value = `AuraMenu design: ${design.replaceAll("-", " ")}`;
  }
}
const contactFormCopy = {
  tr: {
    idle: "Talebi gönder ↗",
    sending: "Gönderiliyor…",
    success: "Teşekkürler. Talebiniz başarıyla kaydedildi. Ekibimiz bilgilerinizi inceleyecek. Onay e-postası gönderim için kabul edildi.",
    successNoEmail: "Talebinizi aldık, ancak otomatik onay e-postası gönderilemedi. Ekibimiz yine de talebinizi aldı ve sizinle iletişime geçecek.",
    error: "Talep gönderilemedi. Lütfen tekrar deneyin veya WhatsApp üzerinden bize ulaşın.",
  },
  en: {
    idle: "Send request ↗",
    sending: "Sending…",
    success: "Thank you. Your request has been received. Our team will review your information. Your confirmation email has been accepted for sending.",
    successNoEmail: "We received your request, but the automatic confirmation email could not be sent. Our team still has your request and will contact you.",
    error: "We couldn’t send your request. Please try again or contact us on WhatsApp.",
  },
  ar: {
    idle: "إرسال الطلب ←",
    sending: "جارٍ الإرسال…",
    success: "شكراً لك. تم تسجيل طلبك بنجاح. سيراجع فريقنا معلوماتك. تم قبول رسالة التأكيد للإرسال.",
    successNoEmail: "استلمنا طلبك، لكن تعذر إرسال رسالة التأكيد التلقائية. طلبك وصل إلى فريقنا وسنتواصل معك.",
    error: "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى أو التواصل معنا عبر WhatsApp.",
  },
};
let contactSubmitting = false;
const contactLanguage = () =>
  document.documentElement.lang === "ar"
    ? "ar"
    : document.documentElement.lang === "en"
      ? "en"
      : "tr";

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (contactSubmitting) return;
  contactSubmitting = true;
  const fd = new FormData(form);
  const submit = form.querySelector("[data-contact-submit]");
  const status = form.querySelector("[data-contact-status]");
  const language = contactLanguage();
  const copy = contactFormCopy[language];
  submit.disabled = true;
  submit.textContent = copy.sending;
  status.textContent = "";

  try {
    const payload = {
      name:fd.get("name"),email:fd.get("email"),phone:fd.get("phone"),
      service:fd.get("service"),message:fd.get("message"),language,website:fd.get("website"),
      ...(window.AuraPricing?.selection ? {pricingSelection:window.AuraPricing.selection} : {}),
    };
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(payload))))].map(x=>x.toString(16).padStart(2,"0")).join("");
    // Keep the key across network failures/reloads; store no customer data.
    const storageKey = `aura-contact-${hash}`;
    let submissionKey = form.dataset.submissionHash === hash ? form.dataset.submissionKey : null;
    try { submissionKey ||= sessionStorage.getItem(storageKey); } catch {}
    submissionKey ||= crypto.randomUUID();
    form.dataset.submissionHash = hash;
    form.dataset.submissionKey = submissionKey;
    try { sessionStorage.setItem(storageKey,submissionKey); } catch {}
    const response = await fetch("/api/contact", {
      method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":submissionKey},
      body:JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok || !data.requestId) throw new Error(data.error || copy.error);

    if (data.confirmationSent) {
      status.textContent = copy.success;
      status.dataset.state = "success";
    } else {
      status.textContent = copy.successNoEmail;
      status.dataset.state = "success";
    }
    status.textContent += ` (${data.requestId})`;
    form.reset();
    submit.textContent = copy.idle;
  } catch (error) {
    status.textContent = error?.message || copy.error;
    status.dataset.state = "error";
    submit.textContent = copy.idle;
  } finally {
    contactSubmitting = false;
    submit.disabled = false;
  }
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
  `<aside class="cookie-consent" id="cookieConsent" aria-label="Cookie preferences" aria-hidden="true">
    <div class="cookie-copy"><span class="cookie-icon">◉</span><div><strong>Cookie preferences</strong><p>We use necessary storage for a better site experience and, with your permission, may use performance measurement in the future. You can change your choice at any time.</p></div></div>
    <div class="cookie-actions"><button class="btn btn-primary" type="button" data-cookie="all">Accept all</button><button class="btn cookie-necessary" type="button" data-cookie="necessary">Necessary only</button><button class="btn cookie-reject" type="button" data-cookie="reject">Reject all</button></div>
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
  settings.textContent = "Cookie settings";
  settings.addEventListener("click", openCookieConsent);
  footerBottom.appendChild(settings);
}

/* The existing Aura Assistant panel is mounted by the server-backed module. */
const assistantScript = document.createElement("script");
assistantScript.type = "module";
assistantScript.src = "/assistant/ui.js?v=ai-recovery-20261013";
document.head.appendChild(assistantScript);
const i18nScript = document.createElement("script");
i18nScript.src = "i18n.js?v=english-complete-20261003";
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


// Autoplay all site videos in the browser-supported, silent inline mode.
(() => {
  const setUp = (video) => {
    if (video.dataset.auraAutoplayReady === '1' || video.hasAttribute('data-no-autoplay')) return;
    video.dataset.auraAutoplayReady = '1';
    video.defaultMuted = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    const start = () => {
      if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    };
    video.addEventListener('canplay', start, { once: true });
    start();
  };
  const scan = () => document.querySelectorAll('video').forEach(setUp);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) document.querySelectorAll('video[data-aura-autoplay-ready="1"]').forEach(v => v.play().catch(() => {})); });
})();
