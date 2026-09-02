import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import otpReducer from "../features/otp/otpSlice";

import { authApi } from "../features/auth/authApi";
import { otpApi } from "../features/otp/otpApi";
import { userApi } from "../features/user/userApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    otp: otpReducer,

    [authApi.reducerPath]:
      authApi.reducer,

    [otpApi.reducerPath]:
      otpApi.reducer,

    [userApi.reducerPath]:
      userApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(otpApi.middleware)
      .concat(userApi.middleware),
});