-- Migration to add FILL_IN_BLANK support
-- Run this script on your database

-- Update the enum type to include FILL_IN_BLANK
DROP TYPE IF EXISTS "challenges_type" CASCADE;
CREATE TYPE "challenges_type" AS ENUM ('SELECT', 'ASSIST', 'FILL_IN_BLANK');

-- Add correct_answer column to challenges table (optional, for single answer storage)
ALTER TABLE "challenges" 
ADD COLUMN IF NOT EXISTS "correct_answer" TEXT;

-- Create table for multiple correct answers (synonyms)
CREATE TABLE IF NOT EXISTS "challenge_correct_answers" (
  "id" SERIAL PRIMARY KEY,
  "challenge_id" INTEGER NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "answer" TEXT NOT NULL,
  "is_case_sensitive" BOOLEAN DEFAULT false
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "idx_challenge_correct_answers_challenge_id" 
ON "challenge_correct_answers"("challenge_id");

-- Example: Insert a sample fill-in-blank question (optional)
-- Uncomment the following lines to add a test question

-- First, find a lesson ID to attach the challenge to
-- SELECT id FROM lessons LIMIT 1;

-- Then insert a challenge (replace <lesson_id> with actual lesson ID)
-- INSERT INTO challenges (lesson_id, type, question, "order")
-- VALUES (<lesson_id>, 'FILL_IN_BLANK', 'The capital of France is ____.', 1)
-- RETURNING id;

-- Finally, add correct answers (replace <challenge_id> with the returned ID)
-- INSERT INTO challenge_correct_answers (challenge_id, answer, is_case_sensitive)
-- VALUES 
--   (<challenge_id>, 'Paris', false),
--   (<challenge_id>, 'paris', false);
