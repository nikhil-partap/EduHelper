const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Mock user data (replace with database later)
const users = [
  {
    id: 1,
    email: "teacher@classpilot.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    role: "teacher",
    name: "John Teacher",
  },
  {
    id: 2,
    email: "student@classpilot.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
    role: "student",
    name: "Jane Student",
  },
];

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({message: "Please provide email and password"});
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({message: "Invalid credentials"});
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({message: "Invalid credentials"});
    }

    // Create JWT token
    const token = jwt.sign(
      {userId: user.id, role: user.role},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRE}
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const {name, email, password, role} = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({message: "Please provide all required fields"});
    }

    if (!["teacher", "student"].includes(role)) {
      return res
        .status(400)
        .json({message: "Role must be either teacher or student"});
    }

    // Check if user exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({message: "User already exists"});
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role,
    };

    users.push(newUser);

    // Create JWT token
    const token = jwt.sign(
      {userId: newUser.id, role: newUser.role},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRE}
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", (req, res) => {
  // This would typically use auth middleware to verify token
  res.json({message: "Protected route - implement auth middleware"});
});

module.exports = router;
