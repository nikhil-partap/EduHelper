// File: /backend/models/attendance.js

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId: {
      // Reference to the class document
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      // Reference to the user document (must be a student enrolled in the class)
      // Note: Enrollment validation is handled at controller level for better performance
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
    markedBy: {
      // Reference to the teacher who marked the attendance
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance entries
// This ensures one attendance record per student per class per date
attendanceSchema.index({classId: 1, studentId: 1, date: 1}, {unique: true});

// Additional indexes for common queries
attendanceSchema.index({classId: 1, date: 1}); // For fetching class attendance by date
attendanceSchema.index({studentId: 1, classId: 1}); // For fetching student's attendance in a class

// Virtual field to get formatted date in dd-mm-yyyy format
attendanceSchema.virtual("formattedDate").get(function () {
  const day = String(this.date.getDate()).padStart(2, "0");
  const month = String(this.date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = this.date.getFullYear();
  return `${day}-${month}-${year}`; // Returns dd-mm-yyyy
});

// Ensure virtuals are included when converting to JSON
attendanceSchema.set("toJSON", {virtuals: true});
attendanceSchema.set("toObject", {virtuals: true});

export default mongoose.model("Attendance", attendanceSchema);
