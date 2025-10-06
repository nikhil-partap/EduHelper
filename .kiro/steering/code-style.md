---
inclusion: always
---

# Code Style Guidelines

## Backend (Node.js/Express)

### Module System

- Use CommonJS (`require`/`module.exports`)
- Import order: external packages → local modules

### Naming Conventions

- Routes: lowercase with hyphens (`/api/teacher-dashboard`)
- Variables: camelCase (`teacherData`, `assignmentId`)
- Constants: UPPER_SNAKE_CASE for environment variables
- Files: lowercase with hyphens or camelCase

### Route Structure

```javascript
const express = require("express");
const router = express.Router();

// Mock data at top
const data = [...];

// Routes with JSDoc comments
// @route   METHOD /path
// @desc    Description
// @access  Access level
router.method("/path", (req, res) => {
  try {
    // Implementation
  } catch (error) {
    console.error("Context error:", error);
    res.status(500).json({message: "Server error"});
  }
});

module.exports = router;
```

### Error Handling

- Always use try-catch in route handlers
- Log errors with descriptive context
- Return consistent error responses

## Frontend (React)

### Module System

- Use ES Modules (`import`/`export`)
- Import order: React → third-party → local components → styles

### Component Structure

```javascript
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";

export default function ComponentName() {
  // State declarations
  const [state, setState] = useState(initialValue);
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    // JSX
  );
}
```

### Naming Conventions

- Components: PascalCase (`TeacherDashboard`)
- Functions/variables: camelCase (`handleLogout`, `activeTab`)
- Constants: UPPER_SNAKE_CASE or camelCase for config
- CSS classes: Tailwind utility classes

### React Patterns

- Functional components only (no class components)
- Hooks for state and side effects
- Destructure props in function parameters
- Use `export default` for components

## Tailwind CSS

- Use utility-first approach
- Group related utilities (layout → spacing → colors → typography)
- Use responsive prefixes (`md:`, `lg:`) for breakpoints
- Prefer Tailwind utilities over custom CSS

## Comments

- Use JSDoc-style comments for route documentation
- Add inline comments for complex logic
- Avoid obvious comments
- Document "why" not "what"

## Formatting

- 2 spaces for indentation (both frontend and backend)
- Double quotes for strings
- Semicolons at end of statements (backend)
- No semicolons in JSX (frontend follows project convention)
- Trailing commas in objects/arrays
