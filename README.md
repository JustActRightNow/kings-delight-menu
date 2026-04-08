# King's Delight Menu

A static web menu for King's Delight Eatery, Ibadan. Customers browse items and send orders via WhatsApp.

## Setup — Supabase (Admin Panel)

To enable the admin panel and live menu management:

Run `node extract-logo.js` once to generate logo.png after cloning.

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in your Supabase dashboard and run the full contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy your **Project URL** and **anon / public key**
4. Open `js/config.js` and replace the placeholder values with your real Supabase credentials:
   ```js
   const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON = 'YOUR_ANON_KEY';
   ```
   This file is loaded by both `index.html` and `admin.html`, so one edit covers both.
5. Create an admin user: go to **Authentication → Users → Invite user** (or **Add user**) and set an email + password. This is the login for `admin.html`.

## Admin Panel

Visit `/admin.html` on your deployed site. Sign in with the email/password you created in Supabase.

**Features:**
- Toggle items as available / out of stock (customers see a greyed "Out of Stock" badge)
- Edit prices with one click
- Add seasonal promo items (King's Meal combos etc.) with an optional expiry date — they auto-hide when expired
- Delete promo items

## Database Migrations

The database schema is maintained as numbered migration files in the `migrations/` folder. Run each file **in order** in the Supabase SQL Editor when setting up a new project or applying updates to an existing one.

| File | Description |
|------|-------------|
| `migrations/001_initial_schema.sql` | Creates the `menu_items` table, trigger, RLS, and seeds all menu data |
| `migrations/002_add_rls_policies.sql` | Adds named RLS policies for `menu_items` and `promo_items` |
| `migrations/003_add_orders_table.sql` | Creates the `orders` table with RLS policies |
| `migrations/004_add_image_url.sql` | Adds the `image_url` column to `menu_items` |

`supabase-schema.sql` at the root is kept as a lightweight index file pointing to these migrations.

## Fallback

If Supabase is not yet configured, `index.html` renders using the built-in `STATIC_MENU` data so the site always works.
