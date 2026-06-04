# PreSnag — Project Summary

> **Order Ahead. Skip The Queue.**
> A cloud-based food ordering platform where customers order from local vendors (stalls, cafés, food courts) **without an app** — via the web or a QR code. Vendors and a platform admin manage everything from dashboards.

---

## 1. High-level Overview

PreSnag is a full-stack MVP with **one backend API** and **one frontend SPA**, all running locally, organized as a monorepo:

```
PreSnag/
├── backend/        Node + Express + TypeScript + MongoDB + Socket.IO   → http://localhost:5008
├── frontend/       React + Vite + TypeScript + Tailwind                → http://localhost:5173
├── plan.md         Original implementation plan
├── README.md       Run instructions + demo credentials
└── summary.md      (this file)
```

The frontend is a **single app** that serves three audiences via route prefixes (no subdomains, single domain `presnag.com`):

| Audience | Route prefix | Auth |
|----------|-------------|------|
| **Customer** | `/`, `/shops`, `/vendor/:slug`, `/checkout`, `/order/:n`, `/track/:n` | none |
| **Vendor**   | `/vendor/login`, `/vendor/dashboard` … | JWT (role `VENDOR`) |
| **Admin**    | `/admin/login`, `/admin/dashboard` … | JWT (role `ADMIN` / `SUPER_ADMIN`) |

---

## 2. Tech Stack (and what each is used for)

### Backend (`backend/`)
| Tech | Purpose |
|------|---------|
| **Node.js + Express** | HTTP REST API server |
| **TypeScript** | Type safety across the backend |
| **MongoDB + Mongoose** | Database + schemas/models (hosted on MongoDB Atlas) |
| **Socket.IO** | Realtime order events (new order → vendor; status → customer) |
| **JWT (`jsonwebtoken`)** | Stateless auth tokens for vendors & admins |
| **bcryptjs** | Password hashing |
| **Cloudinary** | Image hosting (logos, banners, menu item & category images) |
| **multer** | Multipart file upload handling (memory storage) before Cloudinary |
| **qrcode** | Generates each vendor's QR code (data URL) |
| **cors** | Cross-origin access for the frontend |
| **dotenv** | Environment configuration |
| **tsx** | Dev runner / TypeScript execution (`npm run dev`, `npm run seed`) |

### Frontend (`frontend/`)
| Tech | Purpose |
|------|---------|
| **React 18 + Vite** | SPA framework + dev/build tooling |
| **TypeScript** | Type safety, shared `lib/types.ts` |
| **Tailwind CSS** | Styling (custom `brand` orange palette) |
| **React Router v6** | Client-side routing for all three areas |
| **@tanstack/react-query** | Server state / data fetching + caching |
| **Zustand** | Client state — `authStore` (token/user) + `cartStore` (persisted cart) |
| **socket.io-client** | Live order updates (tracking + vendor orders) |
| **lucide-react** | Icon set |
| **recharts** | Charts (vendor reports + admin analytics) |
| **clsx + tailwind-merge** | `cn()` class-name helper |

### Payments
- **Cash On Pickup (COD)** — fully working; order is marked `paid` when the vendor marks it *collected*.
- **Razorpay** — **placeholder only** (per MVP). "Pay Online" calls a stub endpoint; no real charge. The order is placed with `paymentStatus: pending`. Real Razorpay SDK flow is to be added in `backend/src/routes/payment.routes.ts`.

### Hosting (intended, not configured here)
Frontend → Vercel · Backend → Render/Railway · DB → MongoDB Atlas · Images → Cloudinary. Everything currently defaults to **localhost**.

---

## 3. Backend — Structure & Responsibilities

```
backend/src/
├── server.ts            App bootstrap: connect DB, create HTTP server, init Socket.IO, listen :5008
├── app.ts               Express app: CORS, JSON, routes, error handlers
├── seed.ts              Seeds admin + 3 demo vendors (with menus, images, coupons, sample orders)
├── config/
│   ├── env.ts           Env vars + CORS allow-list (accepts any localhost port in dev)
│   ├── db.ts            Mongoose connection
│   └── cloudinary.ts    Cloudinary config + buffer upload helper (graceful fallback if unset)
├── models/              Mongoose schemas
│   ├── Vendor.ts        name, slug, email, passwordHash, logo, banner, category, isOpen,
│   │                    prepTime, status, subscriptionPlan, lat/lng, socialLinks
│   ├── Admin.ts         name, email, passwordHash, role (SUPER_ADMIN | ADMIN)
│   ├── MenuCategory.ts  vendorId, name, image, sortOrder
│   ├── MenuItem.ts      vendorId, categoryId, name, description, price, image, isAvailable
│   ├── Order.ts         vendorId, orderNumber, customer, items[], subtotal/tax/discount/total,
│   │                    paymentMethod, paymentStatus, status, pickupTime
│   ├── Coupon.ts        vendorId, code, type (percent|fixed), value, expiry, usage
│   └── Subscription.ts  vendorId, plan, amount, dates, status (model present; billing stubbed)
├── middleware/
│   ├── auth.ts          authenticate (JWT) + requireRole(...) RBAC
│   └── error.ts         HttpError, asyncH wrapper, notFound, errorHandler
├── realtime/io.ts       Socket.IO init + emit helpers (emitNewOrder, emitOrderStatus)
├── routes/
│   ├── auth.routes.ts     POST /vendor/login, /admin/login; GET /me
│   ├── public.routes.ts   vendors list/detail, coupon validate, create order, track order
│   ├── vendor.routes.ts   stats, orders + status, category/item/coupon CRUD, QR, reports, profile
│   ├── admin.routes.ts    overview, vendor mgmt + approval, order monitoring, analytics
│   ├── upload.routes.ts   POST /image → Cloudinary (auth required)
│   └── payment.routes.ts  POST /razorpay/order (PLACEHOLDER stub)
└── utils/
    ├── auth.ts          hash/compare password, sign/verify JWT
    └── helpers.ts       slugify(), genOrderNumber() (e.g. PS-XXXXX)
```

### API surface (REST)
```
Auth      POST /api/auth/vendor/login | /api/auth/admin/login | GET /api/auth/me
Public    GET  /api/public/vendors            (search by name/category/menu-item + category filter)
          GET  /api/public/vendors/:slug      (vendor + categories + items)
          POST /api/public/vendors/:slug/coupon  (validate coupon)
          POST /api/public/orders             (re-prices from DB, applies coupon + 5% tax)
          GET  /api/public/orders/:orderNumber   (track)
Vendor    GET  /api/vendor/me · PUT /api/vendor/me
          GET  /api/vendor/stats · /api/vendor/reports
          GET  /api/vendor/orders · PATCH /api/vendor/orders/:id/status
          CRUD /api/vendor/categories · /api/vendor/items (+ availability) · /api/vendor/coupons
          GET  /api/vendor/qr
Admin     GET  /api/admin/overview · /api/admin/analytics
          CRUD /api/admin/vendors · PATCH /api/admin/vendors/:id/status (approve/suspend/…)
          GET  /api/admin/orders
Uploads   POST /api/uploads/image (multipart, auth)
Payments  POST /api/payments/razorpay/order (stub)
Health    GET  /api/health
```

### Realtime (Socket.IO)
- Rooms: `vendor:<vendorId>` (dashboard) and `order:<orderNumber>` (customer tracking).
- Events: `order:new` → vendor; `order:status` → vendor + the order's tracking room.
- Client events: `vendor:join` and `order:track`.

---

## 4. Frontend — Structure & Responsibilities

```
frontend/src/
├── main.tsx             Bootstrap: QueryClient, Router, Toaster
├── App.tsx              All routes + role-protected route groups
├── index.css            Tailwind + small custom utilities
├── lib/
│   ├── api.ts           fetch wrapper (JWT header, uploadImage helper)
│   ├── socket.ts        socket.io-client singleton
│   ├── types.ts         shared TS types (Vendor, Order, MenuItem, …)
│   └── utils.ts         cn(), rupees(), timeAgo()
├── store/
│   ├── authStore.ts     Zustand: user + token (persists token to localStorage)
│   └── cartStore.ts     Zustand (persisted): one-vendor cart, qty, instructions
├── components/
│   ├── SiteHeader.tsx   Shared customer header (matches Home; logo, Browse, Track Order, Location)
│   ├── PublicNav.tsx    PublicFooter (footer used across customer pages)
│   ├── VendorCard.tsx   Vendor card (grid "banner-top" + "horizontal" row variants)
│   ├── ProtectedRoute.tsx  Role guard (verifies token via /auth/me)
│   ├── ImageUpload.tsx  Cloudinary upload widget (URL fallback)
│   └── ui/              Design system: Button, Input, Card, Badge, Spinner, Modal, Toast
├── customer/
│   ├── Home.tsx         Landing — separate MobileHome + DesktopHome layouts
│   ├── Shops.tsx        Vendor listing (search + category filter)
│   ├── VendorPage.tsx   Vendor store page = menu + cart + checkout entry
│   ├── Checkout.tsx     Name/phone/note, payment method, coupon, place order
│   ├── OrderConfirmation.tsx  Order summary after placing
│   └── OrderTracking.tsx      Live status stepper (Socket.IO)
├── vendor/
│   ├── VendorLogin.tsx · VendorLayout.tsx (branded sidebar shell)
│   ├── Dashboard.tsx (exports shared VendorHeader) · Orders.tsx (separate Mobile/Desktop)
│   ├── Menu.tsx · Settings.tsx · QR.tsx · Coupons.tsx · Reports.tsx
└── admin/
    ├── AdminLogin.tsx · AdminLayout.tsx (branded sidebar shell)
    ├── Overview.tsx (exports shared PageHeader) · Vendors.tsx · Orders.tsx · Analytics.tsx
```

### Responsive strategy
- **Home** and **vendor Orders** use **separate Mobile/Desktop components** (not just CSS), toggled with `md:hidden` / `hidden md:block` (Home) and `lg:hidden` / `hidden lg:block` (Orders).
- **Shops** and **VendorPage** use responsive utility classes that widen to `max-w-[1400px]` on desktop (Swiggy-style).
- **Admin** screens are desktop-focused.
- **Vendor** dashboard: static sidebar on `lg+`, slide-in drawer + mobile top bar below.

### Branding
- Orange `brand` palette; wordmark **Pre** (black) + **Snag** (orange); logo at `frontend/public/PreSnaglogo.png`; hero combo image at `frontend/public/hero.png`.

---

## 5. What's DONE ✅

**Customer**
- Discovery-first homepage (hero, search, popular categories, nearby + featured vendors, how-it-works) with distinct mobile & desktop layouts.
- `/shops` listing with live search (matches vendor name, category, and menu items) + category filter (URL-synced).
- Vendor store page with banner hero, searchable menu, category chips, add-to-cart, quantity & special instructions.
- Cart (Zustand, persisted, one vendor at a time) + checkout (name/phone/note, coupon, COD / Razorpay-placeholder).
- Order confirmation + **live order tracking** (Socket.IO status stepper).
- **Track Order** popup (PS- prefixed input) from the header.
- Geolocation "nearby" sorting (haversine) when the user shares location.

**Vendor dashboard**
- JWT login, branded sidebar layout.
- Dashboard stats (today's orders/revenue, pending, completed, top sellers).
- **Realtime orders** with sound + toast on new orders; status workflow (received → accepted → preparing → ready → collected / cancelled); tap-to-call.
- Menu management: category & item CRUD, availability toggle, Cloudinary image upload.
- Stall settings (profile, branding, hours, open/closed).
- QR code generation (download / print).
- Coupons (percent/fixed, expiry, usage limit).
- Reports: 30-day revenue area chart + best-sellers bar chart.

**Admin dashboard**
- JWT login, branded sidebar layout.
- Platform overview (vendors, orders, revenue, platform commission).
- Vendor management + **approval queue** (approve/suspend/activate/delete), create vendor.
- Order monitoring across all vendors (status/date filters).
- Revenue analytics (MRR/ARR, top vendors, 30-day charts).

**Platform**
- RBAC (SUPER_ADMIN / ADMIN / VENDOR), server-side order re-pricing + 5% tax + coupon logic.
- Cloudinary uploads, QR generation, Socket.IO realtime.
- Seed script: 1 admin + **3 demo vendors** (Tadka Junction, Brew & Bean Café, China Hotpot) with images, menus, a coupon, and sample orders.

## What's DEFERRED / stubbed
- **Razorpay** real payment (placeholder stub only).
- **Subscriptions/billing** automation (model exists; not wired into a billing flow).
- CMS pages, support tickets, push notifications.

---

## 6. Core Workflows

**Customer order flow**
1. Visit `/` or scan a vendor QR → lands on `/vendor/:slug`.
2. Browse menu → add items to cart (qty + instructions).
3. `/checkout` → enter name/phone, optional coupon, choose **COD** or **Razorpay (placeholder)**.
4. `POST /api/public/orders` → backend re-prices from DB, applies coupon + 5% tax, generates `PS-XXXXX`, emits `order:new` to the vendor.
5. Redirect to `/order/:orderNumber` → then `/track/:orderNumber` for **live status** via Socket.IO.

**Vendor flow**
1. Login at `/vendor/login` (JWT).
2. New orders arrive in realtime (sound + toast).
3. Advance status (Accept → Preparing → Ready → Collected); each change emits `order:status` to the customer's tracking room; "collected" marks payment paid.
4. Manage menu, coupons, settings, QR; view reports.

**Admin flow**
1. Login at `/admin/login`.
2. Approve/suspend/create/delete vendors; monitor all orders; view analytics.

---

## 7. Running Locally

```bash
# Backend
cd backend && npm install
cp .env.example .env        # set MONGO_URI (+ optional Cloudinary)
npm run seed                # demo data
npm run dev                 # → http://localhost:5008

# Frontend
cd frontend && npm install
npm run dev                 # → http://localhost:5173
```

**Demo credentials** (after seeding)
| Role | Login route | Email | Password |
|------|-------------|-------|----------|
| Admin | `/admin/login` | admin@presnag.com | admin123 |
| Vendor | `/vendor/login` | tadka@presnag.com | vendor123 |
| Vendor | `/vendor/login` | brew@presnag.com | vendor123 |
| Vendor | `/vendor/login` | chinahotpot@presnag.com | vendor123 |

Coupon: **WELCOME10** (10% off). Customer side needs no login.

### Env vars
**backend/.env**: `PORT=5008`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`, `RAZORPAY_*` (placeholder).
**frontend/.env**: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_RAZORPAY_KEY_ID` (placeholder).

---

## 8. Notable Decisions
- **Single SPA, route-based** (not subdomains) for simple single-domain deployment.
- Backend **dev CORS** accepts any `localhost:*` origin (so it works even if Vite bumps off 5173).
- Vendor **ratings removed** from the UI by request.
- Customer search bar covers **vendors, food items, and categories** (backend `$or` across name/category/menu items).
- Prices are always **re-computed server-side** on order creation (client prices are not trusted).
