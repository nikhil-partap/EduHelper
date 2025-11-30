# Class Pilot - Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   - The `.env` file is already configured with MongoDB Atlas
   - Update `JWT_SECRET` for production use

4. **Start the backend server:**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

## 🧪 Testing the Connection

### Option 1: Use the Frontend

1. Open `http://localhost:5173`
2. Click "Test Backend Connection" on the login page
3. Should open the health endpoint in a new tab

### Option 2: Test API Directly

```bash
cd backend
node test-api.js
```

### Option 3: Manual API Testing

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "teacher",
    "schoolName": "Test School"
  }'
```

## 🎯 Features Ready

### Authentication System ✅

- User registration (Teacher/Student roles)
- User login with JWT tokens
- Protected routes with middleware
- Automatic token validation

### Frontend Components ✅

- Login/Register forms with validation
- Role-based dashboard
- Error handling and loading states
- Responsive design with Tailwind CSS

### Backend API ✅

- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication
- `/api/auth/me` - Get current user (protected)
- `/health` - Health check endpoint

## 🔧 Configuration Details

### CORS Setup

- Configured for `localhost:5173` (Vite) and `localhost:3000` (CRA)
- Credentials enabled for cookie support

### JWT Configuration

- 1-hour expiration time
- Includes user ID and role in payload
- Stored in localStorage on frontend

### Database Schema

- Users collection with role-based fields
- Password hashing with bcryptjs
- Unique email constraint

## 🚀 Next Steps

The foundation is complete! You can now:

1. **Add Class Management Features**

   - Create/join classes
   - Student enrollment
   - Class schedules

2. **Add Assignment System**

   - Create assignments
   - Submit assignments
   - Grade management

3. **Add Real-time Features**
   - Live class sessions
   - Chat functionality
   - Notifications

## 🐛 Troubleshooting

### Backend Issues

- **Port 5000 in use**: Change `PORT` in `.env`
- **MongoDB connection**: Check `MONGO_URI` in `.env`
- **CORS errors**: Verify frontend URL in CORS config

### Frontend Issues

- **API connection failed**: Ensure backend is running on port 5000
- **Build errors**: Run `npm install` to ensure all dependencies are installed
- **Styling issues**: Verify Tailwind CSS is properly configured
