// File: /backend/models/StudyPlanner.js

import mongoose from "mongoose";

const { Schema } = mongoose;

// Normalize a date to midnight UTC for consistent comparisons
const normalizeUTC = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

// Subdocument: exam dates
const examDateSchema = new Schema(
  {
    examName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
  },
  { _id: false }
);

// Subdocument: chapters
const chapterSchema = new Schema(
  {
    chapterName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Calculated before validate/save
    durationDays: { type: Number, min: 0 },
    // Optional topic breakdowns (e.g., per day)
    topics: {
      type: [String],
      default: undefined,
      validate: {
        validator: (arr) => !arr || arr.every((t) => typeof t === "string"),
        message: "Topics must be strings",
      },
    },
  },
  { _id: false }
);

const studyPlannerSchema = new Schema(
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

    board: { type: String, required: true, trim: true }, // e.g., "CBSE"
    className: { type: String, required: true, trim: true }, // e.g., "10th"

    chapters: {
      type: [chapterSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one chapter is required",
      },
      required: true,
    },

    // Dates to exclude from duration calculations
    holidays: {
      type: [Date],
      default: [],
      set: (arr) => (Array.isArray(arr) ? arr.map(normalizeUTC) : arr),
    },

    examDates: {
      type: [examDateSchema],
      default: [],
    },

    generatedAt: { type: Date }, // when AI generated it
    lastEditedAt: { type: Date }, // when teacher last edited it
  },
  { timestamps: true }
);

// Validate chapter ranges and compute durationDays (excluding holidays)
studyPlannerSchema.pre("validate", function (next) {
  try {
    const holidaySet = new Set(
      (this.holidays || []).map((d) => normalizeUTC(d).getTime())
    );

    if (Array.isArray(this.chapters)) {
      this.chapters.forEach((ch) => {
        if (!ch.startDate || !ch.endDate) return;
        const start = normalizeUTC(ch.startDate);
        const end = normalizeUTC(ch.endDate);

        if (end < start) {
          throw new Error(
            `Chapter "${ch.chapterName}" endDate cannot be before startDate`
          );
        }

        // Count inclusive days excluding holidays
        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
          const key = normalizeUTC(cur).getTime();
          if (!holidaySet.has(key)) count += 1;
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
        ch.durationDays = count;
      });
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Helpful index for teacher views
studyPlannerSchema.index({ classId: 1, teacherId: 1, createdAt: -1 });

export default mongoose.model("StudyPlanner", studyPlannerSchema);
