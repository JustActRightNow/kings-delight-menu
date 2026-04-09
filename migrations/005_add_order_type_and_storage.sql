-- ============================================================
-- Migration 005: Add order_type to existing orders table
--                + Create Supabase Storage bucket for images
-- ============================================================
-- Run this after 004_add_image_url.sql
-- (Only needed if you already ran migration 003 without order_type)

-- ── orders table: add order_type column if not already present ────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'eat-in';

-- ── Supabase Storage: create the menu-images bucket ──────────────────────
-- This bucket stores menu item images uploaded from the admin panel.
-- Set to public so the customer-facing menu can load images without auth.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,   -- 5 MB max per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins to upload, update, and delete images
DROP POLICY IF EXISTS "auth_manage_images" ON storage.objects;
CREATE POLICY "auth_manage_images"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'menu-images')
  WITH CHECK (bucket_id = 'menu-images');

-- Allow public (anon) to read/view images
DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
CREATE POLICY "public_read_images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'menu-images');
