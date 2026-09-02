import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { registerSchema } from "../../validation/authValidation";
import { useRegisterMutation } from "../../features/auth/authApi";

const Register = () => {
    const navigate = useNavigate();

    const [registerUser, { isLoading }] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            console.log("FULL FORM DATA:", data);

            const { confirmPassword, ...userData } = data;

            console.log("REGISTER DATA:", userData);

            const response = await registerUser(userData).unwrap();

            console.log("Registration successful:", response);

            navigate("/verify-otp", {
                state: {
                    userId: response?.data?.userId,
                    email: userData.email,
                    phone: userData.phone,
                },
            });
        } catch (error) {
            console.error("Registration failed:", error);

            alert(
                error?.data?.message ||
                "Registration failed. Please try again."
            );
        }
    };

    const inputClass = (error) =>
        `w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition
        ${error
            ? "border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`;

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-6">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="px-5 sm:px-6 pt-6 pb-4 text-center">

                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                                B
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Create Account
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Register for Bitmax Authentication
                        </p>

                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="px-5 sm:px-6 pb-6 space-y-3.5"
                    >

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your name"
                                {...register("name")}
                                className={inputClass(errors.name)}
                            />

                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="sonu@gmail.com"
                                {...register("email")}
                                className={inputClass(errors.email)}
                            />

                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                placeholder="6307016696"
                                {...register("phone")}
                                className={inputClass(errors.phone)}
                            />

                            {errors.phone && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.phone.message}
                                </p>
                            )}
                        </div>

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
                                placeholder="Minimum 6 characters"
                                {...register("password")}
                                className={inputClass(errors.password)}
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
                                placeholder="Confirm your password"
                                {...register("confirmPassword")}
                                className={inputClass(errors.confirmPassword)}
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
                            className="w-full py-2.5 mt-1 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {isLoading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>

                    {/* Login */}
                    <div className="border-t border-slate-200 px-5 sm:px-6 py-4 text-center">

                        <p className="text-sm text-slate-500">
                            Already have an account?{" "}

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Login
                            </button>
                        </p>

                    </div>

                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    © 2026 Bitmax Authentication
                </p>

            </div>
        </div>
    );
};

export default Register;