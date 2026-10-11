// Convert venue-local wall time into an explicit UTC timestamp, independent of browser zone.
export function localEventInstant(wall,zone){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall))throw new Error('Choose a valid date and time.');
 const [y,m,d,h,min]=wall.match(/\d+/g).map(Number),target=Date.UTC(y,m-1,d,h,min);
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const parts=ms=>Object.fromEntries(fmt.formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
 let instant=target;
 for(let i=0;i<4;i++){const p=parts(instant);const actual=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute);instant+=target-actual;}
 const p=parts(instant);if(p.year!==y||p.month!==m||p.day!==d||p.hour!==h||p.minute!==min)throw new Error('That local time does not exist in this timezone. Choose another time.');
 // Ambiguous fall-back times require an explicit user choice instead of silently choosing an occurrence.
 for(const delta of [-3600000,3600000,-1800000,1800000]){const q=parts(instant+delta);if(q.year===y&&q.month===m&&q.day===d&&q.hour===h&&q.minute===min)throw new Error('That time occurs twice during a clock change. Choose a time outside the clock-change hour.');}
 return new Date(instant).toISOString();
}
export function wallTime(iso,zone){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso)).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`}
export function countdownParts(iso,now=Date.now()){const seconds=Math.max(0,Math.floor((Date.parse(iso)-now)/1000));return{days:Math.floor(seconds/86400),hours:Math.floor(seconds%86400/3600),minutes:Math.floor(seconds%3600/60),seconds:seconds%60,expired:Date.parse(iso)<=now}}
