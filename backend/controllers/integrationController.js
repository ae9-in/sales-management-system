import { getCrmStatus, syncCustomerToCrm } from "../services/crmService.js";
import { getPosStatus, syncPosTransaction } from "../services/posService.js";
import { getMarketingStatus, triggerMarketingCampaign } from "../services/marketingService.js";

export const getIntegrationsStatus = async (req, res) => {
  try {
    const crm = getCrmStatus();
    const pos = getPosStatus();
    const marketing = getMarketingStatus();

    res.json({
      timestamp: new Date().toISOString(),
      integrations: {
        crm,
        pos,
        marketing,
      },
    });
  } catch (error) {
    console.error("Integrations status error:", error);
    res.status(500).json({ message: "Failed to retrieve integrations status." });
  }
};

export const syncCrm = async (req, res) => {
  try {
    const customer = req.body;
    const result = await syncCustomerToCrm(customer);
    res.json(result);
  } catch (error) {
    console.error("CRM sync controller error:", error);
    res.status(500).json({ message: "CRM sync failed." });
  }
};

export const syncPos = async (req, res) => {
  try {
    const transaction = req.body;
    const result = await syncPosTransaction(transaction);
    res.json(result);
  } catch (error) {
    console.error("POS sync controller error:", error);
    res.status(500).json({ message: "POS sync failed." });
  }
};

export const triggerCampaign = async (req, res) => {
  try {
    const campaign = req.body;
    const result = await triggerMarketingCampaign(campaign);
    res.json(result);
  } catch (error) {
    console.error("Marketing controller error:", error);
    res.status(500).json({ message: "Campaign trigger failed." });
  }
};
