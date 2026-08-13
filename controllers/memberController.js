import Member from "../models/memberModel.js";
import cloudinary from "../config/cloudinary.js";

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

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      photoUrl = result.secure_url;
    }

    const member = await Member.create({
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
      aadhaar,
    } = req.body;

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

    member.aadhaar = aadhaar || "";

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
    const { areaType, localBody, ward } = req.body;

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    member.areaType = areaType || "";
    member.localBody = localBody || "";
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
      error: error.message,
    });
  }
};

// ==================================
// CONNECT FIREBASE USER
// PUT /api/members/:id/firebase
// ==================================
export const connectFirebaseUser = async (req, res) => {
  try {
    const { firebaseUid } = req.body;

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
