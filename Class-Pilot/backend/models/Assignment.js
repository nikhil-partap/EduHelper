// File: /backend/models/Assignment.js

import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  fileUrl: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
  },
  feedback: {
    type: String,
  },
  gradedAt: {
    type: Date,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["submitted", "late", "graded", "returned"],
    default: "submitted",
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    instructions: {
      type: String,
      maxlength: 5000,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: 1,
      max: 1000,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    submissions: [submissionSchema],
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenalty: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
  },
  { timestamps: true }
);

// Indexes
assignmentSchema.index({ classId: 1, dueDate: 1 });
assignmentSchema.index({ teacherId: 1 });

export default mongoose.model("Assignment", assignmentSchema);
