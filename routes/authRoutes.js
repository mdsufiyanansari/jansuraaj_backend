import express from "express";

import {
  sendOtp,
  verifyOtp,
  loginWithOtp,
  logout,
  getCurrentUser,
} from "../controllers/firebaseAuthController.js";

import authFirebase from "../middleware/authFirebase.js";

const router = express.Router();

// ==========================================
// SEND OTP
// POST /api/auth/send-otp
// ==========================================
router.post("/send-otp", sendOtp);

// ==========================================
// VERIFY OTP
// POST /api/auth/verify-otp
// ==========================================
router.post("/verify-otp", verifyOtp);

// ==========================================
// LOGIN WITH OTP
// POST /api/auth/login
// ==========================================
router.post("/login", loginWithOtp);

// ==========================================
// CURRENT LOGGED-IN USER
// GET /api/auth/me
// ==========================================
router.get("/me", authFirebase, getCurrentUser);

// ==========================================
// LOGOUT
// POST /api/auth/logout
// ==========================================
router.post("/logout", authFirebase, logout);

export default router;
