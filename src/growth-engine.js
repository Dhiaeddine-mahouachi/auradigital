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
];
const industries = ['restaurant','services','ecommerce','real_estate','other'];
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
 return profile;
}
export function diagnose(profile) {
 const existing=new Set(profile.capabilities||[]);if(profile.website)existing.add('website');
 const missions=capabilities.filter(c=>!existing.has(c.id)).map(c=>({...c,objective:c.service,description:`Establish ${c.service.toLowerCase()} for your business.`,reason:'This capability has not been reported in your business profile.',estimatedCost:null,currency:profile.currency||'USD',expectedBenefit:'Potential improvement; measure against your own baseline.',nextAction:'Define scope or record your existing solution.',completionSource:'customer_reported'}));
 return {ruleVersion:'aura-readiness-1',source:'customer_entered',strengths:capabilities.filter(c=>existing.has(c.id)).map(c=>c.service),missing:missions.map(c=>c.id),readiness:Math.round(existing.size/capabilities.length*100),budget:profile.budget??null,currency:profile.currency||'USD',missions,notice:'Readiness measures reported capabilities, not business success. Cost requires an approved quote. No purchase is required to complete a mission.'};
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
