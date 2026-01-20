// File: /backend/controllers/authController.js

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

// Helper: Sign a JWT with user ID and role
const generateToken = (userId, role) => {
  // jwt.sign creates a token string with:
  // 1. Payload: { userId, role }
  // 2. Secret key: process.env.JWT_SECRET (stored securely in environment variables)
  // 3. Options: expiresIn sets token validity (here, 24 hours)
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// @desc    Register a new user (teacher or student)
// TODO @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database connection unavailable. Please try again later."
      });
    }

    const { name, email, password, role, schoolName, rollNumber } = req.body; // destructuring assignment dont mess with the order

    // 1. check for all required fields more cleraly - // not trusting the frontend/user and checking the responce on server side
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ 
          success: false,
          error: "Name, email, password, and role are required" 
        });
    }

    // Role-specific validation
    if (role === "teacher" && !schoolName) {
      return res
        .status(400)
        .json({ 
          success: false,
          error: "schoolName is required for teachers" 
        });
    }
    if (role === "student" && !rollNumber) {
      return res
        .status(400)
        .json({ 
          success: false,
          error: "rollNumber is required for students" 
        });
    }

    // 2. prevent/checking for duplicate registrations
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: "Email already in use" 
      });
    }

    // 3. create user (password hashing runs pre-save hooks )
    const userData = { name, email, password, role };
    if (role === "teacher") userData.schoolName = schoolName;
    if (role === "student") userData.rollNumber = rollNumber;

    const user = await User.create(userData);

    // 4. generate JWT
    const token = generateToken(user._id, user.role);

    // 5. respond with user info + Token
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolName: user.schoolName,
          rollNumber: user.rollNumber,
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        error: "Database connection lost. Please try again."
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Server error. Please try again later."
    });
  }
};

// @desc    Authenticate user & get token
// TODO @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database connection unavailable. Please try again later."
      });
    }

    const { email, password } = req.body;

    // validating input
    if (!email || !password) {
      return res
        .status(400)
        .json({ 
          success: false,
          error: "Email and password are required" 
        });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Compare passwords (using  bcrypt.compare internally)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Issue JWT
    const token = generateToken(user._id, user.role);

    // Return user info + token
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolName: user.schoolName,
          rollNumber: user.rollNumber,
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        error: "Database connection lost. Please try again."
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Server error. Please try again later."
    });
  }
};

export const getMe = async (req, res, next) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: "Database connection unavailable. Please try again later."
      });
    }

    // req.user is set by protect middleware
    // Return in same format as login/register for consistency
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          schoolName: req.user.schoolName,
          rollNumber: req.user.rollNumber,
        }
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    
    res.status(500).json({
      success: false,
      error: "Server error. Please try again later."
    });
  }
};
