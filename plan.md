# PreSnag — Implementation Plan

> **Order Ahead. Skip The Queue.**
> Cloud-based ordering platform for local vendors. Customers order without an app (via web/QR). Vendors and platform admins manage everything from dashboards.

---

## 1. Scope (MVP)

| Area | Build in MVP |
|------|--------------|
| Public customer website | ✅ Homepage, vendor listing, vendor page, cart, checkout, order confirmation, live order tracking |
| Vendor dashboard | ✅ Login, dashboard stats, orders (realtime + sound), menu & category management, stall settings, QR, coupons (basic), reports (basic) |
| Admin dashboard | ✅ Login, platform overview, vendor management + approval, order monitoring, basic analytics |
| Payments | ✅ **Cash On Pickup (working)**, ✅ **Razorpay (placeholder button only)** |
| Images | ✅ Cloudinary uploads |
| Realtime | ✅ Socket.IO order events |
| QR | ✅ Generate / download per-vendor QR |

### Deferred (post-MVP)
CMS pages, support tickets, subscription billing automation, MRR/ARR charts, distance calc, multi-subdomain deploy. Subscription is stored as a simple field/collection but billing flow is stubbed.

---

## 2. Architecture

**Single frontend app, single domain, route-based architecture** (no subdomains). Run locally:

```
PreSnag/
├── backend/                 # Node + Express + TS + Socket.IO + Mongoose   → :5008
└── frontend/                # ONE React/Vite/TS/Tailwind app               → :5173
    └── src/
        ├── customer/        # public pages
        ├── vendor/          # vendor dashboard (role: VENDOR)
        ├── admin/           # admin dashboard (role: ADMIN/SUPER_ADMIN)
        ├── components/      # shared UI, ProtectedRoute, nav, cards
        ├── lib/             # api client, socket, types, utils
        └── store/           # auth + cart (Zustand)
```

Everything deploys under one domain (`presnag.com`). Role-based routing + `ProtectedRoute` guards the vendor/admin sections.

**Route map (single domain):**
```
Customer (public)
  /                      Home (landing)
  /shops                 Vendor listings (search + category filter)
  /vendor/:slug          Public vendor store page
  /checkout              Checkout
  /order/:orderNumber    Order confirmation
  /track/:orderNumber    Live order tracking (Socket.IO)

Vendor (role: VENDOR)
  /vendor/login          Login
  /vendor/dashboard      Dashboard
  /vendor/orders         Orders (realtime + sound)
  /vendor/menu           Menu management
  /vendor/settings       Stall settings
  /vendor/qr             QR code
  /vendor/coupons        Coupons
  /vendor/reports        Reports

Admin (role: ADMIN / SUPER_ADMIN)
  /admin/login           Login
  /admin/dashboard       Platform overview
  /admin/vendors         Vendor management + approval
  /admin/orders          Order monitoring
  /admin/analytics       Revenue analytics
```

Note: static `/vendor/login`, `/vendor/dashboard`, … outrank the dynamic `/vendor/:slug` store page in React Router, so there's no conflict. Backend CORS accepts the configured `CLIENT_URL` plus any `localhost:*` origin in dev (so it works even if Vite bumps off port 5173).

---

## 3. Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind, shadcn-style UI components, React Query, Zustand, React Router, socket.io-client.
- **Backend:** Node, Express, TypeScript, Socket.IO, Mongoose.
- **DB:** MongoDB (Atlas in prod; local/Atlas via `MONGO_URI`).
- **Storage:** Cloudinary.
- **Auth:** JWT + bcrypt, RBAC roles `SUPER_ADMIN | ADMIN | VENDOR`.
- **Payments:** Razorpay (placeholder), Cash On Pickup (real).
- **QR:** `qrcode` package.

---

## 4. Data Models (Mongoose)

- **Vendor** — name, slug, email, phone, address, logo, banner, description, openingHours, socialLinks, status (`pending|active|suspended|inactive`), subscriptionPlan, createdAt.
- **Admin** — name, email, passwordHash, role (`SUPER_ADMIN|ADMIN`).
- **VendorUser/auth** — vendor login uses email + passwordHash on Vendor (or a linked credential). MVP: store passwordHash on Vendor.
- **MenuCategory** — vendorId, name, image, sortOrder.
- **MenuItem** — vendorId, categoryId, name, description, price, image, isAvailable.
- **Order** — vendorId, orderNumber, customerName, customerPhone, note, items[{itemId,name,price,qty,instructions}], subtotal, tax, total, paymentMethod (`COD|RAZORPAY`), paymentStatus (`pending|paid`), status (`received|accepted|preparing|ready|collected|cancelled`), pickupTime, createdAt.
- **Coupon** — vendorId, code, type (`percent|fixed`), value, expiry, usageLimit, usedCount.
- **Subscription** — vendorId, plan, amount, startDate, endDate, status.

---

## 5. API Surface (REST)

```
Auth
  POST   /api/auth/vendor/login
  POST   /api/auth/admin/login
  GET    /api/auth/me

Public
  GET    /api/public/vendors                 (list + search + category filter)
  GET    /api/public/vendors/:slug           (vendor + menu + categories)
  POST   /api/public/orders                  (create order)
  GET    /api/public/orders/:orderNumber     (track)

Vendor (auth: VENDOR)
  GET    /api/vendor/me
  PUT    /api/vendor/me                       (stall settings)
  GET    /api/vendor/stats
  GET    /api/vendor/orders
  PATCH  /api/vendor/orders/:id/status
  CRUD   /api/vendor/categories
  CRUD   /api/vendor/items
  PATCH  /api/vendor/items/:id/availability
  CRUD   /api/vendor/coupons
  GET    /api/vendor/qr                        (returns QR data URL)
  GET    /api/vendor/reports

Admin (auth: ADMIN+)
  GET    /api/admin/overview
  CRUD   /api/admin/vendors
  PATCH  /api/admin/vendors/:id/status         (approve/suspend/etc.)
  GET    /api/admin/orders
  GET    /api/admin/analytics

Uploads
  POST   /api/uploads/image                    (Cloudinary, multipart)

Payments
  POST   /api/payments/razorpay/order          (PLACEHOLDER — returns stub)
```

## 6. Realtime (Socket.IO)

- Rooms per vendor: `vendor:<vendorId>`. Customer order-tracking room: `order:<orderNumber>`.
- Events: `order:new` (→ vendor), `order:status` (→ vendor + order room).

---

## 7. Build Order

1. **Scaffold backend** — TS config, Express app, env, Mongo connect, error handling.
2. **Models** — all Mongoose schemas.
3. **Auth** — JWT, bcrypt, middleware, seed script (super admin + sample vendor + menu).
4. **Public API** — vendors list/detail, create order, track.
5. **Socket.IO** — wire order events.
6. **Vendor API** — stats, orders, menu/category CRUD, coupons, QR, reports.
7. **Admin API** — overview, vendor mgmt/approval, order monitoring, analytics.
8. **Uploads** — Cloudinary; **Payments** — Razorpay placeholder.
9. **Scaffold frontend** — Vite + Tailwind + shadcn primitives, router, API client, auth store, socket hook.
10. **Public pages** — home/listing, vendor page + cart (Zustand), checkout (COD + Razorpay placeholder), confirmation, tracking.
11. **Vendor dashboard** — login, layout, dashboard, orders (realtime + sound), menu mgmt, stall settings, QR, coupons, reports.
12. **Admin dashboard** — login, overview, vendor mgmt + approval, orders, analytics.
13. **Seed + README** — run instructions, sample creds.

---

## 8. Env Vars

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/presnag
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=          # placeholder
RAZORPAY_KEY_SECRET=      # placeholder
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=     # placeholder
```

---

## 9. Notes / Decisions

- Razorpay: button rendered, calls placeholder endpoint, no real charge. COD is the functioning path; orders placed via Razorpay are marked `paymentStatus=pending`.
- Cloudinary upload works only when keys are set; otherwise falls back to accepting an image URL.
- Single SPA with route prefixes instead of 3 subdomains for local simplicity.
- Deployment (Vercel/Render) left to the user; everything defaults to localhost.
