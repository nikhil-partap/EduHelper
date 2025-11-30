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

// Attendance API calls
export const attendanceAPI = {
  // Teacher endpoints
  markAttendance: (data) => api.post("/api/attendance/mark", data),
  uploadAttendance: (data) => api.post("/api/attendance/upload", data),
  getClassAttendance: (classId, date = null) => {
    const params = date
      ? `?classId=${classId}&date=${date}`
      : `?classId=${classId}`;
    return api.get(`/api/attendance/class${params}`);
  },
  getAttendanceStats: (classId) =>
    api.get(`/api/attendance/stats?classId=${classId}`),

  // Student and teacher endpoint
  getStudentAttendance: (classId, studentId) =>
    api.get(
      `/api/attendance/student?classId=${classId}&studentId=${studentId}`
    ),
};

// Quiz API calls
export const quizAPI = {
  // Teacher endpoints
  generateQuiz: (data) => api.post("/api/quiz/generate", data),
  getClassQuizzes: (classId) => api.get(`/api/quiz/class/${classId}`),
  getQuizStats: (quizId) => api.get(`/api/quiz/stats/${quizId}`),

  // Student endpoints
  getQuiz: (quizId) => api.get(`/api/quiz/${quizId}`),
  submitQuiz: (quizId, answers) =>
    api.post(`/api/quiz/${quizId}/submit`, {answers}),
  getStudentAttempts: (classId, studentId) =>
    api.get(`/api/quiz/attempts/${classId}/${studentId}`),
};

// Study Planner API calls
export const studyPlannerAPI = {
  // Student endpoints
  createPlan: (data) => api.post("/api/study-planner", data),
  getMyPlans: () => api.get("/api/study-planner/my-plans"),
  updateProgress: (planId, data) =>
    api.patch(`/api/study-planner/${planId}/progress`, data),
  deletePlan: (planId) => api.delete(`/api/study-planner/${planId}`),

  // Shared endpoints
  getPlanDetails: (planId) => api.get(`/api/study-planner/${planId}`),
};

export default api;
