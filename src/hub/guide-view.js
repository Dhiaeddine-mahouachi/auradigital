import { runAuri, pulseAuri } from './auri-controller.js';

const strings={
 en:['Talk to Auri','Hi, I’m Auri. Tell me about your business and I’ll suggest what to do first. Ask me what AuraDigital can help with or compare published prices.','What should I do first?','What can you help with?','What does a digital menu cost?','Ask Auri a question','Send','Auri is thinking…','Browse all published prices','Read reply aloud','Contact AuraDigital for a custom quote','One-time','Monthly','Annual','Annual hosting','Couldn’t load prices. Try again.','Stop reading'],
 fr:['Parler à Auri','Bonjour, je suis Auri. Décrivez votre activité pour trouver votre prochaine étape ou comparer les tarifs publiés.','Par quoi commencer ?','Comment peux-tu m’aider ?','Combien coûte un menu numérique ?','Posez une question à Auri','Envoyer','Auri réfléchit…','Voir tous les tarifs publiés','Lire la réponse à voix haute','Contacter AuraDigital pour un devis','Unique','Mensuel','Annuel','Hébergement annuel','Impossible de charger les tarifs. Réessayez.','Arrêter la lecture'],
 tr:['Auri ile konuş','Merhaba, ben Auri. İşletmenizi anlatın, ilk adımı bulalım. Hizmetleri ve yayımlanan fiyatları sorabilirsiniz.','İlk olarak ne yapmalıyım?','Nasıl yardımcı olabilirsin?','Dijital menü fiyatı nedir?','Auri’ye soru sorun','Gönder','Auri düşünüyor…','Yayımlanan tüm fiyatları gör','Yanıtı sesli oku','Özel teklif için AuraDigital’e ulaşın','Tek seferlik','Aylık','Yıllık','Yıllık barındırma','Fiyatlar yüklenemedi. Tekrar deneyin.','Okumayı durdur'],
 ar:['تحدث مع أوري','مرحبًا، أنا أوري. أخبرني عن نشاطك لأقترح الخطوة الأولى. اسألني عن خدمات AuraDigital أو قارن الأسعار المنشورة.','ما الخطوة الأولى؟','بماذا يمكنك مساعدتي؟','كم سعر القائمة الرقمية؟','اسأل أوري','إرسال','أوري يفكر…','تصفح كل الأسعار المنشورة','اقرأ الرد بصوت عالٍ','تواصل مع AuraDigital لطلب عرض خاص','مرة واحدة','شهريًا','سنويًا','الاستضافة السنوية','تعذر تحميل الأسعار. حاول مجددًا.','إيقاف القراءة'],
};
const memoryCopy={
 en:['Saved conversations','New conversation','Delete conversation','Delete this conversation and memories still linked to it?','What Auri remembers','Saved after your approval. Keep passwords, payment details and access keys out of chat.','Private to me','Shared with this business','Suggested','Goal','Preference','Business fact','Approve','Save','Delete memory','No saved memories yet.','Welcome back, {name}.','Next step on your roadmap','This step is open on your saved roadmap.','Untitled conversation','Couldn’t open the conversation.','Delete this memory?'],
 fr:['Conversations enregistrées','Nouvelle conversation','Supprimer la conversation','Supprimer cette conversation et les souvenirs qui lui sont encore associés ?','Ce dont Auri se souvient','Enregistrement après votre accord. Ne saisissez ni mots de passe, ni données de paiement, ni clés d’accès.','Privé','Partagé avec cette entreprise','Suggestion','Objectif','Préférence','Fait sur l’entreprise','Approuver','Enregistrer','Supprimer le souvenir','Aucun souvenir enregistré.','Bon retour, {name}.','Prochaine étape de votre feuille de route','Cette étape reste ouverte dans votre feuille de route.','Conversation sans titre','Impossible d’ouvrir la conversation.','Supprimer ce souvenir ?'],
 tr:['Kayıtlı konuşmalar','Yeni konuşma','Konuşmayı sil','Konuşma ve ona bağlı bilgiler silinsin mi?','Auri’nin hatırladıkları','Onayınızla kaydedilir. Şifre, ödeme ve erişim bilgilerini sohbette paylaşmayın.','Yalnızca ben','Bu işletmeyle paylaşılan','Öneri','Hedef','Tercih','İşletme bilgisi','Onayla','Kaydet','Anıyı sil','Henüz kayıtlı bilgi yok.','Tekrar hoş geldiniz, {name}.','Yol haritanızdaki sonraki adım','Bu adım kayıtlı yol haritanızda açık.','Başlıksız konuşma','Konuşma açılamadı.','Bu bilgi silinsin mi?'],
 ar:['المحادثات المحفوظة','محادثة جديدة','حذف المحادثة','هل تريد حذف المحادثة والمعلومات التي لا تزال مرتبطة بها؟','ما يتذكره أوري','تُحفظ المعلومات بعد موافقتك. تجنب مشاركة كلمات المرور وبيانات الدفع ومفاتيح الوصول.','خاص بي','مشترك مع النشاط التجاري','اقتراح','هدف','تفضيل','معلومة عن النشاط','موافقة','حفظ','حذف المعلومة','لا توجد معلومات محفوظة بعد.','أهلًا بعودتك، {name}.','الخطوة التالية في خارطة طريقك','لا تزال هذه الخطوة مفتوحة في خارطة طريقك المحفوظة.','محادثة بلا عنوان','تعذر فتح المحادثة.','هل تريد حذف هذه المعلومة؟'],
};
const onboardingPath='/api/hub/onboarding/guide';

export function mountGuide(host,{lang,esc,api,scope,context=()=>({}),workspaceId,owner,focus={},businessName,
 next,questionSeed='',initialId,onSelect,onReply,onVoice}){
 if(!host)return;
 const path=workspaceId?`/api/hub/workspaces/${workspaceId}/auri-chat`:onboardingPath;
 const chats=path+'/conversations',memoryPath=path+'/memories';
 const [saved,newChat,deleteChat,confirmChat,remember,memoryNote,privateLabel,sharedLabel,suggested,goal,preference,fact,
  approve,save,deleteMemory,empty,welcome,nextLabel,nextReason,untitled,openError,confirmMemory]=memoryCopy[lang]||memoryCopy.en;
 const kindLabels={goal,preference,business_fact:fact};
 let turns=[],activeId=null,catalogue=null,isBusy=false;
 const [title,intro,first,help,price,placeholder,send,thinking,browse,read,contact,once,month,year,hosting,unavailable,stopReading]=strings[lang]||strings.en;
 const money=(price,currency)=>new Intl.NumberFormat(lang,{style:'currency',currency}).format(price);
 const qualifiers={en:['From','Request a quote'],fr:['Dès','Demander un devis'],tr:['Başlangıç','Teklif iste'],ar:['ابتداءً من','اطلب عرض سعر']}[lang]||['From','Request a quote'];
 const priceLabel=(value,currency,from)=>Number.isFinite(value)?(from?qualifiers[0]+' ':'')+money(value,currency):qualifiers[1];
 const rows=({packages,currency})=>packages.map(item=>`<li><strong>${esc(item.name)}</strong> · ${esc(priceLabel(item.price,currency,item.from))} <small>${esc(({once,month,year})[item.billing]||once)}${item.annualHosting?` · ${esc(hosting)} ${esc(priceLabel(item.annualHosting,currency,item.hostingFrom))}`:''}${item.availability?` · ${esc(item.availability.replaceAll('-',' '))}`:''}</small></li>`).join('');
 host.innerHTML=`<section class="hub-guide${workspaceId?' hub-guide-workspace':''}">
 ${workspaceId?'':`<h2>${esc(title)}</h2><p>${esc(intro)}</p>`}
 <p data-guide-welcome hidden></p>
 ${next?`<p><strong>${esc(nextLabel)}</strong> · <a href="${esc(next.href)}">${esc(next.name)}</a><br><small>${esc(nextReason)}${next.reason?' '+esc(next.reason):''}</small></p>`:''}
 <div class="hub-guide-history">
  <label>${esc(saved)} <select data-guide-conversations></select></label>
  <button class="secondary" type="button" data-guide-new>${esc(newChat)}</button>
  <button class="secondary" type="button" data-guide-delete>${esc(deleteChat)}</button>
 </div>
 <div class="hub-guide-prompts">${[first,help,price].map(question=>`<button type="button" class="secondary">${esc(question)}</button>`).join('')}</div>
 <div class="hub-guide-turns" data-auri-transcript></div>
 <form data-auri-ask><input name="question" required maxlength="700" aria-label="${esc(placeholder)}" placeholder="${esc(placeholder)}" value="${esc(questionSeed)}"><button class="primary">${esc(send)}</button></form>
 <p class="hub-guide-status" role="status" aria-live="polite" data-auri-reply></p>
 ${'speechSynthesis' in window?`<button class="secondary" type="button" data-guide-read hidden>${esc(read)}</button> <button class="secondary" type="button" data-guide-stop hidden>${esc(stopReading)}</button>`:''}
 <details data-guide-catalogue><summary>${esc(browse)}</summary><ul data-guide-prices></ul></details><a href="/contact">${esc(contact)}</a>
 <details data-guide-memory><summary>${esc(remember)}</summary><p>${esc(memoryNote)}</p><div data-guide-memory-list></div></details>
 </section>`;
 const form=host.querySelector('[data-auri-ask]');
 const input=form.elements.question,submit=form.querySelector('button'),status=host.querySelector('[role=status]');
 const voice=host.querySelector('[data-guide-read]'),stop=host.querySelector('[data-guide-stop]');
 const output=host.querySelector('.hub-guide-turns');
 const picker=host.querySelector('[data-guide-conversations]');
 const start=host.querySelector('[data-guide-new]'),remove=host.querySelector('[data-guide-delete]');
 const welcomeBack=host.querySelector('[data-guide-welcome]');
 const memory=host.querySelector('[data-guide-memory]'),memoryList=host.querySelector('[data-guide-memory-list]');
 const prices=host.querySelector('[data-guide-prices]');
 const actionButtons=[...host.querySelectorAll('.hub-guide-prompts button')];
 const paint=()=>{
  output.innerHTML=turns.map(turn=>`<article><strong>${esc(turn.question)}</strong><p>${esc(turn.reply)}</p>${turn.packages?.length?`<ul>${rows(turn)}</ul>`:''}</article>`).join('');
  output.scrollTop=output.scrollHeight;
  if(voice)voice.hidden=!turns.length;
 };
 function busy(value){
  isBusy=value;
  submit.disabled=start.disabled=value;
  picker.disabled=value||!picker.options.length;
  remove.disabled=value||!activeId;
  for(const button of actionButtons)button.disabled=value;
 }
 let catalogueRequest;
 function getCatalogue(){
  catalogueRequest??=api(path).then(data=>catalogue=data).catch(error=>{catalogueRequest=null;throw error;});
  return catalogueRequest;
 }
 async function listChats(){
  const {conversations}=await api(chats);
  picker.replaceChildren(...conversations.map(chat=>new Option(chat.title||untitled,chat.id)));
  welcomeBack.hidden=!businessName||!conversations.some(chat=>chat.title);
  if(!welcomeBack.hidden)welcomeBack.textContent=welcome.replace('{name}',businessName);
  return conversations;
 }
 function select(id){
  activeId=id;
  picker.value=id||'';
  if(host.isConnected)onSelect?.(id);
 }
 async function openChat(id){
  const chat=id?await api(chats+'/'+id):{turns:[]};
  select(id);
  turns=chat.turns;
  if(turns.some(turn=>turn.packageIds.length)){
   try{await getCatalogue();}catch{}
  }
  if(catalogue)turns=turns.map(turn=>({...turn,currency:catalogue.currency,packages:catalogue.packages.filter(item=>turn.packageIds.includes(item.id))}));
  paint();
  if(host.isConnected)onReply?.(turns.at(-1)?.reply||'');
 }
 async function change(operation){
  if(isBusy)return;
  busy(true);
  status.classList.remove('sr-only');
  status.textContent='';
  try{await operation();}
  catch(error){status.textContent=error.message||openError;}
  finally{busy(false);}
 }
 change(async()=>{
  const chats=await listChats();
  await openChat(chats.find(chat=>chat.id===initialId)?.id||chats[0]?.id||null);
 });
 picker.onchange=()=>change(async()=>{
  try{await openChat(picker.value);}catch(error){picker.value=activeId||'';throw error;}
 });
 start.onclick=()=>change(async()=>{
  const {id}=await api(chats,'POST',{});
  await listChats();
  await openChat(id);
  input.focus();
 });
 remove.onclick=()=>{if(confirm(confirmChat))change(async()=>{
  await api(chats+'/'+activeId,'DELETE');
  select(null);turns=[];paint();
  const remaining=await listChats();
  await openChat(remaining[0]?.id||null);
  if(memory.open)await listMemories();
 });};
 if(voice)voice.onclick=()=>{
  const last=turns.at(-1);
  const priceText=(last.packages||[]).map(item=>item.name+' '+priceLabel(item.price,last.currency,item.from)+' '+(({once,month,year})[item.billing]||once));
  const speech=new SpeechSynthesisUtterance([last.reply,...priceText].join('. '));
  speech.lang=lang;
  speech.onstart=()=>pulseAuri(scope,'speaking',3000);
  speech.onend=speech.onerror=()=>{stop.hidden=true;onVoice?.(null);pulseAuri(scope,'idle',0);};
  speechSynthesis.cancel();
  stop.hidden=false;onVoice?.(speech);speechSynthesis.speak(speech);
 };
 if(stop)stop.onclick=()=>{speechSynthesis.cancel();stop.hidden=true;onVoice?.(null);pulseAuri(scope,'idle',0);};
 for(const button of actionButtons)button.onclick=()=>{input.value=button.textContent;form.requestSubmit();};
 form.onsubmit=event=>{
  event.preventDefault();
  const question=input.value.trim();
  if(!question)return;
  change(async()=>{
   if(stop&&!stop.hidden)stop.click();
   status.textContent=thinking;
   let answer;
   try{
    answer=await runAuri(scope,'thinking',()=>api(path,'POST',{question,lang,...focus,
     ...(activeId?{conversationId:activeId}:{}),...(!workspaceId?{context:context()}:{})}),workspaceId?'speaking':undefined);
   }catch(error){
    if(error.status===409&&activeId&&host.isConnected){
     const available=await listChats();
     await openChat(available.find(chat=>chat.id===activeId)?.id||available[0]?.id||null);
    }
    throw error;
   }
   if(!host.isConnected)return;
   select(answer.conversationId);
   turns=[...turns,answer].slice(-8);
   paint();onReply?.(answer.reply);
   if(input.value.trim()===question)input.value='';
   status.classList.add('sr-only');status.textContent=answer.reply;
   await listChats();picker.value=activeId;
   if(memory.open)await listMemories();
  });
 };
 host.querySelector('[data-guide-catalogue]').ontoggle=async event=>{
  if(!event.currentTarget.open)return;
  try{prices.innerHTML=rows(await getCatalogue());}
  catch{prices.innerHTML=`<li>${esc(unavailable)}</li>`;}
 };
 async function listMemories(){
  const {memories}=await api(memoryPath);
  memoryList.innerHTML=memories.map(item=>{
   const scopeLabel=item.scope==='shared'?sharedLabel:privateLabel;
   if(item.scope==='shared'&&!owner)return `<article><strong>${esc(kindLabels[item.kind])}</strong> · ${esc(scopeLabel)}<p>${esc(item.value)}</p></article>`;
   return `<form class="hub-guide-memory-form" data-memory-id="${esc(item.id)}">
    <label>${esc(item.status==='suggested'?suggested:scopeLabel)} <input name="value" value="${esc(item.value)}" required maxlength="240"></label>
    <label><span class="sr-only">${esc(kindLabels[item.kind])}</span><select name="kind">${Object.entries(kindLabels).map(([kind,label])=>`<option value="${kind}" ${kind===item.kind?'selected':''}>${esc(label)}</option>`).join('')}</select></label>
    ${owner?`<label><select name="scope" aria-label="${esc(scopeLabel)}"><option value="private">${esc(privateLabel)}</option><option value="shared" ${item.scope==='shared'?'selected':''}>${esc(sharedLabel)}</option></select></label>`:''}
    <button class="secondary">${esc(item.status==='suggested'?approve:save)}</button>
    <button type="button" class="secondary" data-remove-memory>${esc(deleteMemory)}</button>
   </form>`;
  }).join('')||`<p>${esc(empty)}</p>`;
  for(const edit of memoryList.querySelectorAll('[data-memory-id]')){
   const endpoint=memoryPath+'/'+edit.dataset.memoryId;
   edit.onsubmit=event=>{
    event.preventDefault();
    change(async()=>{await api(endpoint,'PATCH',Object.fromEntries(new FormData(edit)));await listMemories();});
   };
   edit.querySelector('[data-remove-memory]').onclick=()=>{
    if(confirm(confirmMemory))change(async()=>{await api(endpoint,'DELETE');await listMemories();});
   };
  }
 }
 memory.ontoggle=()=>{if(memory.open)listMemories().catch(error=>{memoryList.textContent=error.message;});};
}
