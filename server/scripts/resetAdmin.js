const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

async function resetAdmin() {
  const rawEmail = process.env.ADMIN_EMAIL;
  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!rawEmail || !rawEmail.trim()) {
    console.error("❌ ADMIN_EMAIL is missing in server/.env");
    process.exit(1);
  }

  if (!rawPassword || !rawPassword.trim()) {
    console.error("❌ ADMIN_PASSWORD is missing in server/.env");
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  try {
    await connectDB();

    // Remove any conflicting or stale admin documents
    await Admin.deleteMany({ email: { $ne: email } });

    // Generate fresh salt and hash
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Upsert the single admin document
    const admin = await Admin.findOneAndUpdate(
      { email },
      { email, passwordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Verify password check
    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    console.log(`Admin reset: ${admin.email}, password check: ${isMatch ? "OK" : "FAILED"}`);

    await mongoose.connection.close();
    process.exit(isMatch ? 0 : 1);
  } catch (err) {
    console.error("❌ Error resetting admin:", err.message);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
}

resetAdmin();

