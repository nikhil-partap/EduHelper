import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  getMe: () => api.get("/api/auth/me"),
};

// Class API calls
export const classAPI = {
  // Teacher endpoints
  createClass: (classData) => api.post("/api/class/create", classData),
  getTeacherClasses: () => api.get("/api/class/teacher"),

  // Student endpoints
  joinClass: (classCode) => api.post("/api/class/join", {classCode}),
  getStudentClasses: () => api.get("/api/class/student"),

  // Shared endpoints
  getClassDetails: (classId) => api.get(`/api/class/${classId}`),
};

export default api;
