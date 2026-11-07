const { Resend } = require("resend");

let resendInstance = null;
let startupWarningLogged = false;

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!apiKey || !notifyEmail) {
    if (!startupWarningLogged) {
      console.warn("⚠️ Email notifications disabled: RESEND_API_KEY or NOTIFY_EMAIL is not set in environment.");
      startupWarningLogged = true;
    }
    return null;
  }

  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// Log single startup warning if keys are missing
if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) {
  console.warn("⚠️ Email notifications disabled: RESEND_API_KEY or NOTIFY_EMAIL is not set in environment.");
  startupWarningLogged = true;
}

/**
 * Send an email notification via Resend HTTPS API.
 * Designed to be fire-and-forget; never throws.
 *
 * @param {Object} options
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email body (all user inputs must be escaped)
 * @param {string} [options.replyTo] - Sender email for direct reply-to
 * @returns {Promise<boolean>}
 */
async function sendNotification({ subject, html, replyTo }) {
  try {
    const resend = getResendClient();
    if (!resend) return false;

    const to = process.env.NOTIFY_EMAIL;
    if (!to) return false;

    // Security: sanitize subject by removing line breaks to prevent email header injection
    const sanitizedSubject = (subject || "Portfolio Notification")
      .replace(/[\r\n]+/g, " ")
      .trim();

    const payload = {
      from: "Portfolio <onboarding@resend.dev>",
      to,
      subject: sanitizedSubject,
      html,
    };

    if (replyTo && typeof replyTo === "string" && replyTo.trim() !== "") {
      payload.reply_to = replyTo.trim();
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.warn("⚠️ Email notification failed:", error.message || error.name || "Unknown Resend error");
      return false;
    }

    return true;
  } catch (err) {
    // Fire-and-forget: log only brief warning without exposing keys or full payloads
    console.warn("⚠️ Email notification error:", err.message || "Failed to dispatch email");
    return false;
  }
}

module.exports = {
  sendNotification,
  escapeHtml,
};

