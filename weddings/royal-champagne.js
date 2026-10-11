// Royal Champagne signature. Shares existing secure API, studio, RSVP and audio.
function floral(pos=''){return `<img class="rc-floral ${pos}" src="/weddings/royal-champagne-floral.svg" alt="" aria-hidden="true">`}
function ornaments(){return '<span class="rc-divider" aria-hidden="true">❧ <i>✧</i> ❧</span>'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function picture(d,t){const h=String(d.hero||'');return /^\/api\/weddings\/media\/[a-f0-9-]+$/.test(h)||/^https:\/\/[^\s"'<>]+$/.test(h)?h:t.hero}
function calendarEscape(s){return String(s??'').replace(/[\r\n]+/g,' ').replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;')}
export function isRoyalChampagne(t){return t?.slug==='royal-champagne-signature'}
export function champagneGate({data,names,date,words}){
 const mark=esc(data.seal||'A·S');
 return `<div class="gate opening-envelope rc-gate" role="dialog" aria-modal="true" aria-labelledby="gate-title" data-state="sealed">
 <div class="gate-backdrop"></div><div class="rc-gate-glow" aria-hidden="true"></div>
 <div class="gate-content"><div class="rc-top-ornament">✧ ── ❦ ── ✧</div>
 <p class="gate-title" id="gate-title">${data.lang==='ar'?'أنتم مدعوون':'YOU’RE INVITED'}</p>
 <div class="paper-stage"><div class="stationery">
 <div class="rc-envelope-back"></div><div class="paper-card"><div class="rc-card-inner">
 <span class="rc-gold-arabic" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
 <small>${esc(words.letter)}</small><strong>${names}</strong><span>${esc(date)}</span>${ornaments()}
 </div></div><div class="envelope-front">${floral('rc-front-left')}${floral('rc-front-right')}<span class="rc-front-mark">AURA WEDDINGS</span></div>
 <div class="envelope-flap">${floral('rc-flap-left')}${floral('rc-flap-right')}</div>
 <span class="seal" aria-hidden="true"><span>${mark}</span><i></i></span></div></div>
 <div class="gate-controls"><button class="open-invitation" type="button">${esc(words.open)} ✧</button><button class="skip" type="button">${esc(words.skip)}</button></div><p class="gate-note">A LOVE STORY BEGINS</p>
 </div><div class="rc-falling-petals" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div>`;
}
export function champagneHero({data,theme,names,date}){
 return `<section class="sig-hero rc-couple-hero rc-reveal" id="home" tabindex="-1">
 <img class="hero-photo" src="${esc(picture(data,theme))}" alt="${esc(data.partnerOne+' & '+data.partnerTwo)} wedding illustration" fetchpriority="high" width="1080" height="1440">
 <div class="rc-hero-veil"></div>${floral('rc-hero-flower')}
 <div class="hero-copy"><span class="eyebrow">A JOURNEY OF TWO HEARTS</span><p class="rc-hero-sub">BECOMING ONE</p>
 <h1>${names}</h1>${ornaments()}<time class="hero-date">${esc(date)}</time>
 <a class="sig-button" href="#letter">${data.lang==='ar'?'اقرأ الدعوة':'Discover our invitation'} ↓</a></div></section>`;
}
export function champagneLetter({data,names,date}){
 return `<section class="sig-section rc-parchment-section rc-letter rc-reveal" id="letter"><div class="rc-frame rc-arch">
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
 const rows=data.schedule?.length?data.schedule:[{time:'',title:'Wedding celebration',description:'We cannot wait to celebrate with you.'}];
 return `<section class="sig-section rc-parchment-section rc-details rc-reveal" id="schedule"><div class="rc-frame">
 ${floral('rc-flower-tl')}${floral('rc-flower-br')}
 <div class="rc-top-ornament">❧</div><h2 class="rc-script">${data.lang==='ar'?'تفاصيل الزفاف':'Wedding Details'}</h2>${ornaments()}
 <div class="rc-detail-line"><span class="rc-detail-icon" aria-hidden="true">▦</span><div><small>${data.lang==='ar'?'التاريخ':'DATE'}</small><strong>${esc(date)}</strong></div></div>
 <div class="rc-detail-line"><span class="rc-detail-icon" aria-hidden="true">⌖</span><div><small>${data.lang==='ar'?'المكان':'VENUE'}</small><strong>${esc(data.venue)}</strong><p>${esc(data.address)}</p></div></div>
 ${rows.map(x=>`<div class="rc-detail-line"><span class="rc-detail-icon" aria-hidden="true">✧</span><div><small>${esc(x.time)}</small><strong>${esc(x.title)}</strong><p>${esc(x.description)}</p></div></div>`).join('')}
 <a data-royal-calendar class="rc-outline-action" href="#">${data.lang==='ar'?'أضف إلى التقويم':'ADD TO CALENDAR'} ↗</a>
 </div></section>`;
}
export function champagneVenue({data,theme,demo,words}){
 const known=Number.isFinite(data.lat)&&Number.isFinite(data.lng)&&data.lat!==null&&data.lng!==null;
 const destination=known?`${data.lat},${data.lng}`:data.address&&data.address!=='Venue details will be confirmed by the couple.'?data.address:'';
 return `<section class="sig-section rc-parchment-section rc-venue rc-reveal" id="venue"><div class="rc-frame">
 ${floral('rc-flower-tl')}${floral('rc-flower-br')}<h2 class="rc-script">${data.lang==='ar'?'الموقع':'Location'}</h2>${ornaments()}
 <img class="rc-venue-picture" src="${esc(picture(data,theme))}" alt="${esc(data.venue)} illustrative artwork" loading="lazy" width="800" height="650">
 <h3>${esc(data.venue)}</h3><address>${esc(data.address)}</address>
 ${destination?`<a class="rc-gold-button" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(destination)}" target="_blank" rel="noopener noreferrer">${esc(words.directions)} ↗</a>`:'<p class="rc-pending">Directions will be available when the couple adds the venue.</p>'}
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
 <button type="button" class="rc-music-launch" data-royal-music aria-label="Play or pause wedding music">♫ <span>▶</span></button>
 <small>${data.musicUrl?esc(data.musicTitle||'Wedding music'):'Original ambient demo · add licensed music in the studio'}</small></section>
 <section class="sig-section rc-language-scene rc-reveal" id="royal-language">
 <div class="rc-frame rc-arch">${floral('rc-flower-tl')}${floral('rc-flower-br')}
 <div class="rc-bismillah" lang="ar" dir="rtl">دَعْوَةُ زَفَافٍ</div><h2>Wedding Invitation</h2>${ornaments()}
 <div class="rc-language-actions"><button type="button" data-royal-language="en" aria-pressed="${data.lang==='en'}">English</button><button type="button" data-royal-language="ar" aria-pressed="${data.lang==='ar'}">العربية</button></div></div></section>`;
}
export function enhanceChampagne(root,data){
 for(const b of root.querySelectorAll('[data-royal-music]'))b.addEventListener('click',()=>root.querySelector('#audio-play')?.click());
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