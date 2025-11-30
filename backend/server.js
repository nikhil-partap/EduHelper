// /backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js"; // Note the .js extension for ESM
import authRoutes from "./routes/auth.js";
import classRoutes from "./routes/class.js";
import attendanceRoutes from "./routes/attendance.js";
import quizRoutes from "./routes/quiz.js";
import studyPlannerRoutes from "./routes/studyPlanner.js";

// Load environment variables
dotenv.config();

// Initialize Database Connection
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/, // Allow local network IPs
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "EduHelper API Server is running!",
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/class", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/studyplanner", studyPlannerRoutes);

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
  console.log(`🚀 EduHelper Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
});

export default app;
