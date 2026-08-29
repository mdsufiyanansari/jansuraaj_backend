import Problem from "../models/problemModel.js";
import Member from "../models/memberModel.js";

// ==========================================
// SUPPORT EXISTING PROBLEM
// ==========================================

export const supportProblem = async (req, res) => {
  try {
    const { id: problemId } = req.params;

    // ==========================================
    // LOGGED-IN MEMBER ID
    // authFirebase.js se aa raha hai
    // ==========================================

    const memberId = req.memberId;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ==========================================
    // FIND MEMBER
    // ==========================================

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    // ==========================================
    // FIND PROBLEM
    // ==========================================

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    // ==========================================
    // CREATOR CHECK
    // Problem banane wala user
    // apni problem ko support nahi kar sakta
    // ==========================================

    const isCreator =
      problem.createdBy && problem.createdBy.toString() === memberId.toString();

    if (isCreator) {
      return res.status(403).json({
        success: false,
        isCreator: true,
        canSupport: false,
        message: "आप अपनी खुद की दर्ज की गई समस्या को support नहीं कर सकते।",
        reportCount: problem.reportCount || 1,
      });
    }

    // ==========================================
    // SAME DISTRICT CHECK
    // ==========================================

    if (member.district !== problem.district) {
      return res.status(403).json({
        success: false,
        message: "आप केवल अपने क्षेत्र की समस्या को ही support कर सकते हैं।",
      });
    }

    // ==========================================
    // SAME AREA TYPE CHECK
    // ==========================================

    if (member.areaType !== problem.areaType) {
      return res.status(403).json({
        success: false,
        message: "आप केवल अपने क्षेत्र की समस्या को ही support कर सकते हैं।",
      });
    }

    // ==========================================
    // URBAN LOCAL BODY CHECK
    // ==========================================

    if (member.areaType === "urban" && member.localBody !== problem.localBody) {
      return res.status(403).json({
        success: false,
        message: "आप केवल अपने नगर निकाय की समस्या को ही support कर सकते हैं।",
      });
    }

    // ==========================================
    // WARD CHECK
    // ==========================================

    if (member.ward !== problem.ward) {
      return res.status(403).json({
        success: false,
        message: "आप केवल अपने वार्ड की समस्या को ही support कर सकते हैं।",
      });
    }

    // ==========================================
    // ALREADY SUPPORTED CHECK
    // ==========================================

    const alreadySupported = Array.isArray(problem.reportedBy)
      ? problem.reportedBy.some((id) => id.toString() === memberId.toString())
      : false;

    if (alreadySupported) {
      return res.status(409).json({
        success: false,
        alreadySupported: true,
        message: "आप इस समस्या को पहले ही support कर चुके हैं।",
        reportCount: problem.reportCount || 1,
      });
    }

    // ==========================================
    // ADD SUPPORT
    // ==========================================

    if (!Array.isArray(problem.reportedBy)) {
      problem.reportedBy = [];
    }

    problem.reportedBy.push(memberId);

    problem.reportCount = (problem.reportCount || 0) + 1;

    await problem.save();

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "आपने इस समस्या को successfully support किया।",
      reportCount: problem.reportCount,
      supported: true,
      alreadySupported: true,
    });
  } catch (error) {
    console.error("Support problem error:", error);

    return res.status(500).json({
      success: false,
      message: "Problem support करने में समस्या हुई।",
    });
  }
};

// ==========================================
// CHECK SUPPORT STATUS
// ==========================================

export const getSupportStatus = async (req, res) => {
  try {
    const { id: problemId } = req.params;

    // ==========================================
    // LOGGED-IN MEMBER ID
    // ==========================================

    const memberId = req.memberId;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ==========================================
    // FIND PROBLEM
    // createdBy bhi select karna zaroori hai
    // ==========================================

    const problem = await Problem.findById(problemId).select(
      "createdBy reportedBy reportCount"
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    // ==========================================
    // CREATOR CHECK
    // ==========================================

    const isCreator =
      problem.createdBy && problem.createdBy.toString() === memberId.toString();

    // Creator ke liye support button nahi
    if (isCreator) {
      return res.status(200).json({
        success: true,
        supported: false,
        isCreator: true,
        canSupport: false,
        reportCount: problem.reportCount || 1,
      });
    }

    // ==========================================
    // CHECK ALREADY SUPPORTED
    // ==========================================

    const supported = Array.isArray(problem.reportedBy)
      ? problem.reportedBy.some((id) => id.toString() === memberId.toString())
      : false;

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      supported,
      isCreator: false,
      canSupport: !supported,
      reportCount: problem.reportCount || 1,
    });
  } catch (error) {
    console.error("Get support status error:", error);

    return res.status(500).json({
      success: false,
      message: "Support status check करने में समस्या हुई।",
    });
  }
};
