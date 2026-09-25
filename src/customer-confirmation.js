const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "AuraDigital <noreply@auradigitalworks.com>";
const REPLY_TO = "info@auradigitalworks.com";

const COPY = {
  tr: {
    subject: "Talebinizi aldık — AuraDigital",
    eyebrow: "TALEBİNİZ ALINDI",
    title: "Teşekkürler. Talebinizi işleme aldık.",
    body: "Mesajınız AuraDigital ekibine ulaştı. İhtiyacınızı inceliyoruz ve mümkün olan en kısa sürede sizinle iletişime geçeceğiz.",
    service: "Talep",
    reference: "Referans",
    note: "Bu otomatik bir bilgilendirme e-postasıdır. Bu adrese yanıt vermeniz gerekmez.",
    contact: "Bize ulaşın",
  },
  en: {
    subject: "We received your request — AuraDigital",
    eyebrow: "REQUEST RECEIVED",
    title: "Thank you. We’re processing your request.",
    body: "Your message has reached the AuraDigital team. We’re reviewing your request and will get back to you as soon as possible.",
    service: "Request",
    reference: "Reference",
    note: "This is an automatic confirmation email. You do not need to reply to this address.",
    contact: "Contact us",
  },
  ar: {
    subject: "تم استلام طلبك — AuraDigital",
    eyebrow: "تم استلام الطلب",
    title: "شكراً لك. بدأنا معالجة طلبك.",
    body: "وصلت رسالتك إلى فريق AuraDigital. نقوم الآن بمراجعة طلبك وسنتواصل معك في أقرب وقت ممكن.",
    service: "الطلب",
    reference: "المرجع",
    note: "هذه رسالة تأكيد تلقائية. لا حاجة للرد على هذا العنوان.",
    contact: "تواصل معنا",
  },
};

export async function sendCustomerConfirmation(env, data) {
  const apiKey = clean(env.RESEND_API_KEY, 300);
  const email = clean(data.email, 254).toLowerCase();
  const requestId = clean(data.requestId, 80);

  if (!apiKey) {
    console.warn(JSON.stringify({
      message: "Customer confirmation email is not configured",
      requestId,
      reason: "missing_resend_api_key",
    }));
    return { sent: false, reason: "not_configured" };
  }
  if (!validEmail(email)) {
    return { sent: false, reason: "invalid_email" };
  }

  try {
    const id = await sendConfirmation(apiKey, { ...data, email, requestId });
    console.log(JSON.stringify({
      message: "Customer confirmation email accepted by Resend",
      requestId,
      messageId: id,
    }));
    return { sent: true, messageId: id };
  } catch (error) {
    console.error(JSON.stringify({
      message: "Customer confirmation email failed",
      requestId,
      error: clean(error?.message, 180) || "customer_confirmation_delivery_failed",
    }));
    return { sent: false, reason: "provider_rejected", detail: clean(error?.message, 180) || "Resend rejected the request." };
  }
}

async function sendConfirmation(apiKey, data) {
  const lang = ["tr", "en", "ar"].includes(data.language) ? data.language : "tr";
  const copy = COPY[lang];
  const name = clean(data.name, 120);
  const service = clean(data.service, 120);
  const requestId = clean(data.requestId, 80);
  const safeName = escapeHtml(name || "AuraDigital client");
  const safeService = escapeHtml(service || "Project");
  const safeRequestId = escapeHtml(requestId);
  const dir = lang === "ar" ? "rtl" : "ltr";

  const html = [
    `<div dir="${dir}" style="margin:0;background:#f4f5ef;padding:32px 16px;font-family:Arial,sans-serif;color:#10231b">`,
    '<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #e5e8dd">',
    '<div style="padding:26px 30px;background:#10231b;color:#ffffff">',
    '<div style="font-size:22px;font-weight:800;letter-spacing:-.02em">AuraDigital</div>',
    `<div style="margin-top:10px;font-size:11px;letter-spacing:.16em;opacity:.68">${escapeHtml(copy.eyebrow)}</div>`,
    '</div>',
    '<div style="padding:32px 30px">',
    `<p style="margin:0 0 8px;font-size:15px;color:#69766e">${safeName},</p>`,
    `<h1 style="margin:0 0 16px;font-size:30px;line-height:1.12;letter-spacing:-.035em">${escapeHtml(copy.title)}</h1>`,
    `<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#53635c">${escapeHtml(copy.body)}</p>`,
    '<div style="background:#f4f7f2;border-radius:16px;padding:18px 20px">',
    `<div style="font-size:13px;color:#69766e;margin-bottom:7px"><strong style="color:#10231b">${escapeHtml(copy.service)}:</strong> ${safeService}</div>`,
    `<div style="font-size:13px;color:#69766e"><strong style="color:#10231b">${escapeHtml(copy.reference)}:</strong> ${safeRequestId}</div>`,
    '</div>',
    `<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#7a877f">${escapeHtml(copy.note)}</p>`,
    `<p style="margin:18px 0 0"><a href="https://auradigitalworks.com/contact" style="color:#10231b;font-weight:700;text-decoration:none">${escapeHtml(copy.contact)} →</a></p>`,
    '</div>',
    '<div style="padding:18px 30px;border-top:1px solid #edf0e8;font-size:12px;color:#87928b">auradigitalworks.com · info@auradigitalworks.com</div>',
    '</div></div>',
  ].join("");

  const text = [
    name ? `${name},` : "",
    copy.title,
    "",
    copy.body,
    "",
    `${copy.service}: ${service || "Project"}`,
    `${copy.reference}: ${requestId}`,
    "",
    copy.note,
    "https://auradigitalworks.com/contact",
  ].filter(Boolean).join("\n");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact-confirmation/${requestId}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [data.email],
      subject: copy.subject,
      html,
      text,
      reply_to: REPLY_TO,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = clean(result?.message || result?.error || "resend_send_failed", 180);
    throw new Error(message);
  }
  return clean(result?.id, 120);
}

function clean(value, max) {
  return typeof value === "string"
    ? value.replace(/[\r\n\t]+/g, " ").trim().slice(0, max)
    : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
