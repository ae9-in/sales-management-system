import express from "express";
import { exportBackup, importBackup } from "../controllers/backupController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/export", authenticateToken, requireAdmin, exportBackup);
router.post("/import", authenticateToken, requireAdmin, importBackup);

export default router;
