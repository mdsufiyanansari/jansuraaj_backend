import jwt from "jsonwebtoken";
import WardHead from "../models/wardHeadModel.js";

// ==================================
// Generate JWT Token
// ==================================

const generateToken = (wardHeadId) => {
  return jwt.sign(
    {
      id: wardHeadId,
      type: "ward_head",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ==================================
// Cookie Options
// ==================================

const cookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV === "production",

  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  maxAge:
    7 * 24 * 60 * 60 * 1000,
};


// ==================================
// Create Ward Head Registration
// POST /api/ward-head/auth/create
// ==================================

export const createWardHead = async (
  req,
  res
) => {
  try {

    const {
      name,
      phone,
      password,
      photo,

      district,
      areaType,
      localBody,

      block,
      panchayat,
      ward,
    } = req.body;


    // ==============================
    // Basic Validation
    // ==============================

    if (
      !name ||
      !phone ||
      !password ||
      !district ||
      !areaType ||
      !ward
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Name, mobile number, password, district, area type and ward are required",
      });
    }


    // ==============================
    // Mobile Validation
    // ==============================

    if (!/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,

        message:
          "Please enter a valid 10 digit mobile number",
      });
    }


    // ==============================
    // Password Validation
    // ==============================

    if (password.length < 6) {
      return res.status(400).json({
        success: false,

        message:
          "Password must be at least 6 characters long",
      });
    }


    // ==============================
    // Check Duplicate Phone
    // ==============================

    const existingWardHead =
      await WardHead.findOne({
        phone: phone.trim(),
      });


    if (existingWardHead) {

      // Pending request already exists
      if (
        existingWardHead.approvalStatus ===
        "pending"
      ) {
        return res.status(409).json({
          success: false,

          status: "pending",

          message:
            "Your registration request is already pending Super Admin approval.",
        });
      }


      // Approved Ward Head already exists
      if (
        existingWardHead.approvalStatus ===
        "approved"
      ) {
        return res.status(409).json({
          success: false,

          status: "approved",

          message:
            "A Ward Head account already exists with this mobile number.",
        });
      }


      // Rejected Ward Head
      if (
        existingWardHead.approvalStatus ===
        "rejected"
      ) {
        return res.status(409).json({
          success: false,

          status: "rejected",

          message:
            "Your previous Ward Head registration request was rejected. Please contact the Super Admin.",
        });
      }


      return res.status(409).json({
        success: false,

        message:
          "Ward Head already exists with this mobile number.",
      });
    }


    // ==============================
    // Create Ward Head
    // ==============================

    const wardHead =
      await WardHead.create({

        name:
          name.trim(),

        phone:
          phone.trim(),

        password,

        photo:
          photo?.trim() || "",

        district:
          district.trim(),

        areaType,

        localBody:
          localBody?.trim() || "",

        block:
          block?.trim() || "",

        panchayat:
          panchayat?.trim() || "",

        ward:
          ward.trim(),

        // ==========================
        // Account Active
        // ==========================

        isActive: true,


        // ==========================
        // IMPORTANT
        // Super Admin Approval
        // ==========================

        approvalStatus:
          "pending",

        rejectionReason:
          "",
      });


    // ==============================
    // Registration Response
    // ==============================

    // IMPORTANT:
    // No JWT token
    // No cookie
    // No auto login

    return res.status(201).json({
      success: true,

      message:
        "Your registration request has been sent for Super Admin approval.",

      status:
        wardHead.approvalStatus,

      wardHead: {
        id:
          wardHead._id,

        name:
          wardHead.name,

        phone:
          wardHead.phone,

        photo:
          wardHead.photo,

        district:
          wardHead.district,

        areaType:
          wardHead.areaType,

        localBody:
          wardHead.localBody,

        block:
          wardHead.block,

        panchayat:
          wardHead.panchayat,

        ward:
          wardHead.ward,

        approvalStatus:
          wardHead.approvalStatus,
      },
    });

  } catch (error) {

    console.error(
      "Create Ward Head Error:",
      error
    );


    // ==============================
    // Duplicate MongoDB Index Error
    // ==============================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "A Ward Head already exists for this location and ward.",
      });
    }


    // ==============================
    // Validation Error
    // ==============================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }


    return res.status(500).json({
      success: false,

      message:
        "Server error while submitting Ward Head registration request",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


// ==================================
// Ward Head Login
// POST /api/ward-head/auth/login
// ==================================

export const wardHeadLogin = async (
  req,
  res
) => {
  try {

    const {
      phone,
      password,
    } = req.body;


    // ==============================
    // Validation
    // ==============================

    if (!phone || !password) {
      return res.status(400).json({
        success: false,

        message:
          "Mobile number and password are required",
      });
    }


    // ==============================
    // Find Ward Head
    // ==============================

    const wardHead =
      await WardHead.findOne({
        phone:
          phone.trim(),
      }).select("+password");


    if (!wardHead) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid mobile number or password",
      });
    }


    // ==============================
    // Check Account Active Status
    // ==============================

    if (!wardHead.isActive) {
      return res.status(403).json({
        success: false,

        message:
          "Ward Head account is inactive",
      });
    }


    // ==============================
    // Compare Password
    // ==============================

    const isPasswordCorrect =
      await wardHead.comparePassword(
        password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid mobile number or password",
      });
    }


    // ==============================
    // Approval Status Check
    // ==============================

    // Pending
    if (
      wardHead.approvalStatus ===
      "pending"
    ) {
      return res.status(403).json({
        success: false,

        status:
          "pending",

        message:
          "Your Ward Head registration request is pending Super Admin approval.",
      });
    }


    // Rejected
    if (
      wardHead.approvalStatus ===
      "rejected"
    ) {
      return res.status(403).json({
        success: false,

        status:
          "rejected",

        message:
          "Your Ward Head registration request was rejected.",

        rejectionReason:
          wardHead.rejectionReason ||
          "",
      });
    }


    // Extra Safety
    if (
      wardHead.approvalStatus !==
      "approved"
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Ward Head account is not approved for login.",
      });
    }


    // ==============================
    // Generate JWT
    // ==============================

    const token =
      generateToken(
        wardHead._id
      );


    // ==============================
    // Send Token in HttpOnly Cookie
    // ==============================

    res.cookie(
      "ward_head_token",
      token,
      cookieOptions
    );


    // ==============================
    // Login Response
    // ==============================

    return res.status(200).json({
      success: true,

      message:
        "Ward Head login successful",

      wardHead: {
        id:
          wardHead._id,

        name:
          wardHead.name,

        phone:
          wardHead.phone,

        photo:
          wardHead.photo,

        district:
          wardHead.district,

        areaType:
          wardHead.areaType,

        localBody:
          wardHead.localBody,

        block:
          wardHead.block,

        panchayat:
          wardHead.panchayat,

        ward:
          wardHead.ward,

        approvalStatus:
          wardHead.approvalStatus,
      },
    });

  } catch (error) {

    console.error(
      "Ward Head Login Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error during Ward Head login",
    });
  }
};


// ==================================
// Ward Head Logout
// POST /api/ward-head/auth/logout
// ==================================

export const wardHeadLogout = async (
  req,
  res
) => {
  try {

    res.clearCookie(
      "ward_head_token",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "none"
            : "lax",
      }
    );


    return res.status(200).json({
      success: true,

      message:
        "Ward Head logout successful",
    });

  } catch (error) {

    console.error(
      "Ward Head Logout Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error during logout",
    });
  }
};


// ==================================
// Get Logged In Ward Head
// GET /api/ward-head/auth/me
// ==================================

export const getWardHeadMe = async (
  req,
  res
) => {
  try {

    const wardHead =
      req.wardHead;


    if (!wardHead) {
      return res.status(401).json({
        success: false,

        message:
          "Ward Head not authenticated",
      });
    }


    return res.status(200).json({
      success: true,

      wardHead: {
        id:
          wardHead._id,

        name:
          wardHead.name,

        phone:
          wardHead.phone,

        photo:
          wardHead.photo,

        district:
          wardHead.district,

        areaType:
          wardHead.areaType,

        localBody:
          wardHead.localBody,

        block:
          wardHead.block,

        panchayat:
          wardHead.panchayat,

        ward:
          wardHead.ward,

        isActive:
          wardHead.isActive,

        approvalStatus:
          wardHead.approvalStatus,
      },
    });

  } catch (error) {

    console.error(
      "Get Ward Head Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to get Ward Head information",
    });
  }
};

// ==================================
// Check Ward Head Approval Status
// GET /api/ward-head/auth/approval-status/:phone
// ==================================

export const getWardHeadApprovalStatus = async (
  req,
  res
) => {
  try {
    const { phone } = req.params;

    // ==============================
    // Validate Phone
    // ==============================

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    // ==============================
    // Find Ward Head
    // ==============================

    const wardHead = await WardHead.findOne({
      phone: phone.trim(),
    });

    if (!wardHead) {
      return res.status(404).json({
        success: false,
        message: "Ward Head registration not found",
      });
    }

    // ==============================
    // Response
    // ==============================

    return res.status(200).json({
      success: true,
      wardHead: {
        id: wardHead._id,

        name: wardHead.name,

        phone: wardHead.phone,

        approvalStatus:
          wardHead.approvalStatus,

        rejectionReason:
          wardHead.rejectionReason || "",

        isActive:
          wardHead.isActive,
      },
    });

  } catch (error) {
    console.error(
      "Get Ward Head Approval Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get Ward Head approval status",
    });
  }
};