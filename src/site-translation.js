import publicCopy from '../site-translation-source.json' with { type: 'json' };
import { json, readJson } from './http.js';

const allowed = new Set(publicCopy);
const target = { tr: 'turkish', ar: 'arabic' };
const model = '@cf/meta/m2m100-1.2b';
const inFlight = new Map();

async function cachedTranslation(text, lang, origin, env, ctx) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const key = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  const cacheKey = new Request(new URL('/__site-copy/v1/' + lang + '/' + key, origin));
  const cache = globalThis.caches?.default;
  const cached = await cache?.match(cacheKey);
  if (cached) return cached.text();

  const id = lang + ':' + key;
  if (!inFlight.has(id)) {
    const job = (async () => {
      const result = await env.AI.run(model, {
        text,
        source_lang: /[ğışİĞŞ]/u.test(text) ? 'turkish' : 'english',
        target_lang: target[lang],
      });
      const value = result?.translated_text?.trim();
      if (!value || value.length > text.length * 5 + 50) return null;
      if (value === text) return null;
      if (cache) ctx.waitUntil(cache.put(cacheKey, new Response(value, {
        headers: { 'Cache-Control': 'public, max-age=2592000' },
      })).catch(() => {}));
      return value;
    })().catch(() => null).finally(() => inFlight.delete(id));
    inFlight.set(id, job);
  }
  return inFlight.get(id);
}

export async function translateSiteCopy(request, env, ctx) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
  const url = new URL(request.url);
  if (request.headers.get('Origin') && request.headers.get('Origin') !== url.origin) {
    return json({ error: 'Invalid origin.' }, 403);
  }
  const { lang, phrases } = await readJson(request, 14000);
  if (!Object.hasOwn(target, lang) || !Array.isArray(phrases) || !phrases.length || phrases.length > 36 ||
      phrases.some(phrase => typeof phrase !== 'string' || !allowed.has(phrase))) {
    return json({ error: 'Only published AuraDigital copy can be translated.' }, 400);
  }
  if (!env.AI?.run) return json({ error: 'Translation is temporarily unavailable.' }, 503);

  const result = {};
  const unique = [...new Set(phrases)];
  for (let index = 0; index < unique.length; index += 6) {
    await Promise.all(unique.slice(index, index + 6).map(async phrase => {
      const translation = await cachedTranslation(phrase, lang, url.origin, env, ctx);
      if (translation) Object.defineProperty(result, phrase, { value: translation, enumerable: true });
    }));
  }
  return json({ translations: result });
}
