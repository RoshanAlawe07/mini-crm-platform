import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Auto-fix database on startup (for free tier without shell access)
async function runAutoFix() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Running automatic database fix...');
      const { autoFixDatabase } = require('../auto-fix-startup.js');
      const success = await autoFixDatabase();
      if (success) {
        console.log('✅ Database auto-fix completed successfully');
      } else {
        console.log('⚠️  Database auto-fix had issues, but continuing...');
      }
    } else {
      console.log('🔧 Development mode: Skipping auto-fix');
    }
  } catch (error: any) {
    console.log('⚠️  Database auto-fix failed, but continuing:', error.message);
  }
}

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required but not set!');
  console.error('   Please set DATABASE_URL in your environment variables.');
  console.error('   Format: postgresql://username:password@host:port/database_name');
  process.exit(1);
}

// Validate DATABASE_URL format (allow SQLite for local development)
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must be a PostgreSQL connection string in production!');
  console.error('   Current value:', process.env.DATABASE_URL);
  console.error('   Expected format: postgresql://username:password@host:port/database_name');
  process.exit(1);
}

if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Development mode: Using local database');
  console.log('   Database URL:', process.env.DATABASE_URL);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration with proper origin validation
const allowedOrigins = [
  'http://localhost:3000',
  'https://mini-crm-platform-psi.vercel.app'
];

// Add environment variable origins if they exist and are valid
if (process.env.FRONTEND_URL && typeof process.env.FRONTEND_URL === 'string') {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Filter out any undefined values
const validOrigins = allowedOrigins.filter(origin => origin && typeof origin === 'string');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (validOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from './routes/auth';
import customersRoutes from './routes/customers.routes';
import ordersRoutes from './routes/orders.routes';
import segmentsRoutes from './routes/segments.routes';
import campaignsRoutes from './routes/campaigns.routes';
import deliveryReceiptRoutes from './routes/deliveryReceipt.routes';
import aiRoutes from './routes/ai.routes';

// Import workers
// import './workers/campaign.worker';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/delivery-receipt', deliveryReceiptRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/contacts', contactRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server with auto-fix
async function startServer() {
  // Run auto-fix before starting server
  await runAutoFix();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

startServer();

export default app;
