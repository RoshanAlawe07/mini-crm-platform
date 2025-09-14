#!/bin/bash

echo "🚀 Deploying to Railway..."

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Railway
    echo "🚀 Deploying to Railway..."
    railway up
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your API is now live on Railway!"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
