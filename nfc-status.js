(function () {
  const translations = {
    tr:{kicker:"NFC kart talebi",pending:"Beklemede",approved:"Onaylandı",rejected:"Değişiklik gerekli",pendingTitle:"Talebiniz inceleniyor.",approvedTitle:"Tasarımınız onaylandı.",rejectedTitle:"Tasarım için değişiklik istendi.",pendingMessage:"Tasarımınız AuraDigital paneline ulaştı. Ödeme ve tasarım onayından sonra durum yeşile dönecek.",approvedMessage:"Ödeme ve tasarım onayı tamamlandı. Kartınız üretim için hazır.",rejectedMessage:"AuraDigital tasarımda bir düzenleme istemiş olabilir. Ayrıntılar için sizinle iletişime geçeceğiz.",business:"İşletme",type:"Kart türü",payment:"Ödeme",updated:"Son güncelleme",paid:"Ödendi",unpaid:"Bekliyor",reviews:"Google yorum",website:"Web sitesi",refresh:"Durumu yenile",newRequest:"Yeni tasarım hazırla",missing:"Geçerli bir talep bağlantısı bulunamadı.",notFound:"Talep bulunamadı veya bağlantı geçersiz.",loading:"Yükleniyor…",paymentTitle:"Ödeme bilgileri",amount:"Toplam",holder:"Hesap sahibi",iban:"IBAN",reference:"Havale açıklaması",copy:"IBAN'ı kopyala",copied:"IBAN kopyalandı",sendReceipt:"Dekontu WhatsApp'tan gönder",receiptHelp:"WhatsApp açıldığında dekont fotoğrafını veya PDF dosyasını mesaja manuel olarak ekleyin.",bankWarning:"Yalnızca bankanızda işlemi tamamladıktan sonra dekontu gönderin."},
    en:{kicker:"NFC card request",pending:"Pending",approved:"Approved",rejected:"Changes requested",pendingTitle:"Your request is being reviewed.",approvedTitle:"Your design is approved.",rejectedTitle:"Design changes were requested.",pendingMessage:"Your design reached the AuraDigital dashboard. It turns green after payment and design approval.",approvedMessage:"Payment and design approval are complete. Your card is ready for production.",rejectedMessage:"AuraDigital may need a design adjustment. We will contact you with the details.",business:"Business",type:"Card type",payment:"Payment",updated:"Last update",paid:"Paid",unpaid:"Pending",reviews:"Google reviews",website:"Website",refresh:"Refresh status",newRequest:"Create another design",missing:"No valid request link was found.",notFound:"The request was not found or the link is invalid.",loading:"Loading…",paymentTitle:"Payment details",amount:"Total",holder:"Account holder",iban:"IBAN",reference:"Transfer reference",copy:"Copy IBAN",copied:"IBAN copied",sendReceipt:"Send receipt on WhatsApp",receiptHelp:"When WhatsApp opens, manually attach the receipt photo or PDF to the message.",bankWarning:"Send the receipt only after completing the transfer in your banking app."},
    ar:{kicker:"طلب بطاقة NFC",pending:"قيد الانتظار",approved:"تمت الموافقة",rejected:"التعديل مطلوب",pendingTitle:"طلبك قيد المراجعة.",approvedTitle:"تمت الموافقة على التصميم.",rejectedTitle:"طُلب تعديل التصميم.",pendingMessage:"وصل تصميمك إلى لوحة AuraDigital. يصبح أخضر بعد تأكيد الدفع والتصميم.",approvedMessage:"تم تأكيد الدفع والتصميم. بطاقتك جاهزة للإنتاج.",rejectedMessage:"قد يحتاج التصميم إلى تعديل وسنتواصل معك بالتفاصيل.",business:"النشاط",type:"نوع البطاقة",payment:"الدفع",updated:"آخر تحديث",paid:"تم الدفع",unpaid:"قيد الانتظار",reviews:"تقييم Google",website:"الموقع",refresh:"تحديث الحالة",newRequest:"إنشاء تصميم جديد",missing:"لا يوجد رابط طلب صالح.",notFound:"الطلب غير موجود أو الرابط غير صالح.",loading:"جارٍ التحميل…",paymentTitle:"بيانات الدفع",amount:"المجموع",holder:"صاحب الحساب",iban:"IBAN",reference:"مرجع التحويل",copy:"نسخ IBAN",copied:"تم نسخ IBAN",sendReceipt:"إرسال الإيصال عبر واتساب",receiptHelp:"عند فتح واتساب، أرفق صورة الإيصال أو ملف PDF يدوياً.",bankWarning:"أرسل الإيصال فقط بعد إتمام التحويل في تطبيق البنك."}
  };
  const params = new URLSearchParams(location.search);
  const language = ["tr","en","ar"].includes(params.get("lang")) ? params.get("lang") : (() => { try { const stored=localStorage.getItem("aura-nfc-lang"); return ["tr","en","ar"].includes(stored)?stored:"tr"; } catch { return "tr"; } })();
  const text = translations[language];
  const requestId = params.get("id") || (() => { try { return localStorage.getItem("aura-nfc-last-request"); } catch { return ""; } })();
  const PAYMENT = Object.freeze({ iban: "TR940001009010394706205001", holder: "DHIAEDDINE MAHOUACHI", unitPrice: 700, whatsapp: "905385507674" });
  document.documentElement.lang=language;document.documentElement.dir=language==="ar"?"rtl":"ltr";
  const byId=(id)=>document.getElementById(id);
  function baseCopy(){byId("statusKicker").textContent=text.kicker;byId("businessLabel").textContent=text.business;byId("typeLabel").textContent=text.type;byId("paymentLabel").textContent=text.payment;byId("updatedLabel").textContent=text.updated;byId("refreshButton").textContent=text.refresh;byId("newRequestLink").textContent=text.newRequest;}
  function receiptMessage(request,total){
    if(language==="en") return `Hello AuraDigital, I am sending the payment receipt for my NFC order.\n\nRequest: ${requestId}\nBusiness: ${request.businessName}\nQuantity: ${request.quantity}\nTotal: ${total} TL`;
    if(language==="ar") return `مرحباً AuraDigital، أرسل إيصال دفع طلب NFC.\n\nرقم الطلب: ${requestId}\nالنشاط: ${request.businessName}\nالعدد: ${request.quantity}\nالمجموع: ${total} TL`;
    return `Merhaba AuraDigital, NFC siparişim için ödeme dekontunu gönderiyorum.\n\nTalep: ${requestId}\nİşletme: ${request.businessName}\nAdet: ${request.quantity}\nToplam: ${total} TL`;
  }
  function ensurePaymentPanel(){
    let panel=byId("paymentPanel");
    if(panel) return panel;
    panel=document.createElement("section");
    panel.id="paymentPanel";
    panel.className="payment-panel";
    panel.innerHTML='<div class="payment-panel-head"><span id="paymentPanelTitle"></span><strong id="paymentPanelAmount"></strong></div><div class="payment-row"><small id="paymentHolderLabel"></small><b id="paymentHolder"></b></div><div class="payment-row"><small id="paymentIbanLabel"></small><code id="paymentIban"></code></div><div class="payment-row"><small id="paymentReferenceLabel"></small><code id="paymentReference"></code></div><div class="payment-buttons"><button id="copyIban" type="button"></button><a id="receiptWhatsApp" target="_blank" rel="noopener noreferrer"></a></div><p id="paymentBankWarning"></p><small id="paymentReceiptHelp"></small>';
    byId("requestDetails").insertAdjacentElement("afterend",panel);
    byId("copyIban").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(PAYMENT.iban);byId("copyIban").textContent=text.copied}catch{byId("copyIban").textContent=PAYMENT.iban}});
    return panel;
  }
  function renderPayment(request){
    const panel=ensurePaymentPanel();
    panel.hidden=request.paymentStatus==="paid";
    if(panel.hidden) return;
    const quantity=Number(request.quantity)||1;
    const total=PAYMENT.unitPrice*quantity;
    byId("paymentPanelTitle").textContent=text.paymentTitle;
    byId("paymentPanelAmount").textContent=new Intl.NumberFormat(language==="ar"?"ar":language==="en"?"en":"tr-TR").format(total)+" TL";
    byId("paymentHolderLabel").textContent=text.holder;byId("paymentHolder").textContent=PAYMENT.holder;
    byId("paymentIbanLabel").textContent=text.iban;byId("paymentIban").textContent=PAYMENT.iban.replace(/(.{4})/g,"$1 ").trim();
    byId("paymentReferenceLabel").textContent=text.reference;byId("paymentReference").textContent=requestId;
    byId("copyIban").textContent=text.copy;
    byId("receiptWhatsApp").textContent=text.sendReceipt;
    byId("receiptWhatsApp").href=`https://wa.me/${PAYMENT.whatsapp}?text=${encodeURIComponent(receiptMessage(request,total))}`;
    byId("paymentBankWarning").textContent=text.bankWarning;byId("paymentReceiptHelp").textContent=text.receiptHelp;
  }
  async function load(){const notice=byId("statusNotice");if(!requestId){notice.className="form-notice error";notice.textContent=text.missing;return}byId("refreshButton").disabled=true;notice.className="form-notice";notice.textContent=text.loading;try{const response=await fetch(`/api/nfc/requests/${encodeURIComponent(requestId)}`,{headers:{Accept:"application/json"}});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(text.notFound);const request=data.request;const status=["approved","rejected"].includes(request.status)?request.status:"pending";byId("statusSignal").className=`status-signal ${status}`;byId("statusLabel").textContent=text[status];byId("statusTitle").textContent=text[`${status}Title`];byId("statusMessage").textContent=text[`${status}Message`];byId("businessValue").textContent=request.businessName;byId("typeValue").textContent=text[request.cardType]||request.cardType;byId("paymentValue").textContent=request.paymentStatus==="paid"?text.paid:text.unpaid;byId("updatedValue").textContent=new Intl.DateTimeFormat(language,{dateStyle:"medium",timeStyle:"short"}).format(new Date(request.updatedAt));byId("requestDetails").hidden=false;renderPayment(request);notice.textContent=""}catch(error){notice.className="form-notice error";notice.textContent=error.message||text.notFound}finally{byId("refreshButton").disabled=false}}
  baseCopy();byId("refreshButton").addEventListener("click",load);load();
})();
