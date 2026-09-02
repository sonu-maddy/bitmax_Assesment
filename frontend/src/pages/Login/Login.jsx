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

/* =========================================================
   VALIDATION SCHEMAS
========================================================= */

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

    otp: z
        .string()
        .optional(),
});

const phoneOtpSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(
            /^\+?[0-9]{10,15}$/,
            "Enter a valid phone number"
        ),

    otp: z
        .string()
        .optional(),
});

/* =========================================================
   LOGIN COMPONENT
========================================================= */

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    /* =====================================================
       LOGIN METHOD
    ===================================================== */

    const [method, setMethod] = useState("password");

    /* =====================================================
       SEPARATE OTP STATES
       IMPORTANT
    ===================================================== */

    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);

    /* =====================================================
       API MUTATIONS
    ===================================================== */

    const [
        loginUser,
        {
            isLoading: loginLoading,
        },
    ] = useLoginMutation();

    const [
        requestEmailOtp,
        {
            isLoading: emailOtpLoading,
        },
    ] = useRequestEmailLoginOtpMutation();

    const [
        requestPhoneOtp,
        {
            isLoading: phoneOtpLoading,
        },
    ] = useRequestPhoneLoginOtpMutation();

    const [
        verifyEmailOtp,
        {
            isLoading: verifyEmailLoading,
        },
    ] = useVerifyEmailLoginOtpMutation();

    const [
        verifyPhoneOtp,
        {
            isLoading: verifyPhoneLoading,
        },
    ] = useVerifyPhoneLoginOtpMutation();

    /* =====================================================
       PASSWORD FORM
    ===================================================== */

    const passwordForm = useForm({
        resolver: zodResolver(passwordSchema),

        defaultValues: {
            email: "",
            password: "",
        },
    });

    /* =====================================================
       EMAIL OTP FORM
    ===================================================== */

    const emailForm = useForm({
        resolver: zodResolver(emailOtpSchema),

        defaultValues: {
            email: "",
            otp: "",
        },
    });

    /* =====================================================
       PHONE OTP FORM
    ===================================================== */

    const phoneForm = useForm({
        resolver: zodResolver(phoneOtpSchema),

        defaultValues: {
            phone: "",
            otp: "",
        },
    });

    /* =====================================================
       PASSWORD LOGIN
    ===================================================== */

    const handlePasswordLogin = async (data) => {
        try {
            const payload = {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            };

            console.log(
                "🔥 PASSWORD LOGIN PAYLOAD:",
                payload
            );

            const response =
                await loginUser(payload).unwrap();

            console.log(
                "🔥 PASSWORD LOGIN RESPONSE:",
                response
            );

            const accessToken =
                response?.data?.accessToken;

            const refreshToken =
                response?.data?.refreshToken;

            if (!accessToken) {
                throw new Error(
                    "Access token not received from server"
                );
            }

            /* Save access token */

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            /* Save refresh token */

            if (refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    refreshToken
                );
            }

            /* Redux */

            dispatch(
                setCredentials({
                    user:
                        response?.data?.user ||
                        response?.data,

                    accessToken,
                })
            );

            /* Dashboard */

            navigate("/dashboard");

        } catch (error) {
            console.error(
                "🔥 PASSWORD LOGIN ERROR:",
                error
            );

            alert(
                error?.data?.message ||
                error?.message ||
                "Invalid email or password"
            );
        }
    };

    /* =====================================================
       EMAIL OTP REQUEST
    ===================================================== */

    const handleEmailOtpRequest = async (data) => {
        try {
            const email =
                data.email
                    ?.trim()
                    .toLowerCase();

            console.log(
                "🔥 EMAIL ENTERED:",
                email
            );

            if (!email) {
                alert(
                    "Please enter your email"
                );

                return;
            }

            /*
             * Make sure email stays in form
             */

            emailForm.setValue(
                "email",
                email
            );

            /*
             * Request OTP
             */

            const response =
                await requestEmailOtp({
                    email,
                }).unwrap();

            console.log(
                "🔥 EMAIL OTP RESPONSE:",
                response
            );

            /*
             * Show OTP input
             */

            setEmailOtpSent(true);

            alert(
                response?.message ||
                "OTP sent to your email"
            );

        } catch (error) {
            console.error(
                "🔥 EMAIL OTP REQUEST ERROR:",
                error
            );

            alert(
                error?.data?.message ||
                error?.message ||
                "Failed to send OTP"
            );
        }
    };

    /* =====================================================
       EMAIL OTP VERIFY
    ===================================================== */

    const handleEmailOtpVerify = async (data) => {
        try {
            /*
             * Get email directly from
             * the same email form
             */

            const email =
                emailForm
                    .getValues("email")
                    ?.trim()
                    .toLowerCase();

            const otp =
                data.otp
                    ?.toString()
                    .trim();

            console.log(
                "🔥 EMAIL FROM FORM:",
                email
            );

            console.log(
                "🔥 EMAIL OTP:",
                otp
            );

            if (!email) {
                alert(
                    "Email not found. Please request OTP again."
                );

                return;
            }

            if (!otp) {
                alert(
                    "Please enter OTP"
                );

                return;
            }

            const payload = {
                email,
                otp,
            };

            console.log(
                "🔥 EMAIL OTP VERIFY PAYLOAD:",
                payload
            );

            /*
             * Verify OTP
             */

            const response =
                await verifyEmailOtp(
                    payload
                ).unwrap();

            console.log(
                "🔥 EMAIL OTP LOGIN RESPONSE:",
                response
            );

            /*
             * Get tokens
             */

            const accessToken =
                response?.data?.accessToken;

            const refreshToken =
                response?.data?.refreshToken;

            if (!accessToken) {
                throw new Error(
                    "Access token not received from server"
                );
            }

            /*
             * Save tokens
             */

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            if (refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    refreshToken
                );
            }

            /*
             * Redux
             */

            dispatch(
                setCredentials({
                    user:
                        response?.data?.user ||
                        response?.data,

                    accessToken,
                })
            );

            /*
             * Dashboard
             */

            navigate("/dashboard");

        } catch (error) {
            console.error(
                "🔥 EMAIL OTP VERIFICATION ERROR:",
                error
            );

            console.error(
                "🔥 ERROR DATA:",
                error?.data
            );

            alert(
                error?.data?.message ||
                error?.message ||
                "Invalid OTP"
            );
        }
    };

    /* =====================================================
       PHONE OTP REQUEST
    ===================================================== */

    const handlePhoneOtpRequest = async (data) => {
        try {
            const phone =
                data.phone
                    ?.trim();

            console.log(
                "🔥 PHONE ENTERED:",
                phone
            );

            if (!phone) {
                alert(
                    "Please enter your phone number"
                );

                return;
            }

            /*
             * Save normalized phone
             */

            phoneForm.setValue(
                "phone",
                phone
            );

            /*
             * Request OTP
             */

            const response =
                await requestPhoneOtp({
                    phone,
                }).unwrap();

            console.log(
                "🔥 PHONE OTP RESPONSE:",
                response
            );

            /*
             * Show OTP input
             */

            setPhoneOtpSent(true);

            alert(
                response?.message ||
                "OTP sent to your phone"
            );

        } catch (error) {
            console.error(
                "🔥 PHONE OTP REQUEST ERROR:",
                error
            );

            alert(
                error?.data?.message ||
                error?.message ||
                "Unable to send OTP"
            );
        }
    };

    /* =====================================================
       PHONE OTP VERIFY
    ===================================================== */

    const handlePhoneOtpVerify = async (data) => {
        try {
            const phone =
                phoneForm
                    .getValues("phone")
                    ?.trim();

            const otp =
                data.otp
                    ?.toString()
                    .trim();

            console.log(
                "🔥 PHONE:",
                phone
            );

            console.log(
                "🔥 PHONE OTP:",
                otp
            );

            if (!phone) {
                alert(
                    "Phone number not found. Please request OTP again."
                );

                return;
            }

            if (!otp) {
                alert(
                    "Please enter OTP"
                );

                return;
            }

            const payload = {
                phone,
                otp,
            };

            console.log(
                "🔥 PHONE OTP VERIFY PAYLOAD:",
                payload
            );

            const response =
                await verifyPhoneOtp(
                    payload
                ).unwrap();

            console.log(
                "🔥 PHONE OTP LOGIN RESPONSE:",
                response
            );

            const accessToken =
                response?.data?.accessToken;

            const refreshToken =
                response?.data?.refreshToken;

            if (!accessToken) {
                throw new Error(
                    "Access token not received"
                );
            }

            /*
             * Save tokens
             */

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            if (refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    refreshToken
                );
            }

            /*
             * Redux
             */

            dispatch(
                setCredentials({
                    user:
                        response?.data?.user ||
                        response?.data,

                    accessToken,
                })
            );

            /*
             * Dashboard
             */

            navigate("/dashboard");

        } catch (error) {
            console.error(
                "🔥 PHONE OTP VERIFICATION ERROR:",
                error
            );

            alert(
                error?.data?.message ||
                error?.message ||
                "Invalid OTP"
            );
        }
    };

    /* =====================================================
       CHANGE LOGIN METHOD
    ===================================================== */

    const changeMethod = (newMethod) => {
        setMethod(newMethod);

        /*
         * Reset OTP states
         */

        setEmailOtpSent(false);
        setPhoneOtpSent(false);

        /*
         * Reset OTP values
         */

        emailForm.setValue(
            "otp",
            ""
        );

        phoneForm.setValue(
            "otp",
            ""
        );
    };

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">

                    {/* =================================================
                        HEADER
                    ================================================= */}

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

                    {/* =================================================
                        LOGIN METHODS
                    ================================================= */}

                    <div className="px-6">

                        <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-1">

                            {/* Password */}

                            <button
                                type="button"
                                onClick={() =>
                                    changeMethod("password")
                                }
                                className={`py-2 text-xs sm:text-sm rounded-md font-medium ${
                                    method === "password"
                                        ? "bg-white shadow text-blue-600"
                                        : "text-slate-500"
                                }`}
                            >
                                Password
                            </button>

                            {/* Email OTP */}

                            <button
                                type="button"
                                onClick={() =>
                                    changeMethod("email")
                                }
                                className={`py-2 text-xs sm:text-sm rounded-md font-medium ${
                                    method === "email"
                                        ? "bg-white shadow text-blue-600"
                                        : "text-slate-500"
                                }`}
                            >
                                Email OTP
                            </button>

                            {/* Phone OTP */}

                            <button
                                type="button"
                                onClick={() =>
                                    changeMethod("phone")
                                }
                                className={`py-2 text-xs sm:text-sm rounded-md font-medium ${
                                    method === "phone"
                                        ? "bg-white shadow text-blue-600"
                                        : "text-slate-500"
                                }`}
                            >
                                Phone OTP
                            </button>

                        </div>

                    </div>

                    {/* =================================================
                        PASSWORD LOGIN
                    ================================================= */}

                    {method === "password" && (

                        <form
                            onSubmit={passwordForm.handleSubmit(
                                handlePasswordLogin
                            )}
                            className="px-6 py-6 space-y-4"
                        >

                            {/* Email */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    placeholder="sonu@gmail.com"
                                    {...passwordForm.register(
                                        "email"
                                    )}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />

                                {passwordForm.formState.errors.email && (

                                    <p className="text-xs text-red-500 mt-1">

                                        {
                                            passwordForm
                                                .formState
                                                .errors
                                                .email
                                                .message
                                        }

                                    </p>

                                )}

                            </div>

                            {/* Password */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    {...passwordForm.register(
                                        "password"
                                    )}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />

                                {passwordForm.formState.errors.password && (

                                    <p className="text-xs text-red-500 mt-1">

                                        {
                                            passwordForm
                                                .formState
                                                .errors
                                                .password
                                                .message
                                        }

                                    </p>

                                )}

                            </div>

                            {/* Forgot Password */}

                            <div className="text-right">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/forgot-password"
                                        )
                                    }
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot Password?
                                </button>

                            </div>

                            {/* Login */}

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

                    {/* =================================================
                        EMAIL OTP LOGIN
                    ================================================= */}

                    {method === "email" && (

                        <form
                            onSubmit={
                                emailOtpSent
                                    ? emailForm.handleSubmit(
                                        handleEmailOtpVerify
                                    )
                                    : emailForm.handleSubmit(
                                        handleEmailOtpRequest
                                    )
                            }
                            className="px-6 py-6 space-y-4"
                        >

                            {/* Email */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    disabled={emailOtpSent}
                                    placeholder="sonu@gmail.com"
                                    {...emailForm.register(
                                        "email"
                                    )}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-100"
                                />

                                {emailForm.formState.errors.email && (

                                    <p className="text-xs text-red-500 mt-1">

                                        {
                                            emailForm
                                                .formState
                                                .errors
                                                .email
                                                .message
                                        }

                                    </p>

                                )}

                            </div>

                            {/* OTP */}

                            {emailOtpSent && (

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        OTP
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="Enter 6-digit OTP"
                                        {...emailForm.register(
                                            "otp"
                                        )}
                                        className="w-full px-3 py-3 text-center tracking-[0.5em] border border-slate-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    />

                                </div>

                            )}

                            {/* Submit */}

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
                                    : emailOtpSent
                                    ? "Verify OTP"
                                    : "Send OTP"}
                            </button>

                            {/* Change Email */}

                            {emailOtpSent && (

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmailOtpSent(
                                            false
                                        );

                                        emailForm.setValue(
                                            "otp",
                                            ""
                                        );
                                    }}
                                    className="w-full text-sm text-blue-600 hover:underline"
                                >
                                    Change Email
                                </button>

                            )}

                        </form>

                    )}

                    {/* =================================================
                        PHONE OTP LOGIN
                    ================================================= */}

                    {method === "phone" && (

                        <form
                            onSubmit={
                                phoneOtpSent
                                    ? phoneForm.handleSubmit(
                                        handlePhoneOtpVerify
                                    )
                                    : phoneForm.handleSubmit(
                                        handlePhoneOtpRequest
                                    )
                            }
                            className="px-6 py-6 space-y-4"
                        >

                            {/* Phone */}

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    disabled={phoneOtpSent}
                                    placeholder="6307016696"
                                    {...phoneForm.register(
                                        "phone"
                                    )}
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 disabled:bg-slate-100"
                                />

                                {phoneForm.formState.errors.phone && (

                                    <p className="text-xs text-red-500 mt-1">

                                        {
                                            phoneForm
                                                .formState
                                                .errors
                                                .phone
                                                .message
                                        }

                                    </p>

                                )}

                            </div>

                            {/* OTP */}

                            {phoneOtpSent && (

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        OTP
                                    </label>

                                    <input
                                        type="text"
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="Enter 6-digit OTP"
                                        {...phoneForm.register(
                                            "otp"
                                        )}
                                        className="w-full px-3 py-3 text-center tracking-[0.5em] border border-slate-300 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    />

                                </div>

                            )}

                            {/* Submit */}

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
                                    : phoneOtpSent
                                    ? "Verify OTP"
                                    : "Send OTP"}
                            </button>

                            {/* Change Phone */}

                            {phoneOtpSent && (

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhoneOtpSent(
                                            false
                                        );

                                        phoneForm.setValue(
                                            "otp",
                                            ""
                                        );
                                    }}
                                    className="w-full text-sm text-blue-600 hover:underline"
                                >
                                    Change Phone
                                </button>

                            )}

                        </form>

                    )}

                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <div className="border-t border-slate-200 px-6 py-4 text-center">

                        <p className="text-sm text-slate-500">

                            Don't have an account?{" "}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/register"
                                    )
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