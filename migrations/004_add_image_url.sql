-- ============================================================
-- Migration 004: Add image_url column to menu_items
-- ============================================================
-- Run this after 003_add_orders_table.sql

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;
