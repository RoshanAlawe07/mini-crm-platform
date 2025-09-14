#!/bin/bash

echo "🚀 Deploying Frontend to Railway..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Frontend deployment completed!"
