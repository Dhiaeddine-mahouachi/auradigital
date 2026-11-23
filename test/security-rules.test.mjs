// Automated enforcement of docs/SECURITY_RULES.md. Every rule here fails CI
// when it is broken, so security does not depend on remembering a document.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { hubFixture } from './hub-fixture.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const serverFiles = tracked.filter(f => /^src\/.*\.(js|ts)$/.test(f) && !f.startsWith('src/hub/') && !f.startsWith('src/shop/'));
const browserFiles = tracked.filter(f => /\.(js|mjs)$/.test(f) && !/^(test|scripts|tools|node_modules|soc-worker|security)\//.test(f) && !/\.min\.js$|media\/auri\/viewer\.js|^hub\/app\.js$|weddings\/vendor/.test(f));

test('R1 A03: SQL only interpolates server-defined identifiers, never request values', async () => {
 // Values must always be bound with "?". Interpolation is limited to these
 // server-side identifiers (table/column names from code, generated "?" lists).
 const allowed = /^(\w*[gG]uard\.sql|[\w.]+ \? '[^'$`]*' : '[^'$`]*'|placeholders|marks(\([^)]*\))?|where\.join\([^)]*\)|set|select|order|KEEP|MAX_[A-Z_]+|config\.(table|order)|meta\.(table|name|contact)|table|accepted|valid|updated|completed|condition|production|memberJoin|reviewedColumn|confirmation|tokenColumn|columns\.join\(","\)|assignments|scope === 'all' \? '1=1' : archived \? 'l\.archived_at IS NOT NULL' : 'l\.archived_at IS NULL'|archived \? [^}]+|phoneCols[^}]*|fields\.map[^}]*|phone \|\| "''"|c|f|ids\.map[^}]*|cols\.has[^}]*)$/;
 const offenders = [];
 for (const file of serverFiles) {
  const src = await read(file);
  for (const m of src.matchAll(/prepare\(\s*`([^`]*)`/g)) {
   for (const expr of m[1].matchAll(/\$\{([^{}]+)\}/g)) if (!allowed.test(expr[1].trim())) offenders.push(`${file}: \${${expr[1].trim()}}`);
  }
 }
 assert.deepEqual(offenders, [], 'Bind values with ? instead of interpolating them into SQL (or add a reviewed identifier to the allowlist).');
});

test('R2 A03: no eval, new Function, document.write or string timers anywhere', async () => {
 const offenders = [];
 for (const file of [...serverFiles, ...browserFiles]) {
  const src = await read(file);
  if (/\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(|set(?:Timeout|Interval)\(\s*['"`]/.test(src)) offenders.push(file);
 }
 assert.deepEqual(offenders, []);
});

test('R3 A02: server code uses crypto randomness for anything secret', async () => {
 const offenders = [];
 for (const file of serverFiles) {
  const src = await read(file);
  for (const line of src.split('\n')) if (/Math\.random\(/.test(line) && !/setTimeout|jitter|resolve,\s*\d+\s*\+/.test(line)) offenders.push(`${file}: ${line.trim().slice(0, 80)}`);
 }
 assert.deepEqual(offenders, [], 'Use crypto.getRandomValues / crypto.randomUUID for tokens, ids and secrets.');
});

test('R4 A02/A05: no secrets committed (the repository is public)', async () => {
 const pattern = /(AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{16,}|sk-[A-Za-z0-9]{32,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|re_[A-Za-z0-9]{8}_[A-Za-z0-9]{20,})/;
 const offenders = [];
 for (const file of tracked) {
  if (/\.(png|jpe?g|webp|gif|ico|woff2?|ttf|glb|mp4|webm|pdf|zip)$/i.test(file) || file === 'package-lock.json') continue;
  const src = await read(file).catch(() => '');
  if (pattern.test(src)) offenders.push(file);
 }
 assert.deepEqual(offenders, [], 'Secrets belong in Cloudflare secrets (wrangler secret put), never in the repository.');
 assert(!tracked.some(f => /(^|\/)(\.env(\..*)?|\.dev\.vars.*|.*\.pem|.*\.key|id_rsa)$/.test(f)), 'secret files must never be tracked');
});

test('R5 A05: private files are excluded from public static assets', async () => {
 const ignore = (await read('.assetsignore')).split('\n').map(s => s.trim());
 for (const entry of ['src/**', 'migrations/**', 'scripts/**', 'test/**', 'tools/**', 'docs/**', '.git/**', '.github/**', 'wrangler.jsonc', '.env*', '.dev.vars*', 'package*.json', 'SECURITY*.md', 'CLAUDE.md', '*.sql', 'soc-worker/**', 'security/siem/**'])
  assert(ignore.includes(entry), `.assetsignore must contain ${entry}`);
});

test('R6 A08: GitHub Actions are pinned to full commit SHAs', async () => {
 const dir = new URL('.github/workflows/', root);
 const offenders = [];
 for (const name of await readdir(dir)) {
  const src = await readFile(new URL(name, dir), 'utf8');
  for (const m of src.matchAll(/uses:\s*([^\s#]+)/g)) if (!/@[0-9a-f]{40}$/.test(m[1])) offenders.push(`${name}: ${m[1]}`);
 }
 assert.deepEqual(offenders, [], 'Pin every action to a 40-character commit SHA (keep the version as a comment).');
});

test('R7 A05: every response carries the security headers; HTML scripts are locked down', async () => {
 const f = await hubFixture();
 const { secureResponse } = await import('../src/security-policy.js');
 const html = secureResponse(new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } }), new Request('https://aura.test/'), {}, null);
 const csp = html.headers.get('Content-Security-Policy');
 assert.match(csp, /default-src 'self'/);
 assert.doesNotMatch(csp.match(/script-src[^;]*/)[0], /'unsafe-inline'|'unsafe-eval'/, 'scripts must never allow inline or eval');
 assert.match(csp, /object-src 'none'/);
 assert.match(csp, /base-uri 'self'/);
 assert.equal(html.headers.get('X-Content-Type-Options'), 'nosniff');
 assert.match(html.headers.get('Strict-Transport-Security'), /max-age=31536000/);
 const api = await f.call('/api/hub/workspaces', null);
 assert.equal(api.status, 401);
 assert.match(api.headers.get('Content-Type'), /application\/json/);
});

test('R8 A01: cookie-authenticated writes reject other origins', async () => {
 const f = await hubFixture();
 const owner = await f.user('origin-check@example.test', true);
 const { id } = await (await f.call('/api/hub/workspaces', owner, 'POST', { profile: { name: 'Origin Co', industry: 'other', capabilities: [], currency: 'USD' }, mode: 'myself' })).json();
 const evil = { Origin: 'https://evil.example' };
 for (const [path, method, body] of [
  ['/api/hub/workspaces', 'POST', { profile: { name: 'X', capabilities: [] }, mode: 'myself' }],
  [`/api/hub/workspaces/${id}/profile`, 'PUT', { profile: { name: 'X', capabilities: [] }, mode: 'myself', version: 1 }],
  [`/api/hub/workspaces/${id}/leads`, 'POST', { name: 'Injected' }],
  [`/api/hub/workspaces/${id}/auri-history`, 'POST', { messages: [{ role: 'me', text: 'x' }] }],
  [`/api/hub/workspaces/${id}/logo`, 'DELETE'],
  ['/api/hub/me/photo', 'DELETE'],
  ['/api/hub/me/sessions', 'POST', { action: 'revoke-others' }],
 ]) assert.equal((await f.call(path, owner, method, body, evil)).status, 403, `${method} ${path} must reject a foreign Origin`);
});

test('R9 A01: one account can never read or change another workspace', async () => {
 const f = await hubFixture();
 const a = await f.user('tenant-a@example.test', true), b = await f.user('tenant-b@example.test', true);
 const { id } = await (await f.call('/api/hub/workspaces', a, 'POST', { profile: { name: 'Tenant A', industry: 'other', capabilities: [], currency: 'USD' }, mode: 'myself' })).json();
 for (const [path, method, body] of [
  [`/api/hub/workspaces/${id}`, 'GET'], [`/api/hub/workspaces/${id}/leads`, 'GET'], [`/api/hub/workspaces/${id}/leads`, 'POST', { name: 'Intruder' }],
  [`/api/hub/workspaces/${id}/logo`, 'GET'], [`/api/hub/workspaces/${id}/auri-history`, 'GET'], [`/api/hub/workspaces/${id}/connected`, 'GET'],
  [`/api/hub/workspaces/${id}/work`, 'GET'], [`/api/hub/workspaces/${id}/profile`, 'PUT', { profile: { name: 'Hijack', capabilities: [] }, mode: 'myself', version: 1 }],
 ]) assert.equal((await f.call(path, b, method, body)).status, 404, `${method} ${path} must not be reachable by another account`);
});

test('R10 A07: sessions use hardened cookies and strong passwords', async () => {
 const f = await hubFixture();
 const weak = await f.call('/api/customer/register', null, 'POST', { name: 'Weak Pass', email: 'weak@example.test', password: 'short', acceptTerms: true });
 assert.equal(weak.status, 400);
 const ok = await f.call('/api/customer/register', null, 'POST', { name: 'Strong Pass', email: 'strong@example.test', password: 'a-long-enough-passphrase', acceptTerms: true });
 const cookie = ok.headers.get('Set-Cookie');
 assert.match(cookie, /^__Host-aura_customer=/);
 for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/']) assert(cookie.includes(flag), `session cookie needs ${flag}`);
 const wrong = await f.call('/api/customer/login', null, 'POST', { email: 'strong@example.test', password: 'not-the-password-1' });
 const missing = await f.call('/api/customer/login', null, 'POST', { email: 'nobody@example.test', password: 'not-the-password-1' });
 assert.deepEqual([wrong.status, (await wrong.json()).error], [missing.status, (await missing.json()).error], 'login must not reveal whether an email has an account');
});

test('R11 A09: server errors are generic and never leak internals', async () => {
 const { errorResponse } = await import('../src/security-policy.js');
 const { ApiError } = await import('../src/http.js');
 for (const error of [new Error('SQLITE_ERROR: no such table: secrets at /src/x.js:1'), new ApiError(500, 'D1 exploded at /src/worker.js')]) {
  const res = errorResponse(error, new Request('https://aura.test/api/x'), {}, { waitUntil() {} });
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: 'Server error.' });
 }
});
