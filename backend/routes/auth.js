// Auth routes
import express from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { login, signup } from "../controllers/authController.js";
import { getDB } from "../db.js";

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

// TEMPORARY: Debug endpoint to check admin state in DB (remove after fix)
router.get("/debug-admin", async (req, res) => {
  try {
    const db = getDB();
    const users = await db.execute("SELECT id, username, email, role, status, LENGTH(password) as pwLen FROM users WHERE role = 'admin'");
    const testHash = bcrypt.hashSync("admin", 10);
    const verifyResults = [];
    
    for (const user of users.rows) {
      const fullUser = await db.execute({ sql: "SELECT password FROM users WHERE id = ?", args: [user.id] });
      const storedHash = fullUser.rows[0]?.password;
      const matches = storedHash ? bcrypt.compareSync("admin", storedHash) : false;
      verifyResults.push({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        passwordLength: user.pwLen,
        hashPrefix: storedHash ? storedHash.substring(0, 20) + "..." : "MISSING",
        passwordMatchesAdmin: matches
      });
    }
    
    res.json({ adminUsers: verifyResults, freshHashTest: testHash.substring(0, 20) + "..." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TEMPORARY: Force reset admin password (remove after fix)
router.post("/force-reset", async (req, res) => {
  try {
    const db = getDB();
    const newHash = bcrypt.hashSync("admin", 10);
    
    // Verify the hash we just created
    const verified = bcrypt.compareSync("admin", newHash);
    if (!verified) {
      return res.status(500).json({ error: "bcrypt self-check failed" });
    }

    // Update all admin users
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE email = 'superadmin@toksharasales.com'",
      args: [newHash]
    });
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE email = 'admin@toksharasales.com'",
      args: [newHash]
    });
    
    // Also insert if they don't exist
    await db.execute({
      sql: "INSERT OR IGNORE INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
      args: ["admin", "superadmin@toksharasales.com", newHash, "admin", "active"]
    });
    await db.execute({
      sql: "INSERT OR IGNORE INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
      args: ["admin_user", "admin@toksharasales.com", newHash, "admin", "active"]
    });
    
    // Verify it was stored correctly
    const check = await db.execute("SELECT password FROM users WHERE email = 'superadmin@toksharasales.com'");
    const storedHash = check.rows[0]?.password;
    const finalVerify = storedHash ? bcrypt.compareSync("admin", storedHash) : false;
    
    res.json({ 
      success: true, 
      message: "Admin passwords reset to 'admin'",
      hashStored: storedHash ? storedHash.substring(0, 20) + "..." : "NOT FOUND",
      verificationPassed: finalVerify
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
