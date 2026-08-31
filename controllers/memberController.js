import Member from "../models/memberModel.js";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

// Cloudinary upload helper
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "jansuraaj/members",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(buffer);
  });
};

// ================================
// CREATE MEMBER
// POST /api/members
// ================================
export const createMember = async (req, res) => {
  try {
    let photoUrl = "";

    // ==========================================
    // MOBILE NUMBER
    // ==========================================
    // const { phone } = req.body;

    // const digits = String(phone || "")
    //   .replace(/\D/g, "")
    //   .slice(-10);

    // if (!/^\d{10}$/.test(digits)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Please enter a valid 10-digit phone number",
    //   });
    // }

    // const phoneNumber = `+91${digits}`;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      photoUrl = result.secure_url;
    }

    const member = await Member.create({
      // phone: phoneNumber,
      photo: photoUrl,
      registrationStatus: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Member registration started",
      memberId: member._id,
      member,
    });
  } catch (error) {
    console.error("Create member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create member",
      error: error.message,
    });
  }
};

// ==================================
// UPDATE PERSONAL DETAILS
// PUT /api/members/:id/profile
// ==================================
export const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      name,
      education,
      profession,
      skills,
      // aadhaar,
    } = req.body;

    // OLD FIREBASE QUERY
    // const member = await Member.findById(req.params.id);

    /*
    const member = await Member.findOne({
      _id: req.params.id,
      firebaseUid: req.firebaseUid,
    });
    */

    // JWT MEMBER
    // const member = await Member.findById(req.memberId);

    // JOIN FLOW
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    member.firstName = firstName || "";
    member.middleName = middleName || "";
    member.lastName = lastName || "";
    member.name = name || "";

    member.education = education || "";
    member.profession = profession || "";

    member.skills = Array.isArray(skills) ? skills : [];

    // member.aadhaar = aadhaar || "";

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      member,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ==================================
// UPDATE LOCATION
// PUT /api/members/:id/location
// ==================================
export const updateLocation = async (req, res) => {
  try {
    const { district, areaType, localBody, block, panchayat, ward } = req.body;

    // ==========================================
    // BASIC LOCATION VALIDATION
    // ==========================================

    if (!district || !String(district).trim()) {
      return res.status(400).json({
        success: false,
        message: "District is required",
      });
    }

    if (!["rural", "urban"].includes(areaType)) {
      return res.status(400).json({
        success: false,
        message: "Valid area type is required",
      });
    }

    if (!ward || !String(ward).trim()) {
      return res.status(400).json({
        success: false,
        message: "Ward is required",
      });
    }

    // ==========================================
    // RURAL VALIDATION
    // ==========================================

    if (areaType === "rural") {
      if (!block || !String(block).trim()) {
        return res.status(400).json({
          success: false,
          message: "Block is required for rural area",
        });
      }

      if (!panchayat || !String(panchayat).trim()) {
        return res.status(400).json({
          success: false,
          message: "Panchayat is required for rural area",
        });
      }
    }

    // ==========================================
    // URBAN VALIDATION
    // ==========================================

    if (areaType === "urban") {
      if (!localBody || !String(localBody).trim()) {
        return res.status(400).json({
          success: false,
          message: "Local body is required for urban area",
        });
      }
    }

    // OLD FIREBASE QUERY
    /*
    const member = await Member.findOne({
      _id: req.params.id,
      firebaseUid: req.firebaseUid,
    });
    */

    // JWT MEMBER
    // const member = await Member.findById(req.memberId);

    // JOIN FLOW
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // member.district = district || "";
    // member.areaType = areaType || "";
    // member.localBody = localBody || "";
    // member.block = block || "";
    // member.ward = ward || "";

    member.district = district || "";
    member.areaType = areaType || "";

    // ==========================================
    // URBAN → Local Body
    // RURAL → Block + Panchayat
    // ==========================================

    member.localBody = areaType === "urban" ? localBody || "" : "";

    member.block = areaType === "rural" ? block || "" : "";

    member.panchayat = areaType === "rural" ? panchayat || "" : "";

    member.ward = ward || "";

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      member,
    });
  } catch (error) {
    console.error("Update location error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update location",
    });
  }
};

// ==================================
// CONNECT FIREBASE USER
// PUT /api/members/:id/firebase
// ==================================

/*
export const connectFirebaseUser = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;

    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "firebaseUid is required",
      });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Prevent changing an already connected Firebase account
    if (member.firebaseUid) {
      return res.status(409).json({
        success: false,
        message: "Firebase account is already connected",
      });
    }

    // Check whether this Firebase UID is already linked
    const existingMember = await Member.findOne({
      firebaseUid,
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message:
          "Firebase account is already linked to another member",
      });
    }

    member.firebaseUid = firebaseUid;
    member.registrationStatus = "completed";

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Firebase account connected successfully",
      member,
    });
  } catch (error) {
    console.error("Firebase connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to connect Firebase account",
    });
  }
};
*/

// ==================================
// COMPLETE MEMBER REGISTRATION
// PUT /api/members/:id/complete
// ==================================
export const completeMember = async (req, res) => {
  try {
    const { phone } = req.body;

    // Phone required
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Sirf digits
    const digits = String(phone).replace(/\D/g, "").slice(-10);

    // 10 digit validation
    if (!/^\d{10}$/.test(digits)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    const phoneNumber = `+91${digits}`;

    // Member find
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // Check duplicate phone
    const existingMember = await Member.findOne({
      phone: phoneNumber,
      _id: { $ne: member._id },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "This mobile number is already registered",
      });
    }

    // Save phone
    member.phone = phoneNumber;

    member.registrationStatus = "completed";

    await member.save();

    // ==========================================
    // CREATE JWT
    // ==========================================
    const token = jwt.sign(
      {
        memberId: member._id.toString(),
        phone: member.phone,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ==========================================
    // SET HTTPONLY COOKIE
    // ==========================================
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      member,
    });
  } catch (error) {
    console.error("Complete member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete registration",
      error: error.message,
    });
  }
};

// ==================================
// GET MEMBER
// GET /api/members/:id
// ==================================
export const getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch member",
      error: error.message,
    });
  }
};

// export const getMember = async (req, res) => {
//   try {
// OLD FIREBASE QUERY
/*
    const member = await Member.findOne({
      _id: req.params.id,
      firebaseUid: req.firebaseUid,
    });
    */

// JWT MEMBER
// const member = await Member.findById(req.memberId);

// JOIN FLOW

//     return res.status(200).json({
//       success: true,
//       member,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch member",
//       error: error.message,
//     });
//   }
// };

// ==================================
// GET MY PROFILE
// GET /api/members/me
// ==================================
export const getMyProfile = async (req, res) => {
  try {
    // OLD FIREBASE QUERY
    /*
    const member = await Member.findOne({
      firebaseUid: req.firebaseUid,
    });
    */

    // JWT MEMBER
    const member = await Member.findById(req.memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};
