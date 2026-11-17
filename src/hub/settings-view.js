const exportLabel={en:'Export this workspace',fr:'Exporter cet espace',tr:'Bu çalışma alanını dışa aktar',ar:'صدّر مساحة العمل هذه'};
const settingsCopy={
 en:['Account','Change password','Current password','New password','Change email','New email','Send confirmation links','Confirm from both inboxes.','Email confirmation is currently unavailable.','Preferences','Workspace','Password changed. Sign in again.','Links sent. Confirm from both inboxes.','Confirm email change','Confirmation saved. Open the link from your other inbox.','Email updated. Sign in with the new address.','Forgot your password?'],
 fr:['Compte','Modifier le mot de passe','Mot de passe actuel','Nouveau mot de passe','Modifier l’adresse e-mail','Nouvelle adresse e-mail','Envoyer les liens','Confirmez depuis les deux boîtes.','La confirmation par e-mail est indisponible.','Préférences','Espace de travail','Mot de passe changé. Reconnectez-vous.','Liens envoyés. Confirmez depuis les deux boîtes.','Confirmer le changement d’e-mail','Confirmation enregistrée. Ouvrez le lien envoyé à l’autre adresse.','Adresse modifiée. Connectez-vous avec la nouvelle adresse.','Mot de passe oublié ?'],
 tr:['Hesap','Şifreyi değiştir','Mevcut şifre','Yeni şifre','E-postayı değiştir','Yeni e-posta','Onay bağlantılarını gönder','Her iki posta kutusundan da onaylayın.','E-posta onayı şu anda kullanılamıyor.','Tercihler','Çalışma alanı','Şifre değiştirildi. Tekrar giriş yapın.','Bağlantılar gönderildi. Her iki posta kutusundan onaylayın.','E-posta değişikliğini onayla','Onay kaydedildi. Diğer posta kutusundaki bağlantıyı açın.','E-posta güncellendi. Yeni adresle giriş yapın.','Şifrenizi mi unuttunuz?'],
 ar:['الحساب','غيّر كلمة المرور','كلمة المرور الحالية','كلمة المرور الجديدة','غيّر البريد الإلكتروني','البريد الجديد','أرسل روابط التأكيد','أكّد من صندوقَي البريد.','تأكيد البريد غير متاح حاليًا.','التفضيلات','مساحة العمل','تغيّرت كلمة المرور. سجّل الدخول مجددًا.','أُرسلت الروابط. أكّد من صندوقَي البريد.','أكّد تغيير البريد','تم الحفظ. افتح الرابط في صندوق البريد الآخر.','تم تغيير البريد. سجّل الدخول بالعنوان الجديد.','نسيت كلمة المرور؟'],
};
export const accountSettingsCopy=lang=>settingsCopy[lang]||settingsCopy.en;
export function renderAccountSettings({host,user,lang,esc,t,api,link,workspace,canEmail,canLinkGoogle,onNewWorkspace,onSignIn,onLanguage}){
 const [account,password,current,newPassword,email,newEmail,send,confirmBoth,unavailable,preferences,space,passwordSaved,linksSent,,,,forgot]=accountSettingsCopy(lang);
 const currentField=`<label class="field">${current}<input name="currentPassword" type="password" required maxlength="200" autocomplete="current-password"></label>`;
 host.innerHTML=`<div class="hub-settings-grid">
 <section class="panel hub-settings-account"><h2>${account}</h2><div class="hub-account-address"><strong>${esc(user.email)}</strong><span>${esc(t(user.verified?'verified':'verify'))}</span></div>
 <details class="hub-settings-form"><summary>${password}</summary>
 <form data-account-change="password">${currentField}<label class="field">${newPassword}<input name="password" type="password" required minlength="12" maxlength="72" autocomplete="new-password"></label><button type="submit" class="growth-primary">${password}</button></form>
 ${canEmail?`<a class="hub-settings-link" href="/hub/forgot">${forgot}</a>`:''}</details>
 <details class="hub-settings-form"><summary>${email}</summary>
 ${canEmail?`<p>${confirmBoth}</p><form data-account-change="email">${currentField}<label class="field">${newEmail}<input name="email" type="email" required maxlength="254" autocomplete="email"></label><button type="submit" class="growth-primary">${send}</button></form>`:`<p>${unavailable}</p>`}</details>
 ${canLinkGoogle?`<a class="growth-secondary" href="/api/customer/google/start?acceptTerms=true">${esc(t('linkGoogle'))}</a>`:''}
 <p class="hub-settings-feedback" role="status"></p></section>
 <div class="hub-settings-side"><section class="panel"><h2>${preferences}</h2><label class="field">${({en:'Language',fr:'Langue',tr:'Dil',ar:'اللغة'})[lang]}
 <select data-settings-language>${[['en','English'],['fr','Français'],['tr','Türkçe'],['ar','العربية']].map(([value,label])=>`<option value="${value}" ${value===lang?'selected':''}>${label}</option>`).join('')}</select></label><div class="hub-settings-links">
 ${workspace?`<a href="${esc(link('assistant'))}">${esc(t('auri'))} ↗</a>`:''}<a href="/account">${esc(t('orders'))} ↗</a></div></section>
 <section class="panel"><h2>${space}</h2><div class="hub-settings-links">
 ${workspace?`<a href="${esc(link('profile'))}">${esc(t('profile'))} ↗</a><a href="${esc(link('team'))}">${esc(t('team'))} ↗</a><a href="${esc(link('invoices'))}">${esc(t('invoices'))} ↗</a><button type="button" class="growth-secondary" data-export-workspace>${esc(exportLabel[lang]||exportLabel.en)}</button>`:''}
 <button type="button" class="growth-secondary" data-add-workspace>${esc(t('newWorkspace'))}</button></div></section></div></div>`;
 const feedback=host.querySelector('[role=status]');
 host.querySelector('[data-add-workspace]').onclick=onNewWorkspace;
 host.querySelector('[data-export-workspace]')?.addEventListener('click',()=>{
  const data={name:workspace.organization.name, profile:workspace.profile, missions:workspace.missions};
  const file=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const download=document.createElement('a');
  download.href=file;
  download.download='aurahub-workspace.json';
  download.click();
  setTimeout(()=>URL.revokeObjectURL(file),1000);
 });
 host.querySelector('[data-settings-language]').onchange=event=>onLanguage(event.target.value);
 for(const form of host.querySelectorAll('[data-account-change]')){
  form.onsubmit=async event=>{
   event.preventDefault();
   const action=form.dataset.accountChange,submit=form.querySelector('button');
   if(submit.disabled)return;
   submit.disabled=true;
   feedback.textContent='';
   try {
    await api('/api/customer/change-'+action,'POST',Object.fromEntries(new FormData(form)));
    form.reset();
    if(action==='password'){onSignIn(passwordSaved);return;}
    feedback.textContent=linksSent;
   }catch(error){feedback.textContent=error.message;}
   finally{submit.disabled=false;}
  };
 }
}
