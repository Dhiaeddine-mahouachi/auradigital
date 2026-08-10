(() => {
  const modal = document.getElementById("menuChoiceModal");
  if (!modal) return;
  const selfLink = document.getElementById("menuSelfBuild");
  const managedLink = document.getElementById("menuManagedBuild");
  const designLabel = document.getElementById("menuChoiceDesign");
  let template = "modern";
  function updateLinks() {
    const domain = modal.querySelector('[name="menuDomainMode"]:checked')?.value || "auramenu";
    const base = "https://auramenu.space/builder.html";
    selfLink.href = `${base}?template=${encodeURIComponent(template)}&mode=self&domain=${encodeURIComponent(domain)}`;
    managedLink.href = `${base}?template=${encodeURIComponent(template)}&mode=managed&domain=${encodeURIComponent(domain)}`;
  }
  function openChoice(trigger) {
    template = trigger.dataset.template || "modern";
    designLabel.textContent = trigger.dataset.design || "AuraMenu";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateLinks();
    modal.querySelector("input:checked")?.focus();
  }
  function closeChoice() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-menu-choice]").forEach((trigger) => trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openChoice(trigger);
  }));
  modal.querySelectorAll('[name="menuDomainMode"]').forEach((input) => input.addEventListener("change", updateLinks));
  modal.querySelectorAll("[data-menu-choice-close]").forEach((button) => button.addEventListener("click", closeChoice));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeChoice(); });
})();