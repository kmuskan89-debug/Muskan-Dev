const GuestbookEntry = require("../models/GuestbookEntry");
const { sendNotification, escapeHtml } = require("../utils/mailer");

// GET /api/guestbook - Public (approved entries only)
const getGuestbookEntries = async (req, res, next) => {
  try {
    const entries = await GuestbookEntry.find({ approved: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/guestbook - Public (saved with approved: false)
const createGuestbookEntry = async (req, res, next) => {
  try {
    const { name, note } = req.body;

    const entry = await GuestbookEntry.create({
      name,
      note,
      approved: false, // strictly false on creation
    });

    // Fire-and-forget notification (never blocks response or throws)
    const safeName = escapeHtml(name);
    const safeNote = escapeHtml(note).replace(/\n/g, "<br/>");

    const emailSubject = "New guestbook note awaiting approval";
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #060B16; color: #E8EDF3; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #5EEAD4; margin-top: 0; font-size: 20px;">New Guestbook Note</h2>
        <p style="color: #8A97AB; font-size: 14px;">A new visitor left a message in your portfolio guestbook that is awaiting moderation:</p>
        <div style="background: #0E1626; padding: 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Author:</strong> ${safeName}</p>
          <strong style="color: #8A97AB; display: block; margin-bottom: 6px;">Note:</strong>
          <p style="margin: 0; font-style: italic; color: #CBD5E1;">"${safeNote}"</p>
        </div>
        <p style="font-size: 13px; color: #8A97AB;">
          Log into your private Admin Console (<code style="color: #4DA3FF;">/admin</code>) to review and approve this note.
        </p>
      </div>
    `;

    sendNotification({
      subject: emailSubject,
      html: emailHtml,
    }).catch((err) => {
      console.warn("⚠️ Notification dispatch warning:", err.message || "Failed to send");
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your note has been submitted for moderation and will appear once approved.",
      data: {
        id: entry._id,
        name: entry.name,
        approved: entry.approved,
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/guestbook/:id/approve - Admin only
const approveGuestbookEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved = true } = req.body;

    const entry = await GuestbookEntry.findByIdAndUpdate(
      id,
      { approved: Boolean(approved) },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Guestbook entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Guestbook entry ${entry.approved ? "approved" : "unapproved"} successfully`,
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/guestbook/admin/all - Admin only (all entries, pending first)
const getAllGuestbookEntriesAdmin = async (req, res, next) => {
  try {
    const entries = await GuestbookEntry.find().sort({
      approved: 1, // false (pending) comes before true (approved)
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/guestbook/:id - Admin only
const deleteGuestbookEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await GuestbookEntry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Guestbook entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Guestbook entry deleted successfully",
      data: { id: entry._id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuestbookEntries,
  createGuestbookEntry,
  approveGuestbookEntry,
  getAllGuestbookEntriesAdmin,
  deleteGuestbookEntry,
};

