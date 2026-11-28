import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const dir = new URL('../migrations/', import.meta.url);
const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

test('migration numbers are unique', () => {
  const numbers = files.map(f => Number(f.slice(0, 4)));
  assert.equal(new Set(numbers).size, numbers.length, 'duplicate migration number');
});

test('AuraMenu sprint migrations are safe to re-run (staging carries a renamed copy)', () => {
  for (const f of files.filter(f => Number(f.slice(0, 4)) >= 42)) {
    const sql = readFileSync(new URL(f, dir), 'utf8');
    for (const stmt of sql.match(/CREATE\s+(UNIQUE\s+)?(TABLE|INDEX)[^\n]*/gi) || []) assert.match(stmt, /IF NOT EXISTS/i, `${f}: ${stmt}`);
    assert.doesNotMatch(sql, /^\s*(DROP|ALTER|DELETE|UPDATE)\b/im, `${f} must be additive`);
  }
});
