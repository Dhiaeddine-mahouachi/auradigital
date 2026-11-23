import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hubFixture, profile } from './hub-fixture.mjs';

async function setup() {
 const f = await hubFixture();
 const owner = await f.user('owner-' + crypto.randomUUID() + '@example.test', true);
 const created = await (await f.call('/api/hub/workspaces', owner, 'POST', { profile: profile('Lead Bistro'), mode: 'myself' })).json();
 return { f, owner, org: created.id, base: '/api/hub/workspaces/' + created.id };
}

test('owners create, move, annotate and archive leads inside their workspace', async () => {
 const { f, owner, base } = await setup();
 const empty = await (await f.call(base + '/leads', owner)).json();
 assert.deepEqual(empty.leads, []);
 assert.deepEqual(empty.stages.map(s => s.id), ['new', 'contacted', 'proposal', 'in_progress', 'won']);
 assert.deepEqual(empty.assignees.map(a => a.name), [owner.name]);

 const res = await f.call(base + '/leads', owner, 'POST', { name: 'Table for 12', contact: '+90 555 000 00 00', source: 'whatsapp', interest: 'Birthday dinner', value: 4200, note: 'Asked for Friday.' });
 assert.equal(res.status, 201);
 const { lead } = await res.json();
 assert.equal(lead.stage, 'new');
 assert.equal(lead.value, 4200);
 assert.equal(lead.notes, 1);

 const moved = await f.call(base + '/leads/' + lead.id, owner, 'PATCH', { version: lead.version, stage: 'proposal', assigneeId: owner.id, note: 'Sent menu options.' });
 assert.equal(moved.status, 200);
 const after = (await moved.json()).lead;
 assert.equal(after.stage, 'proposal');
 assert.equal(after.assigneeId, owner.id);
 assert.equal(after.notes, 2);

 const stale = await f.call(base + '/leads/' + lead.id, owner, 'PATCH', { version: lead.version, stage: 'won' });
 assert.equal(stale.status, 409);

 const detail = await (await f.call(base + '/leads/' + lead.id, owner)).json();
 assert.deepEqual(detail.notes.map(n => n.body).sort(), ['Asked for Friday.', 'Sent menu options.']);
 assert.equal(detail.notes[0].author, owner.name);

 const archived = await f.call(base + '/leads/' + lead.id, owner, 'PATCH', { version: after.version, archived: true });
 assert.equal(archived.status, 200);
 assert.equal((await (await f.call(base + '/leads', owner)).json()).leads.length, 0);
 const kept = await (await f.call(base + '/leads?archived=1', owner)).json();
 assert.equal(kept.leads.length, 1, 'archived leads are kept, never deleted');

 const actions = f.sqlite.prepare('SELECT action FROM member_access_audit_logs WHERE target_id=? ORDER BY rowid').all(lead.id).map(r => r.action);
 assert.deepEqual(actions, ['lead_created', 'lead_stage_changed', 'lead_archived']);
});

test('leads are validated and isolated between workspaces', async () => {
 const { f, owner, base } = await setup();
 assert.equal((await f.call(base + '/leads', owner, 'POST', { name: 'X' })).status, 400);
 assert.equal((await f.call(base + '/leads', owner, 'POST', { name: 'Valid name', stage: 'nope' })).status, 400);
 assert.equal((await f.call(base + '/leads', owner, 'POST', { name: 'Valid name', source: 'fax' })).status, 400);
 const stranger = await f.user('stranger-' + crypto.randomUUID() + '@example.test', true);
 assert.equal((await f.call(base + '/leads', stranger, 'POST', { name: 'Injected lead' })).status, 404);
 const { lead } = await (await f.call(base + '/leads', owner, 'POST', { name: 'Private lead' })).json();
 assert.equal((await f.call(base + '/leads', stranger)).status, 404);
 assert.equal((await f.call(base + '/leads/' + lead.id, stranger)).status, 404);
 assert.equal((await f.call(base + '/leads/' + lead.id, stranger, 'PATCH', { version: 1, stage: 'won' })).status, 404);
 assert.equal((await f.call(base + '/leads/' + lead.id, stranger, 'PATCH', { version: 1, assigneeId: stranger.id })).status, 404);
 assert.equal((await f.call(base + '/leads/' + lead.id, owner, 'PATCH', { version: 1, assigneeId: stranger.id })).status, 400, 'only teammates can be assigned');
 assert.equal((await f.call(base + '/leads', null)).status, 401);
 assert.equal((await f.call(base + '/leads', owner, 'POST', { name: 'Cross-site' }, { Origin: 'https://evil.example' })).status, 403);
});

test('pipeline stages are configurable but cannot orphan leads', async () => {
 const { f, owner, base } = await setup();
 const stages = [{ id: 'new', label: 'Asked' }, { id: 'booked', label: 'Booked' }];
 const saved = await f.call(base + '/lead-stages', owner, 'PUT', { version: 0, stages });
 assert.equal(saved.status, 200);
 assert.deepEqual((await saved.json()).stages, stages);
 const { lead } = await (await f.call(base + '/leads', owner, 'POST', { name: 'Guest list', stage: 'booked' })).json();
 assert.equal(lead.stage, 'booked');
 const orphan = await f.call(base + '/lead-stages', owner, 'PUT', { version: 1, stages: [stages[0], { id: 'done', label: 'Done' }] });
 assert.equal(orphan.status, 409);
 assert.equal((await f.call(base + '/lead-stages', owner, 'PUT', { version: 1, stages: [stages[0]] })).status, 400);
});

test('the lead migration is additive and idempotent', async () => {
 const sql = await readFile(new URL('../migrations/0037_hub_leads.sql', import.meta.url), 'utf8');
 assert.doesNotMatch(sql, /^\s*(DROP|DELETE|UPDATE|ALTER|INSERT)\b/im);
 const f = await hubFixture();
 f.sqlite.exec(sql);
 f.sqlite.exec(sql);
});
