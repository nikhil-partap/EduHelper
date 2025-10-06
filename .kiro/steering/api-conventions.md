---
inclusion: always
---

# API Conventions

## Response Format

All API responses follow a consistent structure:

**Success Response:**

```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

**Error Response:**

```json
{
  "message": "Error description"
}
```

## Route Documentation

Use JSDoc-style comments above each route:

```javascript
// @route   METHOD /api/resource
// @desc    Description of what the route does
// @access  Public | Private (Role)
```

## HTTP Status Codes

- `200` - Successful GET, PUT, DELETE
- `201` - Successful POST (resource created)
- `400` - Bad request (validation errors, missing fields)
- `401` - Unauthorized (invalid credentials)
- `404` - Resource not found
- `500` - Server error

## Error Handling

- Always wrap route handlers in try-catch blocks
- Log errors with `console.error()` including context
- Return generic error messages in production
- Include detailed error messages in development

## Validation

- Validate required fields at the start of route handlers
- Return 400 status with descriptive message for validation failures
- Check resource existence before operations (404 if not found)

## Query Parameters

Support filtering via query parameters:

- `classId` - Filter by class
- `teacherId` - Filter by teacher
- `studentId` - Filter by student
- `status` - Filter by status (active, draft, etc.)

## Current State

- Mock data stored in-memory (arrays at top of route files)
- No database models implemented yet
- No authentication middleware implemented yet
- Protected routes marked but not enforced
