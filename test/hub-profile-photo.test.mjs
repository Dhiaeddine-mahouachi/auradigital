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
