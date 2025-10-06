const express = require("express");
const router = express.Router();

// Mock assignments data
const assignmentsData = [
  {
    id: 1,
    title: "Algebra Basics",
    description: "Complete exercises 1-20 from Chapter 3",
    classId: 1,
    className: "Mathematics 101",
    teacherId: 1,
    teacherName: "Mr. Johnson",
    dueDate: "2025-01-15T23:59:00Z",
    createdAt: "2025-01-08T10:00:00Z",
    status: "active",
    maxPoints: 100,
    submissions: [
      {
        studentId: 1,
        studentName: "John Doe",
        submittedAt: "2025-01-10T14:30:00Z",
        score: 92,
        status: "graded",
      },
      {
        studentId: 2,
        studentName: "Jane Smith",
        submittedAt: null,
        score: null,
        status: "pending",
      },
    ],
  },
  {
    id: 2,
    title: "Linear Equations",
    description: "Solve the linear equation problems in the worksheet",
    classId: 1,
    className: "Mathematics 101",
    teacherId: 1,
    teacherName: "Mr. Johnson",
    dueDate: "2025-01-22T23:59:00Z",
    createdAt: "2025-01-10T09:00:00Z",
    status: "draft",
    maxPoints: 100,
    submissions: [],
  },
  {
    id: 3,
    title: "Motion and Forces",
    description: "Lab report on Newton's laws of motion experiment",
    classId: 2,
    className: "Physics 201",
    teacherId: 2,
    teacherName: "Dr. Smith",
    dueDate: "2025-01-18T23:59:00Z",
    createdAt: "2025-01-09T11:00:00Z",
    status: "active",
    maxPoints: 150,
    submissions: [
      {
        studentId: 2,
        studentName: "Jane Smith",
        submittedAt: "2025-01-11T16:45:00Z",
        score: 87,
        status: "graded",
      },
    ],
  },
  {
    id: 4,
    title: "Shakespeare Analysis",
    description: "Write a 500-word analysis of Hamlet's soliloquy",
    classId: 3,
    className: "English Literature",
    teacherId: 3,
    teacherName: "Ms. Davis",
    dueDate: "2025-01-20T23:59:00Z",
    createdAt: "2025-01-12T13:00:00Z",
    status: "active",
    maxPoints: 100,
    submissions: [],
  },
];

// @route   GET /api/assignments
// @desc    Get all assignments (with optional filters)
// @access  Private
router.get("/", (req, res) => {
  try {
    const {classId, teacherId, studentId, status} = req.query;
    let filteredAssignments = [...assignmentsData];

    // Filter by class
    if (classId) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.classId === parseInt(classId)
      );
    }

    // Filter by teacher
    if (teacherId) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.teacherId === parseInt(teacherId)
      );
    }

    // Filter by status
    if (status) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.status === status
      );
    }

    // If studentId is provided, include submission status for that student
    if (studentId) {
      filteredAssignments = filteredAssignments.map((assignment) => {
        const submission = assignment.submissions.find(
          (s) => s.studentId === parseInt(studentId)
        );
        return {
          ...assignment,
          studentSubmission: submission || null,
        };
      });
    }

    res.json({
      success: true,
      data: filteredAssignments,
      count: filteredAssignments.length,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   GET /api/assignments/:id
// @desc    Get single assignment by ID
// @access  Private
router.get("/:id", (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const assignment = assignmentsData.find((a) => a.id === assignmentId);

    if (!assignment) {
      return res.status(404).json({message: "Assignment not found"});
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Teacher only)
router.post("/", (req, res) => {
  try {
    const {title, description, classId, dueDate, maxPoints, status} = req.body;

    if (!title || !classId || !dueDate) {
      return res.status(400).json({
        message: "Please provide title, class ID, and due date",
      });
    }

    const newAssignment = {
      id: assignmentsData.length + 1,
      title,
      description: description || "",
      classId: parseInt(classId),
      className: "Class Name", // Would be fetched from classId
      teacherId: 1, // Would come from authenticated user
      teacherName: "Teacher Name", // Would be fetched from teacherId
      dueDate,
      createdAt: new Date().toISOString(),
      status: status || "draft",
      maxPoints: maxPoints || 100,
      submissions: [],
    };

    assignmentsData.push(newAssignment);

    res.status(201).json({
      success: true,
      data: newAssignment,
      message: "Assignment created successfully",
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher only)
router.put("/:id", (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const {title, description, dueDate, maxPoints, status} = req.body;

    const assignmentIndex = assignmentsData.findIndex(
      (a) => a.id === assignmentId
    );
    if (assignmentIndex === -1) {
      return res.status(404).json({message: "Assignment not found"});
    }

    // Update assignment data
    if (title) assignmentsData[assignmentIndex].title = title;
    if (description) assignmentsData[assignmentIndex].description = description;
    if (dueDate) assignmentsData[assignmentIndex].dueDate = dueDate;
    if (maxPoints) assignmentsData[assignmentIndex].maxPoints = maxPoints;
    if (status) assignmentsData[assignmentIndex].status = status;

    res.json({
      success: true,
      data: assignmentsData[assignmentIndex],
      message: "Assignment updated successfully",
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher only)
router.delete("/:id", (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const assignmentIndex = assignmentsData.findIndex(
      (a) => a.id === assignmentId
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({message: "Assignment not found"});
    }

    assignmentsData.splice(assignmentIndex, 1);

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment (student)
// @access  Private (Student only)
router.post("/:id/submit", (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const {studentId, studentName, submission} = req.body;

    if (!studentId || !submission) {
      return res.status(400).json({
        message: "Please provide student ID and submission content",
      });
    }

    const assignmentIndex = assignmentsData.findIndex(
      (a) => a.id === assignmentId
    );
    if (assignmentIndex === -1) {
      return res.status(404).json({message: "Assignment not found"});
    }

    const assignment = assignmentsData[assignmentIndex];

    // Check if student already submitted
    const existingSubmissionIndex = assignment.submissions.findIndex(
      (s) => s.studentId === studentId
    );

    const submissionData = {
      studentId,
      studentName: studentName || "Student",
      submittedAt: new Date().toISOString(),
      submission,
      score: null,
      status: "submitted",
    };

    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      assignment.submissions[existingSubmissionIndex] = submissionData;
    } else {
      // Add new submission
      assignment.submissions.push(submissionData);
    }

    res.json({
      success: true,
      message: "Assignment submitted successfully",
      data: submissionData,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

// @route   PUT /api/assignments/:id/grade
// @desc    Grade assignment submission (teacher)
// @access  Private (Teacher only)
router.put("/:id/grade", (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const {studentId, score, feedback} = req.body;

    if (!studentId || score === undefined) {
      return res.status(400).json({
        message: "Please provide student ID and score",
      });
    }

    const assignmentIndex = assignmentsData.findIndex(
      (a) => a.id === assignmentId
    );
    if (assignmentIndex === -1) {
      return res.status(404).json({message: "Assignment not found"});
    }

    const assignment = assignmentsData[assignmentIndex];
    const submissionIndex = assignment.submissions.findIndex(
      (s) => s.studentId === studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({message: "Submission not found"});
    }

    // Update submission with grade
    assignment.submissions[submissionIndex].score = score;
    assignment.submissions[submissionIndex].feedback = feedback;
    assignment.submissions[submissionIndex].status = "graded";
    assignment.submissions[submissionIndex].gradedAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Assignment graded successfully",
      data: assignment.submissions[submissionIndex],
    });
  } catch (error) {
    console.error("Grade assignment error:", error);
    res.status(500).json({message: "Server error"});
  }
});

module.exports = router;
