import Member from "../models/memberModel.js";
import Problem from "../models/problemModel.js";

// ==================================
// Escape Regex Special Characters
// ==================================

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ==================================
// Ward Head Dashboard
// GET /api/ward-head/dashboard
// ==================================

export const getWardHeadDashboard = async (
  req,
  res
) => {
  try {

    // ==================================
    // Logged In Ward Head
    // protectWardHead middleware se
    // ==================================

    const wardHead =
      req.wardHead;


    // ==================================
    // Safety Check
    // ==================================

    if (!wardHead) {
      return res.status(401).json({
        success: false,
        message:
          "Ward Head authentication required",
      });
    }


    // ==================================
    // Base Location Filter
    // ==================================

    const locationFilter = {

      // District exact match
      district:
        wardHead.district,

      // Area type exact match
      areaType:
        wardHead.areaType,

      // Ward exact match
      ward:
        wardHead.ward,
    };


    // ==================================
    // Rural Location Filter
    // ==================================

    if (
      wardHead.areaType ===
      "rural"
    ) {

      // Case-insensitive block match
      locationFilter.block = {
        $regex: `^${escapeRegex(
          wardHead.block
        )}$`,
        $options: "i",
      };


      // Case-insensitive panchayat match
      locationFilter.panchayat = {
        $regex: `^${escapeRegex(
          wardHead.panchayat
        )}$`,
        $options: "i",
      };
    }


    // ==================================
    // Urban Location Filter
    // ==================================

    if (
      wardHead.areaType ===
      "urban"
    ) {

      // ==================================
      // Case-insensitive Local Body Match
      //
      // Example:
      //
      // HABIBPUR_NAGAR_PARISHAD
      // habibpur_nagar_parishad
      //
      // Dono same location maanega
      // ==================================

      locationFilter.localBody = {
        $regex: `^${escapeRegex(
          wardHead.localBody
        )}$`,
        $options: "i",
      };
    }


    // ==================================
    // Users Count
    // ==================================

    const totalUsers =
      await Member.countDocuments(
        locationFilter
      );


    // ==================================
    // Issues Count
    // ==================================

    const totalIssues =
      await Problem.countDocuments(
        locationFilter
      );


    // ==================================
    // Pending Issues
    // ==================================

    const pendingIssues =
      await Problem.countDocuments({
        ...locationFilter,

        status:
          "pending",
      });


    // ==================================
    // In Progress Issues
    // ==================================

    const inProgressIssues =
      await Problem.countDocuments({
        ...locationFilter,

        status:
          "in-progress",
      });


    // ==================================
    // Resolved Issues
    // ==================================

    const resolvedIssues =
      await Problem.countDocuments({
        ...locationFilter,

        status:
          "resolved",
      });


    // ==================================
    // Recent Users
    // ==================================

    const recentUsers =
      await Member.find(
        locationFilter
      )
        .select(
          "name firstName middleName lastName phone photo district areaType localBody block panchayat ward createdAt"
        )
        .sort({
          createdAt:
            -1,
        })
        .limit(10);


    // ==================================
    // Recent Issues
    // ==================================

    const recentIssues =
      await Problem.find(
        locationFilter
      )
        .populate(
          "createdBy",
          "name firstName middleName lastName phone photo"
        )
        .sort({
          createdAt:
            -1,
        })
        .limit(10);


    // ==================================
    // Final Response
    // ==================================

    return res.status(200).json({

      success:
        true,


      // ==============================
      // Ward Head Location
      // ==============================

      wardHeadLocation: {

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
      },


      // ==============================
      // Dashboard Statistics
      // ==============================

      statistics: {

        totalUsers,

        totalIssues,

        pendingIssues,

        inProgressIssues,

        resolvedIssues,
      },


      // ==============================
      // Recent Data
      // ==============================

      recentUsers,

      recentIssues,
    });

  } catch (error) {

    console.error(
      "Ward Head Dashboard Error:",
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        "Unable to load Ward Head dashboard",
    });
  }
};