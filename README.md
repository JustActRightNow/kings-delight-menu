# King's Delight Menu

A static web menu for King's Delight Eatery, Ibadan. Customers browse items and send orders via WhatsApp.

## Setup — Supabase (Admin Panel)

To enable the admin panel and live menu management:

Run `node extract-logo.js` once to generate logo.png after cloning.

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in your Supabase dashboard and run the full contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy your **Project URL** and **anon / public key**
4. In **both** `index.html` and `admin.html`, replace the placeholder values near the top of the `<script>` block:
   ```js
   const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON = 'YOUR_ANON_KEY';
   ```
5. Create an admin user: go to **Authentication → Users → Invite user** (or **Add user**) and set an email + password. This is the login for `admin.html`.

## Admin Panel

Visit `/admin.html` on your deployed site. Sign in with the email/password you created in Supabase.

**Features:**
- Toggle items as available / out of stock (customers see a greyed "Out of Stock" badge)
- Edit prices with one click
- Add seasonal promo items (King's Meal combos etc.) with an optional expiry date — they auto-hide when expired
- Delete promo items

## Fallback

If Supabase is not yet configured, `index.html` renders using the built-in static menu data so the site always works.
