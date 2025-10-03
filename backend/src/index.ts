import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { specs, swaggerUi } from './swagger';

dotenv.config();

async function runAutoFix() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Running automatic database fix...');
      const { autoFixDatabase } = require('../auto-fix-startup.js');
      const success = await autoFixDatabase();
      if (success) {
        console.log('Database auto-fix completed successfully');
      } else {
        console.log('Database auto-fix had issues, but continuing...');
      }
    } else {
      console.log('Development mode: Skipping auto-fix');
    }
  } catch (error: any) {
    console.log('Database auto-fix failed, but continuing:', error.message);
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required but not set!');
  console.error('   Please set DATABASE_URL in your environment variables.');
  console.error('   Format: postgresql://username:password@host:port/database_name');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('DATABASE_URL must be a PostgreSQL connection string in production!');
  console.error('   Current value:', process.env.DATABASE_URL);
  console.error('   Expected format: postgresql://username:password@host:port/database_name');
  process.exit(1);
}

if (process.env.NODE_ENV === 'development') {
  console.log('Development mode: Using local database');
  console.log('   Database URL:', process.env.DATABASE_URL);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'https://mini-crm-platform-psi.vercel.app'
];

if (process.env.FRONTEND_URL && typeof process.env.FRONTEND_URL === 'string') {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const validOrigins = allowedOrigins.filter(origin => origin && typeof origin === 'string');

app.use(cors({
  origin: (origin, callback) => {
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parsing middleware
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/health/auth', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    authorized: true,
    user: {
      id: "default-user",
      email: "user@example.com",
      name: "Default User",
      googleId: "default-google-id"
    },
    authError: null,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'XenoCRM Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: true,
      type: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
    },
    authentication: {
      authorized: true,
      user: {
        id: "default-user",
        email: "user@example.com",
        name: "Default User",
        googleId: "default-google-id"
      },
      authError: null,
      jwtSecret: !!process.env.JWT_SECRET,
      googleOAuth: {
        enabled: true,
        clientId: !!process.env.GOOGLE_CLIENT_ID,
        clientSecret: !!process.env.GOOGLE_CLIENT_SECRET
      }
    },
    frontend: {
      url: process.env.FRONTEND_URL || 'https://mini-crm-platform-psi.vercel.app',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set'
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/oauth/test', (req, res) => {
  const redirectUri = `${process.env.BACKEND_URL || 'https://mini-crm-platform-tnsk.onrender.com'}/api/oauth/google/callback`;
  
  res.json({
    message: 'OAuth routes are working!',
    timestamp: new Date().toISOString(),
    clientId: !!process.env.CLIENT_ID,
    clientSecret: !!process.env.CLIENT_SECRET,
    googleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdValue: process.env.CLIENT_ID,
    googleClientIdValue: process.env.GOOGLE_CLIENT_ID,
    backendUrl: process.env.BACKEND_URL,
    frontendUrl: process.env.FRONTEND_URL,
    redirectUri: redirectUri,
    jwtSecret: !!process.env.JWT_SECRET
  });
});

app.get('/api/auth/me', (req, res) => {
  try {
    const isAuthenticated = req.cookies.isAuthenticated;
    const userInfoCookie = req.cookies.userInfo;
    
    if (!isAuthenticated || isAuthenticated !== 'true' || !userInfoCookie) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const userInfo = JSON.parse(userInfoCookie);
    
    return res.json({
      success: true,
      user: userInfo
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    
    res.clearCookie('isAuthenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.clearCookie('userInfo', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid session'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  try {
    res.clearCookie('isAuthenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.clearCookie('userInfo', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

app.get('/api/oauth/google', (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const BACKEND_URL = (process.env.BACKEND_URL || 'https://mini-crm-platform-tnsk.onrender.com').trim();
    const redirectUri = `${BACKEND_URL}/api/oauth/google/callback`;
    
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=online&` +
      `include_granted_scopes=true`;

    console.log('Direct OAuth Debug Info:');
    console.log('BACKEND_URL:', JSON.stringify(BACKEND_URL));
    console.log('redirectUri:', JSON.stringify(redirectUri));
    console.log('GOOGLE_CLIENT_ID:', !!GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_ID value:', GOOGLE_CLIENT_ID);
    console.log('Generated auth URL:', authUrl);

    console.log('Redirecting to Google OAuth:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Google auth URL'
    });
  }
});

app.get('/api/oauth/google/url', (req, res) => {
  try {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://mini-crm-platform-psi.vercel.app').trim();
    const BACKEND_URL = (process.env.BACKEND_URL || 'https://mini-crm-platform-tnsk.onrender.com').trim();
    const redirectUri = `${BACKEND_URL}/api/oauth/google/callback`;
    
    console.log('OAuth Debug Info:');
    console.log('FRONTEND_URL:', JSON.stringify(FRONTEND_URL));
    console.log('redirectUri:', JSON.stringify(redirectUri));
    console.log('GOOGLE_CLIENT_ID:', !!GOOGLE_CLIENT_ID);
    
    const scope = 'email profile';
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=online&` +
      `include_granted_scopes=true`;

    res.json({
      success: true,
      authUrl: authUrl,
      redirectUri: redirectUri,
      state: state
    });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Google auth URL'
    });
  }
});


import authRoutes from './routes/auth';
import googleAuthRoutes from './routes/googleAuth.routes';
import customersRoutes from './routes/customers.routes';
import ordersRoutes from './routes/orders.routes';
import segmentsRoutes from './routes/segments.routes';
import campaignsRoutes from './routes/campaigns.routes';
import deliveryReceiptRoutes from './routes/deliveryReceipt.routes';
import aiRoutes from './routes/ai.routes';
import vendorRoutes from './routes/vendor';


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'XenoCRM API Documentation'
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.use('/api/auth', authRoutes);
app.use('/api/oauth', googleAuthRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/delivery-receipt', deliveryReceiptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/vendor', vendorRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

async function startServer() {
  await runAutoFix();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer();

export default app;
