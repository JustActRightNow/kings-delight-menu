-- ============================================================
-- King's Delight Menu — Supabase Database Schema
-- ============================================================
-- 1. Open your Supabase project → SQL Editor
-- 2. Paste this entire file and click Run
-- 3. Copy your Project URL and anon key from Settings → API
-- 4. Replace the placeholder values in index.html and admin.html
-- ============================================================

-- Table
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
