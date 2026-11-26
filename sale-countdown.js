/* Limited-time promotion: one fixed expiration for all visitors (Istanbul time). */
(() => {
  const banner = document.getElementById("aura-sale-bar");
  const clock = document.getElementById("aura-sale-countdown");
  if (!banner || !clock) return;

  const expiresAt = Date.parse(clock.getAttribute("datetime"));
  if (!Number.isFinite(expiresAt)) return;

  function updateCountdown() {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      banner.remove();
      return false;
    }
    if (clock.hasAttribute("data-static")) return true;
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor(remaining / 3600000) % 24;
    const minutes = Math.floor(remaining / 60000) % 60;
    const seconds = Math.floor(remaining / 1000) % 60;
    clock.textContent = [days, hours, minutes, seconds].map(v => String(v).padStart(2, "0")).join(":");
    clock.setAttribute("aria-label", days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds remaining");
    return true;
  }

  if (!updateCountdown()) return;
  const interval = setInterval(() => {
    if (!updateCountdown()) clearInterval(interval);
  }, 1000);
  window.addEventListener("pagehide", () => clearInterval(interval), { once: true });
})();
