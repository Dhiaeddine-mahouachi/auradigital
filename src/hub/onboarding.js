import { runAuri } from './auri-controller.js';

const fields = ['name', 'industry', 'city', 'country', 'website', 'goals', 'industryDetails', 'tools', 'acquisition'];
import { industryLabel, INDUSTRY_IDS as industries } from './os-copy.js';
const steps = ['name', 'industry', 'goals', 'tools'];
const toolsQuestion={en:'Which tools do you already use?',fr:'Quels outils utilisez-vous déjà ?',tr:'Hangi araçları zaten kullanıyorsunuz?',ar:'ما الأدوات التي تستخدمها بالفعل؟'};
const copy = {
 en: ["Let's build your business.", 'Tell Auri about your business. We’ll build your workspace and growth path.', 'Tell me about your business', 'Analyze', 'Start without documents', 'Attach text or CSV', 'Add a website', 'What’s your business called?', 'What kind of business is it?', 'Where do you operate?', 'What would you like to achieve first?', 'Continue', 'Skip', 'Review your workspace details', 'Build my roadmap', 'Auri is preparing your roadmap…', 'Enter or paste a full HTTPS URL.', 'Choose a .txt or .csv file under 16 KB with up to 4,000 characters.', 'Auri couldn’t find details in this text. You can add them below.', 'Analyzing business information…', 'Talk to Auri'],
 fr: ['Créons votre espace professionnel.', 'Présentez votre activité à Auri. Nous préparerons votre espace et votre parcours de croissance.', 'Présentez votre activité à Auri', 'Analyser', 'Commencer sans documents', 'Joindre un texte ou CSV', 'Ajouter un site web', 'Quel est le nom de votre entreprise ?', 'Quel est votre secteur ?', 'Où exercez-vous ?', 'Quel est votre premier objectif ?', 'Continuer', 'Passer', 'Vérifiez les informations de votre espace', 'Créer mon espace', 'Création de votre espace et de votre parcours…', 'Saisissez ou collez une URL HTTPS complète.', 'Choisissez un fichier .txt ou .csv de moins de 16 Ko et 4 000 caractères maximum.', 'Auri n’a trouvé aucune information dans ce texte. Ajoutez-la ci-dessous.', 'Analyse de votre activité…', 'Parler à Auri'],
 tr: ['İşletmenizi birlikte kuralım.', 'İşletmenizi Auri’ye anlatın. Çalışma alanınızı ve büyüme planınızı oluşturalım.', 'İşletmenizi Auri’ye anlatın', 'Analiz et', 'Belgesiz başla', 'Metin veya CSV ekle', 'Web sitesi ekle', 'İşletmenizin adı nedir?', 'Hangi sektörde çalışıyorsunuz?', 'Nerede faaliyet gösteriyorsunuz?', 'İlk hedefiniz nedir?', 'Devam et', 'Atla', 'Çalışma alanı bilgilerini kontrol edin', 'Çalışma alanı oluştur', 'Çalışma alanınız ve büyüme planınız hazırlanıyor…', 'Tam HTTPS adresini yazın veya yapıştırın.', '16 KB altında ve en fazla 4.000 karakter içeren bir .txt veya .csv dosyası seçin.', 'Auri bu metinde bilgi bulamadı. Bilgileri aşağıdan ekleyebilirsiniz.', 'İşletme bilgileri inceleniyor…', 'Auri ile konuş'],
 ar: ['لنبدأ ببناء نشاطك التجاري.', 'أخبر أوري عن نشاطك لنعدّ مساحة عملك ومسار نموك.', 'أخبر أوري عن نشاطك التجاري', 'تحليل', 'البدء دون مستندات', 'إرفاق ملف نصي أو CSV', 'إضافة موقع إلكتروني', 'ما اسم نشاطك التجاري؟', 'ما مجال نشاطك؟', 'أين تعمل؟', 'ما أول هدف تريد تحقيقه؟', 'متابعة', 'تخطي', 'راجع تفاصيل مساحة عملك', 'إنشاء مساحة العمل', 'جارٍ إعداد مساحة عملك ومسار نموك…', 'أدخل رابط HTTPS كاملًا أو الصقه.', 'اختر ملف .txt أو .csv أصغر من 16 كيلوبايت وبحد أقصى ٤٠٠٠ حرف.', 'لم يعثر أوري على معلومات في النص. يمكنك إضافتها أدناه.', 'جارٍ تحليل معلومات النشاط…', 'تحدث مع أوري'],
};

const chatCopy = {
 en: { status: 'Setting up your workspace', progress: 'Setup progress', found: 'Here’s what I picked up from that:', skipped: 'Skipped', review: 'Check these details — you can edit anything before I build your roadmap.',
  hints: { industry: 'Pick one below, or choose from the list.', goals: 'One sentence is enough. Tap a suggestion if it fits.', tools: 'For example: Instagram, a printed menu, WhatsApp, Google Maps.' },
  goals: { salon: ['Get more bookings', 'Bring clients back more often', 'Get more Google reviews'], retail: ['Get more people into the shop', 'Be found on Google Maps', 'Sell on WhatsApp and Instagram'], professional: ['Get more qualified inquiries', 'Follow up leads faster', 'Look more established online'],  restaurant: ['Get more reservations', 'Get more direct orders', 'Be found on Google Maps'], services: ['Get more bookings', 'Win more quote requests', 'Keep clients coming back'], ecommerce: ['Sell more online', 'Grow repeat customers', 'Reach new customers'], real_estate: ['Get more property inquiries', 'Follow up leads faster', 'Showcase listings online'], other: ['Reach more customers', 'Look more professional online', 'Save time on admin'] } },
 tr: { status: 'Çalışma alanınız hazırlanıyor', progress: 'Kurulum ilerlemesi', found: 'Anlattıklarınızdan şunları çıkardım:', skipped: 'Atlandı', review: 'Bu bilgileri kontrol edin — yol haritanızı oluşturmadan önce her şeyi düzenleyebilirsiniz.',
  hints: { industry: 'Aşağıdan birini seçin.', goals: 'Tek cümle yeterli. Uyan bir öneriye dokunun.', tools: 'Örneğin: Instagram, basılı menü, WhatsApp, Google Haritalar.' },
  goals: { salon: ['Daha fazla randevu', 'Müşterilerin daha sık gelmesi', 'Daha fazla Google yorumu'], retail: ['Mağazaya daha fazla müşteri', 'Google Haritalar’da bulunmak', 'WhatsApp ve Instagram’dan satış'], professional: ['Daha nitelikli talepler', 'Adaylara hızlı dönüş', 'Online daha güvenilir görünmek'],  restaurant: ['Daha fazla rezervasyon', 'Daha fazla doğrudan sipariş', 'Google Haritalar’da bulunmak'], services: ['Daha fazla randevu', 'Daha fazla teklif talebi', 'Müşterilerin geri gelmesi'], ecommerce: ['Online daha fazla satış', 'Tekrar eden müşteriler', 'Yeni müşterilere ulaşmak'], real_estate: ['Daha fazla ilan talebi', 'Adaylara hızlı dönüş', 'İlanları online sergilemek'], other: ['Daha fazla müşteriye ulaşmak', 'Online daha profesyonel görünmek', 'İdari işlerde zaman kazanmak'] } },
 fr: { status: 'Préparation de votre espace', progress: 'Progression', found: 'Voici ce que j’ai retenu :', skipped: 'Passé', review: 'Vérifiez ces informations — tout est modifiable avant que je crée votre feuille de route.',
  hints: { industry: 'Choisissez ci-dessous.', goals: 'Une phrase suffit. Touchez une suggestion si elle convient.', tools: 'Par exemple : Instagram, menu imprimé, WhatsApp, Google Maps.' },
  goals: { salon: ['Plus de rendez-vous', 'Faire revenir les clients', 'Plus d’avis Google'], retail: ['Plus de visites en boutique', 'Être trouvé sur Google Maps', 'Vendre sur WhatsApp et Instagram'], professional: ['Plus de demandes qualifiées', 'Relancer plus vite', 'Paraître plus établi en ligne'],  restaurant: ['Plus de réservations', 'Plus de commandes directes', 'Être trouvé sur Google Maps'], services: ['Plus de rendez-vous', 'Plus de demandes de devis', 'Fidéliser les clients'], ecommerce: ['Vendre plus en ligne', 'Plus de clients fidèles', 'Toucher de nouveaux clients'], real_estate: ['Plus de demandes de biens', 'Relancer plus vite', 'Mettre en valeur les annonces'], other: ['Toucher plus de clients', 'Paraître plus professionnel', 'Gagner du temps'] } },
 ar: { status: 'جارٍ إعداد مساحة عملك', progress: 'تقدم الإعداد', found: 'إليك ما فهمته من ذلك:', skipped: 'تم التخطي', review: 'راجع هذه التفاصيل — يمكنك تعديل أي شيء قبل أن أبني خطتك.',
  hints: { industry: 'اختر أحد الخيارات أدناه.', goals: 'جملة واحدة تكفي. اضغط اقتراحًا مناسبًا.', tools: 'مثلًا: إنستغرام، قائمة مطبوعة، واتساب، خرائط Google.' },
  goals: { salon: ['مواعيد أكثر', 'عودة العملاء أكثر', 'تقييمات Google أكثر'], retail: ['زوار أكثر للمتجر', 'الظهور على خرائط Google', 'البيع عبر واتساب وإنستغرام'], professional: ['استفسارات مؤهلة أكثر', 'متابعة أسرع', 'مظهر أكثر موثوقية'],  restaurant: ['حجوزات أكثر', 'طلبات مباشرة أكثر', 'الظهور على خرائط Google'], services: ['مواعيد أكثر', 'طلبات عروض أسعار أكثر', 'عودة العملاء'], ecommerce: ['مبيعات أكثر عبر الإنترنت', 'عملاء دائمون', 'الوصول إلى عملاء جدد'], real_estate: ['استفسارات عقارية أكثر', 'متابعة أسرع', 'عرض العقارات عبر الإنترنت'], other: ['الوصول لعملاء أكثر', 'مظهر احترافي عبر الإنترنت', 'توفير الوقت'] } },
};

export function createOnboarding() {
 return { phase: 'entry', text: '', values: {}, facts: {}, answered: new Set(), requestId: crypto.randomUUID() };
}

export function renderOnboarding({ app, state, lang, t, esc, header, robot, bind, analyze, complete, guide, save=()=>{} }) {
 const [title, intro, placeholder, analyzeLabel, manual, attach, website, nameQuestion, industryQuestion, cityQuestion, goalQuestion, next, skip, review, create, creating, urlHint, fileHint, noFacts, analyzing, converse] = copy[lang];
 const { values, facts, answered } = state;
 const label = key => t(key === 'name' ? 'businessName' : key === 'industryDetails' ? 'services' : key);
 const input = (key, required = false) => {
  const value = values[key] || '';
  if (key === 'industry') {
   return `<select name="industry"><option value="">—</option>${industries.map(id => `<option value="${id}" ${value === id ? 'selected' : ''}>${esc(industryLabel(lang, id))}</option>`).join('')}</select>`;
  }
  const max = { name: 120, city: 100, country: 80, website: 500, tools: 1200, acquisition: 1200 }[key] || 1600;
  return `<input name="${key}" value="${esc(value)}" type="${key === 'website' ? 'url' : 'text'}" maxlength="${max}" ${required ? 'required' : ''}>`;
 };
 const question = steps.find(key => !values[key] && (key === 'name' || !answered.has(key)));
 const confidenceLabels = { en: ['Quoted', 'Inferred'], fr: ['Cité', 'Déduit'], tr: ['Alıntı', 'Çıkarım'], ar: ['اقتباس', 'استنتاج'] };
 const reviewing = state.phase === 'questions' && !question;
 const entry = state.phase !== 'questions';
 // Chat layout, like other AI assistants: Auri's questions and the customer's
 // answers form a conversation; the current question has a pinned composer.
 const extra = chatCopy[lang] || chatCopy.en;
 const questionText = key => ({ name: nameQuestion, industry: industryQuestion, city: cityQuestion, goals: goalQuestion, tools: toolsQuestion[lang] })[key];
 const shown = key => key === 'industry' && values[key] ? industryLabel(lang, values[key]) : values[key];
 const auriMsg = (body, extraClass = '') => `<li class="os-chat-msg is-auri ${extraClass}"><span class="os-chat-avatar" aria-hidden="true"><img src="/media/auri/level-1.webp" alt="" width="32" height="32"></span><div class="os-chat-bubble">${body}</div></li>`;
 const userMsg = body => `<li class="os-chat-msg is-user"><div class="os-chat-bubble">${body}</div></li>`;
 const history = [];
 history.push(auriMsg(entry ? `<h1>${esc(title)}</h1><p>${esc(intro)}</p>` : `<p><strong>${esc(title)}</strong></p><p>${esc(intro)}</p>`));
 if (!entry) {
  if (state.text.trim()) history.push(userMsg(`<p>${esc(state.text.trim().slice(0, 600))}${state.text.trim().length > 600 ? '…' : ''}</p>${state.source ? `<small>📎 ${esc(state.source)}</small>` : ''}`));
  const found = Object.keys(facts).filter(key => values[key]);
  if (found.length) history.push(auriMsg(`<p>${esc(extra.found)}</p><ul class="os-chat-facts">${found.map(key => `<li><span>${esc(label(key))}</span><strong>${esc(shown(key))}</strong></li>`).join('')}</ul>`));
  for (const key of steps) {
   if (key === question) break;
   if (facts[key] && values[key]) continue;
   history.push(auriMsg(`<p>${esc(questionText(key))}</p>`));
   history.push(userMsg(values[key] ? `<p>${esc(shown(key))}</p>` : `<p class="is-skipped">${esc(extra.skipped)}</p>`));
  }
  history.push(auriMsg(reviewing ? `<h1>${esc(review)}</h1><p>${esc(extra.review)}</p>` : `<h1>${esc(questionText(question))}</h1>${question === 'name' && !values.name ? '' : `<p class="os-chat-hint">${esc(extra.hints[question] || '')}</p>`}`, 'is-current'));
 }
 const chips = !entry && !reviewing && question === 'industry'
  ? `<div class="os-chat-chips" role="group" aria-label="${esc(industryQuestion)}">${industries.map(id => `<button type="button" class="os-chip" data-quick-industry="${id}">${esc(industryLabel(lang, id))}</button>`).join('')}</div>`
  : !entry && !reviewing && question === 'goals' ? `<div class="os-chat-chips">${(extra.goals[values.industry] || extra.goals.other).map(goal => `<button type="button" class="os-chip" data-quick-goal="${esc(goal)}">${esc(goal)}</button>`).join('')}</div>` : '';
 app.innerHTML = `${header}<main id="main" class="auri-setup os-chat-setup">
 <div class="os-chat-layout"><section class="os-chat" aria-label="Auri">
 <div class="auri-setup-heading os-chat-head"><div class="auri-setup-character">${robot()}</div><div><strong>Auri</strong><small><i class="ax-online" aria-hidden="true"></i>${esc(extra.status)}</small></div>
 ${!entry ? `<ol class="os-chat-progress" aria-label="${esc(extra.progress)}">${[...steps, 'review'].map((key, i) => `<li class="${(key === 'review' ? reviewing : key === question) ? 'is-now' : (key === 'review' ? false : steps.indexOf(question) > i || reviewing) ? 'is-done' : ''}"></li>`).join('')}</ol>` : ''}</div>
 <ol class="os-chat-log" role="log" aria-live="polite">${history.join('')}</ol>
 <form class="auri-setup-form os-chat-composer">
 ${entry ? `<div class="auri-setup-composer">
 <textarea name="businessText" aria-label="${esc(placeholder)}" placeholder="${esc(placeholder)}" maxlength="4000" rows="3">${esc(state.text)}</textarea>
 <div class="auri-setup-actions"><label class="os-chip">📎 ${esc(attach)}<input type="file" name="source" accept=".txt,.csv,text/plain,text/csv" class="sr-only"></label>
 <button type="button" class="os-chip" data-setup="website">🔗 ${esc(website)}</button>
 <button type="submit" class="primary os-send">${esc(analyzeLabel)} <span aria-hidden="true">↑</span></button></div></div>
 <p class="auri-setup-source" role="status">${esc(state.source || '')}</p>
 <div class="os-chat-chips"><button type="button" class="os-chip" data-setup="manual">${esc(manual)}</button></div>`
 : reviewing ? `<div class="auri-setup-review">${fields.map(key => `<label class="field"><span>${esc(label(key))}</span>${input(key, key === 'name')}${facts[key] ? `<small>${esc(facts[key].source)} · ${confidenceLabels[lang][Number(facts[key].confidence === 'inferred')]} · “${esc(facts[key].excerpt)}”</small>` : ''}</label>`).join('')}</div>
 <button type="submit" class="primary os-send is-wide">${esc(create)} <span aria-hidden="true">→</span></button>`
 : `${chips}<div class="os-chat-input"><label class="field"><span class="sr-only">${esc(label(question))}</span>${input(question, question === 'name')}</label><button type="submit" class="primary os-send">${esc(next)} <span aria-hidden="true">↑</span></button></div>
 <div class="os-chat-chips is-secondary">${question !== 'name' ? `<button type="button" class="os-chip" data-setup="skip">${esc(skip)}</button>` : ''}
 <button type="button" class="os-chip" data-setup="entry">${esc(converse)}</button></div>`}
 <p role="status" data-setup-status>${esc(state.message || '')}</p><p role="alert"></p>
 </form></section><aside class="os-chat-aside" data-onboarding-guide></aside></div></main>`;
 app.querySelector('.os-chat-log').lastElementChild?.scrollIntoView?.({ block: 'nearest' });
 app.querySelectorAll('[data-quick-industry]').forEach(b => b.addEventListener('click', () => { const sel = app.querySelector('select[name=industry]'); sel.value = b.dataset.quickIndustry; app.querySelector('.auri-setup-form').requestSubmit(); }));
 app.querySelectorAll('[data-quick-goal]').forEach(b => b.addEventListener('click', () => { const field = app.querySelector('input[name=goals]'); field.value = b.dataset.quickGoal; field.focus(); }));
 bind();
 guide?.(app.querySelector('[data-onboarding-guide]'));
 const form = app.querySelector('.auri-setup-form');
 const alert = form.querySelector('[role="alert"]');
 const status = form.querySelector('[data-setup-status]');
 const rerender = () => {
  save(state);
  renderOnboarding({ app, state, lang, t, esc, header, robot, bind, analyze, complete, guide, save });
  app.querySelector('.auri-setup-form input:not([type="file"]), .auri-setup-form textarea, .auri-setup-form select')?.focus();
 };
 const composer = form.elements.businessText;
 function record() {
  for (const [key, value] of new FormData(form)) {
   if (!fields.includes(key)) continue;
   const clean = value.trim();
   if (facts[key]?.value !== clean) delete facts[key];
   values[key] = clean;
  }
 }
 if (entry) {
  composer.oninput = () => {
   state.text = composer.value;
   save(state);
   state.source = '';
   form.querySelector('.auri-setup-source').textContent = '';
  };
  const readFile = async file => {
   if (!file || state.busy) return;
   if (!/\.(txt|csv)$/i.test(file.name) || file.size > 16000) {
    alert.textContent = fileHint;
    return;
   }
   const previous = composer.value;
   try {
    const text = await file.text();
    if (text.length > 4000 || !text.trim() || text.includes('\u0000')) throw new Error(fileHint);
    if (state.busy || !form.isConnected || composer.value !== previous) return;
    state.text = composer.value = text;
    form.querySelector('.auri-setup-source').textContent = state.source = file.name;
    save(state);
    alert.textContent = '';
    composer.focus();
   } catch {
    alert.textContent = fileHint;
   }
  };
  form.elements.source.onchange = event => { void readFile(event.target.files[0]); };
  const drop = form.querySelector('.auri-setup-composer');
  drop.ondragover = event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault(); };
  drop.ondrop = event => { if (event.dataTransfer.files.length) { event.preventDefault(); void readFile(event.dataTransfer.files[0]); } };
  form.querySelector('[data-setup="website"]').onclick = () => {
   composer.focus();
   status.textContent = urlHint;
  };
  form.querySelector('[data-setup="manual"]').onclick = () => {
   state.phase = 'questions';
   state.message = '';
   rerender();
  };
 } else {
  form.querySelector('[data-setup="entry"]')?.addEventListener('click', () => {
   record();
   save(state);
   app.querySelector('[data-onboarding-guide] input')?.focus();
  });
  form.querySelector('[data-setup="skip"]')?.addEventListener('click', () => {
   answered.add(question);
   state.message = '';
   rerender();
  });
 }
 form.onsubmit = async event => {
  event.preventDefault();
  if (state.busy) return;
  alert.textContent = '';
  state.message = '';
  if (!entry) record();
  if (!entry && !reviewing) {
   if (question === 'name' && !values.name) {
    alert.textContent = nameQuestion;
    return;
   }
   answered.add(question);
   rerender();
   return;
  }
  if (entry && !state.text.trim()) { composer.focus(); return; }
  if (reviewing && !values.name) { form.elements.name.focus(); alert.textContent = nameQuestion; return; }
  save(state);
  state.busy = true;
  status.textContent = entry ? analyzing : creating;
 const log = app.querySelector('.os-chat-log');
 log?.insertAdjacentHTML('beforeend', `<li class="os-chat-msg is-auri is-typing" data-typing><span class="os-chat-avatar" aria-hidden="true"><img src="/media/auri/level-1.webp" alt="" width="32" height="32"></span><div class="os-chat-bubble"><span class="os-typing"><i></i><i></i><i></i></span><small>${esc(entry ? analyzing : creating)}</small></div></li>`);
 log?.lastElementChild?.scrollIntoView?.({ block: 'nearest' });
  const controls = [...form.elements, ...app.querySelectorAll('#language')].filter(control => !control.disabled);
  controls.forEach(control => { control.disabled = true; });
  try {
   if (entry) {
    const text = state.text.trim();
    let extracted;
    if (/^https:\/\/\S+$/i.test(text)) {
     const url = new URL(text);
     if (text.length > 500 || url.username || url.password) throw new Error(urlHint);
     extracted = { website: { value: text, excerpt: text, confidence: 'quoted' } };
    } else {
     ({ facts: extracted } = await runAuri('setup', 'thinking', () => analyze(text)));
    }
    for (const [key, fact] of Object.entries(extracted)) {
     if (!fields.includes(key) || values[key]) continue;
     values[key] = fact.value;
     facts[key] = { ...fact, source: state.source || 'Auri' };
    }
    state.message = Object.keys(extracted).length ? '' : noFacts;
    state.phase = 'questions';
    rerender();
   } else {
    await runAuri('setup', 'working', () => complete(values, state.requestId));
   }
  } catch (error) {
   alert.textContent = error.message;
  } finally {
   state.busy = false;
   status.textContent = '';
   app.querySelector('[data-typing]')?.remove();
   controls.forEach(control => { control.disabled = false; });
  }
 };
}
