// File: /backend/models/Timetable.js

import mongoose from "mongoose";

const scheduleSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:MM format"],
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Use HH:MM format"],
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  room: {
    type: String,
    trim: true,
  },
  meetLink: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  isRecurring: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: "#3B82F6",
  },
});

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userRole: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
    name: {
      type: String,
      default: "My Timetable",
      trim: true,
    },
    slots: [scheduleSlotSchema],
    academicYear: {
      type: String,
      default: () => new Date().getFullYear().toString(),
    },
    semester: {
      type: String,
      enum: ["1", "2", "summer"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
timetableSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model("Timetable", timetableSchema);
