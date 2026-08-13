import app from './worker.js';
import { handleAuraMenuDashboard } from './auramenu-dashboard.js';
import { handleAdminWorkspace } from './admin-workspace.js';
import { permanentSeoRedirect, serveSeoAsset } from './seo.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'www.auradigital.ink') {
      url.hostname = 'auradigital.ink';
      return Response.redirect(url.toString(), 301);
    }
    if ((url.pathname === '/quicksite' || url.pathname === '/quicksite/') && (request.method === 'GET' || request.method === 'HEAD')) {
      const assetUrl = new URL('/quicksite-v2.html', url);
      return Response.redirect(assetUrl.toString(), 301);
    }

    const seoRedirect = permanentSeoRedirect(request);
    if (seoRedirect) return seoRedirect;

    const workspaceResponse = await handleAdminWorkspace(request, env);
    if (workspaceResponse) return workspaceResponse;
    const dashboardResponse = await handleAuraMenuDashboard(request, env);
    if (dashboardResponse) return dashboardResponse;

    const seoAssetResponse = await serveSeoAsset(request, env);
    if (seoAssetResponse) return seoAssetResponse;

    return app.fetch(request, env, ctx);
  },
};
