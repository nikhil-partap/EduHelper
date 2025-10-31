// File: /backend/models/attendance.js

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema( // this is user schema for marking the student Attendence
  {
    classId: {
      // here I get the class id of the student from the Class database
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      // Here i get the student id from the User database
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
attendanceSchema.index({classId: 1, studentId: 1, date: 1}, {unique: true});

export default mongoose.model("Attendance", attendanceSchema);
