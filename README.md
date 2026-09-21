# SlideWrld

A Next.js storefront and admin panel for a slides/footwear brand, styled after the
clean, monochrome look of prdnc.shop. No Supabase, no paid services required to run
it locally or on your own server.

## Stack

- Next.js 14 (App Router) + Tailwind CSS
- lowdb (a local JSON file, `data/db.json`) instead of a hosted database
- Resend for transactional email (order confirmations, admin alerts, status updates,
  newsletter welcome email) - free tier covers small stores
- Plain cookie-based admin sessions signed with Web Crypto (no third-party auth
  service)

## Important: read this before you deploy

This project stores products, orders, and subscribers in a single JSON file on disk
(`data/db.json`), edited directly by the Node process. That is simple and free, but
it only works reliably when the server has a **persistent, writable filesystem** -
for example:

- Your own VPS (a small droplet, Lightsail instance, etc.)
- Render, Railway, or Fly.io on a plan with a persistent disk/volume attached
- Running it on a machine you control with `npm start`

**It will not reliably keep data on Vercel, Netlify, or other serverless
platforms.** Those platforms run your app on ephemeral instances with a read-only
filesystem (aside from a temporary `/tmp` that is wiped between invocations and not
shared across them), so orders and products you save can disappear or fail to save
at all.

If you want to deploy on Vercel specifically, swap `lib/db.js` for a small free
hosted database instead of the JSON file - Turso (SQLite-compatible), Neon
(Postgres), or MongoDB Atlas's free tier all work well with serverless hosting and
have generous free plans. The rest of the app (API routes, admin panel, emails)
would not need to change, only the handful of functions in `lib/db.js`.

## Getting started

1. Install dependencies:

   ```
   npm install
   ```

2. Copy the environment file and fill in your own values:

   ```
   cp .env.example .env.local
   ```

   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: the login for `/admin`. Pick a real password,
     not the placeholder.
   - `JWT_SECRET`: any long random string. Used to sign the admin session cookie.
   - `RESEND_API_KEY`: sign up free at https://resend.com, verify a sending domain
     (or use their `onboarding@resend.dev` test address while you set things up),
     and create an API key.
   - `MAIL_FROM`: the address emails are sent from, must be on a domain you verified
     in Resend (or `onboarding@resend.dev` for testing).
   - `ADMIN_NOTIFICATION_EMAIL`: where new-order alerts go.
   - `NEXT_PUBLIC_SITE_URL`: your real domain once you have one, used in SEO tags
     and the sitemap.

   Bank transfer details (bank name, account name, account number) are **not** in
   the env file - they live in Settings inside the admin panel so you can update
   them without redeploying.

3. Run it locally:

   ```
   npm run dev
   ```

   Visit http://localhost:3000 for the storefront and
   http://localhost:3000/admin for the admin panel.

4. Build for production:

   ```
   npm run build
   npm start
   ```

## What is already set up

- Storefront: homepage (hero, new arrivals, best sellers, editorial strip), shop-all
  page with category filters, collection pages, product detail pages, cart, and a
  bank-transfer checkout flow.
- Mobile hamburger menu on both the storefront header and the admin header.
- Admin panel at `/admin` (protected by login): dashboard with basic stats,
  products (create, edit, delete, image upload), orders (view, update status),
  and a settings page covering store copy, socials, and bank details.
- Email notifications: customer gets an order confirmation and status update
  emails; admin gets a new-order alert; newsletter subscribers get a welcome email.
- SEO: per-page metadata, Open Graph tags, JSON-LD product data, a dynamic
  `sitemap.xml`, and `robots.txt`.
- Six sample products and placeholder SVG images are pre-loaded in `data/db.json`
  so the site is fully browsable out of the box. Replace them from the admin panel
  once you have real product photos.

## Replacing the placeholder images

The sample product and hero images are plain SVG placeholders in `public/uploads/`.
Delete the sample products from the admin panel and add your own with real photos
(the upload field in the product form saves files into `public/uploads/`
automatically), or edit `data/db.json` directly before your first deploy.

## Suggested next steps

- Point `NEXT_PUBLIC_SITE_URL` at your real domain and resubmit the sitemap to
  Google Search Console once you are live.
- Decide on hosting per the note above, and adjust `lib/db.js` if you choose a
  serverless platform.
- Consider adding a real payment gateway (Paystack and Flutterwave both have
  Nigeria-friendly free-to-integrate options) if you want automatic payment
  confirmation instead of manual bank transfer review.
- Set a strong, unique `ADMIN_PASSWORD` and `JWT_SECRET` before you go live - the
  placeholder values in `.env.example` are not safe to use as-is.
