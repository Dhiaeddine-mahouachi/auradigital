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

    if (!('IntersectionObserver' in window)) {
      visible = true;
      return;
    }

    this.observer = new IntersectionObserver(async ([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        reset();
        return;
      }
      if (requested || signal.aborted || saveData() || !window.WebGL2RenderingContext) return;
      requested = true;
      try {
        const { mountAuri } = await import('/media/auri/viewer.js?v=shared-cursor-1');
        if (signal.aborted) return;
        const dispose = await mountAuri(this, signal);
        if (signal.aborted) dispose?.();
        else this.disposeModel = dispose;
      } catch {
        // The matching render of the same model can still follow the pointer.
      }
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
