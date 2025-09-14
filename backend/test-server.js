const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/customers', (req, res) => {
  res.json({
    customers: [
      {
        id: "1",
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+1 (555) 123-4567",
        totalSpend: 1250.50,
        visitsCount: 15,
        createdAt: "2025-01-15T10:30:00Z"
      },
      {
        id: "2", 
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 234-5678",
        totalSpend: 890.25,
        visitsCount: 8,
        createdAt: "2025-01-14T14:20:00Z"
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  });
});

app.post('/api/customers', (req, res) => {
  const { name, email, phone, totalSpend, visitsCount } = req.body;
  
  const newCustomer = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    totalSpend: totalSpend || 0,
    visitsCount: visitsCount || 0,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: "Customer created successfully",
    customer: newCustomer
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    message: "Customer deleted successfully",
    customer: { id }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
});

// Keep the server running
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});