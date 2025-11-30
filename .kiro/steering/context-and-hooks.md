# Context & Hooks Management

## Context Architecture Patterns

Class Pilot uses a layered context architecture to manage application state efficiently. The separation between AuthContext and AuthProvider allows for better testing and flexibility.

### Context Structure

```
frontend/src/
├── context/
│   ├── AuthContext.jsx       # Context definition and types
│   └── AuthProvider.jsx      # Provider implementation
├── hooks/
│   ├── useAuth.js           # Authentication hook
│   ├── useClasses.js        # Class management hook
│   └── useAssignments.js    # Assignment management hook
```

## Authentication Context Pattern

### Context Definition (AuthContext.jsx)

```javascript
import {createContext} from "react";

// Define the shape of auth context
export const AuthContext = createContext({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Actions
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
  refreshToken: async () => {},
});

export default AuthContext;
```

### Provider Implementation (AuthProvider.jsx)

```javascript
import {useReducer, useEffect, useCallback} from "react";
import AuthContext from "./AuthContext";
import {authAPI} from "../services/api";

// Auth reducer for state management
const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {...state, loading: true, error: null};

    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {...state, error: null};

    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          dispatch({type: "AUTH_START"});
          const response = await authAPI.getMe();
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {user: response.data.user, token},
          });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({type: "LOGOUT"});
        }
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      dispatch({type: "AUTH_START"});
      const response = await authAPI.login(credentials);
      const {user, token} = response.data;

      localStorage.setItem("token", token);
      dispatch({type: "AUTH_SUCCESS", payload: {user, token}});

      return {success: true};
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({type: "AUTH_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({type: "AUTH_START"});
      const response = await authAPI.register(userData);
      const {user, token} = response.data;

      localStorage.setItem("token", token);
      dispatch({type: "AUTH_SUCCESS", payload: {user, token}});

      return {success: true};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({type: "AUTH_ERROR", payload: errorMessage});
      return {success: false, error: errorMessage};
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    dispatch({type: "LOGOUT"});
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({type: "CLEAR_ERROR"});
  }, []);

  // Token refresh function
  const refreshToken = useCallback(async () => {
    try {
      const response = await authAPI.refreshToken();
      const {token} = response.data;

      localStorage.setItem("token", token);
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {user: state.user, token},
      });

      return {success: true};
    } catch (error) {
      logout();
      return {success: false};
    }
  }, [state.user, logout]);

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
```

## Custom Hooks Pattern

### Authentication Hook (useAuth.js)

```javascript
import {useContext} from "react";
import AuthContext from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Role-based helper hooks
export const useIsTeacher = () => {
  const {user} = useAuth();
  return user?.role === "teacher";
};

export const useIsStudent = () => {
  const {user} = useAuth();
  return user?.role === "student";
};

export const useRequireAuth = () => {
  const {isAuthenticated, loading} = useAuth();

  if (!loading && !isAuthenticated) {
    throw new Error("Authentication required");
  }

  return {isAuthenticated, loading};
};

export default useAuth;
```

### Feature-Specific Hooks

```javascript
// hooks/useClasses.js
import {useState, useEffect, useCallback} from "react";
import {classAPI} from "../services/api";
import {useAuth} from "./useAuth";

export const useClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth();

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        user?.role === "teacher"
          ? await classAPI.getTeacherClasses()
          : await classAPI.getStudentClasses();

      setClasses(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const createClass = useCallback(async (classData) => {
    try {
      setLoading(true);
      const response = await classAPI.createClass(classData);
      setClasses((prev) => [response.data, ...prev]);
      return {success: true, data: response.data};
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create class";
      setError(errorMessage);
      return {success: false, error: errorMessage};
    } finally {
      setLoading(false);
    }
  }, []);

  const joinClass = useCallback(async (classId) => {
    try {
      setLoading(true);
      const response = await classAPI.joinClass(classId);
      setClasses((prev) => [response.data, ...prev]);
      return {success: true};
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to join class";
      setError(errorMessage);
      return {success: false, error: errorMessage};
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user, fetchClasses]);

  return {
    classes,
    loading,
    error,
    fetchClasses,
    createClass,
    joinClass,
    clearError: () => setError(null),
  };
};

// hooks/useAssignments.js
export const useAssignments = (classId = null) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {user} = useAuth();

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = classId
        ? await assignmentAPI.getClassAssignments(classId)
        : await assignmentAPI.getMyAssignments();

      setAssignments(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const createAssignment = useCallback(async (assignmentData) => {
    try {
      setLoading(true);
      const response = await assignmentAPI.createAssignment(assignmentData);
      setAssignments((prev) => [response.data, ...prev]);
      return {success: true, data: response.data};
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create assignment";
      setError(errorMessage);
      return {success: false, error: errorMessage};
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAssignment = useCallback(async (assignmentId, submission) => {
    try {
      setLoading(true);
      const response = await assignmentAPI.submitAssignment(
        assignmentId,
        submission
      );

      // Update assignment in list
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? {...assignment, submission: response.data}
            : assignment
        )
      );

      return {success: true};
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit assignment";
      setError(errorMessage);
      return {success: false, error: errorMessage};
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user, fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    submitAssignment,
    clearError: () => setError(null),
  };
};
```

## Context Composition Pattern

### Multiple Context Providers

```javascript
// App.jsx - Context composition
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthProvider";
import {ClassProvider} from "./context/ClassProvider";
import {NotificationProvider} from "./context/NotificationProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ClassProvider>
            <AppRoutes />
          </ClassProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Context Combination Hook

```javascript
// hooks/useAppContext.js
import {useAuth} from "./useAuth";
import {useClasses} from "./useClasses";
import {useNotifications} from "./useNotifications";

export const useAppContext = () => {
  const auth = useAuth();
  const classes = useClasses();
  const notifications = useNotifications();

  return {
    auth,
    classes,
    notifications,
  };
};
```

## Error Boundary Integration

### Context Error Handling

```javascript
// context/ErrorBoundary.jsx
import {Component} from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    console.error("Context Error:", error, errorInfo);

    // Log to error reporting service
    if (process.env.NODE_ENV === "production") {
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Performance Optimization

### Context Splitting Strategy

```javascript
// Split contexts by concern to prevent unnecessary re-renders

// Fast-changing state (UI state)
const UIContext = createContext();

// Slow-changing state (user data)
const UserContext = createContext();

// Medium-changing state (app data)
const DataContext = createContext();

// Usage in components
const MyComponent = () => {
  // Only subscribe to what you need
  const {theme, sidebarOpen} = useContext(UIContext);
  const {user} = useContext(UserContext);

  return <div className={`theme-${theme}`}>{/* Component content */}</div>;
};
```

### Memoization Patterns

```javascript
// AuthProvider.jsx - Memoized context value
export const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Memoize functions to prevent unnecessary re-renders
  const login = useCallback(async (credentials) => {
    // Login implementation
  }, []);

  const logout = useCallback(() => {
    // Logout implementation
  }, []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
      register,
      clearError,
    }),
    [state, login, logout, register, clearError]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
```

## Testing Context and Hooks

### Context Testing Pattern

```javascript
// __tests__/AuthProvider.test.jsx
import {render, screen, act} from "@testing-library/react";
import {AuthProvider} from "../context/AuthProvider";
import {useAuth} from "../hooks/useAuth";

// Test component to consume context
const TestComponent = () => {
  const {user, login, loading} = useAuth();

  return (
    <div>
      <div data-testid="user">{user?.name || "No user"}</div>
      <div data-testid="loading">{loading ? "Loading" : "Not loading"}</div>
      <button onClick={() => login({email: "test@test.com", password: "test"})}>
        Login
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  test("provides initial auth state", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(screen.getByTestId("loading")).toHaveTextContent("Not loading");
  });

  test("handles login flow", async () => {
    // Mock API response
    jest.spyOn(authAPI, "login").mockResolvedValue({
      data: {user: {name: "Test User"}, token: "test-token"},
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Login"));
    });

    expect(screen.getByTestId("user")).toHaveTextContent("Test User");
  });
});
```

### Hook Testing Pattern

```javascript
// __tests__/useAuth.test.js
import {renderHook, act} from "@testing-library/react";
import {AuthProvider} from "../context/AuthProvider";
import {useAuth} from "../hooks/useAuth";

const wrapper = ({children}) => <AuthProvider>{children}</AuthProvider>;

describe("useAuth Hook", () => {
  test("throws error when used outside provider", () => {
    const {result} = renderHook(() => useAuth());

    expect(result.error).toEqual(
      Error("useAuth must be used within an AuthProvider")
    );
  });

  test("provides auth methods", () => {
    const {result} = renderHook(() => useAuth(), {wrapper});

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.register).toBe("function");
  });
});
```

## Best Practices

### 1. Context Organization

- **Single Responsibility**: Each context should handle one domain
- **Provider Composition**: Compose multiple providers at app root
- **Error Boundaries**: Wrap providers in error boundaries
- **Performance**: Split contexts by update frequency

### 2. Hook Design

- **Custom Hooks**: Create domain-specific hooks for complex logic
- **Error Handling**: Always handle errors in hooks
- **Memoization**: Use useCallback and useMemo appropriately
- **Dependencies**: Carefully manage useEffect dependencies

### 3. State Management

- **Reducer Pattern**: Use useReducer for complex state logic
- **Immutability**: Always return new state objects
- **Action Types**: Use constants for action types
- **Middleware**: Consider adding middleware for logging/debugging

### 4. Testing Strategy

- **Provider Testing**: Test providers with mock components
- **Hook Testing**: Use renderHook for isolated hook testing
- **Integration Testing**: Test context + components together
- **Error Cases**: Test error boundaries and error states
