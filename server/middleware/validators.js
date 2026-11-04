const { body, validationResult } = require("express-validator");

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Contact form validator
const validateContact = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("subject")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Subject cannot exceed 200 characters")
    .escape(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 5, max: 5000 })
    .withMessage("Message must be between 5 and 5000 characters")
    .escape(),
  handleValidationErrors,
];

// Guestbook entry validator
const validateGuestbook = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 80 })
    .withMessage("Name cannot exceed 80 characters")
    .escape(),
  body("note")
    .trim()
    .notEmpty()
    .withMessage("Note is required")
    .isLength({ min: 3, max: 1000 })
    .withMessage("Note must be between 3 and 1000 characters")
    .escape(),
  handleValidationErrors,
];

// Project creation/update validator
const validateProject = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Project title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must contain lowercase letters, numbers, and hyphens only"),
  body("techStack")
    .optional()
    .isArray()
    .withMessage("techStack must be an array of strings"),
  body("liveUrl")
    .optional()
    .trim(),
  body("githubUrl")
    .optional()
    .trim(),
  body("imageUrl")
    .optional()
    .trim(),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be a boolean"),
  body("order")
    .optional()
    .isNumeric()
    .withMessage("order must be a number"),
  handleValidationErrors,
];

const isValidHttpUrlOrEmpty = (value) => {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isValidImageUrlOrEmpty = (value) => {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return true;
  if (trimmed.startsWith("/")) return true; // root-relative public asset
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Project update validator (fields optional)
const validateProjectUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must contain lowercase letters, numbers, and hyphens only"),
  body("techStack")
    .optional()
    .custom((val) => Array.isArray(val) || typeof val === "string")
    .withMessage("techStack must be an array of strings or comma-separated string"),
  body("liveUrl")
    .optional()
    .custom(isValidHttpUrlOrEmpty)
    .withMessage("liveUrl must be a valid http/https URL or empty"),
  body("githubUrl")
    .optional()
    .custom(isValidHttpUrlOrEmpty)
    .withMessage("githubUrl must be a valid http/https URL or empty"),
  body("imageUrl")
    .optional()
    .custom(isValidImageUrlOrEmpty)
    .withMessage("imageUrl must be a valid http/https URL, root-relative path, or empty"),
  body("featured")
    .optional()
    .isBoolean()
    .withMessage("featured must be a boolean"),
  body("order")
    .optional()
    .isNumeric()
    .withMessage("order must be a number"),
  handleValidationErrors,
];

// Auth login validator
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

module.exports = {
  validateContact,
  validateGuestbook,
  validateProject,
  validateProjectUpdate,
  validateLogin,
  handleValidationErrors,
};
