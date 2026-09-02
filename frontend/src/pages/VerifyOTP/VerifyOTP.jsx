import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";

import {
    useVerifyOtpMutation,
    useResendOtpMutation,
} from "../../features/otp/otpApi";

import { setOtpMetadata } from "../../features/otp/otpSlice";

import { useDispatch } from "react-redux";

import { z } from "zod";

const otpSchema = z.object({
    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must contain exactly 6 digits"),
});

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [timer, setTimer] = useState(60);

    const [verifyOtp, { isLoading: isVerifying }] =
        useVerifyOtpMutation();

    const [resendOtp, { isLoading: isResending }] =
        useResendOtpMutation();

    const email = location.state?.email;
    const phone = location.state?.phone;

    const identifier = email || phone;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    useEffect(() => {
        if (timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((previous) => previous - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (!identifier) {
            navigate("/register");
        }
    }, [identifier, navigate]);

    const onSubmit = async (data) => {
        try {
            const response = await verifyOtp({
                email,
                phone,
                otp: data.otp,
            }).unwrap();

            console.log("OTP verified successfully:", response);

            // OTP verification complete → Dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("OTP verification failed:", error);

            alert(
                error?.data?.message ||
                "OTP verification failed. Please try again."
            );
        }
    };

    const handleResend = async () => {
        if (timer > 0 || isResending) return;

        try {
            await resendOtp({
                email,
                phone,
            }).unwrap();

            setTimer(60);
            setValue("otp", "");

            console.log("OTP resent successfully");
        } catch (error) {
            console.error("Resend OTP failed:", error);
        }
    };

    const handleOtpChange = (event) => {
        const value = event.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setValue("otp", value, {
            shouldValidate: true,
        });
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
                            Verify OTP
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Enter the 6-digit OTP sent to
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 break-all">
                            {identifier}
                        </p>

                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="px-6 pb-6"
                    >

                        <label
                            htmlFor="otp"
                            className="block text-sm font-medium text-slate-700 mb-2"
                        >
                            One-Time Password
                        </label>

                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            {...register("otp")}
                            onChange={handleOtpChange}
                            className={`w-full text-center tracking-[0.5em] text-xl font-semibold px-4 py-3 rounded-lg border outline-none transition ${errors.otp
                                ? "border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                }`}
                        />

                        {errors.otp && (
                            <p className="mt-2 text-xs text-red-500">
                                {errors.otp.message}
                            </p>
                        )}

                        {/* Verify */}
                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full mt-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {isVerifying
                                ? "Verifying..."
                                : "Verify OTP"}
                        </button>

                        {/* Resend */}
                        <div className="text-center mt-5">

                            {timer > 0 ? (
                                <p className="text-sm text-slate-500">
                                    Resend OTP in{" "}
                                    <span className="font-semibold text-blue-600">
                                        {timer}s
                                    </span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                                >
                                    {isResending
                                        ? "Sending..."
                                        : "Resend OTP"}
                                </button>
                            )}

                        </div>

                        {/* Back */}
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700"
                        >
                            ← Back to Register
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

export default VerifyOTP;