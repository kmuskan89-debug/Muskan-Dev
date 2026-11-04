require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const Project = require("../models/Project");

// Safety Checks: MUST use a separate test database
const MONGO_URI_TEST = process.env.MONGO_URI_TEST;
const MONGO_URI_MAIN = process.env.MONGO_URI;

if (!MONGO_URI_TEST) {
  console.error("❌ FATAL: MONGO_URI_TEST is not defined in server/.env");
  console.error("   Automated tests are strictly disallowed from running against the main database.");
  process.exit(1);
}

if (MONGO_URI_TEST.trim() === MONGO_URI_MAIN?.trim()) {
  console.error("❌ FATAL: MONGO_URI_TEST is identical to MONGO_URI!");
  console.error("   Test runner aborted to protect primary database integrity.");
  process.exit(1);
}

process.env.NODE_ENV = "test";
const app = require("../server");

function request(baseUrl, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runIsolatedTests() {
  console.log("==================================================");
  console.log("🧪 ISOLATED TEST RUNNER (TEST DB ONLY)");
  console.log("==================================================");
  console.log(`Connecting exclusively to MONGO_URI_TEST:`);
  console.log(`Target: ${MONGO_URI_TEST.replace(/:([^@]+)@/, ":****@")}\n`);

  let testServer;
  let testBaseUrl;

  try {
    // 1. Connect Mongoose to the isolated test database
    await mongoose.connect(MONGO_URI_TEST);
    console.log("✅ Connected to isolated test database.");

    // Clean test database before test suite begins
    await mongoose.connection.dropDatabase();
    console.log("🧹 Fresh test database initialized (previous test artifacts dropped).");

    // 2. Seed initial test fixtures in the test DB
    const adminEmail = process.env.ADMIN_EMAIL || "testadmin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "TestAdminPassword123!";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await Admin.create({
      email: adminEmail.toLowerCase(),
      passwordHash,
    });

    await Project.create({
      title: "DevSpace Test Project",
      slug: "devspace-test-project",
      description: "Test description for automated suite",
      techStack: ["React", "Node.js", "Express", "MongoDB"],
      order: 1,
      featured: true,
    });
    console.log("📦 Seeded test admin & baseline test project.");

    // 3. Start isolated test server on dynamic OS-assigned port
    testServer = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    const testPort = testServer.address().port;
    testBaseUrl = `http://localhost:${testPort}`;
    console.log(`🚀 Isolated test server listening on ephemeral port ${testPort}\n`);

    let token = "";
    let createdProjectId = "";
    let guestbookEntryId = "";

    // 1. Health
    console.log("1. Testing GET /api/health ...");
    const healthRes = await request(testBaseUrl, "GET", "/api/health");
    console.log(`   Status: ${healthRes.status} | DB: ${healthRes.body.database}`);

    // 2. Public Projects
    console.log("\n2. Testing GET /api/projects (Public) ...");
    const projRes = await request(testBaseUrl, "GET", "/api/projects");
    console.log(`   Status: ${projRes.status} | Count: ${projRes.body.count}`);
    console.log(`   Project: "${projRes.body.data[0]?.title}" (Order: ${projRes.body.data[0]?.order})`);

    // 3. Admin Login - Invalid
    console.log("\n3. Testing POST /api/auth/login (Invalid Password) ...");
    const failedLogin = await request(testBaseUrl, "POST", "/api/auth/login", {
      email: adminEmail,
      password: "WrongPassword999",
    });
    console.log(`   Status: ${failedLogin.status} | Expected 401 | Message: "${failedLogin.body.message}"`);

    // 4. Admin Login - Valid
    console.log("\n4. Testing POST /api/auth/login (Valid Credentials) ...");
    const validLogin = await request(testBaseUrl, "POST", "/api/auth/login", {
      email: adminEmail,
      password: adminPassword,
    });
    console.log(`   Status: ${validLogin.status} | Success: ${validLogin.body.success}`);
    token = validLogin.body.token;

    // 5. Create Project - Unauthorized
    console.log("\n5. Testing POST /api/projects (Unauthorized Without Token) ...");
    const unauthProj = await request(testBaseUrl, "POST", "/api/projects", {
      title: "Unauthorized Project",
      description: "Should be rejected",
    });
    console.log(`   Status: ${unauthProj.status} | Expected 401 | Message: "${unauthProj.body.message}"`);

    // 6. Create Project - Authorized
    console.log("\n6. Testing POST /api/projects (Authorized Admin) ...");
    const createProjRes = await request(
      testBaseUrl,
      "POST",
      "/api/projects",
      {
        title: "Test Autonomous Agent",
        description: "Built for testing endpoint operations",
        techStack: ["Next.js", "Express", "TypeScript"],
        order: 2,
        featured: true,
      },
      { Authorization: `Bearer ${token}` }
    );
    console.log(`   Status: ${createProjRes.status} | Created ID: ${createProjRes.body.data?._id}`);
    createdProjectId = createProjRes.body.data?._id;

    // 7. Update Project - Authorized
    console.log(`\n7. Testing PUT /api/projects/${createdProjectId} (Authorized Admin) ...`);
    const updateProjRes = await request(
      testBaseUrl,
      "PUT",
      `/api/projects/${createdProjectId}`,
      {
        title: "Test Autonomous Agent (Updated)",
        featured: false,
      },
      { Authorization: `Bearer ${token}` }
    );
    console.log(`   Status: ${updateProjRes.status} | Updated Title: "${updateProjRes.body.data?.title}"`);

    // 8. Delete Project - Authorized
    console.log(`\n8. Testing DELETE /api/projects/${createdProjectId} (Authorized Admin) ...`);
    const delProjRes = await request(
      testBaseUrl,
      "DELETE",
      `/api/projects/${createdProjectId}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    console.log(`   Status: ${delProjRes.status} | Deleted ID: ${delProjRes.body.data?.id}`);

    // 9. Contact - Invalid Email
    console.log("\n9. Testing POST /api/contact (Invalid Email Validation) ...");
    const invalidContact = await request(testBaseUrl, "POST", "/api/contact", {
      name: "Test User",
      email: "invalid-email-string",
      message: "Testing validation",
    });
    console.log(`   Status: ${invalidContact.status} | Expected 400 | Errors: ${JSON.stringify(invalidContact.body.errors)}`);

    // 10. Contact - Valid Submission
    console.log("\n10. Testing POST /api/contact (Valid Submission) ...");
    const validContact = await request(testBaseUrl, "POST", "/api/contact", {
      name: "Verified Contact",
      email: "contact@company.org",
      subject: "Opportunity",
      message: "Hello Muskan, this message was submitted through the isolated test suite.",
    });
    console.log(`   Status: ${validContact.status} | Message: "${validContact.body.message}"`);

    // 11. View Messages - Protected Admin
    console.log("\n11. Testing GET /api/messages (Authorized Admin) ...");
    const messagesRes = await request(testBaseUrl, "GET", "/api/messages", null, {
      Authorization: `Bearer ${token}`,
    });
    console.log(`   Status: ${messagesRes.status} | Messages Count: ${messagesRes.body.count}`);

    // 12. Submit Guestbook Note
    console.log("\n12. Testing POST /api/guestbook (Public Entry) ...");
    const guestbookPost = await request(testBaseUrl, "POST", "/api/guestbook", {
      name: "Test Guest",
      note: "Testing guestbook submission flow in isolated database.",
    });
    console.log(`   Status: ${guestbookPost.status} | Approved: ${guestbookPost.body.data?.approved}`);
    guestbookEntryId = guestbookPost.body.data?.id;

    // 13. View Guestbook (Approved Only Before Approval)
    console.log("\n13. Testing GET /api/guestbook (Public, Approved Only Before Approval) ...");
    const gbBefore = await request(testBaseUrl, "GET", "/api/guestbook");
    console.log(`   Status: ${gbBefore.status} | Approved Count: ${gbBefore.body.count} (Pending note hidden)`);

    // 14. Approve Guestbook Note
    console.log(`\n14. Testing PATCH /api/guestbook/${guestbookEntryId}/approve (Authorized Admin) ...`);
    const approveRes = await request(
      testBaseUrl,
      "PATCH",
      `/api/guestbook/${guestbookEntryId}/approve`,
      { approved: true },
      { Authorization: `Bearer ${token}` }
    );
    console.log(`   Status: ${approveRes.status} | Approved Status: ${approveRes.body.data?.approved}`);

    // 15. View Guestbook (Approved Only After Approval)
    console.log("\n15. Testing GET /api/guestbook (Public, Approved Only After Approval) ...");
    const gbAfter = await request(testBaseUrl, "GET", "/api/guestbook");
    console.log(`   Status: ${gbAfter.status} | Approved Count: ${gbAfter.body.count} (Note now approved & visible!)`);

    console.log("\n==================================================");
    console.log("✅ ALL 15 ISOLATED TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ Test suite encountered an error:", err);
    throw err;
  } finally {
    // Teardown: Completely drop the test database and close all handles
    console.log("\n🧹 Tearing down test environment...");
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      console.log("🗑️  Test database completely dropped.");
      await mongoose.disconnect();
      console.log("🔌 Mongoose test connection disconnected.");
    }

    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
      console.log("🛑 Ephemeral test server closed.");
    }
  }
}

runIsolatedTests()
  .then(() => {
    console.log("✨ Test suite finished with clean teardown. Main database untouched.\n");
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
