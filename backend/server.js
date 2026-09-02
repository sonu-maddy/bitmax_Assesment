import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./src/route/userRoutes.js";
import otpRoute from "./src/route/otpRoute.js";
import authRoute from "./src/route/authRoute.js"
import connectDB from "./src/config/db.js";



const app = express();

connectDB();

app.use(cors(
  {
    origin: "http://localhost:5173",
    https: "https://bitmax-assesment.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],

  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoute );
app.use("/api/auth", authRoute );


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication API is running",
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});