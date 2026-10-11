import test from 'node:test';
import assert from 'node:assert/strict';
import {signatureTheme,signatureThemes,sampleInvitation} from '../weddings/signature-themes.js';
import {isRoyalChampagne,champagneGate,champagneHero,champagneLetter,champagneVenue,champagneSchedule,champagneExtras} from '../weddings/royal-champagne.js';

const theme=signatureTheme('royal-champagne-signature');
const data={...sampleInvitation,partnerOne:'Ayesha',partnerTwo:'Salman',seal:'A·S',venue:'A published wedding venue',address:'Valid guest supplied address',lat:25.2048,lng:55.2708};
const ctx={data,theme,names:'Ayesha <i>&amp;</i> Salman',date:'20 April 2027',words:{open:'Open Invitation',skip:'Skip animation',letter:'A letter of love',directions:'Open directions',story:'Our story'}};

test('Royal Champagne is additive and keeps legacy themes',()=>{
 assert.equal(signatureThemes.length,26);
 assert.equal(theme.opening,'envelope');
 assert.equal(theme.category,'Royal');
 assert.ok(isRoyalChampagne(theme));
 assert.ok(!isRoyalChampagne(signatureTheme('ivory-botanical')));
});
test('envelope has independent real movable paper layers and accessible controls',()=>{
 const html=champagneGate(ctx);
 for(const part of ['class="paper-stage"','class="paper-card"','class="envelope-front"','class="envelope-flap"','class="seal rc-seal-trigger"','class="open-invitation"','class="skip"']) assert.ok(html.includes(part),part);
 assert.match(html,/aria-modal="true"/);
 assert.match(html,/A·S/);
});
test('royal scenes contain active wedding details, calendar and maps, not a screenshot',()=>{
 assert.match(champagneHero(ctx),/Ayesha/);
 assert.match(champagneLetter(ctx),/بِسْمِ/);
 assert.match(champagneSchedule(ctx),/data-royal-calendar/);
 assert.match(champagneVenue({...ctx,demo:false}),/maps\/dir\/\?api=1/);
 const extra=champagneExtras(ctx);
 assert.match(extra,/data-royal-language/);
 assert.match(extra,/data-royal-music/);
});
test('dynamic guest-authored text is escaped in custom scenes',()=>{
 const malicious={...data,venue:'<img src=x onerror=alert(1)>',message:'<script>alert(1)</script>',story:'unsafe" onclick="oops'};
 const out=champagneLetter({...ctx,data:malicious})+champagneVenue({...ctx,data:malicious,demo:false});
 assert.ok(!out.includes('<script>'));
 assert.ok(!out.includes('<img src=x onerror=alert(1)>'));
 assert.match(out,/&lt;script&gt;/);
});
test('untrusted image URLs are not written to the royal hero',()=>{
 const html=champagneHero({...ctx,data:{...data,hero:'javascript:alert(1)'}});
 assert.ok(!html.includes('javascript:'));
 assert.match(html,/royal-assets\/couple\.webp/);
});

test('venue photograph is independent, escaped and rejects executable/credential URLs',()=>{
 const supplied=champagneVenue({...ctx,data:{...data,hero:'https://example.com/couple.webp',venuePhoto:'https://example.com/venue.webp'},demo:false});
 assert.match(supplied,/example.com\/venue.webp/);assert.ok(!supplied.includes('example.com/couple.webp'));
 for(const venuePhoto of ['javascript:alert(1)','https://user:pass@example.com/photo']){const html=champagneVenue({...ctx,data:{...data,venuePhoto},demo:false});assert.match(html,/royal-assets\/venue.webp/);assert.ok(!html.includes(venuePhoto))}
});
