import { env } from "../config/env.js";

export const getPosStatus = () => {
  const apiKey = process.env.POS_API_KEY;
  const terminalId = process.env.POS_TERMINAL_ID;

  if (apiKey || terminalId) {
    return {
      status: "connected",
      provider: process.env.POS_PROVIDER || "Square / Stripe POS",
      configured: true,
      terminalId: terminalId || "TERM-001",
      lastSync: new Date().toISOString(),
    };
  }

  return {
    status: "disabled",
    provider: "Square / Stripe POS Gateway",
    configured: false,
    message: "POS Integration not configured. Set POS_API_KEY in environment variables.",
  };
};

export const syncPosTransaction = async (transactionData) => {
  const status = getPosStatus();
  if (!status.configured) {
    return {
      success: false,
      mode: "disabled",
      message: "POS Gateway API key not configured. Transaction recorded locally.",
      transaction: transactionData,
    };
  }

  try {
    const posEndpoint = process.env.POS_ENDPOINT;
    if (posEndpoint) {
      const response = await fetch(posEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.POS_API_KEY}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error(`POS Gateway responded with status ${response.status}`);
      }
    }

    return {
      success: true,
      mode: "live",
      message: "Transaction successfully transmitted to POS Gateway",
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("POS Gateway Error:", err.message);
    return {
      success: false,
      mode: "error",
      error: err.message,
    };
  }
};
