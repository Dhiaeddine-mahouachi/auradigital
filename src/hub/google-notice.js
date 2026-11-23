// Messages for /hub/...?google=<code>, set by the Google sign-in routes in
// src/customer-identity.js when a sign-in cannot finish. The code is read once
// and removed from the address bar.

const NOTICES = {
 off: {
  en: 'Google sign-in is not available right now. Please sign in with your email and password.',
  tr: 'Google ile giriş şu anda kullanılamıyor. Lütfen e-posta ve şifrenizle giriş yapın.',
  ar: 'تسجيل الدخول عبر Google غير متاح حاليًا. يرجى تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.',
  fr: 'La connexion Google n’est pas disponible pour le moment. Connectez-vous avec votre e-mail et votre mot de passe.',
 },
 terms: {
  en: 'Please accept the AuraDigital account terms, then choose Continue with Google again.',
  tr: 'Lütfen AuraDigital hesap koşullarını kabul edin, ardından tekrar Google ile devam edin.',
  ar: 'يرجى الموافقة على شروط حساب AuraDigital، ثم اختر المتابعة باستخدام Google مرة أخرى.',
  fr: 'Acceptez les conditions du compte AuraDigital, puis choisissez à nouveau Continuer avec Google.',
 },
 verify_first: {
  en: 'Verify your email first, then you can link Google to your account here.',
  tr: 'Önce e-postanızı doğrulayın, ardından Google’ı buradan hesabınıza bağlayabilirsiniz.',
  ar: 'أكّد بريدك الإلكتروني أولًا، ثم يمكنك ربط Google بحسابك من هنا.',
  fr: 'Vérifiez d’abord votre e-mail, puis vous pourrez lier Google à votre compte ici.',
 },
 canceled: {
  en: 'Google sign-in was canceled. You can try again whenever you are ready.',
  tr: 'Google ile giriş iptal edildi. Hazır olduğunuzda tekrar deneyebilirsiniz.',
  ar: 'تم إلغاء تسجيل الدخول عبر Google. يمكنك المحاولة مجددًا متى شئت.',
  fr: 'La connexion Google a été annulée. Vous pouvez réessayer quand vous voulez.',
 },
 expired: {
  en: 'That Google sign-in took too long or was already used. Please choose Continue with Google again.',
  tr: 'Bu Google girişi çok uzun sürdü veya zaten kullanıldı. Lütfen tekrar Google ile devam edin.',
  ar: 'استغرق تسجيل الدخول عبر Google وقتًا طويلًا أو تم استخدامه بالفعل. يرجى اختيار المتابعة باستخدام Google مرة أخرى.',
  fr: 'Cette connexion Google a expiré ou a déjà été utilisée. Choisissez à nouveau Continuer avec Google.',
 },
 failed: {
  en: 'Google sign-in could not be completed. Please try again, or sign in with your email and password.',
  tr: 'Google ile giriş tamamlanamadı. Lütfen tekrar deneyin veya e-posta ve şifrenizle giriş yapın.',
  ar: 'تعذّر إكمال تسجيل الدخول عبر Google. حاول مرة أخرى، أو سجّل الدخول بالبريد الإلكتروني وكلمة المرور.',
  fr: 'La connexion Google n’a pas pu aboutir. Réessayez, ou connectez-vous avec votre e-mail et votre mot de passe.',
 },
 link_required: {
  en: 'This email already has an AuraHub account. Sign in with your email and password, verify your email, then choose “Link Google” in Settings. After that, Google sign-in works directly.',
  tr: 'Bu e-postanın zaten bir AuraHub hesabı var. E-posta ve şifrenizle giriş yapın, e-postanızı doğrulayın, ardından Ayarlar’da “Google’ı bağla”yı seçin. Sonrasında Google ile doğrudan giriş yapabilirsiniz.',
  ar: 'هذا البريد لديه حساب AuraHub بالفعل. سجّل الدخول بالبريد وكلمة المرور، وأكّد بريدك، ثم اختر «ربط Google» من الإعدادات. بعد ذلك يعمل تسجيل الدخول عبر Google مباشرة.',
  fr: 'Cet e-mail a déjà un compte AuraHub. Connectez-vous avec votre e-mail et votre mot de passe, vérifiez votre e-mail, puis choisissez « Lier Google » dans les Paramètres. Ensuite, la connexion Google fonctionnera directement.',
 },
 link_mismatch: {
  en: 'That Google account uses a different email, or is already linked to another AuraHub account. Choose the Google account with the same email as this AuraHub account.',
  tr: 'Bu Google hesabı farklı bir e-posta kullanıyor veya başka bir AuraHub hesabına bağlı. Bu AuraHub hesabıyla aynı e-postaya sahip Google hesabını seçin.',
  ar: 'حساب Google هذا يستخدم بريدًا مختلفًا أو مرتبط بحساب AuraHub آخر. اختر حساب Google بنفس البريد المستخدم في حساب AuraHub هذا.',
  fr: 'Ce compte Google utilise un autre e-mail ou est déjà lié à un autre compte AuraHub. Choisissez le compte Google ayant le même e-mail que ce compte AuraHub.',
 },
 unavailable: {
  en: 'This account is not available. Please contact AuraDigital support.',
  tr: 'Bu hesap kullanılamıyor. Lütfen AuraDigital destek ile iletişime geçin.',
  ar: 'هذا الحساب غير متاح. يرجى التواصل مع دعم AuraDigital.',
  fr: 'Ce compte n’est pas disponible. Contactez l’assistance AuraDigital.',
 },
 busy: {
  en: 'Too many sign-in attempts. Please wait a minute and try again.',
  tr: 'Çok fazla giriş denemesi. Lütfen bir dakika bekleyip tekrar deneyin.',
  ar: 'محاولات تسجيل دخول كثيرة جدًا. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.',
  fr: 'Trop de tentatives de connexion. Patientez une minute puis réessayez.',
 },
};

export const GOOGLE_NOTICE_KEYS = Object.keys(NOTICES);

export function googleNoticeText(code, lang = 'en') {
 const entry = NOTICES[code];
 return entry ? entry[lang] || entry.en : '';
}

// Reads ?google=<code> once and removes it from the address bar.
export function takeGoogleNotice(loc = globalThis.location, hist = globalThis.history) {
 if (!loc) return '';
 const url = new URL(loc.href);
 const code = url.searchParams.get('google') || '';
 if (!url.searchParams.has('google')) return '';
 url.searchParams.delete('google');
 try { hist?.replaceState(hist.state, '', url.pathname + url.search + url.hash); } catch { /* ignore */ }
 return NOTICES[code] ? code : '';
}
