#!/bin/bash

echo "🚀 Building for Railway deployment..."
echo "📁 Current working directory: $(pwd)"
echo "📁 Contents:"
ls -la

# Check if we're in the right directory
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Found prisma/schema.prisma in current directory"
elif [ -f "../prisma/schema.prisma" ]; then
    echo "✅ Found prisma/schema.prisma in parent directory"
    echo "📁 Parent directory contents:"
    ls -la ..
else
    echo "❌ prisma/schema.prisma not found"
    echo "🔍 Searching for schema files..."
    find . -name "schema.prisma" -type f 2>/dev/null || echo "No schema files found"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript
echo "🔨 Building TypeScript..."
npx tsc

echo "✅ Build completed!"
