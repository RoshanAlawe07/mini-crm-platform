# Railway Deployment Guide

## 🚀 Deploy Backend to Railway

### Prerequisites
1. Railway account (sign up at railway.app)
2. GitHub repository with your code
3. Railway CLI (optional but recommended)

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Make sure the backend folder is at the root level or create a monorepo structure

### Step 2: Deploy via Railway Dashboard

#### Option A: Deploy from GitHub
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the backend folder as the root directory
6. Railway will automatically detect it's a Node.js project

#### Option B: Deploy with Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

### Step 3: Configure Environment Variables
In Railway Dashboard, go to your project → Variables tab and add:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Database Setup

#### Option A: Use Railway PostgreSQL (Recommended)
1. In Railway Dashboard, go to your project
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service
5. Add it to your project variables

#### Option B: Keep SQLite (Not Recommended for Production)
- SQLite files are ephemeral on Railway
- Data will be lost on redeploy
- Only suitable for development/testing

### Step 5: Update Prisma Schema for Production
If using PostgreSQL, update your schema:
```bash
# Copy production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate new Prisma client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push
```

### Step 6: Migrate Data (Optional)
If you have existing SQLite data:
```bash
# Set DATABASE_URL to your Railway PostgreSQL URL
export DATABASE_URL="postgresql://..."

# Run migration script
node migrate-to-postgres.js
```

### Step 5: Get Your API URL
After deployment, Railway will provide:
- **API URL**: `https://your-project-name.railway.app`
- **Health Check**: `https://your-project-name.railway.app/api/campaigns`

### Step 6: Update Frontend
Update your frontend API calls to use the Railway URL:
```javascript
// Change from:
const response = await fetch('http://localhost:3001/api/campaigns');

// To:
const response = await fetch('https://your-project-name.railway.app/api/campaigns');
```

## 🔧 Troubleshooting

### Common Issues:
1. **Build Fails**: Check if all dependencies are in package.json
2. **Database Issues**: Ensure Prisma schema is correct
3. **CORS Errors**: Update CORS_ORIGIN with your frontend URL
4. **Port Issues**: Railway automatically sets PORT environment variable

### Logs:
- View logs in Railway Dashboard → Deployments → View Logs
- Or use CLI: `railway logs`

## 📝 Notes
- Railway provides free tier with 500 hours/month
- SQLite database is included (no separate database service needed)
- Automatic HTTPS and custom domains available
- Built-in monitoring and analytics