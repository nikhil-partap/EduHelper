# Class Pilot Steering Rules - Complete Guide

## Overview

This directory contains comprehensive steering rules for the Class Pilot project. These rules provide detailed guidance for AI assistants and developers working on the codebase, ensuring consistent, high-quality development practices across the entire full-stack application.

## 📋 Complete Steering Rules Index

### 1. **[product.md](./product.md)** - Product Definition

- Core product vision and features
- Target users (teachers and students)
- System architecture overview
- Key capabilities and goals

### 2. **[tech.md](./tech.md)** - Technology Stack

- Complete technology stack documentation
- Frontend: React 19 + Vite + Tailwind CSS
- Backend: Node.js + Express.js + MongoDB
- Development commands and scripts
- Environment configuration

### 3. **[structure.md](./structure.md)** - Project Organization

- File and folder structure conventions
- Import/export patterns
- API endpoint organization
- Code organization principles

### 4. **[frontend-conventions.md](./frontend-conventions.md)** - Frontend Guidelines

- React component patterns and architecture
- Tailwind CSS styling conventions
- State management with Context API
- Role-based UI development patterns
- Component testing strategies

### 5. **[backend-conventions.md](./backend-conventions.md)** - Backend Guidelines

- RESTful API design principles
- Database schema patterns with Mongoose
- Authentication and authorization patterns
- Security best practices
- Performance optimization techniques

### 6. **[development-workflow.md](./development-workflow.md)** - Development Process

- Git workflow and commit conventions
- Code quality standards and review process
- Testing strategies and coverage goals
- Deployment guidelines and CI/CD
- Performance monitoring and troubleshooting

### 7. **[feature-development.md](./feature-development.md)** - Feature Implementation

- Class Pilot specific development patterns
- Role-based feature development (teacher vs student)
- API design patterns and response formats
- State management patterns
- Performance optimization strategies

### 8. **[testing-conventions.md](./testing-conventions.md)** - Testing Standards

- Comprehensive testing philosophy
- Backend testing patterns (unit, integration, API)
- Frontend testing patterns (components, hooks, pages)
- Test data management and utilities
- Continuous integration setup

### 9. **[context-and-hooks.md](./context-and-hooks.md)** - State Management

- Context architecture patterns
- Custom hooks design and implementation
- Authentication context patterns
- Performance optimization with memoization
- Testing context and hooks

### 10. **[page-and-routing.md](./page-and-routing.md)** - Page Organization

- Page-based architecture philosophy
- Role-based page variants (teacher vs student)
- Routing configuration and protected routes
- Coming Soon pattern for future features
- Page testing strategies

### 11. **[project-overview.md](./project-overview.md)** - Master Guide

- Complete project summary and quick reference
- Development phase roadmap
- Key principles and best practices
- Getting started guide for new developers

## 🎯 Key Principles Across All Rules

### 1. **Role-Based Everything**

Every feature, component, and page considers both teacher and student perspectives:

```javascript
const FeatureComponent = () => {
  const {user} = useAuth();

  if (user?.role === "teacher") {
    return <TeacherView />;
  }

  return <StudentView />;
};
```

### 2. **Security First**

- Input validation on both frontend and backend
- JWT-based authentication with proper token management
- Role-based access control for all features
- Secure password hashing and storage

### 3. **Performance Optimized**

- Lazy loading for components and pages
- Efficient database queries with proper indexing
- Memoization to prevent unnecessary re-renders
- Code splitting and bundle optimization

### 4. **Testing Comprehensive**

- 80%+ code coverage target
- Unit, integration, and end-to-end testing
- Role-based testing scenarios
- Proper mocking and test isolation

### 5. **User Experience Focused**

- Mobile-first responsive design
- Loading states and error handling
- Accessibility compliance (WCAG AA)
- Consistent UI patterns and interactions

## 🚀 Quick Start for AI Assistants

When working on Class Pilot, always:

1. **Check user role** - Implement features for both teachers and students
2. **Follow naming conventions** - PascalCase for components, camelCase for functions
3. **Use established patterns** - Leverage existing hooks, components, and utilities
4. **Handle errors gracefully** - Show user-friendly messages and loading states
5. **Test thoroughly** - Write tests for new functionality
6. **Document changes** - Update relevant documentation

## 📁 File Organization Quick Reference

```
Class Pilot/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, validation, etc.
│   ├── tests/          # Test files
│   └── server.js       # Main entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level components
│   │   ├── context/    # State management
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API calls
│   │   └── utils/      # Helper functions
│   └── public/         # Static assets
└── .kiro/
    └── steering/       # This directory
```

## 🎨 Code Style Quick Reference

### Component Structure

```javascript
import {useState, useEffect} from "react";
import {useAuth} from "../hooks/useAuth";

const ComponentName = ({prop1, prop2}) => {
  const [state, setState] = useState(initialValue);
  const {user} = useAuth();

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <div className="tailwind-classes">{/* JSX content */}</div>;
};

export default ComponentName;
```

### API Response Format

```javascript
// Success
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}

// Error
{
  "success": false,
  "error": "ErrorType",
  "message": "User-friendly message"
}
```

### Database Schema Pattern

```javascript
const schema = new mongoose.Schema(
  {
    // Required fields first
    name: {type: String, required: true, trim: true},

    // References
    teacher: {type: ObjectId, ref: "User", required: true},

    // Enums with defaults
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {timestamps: true}
);
```

## 🔄 Development Workflow

1. **Read relevant steering rules** for the feature area
2. **Create feature branch** following naming conventions
3. **Implement with role-based considerations**
4. **Write comprehensive tests**
5. **Follow code review checklist**
6. **Update documentation as needed**

## 📚 Additional Resources

- **Setup Guide**: See `SETUP.md` for installation instructions
- **Frontend Updates**: See `FRONTEND_UPDATES.md` for recent improvements
- **API Testing**: Use `backend/test-api.js` for manual testing
- **Quick Testing**: Use `backend/quick-test.js` for development

## 🤝 Contributing

These steering rules are living documents that evolve with the project. When adding new patterns or conventions:

1. Update the relevant steering rule document
2. Add examples and code snippets
3. Update this README if adding new rules
4. Ensure consistency across all documents

## 📞 Support

For questions about these steering rules or Class Pilot development:

- Review the specific steering rule for your area of work
- Check existing code patterns in the repository
- Refer to the project overview for high-level guidance
- Use the established testing patterns to validate your implementation

---

**Remember**: These steering rules ensure that Class Pilot remains maintainable, scalable, and provides an excellent experience for both teachers and students. Always consider the educational context and user needs when implementing features.
