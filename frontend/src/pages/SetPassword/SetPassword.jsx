import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import {
  useSetPasswordMutation,
} from "../../features/auth/authApi";

const setPasswordSchema = z
  .object({
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

const SetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const phone = location.state?.phone;

  const [
    setPassword,
    { isLoading },
  ] = useSetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      setPasswordSchema
    ),

    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response =
        await setPassword({
          email,
          phone,
          password: data.password,
        }).unwrap();

      console.log(
        "Password created:",
        response
      );

      alert(
        response?.message ||
          "Password created successfully"
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Set password error:",
        error
      );

      alert(
        error?.data?.message ||
          "Unable to set password"
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
              Set Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Create a secure password for your account.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 space-y-4"
          >

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password")}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition ${
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
                placeholder="Confirm password"
                {...register("confirmPassword")}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition ${
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
                ? "Creating Password..."
                : "Set Password"}
            </button>

          </form>

        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          © 2026 Bitmax Authentication
        </p>

      </div>

    </div>
  );
};

export default SetPassword;