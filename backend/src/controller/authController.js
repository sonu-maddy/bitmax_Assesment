import jwt from "jsonwebtoken";

import User from "../model/userModel.js";

import { hashValue, compareValue } from "../utils/hash.js";

import { generateOtp } from "../utils/generateOtp.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import { sendOtpEmail } from "../config/email.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password are required.",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Either email or phone is required.",
      });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address.",
        });
      }
    }

    if (phone) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number.",
        });
      }
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        email ? { email: email.toLowerCase() } : null,
        phone ? { phone } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or phone already exists.",
      });
    }

    const hashedPassword = await hashValue(password);
    const otp = generateOtp();

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = new User({
      name,
      email: email ? email.toLowerCase() : undefined,
      phone,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent for verification.",
      data: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        otp,
        otpExpires: newUser.otpExpires,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    const isPasswordValid = await compareValue(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Generate 6-digit OTP
    const otp = generateOtp();

    // 5. OTP expiry - 5 minutes
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // 6. Save OTP in database
    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // 7. Send OTP to user's email
    await sendOtpEmail(normalizedEmail, otp);

    // 8. Success response
    // DO NOT return OTP in production
    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    console.log(
      "RESET PASSWORD BODY:",
      req.body
    );

    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select(
      "+otp +otpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP found",
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash new password
    const hashedPassword =
      await hashValue(newPassword);

    user.password = hashedPassword;

    // Clear OTP
    user.otp = undefined;
    user.otpExpires = undefined;

    // Invalidate refresh token
    user.refreshToken = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });

  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
