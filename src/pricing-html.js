import { catalogue as base, createPricingEngine } from "../pricing/catalogue.js";
export function renderPricingFallback(view,engine=createPricingEngine(base)) {
const {catalogue,getItem,fmt,priceText,firstYearWebsite,firstYearERP}=engine;

// Initial HTML is generated from the same catalogue as interactive browser and API pricing.
// The client-side pricing module progressively enhances these sections after module load.
const escape = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;")
  .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const amount = n => escape(fmt(n));
const price = item => escape(priceText(item));
const action = (p,label="Request Quote") => '<a class="btn btn-ghost" href="/contact?service=pricing&amp;plan='+
  encodeURIComponent(p.id)+'">'+escape(label)+' ↗</a>';
const bullets = values => '<ul class="aura-price-features">'+(values||[]).map(x=>'<li>'+escape(x)+'</li>').join("")+'</ul>';
const card = (p,note="",label="Choose Package") => '<article class="aura-price-card">'+
  '<h3>'+escape(p.name)+'</h3>'+(p.audience?'<p class="aura-price-audience">'+escape(p.audience)+'</p>':'')+
  '<p class="aura-price-money">'+price(p)+'</p><small class="aura-price-period">'+(p.billing==="month"?"Monthly":p.billing==="year"?"Annual":"One-time")+'</small>'+
  (p.availability==="planned"?'<p class="aura-price-warning">Planned service · request availability</p>':'')+
  '<details class="aura-price-details" open><summary>View full features</summary>'+bullets(p.features)+'</details>'+
  (note?'<p class="aura-price-total">'+note+'</p>':'')+action(p,label)+'</article>';
const grid = (items,extra="") => '<div class="aura-price-card-grid">'+items.map(p=>card(p,extra)).join("")+'</div>';
const services = [
  ["Web Design & Development","launch","/websites","Business websites, landing pages and web applications."],
  ["Google & Meta Ads","basic-ads","/contact?service=pricing&plan=basic-ads","Campaign setup, conversion tracking and management."],
  ["Website Care","essential-care","/packages","Website maintenance, uptime checks and defined monthly updates."],
  ["Hosting & Security","standard-infra","/contact?service=pricing&plan=standard-infra","Domain, DNS, SSL, hosting and baseline protection."],
  ["Business Email","business-email","/contact?service=pricing&plan=business-email","Business mailbox setup; provider subscriptions are separate."],
  ["ERP & systems","spinflow-start","/spinflow","Cloud SaaS and scoped custom ERP for business operations."],
  ["SEO & Google Maps",null,"/contact?service=SEO","Local visibility and on-page SEO."],
  ["AI & Automation",null,"/contact?service=AI%20%26%20Automation","Lead routing and workflow automation."],
  ["Brand & Creative Direction",null,"/contact?service=Brand%20Design","Brand identity and advertising creative."],
  ["NFC & QR","nfc-card","/nfc","NFC cards, digital menus and smart experiences."],
  ["AuraWeddings",null,"/aura-weddings","Animated invitations, design studio and RSVP."],
];
const home = [
  ["Websites & Development","/websites"],
  ["Website Management","/packages"],
  ["Hosting & Security","/contact?service=pricing&plan=standard-infra"],
  ["Advertising & Growth","/contact?service=pricing&plan=basic-ads"],
  ["Business Systems & ERP","/spinflow"],
  ["Dashboards & Automation","/websites#web-addons"],
];
const serviceIconPaths = {
  "web": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 9h18M7 6.5h.01M10 6.5h.01\"/>",
  "ads": "<path d=\"m4 10 15-5v14L4 14v-4Z\"/><path d=\"m7 15 2 6h4l-3-5\"/>",
  "care": "<path d=\"M12 3 4.5 6v5.5c0 5 3 8 7.5 9.5 4.5-1.5 7.5-4.5 7.5-9.5V6L12 3Z\"/><path d=\"m9 12 2 2 4-4\"/>",
  "hosting": "<rect x=\"4\" y=\"3\" width=\"16\" height=\"8\" rx=\"2\"/><rect x=\"4\" y=\"13\" width=\"16\" height=\"8\" rx=\"2\"/><path d=\"M8 7h.01M8 17h.01M12 7h5M12 17h5\"/>",
  "email": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"m3 7 9 6 9-6\"/>",
  "erp": "<rect x=\"3\" y=\"3\" width=\"8\" height=\"8\" rx=\"1\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"8\" rx=\"1\"/><rect x=\"3\" y=\"13\" width=\"8\" height=\"8\" rx=\"1\"/><rect x=\"13\" y=\"13\" width=\"8\" height=\"8\" rx=\"1\"/>",
  "seo": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-4-4M8 12l2-2 2 1 3-3\"/>",
  "ai": "<rect x=\"5\" y=\"7\" width=\"14\" height=\"13\" rx=\"3\"/><path d=\"M12 3v4M9 3h6M9 13h.01M15 13h.01M9 17h6\"/>",
  "brand": "<path d=\"m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z\"/>",
  "nfc": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M8 10v4m3-5a5 5 0 0 1 0 6m3-8a8 8 0 0 1 0 10\"/>",
  "weddings": "<path d=\"M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z\"/>"
};
const serviceIcon = key => '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">'+(serviceIconPaths[key]||serviceIconPaths.web)+'</svg>';
const serviceCard = ([name,id,url,description],index) => {
  const item=id?getItem(id):null;
  const icon=serviceIcon(["web","ads","care","hosting","email","erp","seo","ai","brand","nfc","weddings"][index]||"web");
  return '<article class="service-card reveal in"><div class="service-card-content">'+
  '<div class="service-icon">'+icon+'</div><h3>'+escape(name)+'</h3>'+
  '<p class="service-description">'+escape(description)+'</p>'+
  '<div class="service-card-bottom"><p class="aura-price-service">'+(item?price(item):'Request Quote')+'</p>'+
  (id==="spinflow-start"?'<p class="aura-price-footnote">Custom ERP: '+price(getItem("erp-essential"))+'</p>':'')+
  '<a class="service-link" href="'+escape(url)+'">Explore <span aria-hidden="true">↗</span></a></div></div></article>';
};
const infraRows = catalogue.infrastructure.map(p=>'<article><div><strong>'+escape(p.name)+'</strong>'+
    '<small>'+escape((p.features||[]).join(" · "))+'</small></div><div><b>'+price(p)+'</b>'+
    '<a href="/contact?service=pricing&amp;plan='+escape(p.id)+'">Request Quote ↗</a></div></article>').join("");
const websiteCards = () => catalogue.website.map(p=>card(p,
  (p.infraIncluded?'First-year infrastructure included. ':'Optional infrastructure. ')+
  'First-year with standard hosting: <b>'+amount(firstYearWebsite(p.id,true))+'</b>')).join("");
const planComparison = () => '<div class="aura-price-table"><table><thead><tr><th>Compare packages</th>'+
 catalogue.website.map(p=>'<th>'+escape(p.name)+'</th>').join("")+'</tr></thead><tbody>'+
 '<tr><th>One-time price</th>'+catalogue.website.map(p=>'<td>'+amount(p.price)+'</td>').join("")+'</tr>'+
 '<tr><th>First-year infrastructure</th>'+catalogue.website.map(p=>'<td>'+
  (p.infraIncluded?'Included':'Optional')+'</td>').join("")+'</tr></tbody></table></div>';
const webAddons = () => '<div class="aura-price-compact">'+catalogue.websiteAddons.map(p=>
 '<article><strong>'+escape(p.name)+'</strong><b>'+escape(p.from?'From ':'')+amount(p.price)+'</b></article>').join("")+
 '</div><p class="aura-price-footnote">Dashboard and commerce/booking modules require Growth or above; CRM requires System or above. Included functionality is never charged twice. Choose options with the interactive configurator, or request a scoped quote.</p>';
const erpSection = () => '<div class="aura-price-card-grid">'+catalogue.erp.map(p=>card(p,
  'Managed ERP hosting: '+amount(p.annualHosting)+'/year; first-year combined: <b>'+amount(firstYearERP(p.id))+'</b>')).join("")+'</div>';

 switch(view) {
  case "home-services": return '<div class="aura-price-mini-grid">'+home.map(([name,url])=>
    '<a class="aura-price-mini" href="'+escape(url)+'"><span>'+escape(name)+'</span><span aria-hidden="true">↗</span></a>').join("")+'</div>';
  case "services": return services.map(serviceCard).join("");
  case "packages": return catalogue.care.map(p=>card(p, p.updates+' total content updates / month')).join("");
  case "infrastructure": return '<div class="aura-price-compact">'+infraRows+'</div>';
  case "advertising": return grid(catalogue.advertising)+
    '<p class="aura-price-footnote"><b>Advertising media spend is not included.</b> Managed Growth includes basic management and initial setup. Advanced management upgrade: '+amount(getItem("advanced-ads").price-getItem("basic-ads").price)+'/month.</p>';
  case "websites": return websiteCards();
  case "website-compare": return planComparison();
  case "web-addons": return webAddons();
  case "spinflow": return '<h3>Spinflow Cloud · SaaS (planned)</h3>'+grid(catalogue.saas)+
    '<h3 style="margin-top:2rem">Spinflow Custom · One-Time ERP</h3>'+erpSection()+
    '<p class="aura-price-footnote">SaaS hosting is included. Custom ERP managed hosting is annual, and approved customer-managed hosting is optional.</p>';
  default: return "";
 }
}
