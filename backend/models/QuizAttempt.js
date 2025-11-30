// File: /backend/models/QuizAttempt.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const quizAttemptSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    // Array of chosen option indexes (0–3), one per question
    answers: {
      type: [Number],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) && arr.every((a) => [0, 1, 2, 3].includes(a)),
        message: "Each answer must be an index: 0, 1, 2, or 3",
      },
      required: true,
    },
    // Computed/assigned by controller when evaluating
    score: {
      type: Number,
      min: 0,
      required: true,
    },
    totalMarks: {
      type: Number,
      min: 1,
      required: true,
    },
    // Auto-calculated before save: (score / totalMarks) * 100
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    // When the attempt was submitted
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    // Optional duration in seconds
    timeTaken: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

// Keep percentage in sync with score/totalMarks
quizAttemptSchema.pre("save", function (next) {
  if (
    typeof this.score === "number" &&
    typeof this.totalMarks === "number" &&
    this.totalMarks > 0
  ) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
  }
  next();
});

// Optional: ensure a student can have only one finalized attempt per quiz
// If you allow multiple attempts, remove or make it conditional.
quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
