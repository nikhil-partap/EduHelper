# Class Pilot - Comprehensive Classroom Management System

#### Video Demo: <URL HERE>

#### Description:

Class Pilot is a full-stack web application designed to revolutionize classroom management for both teachers and students. Built as my CS50x final project, this comprehensive educational platform provides a complete suite of tools for managing classes, tracking attendance, creating and taking quizzes, planning study schedules, and monitoring academic progress. The application demonstrates proficiency in modern web development technologies, database design, API architecture, and user experience design.

## Project Overview

Class Pilot addresses the real-world challenge of managing educational workflows in a digital environment. The platform serves two distinct user roles—teachers and students—each with tailored features and interfaces. Teachers can create and manage classes, track student attendance, generate AI-powered quizzes, and monitor student performance. Students can join classes, view their schedules, take quizzes, track their grades, and plan their study time effectively.

The project showcases a complete understanding of full-stack development, including frontend user interface design, backend API development, database schema design, authentication and authorization, and integration of third-party AI services for enhanced functionality.

## Technology Stack

### Backend Technologies

- **Node.js with Express.js**: The backend server is built using Express.js 5.x, providing a robust RESTful API architecture
- **MongoDB with Mongoose**: NoSQL database for flexible data storage with Mongoose ODM for schema validation and data modeling
- **JWT Authentication**: Secure token-based authentication using JSON Web Tokens with bcryptjs for password hashing
- **AI Integration**: Integration with Google's Generative AI (Gemini) and OpenAI for intelligent quiz generation
- **ES Modules**: Modern JavaScript module system for cleaner, more maintainable code

### Frontend Technologies

- **React 19**: Latest version of React for building dynamic, component-based user interfaces
- **Vite**: Next-generation build tool for faster development and optimized production builds
- **Tailwind CSS 4**: Utility-first CSS framework for responsive, modern UI design
- **React Router DOM 7**: Client-side routing for seamless navigation
- **Axios**: Promise-based HTTP client for API communication
- **Context API**: React's built-in state management for global application state

## Project Structure

The project follows a monorepo structure with separate frontend and backend directories:

```
Class-Pilot/
├── backend/          # Express.js API server
├── frontend/         # React application
├── .kiro/           # Development configuration
└── README.md        # This file
```

## Backend Architecture

### Core Files

#### `backend/server.js`

The main entry point for the backend application. This file initializes the Express server, configures middleware (CORS, JSON parsing, URL encoding), connects to MongoDB, and registers all API routes. It also includes a health check endpoint for monitoring server status. The server listens on port 5000 by default and includes comprehensive error handling.

**Design Decision**: I chose to keep the server configuration in a single file for simplicity while maintaining modularity through separate route files. This makes it easy to understand the application's entry point while keeping business logic separated.

#### `backend/config/db.js`

Database configuration module that handles MongoDB connection using Mongoose. It includes connection error handling, retry logic, and connection event listeners. The connection string is stored in environment variables for security.

**Design Decision**: Separating database configuration allows for easy testing with different databases and keeps sensitive connection strings out of the main application code.

### Models (Database Schemas)

#### `backend/models/User.js`

Defines the user schema with fields for name, email, password (hashed), role (teacher/student), and role-specific fields like schoolName for teachers and rollNumber for students. Includes pre-save middleware for password hashing and methods for password comparison.

**Design Decision**: I implemented role-based fields within a single User model rather than separate Teacher and Student models. This simplifies authentication while maintaining flexibility through conditional required fields based on role.

#### `backend/models/Class.js`

Schema for classroom entities including name, description, teacher reference, student array, schedule (days and times), capacity, and join code. Includes automatic join code generation using nanoid for easy class enrollment.

**Design Decision**: The join code system allows students to easily join classes without complex invitation systems. I chose nanoid for generating short, URL-safe codes that are easy to share.

#### `backend/models/Attendence.js`

Tracks student attendance with references to class and student, date, status (present/absent/late), and optional notes. Includes compound indexing for efficient queries.

**Design Decision**: Separate attendance records rather than embedding in Class model allows for better scalability and more flexible querying of attendance history.

#### `backend/models/Quiz.js`

Comprehensive quiz schema with title, description, class reference, questions array (with multiple choice options), time limit, due date, and settings for randomization and instant feedback.

**Design Decision**: Embedding questions within the quiz document rather than separate Question documents improves query performance and maintains data consistency, as questions are tightly coupled to their quiz.

#### `backend/models/QuizAttempt.js`

Records student quiz attempts with references to quiz and student, answers array, score, completion status, and timestamps. Allows tracking multiple attempts per student.

**Design Decision**: Separate attempt tracking enables detailed analytics and allows students to retake quizzes while preserving attempt history.

#### `backend/models/StudyPlanner.js`

Study planning schema with subject, topic, start/end dates, daily study hours, status tracking, and progress monitoring. Includes calculated fields for total days and hours.

**Design Decision**: The study planner uses a date-based calculation system to help students break down large topics into manageable daily goals, promoting consistent study habits.

### Controllers (Business Logic)

#### `backend/controllers/AuthController.js`

Handles all authentication operations including user registration, login, and profile retrieval. Implements JWT token generation, password validation, and role-based field validation.

**Key Functions**:

- `register`: Creates new users with role-specific validation
- `login`: Authenticates users and returns JWT token
- `getMe`: Retrieves current user profile from token

**Design Decision**: Separating authentication logic into a dedicated controller follows the single responsibility principle and makes the code more testable and maintainable.

#### `backend/controllers/classController.js`

Manages all class-related operations including creation, retrieval, updates, deletion, and student enrollment. Implements role-based access control to ensure teachers can only modify their own classes.

**Key Functions**:

- `createClass`: Teachers create new classes with automatic join code generation
- `getClasses`: Role-based class retrieval (teacher's classes or student's enrolled classes)
- `joinClass`: Students join classes using join codes
- `getClassDetails`: Retrieves detailed class information with populated references

**Design Decision**: The join code system provides a simple yet secure way for students to enroll in classes without requiring complex invitation workflows.

#### `backend/controllers/AttendenceController.js`

Handles attendance tracking including marking attendance, retrieving attendance records, and generating statistics. Supports CSV export for record-keeping.

**Key Functions**:

- `markAttendance`: Teachers mark student attendance for specific dates
- `getAttendance`: Retrieves attendance records with filtering options
- `getAttendanceStats`: Calculates attendance statistics for students

**Design Decision**: The attendance system uses date-based records rather than session-based, making it flexible for different class schedules and easy to generate reports.

#### `backend/controllers/quizController.js`

Comprehensive quiz management including creation, retrieval, submission, and grading. Supports both manual and AI-generated quizzes.

**Key Functions**:

- `createQuiz`: Teachers create quizzes with multiple-choice questions
- `generateQuizWithAI`: Uses AI to generate quiz questions based on topic and difficulty
- `submitQuiz`: Students submit quiz attempts with automatic grading
- `getQuizResults`: Retrieves quiz results and statistics

**Design Decision**: Integrating AI for quiz generation significantly reduces teacher workload while maintaining educational quality. The system supports both AI-generated and manually created quizzes for flexibility.

#### `backend/controllers/studyPlannerController.js`

Manages study planning features including plan creation, progress tracking, and schedule generation.

**Key Functions**:

- `createStudyPlan`: Creates study plans with automatic daily hour calculations
- `updateProgress`: Tracks daily study progress
- `getStudyPlans`: Retrieves student's study plans with filtering

**Design Decision**: The study planner uses a mathematical approach to distribute study hours evenly across available days, helping students maintain consistent study habits.

### Routes (API Endpoints)

#### `backend/routes/auth.js`

Authentication endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

#### `backend/routes/class.js`

Class management endpoints:

- `POST /api/classes` - Create class (teacher only)
- `GET /api/classes` - Get user's classes
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class (teacher only)
- `DELETE /api/classes/:id` - Delete class (teacher only)
- `POST /api/classes/join` - Join class with code (student only)

#### `backend/routes/attendance.js`

Attendance tracking endpoints:

- `POST /api/attendance/mark` - Mark attendance (teacher only)
- `GET /api/attendance/class/:classId` - Get class attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/stats/:studentId` - Get attendance statistics

#### `backend/routes/quiz.js`

Quiz management endpoints:

- `POST /api/quizzes` - Create quiz (teacher only)
- `POST /api/quizzes/generate` - Generate quiz with AI (teacher only)
- `GET /api/quizzes/class/:classId` - Get class quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/submit` - Submit quiz attempt (student only)
- `GET /api/quizzes/:id/results` - Get quiz results

#### `backend/routes/studyPlanner.js`

Study planning endpoints:

- `POST /api/study-planner` - Create study plan (student only)
- `GET /api/study-planner` - Get student's study plans
- `PUT /api/study-planner/:id` - Update study plan
- `PUT /api/study-planner/:id/progress` - Update progress
- `DELETE /api/study-planner/:id` - Delete study plan

### Middleware

#### `backend/middleware/auth.js`

Authentication middleware that protects routes and implements role-based access control.

**Key Functions**:

- `protect`: Verifies JWT token and attaches user to request
- `authorize`: Restricts access based on user roles

**Design Decision**: Middleware-based authentication provides a clean, reusable way to protect routes without duplicating code in every controller.

### Utilities

#### `backend/utils/aiService.js`

AI integration service supporting both Google Generative AI (Gemini) and OpenAI for quiz generation. Includes error handling and fallback mechanisms.

**Design Decision**: Supporting multiple AI providers ensures reliability and allows choosing the best model for different use cases.

#### `backend/utils/csvParser.js`

Utility for parsing CSV files, particularly useful for bulk student enrollment and attendance import.

**Design Decision**: CSV support enables easy data migration from existing systems and bulk operations.

#### `backend/utils/dateCalculator.js`

Date manipulation utilities for calculating study plan schedules, including functions for date ranges, business days, and hour distribution.

**Design Decision**: Centralizing date calculations ensures consistency across the application and makes the code more testable.

## Frontend Architecture

### Core Files

#### `frontend/src/main.jsx`

Application entry point that renders the root React component and sets up the React DOM.

#### `frontend/src/App.jsx`

Main application component that sets up routing, context providers, and global layout structure.

**Design Decision**: Using React Router for client-side routing provides a smooth, single-page application experience without full page reloads.

### Context (State Management)

#### `frontend/src/context/AuthContext.jsx` & `AuthProvider.jsx`

Global authentication state management using React Context API. Handles user login, registration, logout, and token management.

**Design Decision**: Separating context definition from provider implementation improves testability and allows for easier mocking in tests.

#### `frontend/src/context/ClassContext.jsx` & `ClassProvider.jsx`

Global class state management for accessing class data across components without prop drilling.

**Design Decision**: Using Context API for global state avoids the complexity of Redux while providing sufficient state management for this application's scale.

### Hooks (Custom React Hooks)

#### `frontend/src/hooks/useAuth.js`

Custom hook for accessing authentication context with helper functions for role checking.

**Design Decision**: Custom hooks provide a clean API for components to access auth state and prevent direct context usage errors.

#### `frontend/src/hooks/useClass.js`

Custom hook for accessing class context and performing class-related operations.

### Components

#### Authentication Components (`frontend/src/components/auth/`)

**Login.jsx**: User login form with email/password validation, error handling, and loading states. Includes backend connection testing feature.

**Register.jsx**: User registration form with role selection (teacher/student) and role-specific fields. Implements client-side validation before API calls.

**Design Decision**: Separate login and register components rather than a single form with mode switching provides clearer code organization and better user experience.

#### Shared Components (`frontend/src/components/shared/`)

**Navigation.jsx**: Responsive navigation bar with role-based menu items, mobile hamburger menu, and user profile dropdown.

**Dashboard.jsx**: Role-specific dashboard displaying relevant features and quick actions for teachers and students.

**FeatureCard.jsx**: Reusable card component for displaying features with icons, descriptions, and action buttons.

**LoadingSpinner.jsx**: Customizable loading indicator with different sizes and optional text.

**Alert.jsx**: Notification component for success, error, warning, and info messages with auto-dismiss functionality.

**FormInput.jsx**: Reusable form input component with consistent styling, icons, and validation display.

**Footer.jsx**: Application footer with branding and links.

**NotFound.jsx**: 404 error page for invalid routes.

**Design Decision**: Creating reusable shared components follows the DRY principle and ensures consistent UI/UX across the application.

### Pages

#### `frontend/src/pages/TeacherClasses.jsx`

Teacher's class management interface showing all created classes with options to create, edit, and delete classes. Displays class statistics and student enrollment.

**Design Decision**: Separate teacher and student class pages provide tailored experiences for each role without cluttering the interface with irrelevant features.

#### `frontend/src/pages/StudentClasses.jsx`

Student's class view showing enrolled classes and available classes to join. Includes join code input for class enrollment.

#### `frontend/src/pages/ClassDetails.jsx`

Detailed view of a specific class showing schedule, enrolled students, assignments, and quizzes. Adapts content based on user role.

**Design Decision**: A single ClassDetails component that adapts to user role is more maintainable than separate teacher/student detail pages.

#### `frontend/src/pages/Attendance.jsx`

Teacher's attendance management interface for marking and viewing attendance records. Includes date selection and bulk marking features.

#### `frontend/src/pages/StudentAttendance.jsx`

Student's attendance view showing their attendance history across all classes with statistics.

#### `frontend/src/pages/Quizzes.jsx`

Quiz listing page showing available quizzes for students or created quizzes for teachers. Includes filtering and search functionality.

#### `frontend/src/pages/TakeQuiz.jsx`

Interactive quiz-taking interface with timer, question navigation, and automatic submission. Provides immediate feedback if enabled.

**Design Decision**: The quiz interface uses a single-question-at-a-time approach to reduce cognitive load and improve focus.

#### `frontend/src/pages/QuizGenerator.jsx`

AI-powered quiz generation interface for teachers. Allows specifying topic, difficulty, number of questions, and AI provider.

**Design Decision**: Providing AI-generated quizzes significantly reduces teacher workload while maintaining educational quality through customizable parameters.

#### `frontend/src/pages/StudyPlanner.jsx`

Study planning interface for students to create and track study schedules. Displays daily goals and progress tracking.

**Design Decision**: Visual progress tracking motivates students and helps them maintain consistent study habits.

#### `frontend/src/pages/Grades.jsx`

Grade viewing interface showing quiz scores, assignment grades, and overall performance metrics.

#### `frontend/src/pages/Schedule.jsx`

Weekly schedule view showing all class timings and study plan sessions.

#### `frontend/src/pages/ComingSoon.jsx`

Placeholder page for features under development, maintaining user awareness of upcoming functionality.

### Services

#### `frontend/src/services/api.js`

Centralized API service module containing all HTTP requests to the backend. Uses Axios with interceptors for token management and error handling.

**Design Decision**: Centralizing API calls in a service layer separates concerns and makes it easy to modify API endpoints or add request/response interceptors.

## Key Features

### 1. Authentication System

- Secure user registration and login with JWT tokens
- Role-based access control (teacher/student)
- Password hashing with bcryptjs
- Automatic token validation and refresh
- Protected routes on both frontend and backend

### 2. Class Management

- Teachers create and manage classes
- Automatic join code generation for easy enrollment
- Students join classes using join codes
- Class scheduling with days and times
- Student capacity management
- Class details with enrolled student lists

### 3. Attendance Tracking

- Teachers mark attendance for each class session
- Support for present, absent, and late statuses
- Attendance history and statistics
- CSV export for record-keeping
- Student-specific attendance views

### 4. Quiz System

- Teachers create custom quizzes with multiple-choice questions
- AI-powered quiz generation using Google Gemini or OpenAI
- Configurable quiz settings (time limit, randomization, instant feedback)
- Automatic grading system
- Quiz attempt tracking and history
- Detailed results and analytics

### 5. Study Planner

- Students create personalized study plans
- Automatic calculation of daily study hours
- Progress tracking with visual indicators
- Date-based scheduling
- Multiple concurrent study plans

### 6. Grade Tracking

- Comprehensive grade viewing for students
- Performance analytics and trends
- Quiz score history
- Overall GPA calculation

### 7. Schedule Management

- Weekly schedule view
- Class timing display
- Study session integration
- Conflict detection

## Design Decisions and Challenges

### Database Design

I chose MongoDB for its flexibility in handling varying data structures across different features. The document-based model works well for educational data where relationships are often hierarchical (classes contain students, quizzes contain questions). Using Mongoose provides schema validation while maintaining NoSQL flexibility.

### Authentication Strategy

JWT-based authentication was chosen over session-based auth for its stateless nature, making it easier to scale and suitable for a REST API. Tokens are stored in localStorage on the frontend for persistence across page refreshes.

### Role-Based Architecture

Rather than creating separate applications for teachers and students, I implemented a unified application with role-based views. This reduces code duplication while providing tailored experiences through conditional rendering and route protection.

### AI Integration

Integrating AI for quiz generation was one of the most challenging aspects. I implemented support for multiple AI providers (Google Gemini and OpenAI) to ensure reliability and allow choosing the best model for different use cases. The system includes error handling and fallback mechanisms.

### Frontend State Management

I chose React Context API over Redux for state management because the application's state complexity doesn't justify Redux's boilerplate. Context API provides sufficient global state management while keeping the codebase simpler and more maintainable.

### Responsive Design

Using Tailwind CSS enabled rapid development of a responsive interface that works seamlessly across desktop, tablet, and mobile devices. The utility-first approach made it easy to implement consistent styling throughout the application.

## Testing and Quality Assurance

The project includes:

- Manual API testing scripts (`test-api.js`, `test-class-api.js`)
- Quick test utilities for development (`quick-test.js`)
- Date calculator unit tests (`dateCalculator.test.js`)
- Comprehensive error handling throughout the application
- Input validation on both frontend and backend

## Future Enhancements

While the current version is fully functional, potential future enhancements include:

- Real-time notifications using WebSockets
- File upload for assignments
- Video conferencing integration
- Parent/guardian access portal
- Mobile native applications
- Advanced analytics and reporting
- Integration with learning management systems (LMS)
- Gamification elements for student engagement

## Installation and Setup

Detailed setup instructions are available in `SETUP.md`. The application requires:

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Environment variables configuration
- Separate backend and frontend server startup

## Conclusion

Class Pilot represents a comprehensive solution to modern classroom management challenges. Through this project, I've demonstrated proficiency in full-stack web development, including frontend design with React, backend API development with Express.js, database design with MongoDB, authentication and authorization, third-party API integration, and responsive UI/UX design.

The project showcases not just technical skills but also an understanding of real-world educational needs and user experience design. Every feature was designed with both teachers and students in mind, ensuring the platform is intuitive, efficient, and genuinely useful for educational workflows.

Building Class Pilot has been an incredible learning experience, pushing me to solve complex problems, make important architectural decisions, and create a polished, production-ready application. This project represents the culmination of everything I've learned in CS50x and beyond.

---

**Author**: Nikhil Pratap Singh  
**Course**: CS50x 2024  
**Project**: Final Project - Class Pilot
