// Quick test for Class Details API - assumes server is running
import axios from "axios";

const API_BASE = "http://localhost:5000";

const quickTest = async () => {
  try {
    console.log("🧪 Quick Class Details API Test\n");

    // Step 1: Login as teacher to get token
    console.log("1. Logging in as teacher...");
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: "teacher@example.com",
      password: "test123",
    });

    const token = loginResponse.data.token;
    console.log("✅ Teacher logged in successfully");
    console.log(`🔑 Token: ${token.substring(0, 30)}...`);

    // Step 2: Get teacher's classes to find a class ID
    console.log("\n2. Getting teacher's classes...");
    const classesResponse = await axios.get(`${API_BASE}/api/class/teacher`, {
      headers: {Authorization: `Bearer ${token}`},
    });

    if (classesResponse.data.classes.length === 0) {
      console.log("❌ No classes found. Please create a class first.");
      return;
    }

    const classId = classesResponse.data.classes[0]._id;
    console.log(`✅ Found class ID: ${classId}`);

    // Step 3: Test the requested endpoint - Get Class Details
    console.log("\n3. 🎯 TESTING REQUESTED ENDPOINT:");
    console.log("=".repeat(50));
    console.log(`Method: GET`);
    console.log(`URL: ${API_BASE}/api/class/${classId}`);
    console.log(`Authorization: Bearer ${token.substring(0, 30)}...`);
    console.log("=".repeat(50));

    const classDetailsResponse = await axios.get(
      `${API_BASE}/api/class/${classId}`,
      {
        headers: {Authorization: `Bearer ${token}`},
      }
    );

    console.log("✅ SUCCESS! Status: 200 OK");
    console.log("\n📋 Class Details Response:");
    console.log(JSON.stringify(classDetailsResponse.data, null, 2));
  } catch (error) {
    console.error("❌ Test failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
};

quickTest();
