const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FROM = "AuraDigital <noreply@auradigitalworks.com>";

export async function checkResendHealth(env) {
  const apiKey = clean(env.RESEND_API_KEY, 300);
  if (!apiKey) {
    return {
      configured: false,
      apiKeyValid: false,
      domainFound: false,
      domainVerified: false,
      detail: "missing_resend_api_key",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        configured: true,
        apiKeyValid: false,
        domainFound: false,
        domainVerified: false,
        detail: clean(result?.message || result?.error || `resend_http_${response.status}`, 180),
      };
    }

    const domains = Array.isArray(result?.data) ? result.data : [];
    const domain = domains.find((item) =>
      String(item?.name || "").toLowerCase() === "auradigitalworks.com"
    );
    const status = clean(domain?.status, 40).toLowerCase();
    return {
      configured: true,
      apiKeyValid: true,
      domainFound: Boolean(domain),
      domainVerified: status === "verified",
      domainStatus: status || null,
      detail: domain ? null : "domain_not_found_in_this_resend_account",
    };
  } catch {
    return {
      configured: true,
      apiKeyValid: false,
      domainFound: false,
      domainVerified: false,
      detail: "resend_health_request_failed",
    };
  }
}

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
    return { sent: false, reason: "provider_rejected", definitive: Boolean(error?.definitive) };
  }
}

export function renderCustomerConfirmation(data) {
  const name = clean(data.name, 120) || "Customer";
  const service = clean(data.service, 120) || "Project enquiry";
  const requestId = clean(data.requestId, 80);
  const submitted = clean(data.submittedAt, 80);
  const lines = [
    `Hello ${name},`, "", "Thank you for contacting AuraDigital!", "",
    "We’ve successfully received your request.", "",
    "Our team will review the information you’ve provided and get back to you using your contact details.", "",
    "Request details", `Reference: ${requestId}`, `Service: ${service}`,
    `Submitted: ${submitted}`, "Status: Received", "",
    "If you need to provide additional information, please contact us through our official website.", "",
    "Thank you for choosing AuraDigital.", "", "AuraDigital Team", "Digital Growth Studio",
    "Istanbul, Türkiye", "https://auradigitalworks.com", "",
    "This is an automated confirmation. Please do not reply directly to this email.",
  ];
  const e = escapeHtml;
  const html = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>Request received</title></head>
<body style="margin:0;background:#07180f;font-family:Arial,Helvetica,sans-serif;color:#10231b">
<table role="presentation" style="width:100%;border-collapse:collapse"><tr><td style="padding:24px 12px">
<table role="presentation" style="width:100%;max-width:620px;margin:auto;border-collapse:collapse;background:#ffffff">
<tr><td style="padding:24px;background:#10231b;color:white;border-bottom:4px solid #E1E100">
<img src="https://auradigitalworks.com/auradigital-logo-20260928.png" width="112" alt="AuraDigital logo" style="display:block;height:auto;border:0;margin-bottom:16px">
<span style="font-size:24px;font-weight:bold">AuraDigital</span><br><span style="font-size:12px;color:#E1E100">REQUEST RECEIVED</span></td></tr>
<tr><td style="padding:24px;font-size:16px;line-height:1.65">
<p>Hello ${e(name)},</p><h1 style="font-size:26px;line-height:1.3">Thank you for contacting AuraDigital!</h1>
<p>We’ve successfully received your request.</p><p>Our team will review the information you’ve provided and get back to you using your contact details.</p>
<h2 style="font-size:18px">Request details</h2>
<table style="width:100%;background:#f4f7f2;border-collapse:collapse;font-size:14px;table-layout:fixed">
${[["Reference",requestId],["Service",service],["Submitted",submitted],["Status","Received"]].map(([label,value])=>`<tr><th scope="row" style="width:30%;text-align:left;padding:10px;vertical-align:top">${e(label)}</th><td style="padding:10px;overflow-wrap:anywhere">${e(value)}</td></tr>`).join("")}</table>
<p>If you need to provide additional information, please contact us through our <a href="https://auradigitalworks.com/contact" style="color:#10231b">official website</a>.</p>
<p>Thank you for choosing AuraDigital.</p><p><strong>AuraDigital Team</strong><br>Digital Growth Studio<br>Istanbul, Türkiye<br><a href="https://auradigitalworks.com" style="color:#10231b">https://auradigitalworks.com</a></p>
<p style="font-size:12px;color:#53635c;border-top:1px solid #e5e8dd;padding-top:16px">This is an automated confirmation. Please do not reply directly to this email.</p>
</td></tr></table></td></tr></table></body></html>`;
  return { from: FROM, to: [data.email], subject: "We’ve Received Your Request — AuraDigital", html, text: lines.join("\n") };
}

async function sendConfirmation(apiKey, data) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact-confirmation/${data.requestId}`,
    },
    body: JSON.stringify(data.message || renderCustomerConfirmation(data)),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.id) {
    // Log a bounded code, never the provider body (which may contain PII).
    const error = new Error(`resend_http_${response.status}`);
    error.definitive = !response.ok && response.status !== 408 && response.status !== 409 && response.status < 500;
    throw error;
  }
  return clean(result.id, 120);
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
