import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeItemMetadata, normalizeMenuPresentation } from '../src/auramenu-designs.js';

test('items keep "limited" stock and booleans, drop other availability values', () => {
  assert.equal(normalizeItemMetadata({available:'limited'}).available,'limited');
  assert.equal(normalizeItemMetadata({available:false}).available,false);
  assert.equal(normalizeItemMetadata({available:'soon'}).available,undefined);
});

test('French translations are stored next to TR/EN/AR', () => {
  const item = normalizeItemMetadata({translations:{name:{tr:'Mercimek',fr:'Soupe de lentilles',xx:'nope'}}});
  assert.deepEqual(item.translations.name,{tr:'Mercimek',fr:'Soupe de lentilles'});
});

test('restaurant video accepts direct MP4/WebM links with an optional poster', () => {
  const ok = normalizeMenuPresentation({restaurant:{video:{src:'https://cdn.example.com/kitchen.mp4',poster:'https://cdn.example.com/p.jpg'}}});
  assert.deepEqual(ok.restaurant.video,{src:'https://cdn.example.com/kitchen.mp4',poster:'https://cdn.example.com/p.jpg'});
  assert.equal(normalizeMenuPresentation({restaurant:{video:{src:'https://youtube.com/watch?v=1'}}}).restaurant.video,undefined);
  assert.throws(() => normalizeMenuPresentation({restaurant:{video:{src:'javascript:alert(1)'}}}));
});

test('weekly hours keep valid ranges and closed days, drop junk', () => {
  const r = normalizeMenuPresentation({restaurant:{hours:{mon:'09:00-23:00',tue:'',wed:'9-5',sun:'10:00-24:00',xyz:'01:00-02:00'}}}).restaurant;
  assert.deepEqual(r.hours,{mon:'09:00-23:00',tue:'',sun:'10:00-24:00'});
});
