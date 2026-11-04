const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// POST /api/auth/login
const loginAdmin = async (req, res, next) => {
  try {
    const rawEmail = req.body.email;
    const rawPassword = req.body.password;

    if (!rawEmail || !rawPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Lowercase and trim the submitted email before database lookup
    const email = String(rawEmail).trim().toLowerCase();
    const password = typeof rawPassword === "string" ? rawPassword.trim() : String(rawPassword);

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare with the exact same bcrypt method used for hashing
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "JWT configuration error on server",
      });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      jwtSecret,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      message: "Admin authenticated successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
};

