const Message = require("../models/Message");
const { sendNotification, escapeHtml } = require("../utils/mailer");

// POST /api/contact - Public
const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const savedMessage = await Message.create({
      name,
      email,
      subject: subject || "",
      message,
    });

    // Fire-and-forget email notification (never blocks response or throws)
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject || "General Inquiry");
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");
    const formattedTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const emailSubject = `New portfolio message: ${safeSubject}`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #060B16; color: #E8EDF3; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #5EEAD4; margin-top: 0; font-size: 20px;">New Portfolio Message</h2>
        <div style="background: #0E1626; padding: 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #4DA3FF;">${safeEmail}</a></p>
          <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${safeSubject}</p>
          <p style="margin: 0;"><strong>Time:</strong> ${formattedTime}</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); line-height: 1.6;">
          <strong style="color: #8A97AB; display: block; margin-bottom: 8px;">Message:</strong>
          <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #8A97AB; text-align: center;">
          Hit 'Reply' directly to respond to ${safeEmail}.
        </p>
      </div>
    `;

    sendNotification({
      subject: emailSubject,
      html: emailHtml,
      replyTo: email,
    }).catch((err) => {
      console.warn("⚠️ Notification dispatch warning:", err.message || "Failed to send");
    });

    res.status(201).json({
      success: true,
      message: "Thank you for reaching out! Your message has been sent successfully.",
      data: {
        id: savedMessage._id,
        name: savedMessage.name,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/messages - Admin only
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/messages/:id/read - Admin only
const markMessageRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    const message = await Message.findByIdAndUpdate(
      id,
      { read: typeof read === "boolean" ? read : true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Message marked as ${message.read ? "read" : "unread"}`,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/messages/:id - Admin only
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: { id: message._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessages,
  markMessageRead,
  deleteMessage,
};

