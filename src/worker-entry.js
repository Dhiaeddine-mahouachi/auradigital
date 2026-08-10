import app from './security-entry.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if ((url.pathname === '/quicksite' || url.pathname === '/quicksite/') && request.method === 'GET') {
      const assetUrl = new URL('/quicksite-v2.html', url);
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }
    return app.fetch(request, env, ctx);
  },
};
