import express from "express";

import upload from "../middleware/upload.js";

import {
  createMember,
  updateProfile,
  updateLocation,
  connectFirebaseUser,
  getMember,
} from "../controllers/memberController.js";

const router = express.Router();

// Step 1
router.post("/", upload.single("photo"), createMember);

// Step 2
router.put("/:id/profile", updateProfile);

// Step 3
router.put("/:id/location", updateLocation);

// Firebase login ke baad
router.put("/:id/firebase", connectFirebaseUser);

// Get member
router.get("/:id", getMember);

export default router;
