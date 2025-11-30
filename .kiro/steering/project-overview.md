# Class Pilot - Project Overview & Guidelines

## Project Summary

Class Pilot is a comprehensive classroom management system built with modern web technologies. It serves both teachers and students with role-based features for educational workflows.

### Technology Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + MongoDB
- **Authentication**: JWT-based with bcryptjs
- **Deployment**: Ready for Vercel (frontend) + Railway/Render (backend)

## Steering Rules Overview

This project includes comprehensive steering rules across multiple domains:

### 1. **product.md** - Product Definition

- Core features and architecture overview
- Key stakeholders (teachers and students)
- System capabilities and goals

### 2. **tech.md** - Technology Stack

- Complete dependency list for frontend and backend
- Development commands and environment setup
- Build and deployment configurations

### 3. **structure.md** - Project Organization

- File and folder structure conventions
- Import/export patterns
- API endpoint organization

### 4. **frontend-conventions.md** - Frontend Guidelines

- React component patterns and organization
- Tailwind CSS styling conventions
- State management with Context API
- Role-based UI development

### 5. **backend-conventions.md** - Backend Guidelines

- RESTful API design principles
- Database schema patterns with Mongoose
- Authentication and authorization patterns
- Security best practices

### 6. **development-workflow.md** - Development Process

- Git workflow and commit conventions
- Testing strategies and patterns
- Deployment guidelines
- Performance monitoring

### 7. **feature-development.md** - Feature Implementation

- Class Pilot specific development patterns
- Role-based feature development
- API design patterns
- Performance optimization techniques

## Quick Reference

### Role-Based Development Pattern

```javascript
const FeatureComponent = () => {
  const {user} = useAuth();

  if (user?.role === "teacher") {
    return <TeacherView />;
  }

  return <StudentView />;
};
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

### Component Structure

```javascript
import {useState, useEffect} from "react";
import {useAuth} from "../context/AuthContext";

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

## Core Features to Implement

### Phase 1 - Foundation ✅

- [x] User authentication (login/register)
- [x] Role-based dashboard
- [x] Professional UI components
- [x] Responsive design

### Phase 2 - Class Management

- [ ] Create/edit/delete classes (teachers)
- [ ] Browse/join classes (students)
- [ ] Class schedules and capacity management
- [ ] Student enrollment system

### Phase 3 - Assignment System

- [ ] Create assignments with due dates (teachers)
- [ ] Submit assignments (students)
- [ ] Grading and feedback system
- [ ] Assignment tracking and notifications

### Phase 4 - Progress Tracking

- [ ] Performance analytics (teachers)
- [ ] Grade tracking (students)
- [ ] Progress reports and insights
- [ ] Parent/guardian access (future)

### Phase 5 - Communication

- [ ] Class announcements
- [ ] Direct messaging
- [ ] Discussion forums
- [ ] Notification system

## Development Commands

### Backend Development

```bash
cd backend
npm run dev          # Start development server
npm test            # Run tests
npm run lint        # Check code quality
```

### Frontend Development

```bash
cd frontend
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run test        # Run component tests
npm run lint        # Check code quality
```

### Full Stack Testing

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - API Testing
cd backend && node test-api.js
```

## Key Principles

### 1. **Role-Based Everything**

Always consider both teacher and student perspectives in every feature.

### 2. **Security First**

- Validate all inputs
- Use proper authentication
- Implement role-based access control
- Sanitize data before database operations

### 3. **User Experience**

- Mobile-first responsive design
- Loading states and error handling
- Consistent UI patterns
- Accessibility compliance

### 4. **Performance**

- Optimize database queries
- Implement proper caching
- Use lazy loading for components
- Monitor bundle sizes

### 5. **Maintainability**

- Follow consistent naming conventions
- Write comprehensive tests
- Document complex logic
- Use TypeScript for type safety (future)

## Getting Started for New Developers

1. **Read the steering rules** in order:

   - Start with `product.md` and `tech.md`
   - Review `structure.md` for project organization
   - Study `frontend-conventions.md` and `backend-conventions.md`
   - Understand `development-workflow.md`
   - Reference `feature-development.md` when building features

2. **Set up development environment**:

   - Install Node.js 18+
   - Clone repository and install dependencies
   - Set up MongoDB (local or Atlas)
   - Configure environment variables
   - Run both frontend and backend servers

3. **Start with small tasks**:

   - Fix bugs or improve existing components
   - Add tests for existing functionality
   - Implement small UI improvements
   - Work on documentation

4. **Follow the workflow**:
   - Create feature branches
   - Write tests for new functionality
   - Follow code review process
   - Update documentation as needed

## Support and Resources

- **Setup Guide**: See `SETUP.md` for detailed installation instructions
- **Frontend Updates**: See `FRONTEND_UPDATES.md` for recent UI improvements
- **API Testing**: Use `backend/test-api.js` for API validation
- **Component Library**: Reference existing components in `frontend/src/components/`

This project is designed to be scalable, maintainable, and educational. The steering rules provide comprehensive guidance for consistent development practices across the entire stack.
