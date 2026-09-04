import express from "express";

import {
  createWardHead,
  wardHeadLogin,
  wardHeadLogout,
  getWardHeadMe,
} from "../controllers/wardHeadAuthController.js";

import {
  protectWardHead,
} from "../middleware/wardHeadAuthMiddleware.js";

const router = express.Router();

// ==================================
// Create Ward Head
// POST /api/ward-head/auth/create
// ==================================

router.post(
  "/create",
  createWardHead
);

// ==================================
// Ward Head Login
// POST /api/ward-head/auth/login
// ==================================

router.post(
  "/login",
  wardHeadLogin
);

// ==================================
// Ward Head Logout
// POST /api/ward-head/auth/logout
// ==================================

router.post(
  "/logout",
  wardHeadLogout
);

// ==================================
// Get Logged In Ward Head
// GET /api/ward-head/auth/me
// ==================================

router.get(
  "/me",
  protectWardHead,
  getWardHeadMe
);

export default router;