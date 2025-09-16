-- Make userId optional in segments table
ALTER TABLE "segments" ALTER COLUMN "userId" DROP NOT NULL;

-- Make userId optional in campaigns table  
ALTER TABLE "campaigns" ALTER COLUMN "userId" DROP NOT NULL;
