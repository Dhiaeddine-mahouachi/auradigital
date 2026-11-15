export function customerReturnPath(value, fallback) {
  return ['/hub', '/account', '/shop/checkout'].includes(value)
    || (typeof value === 'string' && /^\/shop\/orders\/[a-f0-9-]{36}$/.test(value))
    ? value
    : fallback;
}
