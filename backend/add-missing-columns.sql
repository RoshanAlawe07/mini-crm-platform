-- Add missing columns to existing tables
-- This script adds the missing columns that are causing P2022 errors

-- Add missing columns to campaigns table
ALTER TABLE "campaigns" 
ADD COLUMN IF NOT EXISTS "rulesJson" TEXT;

-- Add missing columns to orders table  
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "orderId" TEXT;

-- Create unique index for orderId if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderId_key" ON "orders"("orderId");

-- Add any other missing columns that might be needed
-- Check if other columns are missing and add them as needed

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('campaigns', 'orders') 
  AND column_name IN ('rulesJson', 'orderId')
ORDER BY table_name, column_name;
