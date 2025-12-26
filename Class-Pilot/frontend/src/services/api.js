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
  submitQuiz: (quizId, answers, timeTaken = null) =>
    api.post(`/api/quiz/${quizId}/submit`, {quizId, answers, timeTaken}),
  getStudentAttempts: (classId, studentId) =>
    api.get(`/api/quiz/attempts/${classId}/${studentId}`),
};

// Study Planner API calls
export const studyPlannerAPI = {
  // Teacher endpoints
  generatePlanner: (data) => api.post("/api/studyplanner/generate", data),

  // Shared endpoints
  getPlanner: (classId) => api.get(`/api/studyplanner/${classId}`),

  // Teacher-only chapter/holiday/exam management
  updateChapter: (classId, chapterIndex, data) =>
    api.put(`/api/studyplanner/${classId}/chapter/${chapterIndex}`, data),
  addHoliday: (classId, date) =>
    api.post(`/api/studyplanner/${classId}/holiday`, {date}),
  removeHoliday: (classId, date) =>
    api.delete(`/api/studyplanner/${classId}/holiday/${date}`),
  addExamDate: (classId, examName, date) =>
    api.post(`/api/studyplanner/${classId}/exam`, {examName, date}),
  updateExamDate: (classId, examName, newDate) =>
    api.put(`/api/studyplanner/${classId}/exam/${examName}`, {newDate}),
};

// Assignment API calls
export const assignmentAPI = {
  // Teacher endpoints
  createAssignment: (data) => api.post("/api/assignment/create", data),
  updateAssignment: (assignmentId, data) =>
    api.put(`/api/assignment/${assignmentId}`, data),
  deleteAssignment: (assignmentId) =>
    api.delete(`/api/assignment/${assignmentId}`),
  gradeSubmission: (assignmentId, studentId, data) =>
    api.put(`/api/assignment/${assignmentId}/grade/${studentId}`, data),

  // Student endpoints
  submitAssignment: (assignmentId, data) =>
    api.post(`/api/assignment/${assignmentId}/submit`, data),

  // Shared endpoints
  getClassAssignments: (classId) => api.get(`/api/assignment/class/${classId}`),
  getAssignment: (assignmentId) => api.get(`/api/assignment/${assignmentId}`),
};

// Grade API calls
export const gradeAPI = {
  // Teacher endpoints
  addGrade: (data) => api.post("/api/grade/add", data),
  getClassGrades: (classId) => api.get(`/api/grade/class/${classId}`),
  updateGrade: (gradeId, data) => api.put(`/api/grade/${gradeId}`, data),
  deleteGrade: (gradeId) => api.delete(`/api/grade/${gradeId}`),

  // Student endpoints
  getGradeReport: () => api.get("/api/grade/report"),

  // Shared endpoints
  getStudentGrades: (classId, studentId) =>
    api.get(`/api/grade/student/${classId}/${studentId}`),
};

// Timetable API calls
export const timetableAPI = {
  // CRUD
  createTimetable: (data) => api.post("/api/timetable", data),
  getTimetable: () => api.get("/api/timetable"),

  // Slot management
  addSlot: (data) => api.post("/api/timetable/slot", data),
  updateSlot: (slotId, data) => api.put(`/api/timetable/slot/${slotId}`, data),
  deleteSlot: (slotId) => api.delete(`/api/timetable/slot/${slotId}`),

  // Schedule views
  getDaySchedule: (day) => api.get(`/api/timetable/day/${day}`),

  // Auto-populate (Student only)
  autoPopulate: () => api.post("/api/timetable/auto-populate"),
};

// Meeting API calls
export const meetingAPI = {
  // Teacher endpoints
  createMeeting: (data) => api.post("/api/meeting/create", data),
  updateMeetingStatus: (meetingId, status) =>
    api.put(`/api/meeting/${meetingId}/status`, {status}),
  updateMeeting: (meetingId, data) =>
    api.put(`/api/meeting/${meetingId}`, data),
  deleteMeeting: (meetingId) => api.delete(`/api/meeting/${meetingId}`),

  // Student endpoints
  joinMeeting: (meetingId) => api.post(`/api/meeting/${meetingId}/join`),
  leaveMeeting: (meetingId) => api.post(`/api/meeting/${meetingId}/leave`),

  // Shared endpoints
  getUpcomingMeetings: () => api.get("/api/meeting/upcoming"),
  getClassMeetings: (classId, options = {}) => {
    const params = new URLSearchParams();
    if (options.status) params.append("status", options.status);
    if (options.upcoming) params.append("upcoming", "true");
    const query = params.toString() ? `?${params.toString()}` : "";
    return api.get(`/api/meeting/class/${classId}${query}`);
  },
  getMeeting: (meetingId) => api.get(`/api/meeting/${meetingId}`),
};

export default api;
