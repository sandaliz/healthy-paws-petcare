import User from "../Model/userModel.js";

// ---------- Admin Dashboard Stats ----------
export const getAdminDashboardStats = async (req, res) => {
  try {
    // 🌟 1. Total Users
    const totalUsers = await User.countDocuments();

    // 🌟 2. Group users by roles
    const roleAggregation = await User.aggregate([
      {
        $group: {
          _id: "$role",                 // Group by role
          count: { $sum: 1 },           // Count how many in that role
          emails: { $push: "$email" }   // Collect all emails of that role
        }
      }
    ]);

    // 🌟 3. Format response nicely
    const roleStats = roleAggregation.map(r => ({
      role: r._id,
      count: r.count,
      emails: r.emails,
    }));

    return res.status(200).json({
      success: true,
      totalUsers,
      totalRoles: roleStats.length,
      roleStats,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};