import { createSlice } from "@reduxjs/toolkit";

const storedAccessToken = localStorage.getItem("accessToken");

const initialState = {
  user: null,
  accessToken: storedAccessToken || null,

  isAuthenticated: !!storedAccessToken,

  // AuthInitializer ke liye
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    // Login / OTP verification
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;

      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = !!accessToken;
      state.isLoading = false;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
    },

    // Refresh token ke baad
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;

      if (action.payload) {
        localStorage.setItem(
          "accessToken",
          action.payload
        );
      }
    },

    // AuthInitializer loading control
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const {
  setCredentials,
  setAccessToken,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;