import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import {
  useResetPasswordMutation,
} from "../../features/auth/authApi";

const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "OTP must contain exactly 6 digits"
      ),

    password: z
      .string()
      .min(
        6,
        "Password must be at least 6 characters"
      ),

    confirmPassword: z
      .string()
      .min(
        6,
        "Confirm password is required"
      ),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [
    resetPassword,
    { isLoading },
  ] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),

    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response =
        await resetPassword({
          email,
          otp: data.otp,
          password: data.password,
        }).unwrap();

      console.log(
        "Password reset:",
        response
      );

      alert(
        response?.message ||
          "Password reset successfully"
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      alert(
        error?.data?.message ||
          "Invalid or expired OTP"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

          {/* Header */}

          <div className="px-6 pt-7 pb-5 text-center">

            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                B
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-slate-500 break-all">
              Reset password for{" "}
              {email || "your account"}
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-4"
          >

            {/* OTP */}

            <div>

              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                {...register("otp")}
                className={`w-full px-3 py-3 rounded-lg border text-center tracking-[0.5em] text-lg outline-none ${
                  errors.otp
                    ? "border-red-500"
                    : "border-slate-300 focus:border-blue-500"
                }`}
              />

              {errors.otp && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.otp.message}
                </p>
              )}

            </div>

            {/* New Password */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                {...register("password")}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${
                  errors.password
                    ? "border-red-500"
                    : "border-slate-300 focus:border-blue-500"
                }`}
              />

              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-slate-300 focus:border-blue-500"
                }`}
              />

              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>

          {/* Back */}

          <div className="border-t border-slate-200 px-6 py-4 text-center">

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              ← Back to Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ResetPassword;