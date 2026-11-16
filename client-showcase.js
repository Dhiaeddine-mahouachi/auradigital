/* Portfolio: progressive editorial reveal and safe image fallbacks.
   All content and project links remain visible if JavaScript is unavailable. */
(() => {
  'use strict';
  const root = document.querySelector('body[data-page="portfolio"] .pf-page');
  if (!root) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...root.querySelectorAll('[data-pf-reveal]')];

  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('pf-in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.04, rootMargin: '0px 0px -24px 0px' });
    items.forEach(item => observer.observe(item));
    root.classList.add('pf-reveal-ready');
    reduced.addEventListener?.('change', () => {
      if (reduced.matches) {
        root.classList.remove('pf-reveal-ready');
        observer.disconnect();
      }
    });
  }

  // Project previews are local. Editorial photos may fail because of blockers:
  // show a readable fallback rather than leaving a broken photograph.
  for (const img of root.querySelectorAll('img')) {
    const unavailable = () => {
      if (img.dataset.pfImageFailed === 'true') return;
      img.dataset.pfImageFailed = 'true';
      const wrap = img.closest('figure, .pf-product-image');
      if (!wrap) return;
      wrap.classList.add('pf-media-unavailable');
      const label = document.createElement('span');
      label.className = 'pf-media-fallback';
      label.textContent = img.closest('.pf-product') ? 'Product preview unavailable'
        : img.src.includes('unsplash.com') ? 'Editorial photograph unavailable'
        : 'Project photograph unavailable';
      wrap.appendChild(label);
    };
    img.addEventListener('error', unavailable, { once: true });
    if (img.complete && img.naturalWidth === 0) unavailable();
  }
})();
