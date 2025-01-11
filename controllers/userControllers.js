import createError from "http-errors";
import User from "../models/userModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendForgotPasswordEmail from "../utils/sendForgot.js";

// Login Admin
export const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw createError(400, "Username and password are required");
    }

    const user = await User.findOne({ username });
    if (!user) {
      throw createError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError(401, "Invalid credentials");
    }

    if (user.role !== "admin") {
      throw createError(403, "Access denied");
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 5,
    });

    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw createError(404, "User not found");
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logoutUser = (req, res, next) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw createError(404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendForgotPasswordEmail(user.email, "Reset Password", resetUrl);

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    throw createError(400, "New password and confirm password are required");
  }

  if (newPassword !== confirmPassword) {
    throw createError(400, "Passwords do not match");
  }

  if (newPassword.length < 6) {
    throw createError(400, "Password must be at least 6 characters");
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw createError(400, "Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};

// Create user
export const createUser = async (req, res, next) => {
  try {
    const { username, email, password, firstname, lastname, role } = req.body;

    if (!username || !email || !password) {
      throw createError(400, "Username, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, "Email is already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstname: firstname || "",
      lastname: lastname || "",
      role: role || "admin",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
      },
    });
  } catch (error) {
    next(error);
  }
};
