const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../controllers/authController");
const { validateLogin } = require("../middleware/validators");
const { authLimiter } = require("../middleware/rateLimiters");

// POST /api/auth/login
router.post("/login", authLimiter, validateLogin, loginAdmin);

module.exports = router;

