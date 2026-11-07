const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiters");
const errorHandler = require("./middleware/errorHandler");

// Route imports
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const messageRoutes = require("./routes/messageRoutes");
const guestbookRoutes = require("./routes/guestbookRoutes");

// Fail fast in production if required environment variables are missing
if (process.env.NODE_ENV === "production") {
  const missingVars = [];
  if (!process.env.MONGO_URI) missingVars.push("MONGO_URI");
  if (!process.env.JWT_SECRET) missingVars.push("JWT_SECRET");

  if (missingVars.length > 0) {
    console.error(
      `❌ FATAL: Missing required environment variable(s) in production: ${missingVars.join(", ")}`
    );
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Render) to allow express-rate-limit to read real client IP from X-Forwarded-For
app.set("trust proxy", 1);

// Connect to MongoDB if executed directly
if (require.main === module) {
  connectDB();
}

// Security Headers with Helmet
app.use(helmet());

// CORS Configuration
const isProduction = process.env.NODE_ENV === "production";
const rawClientUrls = process.env.CLIENT_URL || "";

// Parse configured origins supporting multiple comma-separated URLs
let allowedOrigins = rawClientUrls
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (isProduction) {
  // In production: strictly no localhost origins and no wildcards
  allowedOrigins = allowedOrigins.filter(
    (origin) =>
      origin !== "*" &&
      !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
  );
}

const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Render health checks, Postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // Outside production only, allow localhost origins
    if (!isProduction && isLocalhostOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS policy blocked access from origin: ${origin}`),
      false
    );
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body Parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Express Mongo Sanitize (against NoSQL query injection)
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// Health check route - unauthenticated and exempt from rate limiting for Render health checks
app.use("/api", healthRoutes);

// Apply general rate limiter across all other /api routes
app.use("/api", generalLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/guestbook", guestbookRoutes);
app.use("/api", messageRoutes); // Mounts /api/contact and /api/messages

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    name: "Muskan Portfolio API",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server if executed directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Please check running processes.`);
    } else {
      console.error("❌ Server error:", err);
    }
  });
}

module.exports = app;
