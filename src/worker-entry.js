import app from './worker.js';
import { handleAuraMenuDashboard } from './auramenu-dashboard.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if ((url.pathname === '/quicksite' || url.pathname === '/quicksite/') && request.method === 'GET') {
      const assetUrl = new URL('/quicksite-v2.html', url);
      return Response.redirect(assetUrl.toString(), 302);
    }
    const dashboardResponse = await handleAuraMenuDashboard(request, env);
    if (dashboardResponse) return dashboardResponse;
    return app.fetch(request, env, ctx);
  },
};
