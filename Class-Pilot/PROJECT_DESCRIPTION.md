# Class Pilot - Complete Project Description for AI

## Executive Summary

Class Pilot is a comprehensive full-stack classroom management system designed for educational institutions. It's a MERN stack application (MongoDB, Express.js, React, Node.js) that facilitates interaction between teachers and students through features like attendance tracking, AI-powered quiz generation, assignment management, study planning, grading, and real-time announcements.

**Project Type:** Educational Technology Platform
**Architecture:** Full-stack web application with RESTful API
**Primary Users:** Teachers and Students
**Current Status:** Production-ready with Azure deployment support

---

## Technology Stack

### Backend

- **Runtime:** Node.js 20.19+
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB Atlas (Cloud) with Mongoose ODM 8.19.1
- **Authentication:** JWT (jsonwebtoken 9.0.2) with bcryptjs 3.0.2 for password hashing
- **AI Integration:**
  - Google Gemini API (@google/generative-ai 0.24.1) - Primary
  - OpenAI API (openai 6.9.1) - Fallback
- **File Generation:**
  - PDFKit 0.17.2 for PDF reports
  - ExcelJS 4.4.0 for Excel exports
- **Utilities:** nanoid 5.1.6 for unique code generation
- **Development:** nodemon 3.1.10 for hot reload

### Frontend

- **Framework:** React 19.1.1
- **Build Tool:** Vite 7 (rolldown-vite)
- **Routing:** React Router 7.9.4
- **HTTP Client:** Axios 1.12.2
- **Styling:** Tailwind CSS 4.1.14
- **Drag & Drop:** @dnd-kit (core, sortable, utilities)
- **Charts:** Recharts 3.6.0
- **State Management:** Context API with custom hooks

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  React 19 SPA with React Router 7                           │
│  ├─ Context Providers (Auth, Class, Theme)                  │
│  ├─ Custom Hooks (useAuth, useClass, useTheme)              │
│  ├─ Pages (30+ route components)                            │
│  └─ Axios API Service Layer                                 │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                       │
│  ├─ CORS Middleware                                         │
│  ├─ JSON Body Parser                                        │
│  ├─ 13 Route Modules                                        │
│  ├─ JWT Authentication Middleware                           │
│  ├─ Role-Based Authorization                                │
│  └─ Controllers (Business Logic)                            │
└─────────────────────────────────────────────────────────────┘
                          ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB Atlas)                    │
│  Collections: users, classes, attendance, quizzes,          │
│  quizattempts, assignments, grades, studyplanners,          │
│  timetables, meetings, announcements, classworksections     │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTPS API
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                               │
│  ├─ Google Gemini AI (Quiz & Study Plan Generation)        │
│  └─ OpenAI API (Fallback)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Example (Quiz Generation)

1. Student clicks "Generate Quiz" → Frontend sends POST to `/api/quiz/generate`
2. Express receives request → JWT middleware validates token
3. Authorization middleware checks if user is teacher
4. Controller extracts parameters (topic, chapter, difficulty, count)
5. Controller calls AI service (Gemini/OpenAI)
6. AI service generates questions in JSON format
7. Controller validates questions and creates Quiz document
8. Mongoose saves to MongoDB
9. Response sent back to frontend with quiz data
10. Frontend displays generated quiz

---

## Database Schema Design

### Core Collections

#### 1. Users Collection

**Purpose:** Store teacher and student accounts
**Schema:**

- `name` (String, required)
- `email` (String, unique, required, lowercase)
- `password` (String, required, hashed with bcrypt)
- `role` (Enum: "teacher" | "student", required)
- `schoolName` (String, required for teachers only)
- `rollNumber` (String, required for students only)
- `timestamps` (createdAt, updatedAt)

**Key Features:**

- Pre-save hook automatically hashes passwords with bcrypt (cost factor 3)
- Instance method `matchPassword()` for login verification
- Conditional field validation based on role

#### 2. Classes Collection

**Purpose:** Represent classroom entities
**Schema:**

- `className` (String, required) - e.g., "10th Grade"
- `subject` (String, required) - e.g., "Mathematics"
- `board` (String, required) - e.g., "CBSE"
- `classCode` (String, unique, auto-generated) - e.g., "MATH-A3B2C1"
- `teacherId` (ObjectId, ref: User, required)
- `students` (Array of ObjectId, ref: User)
- `timestamps`

**Key Features:**

- Pre-save hook auto-generates unique 6-character alphanumeric class code
- Format: `{SUBJECT_PREFIX}-{RANDOM}` (e.g., MATH-A3B2C1)
- Uses nanoid for collision-resistant code generation

#### 3. Attendance Collection

**Purpose:** Track daily student attendance
**Schema:**

- `classId` (ObjectId, ref: Class, required)
- `studentId` (ObjectId, ref: User, required)
- `date` (Date, required)
- `status` (Enum: "Present" | "Absent", required)
- `markedBy` (ObjectId, ref: User, required - teacher)
- `timestamps`

**Key Features:**

- Compound unique index on (classId, studentId, date) prevents duplicates
- Virtual field `formattedDate` returns dd-mm-yyyy format
- Additional indexes for common queries

#### 4. Quizzes Collection

**Purpose:** Store AI-generated or manual quizzes
**Schema:**

- `classId` (ObjectId, ref: Class, required)
- `teacherId` (ObjectId, ref: User, required)
- `topic` (String, required)
- `chapter` (String, required)
- `numberOfQuestions` (Number, required)
- `questions` (Array of question objects):
  - `question` (String, required)
  - `options` (Array of 4 strings, required)
  - `correctAnswer` (Number 0-3, required)
  - `difficultyLevel` (Enum: "easy" | "medium" | "hard")
- `generatedBy` (Enum: "openai" | "gemini" | "manual")
- `timestamps`

**Key Features:**

- Pre-validate hook syncs numberOfQuestions with questions.length
- Compound index on (classId, teacherId, createdAt)
- Validates exactly 4 options per question

#### 5. QuizAttempts Collection

**Purpose:** Track student quiz submissions
**Schema:**

- `quizId` (ObjectId, ref: Quiz, required)
- `studentId` (ObjectId, ref: User, required)
- `answers` (Array of Numbers - selected option indices)
- `score` (Number, required)
- `totalQuestions` (Number, required)
- `timeTaken` (Number - seconds)
- `submittedAt` (Date, default: now)

**Key Features:**

- Compound unique index on (quizId, studentId) prevents duplicate attempts
- Score calculated server-side by comparing answers to correctAnswer

#### 6. Assignments Collection

**Purpose:** Manage homework and projects
**Schema:**

- `classId` (ObjectId, ref: Class, required)
- `teacherId` (ObjectId, ref: User, required)
- `title` (String, required, max 200 chars)
- `description` (String, max 2000 chars)
- `instructions` (String, max 5000 chars)
- `dueDate` (Date, required)
- `totalMarks` (Number, required, 1-1000)
- `attachments` (Array of file objects)
- `submissions` (Array of submission subdocuments):
  - `studentId` (ObjectId, ref: User)
  - `content` (String)
  - `fileUrl` (String)
  - `submittedAt` (Date)
  - `grade` (Number, 0-100)
  - `feedback` (String)
  - `status` (Enum: "submitted" | "late" | "graded" | "returned")
- `allowLateSubmission` (Boolean, default: false)
- `latePenalty` (Number, 0-100)
- `status` (Enum: "draft" | "published" | "closed")
- `timestamps`

#### 7. StudyPlanner Collection

**Purpose:** AI-generated curriculum planning
**Schema:**

- `classId` (ObjectId, ref: Class, required, unique per class)
- `teacherId` (ObjectId, ref: User, required)
- `board` (String, required) - e.g., "CBSE"
- `className` (String, required) - e.g., "10th"
- `chapters` (Array of chapter objects):
  - `chapterName` (String, required)
  - `startDate` (Date, required)
  - `endDate` (Date, required)
  - `durationDays` (Number, auto-calculated excluding holidays)
  - `topics` (Array of strings, optional)
- `holidays` (Array of Dates, normalized to UTC midnight)
- `examDates` (Array of exam objects):
  - `examName` (String, required)
  - `date` (Date, required)
- `generatedAt` (Date)
- `lastEditedAt` (Date)
- `timestamps`

**Key Features:**

- Pre-validate hook calculates durationDays excluding holidays
- Validates endDate >= startDate for each chapter
- One study planner per class (unique classId)

#### 8. Grades Collection

**Purpose:** Track student performance
**Schema:**

- `studentId` (ObjectId, ref: User, required)
- `classId` (ObjectId, ref: Class, required)
- `category` (String, required) - e.g., "Quiz", "Assignment", "Exam"
- `title` (String, required)
- `score` (Number, required)
- `maxScore` (Number, required)
- `percentage` (Number, auto-calculated)
- `feedback` (String)
- `gradedBy` (ObjectId, ref: User - teacher)
- `timestamps`

#### 9. Timetable Collection

**Purpose:** Student weekly schedules
**Schema:**

- `studentId` (ObjectId, ref: User, required, unique)
- `slots` (Array of slot objects):
  - `day` (Enum: "Monday" to "Sunday")
  - `startTime` (String, HH:MM format)
  - `endTime` (String, HH:MM format)
  - `classId` (ObjectId, ref: Class)
  - `subject` (String)
  - `type` (Enum: "class" | "break" | "other")
- `timestamps`

**Key Features:**

- Auto-populate feature creates timetable from enrolled classes
- One timetable per student

#### 10. Meetings Collection

**Purpose:** Virtual class sessions
**Schema:**

- `classId` (ObjectId, ref: Class, required)
- `teacherId` (ObjectId, ref: User, required)
- `title` (String, required)
- `scheduledAt` (Date, required)
- `duration` (Number - minutes)
- `meetingLink` (String, required)
- `status` (Enum: "scheduled" | "ongoing" | "completed" | "cancelled")
- `participants` (Array of ObjectId, ref: User)
- `timestamps`

#### 11. Announcements Collection

**Purpose:** Class-wide or public announcements
**Schema:**

- `classId` (ObjectId, ref: Class, optional - null for public)
- `teacherId` (ObjectId, ref: User, required)
- `title` (String, required)
- `content` (String, required)
- `type` (Enum: "general" | "assignment" | "exam" | "event")
- `isPinned` (Boolean, default: false)
- `isPrivate` (Boolean, default: false)
- `comments` (Array of comment objects):
  - `userId` (ObjectId, ref: User)
  - `content` (String)
  - `createdAt` (Date)
- `timestamps`

#### 12. ClassworkSections Collection

**Purpose:** Organize class materials (Google Classroom-style)
**Schema:**

- `classId` (ObjectId, ref: Class, required)
- `title` (String, required)
- `description` (String)
- `order` (Number, for sorting)
- `items` (Array of item objects):
  - `type` (Enum: "assignment" | "quiz" | "material")
  - `itemId` (ObjectId, ref to Assignment/Quiz)
  - `title` (String)
  - `addedAt` (Date)
- `timestamps`

---

## Authentication & Authorization

### JWT Token Structure

```javascript
{
  userId: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  role: "teacher",                      // "teacher" | "student"
  iat: 1704067200,                      // Issued at (Unix timestamp)
  exp: 1704153600                       // Expires (24h later)
}
```

### Authentication Flow

1. User submits credentials to `/api/auth/login`
2. Server validates email and password (bcrypt comparison)
3. Server generates JWT with userId and role
4. Token sent to client, stored in localStorage
5. Client includes token in Authorization header: `Bearer {token}`
6. Server middleware validates token on protected routes
7. Decoded user attached to `req.user` for controllers

### Middleware Stack

#### 1. protect Middleware

**File:** `backend/middleware/auth.js`
**Purpose:** Verify JWT token and attach user to request
**Logic:**

- Extract token from `Authorization: Bearer {token}` header
- Verify token with JWT_SECRET
- Query User by decoded userId
- Attach user (without password) to `req.user`
- Return 401 if token missing/invalid

#### 2. authorize Middleware

**File:** `backend/middleware/auth.js`
**Purpose:** Role-based access control
**Usage:** `authorize("teacher")` or `authorize("teacher", "student")`
**Logic:**

- Check if `req.user` exists (must use after protect)
- Verify user role is in allowed roles array
- Return 403 if role not authorized

**Example Route:**

```javascript
router.post("/create", protect, authorize("teacher"), createClass);
```

---

## API Endpoints (Complete Reference)

### Authentication Endpoints

| Method | Endpoint             | Auth   | Body                                                      | Response                         |
| ------ | -------------------- | ------ | --------------------------------------------------------- | -------------------------------- |
| POST   | `/api/auth/register` | None   | `{name, email, password, role, schoolName?, rollNumber?}` | `{success, data: {user, token}}` |
| POST   | `/api/auth/login`    | None   | `{email, password}`                                       | `{success, data: {user, token}}` |
| GET    | `/api/auth/me`       | Bearer | -                                                         | `{success, data: {user}}`        |

### Class Management Endpoints

| Method | Endpoint              | Auth    | Body/Query                    | Response                     |
| ------ | --------------------- | ------- | ----------------------------- | ---------------------------- |
| POST   | `/api/class/create`   | Teacher | `{className, subject, board}` | `{success, data: {class}}`   |
| GET    | `/api/class/teacher`  | Teacher | -                             | `{success, data: {classes}}` |
| POST   | `/api/class/join`     | Student | `{classCode}`                 | `{success, data: {class}}`   |
| GET    | `/api/class/student`  | Student | -                             | `{success, data: {classes}}` |
| GET    | `/api/class/:classId` | Any     | -                             | `{success, data: {class}}`   |

### Attendance Endpoints

| Method | Endpoint                  | Auth    | Body/Query                                                | Response                        |
| ------ | ------------------------- | ------- | --------------------------------------------------------- | ------------------------------- |
| POST   | `/api/attendance/mark`    | Teacher | `{classId, date, records: [{studentId, status, notes?}]}` | `{success, data: {attendance}}` |
| POST   | `/api/attendance/upload`  | Teacher | `{classId, date, csvData}`                                | `{success, data: {attendance}}` |
| GET    | `/api/attendance/class`   | Teacher | `?classId=&date=`                                         | `{success, data: {attendance}}` |
| GET    | `/api/attendance/student` | Any     | `?classId=&studentId=`                                    | `{success, data: {attendance}}` |
| GET    | `/api/attendance/stats`   | Any     | `?classId=`                                               | `{success, data: {stats}}`      |

### Quiz Endpoints

| Method | Endpoint                                 | Auth    | Body/Query                                                                 | Response                      |
| ------ | ---------------------------------------- | ------- | -------------------------------------------------------------------------- | ----------------------------- |
| POST   | `/api/quiz/generate`                     | Teacher | `{classId, topic, chapter, numberOfQuestions, difficultyLevel, timeLimit}` | `{success, data: {quiz}}`     |
| GET    | `/api/quiz/class/:classId`               | Any     | -                                                                          | `{success, data: {quizzes}}`  |
| GET    | `/api/quiz/:quizId`                      | Any     | -                                                                          | `{success, data: {quiz}}`     |
| POST   | `/api/quiz/:quizId/submit`               | Student | `{answers: [], timeTaken?}`                                                | `{success, data: {attempt}}`  |
| GET    | `/api/quiz/stats/:quizId`                | Teacher | -                                                                          | `{success, data: {stats}}`    |
| GET    | `/api/quiz/attempts/:classId/:studentId` | Any     | -                                                                          | `{success, data: {attempts}}` |

### Study Planner Endpoints

| Method | Endpoint                                    | Auth    | Body/Query                | Response                     |
| ------ | ------------------------------------------- | ------- | ------------------------- | ---------------------------- |
| POST   | `/api/studyplanner/generate`                | Teacher | `{classId, academicYear}` | `{success, data: {planner}}` |
| GET    | `/api/studyplanner/:classId`                | Any     | -                         | `{success, data: {planner}}` |
| DELETE | `/api/studyplanner/:classId`                | Teacher | -                         | `{success}`                  |
| PUT    | `/api/studyplanner/:classId/year`           | Teacher | `{year}`                  | `{success, data: {planner}}` |
| POST   | `/api/studyplanner/:classId/chapter`        | Teacher | `{name, durationDays}`    | `{success, data: {planner}}` |
| PUT    | `/api/studyplanner/:classId/chapter/:index` | Teacher | `{name?, durationDays?}`  | `{success, data: {planner}}` |
| DELETE | `/api/studyplanner/:classId/chapter/:index` | Teacher | -                         | `{success, data: {planner}}` |
| PUT    | `/api/studyplanner/:classId/reorder`        | Teacher | `{oldIndex, newIndex}`    | `{success, data: {planner}}` |

### Assignment Endpoints

| Method | Endpoint                                         | Auth    | Body/Query                                           | Response                         |
| ------ | ------------------------------------------------ | ------- | ---------------------------------------------------- | -------------------------------- |
| POST   | `/api/assignment/create`                         | Teacher | `{classId, title, description, dueDate, totalMarks}` | `{success, data: {assignment}}`  |
| GET    | `/api/assignment/class/:classId`                 | Any     | -                                                    | `{success, data: {assignments}}` |
| GET    | `/api/assignment/:assignmentId`                  | Any     | -                                                    | `{success, data: {assignment}}`  |
| PUT    | `/api/assignment/:assignmentId`                  | Teacher | `{title?, description?, dueDate?}`                   | `{success, data: {assignment}}`  |
| DELETE | `/api/assignment/:assignmentId`                  | Teacher | -                                                    | `{success}`                      |
| POST   | `/api/assignment/:assignmentId/submit`           | Student | `{content}`                                          | `{success, data: {submission}}`  |
| PUT    | `/api/assignment/:assignmentId/grade/:studentId` | Teacher | `{grade, feedback}`                                  | `{success, data: {submission}}`  |

### Grade Endpoints

| Method | Endpoint                                 | Auth    | Body/Query                                               | Response                    |
| ------ | ---------------------------------------- | ------- | -------------------------------------------------------- | --------------------------- |
| POST   | `/api/grade/add`                         | Teacher | `{studentId, classId, category, title, score, maxScore}` | `{success, data: {grade}}`  |
| GET    | `/api/grade/class/:classId`              | Teacher | -                                                        | `{success, data: {grades}}` |
| GET    | `/api/grade/student/:classId/:studentId` | Any     | -                                                        | `{success, data: {grades}}` |
| GET    | `/api/grade/report`                      | Student | -                                                        | `{success, data: {report}}` |
| PUT    | `/api/grade/:gradeId`                    | Teacher | `{score?, maxScore?}`                                    | `{success, data: {grade}}`  |
| DELETE | `/api/grade/:gradeId`                    | Teacher | -                                                        | `{success}`                 |

### Meeting Endpoints

| Method | Endpoint                         | Auth    | Body/Query                                             | Response                      |
| ------ | -------------------------------- | ------- | ------------------------------------------------------ | ----------------------------- |
| POST   | `/api/meeting/create`            | Teacher | `{classId, title, scheduledAt, duration, meetingLink}` | `{success, data: {meeting}}`  |
| GET    | `/api/meeting/upcoming`          | Any     | -                                                      | `{success, data: {meetings}}` |
| GET    | `/api/meeting/class/:classId`    | Any     | `?status=&upcoming=`                                   | `{success, data: {meetings}}` |
| GET    | `/api/meeting/:meetingId`        | Any     | -                                                      | `{success, data: {meeting}}`  |
| PUT    | `/api/meeting/:meetingId`        | Teacher | `{title?, scheduledAt?, duration?}`                    | `{success, data: {meeting}}`  |
| PUT    | `/api/meeting/:meetingId/status` | Teacher | `{status}`                                             | `{success, data: {meeting}}`  |
| DELETE | `/api/meeting/:meetingId`        | Teacher | -                                                      | `{success}`                   |
| POST   | `/api/meeting/:meetingId/join`   | Student | -                                                      | `{success, data: {meeting}}`  |
| POST   | `/api/meeting/:meetingId/leave`  | Student | -                                                      | `{success, data: {meeting}}`  |

### Announcement Endpoints

| Method | Endpoint                                    | Auth    | Body/Query                                                | Response                           |
| ------ | ------------------------------------------- | ------- | --------------------------------------------------------- | ---------------------------------- |
| POST   | `/api/announcement/post`                    | Teacher | `{classId?, title, content, type, isPinned?, isPrivate?}` | `{success, data: {announcement}}`  |
| GET    | `/api/announcement/stream`                  | Any     | `?page=&limit=`                                           | `{success, data: {announcements}}` |
| GET    | `/api/announcement/recent`                  | Any     | `?limit=`                                                 | `{success, data: {announcements}}` |
| GET    | `/api/announcement/class/:classId`          | Any     | `?type=&page=&limit=&privateOnly=`                        | `{success, data: {announcements}}` |
| DELETE | `/api/announcement/:announcementId`         | Teacher | -                                                         | `{success}`                        |
| PUT    | `/api/announcement/:announcementId/pin`     | Teacher | -                                                         | `{success, data: {announcement}}`  |
| POST   | `/api/announcement/:announcementId/comment` | Any     | `{content}`                                               | `{success, data: {announcement}}`  |

### Classwork Endpoints

| Method | Endpoint                                         | Auth    | Body/Query                               | Response                               |
| ------ | ------------------------------------------------ | ------- | ---------------------------------------- | -------------------------------------- |
| POST   | `/api/classwork/section`                         | Teacher | `{classId, title, description?, order?}` | `{success, data: {section}}`           |
| GET    | `/api/classwork/class/:classId`                  | Any     | -                                        | `{success, data: {sections}}`          |
| PUT    | `/api/classwork/section/:sectionId`              | Teacher | `{title?, description?, order?}`         | `{success, data: {section}}`           |
| DELETE | `/api/classwork/section/:sectionId`              | Teacher | -                                        | `{success}`                            |
| POST   | `/api/classwork/section/:sectionId/item`         | Teacher | `{type, itemId, title}`                  | `{success, data: {section}}`           |
| DELETE | `/api/classwork/section/:sectionId/item/:itemId` | Teacher | -                                        | `{success, data: {section}}`           |
| GET    | `/api/classwork/class/:classId/people`           | Any     | -                                        | `{success, data: {teacher, students}}` |

### Portfolio Endpoints

| Method | Endpoint                                  | Auth    | Body/Query | Response                       |
| ------ | ----------------------------------------- | ------- | ---------- | ------------------------------ |
| GET    | `/api/portfolio/dashboard`                | Student | -          | `{success, data: {dashboard}}` |
| GET    | `/api/portfolio/:studentId/:classId`      | Any     | -          | `{success, data: {portfolio}}` |
| GET    | `/api/portfolio/class/:classId/analytics` | Teacher | -          | `{success, data: {analytics}}` |

### Export Endpoints

| Method | Endpoint                                    | Auth    | Body/Query      | Response       |
| ------ | ------------------------------------------- | ------- | --------------- | -------------- |
| GET    | `/api/export/portfolio/:studentId/:classId` | Any     | -               | PDF Blob       |
| GET    | `/api/export/attendance/:classId`           | Teacher | -               | Excel Blob     |
| GET    | `/api/export/grades/:classId`               | Teacher | -               | Excel Blob     |
| GET    | `/api/export/quiz/:quizId`                  | Teacher | `?format=excel` | Excel/PDF Blob |

### Timetable Endpoints

| Method | Endpoint                       | Auth    | Body/Query                                                | Response                       |
| ------ | ------------------------------ | ------- | --------------------------------------------------------- | ------------------------------ |
| POST   | `/api/timetable`               | Student | `{slots: []}`                                             | `{success, data: {timetable}}` |
| GET    | `/api/timetable`               | Student | -                                                         | `{success, data: {timetable}}` |
| POST   | `/api/timetable/slot`          | Student | `{day, startTime, endTime, classId?, subject?, type?}`    | `{success, data: {timetable}}` |
| PUT    | `/api/timetable/slot/:slotId`  | Student | `{day?, startTime?, endTime?, classId?, subject?, type?}` | `{success, data: {timetable}}` |
| DELETE | `/api/timetable/slot/:slotId`  | Student | -                                                         | `{success, data: {timetable}}` |
| GET    | `/api/timetable/day/:day`      | Student | -                                                         | `{success, data: {slots}}`     |
| POST   | `/api/timetable/auto-populate` | Student | -                                                         | `{success, data: {timetable}}` |

---

## AI Integration Details

### Google Gemini API Integration

**Model Used:** `gemini-2.5-flash`
**Primary Use Cases:**

1. Quiz question generation
2. Study plan chapter generation

**Configuration:**

- API Key stored in `process.env.GEMINI_API_KEY`
- Lazy initialization on first use
- Fallback to OpenAI if Gemini fails

### Quiz Generation Process

**Input Parameters:**

- `topic` (String) - e.g., "Algebra"
- `chapter` (String) - e.g., "Linear Equations"
- `numberOfQuestions` (Number) - e.g., 5
- `difficultyLevel` (Enum) - "easy" | "medium" | "hard"

**AI Prompt Structure:**

```
Generate {numberOfQuestions} multiple-choice questions for a quiz.

Topic: {topic}
Chapter: {chapter}
Difficulty Level: {difficultyLevel}

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
    "difficultyLevel": "medium"
  }
]
```

**Response Processing:**

1. AI returns text response (may include markdown code blocks)
2. Extract JSON array using regex: `/\[[\s\S]*\]/`
3. Parse JSON and validate structure
4. Validate each question:
   - Has `question`, `options`, `correctAnswer` fields
   - Exactly 4 options
   - correctAnswer is 0-3
5. Return validated questions array

**Error Handling:**

- Invalid API key → "Invalid Gemini API key"
- Quota exceeded → "Gemini API quota exceeded. Please try again later."
- Invalid JSON → "AI returned invalid JSON format"
- Fallback to OpenAI if Gemini fails

### Study Plan Generation Process

**Input Parameters:**

- `board` (String) - e.g., "CBSE"
- `className` (String) - e.g., "10th"
- `subject` (String) - e.g., "Mathematics"

**AI Prompt Structure:**

```
Generate a comprehensive study plan for {board} {className} {subject}.

Requirements:
- List all chapters/topics that need to be covered
- Estimate duration in days for each chapter (1-5 days based on complexity)
- Order chapters logically for learning progression
- Consider typical academic year timeline

Return ONLY a valid JSON array with this exact structure:
[
  {
    "chapterName": "Chapter name here",
    "durationDays": 3
  }
]
```

**Response Processing:**

1. Extract and parse JSON array
2. Validate each chapter has `chapterName` and `durationDays`
3. Clamp durationDays between 1-10 days
4. Return validated chapters array

**Post-Processing:**

- Teacher can manually add/edit/delete chapters
- System calculates actual start/end dates based on holidays
- Drag-and-drop reordering supported

---

## Frontend Architecture

### State Management Strategy

**Context Providers Hierarchy:**

```javascript
<ThemeProvider>
  {" "}
  // Dark/Light mode
  <AuthProvider>
    {" "}
    // User authentication state
    <Router>
      {" "}
      // React Router
      <ClassProvider>
        {" "}
        // Class data state
        <AppContent /> // Routes and components
      </ClassProvider>
    </Router>
  </AuthProvider>
</ThemeProvider>
```

### AuthContext State

```javascript
{
  user: {
    id: String,
    name: String,
    email: String,
    role: "teacher" | "student",
    schoolName: String?,
    rollNumber: String?
  },
  token: String,
  isAuthenticated: Boolean,
  loading: Boolean,
  error: String?
}
```

**Actions:**

- `LOGIN_START` - Set loading true
- `LOGIN_SUCCESS` - Set user, token, isAuthenticated
- `LOGIN_ERROR` - Set error message
- `LOGOUT` - Clear all state
- `UPDATE_USER` - Update user info

### ClassContext State

```javascript
{
  classes: Array,           // User's classes
  selectedClass: Object?,   // Currently selected class
  loading: Boolean,
  error: String?
}
```

**Actions:**

- `FETCH_CLASSES_START`
- `FETCH_CLASSES_SUCCESS`
- `FETCH_CLASSES_ERROR`
- `SELECT_CLASS`
- `CREATE_CLASS_SUCCESS`
- `JOIN_CLASS_SUCCESS`

### Custom Hooks

#### useAuth Hook

**File:** `frontend/src/hooks/useAuth.js`
**Returns:**

```javascript
{
  user,
  token,
  isAuthenticated,
  loading,
  error,
  login: (credentials) => Promise,
  register: (userData) => Promise,
  logout: () => void,
  updateUser: (userData) => void
}
```

#### useClass Hook

**File:** `frontend/src/hooks/useClass.js`
**Returns:**

```javascript
{
  classes,
  selectedClass,
  loading,
  error,
  fetchClasses: () => Promise,
  selectClass: (classId) => void,
  createClass: (classData) => Promise,
  joinClass: (classCode) => Promise
}
```

#### useTheme Hook

**File:** `frontend/src/hooks/useTheme.js`
**Returns:**

```javascript
{
  theme: "light" | "dark",
  toggleTheme: () => void
}
```

### Routing Structure

**Public Routes:**

- `/login` - Login page
- `/register` - Registration page

**Protected Routes (All require authentication):**

- `/dashboard` - Main dashboard (role-based content)
- `/classes` - My classes (TeacherClasses or StudentClasses based on role)
- `/class/:id` - Class details page
- `/classroom/:classId` - Classroom view (Google Classroom-style)
- `/announcements` - Announcements stream
- `/attendance` - Attendance (Teacher: mark, Student: view)
- `/my-attendance` - Student attendance view
- `/quizzes` - Quiz list
- `/quiz/generate` - Quiz generator (Teacher only)
- `/quiz/:quizId` - Take quiz (Student)
- `/quiz/:quizId/stats` - Quiz statistics (Teacher)
- `/study-planner` - Study planner
- `/assignments` - Assignment list
- `/assignment/:assignmentId` - Assignment details
- `/grades` - Grades view
- `/reports` - Student reports
- `/portfolio` - Student portfolio
- `/portfolio/:studentId/:classId` - Specific student portfolio
- `/timetable` - Weekly timetable
- `/schedule` - Schedule view
- `/meetings` - Virtual meetings

**Route Protection:**

- `<ProtectedRoute>` - Redirects to `/login` if not authenticated
- `<PublicRoute>` - Redirects to `/dashboard` if authenticated
- Role-based rendering within components (no separate route guards)

### API Service Layer

**File:** `frontend/src/services/api.js`

**Axios Instance Configuration:**

```javascript
const api = axios.create({
  baseURL: "http://localhost:5000", // or VITE_API_URL env var
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
```

**API Namespaces:**

- `authAPI` - Authentication operations
- `classAPI` - Class management
- `attendanceAPI` - Attendance tracking
- `quizAPI` - Quiz operations
- `studyPlannerAPI` - Study planner
- `assignmentAPI` - Assignment management
- `gradeAPI` - Grade management
- `timetableAPI` - Timetable operations
- `meetingAPI` - Virtual meetings
- `portfolioAPI` - Student portfolios
- `announcementAPI` - Announcements
- `classworkAPI` - Classwork sections
- `exportAPI` - File exports (PDF/Excel)

**Example Usage:**

```javascript
import { quizAPI } from "./services/api";

// Generate quiz
const response = await quizAPI.generateQuiz({
  classId: "123",
  topic: "Algebra",
  chapter: "Linear Equations",
  numberOfQuestions: 5,
  difficultyLevel: "medium",
});

// Response: { success: true, data: { quiz: {...} } }
```

---

## Key Features Implementation

### 1. Class Management

**Teacher Flow:**

1. Click "Create Class" button
2. Fill form: className, subject, board
3. Submit → POST `/api/class/create`
4. Backend generates unique classCode (e.g., MATH-A3B2C1)
5. Class created with teacher as owner
6. Teacher shares classCode with students

**Student Flow:**

1. Click "Join Class" button
2. Enter classCode
3. Submit → POST `/api/class/join`
4. Backend validates code and adds student to class.students array
5. Student can now access class materials

**Key Components:**

- `TeacherClasses.jsx` - Teacher's class list with create button
- `StudentClasses.jsx` - Student's class list with join button
- `ClassDetails.jsx` - Detailed class view with students, materials
- `ClassRoom.jsx` - Google Classroom-style interface

### 2. Attendance System

**Teacher Features:**

- Select class from dropdown
- Select date (defaults to today)
- View list of enrolled students
- Mark each student as Present/Absent
- Bulk actions: "Mark All Present" / "Mark All Absent"
- Upload CSV for bulk attendance
- View attendance statistics (percentage per student)

**Student Features:**

- View own attendance across all classes
- Filter by class
- See attendance percentage
- View attendance calendar

**Implementation Details:**

- Compound unique index prevents duplicate entries (classId + studentId + date)
- Date normalized to midnight UTC for consistency
- Statistics calculated on-the-fly or cached

**Key Components:**

- `Attendance.jsx` - Teacher attendance marking interface
- `StudentAttendance.jsx` - Student attendance view

### 3. AI-Powered Quiz System

**Quiz Generation (Teacher):**

1. Navigate to Quiz Generator
2. Select class
3. Enter topic and chapter
4. Choose number of questions (1-20)
5. Select difficulty level
6. Click "Generate Quiz"
7. AI generates questions via Gemini/OpenAI
8. Teacher reviews and can edit before saving
9. Quiz becomes available to students

**Quiz Taking (Student):**

1. Navigate to Quizzes
2. Select class to see available quizzes
3. Click "Take Quiz"
4. Answer all questions (radio buttons for options)
5. Optional timer countdown
6. Click "Submit Quiz"
7. Backend calculates score by comparing answers to correctAnswer
8. Instant results shown (if enabled)
9. Attempt saved to QuizAttempts collection

**Quiz Statistics (Teacher):**

- View all attempts for a quiz
- See average score, highest/lowest scores
- Per-question analysis (which questions were hardest)
- Student-wise performance breakdown

**Key Components:**

- `QuizGenerator.jsx` - AI quiz generation interface
- `Quizzes.jsx` - Quiz list view
- `TakeQuiz.jsx` - Quiz taking interface with timer
- `QuizStats.jsx` - Teacher statistics dashboard

**Important Fix Applied:**

- Frontend previously expected `response.data.result` but backend returned flat object
- Fixed to correctly map `response.data.data.attempt` fields

### 4. Study Planner

**AI Generation (Teacher):**

1. Navigate to Study Planner
2. Select class
3. Click "Generate Study Plan"
4. AI generates chapter list with estimated durations
5. System calculates start/end dates based on:
   - Current date
   - Chapter durations
   - Holidays (excluded from calculations)
   - Exam dates (marked as milestones)

**Manual Management (Teacher):**

- Add new chapters manually
- Edit chapter names and durations
- Drag-and-drop to reorder chapters
- Add holidays (dates excluded from duration calculations)
- Add exam dates
- Delete chapters
- Regenerate entire plan

**Student View:**

- See upcoming chapters
- View current chapter in progress
- See completed chapters
- View exam dates
- Cannot edit (read-only)

**Key Features:**

- Pre-validate hook calculates durationDays excluding holidays
- Validates endDate >= startDate
- One study planner per class (unique classId constraint)

**Key Components:**

- `StudyPlanner.jsx` - Study planner interface with drag-and-drop

**Important Fix Applied:**

- Frontend used `/api/study-planner/*` but backend used `/api/studyplanner/*`
- Fixed all frontend API calls to match backend (no hyphen)

### 5. Assignment System

**Teacher Features:**

- Create assignments with title, description, due date, total marks
- Attach files (URLs stored)
- Set late submission policy
- View all submissions
- Grade submissions with feedback
- Export grades to Excel

**Student Features:**

- View assigned assignments
- Submit text content or file URLs
- See submission status (submitted/late/graded)
- View grades and feedback
- Resubmit if allowed

**Grading Workflow:**

1. Teacher opens assignment
2. Views list of submissions
3. Clicks on student submission
4. Enters grade (0-100) and feedback
5. Saves → Updates submission.grade and submission.feedback
6. Student sees grade and feedback

**Key Components:**

- `Assignments.jsx` - Assignment list
- `AssignmentDetail.jsx` - Assignment details with submissions

### 6. Grade Management

**Teacher Features:**

- Add grades manually for any category (Quiz, Assignment, Exam, etc.)
- View all grades for a class
- Edit/delete grades
- Export grades to Excel
- View student-wise grade breakdown

**Student Features:**

- View all grades across classes
- See grade breakdown by category
- View overall percentage
- Download grade report (PDF)

**Grade Calculation:**

- Percentage auto-calculated: (score / maxScore) \* 100
- Overall percentage: sum(scores) / sum(maxScores) \* 100

**Key Components:**

- `Grades.jsx` - Grade management interface
- `StudentReports.jsx` - Student grade reports

### 7. Portfolio System

**Purpose:** Comprehensive student performance dashboard

**Data Aggregated:**

- Attendance statistics (total, present, absent, percentage)
- Quiz attempts (total, average score, best score)
- Assignment submissions (total, graded, pending)
- Grades by category
- Overall performance metrics

**Teacher View:**

- Access any student's portfolio
- Compare student performance
- Export portfolio as PDF

**Student View:**

- View own portfolio
- See performance trends
- Download portfolio PDF

**API Endpoint:**

- `GET /api/portfolio/:studentId/:classId` - Returns aggregated data
- `GET /api/portfolio/dashboard` - Student's own dashboard (all classes)

**Key Components:**

- `Portfolio.jsx` - Portfolio dashboard with charts (Recharts)

### 8. Announcement System

**Types:**

- Public announcements (visible to all)
- Class-specific announcements
- Private announcements (class members only)

**Features:**

- Pin important announcements
- Comment on announcements
- Filter by type (general, assignment, exam, event)
- Pagination support
- Recent announcements widget

**Teacher Features:**

- Post announcements
- Pin/unpin announcements
- Delete own announcements

**Student Features:**

- View announcements
- Comment on announcements
- Filter and search

**Key Components:**

- `Announcements.jsx` - Announcement stream
- `StudentAnnouncement.jsx` - Announcement card component

### 9. Timetable System

**Student Features:**

- Create weekly timetable
- Add time slots with:
  - Day (Monday-Sunday)
  - Start/End time (HH:MM format)
  - Class (optional, links to enrolled class)
  - Subject
  - Type (class/break/other)
- Edit/delete slots
- View day-wise schedule
- Auto-populate from enrolled classes

**Auto-Populate Feature:**

- Fetches all enrolled classes
- Creates default time slots for each class
- Student can customize after auto-population

**Key Components:**

- `Timetable.jsx` - Weekly timetable view with drag-and-drop

### 10. Meeting System

**Teacher Features:**

- Schedule virtual meetings
- Set title, date/time, duration
- Add meeting link (Zoom, Google Meet, etc.)
- Update meeting status (scheduled/ongoing/completed/cancelled)
- View participant list
- Edit/delete meetings

**Student Features:**

- View upcoming meetings
- Join meetings (adds to participants list)
- Leave meetings
- Filter by class

**Meeting Statuses:**

- `scheduled` - Future meeting
- `ongoing` - Currently happening
- `completed` - Past meeting
- `cancelled` - Cancelled by teacher

**Key Components:**

- `Meetings.jsx` - Meeting list and management

### 11. Classwork Organization (Google Classroom-style)

**Purpose:** Organize class materials into sections

**Features:**

- Create sections (e.g., "Week 1", "Chapter 1")
- Add items to sections:
  - Assignments
  - Quizzes
  - Materials (links, documents)
- Reorder sections
- Drag items between sections

**Teacher Features:**

- Create/edit/delete sections
- Add/remove items
- Organize materials

**Student Features:**

- View organized materials
- Click items to access assignments/quizzes

**Key Components:**

- `ClassRoom.jsx` - Classwork organization interface
- `ClassPeople.jsx` - View class members

### 12. Export System

**Supported Exports:**

**1. Portfolio PDF**

- Student performance summary
- Attendance, grades, quiz scores
- Generated using PDFKit
- Endpoint: `GET /api/export/portfolio/:studentId/:classId`

**2. Attendance Excel**

- Class attendance records
- Date-wise breakdown
- Student-wise statistics
- Generated using ExcelJS
- Endpoint: `GET /api/export/attendance/:classId`

**3. Grades Excel**

- All grades for a class
- Student-wise breakdown
- Category-wise analysis
- Generated using ExcelJS
- Endpoint: `GET /api/export/grades/:classId`

**4. Quiz Results**

- All attempts for a quiz
- Student-wise scores
- Question-wise analysis
- Format: Excel or PDF
- Endpoint: `GET /api/export/quiz/:quizId?format=excel`

**Frontend Helper:**

```javascript
import { exportAPI, downloadFile } from "./services/api";

// Download portfolio
const response = await exportAPI.downloadPortfolioPDF(studentId, classId);
downloadFile(response.data, `portfolio-${studentId}.pdf`);
```

---

## Common Issues & Fixes Applied

### 1. Infinite Loop in Class Components (FIXED)

**Problem:** `fetchClasses` function in useEffect dependencies caused infinite re-renders
**Affected Components:** TeacherClasses, StudentClasses, ClassDetails, Attendance, Quizzes, QuizGenerator
**Solution:** Removed function from dependencies array

```javascript
// Before (WRONG)
useEffect(() => {
  fetchClasses();
}, [fetchClasses]);

// After (CORRECT)
useEffect(() => {
  fetchClasses();
}, []); // Empty dependency array
```

### 2. Study Planner Routes Not Registered (FIXED)

**Problem:** Study planner routes never added to server.js
**Impact:** All study planner requests returned 404
**Solution:** Added route registration in server.js

```javascript
import studyPlannerRoutes from "./routes/studyPlanner.js";
app.use("/api/studyplanner", studyPlannerRoutes);
```

### 3. Study Planner Endpoint Mismatch (FIXED)

**Problem:** Frontend used `/api/study-planner/*` but backend used `/api/studyplanner/*`
**Solution:** Updated all frontend API calls to remove hyphen

### 4. Quiz Submit Response Mismatch (FIXED)

**Problem:** Frontend expected `response.data.result` but backend returned `response.data.data.attempt`
**Solution:** Updated TakeQuiz.jsx to correctly map response fields

---

## Environment Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/classpilot?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI Services
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here  # Optional fallback
AI_PROVIDER=gemini  # or "openai"

# Optional: Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Frontend Environment Variables (.env)

```env
# API Base URL
VITE_API_URL=http://localhost:5000

# Production
# VITE_API_URL=https://your-backend-url.com
```

---

## Deployment

### Azure Static Web Apps Deployment

**Frontend Deployment:**

- Platform: Azure Static Web Apps
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: 20.19.0 (specified in .nvmrc)

**Configuration Files:**

1. `.nvmrc` - Specifies Node.js version
2. `staticwebapp.config.json` - Azure configuration
3. `.github/workflows/azure-static-web-apps.yml` - CI/CD pipeline

**Backend Deployment Options:**

1. Azure App Service (Node.js)
2. Azure Container Instances
3. Azure Functions (serverless)

**Database:**

- MongoDB Atlas (cloud-hosted)
- Connection string in environment variables
- Whitelist Azure IP addresses

**CORS Configuration:**
Update backend CORS to include production frontend URL:

```javascript
cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend.azurestaticapps.net",
  ],
  credentials: true,
});
```

### Local Development Setup

**Prerequisites:**

- Node.js 20.19+
- MongoDB Atlas account
- Google Gemini API key

**Steps:**

1. Clone repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Configure backend/.env with MongoDB URI and API keys
5. Start backend: `cd backend && npm run dev` (port 5000)
6. Start frontend: `cd frontend && npm run dev` (port 5173)
7. Access application at http://localhost:5173

---

## Project File Structure

### Backend Structure

```
backend/
├── config/
│   └── db.js                          # MongoDB connection
├── controllers/
│   ├── AuthController.js              # Authentication logic
│   ├── classController.js             # Class management
│   ├── AttendenceController.js        # Attendance tracking
│   ├── quizController.js              # Quiz operations
│   ├── studyPlannerController.js      # Study planner
│   ├── assignmentController.js        # Assignment management
│   ├── gradeController.js             # Grade management
│   ├── timetableController.js         # Timetable operations
│   ├── meetingController.js           # Virtual meetings
│   ├── portfolioController.js         # Student portfolios
│   ├── announcementController.js      # Announcements
│   ├── classworkController.js         # Classwork sections
│   └── exportController.js            # File exports
├── middleware/
│   └── auth.js                        # JWT verification, role authorization
├── models/
│   ├── User.js                        # User schema
│   ├── Class.js                       # Class schema
│   ├── Attendence.js                  # Attendance schema
│   ├── Quiz.js                        # Quiz schema
│   ├── QuizAttempt.js                 # Quiz attempt schema
│   ├── Assignment.js                  # Assignment schema
│   ├── Grade.js                       # Grade schema
│   ├── StudyPlanner.js                # Study planner schema
│   ├── Timetable.js                   # Timetable schema
│   ├── Meeting.js                     # Meeting schema
│   ├── Announcement.js                # Announcement schema
│   └── ClassworkSection.js            # Classwork section schema
├── routes/
│   ├── auth.js                        # Auth routes
│   ├── class.js                       # Class routes
│   ├── attendance.js                  # Attendance routes
│   ├── quiz.js                        # Quiz routes
│   ├── studyPlanner.js                # Study planner routes
│   ├── assignment.js                  # Assignment routes
│   ├── grade.js                       # Grade routes
│   ├── timetable.js                   # Timetable routes
│   ├── meeting.js                     # Meeting routes
│   ├── portfolio.js                   # Portfolio routes
│   ├── announcement.js                # Announcement routes
│   ├── classwork.js                   # Classwork routes
│   └── export.js                      # Export routes
├── utils/
│   ├── aiService.js                   # AI integration (Gemini/OpenAI)
│   ├── csvParser.js                   # CSV parsing utilities
│   ├── dateCalculator.js              # Date calculation utilities
│   ├── excelGenerator.js              # Excel file generation
│   ├── pdfGenerator.js                # PDF file generation
│   └── index.js                       # Utility exports
├── Testers&Reseters/
│   ├── test-api.js                    # API testing script
│   ├── test-all-features.js           # Comprehensive feature tests
│   ├── create-test-student.js         # Create test data
│   └── reset-password.js              # Password reset utility
├── .env                               # Environment variables
├── .gitignore                         # Git ignore rules
├── package.json                       # Dependencies
├── server.js                          # Express server entry point
└── service-account-key.json           # Firebase credentials (if used)
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx              # Login form
│   │   │   ├── Register.jsx           # Registration form
│   │   │   └── index.js               # Auth exports
│   │   └── shared/
│   │       ├── Alert.jsx              # Alert/notification component
│   │       ├── ConnectionTest.jsx     # Backend connection tester
│   │       ├── Dashboard.jsx          # Main dashboard
│   │       ├── FeatureCard.jsx        # Feature card component
│   │       ├── Footer.jsx             # Footer component
│   │       ├── FormInput.jsx          # Reusable form input
│   │       ├── LoadingSpinner.jsx     # Loading indicator
│   │       ├── Navigation.jsx         # Top navigation bar
│   │       ├── NotFound.jsx           # 404 page
│   │       ├── Sidebar.jsx            # Side navigation
│   │       ├── StudentAnnouncement.jsx # Announcement card
│   │       └── index.js               # Shared exports
│   ├── context/
│   │   ├── AuthContext.jsx            # Auth context definition
│   │   ├── AuthProvider.jsx           # Auth state provider
│   │   ├── ClassContext.jsx           # Class context definition
│   │   ├── ClassProvider.jsx          # Class state provider
│   │   └── ThemeContext.jsx           # Theme state provider
│   ├── hooks/
│   │   ├── useAuth.js                 # Auth hook
│   │   ├── useClass.js                # Class hook
│   │   └── useTheme.js                # Theme hook
│   ├── pages/
│   │   ├── Announcements.jsx          # Announcements page
│   │   ├── AnnouncementStream.jsx     # Public announcement stream
│   │   ├── AssignmentDetail.jsx       # Assignment details
│   │   ├── Assignments.jsx            # Assignment list
│   │   ├── Attendance.jsx             # Teacher attendance
│   │   ├── ClassDetails.jsx           # Class details page
│   │   ├── ClassPeople.jsx            # Class members
│   │   ├── ClassRoom.jsx              # Classroom interface
│   │   ├── Classwork.jsx              # Classwork sections
│   │   ├── ComingSoon.jsx             # Coming soon placeholder
│   │   ├── Grades.jsx                 # Grade management
│   │   ├── Meetings.jsx               # Virtual meetings
│   │   ├── Portfolio.jsx              # Student portfolio
│   │   ├── QuizGenerator.jsx          # AI quiz generator
│   │   ├── QuizStats.jsx              # Quiz statistics
│   │   ├── Quizzes.jsx                # Quiz list
│   │   ├── Schedule.jsx               # Schedule view
│   │   ├── StudentAttendance.jsx      # Student attendance view
│   │   ├── StudentClasses.jsx         # Student class list
│   │   ├── StudentReports.jsx         # Student reports
│   │   ├── StudyPlanner.jsx           # Study planner
│   │   ├── TakeQuiz.jsx               # Quiz taking interface
│   │   ├── TeacherClasses.jsx         # Teacher class list
│   │   ├── Timetable.jsx              # Weekly timetable
│   │   └── index.js                   # Page exports
│   ├── services/
│   │   └── api.js                     # Axios API service layer
│   ├── App.jsx                        # Main app component with routes
│   ├── App.css                        # App-specific styles
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Global styles (Tailwind)
├── public/
│   └── vite.svg                       # Vite logo
├── .gitignore                         # Git ignore rules
├── .nvmrc                             # Node.js version specification
├── eslint.config.js                   # ESLint configuration
├── index.html                         # HTML entry point
├── package.json                       # Dependencies
├── staticwebapp.config.json           # Azure Static Web Apps config
└── vite.config.js                     # Vite configuration
```

---

## Security Considerations

### Password Security

- Passwords hashed with bcrypt (cost factor 3 for development, should be 10+ in production)
- Never stored in plain text
- Compared using bcrypt.compare() during login

### JWT Security

- Tokens expire after 24 hours
- Secret key stored in environment variables
- Tokens validated on every protected route
- User data attached to request after validation

### Input Validation

- Server-side validation for all inputs
- Role-specific field validation (schoolName for teachers, rollNumber for students)
- Mongoose schema validation
- Sanitization of user inputs

### Database Security

- MongoDB connection string in environment variables
- Mongoose schema validation
- Unique indexes prevent duplicate entries
- Compound indexes for query optimization

### CORS Configuration

- Whitelist specific origins
- Credentials enabled for cookie support
- Production URLs must be explicitly added

### API Security

- All sensitive endpoints protected with JWT middleware
- Role-based authorization for teacher-only actions
- Rate limiting should be added for production

### Recommendations for Production

1. Increase bcrypt cost factor to 10+
2. Use HTTPS for all communications
3. Implement rate limiting (express-rate-limit)
4. Add request validation middleware (express-validator)
5. Implement CSRF protection
6. Add API key rotation mechanism
7. Use environment-specific secrets
8. Implement logging and monitoring
9. Add input sanitization (express-mongo-sanitize)
10. Implement helmet.js for security headers

---

## Performance Optimizations

### Database Optimizations

- Compound indexes on frequently queried fields
- Unique indexes prevent duplicate checks
- Lean queries for read-only operations
- Pagination for large datasets
- Aggregation pipelines for complex queries

### Frontend Optimizations

- Code splitting with React Router
- Lazy loading of components
- Memoization with useMemo/useCallback
- Debouncing for search inputs
- Optimistic UI updates
- Local state caching

### API Optimizations

- Response compression (should add gzip)
- Caching headers for static content
- Batch operations where possible
- Efficient query projections (select only needed fields)

### Recommendations for Production

1. Implement Redis caching for frequently accessed data
2. Add CDN for static assets
3. Implement service workers for offline support
4. Add image optimization and lazy loading
5. Implement virtual scrolling for long lists
6. Add request deduplication
7. Implement GraphQL for flexible queries (optional)

---

## Testing Strategy

### Backend Testing

**Test Files Location:** `backend/Testers&Reseters/`

**Available Test Scripts:**

1. `test-api.js` - Basic API endpoint testing
2. `test-all-features.js` - Comprehensive feature testing
3. `test-class-api.js` - Class management testing
4. `test-ai.js` - AI service testing
5. `quick-test.js` - Quick smoke tests

**Test Coverage:**

- Authentication (register, login, token validation)
- Class management (create, join, list)
- Attendance (mark, view, statistics)
- Quiz generation and submission
- Study planner generation
- Assignment CRUD operations
- Grade management

**Running Tests:**

```bash
cd backend
node Testers&Reseters/test-all-features.js
```

### Frontend Testing

**Current Status:** No automated tests implemented

**Recommended Testing Strategy:**

1. Unit tests with Vitest
2. Component tests with React Testing Library
3. E2E tests with Playwright or Cypress
4. Integration tests for API calls

### Manual Testing Checklist

See `TESTING_GUIDE.md` for detailed manual testing procedures

---

## Known Issues & Limitations

### Current Limitations

1. **File Uploads:** Currently only stores URLs, not actual file uploads
2. **Real-time Features:** No WebSocket support for live updates
3. **Notifications:** No push notification system
4. **Email:** No email integration for notifications
5. **Mobile App:** Web-only, no native mobile apps
6. **Offline Support:** No offline functionality
7. **Multi-language:** English only
8. **Accessibility:** Limited ARIA labels and keyboard navigation

### Planned Features (Not Implemented)

1. Video conferencing integration
2. Chat system for class discussions
3. Parent portal
4. Advanced analytics and reporting
5. Gamification (badges, leaderboards)
6. Calendar integration
7. Mobile apps (iOS/Android)
8. Email notifications
9. SMS notifications
10. Advanced search and filtering

### Browser Compatibility

- **Tested:** Chrome, Firefox, Edge (latest versions)
- **Not Tested:** Safari, older browsers
- **Minimum Requirements:** ES6+ support, modern CSS features

---

## Development Guidelines

### Code Style

- **Backend:** ES6+ modules, async/await, descriptive variable names
- **Frontend:** Functional components, hooks, JSX, Tailwind CSS
- **Naming Conventions:**
  - Components: PascalCase (e.g., `StudentClasses.jsx`)
  - Files: camelCase for utilities, PascalCase for components
  - Variables: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Database collections: lowercase

### Git Workflow

- Feature branches for new features
- Descriptive commit messages
- Pull requests for code review
- Main branch protected

### Error Handling

- Try-catch blocks in all async functions
- Consistent error response format
- Logging for debugging
- User-friendly error messages

### API Response Format

**Success:**

```javascript
{
  success: true,
  data: { /* response data */ }
}
```

**Error:**

```javascript
{
  success: false,
  error: "Error message"
}
```

---

## Key Dependencies Explained

### Backend Dependencies

**Core:**

- `express` (5.1.0) - Web framework for Node.js
- `mongoose` (8.19.1) - MongoDB ODM with schema validation
- `dotenv` (17.2.3) - Environment variable management

**Authentication:**

- `jsonwebtoken` (9.0.2) - JWT creation and verification
- `bcryptjs` (3.0.2) - Password hashing

**AI Services:**

- `@google/generative-ai` (0.24.1) - Google Gemini API client
- `openai` (6.9.1) - OpenAI API client (fallback)

**File Generation:**

- `pdfkit` (0.17.2) - PDF generation
- `exceljs` (4.4.0) - Excel file generation

**Utilities:**

- `cors` (2.8.5) - Cross-origin resource sharing
- `nanoid` (5.1.6) - Unique ID generation
- `axios` (1.12.2) - HTTP client

**Development:**

- `nodemon` (3.1.10) - Auto-restart on file changes

### Frontend Dependencies

**Core:**

- `react` (19.1.1) - UI library
- `react-dom` (19.1.1) - React DOM renderer
- `react-router-dom` (7.9.4) - Client-side routing

**Build Tools:**

- `vite` (7.1.14 via rolldown-vite) - Fast build tool
- `@vitejs/plugin-react` (5.0.4) - React plugin for Vite

**Styling:**

- `tailwindcss` (4.1.14) - Utility-first CSS framework
- `@tailwindcss/vite` (4.1.14) - Tailwind Vite plugin

**HTTP:**

- `axios` (1.12.2) - HTTP client with interceptors

**UI Libraries:**

- `recharts` (3.6.0) - Chart library for data visualization
- `@dnd-kit/core` (6.3.1) - Drag and drop core
- `@dnd-kit/sortable` (10.0.0) - Sortable drag and drop
- `@dnd-kit/utilities` (3.2.2) - Drag and drop utilities

**Development:**

- `eslint` (9.36.0) - Code linting
- `eslint-plugin-react-hooks` (5.2.0) - React hooks linting
- `eslint-plugin-react-refresh` (0.4.22) - React refresh linting

---

## Troubleshooting Common Issues

### Backend Issues

**1. MongoDB Connection Failed**

- Check MONGO_URI in .env
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for development)
- Check network connectivity
- Verify credentials in connection string

**2. JWT Token Invalid**

- Check JWT_SECRET in .env
- Verify token expiration (24h default)
- Check Authorization header format: `Bearer {token}`
- Clear localStorage and re-login

**3. AI Generation Failed**

- Verify GEMINI_API_KEY or OPENAI_API_KEY in .env
- Check API quota/limits
- Test API key at Google AI Studio
- Check error logs for specific error messages

**4. Port Already in Use**

- Change PORT in .env
- Kill process using port: `lsof -ti:5000 | xargs kill` (Mac/Linux)
- Or: `netstat -ano | findstr :5000` then `taskkill /PID {PID} /F` (Windows)

### Frontend Issues

**1. API Connection Failed**

- Verify backend is running on port 5000
- Check VITE_API_URL in .env
- Check browser console for CORS errors
- Verify network tab for failed requests

**2. Infinite Loading**

- Check useEffect dependencies
- Verify API response format
- Check for circular dependencies
- Clear browser cache

**3. Build Errors**

- Delete node_modules and package-lock.json
- Run `npm install` again
- Check Node.js version (must be 20.19+)
- Verify all imports have correct paths

**4. Styling Issues**

- Verify Tailwind CSS is configured
- Check index.css imports Tailwind directives
- Clear browser cache
- Check for conflicting CSS

---

## Project History & Evolution

### Original Name

- **EduHelper** - Original project name
- **Rebranded to:** Class Pilot

### Major Milestones

1. **Initial Setup** - Basic authentication and class management
2. **Attendance System** - Added attendance tracking with CSV upload
3. **AI Integration** - Integrated Google Gemini for quiz generation
4. **Study Planner** - AI-powered curriculum planning
5. **Assignment System** - Complete assignment workflow
6. **Portfolio System** - Student performance analytics
7. **Announcement System** - Class communication
8. **Export Features** - PDF and Excel exports
9. **Bug Fixes** - Fixed infinite loops, endpoint mismatches, response mapping
10. **Azure Deployment** - Production deployment configuration

### Recent Fixes (November 2024)

- Fixed infinite loop in class components (useEffect dependencies)
- Fixed study planner route registration
- Fixed study planner endpoint naming (removed hyphen)
- Fixed quiz submission response mapping
- Added comprehensive API audit
- Created testing guide
- Added Azure deployment configuration

### CS50x Final Project

This project was built as a final project for Harvard's CS50x course, demonstrating:

- Full-stack web development
- RESTful API design
- Database design and optimization
- Authentication and authorization
- AI integration
- Modern frontend frameworks
- Deployment and DevOps

---

## Documentation Files

### Available Documentation

1. **README.md** - Quick start guide and overview
2. **indepthReadMe.md** - Comprehensive technical documentation (2192 lines)
3. **PROJECT_STRUCTURE.md** - File organization and architecture
4. **SETUP.md** - Detailed setup instructions
5. **TESTING_GUIDE.md** - Manual testing procedures
6. **API_AUDIT_REPORT.md** - Complete API endpoint audit
7. **FIXES_SUMMARY.md** - Summary of all fixes applied
8. **AZURE_DEPLOYMENT_GUIDE.md** - Azure deployment instructions
9. **AI_INTEGRATION_GUIDE.md** - AI service integration details
10. **DATE_CALCULATOR_GUIDE.md** - Date calculation utilities
11. **FRONTEND_COMPLETE.md** - Frontend implementation details
12. **BACKEND_FIXES.md** - Backend fixes and improvements
13. **PROJECT_DESCRIPTION_FOR_AI.md** - This file (complete project description)

### Quick Reference Files

- **QUICK_FIX_REFERENCE.md** - Common fixes and solutions
- **ATTENDANCE_FIX.md** - Attendance system fixes
- **ACCESS_DENIED_FIX.md** - Authorization fixes
- **CLASSDETAILS_FIX.md** - Class details fixes
- **GETME_INCONSISTENCY_FIX.md** - Auth endpoint fixes

---

## Future Roadmap

### Short-term (Next 3 months)

1. Implement file upload functionality (AWS S3 or Azure Blob)
2. Add email notifications (SendGrid or Nodemailer)
3. Implement real-time updates (Socket.io)
4. Add comprehensive unit tests
5. Implement rate limiting
6. Add request validation middleware
7. Improve error handling and logging
8. Add accessibility features (ARIA labels, keyboard navigation)

### Medium-term (3-6 months)

1. Mobile app development (React Native)
2. Parent portal
3. Advanced analytics dashboard
4. Video conferencing integration (Zoom/Google Meet API)
5. Chat system for class discussions
6. Calendar integration (Google Calendar)
7. Multi-language support (i18n)
8. Advanced search and filtering

### Long-term (6-12 months)

1. Gamification features (badges, leaderboards)
2. AI-powered personalized learning recommendations
3. Integration with Learning Management Systems (LMS)
4. Advanced reporting and analytics
5. Mobile apps for iOS and Android
6. Offline support with service workers
7. Advanced security features (2FA, SSO)
8. Scalability improvements (microservices, load balancing)

---

## Summary for AI Assistants

### What This Project Is

Class Pilot is a production-ready, full-stack classroom management system built with the MERN stack (MongoDB, Express.js, React, Node.js). It enables teachers to manage classes, track attendance, create AI-generated quizzes, assign homework, grade students, and communicate with students. Students can join classes, view their performance, take quizzes, submit assignments, and track their progress.

### Key Technical Highlights

- **Modern Stack:** React 19, Express 5, MongoDB Atlas, Node.js 20+
- **AI-Powered:** Google Gemini API for quiz and study plan generation
- **Secure:** JWT authentication, bcrypt password hashing, role-based authorization
- **Scalable:** Mongoose ODM with optimized indexes, pagination support
- **Production-Ready:** Azure deployment configuration, comprehensive error handling
- **Well-Documented:** 13+ documentation files covering all aspects

### Architecture Pattern

- **Backend:** RESTful API with Express.js, 13 route modules, JWT middleware
- **Frontend:** React SPA with Context API, custom hooks, React Router 7
- **Database:** MongoDB with 12 collections, compound indexes, schema validation
- **External Services:** Google Gemini AI, optional OpenAI fallback

### Core Features (13 Major Systems)

1. Authentication & Authorization (JWT, role-based)
2. Class Management (create, join, unique codes)
3. Attendance Tracking (daily, statistics, CSV upload)
4. AI Quiz Generation (Gemini/OpenAI, auto-grading)
5. Study Planner (AI-generated, drag-and-drop)
6. Assignment System (submit, grade, feedback)
7. Grade Management (categories, percentages, reports)
8. Portfolio System (performance analytics, charts)
9. Announcement System (public/private, comments)
10. Timetable (weekly schedule, auto-populate)
11. Meeting System (virtual classes, participants)
12. Classwork Organization (Google Classroom-style)
13. Export System (PDF/Excel reports)

### Common Tasks for AI Assistants

**When asked to add a new feature:**

1. Create model in `backend/models/`
2. Create controller in `backend/controllers/`
3. Create routes in `backend/routes/`
4. Register routes in `backend/server.js`
5. Add API methods in `frontend/src/services/api.js`
6. Create page component in `frontend/src/pages/`
7. Add route in `frontend/src/App.jsx`
8. Test endpoints and update documentation

**When debugging:**

1. Check browser console for frontend errors
2. Check network tab for API failures
3. Check backend logs for server errors
4. Verify environment variables are set
5. Check MongoDB connection status
6. Verify JWT token is valid
7. Check CORS configuration

**When optimizing:**

1. Add database indexes for frequent queries
2. Implement pagination for large datasets
3. Use lean queries for read-only operations
4. Add caching for frequently accessed data
5. Optimize frontend re-renders (useMemo, useCallback)
6. Implement code splitting and lazy loading

### Important Notes

- All passwords are hashed with bcrypt (cost factor 3 for dev, increase for production)
- JWT tokens expire after 24 hours
- Class codes are auto-generated with nanoid (6 characters)
- AI generation uses Gemini by default, OpenAI as fallback
- All dates normalized to UTC midnight for consistency
- Compound indexes prevent duplicate entries (attendance, quiz attempts)
- Frontend uses localStorage for token persistence
- CORS configured for localhost:5173 (add production URLs)

### Project Status

- **Current Version:** 1.0.0
- **Status:** Production-ready, actively maintained
- **Last Major Update:** November 2024 (bug fixes, Azure deployment)
- **Known Issues:** None critical, see "Known Issues & Limitations" section
- **Test Coverage:** Manual testing only, automated tests recommended

### Contact & Credits

- **Author:** Nikhil Pratap Singh
- **Project Type:** CS50x Final Project
- **License:** ISC (Educational Use)
- **Repository:** Class-Pilot (GitHub)

---

## End of Documentation

This comprehensive description covers all aspects of the Class Pilot project. For specific implementation details, refer to the source code and additional documentation files listed in the "Documentation Files" section.

**Total Lines of Documentation:** ~1000+ lines
**Last Updated:** December 2025
**Version:** 1.0.0
