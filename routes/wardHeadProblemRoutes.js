import express from "express";

import { protectWardHead } from "../middleware/wardHeadAuthMiddleware.js";

import { updateProblemStatusByWardHead } from "../controllers/wardHeadProblemController.js";

const router = express.Router();

// ==========================================
// UPDATE PROBLEM STATUS
//
// PATCH /api/ward-head/problems/:id/status
// ==========================================

router.patch("/:id/status", protectWardHead, updateProblemStatusByWardHead);

export default router;
