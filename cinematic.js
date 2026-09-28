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

  if (body.dataset.page === "home" && !reducedMotion) {
    const loader = document.createElement("div");
    loader.className = "cinema-loader cinema-loader--draw";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-label", "AuraDigital loading");
    loader.innerHTML = `
      <svg viewBox="0 0 1774 887" xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true" style="display:block;width:min(95vw,760px);height:auto;max-height:55svh">
        <defs>
          <mask id="aura-loader-d" maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887">
            <rect width="1774" height="887" fill="#000"/>
            <path data-d-stroke d="M800,292 H1125 C1200,292 1232,340 1232,401 C1232,462 1200,511 1125,511 H955 V345"
              fill="none" stroke="#fff" stroke-width="110" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
            <rect data-d-fill width="1774" height="887" fill="#fff" opacity="0"/>
          </mask>
          <mask id="aura-loader-g" maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887">
            <rect width="1774" height="887" fill="#000"/>
            <path data-g-stroke d="M890,396 H640 C580,396 541,445 541,494 C541,540 578,571 640,571 H814 V448"
              fill="none" stroke="#fff" stroke-width="110" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
            <rect data-g-fill width="1774" height="887" fill="#fff" opacity="0"/>
          </mask>
        </defs>
        <g data-d-part fill="#111114">
          <path mask="url(#aura-loader-d)"
            d="M821,253 H1125 C1220,253 1284,320 1284,401 C1284,482 1220,550 1125,550 H905 V356 H975 C995,356 1006,368 1006,385 V473 H1110 C1150,473 1180,445 1180,403 C1180,360 1150,331 1110,331 H821 Z"/>
        </g>
        <g data-g-part fill="#111114">
          <path mask="url(#aura-loader-g)"
            d="M630,356 H868 V437 H640 C610,437 595,462 595,490 C595,510 610,530 640,530 H760 V500 C760,478 778,458 800,458 H868 V611 H620 C540,611 488,560 488,494 C488,420 550,356 630,356 Z"/>
        </g>
      </svg>`;
    body.prepend(loader);

    const dStroke = loader.querySelector("[data-d-stroke]");
    const gStroke = loader.querySelector("[data-g-stroke]");
    const dFill = loader.querySelector("[data-d-fill]");
    const gFill = loader.querySelector("[data-g-fill]");
    const dPart = loader.querySelector("[data-d-part]");
    const gPart = loader.querySelector("[data-g-part]");
    const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const overshoot = (t) => 1 + 2.9 * Math.pow(t - 1, 3) + 1.9 * Math.pow(t - 1, 2);
    const started = performance.now();
    let dismissed = false;
    let animationFrame;
    const draw = (now) => {
      if (dismissed) return;
      const t = Math.min(now - started, 4000);
      dStroke.style.strokeDashoffset = String(1 - ease(clamp(t / 1400)));
      gStroke.style.strokeDashoffset = String(1 - ease(clamp((t - 1400) / 1400)));
      dFill.setAttribute("opacity", String(clamp((t - 1200) / 200)));
      gFill.setAttribute("opacity", String(clamp((t - 2600) / 200)));
      const join = t < 3100 ? 0 : overshoot(clamp((t - 3100) / 900));
      gPart.setAttribute("transform", "translate(0," + (-24 + 24 * join) + ")");
      dPart.setAttribute("transform", "translate(0," + (24 - 24 * join) + ")");
      if (t < 4000) animationFrame = requestAnimationFrame(draw);
    };
    animationFrame = requestAnimationFrame(draw);

    const dismissLoader = () => {
      if (dismissed || !loader.isConnected) return;
      dismissed = true;
      cancelAnimationFrame(animationFrame);
      loader.classList.add("is-done");
      setTimeout(() => loader.remove(), 550);
    };
    const whenReady = () => setTimeout(dismissLoader, Math.max(0, 4200 - (performance.now() - started)));
    if (document.readyState === "complete") whenReady();
    else addEventListener("load", whenReady, { once: true });
    setTimeout(dismissLoader, 6000);
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
