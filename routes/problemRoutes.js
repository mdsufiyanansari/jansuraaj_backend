import express from "express";
import authFirebase from "../middleware/authFirebase.js";

import {
  getMyAreaProblems,
  getProblemById,
  createProblem,
  reportExistingProblem,
} from "../controllers/problemController.js";

import problemUpload from "../middleware/problemUpload.js";

const router = express.Router();

// Existing problems
router.get("/my-area", authFirebase, getMyAreaProblems);

// Single problem
router.get("/:id", authFirebase, getProblemById);

// New problem
router.post("/", authFirebase, problemUpload.array("photos", 5), createProblem);

// Existing problem report
router.post("/:id/report", authFirebase, reportExistingProblem);

export default router;
