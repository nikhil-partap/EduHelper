// File: /backend/routes/assignment.js

import express from "express";
import {
  createAssignment,
  getClassAssignments,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Teacher routes
router.post("/create", createAssignment);
router.put("/:assignmentId", updateAssignment);
router.delete("/:assignmentId", deleteAssignment);
router.put("/:assignmentId/grade/:studentId", gradeSubmission);

// Student routes
router.post("/:assignmentId/submit", submitAssignment);

// Shared routes
router.get("/class/:classId", getClassAssignments);
router.get("/:assignmentId", getAssignment);

export default router;
