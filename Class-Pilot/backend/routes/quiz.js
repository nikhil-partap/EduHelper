// File: /backend/routes/quiz.js

import express from "express";
import {
  generateQuiz,
  getQuiz,
  submitQuiz,
  getClassQuizzes,
  getStudentQuizAttempts,
  getQuizStats,
} from "../controllers/quizController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Optional role guards (use if you prefer enforcing roles in routes)
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res
      .status(403)
      .json({ message: `Only ${role}s can access this route` });
  }
  next();
};

// POST /api/quiz/generate (protected, teacher only)
// Body: { classId, topic, chapter, numberOfQuestions, difficultyLevel }
router.post("/generate", protect, requireRole("teacher"), generateQuiz);

// GET /api/quiz/class/:classId (protected, teacher or enrolled student)
// MUST be before /:quizId to avoid route conflict
router.get("/class/:classId", protect, getClassQuizzes);

// GET /api/quiz/attempts/:classId/:studentId (protected)
// Teacher sees any student; student sees only self (controller enforces)
router.get("/attempts/:classId/:studentId", protect, getStudentQuizAttempts);

// GET /api/quiz/stats/:quizId (protected, teacher only)
router.get("/stats/:quizId", protect, requireRole("teacher"), getQuizStats);

// GET /api/quiz/:quizId (protected)
// MUST be after specific routes to avoid conflicts
router.get("/:quizId", protect, getQuiz);

// POST /api/quiz/:quizId/submit (protected, student only)
// Body: { answers: number[] }
router.post("/:quizId/submit", protect, requireRole("student"), submitQuiz);

export default router;
