# EduHelper Setup Guide

## Backend & Frontend Connection

### Backend Setup (Already Running)

The backend is running on `http://localhost:5000`

**Available API Endpoints:**

- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/teachers/dashboard` - Teacher dashboard data
- `GET /api/teachers/timetable` - Get teacher timetable
- `PUT /api/teachers/timetable` - Update teacher timetable
- `GET /api/teachers/classes` - Get teacher's classes
- `GET /api/students/dashboard` - Student dashboard data
- `GET /api/students/courses` - Get student courses
- `GET /api/students/assignments` - Get student assignments
- `GET /api/classes` - Get all classes
- `GET /api/assignments` - Get all assignments

### Frontend Setup

The frontend connects to the backend via the API utility file at `frontend/src/utils/api.js`

**Environment Configuration:**

- Frontend: `frontend/.env` - Sets `VITE_API_URL=http://localhost:5000/api`
- Backend: `backend/.env` - Sets `FRONTEND_URL=http://localhost:5173`

### Running the Application

1. **Backend** (already running):

   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### TeacherDashboard Features

The new TeacherDashboard includes:

✅ **Teacher Information Display**

- Name and email of the teacher
- Loaded from localStorage and backend

✅ **Editable Timetable**

- Weekly schedule grid (Monday-Friday)
- 4 time slots per day (9 AM, 11 AM, 1 PM, 3 PM)
- Edit mode to modify schedule
- Saves to backend when edited

✅ **Study Planner Access**

- Button to access study planner (to be implemented)

✅ **Class Management**

- Display of teacher's classes (Class 2, Class 3, Class 4)
- Click to view class details (to be implemented)

✅ **Styling**

- Matches the wireframe design provided
- Gray borders and clean layout
- Sidebar for future navigation

### Testing the Connection

Test the backend API:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/teachers/dashboard
curl http://localhost:5000/api/teachers/timetable
```

### Mock Login Credentials

For testing authentication:

- **Teacher**: `teacher@eduhelper.com` / `password`
- **Student**: `student@eduhelper.com` / `password`

### Next Steps

1. Implement authentication flow with login page
2. Add study planner functionality
3. Create class details pages
4. Add assignment creation and management
5. Implement real-time updates
6. Connect to MongoDB database
