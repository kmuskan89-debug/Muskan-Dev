const rateLimit = require("express-rate-limit");

// General API rate limiter: 120 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Stricter rate limiter for contact form submissions: 5 submissions per 15 minutes
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent. Please wait 15 minutes before sending another.",
  },
});

// Stricter rate limiter for guestbook submissions: 10 entries per 15 minutes
const guestbookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many guestbook entries submitted. Please wait 15 minutes.",
  },
});

// Stricter rate limiter for login attempts: 8 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes before trying again.",
  },
});

module.exports = {
  generalLimiter,
  contactLimiter,
  guestbookLimiter,
  authLimiter,
};

