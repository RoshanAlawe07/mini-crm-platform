#!/bin/bash

echo "🚀 Setting up Railway deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please set it to your Railway PostgreSQL URL"
    echo "Example: export DATABASE_URL='postgresql://user:pass@host:port/db'"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up production database..."

# Copy production schema
echo "📋 Copying production schema..."
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "🗄️  Pushing schema to database..."
npx prisma db push

# Check if we have existing SQLite data to migrate
if [ -f "prisma/dev.db" ]; then
    echo "📊 Found existing SQLite data. Migrating to PostgreSQL..."
    node migrate-to-postgres.js
    echo "✅ Data migration completed!"
else
    echo "ℹ️  No existing data found. Starting fresh with PostgreSQL."
fi

echo "🎉 Railway setup completed!"
echo "🌐 Your API is ready for deployment!"
