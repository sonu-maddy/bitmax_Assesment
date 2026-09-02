import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { setCredentials, setAccessToken, logout } from "./authSlice";

import API_URL from "../../services/api";

// ================= BASE QUERY =================
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,

  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");

    return headers;
  },
});

console.log("API URL:", import.meta.env.VITE_API_URL);

// ================= REFRESH TOKEN =================

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // Login/register jaise public APIs par refresh mat karo
  const url = typeof args === "string" ? args : args?.url;

  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/otp/verify-otp",
    "/otp/resend-otp",
    "/otp/login/email/request-otp",
    "/otp/login/email/verify-otp",
  ];

  const isPublicRoute = publicRoutes.includes(url);

  if (result?.error?.status === 401 && !isPublicRoute) {
    console.log("Access token expired. Refreshing...");

    const refreshResult = await baseQuery(
      {
        url: "/auth/refresh-token",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult?.data?.data?.accessToken) {
      const newAccessToken = refreshResult.data.data.accessToken;

      api.dispatch(setAccessToken(newAccessToken));

      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Refresh token failed");
      api.dispatch(logout());
    }
  }

  return result;
};

// ================= AUTH API =================

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["User"],

  endpoints: (builder) => ({
    // ================= REGISTER =================

    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    // ================= LOGIN =================

    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setCredentials({
              user: data.data,
              accessToken: data.data.accessToken,
            }),
          );
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    // ================= REFRESH TOKEN =================

    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
    }),

    // ================= SET PASSWORD =================

    setPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/set-password",
        method: "POST",
        body,
      }),
    }),

    // ================= FORGOT PASSWORD =================

    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    // ================= RESET PASSWORD =================

    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    // ================= LOGOUT =================

    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Logout API error:", error);
        } finally {
          dispatch(logout());
        }
      },
    }),
  }),
});

// ================= EXPORT HOOKS =================

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useSetPasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutUserMutation,
} = authApi;
