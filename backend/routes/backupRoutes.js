import express from "express";
import { exportBackup, importBackup } from "../controllers/backupController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/export", authenticateToken, exportBackup);
router.post("/import", authenticateToken, importBackup);

export default router;
