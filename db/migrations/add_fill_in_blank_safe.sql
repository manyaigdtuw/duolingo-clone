-- SAFE Migration to add FILL_IN_BLANK support
-- This migration preserves existing data

-- Step 1: Create a temporary column to store the current type values
ALTER TABLE "challenges" 
ADD COLUMN IF NOT EXISTS "type_temp" TEXT;

-- Step 2: Copy existing type values to temporary column (if type column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'challenges' AND column_name = 'type'
  ) THEN
    EXECUTE 'UPDATE challenges SET type_temp = type::text';
  END IF;
END $$;

-- Step 3: Drop the old type column and enum (if they exist)
ALTER TABLE "challenges" DROP COLUMN IF EXISTS "type";
DROP TYPE IF EXISTS "challenges_type";

-- Step 4: Create the new enum type with FILL_IN_BLANK
CREATE TYPE "challenges_type" AS ENUM ('SELECT', 'ASSIST', 'FILL_IN_BLANK');

-- Step 5: Add the type column back with the new enum type
ALTER TABLE "challenges" 
ADD COLUMN "type" "challenges_type";

-- Step 6: Restore the values from temporary column, defaulting to 'SELECT' for NULL values
UPDATE "challenges" 
SET "type" = COALESCE(type_temp, 'SELECT')::"challenges_type";

-- Step 7: Make type column NOT NULL
ALTER TABLE "challenges" ALTER COLUMN "type" SET NOT NULL;

-- Step 8: Drop the temporary column
ALTER TABLE "challenges" DROP COLUMN IF EXISTS "type_temp";

-- Step 9: Add correct_answer column (optional, for single answer storage)
ALTER TABLE "challenges" 
ADD COLUMN IF NOT EXISTS "correct_answer" TEXT;

-- Step 10: Create table for multiple correct answers
CREATE TABLE IF NOT EXISTS "challenge_correct_answers" (
  "id" SERIAL PRIMARY KEY,
  "challenge_id" INTEGER NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "answer" TEXT NOT NULL,
  "is_case_sensitive" BOOLEAN DEFAULT false
);

-- Step 11: Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_challenge_correct_answers_challenge_id" 
ON "challenge_correct_answers"("challenge_id");

-- Verify the migration
DO $$
DECLARE
  enum_count INTEGER;
  table_exists BOOLEAN;
BEGIN
  -- Check enum values
  SELECT COUNT(*) INTO enum_count
  FROM pg_enum e
  JOIN pg_type t ON e.enumtypid = t.oid
  WHERE t.typname = 'challenges_type';
  
  -- Check table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'challenge_correct_answers'
  ) INTO table_exists;
  
  RAISE NOTICE '✅ Migration complete!';
  RAISE NOTICE '   - Enum has % values (should be 3)', enum_count;
  RAISE NOTICE '   - challenge_correct_answers table exists: %', table_exists;
END $$;
