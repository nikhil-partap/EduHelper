// /backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js"; // Note the .js extension for ESM

// Load environment variables
dotenv.config();

// Initialize Database Connection
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// --- API Routes ---

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Class Pilot API Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uptime: process.uptime(),
  });
});

// Future API Routes
// import authRoutes from './routes/auth.js';
// import classRoutes from './routes/class.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/class', classRoutes);

// --- Error Handling ---

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({
    error: "Route Not Found",
    path: req.originalUrl,
    message: "The requested API endpoint does not exist.",
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
  });
});

// --- Server & Process Management ---

// Graceful shutdown logic
const shutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log("✅ HTTP server closed.");
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Class Pilot Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
});

export default app;
