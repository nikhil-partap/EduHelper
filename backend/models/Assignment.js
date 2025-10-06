const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  submission: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    min: 0,
    default: null,
  },
  feedback: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "graded"],
    default: "submitted",
  },
  gradedAt: {
    type: Date,
  },
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide an assignment title"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: [true, "Please specify a class"],
  },
  className: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please specify a teacher"],
  },
  teacherName: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: [true, "Please provide a due date"],
  },
  maxPoints: {
    type: Number,
    default: 100,
    min: 0,
  },
  status: {
    type: String,
    enum: ["draft", "active", "closed"],
    default: "draft",
  },
  submissions: [submissionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
assignmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Assignment", assignmentSchema);
