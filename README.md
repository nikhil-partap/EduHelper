# Class Pilot 🎓

A comprehensive classroom management system for teachers and students. Manage classes, attendance, quizzes, assignments, study plans, grades, and more.

## Quick Start

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB Atlas account (free tier works)
- Google AI API key (for quiz generation)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd Class-Pilot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user (remember username & password)
4. Go to Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)
5. Go to Database → Connect → Drivers → Copy connection string

Your connection string looks like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### 3. Set Up Google AI (Gemini)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

### 4. Configure Environment Variables

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development

# MongoDB - paste your connection string
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/classpilot?retryWrites=true&w=majority

# JWT - use any random string (keep it secret)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Google AI - paste your API key
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: OpenAI fallback
OPENAI_API_KEY=your-openai-key-if-you-have-one
```

### 5. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**

```bash
cd Class-Pilot/backend
npm run dev
```

You should see:

```
✅ MongoDB Connected Successfully
🚀 Server is running on port 5000
```

**Terminal 2 - Frontend:**

```bash
cd Class-Pilot/frontend
npm run dev
```

You should see:

```
VITE ready in XXXms
➜ Local: http://localhost:5173/
```

### 6. Open the App

Go to [http://localhost:5173](http://localhost:5173) in your browser.

---

## First Time Setup

### Create a Teacher Account

1. Click "Register"
2. Fill in:
   - Name: Your name
   - Email: your@email.com
   - Password: (min 4 characters)
   - Role: **Teacher**
   - School Name: Your school
3. Click Register

### Create Your First Class

1. After login, go to "My Classes"
2. Click "Create Class"
3. Fill in:
   - Class Name: e.g., "10th Grade"
   - Subject: e.g., "Mathematics"
   - Board: e.g., "CBSE"
4. Click Create
5. **Copy the Class Code** (e.g., `MATH-A3B2C1`)

### Add a Student

1. Open a new browser (or incognito window)
2. Go to [http://localhost:5173](http://localhost:5173)
3. Click "Register"
4. Fill in:
   - Name: Student name
   - Email: student@email.com
   - Password: (min 4 characters)
   - Role: **Student**
   - Roll Number: e.g., "101"
5. Click Register
6. Go to "My Classes" → "Join Class"
7. Enter the class code from step 5
8. Click Join

---

## Features Overview

### For Teachers

| Feature            | How to Access                    |
| ------------------ | -------------------------------- |
| Create Classes     | My Classes → Create Class        |
| Mark Attendance    | Attendance → Select Class → Mark |
| Generate AI Quiz   | Quizzes → Generate Quiz          |
| Create Assignments | Assignments → Create             |
| Study Planner      | Study Planner → Generate Plan    |
| View Grades        | Grades → Select Class            |
| Schedule Meetings  | Meetings → Create Meeting        |
| Export Reports     | Each page has Export button      |

### For Students

| Feature            | How to Access           |
| ------------------ | ----------------------- |
| Join Classes       | My Classes → Join Class |
| View Attendance    | My Attendance           |
| Take Quizzes       | Quizzes → Take Quiz     |
| Submit Assignments | Assignments → Submit    |
| View Grades        | Grades                  |
| View Portfolio     | Portfolio               |
| View Timetable     | Timetable               |

---

## Project Structure

```
Class-Pilot/
├── backend/           # Express.js API server
│   ├── controllers/   # Business logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth middleware
│   ├── utils/         # AI service, helpers
│   ├── server.js      # Entry point
│   └── .env           # Environment variables
│
├── frontend/          # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   └── App.jsx      # Routes
│   └── package.json
│
├── README.md          # This file
└── indepthReadMe.md   # Technical documentation
```

---

## Common Issues

### "MongoDB Connection Error"

- Check your `MONGO_URI` in `.env`
- Make sure you replaced `<password>` with your actual password
- Check if your IP is whitelisted in MongoDB Atlas

### "CORS Error"

- Make sure backend is running on port 5000
- Make sure frontend is running on port 5173
- Check `server.js` CORS configuration

### "AI Quiz Generation Failed"

- Check your `GEMINI_API_KEY` in `.env`
- Make sure the key is valid (test at Google AI Studio)
- Check if you have API quota remaining

### "Cannot find module"

```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

---

## Scripts

### Backend

```bash
npm run dev    # Start with auto-reload (development)
npm start      # Start without auto-reload (production)
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT
- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **AI:** Google Gemini API

---

## Need Help?

- Check `indepthReadMe.md` for detailed technical documentation
- All API endpoints are documented in the technical readme
- Each file's purpose is explained in the file reference section

---

## License

MIT License - Educational Use

Built as a CS50x Final Project
