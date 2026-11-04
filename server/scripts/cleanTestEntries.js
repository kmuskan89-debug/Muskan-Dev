require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Message = require("../models/Message");
const GuestbookEntry = require("../models/GuestbookEntry");
const Project = require("../models/Project");
const Admin = require("../models/Admin");

async function cleanup() {
  console.log("Connecting to database from MONGO_URI...");
  await mongoose.connect(process.env.MONGO_URI);

  const messagesResult = await Message.deleteMany({});
  const guestbookResult = await GuestbookEntry.deleteMany({});

  const projectsCount = await Project.countDocuments();
  const adminCount = await Admin.countDocuments();

  console.log(`✅ Deleted Messages: ${messagesResult.deletedCount}`);
  console.log(`✅ Deleted GuestbookEntries: ${guestbookResult.deletedCount}`);
  console.log(`📦 Preserved Projects count: ${projectsCount}`);
  console.log(`👤 Preserved Admin accounts: ${adminCount}`);

  await mongoose.disconnect();
  console.log("Database connection closed.");
}

cleanup().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});

