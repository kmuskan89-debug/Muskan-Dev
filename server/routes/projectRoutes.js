const express = require("express");
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { requireAuth } = require("../middleware/auth");
const { validateProject, validateProjectUpdate } = require("../middleware/validators");

// Public
router.get("/", getProjects);

// Protected (Admin only)
router.post("/", requireAuth, validateProject, createProject);
router.put("/:id", requireAuth, validateProjectUpdate, updateProject);
router.delete("/:id", requireAuth, deleteProject);

module.exports = router;
