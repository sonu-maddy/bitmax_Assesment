import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  identifier: null,
  type: null,
  expiresAt: null,
  verificationStatus: "idle",
};

const otpSlice = createSlice({
  name: "otp",

  initialState,

  reducers: {
    setOtpMetadata: (state, action) => {
      state.identifier = action.payload.identifier;
      state.type = action.payload.type;
      state.expiresAt = action.payload.expiresAt;
      state.verificationStatus = "pending";
    },

    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },

    clearOtp: (state) => {
      state.identifier = null;
      state.type = null;
      state.expiresAt = null;
      state.verificationStatus = "idle";
    },
  },
});

export const {
  setOtpMetadata,
  setVerificationStatus,
  clearOtp,
} = otpSlice.actions;

export default otpSlice.reducer;