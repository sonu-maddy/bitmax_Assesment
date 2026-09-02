import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

export const otpApi = createApi({
  reducerPath: "otpApi",

  baseQuery,

  endpoints: (builder) => ({
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resendOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/resend-otp",
        method: "POST",
        body,
      }),
    }),

    requestEmailLoginOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/login/email/request-otp",
        method: "POST",
        body,
      }),
    }),

    verifyEmailLoginOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/login/email/verify-otp",
        method: "POST",
        body,
      }),
    }),

    requestPhoneLoginOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/login/phone/request-otp",
        method: "POST",
        body,
      }),
    }),

    verifyPhoneLoginOtp: builder.mutation({
      query: (body) => ({
        url: "/otp/login/phone/verify-otp",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useVerifyOtpMutation,
  useResendOtpMutation,
  useRequestEmailLoginOtpMutation,
  useVerifyEmailLoginOtpMutation,
  useRequestPhoneLoginOtpMutation,
  useVerifyPhoneLoginOtpMutation,
} = otpApi;