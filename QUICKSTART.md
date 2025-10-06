# 🚀 Class Pilot - Quick Start Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas account)
- npm or yarn

## Installation & Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start MongoDB

**Linux:**

```bash
sudo systemctl start mongodb
sudo systemctl status mongodb
```

**macOS:**

```bash
brew services start mongodb-community
```

**Windows:**

```bash
net start MongoDB
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

Expected output:

```
✅ MongoDB connected successfully
🌱 Starting database seed...
✅ Created 7 users
✅ Created 3 classes
✅ Created 3 assignments
✅ Created timetable
🎉 Database seeded successfully!
```

### 4. Start the Backend Server

```bash
# In backend directory
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
🚀 Class Pilot Backend Server running on port 5000
📍 Health check: http://localhost:5000/api/health
```

### 5. Start the Frontend

```bash
# In frontend directory (new terminal)
npm run dev
```

You should see:

```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 6. Open the Application

Visit: **http://localhost:5173**

## Login Credentials

**Teacher Account:**

- Email: `teacher@classpilot.com`
- Password: `password`

**Student Account:**

- Email: `student@classpilot.com`
- Password: `password`

## Application Features

### Teacher Dashboard

- ✅ View and edit weekly timetable
- ✅ Manage classes (Mathematics, Physics, Chemistry)
- ✅ Access study planner
- ✅ View student information
- ✅ Create and grade assignments

### Student Dashboard

- ✅ View enrolled courses
- ✅ Check upcoming assignments
- ✅ View grades and feedback
- ✅ Access class schedule
- ✅ Submit assignments

## Project Structure

```
Class-Pilot/
├── backend/                 # Express.js API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── scripts/            # Database scripts
│   ├── server.js           # Server entry point
│   └── .env                # Environment variables
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # API utilities
│   │   ├── App.jsx        # Landing page
│   │   └── main.jsx       # App entry point
│   └── index.html
│
└── Documentation/
    ├── QUICKSTART.md       # This file
    ├── MONGODB_SETUP.md    # MongoDB guide
    └── INTEGRATION_COMPLETE.md
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Teacher

- `GET /api/teachers/dashboard` - Dashboard data
- `GET /api/teachers/timetable` - Get timetable
- `PUT /api/teachers/timetable` - Update timetable
- `GET /api/teachers/classes` - Get classes
- `GET /api/teachers/students` - Get students

### Student

- `GET /api/students/dashboard` - Dashboard data
- `GET /api/students/courses` - Get courses
- `GET /api/students/assignments` - Get assignments
- `GET /api/students/grades` - Get grades

### Classes

- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Assignments

- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/assignments/:id/grade` - Grade assignment

## Testing the API

```bash
# Health check
curl http://localhost:5000/api/health

# Get teacher dashboard
curl http://localhost:5000/api/teachers/dashboard

# Get all classes
curl http://localhost:5000/api/classes
```

## Troubleshooting

### MongoDB Connection Error

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**

```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Start MongoDB
sudo systemctl start mongodb
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**

```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

### Frontend Can't Connect to Backend

**Problem:** API requests failing

**Solution:**

1. Check backend is running on port 5000
2. Verify `frontend/.env` has correct API URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
3. Check CORS settings in `backend/server.js`

### Database Not Seeded

**Problem:** No data showing in application

**Solution:**

```bash
cd backend
npm run seed
```

## Development Workflow

### Making Changes

1. **Backend changes** - Server auto-restarts with nodemon
2. **Frontend changes** - Hot reload with Vite
3. **Database changes** - Re-run seed script

### Adding New Features

1. Create MongoDB model in `backend/models/`
2. Add routes in `backend/routes/`
3. Create React component in `frontend/src/components/`
4. Add API calls in `frontend/src/utils/api.js`

### Resetting Database

```bash
cd backend
npm run seed
```

This clears all data and creates fresh seed data.

## Next Steps

1. ✅ Explore the Teacher Dashboard
2. ✅ Try editing the timetable
3. ✅ View different classes
4. ✅ Check the Student Dashboard
5. ✅ Test API endpoints

## Support

For detailed documentation, see:

- `MONGODB_SETUP.md` - MongoDB configuration
- `INTEGRATION_COMPLETE.md` - Backend-Frontend integration
- `MONGODB_INTEGRATION.md` - Database models and schema

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express 5, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Development:** Nodemon, ESLint

---

**Happy Coding! 🎉**
