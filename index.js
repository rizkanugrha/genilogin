import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import createError from "http-errors";

import { openDB } from "./database/database.js";
import userRoutes from "./route/userRoute.js";

dotenv.config();
await openDB();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://genilogin.vercel.app/",
    credentials: true,
  })
);

// Routes
app.use("/api/user", userRoutes);

// Middleware untuk menangani 404
app.use((req, res, next) => {
  next(createError(404, "Resource not found"));
});

// Middleware untuk penanganan error
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
