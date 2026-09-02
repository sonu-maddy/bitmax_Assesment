import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


console.log(
  "TEST_VARIABLE:",
  process.env.TEST_VARIABLE
);

import userRoutes from "./src/route/userRoutes.js";
import otpRoute from "./src/route/otpRoute.js";
import authRoute from "./src/route/authRoute.js";
import connectDB from "./src/config/db.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://bitmax-assesment.vercel.app",
];

/*
|--------------------------------------------------------------------------
| ENV CHECK
|--------------------------------------------------------------------------
*/

console.log("========== ENV CHECK ==========");

console.log(
  "TWILIO_ACCOUNT_SID:",
  process.env.TWILIO_ACCOUNT_SID
    ? "LOADED"
    : "MISSING"
);

console.log(
  "TWILIO_AUTH_TOKEN:",
  process.env.TWILIO_AUTH_TOKEN
    ? "LOADED"
    : "MISSING"
);

console.log(
  "TWILIO_VERIFY_SERVICE_SID:",
  process.env.TWILIO_VERIFY_SERVICE_SID
    ? "LOADED"
    : "MISSING"
);

console.log("================================");

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/users", userRoutes);

app.use("/api/otp", otpRoute);

app.use("/api/auth", authRoute);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication API is running",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.message || "Internal Server Error",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
};

startServer();