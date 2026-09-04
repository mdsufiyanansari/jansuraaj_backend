import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import memberRoutes from "./routes/memberRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import problemRouter from "./routes/problemRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import wardHeadAuthRoutes from "./routes/wardHeadAuthRoutes.js"

import wardHeadApprovalRoutes from "./routes/wardHeadApprovalRoutes.js"

import wardHeadRoutes from "./routes/wardHeadRoutes.js";

const app = express();

// ==========================================
// DATABASE
// ==========================================
connectDB();

// ==========================================
// CORS
// ==========================================
const allowedOrigins = (process.env.FRONTEND_URLS || "")

  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================
app.use(
  express.json({
    limit: "1mb",
  })
);

// ==========================================
// COOKIE PARSER
// ==========================================
app.use(cookieParser());

// ==========================================
// ROUTES
// ==========================================
app.use("/api/auth", authRoutes);

app.use("/api/members", memberRoutes);

app.use("/api/problems", problemRouter);

app.use("/api/support", supportRoutes);

//======================WARD HEAD ROUTES=========//
app.use(
  "/api/ward-head/auth",
  wardHeadAuthRoutes
);

app.use(
  "/api/ward-head",
  wardHeadRoutes
);

//======SUPER_ADMIN_APPROVAL_ROUTES==========//

app.use(
  "/api/super-admin/ward-heads",
  wardHeadApprovalRoutes
);

//====================admin-routes=============//
app.use("/api/admin", adminRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ROOT
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀🎉Jansuraaj API is running🚀🎉",
  });
});

// ==========================================
// 404 ROUTE
// ==========================================
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Profile photo must be less than 5MB",
    });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀Server running on port ${PORT}`);
});
