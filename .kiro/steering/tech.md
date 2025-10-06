---
inclusion: always
---

# Technology Stack

## Frontend

- **Framework**: React 19.2.0
- **Build Tool**: Vite (using rolldown-vite variant)
- **Styling**: Tailwind CSS 4.1.14
- **Routing**: React Router DOM 7.9.3
- **Module Type**: ES Modules

### Frontend Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Backend

- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: MongoDB with Mongoose 8.19.0
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.2
- **Module Type**: CommonJS
- **Environment**: dotenv for configuration

### Backend Commands

```bash
# Start server (manual)
node server.js

# Development with auto-reload
nodemon server.js
```

## Code Style & Linting

- ESLint configured with React hooks and React refresh plugins
- Unused variables allowed if they match pattern `^[A-Z_]` (constants)
- ECMAScript 2020+ features enabled

## Environment Configuration

Backend uses environment variables:

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `FRONTEND_URL`: CORS origin (default: http://localhost:5173)
- `NODE_ENV`: Environment mode (development/production)
