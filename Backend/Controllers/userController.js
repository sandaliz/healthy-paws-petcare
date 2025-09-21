import User from "../Model/userModel.js";  

// Get profile (protected)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Assign role (SUPER_ADMIN only)
export const assignRole = async (req, res) => {
  const { userId, role } = req.body;

  // Check inputs
  if (!userId || !role) {
    return res.status(400).json({ success: false, message: "User ID and role are required" });
  }

  // Ensure only SUPER_ADMIN can assign roles
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Access denied. Only SUPER_ADMIN can assign roles." });
  }

  // Allowed roles (must match schema enum)
  const allowedRoles = [
    "SUPER_ADMIN",
    "ADMIN",
    "INVENTORY_MANAGER",
    "RECEPTIONIST",
    "PET_CARE_TAKER",
    "FINANCE_MANAGER",
    "USER",
  ];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
