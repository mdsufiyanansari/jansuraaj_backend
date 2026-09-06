import Problem from "../models/problemModel.js";

// ==========================================
// UPDATE PROBLEM STATUS BY WARD HEAD
//
// PATCH /api/ward-head/problems/:id/status
// ==========================================

export const updateProblemStatusByWardHead = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      progressNote,
      expectedCompletionDate,
      resolutionNote,
      completionPhotos,
    } = req.body;

    // ======================================
    // VALID STATUS
    // ======================================

    const allowedStatuses = ["pending", "in-progress", "resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem status",
      });
    }

    // ======================================
    // FIND PROBLEM
    // ======================================

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // ======================================
    // WARD HEAD DETAILS
    // ======================================

    const wardHeadId = req.wardHeadId;

    // ======================================
    // CHANGE TO IN PROGRESS
    // ======================================

    if (status === "in-progress") {
      // Already resolved problem cannot go back
      if (problem.status === "resolved") {
        return res.status(400).json({
          success: false,
          message: "Resolved problem cannot be moved back to in-progress",
        });
      }

      problem.status = "in-progress";

      problem.reviewedBy = wardHeadId;

      problem.reviewedAt = new Date();

      if (progressNote !== undefined) {
        problem.progressNote = progressNote;
      }

      if (expectedCompletionDate) {
        problem.expectedCompletionDate = new Date(expectedCompletionDate);
      }

      // ====================================
      // STATUS HISTORY
      // ====================================

      problem.statusHistory.push({
        status: "in-progress",
        note: progressNote || "",
        updatedBy: wardHeadId,
        updatedAt: new Date(),
        expectedCompletionDate: expectedCompletionDate
          ? new Date(expectedCompletionDate)
          : null,
      });
    }

    // ======================================
    // CHANGE TO RESOLVED
    // ======================================

    if (status === "resolved") {
      // Problem should be in progress first
      if (problem.status !== "in-progress") {
        return res.status(400).json({
          success: false,
          message: "Problem must be in progress before marking it resolved",
        });
      }

      problem.status = "resolved";

      problem.resolvedBy = wardHeadId;

      problem.resolvedAt = new Date();

      if (resolutionNote !== undefined) {
        problem.resolutionNote = resolutionNote;
      }

      if (completionPhotos) {
        problem.completionPhotos = completionPhotos;
      }

      // ====================================
      // STATUS HISTORY
      // ====================================

      problem.statusHistory.push({
        status: "resolved",
        note: resolutionNote || "",
        updatedBy: wardHeadId,
        updatedAt: new Date(),
        expectedCompletionDate: problem.expectedCompletionDate || null,
      });
    }

    // ======================================
    // SAVE
    // ======================================

    await problem.save();

    return res.status(200).json({
      success: true,
      message:
        status === "in-progress"
          ? "Problem marked as in progress successfully"
          : "Problem marked as resolved successfully",

      problem,
    });
  } catch (error) {
    console.error("Ward Head problem status update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update problem status",
    });
  }
};
