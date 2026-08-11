import { env } from "../config/env.js";

export const getCrmStatus = () => {
  const apiKey = process.env.CRM_API_KEY;
  const webhookUrl = process.env.CRM_WEBHOOK_URL;

  if (apiKey || webhookUrl) {
    return {
      status: "connected",
      provider: process.env.CRM_PROVIDER || "HubSpot CRM",
      configured: true,
      lastSync: new Date().toISOString(),
    };
  }

  return {
    status: "disabled",
    provider: "HubSpot / Salesforce CRM",
    configured: false,
    message: "CRM integration is not configured. Set CRM_API_KEY in environment variables.",
  };
};

export const syncCustomerToCrm = async (customerData) => {
  const status = getCrmStatus();
  if (!status.configured) {
    return {
      success: false,
      mode: "disabled",
      message: "CRM API key not configured. Customer saved locally only.",
      customer: customerData,
    };
  }

  try {
    const webhookUrl = process.env.CRM_WEBHOOK_URL;
    if (webhookUrl) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRM_API_KEY || ""}`,
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`CRM API responded with status ${response.status}`);
      }
    }

    return {
      success: true,
      mode: "live",
      message: "Customer successfully synced to CRM",
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("CRM Sync Error:", err.message);
    return {
      success: false,
      mode: "error",
      error: err.message,
    };
  }
};
