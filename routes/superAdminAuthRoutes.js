import express from "express";

import {
  superAdminLogin,
  superAdminLogout,
  getCurrentSuperAdmin,
} from "../controllers/superAdminAuthController.js";

import { protectSuperAdmin } from "../middleware/superAdminAuthMiddleware.js";

const router = express.Router();

// LOGIN
router.post("/login", superAdminLogin);

// LOGOUT
router.post("/logout", superAdminLogout);

// CURRENT USER
router.get("/me", protectSuperAdmin, getCurrentSuperAdmin);

export default router;
