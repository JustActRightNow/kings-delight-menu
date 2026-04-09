-- ============================================================
-- Migration 003: Add orders table
-- ============================================================
-- Run this after 002_add_rls_policies.sql

CREATE TABLE IF NOT EXISTS orders (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  customer   TEXT,
  order_type TEXT        NOT NULL DEFAULT 'eat-in',
  items      JSONB       NOT NULL,
  total      INTEGER     NOT NULL,
  note       TEXT,
  ref_code   TEXT
);

-- Trigger function: derive ref_code from the first 6 chars of the UUID.
-- Using a trigger instead of GENERATED ALWAYS AS avoids a PostgREST
-- compatibility bug that causes INSERT operations to be rejected.
CREATE OR REPLACE FUNCTION set_order_ref_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.ref_code := upper(substr(NEW.id::text, 1, 6));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_ref_code ON orders;
CREATE TRIGGER orders_set_ref_code
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_ref_code();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_orders"  ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_insert_order" ON orders FOR INSERT TO anon        WITH CHECK (true);
