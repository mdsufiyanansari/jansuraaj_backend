import Member from "../models/memberModel.js";

export const getUserCount = async (req, res) => {
  try {
    const totalUsers = await Member.countDocuments({
      registrationStatus: "completed",
    });

    return res.status(200).json({
      success: true,
      totalUsers,
    });
  } catch (error) {
    console.error("Get user count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user count",
    });
  }
};

// ==========================================
// GET ALL JOINED USERS
// GET /api/admin/users
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await Member.find({
      registrationStatus: "completed",
    })
      .select(
        "photo firstName middleName lastName name phone district areaType localBody ward createdAt registrationStatus"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get users",
    });
  }
};