# 🚀 Cloud Deployment Guide

## Recommended Setup

### Frontend: Vercel (Free)
### Backend: Railway (Free)
### Database: Railway PostgreSQL (Free)

## Step 1: Prepare for Deployment

### Backend Setup
1. **Update Prisma Schema for Production:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Environment Variables for Railway:**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   PORT=3001
   ```

### Frontend Setup
1. **Update API URLs:**
   - Change `http://localhost:3001` to your Railway backend URL
   - Example: `https://your-app.railway.app`

## Step 2: Deploy Backend to Railway

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add authentication and cloud deployment"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose the `backend` folder
   - Add environment variables:
     - `DATABASE_URL` (Railway will provide PostgreSQL URL)
     - `JWT_SECRET` (generate a secure random string)
     - `NODE_ENV=production`

3. **Database Migration:**
   ```bash
   npx prisma migrate deploy
   ```

## Step 3: Deploy Frontend to Vercel

1. **Update API URLs in Frontend:**
   - Replace `http://localhost:3001` with your Railway URL
   - Update in: `signin/page.tsx`, `signup/page.tsx`, `lib/api.ts`

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project" → "Import Git Repository"
   - Select your repository
   - Choose the `frontend` folder
   - Deploy!

## Step 4: Environment Variables

### Railway (Backend)
```
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PORT=3001
```

### Vercel (Frontend)
```
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

## Step 5: Update Frontend API Calls

Replace all `http://localhost:3001` with your Railway URL:

```typescript
// In signin/page.tsx and signup/page.tsx
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
  // ... rest of the code
});
```

## Step 6: Database Migration

After deployment, run:
```bash
npx prisma migrate deploy
```

## URLs After Deployment

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-app.railway.app`
- **API Health:** `https://your-app.railway.app/health`

## Features Included

✅ **Authentication System:**
- Sign up with email/password
- Sign in with email/password
- JWT token authentication
- Password hashing with bcrypt

✅ **CRM Features:**
- Customer management
- Order management
- Campaign management
- Segment management
- Real-time data updates

✅ **Cloud Ready:**
- Environment variable configuration
- Production database setup
- HTTPS enabled
- Auto-scaling

## Cost

- **Vercel:** Free tier (100GB bandwidth, unlimited deployments)
- **Railway:** Free tier (500 hours/month, 1GB RAM, 1GB storage)
- **Total:** $0/month for small to medium usage

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Update API URLs
4. Test authentication flow
5. Set up custom domain (optional)

Your CRM platform will be live on the cloud! 🎉
