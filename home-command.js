/* The public landing-page demo is illustrative; actual Auri AI runs in AuraHub. */
(() => {
  'use strict';
  const examples = {
    launch: {
      user: 'I want to launch my business online.',
      answer: "Let's start with the essentials: a website, a business email, and a way for customers to reach you. I'll organize the steps in your roadmap.",
      task: 'Launch your website',
      sub: 'A professional home for your business.',
      teaser: "We can start with your website. I'll help you plan what it needs."
    },
    customers: {
      user: 'I want more people nearby to find my business.',
      answer: "Let's check how customers discover you. Your roadmap can prioritize local visibility, your Google Business Profile, and focused ads when you're ready.",
      task: 'Improve local visibility',
      sub: 'Help nearby customers discover you.',
      teaser: "Let's put your business where nearby customers are looking."
    },
    automate: {
      user: 'Can I save time replying to customer messages?',
      answer: "Yes. We can map your most common questions, prepare WhatsApp replies, and decide what should still go to a real person.",
      task: 'Set up customer replies',
      sub: 'A smarter WhatsApp workflow for your team.',
      teaser: "We can prepare the replies and keep your team in control."
    }
  };
  const by = selector => document.querySelector(selector);
  const user = by('[data-scenario-user]');
  const answer = by('[data-scenario-answer]');
  const task = by('[data-demo-heading]');
  const sub = by('[data-demo-sub]');
  const teaser = by('[data-demo-reply]');
  const buttons = [...document.querySelectorAll('[data-scenario]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const example = examples[button.dataset.scenario];
      if (!example) return;
      if (user) user.textContent = example.user;
      if (answer) answer.textContent = example.answer;
      if (task) task.textContent = example.task;
      if (sub) sub.textContent = example.sub;
      if (teaser) teaser.textContent = example.teaser;
      for (const item of buttons) {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      }
    });
  }
  const stage = by('.ac-stage');
  const app = by('.ac-app');
  if (!stage || !app || !window.matchMedia) return;
  const allowsMotion = matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
  if (!allowsMotion) return;
  stage.addEventListener('pointermove', event => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    app.style.transform = 'rotateY(' + (-2 + x * 3).toFixed(2) + 'deg) rotateX(' + (-y * 2).toFixed(2) + 'deg)';
  }, { passive: true });
  stage.addEventListener('pointerleave', () => { app.style.transform = ''; });
})();