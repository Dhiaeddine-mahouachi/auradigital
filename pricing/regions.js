import { catalogue as base, groups, createPricingEngine } from './catalogue.js';
// Commercial rates approved by the owner. These are not exchange rates.
export const defaults = {
  enabled:true, fallback:'TR',
  regions:{
    TR:{name:'Türkiye',currency:'TRY',enabled:true}, TN:{name:'Tunisia',currency:'TND',enabled:true},
    US:{name:'United States',currency:'USD',enabled:true}, EU:{name:'Eurozone',currency:'EUR',enabled:true}, GB:{name:'United Kingdom',currency:'GBP',enabled:true}
  },
  countries:Object.fromEntries(['AT','BE','BG','CY','DE','EE','ES','FI','FR','GR','HR','IE','IT','LT','LU','LV','MT','NL','PT','SI','SK'].map(c=>[c,'EU']).concat([['TR','TR'],['TN','TN'],['US','US'],['GB','GB']])),
  prices:{TR:Object.fromEntries(groups.flatMap(g=>base[g]).flatMap(p=>[[p.id,{minor:p.price*100}],...(p.annualHosting?[['hosting:'+p.id,{minor:p.annualHosting*100}]]:[])]))}
};
for (const [region,rates] of Object.entries({TN:[600,1200,2000,2400,3100],US:[315,585,945,1125,1485],EU:[288,540,882,1035,1368],GB:[252,468,765,882,1170]})) {
  defaults.prices[region]=Object.fromEntries(base.website.map((p,i)=>[p.id,{minor:rates[i]*(region==='TN'?1000:100)}]));
}
export const initialVersion='2026-10-15-global-1';
export function selectRegion(config,request,override) {
  const url=new URL(request.url);
  const cookie=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('aura-pricing-region='))?.split('=')[1];
  const manual=override||url.searchParams.get('region');
  if(manual && (!Object.hasOwn(config.regions,manual)||!config.regions[manual].enabled)) throw new Error('Unsupported pricing region');
  const detected=config.countries[request.cf?.country];
  const saved=Object.hasOwn(config.regions,cookie||'')&&config.regions[cookie].enabled?cookie:null;
  return config.enabled ? (manual || saved || (config.regions[detected]?.enabled?detected:config.fallback)) : config.fallback;
}
export function regionalEngine(config=defaults,region='TR',version=initialVersion,now=Date.now()) {
  const meta=config.regions[region];
  if(!meta?.enabled) throw new Error('Unsupported pricing region');
  const copy=structuredClone(base), factor=meta.currency==='TND'?1000:100;
  const amount=id=>{
    const rate=config.prices[region]?.[id];
    if(!rate || (rate.validFrom && Date.parse(rate.validFrom)>now) || (rate.validUntil && Date.parse(rate.validUntil)<=now)) return NaN;
    const promo=rate.promoMinor!==undefined && Date.parse(rate.promoUntil)>now && (!rate.promoFrom||Date.parse(rate.promoFrom)<=now);
    return (promo?rate.promoMinor:rate.minor)/factor;
  };
  for(const g of groups) for(const p of copy[g]) {p.price=amount(p.id);if('annualHosting' in p)p.annualHosting=amount('hosting:'+p.id);}
  Object.assign(copy,{currency:meta.currency,region,version});
  return createPricingEngine(copy);
}
export function validateConfig(input) {
  if(!input || typeof input.enabled!=='boolean' || !input.regions || !input.countries || !input.prices) throw new Error('Invalid regional pricing configuration');
  const allowed=new Set(groups.flatMap(g=>base[g]).flatMap(p=>[p.id,...(p.annualHosting?['hosting:'+p.id]:[])]));
  if(Object.keys(input.regions).length>50||Object.keys(input.countries).length>260) throw new Error('Too many regions or countries');
  for(const [id,r] of Object.entries(input.regions)) {
    if(!/^[A-Z]{2,8}$/.test(id)||typeof r.name!=='string'||r.name.length>80||!['TRY','TND','USD','EUR','GBP'].includes(r.currency)||typeof r.enabled!=='boolean') throw new Error('Invalid region or unsupported currency');
  }
  if(!input.regions[input.fallback]?.enabled) throw new Error('Fallback region must be enabled');
  for(const [country,region] of Object.entries(input.countries)) if(!/^[A-Z]{2}$/.test(country)||!Object.hasOwn(input.regions,region)) throw new Error('Invalid country mapping');
  for(const [region,prices] of Object.entries(input.prices)) {
    if(!Object.hasOwn(input.regions,region)) throw new Error('Unknown price region');
    for(const [id,rate] of Object.entries(prices)) {
      if(!allowed.has(id)||!rate||!Number.isSafeInteger(rate.minor)||rate.minor<0||rate.minor>1e12) throw new Error('Invalid service rate in minor units');
      for(const k of ['validFrom','validUntil','promoFrom','promoUntil']) if(rate[k] && !Number.isFinite(Date.parse(rate[k]))) throw new Error('Invalid validity date');
      if(rate.validFrom&&rate.validUntil&&Date.parse(rate.validFrom)>=Date.parse(rate.validUntil)) throw new Error('Invalid validity interval');
      if(rate.promoMinor!==undefined&&(!Number.isSafeInteger(rate.promoMinor)||rate.promoMinor<0||rate.promoMinor>rate.minor||!rate.promoUntil)) throw new Error('Promotion needs an approved amount and expiry');
      if(rate.promoFrom&&Date.parse(rate.promoFrom)>=Date.parse(rate.promoUntil)) throw new Error('Invalid promotion interval');
    }
  }
  // Normalize JSON; no customer records are involved in publication.
  return JSON.parse(JSON.stringify(input));
}
