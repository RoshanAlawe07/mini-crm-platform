import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * @swagger
 * /vendor/send:
 *   post:
 *     summary: Send message via vendor API (simulation)
 *     tags: [Vendor]
 *     description: Simulates external vendor API for message delivery with 90% success rate and random delays
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_id
 *             properties:
 *               message_id:
 *                 type: string
 *                 description: Unique message identifier
 *                 example: msg_1234567890
 *               customer_id:
 *                 type: string
 *                 description: Customer ID
 *                 example: clx1234567890
 *               campaign_id:
 *                 type: string
 *                 description: Campaign ID
 *                 example: camp_1234567890
 *               message:
 *                 type: string
 *                 description: Message content to send
 *                 example: "Hi John, check out our special offer!"
 *     responses:
 *       200:
 *         description: Message processing completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /vendor/health:
 *   get:
 *     summary: Vendor API health check
 *     tags: [Vendor]
 *     description: Returns vendor API status and available features
 *     responses:
 *       200:
 *         description: Vendor API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 service:
 *                   type: string
 *                   example: Fake Vendor API
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:00Z
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["90/10 success/failure simulation", "Random delays", "Webhook callbacks"]
 */
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Fake Vendor API",
    timestamp: new Date().toISOString(),
    features: ["90/10 success/failure simulation", "Random delays", "Webhook callbacks"]
  });
});

export default router;
