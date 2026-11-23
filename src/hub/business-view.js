// My Business — the business profile inside the AuraHub shell. Saves through
// the existing versioned PUT /profile endpoint; the logo has its own endpoint.
import { icon } from './os-ui.js';
import { industryLabel, INDUSTRY_IDS } from './os-copy.js';
import { capabilities } from '../growth-engine.js';

const C = {
 en: { title: 'My Business', lead: 'The details AuraDigital and Auri use for your roadmap, website, menu and requests.', complete: n => `Profile ${n}% complete`, completeHint: 'A complete profile means fewer questions on every request.',
  identity: 'Business', contact: 'Contact', hours: 'Opening hours', online: 'Online presence', brand: 'Brand', context: 'Goals & context', existing: 'What you already have',
  logo: 'Logo', uploadLogo: 'Upload logo', changeLogo: 'Change logo', removeLogo: 'Remove', logoHint: 'Square images look best. JPEG, PNG or WebP.',
  name: 'Business name', industry: 'Category', details: 'What you offer', phone: 'Phone', email: 'Business email', address: 'Address', city: 'City', country: 'Country',
  hoursField: 'Hours', hoursHint: 'For example: Mon–Fri 9:00–18:00, Sat 10:00–16:00, Sun closed.', website: 'Website', social: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', maps: 'Google Maps', whatsapp: 'WhatsApp link' }, socialHint: 'Paste full links starting with https://',
  colors: 'Brand colors', colorsHint: 'Up to three colors used on your website and menu.', addColor: 'Add color', goals: 'Main goal', stage: 'Business stage', acquisition: 'How customers find you', difficulties: 'Main difficulties', tools: 'Tools you use', timeline: 'Timeline', budget: 'Approximate budget', currency: 'Currency',
  save: 'Save changes', saved: 'Business details saved.', unsaved: 'You have unsaved changes.', readOnly: 'You can view these details. Ask the owner for edit access.', none: 'Not added yet', remove: 'Remove' },
 tr: { title: 'İşletmem', lead: 'AuraDigital ve Auri’nin yol haritası, web sitesi, menü ve talepler için kullandığı bilgiler.', complete: n => `Profil %${n} tamamlandı`, completeHint: 'Eksiksiz bir profil, her talepte daha az soru demektir.',
  identity: 'İşletme', contact: 'İletişim', hours: 'Çalışma saatleri', online: 'Online varlık', brand: 'Marka', context: 'Hedefler ve bağlam', existing: 'Halihazırda sahip oldukları',
  logo: 'Logo', uploadLogo: 'Logo yükle', changeLogo: 'Logoyu değiştir', removeLogo: 'Kaldır', logoHint: 'Kare görseller en iyi görünür. JPEG, PNG veya WebP.',
  name: 'İşletme adı', industry: 'Kategori', details: 'Ne sunuyorsunuz', phone: 'Telefon', email: 'İşletme e-postası', address: 'Adres', city: 'Şehir', country: 'Ülke',
  hoursField: 'Saatler', hoursHint: 'Örneğin: Pzt–Cum 9:00–18:00, Cmt 10:00–16:00, Paz kapalı.', website: 'Web sitesi', social: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', maps: 'Google Haritalar', whatsapp: 'WhatsApp bağlantısı' }, socialHint: 'https:// ile başlayan tam bağlantıları yapıştırın',
  colors: 'Marka renkleri', colorsHint: 'Web sitenizde ve menünüzde kullanılan en fazla üç renk.', addColor: 'Renk ekle', goals: 'Ana hedef', stage: 'İşletme aşaması', acquisition: 'Müşteriler sizi nasıl buluyor', difficulties: 'Ana zorluklar', tools: 'Kullandığınız araçlar', timeline: 'Zaman çizelgesi', budget: 'Yaklaşık bütçe', currency: 'Para birimi',
  save: 'Değişiklikleri kaydet', saved: 'İşletme bilgileri kaydedildi.', unsaved: 'Kaydedilmemiş değişiklikler var.', readOnly: 'Bu bilgileri görüntüleyebilirsiniz. Düzenleme yetkisi için sahibine başvurun.', none: 'Henüz eklenmedi', remove: 'Kaldır' },
 fr: { title: 'Mon activité', lead: 'Les informations qu’AuraDigital et Auri utilisent pour votre feuille de route, site, menu et demandes.', complete: n => `Profil complété à ${n} %`, completeHint: 'Un profil complet évite de répéter les mêmes questions.',
  identity: 'Activité', contact: 'Contact', hours: 'Horaires', online: 'Présence en ligne', brand: 'Marque', context: 'Objectifs et contexte', existing: 'Ce que vous avez déjà',
  logo: 'Logo', uploadLogo: 'Ajouter un logo', changeLogo: 'Changer le logo', removeLogo: 'Supprimer', logoHint: 'Les images carrées rendent le mieux. JPEG, PNG ou WebP.',
  name: 'Nom de l’activité', industry: 'Catégorie', details: 'Ce que vous proposez', phone: 'Téléphone', email: 'E-mail professionnel', address: 'Adresse', city: 'Ville', country: 'Pays',
  hoursField: 'Horaires', hoursHint: 'Par exemple : lun–ven 9h–18h, sam 10h–16h, dim fermé.', website: 'Site web', social: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', maps: 'Google Maps', whatsapp: 'Lien WhatsApp' }, socialHint: 'Collez des liens complets commençant par https://',
  colors: 'Couleurs de marque', colorsHint: 'Jusqu’à trois couleurs pour votre site et menu.', addColor: 'Ajouter une couleur', goals: 'Objectif principal', stage: 'Stade de l’activité', acquisition: 'Comment les clients vous trouvent', difficulties: 'Difficultés principales', tools: 'Outils utilisés', timeline: 'Délai', budget: 'Budget approximatif', currency: 'Devise',
  save: 'Enregistrer', saved: 'Informations enregistrées.', unsaved: 'Modifications non enregistrées.', readOnly: 'Vous pouvez consulter ces informations. Demandez un accès en écriture au propriétaire.', none: 'Non renseigné', remove: 'Supprimer' },
 ar: { title: 'نشاطي', lead: 'التفاصيل التي تستخدمها AuraDigital وأوري للخطة والموقع والقائمة والطلبات.', complete: n => `الملف مكتمل بنسبة ${n}%`, completeHint: 'الملف المكتمل يعني أسئلة أقل في كل طلب.',
  identity: 'النشاط', contact: 'التواصل', hours: 'ساعات العمل', online: 'الحضور الرقمي', brand: 'العلامة', context: 'الأهداف والسياق', existing: 'ما لديك بالفعل',
  logo: 'الشعار', uploadLogo: 'رفع شعار', changeLogo: 'تغيير الشعار', removeLogo: 'إزالة', logoHint: 'الصور المربعة هي الأفضل. JPEG أو PNG أو WebP.',
  name: 'اسم النشاط', industry: 'الفئة', details: 'ما الذي تقدمه', phone: 'الهاتف', email: 'بريد النشاط', address: 'العنوان', city: 'المدينة', country: 'الدولة',
  hoursField: 'الساعات', hoursHint: 'مثلًا: الإثنين–الجمعة 9:00–18:00، السبت 10:00–16:00، الأحد مغلق.', website: 'الموقع', social: { instagram: 'إنستغرام', facebook: 'فيسبوك', tiktok: 'تيك توك', linkedin: 'لينكدإن', maps: 'خرائط Google', whatsapp: 'رابط واتساب' }, socialHint: 'الصق روابط كاملة تبدأ بـ https://',
  colors: 'ألوان العلامة', colorsHint: 'حتى ثلاثة ألوان لموقعك وقائمتك.', addColor: 'أضف لونًا', goals: 'الهدف الرئيسي', stage: 'مرحلة النشاط', acquisition: 'كيف يجدك العملاء', difficulties: 'أهم الصعوبات', tools: 'الأدوات المستخدمة', timeline: 'المدة', budget: 'الميزانية التقريبية', currency: 'العملة',
  save: 'حفظ التغييرات', saved: 'تم حفظ تفاصيل النشاط.', unsaved: 'لديك تغييرات غير محفوظة.', readOnly: 'يمكنك عرض هذه التفاصيل. اطلب من المالك صلاحية التعديل.', none: 'لم يُضف بعد', remove: 'إزالة' },
};
const SOCIAL = ['instagram', 'facebook', 'tiktok', 'linkedin', 'maps', 'whatsapp'];

export function profileCompleteness(profile, logo) {
 const checks = [profile.name, profile.industry && profile.industry !== 'other', profile.industryDetails, profile.phone, profile.email, profile.address || profile.city,
  profile.hours, profile.website, profile.social && Object.keys(profile.social).length, logo, profile.brandColors?.length, profile.goals];
 return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

export async function renderBusiness({ host, lang, esc, api, endpoint, workspace, cap, resizePhoto, toast, onSaved }) {
 const c = C[lang] || C.en;
 const canWrite = workspace.permissions.includes('profile:write');
 const profile = structuredClone(workspace.profile || {});
 let logo = null;
 try { ({ logo } = await api(endpoint('logo'))); } catch {}
 if (!host.isConnected) return;
 let colors = [...(profile.brandColors || [])];
 const field = (key, label, { type = 'text', value = profile[key] ?? '', max = 200, hint = '', area = false, attrs = '' } = {}) => `<label class="os-field"><span>${esc(label)}</span>${area
  ? `<textarea name="${key}" rows="3" maxlength="${max}" ${canWrite ? '' : 'readonly'} ${attrs}>${esc(value)}</textarea>`
  : `<input name="${key}" type="${type}" value="${esc(value)}" maxlength="${max}" ${canWrite ? '' : 'readonly'} ${attrs}>`}${hint ? `<small>${esc(hint)}</small>` : ''}</label>`;
 const section = (id, title, iconName, body) => `<section class="os-card os-biz-section" aria-labelledby="biz-${id}"><header class="os-card-head"><div><h2 id="biz-${id}">${icon(iconName, 18)} ${esc(title)}</h2></div></header>${body}</section>`;
 const draw = () => {
  const pct = profileCompleteness({ ...profile, brandColors: colors }, logo);
  host.innerHTML = `<div class="os-business">
   <header class="os-biz-head">
    <div class="os-biz-logo">${logo ? `<img src="${esc(logo)}" alt="${esc(c.logo)}" width="88" height="88">` : `<span aria-hidden="true">${esc(String(profile.name || '?').trim().slice(0, 2).toUpperCase())}</span>`}</div>
    <div class="os-biz-title"><p class="os-eyebrow">${esc(industryLabel(lang, profile.industry || 'other'))}${profile.city ? ' · ' + esc(profile.city) : ''}</p><h1>${esc(profile.name || c.title)}</h1><p class="os-muted">${esc(c.lead)}</p></div>
    <div class="os-biz-meter" role="group" aria-label="${esc(c.complete(pct))}"><strong>${esc(c.complete(pct))}</strong><span class="os-bar"><i style="width:${pct}%"></i></span><small>${esc(c.completeHint)}</small></div>
   </header>
   ${canWrite ? '' : `<p class="os-notice">${icon('lock', 16)}<span>${esc(c.readOnly)}</span></p>`}
   <form class="os-biz-form" data-biz-form novalidate>
    <div class="os-biz-grid">
     ${section('identity', c.identity, 'business', `<div class="os-biz-logo-row"><div class="os-biz-logo is-sm">${logo ? `<img src="${esc(logo)}" alt="" width="56" height="56">` : icon('business', 22)}</div><div><strong>${esc(c.logo)}</strong><small class="os-muted">${esc(c.logoHint)}</small>
       ${canWrite ? `<div class="os-inline-actions"><label class="os-btn is-quiet is-sm">${esc(logo ? c.changeLogo : c.uploadLogo)}<input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" data-logo></label>${logo ? `<button type="button" class="os-btn is-quiet is-sm" data-logo-remove>${esc(c.removeLogo)}</button>` : ''}</div>` : ''}</div></div>
      ${field('name', c.name, { max: 120, attrs: 'required' })}
      <label class="os-field"><span>${esc(c.industry)}</span><select name="industry" ${canWrite ? '' : 'disabled'}>${INDUSTRY_IDS.map(id => `<option value="${id}" ${profile.industry === id ? 'selected' : ''}>${esc(industryLabel(lang, id))}</option>`).join('')}</select></label>
      ${field('industryDetails', c.details, { area: true, max: 1600 })}`)}
     ${section('contact', c.contact, 'phone', `${field('phone', c.phone, { type: 'tel', max: 40, attrs: 'autocomplete="tel"' })}${field('email', c.email, { type: 'email', max: 254, attrs: 'autocomplete="email"' })}
      ${field('address', c.address, { area: true, max: 300 })}<div class="os-field-row">${field('city', c.city, { max: 100 })}${field('country', c.country, { max: 80 })}</div>`)}
     ${section('hours', c.hours, 'clock', field('hours', c.hoursField, { area: true, max: 600, hint: c.hoursHint }))}
     ${section('online', c.online, 'globe', `${field('website', c.website, { type: 'url', max: 500, attrs: 'placeholder="https://"' })}
      <div class="os-field-row is-wrap">${SOCIAL.map(k => field('social.' + k, c.social[k], { type: 'url', value: profile.social?.[k] || '', max: 500, attrs: 'placeholder="https://"' })).join('')}</div><small class="os-muted">${esc(c.socialHint)}</small>`)}
     ${section('brand', c.brand, 'spark', `<p class="os-muted">${esc(c.colorsHint)}</p><div class="os-colors">${colors.map((col, i) => `<label class="os-color"><span class="sr-only">${esc(c.colors)} ${i + 1}</span><input type="color" value="${esc(col)}" data-color="${i}" ${canWrite ? '' : 'disabled'}><code>${esc(col)}</code>${canWrite ? `<button type="button" class="os-link" data-color-remove="${i}">${esc(c.remove)}</button>` : ''}</label>`).join('')}
      ${canWrite && colors.length < 3 ? `<button type="button" class="os-btn is-quiet is-sm" data-color-add>${icon('plus', 16)}<span>${esc(c.addColor)}</span></button>` : ''}${!colors.length && !canWrite ? `<p class="os-muted">${esc(c.none)}</p>` : ''}</div>`)}
     ${section('context', c.context, 'journey', `${field('goals', c.goals, { area: true, max: 1600 })}<div class="os-field-row">${field('stage', c.stage, { max: 80 })}${field('timeline', c.timeline, { max: 200 })}</div>
      ${field('acquisition', c.acquisition, { area: true, max: 1200 })}${field('difficulties', c.difficulties, { area: true, max: 1600 })}${field('tools', c.tools, { area: true, max: 1200 })}
      <div class="os-field-row">${field('budget', c.budget, { type: 'number', value: profile.budget ?? '', attrs: 'min="0" step="any"' })}<label class="os-field"><span>${esc(c.currency)}</span><select name="currency" ${canWrite ? '' : 'disabled'}>${['USD', 'EUR', 'TRY', 'TND'].map(x => `<option ${profile.currency === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div>`)}
     ${section('existing', c.existing, 'check', `<div class="os-checks">${capabilities.filter(x => !x.industry || x.industry === profile.industry).map(x => `<label class="os-check"><input type="checkbox" name="capabilities" value="${x.id}" ${(profile.capabilities || []).includes(x.id) ? 'checked' : ''} ${canWrite ? '' : 'disabled'}><span>${esc(cap(x.id))}</span></label>`).join('')}</div>`)}
    </div>
    ${canWrite ? `<div class="os-biz-save" data-save-bar><span class="os-muted" data-dirty role="status"></span><p class="os-error" role="alert"></p><button class="os-btn is-primary">${esc(c.save)}</button></div>` : ''}
   </form></div>`;
  bind();
 };
 function collect(form) {
  const data = new FormData(form);
  for (const key of ['name', 'industry', 'industryDetails', 'phone', 'email', 'address', 'city', 'country', 'hours', 'website', 'goals', 'stage', 'timeline', 'acquisition', 'difficulties', 'tools', 'currency']) if (data.has(key)) profile[key] = String(data.get(key)).trim();
  const budget = data.get('budget'); profile.budget = budget === '' || budget === null ? null : Number(budget);
  profile.social = Object.fromEntries(SOCIAL.map(k => [k, String(data.get('social.' + k) || '').trim()]).filter(([, v]) => v));
  profile.capabilities = data.getAll('capabilities');
  profile.brandColors = colors;
 }
 function bind() {
  const form = host.querySelector('[data-biz-form]');
  if (!canWrite) return;
  const dirty = host.querySelector('[data-dirty]');
  form.addEventListener('input', () => { dirty.textContent = c.unsaved; host.querySelector('[data-save-bar]').classList.add('is-dirty'); });
  host.querySelectorAll('[data-color]').forEach(input => input.addEventListener('input', () => { colors[Number(input.dataset.color)] = input.value.toUpperCase(); input.nextElementSibling.textContent = input.value.toUpperCase(); }));
  host.querySelectorAll('[data-color-remove]').forEach(b => b.addEventListener('click', () => { collect(form); colors.splice(Number(b.dataset.colorRemove), 1); draw(); host.querySelector('[data-dirty]').textContent = c.unsaved; }));
  host.querySelector('[data-color-add]')?.addEventListener('click', () => { collect(form); colors.push(colors.length ? '#D8F56A' : '#003D2B'); draw(); host.querySelector('[data-dirty]').textContent = c.unsaved; });
  host.querySelector('[data-logo]')?.addEventListener('change', async e => {
   const alert = host.querySelector('[role=alert]');
   try { collect(form); const data = await resizePhoto(e.target.files[0]); ({ logo } = await api(endpoint('logo'), 'PUT', { logo: data })); draw(); }
   catch (error) { alert.textContent = error.message; }
  });
  host.querySelector('[data-logo-remove]')?.addEventListener('click', async () => { try { collect(form); await api(endpoint('logo'), 'DELETE'); logo = null; draw(); } catch (error) { host.querySelector('[role=alert]').textContent = error.message; } });
  form.addEventListener('submit', async e => {
   e.preventDefault();
   const alert = form.querySelector('[role=alert]'), submit = form.querySelector('.os-biz-save button');
   alert.textContent = '';
   collect(form);
   if (!profile.name) { form.elements.name.focus(); return; }
   submit.disabled = true;
   try {
    await api(endpoint('profile'), 'PUT', { profile, mode: workspace.organization.mode, version: workspace.organization.version });
    toast(c.saved);
    await onSaved();
   } catch (error) { alert.textContent = error.message; submit.disabled = false; }
  });
 }
 draw();
}
