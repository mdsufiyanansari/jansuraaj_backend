import multer from "multer";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const fileFilter = (req, file, cb) => {
  console.log("Problem upload:", {
    name: file.originalname,
    type: file.mimetype,
  });

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP, MP4, WEBM and MOV files are allowed"
      ),
      false
    );
  }
};

const problemUpload = multer({
  storage,

  limits: {
    // Ek file maximum 20MB
    fileSize: 20 * 1024 * 1024,

    // Maximum 5 files
    files: 5,
  },

  fileFilter,
});

export default problemUpload;
