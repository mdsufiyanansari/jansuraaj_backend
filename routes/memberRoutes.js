import express from "express";

import upload from "../middleware/upload.js";
import authFirebase from "../middleware/authFirebase.js";

import {
  createMember,
  updateProfile,
  updateLocation,
  connectFirebaseUser,
  getMember,
  getMyProfile,
} from "../controllers/memberController.js";

const router = express.Router();

// Step 1
router.post("/", upload.single("photo"), createMember);

// Step 2
router.put("/:id/profile", updateProfile);

// Step 3
router.put("/:id/location", updateLocation);

// Firebase login ke baad
router.put("/:id/firebase", authFirebase, connectFirebaseUser);

// Get my profile - MUST come before /:id
router.get("/me", authFirebase, getMyProfile);

// Get member by ID
router.get("/:id", getMember);

export default router;
