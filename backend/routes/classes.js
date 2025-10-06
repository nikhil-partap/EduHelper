const express = require("express");
const router = express.Router();

// Mock classes data
const classesData = [
  {
    id: 1,
    name: "Mathematics 101",
    description: "Introduction to Algebra and Basic Mathematics",
    teacher: "Mr. Johnson",
    teacherId: 1,
    students: [
      {id: 1, name: "John Doe", email: "john@example.com"},
      {id: 2, name: "Jane Smith", email: "jane@example.com"},
    ],
    schedule: "Mon, Wed, Fri 9:00 AM",
    room: "Room 204",
    capacity: 30,
    enrolled: 28,
    assignments: [
      {id: 1, title: "Algebra Basics", dueDate: "2025-01-15", status: "active"},
      {
        id: 2,
        title: "Linear Equations",
        dueDate: "2025-01-22",
        status: "draft",
      },
    ],
  },
  {
    id: 2,
    name: "Physics 201",
    description: "Introduction to Classical Physics",
    teacher: "Dr. Smith",
    teacherId: 2,
    students: [
      {id: 2, name: "Jane Smith", email: "jane@example.com"},
      {id: 3, name: "Mike Johnson", email: "mike@example.com"},
    ],
    schedule: "Tue, Thu 11:00 AM",
    room: "Lab 3",
    capacity: 25,
    enrolled: 24,
    assignments: [
      {
        id: 3,
        title: "Motion and Forces",
        dueDate: "2025-01-18",
        status: "active",
      },
    ],
  },
  {
    id: 3,
    name: "English Literature",
    description: "Classic and Modern Literature Analysis",
    teacher: "Ms. Davis",
    teacherId: 3,
    students: [
      {id: 1, name: "John Doe", email: "john@example.com"},
      {id: 4, name: "Sarah Wilson", email: "sarah@example.com"},
    ],
    schedule: "Mon, Wed 1:00 PM",
    room: "Room 101",
    capacity: 25,
    enrolled: 22,
    assignments: [
      {
        id: 4,
        title: "Shakespeare Analysis",
        dueDate: "2025-01-20",
        status: "active",
      },
    ],
  },
];

// @route   GET /api/classes
// @desc    Get all classes
// @access  Public
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: classesData,
      count: classesData.length,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/classes/:id
// @desc    Get single class by ID
// @access  Public
router.get("/:id", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const classData = classesData.find((c) => c.id === classId);

    if (!classData) {
      return res.status(404).json({message: "Class not found"});
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error("Get class error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Teacher only)
router.post("/", (req, res) => {
  try {
    const {name, description, schedule, room, capacity, teacherId} = req.body;

    if (!name || !schedule || !teacherId) {
      return res.status(400).json({
        message: "Please provide class name, schedule, and teacher ID",
      });
    }

    const newClass = {
      id: classesData.length + 1,
      name,
      description: description || "",
      teacher: "Teacher Name", // Would be fetched from teacher ID
      teacherId,
      students: [],
      schedule,
      room: room || "TBD",
      capacity: capacity || 30,
      enrolled: 0,
      assignments: [],
    };

    classesData.push(newClass);

    res.status(201).json({
      success: true,
      data: newClass,
      message: "Class created successfully",
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Teacher only)
router.put("/:id", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const {name, description, schedule, room, capacity} = req.body;

    const classIndex = classesData.findIndex((c) => c.id === classId);
    if (classIndex === -1) {
      return res.status(404).json({message: "Class not found"});
    }

    // Update class data
    if (name) classesData[classIndex].name = name;
    if (description) classesData[classIndex].description = description;
    if (schedule) classesData[classIndex].schedule = schedule;
    if (room) classesData[classIndex].room = room;
    if (capacity) classesData[classIndex].capacity = capacity;

    res.json({
      success: true,
      data: classesData[classIndex],
      message: "Class updated successfully",
    });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Teacher only)
router.delete("/:id", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const classIndex = classesData.findIndex((c) => c.id === classId);

    if (classIndex === -1) {
      return res.status(404).json({message: "Class not found"});
    }

    classesData.splice(classIndex, 1);

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/classes/:id/enroll
// @desc    Enroll student in class
// @access  Private (Student only)
router.post("/:id/enroll", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const {studentId, studentName, studentEmail} = req.body;

    const classIndex = classesData.findIndex((c) => c.id === classId);
    if (classIndex === -1) {
      return res.status(404).json({message: "Class not found"});
    }

    const classData = classesData[classIndex];

    // Check if class is full
    if (classData.enrolled >= classData.capacity) {
      return res.status(400).json({message: "Class is full"});
    }

    // Check if student is already enrolled
    const isEnrolled = classData.students.some((s) => s.id === studentId);
    if (isEnrolled) {
      return res
        .status(400)
        .json({message: "Student already enrolled in this class"});
    }

    // Add student to class
    classData.students.push({
      id: studentId,
      name: studentName,
      email: studentEmail,
    });
    classData.enrolled += 1;

    res.json({
      success: true,
      message: "Successfully enrolled in class",
      data: classData,
    });
  } catch (error) {
    console.error("Class enrollment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   DELETE /api/classes/:id/students/:studentId
// @desc    Remove student from class
// @access  Private (Teacher only)
router.delete("/:id/students/:studentId", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const studentId = parseInt(req.params.studentId);

    const classIndex = classesData.findIndex((c) => c.id === classId);
    if (classIndex === -1) {
      return res.status(404).json({message: "Class not found"});
    }

    const classData = classesData[classIndex];
    const studentIndex = classData.students.findIndex(
      (s) => s.id === studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({message: "Student not found in this class"});
    }

    // Remove student from class
    classData.students.splice(studentIndex, 1);
    classData.enrolled -= 1;

    res.json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error) {
    console.error("Remove student error:", error);
    res.status(500).json({message: "Server error"});
  }
});

module.exports = router;
