import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("Admin", userSchema);

export default User;
