// File: /backend/routes/auth.js

import express from "express";
import {registerUser, loginUser, getMe} from "../controllers/AuthController.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

// Register a new teacher or student
router.post("/register", registerUser);

// Login existing user
router.post("/login", loginUser);

// Get current user (protected)
router.get("/me", protect, getMe);

export default router;
