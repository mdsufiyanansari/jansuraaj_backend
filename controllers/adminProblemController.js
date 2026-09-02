import Problem from "../models/problemModel.js";

// ==========================================
// GET ALL REPORTED PROBLEMS
// GET /api/admin/problems
// ==========================================

export const getAllReportedProblems = async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate(
        "createdBy",
        "photo firstName middleName lastName name phone district areaType localBody block panchayat ward"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      totalProblems: problems.length,
      problems,
    });
  } catch (error) {
    console.error(
      "Get all reported problems error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get reported problems",
    });
  }
};

// ==========================================
// GET SINGLE PROBLEM DETAILS
// GET /api/admin/problems/:id
// ==========================================

export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    // ======================================
    // GET PROBLEM + REPORTER DETAILS
    // ======================================

    const problem = await Problem.findById(id)
      .populate(
        "createdBy",
        "photo firstName middleName lastName name phone district areaType localBody block panchayat ward createdAt"
      )
      .lean();

    // ======================================
    // PROBLEM NOT FOUND
    // ======================================

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ======================================
    // REPORTER EXISTS OR NOT
    // ======================================

    const reporterId = problem.createdBy?._id;

    // ======================================
    // TOTAL ISSUES REPORTED BY THIS USER
    // ======================================

    const reporterTotalIssues = reporterId
      ? await Problem.countDocuments({
          createdBy: reporterId,
        })
      : 0;

      // ====================================== 
// GET ALL OTHER REPORTS BY SAME USER
// ====================================== 

const reporterOtherReports = reporterId
  ? await Problem.find({
      createdBy: reporterId,
      _id: { $ne: problem._id },
    })
      .select(
  "category description status district areaType localBody block panchayat ward reportCount createdAt photos"
)
      .sort({ createdAt: -1 })
      .lean()
  : [];

    // ======================================
    // REPORTER FULL NAME
    // ======================================

    let reporterName = "Unknown user";

    if (problem.createdBy) {
      const fullName = [
        problem.createdBy.firstName,
        problem.createdBy.middleName,
        problem.createdBy.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      reporterName =
        fullName ||
        problem.createdBy.name ||
        "Unknown user";
    }

    // ======================================
    // REPORTER DETAILS
    // ======================================

    const reporter = problem.createdBy
      ? {
          _id: problem.createdBy._id,

          name: reporterName,

          photo: problem.createdBy.photo || "",

          phone: problem.createdBy.phone || "",

          district: problem.createdBy.district || "",

          areaType: problem.createdBy.areaType || "",

          localBody: problem.createdBy.localBody || "",

          block: problem.createdBy.block || "",

          panchayat: problem.createdBy.panchayat || "",

          ward: problem.createdBy.ward || "",

          joinedAt: problem.createdBy.createdAt || null,

          totalReports: reporterTotalIssues,

          otherReports: reporterOtherReports,
        }
      : null;

    // ======================================
    // SUCCESS RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      problem: {
        ...problem,

        // Reporter ObjectId ki jagah populated
        // createdBy already problem ke andar hai
        reporterTotalIssues,
      },

      // Frontend ke liye clean reporter object
      reporter,
    });
  } catch (error) {
    console.error("Get problem details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get problem details",
    });
  }
};