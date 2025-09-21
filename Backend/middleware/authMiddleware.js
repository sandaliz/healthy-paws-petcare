// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Please login again!" });
    }

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

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

export { protect, authorizeRoles };