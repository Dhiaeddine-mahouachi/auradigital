// AuraHub safety net: never leave a silent blank page. If the app fails to
// start, or has not drawn anything after a while, show what happened with a
// way to reload or sign out. Runs before the app modules.
(function () {
  'use strict';
  var shown = false, errors = [];
  var T = {
    en: ['AuraHub could not open', 'Something stopped the page from loading. Reload, and if it keeps happening send us the details below.', 'Reload', 'Sign out', 'Taking longer than expected…'],
    tr: ['AuraHub açılamadı', 'Sayfanın yüklenmesini bir şey engelledi. Yeniden yükleyin; devam ederse aşağıdaki ayrıntıları bize gönderin.', 'Yeniden yükle', 'Çıkış yap', 'Beklenenden uzun sürüyor…'],
    ar: ['تعذر فتح AuraHub', 'منع شيء ما تحميل الصفحة. أعد التحميل، وإذا تكرر ذلك أرسل لنا التفاصيل أدناه.', 'إعادة التحميل', 'تسجيل الخروج', 'يستغرق وقتًا أطول من المتوقع…'],
    fr: ['AuraHub n’a pas pu s’ouvrir', 'Un problème a empêché le chargement. Rechargez la page et, si cela continue, envoyez-nous les détails ci-dessous.', 'Recharger', 'Se déconnecter', 'Plus long que prévu…'],
  };
  function lang() {
    var l = 'en';
    try { l = new URLSearchParams(location.search).get('lang') || localStorage.getItem('aura-hub-language') || localStorage.getItem('aura-lang-choice-v3') || 'en'; } catch (e) {}
    return T[l] ? l : 'en';
  }
  function started() {
    var app = document.getElementById('app');
    return app && app.getAttribute('aria-busy') === 'false' && app.textContent.trim().length > 0;
  }
  function show(reason) {
    if (shown || started()) return;
    shown = true;
    var t = T[lang()], app = document.getElementById('app');
    if (!app) return;
    var detail = (errors.concat(reason ? [reason] : [])).join('\n').slice(0, 600);
    app.setAttribute('aria-busy', 'false');
    app.innerHTML = '<section class="hub-boot-error" role="alert"><h1></h1><p></p><pre></pre><div><button type="button" data-boot-reload></button> <button type="button" data-boot-logout></button></div></section>';
    app.querySelector('h1').textContent = t[0];
    app.querySelector('p').textContent = t[1];
    app.querySelector('pre').textContent = detail + '\n' + navigator.userAgent;
    app.querySelector('[data-boot-reload]').textContent = t[2];
    app.querySelector('[data-boot-logout]').textContent = t[3];
    app.querySelector('[data-boot-reload]').onclick = function () { location.reload(); };
    app.querySelector('[data-boot-logout]').onclick = function () {
      fetch('/api/customer/logout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        .catch(function () {}).then(function () {
          try { sessionStorage.clear(); } catch (e) {}
          location.assign('/hub/login');
        });
    };
  }
  // Send a short, anonymous error report to the Worker logs (max 5 per page).
  var reported = 0;
  function report(message, where) {
    if (reported++ >= 5) return;
    try {
      var body = JSON.stringify({ message: String(message || '').slice(0, 300), where: String(where || '').slice(0, 200), page: location.pathname, lang: document.documentElement.lang });
      fetch('/api/hub/client-error', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  window.addEventListener('error', function (event) {
    var where = event.filename ? ' (' + String(event.filename).replace(location.origin, '') + ':' + event.lineno + ')' : '';
    errors.push(String(event.message || 'Script error') + where);
    report(event.message || 'Script error', where);
    if (!started()) setTimeout(function () { show(); }, 1500);
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    var r = event.reason;
    errors.push('Unhandled: ' + String(r && (r.message || r)).slice(0, 200));
    report('Unhandled: ' + String(r && (r.message || r)).slice(0, 200), '');
    if (!started()) setTimeout(function () { show(); }, 1500);
  });
  // A module that never runs (blocked, old browser) leaves no error at all.
  setTimeout(function () {
    if (started()) return;
    var initial = document.querySelector('#app .initial');
    if (initial) initial.textContent = T[lang()][4];
  }, 6000);
  setTimeout(function () { if (!started()) report('Timed out before the first screen', ''); show('Timed out before the first screen'); }, 15000);
})();
