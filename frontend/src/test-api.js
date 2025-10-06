// Simple API test file - Run this to test backend connection
// Usage: node frontend/src/test-api.js (requires Node.js fetch or use browser console)

import api from "./utils/api.js";

async function testAPI() {
  console.log("🧪 Testing EduHelper API Connection...\n");

  try {
    // Test Teacher Dashboard
    console.log("📊 Testing Teacher Dashboard API...");
    const teacherData = await api.teacher.getDashboard();
    console.log(
      "✅ Teacher Dashboard:",
      teacherData.success ? "SUCCESS" : "FAILED"
    );
    console.log("   Stats:", teacherData.data?.stats);

    // Test Teacher Timetable
    console.log("\n📅 Testing Teacher Timetable API...");
    const timetableResponse = await fetch(
      "http://localhost:5000/api/teachers/timetable"
    );
    const timetableData = await timetableResponse.json();
    console.log(
      "✅ Teacher Timetable:",
      timetableData.success ? "SUCCESS" : "FAILED"
    );
    console.log("   Days:", timetableData.data?.length);

    // Test Student Dashboard
    console.log("\n📚 Testing Student Dashboard API...");
    const studentData = await api.student.getDashboard();
    console.log(
      "✅ Student Dashboard:",
      studentData.success ? "SUCCESS" : "FAILED"
    );
    console.log("   Stats:", studentData.data?.stats);

    // Test Classes API
    console.log("\n🏫 Testing Classes API...");
    const classesData = await api.classes.getAll();
    console.log("✅ Classes:", classesData.success ? "SUCCESS" : "FAILED");
    console.log("   Count:", classesData.count);

    // Test Assignments API
    console.log("\n📝 Testing Assignments API...");
    const assignmentsData = await api.assignments.getAll();
    console.log(
      "✅ Assignments:",
      assignmentsData.success ? "SUCCESS" : "FAILED"
    );
    console.log("   Count:", assignmentsData.count);

    console.log("\n✨ All API tests completed successfully!");
  } catch (error) {
    console.error("\n❌ API Test Failed:", error.message);
    console.error(
      "   Make sure the backend server is running on http://localhost:5000"
    );
  }
}

// Run tests
testAPI();
