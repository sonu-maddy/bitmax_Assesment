import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


// ================= BASE QUERY =================

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",

  credentials: "include",

  prepareHeaders: (
    headers,
    { getState }
  ) => {
    const token =
      getState().auth.accessToken;

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    headers.set(
      "Content-Type",
      "application/json"
    );

    return headers;
  },
});


// ================= USER API =================

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery,

  tagTypes: ["User"],

  endpoints: (builder) => ({

    // ================= GET PROFILE =================

    getProfile: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),

      providesTags: ["User"],
    }),
  }),
});


// ================= EXPORT HOOK =================

export const {
  useGetProfileQuery,
} = userApi;