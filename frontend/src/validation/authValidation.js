import { z } from "zod";

// ===============================
// REGISTER
// ===============================

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email"),

    phone: z
      .string()
      .trim()
      .regex(
        /^\+?[0-9]{10,15}$/,
        "Invalid phone number"
      ),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Please confirm your password"),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

// ===============================
// LOGIN
// ===============================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

// ===============================
// FORGOT PASSWORD
// ===============================

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email"),
});

// ===============================
// RESET PASSWORD
// ===============================

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email"),

    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "OTP must be exactly 6 digits"
      ),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    confirmPassword: z
      .string()
      .min(6, "Please confirm your password"),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

// ===============================
// OTP
// ===============================

export const otpSchema = z.object({
  otp: z
    .string()
    .regex(
      /^\d{6}$/,
      "OTP must be exactly 6 digits"
    ),
});