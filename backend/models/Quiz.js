// File: /backend/models/Quiz.js

import mongoose from "mongoose";

const { Schema } = mongoose;

// Subdocument schema for each question
const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4,
        message: "Each question must have exactly 4 options",
      },
      required: true,
    },
    correctAnswer: {
      type: Number,
      min: 0,
      max: 3,
      required: true,
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    chapter: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfQuestions: {
      type: Number,
      min: 1,
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Quiz must include at least 1 question",
      },
      required: true,
    },
    generatedBy: {
      type: String,
      enum: ["openai", "gemini", "manual"],
      default: "manual",
    },
  },
  { timestamps: true }
);

// Keep numberOfQuestions in sync with questions length if not provided or mismatched
quizSchema.pre("validate", function (next) {
  if (Array.isArray(this.questions)) {
    this.numberOfQuestions = this.questions.length;
  }
  next();
});

// Optional: compound index for quick teacher-class queries
quizSchema.index({ classId: 1, teacherId: 1, createdAt: -1 });

export default mongoose.model("Quiz", quizSchema);
