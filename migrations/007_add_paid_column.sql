-- Migration 007: add paid column to orders and grant UPDATE to authenticated
-- Run this in the Supabase SQL Editor if you already have the orders table.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT false;

-- Allow authenticated admin to update orders (e.g. mark as paid)
DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

GRANT UPDATE ON TABLE orders TO authenticated;
