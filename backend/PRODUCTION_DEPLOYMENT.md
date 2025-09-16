# Production Deployment Guide for XenoCRM with Swagger UI

## Overview
This guide explains how to deploy XenoCRM with Swagger UI to production environments.

## Current Production URLs
- **Backend**: `https://mini-crm-platform-tnsk.onrender.com`
- **Frontend**: `https://mini-crm-platform-psi.vercel.app`
- **Swagger UI**: `https://mini-crm-platform-tnsk.onrender.com/api-docs`

## Deployment Steps

### 1. Backend Deployment (Railway/Render)

#### Option A: Railway Deployment
```bash
# 1. Push changes to GitHub
git add .
git commit -m "Add Swagger UI and fix port conflicts"
git push origin main.html

# 2. Railway will automatically deploy
# Swagger UI will be available at: https://your-railway-app.railway.app/api-docs
```

#### Option B: Render Deployment
```bash
# 1. Push changes to GitHub
git add .
git commit -m "Add Swagger UI and fix port conflicts"
git push origin main.html

# 2. Render will automatically deploy
# Swagger UI will be available at: https://mini-crm-platform-tnsk.onrender.com/api-docs
```

### 2. Environment Variables for Production

Make sure these environment variables are set in your production environment:

```bash
# Required for Swagger
BACKEND_URL=https://mini-crm-platform-tnsk.onrender.com
FRONTEND_URL=https://mini-crm-platform-psi.vercel.app

# Database
DATABASE_URL=your-production-database-url

# JWT
JWT_SECRET=your-jwt-secret

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Frontend Deployment (Vercel)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Update environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://mini-crm-platform-tnsk.onrender.com

# 3. Deploy (Vercel will auto-deploy from GitHub)
# Or manually deploy:
vercel --prod
```

## Swagger UI Access

### Production URLs
- **Swagger UI**: `https://mini-crm-platform-tnsk.onrender.com/api-docs`
- **Swagger JSON**: `https://mini-crm-platform-tnsk.onrender.com/api-docs.json`

### Development URLs
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Swagger JSON**: `http://localhost:3001/api-docs.json`

## Port Configuration

### Development
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:3001`
- **Swagger UI**: `http://localhost:3001/api-docs`

### Production
- **Frontend**: `https://mini-crm-platform-psi.vercel.app`
- **Backend**: `https://mini-crm-platform-tnsk.onrender.com`
- **Swagger UI**: `https://mini-crm-platform-tnsk.onrender.com/api-docs`

## Testing Production Deployment

### 1. Health Check
```bash
curl https://mini-crm-platform-tnsk.onrender.com/health
```

### 2. Swagger UI Access
Open in browser: `https://mini-crm-platform-tnsk.onrender.com/api-docs`

### 3. Test API Endpoints
Use the interactive Swagger UI to test:
- Customer creation
- Order management
- Campaign operations
- Segment management

## Security Considerations

### 1. CORS Configuration
The backend is configured to allow requests from:
- `https://mini-crm-platform-psi.vercel.app` (production frontend)
- `http://localhost:3000` (development frontend)

### 2. Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to all endpoints including Swagger UI

### 3. Authentication
- JWT Bearer token authentication
- Configured in Swagger UI for testing

## Monitoring and Maintenance

### 1. Health Monitoring
- **Health Check**: `GET /health`
- **Status Check**: `GET /status`
- **CORS Test**: `GET /cors-test`

### 2. Logs
Monitor application logs for:
- Swagger UI access
- API endpoint usage
- Error rates
- Performance metrics

### 3. Updates
To update Swagger documentation:
1. Modify route files with new `@swagger` comments
2. Push changes to GitHub
3. Production will auto-deploy

## Troubleshooting

### Common Issues

#### 1. Swagger UI Not Loading
- Check if backend is running
- Verify CORS configuration
- Check browser console for errors

#### 2. API Endpoints Not Working
- Verify environment variables
- Check database connection
- Review application logs

#### 3. CORS Errors
- Ensure frontend URL is in allowed origins
- Check BACKEND_URL environment variable

### Debug Commands

```bash
# Check backend health
curl https://mini-crm-platform-tnsk.onrender.com/health

# Check Swagger JSON
curl https://mini-crm-platform-tnsk.onrender.com/api-docs.json

# Test CORS
curl -H "Origin: https://mini-crm-platform-psi.vercel.app" \
     https://mini-crm-platform-tnsk.onrender.com/cors-test
```

## Performance Optimization

### 1. Caching
- Swagger UI is served statically
- API responses can be cached
- Consider CDN for static assets

### 2. Compression
- Gzip compression enabled
- Swagger UI assets are minified

### 3. Rate Limiting
- Configured to prevent abuse
- Adjust limits based on usage

## Documentation Updates

### Adding New Endpoints
1. Add JSDoc comments to route files
2. Update schemas if needed
3. Test locally first
4. Deploy to production

### Example New Endpoint Documentation
```javascript
/**
 * @swagger
 * /api/new-endpoint:
 *   post:
 *     summary: New endpoint description
 *     tags: [NewTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test endpoints individually
4. Review CORS configuration

## Success Criteria

✅ **Swagger UI accessible** at production URL
✅ **All API endpoints documented** and testable
✅ **CORS properly configured** for frontend
✅ **Authentication working** in Swagger UI
✅ **Health checks passing**
✅ **Frontend can communicate** with backend

