import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      "SUPER_ADMIN",
      "ADMIN",
      "INVENTORY_MANAGER",
      "RECEPTIONIST",
      "PET_CARE_TAKER",
      "FINANCE_MANAGER",
      "USER",
    ],
    default: "USER",
  },
 
  profileImage: {
    type: String,
    default: "", 
  },
  isActive: { type: Boolean, default: true },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: String,
  resetOtpExpireAt: Date,
  verifyOtp: String,
  verifyOtpExpireAt: Date,
});

const User = mongoose.model("User", userSchema);

export default User;