import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
    useLoginMutation,
} from "../../features/auth/authApi";

import {
    useRequestEmailLoginOtpMutation,
    useRequestPhoneLoginOtpMutation,
    useVerifyEmailLoginOtpMutation,
    useVerifyPhoneLoginOtpMutation,
} from "../../features/otp/otpApi";

import { setCredentials } from "../../features/auth/authSlice";

const passwordSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

const emailOtpSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email"),
});

const phoneOtpSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(
            /^\+?[0-9]{10,15}$/,
            "Enter a valid phone number"
        ),
});

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [method, setMethod] = useState("password");

    const [otpSent, setOtpSent] = useState(false);

    const [loginUser, { isLoading: loginLoading }] =
        useLoginMutation();

    const [
        requestEmailOtp,
        { isLoading: emailOtpLoading },
    ] = useRequestEmailLoginOtpMutation();

    const [
        requestPhoneOtp,
        { isLoading: phoneOtpLoading },
    ] = useRequestPhoneLoginOtpMutation();

    const [
        verifyEmailOtp,
        { isLoading: verifyEmailLoading },
    ] = useVerifyEmailLoginOtpMutation();

    const [
        verifyPhoneOtp,
        { isLoading: verifyPhoneLoading },
    ] = useVerifyPhoneLoginOtpMutation();

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const emailForm = useForm({
        resolver: zodResolver(emailOtpSchema),
        defaultValues: {
            email: "",
            otp: "",
        },
    });

    const phoneForm = useForm({
        resolver: zodResolver(phoneOtpSchema),
        defaultValues: {
            phone: "",
            otp: "",
        },
    });

    const handlePasswordLogin = async (data) => {
        try {
            const response = await loginUser(data).unwrap();

            console.log("LOGIN RESPONSE:", response);

            const accessToken = response?.data?.accessToken;
            const refreshToken = response?.data?.refreshToken;

            if (!accessToken) {
                throw new Error("Access token not received from server");
            }

            // Save tokens
            localStorage.setItem("accessToken", accessToken);

            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            // Redux state
            dispatch(
                setCredentials({
                    user: response.data.user || response.data,
                    accessToken,
                })
            );

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);

            alert(
                error?.data?.message ||
                error?.message ||
                "Invalid email or password"
            );
        }
    };

    const handleEmailOtpRequest = async (data) => {
        try {
            await requestEmailOtp({
                email: data.email,
            }).unwrap();

            setOtpSent(true);

            alert("OTP sent to your email");
        } catch (error) {
            console.error(error);

            alert(
                error?.data?.message ||
                "Unable to send OTP"
            );
        }
    };

    const handleEmailOtpVerify = async (data) => {
        try {
            const response = await verifyEmailOtp({
                email: emailForm.getValues("email"),
                otp: data.otp,
            }).unwrap();

            console.log("EMAIL OTP LOGIN RESPONSE:", response);

            const accessToken = response?.data?.accessToken;
            const refreshToken = response?.data?.refreshToken;

            if (!accessToken) {
                throw new Error("Access token not received");
            }

            localStorage.setItem("accessToken", accessToken);

            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            dispatch(
                setCredentials({
                    user: response.data.user || response.data,
                    accessToken,
                })
            );

            navigate("/dashboard");
        } catch (error) {
            console.error("Email OTP verification failed:", error);

            alert(
                error?.data?.message ||
                "Invalid OTP"
            );
        }
    };
    const handlePhoneOtpRequest = async (data) => {
        try {
            await requestPhoneOtp({
                phone: data.phone,
            }).unwrap();

            setOtpSent(true);

            alert("OTP sent to your phone");
        } catch (error) {
            console.error(error);

            alert(
                error?.data?.message ||
                "Unable to send OTP"
            );
        }
    };

    const handlePhoneOtpVerify = async (data) => {
        try {
            const response = await verifyPhoneOtp({
                phone: phoneForm.getValues("phone"),
                otp: data.otp,
            }).unwrap();

            console.log("PHONE OTP LOGIN RESPONSE:", response);

            const accessToken = response?.data?.accessToken;
            const refreshToken = response?.data?.refreshToken;

            if (!accessToken) {
                throw new Error("Access token not received");
            }

            localStorage.setItem("accessToken", accessToken);

            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            dispatch(
                setCredentials({
                    user: response.data.user || response.data,
                    accessToken,
                })
            );

            navigate("/dashboard");
        } catch (error) {
            console.error("Phone OTP verification failed:", error);

            alert(
                error?.data?.message ||
                "Invalid OTP"
            );
        }
    };
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

                    {/* Header */}

                    <div className="px-6 pt-6 pb-4 text-center">

                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">
                                B
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Welcome Back
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Login to your Bitmax account
                        </p>

                    </div>

                    {/* Methods */}

                    <div className="px-6">

                        <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-1">

                            <button
                                type="button"
                                onClick={() => {
                                    setMethod("password");
                                    setOtpSent(false);
                                }}
                                className={`py-2 text-xs sm:text-sm rounded-md font-medium ${method === "password"
                                    ? "bg-white shadow text-blue-600"
                                    : "text-slate-500"
                                    }`}
                            >
                                Password
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMethod("email");
                                    setOtpSent(false);
                                }}
                                className={`py-2 text-xs sm:text-sm rounded-md font-medium ${method === "email"
                                    ? "bg-white shadow text-blue-600"
                                    : "text-slate-500"
                                    }`}
                            >
                                Email OTP
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setMethod("phone");
                                    setOtpSent(false);
                                }}
                                className={`py-2 text-xs sm:text-sm rounded-md font-medium ${method === "phone"
                                    ? "bg-white shadow text-blue-600"
                                    : "text-slate-500"
                                    }`}
                            >
                                Phone OTP
                            </button>

                        </div>

                    </div>

                    {/* Password Login */}

                    {method === "password" && (
                        <form
                            onSubmit={passwordForm.handleSubmit(
                                handlePasswordLogin
                            )}
                            className="px-6 py-6 space-y-4"
                        >

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="sonu@gmail.com"
                                    {...passwordForm.register("email")}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />

                                {passwordForm.formState.errors.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {
                                            passwordForm.formState
                                                .errors.email.message
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    {...passwordForm.register("password")}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />

                                {passwordForm.formState.errors.password && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {
                                            passwordForm.formState
                                                .errors.password.message
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/forgot-password")
                                    }
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
                            >
                                {loginLoading
                                    ? "Logging in..."
                                    : "Login"}
                            </button>

                        </form>
                    )}

                    {/* Email OTP */}

                    {method === "email" && (
                        <form
                            onSubmit={
                                otpSent
                                    ? emailForm.handleSubmit(
                                        handleEmailOtpVerify
                                    )
                                    : emailForm.handleSubmit(
                                        handleEmailOtpRequest
                                    )
                            }
                            className="px-6 py-6 space-y-4"
                        >

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    disabled={otpSent}
                                    placeholder="sonu@gmail.com"
                                    {...emailForm.register("email")}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-100"
                                />

                                {emailForm.formState.errors.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {
                                            emailForm.formState.errors.email
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {otpSent && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        OTP
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={6}
                                        inputMode="numeric"
                                        placeholder="Enter 6-digit OTP"
                                        {...emailForm.register("otp")}
                                        className="w-full px-3 py-3 text-center tracking-[0.5em] border border-slate-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    emailOtpLoading ||
                                    verifyEmailLoading
                                }
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
                            >
                                {emailOtpLoading ||
                                    verifyEmailLoading
                                    ? "Please wait..."
                                    : otpSent
                                        ? "Verify OTP"
                                        : "Send OTP"}
                            </button>

                        </form>
                    )}

                    {/* Phone OTP */}

                    {method === "phone" && (
                        <form
                            onSubmit={
                                otpSent
                                    ? phoneForm.handleSubmit(
                                        handlePhoneOtpVerify
                                    )
                                    : phoneForm.handleSubmit(
                                        handlePhoneOtpRequest
                                    )
                            }
                            className="px-6 py-6 space-y-4"
                        >

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    disabled={otpSent}
                                    placeholder="6307016696"
                                    {...phoneForm.register("phone")}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-100"
                                />

                                {phoneForm.formState.errors.phone && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {
                                            phoneForm.formState.errors.phone
                                                .message
                                        }
                                    </p>
                                )}
                            </div>

                            {otpSent && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        OTP
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={6}
                                        inputMode="numeric"
                                        placeholder="Enter 6-digit OTP"
                                        {...phoneForm.register("otp")}
                                        className="w-full px-3 py-3 text-center tracking-[0.5em] border border-slate-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    phoneOtpLoading ||
                                    verifyPhoneLoading
                                }
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
                            >
                                {phoneOtpLoading ||
                                    verifyPhoneLoading
                                    ? "Please wait..."
                                    : otpSent
                                        ? "Verify OTP"
                                        : "Send OTP"}
                            </button>

                        </form>
                    )}

                    {/* Register */}

                    <div className="border-t border-slate-200 px-6 py-4 text-center">

                        <p className="text-sm text-slate-500">
                            Don't have an account?{" "}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/register")
                                }
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                Register
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

export default Login;