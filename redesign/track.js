// Anonymous page views for Admin → Analytics: only the page path is sent,
// no cookies or personal data. Skipped when the browser asks not to track.
(function () {
  try {
    if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
    var body = JSON.stringify({ path: location.pathname });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    else fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
  } catch (e) {}
})();
