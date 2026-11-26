/* Browser QA for the 2026 redesign pages. No accounts, no database writes;
   the contact and AI endpoints are mocked with page.route. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const origin = process.env.REDESIGN_ORIGIN || 'http://127.0.0.1:4193';
const pages = ['/index.html', '/solutions.html', '/service-shop.html', '/packages.html', '/aura-menu.html', '/portfolio.html', '/help.html', '/about.html', '/contact.html'];
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
await mkdir('test-output', { recursive: true });

async function open(path, width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForFunction(() => document.getElementById('app')?.firstElementChild);
  return { page, errors };
}

try {
  for (const width of [1440, 1280, 390]) {
    for (const path of pages) {
      const { page, errors } = await open(path, width);
      assert.deepEqual(errors, [], `${path} @${width} JS errors`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `${path} @${width} horizontal overflow ${overflow}px`);
      assert.ok(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('600 40px "Geist"'); }), `${path} brand font`);
      assert.ok(await page.evaluate(() => { const i = document.querySelector('img[src*="ad-monogram"]'); return !!i && i.complete && i.naturalWidth > 0; }), `${path} logo`);
      if (path === '/index.html') await page.screenshot({ path: `test-output/redesign-home-${width}.png` });
      await page.close();
    }
  }

  // Header menus and mobile drawer
  { const { page } = await open('/index.html');
    await page.getByRole('button', { name: /^Solutions/ }).hover();
    assert.ok(await page.getByText('Not sure where to start?').isVisible(), 'solutions mega-menu');
    await page.close(); }
  { const { page } = await open('/index.html', 390);
    await page.getByRole('button', { name: 'Open menu' }).click();
    assert.ok(await page.locator('nav.mnav a[href="/contact"]').isVisible(), 'mobile drawer');
    await page.screenshot({ path: 'test-output/redesign-mobile-menu.png' });
    await page.close(); }

  // The drawn Auri face is the launcher: yellow tile, red unread badge until opened, eyes follow the pointer.
  { const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(origin + '/index.html', { waitUntil: 'domcontentloaded' });
    const fab = page.getByRole('button', { name: 'Open Auri chat', exact: true });
    await fab.waitFor();
    assert.equal(await fab.locator('svg.auri').count(), 1, 'drawn face');
    assert.equal(await fab.locator('img').count(), 0);
    assert.equal(await fab.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(225, 225, 0)');
    assert.equal(await fab.evaluate(el => getComputedStyle(el, '::after').content), '"1"');
    const box = await fab.boundingBox(); assert.equal(box.width, 44); assert.equal(box.height, 44);
    await fab.click();
    await page.getByRole('dialog', { name: 'Chat with Auri' }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('auri-seen')), true, 'badge clears');
    await page.close(); }

  // Auri: offline answers, live AI, and fallback when the API fails
  { const { page } = await open('/index.html');
    const fab = page.getByRole('button', { name: 'Open Auri chat', exact: true });
    await fab.click();
    await page.fill('#auri-input', 'how much is a website?');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[role=dialog]')?.textContent.includes('6,750'));
    await page.close(); }
  { const { page } = await open('/index.html');
    let n = 0;
    await page.route('**/api/ai/session', (r) => r.fulfill({ status: 201, contentType: 'application/json', body: '{"messages":[]}' }));
    await page.route('**/api/ai/message', (r) => (++n === 1 ? r.fulfill({ status: 200, contentType: 'application/json', body: '{"reply":"Live model reply","mode":"ai"}' }) : r.fulfill({ status: 503, body: 'down' })));
    await page.evaluate(() => { window.AURA_LIVE_API = true; });
    await page.getByRole('button', { name: 'Open Auri chat', exact: true }).click();
    await page.fill('#auri-input', 'hello'); await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[role=dialog]')?.textContent.includes('Live model reply'));
    await page.fill('#auri-input', 'prices'); await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('[role=dialog]')?.textContent.includes('13,400'), null, { timeout: 15000 });
    await page.close(); }

  // Contact form posts a valid CRM payload
  { const { page } = await open('/contact.html');
    let posted = null;
    await page.route('**/api/contact', async (route) => { posted = { body: JSON.parse(route.request().postData()), key: route.request().headers()['idempotency-key'] }; await route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true,"requestId":"WEB-qa-1"}' }); });
    await page.evaluate(() => { window.AURA_LIVE_API = true; });
    await page.getByRole('button', { name: /Send message/ }).click();
    assert.match(await page.getByRole('alert').textContent(), /name/);
    await page.fill('#c-name', 'QA Test'); await page.fill('#c-email', 'qa@example.com'); await page.fill('#c-phone', '+90 555 111 22 33');
    await page.fill('#c-msg', 'Testing the contact form'); await page.locator('input[type=checkbox]').check();
    await page.getByRole('button', { name: /Send message/ }).click();
    await page.waitForFunction(() => document.body.textContent.includes('WEB-qa-1'));
    assert.equal(posted.body.name, 'QA Test');
    assert.ok(posted.key && posted.key.length >= 16, 'idempotency key');
    await page.close(); }

  // Shop basket
  { const { page } = await open('/service-shop.html');
    await page.getByRole('button', { name: 'Care', exact: true }).click();
    await page.getByRole('button', { name: '+ Add' }).first().click();
    assert.match(await page.locator('aside').textContent(), /₺1,950\/month/);
    await page.close(); }

  // NFC card shop: swipe viewer, collection filter, shared cart, sign-in before payment
  { const { page } = await open('/service-shop.html?tab=cards');
    await page.waitForFunction(() => document.querySelectorAll('.nfc-slide').length >= 58);
    await page.getByRole('button', { name: 'Next design' }).click();
    await page.waitForFunction(() => document.querySelector('.nfc-count b')?.textContent === '2');
    await page.getByRole('button', { name: 'Food & drink' }).click();
    const n = await page.locator('.nfc-slide').count();
    assert.ok(n > 0 && n < 58, 'collection filter ' + n);
    await page.getByRole('button', { name: 'Buy now' }).click();
    await page.waitForFunction(() => document.querySelectorAll('.cart-line').length === 1);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aura.shop.cart.v1')));
    assert.equal(stored.version, 1); assert.equal(stored.items.length, 1);
    assert.match(await page.locator('.cart-box a.btn-main').getAttribute('href'), /^\/account\/login\?next=%2Fshop%2Fcheckout$/, 'sign in before payment');
    await page.screenshot({ path: 'test-output/redesign-cards.png' });
    await page.close(); }

  console.log('Redesign browser QA passed: 27 page/viewport loads, menus, Auri (offline, live, fallback), contact CRM post, shop basket, NFC card shop.');
} finally { await browser.close(); }
