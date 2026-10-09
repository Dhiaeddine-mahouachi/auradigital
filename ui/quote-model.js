// One initial catalog. The D1 catalog overrides these values; clients never set final prices.
export const COUNTRIES = {TR:['Turkey','TRY'],TN:['Tunisia','TND'],US:['USA','USD'],EU:['Europe','EUR'],GB:['UK','GBP']};
export const PACKAGES = {static:'Static Website',premium:'Premium Website',dashboard:'Website + Dashboard',payment:'Website + Online Payment',system:'Complete Web System'};
export const FEATURES = {dashboard:'Admin Dashboard',payment:'Online Payment',booking:'Booking System',login:'Customer Login',store:'Products / Store',cms:'Blog / CMS',whatsapp:'WhatsApp',email:'Email Automation',analytics:'Analytics',languages:'Multilingual',motion:'Advanced Animations',ai:'AI Chatbot',crm:'CRM Integration',api:'API Integration',database:'Custom Database',subscriptions:'Subscription System',uploads:'File Uploads',notifications:'Notifications'};
export const STATUSES = ['NEW REQUEST','REVIEWING','QUOTE SENT','QUOTE ACCEPTED','DEPOSIT PAID','DESIGN','DEVELOPMENT','CLIENT REVIEW','FINAL PAYMENT','DELIVERED','MAINTENANCE'];
export const INITIAL_CATALOG = {
  prices:{static:{TRY:6750,TND:620,USD:315,EUR:288,GBP:252},premium:{TRY:13400,TND:1215,USD:585,EUR:540,GBP:468},dashboard:{TRY:22400,TND:2025,USD:945,EUR:882,GBP:765},payment:{TRY:26900,TND:2430,USD:1125,EUR:1035,GBP:882},system:{TRY:35900,TND:3150,USD:1485,EUR:1368,GBP:1170}},
  design:{standard:1,premium:1.15,cinematic:1.3},
  pageFactors:{'1-3':1,'4-6':1.15,'7-10':1.3,'10+':1.5},
  featureFactors:{dashboard:.35,payment:.35,booking:.2,login:.15,store:.25,cms:.15,whatsapp:.02,email:.08,analytics:.02,languages:.12,motion:.1,ai:.25,crm:.25,api:.25,database:.3,subscriptions:.3,uploads:.1,notifications:.1},
  delivery:{static:[5,10],premium:[10,20],dashboard:[20,35],payment:[20,40],system:[30,60]},
  customFeatures:['ai','crm','api','database','subscriptions'],customFeatureCount:8
};
export function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object') throw new Error('Invalid pricing catalog.');
  for (const name of Object.keys(PACKAGES)) for (const [,currency] of Object.values(COUNTRIES)) {
    const price=catalog.prices?.[name]?.[currency];
    if (!Number.isFinite(price) || price<=0 || price>1e8) throw new Error('All localized starting prices must be positive numbers.');
  }
  for(const [key,range] of Object.entries({design:[1,3],pageFactors:[1,3],featureFactors:[0,2]})) {
    for(const name of Object.keys(INITIAL_CATALOG[key])) if(!Number.isFinite(catalog[key]?.[name])||catalog[key][name]<range[0]||catalog[key][name]>range[1]) throw new Error('Invalid pricing factor.');
  }
  for(const name of Object.keys(PACKAGES)) if(!Array.isArray(catalog.delivery?.[name])||catalog.delivery[name].length!==2||catalog.delivery[name].some(n=>!Number.isInteger(n)||n<1||n>365)||catalog.delivery[name][0]>catalog.delivery[name][1]) throw new Error('Invalid delivery range.');
  if(!Array.isArray(catalog.customFeatures)||catalog.customFeatures.some(k=>!Object.hasOwn(FEATURES,k))||!Number.isInteger(catalog.customFeatureCount)||catalog.customFeatureCount<1||catalog.customFeatureCount>18)throw new Error('Invalid custom quote rules.');
  return catalog;
}
export function calculateQuote(configuration,catalog=INITIAL_CATALOG) {
  const {package:kind,pages,design,country}=configuration;
  if(!Object.hasOwn(PACKAGES,kind)||!Object.hasOwn(catalog.pageFactors,pages)||!Object.hasOwn(catalog.design,design)||!Object.hasOwn(COUNTRIES,country))throw new Error('Choose a valid package, page count, design and country.');
  if(!Array.isArray(configuration.features)||configuration.features.length>18||configuration.features.some(f=>!Object.hasOwn(FEATURES,f)))throw new Error('Invalid features.');
  const features=[...new Set(configuration.features)];
  const included={static:[],premium:['motion'],dashboard:['dashboard'],payment:['payment'],system:['dashboard','payment','login','database']}[kind];
  const extra=features.filter(f=>!included.includes(f));
  const custom=kind==='system'||pages==='10+'||extra.some(f=>catalog.customFeatures.includes(f))||extra.length>=catalog.customFeatureCount;
  const currency=COUNTRIES[country][1];
  // Premium and larger packages include 4–10 pages; extra page factors apply to static only.
  const pageFactor=kind==='static'?catalog.pageFactors[pages]:1;
  const designFactor=kind==='premium'&&design==='premium'?1:catalog.design[design];
  const price=Math.round(catalog.prices[kind][currency]*(pageFactor*designFactor+extra.reduce((sum,f)=>sum+catalog.featureFactors[f],0)));
  const days=catalog.delivery[kind].map(d=>Math.ceil(d+(design==='cinematic'?5:0)+extra.length*2));
  return {currency,amount:custom?null:price,startingPrice:catalog.prices[kind][currency],state:custom?'Custom Quote':extra.length||pageFactor!==1||designFactor!==1?'Estimated Price':'Instant Price',delivery:custom?null:days,features:[...new Set([...included,...features])],paymentStages:kind==='system'||kind==='dashboard'||kind==='payment'?[30,40,30]:[50,50]};
}
