const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// POST /api/auth/login
// Authenticates both admin and tenants.
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Look up user in the database
    const users = await User.find({ username: username.toLowerCase() });
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Direct password match (plain text check for simplicity and local testing as requested)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id || user._id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Success response with user details and token
    return res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id || user._id,
        username: user.username,
        role: user.role, // 'admin' or 'tenant'
        name: user.name,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
