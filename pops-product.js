/* Lightweight page motion; shared script.js owns navigation, consent and analytics. */
(() => {
  const page = document.querySelector('.ap-page');
  if (!page) return;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const resetMotion = () => {
    observer?.disconnect();
    page.classList.remove('ap-motion');
    if (motionPreference.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('ap-in');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    page.classList.add('ap-motion');
    page.querySelectorAll('.ap-reveal').forEach((element) => observer.observe(element));
  };
  resetMotion();
  motionPreference.addEventListener('change', resetMotion);
  document.addEventListener('visibilitychange', () => {
    page.querySelectorAll('.ap-phone-float').forEach((phone) => {
      phone.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });
  // Add Escape/focus behavior to the existing shared mobile menu on this page.
  const button = document.getElementById('menuBtn');
  const menu = document.getElementById('navLinks');
  if (button && menu) {
    button.setAttribute('aria-controls', 'navLinks');
    const syncLabel = () => button.setAttribute('aria-label', menu.classList.contains('open') ? 'Close menu' : 'Open menu');
    const closeMenu = () => {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = '☰';
      syncLabel();
    };
    button.addEventListener('click', syncLabel);
    menu.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        button.focus();
      }
    });
    document.addEventListener('click', (event) => { if (!event.target.closest('#siteHeader')) closeMenu(); });
  }
})();
