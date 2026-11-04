const Message = require("../models/Message");

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

module.exports = {
  createMessage,
  getMessages,
  markMessageRead,
};

