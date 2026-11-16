/* AuraDigital portfolio: scroll-synced, progressively enhanced, motion-accessible. */
(() => {
  'use strict';
  const root = document.querySelector('.client-showcase');
  if (!root) return;
  const stages = [...root.querySelectorAll('[data-work-stage]')];
  const current = root.querySelector('[data-work-current]');
  const people = [...document.querySelectorAll('.portfolio-person')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let frame = 0;
  if (!stages.length) return;

  function resetCards() {
    for (const stage of stages) {
      const card = stage.querySelector('.client-work-card');
      const image = stage.querySelector('.client-work-media img');
      if (card) { card.style.transform = ''; card.style.opacity = ''; }
      if (image) image.style.removeProperty('--media-y');
    }
  }

  function render() {
    frame = 0;
    const viewport = innerHeight || 1;
    const animated = !reduced.matches && innerWidth > 760;
    let nearest = 0;
    let distance = Infinity;
    stages.forEach((stage, i) => {
      const rect = stage.getBoundingClientRect();
      const activeDistance = Math.abs((rect.top + Math.min(rect.height, viewport) * .48) - viewport * .54);
      if (activeDistance < distance) { distance = activeDistance; nearest = i; }
      if (!animated) return;
      const card = stage.querySelector('.client-work-card');
      const image = stage.querySelector('.client-work-media img');
      if (!card || !image) return;
      const entrance = clamp((viewport * .98 - rect.top) / (viewport * .45));
      const departure = clamp((viewport * .1 - rect.bottom) / (viewport * .48));
      const progress = clamp((viewport * .85 - rect.top) / (rect.height + viewport * .1));
      const y = (1 - entrance) * 58 - departure * 34;
      const scale = .945 + entrance * .055 - departure * .025;
      const opacity = .60 + entrance * .40 - departure * .23;
      card.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0) scale(' + scale.toFixed(4) + ')';
      card.style.opacity = opacity.toFixed(3);
      image.style.setProperty('--media-y', ((progress - .5) * 32).toFixed(1) + 'px');
    });
    if (!animated) resetCards();
    if (current) current.textContent = String(nearest + 1).padStart(2, '0');
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  addEventListener('scroll', schedule, { passive:true });
  addEventListener('resize', schedule, { passive:true });
  reduced.addEventListener?.('change', () => {
    if (reduced.matches) document.body.classList.remove('portfolio-motion-ready');
    schedule();
  });

  // The page stays legible even when third-party illustration hosts are unavailable.
  document.querySelectorAll('.client-work-media img, .portfolio-person-photo img').forEach(image => {
    const unavailable = () => {
      const wrapper = image.parentElement;
      image.hidden = true;
      if (wrapper) {
        wrapper.classList.add('portfolio-media-unavailable');
        if (!wrapper.querySelector('.portfolio-media-fallback')) {
          const replacement = document.createElement('span');
          replacement.className = 'portfolio-media-fallback';
          replacement.textContent = image.closest('.client-work-stage')
            ? 'Project preview temporarily unavailable'
            : 'Business photography temporarily unavailable';
          wrapper.appendChild(replacement);
        }
      }
    };
    image.addEventListener('error', unavailable, { once:true });
    if (image.complete && !image.naturalWidth) unavailable();
  });

  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold:.12 });
    people.forEach(item => observer.observe(item));
    document.body.classList.add('portfolio-motion-ready');
  }
  render();
})();
