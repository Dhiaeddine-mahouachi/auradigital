export const roadmapStages = [
 {key:'foundation', icon:'◇'},
 {key:'visibility', icon:'◎'},
 {key:'conversion', icon:'↗'},
 {key:'automation', icon:'⚙'},
 {key:'scale', icon:'▥'},
];

export const missionGuide = {
 website:['Web Design','Give customers a place to understand your offer and contact you.','Choose your main offer and audience. Publish a mobile-friendly page with a clear contact or booking action.'],
 domain:['Hosting / Security','Give your business a consistent address that you control.','Choose a domain, register it in your business account, and document renewal and DNS access.'],
 email:['Business Email','Make customer messages recognizable and improve deliverability.','Create a branded mailbox and configure SPF, DKIM and DMARC with your email provider.'],
 branding:[null,'Help customers recognize your business across listings, messages and your site.','Prepare your logo, colors and core message in a short brand guide.'],
 hosting:['Hosting / Security','Keep your website reachable and protect access to its administration.','Enable HTTPS, automatic backups and MFA. Test restoring a backup.'],
 seo:['SEO / Google Maps','Make your pages easier to find for the searches your customers use.','Pick relevant search terms, update page titles and copy, and verify indexing in Search Console.'],
 discovery:['SEO / Google Maps','Help nearby customers find your hours, location and contact details.','Claim your Google Business Profile if eligible. Verify it, add accurate details and publish recent photos.'],
 ads:['Ad Management','Test whether paid search can reach people already looking for your offer.','Choose one offer and landing page. Set conversion tracking and a test budget before launching.'],
 reviews:['SEO / Google Maps','Help customers judge what to expect from your business.','Request honest reviews after service and respond to feedback. Avoid incentives tied to positive ratings.'],
 leads:['Web Design','Give visitors a direct way to take the next step.','Add a short contact or booking form. Test submission, confirmation and follow-up on a phone.'],
 whatsapp:['AI & Automation','Make it easy for customers to start a conversation on their phone.','Set up a business number, add click-to-chat to your site or listing, and check who handles replies.'],
 crm:['Pricing / Quote','Keep customer enquiries and follow-up commitments in one place.','Define your pipeline stages, assign owners, and import current leads with permission.'],
 conversion:[null,'Find and remove friction between a visit and an enquiry or sale.','Review your offer and call to action. Change one element and measure whether more visitors take the next step.'],
 automation:['AI & Automation','Answer routine questions and route complex requests to a person.','Write approved answers, identify handoff cases, and test responses with common customer questions.'],
 followups:['AI & Automation','Reduce missed enquiries and follow up consistently.','Define when reminders should fire, record consent, and test opt-outs and human overrides.'],
 analytics:[null,'See which acquisition channels and pages lead to useful customer actions.','Choose the actions that matter, configure privacy-aware tracking, and verify sample events.'],
 retention:[null,'Make it easier for existing customers to return.','Choose a reason to return, test it with existing customers, and measure repeat purchases or bookings.'],
 menu:['AuraMenu','Give diners an easy way to view current items and prices on their phones.','Gather your categories, item names, prices and photos. Publish and test a QR link on a phone.'],
};

export function missionState(mission, missions, profile) {
 const existing = new Set(profile.capabilities || []);
 if (profile.website) existing.add('website');
 const requirements = (mission.route==='alternative'?[]:(mission.dependencies || [])).filter(id =>
  !existing.has(id) && !missions.some(candidate => candidate.capability === id && candidate.status === 'done'));
 return {requirements, blocked: mission.status !== 'done' && requirements.length > 0};
}

export function eligibleMissions(missions, profile) {
 return missions.filter(mission => !['done','postponed'].includes(mission.status) && !missionState(mission,missions,profile).blocked)
  .sort((a,b) => Number(a.optional || false) - Number(b.optional || false) || a.priority - b.priority || a.position - b.position);
}
