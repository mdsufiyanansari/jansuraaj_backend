import express from "express";

import authFirebase from "../middleware/authFirebase.js";

import {
  supportProblem,
  getSupportStatus,
} from "../controllers/supportController.js";

const router = express.Router();

// ==========================================
// CHECK SUPPORT STATUS
// ==========================================

router.get("/:id/status", authFirebase, getSupportStatus);

// ==========================================
// SUPPORT PROBLEM
// ==========================================

router.post("/:id", authFirebase, supportProblem);

export default router;
