import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const worker = await readFile(new URL('../src/worker.js', import.meta.url), 'utf8');
const motion = await readFile(new URL('../redesign/motion.js', import.meta.url), 'utf8');

test('the redesigned pages are counted and key actions use a fixed allowlist', async () => {
  for (const path of ['/solutions', '/service-shop', '/packages', '/portfolio', '/help', '/about', '/contact', '/shop/checkout']) assert.match(worker, new RegExp(`"${path}",`), path);
  for (const name of ['start_email', 'start_path', 'add_to_cart', 'buy_now', 'checkout_sign_in', 'checkout_continue', 'contact_sent', 'whatsapp', 'auri_open', 'sale_bar']) {
    assert.match(worker, new RegExp(`"event:${name}"`), name);
    if (name !== 'contact_sent') assert.match(motion, new RegExp(`'${name}'`), 'motion sends ' + name);
  }
  assert.match(await readFile(new URL('../tools/redesign/design/Contact.dc.html', import.meta.url), 'utf8'), /auraTrack\('contact_sent'\)/, 'contact sends are counted after success');
  assert.match(worker, /TRACKABLE_PATHS\.has\(path\) \|\| TRACKABLE_EVENTS\.has\(path\)/);
});

test('actions never inflate visit totals, and tracking stays cookie-free', () => {
  assert.match(worker, /analytics_daily WHERE date >= date\('now','-29 day'\) AND path NOT LIKE 'event:%'"\),\n    db\.prepare\("SELECT COUNT/);
  assert.equal((worker.match(/AND path NOT LIKE 'event:%'/g) || []).length, 3);
  assert.doesNotMatch(motion, /document\.cookie|localStorage\.setItem\('aura-visitor/);
  assert.match(motion, /auradigitalworks\\\.com/, 'only counts on the real site');
});
