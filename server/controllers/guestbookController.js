const GuestbookEntry = require("../models/GuestbookEntry");

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

module.exports = {
  getGuestbookEntries,
  createGuestbookEntry,
  approveGuestbookEntry,
};

