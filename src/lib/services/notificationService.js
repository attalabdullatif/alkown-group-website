/**
 * Notification Service
 *
 * Abstracts all notification channels behind a single interface.
 * Currently wraps Netlify email functions. Future: SMS, WhatsApp, push.
 *
 * All methods are fire-and-forget — they log failures but never throw,
 * so a notification failure never breaks a business operation.
 */

const NETLIFY_EMAIL = "/.netlify/functions/send-contact-email";

// ─── Internal dispatcher ──────────────────────────────────────────────────────
async function dispatch(payload) {
  try {
    await fetch(NETLIFY_EMAIL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.warn("[NotificationService] delivery failed:", err.message);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * New contact / booking inquiry received.
 */
export async function notifyNewContact({ requestNumber, client, form }) {
  await dispatch({ type: "new_contact", requestNumber, client, form });
}

/**
 * Request status changed.
 */
export async function notifyStatusChange({ requestNumber, client, form, status }) {
  await dispatch({ type: "status_update", requestNumber, client, form, status });
}

/**
 * Invoice created and sent to client.
 */
export async function notifyInvoiceSent({ invoice, client }) {
  await dispatch({ type: "invoice_sent", invoice, client });
}

/**
 * Payment received.
 */
export async function notifyPaymentReceived({ payment, invoice, client }) {
  await dispatch({ type: "payment_received", payment, invoice, client });
}

/**
 * Generic notification — for future channel types (SMS, push, etc.)
 * @param {'email'|'sms'|'whatsapp'|'push'} channel
 */
export async function notify({ channel = "email", type, payload }) {
  if (channel === "email") {
    await dispatch({ type, ...payload });
    return;
  }
  // Future: route to SMS / WhatsApp / push provider
  console.info(`[NotificationService] channel '${channel}' not yet implemented for type '${type}'`);
}
