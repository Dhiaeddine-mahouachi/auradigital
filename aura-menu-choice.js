(() => {
  const modal = document.getElementById("menuChoiceModal");
  if (!modal) return;
  const selfLink = document.getElementById("menuSelfBuild");
  const managedLink = document.getElementById("menuManagedBuild");
  const designLabel = document.getElementById("menuChoiceDesign");
  if (!selfLink || !managedLink || !designLabel) return;
  let template = "modern";
  let designName = "AuraMenu";

  function updateLinks() {
    const language =
      window.AuraI18n?.current?.() || document.documentElement.lang || "tr";
    const selfParams = new URLSearchParams({
      template,
      mode: "self",
      lang: language,
    });
    const managedParams = new URLSearchParams({
      service: "auramenu",
      template,
      design: designName,
      lang: language,
    });
    selfLink.href = `https://auramenu.space/builder.html?${selfParams}`;
    managedLink.href = `contact.html?${managedParams}`;
  }

  function openChoice(trigger) {
    template = trigger.dataset.template || "modern";
    designName = trigger.dataset.design || "AuraMenu";
    designLabel.textContent = designName;
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
