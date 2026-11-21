const motion = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = () => navigator.connection?.saveData || ['slow-2g', '2g'].includes(navigator.connection?.effectiveType);
const limit = value => Math.max(-1, Math.min(1, value));

class AuriCharacter extends HTMLElement {
  connectedCallback() {
    const controller = new AbortController();
    this.connection = controller;
    const { signal } = controller;
    const reset = () => this.style.removeProperty('--auri-look');
    let visible = false;
    let requested = false;

    window.addEventListener('pointermove', event => {
      if (!visible || motion.matches || event.pointerType !== 'mouse' || this.hasAttribute('data-rendered')) return;
      const { left, top, width, height } = this.getBoundingClientRect();
      const offset = (point, start, size) => limit((point - start - size / 2) / Math.max(size, 180)) * 5;
      this.style.setProperty('--auri-look', `${offset(event.clientX, left, width)}px, ${offset(event.clientY, top, height)}px`);
    }, { passive: true, signal });
    document.documentElement.addEventListener('pointerleave', reset, { signal });
    window.addEventListener('blur', reset, { signal });
    motion.addEventListener('change', reset, { signal });

    // The 3D (WebGL) model is switched off: on some graphics drivers it froze
    // the whole tab before anything was drawn. Auri is the still image, which
    // follows the pointer through --auri-look.
    if (!('IntersectionObserver' in window)) { visible = true; return; }
    this.observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    });
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.connection?.abort();
    this.observer?.disconnect();
    this.disposeModel?.();
    this.disposeModel = undefined;
    this.style.removeProperty('--auri-look');
  }
}

customElements.define('auri-character', AuriCharacter);
