// File: /backend/models/Meeting.js

import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
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
      required: [true, "Meeting title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    meetLink: {
      type: String,
      required: [true, "Meeting link is required"],
      trim: true,
    },
    meetingType: {
      type: String,
      enum: ["google_meet", "zoom", "teams", "other"],
      default: "google_meet",
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled time is required"],
    },
    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    attendees: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: Date,
        leftAt: Date,
        attended: {
          type: Boolean,
          default: false,
        },
      },
    ],
    recordingUrl: {
      type: String,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly"],
    },
    reminders: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
meetingSchema.index({ classId: 1, scheduledAt: 1 });
meetingSchema.index({ teacherId: 1, status: 1 });
meetingSchema.index({ scheduledAt: 1, status: 1 });

export default mongoose.model("Meeting", meetingSchema);
