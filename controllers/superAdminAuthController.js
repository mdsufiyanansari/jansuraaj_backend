import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/superAdminModel.js";

export const superAdminLogin = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const superAdmin = await SuperAdmin.findOne({
      role: "super_admin",
    });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "Super Admin account not found",
      });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is inactive",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      superAdmin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      {
        id: superAdmin._id.toString(),
        type: "super_admin",
        role: "super_admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // IMPORTANT:
    // No maxAge here.
    // This makes it a session cookie.
    res.cookie("super_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Super Admin login successful",
      superAdmin: {
        _id: superAdmin._id,
        name: superAdmin.name,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error("Super Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Super Admin login failed",
    });
  }
};

export const superAdminLogout = async (req, res) => {
  try {
    res.clearCookie("super_admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Super Admin logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const getCurrentSuperAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      superAdmin: {
        _id: req.superAdmin._id,
        name: req.superAdmin.name,
        role: req.superAdmin.role,
      },
    });
  } catch (error) {
    console.error("Get current Super Admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get Super Admin",
    });
  }
};
