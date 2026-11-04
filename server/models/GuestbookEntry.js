const mongoose = require("mongoose");

const guestbookEntrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    note: {
      type: String,
      required: [true, "Note is required"],
      trim: true,
      maxlength: 1000,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

guestbookEntrySchema.index({ approved: 1, createdAt: -1 });

module.exports = mongoose.model("GuestbookEntry", guestbookEntrySchema);

