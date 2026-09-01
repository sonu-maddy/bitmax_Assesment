import express from "express";

import {
  registerUser,
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";
import { limiter } from "../middleware/rateLimiting.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",limiter, loginUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", limiter, forgotPassword);
router.post("/reset-password", limiter, resetPassword);

export default router;