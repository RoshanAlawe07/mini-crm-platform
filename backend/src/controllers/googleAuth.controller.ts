import { Request, Response } from 'express';
import axios from 'axios';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mini-crm-platform-psi.vercel.app';

// Generate Google OAuth URL
export const getGoogleAuthUrl = (req: Request, res: Response): void => {
  try {
    const redirectUri = `${FRONTEND_URL}/auth/google/callback`;
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
    const { code } = req.query;

    if (!code) {
      res.status(400).json({
        success: false,
        error: 'Authorization code not provided'
      });
      return;
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: `${FRONTEND_URL}/auth/google/callback`
    });

    const { access_token, id_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
    const userInfo = userResponse.data;

    // Create JWT token for our app
    const jwt = require('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    
    const token = jwt.sign({
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      googleId: userInfo.id
    }, jwtSecret, { expiresIn: '7d' });

    // Redirect to frontend with token
    const redirectUrl = `${FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'OAuth callback failed'
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
