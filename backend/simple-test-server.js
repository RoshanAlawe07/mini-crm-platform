const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, totalSpend, visitsCount } = req.body;
    
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name, phone, totalSpend: totalSpend || 0, visitsCount: visitsCount || 0 },
      create: { name, email, phone, totalSpend: totalSpend || 0, visitsCount: visitsCount || 0 },
    });
    
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/segments/preview', async (req, res) => {
  try {
    const { rules_json } = req.body;
    const rules = JSON.parse(rules_json);
    const allCustomers = await prisma.customer.findMany();
    
    function evaluateRule(customer, rule) {
      if (rule.field === 'total_spend') {
        if (rule.operator === '>') {
          return customer.totalSpend > rule.value;
        } else if (rule.operator === '>=') {
          return customer.totalSpend >= rule.value;
        } else if (rule.operator === '<') {
          return customer.totalSpend < rule.value;
        } else if (rule.operator === '<=') {
          return customer.totalSpend <= rule.value;
        }
      } else if (rule.field === 'visits_count') {
        if (rule.operator === '>=') {
          return customer.visitsCount >= rule.value;
        } else if (rule.operator === '>') {
          return customer.visitsCount > rule.value;
        } else if (rule.operator === '<') {
          return customer.visitsCount < rule.value;
        } else if (rule.operator === '<=') {
          return customer.visitsCount <= rule.value;
        }
      }
      return false;
    }
    
    function evaluateRules(customer, rules) {
      if (rules.op === 'AND') {
        return rules.rules.every(rule => {
          if (rule.op) {
            return evaluateRules(customer, rule);
          } else {
            return evaluateRule(customer, rule);
          }
        });
      } else if (rules.op === 'OR') {
        return rules.rules.some(rule => {
          if (rule.op) {
            return evaluateRules(customer, rule);
          } else {
            return evaluateRule(customer, rule);
          }
        });
      }
      return false;
    }
    
    const matchingCustomers = allCustomers.filter(customer => evaluateRules(customer, rules));
    res.json({ audience_size: matchingCustomers.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, rules_json, messageTemplate } = req.body;
    
    const campaign = await prisma.campaign.create({
      data: {
        name,
        status: "DRAFT",
        rulesJson: rules_json,
        messageTemplate: messageTemplate,
      },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/campaigns/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      res.status(404).json({ success: false, error: 'Campaign not found' });
      return;
    }

    if (!campaign.rulesJson) {
      res.status(400).json({ success: false, error: 'Campaign has no rules defined' });
      return;
    }

    const rules = JSON.parse(campaign.rulesJson);
    const allCustomers = await prisma.customer.findMany();
    
    function evaluateRule(customer, rule) {
      if (rule.field === 'total_spend') {
        if (rule.operator === '>') {
          return customer.totalSpend > rule.value;
        } else if (rule.operator === '>=') {
          return customer.totalSpend >= rule.value;
        }
      } else if (rule.field === 'visits_count') {
        if (rule.operator === '>=') {
          return customer.visitsCount >= rule.value;
        }
      }
      return false;
    }
    
    function evaluateRules(customer, rules) {
      if (rules.op === 'AND') {
        return rules.rules.every(rule => {
          if (rule.op) {
            return evaluateRules(customer, rule);
          } else {
            return evaluateRule(customer, rule);
          }
        });
      } else if (rules.op === 'OR') {
        return rules.rules.some(rule => {
          if (rule.op) {
            return evaluateRules(customer, rule);
          } else {
            return evaluateRule(customer, rule);
          }
        });
      }
      return false;
    }
    
    const customers = allCustomers.filter(customer => evaluateRules(customer, rules));
    
    if (customers.length === 0) {
      res.json({
        success: true,
        message: 'No customers match the campaign criteria',
        data: {
          campaignId: campaign.id,
          customersProcessed: 0,
          messagesCreated: 0,
        },
      });
      return;
    }

    const results = [];
    for (const customer of customers) {
      const messageId = require('crypto').randomUUID();
      const log = await prisma.communicationLog.create({
        data: {
          customerId: customer.id,
          campaignId: campaign.id,
          status: "PENDING",
          messageId: messageId,
          message: campaign.messageTemplate || 'Default message',
        },
      });
      
      try {
        const axios = require('axios');
        const vendorResponse = await axios.post("http://localhost:3001/vendor/send", {
          message_id: messageId,
          customer_id: customer.id,
          campaign_id: campaign.id,
          message: campaign.messageTemplate || 'Default message'
        });
      } catch (error) {
        console.error(`Vendor call failed for ${messageId}:`, error.message);
      }
      
      results.push({ customerId: customer.id, messageId: messageId });
    }

    res.json({
      success: true,
      message: 'Campaign sent successfully',
      data: {
        campaignId: campaign.id,
        customersProcessed: customers.length,
        messagesCreated: results.length,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/campaigns/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { communicationLogs: true }
    });

    if (!campaign) {
      res.status(404).json({ success: false, error: 'Campaign not found' });
      return;
    }

    const stats = {
      total: campaign.communicationLogs.length,
      pending: campaign.communicationLogs.filter(log => log.status === 'PENDING').length,
      sent: campaign.communicationLogs.filter(log => log.status === 'SENT').length,
      failed: campaign.communicationLogs.filter(log => log.status === 'FAILED').length,
    };

    res.json({
      success: true,
      data: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/delivery-receipt', async (req, res) => {
  try {
    const { message_id, status, vendor_response, vendor_timestamp, vendor_delay_ms } = req.body;

    const updatedLog = await prisma.communicationLog.updateMany({
      where: {
        messageId: message_id,
        status: { notIn: ['SENT', 'FAILED'] }
      },
      data: {
        status: status,
        lastAttemptAt: new Date(),
        deliveryReceipt: JSON.stringify({ 
          status, 
          receivedAt: new Date().toISOString(),
          vendor_response: vendor_response || 'No vendor response',
          vendor_timestamp: vendor_timestamp || new Date().toISOString(),
          vendor_delay_ms: vendor_delay_ms || 0
        }),
      },
    });

    if (updatedLog.count === 0) {
      res.status(409).json({ success: false, error: 'Message already processed or not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Delivery receipt updated successfully',
      data: { 
        messageId: message_id, 
        status: status,
        vendor_response: vendor_response,
        processing_time_ms: vendor_delay_ms
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { communicationLogs: true }
    });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/vendor/send', async (req, res) => {
  try {
    const { message_id, customer_id, campaign_id, message } = req.body;

    const success = Math.random() < 0.9;
    const delay = Math.random() * 1800 + 200;
    await new Promise(r => setTimeout(r, delay));

    try {
      const axios = require('axios');
      await axios.post("http://localhost:3001/api/delivery-receipt", {
        message_id,
        status: success ? "SENT" : "FAILED",
        vendor_response: success ? "Message delivered successfully" : "Message delivery failed",
        vendor_timestamp: new Date().toISOString(),
        vendor_delay_ms: Math.round(delay)
      });
    } catch (err) {
      console.error(`Failed to callback delivery receipt for ${message_id}:`, err.message);
    }

    res.json({
      status: success ? "SENT" : "FAILED",
      message_id,
      vendor_response: success ? "Message delivered successfully" : "Message delivery failed",
      processing_time_ms: Math.round(delay)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Vendor processing failed',
      message_id: req.body.message_id 
    });
  }
});

app.get('/vendor/health', (req, res) => {
  res.json({
    status: "OK",
    service: "Fake Vendor API",
    timestamp: new Date().toISOString(),
    features: ["90/10 success/failure simulation", "Random delays", "Webhook callbacks"]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});