import User from "../model/userModel.js";

import { generateOtp } from "../utils/generateOtp.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import { sendOtpEmail } from "../config/email.js";

import {
  sendPhoneOtp,
  verifyPhoneOtpCode,
  normalizePhoneNumber,
} from "../service/phoneOtpService.js";

export const verifyOtp = async (req, res) => {
  try {
    const { userId, email, otp } = req.body;

    if ((!userId && !email) || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID or email and OTP are required.",
      });
    }

    const user = userId
      ? await User.findById(userId).select("+otp +otpExpires")
      : await User.findOne({
          email: email.toLowerCase().trim(),
        }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    console.log("OTP from DB:", user.otp);
    console.log("OTP expiry:", user.otpExpires);

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this user.",
      });
    }

    if (!user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expiry information not found.",
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (user.email) {
      user.isEmailVerified = true;
    }

    if (user.phone) {
      user.isPhoneVerified = true;
    }

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification.",
    });
  }
};

export const requestEmailLoginOtp = async (req, res) => {
  try {
    console.log("📧 EMAIL OTP REQUEST:", req.body);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("📧 Normalized email:", normalizedEmail);

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("👤 User found:", user.email);
    console.log("📧 Email verified:", user.isEmailVerified);

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const otp = generateOtp();

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    console.log("🔐 OTP generated");
    console.log("⏰ OTP expires:", otpExpires);

    // Send OTP email
    console.log("📤 Sending OTP email...");

    await sendOtpEmail(normalizedEmail, otp);

    console.log("✅ EMAIL OTP SENT SUCCESSFULLY");

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("❌ EMAIL OTP ERROR MESSAGE:", error.message);

    console.error("❌ EMAIL OTP ERROR CODE:", error.code);

    console.error("❌ EMAIL OTP ERROR RESPONSE:", error.response);

    console.error("❌ FULL ERROR:", error);

    return res.status(500).json({
      success: false,

      // Temporary: actual error frontend me dikhega
      message: error.message || "Failed to send OTP",
    });
  }
};

export const verifyEmailLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP.",
      });
    }

    if (new Date() > user.otpExpires) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    user.lastLoginAt = new Date();

    await user.save();

    // Refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Email OTP login successful",
      data: {
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Verify email OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const requestPhoneLoginOtp = async (req, res) => {
  try {
    console.log("📱 PHONE OTP REQUEST:", req.body);

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    let user = await User.findOne({
      phone: phone.toString().trim(),
    });

    if (!user) {
      user = await User.findOne({
        phone: normalizedPhone,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Phone Verification Check
    |--------------------------------------------------------------------------
    */

    if (!user.isPhoneVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your phone first.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Send OTP Through Twilio
    |--------------------------------------------------------------------------
    */

    const verification = await sendPhoneOtp(normalizedPhone);

    if (verification.status !== "pending") {
      return res.status(500).json({
        success: false,
        message: "Failed to send phone OTP.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your phone.",
    });
  } catch (error) {
    console.error("❌ Phone OTP request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send phone OTP.",
    });
  }
};

export const verifyPhoneLoginOtp = async (req, res) => {
  try {
    console.log("🔐 PHONE OTP VERIFY:", req.body);

    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required.",
      });
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    let user = await User.findOne({
      phone: phone.toString().trim(),
    });

    if (!user) {
      user = await User.findOne({
        phone: normalizedPhone,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check Phone Verification
    |--------------------------------------------------------------------------
    */

    if (!user.isPhoneVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your phone first.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify OTP Through Twilio
    |--------------------------------------------------------------------------
    */

    const verification = await verifyPhoneOtpCode(normalizedPhone, otp);

    console.log("🔐 TWILIO RESULT:", verification.status);

    if (verification.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate JWT Tokens
    |--------------------------------------------------------------------------
    */

    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    /*
    |--------------------------------------------------------------------------
    | Save Refresh Token
    |--------------------------------------------------------------------------
    */

    user.refreshToken = refreshToken;

    user.lastLoginAt = new Date();

    await user.save();

    /*
    |--------------------------------------------------------------------------
    | Refresh Token Cookie
    |--------------------------------------------------------------------------
    */

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message: "Phone OTP login successful",

      data: {
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,

          isEmailVerified: user.isEmailVerified,

          isPhoneVerified: user.isPhoneVerified,
        },

        accessToken,

        refreshToken,
      },
    });
  } catch (error) {
    console.error("❌ Phone OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone is required",
      });
    }

    const user = email
      ? await User.findOne({
          email: email.toLowerCase().trim(),
        })
      : await User.findOne({
          phone: phone.trim(),
        });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        otp,
        otpExpires,
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
};
