# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install OpenSSL and other required packages for Prisma
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma folder so Prisma can see schema.prisma
COPY prisma ./prisma

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy Railway schema for production
RUN cp prisma/schema.railway.prisma prisma/schema.prisma

# Generate Prisma client with Railway schema
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build TypeScript
RUN npx tsc

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/campaigns', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with proper setup
CMD ["npm", "run", "start:railway"]
