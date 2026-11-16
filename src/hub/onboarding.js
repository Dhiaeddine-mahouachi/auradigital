import { runAuri } from './auri-controller.js';

const fields = ['name', 'industry', 'city', 'country', 'website', 'goals', 'industryDetails', 'tools', 'acquisition'];
const industries = ['restaurant', 'services', 'ecommerce', 'real_estate', 'other'];
const steps = ['name', 'industry', 'goals', 'tools'];
const toolsQuestion={en:'Which tools do you already use?',fr:'Quels outils utilisez-vous déjà ?',tr:'Hangi araçları zaten kullanıyorsunuz?',ar:'ما الأدوات التي تستخدمها بالفعل؟'};
const copy = {
 en: ["Let's build your business.", 'Tell Auri about your business. We’ll build your workspace and growth path.', 'Tell me about your business', 'Analyze', 'Start without documents', 'Attach text or CSV', 'Add a website', 'What’s your business called?', 'What kind of business is it?', 'Where do you operate?', 'What would you like to achieve first?', 'Continue', 'Skip', 'Review your workspace details', 'Build my roadmap', 'Auri is preparing your roadmap…', 'Enter or paste a full HTTPS URL.', 'Choose a .txt or .csv file under 16 KB with up to 4,000 characters.', 'Auri couldn’t find details in this text. You can add them below.', 'Analyzing business information…', 'Talk to Auri'],
 fr: ['Créons votre espace professionnel.', 'Présentez votre activité à Auri. Nous préparerons votre espace et votre parcours de croissance.', 'Présentez votre activité à Auri', 'Analyser', 'Commencer sans documents', 'Joindre un texte ou CSV', 'Ajouter un site web', 'Quel est le nom de votre entreprise ?', 'Quel est votre secteur ?', 'Où exercez-vous ?', 'Quel est votre premier objectif ?', 'Continuer', 'Passer', 'Vérifiez les informations de votre espace', 'Créer mon espace', 'Création de votre espace et de votre parcours…', 'Saisissez ou collez une URL HTTPS complète.', 'Choisissez un fichier .txt ou .csv de moins de 16 Ko et 4 000 caractères maximum.', 'Auri n’a trouvé aucune information dans ce texte. Ajoutez-la ci-dessous.', 'Analyse de votre activité…', 'Parler à Auri'],
 tr: ['İşletmenizi birlikte kuralım.', 'İşletmenizi Auri’ye anlatın. Çalışma alanınızı ve büyüme planınızı oluşturalım.', 'İşletmenizi Auri’ye anlatın', 'Analiz et', 'Belgesiz başla', 'Metin veya CSV ekle', 'Web sitesi ekle', 'İşletmenizin adı nedir?', 'Hangi sektörde çalışıyorsunuz?', 'Nerede faaliyet gösteriyorsunuz?', 'İlk hedefiniz nedir?', 'Devam et', 'Atla', 'Çalışma alanı bilgilerini kontrol edin', 'Çalışma alanı oluştur', 'Çalışma alanınız ve büyüme planınız hazırlanıyor…', 'Tam HTTPS adresini yazın veya yapıştırın.', '16 KB altında ve en fazla 4.000 karakter içeren bir .txt veya .csv dosyası seçin.', 'Auri bu metinde bilgi bulamadı. Bilgileri aşağıdan ekleyebilirsiniz.', 'İşletme bilgileri inceleniyor…', 'Auri ile konuş'],
 ar: ['لنبدأ ببناء نشاطك التجاري.', 'أخبر أوري عن نشاطك لنعدّ مساحة عملك ومسار نموك.', 'أخبر أوري عن نشاطك التجاري', 'تحليل', 'البدء دون مستندات', 'إرفاق ملف نصي أو CSV', 'إضافة موقع إلكتروني', 'ما اسم نشاطك التجاري؟', 'ما مجال نشاطك؟', 'أين تعمل؟', 'ما أول هدف تريد تحقيقه؟', 'متابعة', 'تخطي', 'راجع تفاصيل مساحة عملك', 'إنشاء مساحة العمل', 'جارٍ إعداد مساحة عملك ومسار نموك…', 'أدخل رابط HTTPS كاملًا أو الصقه.', 'اختر ملف .txt أو .csv أصغر من 16 كيلوبايت وبحد أقصى ٤٠٠٠ حرف.', 'لم يعثر أوري على معلومات في النص. يمكنك إضافتها أدناه.', 'جارٍ تحليل معلومات النشاط…', 'تحدث مع أوري'],
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
   return `<select name="industry"><option value="">—</option>${industries.map(id => `<option value="${id}" ${value === id ? 'selected' : ''}>${esc(t(id === 'services' ? 'servicesIndustry' : id))}</option>`).join('')}</select>`;
  }
  const max = { name: 120, city: 100, country: 80, website: 500, tools: 1200, acquisition: 1200 }[key] || 1600;
  return `<input name="${key}" value="${esc(value)}" type="${key === 'website' ? 'url' : 'text'}" maxlength="${max}" ${required ? 'required' : ''}>`;
 };
 const question = steps.find(key => !values[key] && (key === 'name' || !answered.has(key)));
 const confidenceLabels = { en: ['Quoted', 'Inferred'], fr: ['Cité', 'Déduit'], tr: ['Alıntı', 'Çıkarım'], ar: ['اقتباس', 'استنتاج'] };
 const reviewing = state.phase === 'questions' && !question;
 const entry = state.phase !== 'questions';
 app.innerHTML = `${header}<main id="main" class="auri-setup">
 <div class="auri-setup-heading"><div class="auri-setup-character">${robot()}</div>
 <h1>${esc(entry ? title : reviewing ? review : ({ name:nameQuestion, industry:industryQuestion, city:cityQuestion, goals:goalQuestion, tools:toolsQuestion[lang] })[question])}</h1>
 ${entry ? `<p>${esc(intro)}</p>` : ''}</div>
 <form class="auri-setup-form">
 ${entry ? `<div class="auri-setup-composer">
 <textarea name="businessText" aria-label="${esc(placeholder)}" placeholder="${esc(placeholder)}" maxlength="4000" rows="4">${esc(state.text)}</textarea>
 <div class="auri-setup-actions"><label class="secondary">${esc(attach)}<input type="file" name="source" accept=".txt,.csv,text/plain,text/csv" class="sr-only"></label>
 <button type="button" class="secondary" data-setup="website">${esc(website)}</button>
 <button type="submit" class="primary">${esc(analyzeLabel)}</button></div></div>
 <p class="auri-setup-source" role="status">${esc(state.source || '')}</p>
 <button type="button" class="secondary" data-setup="manual">${esc(manual)}</button>`
 : reviewing ? `<div class="auri-setup-review">${fields.map(key => `<label class="field"><span>${esc(label(key))}</span>${input(key, key === 'name')}${facts[key] ? `<small>${esc(facts[key].source)} · ${confidenceLabels[lang][Number(facts[key].confidence === 'inferred')]} · “${esc(facts[key].excerpt)}”</small>` : ''}</label>`).join('')}</div>
 <button type="submit" class="primary">${esc(create)}</button>`
 : `<label class="field">${esc(label(question))}${input(question, question === 'name')}</label><button type="submit" class="primary">${esc(next)}</button>
 ${question !== 'name' ? `<button type="button" class="secondary" data-setup="skip">${esc(skip)}</button>` : ''}
 <button type="button" class="secondary" data-setup="entry">${esc(converse)}</button>`}
 <p role="status" data-setup-status>${esc(state.message || '')}</p><p role="alert"></p>
 </form><div data-onboarding-guide></div></main>`;
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
   controls.forEach(control => { control.disabled = false; });
  }
 };
}
