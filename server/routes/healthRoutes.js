const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : mongoose.connection.readyState === 2
        ? "connecting"
        : "disconnected",
    message: "Muskan Portfolio Backend is running",
  });
});

module.exports = router;

