// Comprehensive Feature Test Script
// Run: node test-all-features.js

import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "http://localhost:5000";

// Test data storage
let teacherToken = null;
let studentTokens = [];
let classId = null;
let classCode = null;
let studentIds = [];
let quizId = null;

// Helper function for API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data, ok: res.ok };
  } catch (error) {
    return { status: 500, data: { error: error.message }, ok: false };
  }
}

// Test results tracker
const results = [];
function logTest(name, passed, details = "") {
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}: ${name}${details ? ` - ${details}` : ""}`);
  results.push({ name, passed, details });
}

async function runTests() {
  console.log("\n🧪 CLASS PILOT - COMPREHENSIVE FEATURE TEST\n");
  console.log("=".repeat(50));

  // ============ PHASE 1: AUTHENTICATION ============
  console.log("\n📋 PHASE 1: AUTHENTICATION\n");

  // Test 1: Register Teacher
  const teacherData = {
    email: `teacher_${Date.now()}@test.com`,
    password: "teacher123",
    name: "Mr. Test Teacher",
    role: "teacher",
    schoolName: "Test School",
  };
  let res = await apiCall("POST", "/api/auth/register", teacherData);
  if (res.ok && res.data.token) {
    teacherToken = res.data.token;
    logTest("Teacher Registration", true);
  } else {
    logTest("Teacher Registration", false, res.data.message || res.data.error);
  }

  // Test 2: Register Students
  for (let i = 1; i <= 3; i++) {
    const studentData = {
      email: `student${i}_${Date.now()}@test.com`,
      password: "student123",
      name: `Student ${i}`,
      role: "student",
      rollNumber: `10${i}`,
    };
    res = await apiCall("POST", "/api/auth/register", studentData);
    if (res.ok && res.data.token) {
      studentTokens.push(res.data.token);
      studentIds.push(res.data.user?._id || res.data.user?.id);
      logTest(`Student ${i} Registration`, true);
    } else {
      logTest(`Student ${i} Registration`, false, res.data.message);
    }
  }

  // Test 3: Teacher Login
  res = await apiCall("POST", "/api/auth/login", {
    email: teacherData.email,
    password: teacherData.password,
  });
  logTest("Teacher Login", res.ok && res.data.token);

  // Test 4: Get Me (Auth check)
  res = await apiCall("GET", "/api/auth/me", null, teacherToken);
  logTest("Get Current User (Teacher)", res.ok && res.data.user);

  // ============ PHASE 2: CLASS MANAGEMENT ============
  console.log("\n📋 PHASE 2: CLASS MANAGEMENT\n");

  // Test 5: Create Class
  res = await apiCall(
    "POST",
    "/api/class/create",
    {
      className: "10th A - Test",
      subject: "Mathematics",
      board: "CBSE",
    },
    teacherToken
  );
  if (res.ok && res.data.class) {
    classId = res.data.class._id;
    classCode = res.data.class.classCode;
    logTest("Create Class", true, `Code: ${classCode}`);
  } else {
    logTest("Create Class", false, res.data.message);
  }

  // Test 6: Get Teacher Classes
  res = await apiCall("GET", "/api/class/teacher", null, teacherToken);
  logTest("Get Teacher Classes", res.ok && res.data.classes?.length > 0);

  // Test 7: Students Join Class
  for (let i = 0; i < studentTokens.length; i++) {
    res = await apiCall(
      "POST",
      "/api/class/join",
      { classCode },
      studentTokens[i]
    );
    logTest(
      `Student ${i + 1} Join Class`,
      res.ok || res.data.message === "Already joined"
    );
  }

  // Test 8: Get Class Details
  res = await apiCall("GET", `/api/class/${classId}`, null, teacherToken);
  logTest(
    "Get Class Details",
    res.ok && res.data.class?.students?.length >= 0,
    `${res.data.class?.students?.length || 0} students`
  );

  // Update studentIds from class details
  if (res.data.class?.students) {
    studentIds = res.data.class.students.map((s) => s._id || s.id || s);
  }

  // ============ PHASE 3: ATTENDANCE ============
  console.log("\n📋 PHASE 3: ATTENDANCE\n");

  // Test 9: Mark Single Attendance
  if (studentIds[0]) {
    res = await apiCall(
      "POST",
      "/api/attendance/mark",
      {
        classId,
        studentId: studentIds[0],
        date: new Date().toISOString().split("T")[0],
        status: "Present",
      },
      teacherToken
    );
    logTest("Mark Single Attendance", res.ok);
  } else {
    logTest("Mark Single Attendance", false, "No student ID");
  }

  // Test 10: Upload Bulk Attendance
  const csvData = studentIds.slice(0, 3).map((sid, i) => ({
    studentName: `Student ${i + 1}`,
    rollNumber: `10${i + 1}`,
    date: "2024-12-25",
    status: i === 2 ? "Absent" : "Present",
  }));
  res = await apiCall(
    "POST",
    "/api/attendance/upload",
    { classId, csvData },
    teacherToken
  );
  logTest(
    "Upload Bulk Attendance",
    res.ok,
    `Created: ${res.data.created || 0}`
  );

  // Test 11: Get Class Attendance
  res = await apiCall(
    "GET",
    `/api/attendance/class?classId=${classId}`,
    null,
    teacherToken
  );
  logTest("Get Class Attendance", res.ok);

  // Test 12: Get Attendance Stats
  res = await apiCall(
    "GET",
    `/api/attendance/stats?classId=${classId}`,
    null,
    teacherToken
  );
  logTest("Get Attendance Stats", res.ok && res.data.stats);

  // ============ PHASE 4: QUIZ SYSTEM ============
  console.log("\n📋 PHASE 4: QUIZ SYSTEM\n");

  // Test 13: Generate Quiz (AI)
  res = await apiCall(
    "POST",
    "/api/quiz/generate",
    {
      classId,
      topic: "Basic Algebra",
      chapter: "Linear Equations",
      numberOfQuestions: 3,
      difficultyLevel: "easy",
    },
    teacherToken
  );
  if (res.ok && res.data.quiz) {
    quizId = res.data.quiz._id;
    logTest(
      "Generate Quiz (AI)",
      true,
      `${res.data.quiz.questions?.length} questions`
    );
  } else {
    logTest("Generate Quiz (AI)", false, res.data.message || res.data.error);
  }

  // Test 14: Get Class Quizzes (Teacher)
  res = await apiCall("GET", `/api/quiz/class/${classId}`, null, teacherToken);
  logTest("Get Class Quizzes (Teacher)", res.ok);

  // Test 15: Get Class Quizzes (Student)
  if (studentTokens[0]) {
    res = await apiCall(
      "GET",
      `/api/quiz/class/${classId}`,
      null,
      studentTokens[0]
    );
    logTest("Get Class Quizzes (Student)", res.ok);
  }

  // Test 16: Get Single Quiz
  if (quizId) {
    res = await apiCall("GET", `/api/quiz/${quizId}`, null, studentTokens[0]);
    logTest("Get Quiz (Student View)", res.ok && res.data.quiz);
  }

  // Test 17: Submit Quiz
  if (quizId && studentTokens[0]) {
    res = await apiCall(
      "POST",
      `/api/quiz/${quizId}/submit`,
      { quizId, answers: [0, 1, 2] },
      studentTokens[0]
    );
    logTest(
      "Submit Quiz",
      res.ok,
      `Score: ${res.data.score}/${res.data.totalMarks}`
    );
  }

  // Test 18: Get Quiz Stats
  if (quizId) {
    res = await apiCall("GET", `/api/quiz/stats/${quizId}`, null, teacherToken);
    logTest("Get Quiz Stats", res.ok);
  }

  // ============ PHASE 5: STUDY PLANNER ============
  console.log("\n📋 PHASE 5: STUDY PLANNER\n");

  // Test 19: Generate Study Planner
  res = await apiCall(
    "POST",
    "/api/studyplanner/generate",
    { classId, board: "CBSE", className: "10th" },
    teacherToken
  );
  logTest("Generate Study Planner", res.ok, res.data.message || "");

  // Test 20: Get Study Planner
  res = await apiCall(
    "GET",
    `/api/studyplanner/${classId}`,
    null,
    teacherToken
  );
  logTest("Get Study Planner", res.ok);

  // ============ PHASE 6: ASSIGNMENTS ============
  console.log("\n📋 PHASE 6: ASSIGNMENTS\n");

  // Test 21: Create Assignment
  let assignmentId = null;
  res = await apiCall(
    "POST",
    "/api/assignment/create",
    {
      classId,
      title: "Test Assignment",
      description: "Complete the exercises",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalMarks: 100,
    },
    teacherToken
  );
  if (res.ok && res.data.assignment) {
    assignmentId = res.data.assignment._id;
    logTest("Create Assignment", true);
  } else {
    logTest("Create Assignment", false, res.data.message);
  }

  // Test 22: Get Class Assignments
  res = await apiCall(
    "GET",
    `/api/assignment/class/${classId}`,
    null,
    teacherToken
  );
  logTest("Get Class Assignments", res.ok);

  // Test 23: Submit Assignment (Student)
  if (assignmentId && studentTokens[0]) {
    res = await apiCall(
      "POST",
      `/api/assignment/${assignmentId}/submit`,
      { content: "My assignment submission" },
      studentTokens[0]
    );
    logTest(
      "Submit Assignment",
      res.ok || res.data.message?.includes("already")
    );
  }

  // ============ PHASE 7: GRADES ============
  console.log("\n📋 PHASE 7: GRADES\n");

  // Test 24: Add Manual Grade
  if (studentIds[0]) {
    res = await apiCall(
      "POST",
      "/api/grade/add",
      {
        classId,
        studentId: studentIds[0],
        type: "exam",
        title: "Mid-Term Exam",
        score: 85,
        totalMarks: 100,
      },
      teacherToken
    );
    logTest("Add Manual Grade", res.ok);
  }

  // Test 25: Get Class Grades
  res = await apiCall("GET", `/api/grade/class/${classId}`, null, teacherToken);
  logTest("Get Class Grades", res.ok);

  // Test 26: Get Student Grades
  if (studentIds[0]) {
    res = await apiCall(
      "GET",
      `/api/grade/student/${classId}/${studentIds[0]}`,
      null,
      studentTokens[0]
    );
    logTest("Get Student Grades", res.ok);
  }

  // ============ PHASE 8: TIMETABLE ============
  console.log("\n📋 PHASE 8: TIMETABLE\n");

  // Test 27: Get/Create Timetable
  res = await apiCall("GET", "/api/timetable", null, teacherToken);
  logTest("Get Timetable", res.ok);

  // Test 28: Add Slot
  res = await apiCall(
    "POST",
    "/api/timetable/slot",
    {
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      subject: "Mathematics",
      room: "Room 101",
    },
    teacherToken
  );
  logTest("Add Timetable Slot", res.ok);

  // ============ PHASE 9: MEETINGS ============
  console.log("\n📋 PHASE 9: MEETINGS\n");

  // Test 29: Create Meeting
  let meetingId = null;
  res = await apiCall(
    "POST",
    "/api/meeting/create",
    {
      classId,
      title: "Test Class Meeting",
      meetLink: "https://meet.google.com/test-meeting",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
    },
    teacherToken
  );
  if (res.ok && res.data.meeting) {
    meetingId = res.data.meeting._id;
    logTest("Create Meeting", true);
  } else {
    logTest("Create Meeting", false, res.data.message);
  }

  // Test 30: Get Class Meetings
  res = await apiCall(
    "GET",
    `/api/meeting/class/${classId}`,
    null,
    teacherToken
  );
  logTest("Get Class Meetings", res.ok);

  // Test 31: Get Upcoming Meetings
  res = await apiCall("GET", "/api/meeting/upcoming", null, teacherToken);
  logTest("Get Upcoming Meetings", res.ok);

  // ============ SUMMARY ============
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`   - ${r.name}: ${r.details}`));
  }

  console.log("\n" + "=".repeat(50));
}

// Run tests
runTests().catch(console.error);
