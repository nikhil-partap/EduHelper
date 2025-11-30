# Page Organization & Routing Patterns

## Page Structure Philosophy

Class Pilot follows a page-based architecture where each major feature has its own page component. Pages are responsible for layout, data fetching, and coordinating multiple components to create complete user experiences.

### Page Directory Structure

```
frontend/src/pages/
├── TeacherClasses.jsx      # Teacher class management
├── StudentClasses.jsx      # Student class browsing/joining
├── ClassDetails.jsx        # Individual class view (role-agnostic)
├── ComingSoon.jsx          # Placeholder for future features
├── Dashboard.jsx           # Main dashboard (moved from components)
├── Profile.jsx             # User profile management
├── Settings.jsx            # Application settings
└── NotFound.jsx            # 404 error page
```

## Page Component Patterns

### Standard Page Structure

```javascript
// Example: TeacherClasses.jsx
import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";
import {useClasses} from "../hooks/useClasses";
import Navigation from "../components/Navigation";
import LoadingSpinner from "../components/LoadingSpinner";
import Alert from "../components/Alert";
import ClassCard from "../components/ClassCard";
import CreateClassModal from "../components/CreateClassModal";

const TeacherClasses = () => {
  // Hooks for state and data
  const {user} = useAuth();
  const {classes, loading, error, createClass, fetchClasses} = useClasses();

  // Local page state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Page-specific effects
  useEffect(() => {
    document.title = "My Classes - Class Pilot";
  }, []);

  // Event handlers
  const handleCreateClass = async (classData) => {
    const result = await createClass(classData);
    if (result.success) {
      setShowCreateModal(false);
      // Show success message
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Implement search logic
  };

  // Computed values
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || cls.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Loading and error states
  if (loading && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading your classes..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <p className="mt-2 text-gray-600">
                Manage your classes and track student progress
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Create New Class
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => clearError()}
              className="mb-6"
            />
          )}

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Classes Grid */}
          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  class={classItem}
                  userRole="teacher"
                  onEdit={() => {
                    /* Handle edit */
                  }}
                  onDelete={() => {
                    /* Handle delete */
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No classes found" : "No classes yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first class to get started"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  Create Your First Class
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateClassModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateClass}
        />
      )}
    </div>
  );
};

export default TeacherClasses;
```

### Role-Based Page Variants

#### Student Classes Page

```javascript
// StudentClasses.jsx - Different perspective, same domain
const StudentClasses = () => {
  const {user} = useAuth();
  const {classes, loading, error, joinClass, leaveClass} = useClasses();
  const [availableClasses, setAvailableClasses] = useState([]);

  // Fetch both enrolled and available classes
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      try {
        const response = await classAPI.getAvailableClasses();
        setAvailableClasses(response.data);
      } catch (err) {
        console.error("Failed to fetch available classes:", err);
      }
    };

    fetchAvailableClasses();
  }, []);

  const handleJoinClass = async (classId) => {
    const result = await joinClass(classId);
    if (result.success) {
      // Refresh available classes
      setAvailableClasses((prev) => prev.filter((cls) => cls.id !== classId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* My Classes Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Classes
            </h2>
            {classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <ClassCard
                    key={classItem.id}
                    class={classItem}
                    userRole="student"
                    onLeave={() => handleLeaveClass(classItem.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <p className="text-gray-600">
                  You haven't joined any classes yet.
                </p>
              </div>
            )}
          </section>

          {/* Available Classes Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Classes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableClasses.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  class={classItem}
                  userRole="student"
                  isAvailable={true}
                  onJoin={() => handleJoinClass(classItem.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
```

### Shared Page Components

#### Class Details Page (Role-Agnostic)

```javascript
// ClassDetails.jsx - Adapts based on user role
import {useParams} from "react-router-dom";

const ClassDetails = () => {
  const {classId} = useParams();
  const {user} = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await classAPI.getClassDetails(classId);
        setClassData(response.data);
      } catch (error) {
        console.error("Failed to fetch class details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading class details..." />;
  }

  if (!classData) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Class Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {classData.name}
                </h1>
                <p className="text-gray-600 mt-2">{classData.description}</p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <span>👨‍🏫 {classData.teacher.name}</span>
                  <span>👥 {classData.students.length} students</span>
                  <span>📅 {classData.schedule.days.join(", ")}</span>
                </div>
              </div>

              {/* Role-based actions */}
              {user?.role === "teacher" && user?.id === classData.teacher.id ? (
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Edit Class
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md">
                    Add Assignment
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    View Assignments
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Role-based content */}
          {user?.role === "teacher" ? (
            <TeacherClassView classData={classData} />
          ) : (
            <StudentClassView classData={classData} />
          )}
        </div>
      </main>
    </div>
  );
};
```

### Coming Soon Pattern

```javascript
// ComingSoon.jsx - Consistent placeholder for future features
const ComingSoon = ({
  featureName = "This Feature",
  description = "We're working hard to bring you this feature.",
  expectedDate = null,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-8xl mb-8">🚧</div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {featureName} Coming Soon
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {description}
          </p>

          {expectedDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 inline-block">
              <p className="text-blue-800">
                <strong>Expected Release:</strong> {expectedDate}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium mr-4"
              >
                Go Back
              </button>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium"
            >
              Return to Dashboard
            </button>
          </div>

          {/* Feature preview or mockup */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What to Expect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-medium">Fast & Intuitive</h4>
                <p className="text-sm text-gray-600">
                  Streamlined interface for quick access
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h4 className="font-medium">Secure & Private</h4>
                <p className="text-sm text-gray-600">
                  Your data is protected and encrypted
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-medium">Mobile Ready</h4>
                <p className="text-sm text-gray-600">
                  Works perfectly on all devices
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComingSoon;
```

## Routing Architecture

### Route Configuration

```javascript
// routes/AppRoutes.jsx
import {Routes, Route, Navigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("../pages/Dashboard"));
const TeacherClasses = lazy(() => import("../pages/TeacherClasses"));
const StudentClasses = lazy(() => import("../pages/StudentClasses"));
const ClassDetails = lazy(() => import("../pages/ClassDetails"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const ComingSoon = lazy(() => import("../pages/ComingSoon"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Auth pages
const Login = lazy(() => import("../components/Login"));
const Register = lazy(() => import("../components/Register"));

const AppRoutes = () => {
  const {isAuthenticated, loading, user} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Class Pilot..." />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public routes */}
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Role-based routes */}
            <Route
              path="/classes"
              element={
                user?.role === "teacher" ? (
                  <TeacherClasses />
                ) : (
                  <StudentClasses />
                )
              }
            />

            {/* Shared routes */}
            <Route path="/classes/:classId" element={<ClassDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Coming soon routes */}
            <Route
              path="/assignments"
              element={
                <ComingSoon
                  featureName="Assignment Management"
                  description="Create, distribute, and grade assignments with ease."
                  expectedDate="Q2 2024"
                />
              }
            />
            <Route
              path="/grades"
              element={
                <ComingSoon
                  featureName="Grade Book"
                  description="Track student progress and generate reports."
                />
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
```

### Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import {Navigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  fallbackPath = "/dashboard",
}) => {
  const {isAuthenticated, loading, user} = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## Page Testing Patterns

### Page Component Testing

```javascript
// __tests__/TeacherClasses.test.jsx
import {render, screen, waitFor, fireEvent} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "../context/AuthProvider";
import TeacherClasses from "../pages/TeacherClasses";

// Mock API calls
jest.mock("../services/api", () => ({
  classAPI: {
    getTeacherClasses: jest.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Mathematics 101",
          description: "Basic math course",
          students: [],
          status: "active",
        },
      ],
    }),
    createClass: jest.fn().mockResolvedValue({
      data: {
        id: "2",
        name: "New Class",
        description: "New description",
      },
    }),
  },
}));

const mockTeacher = {
  id: "123",
  name: "Test Teacher",
  email: "teacher@test.com",
  role: "teacher",
};

const TestWrapper = ({children}) => (
  <BrowserRouter>
    <AuthProvider value={{user: mockTeacher, isAuthenticated: true}}>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe("TeacherClasses Page", () => {
  test("renders page with classes", async () => {
    render(
      <TestWrapper>
        <TeacherClasses />
      </TestWrapper>
    );

    expect(screen.getByText("My Classes")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Mathematics 101")).toBeInTheDocument();
    });
  });

  test("opens create class modal", async () => {
    render(
      <TestWrapper>
        <TeacherClasses />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText("Create New Class"));

    await waitFor(() => {
      expect(screen.getByText("Create Class")).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### 1. Page Organization

- **Single Responsibility**: Each page handles one main feature area
- **Role Awareness**: Pages adapt content based on user role
- **Consistent Layout**: Use common navigation and footer components
- **Error Boundaries**: Wrap pages in error boundaries

### 2. Data Management

- **Custom Hooks**: Use feature-specific hooks for data fetching
- **Loading States**: Always show loading indicators
- **Error Handling**: Display user-friendly error messages
- **Optimistic Updates**: Update UI immediately for better UX

### 3. Navigation

- **Breadcrumbs**: Show user location in complex flows
- **Back Buttons**: Provide clear navigation paths
- **Role-based Menus**: Show relevant navigation options
- **Deep Linking**: Support direct links to specific pages

### 4. Performance

- **Lazy Loading**: Load pages only when needed
- **Code Splitting**: Split large pages into smaller chunks
- **Memoization**: Prevent unnecessary re-renders
- **Prefetching**: Load likely next pages in background

### 5. Accessibility

- **Page Titles**: Set descriptive document titles
- **Focus Management**: Handle focus for screen readers
- **Keyboard Navigation**: Support keyboard-only users
- **ARIA Labels**: Provide context for assistive technologies
