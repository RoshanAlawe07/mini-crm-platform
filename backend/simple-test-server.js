const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

app.use(cors());
app.use(express.json());

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      error: "Missing authorization header" 
    });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: "Missing token" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      googleId: decoded.googleId
    };
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      error: "Invalid or expired token" 
    });
  }
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required Google profile data"
      });
    }

    let user = await prisma.user.findUnique({
      where: { googleId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          picture
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
          picture
        }
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        googleId: user.googleId
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        },
        token
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Missing authorization header"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, total_spend, visits_count } = req.body;
    
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { 
        name, 
        phone, 
        totalSpend: total_spend || 0, 
        visitsCount: visits_count || 0 
      },
      create: { 
        name, 
        email, 
        phone, 
        totalSpend: total_spend || 0, 
        visitsCount: visits_count || 0 
      },
    });
    
    res.status(201).json({ 
      message: "Customer created successfully", 
      customer: {
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalSpend: customer.totalSpend,
        lastActive: customer.lastActive,
        visitsCount: customer.visitsCount,
        createdAt: customer.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a specific customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.customer.delete({
      where: { id }
    });
    
    res.json({ 
      message: "Customer deleted successfully",
      customer: {
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete customer' });
    }
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

app.post('/api/campaigns', authMiddleware, async (req, res) => {
  try {
    const { name, rules_json, messageTemplate } = req.body;
    
    const campaign = await prisma.campaign.create({
      data: {
        name,
        userId: req.user.id,
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

app.post('/api/campaigns/:id/send', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findFirst({ 
      where: { 
        id,
        userId: req.user.id
      } 
    });
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

app.get('/api/campaigns/:id/stats', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findFirst({
      where: { 
        id,
        userId: req.user.id
      },
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

app.get('/api/campaigns', authMiddleware, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: { communicationLogs: true }
    });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orders API endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      customerId,
      fromDate,
      toDate,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where = {};

    if (customerId) {
      where.customerId = customerId;
    }
    if (fromDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(fromDate) };
    }
    if (toDate) {
      const toDatePlusOne = new Date(toDate);
      toDatePlusOne.setDate(toDatePlusOne.getDate() + 1);
      where.createdAt = { ...where.createdAt, lt: toDatePlusOne };
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sort_by] = sort_order;

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          customer: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderId: order.orderId,
      customerName: order.customer.name,
      amount: order.amount,
      date: order.createdAt,
      status: order.status,
      customerId: order.customerId
    }));

    res.json({
      orders: formattedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, amount, status = 'PENDING' } = req.body;
    
    // Generate order ID
    const orderId = `ORD-${Date.now().toString().slice(-3)}`;
    
    const order = await prisma.order.create({
      data: {
        orderId,
        customerId,
        amount: parseFloat(amount),
        status
      },
      include: {
        customer: {
          select: {
            name: true
          }
        }
      }
    });
    
    res.status(201).json({ 
      message: "Order created successfully", 
      order: {
        id: order.id,
        orderId: order.orderId,
        customerName: order.customer.name,
        amount: order.amount,
        date: order.createdAt,
        status: order.status,
        customerId: order.customerId
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.delete({
      where: { id }
    });
    
    res.json({ 
      message: "Order deleted successfully",
      order: {
        id: order.id,
        orderId: order.orderId
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Order not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete order' });
    }
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      spend_gt, 
      spend_lt, 
      visits_gt, 
      visits_lt,
      search,
      fromDate,
      toDate,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where = {};

    if (spend_gt) {
      where.totalSpend = { ...where.totalSpend, gte: parseFloat(spend_gt) };
    }
    if (spend_lt) {
      where.totalSpend = { ...where.totalSpend, lte: parseFloat(spend_lt) };
    }
    if (visits_gt) {
      where.visitsCount = { ...where.visitsCount, gte: parseInt(visits_gt, 10) };
    }
    if (visits_lt) {
      where.visitsCount = { ...where.visitsCount, lte: parseInt(visits_lt, 10) };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (fromDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(fromDate) };
    }
    if (toDate) {
      // Add one day to include the entire toDate
      const toDatePlusOne = new Date(toDate);
      toDatePlusOne.setDate(toDatePlusOne.getDate() + 1);
      where.createdAt = { ...where.createdAt, lt: toDatePlusOne };
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sort_by] = sort_order;

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          totalSpend: true,
          lastActive: true,
          visitsCount: true,
          createdAt: true
        }
      }),
      prisma.customer.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      customers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
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