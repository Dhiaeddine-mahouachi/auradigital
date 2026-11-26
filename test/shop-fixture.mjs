import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { d1 } from './d1.mjs';
import { handleShop } from '../src/shop.ts';
import { ApiError } from '../src/http.js';

export async function shopFixture() {
  const sqlite = new DatabaseSync(':memory:'); sqlite.exec('PRAGMA foreign_keys = ON');
  sqlite.exec(await readFile(new URL('../migrations/0001_admin_security.sql', import.meta.url), 'utf8'));
  sqlite.exec(await readFile(new URL('../migrations/0022_shop_catalog.sql', import.meta.url), 'utf8'));
  const root = resolve(new URL('..', import.meta.url).pathname);
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
  const env = { DB: d1(sqlite), LOGIN_RATE_LIMITER: { async limit() { return { success: true }; } }, CONTACT_RATE_LIMITER: { async limit() { return { success: true }; } }, ASSETS: { async fetch(request) {
    const path = resolve(root, '.' + new URL(request.url).pathname);
    if (!path.startsWith(root + '/')) return new Response('Forbidden', { status: 403 });
    try { const bytes = await readFile(path); return new Response(request.method === 'HEAD' ? null : bytes, { headers: { 'Content-Type': types[extname(path)] || 'application/octet-stream' } }); }
    catch { return new Response('Not found', { status: 404 }); }
  } } };
  return { env, sqlite };
}

export async function shopServer() {
  const fixture = await shopFixture();
  const server = createServer(async (req, res) => {
    try {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      // Translate the production secure cookie only on this in-memory HTTP
      // browser fixture, so browser tests can use the real session handlers.
      const headers = new Headers(req.headers);
      const cookie = headers.get('Cookie');
      if (cookie) headers.set('Cookie', cookie.replace(/(^|;\s*)aura_qa_customer=/g, '$1__Host-aura_customer='));
      const request = new Request(`http://127.0.0.1:${server.address().port}${req.url}`, { method: req.method, headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) }) });
      const response = await handleShop(request, fixture.env) || await fixture.env.ASSETS.fetch(request);
      const outgoing = Object.fromEntries(response.headers);
      const cookies = response.headers.getSetCookie();
      if (cookies.length) outgoing['set-cookie'] = cookies.map(value => value.startsWith('__Host-aura_customer=') ?
        value.replace('__Host-aura_customer=', 'aura_qa_customer=').replace(/; Secure(?=;|$)/, '') : value);
      res.writeHead(response.status, outgoing); res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) { res.writeHead(error instanceof ApiError ? error.status : 500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: error.message })); }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  return { ...fixture, server, base: `http://127.0.0.1:${server.address().port}`, async close() { await new Promise(done => server.close(done)); fixture.sqlite.close(); } };
}
