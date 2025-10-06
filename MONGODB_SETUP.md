# MongoDB Setup Guide for Class Pilot

## Prerequisites

You need MongoDB installed on your system. Choose one of the following options:

### Option 1: Install MongoDB Locally

**Ubuntu/Debian:**

```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**macOS (using Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install from: https://www.mongodb.com/try/download/community

### Option 2: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `backend/.env` with your connection string

## Database Models Created

### 1. User Model

- name, email, password (hashed)
- role (teacher/student)
- avatar, timestamps

### 2. Class Model

- name, description
- teacher reference
- students array with enrollment dates
- schedule, room, capacity, color
- timestamps

### 3. Assignment Model

- title, description
- class and teacher references
- dueDate, maxPoints, status
- submissions array with scores and feedback
- timestamps

### 4. Timetable Model

- teacher reference
- schedule array (days and time slots)
- timestamps

## Setup Instructions

### Step 1: Ensure MongoDB is Running

**Check if MongoDB is running:**

```bash
# Linux/macOS
sudo systemctl status mongodb
# or
mongosh --eval "db.version()"
```

**Start MongoDB if not running:**

```bash
# Linux
sudo systemctl start mongodb

# macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

### Step 2: Configure Environment Variables

The `.env` file is already configured with:

```
MONGODB_URI=mongodb://localhost:27017/classpilot
```

If using MongoDB Atlas, update to:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classpilot
```

### Step 3: Seed the Database

Run the seed script to populate initial data:

```bash
cd backend
npm run seed
```

This will create:

- ✅ 2 teachers and 5 students
- ✅ 3 classes (Mathematics, Physics, Chemistry)
- ✅ 3 assignments with sample submissions
- ✅ 1 timetable for the main teacher

### Step 4: Start the Backend Server

```bash
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
🚀 Class Pilot Backend Server running on port 5000
```

## Default Login Credentials

After seeding, you can login with:

**Teacher:**

- Email: `teacher@classpilot.com`
- Password: `password`

**Student:**

- Email: `student@classpilot.com`
- Password: `password`

## Verify Database Connection

### Using MongoDB Shell (mongosh)

```bash
mongosh

# Switch to classpilot database
use classpilot

# Check collections
show collections

# Count documents
db.users.countDocuments()
db.classes.countDocuments()
db.assignments.countDocuments()
db.timetables.countDocuments()

# View a sample user
db.users.findOne()
```

### Using the API

```bash
# Health check
curl http://localhost:5000/api/health

# Get teacher dashboard (should return real data from MongoDB)
curl http://localhost:5000/api/teachers/dashboard
```

## Database Structure

```
classpilot/
├── users
│   ├── teacher@classpilot.com (Teacher)
│   ├── student@classpilot.com (Student)
│   └── ... (more students)
├── classes
│   ├── Mathematics 101
│   ├── Physics 201
│   └── Chemistry 301
├── assignments
│   ├── Algebra Basics
│   ├── Linear Equations
│   └── Motion and Forces
└── timetables
    └── Teacher's weekly schedule
```

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**

1. Check if MongoDB is running: `sudo systemctl status mongodb`
2. Start MongoDB: `sudo systemctl start mongodb`
3. Verify connection string in `.env`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::27017`

**Solution:**

```bash
# Find process using port 27017
sudo lsof -i :27017

# Kill the process
sudo kill -9 <PID>

# Restart MongoDB
sudo systemctl restart mongodb
```

### Seed Script Fails

**Error:** `ValidationError` or `Duplicate key error`

**Solution:**

```bash
# Drop the database and re-seed
mongosh
use classpilot
db.dropDatabase()
exit

# Run seed again
npm run seed
```

## Next Steps

Now that MongoDB is set up:

1. ✅ Update route handlers to use MongoDB models instead of mock data
2. ✅ Implement authentication middleware with JWT
3. ✅ Add data validation and error handling
4. ✅ Create API endpoints for CRUD operations
5. ✅ Test all endpoints with real database

## Useful MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Show all databases
show dbs

# Use classpilot database
use classpilot

# Show all collections
show collections

# Find all users
db.users.find().pretty()

# Find teachers only
db.users.find({ role: 'teacher' }).pretty()

# Find classes with student count
db.classes.aggregate([
  { $project: { name: 1, studentCount: { $size: '$students' } } }
])

# Delete all data (careful!)
db.users.deleteMany({})
db.classes.deleteMany({})
db.assignments.deleteMany({})
db.timetables.deleteMany({})

# Exit
exit
```

## MongoDB Compass (GUI Tool)

For a visual interface, download MongoDB Compass:
https://www.mongodb.com/products/compass

Connection string: `mongodb://localhost:27017/classpilot`
