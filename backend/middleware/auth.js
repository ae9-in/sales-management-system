import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];
    const cookieToken = req.cookies?.token;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        message: "You do not have permission to access this. Please login first.",
      });
    }

    jwt.verify(token, env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          message: "Invalid or expired token. Please login again.",
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Authentication failed. Please try again.",
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
    return res.status(403).json({
      message: "You do not have permission to perform this action.",
    });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({
      message: "You do not have permission to perform this action. Only Super Admins can manage users."
    });
  }
  next();
};
