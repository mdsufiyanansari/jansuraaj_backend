import express from "express";

import {
  getUserCount,
  getAllUsers,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users/count", getUserCount);

router.get("/users", getAllUsers);

export default router;