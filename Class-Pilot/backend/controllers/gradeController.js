// File: /backend/controllers/gradeController.js

import mongoose from "mongoose";
import Grade from "../models/Grade.js";
import Class from "../models/Class.js";

// Helper: ensure teacher owns the class
async function assertTeacherOwnsClass(teacherId, classId) {
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    throw Object.assign(new Error("Class not found"), { status: 404 });
  }
  if (!classDoc.teacherId.equals(teacherId)) {
    throw Object.assign(new Error("You are not the teacher of this class"), {
      status: 403,
    });
  }
  return classDoc;
}

// @desc Add a manual grade entry
// @route POST /api/grade/add
// @access Private (Teacher only)
export const addGrade = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can add grades" });
    }

    const {
      classId,
      studentId,
      type,
      title,
      score,
      totalMarks,
      weight,
      feedback,
    } = req.body;

    if (
      !classId ||
      !studentId ||
      !type ||
      !title ||
      score === undefined ||
      !totalMarks
    ) {
      return res
        .status(400)
        .json({
          message:
            "classId, studentId, type, title, score, and totalMarks are required",
        });
    }

    const classDoc = await assertTeacherOwnsClass(req.user._id, classId);

    // Verify student is in class
    if (!classDoc.students.some((s) => s.equals(studentId))) {
      return res
        .status(400)
        .json({ message: "Student is not enrolled in this class" });
    }

    const grade = await Grade.create({
      classId,
      studentId,
      teacherId: req.user._id,
      type,
      title,
      score,
      totalMarks,
      weight: weight || 1,
      feedback,
    });

    res.status(201).json({ grade });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get all grades for a student in a class
// @route GET /api/grade/student/:classId/:studentId
// @access Private
export const getStudentGrades = async (req, res, next) => {
  try {
    const { classId, studentId } = req.params;

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudentSelf =
      req.user.role === "student" && req.user._id.toString() === studentId;

    if (!isTeacher && !isStudentSelf) {
      return res.status(403).json({ message: "Access denied" });
    }

    const grades = await Grade.find({ classId, studentId })
      .sort({ gradedAt: -1 })
      .populate("teacherId", "name");

    // Calculate summary
    const summary = calculateGradeSummary(grades);

    res.status(200).json({ grades, summary });
  } catch (err) {
    next(err);
  }
};

// @desc Get all grades for a class (Teacher view)
// @route GET /api/grade/class/:classId
// @access Private (Teacher only)
export const getClassGrades = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can view class grades" });
    }

    const { classId } = req.params;
    await assertTeacherOwnsClass(req.user._id, classId);

    const classDoc = await Class.findById(classId).populate(
      "students",
      "name email rollNumber"
    );

    const grades = await Grade.find({ classId })
      .populate("studentId", "name rollNumber")
      .sort({ studentId: 1, gradedAt: -1 });

    // Group by student
    const gradesByStudent = {};
    classDoc.students.forEach((student) => {
      gradesByStudent[student._id.toString()] = {
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
        },
        grades: [],
        summary: null,
      };
    });

    grades.forEach((grade) => {
      const sid = grade.studentId._id.toString();
      if (gradesByStudent[sid]) {
        gradesByStudent[sid].grades.push(grade);
      }
    });

    // Calculate summaries
    Object.keys(gradesByStudent).forEach((sid) => {
      gradesByStudent[sid].summary = calculateGradeSummary(
        gradesByStudent[sid].grades
      );
    });

    res.status(200).json({ gradesByStudent: Object.values(gradesByStudent) });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get grade report for a student across all classes
// @route GET /api/grade/report
// @access Private (Student only)
export const getStudentGradeReport = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can view their grade report" });
    }

    const grades = await Grade.find({ studentId: req.user._id })
      .populate("classId", "className subject")
      .sort({ gradedAt: -1 });

    // Group by class
    const gradesByClass = {};
    grades.forEach((grade) => {
      const cid = grade.classId._id.toString();
      if (!gradesByClass[cid]) {
        gradesByClass[cid] = {
          class: {
            id: grade.classId._id,
            name: grade.classId.className,
            subject: grade.classId.subject,
          },
          grades: [],
          summary: null,
        };
      }
      gradesByClass[cid].grades.push(grade);
    });

    // Calculate summaries
    Object.keys(gradesByClass).forEach((cid) => {
      gradesByClass[cid].summary = calculateGradeSummary(
        gradesByClass[cid].grades
      );
    });

    // Overall summary
    const overallSummary = calculateGradeSummary(grades);

    res.status(200).json({
      gradesByClass: Object.values(gradesByClass),
      overallSummary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update a grade
// @route PUT /api/grade/:gradeId
// @access Private (Teacher only)
export const updateGrade = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can update grades" });
    }

    const { gradeId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    await assertTeacherOwnsClass(req.user._id, grade.classId);

    const allowedUpdates = [
      "score",
      "totalMarks",
      "weight",
      "feedback",
      "title",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) grade[field] = req.body[field];
    });

    await grade.save();
    res.status(200).json({ grade });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Delete a grade
// @route DELETE /api/grade/:gradeId
// @access Private (Teacher only)
export const deleteGrade = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can delete grades" });
    }

    const { gradeId } = req.params;
    const grade = await Grade.findById(gradeId);
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    await assertTeacherOwnsClass(req.user._id, grade.classId);

    await grade.deleteOne();
    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// Helper: Calculate grade summary
function calculateGradeSummary(grades) {
  if (!grades || grades.length === 0) {
    return {
      totalGrades: 0,
      averagePercentage: 0,
      weightedAverage: 0,
      byType: {},
    };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;
  const byType = {};

  grades.forEach((g) => {
    const weight = g.weight || 1;
    totalWeightedScore += (g.percentage || 0) * weight;
    totalWeight += weight;

    if (!byType[g.type]) {
      byType[g.type] = { count: 0, totalPercentage: 0, average: 0 };
    }
    byType[g.type].count++;
    byType[g.type].totalPercentage += g.percentage || 0;
  });

  // Calculate averages by type
  Object.keys(byType).forEach((type) => {
    byType[type].average = Math.round(
      byType[type].totalPercentage / byType[type].count
    );
  });

  const averagePercentage = Math.round(
    grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
  );
  const weightedAverage =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return {
    totalGrades: grades.length,
    averagePercentage,
    weightedAverage,
    byType,
  };
}
