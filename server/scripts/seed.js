require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const connectDB = require("../config/db");
const Project = require("../models/Project");
const Admin = require("../models/Admin");

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};

async function seed() {
  console.log("🌱 Starting database seeding...");
  await connectDB();

  try {
    // 1. Seed / Upsert Admin Account
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env");
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = await Admin.findOneAndUpdate(
      { email: adminEmail.toLowerCase() },
      {
        email: adminEmail.toLowerCase(),
        passwordHash,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Admin account seeded: ${admin.email}`);

    // 2. Load projects from client/src/data/content.js
    const contentFilePath = path.resolve(__dirname, "../../client/src/data/content.js");
    let contentModule;

    if (fs.existsSync(contentFilePath)) {
      // Dynamic import of client content.js (ES Module)
      const fileUrl = require("url").pathToFileURL(contentFilePath).href;
      contentModule = await import(fileUrl);
    } else {
      throw new Error(`Could not find client content file at: ${contentFilePath}`);
    }

    const projectsData = contentModule.projects || [];
    console.log(`📦 Found ${projectsData.length} projects in client content file.`);

    for (let i = 0; i < projectsData.length; i++) {
      const p = projectsData[i];
      const projectSlug = slugify(p.title);

      // Check if project with this slug already exists
      const existing = await Project.findOne({ slug: projectSlug });
      if (existing) {
        console.log(`   ~ Skipping existing project [${i + 1}]: ${p.title} (${projectSlug})`);
        continue;
      }

      await Project.create({
        title: p.title,
        slug: projectSlug,
        description: p.description,
        techStack: p.stack || [],
        imageUrl: p.image || `/projects/${projectSlug}-placeholder.jpg`,
        liveUrl: p.liveUrl || "",
        githubUrl: p.githubUrl || "",
        featured: i < 2,
        order: i + 1,
      });
      console.log(`   + Seeded new project [${i + 1}]: ${p.title}`);
    }

    console.log("🎉 Seeding completed successfully (existing projects preserved)!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();

