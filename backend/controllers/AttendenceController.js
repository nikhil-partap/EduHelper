// File: /backend/controllers/attendanceController.js

import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Helper: normalize date to midnight UTC (so date uniqueness works as expected)
const normalizeDate = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// uploadAttendance: bulk CSV-style upload
// Expects req.body: { classId, csvData: [{ studentName, rollNumber, date, status }, ...] }
// Teacher-only. Returns counts { created, updated, errors }
export const uploadAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({message: "Only teachers can upload attendance"});
    }

    const {classId, csvData} = req.body;
    if (!classId || !Array.isArray(csvData)) {
      return res
        .status(400)
        .json({message: "classId and csvData array required"});
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({message: "Class not found"});
    }
    if (!classDoc.teacherId.equals(req.user._id)) {
      return res
        .status(403)
        .json({message: "You are not the teacher of this class"});
    }

    let created = 0;
    let updated = 0;
    const errors = [];

    // Build a map of students in class by rollNumber and name for quick lookup
    const students = await User.find(
      {_id: {$in: classDoc.students}},
      "name rollNumber"
    );
    const byRoll = new Map();
    const byName = new Map();
    students.forEach((s) => {
      if (s.rollNumber) byRoll.set(String(s.rollNumber), s);
      if (s.name) byName.set(s.name.toLowerCase(), s);
    });

    // Use bulkWrite to reduce round-trips (upsert by unique compound key)
    const bulkOps = [];

    for (const row of csvData) {
      const {studentName, rollNumber, date, status} = row;
      if (!date || !status) {
        errors.push(`Missing date/status for row: ${JSON.stringify(row)}`);
        continue;
      }

      // find student
      let student = null;
      if (rollNumber && byRoll.has(String(rollNumber)))
        student = byRoll.get(String(rollNumber));
      else if (studentName && byName.has(studentName.toLowerCase()))
        student = byName.get(studentName.toLowerCase());

      if (!student) {
        errors.push(`Student not found for row: ${JSON.stringify(row)}`);
        continue;
      }

      const normDate = normalizeDate(date);

      // Mongo filter must match the compound uniqueness fields
      const filter = {
        classId: mongoose.Types.ObjectId(classId),
        studentId: mongoose.Types.ObjectId(student._id),
        date: normDate,
      };

      const update = {
        $set: {
          status,
          markedBy: req.user._id,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      };

      bulkOps.push({
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

    const bulkResult = await Attendance.bulkWrite(bulkOps, {ordered: false});

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
        .json({message: "Only teachers can mark attendance"});
    }

    const {classId, studentId, date, status} = req.body;
    if (!classId || !studentId || !date || !status) {
      return res
        .status(400)
        .json({message: "classId, studentId, date, and status are required"});
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({message: "Class not found"});
    if (!classDoc.teacherId.equals(req.user._id))
      return res
        .status(403)
        .json({message: "You are not the teacher of this class"});

    const normDate = normalizeDate(date);

    const filter = {classId, studentId, date: normDate};
    const update = {
      status,
      markedBy: req.user._id,
      updatedAt: new Date(),
    };
    const options = {new: true, upsert: true, setDefaultsOnInsert: true};

    const record = await Attendance.findOneAndUpdate(filter, update, options);

    res.status(200).json({attendance: record});
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({message: "Duplicate attendance entry", error: err.message});
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
        .json({message: "Only teachers can view class attendance"});
    }

    const {classId, date} = req.query;
    if (!classId) return res.status(400).json({message: "classId is required"});

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({message: "Class not found"});
    if (!classDoc.teacherId.equals(req.user._id))
      return res
        .status(403)
        .json({message: "You are not the teacher of this class"});

    const filter = {classId};
    if (date) filter.date = normalizeDate(date);

    const records = await Attendance.find(filter)
      .populate("studentId", "name rollNumber")
      .populate("markedBy", "name email")
      .sort({date: 1});

    // Group by date for easier teacher view: { dateISO: [records...] }
    const grouped = records.reduce((acc, rec) => {
      const key = rec.date.toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    }, {});

    res.status(200).json({attendanceByDate: grouped});
  } catch (err) {
    next(err);
  }
};

// getStudentAttendance: student or teacher can view a student's attendance in a class
// Accepts query params: classId, studentId
// Returns records + summary { total, present, absent, percentage }
export const getStudentAttendance = async (req, res, next) => {
  try {
    const {classId, studentId} = req.query;
    if (!classId || !studentId)
      return res.status(400).json({message: "classId and studentId required"});

    const isTeacher = req.user.role === "teacher";
    const isStudentSelf =
      req.user.role === "student" && String(req.user._id) === String(studentId);

    if (!isTeacher && !isStudentSelf)
      return res.status(403).json({message: "Access denied"});

    const records = await Attendance.find({classId, studentId})
      .sort({date: 1})
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
        .json({message: "Only teachers can view attendance stats"});
    }

    const {classId} = req.query;
    if (!classId) return res.status(400).json({message: "classId is required"});

    const classDoc = await Class.findById(classId).populate(
      "students",
      "name rollNumber"
    );
    if (!classDoc) return res.status(404).json({message: "Class not found"});
    if (!classDoc.teacherId.equals(req.user._id))
      return res
        .status(403)
        .json({message: "You are not the teacher of this class"});

    // Aggregate attendance per student
    const agg = await Attendance.aggregate([
      {$match: {classId: mongoose.Types.ObjectId(classId)}},
      {
        $group: {
          _id: "$studentId",
          total: {$sum: 1},
          present: {$sum: {$cond: [{$eq: ["$status", "Present"]}, 1, 0]}},
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
      statsMap.set(String(a._id), {present, absent, percentage});
    });

    // Build final stats array for all students in class (include students with zero records)
    const stats = classDoc.students.map((s) => {
      const key = String(s._id);
      const data = statsMap.get(key) || {present: 0, absent: 0, percentage: 0};
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

    res.status(200).json({stats});
  } catch (err) {
    next(err);
  }
};
