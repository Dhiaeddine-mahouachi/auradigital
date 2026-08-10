import securityApp from './secure-worker.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // QuickSite V2 currently posts to the short alias. Internally route it to
    // the canonical protected endpoint so the page keeps working while new
    // requests receive private preview credentials.
    if (url.pathname === '/api/quicksite' && request.method === 'POST') {
      const canonicalUrl = new URL('/api/quicksite/projects', url);
      const canonicalRequest = new Request(canonicalUrl, request);
      const response = await securityApp.fetch(canonicalRequest, env, ctx);
      const contentType = response.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) return response;

      let data;
      try { data = await response.clone().json(); }
      catch { return response; }

      if (data?.request && !data.project) data.project = data.request;
      const headers = new Headers(response.headers);
      headers.delete('Content-Length');
      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return securityApp.fetch(request, env, ctx);
  },
};
