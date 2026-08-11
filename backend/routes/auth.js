// Auth routes
import express from "express";
import rateLimit from "express-rate-limit";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

// Rate limiter to prevent brute-force login attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    message: "Too many login attempts from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, login);
router.post("/signup", signup);

export default router;
