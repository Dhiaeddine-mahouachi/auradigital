(() => {
  const modal = document.getElementById("menuChoiceModal");
  if (!modal) return;
  const selfLink = document.getElementById("menuSelfBuild");
  const managedLink = document.getElementById("menuManagedBuild");
  const designLabel = document.getElementById("menuChoiceDesign");
  let template = "modern";

  function updateLinks() {
    const base = "https://auramenu.space/builder.html";
    selfLink.href = `${base}?template=${encodeURIComponent(template)}&mode=self`;
    managedLink.href = `${base}?template=${encodeURIComponent(template)}&mode=managed`;
  }

  function openChoice(trigger) {
    template = trigger.dataset.template || "modern";
    designLabel.textContent = trigger.dataset.design || "AuraMenu";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    updateLinks();
    selfLink.focus();
  }

  function closeChoice() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-menu-choice]").forEach((trigger) =>
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openChoice(trigger);
    }),
  );
  modal.querySelectorAll("[data-menu-choice-close]").forEach((button) =>
    button.addEventListener("click", closeChoice),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeChoice();
  });
})();
