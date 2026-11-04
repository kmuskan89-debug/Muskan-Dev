const express = require("express");
const router = express.Router();
const {
  createMessage,
  getMessages,
  markMessageRead,
  deleteMessage,
} = require("../controllers/messageController");
const { requireAuth } = require("../middleware/auth");
const { validateContact } = require("../middleware/validators");
const { contactLimiter } = require("../middleware/rateLimiters");

// Public contact submission
router.post("/contact", contactLimiter, validateContact, createMessage);

// Protected admin endpoints
router.get("/messages", requireAuth, getMessages);
router.patch("/messages/:id/read", requireAuth, markMessageRead);
router.delete("/messages/:id", requireAuth, deleteMessage);

module.exports = router;

