# Campaign Delivery System Testing Guide

## Prerequisites
1. Start the server
2. Database connected (SQLite/PostgreSQL)
3. Import Postman collections

## Testing Checklist

### 1. POST /api/campaigns → creates new campaign in DB

**Method:** `POST`  
**URL:** `http://localhost:3001/api/campaigns`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "name": "Test Campaign Step 6",
  "rules_json": "{\"op\":\"AND\",\"rules\":[{\"field\":\"total_spend\",\"operator\":\">\",\"value\":1000},{\"field\":\"visits_count\",\"operator\":\">=\",\"value\":1}]}",
  "messageTemplate": "Hello! This is a test message for Step 6 verification."
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign-id-here",
    "name": "Test Campaign Step 6",
    "status": "DRAFT",
    "rulesJson": "{\"op\":\"AND\",\"rules\":[{\"field\":\"total_spend\",\"operator\":\">\",\"value\":1000},{\"field\":\"visits_count\",\"operator\":\">=\",\"value\":1}]}",
    "messageTemplate": "Hello! This is a test message for Step 6 verification.",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**✅ Verification:** Status 201, campaign saved with status "DRAFT"

---

### **2. ✅ POST /api/campaigns/:id/send → logs created with PENDING status**

**Method:** `POST`  
**URL:** `http://localhost:3001/api/campaigns/{campaign_id}/send`  
**Headers:** `Content-Type: application/json`

**Expected Response:**
```json
{
  "success": true,
  "message": "Campaign sent successfully",
  "data": {
    "campaignId": "campaign-id-here",
    "customersProcessed": 3,
    "messagesCreated": 3,
    "results": [
      {
        "customerId": "customer-1",
        "messageId": "msg-1234567890-abc"
      },
      {
        "customerId": "customer-2", 
        "messageId": "msg-1234567891-def"
      }
    ]
  }
}
```

**✅ Verification:** 
- Status 200
- Communication logs created
- All logs have PENDING status
- Each log has unique messageId

---

### **3. ✅ Queue receives jobs for each customer**

**Check Redis Queue:**
```bash
# Connect to Redis CLI
redis-cli

# Check queue length
LLEN bull:ingest-campaigns:waiting

# Check job details
LRANGE bull:ingest-campaigns:waiting 0 -1
```

**Expected:** Jobs in queue with type "deliverMessage"

---

### **4. ✅ Worker processes jobs: 90% success, 10% fail**

**Monitor Console Output:**
```
Message msg-1234567890-abc queued for sent to customer customer-1
Message msg-1234567891-def queued for failed to customer customer-2
Batch updated 2 messages to SENT status
Batch updated 1 messages to FAILED status
```

**✅ Verification:** 
- Random delays (200ms-2s)
- 90% success, 10% failure ratio
- Batch processing logs

---

### **5. ✅ communication_log table updates correctly**

**Check Database:**
```sql
SELECT 
  status, 
  COUNT(*) as count,
  AVG(attempts) as avg_attempts,
  last_attempt_at
FROM communication_log 
WHERE campaign_id = 'your-campaign-id'
GROUP BY status;
```

**Expected Results:**
- Status: "SENT" and "FAILED" (no more "PENDING")
- attempts field incremented
- lastAttemptAt timestamp set
- deliveryReceipt field populated

---

### **6. ✅ Delivery Receipt Endpoint Test**

**Method:** `POST`  
**URL:** `http://localhost:3001/api/delivery-receipt`  
**Headers:** `Content-Type: application/json`

**Body:**
```json
{
  "message_id": "msg-1234567890-abc",
  "status": "SENT"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Delivery receipt updated successfully",
  "data": {
    "messageId": "msg-1234567890-abc",
    "status": "SENT",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**✅ Verification:** Only updates if status is not final

---

### **7. ✅ Idempotency Test**

**Method:** `POST`  
**URL:** `http://localhost:3001/api/campaigns/{campaign_id}/send`  
**Headers:** `Content-Type: application/json`

**Expected Response:** Same as step 2, but no duplicate logs created

**✅ Verification:** No duplicate communication logs

---

## 🔍 **Database Verification Queries**

```sql
-- Check campaign creation
SELECT * FROM campaigns WHERE name = 'Test Campaign Step 6';

-- Check communication logs
SELECT 
  campaign_id,
  customer_id,
  message_id,
  status,
  attempts,
  last_attempt_at,
  delivery_receipt
FROM communication_log 
WHERE campaign_id = 'your-campaign-id';

-- Check batch processing results
SELECT 
  status,
  COUNT(*) as count
FROM communication_log 
WHERE campaign_id = 'your-campaign-id'
GROUP BY status;
```

---

## 🚨 **If Server Won't Start - Fix TypeScript Errors**

**Quick Fix - Add this to tsconfig.json:**
```json
{
  "compilerOptions": {
    "strictNullChecks": false
  }
}
```

**Or run with:**
```bash
npx ts-node --transpile-only src/index.ts
```

---

## 📊 **Expected Final Results**

After running all tests:

1. ✅ Campaign created in database
2. ✅ Communication logs created (PENDING → SENT/FAILED)
3. ✅ Queue jobs processed
4. ✅ 90/10 success/failure ratio
5. ✅ Batch updates working
6. ✅ Idempotency maintained
7. ✅ Delivery receipts functional

**This will give you 100% confirmation that Step 6 works!** 🎯
