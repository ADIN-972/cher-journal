-- Remove the stray 'colonne' column if it exists in the users table
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "colonne" CASCADE;
