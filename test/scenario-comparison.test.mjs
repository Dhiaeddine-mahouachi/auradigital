import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scenarioComparison } from '../src/hub/scenario-comparison.js';
import { simulate } from '../src/growth-engine.js';

const fixture = () => simulate({
  visits: 1000, leads: 100, closeRate: 20, customerValue: 100,
  margin: 50, monthlyCost: 100, setupCost: 500, currency: 'USD',
  assumptions: [
    { trafficLift: 0, leadRateLift: 0, closeRateLift: 0 },
    { trafficLift: 10, leadRateLift: 10, closeRateLift: 10 },
    { trafficLift: 20, leadRateLift: 20, closeRateLift: 20 },
  ],
});

test('scenario comparison presents the existing engine results without modifying them', () => {
  const result = fixture();
  const before = JSON.stringify(result);
  const metrics = scenarioComparison(result);
  assert.deepEqual(metrics.map(m => m.key), ['additionalRevenue', 'netMonthly', 'firstYearROI']);
  for (const metric of metrics) {
    assert.deepEqual(metric.values.map(v => v.name), ['conservative', 'base', 'ambitious']);
    assert.deepEqual(metric.values.map(v => v.value), result.scenarios.map(s => s[metric.key]));
    assert.ok(metric.values.every(v => Number.isFinite(v.width) && v.width >= 0 && v.width <= 50));
  }
  assert.equal(JSON.stringify(result), before);
});

test('negative outcomes use the negative rail and zero remains centered', () => {
  const metrics = scenarioComparison({
    scenarios: [
      { name: 'conservative', additionalRevenue: 0, netMonthly: -250, firstYearROI: -75 },
      { name: 'base', additionalRevenue: 300, netMonthly: 0, firstYearROI: 0 },
      { name: 'ambitious', additionalRevenue: 900, netMonthly: 600, firstYearROI: 80 },
    ],
  });
  const revenue = metrics.find(m => m.key === 'additionalRevenue');
  const net = metrics.find(m => m.key === 'netMonthly');
  assert.equal(revenue.values[2].width, 50);
  assert.equal(revenue.values[0].direction, 'zero');
  assert.equal(net.values[0].direction, 'negative');
  assert.equal(net.values[1].direction, 'zero');
  assert.equal(net.values[2].direction, 'positive');
  assert.equal(net.values[2].width, 50);
});

test('unavailable ROI is not misrepresented as zero', () => {
  const roi = scenarioComparison({
    scenarios: [{ name: 'conservative', firstYearROI: null, additionalRevenue: 0, netMonthly: 0 }],
  }).find(m => m.key === 'firstYearROI');
  assert.equal(roi.values[0].value, null);
  assert.equal(roi.values[0].direction, 'missing');
  assert.equal(roi.values[0].width, 0);
});

test('empty and invalid input do not create invented bars', () => {
  assert.deepEqual(scenarioComparison(null), []);
  assert.deepEqual(scenarioComparison({ scenarios: [] }), []);
  const metric = scenarioComparison({ scenarios: [{ name: 'base', additionalRevenue: Number.POSITIVE_INFINITY }] })[0];
  assert.equal(metric.values[0].direction, 'missing');
  assert.equal(metric.values[0].width, 0);
});
