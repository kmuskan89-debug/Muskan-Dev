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

// Helper to generate a guaranteed unique slug (adds -2, -3 if exists)
const generateUniqueSlug = async (title, currentId = null) => {
  const baseSlug = slugify(title) || "project";
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const query = { slug };
    if (currentId) {
      query._id = { $ne: currentId };
    }
    const existing = await Project.findOne(query);
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
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
      description,
      techStack,
      imageUrl,
      liveUrl,
      githubUrl,
      featured,
      order,
    } = req.body;

    // Auto-generate unique slug
    const projectSlug = await generateUniqueSlug(title);

    // Default order to end of list if not given
    let projectOrder = Number(order);
    if (order === undefined || order === null || isNaN(projectOrder) || order === "") {
      const highest = await Project.findOne().sort({ order: -1 }).select("order");
      projectOrder = highest && typeof highest.order === "number" ? highest.order + 1 : 1;
    }

    // Limit techStack to 12 tags
    let cleanTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === "string"
      ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (cleanTechStack.length > 12) {
      cleanTechStack = cleanTechStack.slice(0, 12);
    }

    const project = await Project.create({
      title: title.trim(),
      slug: projectSlug,
      description: description.trim(),
      techStack: cleanTechStack,
      imageUrl: (imageUrl || "").trim(),
      liveUrl: (liveUrl || "").trim(),
      githubUrl: (githubUrl || "").trim(),
      featured: Boolean(featured),
      order: projectOrder,
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

// PATCH /api/projects/reorder - Admin only
const reorderProjects = async (req, res, next) => {
  try {
    const ids = req.body.ids || req.body.projectIds;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "An array of project IDs is required for reordering.",
      });
    }

    // Update order for each project sequentially or in parallel
    const updatePromises = ids.map((id, index) =>
      Project.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
    );

    await Promise.all(updatePromises);

    const reordered = await Project.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Projects reordered successfully",
      count: reordered.length,
      data: reordered,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id - Admin only
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      techStack,
      imageUrl,
      liveUrl,
      githubUrl,
      featured,
      order,
    } = req.body;

    const updateData = {};
    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = slugify(title);
    }
    if (description !== undefined) updateData.description = description;
    if (techStack !== undefined) {
      updateData.techStack = Array.isArray(techStack)
        ? techStack
        : String(techStack)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (order !== undefined) updateData.order = Number(order);

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
  reorderProjects,
};

