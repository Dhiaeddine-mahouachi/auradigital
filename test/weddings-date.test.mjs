import test from 'node:test';
import assert from 'node:assert/strict';
import {weddingDate} from '../weddings/date.js';
import {themes} from '../weddings/themes.js';
test('wedding time is Istanbul time regardless of the guest device timezone',()=>{
 assert.equal(weddingDate('2027-07-04','19:30').instant.toISOString(),'2027-07-04T16:30:00.000Z');
 assert.equal(weddingDate('2027-07-04','01:00').instant.toISOString(),'2027-07-03T22:00:00.000Z');
});
test('invalid dates and times use valid defaults without rolling into another date',()=>{
 for(const day of ['2027-02-29','2027-13-04','invalid',''])assert.equal(weddingDate(day,'18:00').date,'2027-06-29');
 for(const time of ['99:99','24:00','18:65','invalid'])assert.equal(weddingDate('2028-02-29',time).time,'18:00');
 assert.equal(weddingDate('2028-02-29','19:30').date,'2028-02-29');
});
test('all 50 theme identities remain unique and the broken photo is no longer referenced',()=>{
 assert.equal(themes.length,50);assert.equal(new Set(themes.map(t=>t.slug)).size,50);
 for(const theme of themes)assert.ok(![theme.image,...theme.photoIds].some(value=>value.includes('1465495976277-4387d4b0e4a6')));
});
