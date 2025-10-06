const express = require("express");
const router = express.Router();

// Mock teacher data
const teacherData = {
  stats: {
    totalStudents: 156,
    activeClasses: 8,
    assignments: 24,
    avgGrade: "87%",
  },
  upcomingClasses: [
    {
      subject: "Mathematics 101",
      time: "9:00 AM",
      students: 28,
      room: "Room 204",
    },
    {subject: "Science 201", time: "11:00 AM", students: 24, room: "Lab 3"},
    {subject: "History 301", time: "2:00 PM", students: 32, room: "Room 105"},
  ],
  recentActivities: [
    {
      action: "New assignment submitted",
      student: "John Doe",
      time: "2 hours ago",
      class: "Math 101",
    },
    {
      action: "Quiz completed",
      student: "Jane Smith",
      time: "4 hours ago",
      class: "Science 201",
    },
    {
      action: "Late submission",
      student: "Mike Johnson",
      time: "1 day ago",
      class: "History 301",
    },
    {
      action: "Perfect score achieved",
      student: "Sarah Wilson",
      time: "2 days ago",
      class: "English 101",
    },
  ],
  classes: [
    {
      id: 1,
      name: "Mathematics 101",
      students: 28,
      schedule: "Mon, Wed, Fri 9:00 AM",
    },
    {id: 2, name: "Science 201", students: 24, schedule: "Tue, Thu 11:00 AM"},
    {id: 3, name: "History 301", students: 32, schedule: "Mon, Wed 2:00 PM"},
  ],
  students: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      grade: "A-",
      attendance: "95%",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      grade: "B+",
      attendance: "92%",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      grade: "B",
      attendance: "88%",
    },
  ],
};

// @route   GET /api/teachers/dashboard
// @desc    Get teacher dashboard data
// @access  Private (Teacher only)
router.get("/dashboard", (req, res) => {
  try {
    res.json({
      success: true,
      data: teacherData,
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/teachers/classes
// @desc    Get teacher's classes
// @access  Private (Teacher only)
router.get("/classes", (req, res) => {
  try {
    res.json({
      success: true,
      data: teacherData.classes,
    });
  } catch (error) {
    console.error("Teacher classes error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/teachers/students
// @desc    Get teacher's students
// @access  Private (Teacher only)
router.get("/students", (req, res) => {
  try {
    res.json({
      success: true,
      data: teacherData.students,
    });
  } catch (error) {
    console.error("Teacher students error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/teachers/classes
// @desc    Create new class
// @access  Private (Teacher only)
router.post("/classes", (req, res) => {
  try {
    const {name, schedule} = req.body;

    if (!name || !schedule) {
      return res
        .status(400)
        .json({message: "Please provide class name and schedule"});
    }

    const newClass = {
      id: teacherData.classes.length + 1,
      name,
      schedule,
      students: 0,
    };

    teacherData.classes.push(newClass);

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

// @route   PUT /api/teachers/classes/:id
// @desc    Update class
// @access  Private (Teacher only)
router.put("/classes/:id", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const {name, schedule} = req.body;

    const classIndex = teacherData.classes.findIndex((c) => c.id === classId);
    if (classIndex === -1) {
      return res.status(404).json({message: "Class not found"});
    }

    if (name) teacherData.classes[classIndex].name = name;
    if (schedule) teacherData.classes[classIndex].schedule = schedule;

    res.json({
      success: true,
      data: teacherData.classes[classIndex],
      message: "Class updated successfully",
    });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   DELETE /api/teachers/classes/:id
// @desc    Delete class
// @access  Private (Teacher only)
router.delete("/classes/:id", (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const classIndex = teacherData.classes.findIndex((c) => c.id === classId);

    if (classIndex === -1) {
      return res.status(404).json({message: "Class not found"});
    }

    teacherData.classes.splice(classIndex, 1);

    res.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Delete class error:", error);
    res.status(500).json({message: "Server error"});
  }
});

module.exports = router;
