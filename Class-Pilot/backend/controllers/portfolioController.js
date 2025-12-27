import Attendence from "../models/Attendence.js";
import QuizAttempt from "../models/QuizAttempt.js";
// eslint-disable-next-line no-unused-vars
import Quiz from "../models/Quiz.js";
import Grade from "../models/Grade.js";
import Assignment from "../models/Assignment.js";
import Class from "../models/Class.js";
import User from "../models/User.js";

/**
 * Get comprehensive student portfolio with analytics
 * @route GET /api/portfolio/:studentId/:classId
 * @access Private (Teacher or the student themselves)
 */
export const getStudentPortfolio = async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    // Verify access - only the student themselves or a teacher can view
    if (requesterRole === "student" && requesterId !== studentId) {
      return res.status(403).json({
        success: false,
        error: "You can only view your own portfolio",
      });
    }

    // Verify class exists and student is enrolled
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    const student = await User.findById(studentId).select(
      "name email rollNumber"
    );
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Gather all analytics data in parallel
    const [attendanceData, quizData, gradeData, assignmentData] =
      await Promise.all([
        getAttendanceAnalytics(studentId, classId),
        getQuizAnalytics(studentId, classId),
        getGradeAnalytics(studentId, classId),
        getAssignmentAnalytics(studentId, classId),
      ]);

    // Generate insights based on the data
    const insights = generateInsights(
      attendanceData,
      quizData,
      gradeData,
      assignmentData
    );

    // Calculate overall performance score
    const overallScore = calculateOverallScore(
      attendanceData,
      quizData,
      gradeData,
      assignmentData
    );

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
        },
        className: classData.className,
        subject: classData.subject,
        attendance: attendanceData,
        quizzes: quizData,
        grades: gradeData,
        assignments: assignmentData,
        insights,
        overallScore,
      },
    });
  } catch (error) {
    console.error("Portfolio error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch portfolio data",
    });
  }
};

/**
 * Get attendance analytics for a student
 */
const getAttendanceAnalytics = async (studentId, classId) => {
  const records = await Attendence.find({
    classId,
    studentId,
  }).sort({ date: 1 });

  if (records.length === 0) {
    return {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      percentage: 0,
      monthlyTrend: [],
      dayPattern: {},
      alert: null,
    };
  }

  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === "Present").length;
  const absentDays = records.filter((r) => r.status === "Absent").length;
  const lateDays = records.filter((r) => r.status === "Late").length;
  const percentage = Math.round((presentDays / totalDays) * 100);

  // Monthly trend
  const monthlyMap = {};
  records.forEach((record) => {
    const month = new Date(record.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!monthlyMap[month]) {
      monthlyMap[month] = { total: 0, present: 0 };
    }
    monthlyMap[month].total++;
    if (record.status === "Present") {
      monthlyMap[month].present++;
    }
  });

  const monthlyTrend = Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    percentage: Math.round((data.present / data.total) * 100),
    present: data.present,
    total: data.total,
  }));

  // Day pattern analysis (which days are they frequently absent)
  const dayPattern = {
    Monday: { total: 0, absent: 0 },
    Tuesday: { total: 0, absent: 0 },
    Wednesday: { total: 0, absent: 0 },
    Thursday: { total: 0, absent: 0 },
    Friday: { total: 0, absent: 0 },
    Saturday: { total: 0, absent: 0 },
  };

  records.forEach((record) => {
    const day = new Date(record.date).toLocaleString("default", {
      weekday: "long",
    });
    if (dayPattern[day]) {
      dayPattern[day].total++;
      if (record.status === "Absent") {
        dayPattern[day].absent++;
      }
    }
  });

  // Find frequently absent days
  const frequentlyAbsentDays = Object.entries(dayPattern)
    .filter(([, data]) => data.total > 0 && data.absent / data.total > 0.3)
    .map(([day]) => day);

  // Generate alert if attendance is low
  let alert = null;
  if (percentage < 75) {
    alert = {
      type: "danger",
      message: `Attendance is critically low at ${percentage}%. Minimum 75% required.`,
    };
  } else if (percentage < 85) {
    alert = {
      type: "warning",
      message: `Attendance is ${percentage}%. Try to maintain above 85%.`,
    };
  }

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    percentage,
    monthlyTrend,
    frequentlyAbsentDays,
    alert,
  };
};

/**
 * Get quiz analytics for a student
 */
const getQuizAnalytics = async (studentId, classId) => {
  const attempts = await QuizAttempt.find({
    studentId,
    classId,
  })
    .populate("quizId", "topic chapter numberOfQuestions")
    .sort({ attemptedAt: 1 });

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      scores: [],
      trend: "neutral",
      topicPerformance: [],
    };
  }

  const scores = attempts.map((a) => ({
    quizId: a.quizId?._id,
    topic: a.quizId?.topic || "Unknown",
    chapter: a.quizId?.chapter || "Unknown",
    score: a.score,
    totalMarks: a.totalMarks,
    percentage: a.percentage,
    date: a.attemptedAt,
  }));

  const percentages = scores.map((s) => s.percentage);
  const averageScore = Math.round(
    percentages.reduce((a, b) => a + b, 0) / percentages.length
  );
  const highestScore = Math.max(...percentages);
  const lowestScore = Math.min(...percentages);

  // Calculate trend (compare last 3 vs previous 3)
  let trend = "neutral";
  if (scores.length >= 6) {
    const recent3 = percentages.slice(-3);
    const previous3 = percentages.slice(-6, -3);
    const recentAvg = recent3.reduce((a, b) => a + b, 0) / 3;
    const previousAvg = previous3.reduce((a, b) => a + b, 0) / 3;
    if (recentAvg > previousAvg + 5) trend = "improving";
    else if (recentAvg < previousAvg - 5) trend = "declining";
  } else if (scores.length >= 2) {
    const lastTwo = percentages.slice(-2);
    if (lastTwo[1] > lastTwo[0] + 5) trend = "improving";
    else if (lastTwo[1] < lastTwo[0] - 5) trend = "declining";
  }

  // Topic-wise performance
  const topicMap = {};
  scores.forEach((s) => {
    if (!topicMap[s.topic]) {
      topicMap[s.topic] = { total: 0, sum: 0 };
    }
    topicMap[s.topic].total++;
    topicMap[s.topic].sum += s.percentage;
  });

  const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    averageScore: Math.round(data.sum / data.total),
    attempts: data.total,
  }));

  return {
    totalAttempts: attempts.length,
    averageScore,
    highestScore,
    lowestScore,
    scores,
    trend,
    topicPerformance,
  };
};

/**
 * Get grade analytics for a student
 */
const getGradeAnalytics = async (studentId, classId) => {
  const grades = await Grade.find({
    studentId,
    classId,
  }).sort({ createdAt: 1 });

  if (grades.length === 0) {
    return {
      totalGrades: 0,
      averagePercentage: 0,
      gradesByType: {},
      grades: [],
    };
  }

  const gradeData = grades.map((g) => ({
    id: g._id,
    title: g.title,
    type: g.gradeType,
    score: g.score,
    maxScore: g.maxScore,
    percentage: Math.round((g.score / g.maxScore) * 100),
    date: g.createdAt,
  }));

  const percentages = gradeData.map((g) => g.percentage);
  const averagePercentage = Math.round(
    percentages.reduce((a, b) => a + b, 0) / percentages.length
  );

  // Group by type
  const gradesByType = {};
  gradeData.forEach((g) => {
    if (!gradesByType[g.type]) {
      gradesByType[g.type] = { count: 0, totalPercentage: 0 };
    }
    gradesByType[g.type].count++;
    gradesByType[g.type].totalPercentage += g.percentage;
  });

  Object.keys(gradesByType).forEach((type) => {
    gradesByType[type].average = Math.round(
      gradesByType[type].totalPercentage / gradesByType[type].count
    );
  });

  return {
    totalGrades: grades.length,
    averagePercentage,
    gradesByType,
    grades: gradeData,
  };
};

/**
 * Get assignment analytics for a student
 */
const getAssignmentAnalytics = async (studentId, classId) => {
  const assignments = await Assignment.find({ classId });

  if (assignments.length === 0) {
    return {
      totalAssignments: 0,
      submitted: 0,
      pending: 0,
      overdue: 0,
      submissionRate: 0,
      assignments: [],
    };
  }

  const now = new Date();
  let submitted = 0;
  let pending = 0;
  let overdue = 0;

  const assignmentData = assignments.map((a) => {
    const submission = a.submissions?.find(
      (s) => s.studentId?.toString() === studentId.toString()
    );

    let status = "pending";
    if (submission) {
      submitted++;
      status = submission.status === "graded" ? "graded" : "submitted";
    } else if (new Date(a.dueDate) < now) {
      overdue++;
      status = "overdue";
    } else {
      pending++;
    }

    return {
      id: a._id,
      title: a.title,
      dueDate: a.dueDate,
      totalMarks: a.totalMarks,
      status,
      submittedAt: submission?.submittedAt,
      grade: submission?.grade,
    };
  });

  const submissionRate = Math.round((submitted / assignments.length) * 100);

  return {
    totalAssignments: assignments.length,
    submitted,
    pending,
    overdue,
    submissionRate,
    assignments: assignmentData,
  };
};

/**
 * Generate insights based on all analytics data
 */
const generateInsights = (attendance, quizzes, grades, assignments) => {
  const insights = [];

  // Attendance insights
  if (attendance.percentage > 0) {
    if (attendance.percentage < 75) {
      insights.push({
        type: "danger",
        category: "attendance",
        message: `⚠️ Critical: Attendance is only ${attendance.percentage}%. You need at least 75% to be eligible for exams.`,
      });
    } else if (attendance.percentage < 85) {
      insights.push({
        type: "warning",
        category: "attendance",
        message: `📊 Your attendance is ${attendance.percentage}%. Try to maintain above 85% for better performance.`,
      });
    } else {
      insights.push({
        type: "success",
        category: "attendance",
        message: `✅ Great attendance! You're at ${attendance.percentage}%. Keep it up!`,
      });
    }

    if (attendance.frequentlyAbsentDays?.length > 0) {
      insights.push({
        type: "info",
        category: "attendance",
        message: `📅 Pattern detected: You're frequently absent on ${attendance.frequentlyAbsentDays.join(
          ", "
        )}.`,
      });
    }

    // Monthly trend analysis
    if (attendance.monthlyTrend?.length >= 2) {
      const recent =
        attendance.monthlyTrend[attendance.monthlyTrend.length - 1];
      const previous =
        attendance.monthlyTrend[attendance.monthlyTrend.length - 2];
      const diff = recent.percentage - previous.percentage;
      if (diff < -10) {
        insights.push({
          type: "warning",
          category: "attendance",
          message: `📉 Your attendance dropped by ${Math.abs(
            diff
          )}% this month compared to last month.`,
        });
      }
    }
  }

  // Quiz insights
  if (quizzes.totalAttempts > 0) {
    if (quizzes.trend === "improving") {
      insights.push({
        type: "success",
        category: "quiz",
        message: `📈 Quiz performance is improving! Keep up the good work!`,
      });
    } else if (quizzes.trend === "declining") {
      insights.push({
        type: "warning",
        category: "quiz",
        message: `📉 Quiz scores are declining. Consider reviewing recent topics.`,
      });
    }

    // Find weak topics (below 60%)
    const weakTopics = quizzes.topicPerformance?.filter(
      (t) => t.averageScore < 60
    );
    if (weakTopics?.length > 0) {
      insights.push({
        type: "info",
        category: "quiz",
        message: `📚 Weak areas: ${weakTopics
          .map((t) => `${t.topic} (${t.averageScore}%)`)
          .join(", ")}. Focus on these topics.`,
      });
    }

    if (quizzes.averageScore >= 80) {
      insights.push({
        type: "success",
        category: "quiz",
        message: `🌟 Excellent quiz average of ${quizzes.averageScore}%! You're doing great!`,
      });
    }
  }

  // Assignment insights
  if (assignments.totalAssignments > 0) {
    if (assignments.overdue > 0) {
      insights.push({
        type: "danger",
        category: "assignment",
        message: `⚠️ You have ${assignments.overdue} overdue assignment(s). Submit them ASAP!`,
      });
    }

    if (assignments.submissionRate < 70) {
      insights.push({
        type: "warning",
        category: "assignment",
        message: `📝 Assignment submission rate is only ${assignments.submissionRate}%. Try to submit all assignments on time.`,
      });
    } else if (assignments.submissionRate === 100) {
      insights.push({
        type: "success",
        category: "assignment",
        message: `✅ Perfect! All assignments submitted on time!`,
      });
    }
  }

  // Overall grade insights
  if (grades.totalGrades > 0) {
    if (grades.averagePercentage >= 80) {
      insights.push({
        type: "success",
        category: "grades",
        message: `🏆 Outstanding academic performance with ${grades.averagePercentage}% average!`,
      });
    } else if (grades.averagePercentage < 50) {
      insights.push({
        type: "danger",
        category: "grades",
        message: `📊 Grade average is ${grades.averagePercentage}%. Consider seeking help from your teacher.`,
      });
    }
  }

  return insights;
};

/**
 * Calculate overall performance score (0-100)
 */
const calculateOverallScore = (attendance, quizzes, grades, assignments) => {
  let score = 0;
  let weights = 0;

  // Attendance (25% weight)
  if (attendance.totalDays > 0) {
    score += attendance.percentage * 0.25;
    weights += 0.25;
  }

  // Quiz performance (35% weight)
  if (quizzes.totalAttempts > 0) {
    score += quizzes.averageScore * 0.35;
    weights += 0.35;
  }

  // Grades (25% weight)
  if (grades.totalGrades > 0) {
    score += grades.averagePercentage * 0.25;
    weights += 0.25;
  }

  // Assignment submission (15% weight)
  if (assignments.totalAssignments > 0) {
    score += assignments.submissionRate * 0.15;
    weights += 0.15;
  }

  // Normalize if not all data available
  if (weights > 0) {
    score = Math.round(score / weights);
  }

  return {
    score,
    grade: getLetterGrade(score),
    breakdown: {
      attendance: attendance.percentage || 0,
      quizzes: quizzes.averageScore || 0,
      grades: grades.averagePercentage || 0,
      assignments: assignments.submissionRate || 0,
    },
  };
};

const getLetterGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 80) return "B+";
  if (percentage >= 75) return "B";
  if (percentage >= 70) return "C+";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

/**
 * Get class-wide analytics for comparison (teacher only)
 * @route GET /api/portfolio/class/:classId/analytics
 */
export const getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;

    const classData = await Class.findById(classId).populate(
      "students",
      "name email rollNumber"
    );
    if (!classData) {
      return res.status(404).json({ success: false, error: "Class not found" });
    }

    // Get all quiz attempts for the class
    const allAttempts = await QuizAttempt.find({ classId });
    const classQuizAverage =
      allAttempts.length > 0
        ? Math.round(
            allAttempts.reduce((sum, a) => sum + a.percentage, 0) /
              allAttempts.length
          )
        : 0;

    // Get attendance stats
    const allAttendance = await Attendence.find({ classId });
    const presentCount = allAttendance.filter(
      (a) => a.status === "Present"
    ).length;
    const classAttendanceAverage =
      allAttendance.length > 0
        ? Math.round((presentCount / allAttendance.length) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        className: classData.className,
        totalStudents: classData.students?.length || 0,
        classQuizAverage,
        classAttendanceAverage,
      },
    });
  } catch (error) {
    console.error("Class analytics error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch class analytics" });
  }
};
