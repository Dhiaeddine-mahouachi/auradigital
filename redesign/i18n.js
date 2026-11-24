/* AuraDigital site translator: English source pages, Turkish and Arabic
 * phrase tables from /i18n/<lang>.json (built by tools/i18n/build.mjs).
 * The language choice is shared with AuraHub through localStorage. */
(function () {
  'use strict';
  var KEY = 'aura-lang-choice-v3';
  var LANGS = ['en', 'tr', 'ar'];
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/;
  var dict = null, lang = 'en', observer = null;
  var originalText = new WeakMap(), originalAttr = new WeakMap();
  var cache = {};
  var originalTitle = document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  var originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
  // Homepage SEO snippets. Keep the displayed language and description aligned.
  // French is ready for a future French UI; it is not a selectable locale yet.
  var homeDescriptions = {
    en: 'Grow your business with AuraDigital. Websites, AI solutions, local SEO, digital menus and digital marketing services for businesses in Istanbul.',
    tr: 'İşletmenizi AuraDigital ile büyütün. İstanbul\'da profesyonel web siteleri, yapay zekâ çözümleri, yerel SEO, dijital menüler ve dijital pazarlama.',
    ar: 'طوّر أعمالك مع AuraDigital. نقدم تصميم المواقع الإلكترونية، حلول الذكاء الاصطناعي، تحسين محركات البحث، القوائم الرقمية والتسويق الرقمي في إسطنبول.',
    fr: 'Développez votre entreprise avec AuraDigital : création de sites web, solutions IA, référencement local, menus numériques et marketing digital à Istanbul.'
  };
  var isHome = location.pathname === '/' || location.pathname === '/index.html';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function initialLang() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (LANGS.indexOf(q) >= 0) return q;
    var saved = store(KEY);
    if (LANGS.indexOf(saved) >= 0) return saved;
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) >= 0 ? nav : 'en';
  }

  var countdown = /^(\d+) days?, (\d+) hours?, (\d+) minutes?, (\d+) seconds? remaining$/;
  function lookup(text) {
    var key = norm(text);
    if (!key || !dict) return null;
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    var m = countdown.exec(key);
    if (m) return lang === 'tr'
      ? m[1] + ' gün, ' + m[2] + ' saat, ' + m[3] + ' dakika, ' + m[4] + ' saniye kaldı'
      : 'متبقٍ ' + m[1] + ' يوم و' + m[2] + ' ساعة و' + m[3] + ' دقيقة و' + m[4] + ' ثانية';
    return null;
  }

  function translateText(node) {
    var parent = node.parentNode;
    if (!parent || SKIP.test(parent.nodeName) || parent.closest && parent.closest('[data-no-translate],.lang-switch')) return;
    var current = node.nodeValue;
    var orig = originalText.get(node);
    // Page scripts may have re-rendered this node back to (new) English text.
    if (orig === undefined || (current !== orig.shown)) orig = { en: current, shown: current };
    var target = lang === 'en' ? orig.en : lookup(orig.en);
    if (target == null) { originalText.set(node, orig); return; }
    if (lang !== 'en') {
      var lead = orig.en.match(/^\s*/)[0], tail = orig.en.match(/\s*$/)[0];
      target = lead + target + tail;
    }
    orig.shown = target;
    originalText.set(node, orig);
    if (current !== target) node.nodeValue = target;
  }

  function translateAttrs(el) {
    if (el.closest && el.closest('[data-no-translate]')) return;
    var saved = originalAttr.get(el) || {};
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      var current = el.getAttribute(a);
      var rec = saved[a];
      if (!rec || current !== rec.shown) rec = { en: current, shown: current };
      var target = lang === 'en' ? rec.en : lookup(rec.en);
      if (target == null) { saved[a] = rec; continue; }
      rec.shown = target; saved[a] = rec;
      if (current !== target) el.setAttribute(a, target);
    }
    originalAttr.set(el, saved);
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.nodeName)) return;
    translateAttrs(root);
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n;
    while ((n = tw.nextNode())) {
      if (n.nodeType === 3) translateText(n);
      else if (!SKIP.test(n.nodeName)) translateAttrs(n);
    }
  }

  function applyChrome() {
    var html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'en' ? originalTitle : (lookup(originalTitle) || originalTitle);
    if (metaDesc) metaDesc.setAttribute('content', isHome ? homeDescriptions[lang] : (lang === 'en' ? originalDesc : (lookup(originalDesc) || originalDesc)));
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-set-lang') === lang));
  }

  function observe() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (records) {
      observer.disconnect();
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'characterData') translateText(r.target);
        else if (r.type === 'attributes') translateAttrs(r.target);
        else for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
      }
      applyChrome();
      observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function load(l) {
    if (l === 'en') return Promise.resolve(null);
    if (cache[l]) return Promise.resolve(cache[l]);
    return fetch('/i18n/' + l + '.json', { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('i18n ' + r.status); return r.json(); })
      .then(function (d) { cache[l] = d; return d; });
  }

  function setLang(l, save) {
    if (LANGS.indexOf(l) < 0) l = 'en';
    if (save) { store(KEY, l); store('aura-hub-language', l); }
    return load(l).then(function (d) {
      dict = d; lang = l;
      if (observer) observer.disconnect();
      walk(document.body);
      applyChrome();
      observer = null; observe();
      try { window.dispatchEvent(new CustomEvent('aura:lang', { detail: { lang: l } })); } catch (e) {}
    }).catch(function () {
      // Translation file unavailable: keep the English page usable.
      dict = null; lang = 'en'; applyChrome();
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest && e.target.closest('[data-set-lang]');
    if (!btn) return;
    e.preventDefault();
    setLang(btn.getAttribute('data-set-lang'), true);
  });

  // Links to AuraHub carry the language so the dashboard opens in the same one.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || lang === 'en') return;
    try {
      var u = new URL(a.getAttribute('href'), location.href);
      if (u.origin === location.origin && /^\/hub(\/|$)/.test(u.pathname) && !u.searchParams.has('lang')) {
        u.searchParams.set('lang', lang); a.setAttribute('href', u.pathname + u.search + u.hash);
      }
    } catch (err) {}
  }, true);

  // Keep the language choices first in the mobile navigation drawer.
  // The drawer is created dynamically, so a scoped flex order works after every render.
  var mobileLanguageStyle = document.createElement('style');
  mobileLanguageStyle.id = 'aura-mobile-language-first';
  mobileLanguageStyle.textContent = '@media(max-width:1180px){div.mob.pop:has(> .lang-switch[aria-label="Language"]){display:flex!important;flex-direction:column!important}div.mob.pop > .lang-switch[aria-label="Language"]{order:-1!important;margin-top:0!important;margin-bottom:12px!important;padding:8px 0;align-self:stretch;flex-shrink:0}}';
  document.head.appendChild(mobileLanguageStyle);

  window.AuraI18n = { setLang: function (l) { return setLang(l, true); }, get lang() { return lang; } };
  setLang(initialLang(), false);
})();
