import WardHead from "../models/wardHeadModel.js";


// ==================================
// Get All Ward Head Requests
// GET /api/super-admin/ward-heads
// ==================================

export const getAllWardHeads = async (
  req,
  res
) => {
  try {

    // ==============================
    // Optional Query Filter
    // ==============================

    const {
      status,
      district,
    } = req.query;


    // ==============================
    // Build Filter
    // ==============================

    const filter = {};


    // Filter By Approval Status

    if (status) {

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid approval status",
        });
      }


      filter.approvalStatus =
        status;
    }


    // Filter By District

    if (district) {

      filter.district =
        district.trim();
    }


    // ==============================
    // Get Ward Heads
    // ==============================

    const wardHeads =
      await WardHead.find(
        filter
      )
        .select(
          "-password"
        )
        .sort({
          createdAt: -1,
        });


    // ==============================
    // Response
    // ==============================

    return res.status(200).json({

      success: true,

      count:
        wardHeads.length,

      wardHeads,

    });

  } catch (error) {

    console.error(
      "Get Ward Heads Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to fetch Ward Head requests",

    });
  }
};



// ==================================
// Get Pending Ward Head Requests
// GET /api/super-admin/ward-heads/pending
// ==================================

export const getPendingWardHeads =
  async (
    req,
    res
  ) => {

    try {

      const wardHeads =
        await WardHead.find({

          approvalStatus:
            "pending",

        })
          .select(
            "-password"
          )
          .sort({

            createdAt:
              -1,

          });


      return res.status(200).json({

        success:
          true,

        count:
          wardHeads.length,

        wardHeads,

      });

    } catch (error) {

      console.error(
        "Get Pending Ward Heads Error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch pending Ward Head requests",

      });
    }
  };



// ==================================
// Get Single Ward Head Details
// GET /api/super-admin/ward-heads/:id
// ==================================

export const getWardHeadById =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      // ==============================
      // Find Ward Head
      // ==============================

      const wardHead =
        await WardHead.findById(
          id
        ).select(
          "-password"
        );


      // ==============================
      // Not Found
      // ==============================

      if (!wardHead) {

        return res.status(404).json({

          success:
            false,

          message:
            "Ward Head not found",

        });
      }


      // ==============================
      // Response
      // ==============================

      return res.status(200).json({

        success:
          true,

        wardHead,

      });

    } catch (error) {

      console.error(
        "Get Ward Head Details Error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Unable to fetch Ward Head details",

      });
    }
  };



// ==================================
// Approve Ward Head
// PATCH /api/super-admin/ward-heads/:id/approve
// ==================================

export const approveWardHead =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      // ==============================
      // Find Ward Head
      // ==============================

      const wardHead =
        await WardHead.findById(
          id
        );


      if (!wardHead) {

        return res.status(404).json({

          success:
            false,

          message:
            "Ward Head not found",

        });
      }


      // ==============================
      // Already Approved
      // ==============================

      if (
        wardHead.approvalStatus ===
        "approved"
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Ward Head is already approved",

        });
      }


      // ==============================
      // Approve Ward Head
      // ==============================

      wardHead.approvalStatus =
        "approved";


      // Clear Rejection Reason

      wardHead.rejectionReason =
        "";


      // Make Account Active

      wardHead.isActive =
        true;


      await wardHead.save();


      // ==============================
      // Response
      // ==============================

      return res.status(200).json({

        success:
          true,

        message:
          "Ward Head approved successfully",

        wardHead: {

          id:
            wardHead._id,

          name:
            wardHead.name,

          phone:
            wardHead.phone,

          approvalStatus:
            wardHead.approvalStatus,

          isActive:
            wardHead.isActive,

        },

      });

    } catch (error) {

      console.error(
        "Approve Ward Head Error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Unable to approve Ward Head",

      });
    }
  };



// ==================================
// Reject Ward Head
// PATCH /api/super-admin/ward-heads/:id/reject
// ==================================

export const rejectWardHead =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      const {
        rejectionReason,
      } = req.body;


      // ==============================
      // Find Ward Head
      // ==============================

      const wardHead =
        await WardHead.findById(
          id
        );


      if (!wardHead) {

        return res.status(404).json({

          success:
            false,

          message:
            "Ward Head not found",

        });
      }


      // ==============================
      // Already Rejected
      // ==============================

      if (
        wardHead.approvalStatus ===
        "rejected"
      ) {

        return res.status(400).json({

          success:
            false,

          message:
            "Ward Head is already rejected",

        });
      }


      // ==============================
      // Reject Ward Head
      // ==============================

      wardHead.approvalStatus =
        "rejected";


      wardHead.rejectionReason =
        rejectionReason?.trim() || "";


      // Disable Account

      wardHead.isActive =
        false;


      await wardHead.save();


      // ==============================
      // Response
      // ==============================

      return res.status(200).json({

        success:
          true,

        message:
          "Ward Head request rejected",

        wardHead: {

          id:
            wardHead._id,

          name:
            wardHead.name,

          approvalStatus:
            wardHead.approvalStatus,

          isActive:
            wardHead.isActive,

          rejectionReason:
            wardHead.rejectionReason,

        },

      });

    } catch (error) {

      console.error(
        "Reject Ward Head Error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        message:
          "Unable to reject Ward Head",

      });
    }
  };