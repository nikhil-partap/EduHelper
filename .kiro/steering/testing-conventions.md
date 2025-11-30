# Testing Conventions & Standards

## Testing Philosophy

Class Pilot follows a comprehensive testing strategy that ensures reliability, maintainability, and confidence in deployments. All features should be tested at multiple levels with proper mocking and isolation.

## Backend Testing Patterns

### Test File Organization

```
backend/
├── tests/
│   ├── setup.js              # Test environment setup
│   ├── unit/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── classes.test.js
│   │   └── assignments.test.js
│   └── helpers/
│       ├── testData.js
│       └── testUtils.js
├── test-api.js               # Manual API testing
├── test-class-api.js         # Class-specific API tests
└── quick-test.js             # Quick development tests
```

### Test Setup Pattern

```javascript
// tests/setup.js
import mongoose from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server";

let mongoServer;

export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
};

export const teardownTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

// Clear collections between tests
export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

### API Testing Standards

```javascript
// Example: test-class-api.js pattern
import request from "supertest";
import app from "../server.js";
import {setupTestDB, teardownTestDB, clearTestDB} from "./tests/setup.js";

describe("Class API Endpoints", () => {
  let teacherToken, studentToken;
  let teacherId, studentId;

  beforeAll(async () => {
    await setupTestDB();

    // Create test users and get tokens
    const teacherData = {
      name: "Test Teacher",
      email: "teacher@test.com",
      password: "password123",
      role: "teacher",
      schoolName: "Test School",
    };

    const teacherResponse = await request(app)
      .post("/api/auth/register")
      .send(teacherData);

    teacherToken = teacherResponse.body.token;
    teacherId = teacherResponse.body.user.id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe("POST /api/classes", () => {
    test("should create class for teacher", async () => {
      const classData = {
        name: "Test Class",
        description: "Test Description",
        subject: "Mathematics",
        schedule: {
          days: ["monday", "wednesday"],
          startTime: "09:00",
          endTime: "10:30",
        },
      };

      const response = await request(app)
        .post("/api/classes")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send(classData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(classData.name);
      expect(response.body.data.teacher).toBe(teacherId);
    });

    test("should reject class creation for students", async () => {
      const classData = {
        name: "Test Class",
        description: "Test Description",
      };

      await request(app)
        .post("/api/classes")
        .set("Authorization", `Bearer ${studentToken}`)
        .send(classData)
        .expect(403);
    });
  });
});
```

### Quick Testing Pattern

```javascript
// quick-test.js for development
import {authAPI, classAPI} from "./services/api.js";

const runQuickTests = async () => {
  console.log("🧪 Running Quick API Tests...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing server health...");
    const health = await fetch("http://localhost:5000/health");
    const healthData = await health.json();
    console.log("✅ Health:", healthData.status);

    // Test 2: Authentication flow
    console.log("\n2. Testing authentication...");
    const testUser = {
      name: "Quick Test User",
      email: `test-${Date.now()}@example.com`,
      password: "test123",
      role: "teacher",
      schoolName: "Test School",
    };

    const registerResponse = await authAPI.register(testUser);
    console.log("✅ Registration successful");

    const loginResponse = await authAPI.login({
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful");

    // Test 3: Protected route
    console.log("\n3. Testing protected routes...");
    localStorage.setItem("token", loginResponse.data.token);

    const profileResponse = await authAPI.getMe();
    console.log("✅ Profile fetch successful");

    console.log("\n🎉 All quick tests passed!");
  } catch (error) {
    console.error("❌ Quick test failed:", error.message);
  }
};

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runQuickTests();
}

export default runQuickTests;
```

## Frontend Testing Patterns

### Component Testing Standards

```javascript
// Example: Login.test.jsx
import {render, screen, fireEvent, waitFor} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "../context/AuthProvider";
import Login from "../components/Login";

// Test wrapper for components that need context
const TestWrapper = ({children}) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe("Login Component", () => {
  test("renders login form elements", () => {
    render(
      <TestWrapper>
        <Login onSwitchToRegister={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", {name: /sign in/i})).toBeInTheDocument();
  });

  test("handles form submission", async () => {
    const mockLogin = jest.fn().mockResolvedValue({success: true});

    // Mock the useAuth hook
    jest.mock("../hooks/useAuth", () => ({
      useAuth: () => ({
        login: mockLogin,
        loading: false,
        error: null,
      }),
    }));

    render(
      <TestWrapper>
        <Login onSwitchToRegister={() => {}} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: {value: "test@example.com"},
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: {value: "password123"},
    });

    fireEvent.click(screen.getByRole("button", {name: /sign in/i}));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

### Hook Testing Pattern

```javascript
// Example: useAuth.test.js
import {renderHook, act} from "@testing-library/react";
import {AuthProvider} from "../context/AuthProvider";
import {useAuth} from "../hooks/useAuth";

const wrapper = ({children}) => <AuthProvider>{children}</AuthProvider>;

describe("useAuth Hook", () => {
  test("provides initial auth state", () => {
    const {result} = renderHook(() => useAuth(), {wrapper});

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  test("handles login successfully", async () => {
    const {result} = renderHook(() => useAuth(), {wrapper});

    await act(async () => {
      const response = await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
      expect(response.success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
  });
});
```

### Page Testing Pattern

```javascript
// Example: TeacherClasses.test.jsx
import {render, screen, waitFor} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import TeacherClasses from "../pages/TeacherClasses";
import {AuthProvider} from "../context/AuthProvider";

// Mock API calls
jest.mock("../services/api", () => ({
  classAPI: {
    getClasses: jest.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Test Class",
          description: "Test Description",
          students: [],
        },
      ],
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
  test("renders classes for teacher", async () => {
    render(
      <TestWrapper>
        <TeacherClasses />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Class")).toBeInTheDocument();
    });

    expect(screen.getByText("Create New Class")).toBeInTheDocument();
  });
});
```

## Test Data Management

### Mock Data Patterns

```javascript
// tests/helpers/testData.js
export const mockUsers = {
  teacher: {
    name: "Test Teacher",
    email: "teacher@test.com",
    password: "password123",
    role: "teacher",
    schoolName: "Test School",
  },
  student: {
    name: "Test Student",
    email: "student@test.com",
    password: "password123",
    role: "student",
    rollNumber: "ST001",
  },
};

export const mockClasses = {
  mathClass: {
    name: "Mathematics 101",
    description: "Basic mathematics course",
    subject: "Mathematics",
    schedule: {
      days: ["monday", "wednesday", "friday"],
      startTime: "09:00",
      endTime: "10:30",
    },
    capacity: 30,
  },
};

export const mockAssignments = {
  homework: {
    title: "Homework Assignment 1",
    description: "Complete exercises 1-10",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    points: 100,
  },
};
```

### Test Utilities

```javascript
// tests/helpers/testUtils.js
import request from "supertest";
import app from "../../server.js";

export const createTestUser = async (userData) => {
  const response = await request(app).post("/api/auth/register").send(userData);

  return {
    user: response.body.user,
    token: response.body.token,
  };
};

export const createTestClass = async (classData, teacherToken) => {
  const response = await request(app)
    .post("/api/classes")
    .set("Authorization", `Bearer ${teacherToken}`)
    .send(classData);

  return response.body.data;
};

export const authenticatedRequest = (token) => {
  return {
    get: (url) => request(app).get(url).set("Authorization", `Bearer ${token}`),
    post: (url) =>
      request(app).post(url).set("Authorization", `Bearer ${token}`),
    put: (url) => request(app).put(url).set("Authorization", `Bearer ${token}`),
    delete: (url) =>
      request(app).delete(url).set("Authorization", `Bearer ${token}`),
  };
};
```

## Testing Commands & Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:api": "node test-api.js",
    "test:quick": "node quick-test.js"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.js", "<rootDir>/**/__tests__/**/*.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "models/**/*.js",
    "middleware/**/*.js",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Testing Best Practices

### 1. Test Isolation

- Each test should be independent
- Use proper setup/teardown
- Clear database between tests
- Mock external dependencies

### 2. Test Coverage

- Aim for 80%+ code coverage
- Test both success and error cases
- Include edge cases and validation
- Test role-based access control

### 3. Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and simple

### 4. Mock Strategy

- Mock external APIs and services
- Use real database for integration tests
- Mock authentication for component tests
- Provide realistic mock data

### 5. Performance Testing

- Test API response times
- Monitor memory usage in tests
- Test with realistic data volumes
- Include load testing for critical paths

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          MONGO_URI: mongodb://localhost:27017/test
          JWT_SECRET: test_secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```
