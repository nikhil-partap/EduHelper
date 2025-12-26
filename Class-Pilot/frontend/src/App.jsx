import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {AuthProvider} from "./context/AuthProvider";
import {ClassProvider} from "./context/ClassProvider";
import {ThemeProvider} from "./context/ThemeContext";
import {useAuth} from "./hooks/useAuth";
import {useTheme} from "./hooks/useTheme";
import {Login, Register} from "./components/auth";
import {
  Dashboard,
  LoadingSpinner,
  NotFound,
  Navigation,
  Footer,
} from "./components/shared";
import {
  TeacherClasses,
  StudentClasses,
  ComingSoon,
  Grades,
  Schedule,
  Assignments,
  AssignmentDetail,
  Timetable,
  Meetings,
} from "./pages";
import ClassDetails from "./pages/ClassDetails";
import Attendance from "./pages/Attendance";
import StudentAttendance from "./pages/StudentAttendance";
import QuizGenerator from "./pages/QuizGenerator";
import Quizzes from "./pages/Quizzes";
import TakeQuiz from "./pages/TakeQuiz";
import QuizStats from "./pages/QuizStats";
import StudyPlanner from "./pages/StudyPlanner";
import StudentReports from "./pages/StudentReports";

// Protected Route Component
const ProtectedRoute = ({children}) => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({children}) => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing Class Pilot..." />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Classes Page Component (renders based on user role)
const ClassesPage = () => {
  const {user} = useAuth();

  if (user?.role === "teacher") {
    return <TeacherClasses />;
  } else {
    return <StudentClasses />;
  }
};

// Attendance Page Component (renders based on user role)
const AttendancePage = () => {
  const {user} = useAuth();

  if (user?.role === "teacher") {
    return <Attendance />;
  } else {
    return <StudentAttendance />;
  }
};

const AppContent = () => {
  const {theme} = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        theme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navigation />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <ComingSoon
                  title="Students Management"
                  description="View and manage all your students across classes"
                  icon="👥"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment/:assignmentId"
            element={
              <ProtectedRoute>
                <AssignmentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/generate"
            element={
              <ProtectedRoute>
                <QuizGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId/stats"
            element={
              <ProtectedRoute>
                <QuizStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId/take"
            element={
              <ProtectedRoute>
                <TakeQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <TakeQuiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-planner"
            element={
              <ProtectedRoute>
                <StudyPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <StudentReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <Grades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute>
                <Meetings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class/:id"
            element={
              <ProtectedRoute>
                <ClassDetails />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ClassProvider>
            <AppContent />
          </ClassProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
