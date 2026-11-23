import { missionGuide } from './roadmap.js';
import { ApiError } from './http.js';
export const FORMULA_VERSION = 'aura-funnel-1';
export const capabilities = [
 {id:'website',level:1,service:'Website Development',dependencies:[],priority:1},
 {id:'domain',level:1,service:'Domains and Hosting',dependencies:[],priority:1},
 {id:'email',level:1,service:'Business Email',dependencies:['domain'],priority:2},
 {id:'seo',level:2,service:'SEO',dependencies:['website'],priority:2},
 {id:'discovery',level:2,service:'Business Discovery',dependencies:[],priority:2},
 {id:'leads',level:3,service:'Lead Capture',dependencies:['website'],priority:2},
 {id:'crm',level:3,service:'CRM',dependencies:['leads'],priority:3},
 {id:'automation',level:4,service:'AI Automation',dependencies:['crm'],priority:3},
 {id:'analytics',level:5,service:'Analytics',dependencies:['website'],priority:2},
 {id:'retention',level:5,service:'Customer Retention',dependencies:['crm'],priority:3},
 {id:'branding',level:1,service:'Brand identity',dependencies:[],priority:3},
 {id:'hosting',level:1,service:'Hosting and security',dependencies:['website'],priority:3},
 {id:'ads',level:2,service:'Search advertising',dependencies:['leads'],priority:3,optional:true},
 {id:'reviews',level:2,service:'Online reviews',dependencies:['discovery'],priority:3},
 {id:'whatsapp',level:3,service:'WhatsApp integration',dependencies:[],priority:3},
 {id:'conversion',level:3,service:'Conversion optimization',dependencies:['leads'],priority:3},
 {id:'followups',level:4,service:'Automated follow-ups',dependencies:['crm'],priority:3,optional:true},
 {id:'menu',level:1,service:'Digital menu',dependencies:[],priority:2,industry:'restaurant'},
];
// Existing values stay valid; salon, retail and professional were added for AuraHub 4.
const industries = ['restaurant','salon','retail','services','professional','ecommerce','real_estate','other'];
export const INDUSTRIES = industries;
export function validateProfile(input) {
 if(!input || typeof input!=='object' || Array.isArray(input)) throw new ApiError(400,'Business profile required.');
 const profile={};
 for(const [key,max] of Object.entries({name:120,industry:30,country:80,city:100,stage:80,website:500,tools:1200,acquisition:1200,difficulties:1600,goals:1600,timeline:200,industryDetails:1600})) {
  if(input[key]!==undefined && (typeof input[key]!=='string' || input[key].length>max)) throw new ApiError(400,`Invalid ${key}.`);
  profile[key]=String(input[key]||'').trim();
 }
 if(!profile.name) throw new ApiError(400,'Enter your business name.');
 if(profile.industry && !industries.includes(profile.industry)) throw new ApiError(400,'Choose a supported industry.');
 if(profile.website) { let url;try{url=new URL(profile.website);}catch{throw new ApiError(400,'Enter a full HTTPS website URL.');} if(url.protocol!=='https:'||url.username||url.password) throw new ApiError(400,'Use a public HTTPS URL without credentials.'); }
 profile.currency=['USD','EUR','TRY','TND'].includes(input.currency)?input.currency:'USD';
 profile.budget=input.budget===null||input.budget===undefined||input.budget===''?null:number(input.budget,'budget',0,100000000);
 if(!Array.isArray(input.capabilities)||input.capabilities.length>capabilities.length||input.capabilities.some(x=>!capabilities.some(c=>c.id===x))) throw new ApiError(400,'Invalid existing capabilities.');
 profile.capabilities=[...new Set(input.capabilities)];
 // Contact, hours, social and brand details (all optional).
 for(const [key,max] of Object.entries({phone:40,email:254,address:300,hours:600})){
  if(input[key]!==undefined&&input[key]!==null&&(typeof input[key]!=='string'||input[key].length>max))throw new ApiError(400,`Invalid ${key}.`);
  const value=String(input[key]||'').trim();if(value)profile[key]=value;
 }
 if(profile.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))throw new ApiError(400,'Enter a valid email address.');
 if(profile.phone&&!/^[+()0-9\s.-]{5,40}$/.test(profile.phone))throw new ApiError(400,'Enter a valid phone number.');
 if(input.social!==undefined&&input.social!==null){
  if(typeof input.social!=='object'||Array.isArray(input.social))throw new ApiError(400,'Invalid social links.');
  const social={};
  for(const key of ['instagram','facebook','tiktok','linkedin','maps','whatsapp']){
   const value=String(input.social[key]||'').trim();if(!value)continue;
   if(value.length>500)throw new ApiError(400,'Invalid social links.');
   let url;try{url=new URL(value);}catch{throw new ApiError(400,'Use full https:// links for social profiles.');}
   if(url.protocol!=='https:'||url.username||url.password)throw new ApiError(400,'Use full https:// links for social profiles.');
   social[key]=value;
  }
  if(Object.keys(social).length)profile.social=social;
 }
 if(input.brandColors!==undefined&&input.brandColors!==null){
  if(!Array.isArray(input.brandColors)||input.brandColors.length>3||input.brandColors.some(c=>typeof c!=='string'||!/^#[0-9a-fA-F]{6}$/.test(c)))throw new ApiError(400,'Use up to three hex colors like #003D2B.');
  if(input.brandColors.length)profile.brandColors=input.brandColors.map(c=>c.toUpperCase());
 }
 return profile;
}
export function diagnose(profile) {
 const existing=new Set(profile.capabilities||[]);if(profile.website)existing.add('website');
 const relevant=capabilities.filter(c=>!c.industry || c.industry===profile.industry);
 const demand=[profile.goals,profile.difficulties].join(' ');
 const visibility=/visibility|search|traffic|local|reservations|customers|görünür|visibilité|عملاء/i.test(demand);
 const conversion=/leads|sales|convert|bookings|ventes|satış|مبيعات/i.test(demand);
 const automation=/automat|follow.up|manual|messag|otomasyon|أتمتة/i.test(demand);
 const missions=relevant.filter(c=>!existing.has(c.id)).map(c=>{
  const [,reason,nextAction]=missionGuide[c.id];
  const prioritized=(visibility&&['discovery','seo','reviews'].includes(c.id)) ||
   (conversion&&['leads','whatsapp','crm'].includes(c.id)) ||
   (automation&&['automation','followups'].includes(c.id)) ||
   (profile.industry==='restaurant'&&['discovery','menu'].includes(c.id)) ||
   (profile.industry==='ecommerce'&&['analytics','conversion'].includes(c.id)) ||
   (profile.industry==='salon'&&['whatsapp','reviews','discovery','retention'].includes(c.id)) ||
   (profile.industry==='retail'&&['discovery','reviews','website'].includes(c.id)) ||
   (profile.industry==='professional'&&['website','leads','crm'].includes(c.id));
  const optional=c.optional===true || (profile.budget===0&&c.id==='automation');
  return {...c,priority:prioritized&&!optional?1:c.priority,optional,objective:c.service,description:reason,reason,
   estimatedCost:null,currency:profile.currency||'USD',expectedBenefit:reason,nextAction,completionSource:'customer_reported'};
 });
 const strengths=relevant.filter(c=>existing.has(c.id)).map(c=>c.service);
 return {ruleVersion:'aura-readiness-2',source:'customer_entered',strengths,missing:missions.map(c=>c.id),
  readiness:Math.round(strengths.length/relevant.length*100),budget:profile.budget??null,currency:profile.currency||'USD',missions,
  notice:'Readiness measures reported capabilities. Cost requires an approved quote. No purchase is required to complete a mission.'};
}
function number(value,key,min,max) {if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new ApiError(400,`Invalid ${key}.`);return value;}
export function simulate(raw) {
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new ApiError(400,'Simulator inputs required.');
 const inputs={};
 if(raw.solutions!==undefined&&(!Array.isArray(raw.solutions)||raw.solutions.length>capabilities.length||raw.solutions.some(id=>!capabilities.some(c=>c.id===id))))throw new ApiError(400,'Invalid selected digital solutions.');
 inputs.solutions=[...new Set(raw.solutions||[])];
 for(const [k,max] of Object.entries({visits:1e9,leads:1e9,customerValue:1e9,monthlyCost:1e9,setupCost:1e9}))inputs[k]=number(raw[k],k,0,max);
 inputs.closeRate=number(raw.closeRate,'closeRate',0,100);inputs.margin=number(raw.margin,'margin',0,100);
 if(inputs.leads>inputs.visits)throw new ApiError(400,'Leads cannot exceed visits in this website funnel.');
 inputs.currency=['USD','EUR','TRY','TND'].includes(raw.currency)?raw.currency:'USD';
 if(!Array.isArray(raw.assumptions)||raw.assumptions.length!==3)throw new ApiError(400,'Provide three scenario assumptions.');
 inputs.assumptions=raw.assumptions.map((a,i)=>{
  if(!a||typeof a!=='object')throw new ApiError(400,'Invalid scenario.');
  return {name:['conservative','base','ambitious'][i],trafficLift:number(a.trafficLift,'trafficLift',0,300),leadRateLift:number(a.leadRateLift,'leadRateLift',0,300),closeRateLift:number(a.closeRateLift,'closeRateLift',0,300)};
 });
 const baselineCustomers=inputs.leads*inputs.closeRate/100,baselineRevenue=baselineCustomers*inputs.customerValue;
 const scenarios=inputs.assumptions.map(a=>{
  const visits=inputs.visits*(1+a.trafficLift/100),leadRate=inputs.visits?inputs.leads/inputs.visits:0;
  const leads=visits*Math.min(1,leadRate*(1+a.leadRateLift/100)),customers=leads*Math.min(1,inputs.closeRate/100*(1+a.closeRateLift/100));
  const revenue=customers*inputs.customerValue,additionalRevenue=revenue-baselineRevenue,contributionProfit=additionalRevenue*inputs.margin/100,netMonthly=contributionProfit-inputs.monthlyCost;
  const firstYearCost=inputs.setupCost+12*inputs.monthlyCost;
  if([revenue,additionalRevenue,contributionProfit,netMonthly,firstYearCost,12*contributionProfit].some(value=>!Number.isSafeInteger(Math.round(value*100))))throw new ApiError(400,'Reduce the input amounts; the result exceeds safe monetary precision.');
  return {name:a.name,visits,leads,customers,additionalCustomers:customers-baselineCustomers,additionalLeads:leads-inputs.leads,revenue,additionalRevenue,contributionProfit,monthlyCost:inputs.monthlyCost,setupCost:inputs.setupCost,netMonthly,firstYearROI:firstYearCost?((12*contributionProfit-firstYearCost)/firstYearCost)*100:null,paybackMonths:netMonthly>0?inputs.setupCost/netMonthly:null};
 });
 return {formulaVersion:FORMULA_VERSION,inputs,baseline:{customers:baselineCustomers,revenue:baselineRevenue},scenarios,source:'customer_entered_and_assumptions',notice:'Illustrative monthly funnel, not guaranteed growth. Apply one combined lift per funnel stage; overlapping service effects must not be added. Revenue uses a consistent customer-value period. Contribution excludes fixed overhead, taxes and financing.'};
}
