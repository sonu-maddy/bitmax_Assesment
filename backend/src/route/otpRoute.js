import express from "express";

import {
  verifyOtp,
  requestEmailLoginOtp,
  verifyEmailLoginOtp,
  requestPhoneLoginOtp,
  verifyPhoneLoginOtp,
  resendOtp

} from "../controller/otpController.js";



const router = express.Router();


router.post("/verify-otp", verifyOtp);

router.post("/login/email/request-otp", requestEmailLoginOtp);
router.post("/login/email/verify-otp", verifyEmailLoginOtp);

router.post("/login/phone/request-otp", requestPhoneLoginOtp);
router.post("/login/phone/verify-otp", verifyPhoneLoginOtp);

router.post("/resend-otp", resendOtp);

export default router;