#!/bin/bash

echo "🚀 Deploying Backend to Railway..."

# Build the backend
echo "📦 Building backend..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Backend deployment completed!"
