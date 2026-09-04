import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ==================================
// Ward Head Schema
// ==================================

const wardHeadSchema = new mongoose.Schema(
  {
    // ==================================
    // Basic Details
    // ==================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,

      match: [
        /^\d{10}$/,
        "Please enter a valid 10 digit mobile number",
      ],
    },

    photo: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================
    // Password
    // ==================================

    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },

    // ==================================
    // District
    //
    // Store district ID
    // Example: BHAGALPUR
    // ==================================

    district: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    // ==================================
    // Area Type
    // ==================================

    areaType: {
      type: String,
      enum: ["rural", "urban"],
      required: true,
      index: true,
    },

    // ==================================
    // Urban Area
    //
    // Example:
    // BHAGALPUR_MUNICIPAL_CORPORATION
    // ==================================

    localBody: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      index: true,
    },

    // ==================================
    // Rural Area
    //
    // Example:
    // BIHPUR
    // ==================================

    block: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      index: true,
    },

    // ==================================
    // Panchayat
    //
    // Example:
    // BIHPUR_GPS_1
    // ==================================

    panchayat: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      index: true,
    },

    // ==================================
    // Ward
    //
    // Standard:
    // ward_01
    // ward_02
    // ==================================

    ward: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,

      set: (value) => {
        if (!value) return "";

        const ward = String(value).trim();

        // Already ward_03 format

        if (/^ward_\d+$/i.test(ward)) {
          const number = ward
            .replace(/^ward_/i, "")
            .padStart(2, "0");

          return `ward_${number}`;
        }

        // Only number

        if (/^\d+$/.test(ward)) {
          return `ward_${ward.padStart(
            2,
            "0"
          )}`;
        }

        return ward.toLowerCase();
      },
    },

    // ==================================
    // Account Active Status
    // ==================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ==================================
    // Super Admin Approval Status
    // ==================================

    approvalStatus: {
      type: String,

      enum: [
        "pending",
        "approved",
        "rejected",
      ],

      default: "pending",

      index: true,
    },

    // ==================================
    // Rejection Reason
    // ==================================

    rejectionReason: {
      type: String,

      default: "",

      trim: true,

      maxlength: 500,
    },
  },

  {
    timestamps: true,
  }
);

// ==================================
// Validate Location Before Save
// ==================================

wardHeadSchema.pre(
  "validate",
  function () {

    // ==================================
    // Urban Ward Head
    // ==================================

    if (this.areaType === "urban") {

      if (!this.localBody) {
        throw new Error(
          "Local body is required for urban Ward Head"
        );
      }

      // Clear rural fields

      this.block = "";
      this.panchayat = "";
    }

    // ==================================
    // Rural Ward Head
    // ==================================

    if (this.areaType === "rural") {

      if (!this.block) {
        throw new Error(
          "Block is required for rural Ward Head"
        );
      }

      if (!this.panchayat) {
        throw new Error(
          "Panchayat is required for rural Ward Head"
        );
      }

      // Clear urban field

      this.localBody = "";
    }
  }
);

// ==================================
// Hash Password Before Save
// ==================================

wardHeadSchema.pre(
  "save",
  async function () {

    if (!this.isModified("password")) {
      return;
    }

    this.password = await bcrypt.hash(
      this.password,
      12
    );
  }
);

// ==================================
// Compare Password
// ==================================

wardHeadSchema.methods.comparePassword =
  async function (
    enteredPassword
  ) {

    return await bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

// ==================================
// Prevent Multiple Ward Heads
// Same Location + Same Ward
// ==================================

wardHeadSchema.index(
  {
    district: 1,
    areaType: 1,
    localBody: 1,
    block: 1,
    panchayat: 1,
    ward: 1,
  },

  {
    unique: true,
  }
);

// ==================================
// Model
// ==================================

const WardHead = mongoose.model(
  "WardHead",
  wardHeadSchema
);

export default WardHead;