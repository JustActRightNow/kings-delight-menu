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
  ref_code   TEXT        GENERATED ALWAYS AS (upper(substr(id::text, 1, 6))) STORED
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read_orders"  ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "anon_insert_order" ON orders FOR INSERT TO anon        WITH CHECK (true);
