import mongoose from "mongoose";
import Problem from "../models/problemModel.js";
import Member from "../models/memberModel.js";

// ==========================================
// Helper: Escape regex special characters
// ==========================================
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ==========================================
// GET MY AREA PROBLEMS
// GET /api/problems/my-area
// ==========================================
export const getMyAreaProblems = async (req, res) => {
  try {
    const member = await Member.findOne({
      firebaseUid: req.firebaseUid,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    // ==========================================
    // LOCATION CHECK
    // ==========================================

    if (!member.district || !member.areaType || !member.ward) {
      return res.status(400).json({
        success: false,
        message: "Member location is incomplete",
      });
    }

    // ==========================================
    // AREA FILTER
    // ==========================================

    const filter = {
      district: member.district,
      areaType: member.areaType,
      ward: member.ward,
    };

    // Urban mein localBody bhi match hona chahiye
    if (member.areaType === "urban") {
      filter.localBody = member.localBody;
    }

    const problems = await Problem.find(filter).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      problems,
    });
  } catch (error) {
    console.error("Get area problems error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problems",
    });
  }
};

// ==========================================
// CREATE NEW PROBLEM
// POST /api/problems
// ==========================================
export const createProblem = async (req, res) => {
  try {
    // ==========================================
    // req.body safety
    // ==========================================

    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const { category, description, address, latitude, longitude, photos } =
      req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!category || !category.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!description || !description.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // ==========================================
    // FIREBASE USER SE MEMBER FIND
    // ==========================================

    const member = await Member.findOne({
      firebaseUid: req.firebaseUid,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    // ==========================================
    // MEMBER LOCATION CHECK
    // ==========================================

    if (!member.district || !member.areaType || !member.ward) {
      return res.status(400).json({
        success: false,
        message: "Member location is incomplete",
      });
    }

    // ==========================================
    // CLEAN CATEGORY & DESCRIPTION
    // ==========================================

    const cleanCategory = category.toString().trim().toLowerCase();

    const cleanDescription = description
      .toString()
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

    // ==========================================
    // DUPLICATE PROBLEM CHECK
    // ==========================================

    const duplicateFilter = {
      district: member.district,
      areaType: member.areaType,
      ward: member.ward,

      category: {
        $regex: `^${escapeRegex(cleanCategory)}$`,
        $options: "i",
      },

      description: {
        $regex: `^${escapeRegex(cleanDescription)}$`,
        $options: "i",
      },

      // Resolved problem ko duplicate nahi maana jayega
      status: {
        $ne: "resolved",
      },
    };

    // Urban area mein local body bhi check karo
    if (member.areaType === "urban") {
      duplicateFilter.localBody = member.localBody;
    }

    const existingProblem = await Problem.findOne(duplicateFilter);

    if (existingProblem) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: "यह समस्या पहले से दर्ज है।",
        problemId: existingProblem._id,
        problem: existingProblem,
      });
    }

    // ==========================================
    // LATITUDE VALIDATION
    // ==========================================

    if (latitude === undefined || latitude === null || latitude === "") {
      return res.status(400).json({
        success: false,
        message: "Problem location is required",
      });
    }

    const safeLatitude = Number(latitude);

    if (Number.isNaN(safeLatitude) || safeLatitude < -90 || safeLatitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });
    }

    // ==========================================
    // LONGITUDE VALIDATION
    // ==========================================

    if (longitude === undefined || longitude === null || longitude === "") {
      return res.status(400).json({
        success: false,
        message: "Problem location is required",
      });
    }

    const safeLongitude = Number(longitude);

    if (
      Number.isNaN(safeLongitude) ||
      safeLongitude < -180 ||
      safeLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });
    }

    // ==========================================
    // PHOTOS
    // ==========================================

    const safePhotos = Array.isArray(photos) ? photos : [];

    // ==========================================
    // CREATE PROBLEM
    // ==========================================

    const problem = await Problem.create({
      createdBy: member._id,

      // Area backend/member DB se
      district: member.district,
      areaType: member.areaType,
      localBody: member.localBody,
      ward: member.ward,

      category: category.toString().trim(),

      description: description.toString().trim().replace(/\s+/g, " "),

      address: address ? address.toString().trim() : "",

      latitude: safeLatitude,
      longitude: safeLongitude,

      photos: safePhotos,

      status: "pending",

      // Problem create karne wala first reporter
      reportedBy: [member._id],

      reportCount: 1,
    });

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      problem,
    });
  } catch (error) {
    console.error("Create problem error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create problem",
    });
  }
};

// ==========================================
// REPORT EXISTING PROBLEM
// POST /api/problems/:id/report
// ==========================================
export const reportExistingProblem = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // MONGODB ID VALIDATION
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID",
      });
    }

    // ==========================================
    // FIREBASE USER
    // ==========================================

    const member = await Member.findOne({
      firebaseUid: req.firebaseUid,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    // ==========================================
    // FIND PROBLEM
    // ==========================================

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ==========================================
    // AREA SECURITY
    // ==========================================

    const sameDistrict = member.district === problem.district;

    const sameAreaType = member.areaType === problem.areaType;

    const sameWard = member.ward === problem.ward;

    const sameLocalBody =
      member.areaType !== "urban" || member.localBody === problem.localBody;

    if (!sameDistrict || !sameAreaType || !sameWard || !sameLocalBody) {
      return res.status(403).json({
        success: false,
        message: "You can only report problems from your own area",
      });
    }

    // ==========================================
    // DUPLICATE REPORT CHECK
    // ==========================================

    const alreadyReported =
      Array.isArray(problem.reportedBy) &&
      problem.reportedBy.some(
        (userId) => userId.toString() === member._id.toString()
      );

    if (alreadyReported) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this problem",
      });
    }

    // ==========================================
    // ADD REPORT
    // ==========================================

    if (!Array.isArray(problem.reportedBy)) {
      problem.reportedBy = [];
    }

    problem.reportedBy.push(member._id);

    problem.reportCount = problem.reportedBy.length;

    await problem.save();

    return res.status(200).json({
      success: true,
      message: "Problem reported successfully",
      problem,
    });
  } catch (error) {
    console.error("Report problem error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report problem",
    });
  }
};

// ==========================================
// GET SINGLE PROBLEM
// GET /api/problems/:id
// ==========================================
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // MONGODB ID VALIDATION
    // ==========================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem ID",
      });
    }

    // ==========================================
    // FIREBASE USER
    // ==========================================

    const member = await Member.findOne({
      firebaseUid: req.firebaseUid,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member profile not found",
      });
    }

    // ==========================================
    // FIND PROBLEM
    // ==========================================

    const problem = await Problem.findById(id).lean();

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ==========================================
    // AREA SECURITY
    // ==========================================

    const sameDistrict = member.district === problem.district;

    const sameAreaType = member.areaType === problem.areaType;

    const sameWard = member.ward === problem.ward;

    const sameLocalBody =
      member.areaType !== "urban" || member.localBody === problem.localBody;

    if (!sameDistrict || !sameAreaType || !sameWard || !sameLocalBody) {
      return res.status(403).json({
        success: false,
        message: "You can only view problems from your own area",
      });
    }

    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    console.error("Get problem error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
    });
  }
};
