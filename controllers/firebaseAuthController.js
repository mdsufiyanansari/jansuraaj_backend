import axios from "axios";
import Member from "../models/memberModel.js";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// ==========================================
// COOKIE OPTIONS
// ==========================================
const cookieOptions = {
  httpOnly: true,

  // Localhost HTTP => false
  // Production HTTPS => true
  secure: process.env.NODE_ENV === "production",

  // Localhost => lax
  // Production different domains => none
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

  // 1 hour
  maxAge: 60 * 60 * 1000,

  path: "/",
};

// ==========================================
// SEND OTP
// POST /api/auth/send-otp
// ==========================================
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Sirf last 10 digits rakho
    const digits = String(phone).replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(digits)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number",
      });
    }

    const phoneNumber = `+91${digits}`;

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`,
      {
        phoneNumber,
        recaptchaToken: req.body.recaptchaToken,
      }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      sessionInfo: response.data.sessionInfo,
    });
  } catch (error) {
    console.error(
      "Firebase send OTP error:",
      error.response?.data || error.message
    );

    return res.status(400).json({
      success: false,
      message: error.response?.data?.error?.message || "Failed to send OTP",
    });
  }
};

// ==========================================
// VERIFY OTP
// POST /api/auth/verify-otp
// ==========================================
export const verifyOtp = async (req, res) => {
  try {
    const { sessionInfo, code } = req.body;

    if (!sessionInfo || !code) {
      return res.status(400).json({
        success: false,
        message: "sessionInfo and OTP are required",
      });
    }

    const cleanCode = String(code).replace(/\D/g, "").slice(0, 6);

    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        sessionInfo,
        code: cleanCode,
        returnSecureToken: true,
      }
    );

    const { localId, idToken, phoneNumber } = response.data;

    // Firebase ID token ko HttpOnly cookie me store karo
    res.cookie("firebaseToken", idToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      phoneNumber,
    });
  } catch (error) {
    console.error(
      "Firebase verify OTP error:",
      error.response?.data || error.message
    );

    return res.status(400).json({
      success: false,
      message: error.response?.data?.error?.message || "Invalid OTP",
    });
  }
};

// ==========================================
// LOGIN WITH OTP
// POST /api/auth/login
// ==========================================
export const loginWithOtp = async (req, res) => {
  try {
    const { sessionInfo, code } = req.body;

    if (!sessionInfo || !code) {
      return res.status(400).json({
        success: false,
        message: "sessionInfo and OTP are required",
      });
    }

    const cleanCode = String(code).replace(/\D/g, "").slice(0, 6);

    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ==========================================
    // VERIFY OTP WITH FIREBASE
    // ==========================================
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        sessionInfo,
        code: cleanCode,
        returnSecureToken: true,
      }
    );

    const { localId, idToken, phoneNumber } = response.data;

    // ==========================================
    // CHECK MEMBER
    // ==========================================

    const member = await Member.findOne({
      firebaseUid: localId,
      registrationStatus: "completed",
    });

    // ==========================================
    // USER HAS NOT JOINED
    // ==========================================
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Please join first",
      });
    }

    // ==========================================
    // SET HTTPONLY COOKIE
    // ==========================================
    res.cookie("firebaseToken", idToken, cookieOptions);

    // ==========================================
    // LOGIN SUCCESS
    // ==========================================
    return res.status(200).json({
      success: true,
      message: "Login successful",

      // UID authentication token nahi hai
      firebaseUid: localId,

      phoneNumber,

      member,
    });
  } catch (error) {
    console.error(
      "Firebase login error:",
      error.response?.data || error.message
    );

    return res.status(400).json({
      success: false,
      message: error.response?.data?.error?.message || "Login failed",
    });
  }
};

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================
export const getCurrentUser = async (req, res) => {
  try {
    const firebaseUid = req.firebaseUid;

    const member = await Member.findOne({
      firebaseUid,
      registrationStatus: "completed",
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};

// ==========================================
// LOGOUT
// POST /api/auth/logout
// ==========================================
export const logout = async (req, res) => {
  try {
    res.clearCookie("firebaseToken", {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
