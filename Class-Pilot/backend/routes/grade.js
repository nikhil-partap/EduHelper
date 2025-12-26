// File: /backend/routes/grade.js

import express from "express";
import {
  addGrade,
  getStudentGrades,
  getClassGrades,
  getStudentGradeReport,
  updateGrade,
  deleteGrade,
} from "../controllers/gradeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Teacher routes
router.post("/add", addGrade);
router.get("/class/:classId", getClassGrades);
router.put("/:gradeId", updateGrade);
router.delete("/:gradeId", deleteGrade);

// Student routes
router.get("/report", getStudentGradeReport);

// Shared routes
router.get("/student/:classId/:studentId", getStudentGrades);

export default router;
