import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getStudentPortfolio,
  getClassAnalytics,
} from "../controllers/portfolioController.js";

const router = express.Router();

// Get student portfolio with analytics
// GET /api/portfolio/:studentId/:classId
router.get("/:studentId/:classId", protect, getStudentPortfolio);

// Get class-wide analytics (teacher only)
// GET /api/portfolio/class/:classId/analytics
router.get("/class/:classId/analytics", protect, getClassAnalytics);

export default router;
