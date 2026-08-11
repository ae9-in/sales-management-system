import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db.js";
import { env } from "../config/env.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password to login.",
      });
    }

    const JWT_SECRET = env.JWT_SECRET;
    const db = getDB();

    const loginInput = email.trim().toLowerCase();
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?",
      args: [loginInput, loginInput],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password. Please try again.",
      });
    }

    const user = result.rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is suspended. Please contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password. Please try again.",
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set httpOnly cookie for secure session storage
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        mustChangePassword: user.mustChangePassword || 0,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Login failed. Please try again or contact admin if the problem persists.",
    });
  }
};

export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
      });
    }

    const db = getDB();

    // Check if username or email already exists
    const checkResult = await db.execute({
      sql: "SELECT id FROM users WHERE username = ? OR email = ?",
      args: [username.trim(), email.trim().toLowerCase()],
    });

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        message: "Username or email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = "employee"; // Forced to employee role for security (no self-admin creation)

    const result = await db.execute({
      sql: "INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?) RETURNING id, username, email, role, status",
      args: [username.trim(), email.trim().toLowerCase(), hashedPassword, userRole, "active"],
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
