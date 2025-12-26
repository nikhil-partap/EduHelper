// File: /backend/controllers/assignmentController.js

import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import Grade from "../models/Grade.js";

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

// @desc Create a new assignment
// @route POST /api/assignment/create
// @access Private (Teacher only)
export const createAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can create assignments" });
    }

    const {
      classId,
      title,
      description,
      instructions,
      dueDate,
      totalMarks,
      allowLateSubmission,
      latePenalty,
    } = req.body;

    if (!classId || !title || !dueDate || !totalMarks) {
      return res.status(400).json({
        message: "classId, title, dueDate, and totalMarks are required",
      });
    }

    await assertTeacherOwnsClass(req.user._id, classId);

    const assignment = await Assignment.create({
      classId,
      teacherId: req.user._id,
      title,
      description,
      instructions,
      dueDate: new Date(dueDate),
      totalMarks,
      allowLateSubmission: allowLateSubmission || true,
      latePenalty: latePenalty || 0,
    });

    res.status(201).json({ assignment });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Get all assignments for a class
// @route GET /api/assignment/class/:classId
// @access Private
export const getClassAssignments = async (req, res, next) => {
  try {
    const { classId } = req.params;
    if (!classId)
      return res.status(400).json({ message: "classId is required" });

    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: "Class not found" });

    // Check access
    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s.equals(req.user._id));

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    const assignments = await Assignment.find({
      classId,
      status: { $ne: "draft" },
    })
      .sort({ dueDate: 1 })
      .select(isStudent ? "-submissions.grade -submissions.feedback" : "");

    res.status(200).json({ assignments });
  } catch (err) {
    next(err);
  }
};

// @desc Get single assignment
// @route GET /api/assignment/:assignmentId
// @access Private
export const getAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId)
      .populate("classId", "className subject")
      .populate("submissions.studentId", "name email rollNumber");

    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    const classDoc = await Class.findById(assignment.classId);
    const isTeacher =
      req.user.role === "teacher" && classDoc.teacherId.equals(req.user._id);
    const isStudent =
      req.user.role === "student" &&
      classDoc.students.some((s) => s.equals(req.user._id));

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Students only see their own submission
    if (isStudent) {
      const mySubmission = assignment.submissions.find((s) =>
        s.studentId._id.equals(req.user._id)
      );
      assignment.submissions = mySubmission ? [mySubmission] : [];
    }

    res.status(200).json({ assignment });
  } catch (err) {
    next(err);
  }
};

// @desc Submit assignment (Student)
// @route POST /api/assignment/:assignmentId/submit
// @access Private (Student only)
export const submitAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can submit assignments" });
    }

    const { assignmentId } = req.params;
    const { content, fileUrl } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    const classDoc = await Class.findById(assignment.classId);
    if (!classDoc.students.some((s) => s.equals(req.user._id))) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this class" });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find((s) =>
      s.studentId.equals(req.user._id)
    );
    if (existingSubmission) {
      return res
        .status(400)
        .json({ message: "You have already submitted this assignment" });
    }

    // Check due date
    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      return res
        .status(400)
        .json({ message: "Assignment deadline has passed" });
    }

    assignment.submissions.push({
      studentId: req.user._id,
      content,
      fileUrl,
      submittedAt: now,
      status: isLate ? "late" : "submitted",
    });

    await assignment.save();

    res
      .status(200)
      .json({ message: "Assignment submitted successfully", isLate });
  } catch (err) {
    next(err);
  }
};

// @desc Grade assignment submission (Teacher)
// @route PUT /api/assignment/:assignmentId/grade/:studentId
// @access Private (Teacher only)
export const gradeSubmission = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can grade assignments" });
    }

    const { assignmentId, studentId } = req.params;
    const { grade, feedback } = req.body;

    if (grade === undefined) {
      return res.status(400).json({ message: "Grade is required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    await assertTeacherOwnsClass(req.user._id, assignment.classId);

    if (grade < 0 || grade > assignment.totalMarks) {
      return res.status(400).json({
        message: `Grade must be between 0 and ${assignment.totalMarks}`,
      });
    }

    const submission = assignment.submissions.find(
      (s) => s.studentId.toString() === studentId
    );
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Apply late penalty if applicable
    let finalGrade = grade;
    if (submission.status === "late" && assignment.latePenalty > 0) {
      finalGrade = Math.max(0, grade - (grade * assignment.latePenalty) / 100);
    }

    submission.grade = finalGrade;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    submission.status = "graded";

    await assignment.save();

    // Create grade record
    await Grade.findOneAndUpdate(
      { classId: assignment.classId, studentId, sourceId: assignment._id },
      {
        classId: assignment.classId,
        studentId,
        teacherId: req.user._id,
        type: "assignment",
        sourceId: assignment._id,
        sourceModel: "Assignment",
        title: assignment.title,
        score: finalGrade,
        totalMarks: assignment.totalMarks,
        feedback,
      },
      { upsert: true, new: true }
    );

    res
      .status(200)
      .json({ message: "Assignment graded successfully", grade: finalGrade });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Update assignment (Teacher)
// @route PUT /api/assignment/:assignmentId
// @access Private (Teacher only)
export const updateAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can update assignments" });
    }

    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    await assertTeacherOwnsClass(req.user._id, assignment.classId);

    const allowedUpdates = [
      "title",
      "description",
      "instructions",
      "dueDate",
      "totalMarks",
      "allowLateSubmission",
      "latePenalty",
      "status",
    ];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Assignment.findByIdAndUpdate(assignmentId, updates, {
      new: true,
    });
    res.status(200).json({ assignment: updated });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};

// @desc Delete assignment (Teacher)
// @route DELETE /api/assignment/:assignmentId
// @access Private (Teacher only)
export const deleteAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Only teachers can delete assignments" });
    }

    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ message: "Assignment not found" });

    await assertTeacherOwnsClass(req.user._id, assignment.classId);

    await assignment.deleteOne();
    await Grade.deleteMany({ sourceId: assignmentId });

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    next(err);
  }
};
