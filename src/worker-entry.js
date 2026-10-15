import { handleGlobalPricing } from './global-pricing.js';
import { deliverRequestEmails } from "./request-delivery.js";
import { handleWeddings } from './weddings.js';
import { requestPolicy, secureResponse, errorResponse } from './security-policy.js';
import app from './worker.js';
import { handleAuraMenuDashboard } from './auramenu-dashboard.js';
import { handleAuraPopsAdmin } from './aurapops-admin.js';
import { handleAdminWorkspace } from './admin-workspace.js';
import { serveEmployeePortal } from './employee-portal.js';
import { permanentSeoRedirect, serveSeoAsset } from './seo.js';
import { handleAiEmployee, cleanupAiData } from './ai-employee.js';

const router = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === 'auradigital.ink' || url.hostname === 'www.auradigital.ink') {
      url.hostname = 'auradigitalworks.com';
      return Response.redirect(url.toString(), 301);
    }
    if (url.hostname === 'www.auradigitalworks.com') {
      url.hostname = 'auradigitalworks.com';
      return Response.redirect(url.toString(), 301);
    }

    const pricingResponse = await handleGlobalPricing(request,env);
    if(pricingResponse) return pricingResponse;
    const aiResponse = await handleAiEmployee(request, env, ctx);
    if (aiResponse) return aiResponse;
    const weddingResponse = await handleWeddings(request, env);
    if (weddingResponse) return weddingResponse;
    if (/^\/weddings\/i\/[a-f0-9-]+$/.test(url.pathname) && ['GET','HEAD'].includes(request.method)) {
      const asset = await env.ASSETS.fetch(new Request(new URL('/weddings/signature.html', url), request));
      const headers = new Headers(asset.headers);
      headers.set('X-Robots-Tag','noindex, nofollow');
      headers.set('Cache-Control','private, no-store');
      return new Response(asset.body,{status:asset.status,headers});
    }

    if (url.pathname.startsWith('/weddings/') && (request.method === 'GET' || request.method === 'HEAD')) {
      return env.ASSETS.fetch(new Request(url, request));
    }

    if ((url.pathname === '/restaurants/dashboard' || url.pathname === '/restaurants/dashboard/') && (request.method === 'GET' || request.method === 'HEAD')) {
      const assetUrl = new URL('/restaurants/dashboard/index.html', url);
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    const seoRedirect = permanentSeoRedirect(request);
    if (seoRedirect) return seoRedirect;

    const employeePortalResponse = await serveEmployeePortal(request, env);
    if (employeePortalResponse) return employeePortalResponse;

    const auraPopsAdminResponse = await handleAuraPopsAdmin(request, env);
    if (auraPopsAdminResponse) return auraPopsAdminResponse;
    const workspaceResponse = await handleAdminWorkspace(request, env);
    if (workspaceResponse) return workspaceResponse;
    const dashboardResponse = await handleAuraMenuDashboard(request, env);
    if (dashboardResponse) return dashboardResponse;

    const seoAssetResponse = await serveSeoAsset(request, env);
    if (seoAssetResponse) return seoAssetResponse;

    return app.fetch(request, env, ctx);
  },
};

export default {
  async scheduled(controller, env, ctx) {
    if (controller.cron === "0 3 * * *") ctx.waitUntil(cleanupAiData(env));
    ctx.waitUntil(deliverRequestEmails(env));
  },
  async fetch(request, env, ctx) {
    try {
      const rejection = await requestPolicy(request, env);
      return secureResponse(rejection || await router.fetch(request, env, ctx), request, env, ctx);
    } catch (error) {
      return secureResponse(errorResponse(error, request, env, ctx), request, env, ctx);
    }
  }
};
