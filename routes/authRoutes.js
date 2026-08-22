import express from "express";

import {
  // ==========================================
  // OLD OTP CONTROLLERS - DISABLED
  // ==========================================
  // sendOtp,
  // verifyOtp,
  // loginWithOtp,

  // ==========================================
  // MOBILE NUMBER LOGIN
  // ==========================================
  loginWithPhone,

  logout,
  getCurrentUser,
} from "../controllers/firebaseAuthController.js";

import authFirebase from "../middleware/authFirebase.js";

const router = express.Router();

// ==========================================
// SEND OTP - DISABLED
// POST /api/auth/send-otp
// ==========================================

/*
router.post(
  "/send-otp",
  sendOtp
);
*/

// ==========================================
// VERIFY OTP - DISABLED
// POST /api/auth/verify-otp
// ==========================================

/*
router.post(
  "/verify-otp",
  verifyOtp
);
*/

// ==========================================
// LOGIN WITH MOBILE NUMBER
// POST /api/auth/login
// ==========================================

router.post(
  "/login",
  loginWithPhone
);

// ==========================================
// CURRENT LOGGED-IN USER
// GET /api/auth/me
// ==========================================

router.get(
  "/me",
  authFirebase,
  getCurrentUser
);

// ==========================================
// LOGOUT
// POST /api/auth/logout
// ==========================================

router.post(
  "/logout",
  authFirebase,
  logout
);

export default router;