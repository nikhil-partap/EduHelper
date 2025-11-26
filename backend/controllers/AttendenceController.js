// File: /backend/controllers/attendanceController.js

import Attendance from "../models/Attendence.js";

import Class from "../models/Class.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Helper: normalize date to midnight UTC (so date uniqueness works as expected)
const normalizeDate = (d) => {
  // If you don’t normalize dates, you will get hidden bugs when users operate from different timezones or when you compare two dates that look the same but have different invisible time values.
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// uploadAttendance: bulk CSV-style upload
// Expects req.body: { classId, csvData: [{ studentName, rollNumber, date, status }, ...] }
// Teacher-only. Returns counts { created, updated, errors }
export const uploadAttendance = async (req, res, next) => {
  try {
    // Only teachers can upload attendance (students cannot modify attendance records)
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can upload attendance" });
    }

    // Expect frontend to send classId and attendance data in CSV format
    const { classId, csvData } = req.body;
    if (!classId || !Array.isArray(csvData)) {
      return res
        .status(400)
        .json({ message: "classId and csvData array required" });
    }

    // LAYER 1: Check if class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    // LAYER 2: Verify teacher ownership
    // Verify that the logged-in teacher owns this class
    // Prevents teachers from uploading attendance to other teachers' classes
    if (!classDoc.teacherId.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not the teacher of this class" });
    }

    let created = 0;
    let updated = 0;
    const errors = []; // i will push error in this with errors.push() then i will send all the error in the api call

    // LAYER 3: Only enrolled students
    // Build a map of students in class by rollNumber and name for quick lookup
    const students = await User.find(
      // this returns an array of student object from the database   like this -
      // {    this is the complete student object
      // _id: "507f1f77bcf86cd799439011",
      // name: "John Doe",
      // rollNumber: "2024001"
      // }
      { _id: { $in: classDoc.students } },
      "name rollNumber"
    );
    const byRoll = new Map(); // map is a built in data structure    to add a value in the map we use set() eg byRoll.set(key, value) is     use get() to get a value with the help of a key  eg byRoll.get(key)
    const byName = new Map();
    students.forEach((s) => {
      if (s.rollNumber) byRoll.set(String(s.rollNumber), s); // the rollno is the key and the whole student data set that is fetched by our student function
      if (s.name) byName.set(s.name.toLowerCase(), s); // here the name is the key and the value is the comolete student object
    }); // but it will overrider another student data with same name so i have managed it below

    // prettier-ignore-start
    // Use bulkWrite to reduce round-trips (upsert by unique compound key)
    const bulkOps = []; // So bulkOps is the container you fill with “tasks” that MongoDB will run all at once.
    // for eg if you upload 200 attendance rows, you have two choices:
    //---- Bad way:
    // --------Make 200 separate MongoDB queries.
    // --------This is slow and wastes network time.
    // --------result in 200 database round-trips
    //---- Correct way:
    // --------Combine the 200 operations into one single request using:
    // A database round-trip is one complete cycle of:
    // ----Your backend sends a query to the database
    // ----The database receives it
    // ----Processes it
    // ----Sends the result back
    // ----Your backend receives the result
    // ----That entire send→process→respond cycle is one round-trip.
    // ----prettier-ignore-start

    // looping through the rows of csv file
    for (const row of csvData) {
      const { studentName, rollNumber, date, status } = row; // object destructuring
      if (!date || !status) {
        // preventing invalid rows from entering the database
        errors.push(`Missing date/status for row: ${JSON.stringify(row)}`); // i push these errors into ( const errors = []; ) that i defined earlier
        continue; // did not stop or crash the process just skiped the invalid row and move forward
      }

      // Find student - prioritize roll number (unique) over name (can duplicate)
      let student = null;

      // Try roll number first (most reliable)
      if (rollNumber && byRoll.has(String(rollNumber))) {
        student = byRoll.get(String(rollNumber));
      }
      // Fallback to name only if roll number not provided
      // ⚠️ Warning: Multiple students can have the same name
      else if (studentName && byName.has(studentName.toLowerCase())) {
        student = byName.get(studentName.toLowerCase());
        // Note: If multiple students have same name, only the last one is stored
      }

      if (!student) {
        errors.push(`Student not found for row: ${JSON.stringify(row)}`);
        continue;
      }

      const normDate = normalizeDate(date);

      // Mongo filter must match the compound uniqueness fields
      const filter = {
        // this just makes sure that no duplicate attendance get marked for a student
        classId: new mongoose.Types.ObjectId(classId),
        studentId: new mongoose.Types.ObjectId(student._id),
        date: normDate,
      };

      const update = {
        $set: {
          // this updated in the database every time
          status,
          markedBy: req.user._id,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          // this is updated  only for the first time or during the creation of the object
          createdAt: new Date(),
        },
      };

      bulkOps.push({
        // add everything to the bulkOps(list) defined above
        updateOne: {
          filter,
          update,
          upsert: true,
        },
      });
    }

    if (bulkOps.length === 0) {
      return res.status(200).json({
        message: "No valid rows to process",
        created: 0,
        updated: 0,
        errors,
      });
    }

    const bulkResult = await Attendance.bulkWrite(bulkOps, { ordered: false });

    // bulkResult provides upsertedCount and modifiedCount
    created = bulkResult.upsertedCount || 0;
    updated = bulkResult.modifiedCount || 0;

    res.status(200).json({
      message: "Attendance upload complete",
      created,
      updated,
      errors,
    });
  } catch (err) {
    // handle duplicate key error (rare because upsert uses the same unique key)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate attendance entry detected",
        error: err.message,
      });
    }
    next(err);
  }
};

// markAttendance: single record create/update
// Expects req.body: { classId, studentId, date, status }
// Teacher-only. Returns attendance record.
export const markAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can mark attendance" });
    }

    const { classId, studentId, date, status } = req.body;
    if (!classId || !studentId || !date || !status) {
      return res
        .status(400)
        .json({ message: "classId, studentId, date, and status are required" });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    if (!classDoc.teacherId.equals(req.user._id))
      return res
        .status(403)
        .json({ message: "You are not the teacher of this class" });

    // ✅ Validate that student is enrolled in this class
    const isEnrolled = classDoc.students.some(
      (id) => id.toString() === studentId.toString()
    );
    if (!isEnrolled) {
      return res
        .status(400)
        .json({ message: "Student is not enrolled in this class" });
    }

    const normDate = normalizeDate(date);

    const filter = { classId, studentId, date: normDate };
    const update = {
      status,
      markedBy: req.user._id,
      updatedAt: new Date(),
    };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const record = await Attendance.findOneAndUpdate(filter, update, options);

    res.status(200).json({ attendance: record });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate attendance entry", error: err.message });
    }
    next(err);
  }
};

// getClassAttendance: returns attendance for a class (teacher-only)
// Accepts query params: classId (required), date (optional ISO string)
// Returns array of records populated with student info, grouped by date
export const getClassAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can view class attendance" });
    }

    const { classId, date } = req.query;
    if (!classId)
      return res.status(400).json({ message: "classId is required" });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    if (!classDoc.teacherId.equals(req.user._id))
      return res
        .status(403)
        .json({ message: "You are not the teacher of this class" });

    const filter = { classId };
    if (date) filter.date = normalizeDate(date);

    const records = await Attendance.find(filter)
      .populate("studentId", "name rollNumber")
      .populate("markedBy", "name email")
      .sort({ date: 1 });

    // Group by date for easier teacher view: { dateISO: [records...] }
    const grouped = records.reduce((acc, rec) => {
      const key = rec.date.toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    }, {});

    res.status(200).json({ attendanceByDate: grouped });
  } catch (err) {
    next(err);
  }
};

// getStudentAttendance: student or teacher can view a student's attendance in a class
// Accepts query params: classId, studentId
// Returns records + summary { total, present, absent, percentage }
export const getStudentAttendance = async (req, res, next) => {
  try {
    const { classId, studentId } = req.query;
    if (!classId || !studentId)
      return res
        .status(400)
        .json({ message: "classId and studentId required" });

    const isTeacher = req.user.role === "teacher";
    const isStudentSelf =
      req.user.role === "student" && String(req.user._id) === String(studentId);

    if (!isTeacher && !isStudentSelf)
      return res.status(403).json({ message: "Access denied" });

    const records = await Attendance.find({ classId, studentId })
      .sort({ date: 1 })
      .populate("markedBy", "name email");

    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = total - present;
    const percentage = total ? Math.round((present / total) * 100) : 0;

    res.status(200).json({
      total,
      present,
      absent,
      percentage,
      records,
    });
  } catch (err) {
    next(err);
  }
};

// getAttendanceStats: teacher-only aggregated stats per student, sorted lowest percentage first
// Accepts query param: classId
// Returns { stats: [ { studentId, name, rollNumber, present, absent, percentage } ] }
export const getAttendanceStats = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can view attendance stats" });
    }

    const { classId } = req.query;
    if (!classId)
      return res.status(400).json({ message: "classId is required" });

    const classDoc = await Class.findById(classId).populate(
      "students",
      "name rollNumber"
    );
    if (!classDoc) return res.status(404).json({ message: "Class not found" });
    if (!classDoc.teacherId.equals(req.user._id))
      return res
        .status(403)
        .json({ message: "You are not the teacher of this class" });

    // Aggregate attendance per student
    const agg = await Attendance.aggregate([
      { $match: { classId: new mongoose.Types.ObjectId(classId) } },
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
        },
      },
    ]);

    // Map aggregate results for quick lookup
    const statsMap = new Map();
    agg.forEach((a) => {
      const total = a.total || 0;
      const present = a.present || 0;
      const absent = total - present;
      const percentage = total ? Math.round((present / total) * 100) : 0;
      statsMap.set(String(a._id), { present, absent, percentage });
    });

    // Build final stats array for all students in class (include students with zero records)
    const stats = classDoc.students.map((s) => {
      const key = String(s._id);
      const data = statsMap.get(key) || {
        present: 0,
        absent: 0,
        percentage: 0,
      };
      return {
        studentId: s._id,
        name: s.name,
        rollNumber: s.rollNumber,
        present: data.present,
        absent: data.absent,
        percentage: data.percentage,
      };
    });

    // Sort lowest percentage first
    stats.sort((a, b) => a.percentage - b.percentage);

    res.status(200).json({ stats });
  } catch (err) {
    next(err);
  }
};
