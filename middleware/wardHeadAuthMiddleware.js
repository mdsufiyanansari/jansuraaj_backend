import jwt from "jsonwebtoken";
import WardHead from "../models/wardHeadModel.js";

// ==================================
// Ward Head Authentication Middleware
// ==================================

export const protectWardHead = async (
  req,
  res,
  next
) => {
  try {

    // ==================================
    // Get Token From HttpOnly Cookie
    // ==================================

    const token =
      req.cookies?.ward_head_token;


    // ==================================
    // Token Missing
    // ==================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Ward Head authentication required",
      });
    }


    // ==================================
    // JWT Secret Check
    // ==================================

    if (!process.env.JWT_SECRET) {

      console.error(
        "JWT_SECRET is not configured"
      );

      return res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error",
      });
    }


    // ==================================
    // Verify JWT Token
    // ==================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // ==================================
    // Validate Token Data
    // ==================================

    if (
      !decoded ||
      !decoded.id ||
      decoded.type !== "ward_head"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Ward Head authentication token",
      });
    }


    // ==================================
    // Find Ward Head
    // Password is select:false
    // so password will not be returned
    // ==================================

    const wardHead =
      await WardHead.findById(
        decoded.id
      );


    // ==================================
    // Ward Head Not Found
    // ==================================

    if (!wardHead) {
      return res.status(401).json({
        success: false,
        message:
          "Ward Head account not found",
      });
    }


    // ==================================
    // Check Account Active Status
    // ==================================

    if (!wardHead.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Ward Head account is inactive",
      });
    }


    // ==================================
    // Check Super Admin Approval Status
    // ==================================

    if (
      wardHead.approvalStatus !==
      "approved"
    ) {
      return res.status(403).json({
        success: false,

        status:
          wardHead.approvalStatus,

        message:
          wardHead.approvalStatus ===
          "pending"
            ? "Your Ward Head registration request is pending Super Admin approval."
            : "Your Ward Head registration request has not been approved.",

        rejectionReason:
          wardHead.approvalStatus ===
            "rejected"
            ? wardHead.rejectionReason || ""
            : undefined,
      });
    }


    // ==================================
    // Attach Ward Head To Request
    // ==================================

    req.wardHead =
      wardHead;


    // Future Controllers ke liye direct ID

    req.wardHeadId =
      wardHead._id.toString();


    // ==================================
    // Continue Request
    // ==================================

    return next();

  } catch (error) {

    console.error(
      "Ward Head Authentication Error:",
      error.message
    );


    // ==================================
    // Token Expired
    // ==================================

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Ward Head session expired. Please login again.",
      });
    }


    // ==================================
    // Invalid JWT Token
    // ==================================

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Ward Head authentication token",
      });
    }


    // ==================================
    // Other Authentication Errors
    // ==================================

    return res.status(401).json({
      success: false,
      message:
        "Ward Head authentication failed",
    });
  }
};