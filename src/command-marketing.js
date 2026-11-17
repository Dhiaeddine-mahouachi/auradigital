import { pagePaths } from '../marketing/src/pages.mjs';
import { pricingFor } from './global-pricing.js';

const pages = new Set(pagePaths);

export async function serveCommandMarketing(request, env) {
  if (!env.ASSETS || !['GET','HEAD'].includes(request.method)) return null;

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const detailRoute = /^\/(services|industries)\/[^/.]+$/.test(path);
  if (!pages.has(path) && !detailRoute) return null;

  if (url.pathname !== path) {
    url.pathname = path;
    return Response.redirect(url, 301);
  }

  const notFound = path === '/404' || !pages.has(path);
  const page = path === '/' ? '/index' : notFound ? '/404' : path;
  const asset = await env.ASSETS.fetch(new Request(new URL('/command-pages'+page+'.html', url), request));
  // An older asset bundle may still be active during a Worker rollout.
  if (!asset.ok) return null;

  const headers = new Headers(asset.headers);
  let response = asset;
  if (request.method === 'GET' && (path === '/' || path === '/pricing' || path.startsWith('/services'))) {
    const { engine } = await pricingFor(request, env);
    response = new HTMLRewriter().on('[data-price-id]', {
      element(element) {
        const item = engine.getItem(element.getAttribute('data-price-id'));
        if (item && Number.isFinite(item.price)) element.setInnerContent(engine.priceText(item, 'en'));
      },
    }).transform(asset);
    headers.delete('Content-Length');
    headers.delete('ETag');
    headers.set('Cache-Control', 'private, no-store');
  }
  return new Response(response.body, { status: notFound ? 404 : response.status, headers });
}
