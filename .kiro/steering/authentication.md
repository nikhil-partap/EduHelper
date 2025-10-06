---
inclusion: always
---

# Authentication & Authorization

## Current Implementation

- JWT-based authentication using `jsonwebtoken` package
- Password hashing with `bcryptjs` (salt rounds: 10)
- Mock user data stored in-memory in `routes/auth.js`

## JWT Configuration

Environment variables in `.env`:

- `JWT_SECRET` - Secret key for signing tokens
- `JWT_EXPIRE` - Token expiration time (default: 7d)

## Token Payload

```javascript
{
  userId: user.id,
  role: user.role  // "teacher" or "student"
}
```

## User Roles

- `teacher` - Can create/manage classes, assignments, grade submissions
- `student` - Can enroll in classes, submit assignments, view grades

## Route Access Levels

- **Public** - No authentication required (login, register, health check)
- **Private** - Authentication required
- **Private (Teacher only)** - Teacher role required
- **Private (Student only)** - Student role required

## TODO: Authentication Middleware

Need to implement middleware to:

1. Extract JWT from Authorization header
2. Verify token validity
3. Attach user data to `req.user`
4. Protect routes based on role

Example usage:

```javascript
router.get("/protected", authMiddleware, (req, res) => {
  // req.user available here
});

router.post(
  "/teacher-only",
  authMiddleware,
  requireRole("teacher"),
  (req, res) => {
    // Only teachers can access
  }
);
```

## Frontend Authentication

- User role stored in localStorage (`userRole`)
- User name stored in localStorage (`teacherName` or `studentName`)
- Navigation guards check role before rendering dashboards
- Logout clears localStorage and redirects to home
