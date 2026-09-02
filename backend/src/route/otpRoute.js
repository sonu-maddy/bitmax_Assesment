import express from "express";

import {
  verifyOtp,
  requestEmailLoginOtp,
  verifyEmailLoginOtp,
  requestPhoneLoginOtp,
  verifyPhoneLoginOtp,
  resendOtp,
} from "../controller/otpController.js";

const router = express.Router();

// Registration OTP
router.post("/verify-otp", verifyOtp);

// Email OTP Login
router.post(
  "/login/email/request-otp",
  requestEmailLoginOtp
);

router.post(
  "/login/email/verify-otp",
  verifyEmailLoginOtp
);

// Phone OTP Login - Twilio
router.post(
  "/login/phone/request-otp",
  requestPhoneLoginOtp
);

router.post(
  "/login/phone/verify-otp",
  verifyPhoneLoginOtp
);

// Resend OTP
router.post(
  "/resend-otp",
  resendOtp
);

export default router;