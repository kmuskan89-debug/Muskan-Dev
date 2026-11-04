const mongoose = require("mongoose");

const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠️ No MongoDB URI provided.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash server in development if DB is temporarily unreachable
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

