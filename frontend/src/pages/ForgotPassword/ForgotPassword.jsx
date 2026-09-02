import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { forgotPasswordSchema } from "../../validation/authValidation";

import {
  useForgotPasswordMutation,
} from "../../features/auth/authApi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [forgotPassword, { isLoading }] =
    useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),

    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const email = data.email.toLowerCase().trim();

      const response = await forgotPassword({
        email,
      }).unwrap();

      console.log("Forgot password response:", response);

      alert(
        response?.message ||
          "Password reset OTP sent to your email"
      );

      // Email ko ResetPassword page par state ke through bhejo
      navigate("/reset-password", {
        state: {
          email,
        },
      });

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      alert(
        error?.data?.message ||
          "Unable to process request"
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
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter your email and we'll send you
              a reset OTP.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-4"
          >

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="sonu@gmail.com"
                {...register("email")}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none ${
                  errors.email
                    ? "border-red-500"
                    : "border-slate-300 focus:border-blue-500"
                }`}
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}

            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Sending OTP..."
                : "Send Reset OTP"}
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

export default ForgotPassword;