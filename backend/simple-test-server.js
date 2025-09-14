const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3001;
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

// Authentication endpoints
// Sign up endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        googleId: null
      }
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Sign in endpoint
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Sign in successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
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

// Segments API endpoints
// Create sample segments if none exist
app.post('/api/segments/sample', async (req, res) => {
  try {
    // Check if segments already exist
    const existingSegments = await prisma.segment.count();
    
    if (existingSegments > 0) {
      return res.json({ 
        success: true, 
        message: "Sample segments already exist",
        count: existingSegments
      });
    }

    // Create sample segments
    const sampleSegments = [
      {
        name: "High Value Customers",
        description: "Customers who have spent more than $500",
        rulesJson: JSON.stringify({
          conditions: [
            { field: "totalSpend", operator: "gt", value: 500 }
          ]
        }),
        createdBy: "system"
      },
      {
        name: "New Customers",
        description: "Customers who joined in the last 30 days",
        rulesJson: JSON.stringify({
          conditions: [
            { field: "createdAt", operator: "gte", value: "30 days ago" }
          ]
        }),
        createdBy: "system"
      },
      {
        name: "Inactive Customers",
        description: "Customers who haven't been active in 90 days",
        rulesJson: JSON.stringify({
          conditions: [
            { field: "lastActive", operator: "lt", value: "90 days ago" }
          ]
        }),
        createdBy: "system"
      },
      {
        name: "Frequent Visitors",
        description: "Customers with more than 10 visits",
        rulesJson: JSON.stringify({
          conditions: [
            { field: "visitsCount", operator: "gt", value: 10 }
          ]
        }),
        createdBy: "system"
      },
      {
        name: "VIP Customers",
        description: "High spenders with frequent visits",
        rulesJson: JSON.stringify({
          conditions: [
            { field: "totalSpend", operator: "gt", value: 1000 },
            { field: "visitsCount", operator: "gt", value: 5 }
          ]
        }),
        createdBy: "system"
      }
    ];

    const createdSegments = await prisma.segment.createMany({
      data: sampleSegments
    });

    res.json({
      success: true,
      message: "Sample segments created successfully",
      count: createdSegments.count
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/segments', async (req, res) => {
  try {
    const segments = await prisma.segment.findMany({
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: segments.map(segment => ({
        id: segment.id,
        name: segment.name,
        rulesJson: segment.rulesJson,
        createdBy: segment.createdBy || 'Unknown',
        createdAt: segment.createdAt,
        updatedAt: segment.updatedAt,
        campaigns: segment.campaigns || []
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/segments', async (req, res) => {
  try {
    const { name, description, rulesJson, createdBy } = req.body;
    
    const segment = await prisma.segment.create({
      data: {
        name,
        description: description || '',
        rulesJson,
        createdBy: createdBy || 'Current User'
      }
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: segment.id,
        name: segment.name,
        rulesJson: segment.rulesJson,
        createdBy: segment.createdBy,
        createdAt: segment.createdAt,
        updatedAt: segment.updatedAt,
        campaigns: []
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.delete('/api/segments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.segment.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Segment deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Segment not found' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete segment' });
    }
  }
});

app.post('/api/segments/preview', async (req, res) => {
  try {
    const { rules } = req.body;
    const allCustomers = await prisma.customer.findMany();
    
    function evaluateRule(customer, rule) {
      if (rule.field === 'total_spend' || rule.field === 'totalSpend') {
        const value = parseFloat(rule.value);
        if (rule.operator === '>') return customer.totalSpend > value;
        if (rule.operator === '>=') return customer.totalSpend >= value;
        if (rule.operator === '<') return customer.totalSpend < value;
        if (rule.operator === '<=') return customer.totalSpend <= value;
        if (rule.operator === '=') return customer.totalSpend === value;
      } else if (rule.field === 'visits_count' || rule.field === 'visitsCount') {
        const value = parseInt(rule.value);
        if (rule.operator === '>') return customer.visitsCount > value;
        if (rule.operator === '>=') return customer.visitsCount >= value;
        if (rule.operator === '<') return customer.visitsCount < value;
        if (rule.operator === '<=') return customer.visitsCount <= value;
        if (rule.operator === '=') return customer.visitsCount === value;
      } else if (rule.field === 'name') {
        if (rule.operator === 'contains') return customer.name.toLowerCase().includes(rule.value.toLowerCase());
        if (rule.operator === 'not_contains') return !customer.name.toLowerCase().includes(rule.value.toLowerCase());
      } else if (rule.field === 'email') {
        if (rule.operator === 'contains') return customer.email.toLowerCase().includes(rule.value.toLowerCase());
        if (rule.operator === 'not_contains') return !customer.email.toLowerCase().includes(rule.value.toLowerCase());
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
    res.json({ 
      success: true,
      data: { 
        count: matchingCustomers.length,
        rules: rules
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/segments/audience-count', async (req, res) => {
  try {
    const { rules } = req.body;
    const allCustomers = await prisma.customer.findMany();
    
    function evaluateRule(customer, rule) {
      if (rule.field === 'total_spend' || rule.field === 'totalSpend') {
        const value = parseFloat(rule.value);
        if (rule.operator === '>') return customer.totalSpend > value;
        if (rule.operator === '>=') return customer.totalSpend >= value;
        if (rule.operator === '<') return customer.totalSpend < value;
        if (rule.operator === '<=') return customer.totalSpend <= value;
        if (rule.operator === '=') return customer.totalSpend === value;
      } else if (rule.field === 'visits_count' || rule.field === 'visitsCount') {
        const value = parseInt(rule.value);
        if (rule.operator === '>') return customer.visitsCount > value;
        if (rule.operator === '>=') return customer.visitsCount >= value;
        if (rule.operator === '<') return customer.visitsCount < value;
        if (rule.operator === '<=') return customer.visitsCount <= value;
        if (rule.operator === '=') return customer.visitsCount === value;
      } else if (rule.field === 'name') {
        if (rule.operator === 'contains') return customer.name.toLowerCase().includes(rule.value.toLowerCase());
        if (rule.operator === 'not_contains') return !customer.name.toLowerCase().includes(rule.value.toLowerCase());
      } else if (rule.field === 'email') {
        if (rule.operator === 'contains') return customer.email.toLowerCase().includes(rule.value.toLowerCase());
        if (rule.operator === 'not_contains') return !customer.email.toLowerCase().includes(rule.value.toLowerCase());
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
    res.json({ 
      success: true,
      data: { 
        count: matchingCustomers.length,
        rules: rules
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/segments/matching-customers', async (req, res) => {
  try {
    const { rules } = req.body;
    const { page = '1', limit = '10' } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const allCustomers = await prisma.customer.findMany();
    
    function evaluateRule(customer, rule) {
      if (rule.field === 'total_spend' || rule.field === 'totalSpend') {
        const value = parseFloat(rule.value);
        if (rule.operator === '>') return customer.totalSpend > value;
        if (rule.operator === '>=') return customer.totalSpend >= value;
        if (rule.operator === '<') return customer.totalSpend < value;
        if (rule.operator === '<=') return customer.totalSpend <= value;
        if (rule.operator === '=') return customer.totalSpend === value;
      } else if (rule.field === 'visits_count' || rule.field === 'visitsCount') {
        const value = parseInt(rule.value);
        if (rule.operator === '>') return customer.visitsCount > value;
        if (rule.operator === '>=') return customer.visitsCount >= value;
        if (rule.operator === '<') return customer.visitsCount < value;
        if (rule.operator === '<=') return customer.visitsCount <= value;
        if (rule.operator === '=') return customer.visitsCount === value;
      } else if (rule.field === 'name') {
        if (rule.operator === 'contains') return customer.name.toLowerCase().includes(rule.value.toLowerCase());
        if (rule.operator === 'not_contains') return !customer.name.toLowerCase().includes(rule.value.toLowerCase());
      } else if (rule.field === 'email') {
        if (rule.operator === 'contains') return customer.email.toLowerCase().includes(rule.value.toLowerCase());
        if (rule.operator === 'not_contains') return !customer.email.toLowerCase().includes(rule.value.toLowerCase());
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
    
    const allMatchingCustomers = allCustomers.filter(customer => evaluateRules(customer, rules));
    const paginatedCustomers = allMatchingCustomers.slice(skip, skip + limitNum);
    const totalPages = Math.ceil(allMatchingCustomers.length / limitNum);
    
    res.json({
      success: true,
      data: {
        customers: paginatedCustomers,
        total: allMatchingCustomers.length,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/segments/ai-helper', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Simple AI helper - convert text to basic rules
    let rules = null;
    
    if (prompt.toLowerCase().includes('total spend') || prompt.toLowerCase().includes('spent')) {
      const amountMatch = prompt.match(/(\d+)/);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 100;
      
      if (prompt.includes('>') || prompt.includes('more than')) {
        rules = {
          field: 'total_spend',
          operator: '>',
          value: amount
        };
      } else if (prompt.includes('<') || prompt.includes('less than')) {
        rules = {
          field: 'total_spend',
          operator: '<',
          value: amount
        };
      } else {
        rules = {
          field: 'total_spend',
          operator: '>=',
          value: amount
        };
      }
    } else if (prompt.toLowerCase().includes('visit')) {
      const visitMatch = prompt.match(/(\d+)/);
      const visits = visitMatch ? parseInt(visitMatch[1]) : 1;
      
      rules = {
        field: 'visits_count',
        operator: '>=',
        value: visits
      };
    } else {
      // Default rule
      rules = {
        field: 'total_spend',
        operator: '>=',
        value: 100
      };
    }
    
    res.json({
      success: true,
      data: {
        rules,
        originalPrompt: prompt
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create campaign (temporary without auth for testing)
app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, rules_json, messageTemplate, segmentId, status = 'DRAFT' } = req.body;
    
    // First, get or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          googleId: 'test-google-id'
        }
      });
    }
    
    const campaign = await prisma.campaign.create({
      data: {
        name,
        userId: testUser.id, // Use the actual user ID
        status: status,
        rulesJson: rules_json || '{}',
        messageTemplate: messageTemplate,
        segmentId: segmentId || null,
      },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create campaign with auth (original)
app.post('/api/campaigns/auth', authMiddleware, async (req, res) => {
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

// Get campaigns (temporary without auth for testing)
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { 
        communicationLogs: true,
        segment: true  // Include segment information
      }
    });
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get campaigns with auth (original)
app.get('/api/campaigns/auth', authMiddleware, async (req, res) => {
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

// Launch campaign (change status from DRAFT to SCHEDULED)
app.post('/api/campaigns/:id/launch', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update campaign status from DRAFT to SCHEDULED
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        scheduledAt: new Date()
      }
    });
    
    res.json({ 
      success: true, 
      message: "Campaign launched successfully",
      data: campaign
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Campaign not found' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Delete campaign
app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the campaign (this will cascade delete communication logs)
    await prisma.campaign.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: "Campaign deleted successfully" 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Campaign not found' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
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
    const orderAmount = parseFloat(amount);
    
    // Create order and update customer's totalSpend in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderId,
          customerId,
          amount: orderAmount,
          status
        },
        include: {
          customer: {
            select: {
              name: true,
              totalSpend: true
            }
          }
        }
      });
      
      // Update customer's totalSpend
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalSpend: {
            increment: orderAmount
          }
        }
      });
      
      return order;
    });
    
    res.status(201).json({ 
      message: "Order created successfully", 
      order: {
        id: result.id,
        orderId: result.orderId,
        customerName: result.customer.name,
        amount: result.amount,
        date: result.createdAt,
        status: result.status,
        customerId: result.customerId
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order details first to know the amount and customer
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderId: true,
        amount: true,
        customerId: true
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Delete order and update customer's totalSpend in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the order
      await tx.order.delete({
        where: { id }
      });
      
      // Decrease customer's totalSpend
      await tx.customer.update({
        where: { id: order.customerId },
        data: {
          totalSpend: {
            decrement: order.amount
          }
        }
      });
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