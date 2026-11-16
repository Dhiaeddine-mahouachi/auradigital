import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hubFixture, profile } from './hub-fixture.mjs';

test('onboarding analysis is authenticated, origin checked and evidence grounded', async () => {
 const fixture = await hubFixture();
 fixture.sqlite.exec(await readFile(new URL('../migrations/0005_ai_employee.sql', import.meta.url), 'utf8'));
 const actor = await fixture.user('first-login@example.test');
 Object.assign(fixture.env, {
  AI_PROVIDER: 'cloudflare',
  AI_MODEL: '@cf/meta/llama-3.1-8b-instruct-fp8',
  AI_RATE_LIMITER: { limit: async () => ({ success: true }) },
  AI: { run: async () => ({
   usage: { prompt_tokens: 80, completion_tokens: 60 },
   response: { reply: 'OK', facts: {
    name: { value: 'Lale Kitchen', excerpt: 'Lale Kitchen is a restaurant' },
    industry: { value: 'restaurant', excerpt: 'Lale Kitchen is a restaurant' },
    city: { value: 'Ankara', excerpt: 'in Istanbul' },
    website: { value: 'https://example.test', excerpt: 'https://example.test' },
   } },
  }) },
 });
 const path = '/api/hub/onboarding/analyze';
 const text = 'Lale Kitchen is a restaurant in Istanbul';
 assert.equal((await fixture.call(path, null, 'POST', { text })).status, 401);
 assert.equal((await fixture.call(path, actor, 'POST', { text }, { Origin: 'https://other.test' })).status, 403);
 assert.equal((await fixture.call(path, actor, 'POST', { text: 'a'.repeat(4001) })).status, 400);
 const response = await fixture.call(path, actor, 'POST', { text });
 assert.equal(response.status, 200);
 const { facts } = await response.json();
 assert.deepEqual(Object.keys(facts), ['name', 'industry']);
 assert.equal(facts.name.value, 'Lale Kitchen');
 assert.equal(facts.industry.confidence, 'inferred');
 assert.equal((await fixture.call('/api/hub/workspaces', actor)).status, 200);
 assert.equal(fixture.sqlite.prepare('SELECT COUNT(*) AS total FROM organizations').get().total, 0);
});

test('confirmed first login creates an industry-specific roadmap once and isolates accounts', async () => {
 const fixture = await hubFixture();
 const actor = await fixture.user('owner@example.test');
 const other = await fixture.user('other@example.test');
 const requestId = crypto.randomUUID();
 const path = '/api/hub/workspaces';
 const body = { requestId, profile: profile('Lale Kitchen'), mode: 'auri' };
 const created = await fixture.call(path, actor, 'POST', body);
 assert.equal(created.status, 201);
 const { id } = await created.json();
 assert.equal(id, requestId);
 const loaded = await (await fixture.call(path + '/' + id, actor)).json();
 assert.equal(loaded.profile.name, 'Lale Kitchen');
 assert.ok(loaded.missions.some(mission => mission.capability === 'menu'));
 assert.equal((await fixture.call(path, actor, 'POST', body)).status, 200);
 assert.equal((await fixture.call(path, actor, 'POST', { ...body, requestId: crypto.randomUUID() })).status, 409);
 assert.equal((await fixture.call(path, other, 'POST', body)).status, 409);
 assert.equal((await fixture.call(path + '/' + id, other)).status, 404);
 const reloaded = await (await fixture.call(path + '/' + id, actor)).json();
 assert.deepEqual(reloaded.missions, loaded.missions);
});
