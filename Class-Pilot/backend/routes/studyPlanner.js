// File: /backend/routes/studyPlanner.js

import express from "express";
import {
  generateStudyPlanner,
  getStudyPlanner,
  updateChapter,
  reorderChapters,
  deleteChapter,
  updateAcademicYear,
  deleteStudyPlanner,
  addHoliday,
  removeHoliday,
  addExamDate,
  updateExamDate,
} from "../controllers/studyPlannerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Optional role guard
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res
      .status(403)
      .json({ message: `Only ${role}s can access this route` });
  }
  next();
};

// POST /api/studyplanner/generate (teacher only)
// Body: { classId, board, className }
router.post("/generate", protect, requireRole("teacher"), generateStudyPlanner);

// GET /api/studyplanner/:classId (teacher + student)
router.get("/:classId", protect, getStudyPlanner);

// DELETE /api/studyplanner/:classId (teacher only) - Delete entire planner
router.delete("/:classId", protect, requireRole("teacher"), deleteStudyPlanner);

// PUT /api/studyplanner/:classId/year (teacher only) - Update academic year
router.put(
  "/:classId/year",
  protect,
  requireRole("teacher"),
  updateAcademicYear
);

// PUT /api/studyplanner/:classId/chapter/:chapterIndex (teacher only)
// Body: { chapterName, durationDays, newStartDate, newEndDate }
router.put(
  "/:classId/chapter/:chapterIndex",
  protect,
  requireRole("teacher"),
  updateChapter
);

// DELETE /api/studyplanner/:classId/chapter/:chapterIndex (teacher only)
router.delete(
  "/:classId/chapter/:chapterIndex",
  protect,
  requireRole("teacher"),
  deleteChapter
);

// PUT /api/studyplanner/:classId/reorder (teacher only)
// Body: { oldIndex, newIndex }
router.put(
  "/:classId/reorder",
  protect,
  requireRole("teacher"),
  reorderChapters
);

// POST /api/studyplanner/:classId/holiday (teacher only)
// Body: { date }
router.post("/:classId/holiday", protect, requireRole("teacher"), addHoliday);

// DELETE /api/studyplanner/:classId/holiday/:date (teacher only)
router.delete(
  "/:classId/holiday/:date",
  protect,
  requireRole("teacher"),
  removeHoliday
);

// POST /api/studyplanner/:classId/exam (teacher only)
// Body: { examName, date }
router.post("/:classId/exam", protect, requireRole("teacher"), addExamDate);

// PUT /api/studyplanner/:classId/exam/:examName (teacher only)
// Body: { newDate }
router.put(
  "/:classId/exam/:examName",
  protect,
  requireRole("teacher"),
  updateExamDate
);

export default router;
