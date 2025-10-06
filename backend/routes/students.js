const express = require("express");
const router = express.Router();

// Mock student data
const studentData = {
  stats: {
    enrolledCourses: 6,
    completedAssignments: 18,
    pendingTasks: 4,
    overallGPA: "3.8",
  },
  upcomingAssignments: [
    {
      id: 1,
      title: "Math Quiz Chapter 5",
      subject: "Mathematics",
      dueDate: "Tomorrow",
      priority: "high",
    },
    {
      id: 2,
      title: "Science Lab Report",
      subject: "Physics",
      dueDate: "Jan 15",
      priority: "medium",
    },
    {
      id: 3,
      title: "History Essay",
      subject: "World History",
      dueDate: "Jan 18",
      priority: "low",
    },
    {
      id: 4,
      title: "English Presentation",
      subject: "Literature",
      dueDate: "Jan 20",
      priority: "medium",
    },
  ],
  recentGrades: [
    {
      id: 1,
      subject: "Mathematics",
      assignment: "Algebra Test",
      grade: "A-",
      score: "92%",
      date: "Jan 8",
    },
    {
      id: 2,
      subject: "Science",
      assignment: "Chemistry Lab",
      grade: "B+",
      score: "87%",
      date: "Jan 6",
    },
    {
      id: 3,
      subject: "English",
      assignment: "Essay Writing",
      grade: "A",
      score: "95%",
      date: "Jan 4",
    },
    {
      id: 4,
      subject: "History",
      assignment: "Timeline Project",
      grade: "B",
      score: "84%",
      date: "Jan 2",
    },
  ],
  todaySchedule: [
    {
      id: 1,
      subject: "Mathematics",
      time: "9:00 AM - 10:00 AM",
      teacher: "Mr. Johnson",
      room: "Room 204",
    },
    {
      id: 2,
      subject: "Physics",
      time: "10:30 AM - 11:30 AM",
      teacher: "Dr. Smith",
      room: "Lab 3",
    },
    {
      id: 3,
      subject: "English",
      time: "1:00 PM - 2:00 PM",
      teacher: "Ms. Davis",
      room: "Room 101",
    },
    {
      id: 4,
      subject: "History",
      time: "2:30 PM - 3:30 PM",
      teacher: "Mr. Wilson",
      room: "Room 105",
    },
  ],
  courses: [
    {
      id: 1,
      name: "Mathematics 101",
      teacher: "Mr. Johnson",
      progress: 75,
      grade: "A-",
    },
    {
      id: 2,
      name: "Physics 201",
      teacher: "Dr. Smith",
      progress: 68,
      grade: "B+",
    },
    {
      id: 3,
      name: "English Literature",
      teacher: "Ms. Davis",
      progress: 82,
      grade: "A",
    },
    {
      id: 4,
      name: "World History",
      teacher: "Mr. Wilson",
      progress: 60,
      grade: "B",
    },
  ],
};

// @route   GET /api/students/dashboard
// @desc    Get student dashboard data
// @access  Private (Student only)
router.get("/dashboard", (req, res) => {
  try {
    res.json({
      success: true,
      data: studentData,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/students/courses
// @desc    Get student's enrolled courses
// @access  Private (Student only)
router.get("/courses", (req, res) => {
  try {
    res.json({
      success: true,
      data: studentData.courses,
    });
  } catch (error) {
    console.error("Student courses error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/students/assignments
// @desc    Get student's assignments
// @access  Private (Student only)
router.get("/assignments", (req, res) => {
  try {
    res.json({
      success: true,
      data: studentData.upcomingAssignments,
    });
  } catch (error) {
    console.error("Student assignments error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/students/grades
// @desc    Get student's grades
// @access  Private (Student only)
router.get("/grades", (req, res) => {
  try {
    res.json({
      success: true,
      data: studentData.recentGrades,
    });
  } catch (error) {
    console.error("Student grades error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/students/schedule
// @desc    Get student's class schedule
// @access  Private (Student only)
router.get("/schedule", (req, res) => {
  try {
    res.json({
      success: true,
      data: studentData.todaySchedule,
    });
  } catch (error) {
    console.error("Student schedule error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/students/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student only)
router.post("/assignments/:id/submit", (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const {submission} = req.body;

    if (!submission) {
      return res
        .status(400)
        .json({message: "Please provide submission content"});
    }

    const assignment = studentData.upcomingAssignments.find(
      (a) => a.id === assignmentId
    );
    if (!assignment) {
      return res.status(404).json({message: "Assignment not found"});
    }

    // Mock submission process
    res.json({
      success: true,
      message: "Assignment submitted successfully",
      data: {
        assignmentId,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      },
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/students/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private (Student only)
router.post("/courses/:id/enroll", (req, res) => {
  try {
    const courseId = parseInt(req.params.id);

    // Check if already enrolled
    const isEnrolled = studentData.courses.some((c) => c.id === courseId);
    if (isEnrolled) {
      return res.status(400).json({message: "Already enrolled in this course"});
    }

    // Mock course enrollment
    const newCourse = {
      id: courseId,
      name: "New Course",
      teacher: "TBD",
      progress: 0,
      grade: "N/A",
    };

    studentData.courses.push(newCourse);

    res.json({
      success: true,
      message: "Successfully enrolled in course",
      data: newCourse,
    });
  } catch (error) {
    console.error("Course enrollment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

module.exports = router;
