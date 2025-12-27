import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  exportPortfolioPDF,
  exportAttendanceExcel,
  exportGradesExcel,
  exportQuizResults,
} from "../controllers/exportController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/export/portfolio/:studentId/:classId - Export student portfolio (PDF)
router.get("/portfolio/:studentId/:classId", exportPortfolioPDF);

// GET /api/export/attendance/:classId - Export attendance report (Excel) - Teacher only
router.get("/attendance/:classId", authorize("teacher"), exportAttendanceExcel);

// GET /api/export/grades/:classId - Export grades report (Excel) - Teacher only
router.get("/grades/:classId", authorize("teacher"), exportGradesExcel);

// GET /api/export/quiz/:quizId - Export quiz results (PDF/Excel) - Teacher only
router.get("/quiz/:quizId", authorize("teacher"), exportQuizResults);

export default router;
