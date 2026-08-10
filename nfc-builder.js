(function () {
  const copy = {
    tr: {back:"← NFC",kicker:"NFC kart tasarım stüdyosu",title:"Kartınızı hazırlayın, tasarımı canlı görün.",intro:"Şimdilik Google yorum ve web sitesi kartı hazırlayabilirsiniz. Menü kartı daha sonra eklenecek.",workflowDesign:"Tasarla",workflowRequest:"Talep gönder",workflowApprove:"Ödeme + onay",workflowProduction:"Üretime hazır",typeTitle:"Kartın amacı",typeHelp:"Kart dokunulduğunda hangi bağlantı açılsın?",reviewsTitle:"Google yorum kartı",reviewsHelp:"Müşteriyi doğrudan yorum sayfasına gönderir.",websiteTitle:"Web sitesi kartı",websiteHelp:"İşletmenizin web sitesini tek dokunuşla açar.",contentTitle:"Kart üzerindeki bilgiler",contentHelp:"Yazdıklarınız sağdaki tasarımda anında görünür.",business:"İşletme / marka adı *",cardLanguage:"Kart dili",headline:"Ana mesaj",instruction:"Kısa açıklama",reviewUrl:"Google yorum bağlantısı *",websiteUrl:"Web sitesi bağlantısı *",designTitle:"Renk ve görünüm",designHelp:"Markanıza yakın bir hazır palet seçin veya renkleri tek tek değiştirin.",backgroundColor:"Zemin",accentColor:"Vurgu",textColor:"Yazı",finish:"Yüzey",matte:"Mat",glossy:"Parlak",showQr:"Arka yüzde QR yedeği göster",quantity:"Kart adedi *",contactTitle:"İletişim ve talep",contactHelp:"Tasarım onayı ve ödeme bilgisi için size ulaşabilelim.",contactName:"Yetkili adı *",contactPhone:"Telefon / WhatsApp *",email:"E-posta",city:"Şehir",paymentReference:"Ödeme referansı (varsa)",notes:"Ek not",notesPlaceholder:"Logo yerleşimi, teslimat veya tasarım notlarınız...",pendingNote:"Talep önce kırmızı / beklemede görünür. Ödeme ve tasarım onayından sonra yeşile döner.",submit:"Tasarım talebi gönder",sending:"Gönderiliyor…",livePreview:"Canlı önizleme",physicalSize:"85.6 × 54 mm kart oranı",front:"Ön yüz",backSide:"Arka yüz",qrMock:"QR görseli tasarım önizlemesidir.",previewNote:"Bu önizleme tasarım kararını gösterir. Baskı dosyası onaydan sonra AuraDigital tarafından hazırlanır.",received:"Talebiniz alındı",successTitle:"NFC kart tasarımınız incelemeye gönderildi.",successText:"Talep şu anda kırmızı / beklemede. Ödeme kontrolü ve tasarım onayından sonra yeşil görünecek.",openStatus:"Talep durumunu aç",close:"Kapat",missingLink:"Bağlantınızı girin",error:"Talep gönderilemedi. Lütfen tekrar deneyin.",reviewDefault:"Bizi Google'da değerlendirin",websiteDefault:"Web sitemizi ziyaret edin",instructionDefault:"Telefonunuzu karta yaklaştırın veya QR kodu tarayın.",reviewType:"GOOGLE REVIEWS",websiteType:"WEBSITE",matteBadge:"MAT",glossyBadge:"PARLAK"},
    en: {back:"← NFC",kicker:"NFC card design studio",title:"Build your card and preview it live.",intro:"For now you can create Google review and website cards. Menu cards will be added later.",workflowDesign:"Design",workflowRequest:"Send request",workflowApprove:"Payment + approval",workflowProduction:"Production ready",typeTitle:"Card purpose",typeHelp:"Which link should open when someone taps the card?",reviewsTitle:"Google review card",reviewsHelp:"Sends customers directly to your review page.",websiteTitle:"Website card",websiteHelp:"Opens your business website with one tap.",contentTitle:"Card details",contentHelp:"Everything you type appears instantly in the preview.",business:"Business / brand name *",cardLanguage:"Card language",headline:"Main message",instruction:"Short instruction",reviewUrl:"Google review link *",websiteUrl:"Website link *",designTitle:"Colors and finish",designHelp:"Choose a ready palette or adjust each color to match your brand.",backgroundColor:"Background",accentColor:"Accent",textColor:"Text",finish:"Finish",matte:"Matte",glossy:"Glossy",showQr:"Show a QR backup on the back",quantity:"Number of cards *",contactTitle:"Contact and request",contactHelp:"We will use these details for design approval and payment.",contactName:"Contact name *",contactPhone:"Phone / WhatsApp *",email:"Email",city:"City",paymentReference:"Payment reference (if available)",notes:"Extra notes",notesPlaceholder:"Logo placement, delivery or design notes...",pendingNote:"The request starts red / pending. It turns green after payment and design approval.",submit:"Send design request",sending:"Sending…",livePreview:"Live preview",physicalSize:"85.6 × 54 mm card ratio",front:"Front",backSide:"Back",qrMock:"The QR graphic is a design preview.",previewNote:"This preview shows the design direction. AuraDigital prepares the print file after approval.",received:"Request received",successTitle:"Your NFC card design was sent for review.",successText:"The request is currently red / pending. It will turn green after payment verification and design approval.",openStatus:"Open request status",close:"Close",missingLink:"Enter your link",error:"The request could not be sent. Please try again.",reviewDefault:"Review us on Google",websiteDefault:"Visit our website",instructionDefault:"Tap your phone on the card or scan the QR code.",reviewType:"GOOGLE REVIEWS",websiteType:"WEBSITE",matteBadge:"MATTE",glossyBadge:"GLOSSY"},
    ar: {back:"NFC ←",kicker:"استوديو تصميم بطاقات NFC",title:"صمّم بطاقتك وشاهدها مباشرة.",intro:"يمكنك الآن إنشاء بطاقة تقييم Google أو بطاقة موقع. ستُضاف بطاقة القائمة لاحقاً.",workflowDesign:"تصميم",workflowRequest:"إرسال الطلب",workflowApprove:"الدفع والموافقة",workflowProduction:"جاهزة للإنتاج",typeTitle:"هدف البطاقة",typeHelp:"أي رابط يفتح عند لمس البطاقة؟",reviewsTitle:"بطاقة تقييم Google",reviewsHelp:"توجّه العميل مباشرة إلى صفحة التقييم.",websiteTitle:"بطاقة الموقع",websiteHelp:"تفتح موقع نشاطك بلمسة واحدة.",contentTitle:"بيانات البطاقة",contentHelp:"تظهر كتابتك فوراً في المعاينة.",business:"اسم النشاط / العلامة *",cardLanguage:"لغة البطاقة",headline:"الرسالة الرئيسية",instruction:"تعليمات قصيرة",reviewUrl:"رابط تقييم Google *",websiteUrl:"رابط الموقع *",designTitle:"الألوان والسطح",designHelp:"اختر لوحة جاهزة أو عدّل كل لون ليلائم علامتك.",backgroundColor:"الخلفية",accentColor:"لون التمييز",textColor:"النص",finish:"السطح",matte:"مطفي",glossy:"لامع",showQr:"إظهار QR احتياطي على الخلف",quantity:"عدد البطاقات *",contactTitle:"التواصل والطلب",contactHelp:"سنستخدم هذه البيانات لاعتماد التصميم والدفع.",contactName:"اسم المسؤول *",contactPhone:"الهاتف / واتساب *",email:"البريد",city:"المدينة",paymentReference:"مرجع الدفع إن وجد",notes:"ملاحظات إضافية",notesPlaceholder:"مكان الشعار أو التسليم أو ملاحظات التصميم...",pendingNote:"يبدأ الطلب بالأحمر / قيد الانتظار، ويصبح أخضر بعد الدفع والموافقة.",submit:"إرسال طلب التصميم",sending:"جارٍ الإرسال…",livePreview:"معاينة مباشرة",physicalSize:"نسبة بطاقة 85.6 × 54 مم",front:"الوجه",backSide:"الخلف",qrMock:"رمز QR هنا للمعاينة التصميمية.",previewNote:"تعرض المعاينة اتجاه التصميم. تجهز AuraDigital ملف الطباعة بعد الموافقة.",received:"تم استلام طلبك",successTitle:"أُرسل تصميم بطاقة NFC للمراجعة.",successText:"الطلب الآن أحمر / قيد الانتظار وسيصبح أخضر بعد تأكيد الدفع والتصميم.",openStatus:"فتح حالة الطلب",close:"إغلاق",missingLink:"أدخل الرابط",error:"تعذر إرسال الطلب. حاول مجدداً.",reviewDefault:"قيّمنا على Google",websiteDefault:"زر موقعنا",instructionDefault:"المس البطاقة بهاتفك أو امسح رمز QR.",reviewType:"تقييم GOOGLE",websiteType:"الموقع",matteBadge:"مطفي",glossyBadge:"لامع"}
  };

  const form = document.getElementById("nfcForm");
  const fields = form.elements;
  const supported = ["tr", "en", "ar"];
  const stored = (() => { try { return localStorage.getItem("aura-nfc-lang"); } catch { return null; } })();
  let language = supported.includes(new URLSearchParams(location.search).get("lang")) ? new URLSearchParams(location.search).get("lang") : supported.includes(stored) ? stored : "tr";
  let previousDefaults = { headline: copy.tr.reviewDefault, instruction: copy.tr.instructionDefault };

  function currentType() { return form.querySelector('[name="cardType"]:checked').value; }
  function setLanguage(next) {
    if (!supported.includes(next)) return;
    const oldHeadline = previousDefaults.headline;
    const oldInstruction = previousDefaults.instruction;
    language = next;
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((element) => { const value = copy[next][element.dataset.i18n]; if (value) element.textContent = value; });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { const value = copy[next][element.dataset.i18nPlaceholder]; if (value) element.placeholder = value; });
    document.querySelectorAll("[data-ui-lang]").forEach((button) => button.classList.toggle("active", button.dataset.uiLang === next));
    try { localStorage.setItem("aura-nfc-lang", next); } catch {}
    if (fields.cardLanguage.value === previousDefaults.language || !previousDefaults.language) fields.cardLanguage.value = next;
    const defaults = typeDefaults(currentType());
    if (!fields.headline.value || fields.headline.value === oldHeadline) fields.headline.value = defaults.headline;
    if (!fields.instructionText.value || fields.instructionText.value === oldInstruction) fields.instructionText.value = defaults.instruction;
    previousDefaults = { ...defaults, language: next };
    document.title = next === "tr" ? "NFC Kart Tasarla — AuraDigital" : next === "en" ? "Design an NFC Card — AuraDigital" : "صمّم بطاقة NFC — AuraDigital";
    updatePreview();
  }

  function typeDefaults(type) {
    return { headline: type === "reviews" ? copy[language].reviewDefault : copy[language].websiteDefault, instruction: copy[language].instructionDefault };
  }

  function setType(type) {
    const old = previousDefaults.headline;
    const defaults = typeDefaults(type);
    if (!fields.headline.value || fields.headline.value === old) fields.headline.value = defaults.headline;
    previousDefaults = { ...defaults, language };
    const destinationLabel = document.getElementById("destinationLabel");
    destinationLabel.dataset.i18n = type === "reviews" ? "reviewUrl" : "websiteUrl";
    destinationLabel.textContent = copy[language][destinationLabel.dataset.i18n];
    fields.destinationUrl.placeholder = type === "reviews" ? "https://g.page/r/.../review" : "https://example.com";
    updatePreview();
  }

  function setCardColors() {
    const values = [fields.backgroundColor.value, fields.accentColor.value, fields.textColor.value];
    [document.getElementById("cardFront"), document.getElementById("cardBack")].forEach((card) => {
      card.style.setProperty("--card-bg", values[0]);
      card.style.setProperty("--card-accent", values[1]);
      card.style.setProperty("--card-text", values[2]);
      card.classList.toggle("glossy", fields.finish.value === "glossy");
    });
  }

  function safeHost(value) {
    try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return copy[language].missingLink; }
  }

  function drawQr(text) {
    const canvas = document.getElementById("qrPreview");
    const context = canvas.getContext("2d");
    const size = 21;
    const unit = canvas.width / size;
    let seed = 2166136261;
    for (const character of text || "auradigital") seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#101516";
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) if (random() > .52) context.fillRect(Math.floor(x * unit), Math.floor(y * unit), Math.ceil(unit), Math.ceil(unit));
    [[1,1],[13,1],[1,13]].forEach(([x,y]) => { context.fillStyle="#101516";context.fillRect(x*unit,y*unit,7*unit,7*unit);context.fillStyle="#fff";context.fillRect((x+1)*unit,(y+1)*unit,5*unit,5*unit);context.fillStyle="#101516";context.fillRect((x+2)*unit,(y+2)*unit,3*unit,3*unit); });
  }

  function updatePreview() {
    const type = currentType();
    const headline = fields.headline.value.trim() || typeDefaults(type).headline;
    document.getElementById("previewBrand").textContent = fields.businessName.value.trim() || "Aura Coffee";
    document.getElementById("previewHeadline").textContent = headline;
    document.getElementById("backHeadline").textContent = headline;
    document.getElementById("previewInstruction").textContent = fields.instructionText.value.trim() || typeDefaults(type).instruction;
    document.getElementById("previewIcon").textContent = type === "reviews" ? "★" : "↗";
    document.getElementById("previewType").textContent = type === "reviews" ? copy[language].reviewType : copy[language].websiteType;
    document.getElementById("previewHost").textContent = safeHost(fields.destinationUrl.value);
    document.getElementById("finishBadge").textContent = fields.finish.value === "glossy" ? copy[language].glossyBadge : copy[language].matteBadge;
    document.getElementById("cardBack").classList.toggle("qr-hidden", !fields.showQr.checked);
    setCardColors();
    drawQr(fields.destinationUrl.value);
  }

  document.querySelectorAll("[data-ui-lang]").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.uiLang)));
  form.querySelectorAll('[name="cardType"]').forEach((input) => input.addEventListener("change", () => setType(input.value)));
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
  document.querySelectorAll("[data-palette]").forEach((button) => button.addEventListener("click", () => {
    const [background, accent, text] = button.dataset.palette.split(",");
    fields.backgroundColor.value = background; fields.accentColor.value = accent; fields.textColor.value = text;
    document.querySelectorAll("[data-palette]").forEach((item) => item.classList.toggle("active", item === button));
    updatePreview();
  }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = document.getElementById("submitButton");
    const notice = document.getElementById("formNotice");
    button.disabled = true;
    button.querySelector("span").textContent = copy[language].sending;
    notice.textContent = ""; notice.className = "form-notice";
    const payload = {
      cardType: currentType(), cardLanguage: fields.cardLanguage.value, businessName: fields.businessName.value,
      headline: fields.headline.value, instructionText: fields.instructionText.value, destinationUrl: fields.destinationUrl.value,
      backgroundColor: fields.backgroundColor.value, accentColor: fields.accentColor.value, textColor: fields.textColor.value,
      finish: fields.finish.value, showQr: fields.showQr.checked, quantity: Number(fields.quantity.value),
      contactName: fields.contactName.value, contactPhone: fields.contactPhone.value, email: fields.email.value,
      city: fields.city.value, paymentReference: fields.paymentReference.value, notes: fields.notes.value
    };
    try {
      const response = await fetch("/api/nfc/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || copy[language].error);
      const statusLink = document.getElementById("statusLink");
      statusLink.href = `nfc-status.html?id=${encodeURIComponent(data.request.id)}&lang=${language}`;
      try { localStorage.setItem("aura-nfc-last-request", data.request.id); } catch {}
      location.href = statusLink.href;
    } catch (error) {
      notice.className = "form-notice error";
      notice.textContent = error.message || copy[language].error;
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = copy[language].submit;
    }
  });
  document.getElementById("closeSuccess").addEventListener("click", () => { document.getElementById("successPanel").hidden = true; });
  setLanguage(language);
  setType(currentType());
})();
