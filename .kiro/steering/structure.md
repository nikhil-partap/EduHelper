# Project Structure

## Root Level Organization
```
/
├── backend/          # Express.js API server
├── frontend/         # React application
├── .kiro/           # Kiro IDE configuration
├── .vscode/         # VS Code settings
└── .git/            # Git repository
```

## Backend Structure (`/backend/`)
```
backend/
├── config/          # Configuration files (database, etc.)
├── controllers/     # Route handlers and business logic
├── middleware/      # Custom middleware functions
├── models/          # Mongoose schemas and models
├── routes/          # API route definitions
├── node_modules/    # Dependencies
├── .env            # Environment variables (not in git)
├── .gitignore      # Git ignore rules
├── package.json    # Dependencies and scripts
├── package-lock.json
└── server.js       # Main application entry point
```

## Frontend Structure (`/frontend/`)
```
frontend/
├── src/            # Source code
├── public/         # Static assets
├── node_modules/   # Dependencies
├── .gitignore     # Git ignore rules
├── eslint.config.js # ESLint configuration
├── index.html     # HTML template
├── package.json   # Dependencies and scripts
├── package-lock.json
├── README.md      # Frontend documentation
└── vite.config.js # Vite build configuration
```

## Code Organization Conventions

### Backend
- **server.js**: Main entry point with Express app setup, middleware, and server initialization
- **config/**: Database connections and other configuration modules
- **routes/**: API endpoint definitions (future: auth.js, class.js)
- **controllers/**: Business logic separated from route definitions
- **models/**: Mongoose schemas for MongoDB collections
- **middleware/**: Custom middleware (auth, validation, etc.)

### Frontend
- **src/**: All React components and application code
- **public/**: Static assets served directly
- **Components should use .jsx extension**
- **CSS files co-located with components**

## File Naming Conventions
- **Backend**: Use kebab-case for files (e.g., `user-controller.js`)
- **Frontend**: Use PascalCase for React components (e.g., `UserProfile.jsx`)
- **Config files**: Use lowercase with dots (e.g., `vite.config.js`)
- **Environment files**: Use uppercase (e.g., `.env`)

## Import/Export Patterns
- **ES Modules**: Both frontend and backend use ES module syntax
- **File extensions**: Always include `.js` extension in backend imports
- **Default exports**: Preferred for single-purpose modules
- **Named exports**: Use for utilities and multiple exports

## API Structure
- **Base URL**: `http://localhost:5000`
- **Health check**: `/health`
- **Future API routes**: `/api/auth`, `/api/class`
- **Error handling**: Centralized error middleware with proper HTTP status codes