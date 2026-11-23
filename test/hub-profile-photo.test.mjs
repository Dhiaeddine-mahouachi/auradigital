import test from 'node:test';
import assert from 'node:assert/strict';
import { hubFixture } from './hub-fixture.mjs';

const tiny = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
test('customers set, read and remove only their own profile photo', async () => {
 const f = await hubFixture();
 const a = await f.user('photo-a@example.test', true), b = await f.user('photo-b@example.test', true);
 assert.equal((await f.call('/api/hub/me/photo', a, 'PUT', { photo: tiny })).status, 200);
 assert.equal((await (await f.call('/api/hub/workspaces', a)).json()).user.photo, tiny);
 assert.equal((await (await f.call('/api/hub/me/photo', b)).json()).photo, null, 'another account never sees it');
 for (const bad of ['javascript:alert(1)', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,' + 'A'.repeat(100000), 42])
  assert.ok([400, 413].includes((await f.call('/api/hub/me/photo', a, 'PUT', { photo: bad })).status));
 assert.equal((await f.call('/api/hub/me/photo', a, 'PUT', { photo: tiny }, { Origin: 'https://evil.example' })).status, 403);
 assert.equal((await f.call('/api/hub/me/photo', null)).status, 401);
 assert.equal((await f.call('/api/hub/me/photo', a, 'DELETE')).status, 200);
 assert.equal((await (await f.call('/api/hub/me/photo', a)).json()).photo, null);
});

test('workspaces report whether menu drafts are enabled', async () => {
 const f = await hubFixture();
 const owner = await f.user('flags@example.test', true);
 const { id } = await (await f.call('/api/hub/workspaces', owner, 'POST', { profile: { name: 'Flag Cafe', industry: 'restaurant', capabilities: [], currency: 'USD' }, mode: 'myself' })).json();
 assert.equal((await (await f.call('/api/hub/workspaces/' + id, owner)).json()).features.menuDrafts, false);
 f.env.MENU_DRAFTS_ENABLED = 'true';
 assert.equal((await (await f.call('/api/hub/workspaces/' + id, owner)).json()).features.menuDrafts, true);
});

test('business logos are workspace-scoped and owner-editable', async () => {
 const f = await hubFixture();
 const owner = await f.user('logo-owner@example.test', true), stranger = await f.user('logo-stranger@example.test', true);
 const { id } = await (await f.call('/api/hub/workspaces', owner, 'POST', { profile: { name: 'Logo Shop', industry: 'retail', capabilities: [], currency: 'TRY', phone: '+90 555 111 22 33', social: { instagram: 'https://instagram.com/logoshop' } }, mode: 'myself' })).json();
 const base = '/api/hub/workspaces/' + id;
 const ws = await (await f.call(base, owner)).json();
 assert.equal(ws.profile.industry, 'retail');
 assert.equal(ws.profile.phone, '+90 555 111 22 33');
 assert.equal((await f.call(base + '/logo', owner, 'PUT', { logo: tiny })).status, 200);
 assert.equal((await (await f.call(base + '/logo', owner)).json()).logo, tiny);
 assert.equal((await f.call(base + '/logo', stranger)).status, 404);
 assert.equal((await f.call(base + '/logo', stranger, 'PUT', { logo: tiny })).status, 404);
 assert.equal((await f.call(base + '/logo', owner, 'PUT', { logo: 'data:text/html;base64,PGgxPg==' })).status, 400);
 assert.equal((await f.call(base + '/logo', owner, 'DELETE')).status, 200);
 assert.equal((await (await f.call(base + '/logo', owner)).json()).logo, null);
});

test('Auri conversations are saved per person and cleared on request', async () => {
 const f = await hubFixture();
 const owner = await f.user('history@example.test', true), other = await f.user('history-other@example.test', true);
 const { id } = await (await f.call('/api/hub/workspaces', owner, 'POST', { profile: { name: 'Chat Co', industry: 'salon', capabilities: [], currency: 'TRY' }, mode: 'myself' })).json();
 const path = '/api/hub/workspaces/' + id + '/auri-history';
 assert.equal((await f.call(path, owner, 'POST', { messages: [{ role: 'me', text: 'Hello' }, { role: 'auri', text: 'Hi! How can I help?' }] })).status, 201);
 assert.deepEqual((await (await f.call(path, owner)).json()).messages.map(m => m.text), ['Hello', 'Hi! How can I help?']);
 assert.equal((await f.call(path, other)).status, 404);
 assert.equal((await f.call(path, owner, 'POST', { messages: [{ role: 'system', text: 'x' }] })).status, 400);
 assert.equal((await f.call(path, owner, 'DELETE')).status, 200);
 assert.equal((await (await f.call(path, owner)).json()).messages.length, 0);
});

test('customers can sign out other devices and export their data', async () => {
 const f = await hubFixture();
 const owner = await f.user('export@example.test', true);
 const second = owner.token.split('').reverse().join('');
 const { tokenHash } = await import('../src/customer-accounts.ts');
 await f.DB.prepare("INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(await tokenHash(second), owner.id).run();
 assert.equal((await (await f.call('/api/hub/me/sessions', owner)).json()).active, 2);
 const r = await (await f.call('/api/hub/me/sessions', owner, 'POST', { action: 'revoke-others' })).json();
 assert.equal(r.signedOut, 1);
 assert.equal((await f.call('/api/hub/me/sessions', owner)).status, 200, 'current session still works');
 const { id } = await (await f.call('/api/hub/workspaces', owner, 'POST', { profile: { name: 'Export Co', industry: 'retail', capabilities: [], currency: 'TRY' }, mode: 'myself' })).json();
 await f.call('/api/hub/workspaces/' + id + '/leads', owner, 'POST', { name: 'Exported lead' });
 const res = await f.call('/api/hub/me/export', owner);
 assert.match(res.headers.get('Content-Disposition'), /attachment/);
 const data = await res.json();
 assert.equal(data.account.email, 'export@example.test');
 assert.equal(data.workspaces[0].name, 'Export Co');
 assert.equal(data.workspaces[0].leads[0].name, 'Exported lead');
 const stranger = await f.user('not-owner@example.test', true);
 assert.equal((await (await f.call('/api/hub/me/export', stranger)).json()).workspaces.length, 0, 'only your own workspaces are exported');
});

test('browser error reports are accepted anonymously and same-origin only', async () => {
 const f = await hubFixture();
 const logged = []; const original = console.error; console.error = m => logged.push(m);
 try {
  const r = await f.call('/api/hub/client-error', null, 'POST', { message: 'Boom for someone@example.com', where: 'app.js:1', page: '/hub/roadmap?workspace=x' });
  assert.equal(r.status, 204);
  assert.equal((await f.call('/api/hub/client-error', null, 'POST', { message: 'x' }, { Origin: 'https://evil.example' })).status, 403);
 } finally { console.error = original; }
 const entry = JSON.parse(logged.find(l => String(l).includes('aurahub_client_error')));
 assert.equal(entry.message, 'Boom for [email]');
 assert.equal(entry.page, '/hub/roadmap');
});
