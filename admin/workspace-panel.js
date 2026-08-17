(() => {
  const core = document.createElement("script");
  core.src = "/admin/workspace-panel-core.js";
  core.onload = () => {
    const clientPanel = document.createElement("script");
    clientPanel.src = "/admin/client-panel.js";
    document.body.appendChild(clientPanel);
  };
  document.body.appendChild(core);
})();