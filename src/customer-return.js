export function customerReturnPath(value, fallback) {
  if(typeof value==='string'&&/^\/api\/auramenu\/connect\?challenge=[A-Za-z0-9_-]{43}&state=[A-Za-z0-9_-]{16,64}$/.test(value))return value;
  if(typeof value==='string'&&value.length<=2048&&/^\/hub(?:\/(?:roadmap|auri|work|requests|menu-drafts|onboarding|profile|settings|tasks|invoices|team|resources|simulator))?(?:\?[^#\r\n]*)?$/.test(value))return value;
  return ['/hub', '/account', '/shop/checkout'].includes(value)
    || (typeof value === 'string' && /^\/shop\/orders\/[a-f0-9-]{36}$/.test(value))
    ? value
    : fallback;
}
