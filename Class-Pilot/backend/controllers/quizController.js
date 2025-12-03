// File: /backend/controllers/quizController.js

import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Class from "../models/Class.js";
import User from "../models/User.js";

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

// Placeholder AI generator (replace with actual API call)
async function generateQuestionsWithAI({
  numberOfQuestions,
  topic,
  chapter,
  difficultyLevel,
}) {
  // TODO: Call AI API (OpenAI/Gemini) using the provided prompt template.
  // For now, return a deterministic mock.
  const questions = Array.from({ length: numberOfQuestions }, (_, i) => ({
    question: `Q${i + 1}. ${topic} – ${chapter}: concept check`,
    options: [
      `Option A for Q${i + 1}`,
      `Option B for Q${i + 1}`,
      `Option C for Q${i + 1}`,
      `Option D for Q${i + 1}`,
    ],
    correctAnswer: Math.floor(Math.random() * 4),
    difficultyLevel: difficultyLevel || "medium",
  }));
  return { questions };
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

    // Build prompt (for future AI integration)
    const prompt = `
Generate ${numberOfQuestions} multiple choice questions about ${topic} from ${chapter}.
Difficulty: ${difficultyLevel}

Return in this exact JSON format:
{
  "questions": [
    {
      "question": "...",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0
    }
  ]
}
`.trim();

    // TODO: Replace with actual AI API call using 'prompt'
    const aiResponse = await generateQuestionsWithAI({
      numberOfQuestions,
      topic,
      chapter,
      difficultyLevel,
    });

    // Validate AI response shape
    if (
      !aiResponse?.questions ||
      !Array.isArray(aiResponse.questions) ||
      aiResponse.questions.length === 0
    ) {
      return res.status(502).json({ message: "Failed to generate questions" });
    }
    const validQuestions = aiResponse.questions.every(
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
      numberOfQuestions: aiResponse.questions.length,
      questions: aiResponse.questions,
      generatedBy, // 'openai' | 'gemini' | 'manual'
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

// @desc Get all quizzes for a class (teacher only)
export const getClassQuizzes = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can view class quizzes" });
    }
    const { classId } = req.query;
    if (!classId)
      return res.status(400).json({ message: "classId is required" });

    await assertTeacherOwnsClass(req.user._id, classId);

    const quizzes = await Quiz.find({ classId }).sort({ createdAt: -1 });
    res.status(200).json({ quizzes });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get a student's quiz attempts (student + teacher)
export const getStudentQuizAttempts = async (req, res, next) => {
  try {
    const { classId, studentId } = req.query;
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

    const { quizId } = req.query;
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
