(() => {
  "use strict";

  const body = document.body;
  if (!body || body.dataset.cinematicReady === "true") return;
  body.dataset.cinematicReady = "true";
  body.classList.add("cinematic-enabled");

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;

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

  if (body.dataset.page === "home") {
    const ticker = document.querySelector(".aura-ticker");
    const workspace = document.querySelector(".aura-workspace");
    if (ticker && workspace && !document.querySelector(".cinema-build-rail")) {
      const rail = document.createElement("section");
      rail.className = "cinema-build-rail";
      rail.setAttribute("aria-hidden", "true");
      rail.innerHTML = '<div class="cinema-build-track"><span>BUILD</span><i>✦</i><span>GROW</span><i>✦</i><span>AUTOMATE</span><i>✦</i><span>CREATE</span><i>✦</i><span>BUILD</span></div>';
      ticker.insertAdjacentElement("afterend", rail);
    }
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

  if (!reducedMotion) {
    const heroMedia = document.querySelector(".hero-media video");
    const rail = document.querySelector(".cinema-build-rail");
    const railTrack = rail ? rail.querySelector(".cinema-build-track") : null;
    let scheduled = false;

    const renderScrollMotion = () => {
      scheduled = false;

      if (heroMedia) {
        const progress = Math.min(1, Math.max(0, scrollY / Math.max(innerHeight, 1)));
        heroMedia.style.transform = "scale(" + (1.01 + progress * 0.035) + ") translate3d(0," + (progress * 18) + "px,0)";
      }

      if (rail && railTrack) {
        const rect = rail.getBoundingClientRect();
        const span = innerHeight + rect.height;
        const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / span));
        const distance = Math.max(220, railTrack.scrollWidth - innerWidth + 80);
        railTrack.style.setProperty("--cinema-rail", (-progress * distance * 0.62) + "px");
      }
    };

    addEventListener("scroll", () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(renderScrollMotion);
      }
    }, { passive: true });
    addEventListener("resize", renderScrollMotion, { passive: true });
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
        image.style.transform = "scale(1.045) translate3d(" + (x * -8) + "px," + (y * -8) + "px,0)";
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
