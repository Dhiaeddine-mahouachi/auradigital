// Local-only browser verification against the real shop router and in-memory D1.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
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
  const { page, context } = await pageFor({ viewport: { width: 1440, height: 1000 } });
  await page.goto(fixture.base + '/shop');
  await page.locator('.shop-product').last().waitFor();
  assert.equal(await page.locator('.shop-product').count(), 8);
  const heroRatio = await page.locator('.shop-hero-art img').evaluate(el => el.clientWidth / el.clientHeight);
  assert.ok(Math.abs(heroRatio - 856 / 540) < 0.02, 'Hero artwork must preserve aspect ratio');
  assert.equal(await page.locator('#siteHeader a[href="/shop"]').count(), 1);
  const first = page.locator('.shop-scene').first();
  await first.hover(); assert.equal(await first.getAttribute('data-flipped'), 'true');
  await page.locator('#collection-title').hover(); assert.equal(await first.getAttribute('data-flipped'), 'false');
  const flip = page.locator('[data-flip]').first(); await flip.focus(); await flip.press('Space'); assert.equal(await flip.getAttribute('aria-pressed'), 'true'); await flip.press('Enter'); assert.equal(await flip.getAttribute('aria-pressed'), 'false');
  await page.locator('[data-enlarge]').first().click(); await page.locator('#shop-dialog').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#shop-dialog').evaluate(el => el.open), false);
  await page.locator('#shop-filters [name="category"]').selectOption('Restaurants'); assert.equal(await page.locator('.shop-product').count(), 1);
  await page.locator('[data-remove-filter="category"]').click(); assert.equal(await page.locator('.shop-product').count(), 8);
  await page.locator('#shop-search').fill('nothing matching this search'); assert.equal(await page.locator('.shop-product').count(), 0);
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click(); assert.equal(await page.locator('.shop-product').count(), 8);
  await page.screenshot({ path: `${folder}/desktop-storefront.png`, fullPage: true });
  await page.goto(fixture.base + '/shop/cards/oliva-bistro');
  await page.locator('[name="business"]').fill('Example Café');
  await page.locator('[name="destination"]').fill('https://example.com/menu');
  await page.locator('[name="quantity"]').fill('2');
  await page.locator('[name="instructions"]').fill('Please use our green logo.');
  assert.equal(await page.locator('input[type="file"]').isDisabled(), true);
  await page.getByRole('button', { name: 'Review & save demo to cart' }).click();
  assert.match(await page.locator('#shop-dialog').textContent(), /Example Café/);
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  assert.equal(await page.locator('[data-cart-count]').textContent(), '2');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `${folder}/desktop-detail.png`, fullPage: true });
  const toggle = page.getByRole('button', { name: 'Open shopping cart' });
  await toggle.click(); await page.locator('#shop-cart').waitFor({ state: 'visible' });
  assert.equal(await page.getByRole('button', { name: 'Checkout unavailable' }).isDisabled(), true);
  await page.keyboard.press('Escape');
  assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
  await page.goto(fixture.base + '/shop/cart'); await page.locator('[data-quantity]').waitFor();
  assert.equal(await page.locator('[data-quantity]').inputValue(), '2');
  await page.locator('[data-quantity]').fill('3'); await page.locator('[data-quantity]').press('Tab');
  await page.reload(); await page.locator('[data-quantity]').waitFor(); assert.equal(await page.locator('[data-quantity]').inputValue(), '3');
  await page.getByRole('link', { name: 'Edit details' }).click(); await page.locator('[name="business"]').waitFor();
  assert.equal(await page.locator('[name="business"]').inputValue(), 'Example Café');
  await page.locator('[name="business"]').fill('Updated Café');
  await page.getByRole('button', { name: 'Review changes' }).click(); await page.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForURL('**/shop/cart'); await page.getByText('Updated Café', { exact: false }).waitFor();
  assert.equal(await page.locator('.shop-cart-row').count(), 1);
  await page.getByRole('button', { name: 'Remove Oliva Bistro' }).click(); await page.getByRole('heading', { name: 'Your collection starts here.' }).waitFor();
  await context.close();

  for (const width of [390, 768]) {
    const mobile = await pageFor({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.page.goto(fixture.base + '/shop'); await mobile.page.locator('.shop-product').last().waitFor();
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}px`);
    await mobile.page.locator('[data-flip]').first().tap(); assert.equal(await mobile.page.locator('[data-flip]').first().getAttribute('aria-pressed'), 'true');
    if (width === 390) {
      await mobile.page.getByRole('button', { name: 'Filters', exact: false }).click();
      await mobile.page.locator('#shop-filters [name="category"]').selectOption('Beauty Salons & Spas');
      assert.equal(await mobile.page.locator('.shop-product').count(), 1);
      assert.equal(await mobile.page.locator('.shop-scene').getAttribute('data-orientation'), 'Vertical');
      await mobile.page.locator('[data-enlarge]').click(); await mobile.page.locator('#shop-dialog').waitFor({ state: 'visible' });
      await mobile.page.getByRole('button', { name: 'Close dialog' }).click();
      await mobile.page.goto(fixture.base + '/shop'); await mobile.page.locator('.shop-product').last().waitFor();
    }
    await mobile.page.screenshot({ path: `${folder}/storefront-${width}.png`, fullPage: true });
    await mobile.page.goto(fixture.base + '/shop/cards/luna-beauty-studio'); await mobile.page.locator('#shop-personalize').waitFor();
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Detail overflow at ${width}px`);
    await mobile.page.screenshot({ path: `${folder}/detail-${width}.png`, fullPage: true });
    await mobile.context.close();
  }
  const reduced = await pageFor({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  await reduced.page.goto(fixture.base + '/shop'); await reduced.page.locator('.shop-product').last().waitFor();
  assert.equal(await reduced.page.locator('.shop-flipper').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await reduced.context.close();
  const failure = await pageFor();
  await failure.page.route('**/api/shop/catalog', route => route.fulfill({ status: 503, body: '{}' }));
  await failure.page.goto(fixture.base + '/shop'); await failure.page.getByRole('button', { name: 'Try again' }).waitFor();
  await failure.context.close();
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('Desktop/mobile/tablet layout, mouse/keyboard/touch flips, dialogs, filters, cart persistence/edit/remove, demo checkout gate, reduced motion and load failure passed.');
} finally { await browser.close(); await fixture.close(); }
