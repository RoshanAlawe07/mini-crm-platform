# Google OAuth 2.0 Authentication Setup

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "XenoCRM Web Client"
5. Configure Authorized Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`

## Step 2: Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

## Step 4: Test Authentication

1. Start the development server: `npm run dev`
2. Go to `http://localhost:3000/signin`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to the dashboard

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Protected routes (only logged-in users can access)
- ✅ Automatic redirect to sign-in page
- ✅ Session management with NextAuth.js
- ✅ Mobile-responsive sign-in page
- ✅ Secure JWT token handling

## Protected Pages

All main pages are now protected:
- Home (`/`)
- Dashboard (`/dashboard`)
- Customers (`/customers`)
- Orders (`/orders`)
- Campaigns (`/campaigns`)
- Segments (`/segments`)

Users must be authenticated to access these pages.
