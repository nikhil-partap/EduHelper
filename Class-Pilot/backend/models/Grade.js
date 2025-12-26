// File: /backend/models/Grade.js

import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["quiz", "assignment", "exam", "project", "participation", "other"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "sourceModel",
    },
    sourceModel: {
      type: String,
      enum: ["Quiz", "Assignment"],
    },
    title: {
      type: String,
      required: [true, "Grade title is required"],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: 1,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    weight: {
      type: Number,
      default: 1,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      maxlength: 1000,
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Calculate percentage before saving
gradeSchema.pre("save", function (next) {
  if (this.score !== undefined && this.totalMarks) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
  }
  next();
});

// Indexes
gradeSchema.index({ classId: 1, studentId: 1 });
gradeSchema.index({ studentId: 1, type: 1 });
gradeSchema.index({ classId: 1, type: 1 });

export default mongoose.model("Grade", gradeSchema);
