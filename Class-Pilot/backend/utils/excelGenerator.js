import ExcelJS from "exceljs";

/**
 * Generate Attendance Report Excel
 */
export const generateAttendanceExcel = async (
  classData,
  attendanceRecords,
  stats
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Class Pilot";
  workbook.created = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Student Name", key: "name", width: 25 },
    { header: "Roll Number", key: "rollNumber", width: 15 },
    { header: "Email", key: "email", width: 30 },
    { header: "Present", key: "present", width: 10 },
    { header: "Absent", key: "absent", width: 10 },
    { header: "Late", key: "late", width: 10 },
    { header: "Total Days", key: "total", width: 12 },
    { header: "Percentage", key: "percentage", width: 12 },
  ];

  // Style header
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  };
  summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Add data
  stats.forEach((stat) => {
    const row = summarySheet.addRow({
      name: stat.name,
      rollNumber: stat.rollNumber || "N/A",
      email: stat.email || "",
      present: stat.present || 0,
      absent: stat.absent || 0,
      late: stat.late || 0,
      total: stat.total || 0,
      percentage: stat.percentage || 0,
    });

    // Color code percentage
    const percentCell = row.getCell("percentage");
    if (stat.percentage >= 75) {
      percentCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF22C55E" },
      };
    } else if (stat.percentage >= 50) {
      percentCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEAB308" },
      };
    } else {
      percentCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEF4444" },
      };
    }
  });

  // Daily Attendance Sheet
  const dailySheet = workbook.addWorksheet("Daily Records");

  // Get unique dates
  const dates = [
    ...new Set(
      attendanceRecords.map((r) => new Date(r.date).toISOString().split("T")[0])
    ),
  ].sort();

  // Create columns
  const dailyColumns = [
    { header: "Student Name", key: "name", width: 25 },
    { header: "Roll Number", key: "rollNumber", width: 15 },
  ];
  dates.forEach((date) => {
    dailyColumns.push({ header: date, key: date, width: 12 });
  });
  dailySheet.columns = dailyColumns;

  // Style header
  dailySheet.getRow(1).font = { bold: true };
  dailySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  };
  dailySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Group attendance by student
  const studentAttendance = {};
  attendanceRecords.forEach((record) => {
    const studentId =
      record.studentId?._id?.toString() || record.studentId?.toString();
    if (!studentAttendance[studentId]) {
      studentAttendance[studentId] = {
        name: record.studentId?.name || "Unknown",
        rollNumber: record.studentId?.rollNumber || "N/A",
        dates: {},
      };
    }
    const dateKey = new Date(record.date).toISOString().split("T")[0];
    studentAttendance[studentId].dates[dateKey] = record.status;
  });

  // Add rows
  Object.values(studentAttendance).forEach((student) => {
    const rowData = {
      name: student.name,
      rollNumber: student.rollNumber,
    };
    dates.forEach((date) => {
      rowData[date] = student.dates[date] || "-";
    });
    const row = dailySheet.addRow(rowData);

    // Color code status cells
    dates.forEach((date, idx) => {
      const cell = row.getCell(idx + 3);
      const status = student.dates[date];
      if (status === "Present") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF22C55E" },
        };
      } else if (status === "Absent") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEF4444" },
        };
      } else if (status === "Late") {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEAB308" },
        };
      }
    });
  });

  return workbook;
};

/**
 * Generate Grades Report Excel
 */
export const generateGradesExcel = async (classData, grades, students) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Class Pilot";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Grades");

  // Get unique grade titles/types
  const gradeTypes = [...new Set(grades.map((g) => g.title))];

  // Create columns
  const columns = [
    { header: "Student Name", key: "name", width: 25 },
    { header: "Roll Number", key: "rollNumber", width: 15 },
    { header: "Email", key: "email", width: 30 },
  ];
  gradeTypes.forEach((type) => {
    columns.push({ header: type, key: type, width: 15 });
  });
  columns.push({ header: "Average", key: "average", width: 12 });
  sheet.columns = columns;

  // Style header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA855F7" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Group grades by student
  const studentGrades = {};
  grades.forEach((grade) => {
    const studentId =
      grade.studentId?._id?.toString() || grade.studentId?.toString();
    if (!studentGrades[studentId]) {
      studentGrades[studentId] = {
        name: grade.studentId?.name || "Unknown",
        rollNumber: grade.studentId?.rollNumber || "N/A",
        email: grade.studentId?.email || "",
        grades: {},
      };
    }
    const percentage = Math.round((grade.score / grade.maxScore) * 100);
    studentGrades[studentId].grades[
      grade.title
    ] = `${grade.score}/${grade.maxScore} (${percentage}%)`;
  });

  // Add rows
  Object.values(studentGrades).forEach((student) => {
    const rowData = {
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
    };

    let totalPercentage = 0;
    let gradeCount = 0;

    gradeTypes.forEach((type) => {
      rowData[type] = student.grades[type] || "-";
      if (student.grades[type] && student.grades[type] !== "-") {
        const match = student.grades[type].match(/\((\d+)%\)/);
        if (match) {
          totalPercentage += parseInt(match[1]);
          gradeCount++;
        }
      }
    });

    rowData.average =
      gradeCount > 0 ? `${Math.round(totalPercentage / gradeCount)}%` : "-";
    sheet.addRow(rowData);
  });

  return workbook;
};

/**
 * Generate Quiz Results Excel
 */
export const generateQuizResultsExcel = async (quizData, attempts) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Class Pilot";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Quiz Results");
  sheet.columns = [
    { header: "Student Name", key: "name", width: 25 },
    { header: "Roll Number", key: "rollNumber", width: 15 },
    { header: "Score", key: "score", width: 12 },
    { header: "Total Marks", key: "totalMarks", width: 12 },
    { header: "Percentage", key: "percentage", width: 12 },
    { header: "Time Taken (min)", key: "timeTaken", width: 15 },
    { header: "Attempted At", key: "attemptedAt", width: 20 },
  ];

  // Style header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF22C55E" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Add data
  attempts.forEach((attempt) => {
    const row = sheet.addRow({
      name: attempt.studentId?.name || "Unknown",
      rollNumber: attempt.studentId?.rollNumber || "N/A",
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      timeTaken: attempt.timeTaken ? Math.round(attempt.timeTaken / 60) : "-",
      attemptedAt: new Date(attempt.attemptedAt).toLocaleString(),
    });

    // Color code percentage
    const percentCell = row.getCell("percentage");
    if (attempt.percentage >= 80) {
      percentCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF22C55E" },
      };
    } else if (attempt.percentage >= 60) {
      percentCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEAB308" },
      };
    } else {
      percentCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEF4444" },
      };
    }
  });

  // Add summary row
  if (attempts.length > 0) {
    sheet.addRow({});
    const scores = attempts.map((a) => a.percentage);
    sheet.addRow({
      name: "SUMMARY",
      rollNumber: "",
      score: "",
      totalMarks: "",
      percentage: `Avg: ${Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      )}%`,
      timeTaken: "",
      attemptedAt: `Total: ${attempts.length} attempts`,
    });
  }

  return workbook;
};
