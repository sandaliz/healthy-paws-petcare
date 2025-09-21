import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Model/userModel.js";
import transporter from "../config/nodemailer.js";

// ---------- Helper: generate JWT token ----------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Staff roles only (no SUPER_ADMIN or USER)
const STAFF_ROLES = [
  "ADMIN",
  "INVENTORY_MANAGER",
  "RECEPTIONIST",
  "PET_CARE_TAKER",
  "FINANCE_MANAGER",
];

// ---------- User registration ----------
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // Default role for public signups
    let assignedRole = "USER";

    // Only SUPER_ADMIN can assign a custom role
    if (req.user && req.user.role === "SUPER_ADMIN" && role) {
      if (!STAFF_ROLES.includes(role) && role !== "USER") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }
      assignedRole = role;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });
    await user.save();

    const token = generateToken(user);

    // Set cookie if request is not from API
    if (!req.headers.authorization) {
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Pet Care Management System!",
      text: `Welcome ${name}, your account has been created with role ${assignedRole}.`,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- User login ----------
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect based on role
    let redirectUrl = "/user-dashboard";
    let message = "Welcome! Redirecting to User Dashboard";

    switch (user.role) {
      case "SUPER_ADMIN":
        redirectUrl = "/super-admin-dashboard";
        message = "Welcome Super Admin! Redirecting to Super Admin Dashboard";
        break;
      case "ADMIN":
        redirectUrl = "/admin-dashboard";
        message = "Welcome Admin! Redirecting to Admin Dashboard";
        break;
      case "INVENTORY_MANAGER":
        redirectUrl = "/inventory-dashboard";
        message = "Welcome Inventory Manager! Redirecting to Inventory Dashboard";
        break;
      case "RECEPTIONIST":
        redirectUrl = "/receptionist-dashboard";
        message = "Welcome Receptionist! Redirecting to Receptionist Dashboard";
        break;
      case "PET_CARE_TAKER":
        redirectUrl = "/pet-caretaker-dashboard";
        message = "Welcome Pet Care Taker! Redirecting to Pet Care Taker Dashboard";
        break;
      case "FINANCE_MANAGER":
        redirectUrl = "/finance-dashboard";
        message = "Welcome Finance Manager! Redirecting to Finance Dashboard";
        break;
    }

    return res.status(200).json({
      success: true,
      message,
      redirectUrl,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Logout ----------
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Get profile ----------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Check if user is authenticated ----------
export const isAuthenticated = async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({ success: true, user: req.user });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Assign role (SUPER_ADMIN only) ----------
export const assignRole = async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role)
    return res
      .status(400)
      .json({ success: false, message: "User ID and role required" });

  if (!STAFF_ROLES.includes(role) && role !== "USER")
    return res
      .status(400)
      .json({ success: false, message: "Invalid role" });

  if (req.user.role !== "SUPER_ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "Access denied" });
  }

  try {
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Edit user (SUPER_ADMIN only) ----------
export const editUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive } = req.body;

  if (!userId) {
    return res.status(400).json({ 
      success: false, 
      message: "User ID is required" 
    });
  }

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Only SUPER_ADMIN can edit users." 
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Prevent editing SUPER_ADMIN users (except maybe the current user)
    if (user.role === "SUPER_ADMIN" && userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot edit other SUPER_ADMIN users" 
      });
    }

    // Check if email already exists (if changing email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({ 
          success: false, 
          message: "Email already exists" 
        });
      }
      user.email = email;
    }

    // Update fields if provided
    if (name) user.name = name;
    if (role) {
      if (!STAFF_ROLES.includes(role) && role !== "USER") {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid role" 
        });
      }
      user.role = role;
    }
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Edit user error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Send verification OTP email ----------
export const sendNewVerifyOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    });

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent via Email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Verify email OTP ----------
export const newVerifyEmail = async (req, res) => {
  const { otp } = req.body;

  if (!otp)
    return res
      .status(400)
      .json({ success: false, message: "OTP is required" });

  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.verifyOtp)
      return res.status(400).json({
        success: false,
        message: "No OTP found, please request a new one",
      });
    if (user.verifyOtp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.verifyOtpExpireAt < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Send password reset OTP ----------
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required!" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}.`,
    });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Verify Reset OTP ----------
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp)
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP!" });

    if (user.resetOtpExpireAt < Date.now())
      return res
        .status(400)
        .json({ success: false, message: "OTP expired!" });

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Reset password ----------
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({
      success: false,
      message: "Email, OTP and new password are required",
    });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.resetOtp || user.resetOtp !== otp)
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP!" });

    if (user.resetOtpExpireAt < Date.now())
      return res
        .status(400)
        .json({ success: false, message: "OTP expired!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Create Staff (SUPER_ADMIN only) ----------
export const createStaff = async (req, res) => {
  console.log('CREATE STAFF REQUEST RECEIVED:', req.body);
  
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid staff role" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role,
      isActive: true
    });
    
    await user.save();

    // Send welcome email (optional)
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to Pet Care Management System!",
        text: `Welcome ${name}, your staff account has been created with role ${role}.`,
      });
    } catch (emailError) {
      console.log('Email send failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
    });
  } catch (error) {
    console.error('CREATE STAFF ERROR:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ---------- Get all staff users (SUPER_ADMIN only) ----------
export const getStaffUsers = async (req, res) => {
  try {
    // Exclude SUPER_ADMIN and regular USERs from the list
    const staffUsers = await User.find({
      role: {
        $in: STAFF_ROLES
      }
    }).select("-password");

    return res.status(200).json(staffUsers);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff users",
      error: error.message,
    });
  }
};

// ---------- Delete staff user (SUPER_ADMIN only) ----------
export const deleteStaffUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent SUPER_ADMIN from deleting themselves or other SUPER_ADMINs
    const userToDelete = await User.findById(id);
    if (userToDelete.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete SUPER_ADMIN users"
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Staff user deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete staff user",
      error: error.message,
    });
  }
};

// ---------- Toggle staff active status (SUPER_ADMIN only) ----------
export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent deactivating SUPER_ADMIN
    const userToUpdate = await User.findById(id);
    if (userToUpdate.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Cannot deactivate SUPER_ADMIN users"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Staff status updated successfully",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update staff status",
      error: error.message,
    });
  }
};