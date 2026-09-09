import express from "express";

import {
  getUserCount,
  getAllUsers,
} from "../controllers/adminController.js";

import {
  getAllReportedProblems,
  getProblemById,
} from "../controllers/adminProblemController.js";

import {
  protectSuperAdmin,
} from "../middleware/superAdminAuthMiddleware.js";

const router = express.Router();

// ==========================================
// USERS
// ==========================================

router.get(
  "/users/count",
  protectSuperAdmin,
  getUserCount
);

router.get(
  "/users",
  protectSuperAdmin,
  getAllUsers
);

// ==========================================
// REPORTED PROBLEMS
// ==========================================

// Get all problems
router.get(
  "/problems",
  protectSuperAdmin,
  getAllReportedProblems
);

// Get single problem details
router.get(
  "/problems/:id",
  protectSuperAdmin,
  getProblemById
);

export default router;