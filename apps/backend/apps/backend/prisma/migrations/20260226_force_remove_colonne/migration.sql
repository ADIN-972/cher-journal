-- Force remove 'colonne' column - it's causing Prisma errors
-- First, remove any constraints or indexes that depend on this column
DO $$ DECLARE
  r RECORD;
BEGIN
  -- Drop any indexes on the column
  FOR r IN (
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'users' AND indexdef LIKE '%colonne%'
  ) LOOP
    EXECUTE 'DROP INDEX IF EXISTS ' || r.indexname;
  END LOOP;

  -- Drop any constraints on the column
  FOR r IN (
    SELECT constraint_name FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE 'ALTER TABLE "users" DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
  END LOOP;
END $$;

-- Now drop the column if it exists
ALTER TABLE "public"."users" DROP COLUMN IF EXISTS "colonne" CASCADE;

-- Verify the column is gone
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'colonne'
  ) THEN
    RAISE EXCEPTION 'Failed to remove colonne column!';
  END IF;
END $$;
