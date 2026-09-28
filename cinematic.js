(() => {
  "use strict";

  const body = document.body;
  if (!body || body.dataset.cinematicReady === "true") return;
  body.dataset.cinematicReady = "true";
  body.classList.add("cinematic-enabled");

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  let theme = document.querySelector('meta[name="theme-color"]');
  if (!theme) {
    theme = document.createElement("meta");
    theme.name = "theme-color";
    document.head.appendChild(theme);
  }
  theme.content = "#07180f";

  if (body.dataset.page === "home") {
    const loader = document.getElementById("landingLoader");
    if (loader && !reducedMotion) {
      const dismissLoader = () => {
        if (!loader.isConnected || loader.classList.contains("is-done")) return;
        loader.classList.add("is-done");
        setTimeout(() => loader.remove(), 550);
      };
      // The animation starts in the initial markup. Keep it visible until it completes,
      // but let CSS clear the overlay even if this script fails to load.
      const whenReady = () => setTimeout(dismissLoader, Math.max(0, 2200 - performance.now()));
      if (document.readyState === "complete") whenReady();
      else addEventListener("load", whenReady, { once: true });
      setTimeout(dismissLoader, 4100);
    }
  }

  if (finePointer && !reducedMotion) {
    const glow = document.createElement("div");
    glow.className = "cinema-glow";
    glow.setAttribute("aria-hidden", "true");
    body.appendChild(glow);
    let px = innerWidth * 0.7;
    let py = innerHeight * 0.25;
    let tx = px;
    let ty = py;

    addEventListener("pointermove", (event) => {
      tx = event.clientX;
      ty = event.clientY;
    }, { passive: true });

    const follow = () => {
      px += (tx - px) * 0.075;
      py += (ty - py) * 0.075;
      glow.style.setProperty("--cinema-x", px + "px");
      glow.style.setProperty("--cinema-y", py + "px");
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }

  document.querySelectorAll(".process").forEach((group) => {
    group.querySelectorAll(".process-step").forEach((step, index) => {
      step.dataset.cinemaIndex = String(index + 1).padStart(2, "0");
    });
  });

  document.querySelectorAll(".project-live,.aura-text-link,.service-link").forEach((link) => {
    link.dataset.cinemaArrow = "";
  });

  let story = null;
  let storyTrack = null;
  let storyLines = [];
  let storyMeta = null;

  if (body.dataset.page === "home") {
    const ticker = document.querySelector(".aura-ticker");
    if (ticker && !document.querySelector(".cinema-scroll-story")) {
      story = document.createElement("section");
      story.className = "cinema-scroll-story";
      story.setAttribute("aria-label", "AuraDigital build sequence");
      story.innerHTML =
        '<div class="cinema-scroll-sticky">' +
          '<div class="cinema-scroll-grid" aria-hidden="true"></div>' +
          '<div class="cinema-scroll-kicker">AURA / FROM IDEA TO IMPACT</div>' +
          '<div class="cinema-scroll-track">' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
            '<div class="cinema-scroll-line"><span>LET&#39;S</span><strong>BUILD</strong></div>' +
          '</div>' +
          '<div class="cinema-scroll-center" aria-hidden="true"><i></i></div>' +
          '<div class="cinema-scroll-meta"><span>Where ambition meets execution.</span><small>KEEP SCROLLING ↓</small></div>' +
        '</div>';
      ticker.insertAdjacentElement("afterend", story);
    }

    story = document.querySelector(".cinema-scroll-story");
    storyTrack = story?.querySelector(".cinema-scroll-track") || null;
    storyLines = [...(story?.querySelectorAll(".cinema-scroll-line") || [])];
    storyMeta = story?.querySelector(".cinema-scroll-meta") || null;
  }

  const footer = document.querySelector(".site-footer");
  if (footer && !footer.querySelector(".cinema-footer-marquee")) {
    const items = [
      "Web Design", "Google Ads", "Meta Ads", "SEO + Maps",
      "AuraMenu", "NFC Experiences", "Content", "Automation"
    ];
    const group = items.map((item) => '<span>' + item + ' <i>✦</i></span>').join("");
    const marquee = document.createElement("div");
    marquee.className = "cinema-footer-marquee";
    marquee.setAttribute("aria-hidden", "true");
    marquee.innerHTML = '<div class="cinema-footer-track">' + group + group + '</div>';
    footer.prepend(marquee);
  }

  const scrubHeadings = !reducedMotion
    ? [...document.querySelectorAll(
        ".section-head .display,.aura-workspace-head .display,.aura-persona-copy h2,.campaign-stage-copy h3"
      )]
    : [];
  const scrubMedia = !reducedMotion
    ? [...document.querySelectorAll(".video-panel video,.nfc-photo img,.visual-explainer img")]
    : [];
  scrubHeadings.forEach((el) => el.classList.add("cinema-scrub-heading"));
  scrubMedia.forEach((el) => el.classList.add("cinema-scrub-media"));

  if (!reducedMotion) {
    const heroMedia = document.querySelector(".hero-media video");
    let scheduled = false;

    const renderScrollMotion = () => {
      scheduled = false;

      if (heroMedia) {
        const progress = clamp(scrollY / Math.max(innerHeight, 1));
        heroMedia.style.transform =
          "scale(" + (1.01 + progress * 0.05) + ") translate3d(0," + (progress * 24) + "px,0)";
      }

      if (story && storyTrack && storyLines.length) {
        const rect = story.getBoundingClientRect();
        const scrollable = Math.max(1, story.offsetHeight - innerHeight);
        const progress = clamp(-rect.top / scrollable);
        const trackHeight = storyTrack.scrollHeight;
        const startY = innerHeight * 0.58;
        const travel = trackHeight + innerHeight * 0.12;
        const y = startY - progress * travel;

        story.style.setProperty("--story-progress", progress.toFixed(4));
        storyTrack.style.transform = "translate3d(0," + y + "px,0)";

        const active = progress * (storyLines.length - 1);
        storyLines.forEach((line, index) => {
          const distance = Math.abs(index - active);
          const opacity = clamp(1 - distance * 0.56, 0.10, 1);
          const scale = clamp(1.09 - distance * 0.055, 0.88, 1.09);
          const shift = (index % 2 === 0 ? -1 : 1) * Math.min(34, distance * 12);
          line.style.opacity = opacity.toFixed(3);
          line.style.transform =
            "translate3d(" + shift + "px,0,0) scale(" + scale.toFixed(3) + ")";
        });

        if (storyMeta) {
          const metaProgress = clamp((progress - 0.80) / 0.14);
          storyMeta.style.opacity = metaProgress.toFixed(3);
          storyMeta.style.transform =
            "translate3d(0," + ((1 - metaProgress) * 28) + "px,0)";
        }
      }

      scrubHeadings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const progress = clamp((innerHeight * 0.90 - rect.top) / (innerHeight * 0.72));
        const y = (1 - progress) * 36;
        const squeeze = 1 + (1 - progress) * 0.018;
        heading.style.transform =
          "translate3d(0," + y.toFixed(2) + "px,0) scaleY(" + squeeze.toFixed(4) + ")";
        heading.style.setProperty("--cinema-title-reveal", progress.toFixed(4));
      });

      scrubMedia.forEach((media) => {
        const rect = media.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > innerHeight + 100) return;
        const center = rect.top + rect.height / 2;
        const normalized = clamp(center / innerHeight, -0.3, 1.3);
        const y = (0.5 - normalized) * 34;
        media.style.setProperty("--cinema-media-y", y.toFixed(2) + "px");
      });
    };

    const requestRender = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(renderScrollMotion);
    };

    addEventListener("scroll", requestRender, { passive: true });
    addEventListener("resize", requestRender, { passive: true });
    renderScrollMotion();
  }

  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".project-media").forEach((media) => {
      const image = media.querySelector("img");
      if (!image) return;

      media.addEventListener("pointermove", (event) => {
        const rect = media.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        image.style.transform =
          "scale(1.05) translate3d(" + (x * -10) + "px," + (y * -10) + "px,0)";
      });

      media.addEventListener("pointerleave", () => {
        image.style.removeProperty("transform");
      });
    });
  }

  const cinematicSections = document.querySelectorAll(
    ".section,.aura-workspace,.aura-personas,.cta-band,.project-card,.menu-design"
  );
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("cinema-in-view", entry.isIntersecting);
      });
    }, { threshold: 0.08, rootMargin: "-8% 0px -8% 0px" });
    cinematicSections.forEach((section) => observer.observe(section));
  } else {
    cinematicSections.forEach((section) => section.classList.add("cinema-in-view"));
  }
})();

/* CONTEXTUAL HOME SCROLL — 2026-09-28 */
(() => {
  "use strict";

  const body = document.body;
  if (!body || body.dataset.page !== "home") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  body.classList.add("context-scroll-enabled");

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const hero = document.querySelector(".reference-hero");
  const serviceCards = [...document.querySelectorAll(".services-grid .service-card")];
  const explainers = [...document.querySelectorAll(".visual-explainer")];
  const studioPanel = document.querySelector(".studio-video .video-panel");
  const campaignStage = document.querySelector(".campaign-stage");
  const adCards = [...document.querySelectorAll(".campaign-stage .ad-card")];
  const flowSteps = [...document.querySelectorAll(".business-flow > div")];
  const processSteps = [...document.querySelectorAll(".process .process-step")];
  const ctaBox = document.querySelector(".cta-band .cta-box");

  let scheduled = false;

  const enterProgress = (el, start = 0.92, distance = 0.72) => {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return clamp((innerHeight * start - rect.top) / Math.max(innerHeight * distance, 1));
  };

  const sceneProgress = (el) => {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return clamp((innerHeight - rect.top) / Math.max(innerHeight + rect.height, 1));
  };

  const setMotion = (el, y, opacity, x = 0) => {
    if (!el) return;
    el.style.setProperty("--ctx-y", y.toFixed(2) + "px");
    el.style.setProperty("--ctx-x", x.toFixed(2) + "px");
    el.style.setProperty("--ctx-opacity", opacity.toFixed(3));
  };

  const render = () => {
    scheduled = false;
    const compact = innerWidth <= 700 ? 0.58 : 1;

    if (hero) {
      const p = clamp(scrollY / Math.max(innerHeight * 0.9, 1));
      hero.style.setProperty("--hero-scroll-y", (-24 * p * compact).toFixed(2) + "px");
      hero.style.setProperty("--hero-scroll-opacity", (1 - p * 0.34).toFixed(3));
      hero.style.setProperty("--hero-note-y", (-12 * p * compact).toFixed(2) + "px");
    }

    serviceCards.forEach((card, index) => {
      const p = clamp((enterProgress(card, 0.94, 0.62) - index * 0.035) / 0.9);
      setMotion(card, (1 - p) * 28 * compact, 0.38 + p * 0.62);
      card.style.setProperty("--service-line", p.toFixed(3));
      card.style.setProperty("--service-icon-scale", (0.82 + p * 0.18).toFixed(3));
    });

    explainers.forEach((item, index) => {
      const p = enterProgress(item, 0.93, 0.68);
      const direction = index % 2 === 0 ? -1 : 1;
      setMotion(item, (1 - p) * 12 * compact, 0.46 + p * 0.54, direction * (1 - p) * 34 * compact);
    });

    if (studioPanel) {
      const enter = enterProgress(studioPanel, 0.96, 0.9);
      const through = sceneProgress(studioPanel);
      studioPanel.style.setProperty("--studio-scale", (1.085 - enter * 0.05 + through * 0.012).toFixed(4));
      studioPanel.style.setProperty("--studio-copy-y", ((1 - enter) * 34 * compact).toFixed(2) + "px");
      studioPanel.style.setProperty("--studio-copy-opacity", (0.4 + enter * 0.6).toFixed(3));
    }

    if (campaignStage) {
      const stageEnter = enterProgress(campaignStage, 0.95, 0.86);
      const stageThrough = sceneProgress(campaignStage);
      const starts = [
        { x: -86, y: 58, fromRot: -10, toRot: -3 },
        { x: 92, y: 76, fromRot: 11, toRot: 4 },
        { x: -34, y: 96, fromRot: -7, toRot: -1 }
      ];

      adCards.forEach((card, index) => {
        const spec = starts[index] || { x: 0, y: 70, fromRot: 0, toRot: 0 };
        const p = clamp((stageEnter - index * 0.11) / 0.76);
        const drift = (stageThrough - 0.5) * (index === 1 ? -10 : 8) * compact;
        card.style.setProperty("--ad-x", ((1 - p) * spec.x * compact).toFixed(2) + "px");
        card.style.setProperty("--ad-y", ((1 - p) * spec.y * compact + drift).toFixed(2) + "px");
        card.style.setProperty("--ad-rot", (spec.fromRot + (spec.toRot - spec.fromRot) * p).toFixed(2) + "deg");
        card.style.setProperty("--ad-opacity", (0.18 + p * 0.82).toFixed(3));
      });
    }

    flowSteps.forEach((step, index) => {
      const p = clamp((enterProgress(step, 0.94, 0.56) - index * 0.055) / 0.86);
      setMotion(step, (1 - p) * 22 * compact, 0.36 + p * 0.64);
      step.style.setProperty("--flow-progress", p.toFixed(3));
    });

    processSteps.forEach((step, index) => {
      const p = clamp((enterProgress(step, 0.94, 0.58) - index * 0.035) / 0.9);
      step.style.setProperty("--step-progress", p.toFixed(3));
      step.style.setProperty("--step-copy-x", ((1 - p) * 26 * compact).toFixed(2) + "px");
      step.style.setProperty("--step-copy-opacity", (0.36 + p * 0.64).toFixed(3));
    });

    if (ctaBox) {
      const p = enterProgress(ctaBox, 0.96, 0.82);
      ctaBox.style.setProperty("--cta-y", ((1 - p) * 38 * compact).toFixed(2) + "px");
      ctaBox.style.setProperty("--cta-opacity", (0.42 + p * 0.58).toFixed(3));
      ctaBox.style.setProperty("--cta-accent", p.toFixed(3));
      ctaBox.style.setProperty("--cta-glow", (p * 22).toFixed(2) + "px");
    }
  };

  const requestRender = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(render);
  };

  addEventListener("scroll", requestRender, { passive: true });
  addEventListener("resize", requestRender, { passive: true });
  render();
})();

