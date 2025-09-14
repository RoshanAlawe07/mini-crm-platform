# Railway Deployment Guide for XenoCRM Backend

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. GitHub repository with your code
3. PostgreSQL database (Railway provides this)

## Step 1: Prepare Your Repository
1. Make sure all changes are committed and pushed to GitHub
2. Ensure your `package.json` has the correct scripts
3. Verify your `.env.example` file is up to date

## Step 2: Deploy on Railway

### Option A: Deploy from GitHub
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory

### Option B: Deploy with Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Step 4: Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provide the `DATABASE_URL` environment variable

## Step 5: Deploy
1. Railway will automatically build and deploy your application
2. Check the logs to ensure everything is working
3. Your API will be available at the provided Railway URL

## Step 6: Update Frontend
Update your frontend's API URL to point to your Railway backend URL:
```javascript
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

## Health Check
Your API will be available at:
- Health check: `https://your-railway-app.railway.app/health`
- API endpoints: `https://your-railway-app.railway.app/api/*`

## Troubleshooting
1. Check Railway logs for any errors
2. Ensure all environment variables are set
3. Verify database connection
4. Check if the build process completed successfully

## Environment Variables Reference
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Railway)
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time
- `NODE_ENV`: Environment (set to 'production')
- `FRONTEND_URL`: Your frontend domain for CORS
- `PORT`: Port number (Railway sets this automatically)
