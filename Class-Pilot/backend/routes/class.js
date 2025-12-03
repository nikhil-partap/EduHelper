// File: /backend/routes/class.js

import express from "express";
import {
  createClass,
  getTeacherClasses,
  joinClass,
  getStudentClasses,
  getClassDetails,
} from "../controllers/classController.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

// All routes are protected: req.user is available

// Teacher-only
router.post("/create", protect, createClass);
router.get("/teacher", protect, getTeacherClasses);

// Student-only
router.post("/join", protect, joinClass);
router.get("/student", protect, getStudentClasses);

// Any authenticated user (teacher-owner or enrolled student)
router.get("/:id", protect, getClassDetails);

export default router;
