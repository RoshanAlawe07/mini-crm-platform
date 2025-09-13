# Authentication System Testing Guide

## Overview
This guide covers testing the complete authentication system with Google OAuth, JWT tokens, and protected routes.

## Prerequisites
1. Start the server: `node simple-test-server.js`
2. Database migration: `npx prisma db push`
3. Import Postman collection: `Step8_Authentication_Testing_Collection.json`

## Authentication Flow

### 1. Google OAuth Login
**POST** `/api/auth/google`
```json
{
  "googleId": "google_123456789",
  "email": "test@example.com",
  "name": "Test User",
  "picture": "https://example.com/avatar.jpg"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "test@example.com",
      "name": "Test User",
      "picture": "https://example.com/avatar.jpg"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Get Current User Profile
**GET** `/api/auth/me`
**Headers:** `Authorization: Bearer {token}`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "test@example.com",
      "name": "Test User",
      "picture": "https://example.com/avatar.jpg",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Protected Routes Testing

### 1. Campaign Creation (Authenticated)
**POST** `/api/campaigns`
**Headers:** `Authorization: Bearer {token}`
```json
{
  "name": "Authenticated User Campaign",
  "rules_json": "{\"op\":\"AND\",\"rules\":[{\"field\":\"total_spend\",\"operator\":\">\",\"value\":1000}]}",
  "messageTemplate": "Hello from authenticated user!"
}
```

**Expected:** Status 201, campaign created with `userId` field

### 2. Get User Campaigns (Authenticated)
**GET** `/api/campaigns`
**Headers:** `Authorization: Bearer {token}`

**Expected:** Only campaigns belonging to the authenticated user

### 3. Send Campaign (Authenticated)
**POST** `/api/campaigns/{id}/send`
**Headers:** `Authorization: Bearer {token}`

**Expected:** Only if campaign belongs to the authenticated user

## Unauthorized Access Testing

### 1. No Token
**POST** `/api/campaigns`
**Expected:** Status 401, "Missing authorization header"

### 2. Invalid Token
**POST** `/api/campaigns`
**Headers:** `Authorization: Bearer invalid_token`
**Expected:** Status 403, "Invalid or expired token"

### 3. Missing Token
**GET** `/api/campaigns`
**Expected:** Status 401, "Missing authorization header"

## Multi-User Testing

### 1. Create Two Users
- User 1: `google_user1`, `user1@example.com`
- User 2: `google_user2`, `user2@example.com`

### 2. Create Campaigns for Each User
- User 1 creates "User 1 Campaign"
- User 2 creates "User 2 Campaign"

### 3. Verify Isolation
- User 1 can only see their campaigns
- User 2 can only see their campaigns
- Users cannot access each other's campaigns

## Database Verification

### Check Users Table
```sql
SELECT * FROM users;
```

### Check Campaigns with User Association
```sql
SELECT c.*, u.email as user_email 
FROM campaigns c 
JOIN users u ON c.userId = u.id;
```

## Security Features Verified

✅ **JWT Token Validation** - Tokens are verified on each request
✅ **User Isolation** - Users can only access their own data
✅ **Route Protection** - All campaign routes require authentication
✅ **Token Expiration** - Tokens expire after 7 days
✅ **Error Handling** - Proper error messages for unauthorized access
✅ **Database Security** - User-campaign relationships enforced at DB level

## Testing Checklist

- [ ] Google OAuth login works
- [ ] JWT token generation works
- [ ] User profile retrieval works
- [ ] Campaign creation requires authentication
- [ ] Campaign listing shows only user's campaigns
- [ ] Campaign sending requires authentication
- [ ] Unauthorized access is blocked
- [ ] Multi-user isolation works
- [ ] Token validation works
- [ ] Error handling works properly

## Expected Results

After completing all tests:
- ✅ Authentication system is fully functional
- ✅ Multi-user system works securely
- ✅ Campaigns are properly isolated by user
- ✅ All protected routes are secured
- ✅ Error handling is comprehensive









