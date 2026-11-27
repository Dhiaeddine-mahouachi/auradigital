// Local-only browser verification against the real shop router and in-memory D1.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const catalogThemes = JSON.parse(await readFile(new URL('../shop/catalog.seed.json', import.meta.url), 'utf8')).filter(theme => theme.orientation === 'Horizontal');
const catalogCount = catalogThemes.length;
import { shopServer } from '../test/shop-fixture.mjs';

const fixture = await shopServer(), folder = 'test-output/shop';
// Exercise first deployment without a separately applied shop migration.
fixture.sqlite.exec('DROP TABLE shop_card_themes');
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.SHOP_CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const errors = [];
async function pageFor(options = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => localStorage.setItem('aura-cookie-choice-v2', 'necessary'));
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return { page, context };
}
try {
  // One shop: the old catalogue, card pages and cart now live on /service-shop.
  { const { page, context } = await pageFor({ viewport: { width: 1440, height: 1000 } });
    await page.goto(fixture.base + '/shop'); await page.waitForURL('**/service-shop#cards');
    await page.waitForFunction(() => document.querySelectorAll('.nfc-slide').length >= 58);
    await page.goto(fixture.base + '/shop/cart'); await page.waitForURL('**/service-shop#cart');
    await page.getByRole('heading', { name: 'Your cart is empty.' }).waitFor();
    await page.goto(fixture.base + '/shop/cards/collection-beauty-lilac'); await page.waitForURL('**/service-shop?card=collection-beauty-lilac#cards');
    await page.waitForFunction(() => document.querySelector('.nfc-buy h2')?.textContent === 'Beauty Lilac');
    assert.equal(await page.locator('link[href*="/shop/shop.css"]').count(), 0, 'old shop stylesheet is gone');
    await context.close(); }

  const checkout = await pageFor({ viewport: { width: 1440, height: 1000 } });
  const cp = checkout.page;
  await cp.goto(fixture.base + '/shop/cards/collection-restaurant-terracotta');
  await cp.waitForFunction(() => document.querySelector('.nfc-buy h2')?.textContent === 'Restaurant Terracotta');
  await cp.getByRole('button', { name: 'More cards' }).click();
  await cp.getByRole('button', { name: 'Buy now' }).click();
  await cp.locator('.cart-line').waitFor();
  assert.equal(await cp.locator('.cart-line').count(), 1);
  assert.match(await cp.locator('.cart-box .sh-total b').textContent(), /₺1,200/);
  await cp.getByRole('link', { name: 'Sign in to check out' }).click();
  await cp.waitForURL('**/account/login?next=*');
  await cp.getByRole('link', { name: /Create an account/ }).click();
  await cp.locator('[name="name"]').fill('Browser Test Buyer');
  await cp.locator('[name="email"]').fill('browser-checkout@example.com');
  await cp.locator('[name="password"]').fill('Browser-checkout-password-42');
  await cp.locator('[name="acceptTerms"]').check();
  await cp.getByRole('button', { name: 'Create account & continue' }).click();
  await cp.waitForURL('**/shop/checkout'); await cp.locator('#shop-checkout-form').waitFor();
  assert.equal(await cp.locator('.shop-steps li.now').textContent(), '3Shipping');
  assert.ok(await cp.locator('[data-chrome="Header"] header.top a.cart-btn').count() >= 1, 'site header on checkout');
  assert.equal(await cp.locator('.shop-toolbar').count(), 0, 'no second shop bar');
  await cp.locator('[name="phone"]').fill('+90 555 555 55 55');
  await cp.locator('[name="business"]').fill('Browser Bistro');
  await cp.locator('[name="city"]').fill('Istanbul');
  await cp.locator('[name="address"]').fill('Example Test Street 10');
  await cp.locator('[name="postalCode"]').fill('34000');
  await cp.locator('[name^="destination-"]').fill('https://example.com/menu');
  await cp.locator('[name="acceptConditions"]').check();
  await cp.screenshot({ path: `${folder}/desktop-checkout.png`, fullPage: true });
  await cp.setViewportSize({ width: 390, height: 844 });
  assert.equal(await cp.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile checkout overflow');
  await cp.screenshot({ path: `${folder}/mobile-checkout.png`, fullPage: true });
  await cp.setViewportSize({ width: 1440, height: 1000 });
  await cp.getByRole('button', { name: 'Create order & show bank details' }).click();
  await cp.waitForURL('**/shop/orders/*'); await cp.locator('.shop-bank-card').waitFor();
  assert.equal(await cp.locator('.shop-bank-card h2').textContent(), '1,200 TL');
  assert.equal(await cp.locator('.shop-iban').inputValue(), 'TR94 0001 0090 1039 4706 2050 01');
  assert.equal(await cp.getByLabel('Recipient', { exact: true }).inputValue(), 'Dhiaeddine Mahouachi');
  await cp.screenshot({ path: `${folder}/bank-instructions.png`, fullPage: true });
  await cp.setViewportSize({ width: 390, height: 844 });
  assert.equal(await cp.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile bank instructions overflow');
  await cp.screenshot({ path: `${folder}/mobile-bank-instructions.png`, fullPage: true });
  await cp.setViewportSize({ width: 1440, height: 1000 });
  await cp.getByRole('button', { name: 'I have sent the transfer', exact: true }).click();
  await cp.getByRole('button', { name: 'Transfer reported · Awaiting verification' }).waitFor();
  assert.equal(fixture.sqlite.prepare('SELECT payment_status FROM shop_bank_orders').get().payment_status, 'awaiting_transfer');
  await cp.getByRole('link', { name: 'My account & orders' }).click(); await cp.locator('.shop-order-link').waitFor();
  assert.equal(await cp.locator('.shop-order-link').count(), 1);
  await cp.getByRole('button', { name: 'Sign out', exact: true }).click(); await cp.waitForURL('**/service-shop');
  await checkout.context.close();

  for (const width of [390, 768]) {
    const mobile = await pageFor({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.page.goto(fixture.base + '/shop/cards/collection-beauty-lilac');
    await mobile.page.waitForFunction(() => document.querySelector('.nfc-buy h2')?.textContent === 'Beauty Lilac');
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Shop overflow at ${width}px`);
    if (width === 390) {
      const header = mobile.page.locator('header.top');
      await header.getByRole('button', { name: 'Open menu' }).click();
      for (const path of ['/service-shop', '/service-shop?tab=cards', '/aura-menu', '/aura-weddings']) assert.equal(await header.locator(`a[href="${path}"]`).last().isVisible(), true, path);
      await header.getByRole('button', { name: 'Close menu' }).click();
    }
    await mobile.page.screenshot({ path: `${folder}/storefront-${width}.png` });
    await mobile.page.getByRole('button', { name: 'Buy now' }).tap();
    await mobile.page.locator('.cart-line').waitFor();
    await mobile.page.goto(fixture.base + '/shop/checkout'); await mobile.page.waitForURL('**/account/login?next=*');
    await mobile.page.locator('[name="email"]').waitFor();
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Account login overflow at ${width}px`);
    await mobile.page.screenshot({ path: `${folder}/account-login-${width}.png`, fullPage: true });
    await mobile.context.close();
  }
  const failure = await pageFor();
  await failure.page.route('**/api/shop/catalog', route => route.fulfill({ status: 503, body: '{}' }));
  await failure.page.goto(fixture.base + '/shop/checkout'); await failure.page.getByRole('button', { name: 'Try again' }).waitFor();
  await failure.context.close();
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('One shop: old catalogue/card/cart links redirect, new shop cart to signup, address and bank-transfer checkout, manual verification, account, mobile layout and load failure passed.');
} finally { await browser.close(); await fixture.close(); }
