(() => {
  const root = document.querySelector('.client-showcase');
  if (!root) return;

  const stages = [...root.querySelectorAll('[data-work-stage]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function reset() {
    stages.forEach((stage) => {
      const card = stage.querySelector('.client-work-card');
      const media = stage.querySelector('.client-work-media img');
      if (card) {
        card.style.transform = '';
        card.style.opacity = '';
      }
      if (media) media.style.removeProperty('--media-y');
    });
  }

  function update() {
    frame = 0;

    if (reduceMotion.matches || window.innerWidth <= 760) {
      reset();
      return;
    }

    const vh = window.innerHeight;

    stages.forEach((stage) => {
      const card = stage.querySelector('.client-work-card');
      const media = stage.querySelector('.client-work-media img');
      if (!card || !media) return;

      const rect = stage.getBoundingClientRect();
      const progress = clamp((vh * 0.82 - rect.top) / (rect.height + vh * 0.18));
      const entrance = clamp((vh * 0.96 - rect.top) / (vh * 0.42));
      const exit = clamp((-rect.top + vh * 0.02) / (rect.height * 0.62));

      const scale = 0.965 + entrance * 0.035 - exit * 0.018;
      const opacity = 0.58 + entrance * 0.42 - exit * 0.12;
      const mediaY = (progress - 0.5) * 42;

      card.style.transform = `scale(${scale.toFixed(4)})`;
      card.style.opacity = opacity.toFixed(3);
      media.style.setProperty('--media-y', `${mediaY.toFixed(1)}px`);
    });
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  reduceMotion.addEventListener?.('change', requestUpdate);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        root.classList.toggle('is-active', entries.some((entry) => entry.isIntersecting));
        requestUpdate();
      },
      { rootMargin: '15% 0px 15% 0px' }
    );
    observer.observe(root);
  }

  update();
})();