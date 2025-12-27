import PDFDocument from "pdfkit";

/**
 * Generate Student Portfolio PDF
 */
export const generatePortfolioPDF = (portfolioData) => {
  const doc = new PDFDocument({ margin: 50 });

  const {
    student,
    className,
    subject,
    attendance,
    quizzes,
    grades,
    assignments,
    overallScore,
    insights,
  } = portfolioData;

  // Header
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Student Portfolio Report", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .font("Helvetica")
    .fillColor("#666")
    .text(`Generated on ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
  doc.moveDown(1);

  // Student Info Box
  doc.rect(50, doc.y, 500, 80).stroke("#ddd");
  const infoY = doc.y + 15;
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text("Student Information", 60, infoY);
  doc.fontSize(11).font("Helvetica");
  doc.text(`Name: ${student.name}`, 60, infoY + 20);
  doc.text(`Email: ${student.email}`, 60, infoY + 35);
  doc.text(`Roll Number: ${student.rollNumber || "N/A"}`, 60, infoY + 50);
  doc.text(`Class: ${className}`, 300, infoY + 20);
  doc.text(`Subject: ${subject}`, 300, infoY + 35);
  doc.moveDown(4);

  // Overall Score
  doc.rect(50, doc.y, 500, 60).fill("#f0f9ff").stroke("#3b82f6");
  const scoreY = doc.y + 15;
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor("#1e40af")
    .text("Overall Performance", 60, scoreY);
  doc
    .fontSize(28)
    .text(`${overallScore?.score || 0}%`, 450, scoreY, { align: "right" });
  doc
    .fontSize(12)
    .font("Helvetica")
    .fillColor("#666")
    .text(`Grade: ${overallScore?.grade || "N/A"}`, 60, scoreY + 25);
  doc.moveDown(3);

  // Performance Breakdown
  doc
    .fillColor("#000")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Performance Breakdown");
  doc.moveDown(0.5);

  const breakdown = overallScore?.breakdown || {};
  const metrics = [
    { label: "Attendance", value: breakdown.attendance || 0, color: "#22c55e" },
    { label: "Quiz Average", value: breakdown.quizzes || 0, color: "#3b82f6" },
    { label: "Grade Average", value: breakdown.grades || 0, color: "#a855f7" },
    {
      label: "Assignment Submission",
      value: breakdown.assignments || 0,
      color: "#f97316",
    },
  ];

  metrics.forEach((metric) => {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`${metric.label}: ${metric.value}%`, 60);
    // Progress bar
    doc.rect(200, doc.y - 10, 300, 12).fill("#e5e7eb");
    doc
      .rect(200, doc.y - 10, (metric.value / 100) * 300, 12)
      .fill(metric.color);
    doc.moveDown(0.8);
  });

  doc.moveDown(1);

  // Attendance Section
  if (attendance) {
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Attendance Summary");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      `Total Days: ${attendance.totalDays}    Present: ${attendance.presentDays}    Absent: ${attendance.absentDays}    Late: ${attendance.lateDays}`
    );
    doc.text(`Attendance Rate: ${attendance.percentage}%`);
    doc.moveDown(1);
  }

  // Quiz Performance
  if (quizzes && quizzes.totalAttempts > 0) {
    doc.fontSize(14).font("Helvetica-Bold").text("Quiz Performance");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Total Quizzes Attempted: ${quizzes.totalAttempts}`);
    doc.text(
      `Average Score: ${quizzes.averageScore}%    Highest: ${quizzes.highestScore}%    Lowest: ${quizzes.lowestScore}%`
    );
    doc.text(
      `Trend: ${
        quizzes.trend === "improving"
          ? "📈 Improving"
          : quizzes.trend === "declining"
          ? "📉 Declining"
          : "➡️ Stable"
      }`
    );
    doc.moveDown(1);
  }

  // Grades
  if (grades && grades.totalGrades > 0) {
    doc.fontSize(14).font("Helvetica-Bold").text("Grade Summary");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      `Total Grades: ${grades.totalGrades}    Average: ${grades.averagePercentage}%`
    );
    doc.moveDown(1);
  }

  // Assignments
  if (assignments) {
    doc.fontSize(14).font("Helvetica-Bold").text("Assignment Summary");
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica");
    doc.text(
      `Total: ${assignments.totalAssignments}    Submitted: ${assignments.submitted}    Pending: ${assignments.pending}    Overdue: ${assignments.overdue}`
    );
    doc.text(`Submission Rate: ${assignments.submissionRate}%`);
    doc.moveDown(1);
  }

  // Insights
  if (insights && insights.length > 0) {
    doc.addPage();
    doc.fontSize(14).font("Helvetica-Bold").text("Insights & Recommendations");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    insights.forEach((insight) => {
      const icon =
        insight.type === "success"
          ? "✓"
          : insight.type === "warning"
          ? "⚠"
          : insight.type === "danger"
          ? "✗"
          : "ℹ";
      doc.text(`${icon} ${insight.message}`);
      doc.moveDown(0.3);
    });
  }

  // Footer
  doc
    .fontSize(8)
    .fillColor("#999")
    .text("Generated by Class Pilot", 50, doc.page.height - 50, {
      align: "center",
    });

  return doc;
};

/**
 * Generate Quiz Results PDF
 */
export const generateQuizResultsPDF = (quizData, attempts) => {
  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("Quiz Results Report", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(12)
    .font("Helvetica")
    .fillColor("#666")
    .text(`Generated on ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
  doc.moveDown(1);

  // Quiz Info
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text("Quiz Information");
  doc.moveDown(0.3);
  doc.fontSize(11).font("Helvetica");
  doc.text(`Topic: ${quizData.topic}`);
  doc.text(`Chapter: ${quizData.chapter || "N/A"}`);
  doc.text(`Total Questions: ${quizData.numberOfQuestions}`);
  doc.text(`Difficulty: ${quizData.difficultyLevel}`);
  doc.moveDown(1);

  // Statistics
  if (attempts.length > 0) {
    const scores = attempts.map((a) => a.percentage);
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);

    doc.fontSize(14).font("Helvetica-Bold").text("Class Statistics");
    doc.moveDown(0.3);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Attempts: ${attempts.length}`);
    doc.text(`Average Score: ${avgScore}%`);
    doc.text(`Highest Score: ${highScore}%`);
    doc.text(`Lowest Score: ${lowScore}%`);
    doc.moveDown(1);

    // Results Table
    doc.fontSize(14).font("Helvetica-Bold").text("Individual Results");
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Student", 50, tableTop);
    doc.text("Score", 250, tableTop);
    doc.text("Percentage", 350, tableTop);
    doc.text("Date", 450, tableTop);
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font("Helvetica");
    attempts.forEach((attempt, i) => {
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
      doc.text(attempt.studentId?.name || "Unknown", 50, y);
      doc.text(`${attempt.score}/${attempt.totalMarks}`, 250, y);
      doc.text(`${attempt.percentage}%`, 350, y);
      doc.text(new Date(attempt.attemptedAt).toLocaleDateString(), 450, y);
      y += 20;
    });
  }

  return doc;
};
