import {
  generatePortfolioPDF,
  generateQuizResultsPDF,
} from "../utils/pdfGenerator.js";
import {
  generateAttendanceExcel,
  generateGradesExcel,
  generateQuizResultsExcel,
} from "../utils/excelGenerator.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import Attendence from "../models/Attendence.js";
import Grade from "../models/Grade.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Assignment from "../models/Assignment.js";

/**
 * @desc    Export student portfolio as PDF
 * @route   GET /api/export/portfolio/:studentId/:classId
 * @access  Private (Teacher or the student)
 */
export const exportPortfolioPDF = async (req, res) => {
  try {
    const { studentId, classId } = req.params;

    // Verify access
    if (req.user.role === "student" && req.user.id !== studentId) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const [student, classData] = await Promise.all([
      User.findById(studentId).select("name email rollNumber"),
      Class.findById(classId),
    ]);

    if (!student || !classData) {
      return res
        .status(404)
        .json({ success: false, error: "Student or class not found" });
    }

    // Gather portfolio data
    const [attendanceRecords, quizAttempts, grades, assignments] =
      await Promise.all([
        Attendence.find({ studentId, classId }),
        QuizAttempt.find({ studentId, classId }).populate("quizId", "topic"),
        Grade.find({ studentId, classId }),
        Assignment.find({ classId }),
      ]);

    // Calculate attendance
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (r) => r.status === "Present"
    ).length;
    const absentDays = attendanceRecords.filter(
      (r) => r.status === "Absent"
    ).length;
    const lateDays = attendanceRecords.filter(
      (r) => r.status === "Late"
    ).length;

    // Calculate quiz stats
    const quizPercentages = quizAttempts.map((a) => a.percentage);
    const quizAvg =
      quizPercentages.length > 0
        ? Math.round(
            quizPercentages.reduce((a, b) => a + b, 0) / quizPercentages.length
          )
        : 0;

    // Calculate grade stats
    const gradePercentages = grades.map((g) =>
      Math.round((g.score / g.maxScore) * 100)
    );
    const gradeAvg =
      gradePercentages.length > 0
        ? Math.round(
            gradePercentages.reduce((a, b) => a + b, 0) /
              gradePercentages.length
          )
        : 0;

    // Calculate assignment stats
    const submitted = assignments.filter((a) =>
      a.submissions?.some((s) => s.studentId?.toString() === studentId)
    ).length;

    const portfolioData = {
      student: {
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
      },
      className: classData.className,
      subject: classData.subject,
      attendance: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        percentage:
          totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      },
      quizzes: {
        totalAttempts: quizAttempts.length,
        averageScore: quizAvg,
        highestScore:
          quizPercentages.length > 0 ? Math.max(...quizPercentages) : 0,
        lowestScore:
          quizPercentages.length > 0 ? Math.min(...quizPercentages) : 0,
        trend: "stable",
      },
      grades: {
        totalGrades: grades.length,
        averagePercentage: gradeAvg,
      },
      assignments: {
        totalAssignments: assignments.length,
        submitted,
        pending: assignments.length - submitted,
        overdue: 0,
        submissionRate:
          assignments.length > 0
            ? Math.round((submitted / assignments.length) * 100)
            : 0,
      },
      overallScore: {
        score: Math.round(
          (totalDays > 0 ? (presentDays / totalDays) * 100 : 0) * 0.25 +
            quizAvg * 0.35 +
            gradeAvg * 0.25 +
            (assignments.length > 0
              ? (submitted / assignments.length) * 100
              : 0) *
              0.15
        ),
        grade: "B",
        breakdown: {
          attendance:
            totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
          quizzes: quizAvg,
          grades: gradeAvg,
          assignments:
            assignments.length > 0
              ? Math.round((submitted / assignments.length) * 100)
              : 0,
        },
      },
      insights: [],
    };

    const doc = generatePortfolioPDF(portfolioData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=portfolio_${student.name.replace(/\s+/g, "_")}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Export portfolio error:", error);
    res.status(500).json({ success: false, error: "Failed to generate PDF" });
  }
};

/**
 * @desc    Export class attendance as Excel
 * @route   GET /api/export/attendance/:classId
 * @access  Private (Teacher only)
 */
export const exportAttendanceExcel = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId).populate(
      "students",
      "name email rollNumber"
    );
    if (!classData) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const attendanceRecords = await Attendence.find({ classId })
      .populate("studentId", "name email rollNumber")
      .sort({ date: 1 });

    // Calculate stats per student
    const statsMap = {};
    classData.students.forEach((student) => {
      statsMap[student._id.toString()] = {
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
        percentage: 0,
      };
    });

    attendanceRecords.forEach((record) => {
      const studentId =
        record.studentId?._id?.toString() || record.studentId?.toString();
      if (statsMap[studentId]) {
        statsMap[studentId].total++;
        if (record.status === "Present") statsMap[studentId].present++;
        else if (record.status === "Absent") statsMap[studentId].absent++;
        else if (record.status === "Late") statsMap[studentId].late++;
      }
    });

    Object.values(statsMap).forEach((stat) => {
      stat.percentage =
        stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0;
    });

    const workbook = await generateAttendanceExcel(
      classData,
      attendanceRecords,
      Object.values(statsMap)
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_${classData.className.replace(
        /\s+/g,
        "_"
      )}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export attendance error:", error);
    res.status(500).json({ success: false, error: "Failed to generate Excel" });
  }
};

/**
 * @desc    Export class grades as Excel
 * @route   GET /api/export/grades/:classId
 * @access  Private (Teacher only)
 */
export const exportGradesExcel = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId).populate(
      "students",
      "name email rollNumber"
    );
    if (!classData) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const grades = await Grade.find({ classId })
      .populate("studentId", "name email rollNumber")
      .sort({ createdAt: -1 });

    const workbook = await generateGradesExcel(
      classData,
      grades,
      classData.students
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=grades_${classData.className.replace(
        /\s+/g,
        "_"
      )}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export grades error:", error);
    res.status(500).json({ success: false, error: "Failed to generate Excel" });
  }
};

/**
 * @desc    Export quiz results as PDF or Excel
 * @route   GET /api/export/quiz/:quizId
 * @access  Private (Teacher only)
 */
export const exportQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { format = "excel" } = req.query;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, error: "Quiz not found" });
    }

    const classData = await Class.findById(quiz.classId);
    if (classData.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const attempts = await QuizAttempt.find({ quizId })
      .populate("studentId", "name email rollNumber")
      .sort({ attemptedAt: -1 });

    if (format === "pdf") {
      const doc = generateQuizResultsPDF(quiz, attempts);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=quiz_${quiz.topic.replace(/\s+/g, "_")}.pdf`
      );
      doc.pipe(res);
      doc.end();
    } else {
      const workbook = await generateQuizResultsExcel(quiz, attempts);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=quiz_${quiz.topic.replace(/\s+/g, "_")}.xlsx`
      );
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    console.error("Export quiz error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate export" });
  }
};
