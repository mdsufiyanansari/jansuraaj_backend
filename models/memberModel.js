import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    // ==================================
    // Mobile Number
    // ==================================

    phone: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },

    // ==================================
    // Profile Photo
    // ==================================

    photo: {
      type: String,
      default: "",
      trim: true,
    },

    // ==================================
    // Name
    // ==================================

    firstName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    middleName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 250,
    },

    // ==================================
    // Personal Details
    // ==================================

    education: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    profession: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    skills: {
      type: [String],
      default: [],
    },

    // ==================================
    // Location
    // ==================================

    district: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    areaType: {
      type: String,
      enum: ["", "rural", "urban"],
      default: "",
      index: true,
    },

    // ==================================
    // Urban Location
    // ==================================

    localBody: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // ==================================
    // Rural Location
    // ==================================

    block: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    panchayat: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // ==================================
    // Ward
    // ==================================

    ward: {
      type: String,
      default: "",
      trim: true,
      index: true,

      set: (value) => {
        if (!value) return "";

        const ward = String(value).trim();

        // ward_3 -> ward_03
        // WARD_3 -> ward_03
        // ward_03 -> ward_03

        if (/^ward_\d+$/i.test(ward)) {
          const number = ward
            .replace(/^ward_/i, "")
            .padStart(2, "0");

          return `ward_${number}`;
        }

        // 3 -> ward_03
        // 12 -> ward_12

        if (/^\d+$/.test(ward)) {
          return `ward_${ward.padStart(2, "0")}`;
        }

        return ward;
      },
    },

    // ==================================
    // Registration Status
    // ==================================

    registrationStatus: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model(
  "Member",
  memberSchema
);

export default Member;