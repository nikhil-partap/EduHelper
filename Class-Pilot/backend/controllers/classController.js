// File: /backend/controllers/classController.js

import { ReturnDocument } from "mongodb";
import Class from "../models/Class.js";

// @desc    Teacher creates a new class
// TODO @route   POST /api/classes
// @access  Private (teacher only)
export const createClass = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ Message: "Only teachers can create classes" });
    }

    const { className, subject, board } = req.body;
    if (!className || !subject || !board) {
      return res
        .status(400)
        .json({ message: "className, subject, and board are required" });
    }

    const newClass = await Class.create({
      className,
      subject,
      board,
      teacherId: req.user._id,
    });
    res.status(201).json({ class: newClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all classes for the logged-in teacher
// @route   GET /api/classes/teacher
// @access  Private (teacher only)
export const getTeacherClasses = async (req, res, next) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied" });
    }

    const classes = await Class.find({ teacherId: req.user._id }).populate(
      "students",
      "name email rollNumber"
    );
    res.status(200).json({ classes });
  } catch (error) {
    next(error);
  }
};

// @desc    Student joins a class by code
// @route   POST /api/classes/join
// @access  Private (student only)
export const joinClass = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can join classes" });
    }

    const { classCode } = req.body;
    if (!classCode) {
      return res.status(400).json({ message: "classCode is required" });
    }

    const foundClass = await Class.findOne({ classCode });
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const alreadyJoined = foundClass.students.includes(req.user._id);
    if (alreadyJoined) {
      return res.status(200).json({ message: "Already joined" });
    }
    foundClass.students.push(req.user._id);
    await foundClass.save();

    res.status(200).json({ message: "joined class successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all classes a student has joined
// TODO @route   GET /api/classes/student
// @access  Private (student only)
export const getStudentClasses = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const classes = await Class.find({ students: req.user._id })
      .populate("teacherId", "name email")
      .populate("students", "name email rollNumber");
    res.status(200).json({ classes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed info for one class
// @route   GET /api/classes/:id
// @access  Private (teacher or student)
export const getClassDetails = async (req, res, next) => {
  try {
    const foundClass = await Class.findById(req.params.id)
      .populate("teacherId", "id name email")
      .populate("students", "id name email");

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Only teacher owner or a joined student may view
    const isTeacherOwner =
      req.user.role === "teacher" &&
      foundClass.teacherId._id.equals(req.user._id);
    const isStudentMember =
      req.user.role === "student" &&
      foundClass.students.some((s) => s._id.equals(req.user._id));

    if (!isTeacherOwner && !isStudentMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ class: foundClass });
  } catch (error) {
    next(error);
  }
};
