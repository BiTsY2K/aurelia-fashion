# Aurelia — Couture & Bespoke Designer Wear

A luxury storefront and admin back office for a custom-tailoring boutique: women's sarees, lehengas, gowns and Indo-Western wear, plus girls' ethnic, frocks and party wear. Built on **Next.js 15 + Tailwind + Framer Motion + Firebase**, so it runs at **₹0 / $0** on the Vercel Hobby and Firebase Spark free tiers.

> Without any keys it runs entirely on a built-in demo catalog, so you can preview it straight away.

```bash
npm install
cp .env.example .env.local   # fill in as you go — all optional for a first preview
npm run dev                  # http://localhost:3000
```

---

## What's inside

**Storefront**
- Category tree is data, not code: Women (Sarees, Lehengas, Gowns, Indo-Western) and Kids (Girls' Ethnic, Frocks, Party Wear) drive the mega-menu, footer, homepage tiles, filters and the admin product editor. **Men** is already defined but hidden; switch it on in *Admin → Categories*.
- `/collections/[slug]` catalog pages with sub-category chips and filters for occasion, size (per department scale), colour, price and availability.
- Product pages with a hi-res carousel (hover zoom, swipe, full-screen lightbox), SKU, design story, fabric and craft, a size guide modal, and **custom measurement inputs** (women / kids field sets).
- **Enquire on WhatsApp** opens a pre-filled message with product, SKU, colour, size or measurements, and the page URL.
- **Order via WhatsApp** collects name, phone, city and event date (pre-filled from the account and remembered on the device), then opens a pre-filled order chat.
- Every WhatsApp click and every form submission is logged to the admin inquiry tracker.
- `/bespoke` (design request with garment, budget and measurements), `/contact`, `/size-guide`.
- Also included: cart, Razorpay checkout, accounts, wishlist, style quiz and the Studio (layering canvas).

**Admin (`/admin`)**
- **Overview:** page views, WhatsApp clicks, inquiries, most-viewed and most-enquired products, plus online-order revenue.
- **Inquiries:** filter by type and status, one-tap WhatsApp reply, move each lead new → contacted → converted / closed.
- **Products:** create, edit, archive/restore, delete. Includes SKU (auto-generated if blank), department and sub-category, draft/active/archived status, custom-fit and made-to-order flags, lead time, design story, multi-photo upload per colour, and a stock matrix that follows the department's size scale. One-click demo import.
- **Categories:** add, rename, reorder, hide or delete departments and sub-categories, with cover images and a size chart per department.
- **Orders** and **Reviews** moderation.

**AI readiness (Phase 2)**
- `/style-assistant` has a working outfit matcher (occasion, colour, weather, women/kids) and a virtual try-on placeholder. Photos stay on the device.
- Concierge chat (floating button) runs through `src/lib/ai/provider.ts`, a vendor-neutral adapter. Set `OPENAI_API_KEY` (or any OpenAI-compatible base URL) or `HF_TOKEN` and the chat goes live, grounded in your real catalog. Without a key it says "coming soon" and hands off to WhatsApp.

---

## Database schema (Firestore)

| Collection | Key fields | Access |
|---|---|---|
| `categories/{slug}` | name, slug, parentId (null = department), sizeSet, order, active, image, description | public read · admin write |
| `products/{id}` | sku, name, slug, price, compareAtPrice, category (dept slug), subcategory, collection, status, tags, occasions, designStory, fabric, fabricCare, variants[{name,hex,images}], sizesStock{colour→size→qty}, customizable, madeToOrder, leadTimeDays, featured | public read · admin write |
| `inquiries/{id}` | type (enquiry/order/bespoke/contact), channel (whatsapp/form), status, product ref + sku, size, measurements, name, phone, email, city, occasionDate, message, pageUrl, createdAt | server only |
| `analytics_daily/{YYYY-MM-DD}` | pageViews, productViews, inquiries, whatsappClicks | server only |
| `product_stats/{productId}` | views, inquiries, whatsappClicks | server only |
| `users/{uid}` | email, displayName, **role** (`customer`/`admin`), wishlist, styleProfile | owner/admin; customers can't change `role` |
| `orders`, `reviews`, `carts`, `mail` | commerce and operations | see `firestore.rules` |

Types live in `src/types/index.ts`; size scales, measurement fields and size charts in `src/lib/catalog.ts`.

---

## Deploy for $0 (Vercel + Firebase)

**1. Firebase (Spark plan, free)**
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → enable Email/Password and Google.
3. **Firestore Database** → create (production mode, region near your customers, e.g. `asia-south1`).
4. **Storage** → enable it. Note: new projects may need the pay-as-you-go Blaze plan for Storage. Blaze still has a free allowance, so set a budget alert of ₹100 and you'll stay at ₹0 for a small boutique.
5. *Project settings → Your apps → Web app* → copy the config into the `NEXT_PUBLIC_FIREBASE_*` variables.
6. *Project settings → Service accounts → Generate new private key* → paste the JSON **on one line** into `FIREBASE_SERVICE_ACCOUNT`. This powers the admin dashboard, inquiry logging and analytics.
7. Deploy the security rules:
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use --add            # pick your project
   firebase deploy --only firestore:rules,storage
   ```

**2. Make yourself admin**
Sign up on your site, then in Firestore open `users/{your-uid}` and set `role` to `admin`. Sign out and back in, then open `/admin`:
- *Categories* → **Save default categories**
- *Products* → **Import the demo catalog**, then replace the photos and details with your own.

**3. Vercel (Hobby, free)**
1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new). Next.js is detected automatically.
2. Add every variable from `.env.local` under *Settings → Environment Variables*. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL and `NEXT_PUBLIC_WHATSAPP_NUMBER` to your business number (digits only, e.g. `919876543210`).
3. Deploy. In Firebase *Authentication → Settings → Authorized domains*, add your Vercel domain.
4. Optional: a custom domain in Vercel (the domain is the only real cost).

**Optional add-ons:** Razorpay keys for online payments (WhatsApp ordering works without them), an AI key for the concierge, and `CRON_SECRET` plus the WhatsApp Cloud API for abandoned-cart nudges (`vercel.json` schedules the jobs).

### Free-tier headroom
Firestore Spark gives 50k reads and 20k writes per day. Each page view costs 1–2 writes and the dashboard about 40 reads, which comfortably covers thousands of visitors a day. Vercel Hobby covers 100 GB bandwidth a month.

---

## Before launch
- Replace the Unsplash placeholder photos and the sample testimonials (`src/components/home/Sections.tsx`) with your own.
- Set your real business details on `/contact`, plus social links in `src/app/layout.tsx` and the footer.

## Project structure
```
src/
  app/                pages, admin, API routes (inquiries, track, ai/chat, razorpay, admin/*)
  components/         layout (Header, Concierge…), product, home, forms, ai, ui
  lib/                catalog (categories/sizes), products, enquiry (WhatsApp), pricing-server,
                      analytics-server, ai/provider, firebase(-admin)
  types/              Firestore data model
firestore.rules  storage.rules  firebase.json  vercel.json
```
