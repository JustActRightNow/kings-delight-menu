-- ============================================================
-- Migration 002: Add RLS policies
-- ============================================================
-- Run this after 001_initial_schema.sql

ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_menu"  ON menu_items  FOR SELECT TO anon  USING (true);
CREATE POLICY "auth_write_menu" ON menu_items  FOR ALL   TO authenticated USING (true);

CREATE POLICY "anon_read_promo"  ON promo_items FOR SELECT TO anon  USING (true);
CREATE POLICY "auth_write_promo" ON promo_items FOR ALL   TO authenticated USING (true);
