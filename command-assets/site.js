const menu = document.querySelector('.mobile-menu');
const nav = document.querySelector('#site-nav');
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const theme = document.querySelector('.theme-toggle');
function updateTheme() {
  theme.setAttribute('aria-pressed', String(document.documentElement.dataset.commandTheme === 'light'));
}
theme.addEventListener('click', () => {
  const next = document.documentElement.dataset.commandTheme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.commandTheme = next;
  try { localStorage.setItem('aura-command-theme', next); } catch {}
  updateTheme();
});
updateTheme();

const labels = {
  en: ['Product','Services','Industries','Pricing','Resources','Login','Build my roadmap','What’s your next move?','Tell Auri about your business and get a roadmap you can put to work.'],
  tr: ['Ürün','Hizmetler','Sektörler','Fiyatlandırma','Kaynaklar','Giriş','Yol haritamı oluştur','Sıradaki adımınız ne?','Auri’ye işletmenizi anlatın ve uygulayabileceğiniz bir yol haritası alın.'],
  fr: ['Produit','Services','Secteurs','Tarifs','Ressources','Connexion','Créer ma feuille de route','Quelle est votre prochaine étape ?','Présentez votre activité à Auri et obtenez une feuille de route à mettre en pratique.'],
  ar: ['المنتج','الخدمات','القطاعات','الأسعار','الموارد','تسجيل الدخول','أنشئ خارطة طريقي','ما خطوتك التالية؟','أخبر أوري عن نشاطك واحصل على خارطة طريق يمكنك تنفيذها.'],
};
const languages = [...document.querySelectorAll('[data-command-language]')];
const translatedNodes = [...document.querySelectorAll('#site-nav>a, #site-nav a[href="/hub/login"], a.btn-primary, .final-cta h2, .final-cta p')]
  .flatMap(element => [...element.childNodes].filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => ({node, index:labels.en.indexOf(node.textContent.trim())})).filter(pair => pair.index >= 0));
function setLanguage(language) {
  if (!Object.hasOwn(labels, language)) language = 'en';
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  for (const select of languages) select.value = language;
  for (const {node,index} of translatedNodes) node.textContent = labels[language][index];
  const main = document.querySelector('main');
  main.lang = 'en';
  document.querySelector('.site-footer').lang = 'en';
  try {
    localStorage.setItem('aura-hub-language', language);
    localStorage.setItem('aura-lang-choice-v3', language);
    localStorage.setItem('aura-lang', language);
  } catch {}
}
for (const select of languages) select.addEventListener('change', () => setLanguage(select.value));
let savedLanguage = 'en';
try { savedLanguage = localStorage.getItem('aura-lang-choice-v3') || savedLanguage; } catch {}
setLanguage(savedLanguage);

function press(button, group) {
  for (const item of group) item.setAttribute('aria-pressed', String(item === button));
}
for (const group of document.querySelectorAll('[data-tabs]')) {
  const tabs = [...group.querySelectorAll('[role=tab]')];
  function activate(tab) {
    for (const item of tabs) {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = item !== tab;
    }
  }
  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const rtl = document.documentElement.dir === 'rtl';
      const offset = {ArrowRight:rtl?-1:1,ArrowLeft:rtl?1:-1}[event.key];
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1
        : offset ? (index+offset+tabs.length)%tabs.length : null;
      if (next === null) return;
      event.preventDefault();
      tabs[next].focus();
      activate(tabs[next]);
    });
  }
}

const triggers = document.querySelectorAll('[data-goal]');
const cards = document.querySelectorAll('[data-service-directory] [data-service-goal]');
for (const trigger of triggers) trigger.addEventListener('click', () => {
  press(trigger, triggers);
  for (const card of cards) card.hidden = trigger.dataset.goal !== 'All services' && trigger.dataset.goal !== card.dataset.serviceGoal;
  document.querySelector('[data-service-count]').textContent = [...cards].filter(card => !card.hidden).length+' services shown';
});

const range = document.querySelector('[data-compare]');
range?.addEventListener('input', () => document.querySelector('#comparison').style.setProperty('--split', range.value+'%'));

const prompts = document.querySelectorAll('[data-prompt]');
for (const trigger of prompts) trigger.addEventListener('click', () => {
  press(trigger, prompts);
  document.querySelector('[data-prompt-answer]').textContent = trigger.dataset.prompt;
});
const levels = document.querySelectorAll('[data-level]');
for (const trigger of levels) trigger.addEventListener('click', () => {
  press(trigger, levels);
  const image = document.querySelector('.auri-spotlight img');
  const level = trigger.dataset.level;
  image.src = '/media/auri/level-'+level+'.webp';
  image.alt = 'Auri, level '+level;
  document.querySelector('[data-auri-level]').textContent = 'Level '+level;
});

const search = document.querySelector('[data-resource-search]');
if (search) {
  search.value = new URL(location.href).searchParams.get('q') || '';
  const resources = [...document.querySelectorAll('[data-resource]')];
  const help = [...document.querySelectorAll('[data-help-item]')];
  const categories = document.querySelectorAll('[data-resource-category]');
  let category = 'All';
  function filter() {
    const query = search.value.trim().toLowerCase();
    for (const item of resources) item.hidden = (category !== 'All' && category !== item.dataset.resource) || !item.textContent.toLowerCase().includes(query);
    for (const item of help) item.hidden = !item.textContent.toLowerCase().includes(query);
    document.querySelector('[data-resource-empty]').hidden = [...resources, ...help].some(item => !item.hidden);
  }
  search.addEventListener('input', filter);
  for (const trigger of categories) trigger.addEventListener('click', () => {
    category = trigger.dataset.resourceCategory;
    press(trigger, categories);
    filter();
  });
  filter();
}

const periodButtons = document.querySelectorAll('[data-period]');
if (periodButtons.length) {
  const outputs = document.querySelectorAll('[data-care-price]');
  const description = document.querySelector('[data-care-description]');
  const prices = new Map();
  const getPrice = async () => {
    try {
      const url = new URL('/api/pricing',location.origin);
      const region = new URL(location.href).searchParams.get('region');
      if (region) url.searchParams.set('region',region);
      const response = await fetch(url);
      if (!response.ok) return;
      const { catalogue, currency } = await response.json();
      const money = new Intl.NumberFormat(document.documentElement.lang,{style:'currency',currency});
      for (const key of ['care','infrastructure']) {
        for (const item of catalogue[key] || []) {
          if (Number.isFinite(item.price)) prices.set(item.id, money.format(item.price)+' / '+item.billing);
        }
      }
    } catch {}
  };
  for (const trigger of periodButtons) trigger.addEventListener('click', async () => {
    press(trigger, periodButtons);
    const annual = trigger.dataset.period === 'year';
    description.textContent = annual ? 'Hosting, eligible domain and baseline security' : 'Website updates and upkeep';
    const id = annual ? 'standard-infra' : 'essential-care';
    for (const output of outputs) output.textContent = 'Request a quote';
    if (!prices.size) await getPrice();
    if (trigger.getAttribute('aria-pressed') === 'true') {
      for (const output of outputs) output.textContent = prices.get(id) || 'Request a quote';
    }
  });
}

const contact = document.querySelector('[data-contact-form] select');
const selection = new URL(location.href).searchParams.get('service');
if (contact && [...contact.options].some(option => option.value === selection)) contact.value = selection;

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      element.dataset.animate = 'reveal';
      if (element.hasAttribute('data-stagger')) {
        for (const [i,child] of [...element.children].entries()) {
          child.style.setProperty('--delay', Math.min(i,6)*45+'ms');
          child.dataset.animate = 'reveal';
        }
      }
      observer.unobserve(element);
    }
  }, {threshold:.12});
  for (const element of document.querySelectorAll('[data-reveal],[data-stagger]')) observer.observe(element);
}
