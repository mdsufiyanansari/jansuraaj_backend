import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    // Firebase user  ID
    firebaseUid: {
      type: String,
      default: null,
      index: true,
    },

    // Profile
    photo: {
      type: String,
      default: "",
    },

    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    middleName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    // Personal details
    education: {
      type: String,
      default: "",
    },

    profession: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    aadhaar: {
      type: String,
      default: "",
    },

    // Location
    areaType: {
      type: String,
      enum: ["", "rural", "urban"],
      default: "",
    },

    localBody: {
      type: String,
      default: "",
    },

    ward: {
      type: String,
      default: "",
    },

    // Registration status
    registrationStatus: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model("Member", memberSchema);

export default Member;
