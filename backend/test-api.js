// Simple test script to verify API endpoints
import axios from "axios";

const API_BASE = "http://localhost:5000";

const testAPI = async () => {
  try {
    console.log("🧪 Testing LeetClass API...\n");

    // Test 1: Health check
    console.log("1. Testing health endpoint...");
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log("✅ Health check:", healthResponse.data);

    // Test 2: Register a test user
    console.log("\n2. Testing user registration...");
    const registerData = {
      name: "Test Teacher",
      email: "test@example.com",
      password: "test123",
      role: "teacher",
      schoolName: "Test School",
    };

    try {
      const registerResponse = await axios.post(
        `${API_BASE}/api/auth/register`,
        registerData
      );
      console.log("✅ Registration successful:", {
        user: registerResponse.data.user,
        tokenReceived: !!registerResponse.data.token,
      });

      // Test 3: Login with the same user
      console.log("\n3. Testing user login...");
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: registerData.email,
        password: registerData.password,
      });
      console.log("✅ Login successful:", {
        user: loginResponse.data.user,
        tokenReceived: !!loginResponse.data.token,
      });

      // Test 4: Get user profile with token
      console.log("\n4. Testing protected route...");
      const token = loginResponse.data.token;
      const profileResponse = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      console.log("✅ Profile fetch successful:", profileResponse.data.user);
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        console.log("ℹ️  User already exists, testing login...");

        // Test login if user exists
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: registerData.email,
          password: registerData.password,
        });
        console.log("✅ Login successful:", {
          user: loginResponse.data.user,
          tokenReceived: !!loginResponse.data.token,
        });
      } else {
        throw registerError;
      }
    }

    console.log(
      "\n🎉 All API tests passed! Backend is ready for frontend connection."
    );
  } catch (error) {
    console.error("❌ API Test failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
};

// Run the test
testAPI();
