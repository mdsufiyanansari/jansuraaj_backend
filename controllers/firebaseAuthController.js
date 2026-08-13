import axios from "axios";
import Member from "../models/memberModel.js";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

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

    // +91 format ensure karo
    const phoneNumber = phone.startsWith("+")
      ? phone
      : `+91${phone.replace(/\D/g, "")}`;

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

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        sessionInfo,
        code,
        returnSecureToken: true,
      }
    );

    const { localId, idToken, refreshToken, expiresIn, phoneNumber } =
      response.data;

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
      firebaseUid: localId,
      idToken,
      refreshToken,
      expiresIn,
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

    // Firebase OTP verify
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        sessionInfo,
        code,
        returnSecureToken: true,
      }
    );

    const { localId, idToken, refreshToken, expiresIn, phoneNumber } =
      response.data;

    // ==========================================
    // CHECK MEMBER IN MONGODB
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
    // LOGIN SUCCESS
    // ==========================================
    return res.status(200).json({
      success: true,
      message: "Login successful",
      firebaseUid: localId,
      idToken,
      refreshToken,
      expiresIn,
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
