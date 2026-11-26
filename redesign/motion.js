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
