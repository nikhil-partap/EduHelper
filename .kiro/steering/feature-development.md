# Feature Development Guidelines

## Class Pilot Specific Patterns

### Role-Based Development

Always consider both teacher and student perspectives when developing features:

```javascript
// Feature implementation pattern
const FeatureComponent = () => {
  const {user} = useAuth();

  if (user?.role === "teacher") {
    return <TeacherFeatureView />;
  }

  return <StudentFeatureView />;
};
```

### Data Flow Architecture

```
Frontend (React) → API Service → Backend Controller → Database (MongoDB)
                ←              ←                   ←
```

## Core Feature Categories

### 1. Class Management

**Teacher Features:**

- Create/edit/delete classes
- Manage class schedules
- Add/remove students
- Set class capacity limits

**Student Features:**

- Browse available classes
- Join/leave classes
- View class schedules
- Access class materials

**Database Schema Pattern:**

```javascript
const classSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    description: String,
    teacher: {type: ObjectId, ref: "User", required: true},
    students: [{type: ObjectId, ref: "User"}],
    schedule: {
      days: [String], // ['monday', 'wednesday', 'friday']
      startTime: String,
      endTime: String,
    },
    capacity: {type: Number, default: 30},
    status: {type: String, enum: ["active", "inactive"], default: "active"},
  },
  {timestamps: true}
);
```

### 2. Assignment System

**Teacher Features:**

- Create assignments with due dates
- Set grading rubrics
- Review and grade submissions
- Provide feedback

**Student Features:**

- View assigned tasks
- Submit assignments
- Track submission status
- View grades and feedback

**API Endpoints Pattern:**

```javascript
// Teacher routes
POST   /api/classes/:classId/assignments     // Create assignment
GET    /api/classes/:classId/assignments     // Get class assignments
PUT    /api/assignments/:id                  // Update assignment
DELETE /api/assignments/:id                  // Delete assignment

// Student routes
GET    /api/assignments/my-assignments       // Get student's assignments
POST   /api/assignments/:id/submit           // Submit assignment
GET    /api/assignments/:id/submission       // Get submission details
```

### 3. Progress Tracking

**Teacher Features:**

- View class performance analytics
- Generate progress reports
- Track individual student progress
- Identify struggling students

**Student Features:**

- View personal progress
- Track assignment completion
- See grade trends
- Access performance insights

### 4. Communication System

**Teacher Features:**

- Send class announcements
- Message individual students
- Create discussion forums
- Share important updates

**Student Features:**

- Receive notifications
- Participate in discussions
- Message teachers
- View class announcements

## Development Workflow for New Features

### 1. Planning Phase

- Define user stories for both teacher and student roles
- Create wireframes/mockups
- Plan database schema changes
- Define API endpoints
- Consider security implications

### 2. Backend Development

```javascript
// 1. Create/update database models
// 2. Implement controllers with proper error handling
// 3. Create protected routes with role-based access
// 4. Add input validation and sanitization
// 5. Write unit tests for business logic

// Example controller structure
export const createClass = async (req, res, next) => {
  try {
    // Validate teacher role
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({message: "Only teachers can create classes"});
    }

    // Validate input
    const {name, description, schedule, capacity} = req.body;
    if (!name || !schedule) {
      return res.status(400).json({message: "Name and schedule are required"});
    }

    // Create class
    const newClass = await Class.create({
      name,
      description,
      teacher: req.user._id,
      schedule,
      capacity: capacity || 30,
    });

    res.status(201).json({
      success: true,
      data: newClass,
      message: "Class created successfully",
    });
  } catch (error) {
    next(error);
  }
};
```

### 3. Frontend Development

```javascript
// 1. Create reusable components
// 2. Implement role-based views
// 3. Add proper error handling and loading states
// 4. Ensure responsive design
// 5. Write component tests

// Example component structure
const ClassManagement = () => {
  const {user} = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getClasses();
      setClasses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="space-y-6">
      {user?.role === "teacher" ? (
        <TeacherClassView classes={classes} onUpdate={fetchClasses} />
      ) : (
        <StudentClassView classes={classes} onJoin={fetchClasses} />
      )}
    </div>
  );
};
```

## API Design Patterns

### Consistent Response Format

```javascript
// Success responses
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation completed successfully",
  "pagination": { // if applicable
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}

// Error responses
{
  "success": false,
  "error": "ValidationError",
  "message": "User-friendly error message",
  "details": { /* validation errors if applicable */ }
}
```

### Pagination Pattern

```javascript
// Backend implementation
export const getClasses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const classes = await Class.find()
      .populate("teacher", "name email")
      .skip(skip)
      .limit(limit)
      .sort({createdAt: -1});

    const total = await Class.countDocuments();

    res.json({
      success: true,
      data: classes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### Search and Filter Pattern

```javascript
// Backend search implementation
export const searchClasses = async (req, res, next) => {
  try {
    const {search, subject, level, status} = req.query;

    let query = {};

    if (search) {
      query.$or = [
        {name: {$regex: search, $options: "i"}},
        {description: {$regex: search, $options: "i"}},
      ];
    }

    if (subject) query.subject = subject;
    if (level) query.level = level;
    if (status) query.status = status;

    const classes = await Class.find(query)
      .populate("teacher", "name")
      .sort({createdAt: -1});

    res.json({
      success: true,
      data: classes,
      count: classes.length,
    });
  } catch (error) {
    next(error);
  }
};
```

## State Management Patterns

### Context Pattern for Feature-Specific State

```javascript
// ClassContext.jsx
const ClassContext = createContext();

export const ClassProvider = ({children}) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (classData) => {
    try {
      const response = await classAPI.createClass(classData);
      setClasses((prev) => [response.data, ...prev]);
      return {success: true, data: response.data};
    } catch (error) {
      return {success: false, error: error.response?.data?.message};
    }
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        selectedClass,
        loading,
        fetchClasses,
        createClass,
        setSelectedClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error("useClass must be used within ClassProvider");
  }
  return context;
};
```

## Testing Patterns

### Component Testing with Role Simulation

```javascript
// Test helper for role-based components
const renderWithAuth = (component, userRole = "student") => {
  const mockUser = {
    id: "123",
    name: "Test User",
    email: "test@example.com",
    role: userRole,
  };

  return render(
    <AuthProvider value={{user: mockUser, isAuthenticated: true}}>
      {component}
    </AuthProvider>
  );
};

// Test both teacher and student views
describe("ClassManagement", () => {
  test("renders teacher view for teachers", () => {
    renderWithAuth(<ClassManagement />, "teacher");
    expect(screen.getByText("Create New Class")).toBeInTheDocument();
  });

  test("renders student view for students", () => {
    renderWithAuth(<ClassManagement />, "student");
    expect(screen.getByText("Available Classes")).toBeInTheDocument();
  });
});
```

### API Testing Pattern

```javascript
// Mock data for consistent testing
const mockClassData = {
  name: "Test Class",
  description: "Test Description",
  teacher: "507f1f77bcf86cd799439011",
  schedule: {
    days: ["monday", "wednesday"],
    startTime: "09:00",
    endTime: "10:30",
  },
};

describe("Class API", () => {
  test("creates class successfully", async () => {
    const response = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${teacherToken}`)
      .send(mockClassData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(mockClassData.name);
  });

  test("prevents students from creating classes", async () => {
    await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${studentToken}`)
      .send(mockClassData)
      .expect(403);
  });
});
```

## Performance Optimization

### Database Query Optimization

```javascript
// Use populate selectively
const classes = await Class.find()
  .populate("teacher", "name email") // Only get needed fields
  .populate("students", "name email rollNumber")
  .select("-__v") // Exclude version field
  .lean(); // Return plain objects for read-only operations

// Use indexes for frequently queried fields
classSchema.index({teacher: 1, status: 1});
classSchema.index({name: "text", description: "text"}); // Text search
```

### Frontend Performance

```javascript
// Lazy load components
const TeacherClasses = lazy(() => import("../pages/TeacherClasses"));
const StudentClasses = lazy(() => import("../pages/StudentClasses"));

// Memoize expensive calculations
const classStats = useMemo(() => {
  return classes.reduce(
    (stats, cls) => {
      stats.total++;
      stats.active += cls.status === "active" ? 1 : 0;
      return stats;
    },
    {total: 0, active: 0}
  );
}, [classes]);

// Debounce search inputs
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchClasses(debouncedSearch);
  }
}, [debouncedSearch]);
```
