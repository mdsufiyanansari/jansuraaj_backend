import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    // ==================================
    // Firebase User ID - OLD
    // ==================================

    /*
    firebaseUid: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    */

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

    // Aadhaar
    // aadhaar: {
    //   type: String,
    //   default: "",
    //   trim: true,
    //   select: false,
    //   match: [/^\d{0,12}$/, "Invalid Aadhaar number"],
    // },

    // ==================================
    // Location
    // ==================================
    district: {
      type: String,
      default: "",
      trim: true,
    },

    areaType: {
      type: String,
      enum: ["", "rural", "urban"],
      default: "",
    },

    localBody: {
      type: String,
      default: "",
      trim: true,
    },

    ward: {
      type: String,
      default: "",
      trim: true,

      set: (value) => {
        if (!value) return "";

        const ward = String(value).trim();

        // अगर पहले से ward_03 format है
        if (/^ward_\d+$/i.test(ward)) {
          return ward.toLowerCase();
        }

        // अगर सिर्फ 3, 4, 12 आदि आया है
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

const Member = mongoose.model("Member", memberSchema);

export default Member;
