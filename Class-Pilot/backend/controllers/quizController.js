// File: /backend/controllers/quizController.js

import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Class from "../models/Class.js";
import { generateQuizQuestions } from "../utils/aiService.js";

// Helper: ensure teacher owns the class
async function assertTeacherOwnsClass(teacherId, classId) {
  const classDoc = await Class.findById(classId);
  if (!classDoc)
    throw Object.assign(new Error("Class not found"), { status: 404 });
  if (!classDoc.teacherId.equals(teacherId)) {
    throw Object.assign(new Error("You are not the teacher of this class"), {
      status: 403,
    });
  }
  return classDoc;
}

// Helper: sanitize quiz for student (hide correctAnswer)
function scrubQuizForStudent(quiz) {
  const q = quiz.toObject ? quiz.toObject() : quiz;
  q.questions = q.questions.map(({ question, options, difficultyLevel }) => ({
    question,
    options,
    difficultyLevel,
  }));
  return q;
}

// @desc Generate a quiz via AI (teacher only)
export const generateQuiz = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can generate quizzes" });
    }

    const {
      classId,
      topic,
      chapter,
      numberOfQuestions,
      difficultyLevel = "medium",
      generatedBy = "manual",
    } = req.body;
    if (!classId || !topic || !chapter || !numberOfQuestions) {
      return res.status(400).json({
        message: "classId, topic, chapter, numberOfQuestions are required",
      });
    }

    await assertTeacherOwnsClass(req.user._id, classId);

    // Generate questions using AI service
    let questions;
    try {
      questions = await generateQuizQuestions({
        topic,
        chapter,
        numberOfQuestions,
        difficultyLevel,
        provider: generatedBy === "manual" ? undefined : generatedBy,
      });
    } catch (aiError) {
      return res.status(502).json({
        message: "Failed to generate questions",
        error: aiError.message,
      });
    }

    // Validate AI response
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(502).json({ message: "AI returned no questions" });
    }

    const validQuestions = questions.every(
      (q) =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        [0, 1, 2, 3].includes(q.correctAnswer)
    );
    if (!validQuestions) {
      return res
        .status(422)
        .json({ message: "AI response did not match required format" });
    }

    const quiz = await Quiz.create({
      classId,
      teacherId: req.user._id,
      topic,
      chapter,
      numberOfQuestions: questions.length,
      questions,
      generatedBy: generatedBy || "gemini",
    });

    res.status(201).json({ quiz });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get quiz (student + teacher)
export const getQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    if (!quizId) return res.status(400).json({ message: "quizId is required" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Access control: teacher must own the class; student must be enrolled
    const classDoc = await Class.findById(quiz.classId).populate(
      "students",
      "_id"
    );
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s._id.equals(req.user._id));
    if (!isTeacher && !isStudent)
      return res.status(403).json({ message: "Access denied" });

    // Hide answers for students
    const payload = isStudent ? scrubQuizForStudent(quiz) : quiz;
    res.status(200).json({ quiz: payload });
  } catch (err) {
    next(err);
  }
};

// @desc Submit quiz answers (student only)
export const submitQuiz = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can submit quizzes" });
    }

    const { quizId, answers, timeTaken } = req.body;
    if (!quizId || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ message: "quizId and answers array are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Student must be in the class
    const classDoc = await Class.findById(quiz.classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    const isMember = classDoc.students.some((s) => s.equals(req.user._id));
    if (!isMember)
      return res
        .status(403)
        .json({ message: "You are not enrolled in this class" });

    // Validate answer lengths
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        message: `Answers length must match number of questions (${quiz.questions.length})`,
      });
    }
    const validIndices = answers.every((a) => [0, 1, 2, 3].includes(a));
    if (!validIndices) {
      return res
        .status(400)
        .json({ message: "Answers must be indices 0, 1, 2, or 3" });
    }

    // Score calculation
    const correct = quiz.questions.map((q) => q.correctAnswer);
    let score = 0;
    for (let i = 0; i < correct.length; i++) {
      if (answers[i] === correct[i]) score++;
    }
    const totalMarks = quiz.questions.length;
    const percentage = totalMarks ? Math.round((score / totalMarks) * 100) : 0;

    // Save attempt (unique per quiz/student unless you allow multiple attempts)
    const attempt = await QuizAttempt.findOneAndUpdate(
      { quizId, studentId: req.user._id },
      {
        quizId,
        studentId: req.user._id,
        classId: quiz.classId,
        answers,
        score,
        totalMarks,
        percentage,
        attemptedAt: new Date(),
        ...(typeof timeTaken === "number" ? { timeTaken } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res
      .status(200)
      .json({ score, totalMarks, percentage, attemptId: attempt._id });
  } catch (err) {
    next(err);
  }
};

// @desc Get all quizzes for a class (teacher or enrolled student)
export const getClassQuizzes = async (req, res, next) => {
  try {
    const { classId } = req.params;
    if (!classId)
      return res.status(400).json({ message: "classId is required" });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    // Check access: teacher owns class OR student is enrolled
    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s.equals(req.user._id));

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    const quizzes = await Quiz.find({ classId }).sort({ createdAt: -1 });

    // For students, hide correct answers
    const sanitizedQuizzes = isStudent
      ? quizzes.map((q) => scrubQuizForStudent(q))
      : quizzes;

    res.status(200).json({ quizzes: sanitizedQuizzes });
  } catch (err) {
    next(err);
  }
};

// @desc Get a student's quiz attempts (student + teacher)
export const getStudentQuizAttempts = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;
    if (!classId || !studentId) {
      return res
        .status(400)
        .json({ message: "classId and studentId are required" });
    }

    const classDoc = await Class.findById(classId).populate("students", "_id");
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudentSelf =
      req.user.role === "student" &&
      (String(req.user._id) === String(studentId) ||
        String(req.user.id) === String(studentId));
    if (!isTeacher && !isStudentSelf)
      return res.status(403).json({ message: "Access denied" });

    const attempts = await QuizAttempt.find({ classId, studentId }).sort({
      attemptedAt: -1,
    });

    const avgScore = attempts.length
      ? Math.round(
          (attempts.reduce((sum, a) => sum + a.percentage, 0) /
            attempts.length) *
            100
        ) / 100
      : 0;

    res.status(200).json({ attempts, averagePercentage: avgScore });
  } catch (err) {
    next(err);
  }
};

// @desc Get quiz stats (teacher)
export const getQuizStats = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can view quiz stats" });
    }

    // Support both query param and route param
    const quizId = req.params.quizId || req.query.quizId;
    if (!quizId) return res.status(400).json({ message: "quizId is required" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    await assertTeacherOwnsClass(req.user._id, quiz.classId);

    const attempts = await QuizAttempt.find({ quizId })
      .populate("studentId", "name rollNumber")
      .sort({ percentage: 1 }); // lowest first

    const classAverage = attempts.length
      ? Math.round(
          (attempts.reduce((sum, a) => sum + a.percentage, 0) /
            attempts.length) *
            100
        ) / 100
      : 0;

    const stats = attempts.map((a) => ({
      studentId: a.studentId._id,
      name: a.studentId.name,
      rollNumber: a.studentId.rollNumber,
      score: a.score,
      percentage: a.percentage,
      timeTaken: a.timeTaken ?? null,
      attemptedAt: a.attemptedAt,
    }));

    res.status(200).json({ stats, classAverage });
  } catch (err) {
    next(err);
  }
};
