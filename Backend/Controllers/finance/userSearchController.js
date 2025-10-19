import User from "../../Model/userModel.js";

export const searchUsers = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 6));
    if (!q) return res.json({ users: [] });

    // Escape regex special chars
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");

    const users = await User.find(
      { $or: [{ name: rx }, { email: rx }] },
      "name email"
    )
      .limit(limit)
      .lean();

    return res.json({ users });
  } catch (err) {
    console.error("searchUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
