import { ApiError, json } from './http.js';

export function securityEvent(request, event, status) {
  // Fixed fields only: no bodies, cookies, tokens, query strings, IPs or exception text.
  const parts = new URL(request.url).pathname.split('/');
  const area = ['admin', 'employee', 'auramenu', 'nfc', 'track'].includes(parts[2]) ? parts[2] : 'other';
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), service: 'auradigital',
    category: 'security', event, area, method: request.method, status }));
}

export async function requestPolicy(request, env) {
  const url = new URL(request.url);
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
    if (!['GET', 'HEAD'].includes(request.method)) return json({ error: 'HTTPS required.' }, 400);
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 308);
  }
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return json({ error: 'Invalid path.' }, 400); }
  if (path.includes('\\') || /[\x00-\x1f]/.test(path) || path.split('/').includes('..')) return json({ error: 'Invalid path.' }, 400);
  if (!url.pathname.startsWith('/api/')) return null;
  if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(request.method)) return json({ error: 'Method not allowed.' }, 405);
  if (!env.DB || !env.TRACK_RATE_LIMITER?.limit || !env.LOGIN_RATE_LIMITER?.limit) {
    return json({ error: 'Service temporarily unavailable.' }, 503);
  }
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const isLogin = /\/api\/(admin|employee)\/(login|bootstrap)$/.test(url.pathname);
  const limiter = isLogin ? env.LOGIN_RATE_LIMITER : env.TRACK_RATE_LIMITER;
  const result = await limiter.limit({ key: `${isLogin ? 'auth' : 'api'}-ip:${ip}` });
  if (!result.success) return json({ error: 'Too many requests.' }, 429, { 'Retry-After': '60' });
  return null;
}

export function secureResponse(response, request) {
  const headers = new Headers(response.headers);
  headers.set('Strict-Transport-Security', 'max-age=31536000');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  if (!headers.has('Referrer-Policy')) headers.set('Referrer-Policy', 'no-referrer');
  if (!headers.has('Content-Security-Policy')) headers.set('Content-Security-Policy',
    (headers.get('Content-Type') || '').includes('text/html')
      ? "default-src 'self'; script-src 'self' 'sha256-UAGFOclbJeOTJt6ykzUdMkWrB/JUYHloVyIHrRTFOAQ='; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self'; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
      : "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (new URL(request.url).pathname.startsWith('/api/admin/')) headers.set('Cache-Control', 'no-store');
  for (const name of ['Server', 'X-Powered-By']) headers.delete(name);
  if ([401, 403, 429].includes(response.status)) securityEvent(request, 'request_denied', response.status);
  if (response.ok && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) securityEvent(request, 'mutation_succeeded', response.status);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function errorResponse(error, request) {
  const status = error instanceof ApiError ? error.status : 500;
  securityEvent(request, 'request_error', status);
  return json({ error: error instanceof ApiError && status < 500 ? error.message : 'Server error.' }, status);
}
