// API utility for making backend requests

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
};

// Teacher API
export const teacherAPI = {
  getDashboard: () => apiRequest("/teachers/dashboard"),

  getClasses: () => apiRequest("/teachers/classes"),

  getStudents: () => apiRequest("/teachers/students"),

  getTimetable: () => apiRequest("/teachers/timetable"),

  updateTimetable: (timetable) =>
    apiRequest("/teachers/timetable", {
      method: "PUT",
      body: JSON.stringify({timetable}),
    }),

  createClass: (classData) =>
    apiRequest("/teachers/classes", {
      method: "POST",
      body: JSON.stringify(classData),
    }),

  updateClass: (id, classData) =>
    apiRequest(`/teachers/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(classData),
    }),

  deleteClass: (id) =>
    apiRequest(`/teachers/classes/${id}`, {
      method: "DELETE",
    }),
};

// Student API
export const studentAPI = {
  getDashboard: () => apiRequest("/students/dashboard"),

  getCourses: () => apiRequest("/students/courses"),

  getAssignments: () => apiRequest("/students/assignments"),

  getGrades: () => apiRequest("/students/grades"),

  getSchedule: () => apiRequest("/students/schedule"),

  submitAssignment: (id, submission) =>
    apiRequest(`/students/assignments/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(submission),
    }),
};

// Classes API
export const classesAPI = {
  getAll: () => apiRequest("/classes"),

  getById: (id) => apiRequest(`/classes/${id}`),

  create: (classData) =>
    apiRequest("/classes", {
      method: "POST",
      body: JSON.stringify(classData),
    }),

  update: (id, classData) =>
    apiRequest(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(classData),
    }),

  delete: (id) =>
    apiRequest(`/classes/${id}`, {
      method: "DELETE",
    }),

  enroll: (id, studentData) =>
    apiRequest(`/classes/${id}/enroll`, {
      method: "POST",
      body: JSON.stringify(studentData),
    }),
};

// Assignments API
export const assignmentsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/assignments${queryParams ? `?${queryParams}` : ""}`);
  },

  getById: (id) => apiRequest(`/assignments/${id}`),

  create: (assignmentData) =>
    apiRequest("/assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    }),

  update: (id, assignmentData) =>
    apiRequest(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(assignmentData),
    }),

  delete: (id) =>
    apiRequest(`/assignments/${id}`, {
      method: "DELETE",
    }),

  submit: (id, submissionData) =>
    apiRequest(`/assignments/${id}/submit`, {
      method: "POST",
      body: JSON.stringify(submissionData),
    }),

  grade: (id, gradeData) =>
    apiRequest(`/assignments/${id}/grade`, {
      method: "PUT",
      body: JSON.stringify(gradeData),
    }),
};

export default {
  auth: authAPI,
  teacher: teacherAPI,
  student: studentAPI,
  classes: classesAPI,
  assignments: assignmentsAPI,
};
