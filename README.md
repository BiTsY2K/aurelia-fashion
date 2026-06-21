# Aurelia — Fashion That Defines You

A modern, SEO-friendly boutique storefront built on **Next.js 15 (App Router) · React 19 · Tailwind CSS · Firebase**.  
Designed to start at **₹0 / $0** (Vercel Hobby + Firebase Spark free tiers) and scale without re-architecting.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS 3 |
| Language | TypeScript 5 |
| State | Zustand 5 (cart, persisted to `localStorage`) |
| Backend | Firebase 11 — Firestore, Auth, Storage |
| Hosting | Vercel (frontend) + Firebase (data) |

---

## Phase 1 — what's included

- **Design system** — 60-30-10 palette (Ivory `#FAF7F2` / Carbon `#1A1A1A` / Champagne `#C8A96A`) with Playfair Display + Inter, wired through Tailwind tokens.
- **Homepage** — Hero, "Best Collection" grid with filter tabs + sort, curated editorial sections, testimonials, "Own Your Style" CTA, and a newsletter footer.
- **Responsive header** — mobile flyout menu + live cart badge.
- **Slide-over cart drawer** — subtotal + free-shipping progress bar.
- **`<SmartImage>`** — AVIF/WebP, lazy loading, shimmer placeholder.
- **Firebase client** (`src/lib/firebase.ts`) — falls back to demo products when no keys are present, so you can preview immediately.
- **SEO** — `<Metadata>` + OpenGraph/Twitter tags, JSON-LD Organization schema, dynamic `sitemap.xml` and `robots.txt`.
- **Floating WhatsApp concierge** button (first WhatsApp hook).
- **Firestore + Storage security rules** — ready to deploy.

> Phase 1 renders fully without any Firebase keys using demo data.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in once you have a Firebase project (optional for first run)
npm run dev                  # http://localhost:3000
```

```bash
npm run build    # production build
npm start        # serve production build
npm run typecheck  # TypeScript validation
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `<project>.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (default `http://localhost:3000`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number with country code, e.g. `919999999999` |

---

## Free hosting (zero cost)

1. Push to GitHub.
2. Import the repo into **Vercel** (Hobby plan, free) — it auto-detects Next.js.
3. Add all `NEXT_PUBLIC_*` env vars in the Vercel dashboard.
4. Create a **Firebase** project (Spark/free): enable **Auth**, **Firestore**, and **Storage**, then paste the config values into your env vars.
5. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

---

## Project structure

```
src/
  app/
    layout.tsx          root layout — Header, Footer, CartDrawer, WhatsAppButton
    page.tsx            homepage
    not-found.tsx       404 page
    globals.css         base styles + Tailwind directives
    sitemap.ts          dynamic sitemap.xml
    robots.ts           robots.txt
  components/
    home/
      Hero.tsx
      CollectionGrid.tsx  filter tabs + sort
      Sections.tsx        editorial, testimonials, CTA
    layout/
      Header.tsx
      Footer.tsx
      CartDrawer.tsx
      WhatsAppButton.tsx
    product/
      ProductCard.tsx
    ui/
      SmartImage.tsx      AVIF/WebP + shimmer wrapper
  context/
    cart-store.ts         Zustand cart (localStorage-persisted)
  lib/
    firebase.ts           Firebase client + graceful fallback
    products.ts           data access layer
    utils.ts
  types/
    index.ts              Firestore data model (Product, Order, UserProfile, …)

firestore.rules           Firestore security rules
storage.rules             Firebase Storage security rules
```

---

## Firestore data model

| Collection | Access |
|---|---|
| `products` | World-readable · admin-writable |
| `users` | Owner read/write · admin full access |
| `orders` | Guest create · owner read · admin full access |
| `reviews` | World-readable · signed-in create · admin moderate |

---

## Phase roadmap

| Phase | Focus | Status |
|---|---|---|
| **1 — Foundation** | Design system, catalog UI, cart, SEO, WhatsApp button | ✅ done |
| **2 — Commerce core** | Auth (email / Google / Apple), Firestore product seed + admin CRUD, product detail pages, checkout + payment (Stripe / Razorpay), inventory deduction | next |
| **3 — Operations** | Admin dashboard, order tracker, transactional emails, review moderation, full responsive QA | |
| **4 — Personalization** | Fit & style quiz, Complete-the-Look, wishlist, PDP WhatsApp inquiry | |
| **5 — Signature studio** | Mix-and-match outfit sandbox, abandoned-cart WhatsApp automation, analytics dashboards | |

---

Swap the placeholder Unsplash images for your Firebase Storage URLs as you seed real products in Phase 2.
