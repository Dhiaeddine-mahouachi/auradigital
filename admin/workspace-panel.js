(() => {
  const core = document.createElement("script");
  core.src = "/admin/workspace-panel-core.js";
  core.onload = () => {
    const crm = document.createElement("script");
    crm.async = false;
    crm.src = "/admin/crm-panel.js?v=20261121";
    document.body.appendChild(crm);
    const clientPanel = document.createElement("script");
    clientPanel.async = false;
    clientPanel.src = "/admin/client-panel.js";
    document.body.appendChild(clientPanel);
  };
  document.body.appendChild(core);
})();