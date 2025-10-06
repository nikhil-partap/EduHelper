---
inclusion: always
---

# Project Structure

## Root Layout

```
/
├── backend/          # Express API server
├── frontend/         # React application
└── README.md         # Project documentation
```

## Backend Structure

```
backend/
├── server.js         # Main server entry point
├── routes/           # API route handlers
│   ├── auth.js
│   ├── teachers.js
│   ├── students.js
│   ├── classes.js
│   └── assignments.js
└── package.json
```

### Backend Conventions

- CommonJS module system (`require`/`module.exports`)
- API routes prefixed with `/api/`
- Centralized error handling middleware
- Health check endpoint at `/api/health`
- CORS configured for frontend origin
- MongoDB connection with graceful fallback

## Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Landing page (role selection)
│   ├── router/
│   │   └── Router.jsx        # Root layout with Outlet
│   ├── components/
│   │   ├── TeacherDashboard.jsx
│   │   └── StudentDashboard.jsx
│   ├── assets/               # Static assets (images, icons)
│   ├── App.css               # Component-specific styles
│   └── index.css             # Global styles
├── public/                   # Public static files
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint configuration
└── package.json
```

### Frontend Conventions

- ES Modules (`import`/`export`)
- React Router DOM for navigation with nested routes
- Component-based architecture
- Tailwind CSS for styling (utility-first approach)
- LocalStorage for client-side state persistence (user role, names)
- Role-based routing with navigation guards
- Dashboard components use tab-based navigation

### Routing Pattern

- `/` - Landing page (role selection)
- `/teacher-dashboard` - Teacher portal
- `/student-dashboard` - Student portal
- Root layout (`RootLayout`) wraps all routes with `<Outlet />`

### State Management

- React hooks (`useState`, `useEffect`) for local state
- LocalStorage for persistence:
  - `userRole`: "teacher" or "student"
  - `teacherName`: Teacher's name
  - `studentName`: Student's name
- Navigation guards check role before rendering dashboards

### Component Patterns

- Functional components with hooks
- Role-based access control via `useEffect` + `navigate`
- Logout functionality clears localStorage and redirects to home
- Tab-based navigation within dashboards
- Placeholder sections for features under development
