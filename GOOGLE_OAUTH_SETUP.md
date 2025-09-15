# Google OAuth 2.0 Setup Guide

## 🚨 Current Issue
Google is blocking the OAuth flow because the app doesn't comply with their OAuth 2.0 security policies.

## ✅ Solution Steps

### 1. Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select or Create Project**: Choose your project or create a new one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google OAuth2 API"

### 2. Create OAuth 2.0 Credentials

1. **Go to Credentials**: APIs & Services > Credentials
2. **Create OAuth 2.0 Client ID**:
   - Application type: "Web application"
   - Name: "XenoCRM" (or your preferred name)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3001
     https://mini-crm-platform-psi.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3001/auth/google/callback
     https://mini-crm-platform-psi.vercel.app/auth/google/callback
     ```

### 3. OAuth Consent Screen Configuration

1. **Go to OAuth consent screen**: APIs & Services > OAuth consent screen
2. **Choose User Type**: 
   - For testing: "External" (you can add test users)
   - For production: "External" (requires verification)
3. **Fill Required Fields**:
   - App name: "XenoCRM"
   - User support email: Your email
   - Developer contact: Your email
4. **Scopes**: Add these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. **Test Users** (for External apps):
   - Add your email and any test user emails

### 4. Environment Variables

Update your environment variables with the new credentials:

**Backend (.env)**:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=https://mini-crm-platform-psi.vercel.app
JWT_SECRET=your_jwt_secret_here
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### 5. Common Issues & Solutions

#### Issue: "This app isn't verified"
- **Solution**: Add your email as a test user in OAuth consent screen
- **For Production**: Complete Google's verification process

#### Issue: "redirect_uri_mismatch"
- **Solution**: Ensure redirect URIs exactly match what's in Google Console
- **Check**: No trailing slashes, correct protocol (http vs https)

#### Issue: "invalid_client"
- **Solution**: Verify CLIENT_ID and CLIENT_SECRET are correct
- **Check**: No extra spaces or quotes in environment variables

#### Issue: "access_denied"
- **Solution**: Check OAuth consent screen configuration
- **Check**: Ensure scopes are properly configured

### 6. Testing Steps

1. **Test Locally**:
   ```bash
   # Backend
   cd backend
   npm start
   
   # Frontend
   cd frontend
   npm run dev
   ```

2. **Test OAuth Flow**:
   - Go to http://localhost:3001/signin
   - Click "Continue with Google"
   - Should redirect to Google OAuth
   - After authorization, should redirect back to dashboard

3. **Test Production**:
   - Deploy to Vercel
   - Test the same flow on production URL

### 7. Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **State Parameter**: We've added state parameter for CSRF protection
3. **Scope Limitation**: Only request necessary scopes
4. **Token Expiration**: Implement proper token refresh
5. **Error Handling**: Handle OAuth errors gracefully

### 8. Debugging

Check these endpoints for debugging:

- **Backend Health**: `https://your-backend.railway.app/status`
- **OAuth Test**: `https://your-backend.railway.app/api/oauth/test`
- **OAuth URL**: `https://your-backend.railway.app/api/oauth/google/url`

## 🔧 Quick Fix Commands

```bash
# Check if backend is running
curl https://your-backend.railway.app/health

# Test OAuth configuration
curl https://your-backend.railway.app/api/oauth/test

# Get OAuth URL
curl https://your-backend.railway.app/api/oauth/google/url
```

## 📝 Notes

- The app is now configured to use `email profile` scopes instead of `openid email profile`
- Added state parameter for CSRF protection
- Removed `prompt=consent` which can cause policy violations
- Set `access_type=online` for better compatibility

After following these steps, your Google OAuth should work properly!
