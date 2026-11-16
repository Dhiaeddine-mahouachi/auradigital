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
      suggestion: '"Let's put your best work at the center and make the next step effortless."'
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
})();