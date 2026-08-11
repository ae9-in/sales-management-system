import express from "express";
import {
  getIntegrationsStatus,
  syncCrm,
  syncPos,
  triggerCampaign,
} from "../controllers/integrationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/status", authenticateToken, getIntegrationsStatus);
router.post("/crm/sync", authenticateToken, syncCrm);
router.post("/pos/sync", authenticateToken, syncPos);
router.post("/marketing/campaign", authenticateToken, triggerCampaign);

export default router;
