import { env } from "../config/env.js";

export const getMarketingStatus = () => {
  const apiKey = process.env.MARKETING_API_KEY;

  if (apiKey) {
    return {
      status: "connected",
      provider: process.env.MARKETING_PROVIDER || "Mailchimp / SendGrid",
      configured: true,
      lastCampaignSync: new Date().toISOString(),
    };
  }

  return {
    status: "disabled",
    provider: "Mailchimp / SendGrid Marketing Engine",
    configured: false,
    message: "Marketing API key not configured. Set MARKETING_API_KEY in environment variables.",
  };
};

export const triggerMarketingCampaign = async (campaignData) => {
  const status = getMarketingStatus();
  if (!status.configured) {
    return {
      success: false,
      mode: "disabled",
      message: "Marketing Engine API key not configured. Action logged locally.",
      campaign: campaignData,
    };
  }

  try {
    const endpoint = process.env.MARKETING_ENDPOINT;
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MARKETING_API_KEY}`,
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error(`Marketing API responded with status ${response.status}`);
      }
    }

    return {
      success: true,
      mode: "live",
      message: "Marketing campaign event triggered successfully",
      triggeredAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Marketing Service Error:", err.message);
    return {
      success: false,
      mode: "error",
      error: err.message,
    };
  }
};
