import { runAuri, pulseAuri } from './auri-controller.js';

const strings={
 en:['Talk to Auri','Hi, I’m Auri. Tell me about your business and I’ll suggest what to do first. Ask me what AuraDigital can help with or compare published prices.','What should I do first?','What can you help with?','What does a digital menu cost?','Ask Auri a question','Send','Auri is thinking…','Browse all published prices','Read reply aloud','Contact AuraDigital for a custom quote','One-time','Monthly','Annual','Annual hosting','Couldn’t load prices. Try again.'],
 fr:['Parler à Auri','Bonjour, je suis Auri. Décrivez votre activité pour trouver votre prochaine étape ou comparer les tarifs publiés.','Par quoi commencer ?','Comment peux-tu m’aider ?','Combien coûte un menu numérique ?','Posez une question à Auri','Envoyer','Auri réfléchit…','Voir tous les tarifs publiés','Lire la réponse à voix haute','Contacter AuraDigital pour un devis','Unique','Mensuel','Annuel','Hébergement annuel','Impossible de charger les tarifs. Réessayez.'],
 tr:['Auri ile konuş','Merhaba, ben Auri. İşletmenizi anlatın, ilk adımı bulalım. Hizmetleri ve yayımlanan fiyatları sorabilirsiniz.','İlk olarak ne yapmalıyım?','Nasıl yardımcı olabilirsin?','Dijital menü fiyatı nedir?','Auri’ye soru sorun','Gönder','Auri düşünüyor…','Yayımlanan tüm fiyatları gör','Yanıtı sesli oku','Özel teklif için AuraDigital’e ulaşın','Tek seferlik','Aylık','Yıllık','Yıllık barındırma','Fiyatlar yüklenemedi. Tekrar deneyin.'],
 ar:['تحدث مع أوري','مرحبًا، أنا أوري. أخبرني عن نشاطك لأقترح الخطوة الأولى. اسألني عن خدمات AuraDigital أو قارن الأسعار المنشورة.','ما الخطوة الأولى؟','بماذا يمكنك مساعدتي؟','كم سعر القائمة الرقمية؟','اسأل أوري','إرسال','أوري يفكر…','تصفح كل الأسعار المنشورة','اقرأ الرد بصوت عالٍ','تواصل مع AuraDigital لطلب عرض خاص','مرة واحدة','شهريًا','سنويًا','الاستضافة السنوية','تعذر تحميل الأسعار. حاول مجددًا.'],
};
const path='/api/hub/onboarding/guide';
export function mountGuide(host,{lang,esc,api,turns,scope,context=()=>({})}){
 if(!host)return;
 const [title,intro,first,help,price,placeholder,send,thinking,browse,read,contact,once,month,year,hosting,unavailable]=strings[lang]||strings.en;
 const money=(price,currency)=>new Intl.NumberFormat(lang,{style:'currency',currency}).format(price);
 const qualifiers={en:['From','Request a quote'],fr:['Dès','Demander un devis'],tr:['Başlangıç','Teklif iste'],ar:['ابتداءً من','اطلب عرض سعر']}[lang]||['From','Request a quote'];
 const priceLabel=(value,currency,from)=>Number.isFinite(value)?(from?qualifiers[0]+' ':'')+money(value,currency):qualifiers[1];
 const rows=({packages,currency})=>packages.map(item=>`<li><strong>${esc(item.name)}</strong> · ${esc(priceLabel(item.price,currency,item.from))} <small>${esc(({once,month,year})[item.billing]||once)}${item.annualHosting?` · ${esc(hosting)} ${esc(priceLabel(item.annualHosting,currency,item.hostingFrom))}`:''}${item.availability?` · ${esc(item.availability.replaceAll('-',' '))}`:''}</small></li>`).join('');
 host.innerHTML=`<section class="hub-guide"><h2>${esc(title)}</h2><p>${esc(intro)}</p>
 <div class="hub-guide-prompts">${[first,help,price].map(question=>`<button type="button" class="secondary">${esc(question)}</button>`).join('')}</div>
 <div class="hub-guide-turns"></div>
 <form><input name="question" required maxlength="700" aria-label="${esc(placeholder)}" placeholder="${esc(placeholder)}"><button class="primary">${esc(send)}</button></form>
 <p class="hub-guide-status" role="status" aria-live="polite"></p>
 ${'speechSynthesis' in window?`<button class="secondary" type="button" data-guide-read hidden>${esc(read)}</button>`:''}
 <details><summary>${esc(browse)}</summary><ul data-guide-prices></ul></details><a href="/contact">${esc(contact)}</a></section>`;
 const form=host.querySelector('form');
 const input=form.elements.question,submit=form.querySelector('button'),status=host.querySelector('[role=status]');
 const voice=host.querySelector('[data-guide-read]');
 const output=host.querySelector('.hub-guide-turns');
 const paint=()=>{
  output.innerHTML=turns.map(turn=>`<article><strong>${esc(turn.question)}</strong><p>${esc(turn.reply)}</p>${turn.packages.length?`<ul>${rows(turn)}</ul>`:''}</article>`).join('');
  output.scrollTop=output.scrollHeight;
  if(voice)voice.hidden=!turns.length;
 };
 paint();
 if(voice)voice.onclick=()=>{
  const last=turns.at(-1);
  const priceText=last.packages.map(item=>item.name+' '+priceLabel(item.price,last.currency,item.from)+' '+(({once,month,year})[item.billing]||once));
  const speech=new SpeechSynthesisUtterance([last.reply,...priceText].join('. '));
  speech.lang=lang;
  speech.onstart=()=>pulseAuri(scope,'speaking',3000);
  speech.onend=speech.onerror=()=>pulseAuri(scope,'idle',0);
  speechSynthesis.cancel();speechSynthesis.speak(speech);
 };
 for(const button of host.querySelectorAll('.hub-guide-prompts button')){
  button.onclick=()=>{input.value=button.textContent;form.requestSubmit();};
 }
 form.onsubmit=async event=>{
  event.preventDefault();
  const question=input.value.trim();
  if(!question||submit.disabled)return;
  submit.disabled=true;status.classList.remove('sr-only');status.textContent=thinking;
  try{
   const answer=await runAuri(scope,'thinking',()=>api(path,'POST',{question,lang,history:turns.slice(-6).map(({question,reply})=>({question,reply})),context:context()}));
   turns.push({question,...answer});
   if(turns.length>10)turns.shift();
   if(!host.isConnected)return;
   paint();if(input.value.trim()===question)input.value='';
   status.classList.add('sr-only');status.textContent=answer.reply;
  }catch(error){status.textContent=error.message;}
  finally{submit.disabled=false;}
 };
 const catalogue=host.querySelector('details'),prices=host.querySelector('[data-guide-prices]');
 let loaded=false;
 catalogue.ontoggle=async()=>{
  if(!catalogue.open||loaded)return;
  loaded=true;
  try{prices.innerHTML=rows(await api(path));}
  catch{prices.innerHTML=`<li>${esc(unavailable)}</li>`;loaded=false;}
 };
}
