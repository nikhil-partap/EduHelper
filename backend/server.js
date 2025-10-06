const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/students", require("./routes/students"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/assignments", require("./routes/assignments"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "EduHelper Backend API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).json({message: "Route not found"});
});

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ MongoDB connected successfully");
    } else {
      console.log("⚠️  MongoDB URI not provided, running without database");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Don't exit process, allow server to run without DB for development
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 EduHelper Backend Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();

module.exports = app;
