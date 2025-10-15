# Technology Stack

## Backend
- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs for password hashing
- **Environment**: dotenv for configuration management
- **CORS**: Enabled for cross-origin requests

### Backend Dependencies
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

## Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite with Rolldown (custom vite distribution)
- **Styling**: Tailwind CSS 4.x
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7.x
- **Linting**: ESLint with React-specific rules

### Frontend Dependencies
- `react` & `react-dom` - Core React libraries
- `react-router-dom` - Client-side routing
- `tailwindcss` - Utility-first CSS framework
- `axios` - HTTP client for API calls
- `vite` - Build tool and dev server

## Common Commands

### Backend Development
```bash
cd backend
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm install         # Install dependencies
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm install         # Install dependencies
```

## Environment Configuration
- Backend uses `.env` file for configuration (PORT, MONGO_URI, JWT_SECRET)
- Frontend uses Vite's environment variable system
- Both projects use ES modules syntax