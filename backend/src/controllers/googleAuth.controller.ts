import { Request, Response } from 'express';
import axios from 'axios';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mini-crm-platform-psi.vercel.app';

// Generate Google OAuth URL
export const getGoogleAuthUrl = (req: Request, res: Response): void => {
  try {
    const redirectUri = `${process.env.BACKEND_URL || 'https://mini-crm-platform-tnsk.onrender.com'}/api/oauth/google/callback`;
    const scope = 'openid email profile';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    res.json({
      success: true,
      authUrl: authUrl,
      redirectUri: redirectUri
    });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Google auth URL'
    });
  }
};

// Handle Google OAuth callback
export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is already authenticated
    const isAuthenticated = req.cookies.isAuthenticated;
    if (isAuthenticated === 'true') {
      console.log('User already authenticated, redirecting to frontend');
      const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mini-crm-platform-psi.vercel.app';
      const redirectUrl = `${FRONTEND_URL}/auth/callback?success=true`;
      return res.redirect(redirectUrl);
    }
    
    const { code } = req.query;

    console.log('OAuth callback received:', { code: !!code });

    if (!code) {
      console.error('No authorization code provided');
      res.status(400).json({
        success: false,
        error: 'Authorization code not provided'
      });
      return;
    }

    // Validate required environment variables
    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing Google Client ID'
      });
      return;
    }

    if (!GOOGLE_CLIENT_SECRET) {
      console.error('GOOGLE_CLIENT_SECRET not configured');
      res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing Google Client Secret'
      });
      return;
    }

    const redirectUri = `${process.env.BACKEND_URL || 'https://mini-crm-platform-tnsk.onrender.com'}/api/oauth/google/callback`;
    
    console.log('🔍 OAuth Callback Debug Info:');
    console.log('BACKEND_URL:', JSON.stringify(process.env.BACKEND_URL));
    console.log('FRONTEND_URL:', JSON.stringify(process.env.FRONTEND_URL));
    console.log('redirectUri:', JSON.stringify(redirectUri));
    console.log('GOOGLE_CLIENT_ID:', !!GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', !!GOOGLE_CLIENT_SECRET);
    console.log('Authorization code received:', !!code);
    console.log('Full request URL:', req.url);
    console.log('Request headers:', req.headers);

    // Prepare token exchange request
    const tokenRequest = {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    };

    console.log('Token request data:', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: '***HIDDEN***',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    // Exchange code for access token (Google expects form-encoded data)
    const formData = new URLSearchParams();
    formData.append('client_id', GOOGLE_CLIENT_ID);
    formData.append('client_secret', GOOGLE_CLIENT_SECRET);
    formData.append('code', code as string);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', redirectUri);

    console.log('Sending form data to Google...');
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Token exchange successful');

    const { access_token, id_token } = tokenResponse.data;

    if (!access_token) {
      console.error('No access token received from Google');
      res.status(500).json({
        success: false,
        error: 'Failed to get access token from Google'
      });
      return;
    }

    // Get user info from Google
    console.log('Fetching user info from Google');
    const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
    const userInfo = userResponse.data;

    console.log('User info received:', { id: userInfo.id, email: userInfo.email, name: userInfo.name });

    if (!userInfo.id || !userInfo.email) {
      console.error('Invalid user info from Google:', userInfo);
      res.status(500).json({
        success: false,
        error: 'Invalid user information from Google'
      });
      return;
    }

    // Set simple authentication session (no JWT complexity)
    res.cookie('isAuthenticated', 'true', {
      httpOnly: true,           // Can't be accessed from JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Only over HTTPS in production
      sameSite: 'lax',          // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/'                 // Available site-wide
    });

    // Store user info in a simple session cookie
    res.cookie('userInfo', JSON.stringify({
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      googleId: userInfo.id
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('Simple authentication session created');
    
    // Redirect to frontend success page
    const redirectUrl = `${FRONTEND_URL}/auth/callback?success=true`;
    console.log('Redirecting to frontend:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Return more detailed error information
    const errorMessage = error.response?.data?.error || error.message;
    const errorDescription = error.response?.data?.error_description || 'Unknown error';
    
    res.status(500).json({
      success: false,
      error: 'OAuth callback failed',
      details: errorMessage,
      description: errorDescription,
      status: error.response?.status
    });
  }
};

// Verify JWT token
export const verifyToken = (req: Request, res: Response): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'No authorization header'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    const decoded = jwt.verify(token, jwtSecret);
    
    res.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        googleId: decoded.googleId
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
