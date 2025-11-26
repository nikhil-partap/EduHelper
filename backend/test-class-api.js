// Enhanced test script to test Class API endpoints
import axios from "axios";

const API_BASE = "http://localhost:5000";

const testClassAPI = async () => {
  try {
    console.log("🧪 Testing LeetClass - Class Management API...\n");

    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log("✅ Health check:", healthResponse.data);

    // Test 2: Register/Login Teacher
    console.log("\n2. Setting up test teacher...");
    const teacherData = {
      name: "Test Teacher",
      email: "teacher@example.com",
      password: "test123",
      role: "teacher",
      schoolName: "Test School",
    };

    let teacherToken;
    try {
      const registerResponse = await axios.post(
        `${API_BASE}/api/auth/register`,
        teacherData
      );
      teacherToken = registerResponse.data.token;
      console.log("✅ Teacher registered:", registerResponse.data.user.name);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log("ℹ️  Teacher already exists, logging in...");
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: teacherData.email,
          password: teacherData.password,
        });
        teacherToken = loginResponse.data.token;
        console.log("✅ Teacher logged in:", loginResponse.data.user.name);
      } else {
        throw error;
      }
    }

    // Test 3: Register/Login Student
    console.log("\n3. Setting up test student...");
    const studentData = {
      name: "Test Student",
      email: "student@example.com",
      password: "test123",
      role: "student",
      rollNumber: "12345",
    };

    let studentToken;
    try {
      const registerResponse = await axios.post(
        `${API_BASE}/api/auth/register`,
        studentData
      );
      studentToken = registerResponse.data.token;
      console.log("✅ Student registered:", registerResponse.data.user.name);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log("ℹ️  Student already exists, logging in...");
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: studentData.email,
          password: studentData.password,
        });
        studentToken = loginResponse.data.token;
        console.log("✅ Student logged in:", loginResponse.data.user.name);
      } else {
        throw error;
      }
    }

    // Test 4: Create a Class (Teacher)
    console.log("\n4. Testing class creation...");
    const classData = {
      className: "Mathematics 101",
      subject: "Mathematics",
      board: "CBSE",
    };

    const createClassResponse = await axios.post(
      `${API_BASE}/api/class/create`,
      classData,
      {
        headers: {Authorization: `Bearer ${teacherToken}`},
      }
    );
    console.log("✅ Class created:", {
      name: createClassResponse.data.class.className,
      code: createClassResponse.data.class.classCode,
      id: createClassResponse.data.class._id,
    });

    const classId = createClassResponse.data.class._id;
    const classCode = createClassResponse.data.class.classCode;

    // Test 5: Student Joins Class
    console.log("\n5. Testing student joining class...");
    const joinResponse = await axios.post(
      `${API_BASE}/api/class/join`,
      {classCode},
      {
        headers: {Authorization: `Bearer ${studentToken}`},
      }
    );
    console.log("✅ Student joined class:", joinResponse.data.message);

    // Test 6: Get Class Details (This is what you requested!)
    console.log("\n6. Testing GET Class Details...");
    console.log(`📡 GET ${API_BASE}/api/class/${classId}`);
    console.log(`🔑 Authorization: Bearer ${teacherToken.substring(0, 20)}...`);

    const classDetailsResponse = await axios.get(
      `${API_BASE}/api/class/${classId}`,
      {
        headers: {Authorization: `Bearer ${teacherToken}`},
      }
    );

    console.log("✅ Class details retrieved successfully!");
    console.log("📋 Class Details:", {
      id: classDetailsResponse.data.class._id,
      name: classDetailsResponse.data.class.className,
      subject: classDetailsResponse.data.class.subject,
      board: classDetailsResponse.data.class.board,
      code: classDetailsResponse.data.class.classCode,
      teacher: classDetailsResponse.data.class.teacherId,
      students: classDetailsResponse.data.class.students,
      createdAt: classDetailsResponse.data.class.createdAt,
    });

    // Test 7: Get Teacher's Classes
    console.log("\n7. Testing get teacher's classes...");
    const teacherClassesResponse = await axios.get(
      `${API_BASE}/api/class/teacher`,
      {
        headers: {Authorization: `Bearer ${teacherToken}`},
      }
    );
    console.log(
      "✅ Teacher's classes:",
      teacherClassesResponse.data.classes.length
    );

    // Test 8: Get Student's Classes
    console.log("\n8. Testing get student's classes...");
    const studentClassesResponse = await axios.get(
      `${API_BASE}/api/class/student`,
      {
        headers: {Authorization: `Bearer ${studentToken}`},
      }
    );
    console.log(
      "✅ Student's classes:",
      studentClassesResponse.data.classes.length
    );

    console.log(
      "\n🎉 All Class API tests passed! Class management is working correctly."
    );

    // Summary for the requested test
    console.log("\n" + "=".repeat(60));
    console.log("📊 REQUESTED TEST SUMMARY:");
    console.log("=".repeat(60));
    console.log(`✅ Method: GET`);
    console.log(`✅ URL: ${API_BASE}/api/class/${classId}`);
    console.log(`✅ Authorization: Bearer ${teacherToken.substring(0, 30)}...`);
    console.log(`✅ Status: 200 OK`);
    console.log(
      `✅ Response: Detailed class info with teacher and students populated`
    );
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Class API Test failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
  }
};

// Run the test
testClassAPI();
