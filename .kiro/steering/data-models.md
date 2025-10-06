---
inclusion: always
---

# Data Models

## Current State

All data is currently stored in-memory as mock data arrays at the top of route files. MongoDB/Mongoose is configured but models are not yet implemented.

## User Model (Planned)

```javascript
{
  id: Number,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: "teacher", "student"),
  createdAt: Date
}
```

## Class Model (Planned)

```javascript
{
  id: Number,
  name: String,
  description: String,
  teacher: String,
  teacherId: Number,
  students: Array<{id, name, email}>,
  schedule: String,
  room: String,
  capacity: Number,
  enrolled: Number,
  assignments: Array<{id, title, dueDate, status}>
}
```

## Assignment Model (Planned)

```javascript
{
  id: Number,
  title: String,
  description: String,
  classId: Number,
  className: String,
  teacherId: Number,
  teacherName: String,
  dueDate: String (ISO 8601),
  createdAt: String (ISO 8601),
  status: String (enum: "draft", "active", "closed"),
  maxPoints: Number,
  submissions: Array<Submission>
}
```

## Submission Model (Planned)

```javascript
{
  studentId: Number,
  studentName: String,
  submittedAt: String (ISO 8601),
  submission: String,
  score: Number (nullable),
  feedback: String (optional),
  status: String (enum: "pending", "submitted", "graded"),
  gradedAt: String (ISO 8601, optional)
}
```

## ID Generation

Currently using simple incremental IDs (`array.length + 1`). When implementing MongoDB, use ObjectId or auto-increment pattern.

## Relationships

- User (Teacher) → has many Classes
- User (Student) → enrolled in many Classes
- Class → has many Assignments
- Assignment → has many Submissions
- Submission → belongs to Student and Assignment
