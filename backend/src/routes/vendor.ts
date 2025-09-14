import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { message_id, customer_id, campaign_id, message } = req.body;

  const success = Math.random() < 0.9;
  const delay = Math.random() * 1800 + 200;
  await new Promise(r => setTimeout(r, delay));

  try {
    await axios.post("http://localhost:3001/api/delivery-receipt", {
      message_id,
      status: success ? "SENT" : "FAILED",
      vendor_response: success ? "Message delivered successfully" : "Message delivery failed",
      vendor_timestamp: new Date().toISOString(),
      vendor_delay_ms: Math.round(delay)
    });
  } catch (err: any) {
    console.error(`Failed to callback delivery receipt for ${message_id}:`, err.message);
  }

  return res.json({
    status: success ? "SENT" : "FAILED",
    message_id,
    vendor_response: success ? "Message delivered successfully" : "Message delivery failed",
    processing_time_ms: Math.round(delay)
  });
});

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Fake Vendor API",
    timestamp: new Date().toISOString(),
    features: ["90/10 success/failure simulation", "Random delays", "Webhook callbacks"]
  });
});

export default router;
