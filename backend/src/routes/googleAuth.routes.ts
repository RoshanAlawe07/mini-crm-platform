import express from 'express';
import { getGoogleAuthUrl, handleGoogleCallback, verifyToken } from '../controllers/googleAuth.controller';

const router = express.Router();

/**
 * @swagger
 * /api/oauth/google/url:
 *   get:
 *     summary: Get Google OAuth authentication URL
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google OAuth URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authUrl:
 *                   type: string
 *                   format: uri
 *                   description: Google OAuth authorization URL
 *                   example: https://accounts.google.com/o/oauth2/v2/auth?client_id=...
 *                 redirectUri:
 *                   type: string
 *                   format: uri
 *                   description: OAuth callback URI
 *                   example: https://api.example.com/api/oauth/google/callback
 *                 state:
 *                   type: string
 *                   description: OAuth state parameter for security
 *                   example: random_state_string_123
 *       500:
 *         description: Failed to generate Google auth URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/google/url', getGoogleAuthUrl);

/**
 * @swagger
 * /api/oauth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *         example: 4/0AdQt8qg...
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *         description: State parameter for security
 *         example: random_state_string_123
 *     responses:
 *       200:
 *         description: OAuth callback handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid authorization code or state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: OAuth callback processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/google/callback', handleGoogleCallback);

/**
 * @swagger
 * /api/oauth/verify:
 *   get:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify', verifyToken);

export default router;
