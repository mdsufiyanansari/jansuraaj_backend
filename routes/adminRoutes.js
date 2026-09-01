import express from "express";

import { getUserCount, getAllUsers } from "../controllers/adminController.js";

import { getAllReportedProblems } from "../controllers/adminProblemController.js";

const router = express.Router();

// ==========================================
// USERS
// ==========================================

router.get("/users/count", getUserCount);

router.get("/users", getAllUsers);

// ==========================================
// REPORTED PROBLEMS
// ==========================================

router.get("/problems", getAllReportedProblems);

export default router;
