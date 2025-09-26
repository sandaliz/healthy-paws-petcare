export default function requireRole(...roles) {
  return (req, res, next) => {
    // DEV bypass
    if (process.env.SKIP_RBAC === "1") return next();

    const role = (req.headers["x-role"] || "").trim();
    if (!role) return res.status(401).json({ message: "Unauthorized" });

    if (roles.length && !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
