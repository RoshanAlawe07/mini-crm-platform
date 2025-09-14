#!/bin/bash

echo "🚀 Building for Railway deployment..."

# Check if we're in the right directory
echo "📁 Current directory: $(pwd)"
echo "📁 Contents:"
ls -la

# Check for prisma schema
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Found prisma/schema.prisma"
else
    echo "❌ prisma/schema.prisma not found"
    echo "🔍 Searching for schema files..."
    find . -name "schema.prisma" -type f
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed!"
