const { connectDB } = require("./config/db");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {
  await connectDB();

  const existing = await User.findOne({ username: "admin" });

  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await User.create({
    username: "admin",
    password: hashedPassword,
    role: "admin",
    name: "Super Admin",
    tenantId: null,
  });

  console.log("✅ Admin created successfully");
  process.exit();
}

createAdmin();
