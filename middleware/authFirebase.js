import admin from "../config/firebaseAdmin.js";

const authFirebase = async (req, res, next) => {
  try {
    const idToken = req.cookies?.firebaseToken;

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decodedToken = await admin.verifyIdToken(idToken);

    console.log("Firebase UID from cookie:", decodedToken.uid);

    req.firebaseUid = decodedToken.uid;

    next();
  } catch (error) {
    console.error("Firebase auth error:", {
      code: error.code,
      message: error.message,
    });

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication session",
    });
  }
};

export default authFirebase;
