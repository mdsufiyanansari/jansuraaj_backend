import express from "express";

import {
  sendOtp,
  verifyOtp,
  loginWithOtp,
} from "../controllers/firebaseAuthController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/login", loginWithOtp);

export default router;
