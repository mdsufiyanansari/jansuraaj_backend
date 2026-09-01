import Problem from "../models/problemModel.js";

// ==========================================
// GET ALL REPORTED PROBLEMS
// GET /api/admin/problems
// ==========================================

export const getAllReportedProblems = async (req, res) => {
  try {
    const problems = await Problem.find()
      .sort({ createdAt: -1 });

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