# Backend Development Conventions

## API Design Principles

### RESTful API Structure

- **Base URL**: `http://localhost:5000`
- **API Prefix**: All API routes use `/api` prefix
- **Versioning**: Consider `/api/v1` for future API versions
- **Resource Naming**: Use plural nouns (e.g., `/api/classes`, `/api/assignments`)

### HTTP Methods & Status Codes

- **GET**: Retrieve data (200 OK, 404 Not Found)
- **POST**: Create resources (201 Created, 400 Bad Request, 409 Conflict)
- **PUT/PATCH**: Update resources (200 OK, 404 Not Found)
- **DELETE**: Remove resources (200 OK, 204 No Content, 404 Not Found)

### Response Format

```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error type",
  "message": "User-friendly error message"
}
```

## Authentication & Authorization

### JWT Token Structure

- **Payload**: Include `userId` and `role`
- **Expiration**: 1 hour for security
- **Secret**: Use strong JWT_SECRET in production
- **Header Format**: `Authorization: Bearer <token>`

### Middleware Pattern

```javascript
// Protected route middleware
export const protect = async (req, res, next) => {
  // Extract and verify token
  // Attach user to req.user
  // Call next() or return error
};

// Role-based middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({message: "Access denied"});
    }
    next();
  };
};
```

## Database Conventions

### Mongoose Schema Patterns

- **Timestamps**: Always include `{ timestamps: true }`
- **Validation**: Use built-in and custom validators
- **Indexes**: Add indexes for frequently queried fields
- **References**: Use ObjectId references for relationships

### Schema Structure Example

```javascript
const schema = new mongoose.Schema(
  {
    // Required fields first
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Optional fields
    description: {
      type: String,
      trim: true,
    },

    // References
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Enums
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
```

## Controller Patterns

### Standard Controller Structure

```javascript
// @desc    Description of what this does
// @route   HTTP_METHOD /api/resource
// @access  Public/Private/Admin
export const controllerFunction = async (req, res, next) => {
  try {
    // 1. Validate input
    // 2. Process business logic
    // 3. Database operations
    // 4. Return response

    res.status(200).json({
      success: true,
      data: result,
      message: "Operation successful",
    });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};
```

### Error Handling

- **Always use try-catch** in async controllers
- **Pass errors to middleware** using `next(error)`
- **Validate input** before processing
- **Return consistent error responses**

## Route Organization

### Route File Structure

```javascript
import express from "express";
import {protect, authorize} from "../middleware/auth.js";
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/resourceController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);

// Protected routes (all routes below require authentication)
router.use(protect);

router.route("/").get(getResources).post(createResource);

router
  .route("/:id")
  .get(getResource)
  .put(updateResource)
  .delete(deleteResource);

// Admin only routes
router.use(authorize("admin"));
router.get("/admin/stats", getAdminStats);

export default router;
```

## Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/classpilot

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Email (future)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Environment Validation

- **Validate required variables** on startup
- **Use different configs** for development/production
- **Never commit .env files** to version control

## Security Best Practices

### Input Validation

- **Sanitize all inputs** before database operations
- **Use Mongoose validation** for schema-level validation
- **Implement rate limiting** for API endpoints
- **Validate file uploads** if implemented

### Password Security

- **Hash passwords** using bcryptjs with salt rounds ≥ 10
- **Never store plain text** passwords
- **Implement password strength** requirements
- **Use secure password reset** flows

### CORS Configuration

```javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

## Testing Conventions

### API Testing Structure

- **Unit tests** for individual functions
- **Integration tests** for API endpoints
- **Authentication tests** for protected routes
- **Error handling tests** for edge cases

### Test File Organization

```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   └── middleware/
├── integration/
│   ├── auth.test.js
│   ├── classes.test.js
│   └── assignments.test.js
└── helpers/
    ├── setup.js
    └── teardown.js
```

## Logging & Monitoring

### Request Logging

```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Error Logging

- **Log all errors** with stack traces
- **Use different log levels** (error, warn, info, debug)
- **Include request context** in error logs
- **Consider structured logging** for production

## Performance Optimization

### Database Optimization

- **Use indexes** for frequently queried fields
- **Implement pagination** for large datasets
- **Use select()** to limit returned fields
- **Consider aggregation pipelines** for complex queries

### Caching Strategy

- **Cache frequently accessed data**
- **Use Redis** for session storage
- **Implement cache invalidation** strategies
- **Cache API responses** where appropriate

## Future Considerations

### Scalability Patterns

- **Separate concerns** into microservices when needed
- **Use message queues** for async operations
- **Implement horizontal scaling** strategies
- **Consider database sharding** for large datasets

### API Documentation

- **Use OpenAPI/Swagger** for API documentation
- **Document all endpoints** with examples
- **Include authentication requirements**
- **Provide SDK/client libraries** when needed
