(() => {
  async function applySettings() {
    const targets = document.querySelectorAll("[data-setting]");
    if (!targets.length) return;

    try {
      const response = await fetch("/api/settings", { headers: { Accept: "application/json" } });
      if (!response.ok) return;
      const settings = await response.json();

      targets.forEach((element) => {
        const key = element.dataset.setting;
        if (!(key in settings)) return;
        const suffix = element.dataset.suffix || "";
        element.textContent = settings[key] + suffix;
      });
    } catch (_) {
      // Keep the hard-coded fallback value when the API is unavailable.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applySettings);
  } else {
    applySettings();
  }
})();
