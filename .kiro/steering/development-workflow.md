---
inclusion: always
---

# Development Workflow

## Getting Started

### Backend Setup

```bash
cd backend
npm install
# Configure .env file
node server.js  # or nodemon server.js for auto-reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Backend requires `.env` file with:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - CORS origin (default: http://localhost:5173)
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `NODE_ENV` - Environment mode (development/production)

## Development Servers

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **Health Check**: http://localhost:5000/api/health

## Testing Credentials

Mock users in `backend/routes/auth.js`:

- Teacher: `teacher@eduhelper.com` / `password`
- Student: `student@eduhelper.com` / `password`

## Common Tasks

### Adding a New Route

1. Create route handler in appropriate file under `backend/routes/`
2. Add JSDoc comment with route info
3. Implement validation and error handling
4. Export router with `module.exports = router`
5. Register route in `backend/server.js`

### Adding a New Component

1. Create component file in `frontend/src/components/`
2. Use functional component with hooks
3. Add route in `frontend/src/main.jsx` if needed
4. Import and use in parent component

### Updating Mock Data

- Backend: Modify arrays at top of route files
- Frontend: Update component state or add API calls

## Database Migration (TODO)

When ready to implement MongoDB:

1. Create models in `backend/models/` directory
2. Replace mock data arrays with database queries
3. Add proper error handling for database operations
4. Implement data validation with Mongoose schemas

## Known Issues

- No authentication middleware implemented yet
- Mock data resets on server restart
- No file upload functionality
- No real-time updates (consider Socket.io for future)
