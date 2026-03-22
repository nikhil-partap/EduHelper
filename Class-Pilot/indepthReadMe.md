# Class Pilot - Technical Documentation

Deep-dive technical documentation for developers who want to understand, modify, or extend the Class Pilot codebase.

**Note:** This project was previously known as "EduHelper" and was rebranded to "Class Pilot". Some internal references and file names may still use the old name.

---

## Quick Reference

### Key Technologies

- **Backend:** Node.js 20.19+, Express 5.1.0, MongoDB 6.20.0, Mongoose 8.19.1
- **Frontend:** React 19.1.1, Vite 7.1.14, Tailwind CSS 4.1.14, React Router 7.9.4
- **AI:** Google Gemini 2.5-flash (primary), OpenAI GPT-3.5-turbo (fallback)
- **Auth:** JWT with bcryptjs password hashing

### Project Structure

```
Class-Pilot/
├── backend/          # Express.js API (Port 5000)
│   ├── controllers/  # Business logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth & validation
│   └── utils/        # AI service, helpers
└── frontend/         # React SPA (Port 5173)
    └── src/
        ├── components/  # UI components
        ├── pages/       # Route pages
        ├── context/     # State management
        ├── hooks/       # Custom hooks
        └── services/    # API client
```

### Quick Start Commands

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

### Essential Environment Variables

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
```

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Authentication System](#authentication-system)
5. [Database Schema Design](#database-schema-design)
6. [API Layer](#api-layer)
7. [AI Integration](#ai-integration)
8. [State Management](#state-management)
9. [Request/Response Flow](#requestresponse-flow)
10. [Security Implementation](#security-implementation)
11. [Recent Updates & Changes](#recent-updates--changes)
12. [Environment Variables Reference](#environment-variables-reference)
13. [Deployment Notes](#deployment-notes)
14. [Testing Utilities](#testing-utilities)
15. [Performance Considerations](#performance-considerations)
16. [Known Limitations](#known-limitations)
17. [Future Roadmap](#future-roadmap)
18. [Contributing](#contributing)

---

## System Architecture

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   React     │───▶│   Context   │───▶│   Hooks     │───▶│  Components │   │
│  │   Router    │    │  Providers  │    │ useAuth()   │    │   (JSX)     │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                                     │                              │
│         ▼                                     ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        services/api.js                               │    │
│  │   axios instance with interceptors (auto-attach JWT to headers)      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP (localhost:5000)
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Express)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Middleware Stack                             │    │
│  │   cors() → express.json() → express.urlencoded() → routes            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   Routes    │───▶│ Middleware  │───▶│ Controllers │                      │
│  │  /api/auth  │    │  protect()  │    │  Business   │                      │
│  │  /api/class │    │ authorize() │    │   Logic     │                      │
│  └─────────────┘    └─────────────┘    └─────────────┘                      │
│                                              │                               │
│                                              ▼                               │
│                                       ┌─────────────┐                       │
│                                       │   Models    │                       │
│                                       │  (Mongoose) │                       │
│                                       └─────────────┘                       │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ MongoDB Driver
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            MongoDB Atlas                                      │
│   Collections: user, class, attendance, quiz, quizattempt, studyplanner...   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Details

| Layer         | Technology             | Version | Purpose                          |
| ------------- | ---------------------- | ------- | -------------------------------- |
| Runtime       | Node.js                | 20.19+  | JavaScript runtime               |
| Framework     | Express.js             | 5.1.0   | HTTP server, routing, middleware |
| Database      | MongoDB Atlas          | 6.20.0  | Document storage                 |
| ODM           | Mongoose               | 8.19.1  | Schema validation, queries       |
| Auth          | jsonwebtoken           | 9.0.2   | JWT creation/verification        |
| Hashing       | bcryptjs               | 3.0.2   | Password hashing                 |
| AI            | @google/generative-ai  | 0.24.1  | Gemini API client                |
| AI Vertex     | @google-cloud/vertexai | 1.10.0  | Vertex AI integration            |
| AI Fallback   | openai                 | 6.9.1   | OpenAI API client                |
| ID Generation | nanoid                 | 5.1.6   | Class code generation            |
| PDF Export    | pdfkit                 | 0.17.2  | PDF generation                   |
| Excel Export  | exceljs                | 4.4.0   | Excel file generation            |
| Frontend      | React                  | 19.1.1  | UI components                    |
| Build         | Vite                   | 7.1.14  | Dev server, bundling (rolldown)  |
| Styling       | Tailwind CSS           | 4.1.14  | Utility classes                  |
| Routing       | React Router           | 7.9.4   | Client-side routing              |
| HTTP          | Axios                  | 1.12.2  | API requests                     |
| Drag & Drop   | @dnd-kit               | 6.3.1+  | Drag and drop functionality      |
| Charts        | recharts               | 3.6.0   | Data visualization               |

---

## Backend Implementation

### Server Entry Point (`server.js`)

```javascript
// ES Modules - all imports use .js extension
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Top-level await for DB connection
await connectDB();

const app = express();

// Middleware execution order matters
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev
      "http://localhost:3000", // Alt port
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/, // LAN regex
    ],
    credentials: true, // Allow cookies/auth headers
  }),
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data

// Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/class", classRoutes);
// ... more routes
```

### Database Connection (`config/db.js`)

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false); // Mongoose 7 compatibility
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1); // Exit on connection failure
  }
};
```

**Connection String Format:**

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Route Definition Pattern

```javascript
// routes/auth.js
import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/AuthController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser); // Public
router.post("/login", loginUser); // Public
router.get("/me", protect, getMe); // Protected

export default router;
```

### Controller Pattern

```javascript
// controllers/AuthController.js
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, schoolName, rollNumber } = req.body;

    // 1. Validation (never trust frontend)
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 2. Role-specific validation
    if (role === "teacher" && !schoolName) {
      return res
        .status(400)
        .json({ message: "schoolName required for teachers" });
    }

    // 3. Duplicate check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 4. Create user (password hashed in pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role,
      schoolName,
      rollNumber,
    });

    // 5. Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // 6. Response
    res.status(201).json({
      user: { id: user._id, name, email, role, schoolName, rollNumber },
      token,
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

---

## Frontend Implementation

### Application Bootstrap (`main.jsx`)

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Provider Hierarchy (`App.jsx`)

```javascript
function App() {
  return (
    <ThemeProvider>
      {" "}
      {/* Theme state (dark/light) */}
      <AuthProvider>
        {" "}
        {/* Auth state (user, token, isAuthenticated) */}
        <Router>
          {" "}
          {/* React Router */}
          <ClassProvider>
            {" "}
            {/* Class data state */}
            <AppContent /> {/* Routes and layout */}
          </ClassProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Axios Instance Configuration (`services/api.js`)

```javascript
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - auto-attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API namespaces
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  getMe: () => api.get("/api/auth/me"),
};

export const classAPI = {
  createClass: (data) => api.post("/api/class/create", data),
  getTeacherClasses: () => api.get("/api/class/teacher"),
  joinClass: (classCode) => api.post("/api/class/join", { classCode }),
  getStudentClasses: () => api.get("/api/class/student"),
  getClassDetails: (id) => api.get(`/api/class/${id}`),
};
// ... more API namespaces
```

---

## Authentication System

### JWT Token Structure

```javascript
// Payload structure
{
  userId: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  role: "teacher",                      // "teacher" | "student"
  iat: 1704067200,                      // Issued at (Unix timestamp)
  exp: 1704153600                       // Expires (24h later)
}
```

### Token Generation

```javascript
// controllers/AuthController.js
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};
```

### Token Verification Middleware

```javascript
// middleware/auth.js
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from "Bearer <token>" header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. No token = unauthorized
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 3. Verify and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach user to request (exclude password)
    req.user = await User.findById(decoded.userId).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
```

### Role Authorization Middleware

```javascript
// middleware/auth.js
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' not authorized for this action`,
      });
    }
    next();
  };
};

// Usage in routes
router.post("/create", protect, authorize("teacher"), createClass);
```

### Frontend Auth State Management

```javascript
// context/AuthProvider.jsx
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    // ...
  }
};

// Initial state checks localStorage for existing token
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true, // True until token validation completes
  error: null,
};
```

### Auth Flow Sequence

```
1. App loads → AuthProvider mounts
2. useEffect checks localStorage for token
3. If token exists:
   a. Call GET /api/auth/me with token
   b. If valid → dispatch LOGIN_SUCCESS
   c. If invalid → remove token, dispatch LOGOUT
4. If no token → dispatch LOGOUT (loading: false)

Login Flow:
1. User submits credentials
2. dispatch LOGIN_START (loading: true)
3. POST /api/auth/login
4. If success:
   a. Store token in localStorage
   b. dispatch LOGIN_SUCCESS
5. If error:
   a. dispatch LOGIN_ERROR with message
```

---

## Database Schema Design

### User Model

```javascript
// models/User.js
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 4 },
    role: { type: String, required: true, enum: ["teacher", "student"] },

    // Conditional fields
    schoolName: {
      type: String,
      required: function () {
        return this.role === "teacher";
      },
      trim: true,
    },
    rollNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
  },
  { timestamps: true },
);

// Pre-save hook for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(3); // Cost factor 3 (dev/hackathon)
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method for password comparison
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Collection name explicitly set to "user"
const User = mongoose.model("User", userSchema, "user");
```

### Class Model with Auto-Generated Code

```javascript
// models/Class.js
import { customAlphabet } from "nanoid";

// 6-char alphanumeric generator
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

const classSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    board: { type: String, required: true, trim: true },
    classCode: { type: String, unique: true, uppercase: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// Auto-generate unique classCode before first save
classSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Skip on updates

  let code;
  let exists = true;

  while (exists) {
    // Format: SUBJ-XXXXXX (e.g., MATH-A3B2C1)
    const prefix = this.subject.replace(/\s+/g, "").slice(0, 4).toUpperCase();
    code = `${prefix}-${nanoid()}`;

    // Check for collision
    exists = await mongoose.models.Class.exists({ classCode: code });
  }

  this.classCode = code;
  next();
});
```

### Quiz Model

```javascript
const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }], // Array of 4 options
        correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // Index
        difficultyLevel: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "medium",
        },
      },
    ],
    timeLimit: { type: Number, default: 30 }, // Minutes
    randomizeQuestions: { type: Boolean, default: false },
    showInstantFeedback: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
```

### QuizAttempt Model

```javascript
const quizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [{ type: Number }], // Array of selected option indices
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  timeTaken: { type: Number }, // Seconds
  submittedAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate attempts
quizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });
```

### StudyPlanner Model

```javascript
const studyPlannerSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      unique: true,
    },
    academicYear: { type: Number, required: true },
    chapters: [
      {
        name: { type: String, required: true },
        durationDays: { type: Number, required: true, min: 1, max: 10 },
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
      },
    ],
    holidays: [{ type: Date }],
    examDates: [
      {
        name: String,
        date: Date,
      },
    ],
  },
  { timestamps: true },
);
```

---

## API Layer

### Request/Response Format

**Success Response:**

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "schoolName": "ABC School"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**

```json
{
  "message": "Email already in use"
}
```

**Or with success flag:**

```json
{
  "success": false,
  "error": "Class not found"
}
```

### HTTP Status Codes Used

| Code | Meaning      | Usage                                  |
| ---- | ------------ | -------------------------------------- |
| 200  | OK           | Successful GET, PUT                    |
| 201  | Created      | Successful POST (new resource)         |
| 400  | Bad Request  | Validation errors, missing fields      |
| 401  | Unauthorized | No token, invalid token, expired token |
| 403  | Forbidden    | Valid token but wrong role             |
| 404  | Not Found    | Resource doesn't exist                 |
| 409  | Conflict     | Duplicate entry (email, etc.)          |
| 500  | Server Error | Unhandled exceptions                   |

### Complete API Endpoint Reference

#### Authentication Endpoints

| Method | Endpoint             | Body                                                        | Response          | Auth   |
| ------ | -------------------- | ----------------------------------------------------------- | ----------------- | ------ |
| POST   | `/api/auth/register` | `{ name, email, password, role, schoolName?, rollNumber? }` | `{ user, token }` | None   |
| POST   | `/api/auth/login`    | `{ email, password }`                                       | `{ user, token }` | None   |
| GET    | `/api/auth/me`       | -                                                           | `{ user }`        | Bearer |

#### Class Endpoints

| Method | Endpoint              | Body/Params                     | Response          | Auth    |
| ------ | --------------------- | ------------------------------- | ----------------- | ------- |
| POST   | `/api/class/create`   | `{ className, subject, board }` | `{ class }`       | Teacher |
| GET    | `/api/class/teacher`  | -                               | `{ classes: [] }` | Teacher |
| POST   | `/api/class/join`     | `{ classCode }`                 | `{ class }`       | Student |
| GET    | `/api/class/student`  | -                               | `{ classes: [] }` | Student |
| GET    | `/api/class/:classId` | -                               | `{ class }`       | Any     |

#### Attendance Endpoints

| Method | Endpoint                  | Body/Query                                                    | Response             | Auth    |
| ------ | ------------------------- | ------------------------------------------------------------- | -------------------- | ------- |
| POST   | `/api/attendance/mark`    | `{ classId, date, records: [{ studentId, status, notes? }] }` | `{ attendance }`     | Teacher |
| GET    | `/api/attendance/class`   | `?classId=&date=`                                             | `{ attendance: [] }` | Teacher |
| GET    | `/api/attendance/student` | `?classId=&studentId=`                                        | `{ attendance: [] }` | Any     |
| GET    | `/api/attendance/stats`   | `?classId=`                                                   | `{ stats }`          | Any     |

#### Quiz Endpoints

| Method | Endpoint                                 | Body/Params                                                                         | Response           | Auth    |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------ | ------- |
| POST   | `/api/quiz/generate`                     | `{ classId, title, topic, chapter, numberOfQuestions, difficultyLevel, timeLimit }` | `{ quiz }`         | Teacher |
| GET    | `/api/quiz/class/:classId`               | -                                                                                   | `{ quizzes: [] }`  | Any     |
| GET    | `/api/quiz/:quizId`                      | -                                                                                   | `{ quiz }`         | Any     |
| POST   | `/api/quiz/:quizId/submit`               | `{ answers: [], timeTaken? }`                                                       | `{ attempt }`      | Student |
| GET    | `/api/quiz/stats/:quizId`                | -                                                                                   | `{ stats }`        | Teacher |
| GET    | `/api/quiz/attempts/:classId/:studentId` | -                                                                                   | `{ attempts: [] }` | Any     |

#### Study Planner Endpoints

| Method | Endpoint                                    | Body/Params                 | Response      | Auth    |
| ------ | ------------------------------------------- | --------------------------- | ------------- | ------- |
| POST   | `/api/studyplanner/generate`                | `{ classId, academicYear }` | `{ planner }` | Teacher |
| GET    | `/api/studyplanner/:classId`                | -                           | `{ planner }` | Any     |
| DELETE | `/api/studyplanner/:classId`                | -                           | `{ success }` | Teacher |
| PUT    | `/api/studyplanner/:classId/year`           | `{ year }`                  | `{ planner }` | Teacher |
| POST   | `/api/studyplanner/:classId/chapter`        | `{ name, durationDays }`    | `{ planner }` | Teacher |
| PUT    | `/api/studyplanner/:classId/chapter/:index` | `{ name?, durationDays? }`  | `{ planner }` | Teacher |
| DELETE | `/api/studyplanner/:classId/chapter/:index` | -                           | `{ planner }` | Teacher |
| PUT    | `/api/studyplanner/:classId/reorder`        | `{ oldIndex, newIndex }`    | `{ planner }` | Teacher |

#### Assignment Endpoints

| Method | Endpoint                                         | Body/Params                                             | Response              | Auth    |
| ------ | ------------------------------------------------ | ------------------------------------------------------- | --------------------- | ------- |
| POST   | `/api/assignment/create`                         | `{ classId, title, description, dueDate, totalPoints }` | `{ assignment }`      | Teacher |
| GET    | `/api/assignment/class/:classId`                 | -                                                       | `{ assignments: [] }` | Any     |
| GET    | `/api/assignment/:assignmentId`                  | -                                                       | `{ assignment }`      | Any     |
| PUT    | `/api/assignment/:assignmentId`                  | `{ title?, description?, dueDate? }`                    | `{ assignment }`      | Teacher |
| DELETE | `/api/assignment/:assignmentId`                  | -                                                       | `{ success }`         | Teacher |
| POST   | `/api/assignment/:assignmentId/submit`           | `{ content }`                                           | `{ submission }`      | Student |
| PUT    | `/api/assignment/:assignmentId/grade/:studentId` | `{ grade, feedback }`                                   | `{ submission }`      | Teacher |

#### Grade Endpoints

| Method | Endpoint                                 | Body/Params                                                | Response         | Auth    |
| ------ | ---------------------------------------- | ---------------------------------------------------------- | ---------------- | ------- |
| POST   | `/api/grade/add`                         | `{ studentId, classId, category, title, score, maxScore }` | `{ grade }`      | Teacher |
| GET    | `/api/grade/class/:classId`              | -                                                          | `{ grades: [] }` | Teacher |
| GET    | `/api/grade/student/:classId/:studentId` | -                                                          | `{ grades: [] }` | Any     |
| GET    | `/api/grade/report`                      | -                                                          | `{ report }`     | Student |
| PUT    | `/api/grade/:gradeId`                    | `{ score?, maxScore? }`                                    | `{ grade }`      | Teacher |
| DELETE | `/api/grade/:gradeId`                    | -                                                          | `{ success }`    | Teacher |

#### Meeting Endpoints

| Method | Endpoint                         | Body/Params                                              | Response           | Auth    |
| ------ | -------------------------------- | -------------------------------------------------------- | ------------------ | ------- |
| POST   | `/api/meeting/create`            | `{ classId, title, scheduledAt, duration, meetingLink }` | `{ meeting }`      | Teacher |
| GET    | `/api/meeting/upcoming`          | -                                                        | `{ meetings: [] }` | Any     |
| GET    | `/api/meeting/class/:classId`    | `?status=&upcoming=`                                     | `{ meetings: [] }` | Any     |
| GET    | `/api/meeting/:meetingId`        | -                                                        | `{ meeting }`      | Any     |
| PUT    | `/api/meeting/:meetingId`        | `{ title?, scheduledAt?, duration? }`                    | `{ meeting }`      | Teacher |
| PUT    | `/api/meeting/:meetingId/status` | `{ status }`                                             | `{ meeting }`      | Teacher |
| DELETE | `/api/meeting/:meetingId`        | -                                                        | `{ success }`      | Teacher |
| POST   | `/api/meeting/:meetingId/join`   | -                                                        | `{ meeting }`      | Student |
| POST   | `/api/meeting/:meetingId/leave`  | -                                                        | `{ meeting }`      | Student |

#### Announcement Endpoints

| Method | Endpoint                           | Body/Params                  | Response                | Auth    |
| ------ | ---------------------------------- | ---------------------------- | ----------------------- | ------- |
| POST   | `/api/announcement/post`           | `{ classId, content, type }` | `{ announcement }`      | Teacher |
| GET    | `/api/announcement/recent`         | `?limit=`                    | `{ announcements: [] }` | Any     |
| GET    | `/api/announcement/class/:classId` | `?type=&page=&limit=`        | `{ announcements: [] }` | Any     |
| PUT    | `/api/announcement/:id/pin`        | -                            | `{ announcement }`      | Teacher |
| DELETE | `/api/announcement/:id`            | -                            | `{ success }`           | Teacher |
| POST   | `/api/announcement/:id/comment`    | `{ content }`                | `{ announcement }`      | Any     |

#### Export Endpoints

| Method | Endpoint                                    | Response   | Auth    |
| ------ | ------------------------------------------- | ---------- | ------- |
| GET    | `/api/export/portfolio/:studentId/:classId` | PDF blob   | Any     |
| GET    | `/api/export/attendance/:classId`           | Excel blob | Teacher |
| GET    | `/api/export/grades/:classId`               | Excel blob | Teacher |
| GET    | `/api/export/quiz/:quizId?format=excel`     | Excel blob | Teacher |

---

## AI Integration

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    utils/aiService.js                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ Initialize  │───▶│   Create    │───▶│   Parse     │     │
│  │  Clients    │    │   Prompt    │    │  Response   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Gemini    │    │   OpenAI    │    │  Validate   │     │
│  │   Client    │    │   Client    │    │  & Format   │     │
│  │  (Primary)  │    │ (Fallback)  │    │  Questions  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Lazy Client Initialization

```javascript
let geminiClient = null;
let geminiModel = null;
let openaiClient = null;
let clientsInitialized = false;

function initializeClients() {
  if (clientsInitialized) return;

  // Gemini (primary)
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
  ) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = geminiClient.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }

  // OpenAI (fallback)
  if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
  ) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  clientsInitialized = true;
}
```

### Quiz Generation Prompt Engineering

```javascript
function createQuizPrompt(topic, chapter, numberOfQuestions, difficultyLevel) {
  return `Generate ${numberOfQuestions} multiple-choice questions for a quiz.

Topic: ${topic}
Chapter: ${chapter}
Difficulty Level: ${difficultyLevel}

Requirements:
- Each question must have exactly 4 options
- Mark the correct answer with its index (0, 1, 2, or 3)
- Questions should be clear and educational
- Options should be plausible but only one correct

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficultyLevel": "${difficultyLevel}"
  }
]

Important: Return ONLY the JSON array, no additional text or explanation.`;
}
```

### Response Parsing

````javascript
function parseAIResponse(content) {
  // Remove markdown code blocks if present
  let jsonStr = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Extract JSON array from response
  const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  return JSON.parse(jsonStr);
}
````

### Validation Pipeline

```javascript
function validateAndFormatQuestions(questions, expectedCount) {
  if (!Array.isArray(questions)) throw new Error("Response is not an array");
  if (questions.length === 0) throw new Error("No questions generated");

  return questions.map((q, index) => {
    // Structure validation
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.correctAnswer === undefined
    ) {
      throw new Error(`Invalid structure at index ${index}`);
    }

    // Options count validation
    if (q.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }

    // Correct answer index validation
    if (q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Question ${index + 1} has invalid correctAnswer index`);
    }

    return {
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()),
      correctAnswer: q.correctAnswer,
      difficultyLevel: q.difficultyLevel || "medium",
    };
  });
}
```

---

## State Management

### Context Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ThemeProvider                           │
│  State: { theme: "dark" | "light" }                         │
│  Actions: toggleTheme()                                      │
├─────────────────────────────────────────────────────────────┤
│                      AuthProvider                            │
│  State: { user, token, isAuthenticated, loading, error }    │
│  Actions: login(), register(), logout(), clearError()        │
├─────────────────────────────────────────────────────────────┤
│                      ClassProvider                           │
│  State: { classes, currentClass, loading, error }           │
│  Actions: fetchClasses(), createClass(), joinClass(), etc.   │
└─────────────────────────────────────────────────────────────┘
```

### useReducer Pattern (AuthProvider)

```javascript
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };

    case "LOGIN_ERROR":
    case "REGISTER_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};
```

### Custom Hook Pattern

```javascript
// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Usage in components
const { user, isAuthenticated, login, logout } = useAuth();
```

---

## Request/Response Flow

### Complete Login Flow

```
1. User enters credentials in Login.jsx
   │
2. handleSubmit calls login(credentials) from useAuth()
   │
3. AuthProvider dispatches LOGIN_START
   │  State: { loading: true, error: null }
   │
4. authAPI.login(credentials) → POST /api/auth/login
   │
5. Express receives request
   │  └─ express.json() parses body
   │
6. loginUser controller executes
   │  ├─ Validate input
   │  ├─ User.findOne({ email })
   │  ├─ user.matchPassword(password) → bcrypt.compare()
   │  └─ jwt.sign({ userId, role }, secret, { expiresIn: "24h" })
   │
7. Response: { user: {...}, token: "eyJ..." }
   │
8. AuthProvider receives response
   │  ├─ localStorage.setItem("token", token)
   │  └─ dispatch LOGIN_SUCCESS
   │     State: { user, token, isAuthenticated: true, loading: false }
   │
9. React Router redirects to /dashboard
   │
10. Dashboard component renders based on user.role
```

### Protected Route Request Flow

```
1. Component calls classAPI.getTeacherClasses()
   │
2. Axios interceptor attaches token
   │  headers: { Authorization: "Bearer eyJ..." }
   │
3. Express receives GET /api/class/teacher
   │
4. protect middleware executes
   │  ├─ Extract token from header
   │  ├─ jwt.verify(token, secret)
   │  ├─ User.findById(decoded.userId).select("-password")
   │  └─ req.user = user
   │
5. authorize("teacher") middleware executes
   │  └─ Check req.user.role === "teacher"
   │
6. getTeacherClasses controller executes
   │  └─ Class.find({ teacherId: req.user._id }).populate("students")
   │
7. Response: { classes: [...] }
   │
8. Component updates state with classes
```

---

## Security Implementation

### Password Security

```javascript
// Hashing (pre-save hook)
const salt = await bcrypt.genSalt(3); // Cost factor
this.password = await bcrypt.hash(this.password, salt);

// Comparison (instance method)
return await bcrypt.compare(enteredPassword, this.password);
```

**Note:** Cost factor 3 is used for development speed. Production should use 10-12.

### JWT Security

```javascript
// Token creation
jwt.sign(
  { userId: user._id, role: user.role }, // Payload (no sensitive data)
  process.env.JWT_SECRET, // Secret from env
  { expiresIn: "24h" }, // Expiration
);

// Token verification
jwt.verify(token, process.env.JWT_SECRET); // Throws if invalid/expired
```

### Input Validation Layers

```
1. Frontend (React)
   └─ Form validation before submit

2. Backend Controller
   └─ Manual validation of required fields
   └─ Role-specific field validation

3. Mongoose Schema
   └─ Type validation
   └─ Required fields
   └─ Enum constraints
   └─ Min/max length
   └─ Custom validators
```

### CORS Configuration

```javascript
cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/, // LAN access
  ],
  credentials: true, // Allow Authorization header
});
```

### Environment Variables

```bash
# Never commit these
JWT_SECRET=<random-256-bit-string>
MONGO_URI=<connection-string-with-password>
GEMINI_API_KEY=<api-key>
OPENAI_API_KEY=<api-key>
```

---

## File Structure Reference

```
Class-Pilot/
├── backend/
│   ├── config/
│   │   └── db.js                    # mongoose.connect()
│   │
│   ├── controllers/
│   │   ├── AuthController.js        # register, login, getMe
│   │   ├── classController.js       # CRUD classes, join
│   │   ├── AttendenceController.js  # mark, get, stats
│   │   ├── quizController.js        # generate, submit, stats
│   │   ├── studyPlannerController.js # generate, chapters, holidays
│   │   ├── assignmentController.js  # CRUD, submit, grade
│   │   ├── gradeController.js       # CRUD grades
│   │   ├── meetingController.js     # CRUD, join/leave
│   │   ├── announcementController.js # post, comment, pin
│   │   ├── classworkController.js   # sections, items
│   │   ├── portfolioController.js   # dashboard, analytics
│   │   ├── timetableController.js   # slots, auto-populate
│   │   └── exportController.js      # PDF, Excel generation
│   │
│   ├── middleware/
│   │   └── auth.js                  # protect(), authorize()
│   │
│   ├── models/
│   │   ├── User.js                  # bcrypt pre-save hook
│   │   ├── Class.js                 # nanoid pre-save hook
│   │   ├── Attendence.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js           # compound index
│   │   ├── Assignment.js
│   │   ├── StudyPlanner.js
│   │   ├── Grade.js
│   │   ├── Meeting.js
│   │   ├── Announcement.js
│   │   ├── ClassworkSection.js
│   │   └── Timetable.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── class.js
│   │   ├── attendance.js
│   │   ├── quiz.js
│   │   ├── studyPlanner.js
│   │   ├── assignment.js
│   │   ├── grade.js
│   │   ├── meeting.js
│   │   ├── announcement.js
│   │   ├── classwork.js
│   │   ├── portfolio.js
│   │   ├── timetable.js
│   │   └── export.js
│   │
│   ├── utils/
│   │   ├── aiService.js             # Gemini/OpenAI integration
│   │   ├── csvParser.js
│   │   └── dateCalculator.js
│   │
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env                         # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── shared/
│   │   │       ├── Alert.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ...
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # createContext()
│   │   │   ├── AuthProvider.jsx     # useReducer + Provider
│   │   │   ├── ClassProvider.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # useContext(AuthContext)
│   │   │   ├── useClass.js
│   │   │   └── useTheme.js
│   │   │
│   │   ├── pages/
│   │   │   ├── TeacherClasses.jsx
│   │   │   ├── StudentClasses.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Quizzes.jsx
│   │   │   ├── QuizGenerator.jsx
│   │   │   ├── TakeQuiz.jsx
│   │   │   ├── StudyPlanner.jsx
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + API namespaces
│   │   │
│   │   ├── App.jsx                  # Provider hierarchy + Routes
│   │   ├── main.jsx                 # ReactDOM.createRoot()
│   │   └── index.css                # Tailwind imports
│   │
│   ├── package.json
│   └── vite.config.js
│
└── indepthReadMe.md
```

---

## Development Commands

```bash
# Backend
cd Class-Pilot/backend
npm install
npm run dev          # nodemon server.js
npm start            # node server.js

# Frontend
cd Class-Pilot/frontend
npm install
npm run dev          # vite (localhost:5173)
npm run build        # vite build
npm run preview      # preview production build
```

---

## Environment Setup Checklist

1. **MongoDB Atlas**
   - Create cluster
   - Create database user
   - Whitelist IP (0.0.0.0/0 for dev)
   - Get connection string

2. **Backend .env**

   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=<generate-random-string>
   GEMINI_API_KEY=<from-google-ai-studio>
   ```

3. **Google AI Studio**
   - Create project
   - Enable Generative AI API
   - Create API key

4. **Start Services**

   ```bash
   # Terminal 1
   cd backend && npm run dev

   # Terminal 2
   cd frontend && npm run dev
   ```

5. **Test Flow**
   - Register teacher → Create class → Copy code
   - Register student → Join with code
   - Teacher: Mark attendance, generate quiz
   - Student: Take quiz, view grades

---

## Error Handling

### Backend Error Handling Pattern

```javascript
// Controller try-catch pattern
export const createClass = async (req, res, next) => {
  try {
    // Business logic
  } catch (error) {
    // Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate entry" });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    // Mongoose cast error (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Pass to global error handler
    next(error);
  }
};
```

### Global Error Handler (server.js)

```javascript
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route Not Found",
    path: req.originalUrl,
    message: "The requested API endpoint does not exist.",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
  });
});
```

### Frontend Error Handling

```javascript
// API call with error extraction
const handleSubmit = async (data) => {
  setLoading(true);
  setError(null);

  try {
    const response = await classAPI.createClass(data);
    setSuccess("Class created!");
    return response.data;
  } catch (error) {
    // Extract error message from various response formats
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";
    setError(message);
  } finally {
    setLoading(false);
  }
};
```

---

## Frontend Component Patterns

### Page Component Structure

```javascript
// Standard page component pattern
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner, Alert } from "../components/shared";
import { classAPI } from "../services/api";

const PageComponent = () => {
  // 1. Hooks
  const { user } = useAuth();

  // 2. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Effects
  useEffect(() => {
    fetchData();
  }, []);

  // 4. Handlers
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getTeacherClasses();
      setData(response.data.classes);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // 5. Conditional renders
  if (loading) return <LoadingSpinner />;

  // 6. Main render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {/* Content */}
    </div>
  );
};

export default PageComponent;
```

### Protected Route Component

```javascript
// App.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Usage
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

### Role-Based Rendering

```javascript
// Render different components based on role
const ClassesPage = () => {
  const { user } = useAuth();

  if (user?.role === "teacher") {
    return <TeacherClasses />;
  } else {
    return <StudentClasses />;
  }
};
```

---

## Styling System

### Tailwind CSS Configuration

```javascript
// tailwind.config.js (implicit with Tailwind 4)
// Uses CSS-first configuration in index.css

// index.css
@import "tailwindcss";

:root {
  --bg-primary: #000000;
  --bg-secondary: #18181b;
  --bg-tertiary: #27272a;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --accent-blue: #3b82f6;
  --accent-green: #10b981;
  --accent-red: #ef4444;
}
```

### Theme Implementation

```javascript
// context/ThemeContext.jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Common UI Patterns

```javascript
// Card component
<div className={`rounded-lg border p-6 ${
  isDark
    ? "bg-zinc-900 border-zinc-800"
    : "bg-white border-gray-200"
}`}>

// Button variants
// Primary
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// Secondary
<button className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600">

// Danger
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">

// Gradient
<button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">

// Input field
<input className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
  isDark
    ? "bg-zinc-800 border-zinc-700 text-white"
    : "bg-white border-gray-300 text-gray-900"
}`} />

// Status badges
const statusColors = {
  present: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-yellow-100 text-yellow-800",
};
<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
```

---

## Data Flow Examples

### Quiz Generation Flow

```
1. Teacher fills QuizGenerator form
   │  { classId, title, topic, chapter, numberOfQuestions, difficultyLevel }
   │
2. Submit → quizAPI.generateQuiz(data)
   │
3. POST /api/quiz/generate
   │
4. quizController.generateQuiz()
   │  ├─ Validate classId exists
   │  ├─ Verify teacher owns class
   │  ├─ Call aiService.generateQuizQuestions()
   │  │     ├─ Build prompt
   │  │     ├─ Call Gemini API
   │  │     ├─ Parse JSON response
   │  │     └─ Validate question structure
   │  └─ Quiz.create({ title, classId, createdBy, questions, ... })
   │
5. Response: { quiz: { _id, title, questions, ... } }
   │
6. Frontend redirects to quiz list or shows success
```

### Student Quiz Submission Flow

```
1. Student completes quiz in TakeQuiz.jsx
   │  answers = [0, 2, 1, 3, ...]  // Selected option indices
   │
2. Submit → quizAPI.submitQuiz(quizId, answers, timeTaken)
   │
3. POST /api/quiz/:quizId/submit
   │
4. quizController.submitQuiz()
   │  ├─ Find quiz by ID
   │  ├─ Check student hasn't already attempted (compound index)
   │  ├─ Calculate score:
   │  │     let score = 0;
   │  │     quiz.questions.forEach((q, i) => {
   │  │       if (answers[i] === q.correctAnswer) score++;
   │  │     });
   │  ├─ QuizAttempt.create({ quizId, studentId, answers, score, ... })
   │  └─ Return attempt with score
   │
5. Response: { attempt: { score: 8, totalQuestions: 10, ... } }
   │
6. Frontend shows results with correct/incorrect breakdown
```

### Attendance Marking Flow

```
1. Teacher selects class and date in Attendance.jsx
   │
2. Fetches student list from class
   │
3. Teacher marks each student: present/absent/late
   │  records = [
   │    { studentId: "...", status: "present" },
   │    { studentId: "...", status: "absent", notes: "Sick" },
   │  ]
   │
4. Submit → attendanceAPI.markAttendance({ classId, date, records })
   │
5. POST /api/attendance/mark
   │
6. attendanceController.markAttendance()
   │  ├─ Validate teacher owns class
   │  ├─ For each record:
   │  │     Attendance.findOneAndUpdate(
   │  │       { classId, studentId, date },
   │  │       { status, notes, markedBy },
   │  │       { upsert: true }  // Create if not exists
   │  │     )
   │  └─ Return updated attendance records
   │
7. Response: { attendance: [...] }
```

---

## Testing Guide

### Manual API Testing with cURL

```bash
# Health check
curl http://localhost:5000/health

# Register teacher
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Teacher",
    "email": "teacher@test.com",
    "password": "test123",
    "role": "teacher",
    "schoolName": "Test School"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@test.com", "password": "test123"}'

# Get current user (with token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"

# Create class
curl -X POST http://localhost:5000/api/class/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "className": "10th Grade",
    "subject": "Mathematics",
    "board": "CBSE"
  }'
```

### Test Scenarios Checklist

**Authentication:**

- [ ] Register teacher with valid data
- [ ] Register student with valid data
- [ ] Reject registration with missing fields
- [ ] Reject duplicate email
- [ ] Login with correct credentials
- [ ] Reject login with wrong password
- [ ] Access protected route with valid token
- [ ] Reject expired/invalid token

**Classes:**

- [ ] Teacher creates class → gets unique classCode
- [ ] Student joins with valid code
- [ ] Reject invalid join code
- [ ] Teacher sees only their classes
- [ ] Student sees only enrolled classes

**Quizzes:**

- [ ] Teacher generates quiz with AI
- [ ] Quiz has correct number of questions
- [ ] Student takes quiz
- [ ] Score calculated correctly
- [ ] Prevent duplicate attempts

**Attendance:**

- [ ] Teacher marks attendance
- [ ] Update existing attendance record
- [ ] Student views own attendance
- [ ] Stats calculated correctly

---

## Deployment Considerations

### Environment Variables for Production

```bash
# Production .env
NODE_ENV=production
PORT=5000

# Use strong secret (256-bit)
JWT_SECRET=<generate-with-openssl-rand-hex-32>

# MongoDB Atlas production cluster
MONGO_URI=mongodb+srv://prod-user:prod-pass@prod-cluster.mongodb.net/classpilot-prod

# API keys
GEMINI_API_KEY=<production-key>
```

### Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Increase bcrypt cost factor to 10-12
- [ ] Enable HTTPS in production
- [ ] Restrict CORS origins to production domain
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Add request validation middleware
- [ ] Enable MongoDB authentication
- [ ] Whitelist only production IPs in MongoDB Atlas

### Build Commands

```bash
# Frontend production build
cd frontend
npm run build
# Output: dist/ folder

# Serve with static server or deploy to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront

# Backend deployment options:
# - Railway
# - Render
# - AWS EC2/ECS
# - DigitalOcean App Platform
```

### Recommended Production Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CloudFlare    │────▶│   Vercel/       │────▶│   React App     │
│   (CDN + DNS)   │     │   Netlify       │     │   (Static)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        │ API calls
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   MongoDB       │◀────│   Railway/      │◀────│   Express API   │
│   Atlas         │     │   Render        │     │   (Node.js)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Troubleshooting

### Common Issues

**MongoDB Connection Failed:**

```
Error: MongoNetworkError: connection refused
```

- Check MONGO_URI is correct
- Whitelist IP in MongoDB Atlas (0.0.0.0/0 for dev)
- Check network connectivity

**JWT Token Invalid:**

```
Error: JsonWebTokenError: invalid signature
```

- Ensure JWT_SECRET matches between token creation and verification
- Check token hasn't been modified
- Verify token hasn't expired

**CORS Error:**

```
Access-Control-Allow-Origin header missing
```

- Add frontend URL to CORS origin array in server.js
- Ensure credentials: true if sending cookies/auth headers

**AI Generation Failed:**

```
Error: Gemini API quota exceeded
```

- Check API key is valid
- Verify quota hasn't been exceeded
- Fallback to OpenAI if configured

**Mongoose Validation Error:**

```
ValidationError: Path `email` is required
```

- Check request body has all required fields
- Verify field names match schema exactly

### Debug Mode

```javascript
// Enable mongoose debug logging
mongoose.set("debug", true);

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

---

## Contributing Guidelines

### Code Style

- Use ES Modules (`import`/`export`)
- Include `.js` extension in backend imports
- Use async/await over Promises
- Destructure objects and arrays
- Use `const` by default, `let` when needed

### File Naming

| Type             | Convention     | Example             |
| ---------------- | -------------- | ------------------- |
| React Components | PascalCase.jsx | `Dashboard.jsx`     |
| Hooks            | camelCase.js   | `useAuth.js`        |
| Controllers      | PascalCase.js  | `AuthController.js` |
| Models           | PascalCase.js  | `User.js`           |
| Routes           | camelCase.js   | `auth.js`           |

### Git Workflow

```bash
# Feature branch
git checkout -b feature/quiz-timer

# Commit messages
git commit -m "feat: add quiz timer countdown"
git commit -m "fix: prevent duplicate quiz attempts"
git commit -m "docs: update API reference"

# Push and create PR
git push origin feature/quiz-timer
```

---

## License

MIT License - Educational Use

Built as a CS50x Final Project

---

_Last updated: January 2025_

---

## Recent Updates & Changes

### Version 1.0.0 (January 2025)

#### Technology Stack Updates

- **Backend:**
  - Upgraded to Express.js 5.1.0
  - Updated Mongoose to 8.19.1
  - Added @google-cloud/vertexai 1.10.0 for enhanced AI capabilities
  - Updated OpenAI to 6.9.1
  - Added ExcelJS 4.4.0 for Excel export functionality
  - Added PDFKit 0.17.2 for PDF generation
  - Updated Axios to 1.12.2
  - Updated MongoDB driver to 6.20.0

- **Frontend:**
  - Upgraded to React 19.1.1
  - Updated to Vite 7.1.14 (using rolldown-vite for improved performance)
  - Updated React Router to 7.9.4
  - Updated Tailwind CSS to 4.1.14
  - Added @dnd-kit packages (6.3.1+) for drag-and-drop functionality
  - Added Recharts 3.6.0 for data visualization
  - Updated Axios to 1.12.2

#### New Features

1. **Enhanced AI Integration:**
   - Dual AI provider support (Gemini and OpenAI)
   - Configurable AI provider via environment variable
   - Improved error handling and fallback mechanisms
   - AI-powered study plan generation

2. **Export Functionality:**
   - PDF export for student portfolios
   - Excel export for attendance records
   - Excel export for grade reports
   - Excel export for quiz results

3. **Drag & Drop Interface:**
   - Study planner chapter reordering
   - Improved UX for content organization

4. **Data Visualization:**
   - Charts for grade trends
   - Quiz performance analytics
   - Attendance statistics visualization

5. **Enhanced Attendance System:**
   - CSV bulk upload support
   - Improved statistics calculation
   - Better date handling

#### API Improvements

- Added health check endpoint (`/health`)
- Improved error handling with detailed error messages
- Enhanced CORS configuration for Azure deployment
- Added request logging middleware
- Graceful shutdown handling (SIGINT, SIGTERM)

#### Database Schema Enhancements

- Added compound indexes for better query performance
- Enhanced validation rules
- Improved date handling in StudyPlanner model
- Added status tracking for assignments and meetings

#### Security Updates

- Updated JWT token handling
- Enhanced password hashing (bcryptjs 3.0.2)
- Improved input validation
- Better error messages without exposing sensitive data

#### Developer Experience

- Added comprehensive testing utilities in `backend/Testers&Reseters/`
- Improved documentation with detailed API reference
- Added Azure deployment guide
- Enhanced setup instructions
- Better error messages and logging

#### Bug Fixes

- Fixed attendance marking for duplicate dates
- Resolved quiz attempt duplicate prevention
- Fixed class code generation collisions
- Improved date calculations in study planner
- Fixed CORS issues for local network access

---

## Environment Variables Reference

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=24h

# AI Configuration
AI_PROVIDER=gemini                    # "gemini" or "openai"
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key    # Optional fallback

# Optional: Vertex AI (for advanced features)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### Frontend

No environment variables required for development. For production deployment, configure the API base URL in `src/services/api.js`.

---

## Deployment Notes

### Azure Static Web Apps (Frontend)

The frontend includes `staticwebapp.config.json` for Azure deployment with proper routing configuration.

### Azure App Service (Backend)

The backend is configured for Azure deployment with:

- Proper CORS settings for Azure Static Web Apps
- Health check endpoint for monitoring
- Graceful shutdown handling
- Production-ready error handling

See `AZURE_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

---

## Testing Utilities

The project includes several testing utilities in `backend/Testers&Reseters/`:

- `test-api.js` - Test all API endpoints
- `test-class-api.js` - Test class-specific endpoints
- `test-ai.js` - Test AI integration
- `test-all-features.js` - Comprehensive feature testing
- `quick-test.js` - Quick smoke tests
- `create-test-student.js` - Create test student accounts
- `reset-password.js` - Password reset utility

Run tests with:

```bash
cd backend
node Testers&Reseters/test-api.js
```

---

## Performance Considerations

### Database Indexes

The following indexes are configured for optimal query performance:

- **Users:** email (unique)
- **Classes:** classCode (unique), teacherId
- **Attendance:** compound index on (classId, studentId, date)
- **QuizAttempts:** compound unique index on (quizId, studentId)
- **Quizzes:** compound index on (classId, teacherId, createdAt)

### Caching Strategy

- JWT tokens cached in localStorage (frontend)
- AI clients initialized lazily (backend)
- MongoDB connection pooling enabled

### Optimization Tips

1. Use pagination for large data sets (announcements, grades)
2. Implement lazy loading for images and heavy components
3. Use React.memo for expensive components
4. Leverage MongoDB aggregation for complex queries
5. Consider Redis for session management in production

---

## Known Limitations

1. **AI Generation:**
   - Requires active API keys (Gemini or OpenAI)
   - Subject to API rate limits and quotas
   - Generated content quality depends on prompt engineering

2. **File Uploads:**
   - Currently limited to text content for assignments
   - File attachment support planned for future release

3. **Real-time Features:**
   - No WebSocket support yet
   - Polling required for live updates
   - Real-time chat planned for future release

4. **Mobile App:**
   - Currently web-only
   - Responsive design works on mobile browsers
   - Native mobile apps planned for future

---

## Future Roadmap

### Planned Features

1. **Real-time Communication:**
   - WebSocket integration for live updates
   - In-app chat between teachers and students
   - Real-time quiz participation

2. **Enhanced File Management:**
   - File upload support for assignments
   - Cloud storage integration (AWS S3, Azure Blob)
   - Document preview functionality

3. **Advanced Analytics:**
   - Predictive analytics for student performance
   - AI-powered insights and recommendations
   - Custom report generation

4. **Mobile Applications:**
   - React Native mobile apps
   - Push notifications
   - Offline mode support

5. **Integration Capabilities:**
   - Google Classroom integration
   - Microsoft Teams integration
   - LMS integration (Moodle, Canvas)

6. **Accessibility:**
   - Screen reader optimization
   - Keyboard navigation improvements
   - High contrast themes

---

## Contributing

### Code Style Guidelines

- Use ES Modules (`import`/`export`)
- Include `.js` extension in backend imports
- Use async/await over Promises
- Destructure objects and arrays
- Use `const` by default, `let` when needed
- Follow Airbnb JavaScript Style Guide

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

```
feat(quiz): add AI-powered quiz generation
fix(attendance): resolve duplicate date marking issue
docs(readme): update installation instructions
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support & Contact

For issues, questions, or contributions:

- **GitHub Issues:** [Create an issue](https://github.com/your-repo/issues)
- **Documentation:** See `indepthReadMe.md` for technical details
- **Setup Guide:** See `SETUP.md` for installation help

---

## License

MIT License - Educational Use

Built as a CS50x Final Project by Nikhil Pratap Singh

---

## Acknowledgments

- CS50x course by Harvard University
- MongoDB Atlas for database hosting
- Google Gemini AI for quiz generation
- OpenAI for fallback AI capabilities
- React and Vite communities
- All open-source contributors

---

_Last updated: January 2025_

---

## Complete File Reference

### Backend Files

#### Core Files

| File           | Purpose                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server.js`    | Application entry point. Initializes Express, connects to MongoDB, configures middleware (CORS, JSON parser), mounts all routes, sets up error handlers, and starts the HTTP server on port 5000. |
| `config/db.js` | MongoDB connection module. Exports `connectDB()` function that establishes connection to MongoDB Atlas using `MONGO_URI` from environment variables. Exits process on connection failure.         |
| `.env`         | Environment variables storage. Contains `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `GEMINI_API_KEY`, `OPENAI_API_KEY`. Never committed to git.                                              |
| `package.json` | Node.js project manifest. Defines dependencies, scripts (`dev`, `start`), and ES module configuration (`"type": "module"`).                                                                       |

#### Middleware

| File                 | Purpose                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `middleware/auth.js` | Authentication middleware. Exports `protect()` - extracts JWT from Authorization header, verifies token, attaches user to `req.user`. Exports `authorize(...roles)` - checks if `req.user.role` is in allowed roles list. |

#### Models (Database Schemas)

| File                         | Purpose                                                                                                                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `models/User.js`             | User schema with `name`, `email`, `password`, `role` (teacher/student), conditional `schoolName`/`rollNumber`. Pre-save hook hashes password with bcrypt. Instance method `matchPassword()` compares passwords. |
| `models/Class.js`            | Class schema with `className`, `subject`, `board`, `classCode`, `teacherId`, `students[]`. Pre-save hook auto-generates unique class code using nanoid (format: `SUBJ-XXXXXX`).                                 |
| `models/Attendence.js`       | Attendance record schema. Links `classId`, `studentId`, `date`, `status` (present/absent/late), `notes`, `markedBy`.                                                                                            |
| `models/Quiz.js`             | Quiz schema with `title`, `classId`, `createdBy`, `questions[]` (each with question, options, correctAnswer index), `timeLimit`, `randomizeQuestions`, `showInstantFeedback`, `isActive`.                       |
| `models/QuizAttempt.js`      | Student quiz submission. Links `quizId`, `studentId`, stores `answers[]`, `score`, `totalQuestions`, `timeTaken`. Compound unique index prevents duplicate attempts.                                            |
| `models/Assignment.js`       | Assignment schema with `title`, `description`, `classId`, `dueDate`, `totalPoints`, embedded `submissions[]` array with student submissions and grades.                                                         |
| `models/StudyPlanner.js`     | Study plan schema. Links to `classId` (unique), stores `academicYear`, `chapters[]` (name, duration, dates, status), `holidays[]`, `examDates[]`.                                                               |
| `models/Grade.js`            | Grade record with `studentId`, `classId`, `category`, `title`, `score`, `maxScore`, `weight`, `gradedBy`.                                                                                                       |
| `models/Meeting.js`          | Meeting schema with `title`, `classId`, `scheduledAt`, `duration`, `meetingLink`, `status` (scheduled/live/completed/cancelled), `attendees[]`.                                                                 |
| `models/Announcement.js`     | Announcement schema with `classId`, `authorId`, `content`, `type` (announcement/material/assignment), `isPinned`, embedded `comments[]`.                                                                        |
| `models/ClassworkSection.js` | Classwork organization. Sections with `name`, `classId`, `items[]` referencing quizzes/assignments.                                                                                                             |
| `models/Timetable.js`        | User timetable with `userId`, `slots[]` (day, times, subject, classId, location).                                                                                                                               |

#### Controllers (Business Logic)

| File                                    | Purpose                                                                                                                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controllers/AuthController.js`         | Handles `registerUser` (validates input, creates user, returns JWT), `loginUser` (validates credentials, returns JWT), `getMe` (returns current user from token).                                   |
| `controllers/classController.js`        | Handles class CRUD: `createClass` (teacher creates with auto-generated code), `getTeacherClasses`, `getStudentClasses`, `joinClass` (student joins with code), `getClassDetails`.                   |
| `controllers/AttendenceController.js`   | Handles `markAttendance` (teacher marks/updates records), `getClassAttendance`, `getStudentAttendance`, `getAttendanceStats` (calculates percentages).                                              |
| `controllers/quizController.js`         | Handles `generateQuiz` (calls AI service, creates quiz), `getClassQuizzes`, `getQuiz`, `submitQuiz` (calculates score, creates attempt), `getQuizStats`.                                            |
| `controllers/studyPlannerController.js` | Handles `generatePlanner` (AI generates chapters), `getPlanner`, `deletePlanner`, `updateAcademicYear`, `addChapter`, `updateChapter`, `deleteChapter`, `reorderChapters`, holiday/exam management. |
| `controllers/assignmentController.js`   | Handles assignment CRUD, `submitAssignment` (student submits), `gradeSubmission` (teacher grades with feedback).                                                                                    |
| `controllers/gradeController.js`        | Handles grade CRUD: `addGrade`, `getClassGrades`, `getStudentGrades`, `getGradeReport`, `updateGrade`, `deleteGrade`.                                                                               |
| `controllers/meetingController.js`      | Handles meeting CRUD, `updateMeetingStatus`, `joinMeeting`/`leaveMeeting` (student attendance tracking).                                                                                            |
| `controllers/announcementController.js` | Handles `postAnnouncement`, `getClassStream`, `getRecentAnnouncements`, `togglePin`, `deleteAnnouncement`, `addComment`.                                                                            |
| `controllers/classworkController.js`    | Handles classwork sections: `createSection`, `updateSection`, `deleteSection`, `addItemToSection`, `removeItemFromSection`, `getClasswork`, `getClassPeople`.                                       |
| `controllers/portfolioController.js`    | Handles `getStudentDashboard` (aggregates all student data), `getStudentPortfolio` (detailed analytics), `getClassAnalytics` (teacher view).                                                        |
| `controllers/timetableController.js`    | Handles timetable CRUD, `addSlot`, `updateSlot`, `deleteSlot`, `getDaySchedule`, `autoPopulate` (student auto-fills from enrolled classes).                                                         |
| `controllers/exportController.js`       | Handles file exports: `downloadPortfolioPDF`, `downloadAttendanceExcel`, `downloadGradesExcel`, `downloadQuizResults`. Generates files and returns as blob.                                         |

#### Routes (API Endpoints)

| File                     | Purpose                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `routes/auth.js`         | Maps `/api/auth/*` endpoints. POST `/register`, POST `/login` (public), GET `/me` (protected).                                                                     |
| `routes/class.js`        | Maps `/api/class/*` endpoints. POST `/create` (teacher), GET `/teacher`, POST `/join` (student), GET `/student`, GET `/:classId`.                                  |
| `routes/attendance.js`   | Maps `/api/attendance/*` endpoints. POST `/mark` (teacher), GET `/class`, GET `/student`, GET `/stats`.                                                            |
| `routes/quiz.js`         | Maps `/api/quiz/*` endpoints. POST `/generate` (teacher), GET `/class/:classId`, GET `/:quizId`, POST `/:quizId/submit` (student), GET `/stats/:quizId` (teacher). |
| `routes/studyPlanner.js` | Maps `/api/studyplanner/*` endpoints. All chapter/holiday/exam management routes with teacher authorization.                                                       |
| `routes/assignment.js`   | Maps `/api/assignment/*` endpoints. CRUD routes with role-based access.                                                                                            |
| `routes/grade.js`        | Maps `/api/grade/*` endpoints. Teacher adds/updates, student views own.                                                                                            |
| `routes/meeting.js`      | Maps `/api/meeting/*` endpoints. Teacher creates/manages, student joins/leaves.                                                                                    |
| `routes/announcement.js` | Maps `/api/announcement/*` endpoints. Teacher posts/pins, all can comment.                                                                                         |
| `routes/classwork.js`    | Maps `/api/classwork/*` endpoints. Section management for teachers.                                                                                                |
| `routes/portfolio.js`    | Maps `/api/portfolio/*` endpoints. Dashboard and analytics routes.                                                                                                 |
| `routes/timetable.js`    | Maps `/api/timetable/*` endpoints. Slot management and auto-populate.                                                                                              |
| `routes/export.js`       | Maps `/api/export/*` endpoints. PDF/Excel download routes.                                                                                                         |

#### Utilities

| File                      | Purpose                                                                                                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/aiService.js`      | AI integration module. Initializes Gemini/OpenAI clients lazily. Exports `generateQuizQuestions()` (builds prompt, calls AI, parses/validates response), `generateStudyPlanChapters()`, `testAIConnection()`. |
| `utils/csvParser.js`      | CSV parsing utilities for bulk data import (attendance, students).                                                                                                                                            |
| `utils/dateCalculator.js` | Date utility functions for study planner calculations (working days, date ranges).                                                                                                                            |
| `utils/index.js`          | Common utilities. `formatResponse()` for consistent API responses, `generateClassCode()` helper.                                                                                                              |

---

### Frontend Files

#### Entry Points

| File        | Purpose                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `main.jsx`  | React application entry point. Calls `ReactDOM.createRoot()`, renders `<App />` wrapped in `<StrictMode>`.                                                                           |
| `App.jsx`   | Root component. Sets up provider hierarchy (ThemeProvider → AuthProvider → Router → ClassProvider), defines all routes with `<ProtectedRoute>` wrappers, renders Sidebar and Footer. |
| `index.css` | Global styles. Imports Tailwind CSS, defines CSS custom properties for theming (--bg-primary, --text-primary, etc.).                                                                 |

#### Context Providers

| File                        | Purpose                                                                                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context/AuthContext.jsx`   | Creates AuthContext with `createContext()`. Exports context for useAuth hook.                                                                                                                                                 |
| `context/AuthProvider.jsx`  | Auth state management. Uses `useReducer` with actions: LOGIN_START, LOGIN_SUCCESS, LOGIN_ERROR, LOGOUT. Provides `login()`, `register()`, `logout()`, `clearError()`. On mount, validates existing token with `/api/auth/me`. |
| `context/ClassProvider.jsx` | Class state management. Manages `classes`, `currentClass`, provides `fetchClasses()`, `createClass()`, `joinClass()`, `selectClass()`.                                                                                        |
| `context/ThemeContext.jsx`  | Theme state management. Stores theme in localStorage, provides `theme` ("dark"/"light") and `toggleTheme()`.                                                                                                                  |

#### Custom Hooks

| File                | Purpose                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/useAuth.js`  | Wrapper for AuthContext. Returns `{ user, token, isAuthenticated, loading, error, login, register, logout, clearError }`. Throws error if used outside AuthProvider. |
| `hooks/useClass.js` | Wrapper for ClassContext. Returns class state and actions.                                                                                                           |
| `hooks/useTheme.js` | Wrapper for ThemeContext. Returns `{ theme, toggleTheme }`.                                                                                                          |

#### Services

| File              | Purpose                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `services/api.js` | Centralized API layer. Creates axios instance with base URL and interceptors (auto-attach JWT). Exports namespaced API objects: `authAPI`, `classAPI`, `attendanceAPI`, `quizAPI`, `studyPlannerAPI`, `assignmentAPI`, `gradeAPI`, `meetingAPI`, `announcementAPI`, `classworkAPI`, `portfolioAPI`, `timetableAPI`, `exportAPI`. Also exports `downloadFile()` helper for blob downloads. |

#### Shared Components

| File                                        | Purpose                                                                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/shared/Sidebar.jsx`             | Collapsible navigation sidebar. Shows role-based menu items (teacher vs student), theme toggle, user profile, logout button. Responsive with mobile hamburger menu.           |
| `components/shared/Dashboard.jsx`           | Main dashboard component. Shows welcome message, stats cards, tabbed section (Stream/Classwork/People), recent activity. Fetches announcements, classwork, and class members. |
| `components/shared/Alert.jsx`               | Dismissible alert component. Props: `type` (success/error/warning/info), `message`, `onClose`. Auto-dismiss option.                                                           |
| `components/shared/LoadingSpinner.jsx`      | Loading indicator. Props: `size` (sm/md/lg), `text`. Animated spinner with optional message.                                                                                  |
| `components/shared/FormInput.jsx`           | Reusable form input. Props: `label`, `type`, `name`, `value`, `onChange`, `placeholder`, `required`, `error`, `icon`. Handles validation styling.                             |
| `components/shared/FeatureCard.jsx`         | Dashboard feature tile. Props: `title`, `description`, `icon`, `buttonText`, `onClick`, `disabled`, `color`. Gradient button with hover effects.                              |
| `components/shared/Footer.jsx`              | Page footer. Shows copyright, links, branding.                                                                                                                                |
| `components/shared/NotFound.jsx`            | 404 page component. Shows error message with link back to dashboard.                                                                                                          |
| `components/shared/Navigation.jsx`          | **DEPRECATED** - Old top navigation bar, replaced by Sidebar.jsx.                                                                                                             |
| `components/shared/ConnectionTest.jsx`      | **DEV ONLY** - Tests API connection. Can be removed in production.                                                                                                            |
| `components/shared/StudentAnnouncement.jsx` | Student-specific announcement display component.                                                                                                                              |
| `components/shared/index.js`                | Barrel export file. Re-exports all shared components for cleaner imports.                                                                                                     |

#### Auth Components

| File                           | Purpose                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/auth/Login.jsx`    | Login form. Email/password inputs, calls `login()` from useAuth, redirects to dashboard on success. Shows error alerts.                      |
| `components/auth/Register.jsx` | Registration form. Name, email, password, role selector, conditional schoolName/rollNumber fields. Calls `register()`, redirects on success. |
| `components/auth/index.js`     | Barrel export for auth components.                                                                                                           |

#### Page Components

| File                           | Purpose                                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/TeacherClasses.jsx`     | Teacher's class list. Shows created classes with student count, class code. Create class modal. Links to class details.                                        |
| `pages/StudentClasses.jsx`     | Student's enrolled classes. Shows joined classes. Join class modal with code input. Links to class details.                                                    |
| `pages/ClassDetails.jsx`       | Single class view. Shows class info, student list (teacher), schedule, quick actions (attendance, quizzes, etc.).                                              |
| `pages/ClassRoom.jsx`          | Classroom view with tabs for stream, classwork, people. Alternative to ClassDetails.                                                                           |
| `pages/Attendance.jsx`         | Teacher attendance marking. Select class, date, mark each student present/absent/late. Bulk actions. Excel export button.                                      |
| `pages/StudentAttendance.jsx`  | Student views own attendance. Shows records by class, attendance percentage, calendar view.                                                                    |
| `pages/Quizzes.jsx`            | Quiz list page. Teachers see created quizzes with stats link. Students see available quizzes with take quiz button.                                            |
| `pages/QuizGenerator.jsx`      | AI quiz creation form. Select class, enter topic/chapter, number of questions, difficulty. Calls AI generation endpoint. Preview and edit generated questions. |
| `pages/TakeQuiz.jsx`           | Student quiz interface. Shows questions one at a time or all, countdown timer, option selection. Submits answers, shows results.                               |
| `pages/QuizStats.jsx`          | Quiz statistics for teachers. Shows average score, score distribution, per-question analysis, student attempts list. Excel export.                             |
| `pages/StudyPlanner.jsx`       | Study planner management. Teachers: generate plan, add/edit/delete/reorder chapters, set holidays/exams. Students: view plan. Drag-drop reordering.            |
| `pages/Assignments.jsx`        | Assignment list. Teachers create/edit assignments. Students see assignments with due dates, submission status.                                                 |
| `pages/AssignmentDetail.jsx`   | Single assignment view. Shows description, due date. Students submit. Teachers view submissions, grade with feedback.                                          |
| `pages/Grades.jsx`             | Grade management. Teachers add/edit grades by class. Students view their grades. Excel export.                                                                 |
| `pages/Portfolio.jsx`          | Student portfolio/analytics. Shows performance across classes, quiz scores, attendance stats, grade trends. PDF export.                                        |
| `pages/StudentReports.jsx`     | Detailed student reports. Performance analytics, progress tracking.                                                                                            |
| `pages/Meetings.jsx`           | Meeting management. Teachers schedule meetings with link. Students see upcoming meetings, join button.                                                         |
| `pages/Timetable.jsx`          | Weekly timetable view. Grid layout by day/time. Students can auto-populate from enrolled classes. Manual slot editing.                                         |
| `pages/Schedule.jsx`           | Alternative schedule view. Shows daily/weekly schedule.                                                                                                        |
| `pages/ComingSoon.jsx`         | Placeholder page for unimplemented features. Props: `title`, `description`, `icon`.                                                                            |
| `pages/AnnouncementStream.jsx` | Standalone announcement stream view. May be redundant with Dashboard tabs.                                                                                     |
| `pages/ClassPeople.jsx`        | Class members list. Shows teacher and enrolled students. May be redundant with Dashboard People tab.                                                           |
| `pages/Classwork.jsx`          | Classwork sections view. May be redundant with Dashboard Classwork tab.                                                                                        |
| `pages/index.js`               | Barrel export for page components.                                                                                                                             |

---

### Configuration Files

| File                         | Purpose                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/vite.config.js`    | Vite configuration. Sets up React plugin, dev server port (5173), build options.                                                                  |
| `frontend/package.json`      | Frontend dependencies (react, react-router-dom, axios, tailwindcss) and scripts (dev, build, preview).                                            |
| `frontend/postcss.config.js` | PostCSS configuration for Tailwind CSS processing.                                                                                                |
| `backend/package.json`       | Backend dependencies (express, mongoose, jsonwebtoken, bcryptjs, cors, @google/generative-ai) and scripts. `"type": "module"` enables ES modules. |
| `.gitignore`                 | Git ignore patterns. Excludes node_modules, .env, dist, build artifacts.                                                                          |

---

### File Dependency Graph

```
main.jsx
└── App.jsx
    ├── context/ThemeContext.jsx
    ├── context/AuthProvider.jsx
    │   ├── context/AuthContext.jsx
    │   └── services/api.js (authAPI)
    ├── context/ClassProvider.jsx
    │   └── services/api.js (classAPI)
    ├── components/shared/Sidebar.jsx
    │   ├── hooks/useAuth.js
    │   └── hooks/useTheme.js
    ├── components/shared/Footer.jsx
    └── pages/*.jsx
        ├── hooks/useAuth.js
        ├── hooks/useClass.js
        ├── components/shared/*.jsx
        └── services/api.js

server.js
├── config/db.js
├── routes/*.js
│   ├── middleware/auth.js
│   └── controllers/*.js
│       ├── models/*.js
│       └── utils/aiService.js
└── middleware (cors, json, urlencoded)
```
