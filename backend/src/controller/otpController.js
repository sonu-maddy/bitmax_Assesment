import User from "../model/userModel.js";

import { generateOtp } from "../utils/generateOtp.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import {sendOtpEmail} from "../config/email.js";

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

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

    const otp = generateOtp();

    user.otp = otp;

    user.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });

  } catch (error) {
    console.error("Email OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
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

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+otp +otpExpires");

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

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
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
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.isPhoneVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your phone first.",
      });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Phone login OTP generated successfully.",
      data: {
        userId: user._id,
        otp, // Remove in production
      },
    });
  } catch (error) {
    console.error("Phone OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};




export const verifyPhoneLoginOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({
      phone,
    }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP found.",
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Phone OTP login successful.",
      data: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Phone OTP login error:", error);

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

    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

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
