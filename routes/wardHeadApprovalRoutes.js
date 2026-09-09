import express from "express";

import {
  getAllWardHeads,
  getPendingWardHeads,
  getWardHeadById,
  approveWardHead,
  rejectWardHead,
} from "../controllers/wardHeadApprovalController.js";

import {
  protectSuperAdmin,
} from "../middleware/superAdminAuthMiddleware.js";

const router = express.Router();

// ==================================
// Get All Ward Heads
//
// GET
// /api/super-admin/ward-heads
//
// Optional Query:
// ?status=pending
// ?status=approved
// ?status=rejected
// ==================================

router.get(
  "/",
  protectSuperAdmin,
  getAllWardHeads
);

// ==================================
// Get Pending Ward Heads
//
// GET
// /api/super-admin/ward-heads/pending
//
// IMPORTANT:
// This route must come before "/:id"
// ==================================

router.get(
  "/pending",
  protectSuperAdmin,
  getPendingWardHeads
);

// ==================================
// Get Single Ward Head
//
// GET
// /api/super-admin/ward-heads/:id
// ==================================

router.get(
  "/:id",
  protectSuperAdmin,
  getWardHeadById
);

// ==================================
// Approve Ward Head
//
// PATCH
// /api/super-admin/ward-heads/:id/approve
// ==================================

router.patch(
  "/:id/approve",
  protectSuperAdmin,
  approveWardHead
);

// ==================================
// Reject Ward Head
//
// PATCH
// /api/super-admin/ward-heads/:id/reject
//
// Body:
// {
//   "rejectionReason": "Reason here"
// }
// ==================================

router.patch(
  "/:id/reject",
  protectSuperAdmin,
  rejectWardHead
);

export default router;