import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import memberRoutes from "./routes/memberRoutes.js";
import authRoutes from "./routes/authRoutes.js";


const app = express();

// Database
connectDB();

// Middleware
const allowedOrigins = process.env.FRONTEND_URLS.split(",");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());


// Routes
app.use("/api/members", memberRoutes);
app.use("/api/auth", authRoutes);

// health route
app.get("/health", (req, res) => {
    // console.log("Health check request received:", new Date().toISOString());
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Jansuraaj API is running",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Profile photo must be less than 5MB",
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Something went wrong",
  });
});




const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
