DROP TABLE IF EXISTS "challenge_progress" CASCADE;
DROP TABLE IF EXISTS "challenge_options" CASCADE;
DROP TABLE IF EXISTS "challenges" CASCADE;
DROP TABLE IF EXISTS "lessons" CASCADE;
DROP TABLE IF EXISTS "units" CASCADE;
DROP TABLE IF EXISTS "user_progress" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;

CREATE TYPE "challenges_type" AS ENUM ('SELECT', 'ASSIST');

CREATE TABLE "courses" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "image_src" TEXT NOT NULL
);

CREATE TABLE "units" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "course_id" INTEGER NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL
);

CREATE TABLE "lessons" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "unit_id" INTEGER NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL
);

CREATE TABLE "challenges" (
  "id" SERIAL PRIMARY KEY,
  "lesson_id" INTEGER NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "type" "challenges_type" NOT NULL,
  "question" TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE "challenge_options" (
  "id" SERIAL PRIMARY KEY,
  "challenge_id" INTEGER NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "text" TEXT NOT NULL,
  "correct" BOOLEAN NOT NULL,
  "image_src" TEXT,
  "audio_src" TEXT
);

CREATE TABLE "challenge_progress" (
  "id" SERIAL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "challenge_id" INTEGER NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "completed" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "user_progress" (
  "user_id" TEXT PRIMARY KEY,
  "user_name" TEXT NOT NULL DEFAULT 'User',
  "user_image_src" TEXT NOT NULL DEFAULT '/mascot.svg',
  "active_course_id" INTEGER REFERENCES "courses"("id") ON DELETE CASCADE,
  "hearts" INTEGER NOT NULL DEFAULT 5,
  "points" INTEGER NOT NULL DEFAULT 0
);
