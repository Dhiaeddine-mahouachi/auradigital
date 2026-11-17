import { industries, services } from './content.mjs';

export const general = {
  home: ['Aura Command','Build a growth roadmap with Auri and track the work in AuraHub.'],
  product: ['Aura Command','Plan your next step, build what you need and manage growth in AuraHub.'],
  auri: ['Meet Auri','Talk through your business goals with AuraDigital’s AI guide.'],
  services: ['Services','Explore the seven connected services you can request through AuraHub.'],
  industries: ['Industries','Explore sample digital growth roadmaps for your type of business.'],
  pricing: ['Pricing','Start with a free roadmap and get a scope and price for the work you choose.'],
  'how-it-works': ['How it works','Follow the journey from your first chat with Auri to delivery and support.'],
  about: ['About','Meet the Istanbul-based team building Aura Command for small businesses.'],
  contact: ['Contact','Get in touch with AuraDigital to talk about your project or request a call.'],
  resources: ['Resources and help','Find short guides and answers about websites, menus, growth and Aura Command.'],
  privacy: ['Privacy','Privacy information for AuraDigital and AuraHub.'],
  terms: ['Terms','Terms information for AuraDigital and AuraHub.'],
  cookies: ['Cookies','Cookie and browser storage information for AuraDigital.'],
  404: ['Page not found','Find AuraDigital’s services, guides or AuraHub.'],
};
export const legal = {
  privacy: [
    ['Information you share','Contact and workspace forms ask for details so you can save a business profile or get help with a request.'],
    ['Access and retention','Data retention, processor disclosures and rights contact: [PLACEHOLDER]'],
  ],
  terms: [
    ['Using a workspace','Keep your account information current. Review the scope, price and timing before approving a paid request.'],
    ['Service agreement','Contracting entity, service terms and applicable law: [PLACEHOLDER]'],
  ],
  cookies: [
    ['Website preferences','This site can remember your theme and language in your browser.'],
    ['Workspace session','AuraHub uses session cookies for signed-in access. A full cookie inventory and retention periods: [PLACEHOLDER]'],
  ],
};

export const pagePaths = [
  ...Object.keys(general).map(key=>key==='home'?'/':'/'+key),
  ...services.map(service=>'/services/'+service.slug),
  ...industries.map(industry=>'/industries/'+industry.slug),
];
