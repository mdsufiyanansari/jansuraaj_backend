import express from "express";

import {
  getWardHeadDashboard,
} from "../controllers/wardHeadDashboardController.js";

import {
  protectWardHead,
} from "../middleware/wardHeadAuthMiddleware.js";


const router = express.Router();


// ==================================
// Ward Head Dashboard
// GET /api/ward-head/dashboard
// ==================================

router.get(
  "/dashboard",
  protectWardHead,
  getWardHeadDashboard
);


export default router;