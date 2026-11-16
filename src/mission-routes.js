const goalByCapability={
 domain:'foundation',email:'foundation',branding:'foundation',hosting:'foundation',
 website:'visibility',seo:'visibility',discovery:'visibility',ads:'visibility',reviews:'visibility',
 leads:'conversion',whatsapp:'conversion',conversion:'conversion',menu:'conversion',
 crm:'operations',automation:'operations',followups:'operations',
 analytics:'measurement',retention:'measurement',
};

const alternatives={
 foundation:['Document goals and responsibilities','Write down the offer, audience, priority and who owns the next step.'],
 visibility:['Use an existing discovery channel','Publish accurate business information and a contact action in a directory, portfolio, storefront or referral channel your audience uses.'],
 conversion:['Use an existing customer intake channel','Make the next step clear through a booking, enquiry, ordering or support channel. Test one customer request from start to finish.'],
 operations:['Run a repeatable manual workflow','Record the handoff, owner and follow-up in a shared checklist or tracker. Test it on a typical request.'],
 measurement:['Review one useful business metric','Record a baseline, review it after an improvement, and document what you will change next.'],
};

export const missionOutcome=capability=>goalByCapability[capability]||null;

export function missionAlternative(capability){
 const option=alternatives[missionOutcome(capability)];
 return option?{title:option[0],steps:option[1]}:null;
}
