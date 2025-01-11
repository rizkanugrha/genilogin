import express from "express";
import {
  loginAdmin,
  getMe,
  logoutUser,
  forgotPassword,
  resetPassword,
  createUser,
} from "../controllers/userControllers.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/login-admin", loginAdmin);
router.get("/me", authMiddleware, getMe);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.post("/create-user", createUser);

export default router;
