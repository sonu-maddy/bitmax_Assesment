import { Routes, Route } from "react-router-dom";

import Register from "../pages/Register/Register";
import VerifyOTP from "../pages/VerifyOTP/VerifyOTP";
import SetPassword from "../pages/SetPassword/SetPassword";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";

import NotFound from "../pages/NotFound/NotFound";

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOTP />}
      />

      <Route
        path="/set-password"
        element={<SetPassword />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* ================= PROTECTED ROUTES ================= */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>

      {/* ================= 404 ================= */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
};

export default AppRoutes;