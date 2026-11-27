// AuraHub 4 (Aura Command / Journey / Studio) browser QA against the local
// in-memory harness: `PORT=4173 node scripts/dev-hub.mjs`. Synthetic data only.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.HUB_TEST_ORIGIN || 'http://127.0.0.1:4173';
const out = process.env.HUB_SCREENSHOT_DIR || 'test-output';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
const errors = [];
const open = async (options = { viewport: { width: 1440, height: 960 } }) => {
 const context = await browser.newContext(options);
 const page = await context.newPage();
 page.setDefaultTimeout(12000);
 page.on('pageerror', e => errors.push(e.message));
 return page;
};
const noOverflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const shot = (page, name) => page.screenshot({ path: `${out}/aurahub4-${name}.png`, fullPage: true, animations: 'disabled' });
const step = name => console.log('·', name);

try {
 // --- Unauthenticated and failure states never leave "Opening your workspace…"
 step('signed-out /hub shows sign-in');
 const anon = await open();
 await anon.goto(base + '/hub');
 await anon.locator('#auth-form').waitFor();
 await anon.close();

 step('stalled workspace API resolves to an actionable error');
 const stalled = await open();
 await stalled.route('**/api/hub/workspaces', () => {});
 await stalled.goto(base + '/__qa/start');
 await stalled.locator('[data-retry-load]').waitFor({ timeout: 30000 });
 assert.match(await stalled.locator('[role=alert]').innerText(), /too long|offline/i);
 await stalled.unroute('**/api/hub/workspaces');
 await stalled.locator('[data-retry-load]').click();
 await stalled.locator('#os-greeting').waitFor();
 await stalled.close();

 step('server error on workspaces shows retry, not a blank page');
 const failing = await open();
 await failing.route('**/api/hub/workspaces', r => r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Temporary failure."}' }));
 await failing.goto(base + '/__qa/start');
 await failing.getByText('Temporary failure.').waitFor();
 assert(await failing.locator('[data-retry-load]').isVisible());
 await failing.close();

 // --- Aura Command
 const page = await open();
 await page.goto(base + '/__qa/start');
 step('Aura Command renders real data and setup states');
 await page.locator('#os-greeting').waitFor();
 assert.match(await page.locator('#os-greeting').innerText(), /Lumen Studio QA/);
 const nav = await page.locator('.sidebar nav a').allTextContents();
 assert.deepEqual(nav.map(s => s.trim()), ['Overview', 'My Business', 'Growth Roadmap', 'Aura Studio', 'My Services', 'Website & AuraMenu', 'Analytics', 'Auri Assistant', 'Requests', 'AuraMenu', 'Menu drafts', 'Orders & billing', 'Team', 'Settings', 'Help & support']);
 assert.equal(await page.locator('[data-kpi=visitors]').getByText('Not connected').count(), 1, 'visitors has no source, so no number');
 assert.equal(await page.locator('[data-kpi=bookings] .os-kpi-value').count(), 0);
 assert.equal(await page.locator('[data-kpi=services] .os-kpi-value').innerText(), '2');
 await page.getByRole('link', { name: 'Review your menu', exact: true }).waitFor();
 await page.getByRole('tab', { name: 'Visitors' }).click();
 await page.locator('#os-chart-panel').getByText('Not connected').waitFor();
 await page.getByRole('tab', { name: 'Visitors' }).press('ArrowRight');
 assert.equal(await page.getByRole('tab', { name: 'Reservations' }).getAttribute('aria-selected'), 'true');
 await shot(page, 'command-desktop');

 // --- Aura Studio pipeline
 step('Studio: create, move, annotate, archive a lead');
 await page.locator('.sidebar [data-page=studio]').click();
 await page.getByRole('heading', { name: 'Lead pipeline' }).waitFor();
 await page.getByRole('button', { name: 'Add inquiry' }).first().click();
 const dialog = page.locator('dialog[open]');
 await dialog.locator('[name=name]').fill('Ayşe — birthday table');
 await dialog.locator('[name=contact]').fill('+90 555 000 11 22');
 await dialog.locator('[name=source]').selectOption('whatsapp');
 await dialog.locator('[name=interest]').fill('Dinner for 12');
 await dialog.locator('[name=value]').fill('4200');
 await dialog.locator('[name=note]').fill('Asked about Friday evening.');
 await dialog.getByRole('button', { name: 'Add inquiry' }).click();
 const card = page.locator('.os-lead').filter({ hasText: 'Ayşe — birthday table' });
 await card.waitFor();
 assert.equal(await card.locator('xpath=ancestor::section[1]').getAttribute('data-column'), 'new');
 await card.locator('[data-move]').selectOption('proposal');
 await page.locator('[data-column=proposal] .os-lead').filter({ hasText: 'Ayşe' }).waitFor();
 await page.reload();
 await page.locator('[data-column=proposal] .os-lead').filter({ hasText: 'Ayşe' }).waitFor();
 await page.locator('[data-filter=q]').fill('nobody-matches');
 await page.getByText('No inquiries match your filters.').waitFor();
 await page.locator('[data-filter=q]').fill('');
 await page.locator('.os-lead-open').filter({ hasText: 'Ayşe' }).click();
 await page.locator('dialog[open] [name=note]').fill('Sent the set menu.');
 await page.locator('dialog[open]').getByRole('button', { name: 'Add note' }).click();
 await page.locator('dialog[open] .os-notes li').filter({ hasText: 'Sent the set menu.' }).waitFor();
 assert.equal(await page.locator('dialog[open] .os-notes li').count(), 2);
 assert.match(page.url(), /lead=/, 'an open lead is deep-linkable');
 await shot(page, 'studio-lead-dialog');
 await page.keyboard.press('Escape');
 await shot(page, 'studio-pipeline');

 step('Command reflects the logged inquiry');
 await page.locator('.sidebar [data-page=home]').click();
 assert.equal(await page.locator('[data-kpi=inquiries] .os-kpi-value').innerText(), '1');
 await page.locator('.os-timeline').getByText('New inquiry logged: Ayşe — birthday table').waitFor();
 assert.equal(await page.locator('.os-chart rect:not(.is-zero)').count(), 1);

 step('Studio modules render from real records');
 for (const [view, text] of [['delivery', 'Upcoming deadlines'], ['website', 'Request a content change'], ['menu', 'Menu drafts'], ['inbox', 'Not connected'], ['analytics', 'Inquiries by source']]) {
  await page.goto(base + '/hub/studio?view=' + view);
  await page.getByText(text).first().waitFor();
  await shot(page, 'studio-' + view);
 }
 await page.locator('.sidebar [data-page=analytics][aria-current=page]').waitFor();
 await page.goto(base + '/hub/studio?view=website');
 await page.locator('.sidebar [data-page=site][aria-current=page]').waitFor();

 step('archive keeps the lead');
 await page.goto(base + '/hub/studio?view=pipeline');
 await page.locator('.os-lead-open').filter({ hasText: 'Ayşe' }).click();
 page.once('dialog', d => d.accept());
 await page.locator('dialog[open]').getByRole('button', { name: 'Archive' }).click();
 await page.getByText('No inquiries yet').waitFor();
 await page.getByRole('button', { name: 'Show archived' }).click();
 await page.locator('.os-lead').filter({ hasText: 'Ayşe' }).waitFor();

 // --- Aura Journey
 step('Journey: stages, deep links, task detail, back/forward');
 await page.locator('.sidebar [data-page=journey]').click();
 await page.getByRole('heading', { name: 'Growth Vision', exact: true }).waitFor();
 assert.equal(await page.locator('.vision-stage').count(), 5);
 await page.locator('[data-stage="1"]').click();
 await page.getByRole('heading', { name: 'Get Found', exact: true }).waitFor();
 assert.match(page.url(), /stage=1/);
 const firstTask = page.locator('.os-journey-body .vision-task').first();
 const taskName = (await firstTask.locator('.os-task-name').innerText()).trim();
 await firstTask.click();
 await page.locator('#growth-focus h2').filter({ hasText: taskName }).waitFor();
 await page.goBack();
 await page.getByRole('heading', { name: 'Get Found', exact: true }).waitFor();
 await page.goto(base + '/hub/roadmap?stage=0');
 await page.getByRole('heading', { name: 'Launch', exact: true }).waitFor();
 await shot(page, 'journey-desktop');

 step('Auri explains the stage via the real guidance endpoint');
 await page.locator('[data-ask-stage]').click();
 await page.locator('#ax-drawer:not([hidden])').waitFor();
 await page.locator('#ax-drawer .ax-them').last().filter({ hasNotText: '…' }).waitFor();
 await page.locator('#ax-drawer').getByText(/short checklist|gathering/).waitFor();

 step('Auri routes to Studio without changing data');
 await page.locator('#ax-text').fill('Show me my leads');
 await page.locator('#ax-text').press('Enter');
 await page.locator('#ax-drawer').getByRole('link', { name: 'Open the lead pipeline' }).click();
 await page.getByRole('heading', { name: 'Lead pipeline' }).waitFor();

 // --- Isolation: another account cannot read this workspace's leads
 step('cross-account lead access is refused');
 const org = new URL(await page.locator('.sidebar [data-page=home]').getAttribute('href'), base).searchParams.get('workspace');
 const stranger = await open();
 await stranger.goto(base + '/hub/signup');
 await stranger.locator('[name=name]').fill('Other Owner');
 await stranger.locator('[name=email]').fill('other-' + crypto.randomUUID() + '@example.test');
 await stranger.locator('[name=password]').fill('Saffron-lake-0142!');
 await stranger.locator('[name=terms]').check();
 await stranger.locator('#auth-form button[type=submit]').click();
 await stranger.getByRole('heading', { name: 'Build your roadmap' }).waitFor();
 assert.equal((await stranger.request.get(base + `/api/hub/workspaces/${org}/leads`)).status(), 404);
 assert.equal((await stranger.request.post(base + `/api/hub/workspaces/${org}/leads`, { headers: { Origin: base }, data: { name: 'Injected' } })).status(), 404);
 await stranger.goto(base + `/hub/studio?workspace=${org}`);
 await stranger.getByText(/unavailable|not found/i).first().waitFor();
 await stranger.close();

 // --- Responsive sweep
 step('responsive layouts at 375 / 768 / 1280 / 1440');
 for (const width of [375, 768, 1280, 1440]) {
  const p = await open({ viewport: { width, height: 900 } });
  await p.goto(base + '/__qa/start');
  for (const path of ['/hub', '/hub/roadmap', '/hub/studio?view=pipeline', '/hub/studio?view=delivery', '/hub/studio?view=analytics', '/hub/work', '/hub/requests', '/hub/settings', '/hub/team']) {
   await p.goto(base + path);
   await p.locator('#page-content > *').first().waitFor();
   await p.waitForTimeout(250);
   assert(await noOverflow(p), `horizontal overflow at ${width}px on ${path}`);
  }
  await p.goto(base + '/hub');
  await p.locator('#os-greeting').waitFor();
  if (width <= 800) {
   assert(await p.locator('.command-bottom-nav').isVisible(), 'mobile bottom navigation');
   assert(!(await p.locator('.os-sidebar').isVisible()), 'sidebar hidden on mobile');
   const small = await p.locator('.command-bottom-nav .nav-item').evaluateAll(n => n.filter(e => e.getBoundingClientRect().height < 44).length);
   assert.equal(small, 0, 'bottom-nav targets are at least 44px');
  }
  await shot(p, `command-${width}`);
  await p.goto(base + '/hub/roadmap'); await p.locator('.os-journey').waitFor(); await shot(p, `journey-${width}`);
  await p.goto(base + '/hub/studio?view=pipeline'); await p.locator('.os-studio').waitFor(); await shot(p, `studio-${width}`);
  await p.close();
 }

 step('audit fixes: 404 page, matching Auri counts, focus stays in Auri, billing card');
 const fx = await open();
 await fx.goto(base + '/__qa/start');
 await fx.locator('#os-greeting').waitFor();
 await fx.locator('.os-billing').waitFor();
 const live = (await fx.locator('[data-kpi=services] .os-kpi-foot').innerText()).match(/\d+/)[0];
 await fx.locator('.os-top-auri').click();
 await fx.locator('#ax-drawer .ax-msg').first().waitFor();
 assert.match(await fx.locator('#ax-drawer .ax-msg').first().innerText(), new RegExp(live + ' services? live'));
 for (let i = 0; i < 25; i++) await fx.keyboard.press('Tab');
 assert(await fx.evaluate(() => !!document.activeElement.closest('#ax-drawer')), 'focus stays inside Auri');
 await fx.keyboard.press('Escape');
 await fx.goto(base + '/hub/this-page-does-not-exist');
 await fx.getByRole('heading', { name: 'Page not found' }).waitFor();
 await fx.goto(base + '/hub/roadmap?lang=tr');
 await fx.locator('.os-journey').waitFor();
 await fx.waitForFunction(() => document.querySelector('.skip')?.textContent === 'İçeriğe geç');
 await fx.close();
 const newbie = await open();
 await newbie.goto(base + '/hub/signup');
 await newbie.locator('[name=name]').fill('Contrast Check');
 await newbie.locator('[name=email]').fill('contrast-' + crypto.randomUUID() + '@example.test');
 await newbie.locator('[name=password]').fill('Saffron-lake-0142!');
 await newbie.locator('[name=terms]').check();
 await newbie.locator('#auth-form button[type=submit]').click();
 const heroColor = await newbie.getByRole('heading', { name: 'Build your roadmap' }).evaluate(h => getComputedStyle(h).color);
 assert.equal(heroColor, 'rgb(255, 255, 255)', 'hero heading is readable on the dark card');
 await newbie.close();

 step('batch 2: My Business, saved Auri history, all tasks, translated guidance, mobile sections');
 const b2 = await open();
 await b2.goto(base + '/__qa/start');
 await b2.goto(base + '/hub/profile');
 await b2.getByRole('heading', { name: 'Lumen Studio QA' }).waitFor();
 await b2.locator('[name=phone]').fill('+90 555 123 45 67');
 await b2.locator('[name=hours]').fill('Mon–Sun 8:00–23:00');
 await b2.getByRole('button', { name: 'Save changes' }).click();
 await b2.getByText('Business details saved.').waitFor();
 await b2.goto(base + '/hub/requests?new=1');
 assert.equal(await b2.locator('[name=phone]').inputValue(), '+90 555 123 45 67', 'phone pre-filled from My Business');
 await b2.goto(base + '/hub/auri');
 await b2.locator('.os-auri-chat #ax-text').fill('Remember this question');
 await b2.locator('.os-auri-chat #ax-text').press('Enter');
 await b2.locator('.os-auri-chat .ax-me').filter({ hasText: 'Remember this question' }).waitFor();
 await b2.waitForTimeout(1500);
 await b2.reload();
 await b2.locator('.os-auri-chat .ax-me').filter({ hasText: 'Remember this question' }).waitFor();
 await b2.goto(base + '/hub/roadmap');
 await b2.locator('[data-all-tasks] summary').click();
 assert((await b2.locator('.os-all-row').count()) >= 10, 'all roadmap tasks listed');
 await b2.goto(base + '/hub/roadmap?lang=tr');
 await b2.locator('#growth-focus').getByText('Müşterilere teklifinizi anlayabilecekleri', { exact: false }).waitFor();
 await b2.goto(base + '/hub?lang=en');
 await b2.locator('#os-greeting').waitFor();
 await b2.close();
 const phone = await open({ viewport: { width: 390, height: 844 } });
 await phone.goto(base + '/__qa/start');
 await phone.goto(base + '/hub/studio?view=pipeline');
 await phone.locator('[data-studio-select]').selectOption({ label: 'Analytics' });
 await phone.getByRole('heading', { name: 'Analytics' }).waitFor();
 await phone.goto(base + '/hub');
 await phone.locator('.os-perf').waitFor();
 const sideFirst = await phone.evaluate(() => document.querySelector('.os-side').getBoundingClientRect().top < document.querySelector('.os-perf').getBoundingClientRect().top);
 assert(sideFirst, 'Auri and next actions come before the chart on phones');
 await phone.close();

 step('batch 3: sign-in, redirects, help, request detail, service picker, Ask Auri bar');
 const b3 = await open();
 await b3.goto(base + '/hub/login');
 assert.equal(await b3.getByText('Google sign-in is being set up', { exact: false }).count(), 0, 'no unfinished Google notice');
 assert.equal(await b3.locator('.ad-submit').evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(0, 61, 43)');
 await b3.goto(base + '/__qa/start');
 await b3.goto(base + '/hub/insights');
 await b3.waitForURL(/studio\?.*view=analytics/);
 await b3.getByRole('link', { name: 'Growth simulator' }).waitFor();
 await b3.goto(base + '/hub/support');
 await b3.getByRole('heading', { name: 'Common questions' }).waitFor();
 await b3.locator('.sidebar [data-page=support]').waitFor();
 await b3.goto(base + '/hub/requests?new=1');
 await b3.locator('[data-pick="AuraMenu"]').click();
 assert.equal(await b3.locator('[name=service]').inputValue(), 'AuraMenu');
 await b3.goto(base + '/hub/requests');
 await b3.locator('.hub-work-row').filter({ hasText: 'Web Design' }).click();
 await b3.locator('.os-request-steps li[aria-current=step]').waitFor();
 await b3.getByRole('button', { name: 'Send an update' }).click();
 assert.match(await b3.locator('[name=message]').inputValue(), /Regarding request WEB-/);
 await b3.goto(base + '/hub');
 await b3.locator('[data-os-askbar] input').fill('Show my services');
 await b3.locator('[data-os-askbar] input').press('Enter');
 await b3.locator('#ax-drawer .ax-me').filter({ hasText: 'Show my services' }).waitFor();
 await b3.close();

 step('batch 4: follow-ups, history, CSV, billing, bell, search, security, Auri add-lead, analytics range');
 const b4 = await open();
 await b4.goto(base + '/__qa/start');
 await b4.goto(base + '/hub/studio?view=pipeline');
 await b4.getByRole('button', { name: 'Add inquiry' }).first().click();
 await b4.locator('dialog[open] [name=name]').fill('Follow-up Fatma');
 await b4.locator('dialog[open] [name=followUpAt]').fill('2020-01-02');
 await b4.locator('dialog[open]').getByRole('button', { name: 'Add inquiry' }).click();
 await b4.locator('.os-lead').filter({ hasText: 'Follow-up Fatma' }).locator('.os-followup.is-late').waitFor();
 await b4.locator('.os-lead-open').filter({ hasText: 'Follow-up Fatma' }).click();
 await b4.locator('dialog[open] .os-lead-history summary').click();
 await b4.locator('dialog[open] .os-lead-history').getByText('Created').waitFor();
 await b4.keyboard.press('Escape');
 const [csv] = await Promise.all([b4.waitForEvent('download'), b4.locator('[data-export]').click()]);
 assert.match(csv.suggestedFilename(), /leads\.csv$/);
 await b4.goto(base + '/hub/billing');
 await b4.getByRole('heading', { name: 'Plans & renewals' }).waitFor();
 await b4.goto(base + '/hub');
 await b4.locator('[data-bell]').click();
 await b4.locator('#os-bell-panel').getByText('Follow up with Follow-up Fatma').waitFor();
 await b4.keyboard.press('Escape');
 await b4.keyboard.press('Control+k');
 await b4.locator('.os-search-dialog input').fill('Fatma');
 await b4.locator('.os-search-dialog .os-sr').filter({ hasText: 'Follow-up Fatma' }).waitFor();
 await b4.keyboard.press('Enter');
 await b4.waitForURL(/lead=/);
 await b4.goto(base + '/hub/settings');
 await b4.locator('[data-sessions]').filter({ hasText: /device/ }).waitFor();
 assert.equal(await b4.locator('a[href="/api/hub/me/export"]').count(), 1);
 await b4.goto(base + '/hub/auri');
 await b4.locator('.os-auri-chat #ax-text').fill('Add inquiry Selin, wedding cake tasting');
 await b4.locator('.os-auri-chat #ax-text').press('Enter');
 await b4.locator('.os-auri-chat').getByRole('button', { name: 'Add to pipeline' }).click();
 await b4.locator('.os-auri-chat').getByText('Added “Selin” to your pipeline.').waitFor();
 await b4.goto(base + '/hub/studio?view=pipeline');
 await b4.locator('.os-lead').filter({ hasText: 'Selin' }).waitFor();
 await b4.goto(base + '/hub/studio?view=analytics');
 await b4.locator('[data-days="7"]').click();
 await b4.locator('[data-days="7"][aria-pressed=true]').waitFor();
 await b4.close();

 step('profile photo: upload, shown in the shell, removable');
 const me = await open();
 await me.goto(base + '/__qa/start');
 await me.goto(base + '/hub/settings');
 await me.locator('[data-photo-input]').setInputFiles('media/auri/level-3.webp');
 await me.locator('.os-side-foot .os-photo img').waitFor();
 assert.match(await me.locator('.os-side-foot .os-photo img').getAttribute('src'), /^data:image\/(webp|jpeg);base64,/);
 await me.reload();
 await me.locator('.growth-account summary.has-photo img').waitFor();
 await shot(me, 'settings-photo');
 await me.locator('[data-photo-remove]').click();
 await me.locator('.os-photo-card').getByText('Upload photo').waitFor();
 assert.equal(await me.locator('.os-side-foot .os-photo').count(), 0);
 await me.close();

 step('Auri onboarding is a conversation');
 const fresh = await open({ viewport: { width: 390, height: 844 } });
 await fresh.goto(base + '/hub/signup');
 await fresh.locator('[name=name]').fill('Chat Owner');
 await fresh.locator('[name=email]').fill('chat-' + crypto.randomUUID() + '@example.test');
 await fresh.locator('[name=password]').fill('Saffron-lake-0142!');
 await fresh.locator('[name=terms]').check();
 await fresh.locator('#auth-form button[type=submit]').click();
 await fresh.getByRole('link', { name: 'Build my roadmap' }).click();
 await fresh.locator('[name=businessText]').fill('A family bakery in Izmir selling bread and cakes.');
 await fresh.getByRole('button', { name: /Analyze/ }).click();
 await fresh.locator('.os-chat-msg.is-user').filter({ hasText: 'family bakery' }).waitFor();
 await fresh.getByRole('heading', { name: 'What’s your business called?' }).waitFor();
 await fresh.locator('[name=name]').fill('Izmir Oven');
 await fresh.getByRole('button', { name: /Continue/ }).click();
 await fresh.locator('.os-chat-msg.is-user').filter({ hasText: 'Izmir Oven' }).waitFor();
 await fresh.locator('[data-quick-goal]').first().click();
 await fresh.getByRole('button', { name: /Continue/ }).click();
 assert(await noOverflow(fresh));
 await shot(fresh, 'onboarding-chat-390');
 await fresh.close();

 step('Arabic is right-to-left and fits on mobile');
 const ar = await open({ viewport: { width: 375, height: 812 } });
 await ar.goto(base + '/__qa/start');
 await ar.goto(base + '/hub/roadmap?lang=ar');
 await ar.getByRole('heading', { name: 'رؤية النمو' }).waitFor();
 assert.equal(await ar.locator('html').getAttribute('dir'), 'rtl');
 assert(await noOverflow(ar));
 await shot(ar, 'journey-ar-375');
 await ar.close();

 assert.deepEqual(errors, []);
 console.log('AuraHub 4 browser QA passed (synthetic in-memory data).');
} finally {
 await browser.close();
}
