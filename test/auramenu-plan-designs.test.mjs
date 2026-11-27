import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import app from '../src/worker-entry.js';
import { d1 } from './d1.mjs';
import { menuDesignAccess } from '../src/auramenu-designs.js';

test('design access follows the plan: Standard/Annual → standard only, Premium → premium only', async (t) => {
  const env0 = { AURAMENU_STANDARD_ENABLED: 'true', AURAMENU_PREMIUM_ENABLED: 'true' };
  assert.deepEqual(menuDesignAccess(env0, { planId: 'starter' }), { standard: true, premium: false });
  assert.deepEqual(menuDesignAccess(env0, { planId: 'annual' }), { standard: true, premium: false });
  assert.deepEqual(menuDesignAccess(env0, { planId: 'pro' }), { standard: false, premium: true });
  assert.deepEqual(menuDesignAccess(env0, { billing: { planId: 'pro', active: true } }), { standard: false, premium: true });

  const sqlite = new DatabaseSync(':memory:'); t.after(() => sqlite.close());
  const DB = d1(sqlite), limiter = { limit: async () => ({ success: true }) };
  const env = { DB, TRACK_RATE_LIMITER: limiter, LOGIN_RATE_LIMITER: limiter, ...env0 };
  const call = (path, method = 'GET', body, headers = {}) => app.fetch(new Request('https://auradigitalworks.com' + path, {
    method, body: body === undefined ? undefined : JSON.stringify(body), headers: { Origin: 'https://auradigitalworks.com', 'Content-Type': 'application/json', ...headers },
  }), env, { waitUntil() {} });
  assert.equal((await call('/api/settings')).status, 200);
  sqlite.exec(await readFile(new URL('../migrations/0041_auramenu_design_settings.sql', import.meta.url), 'utf8'));
  const base = { businessName: 'Cafe', contactName: 'A', contactPhone: '111', categories: [{ name: 'Food', items: [{ name: 'Bread', price: '80' }] }] };
  let n = 0; const make = (planId, templateId) => call('/api/auramenu/requests', 'POST', { ...base, slug: 'cafe-' + (++n), contactPhone: '5550' + n, planId, templateId });
  assert.equal((await make('starter', 'pre-16')).status, 403);
  assert.equal((await make('annual', 'pre-20')).status, 403);
  assert.equal((await make('pro', 'std-01')).status, 403);
  assert.equal((await make('starter', 'std-01')).status, 201);
  assert.equal((await make('annual', 'std-09')).status, 201);
  const pro = await make('pro', 'pre-16');
  assert.equal(pro.status, 201);
  // A pending Premium menu may switch between premium designs but not to a standard one.
  const { request, token } = await pro.json();
  const owner = { 'X-Aura-Menu-Token': token }, dash = '/api/auramenu/dashboard/' + request.id;
  const save = templateId => call(dash, 'PATCH', { templateId, categories: base.categories }, owner);
  assert.equal((await save('std-02')).status, 403);
  assert.equal((await save('pre-21')).status, 200);
  const access = (await (await call(dash, 'GET', undefined, owner)).json()).menu.designAccess;
  assert.equal(access.standard, false); assert.ok(access.premium.includes('pre-21'));
});
