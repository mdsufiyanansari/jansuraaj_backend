// import mongoose from "mongoose";

// const problemSchema = new mongoose.Schema(
//   {
//     // Problem kis member ne create ki
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Member",
//       required: true,
//     },

//     // User ka area
//     district: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     areaType: {
//       type: String,
//       enum: ["rural", "urban"],
//       required: true,
//     },

//     // Urban ke liye local body
//     // Rural mein ye empty ho sakta hai
//     localBody: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     // User ka registered ward
//     ward: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Problem category
//     category: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Problem description
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Problem ki location
//     address: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     latitude: {
//       type: Number,
//       required: true,
//     },

//     longitude: {
//       type: Number,
//       required: true,
//     },

//     // Uploaded photos ke Cloudinary URLs
//     photos: {
//       type: [String],
//       default: [],
//     },

//     // Problem status
//     status: {
//       type: String,
//       enum: ["pending", "in-progress", "resolved"],
//       default: "pending",
//     },

//     // Kitne users ne is existing problem ko report kiya
//     reportCount: {
//       type: Number,
//       default: 1,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Problem = mongoose.model("Problem", problemSchema);

// export default Problem;

import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    // ==================================
    // Problem kis member ne create ki
    // ==================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },

    // ==================================
    // Problem ka area
    // ==================================
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    areaType: {
      type: String,
      enum: ["rural", "urban"],
      required: true,
      index: true,
    },

    // Urban ke liye local body
    // Rural mein empty ho sakta hai
    localBody: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // Registered ward
    ward: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ==================================
    // Problem details
    // ==================================
    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    // ==================================
    // Problem location
    // ==================================
    // latitude: {
    //   type: Number,
    //   required: true,
    //   min: -90,
    //   max: 90,
    // },

    // longitude: {
    //   type: Number,
    //   required: true,
    //   min: -180,
    //   max: 180,
    // },

    // ==================================
    // Uploaded photos
    // ==================================
    photos: {
      type: [String],
      default: [],
    },

    // ==================================
    // Video links
    // ==================================
    videoLinks: {
      type: [String],
      default: [],
    },

    // ==================================
    // Problem status
    // ==================================
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
      index: true,
    },

    // ==================================
    // Members who reported this problem
    // ==================================
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],

    // Total reports
    reportCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ==================================
// Area search index
// ==================================
problemSchema.index({
  district: 1,
  areaType: 1,
  localBody: 1,
  ward: 1,
  createdAt: -1,
});

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
