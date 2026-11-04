const express = require("express");
const router = express.Router();
const {
  getGuestbookEntries,
  createGuestbookEntry,
  approveGuestbookEntry,
  getAllGuestbookEntriesAdmin,
  deleteGuestbookEntry,
} = require("../controllers/guestbookController");
const { requireAuth } = require("../middleware/auth");
const { validateGuestbook } = require("../middleware/validators");
const { guestbookLimiter } = require("../middleware/rateLimiters");

// Public: Get all approved entries
router.get("/", getGuestbookEntries);

// Public: Submit a new guestbook note (saved with approved: false)
router.post("/", guestbookLimiter, validateGuestbook, createGuestbookEntry);

// Protected: Get all entries including pending (Admin only)
router.get("/admin/all", requireAuth, getAllGuestbookEntriesAdmin);

// Protected: Approve an entry (Admin only)
router.patch("/:id/approve", requireAuth, approveGuestbookEntry);

// Protected: Delete an entry (Admin only)
router.delete("/:id", requireAuth, deleteGuestbookEntry);

module.exports = router;

