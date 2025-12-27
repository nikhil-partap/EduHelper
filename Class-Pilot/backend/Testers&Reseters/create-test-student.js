// Create a test student with known credentials
// Run: node create-test-student.js

const BASE_URL = "http://localhost:5000";

async function createTestStudent() {
  console.log("Creating test student...\n");

  const studentData = {
    email: "bob@school.edu",
    password: "student123",
    name: "Bob Student",
    role: "student",
    rollNumber: "STU001",
  };

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("✅ Student created successfully!\n");
      console.log("Login Credentials:");
      console.log("==================");
      console.log(`Email: ${studentData.email}`);
      console.log(`Password: ${studentData.password}`);
      console.log(`Name: ${studentData.name}`);
      console.log(`Roll Number: ${studentData.rollNumber}`);
    } else if (
      data.message?.includes("already") ||
      data.error?.includes("duplicate")
    ) {
      console.log("ℹ️ Student already exists. Use these credentials:\n");
      console.log("Login Credentials:");
      console.log("==================");
      console.log(`Email: ${studentData.email}`);
      console.log(`Password: student123`);
    } else {
      console.log("❌ Error:", data.message || data.error);
    }
  } catch (error) {
    console.log("❌ Connection error:", error.message);
    console.log("\nMake sure the backend server is running on port 5000");
  }
}

createTestStudent();
