// Cloudflare Turnstile human verification for customer sign-in, sign-up and
// password recovery. Local environments can run without either binding.
import { ApiError } from './http.js';

export function turnstileSiteKey(env) {
  return env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY ? String(env.TURNSTILE_SITE_KEY) : '';
}

export async function verifyTurnstile(request, env, token) {
  if (!env.TURNSTILE_SITE_KEY && !env.TURNSTILE_SECRET_KEY) return true;
  if (!turnstileSiteKey(env)) throw new ApiError(503, 'Human verification is temporarily unavailable. Please try again.');
  if (typeof token !== 'string' || !token || token.length > 2048) throw new ApiError(400, 'Please complete the human verification check.');
  const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.set('remoteip', ip);
  let result;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form, redirect: 'manual', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Siteverify request failed');
    result = await response.json();
  } catch {
    throw new ApiError(503, 'Human verification is temporarily unavailable. Please try again.');
  }
  if (result?.success !== true || result.hostname !== new URL(request.url).hostname) {
    throw new ApiError(400, 'Human verification failed. Please try again.');
  }
  return true;
}

export function turnstileCsp(policy) {
  const add = (p, directive, source) => new RegExp(`(^|;)\\s*${directive}\\s`).test(p)
    ? p.replace(new RegExp(`(${directive}\\s[^;]*)`), `$1 ${source}`)
    : `${p}; ${directive} ${source}`;
  let next = add(policy, 'script-src', 'https://challenges.cloudflare.com');
  next = add(next, 'connect-src', 'https://challenges.cloudflare.com');
  next = next.replace(/;?\s*frame-src\s+[^;]+/, '');
  return `${next}; frame-src https://challenges.cloudflare.com`;
}
