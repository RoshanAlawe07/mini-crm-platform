# Redis Setup Guide for Mini CRM Platform

## 🚀 Quick Setup Options

### Option 1: Docker (Recommended)
```bash
# Install Docker Desktop first, then run:
docker run -d -p 6379:6379 --name redis-server redis:alpine

# To start Redis later:
docker start redis-server

# To stop Redis:
docker stop redis-server
```

### Option 2: Windows Native Installation
1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Redis will start on port 6379

### Option 3: WSL (Windows Subsystem for Linux)
```bash
# In WSL terminal:
sudo apt update
sudo apt install redis-server
redis-server
```

## 🔧 Environment Configuration

Update your `.env` file:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379
```

## 🚀 Running the Complete System

### Terminal 1: Start the API Server
```bash
cd mini-crm-platform/backend
npm run dev
```

### Terminal 2: Start the Worker
```bash
cd mini-crm-platform/backend
npm run worker
```

## 📊 Testing the Async Flow

1. **Start Redis** (using one of the options above)
2. **Start the API server** (`npm run dev`)
3. **Start the worker** (`npm run worker`)
4. **Test in Postman:**
   - POST `/api/customers` with customer data
   - You should see "Customer queued for ingestion" response
   - Check worker terminal for processing logs
   - Check database for the created customer

## 🔍 Monitoring

- **API Logs:** Server terminal shows incoming requests
- **Worker Logs:** Worker terminal shows job processing
- **Redis CLI:** `redis-cli` to monitor queue status

## 🛠️ Troubleshooting

- **Redis not starting:** Check if port 6379 is available
- **Worker not processing:** Ensure Redis is running and accessible
- **Connection errors:** Verify Redis host/port in .env file
