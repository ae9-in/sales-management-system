import express from "express";
import { exportBackup, importBackup } from "../controllers/backupController.js";

const router = express.Router();

router.get("/export", exportBackup);
router.post("/import", importBackup);

export default router;
