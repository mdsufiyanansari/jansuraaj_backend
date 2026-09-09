import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import SuperAdmin from "../models/superAdminModel.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!password) {
      throw new Error("SUPER_ADMIN_PASSWORD is not configured in .env");
    }

    // ======================================
    // FIND SUPER ADMIN
    // ======================================

    let superAdmin = await SuperAdmin.findOne({
      role: "super_admin",
    });

    // ======================================
    // IF ALREADY EXISTS
    // ======================================

    if (superAdmin) {
      const hashedPassword = await bcrypt.hash(password, 12);

      superAdmin.password = hashedPassword;
      superAdmin.isActive = true;

      await superAdmin.save();

      console.log("Super Admin already exists.");

      console.log("Password updated successfully.");

      process.exit(0);
    }

    // ======================================
    // CREATE NEW SUPER ADMIN
    // ======================================

    const hashedPassword = await bcrypt.hash(password, 12);

    await SuperAdmin.create({
      name: "Super Admin",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("Super Admin created successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Create Super Admin error:", error);

    process.exit(1);
  }
};

createSuperAdmin();
