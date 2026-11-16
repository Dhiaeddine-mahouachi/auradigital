/* Public AuraHub landing previews: deterministic example content only. No customer data. */
(() => {
  'use strict';
  const scenarios = {
    restaurant: {
      title: "Let's grow your restaurant.",
      description: "Start with your online menu, then make it easier for guests to find and contact you.",
      steps: ["Set up AuraMenu", "Create a website", "Connect WhatsApp"],
      suggestion: '"Let\'s get your menu online first. You can decide what comes next."'
    },
    local: {
      title: "Let's grow your local business.",
      description: "Help nearby customers understand your services and reach the right person.",
      steps: ["Launch a website", "Improve local discovery", "Organize inquiries"],
      suggestion: '"A clear service website comes first. We can build the rest around it."'
    },
    shop: {
      title: "Let's grow your shop.",
      description: "Show customers what you sell, answer questions, and give every inquiry a place.",
      steps: ["Showcase products", "Set up customer contact", "Automate FAQs"],
      suggestion: '"Start with a simple product showcase and build toward better customer support."'
    },
    creator: {
      title: "Let's grow your brand.",
      description: "Put your work in front of the right people, then make it easy to book your services.",
      steps: ["Build a portfolio", "Set up business email", "Capture new leads"],
      suggestion: "\"Let's put your best work at the center and make the next step effortless.\""
    }
  };
  const personaButtons = Array.from(document.querySelectorAll('[data-persona]'));
  const heading = document.querySelector('[data-persona-heading]');
  const description = document.querySelector('[data-persona-description]');
  const stepElements = Array.from(document.querySelectorAll('[data-persona-step]'));
  const suggestion = document.querySelector('[data-persona-auri]');
  for (const button of personaButtons) {
    button.addEventListener('click', () => {
      const item = scenarios[button.dataset.persona];
      if (!item) return;
      if (heading) heading.textContent = item.title;
      if (description) description.textContent = item.description;
      stepElements.forEach((element, index) => { element.textContent = item.steps[index] || ''; });
      if (suggestion) suggestion.textContent = item.suggestion;
      personaButtons.forEach(candidate => {
        const selected = candidate === button;
        candidate.classList.toggle('is-active', selected);
        candidate.setAttribute('aria-pressed', String(selected));
      });
    });
  }

  const featureButtons = Array.from(document.querySelectorAll('[data-hub-feature]'));
  const featurePanels = Array.from(document.querySelectorAll('[data-hub-panel]'));
  const crumb = document.querySelector('[data-hub-breadcrumb]');
  const names = {roadmap:'Growth Vision', services:'My Services',requests:'Requests',auri:'Auri Assistant'};
  function selectFeature(key, focus = false) {
    if (!Object.hasOwn(names,key)) return;
    featureButtons.forEach(button => {
      const active = button.dataset.hubFeature === key;
      button.setAttribute('aria-selected',String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    featurePanels.forEach(panel => { panel.hidden = panel.dataset.hubPanel !== key; });
    if (crumb) crumb.textContent = names[key];
  }
  featureButtons.forEach((button,index) => {
    button.addEventListener('click',()=>selectFeature(button.dataset.hubFeature));
    button.addEventListener('keydown', event => {
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index+1)%featureButtons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index-1+featureButtons.length)%featureButtons.length;
      if (event.key === 'Home') next=0;
      if (event.key === 'End') next=featureButtons.length-1;
      if(next < 0)return;
      event.preventDefault();
      selectFeature(featureButtons[next].dataset.hubFeature,true);
    });
  });

  const comparison = document.querySelector('[data-business-compare]');
  const slider = comparison?.querySelector('[data-compare-slider]');
  if (slider) {
    const updateComparison = () => {
      const value = slider.valueAsNumber;
      comparison.style.setProperty('--hx-split', value + '%');
      slider.setAttribute('aria-valuetext', value + '% before, ' + (100 - value) + '% with AuraHub');
    };
    slider.addEventListener('input', updateComparison);
    let pointerId;
    function moveDivider(event) {
      const bounds = comparison.getBoundingClientRect();
      slider.value = String(Math.max(0, Math.min(100, Math.round((event.clientX - bounds.left) / bounds.width * 100))));
      updateComparison();
    }
    slider.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      slider.focus({preventScroll:true});
      pointerId = event.pointerId;
      slider.setPointerCapture(pointerId);
      moveDivider(event);
    });
    slider.addEventListener('pointermove', event => {
      if (event.pointerId === pointerId) moveDivider(event);
    });
    slider.addEventListener('lostpointercapture', () => { pointerId = undefined; });
    updateComparison();
  }

  const portrait = document.querySelector('[data-landing-auri]');
  if (portrait && window.matchMedia) {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const hero = portrait.closest('.ac-hero');
    const reset = () => portrait.style.removeProperty('--hx-look');
    hero?.addEventListener('pointermove', event => {
      if (motion.matches || event.pointerType !== 'mouse' || portrait.hasAttribute('data-rendered')) return;
      const bounds = portrait.getBoundingClientRect();
      const offset = (distance, size) => Math.max(-8, Math.min(8, distance / Math.max(size, 180) * 8));
      const x = offset(event.clientX - bounds.left - bounds.width / 2, bounds.width);
      const y = offset(event.clientY - bounds.top - bounds.height / 2, bounds.height);
      portrait.style.setProperty('--hx-look', x + 'px, ' + y + 'px');
    }, {passive:true});
    hero?.addEventListener('pointerleave', reset);
    motion.addEventListener('change', reset);
    if (!motion.matches && 'IntersectionObserver' in window && window.WebGL2RenderingContext && !navigator.connection?.saveData) {
      const observer = new IntersectionObserver(async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const { mountAuri } = await import('/media/auri/viewer.js?v=idle-motion-2');
          if (portrait.isConnected && !motion.matches) await mountAuri(portrait);
        } catch {
          // The portrait remains available on browsers without hardware rendering.
        }
      });
      observer.observe(portrait);
    }
  }
})();
