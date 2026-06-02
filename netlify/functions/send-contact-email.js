const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_TO || "info@alkowngroup.com";
  const from = process.env.CONTACT_NOTIFY_FROM || "Alkown Website <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        skipped: true,
        message: "RESEND_API_KEY is not configured"
      })
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const { requestNumber, form = {}, client = {} } = payload;
    const name = form.name || client.full_name || "Website visitor";
    const phone = form.phone || client.phone || "";
    const whatsapp = form.whatsapp || phone;
    const email = form.email || client.email || "";
    const service = form.service || "Not selected";
    const message = form.msg || "";

    const subject = `New Alkown website request ${requestNumber || ""}`.trim();
    const text = [
      "New contact request from Alkown website",
      "",
      `Request Number: ${requestNumber || "N/A"}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `WhatsApp: ${whatsapp}`,
      `Service: ${service}`,
      "",
      "Message:",
      message
    ].join("\n");

    const html = `
      <h2>New Alkown website request</h2>
      <p><strong>Request Number:</strong> ${escapeHtml(requestNumber || "N/A")}</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
      <p><strong>Service:</strong> ${escapeHtml(service)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
        reply_to: email || undefined
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: result })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, result })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
