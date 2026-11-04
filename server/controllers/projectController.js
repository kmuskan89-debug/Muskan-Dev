const Project = require("../models/Project");

// Helper to slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
};

// GET /api/projects - Public, sorted by order
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects - Admin only
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      description,
      techStack,
      imageUrl,
      liveUrl,
      githubUrl,
      featured,
      order,
    } = req.body;

    const projectSlug = slug || slugify(title);

    // Check duplicate slug
    const existing = await Project.findOne({ slug: projectSlug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Project with slug "${projectSlug}" already exists.`,
      });
    }

    const project = await Project.create({
      title,
      slug: projectSlug,
      description,
      techStack: Array.isArray(techStack) ? techStack : [],
      imageUrl: imageUrl || "",
      liveUrl: liveUrl || "",
      githubUrl: githubUrl || "",
      featured: Boolean(featured),
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id - Admin only
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id - Admin only
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: { id: project._id, title: project.title },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};

