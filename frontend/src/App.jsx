import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {AuthProvider} from "./context/AuthProvider";
import {ClassProvider} from "./context/ClassProvider";
import {useAuth} from "./hooks/useAuth";
import {Login, Register} from "./components/auth";
import {
  Dashboard,
  LoadingSpinner,
  NotFound,
  Navigation,
  Footer,
} from "./components/shared";
import {TeacherClasses, StudentClasses, ComingSoon} from "./pages";
import ClassDetails from "./pages/ClassDetails";
import Attendance from "./pages/Attendance";
import StudentAttendance from "./pages/StudentAttendance";
import QuizGenerator from "./pages/QuizGenerator";
import Quizzes from "./pages/Quizzes";
import TakeQuiz from "./pages/TakeQuiz";
import StudyPlanner from "./pages/StudyPlanner";

// Protected Route Component
const ProtectedRoute = ({children}) => {
  const {isAuthenticated, loading} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Initializing LeetClass..." />
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
  return (
    <div className="min-h-screen bg-black flex flex-col">
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
                <ComingSoon
                  title="Assignments"
                  description="Create, manage and track assignments"
                  icon="📝"
                />
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
                <ComingSoon
                  title="Reports & Analytics"
                  description="View detailed reports and student analytics"
                  icon="📊"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <ComingSoon
                  title="Grades"
                  description="View your grades and academic progress"
                  icon="🎯"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <ComingSoon
                  title="Class Schedule"
                  description="View your class timetable and upcoming sessions"
                  icon="📅"
                />
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
    <AuthProvider>
      <Router>
        <ClassProvider>
          <AppContent />
        </ClassProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
