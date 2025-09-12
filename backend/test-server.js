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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = await prisma.user.create({
      data: {
        email, 
        password: password,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user,
      token: 'test-token-' + user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: 'test-token-' + user.id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  res.json({
    user: {
      id: 'test-user-id',
      email: 'roshan@example.com',
      name: 'Roshan Kumar',
      role: 'USER'
    }
  });
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, total_spend, last_active, visits_count } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name,
        phone: phone || undefined,
        totalSpend: total_spend || 0,
        lastActive: last_active ? new Date(last_active) : undefined,
        visitsCount: visits_count || 0,
      },
      create: {
        name,
        email,
        phone: phone || null,
        totalSpend: total_spend || 0,
        lastActive: last_active ? new Date(last_active) : null,
        visitsCount: visits_count || 0,
      }
    });
    
    res.status(201).json({
      message: 'Customer processed successfully',
      customer: {
        id: customer.id,
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
    console.error('Create customer error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Customer with this email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
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
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (spend_gt) {
      where.totalSpend = { ...where.totalSpend, gte: parseFloat(spend_gt) };
    }
    if (spend_lt) {
      where.totalSpend = { ...where.totalSpend, lte: parseFloat(spend_lt) };
    }
    if (visits_gt) {
      where.visitsCount = { ...where.visitsCount, gte: parseInt(visits_gt) };
    }
    if (visits_lt) {
      where.visitsCount = { ...where.visitsCount, lte: parseInt(visits_lt) };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const orderBy = {};
    orderBy[sort_by] = sort_order;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy
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
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Test Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
