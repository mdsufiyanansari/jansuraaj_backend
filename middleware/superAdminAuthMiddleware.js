import jwt from "jsonwebtoken";
import SuperAdmin from "../models/superAdminModel.js";

export const protectSuperAdmin = async (req, res, next) => {
  try {
    // ======================================
    // GET TOKEN FROM HTTP ONLY COOKIE
    // ======================================

    const token = req.cookies?.super_admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Super Admin login required",
      });
    }

    // ======================================
    // CHECK JWT SECRET
    // ======================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    // ======================================
    // VERIFY JWT
    // ======================================

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ======================================
    // VALIDATE TOKEN PAYLOAD
    // ======================================

    if (
      !decoded?.id ||
      decoded.type !== "super_admin" ||
      decoded.role !== "super_admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Super Admin token",
      });
    }

    // ======================================
    // FIND SUPER ADMIN
    // ======================================

    const superAdmin = await SuperAdmin.findById(decoded.id).select(
      "-password"
    );

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    // ======================================
    // CHECK ROLE FROM DATABASE
    // ======================================

    if (superAdmin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super Admin access denied",
      });
    }

    // ======================================
    // CHECK ACTIVE STATUS
    // ======================================

    if (!superAdmin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is inactive",
      });
    }

    // ======================================
    // ATTACH SUPER ADMIN TO REQUEST
    // ======================================

    req.superAdmin = superAdmin;

    req.superAdminId = superAdmin._id.toString();

    // ======================================
    // CONTINUE
    // ======================================

    next();
  } catch (error) {
    console.error("Super Admin authentication error:", error.message);

    // ======================================
    // JWT ERROR
    // ======================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Super Admin session expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid Super Admin session",
      });
    }

    // ======================================
    // OTHER ERROR
    // ======================================

    return res.status(401).json({
      success: false,
      message: "Super Admin authentication failed",
    });
  }
};
