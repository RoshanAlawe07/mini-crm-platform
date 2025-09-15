import express from 'express';
import { getGoogleAuthUrl, handleGoogleCallback, verifyToken } from '../controllers/googleAuth.controller';

const router = express.Router();

// Get Google OAuth URL
router.get('/google/url', getGoogleAuthUrl);

// Handle Google OAuth callback
router.get('/google/callback', handleGoogleCallback);

// Verify JWT token
router.get('/verify', verifyToken);

export default router;
