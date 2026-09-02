import express from "express";

import {
  getUserCount,
  getAllUsers,
} from "../controllers/adminController.js";

import {
  getAllReportedProblems,
  getProblemById,
} from "../controllers/adminProblemController.js";

const router = express.Router();

// ==========================================
// USERS
// ==========================================

router.get("/users/count", getUserCount);

router.get("/users", getAllUsers);

// ==========================================
// REPORTED PROBLEMS
// ==========================================

// Get all problems
router.get("/problems", getAllReportedProblems);

// Get single problem details
router.get("/problems/:id", getProblemById);

export default router;