-- Make name field required in users table
-- First, update any existing NULL values to have a default name
UPDATE "users" SET "name" = 'User' WHERE "name" IS NULL;

-- Now make the column NOT NULL
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
