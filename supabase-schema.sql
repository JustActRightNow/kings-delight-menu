-- ============================================================
-- King's Delight — COMPLETE Supabase Schema (all-in-one)
-- ============================================================
-- Run this entire file in the Supabase SQL Editor to set up
-- (or reset) the full database from scratch.
-- Migrations in /migrations/ apply the same changes incrementally.
-- 001 = initial schema + seed data
-- 002 = RLS policies
-- 003 = orders table (with order_type)
-- 004 = image_url column
-- 005 = order_type column + storage bucket for menu images
-- 006 = fix ref_code (replace GENERATED ALWAYS AS with trigger)
-- ============================================================

-- IMPORTANT: This schema uses Row Level Security.
-- Anon key (used in index.html) can only SELECT menu items and INSERT orders.
-- Authenticated users (admin.html login) can INSERT, UPDATE, DELETE.

-- ============================================================
-- menu_items table
-- ============================================================

create table if not exists menu_items (
  id               uuid    default gen_random_uuid() primary key,
  name             text    not null,
  price            integer not null default 0,
  section          text    not null,      -- specials | mains | proteins | grill | swallow | soups | sides | drinks | pastries
  tab              text    not null default 'food',  -- food | drinks | pastries
  available        boolean not null default true,
  category_type    text    not null default 'regular', -- regular | promo
  promo_expires_at date,                 -- null = no expiry; past date = hidden
  combo            boolean not null default false,
  image_url        text,
  sub_label        text,                 -- e.g. 'House favourite'
  is_free          boolean not null default false,
  sort_order       integer not null default 0,
  has_variants     boolean not null default false,
  variants         jsonb,                -- [{name, price}]
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-update updated_at on every change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_updated_at on menu_items;
create trigger menu_items_updated_at
  before update on menu_items
  for each row execute function update_updated_at();

-- Row Level Security
alter table menu_items enable row level security;

-- Anyone (customers) can read all items
drop policy if exists "Public read access" on menu_items;
create policy "Public read access" on menu_items
  for select to anon using (true);

-- Signed-in admin can do everything
drop policy if exists "Authenticated full access" on menu_items;
create policy "Authenticated full access" on menu_items
  for all to authenticated using (true) with check (true);

-- ============================================================
-- orders table
-- ============================================================

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

-- Only admin (authenticated) can view orders
DROP POLICY IF EXISTS "auth_read_orders" ON orders;
CREATE POLICY "auth_read_orders"  ON orders FOR SELECT TO authenticated USING (true);

-- Customers (anon) can place orders
DROP POLICY IF EXISTS "anon_insert_order" ON orders;
CREATE POLICY "anon_insert_order" ON orders FOR INSERT TO anon WITH CHECK (true);

-- Grant the underlying PostgreSQL privileges that RLS policies layer on top of.
-- Tables created via the SQL Editor do not receive Supabase's automatic grants,
-- so these must be stated explicitly or anon inserts and authenticated reads will
-- fail with "permission denied" even though the RLS policies allow them.
GRANT INSERT ON TABLE orders TO anon;
GRANT SELECT ON TABLE orders TO authenticated;

-- ============================================================
-- Supabase Storage bucket: menu-images
-- ============================================================
-- Public bucket for menu item photos uploaded from the admin panel.
-- Customers can view images without authentication.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "auth_manage_images" ON storage.objects;
CREATE POLICY "auth_manage_images"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'menu-images')
  WITH CHECK (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "public_read_images" ON storage.objects;
CREATE POLICY "public_read_images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'menu-images');

-- ============================================================
-- SEED DATA — all current menu items
-- ============================================================

-- Clear existing data (idempotent re-run)
truncate table menu_items;

insert into menu_items (name, price, section, tab, sub_label, is_free, has_variants, variants, sort_order) values

  -- ── Chef's Specials ──────────────────────────────────────
  ('Ofada × Ayamase & Egg',                    3500, 'specials', 'food', null,             false, false, null, 1),
  ('Continental Rice × Shredded Chicken',       4000, 'specials', 'food', null,             false, false, null, 2),
  ('Stir-Fried Basmati × Shredded Chicken',     4000, 'specials', 'food', null,             false, false, null, 3),
  ('Singapore Noodles × Shredded Chicken',       4000, 'specials', 'food', null,             false, false, null, 4),
  ('Spaghetti Jollof × Shredded Chicken',        3500, 'specials', 'food', null,             false, false, null, 5),

  -- ── Mains ────────────────────────────────────────────────
  ('Asun Rice',                                  3500, 'mains',    'food', null,             false, false, null, 1),
  ('Smoky Jollof Rice',                           500, 'mains',    'food', null,             false, false, null, 2),
  ('Fried Rice',                                  500, 'mains',    'food', null,             false, false, null, 3),
  ('Steamed White Rice',                          500, 'mains',    'food', null,             false, false, null, 4),
  ('Porridge',                                   2000, 'mains',    'food', 'House favourite', false, false, null, 5),
  ('Village Rice',                               2500, 'mains',    'food', null,             false, false, null, 6),

  -- ── Proteins ─────────────────────────────────────────────
  ('Assorted',                                   1200, 'proteins', 'food', null,             false, false, null,  1),
  ('Beef',                                       1200, 'proteins', 'food', null,             false, false, null,  2),
  ('Chicken',                                    2000, 'proteins', 'food', null,             false, false, null,  3),
  ('Big Chicken',                                3000, 'proteins', 'food', null,             false, false, null,  4),
  ('BBQ Chicken',                                3500, 'proteins', 'food', null,             false, false, null,  5),
  ('Fish — Titus',                               2000, 'proteins', 'food', null,             false, false, null,  6),
  ('Panla',                                      1500, 'proteins', 'food', null,             false, false, null,  7),
  ('Goat Meat',                                  2500, 'proteins', 'food', 'House favourite', false, false, null,  8),
  ('Ponmo',                                      1000, 'proteins', 'food', null,             false, false, null,  9),
  ('Turkey',                                     4000, 'proteins', 'food', null,             false, false, null, 10),

  -- ── Grill Zone ───────────────────────────────────────────
  ('Asun',                                       3000, 'grill',    'food', null,             false, false, null,  1),
  ('BBQ Catfish × Fries',                        8000, 'grill',    'food', null,             false, false, null,  2),
  ('BBQ Chicken × Chips',                        8000, 'grill',    'food', null,             false, false, null,  3),
  ('Chicken Burger',                             3500, 'grill',    'food', null,             false, false, null,  4),
  ('Chicken Wings',                              2000, 'grill',    'food', null,             false, false, null,  5),
  ('Sharwarma',                                  3000, 'grill',    'food', 'House favourite', false, false, null,  6),
  ('Sharwarma × Combo',                          3500, 'grill',    'food', null,             false, false, null,  7),
  ('GizDodo',                                    3000, 'grill',    'food', null,             false, false, null,  8),
  ('WngsDodo',                                   3000, 'grill',    'food', null,             false, false, null,  9),
  ('Isi Ewu',                                    6000, 'grill',    'food', null,             false, false, null, 10),

  -- ── Swallow ──────────────────────────────────────────────
  ('Amala',                                      1000, 'swallow',  'food', null,             false, false, null, 1),
  ('Poundo',                                     1000, 'swallow',  'food', 'House favourite', false, false, null, 2),
  ('Semo',                                       1000, 'swallow',  'food', null,             false, false, null, 3),
  ('Fufu',                                        700, 'swallow',  'food', null,             false, false, null, 4),
  ('Eba',                                           0, 'swallow',  'food', null,             false, true,
    '[{"name":"Eba (Small)","price":500},{"name":"Eba (Big)","price":700}]'::jsonb, 5),

  -- ── Soups ────────────────────────────────────────────────
  ('Efo Riro',                                   1000, 'soups',    'food', null,             false, false, null, 1),
  ('Egusi',                                      1000, 'soups',    'food', null,             false, false, null, 2),
  ('Okra',                                       1000, 'soups',    'food', null,             false, false, null, 3),
  ('Edikang Ikong',                              1500, 'soups',    'food', 'House favourite', false, false, null, 4),
  ('Gbegiri',                                       0, 'soups',    'food', null,             true,  false, null, 5),
  ('Ewedu',                                         0, 'soups',    'food', null,             true,  false, null, 6),

  -- ── Sides ────────────────────────────────────────────────
  ('Salad',                                      1000, 'sides',    'food', 'House favourite', false, false, null, 1),
  ('Plantain',                                   1000, 'sides',    'food', null,             false, false, null, 2),
  ('Beans',                                       500, 'sides',    'food', null,             false, false, null, 3),

  -- ── Drinks ───────────────────────────────────────────────
  ('Water',                                       400, 'drinks',   'drinks', null,           false, false, null,  1),
  ('Coke',                                        700, 'drinks',   'drinks', null,           false, false, null,  2),
  ('Fanta',                                       700, 'drinks',   'drinks', null,           false, false, null,  3),
  ('Sprite',                                      700, 'drinks',   'drinks', null,           false, false, null,  4),
  ('Pepsi',                                       700, 'drinks',   'drinks', null,           false, false, null,  5),
  ('Fearless',                                    700, 'drinks',   'drinks', null,           false, false, null,  6),
  ('Predator',                                    700, 'drinks',   'drinks', null,           false, false, null,  7),
  ('Zobo',                                        700, 'drinks',   'drinks', null,           false, false, null,  8),
  ('Malt',                                        800, 'drinks',   'drinks', null,           false, false, null,  9),
  ('Fayrouz',                                    1000, 'drinks',   'drinks', null,           false, false, null, 10),
  ('5Alive Pulpy',                               2000, 'drinks',   'drinks', null,           false, false, null, 11),
  ('Schweppes',                                  1000, 'drinks',   'drinks', null,           false, false, null, 12),
  ('Tiger Drink',                                1200, 'drinks',   'drinks', null,           false, false, null, 13),
  ('SmirnOff Ice',                               1200, 'drinks',   'drinks', null,           false, false, null, 14),
  ('Hollandia Yoghurt (Big)',                     3000, 'drinks',   'drinks', null,           false, false, null, 15),
  ('Hollandia Yoghurt (Med.)',                    1500, 'drinks',   'drinks', null,           false, false, null, 16),
  ('Monster Energy',                             1500, 'drinks',   'drinks', null,           false, false, null, 17),
  ('Chivita Active',                             2500, 'drinks',   'drinks', null,           false, false, null, 18),
  ('Chivita Exotic',                             2500, 'drinks',   'drinks', null,           false, false, null, 19),
  ('Chivita Red Grape',                          2800, 'drinks',   'drinks', null,           false, false, null, 20),

  -- ── Pastries ─────────────────────────────────────────────
  ('King''s Roll',                               1000, 'pastries', 'pastries', null,         false, false, null, 1),
  ('Doughnut',                                    400, 'pastries', 'pastries', null,         false, false, null, 2),
  ('Chicken Pie',                                1200, 'pastries', 'pastries', 'House favourite', false, false, null, 3),
  ('Meat Pie',                                   1000, 'pastries', 'pastries', null,         false, false, null, 4),
  ('Meat Pie — Small',                            400, 'pastries', 'pastries', null,         false, false, null, 5),
  ('Beef Roll',                                   400, 'pastries', 'pastries', null,         false, false, null, 6);
