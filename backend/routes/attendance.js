// File: /backend/routes/attendance.js

import express from "express";
import {
  uploadAttendance,
  markAttendance,
  getClassAttendance,
  getStudentAttendance,
  getAttendanceStats,
} from "../controllers/AttendenceController.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Teacher-only routes
router.post("/upload", uploadAttendance); // Bulk CSV upload
router.post("/mark", markAttendance); // Mark single attendance
router.get("/class", getClassAttendance); // Get class attendance
router.get("/stats", getAttendanceStats); // Get attendance statistics

// Student and teacher route
router.get("/student", getStudentAttendance); // Get student's attendance

export default router;
