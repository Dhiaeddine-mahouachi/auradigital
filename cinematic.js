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
  theme.content = "#070907";

  if (!reducedMotion) {
    const loader = document.createElement("div");
    loader.className = "cinema-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = '<div class="cinema-loader-inner"><div class="cinema-loader-top"><span>AuraDigital</span><span>Digital studio · 2026</span></div><div class="cinema-loader-number">0</div><div class="cinema-loader-line"><i></i></div></div>';
    body.prepend(loader);

    const number = loader.querySelector(".cinema-loader-number");
    const line = loader.querySelector(".cinema-loader-line i");
    const started = performance.now();
    let current = 0;

    const paintLoader = (now) => {
      const elapsed = now - started;
      const target = document.readyState === "complete" ? 100 : Math.min(88, 14 + elapsed / 12);
      current += (target - current) * 0.11;
      const value = Math.min(100, Math.round(current));
      number.textContent = String(value).padStart(2, "0");
      line.style.transform = "scaleX(" + (value / 100) + ")";

      if (value >= 99 && document.readyState === "complete") {
        number.textContent = "100";
        line.style.transform = "scaleX(1)";
        setTimeout(() => loader.classList.add("is-done"), 120);
        setTimeout(() => loader.remove(), 1200);
        return;
      }
      requestAnimationFrame(paintLoader);
    };
    requestAnimationFrame(paintLoader);

    setTimeout(() => {
      if (!loader.isConnected) return;
      number.textContent = "100";
      line.style.transform = "scaleX(1)";
      loader.classList.add("is-done");
      setTimeout(() => loader.remove(), 1000);
    }, 2600);
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
