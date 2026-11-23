// Translations of the standard roadmap task texts in src/roadmap.js
// (missionGuide: [service, why, how]). Text that Auri wrote for a specific
// customer is already in their language and is never replaced.
import { missionGuide } from '../roadmap.js';

const L = {
 tr: {
  website: ['Müşterilere teklifinizi anlayabilecekleri ve size ulaşabilecekleri bir yer sunun.', 'Ana teklifinizi ve hedef kitlenizi seçin. Net bir iletişim veya rezervasyon butonu olan, mobil uyumlu bir sayfa yayınlayın.'],
  domain: ['İşletmenize kontrolü sizde olan tutarlı bir adres kazandırın.', 'Bir alan adı seçin, işletme hesabınıza kaydedin ve yenileme ile DNS erişimini kayıt altına alın.'],
  email: ['Müşteri mesajlarını tanınır kılın ve teslim edilebilirliği artırın.', 'Markalı bir posta kutusu oluşturun ve e-posta sağlayıcınızda SPF, DKIM ve DMARC ayarlarını yapın.'],
  branding: ['Müşterilerin sizi ilanlarda, mesajlarda ve sitenizde tanımasını sağlayın.', 'Logonuzu, renklerinizi ve ana mesajınızı kısa bir marka rehberinde toplayın.'],
  hosting: ['Sitenizi erişilebilir tutun ve yönetim erişimini koruyun.', 'HTTPS, otomatik yedekleme ve iki adımlı doğrulamayı açın. Bir yedeği geri yüklemeyi test edin.'],
  seo: ['Sayfalarınızın müşterilerinizin yaptığı aramalarda bulunmasını kolaylaştırın.', 'İlgili arama terimlerini seçin, sayfa başlıklarını ve metinleri güncelleyin, Search Console’da dizine eklenmeyi doğrulayın.'],
  discovery: ['Yakındaki müşterilerin saatlerinizi, konumunuzu ve iletişim bilgilerinizi bulmasına yardımcı olun.', 'Uygunsa Google İşletme Profilinizi sahiplenin. Doğrulayın, doğru bilgileri ekleyin ve güncel fotoğraflar paylaşın.'],
  ads: ['Ücretli aramanın, teklifinizi zaten arayan kişilere ulaşıp ulaşamayacağını test edin.', 'Bir teklif ve açılış sayfası seçin. Başlatmadan önce dönüşüm takibini ve test bütçesini ayarlayın.'],
  reviews: ['Müşterilerin işletmenizden ne bekleyeceklerini değerlendirmesine yardımcı olun.', 'Hizmetten sonra dürüst yorum isteyin ve geri bildirimlere yanıt verin. Olumlu puana bağlı teşviklerden kaçının.'],
  leads: ['Ziyaretçilere bir sonraki adımı atmanın doğrudan bir yolunu verin.', 'Kısa bir iletişim veya rezervasyon formu ekleyin. Gönderimi, onayı ve dönüşü telefonda test edin.'],
  whatsapp: ['Müşterilerin telefonlarından konuşma başlatmasını kolaylaştırın.', 'Bir işletme numarası kurun, sitenize veya ilanınıza tıkla-sohbet ekleyin ve yanıtları kimin vereceğini belirleyin.'],
  crm: ['Müşteri taleplerini ve dönüş sözlerini tek yerde tutun.', 'Satış aşamalarınızı belirleyin, sorumluları atayın ve mevcut talepleri izinle içe aktarın.'],
  conversion: ['Ziyaret ile talep veya satış arasındaki engelleri bulup kaldırın.', 'Teklifinizi ve harekete geçirici mesajınızı gözden geçirin. Bir öğeyi değiştirin ve daha fazla ziyaretçinin adım atıp atmadığını ölçün.'],
  automation: ['Rutin soruları yanıtlayın ve karmaşık talepleri bir kişiye yönlendirin.', 'Onaylı yanıtlar yazın, devredilecek durumları belirleyin ve yanıtları sık sorulan sorularla test edin.'],
  followups: ['Kaçırılan talepleri azaltın ve düzenli dönüş yapın.', 'Hatırlatmaların ne zaman gönderileceğini belirleyin, izni kaydedin, abonelikten çıkmayı ve insan müdahalesini test edin.'],
  analytics: ['Hangi kanalların ve sayfaların faydalı müşteri eylemlerine yol açtığını görün.', 'Önemli eylemleri seçin, gizliliğe saygılı takip kurun ve örnek olayları doğrulayın.'],
  retention: ['Mevcut müşterilerin geri dönmesini kolaylaştırın.', 'Geri dönmek için bir neden seçin, mevcut müşterilerle test edin ve tekrar eden alışveriş veya rezervasyonları ölçün.'],
  menu: ['Misafirlerin güncel ürün ve fiyatları telefonlarında kolayca görmesini sağlayın.', 'Kategorilerinizi, ürün adlarını, fiyatları ve fotoğrafları toplayın. Bir QR bağlantısını yayınlayıp telefonda test edin.'],
 },
 fr: {
  website: ['Offrez aux clients un endroit pour comprendre votre offre et vous contacter.', 'Choisissez votre offre principale et votre public. Publiez une page adaptée au mobile avec un bouton de contact ou de réservation clair.'],
  domain: ['Donnez à votre activité une adresse cohérente que vous contrôlez.', 'Choisissez un domaine, enregistrez-le au nom de votre activité et notez le renouvellement et l’accès DNS.'],
  email: ['Rendez vos messages reconnaissables et améliorez leur délivrabilité.', 'Créez une boîte à votre nom de domaine et configurez SPF, DKIM et DMARC chez votre fournisseur.'],
  branding: ['Aidez les clients à reconnaître votre activité sur les annuaires, messages et votre site.', 'Rassemblez logo, couleurs et message clé dans un court guide de marque.'],
  hosting: ['Gardez votre site accessible et protégez l’accès à son administration.', 'Activez HTTPS, les sauvegardes automatiques et la double authentification. Testez une restauration.'],
  seo: ['Rendez vos pages plus faciles à trouver pour les recherches de vos clients.', 'Choisissez des mots-clés pertinents, mettez à jour titres et textes, vérifiez l’indexation dans Search Console.'],
  discovery: ['Aidez les clients proches à trouver vos horaires, adresse et coordonnées.', 'Revendiquez votre fiche Google Business si possible. Vérifiez-la, complétez-la et publiez des photos récentes.'],
  ads: ['Testez si la recherche payante touche les personnes qui cherchent déjà votre offre.', 'Choisissez une offre et une page d’arrivée. Configurez le suivi des conversions et un budget test avant de lancer.'],
  reviews: ['Aidez les clients à savoir à quoi s’attendre.', 'Demandez des avis honnêtes après le service et répondez aux retours. Évitez les incitations liées aux notes positives.'],
  leads: ['Donnez aux visiteurs un moyen direct de passer à l’étape suivante.', 'Ajoutez un court formulaire de contact ou de réservation. Testez l’envoi, la confirmation et le suivi sur téléphone.'],
  whatsapp: ['Facilitez le démarrage d’une conversation depuis un téléphone.', 'Configurez un numéro professionnel, ajoutez un bouton de discussion sur votre site ou fiche et définissez qui répond.'],
  crm: ['Gardez les demandes et engagements de suivi au même endroit.', 'Définissez les étapes de votre pipeline, attribuez des responsables et importez vos prospects avec leur accord.'],
  conversion: ['Repérez et supprimez les freins entre une visite et une demande ou une vente.', 'Revoyez votre offre et votre appel à l’action. Changez un élément et mesurez si plus de visiteurs passent à l’action.'],
  automation: ['Répondez aux questions courantes et orientez les demandes complexes vers une personne.', 'Rédigez des réponses validées, identifiez les cas à transférer et testez avec des questions fréquentes.'],
  followups: ['Réduisez les demandes oubliées et relancez régulièrement.', 'Définissez quand envoyer les rappels, enregistrez le consentement et testez la désinscription et la reprise manuelle.'],
  analytics: ['Voyez quels canaux et pages mènent à des actions utiles.', 'Choisissez les actions importantes, configurez un suivi respectueux de la vie privée et vérifiez des événements tests.'],
  retention: ['Facilitez le retour de vos clients existants.', 'Choisissez une raison de revenir, testez-la avec vos clients et mesurez les achats ou réservations répétés.'],
  menu: ['Permettez aux clients de voir vos plats et prix actuels sur leur téléphone.', 'Rassemblez catégories, noms, prix et photos. Publiez et testez un lien QR sur un téléphone.'],
 },
 ar: {
  website: ['امنح العملاء مكانًا لفهم ما تقدمه والتواصل معك.', 'اختر عرضك الرئيسي وجمهورك. انشر صفحة مناسبة للجوال مع زر واضح للتواصل أو الحجز.'],
  domain: ['امنح نشاطك عنوانًا ثابتًا تتحكم فيه.', 'اختر نطاقًا وسجّله باسم نشاطك ووثّق موعد التجديد وصلاحية DNS.'],
  email: ['اجعل رسائلك معروفة للعملاء وحسّن وصولها.', 'أنشئ بريدًا باسم نطاقك واضبط SPF وDKIM وDMARC لدى مزوّد البريد.'],
  branding: ['ساعد العملاء على التعرف على نشاطك في الأدلة والرسائل وموقعك.', 'اجمع شعارك وألوانك ورسالتك الأساسية في دليل علامة قصير.'],
  hosting: ['حافظ على إتاحة موقعك واحمِ صلاحيات إدارته.', 'فعّل HTTPS والنسخ الاحتياطي التلقائي والتحقق بخطوتين. جرّب استعادة نسخة.'],
  seo: ['اجعل صفحاتك أسهل في الظهور لعمليات البحث التي يجريها عملاؤك.', 'اختر كلمات بحث مناسبة وحدّث العناوين والنصوص وتحقق من الفهرسة في Search Console.'],
  discovery: ['ساعد العملاء القريبين على معرفة ساعاتك وموقعك وطرق التواصل.', 'اطلب ملكية ملف نشاطك على Google إن أمكن، ووثّقه وأضف معلومات دقيقة وصورًا حديثة.'],
  ads: ['اختبر ما إذا كان البحث المدفوع يصل إلى من يبحثون عن عرضك بالفعل.', 'اختر عرضًا وصفحة هبوط واحدة. اضبط تتبع التحويل وميزانية تجريبية قبل الإطلاق.'],
  reviews: ['ساعد العملاء على معرفة ما يتوقعونه من نشاطك.', 'اطلب تقييمات صادقة بعد الخدمة ورد على الملاحظات. تجنّب الحوافز المرتبطة بالتقييم الإيجابي.'],
  leads: ['امنح الزوار طريقة مباشرة لاتخاذ الخطوة التالية.', 'أضف نموذج تواصل أو حجز قصيرًا. اختبر الإرسال والتأكيد والمتابعة على الجوال.'],
  whatsapp: ['سهّل على العملاء بدء محادثة من هواتفهم.', 'جهّز رقمًا تجاريًا وأضف زر المحادثة إلى موقعك أو ملفك وحدد من يتولى الردود.'],
  crm: ['احفظ استفسارات العملاء والتزامات المتابعة في مكان واحد.', 'حدد مراحل المسار وعيّن المسؤولين واستورد العملاء المحتملين بموافقتهم.'],
  conversion: ['اكتشف العوائق بين الزيارة والاستفسار أو البيع وأزلها.', 'راجع عرضك ودعوتك للإجراء. غيّر عنصرًا واحدًا وقِس إن كان المزيد من الزوار يتخذون الخطوة.'],
  automation: ['أجب عن الأسئلة المتكررة ووجّه الطلبات المعقدة إلى شخص.', 'اكتب إجابات معتمدة وحدد حالات التحويل واختبر الردود بأسئلة شائعة.'],
  followups: ['قلّل الاستفسارات الضائعة وتابع باستمرار.', 'حدد متى تُرسل التذكيرات وسجّل الموافقة واختبر إلغاء الاشتراك والتدخل البشري.'],
  analytics: ['اعرف أي القنوات والصفحات تؤدي إلى إجراءات مفيدة من العملاء.', 'اختر الإجراءات المهمة واضبط تتبعًا يحترم الخصوصية وتحقق من أحداث تجريبية.'],
  retention: ['سهّل عودة عملائك الحاليين.', 'اختر سببًا للعودة واختبره مع عملائك وقِس الشراء أو الحجز المتكرر.'],
  menu: ['امنح الضيوف طريقة سهلة لعرض الأصناف والأسعار الحالية على هواتفهم.', 'اجمع الفئات وأسماء الأصناف والأسعار والصور. انشر رابط QR واختبره على الجوال.'],
 },
};

// part: 1 = why it matters, 2 = how to do it.
export function guideText(capability, part, lang, original) {
 const english = missionGuide[capability]?.[part];
 const fallback = original ?? english ?? '';
 if (lang === 'en' || !L[lang]?.[capability]) return fallback;
 // Only replace the standard English text; personalized text stays as written.
 if (original !== undefined && original !== english) return original;
 return L[lang][capability][part - 1];
}
