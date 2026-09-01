import express from "express";

import {
  getProfile,
} from "../controller/userController.js";

import {authenticateUser} from '../middleware/authenticateUser.js'

const router = express.Router();

router.get("/profile", authenticateUser, getProfile);

export default router;