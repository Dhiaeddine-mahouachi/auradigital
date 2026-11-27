/* AuraDigital site motion. Loaded in <head> (not deferred) so the "js" class is
   set before first paint; everything else waits for the hydrated DOM. All
   effects stay off when the visitor asks for reduced motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    // header border on scroll + reading progress
    var top = document.querySelector('.top');
    var prog = document.createElement('div'); prog.className = 'progress'; prog.setAttribute('aria-hidden', 'true'); document.body.appendChild(prog);

    // reveal on scroll (staggered siblings), including content added later
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (!el.style.getPropertyValue('--d') && el.parentElement) {
          var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('rv'); });
          el.style.setProperty('--d', (Math.max(0, sibs.indexOf(el)) * 0.08).toFixed(2) + 's');
        }
        el.classList.add('in'); io.unobserve(el);
        if (el.hasAttribute('data-count')) countUp(el);
        el.querySelectorAll && el.querySelectorAll('[data-count]').forEach(countUp);
        if (el.hasAttribute('data-seq')) playSeq(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
    function watch(scope) {
      (scope.querySelectorAll ? scope : document).querySelectorAll('.rv:not(.in),.split:not(.in),[data-seq]:not(.seq-on),.count-box:not(.in)').forEach(function (el) {
        if (el.classList.contains('split')) { requestAnimationFrame(function () { el.classList.add('in'); }); return; }
        if (el.hasAttribute('data-seq')) el.classList.add('seq-on');
        if (io && !reduce) io.observe(el); else { el.classList.add('in'); if (el.hasAttribute('data-seq')) playSeq(el); el.querySelectorAll('[data-count]').forEach(countUp); }
      });
    }
    watch(document);
    if ('MutationObserver' in window) new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) watch(n); }); }); }).observe(document.getElementById('app') || document.body, { childList: true, subtree: true });

    // numbers count up once
    function countUp(el) {
      if (el.dataset.counted) return; el.dataset.counted = '1';
      var to = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
      if (reduce || isNaN(to)) { el.textContent = isNaN(to) ? el.textContent : to.toFixed(dec); return; }
      var t0 = performance.now(), dur = 1400;
      (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); })(t0);
      setTimeout(function () { el.textContent = to.toFixed(dec); }, dur + 200);
    }

    // chat bubbles: message, typing, reply, loop
    function playSeq(box) {
      var parts = Array.prototype.slice.call(box.children);
      function run() {
        parts.forEach(function (p) { p.classList.remove('show'); });
        if (reduce) { parts.forEach(function (p) { if (!p.classList.contains('typing')) p.classList.add('show'); }); return; }
        var t = 300;
        parts.forEach(function (p) {
          if (p.classList.contains('typing')) { setTimeout(function () { p.classList.add('show'); }, t); t += 1300; setTimeout(function () { p.classList.remove('show'); }, t); }
          else { setTimeout(function () { p.classList.add('show'); }, t); t += 700; }
        });
        setTimeout(run, t + 5000);
      }
      run();
    }

    // cursor spotlight on .glow surfaces
    document.addEventListener('pointermove', function (e) {
      var el = e.target && e.target.closest && e.target.closest('.glow'); if (!el) return;
      var b = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - b.left) + 'px'); el.style.setProperty('--my', (e.clientY - b.top) + 'px');
    }, { passive: true });

    // Auri faces: eyes + head follow the cursor, natural blinking, happy on main actions
    var px = innerWidth / 2, py = innerHeight / 3, faceTick = false;
    function faces() { return document.querySelectorAll('svg.auri'); }
    function look() {
      faceTick = false;
      faces().forEach(function (f) {
        var b = f.getBoundingClientRect(); if (!b.width || b.bottom < 0 || b.top > innerHeight) return;
        var dx = px - (b.left + b.width / 2), dy = py - (b.top + b.height / 2), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        var ex = dx / d * 7 * k, ey = dy / d * 5 * k;
        var eyes = f.querySelector('.a-eyes'), head = f.querySelector('.a-head');
        if (eyes) eyes.style.transform = 'translate(' + ex.toFixed(1) + 'px,' + ey.toFixed(1) + 'px)';
        if (head) head.style.transform = 'rotate(' + (dx / d * 6 * k).toFixed(1) + 'deg) translate(' + (ex * .3).toFixed(1) + 'px,' + (ey * .3).toFixed(1) + 'px)';
      });
    }
    function schedule() { if (!faceTick) { faceTick = true; requestAnimationFrame(look); } }
    window.auraMood = function (el, mood, ms) {
      (el ? [el] : Array.prototype.slice.call(faces())).forEach(function (f) {
        if (mood) f.setAttribute('data-mood', mood); else f.removeAttribute('data-mood');
        if (ms) setTimeout(function () { if (f.getAttribute('data-mood') === mood) f.removeAttribute('data-mood'); }, ms);
      });
    };
    if (!reduce) {
      addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; schedule(); }, { passive: true });
      (function blinkLoop() {
        faces().forEach(function (f) {
          if (Math.random() < 0.35) { var o = f.querySelector('.a-open'); if (o) { o.style.transform = 'scaleY(.08)'; setTimeout(function () { o.style.transform = ''; }, 130); } }
        });
        setTimeout(blinkLoop, 1400 + Math.random() * 1600);
      })();
      document.addEventListener('pointerover', function (e) { var b = e.target.closest && e.target.closest('.btn-main,.btn-acid'); if (b && !b.contains(e.relatedTarget)) window.auraMood(null, 'happy'); });
      document.addEventListener('pointerout', function (e) { var b = e.target.closest && e.target.closest('.btn-main,.btn-acid'); if (b && !b.contains(e.relatedTarget)) window.auraMood(null, null); });
    }

    // scroll-linked: header, progress, [data-tilt] flattens, [data-grow] scales up
    var ticking = false;
    function onScroll() {
      ticking = false;
      if (top) top.classList.toggle('scrolled', scrollY > 8);
      var max = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
      if (reduce) return;
      document.querySelectorAll('[data-tilt],[data-grow]').forEach(function (el) {
        var r = el.getBoundingClientRect(); if (r.top > innerHeight * 1.2 || r.bottom < -200) return;
        var k = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.85)));
        if (el.hasAttribute('data-tilt')) { el.style.setProperty('--tilt', (22 * (1 - k)).toFixed(2) + 'deg'); el.style.setProperty('--sc', (0.9 + 0.1 * k).toFixed(3)); }
        else el.style.setProperty('--rs', (0.9 + 0.1 * k).toFixed(3));
      });
      schedule();
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    addEventListener('resize', onScroll);
    onScroll(); look();
  });
})();

// Auri unread badge: hide it for good once the visitor opens Auri.
(function () {
  var root = document.documentElement;
  try { if (localStorage.getItem('auri-seen') === '1') root.classList.add('auri-seen'); } catch (e) {}
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.auri-fab, #chatLauncher, .auri-site-dock')) return;
    root.classList.add('auri-seen');
    try { localStorage.setItem('auri-seen', '1'); } catch (e2) {}
  }, true);
})();

// Anonymous, cookie-free counts: one page view per load and a few key clicks (same /api/track the old site used).
(function () {
  if (!/(^|\.)auradigitalworks\.com$/.test(location.hostname) && !window.AURA_TRACK_LOCAL) return;
  function send(path) {
    try { fetch('/api/track', { method: 'POST', keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: path }) }); } catch (e) {}
  }
  var p = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  send(p === '' ? '/' : p);
  var once = {};
  function ev(name, unique) { if (unique && once[name]) return; once[name] = 1; send('event:' + name); }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    var a = t.closest('a[href], button'); if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me|whatsapp\.com/.test(href)) return ev('whatsapp');
    if (a.closest('.salebar')) return ev('sale_bar');
    if (a.matches('.auri-fab, #chatLauncher')) return ev('auri_open', true);
    if (a.closest('.nfc-actions')) return ev(a.classList.contains('btn-acid') ? 'add_to_cart' : 'buy_now');
    if (a.classList.contains('sh-add')) return ev('add_to_cart');
    if (a.closest('.cart-box') && /^\/account\/(login|signup)/.test(href)) return ev('checkout_sign_in');
    if (a.closest('.cart-box') && href === '/shop/checkout') return ev('checkout_continue');
    if (a.closest('.planner') && a.classList.contains('btn-main')) return ev('start_path');
    if (/^\/contact(\b|$|\?|#)/.test(href)) return ev('contact_click');
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.closest) return;
    if (f.classList.contains('mailstart')) ev('start_email', true);
  }, true);
  window.auraTrack = function (name) { ev(name, true); };
})();
