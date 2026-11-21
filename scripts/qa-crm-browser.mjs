// Local visual QA for the admin CRM: real CRM handler over an in-memory
// SQLite fixture, served to the static admin page through Playwright routes.
import { readFile, mkdir } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { chromium } from 'playwright';
import { d1 } from '../test/d1.mjs';
import { createSession, hashPassword } from '../src/security.js';
import { handleCrm } from '../src/crm.js';

const origin = process.env.ADMIN_CONTROL_TEST_ORIGIN || 'http://127.0.0.1:4196';
const out = process.env.CRM_SCREENSHOT_DIR || 'test-output';
await mkdir(out, { recursive: true });
const sqlite = new DatabaseSync(':memory:');
sqlite.exec(await readFile(new URL('../migrations/0001_admin_security.sql', import.meta.url), 'utf8'));
sqlite.exec(await readFile(new URL('./qa-crm-fixture.sql', import.meta.url), 'utf8'));
const db = d1(sqlite), owner = crypto.randomUUID();
await db.prepare('INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES (?,?,?,?,?)').bind(owner, 'founder', 'Founder', await hashPassword('SecureFounderPass2026!'), 'owner').run();
const cookie = '__Host-aura_admin=' + await createSession(db, owner);
const env = { DB: db };
const clients = () => sqlite.prepare('SELECT * FROM clients ORDER BY id').all();

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const errors = [];
for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', e => errors.push(name + ': ' + e.message));
  await page.route('**/api/admin/**', async route => {
    const r = route.request(), url = new URL(r.url());
    if (url.pathname.startsWith('/api/admin/crm/')) {
      const res = await handleCrm(new Request('https://auradigitalworks.com' + url.pathname + url.search, { method: r.method(), headers: { Origin: 'https://auradigitalworks.com', Cookie: cookie, 'Content-Type': 'application/json' }, body: r.method() === 'GET' ? undefined : r.postData() }), env);
      return route.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() });
    }
    const body = url.pathname === '/api/admin/session' ? { authenticated: true, user: { id: owner, username: 'founder', displayName: 'Founder', role: 'owner' } }
      : url.pathname === '/api/admin/clients' ? { items: clients() }
      : url.pathname === '/api/admin/overview' ? { leads: 2, activeClients: 1, openOrders: 1, unpaidInvoices: 1, recurringRevenue: 4900 }
      : /^\/api\/admin\/(nfc|auramenu|quicksite)\/\w+$/.test(url.pathname) && r.method() === 'PATCH' ? (() => { const [, t, id] = url.pathname.match(/admin\/(\w+)\/(\w+)/); const table = { nfc: 'nfc_requests', auramenu: 'auramenu_requests', quicksite: 'quicksite_projects' }[t]; const b = JSON.parse(r.postData()); if (b.status) sqlite.prepare(`UPDATE ${table} SET status=? WHERE id=?`).run(b.status, id); if (b.paymentStatus) sqlite.prepare(`UPDATE ${table} SET payment_status=? WHERE id=?`).run(b.paymentStatus, id); return { ok: true }; })()
      : { items: [] };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(origin + '/admin/index.html#clients', { waitUntil: 'networkidle' });
  await page.waitForSelector('.crm-inbox', { timeout: 15000 });
  await page.screenshot({ path: `${out}/crm-clients-${name}.png`, fullPage: true });
  if (name === 'desktop') {
    await page.fill('#crmSearch', 'kebap');
    await page.waitForSelector('#crmSearchResults button');
    await page.screenshot({ path: `${out}/crm-search.png` });
    await page.keyboard.press('Escape'); await page.mouse.click(5, 500);
  }
  await page.locator('[data-client-open="1"]').first().click();
  await page.locator('[data-client-tab="connected"]').click();
  await page.waitForSelector('.crm-grid');
  await page.screenshot({ path: `${out}/crm-client-${name}.png`, fullPage: true });
  if (name === 'desktop') {
    await page.selectOption('[data-crm-service="nfc"] select[data-field="paymentStatus"]', 'paid');
    await page.waitForFunction(() => document.querySelector('[data-crm-service="nfc"] select[data-field="paymentStatus"]')?.value === 'paid');
    if (sqlite.prepare("SELECT payment_status FROM nfc_requests WHERE id='n1'").get().payment_status !== 'paid') throw new Error('NFC payment update did not reach the service endpoint');
  }
  await page.close();
}
await browser.close();
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('CRM browser QA passed; screenshots in ' + out);
