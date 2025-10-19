import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ success: false, message: "Not Authorized. Please login again!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ success: false, message: "Invalid token. Please login again!" });
    }

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token verification failed", error: error.message });
  }
};

export default userAuth;
