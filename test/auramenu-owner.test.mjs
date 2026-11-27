import test from 'node:test';
import assert from 'node:assert/strict';
import { backup, DatabaseSync } from 'node:sqlite';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { ensureCustomers, tokenHash } from '../src/customer-accounts.ts';
import { createSession } from '../src/security.js';

test('menus belong to the AuraDigital account that claims them; other accounts are isolated', async (t) => {
  const sqlite = new DatabaseSync(':memory:'); t.after(() => sqlite.close());
  const DB = d1(sqlite), limiter = { limit: async () => ({ success: true }) };
  const env = { DB, TRACK_RATE_LIMITER: limiter, LOGIN_RATE_LIMITER: limiter, AURAMENU_STANDARD_ENABLED: 'true', CUSTOMER_IDENTITY_ENABLED: 'true', CUSTOMER_AUTH_ORIGIN: 'https://auradigitalworks.com' };
  const call = (path, method = 'GET', body, headers = {}) => app.fetch(new Request('https://auradigitalworks.com' + path, {
    method, body: body === undefined ? undefined : JSON.stringify(body),
    headers: { Origin: 'https://auradigitalworks.com', 'Content-Type': 'application/json', ...headers },
  }), env, { waitUntil() {} });
  assert.equal((await call('/api/settings')).status, 200);
  sqlite.exec(await readFile(new URL('../migrations/0041_auramenu_design_settings.sql', import.meta.url), 'utf8'));
  await ensureCustomers(DB);
  async function account(email) {
    const id = crypto.randomUUID(), raw = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '');
    await DB.prepare("INSERT INTO customer_users(id,email,full_name,password_hash) VALUES(?,?,?,'!x')").bind(id, email, email).run();
    await DB.prepare("INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(await tokenHash(raw), id).run();
    return { Cookie: '__Host-auramenu_customer=' + raw };
  }
  const a = await account('a@test.test'), b = await account('b@test.test');
  // Registering without an account is refused.
  const anon = await call('/api/auramenu/requests', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe Z', contactPhone: '999', slug: 'cafe-z', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] });
  assert.equal(anon.status, 401); assert.equal((await anon.json()).signIn, true);
  const post = await call('/api/auramenu/requests', 'POST', { templateId: 'std-01', planId: 'starter', businessName: 'Cafe A', contactPhone: '111', slug: 'cafe-a', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] }, a);
  assert.equal(post.status, 201);
  const { request, token } = await post.json();
  const dash = '/api/auramenu/dashboard/' + request.id, claim = dash + '/claim';
  // The account that registered the menu owns it at once and opens it without the token.
  assert.equal((await call(dash, 'GET', undefined, a)).status, 200);
  const row = await DB.prepare('SELECT email, contact_name FROM auramenu_requests WHERE id=?').bind(request.id).first();
  assert.equal(row.email, 'a@test.test');
  let r = await (await call(claim, 'POST', { existingToken: '' }, a)).json();
  assert.equal(r.token, '');
  // B cannot read or claim it, and cannot take ownership even with the token.
  assert.equal((await call(dash, 'GET', undefined, b)).status, 401);
  assert.equal((await call(claim, 'POST', { existingToken: '' }, b)).status, 401);
  assert.equal((await (await call(claim, 'POST', { existingToken: token }, b)).json()).owned, false);
  assert.equal((await call(dash, 'GET', undefined, b)).status, 401);
  // "My menus" lists only the owner's menus.
  const mineA = await (await call('/api/auramenu/account/menus', 'GET', undefined, a)).json();
  assert.deepEqual(mineA.menus.map(m => m.slug), ['cafe-a']);
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, b)).json()).menus, []);
  assert.equal((await call('/api/auramenu/account/menus')).status, 401);
  // A forged / AuraDigital-domain cookie name does not count as an AuraMenu session.
  assert.equal((await call(dash, 'GET', undefined, { Cookie: a.Cookie.replace('__Host-auramenu_customer', '__Host-aura_customer') })).status, 401);

  // Move the first fixture outside the normal duplicate submission window.
  await DB.prepare("UPDATE auramenu_requests SET created_at=datetime('now','-3 minutes') WHERE id=?").bind(request.id).run();
  const created = await call('/api/auramenu/requests', 'POST', {
    templateId: 'std-02', planId: 'annual', businessName: 'Cafe B', contactName: 'A',
    contactPhone: '222', slug: 'cafe-b', categories: [{ name: 'Food', items: [{
      name: 'Toast', price: '90', imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X1gAAAABJRU5ErkJggg==',
    }] }],
  }, a);
  assert.equal(created.status, 201);
  const { request: secondMenu } = await created.json();
  assert.equal((await call('/api/auramenu/dashboard/' + secondMenu.id, 'GET', undefined, a)).status, 200);
  const studioMenus = await (await call('/api/auramenu/account/menus', 'GET', undefined, a)).json();
  const hubMenus = await (await call('/api/auramenu/hub/menus', 'GET', undefined, {
    Cookie: a.Cookie.replace('__Host-auramenu_customer', '__Host-aura_customer'),
  })).json();
  assert.deepEqual(studioMenus.menus, hubMenus.menus);
  assert.deepEqual(studioMenus.menus.map(m => m.slug).sort(), ['cafe-a', 'cafe-b']);
  assert.deepEqual((await (await call('/api/auramenu/account/menus', 'GET', undefined, b)).json()).menus, []);

  const publicPath = '/api/auramenu/sites/cafe-b';
  const publish = '/api/auramenu/dashboard/' + secondMenu.id + '/publish';
  assert.equal((await call(publicPath)).status, 404);
  assert.equal((await call(publish, 'POST', undefined, a)).status, 409);
  sqlite.exec("INSERT INTO admin_users(id,username,display_name,password_hash,role) VALUES ('owner','owner','Owner','test','owner')");
  const admin = { Cookie: '__Host-aura_admin=' + await createSession(DB, 'owner') };
  assert.equal((await call('/api/admin/auramenu/' + secondMenu.id, 'PATCH', { paymentStatus: 'paid' }, admin)).status, 200);
  assert.equal((await call(publicPath)).status, 404);
  assert.equal((await call(publish, 'POST', undefined, b)).status, 401);
  assert.equal((await call(publish, 'POST', undefined, a)).status, 200);
  const before = (await (await call(publicPath)).json()).menu;
  assert.equal(before.status, 'approved');
  assert.equal((await call(publish, 'POST', undefined, a)).status, 200);
  const unchanged = (await (await call(publicPath)).json()).menu;
  assert.equal(unchanged.revision, before.revision);
  const update = await call('/api/auramenu/dashboard/' + secondMenu.id, 'PATCH', {
    categories: [{ name: 'Food', items: [{ name: 'Toast', price: '95', available: false }] }],
  }, a);
  assert.equal(update.status, 200);
  const published = (await (await call(publicPath)).json()).menu;
  assert.equal(published.categories[0].items[0].price, '95');
  assert.equal(published.categories[0].items[0].available, false);

  const history = '/api/auramenu/dashboard/' + secondMenu.id + '/revisions';
  const revisions = (await (await call(history, 'GET', undefined, a)).json()).revisions;
  assert.deepEqual(revisions.map(revision => revision.action), ['update', 'publish']);
  assert.ok(revisions.every(revision => revision.publishedAt && revision.actorId));
  assert.equal((await call(history, 'GET', undefined, b)).status, 401);
  const original = history + '/' + before.revision;
  const preview = (await (await call(original, 'GET', undefined, a)).json()).menu;
  assert.equal(preview.categories[0].items[0].price, '90');
  const savedImage = new URL(preview.categories[0].items[0].imageUrl).pathname;
  assert.equal((await call(savedImage)).status, 200);
  assert.equal((await call(original, 'POST', { expectedRevision: before.revision }, a)).status, 409);
  assert.equal((await (await call(publicPath)).json()).menu.revision, published.revision);
  assert.equal((await call(original, 'POST', { expectedRevision: published.revision }, a)).status, 200);
  const restored = (await (await call(publicPath)).json()).menu;
  assert.equal(restored.revision, published.revision + 1);
  assert.deepEqual(restored.categories, before.categories);
  assert.equal((await call(savedImage)).status, 200);
  assert.equal((await (await call(history, 'GET', undefined, a)).json()).revisions[0].sourceRevision, before.revision);

  // Reopen an isolated backup through the Worker with an independent D1 adapter.
  const directory = await mkdtemp(join(tmpdir(), 'auramenu-recovery-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = join(directory, 'restored.sqlite');
  const accountId = sqlite.prepare('SELECT id FROM customer_users WHERE email=?').get('b@test.test').id;
  const ownerId = sqlite.prepare('SELECT customer_id FROM auramenu_menu_owners WHERE menu_id=?').get(secondMenu.id).customer_id;
  sqlite.prepare("INSERT INTO auramenu_menu_members(menu_id,customer_id,role,added_by) VALUES (?,?,'editor',?)").run(secondMenu.id, accountId, ownerId);
  await backup(sqlite, file);
  const recovered = new DatabaseSync(file);
  t.after(() => recovered.close());
  const restoredEnv = { ...env, DB: d1(recovered) };
  const use = (worker, path, headers) => worker.fetch(new Request('https://auradigitalworks.com' + path, { headers }), restoredEnv, { waitUntil() {} });
  assert.deepEqual((await (await use(app, publicPath)).json()).menu, restored);
  const recoveredDashboard = (await (await use(app, '/api/auramenu/dashboard/' + secondMenu.id, b)).json()).menu;
  assert.equal(recoveredDashboard.role, 'editor');
  assert.equal(recoveredDashboard.billing.active, true);
  assert.equal((await use(app, savedImage)).status, 200);
  assert.equal((await (await use(app, history, a)).json()).revisions.length, 3);
  if (process.env.AURAMENU_ROLLBACK_ENTRY) {
    const previous = (await import(pathToFileURL(process.env.AURAMENU_ROLLBACK_ENTRY))).default;
    assert.deepEqual((await (await use(previous, publicPath)).json()).menu, restored);
    assert.equal((await use(previous, savedImage)).status, 200);
    assert.equal((await (await use(app, history, a)).json()).revisions.length, 3);
  }
});
