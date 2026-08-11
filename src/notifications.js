const NOTIFICATION_SENDER = {
  email: "notifications@auradigital.ink",
  name: "AuraDigital",
};

export function queueRequestNotification(ctx, env, notification) {
  const recipient = cleanLine(env.NOTIFICATION_EMAIL, 254).toLowerCase();
  const requestId = cleanLine(notification.requestId, 80);
  const requestType = cleanLine(notification.requestType, 80);

  if (!recipient || !env.REQUEST_NOTIFICATIONS) {
    console.warn(JSON.stringify({
      message: "Request email notification is not configured",
      requestId,
      requestType,
    }));
    return;
  }

  ctx.waitUntil(
    sendRequestNotification(env.REQUEST_NOTIFICATIONS, recipient, notification)
      .then((result) => {
        console.log(JSON.stringify({
          message: "Request email notification sent",
          requestId,
          requestType,
          messageId: result.messageId,
        }));
      })
      .catch((error) => {
        console.error(JSON.stringify({
          message: "Request email notification failed",
          requestId,
          requestType,
          error: error instanceof Error ? error.message : String(error),
        }));
      }),
  );
}

async function sendRequestNotification(emailBinding, recipient, notification) {
  const requestType = cleanLine(notification.requestType, 80) || "Customer";
  const businessName = cleanLine(notification.businessName, 160) || "Not provided";
  const contactName = cleanLine(notification.contactName, 160) || "Not provided";
  const customerEmail = cleanLine(notification.customerEmail, 254);
  const phone = cleanLine(notification.phone, 80);
  const requestId = cleanLine(notification.requestId, 80);
  const dashboardUrl = safeHttpsUrl(notification.dashboardUrl);
  const details = normalizeDetails(notification.details);
  const rows = [
    ["Request", requestType],
    ["Business", businessName],
    ["Contact", contactName],
    ["Phone", phone || "Not provided"],
    ["Customer email", customerEmail || "Not provided"],
    ...details,
    ["Request ID", requestId],
  ];

  const text = [
    `New ${requestType} request`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Open dashboard: ${dashboardUrl}`,
  ].join("\n");

  const htmlRows = rows.map(([label, value]) => (
    `<tr><th style="padding:8px 12px;text-align:left;vertical-align:top;color:#53635c;font-weight:600">${escapeHtml(label)}</th>` +
    `<td style="padding:8px 12px;color:#10231b">${escapeHtml(value)}</td></tr>`
  )).join("");

  const message = {
    to: recipient,
    from: NOTIFICATION_SENDER,
    subject: cleanLine(`[AuraDigital] New ${requestType} request — ${businessName}`, 180),
    text,
    html: [
      '<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#10231b">',
      `<h1 style="font-size:24px;margin:0 0 18px">New ${escapeHtml(requestType)} request</h1>`,
      '<table style="width:100%;border-collapse:collapse;background:#f4f7f2;border-radius:14px;overflow:hidden">',
      htmlRows,
      "</table>",
      `<p style="margin:22px 0 0"><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#1f5e42;color:#fff;text-decoration:none;font-weight:700">Open AuraDigital dashboard</a></p>`,
      "</div>",
    ].join(""),
  };

  if (isEmailAddress(customerEmail)) {
    message.replyTo = customerEmail;
  }

  return emailBinding.send(message);
}

function normalizeDetails(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((item) => {
    if (!Array.isArray(item) || item.length !== 2) return [];
    const label = cleanLine(item[0], 80);
    const detail = cleanLine(item[1], 240);
    return label && detail ? [[label, detail]] : [];
  });
}

function cleanLine(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLength)
    : "";
}

function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.toString() : "https://auradigital.ink/admin/";
  } catch {
    return "https://auradigital.ink/admin/";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
