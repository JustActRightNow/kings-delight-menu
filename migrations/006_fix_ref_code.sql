-- ============================================================
-- Migration 006: Fix ref_code column on orders table
-- ============================================================
-- Run this after 005_add_order_type_and_storage.sql
--
-- WHY: The original ref_code column was defined as
--   GENERATED ALWAYS AS (upper(substr(id::text, 1, 6))) STORED
-- PostgREST (used by Supabase) includes generated columns in its
-- internal INSERT column list, causing PostgreSQL to reject the
-- insert with "column ref_code can only be updated to DEFAULT".
-- This migration replaces the generated column with a regular
-- column populated by a BEFORE INSERT trigger — identical value,
-- no PostgREST compatibility issues.
-- ============================================================

-- Step 1: Drop the generated column
ALTER TABLE orders DROP COLUMN IF EXISTS ref_code;

-- Step 2: Add it back as a plain TEXT column
ALTER TABLE orders ADD COLUMN ref_code TEXT;

-- Step 3: Back-fill any existing rows
UPDATE orders SET ref_code = upper(substr(id::text, 1, 6)) WHERE ref_code IS NULL;

-- Step 4: Create a trigger function that sets ref_code on every new INSERT
CREATE OR REPLACE FUNCTION set_order_ref_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.ref_code := upper(substr(NEW.id::text, 1, 6));
  RETURN NEW;
END;
$$;

-- Step 5: Attach the trigger to the orders table
DROP TRIGGER IF EXISTS orders_set_ref_code ON orders;
CREATE TRIGGER orders_set_ref_code
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_ref_code();
