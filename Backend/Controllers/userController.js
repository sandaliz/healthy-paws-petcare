import User from "../Model/userModel.js";  
import Register from "../Model/Register.js";   // ✅ import your Register model

// ---------- Get profile (protected) ----------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ fetch register record for this user
    const register = await Register.findOne({ userId: req.user.id });

    res.status(200).json({ 
      success: true, 
      user,
      register    // include owner & pet details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ---------- Update profile (protected, self) ----------
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, OwnerName, OwnerPhone, EmergencyContact, OwnerAddress, PetName } = req.body;

    // --- Update User table ---
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(409).json({ success: false, message: "Email already exists" });
      }
      user.email = email;
    }
    if (name) user.name = name;
    await user.save();

    // --- Update Register table ---
    let register = await Register.findOne({ userId: req.user.id });
    if (!register) {
      // If register doesn’t exist yet, create one
      register = new Register({ userId: req.user.id });
    }

    if (OwnerName) register.OwnerName = OwnerName;
    if (OwnerPhone) register.OwnerPhone = OwnerPhone;
    if (EmergencyContact) register.EmergencyContact = EmergencyContact;
    if (OwnerAddress) register.OwnerAddress = OwnerAddress;
    if (PetName) register.PetName = PetName;

    await register.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      register   // ✅ send updated owner/pet details
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ---------- Assign role (SUPER_ADMIN only) ----------
export const assignRole = async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ success: false, message: "User ID and role are required" });
  }

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Access denied. Only SUPER_ADMIN can assign roles." });
  }

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

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};