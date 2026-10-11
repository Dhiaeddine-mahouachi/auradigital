// Royal Champagne signature. Shares existing secure API, studio, RSVP and audio.
function floral(pos=''){return `<img class="rc-floral ${pos}" src="/weddings/royal-assets/florals.webp" alt="" aria-hidden="true">`}
function ornaments(){return '<span class="rc-divider" aria-hidden="true">❧ <i>✧</i> ❧</span>'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safePicture(value){if(typeof value!=='string')return '';if(/^\/api\/weddings\/media\/[a-f0-9-]+(?:\?guest=[a-zA-Z0-9%_-]+)?$/.test(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
function picture(d,t){return safePicture(d.hero)||t.hero}
function calendarEscape(s){return String(s??'').replace(/[\r\n]+/g,' ').replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;')}
// Native relief and arch artwork: never a flattened reference screenshot.
function embossed(){return `<svg class="rc-emboss" viewBox="0 0 360 420" aria-hidden="true"><defs><filter id="rc-relief"><feDropShadow dx="1" dy="2" stdDeviation=".65" flood-color="#8d7356" flood-opacity=".65"/><feDropShadow dx="-1" dy="-1" stdDeviation=".4" flood-color="#fffaf1"/></filter></defs><g fill="none" stroke="#e6d4bc" stroke-width="2.4" filter="url(#rc-relief)">${[-1,1].map(side=>`<g transform="translate(${side===1?350:10} 30) scale(${side===1?-1:1} 1)"><path d="M0 0C80 70 10 140 75 220S130 320 110 380M12 28C95 25 75 105 36 91C5 74 45 40 57 62M35 117C112 92 96 170 54 169C19 163 55 126 69 143M62 216C128 185 139 254 99 262C54 260 85 218 105 235M94 308C150 265 172 343 136 354C96 364 115 313 135 322"/>${Array.from({length:14},(_,i)=>`<path d="M${i*7} ${i*26}q-26 -8 -22 -28q25 2 22 28m0 0q24 -25 38 -10q-3 26 -38 10"/>`).join('')}</g>`).join('')}<path d="M160 204q20 -40 40 0q-40 15 -20 38q20 -23 -20 -38M180 190v66"/></g></svg>`}
function arch(){return `<svg class="rc-arch-art" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="rc-foil"><stop stop-color="#6e451f"/><stop offset=".28" stop-color="#d5b37b"/><stop offset=".5" stop-color="#ffdf9c"/><stop offset=".75" stop-color="#aa743e"/><stop offset="1" stop-color="#f5d5a0"/></linearGradient></defs><path d="M10 834V175Q10 96 96 69Q157 54 195 14Q233 54 294 69Q380 96 380 175V834Z" fill="none" stroke="url(#rc-foil)" stroke-width="12"/><path d="M21 824V176Q21 106 100 80Q160 62 195 29Q230 62 290 80Q369 106 369 176V824Z" fill="none" stroke="#b88b50" stroke-width="1.5"/><g fill="none" stroke="#c7985e" stroke-width="1.4">${[1,-1].map(side=>`<g transform="translate(195 0) scale(${side} 1)"><path d="M0 18Q35 75 113 85Q145 90 151 126Q118 102 110 132Q98 160 76 134Q120 146 124 102M36 51Q35 91 67 95Q90 93 74 68M9 33Q11 77 30 100Q54 93 39 77M11 810Q45 794 81 822Q121 849 161 808M45 812Q39 785 55 783Q80 784 72 813"/></g>`).join('')}</g></svg>`}
export function champagneCount({data,words}){return `<section class="sig-section countdown rc-reveal" id="countdown">${floral('rc-flower-tl')}${floral('rc-flower-br')}${ornaments()}<h2 class="rc-script">${data.lang==='ar'?'العد التنازلي':'Countdown'}</h2><div class="count-grid">${['days','hours','minutes','seconds'].map(k=>`<div><strong data-count="${k}">00</strong><span>${esc(words[k])}</span></div>`).join('')}</div><p class="rc-count-caption">${data.lang==='ar'?'حتى يومنا المميز':'Until Our<br>Special Day'}</p>${ornaments()}<p class="expired-note" hidden>${esc(words.celebrate)}</p></section>`}
export function champagneGallery({data,items,words}){return `<section class="sig-section rc-gallery-scene rc-reveal" id="gallery"><span id="story"></span>${floral('rc-flower-tl')}${floral('rc-flower-br')}${ornaments()}<h2 class="rc-script">${data.lang==='ar'?'حكايتنا':'Our Story'}</h2><div class="rc-carousel" tabindex="0" aria-label="${esc(words.gallery)}">${items.map((x,i)=>`<button type="button" data-lightbox="${i}" aria-label="${esc(x.alt||words.gallery)}"><img src="${esc(x.url)}" alt="${esc(x.alt)}" style="object-position:${esc(x.focal||'50% 50%')}" width="600" height="800" loading="lazy"></button>`).join('')}</div>${items.length?`<div class="rc-carousel-actions"><button type="button" data-royal-slide="-1" aria-label="${esc(words.previous)}">‹</button>${ornaments()}<button type="button" data-royal-slide="1" aria-label="${esc(words.next)}">›</button></div>`:`<p>${data.lang==='ar'?'سيضيف العروسان الصور قريبًا':'The couple will add their photographs soon.'}</p>`}<p class="rc-story-caption">${esc(data.story)}</p></section>`}
export function champagneRsvp({data,words,guestName,guestLimit}){return `<section class="sig-section rc-rsvp rc-reveal" id="rsvp">${floral('rc-flower-tl')}${floral('rc-flower-br')}<div class="rsvp-layout"><div class="rsvp-aside"><h2 class="rc-script">${data.lang==='ar'?'تأكيد الحضور':'RSVP'}</h2><p>${data.lang==='ar'?'يسعدنا أن تشاركونا فرحتنا':'We would love to have you with us'}</p></div><form class="sig-form" id="rsvp-form"><div class="form-grid"><label class="wide">${esc(words.name)}<input name="name" autocomplete="name" required maxlength="120" value="${esc(guestName)}"></label><label>${esc(words.response)}<select name="response"><option value="yes">${esc(words.yes)}</option><option value="no">${esc(words.no)}</option>${data.allowMaybe?`<option value="maybe">${esc(words.maybe)}</option>`:''}</select></label><label>${esc(words.attendees)}<select name="attendees">${Array.from({length:guestLimit},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select></label><label class="wide">${esc(words.message)}<textarea name="message" rows="2" maxlength="2000"></textarea></label><label class="consent wide"><input type="checkbox" name="consent" required>${esc(words.consent)}</label><label class="honeypot" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label></div><button type="submit">${data.lang==='ar'?'إرسال الرد':'Send RSVP'}</button><p class="form-status" role="status"></p></form></div></section>`}
export function isRoyalChampagne(t){return t?.slug==='royal-champagne-signature'}
export function champagneGate({data,names,date,words}){
 const mark=esc(data.seal||'A·S');
 return `<div class="gate opening-envelope rc-gate" role="dialog" aria-modal="true" aria-labelledby="gate-title" data-state="sealed">
 <div class="gate-backdrop"></div><div class="rc-gate-glow" aria-hidden="true"></div>
 <div class="gate-content"><div class="rc-top-ornament">✧ ── ❦ ── ✧</div>
 <p class="gate-title" id="gate-title">${data.lang==='ar'?'أنتم مدعوون':'YOU’RE INVITED'}</p>
 <div class="paper-stage"><div class="stationery">
 <div class="rc-envelope-back">${embossed()}</div><div class="paper-card"><div class="rc-card-inner">
 <span class="rc-gold-arabic" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
 <small>${esc(words.letter)}</small><strong>${names}</strong><span>${esc(date)}</span>${ornaments()}
 </div></div><div class="rc-side-fold rc-side-left"></div><div class="rc-side-fold rc-side-right"></div><div class="envelope-front">${floral('rc-front-left')}${floral('rc-front-right')}<span class="rc-front-mark">${embossed()}</span></div>
 <div class="envelope-flap">${embossed()}<div class="rc-flap-foil"></div></div>
 <button class="seal rc-seal-trigger" type="button" aria-label="${esc(words.open)} — ${mark}"><span>${mark}</span><i></i></button></div></div>
 <div class="gate-controls"><button class="open-invitation" type="button">${esc(words.open)} ✧</button><button class="skip" type="button">${esc(words.skip)}</button></div><p class="gate-note">${data.lang==='ar'?'تبدأ حكاية حب':'A LOVE STORY BEGINS'}</p>
 </div><div class="rc-falling-petals" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>`;
}
export function champagneHero({data,theme,names,date}){
 return `<section class="sig-hero rc-couple-hero rc-reveal" id="home" tabindex="-1">
 <img class="hero-photo" src="${esc(picture(data,theme))}" alt="${esc(data.partnerOne+' & '+data.partnerTwo)} wedding atmosphere" fetchpriority="high" width="1080" height="1440">
 <div class="rc-hero-veil"></div>
 <div class="hero-copy"><span class="eyebrow">${data.lang==='ar'?'رحلة قلبين':'A JOURNEY OF TWO HEARTS'}</span><p class="rc-hero-sub">${data.lang==='ar'?'يصبحان قلبًا واحدًا':'BECOMING ONE'}</p>${ornaments()}<h1 class="sr-only">${names}</h1></div></section>`;
}
export function champagneLetter({data,names,date}){
 return `<section class="sig-section rc-parchment-section rc-letter rc-reveal" id="letter" tabindex="-1"><div class="rc-frame rc-arch">${arch()}
 ${floral('rc-flower-tl')}${floral('rc-flower-tr')}${floral('rc-flower-bl')}${floral('rc-flower-br')}
 <span class="rc-top-ornament">✧ ── ❦ ── ✧</span>
 <p class="rc-bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
 <p class="rc-small-intro">${esc(data.lang==='ar'?'بمشاركة أهلنا وأحبتنا':data.families||'Together with our families')}</p>
 <p class="rc-invited">${data.lang==='ar'?'نتشرف بدعوتكم لحضور حفل زفاف':'CORDIALLY INVITE YOU TO THE WEDDING OF'}</p>
 <h2 class="letter-names">${names}</h2>${ornaments()}
 <p class="rc-poem">${esc(data.lang==='ar'?data.messageAr:data.message)}</p>
 <time class="rc-event-date">${esc(date)}</time><p class="rc-venue-title">${esc(data.venue)}</p>
 <a href="#rsvp" class="rc-outline-action">${data.lang==='ar'?'تأكيد الحضور':'KINDLY REPLY'} ↓</a>
 </div></section>`;
}
export function champagneSchedule({data,date}){
 const destination=Number.isFinite(data.lat)&&Number.isFinite(data.lng)&&data.lat!==null&&data.lng!==null?`${data.lat},${data.lng}`:data.address;
 const icons={calendar:'<rect x="4" y="5" width="20" height="19" rx="2"/><path d="M4 11h20M9 2v6M19 2v6M9 15h2m4 0h2m-8 4h2m4 0h2"/>',pin:'<path d="M14 26S4 15 4 10a10 10 0 0 1 20 0c0 5-10 16-10 16Z"/><circle cx="14" cy="10" r="4"/>',car:'<path d="M3 20V13l4-8h14l4 8v7M3 13h22M6 20v4m16-4v4M7 16h2m10 0h2"/>'};
 const icon=key=>`<span class="rc-detail-icon" aria-hidden="true"><svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8">${icons[key]}</svg></span>`;
 return `<section class="sig-section rc-parchment-section rc-details rc-reveal" id="schedule"><div class="rc-frame">
 ${floral('rc-flower-tl')}${floral('rc-flower-br')}
 <div class="rc-top-ornament">❧</div><h2 class="rc-script">${data.lang==='ar'?'تفاصيل الزفاف':'Wedding Details'}</h2>${ornaments()}
 <div class="rc-detail-line">${icon('calendar')}<div><small>${data.lang==='ar'?'التاريخ':'DATE'}</small><strong>${esc(date)}</strong></div></div>
 <div class="rc-detail-line">${icon('pin')}<div><small>${data.lang==='ar'?'المكان':'VENUE'}</small><strong>${esc(data.venue)}</strong><p>${esc(data.address)}</p></div></div>
 <div class="rc-detail-line">${icon('car')}<div><small>${data.lang==='ar'?'الاتجاهات':'DIRECTIONS'}</small>${destination?`<a class="rc-inline-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(destination)}" target="_blank" rel="noopener noreferrer">${data.lang==='ar'?'الاتجاهات إلى الحفل':'Get Directions'}</a>`:`<p>${data.lang==='ar'?'سيتم تأكيد الموقع':'Location to be confirmed'}</p>`}</div></div>
 <a data-royal-calendar class="rc-outline-action" href="#">${data.lang==='ar'?'أضف إلى التقويم':'ADD TO CALENDAR'} ↗</a>
 </div></section>`;
}
export function champagneVenue({data,theme,demo,words}){
 const known=Number.isFinite(data.lat)&&Number.isFinite(data.lng)&&data.lat!==null&&data.lng!==null;
 const destination=known?`${data.lat},${data.lng}`:data.address&&data.address!=='Venue details will be confirmed by the couple.'?data.address:'';
 return `<section class="sig-section rc-parchment-section rc-venue rc-reveal" id="venue"><div class="rc-frame">
 ${floral('rc-flower-tl')}${floral('rc-flower-br')}<h2 class="rc-script">${data.lang==='ar'?'الموقع':'Location'}</h2>${ornaments()}
 <img class="rc-venue-picture" src="${esc(safePicture(data.venuePhoto)||'/weddings/royal-assets/venue.webp')}" alt="${esc(data.venue)}${data.venuePhoto?'':' — illustrative palace'}" loading="lazy" width="800" height="650">
 <h3>${esc(data.venue)}</h3><address>${esc(data.address)}</address>
 ${destination?`<a class="rc-gold-button" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(destination)}" target="_blank" rel="noopener noreferrer">${data.lang==='ar'?'فتح خرائط جوجل':'Open in Google Maps'} ↗</a>`:'<p class="rc-pending">Directions will be available when the couple adds the venue.</p>'}
 ${demo?'<small class="rc-disclaimer">Illustrative preview — not a real wedding venue listing.</small>':''}</div></section>`;
}
export function champagneStory({data,theme,words}){
 return `<section class="sig-section rc-story rc-reveal" id="story">
 <div class="rc-story-photo"><img src="${esc(picture(data,theme))}" loading="lazy" alt="Romantic wedding atmosphere" width="850" height="1100"></div>
 <div class="rc-story-copy"><span class="eyebrow">A JOURNEY OF TWO HEARTS</span><h2 class="rc-script">${esc(words.story)}</h2>${ornaments()}
 <blockquote>${esc(data.story)}</blockquote><a href="#gallery" class="rc-outline-action">${data.lang==='ar'?'صورنا':'OUR MOMENTS'} ↓</a></div></section>`;
}
export function champagneExtras({data}){
 return `<section class="sig-section rc-music-scene rc-reveal" id="royal-music">${floral('rc-flower-tl')}${floral('rc-flower-br')}
 <div class="rc-top-ornament">✧ ── ❦ ── ✧</div><h2 class="rc-script">${data.lang==='ar'?'موسيقى':'Music'}</h2>
 <p>${data.lang==='ar'?'استمع إلى موسيقى دعوتنا':'A little music for our celebration'}</p>
 <button type="button" class="rc-music-launch" data-royal-music aria-pressed="false" aria-label="${data.lang==='ar'?'تشغيل الموسيقى':'Play wedding music'}"><span>▶</span></button><label class="rc-volume"><span>${data.lang==='ar'?'الصوت':'Volume'}</span><input data-royal-volume type="range" min="0" max="1" step=".05" value=".2"></label>
 <small>${data.musicUrl?esc(data.musicTitle||'Wedding music'):data.lang==='ar'?'موسيقى تجريبية أصلية — أضف تسجيلك في الاستوديو':'Original oud-style instrumental — customize in the studio'}</small></section>
 <section class="sig-section rc-language-scene rc-reveal" id="royal-language">
 <div class="rc-frame rc-arch">${floral('rc-flower-tl')}${floral('rc-flower-br')}
 <div class="rc-bismillah" lang="ar" dir="rtl">دَعْوَةُ زَفَافٍ</div><h2>${data.lang==='ar'?'دعوتكم إلى فرحتنا':'Wedding Invitation'}</h2>${ornaments()}
 <div class="rc-language-actions"><button type="button" data-royal-language="en" aria-pressed="${data.lang==='en'}">English</button><button type="button" data-royal-language="ar" aria-pressed="${data.lang==='ar'}">العربية</button></div></div></section>`;
}
export function enhanceChampagne(root,data){
 const player=root.querySelector('#audio-play'),launch=root.querySelector('[data-royal-music]');
 if(player&&launch){const sync=()=>{const playing=player.getAttribute('aria-pressed')==='true';launch.setAttribute('aria-pressed',String(playing));launch.querySelector('span').textContent=playing?'Ⅱ':'▶';launch.setAttribute('aria-label',data.lang==='ar'?(playing?'إيقاف الموسيقى':'تشغيل الموسيقى'):(playing?'Pause wedding music':'Play wedding music'))};launch.onclick=()=>player.click();new MutationObserver(sync).observe(player,{attributes:true,childList:true});sync()}
 const volume=root.querySelector('[data-royal-volume]');if(volume)volume.oninput=()=>{const input=root.querySelector('#audio-volume');input.value=volume.value;input.dispatchEvent(new Event('input'))};
 const strip=root.querySelector('.rc-carousel');if(strip){const items=[...strip.querySelectorAll('[data-lightbox]')];let index=0;const move=delta=>{index=(index+delta+items.length)%items.length;const target=items[index];strip.scrollTo({left:target.offsetLeft-strip.offsetLeft-(strip.clientWidth-target.clientWidth)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});items.forEach((b,i)=>b.setAttribute('aria-current',String(i===index)))};root.querySelectorAll('[data-royal-slide]').forEach(b=>b.onclick=()=>move(Number(b.dataset.royalSlide)));strip.onkeydown=e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}};if(items.length)move(0)}
 for(const b of root.querySelectorAll('[data-royal-language]'))b.addEventListener('click',()=>{if(b.dataset.royalLanguage!==data.lang)root.querySelector('#language')?.click()});
 const t=new Date(data.eventAt);
 if(Number.isFinite(t.getTime())){
  const end=new Date(t.getTime()+2*60*60*1000),utc=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const raw=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AuraDigital//AuraWeddings//EN','BEGIN:VEVENT','UID:'+utc(t)+'@auradigitalworks.com','DTSTAMP:'+utc(new Date()),'DTSTART:'+utc(t),'DTEND:'+utc(end),'SUMMARY:'+calendarEscape(data.partnerOne+' & '+data.partnerTwo+' Wedding'),'LOCATION:'+calendarEscape(data.address||data.venue),'DESCRIPTION:'+calendarEscape(data.message),'END:VEVENT','END:VCALENDAR'].join('\r\n');
  root.querySelectorAll('[data-royal-calendar]').forEach(a=>{a.href='data:text/calendar;charset=utf-8,'+encodeURIComponent(raw);a.download='wedding-date.ics'});
 }
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
  const ob=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rc-visible');ob.unobserve(e.target)}})},{threshold:.1});
  root.querySelectorAll('.rc-reveal').forEach(el=>ob.observe(el));
 }else root.querySelectorAll('.rc-reveal').forEach(el=>el.classList.add('rc-visible'));
}
