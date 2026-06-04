# PreSnag 🍴

**Order Ahead. Skip The Queue.** — a cloud-based ordering platform for local vendors. Customers order via web/QR (no app), vendors and platform admins manage everything from dashboards.

See [`plan.md`](./plan.md) for the full design.

## Structure

A **single frontend app** + backend, deployed under **one domain** (route-based, no subdomains):

```
PreSnag/
├── backend/          # Express + TS + Socket.IO + Mongoose   → http://localhost:5008
└── frontend/         # One React/Vite app                    → http://localhost:5173
    └── src/
        ├── customer/   # public pages
        ├── vendor/     # vendor dashboard (role: VENDOR)
        ├── admin/      # admin dashboard (role: ADMIN/SUPER_ADMIN)
        ├── components/ # shared UI, ProtectedRoute, nav, cards
        ├── lib/        # api client, socket, types, utils
        └── store/      # auth + cart (Zustand)
```

## Routes (single domain)

| Area | Route | |
|------|-------|---|
| Customer | `/` | Home (landing) |
| | `/shops` | Vendor listings (search + filter) |
| | `/vendor/:slug` | Public vendor store page |
| | `/checkout` | Checkout |
| | `/order/:orderNumber` | Order confirmation |
| | `/track/:orderNumber` | Live order tracking |
| Vendor (VENDOR) | `/vendor/login` | Login |
| | `/vendor/dashboard` · `/orders` · `/menu` · `/settings` · `/qr` · `/coupons` · `/reports` | Dashboard sections |
| Admin (ADMIN/SUPER_ADMIN) | `/admin/login` | Login |
| | `/admin/dashboard` · `/vendors` · `/orders` · `/analytics` | Dashboard sections |

Vendor & admin sections are protected by role-based `ProtectedRoute` guards. Static `/vendor/*` routes take priority over the dynamic `/vendor/:slug` store page.

## Prerequisites

- Node 18+
- A MongoDB connection string (Atlas or local) in `backend/.env` → `MONGO_URI`.
- (Optional) Cloudinary keys in `backend/.env` for image uploads. Without them, image fields fall back to pasting a URL.

## Setup & Run (local)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # fill in MONGO_URI (+ optional Cloudinary)
npm run seed                # creates sample admin, vendors, menu, orders
npm run dev                 # → http://localhost:5008

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # → http://localhost:5173
```

> If port 5173 is busy, Vite picks the next free port — that's fine: the backend's dev CORS accepts any `localhost` port.

## Demo credentials (after `npm run seed`)

| Role   | Login route             | Email                   | Password   |
|--------|-------------------------|-------------------------|------------|
| Admin  | `/admin/login`          | admin@presnag.com       | admin123   |
| Vendor | `/vendor/login`         | sharma@presnag.com      | vendor123  |
| Vendor | `/vendor/login`         | brew@presnag.com        | vendor123  |

Sample coupon: **WELCOME10** (10% off). The customer side needs no login.

## Features

- **Customer:** landing + `/shops` browse/search by category, vendor menu, cart (qty + special instructions), checkout (name/phone/note), coupons, order confirmation, **live order tracking** (Socket.IO).
- **Vendor:** dashboard stats + top sellers, **realtime orders with sound alert**, order status flow, menu/category CRUD + availability toggle + image upload, stall settings, QR generation (download/print), coupons, 30-day reports (charts).
- **Admin:** platform overview, vendor management + **approval queue**, create vendor, suspend/activate/delete, order monitoring (filter by status/date), revenue analytics (MRR/ARR, top vendors).

## Payments

- **Cash On Pickup** — fully working. Order marked paid when the vendor marks it *collected*.
- **Razorpay** — **placeholder only** (per MVP). The "Pay Online" button calls a stub endpoint and places the order as `paymentStatus: pending`; no real charge. Swap in the real Razorpay SDK flow in `backend/src/routes/payment.routes.ts` before going live.

## Deployment notes

Hosting is left to you. Frontend → Vercel (single project), backend → Render/Railway, DB → MongoDB Atlas. Point `presnag.com` at the frontend; set `VITE_API_URL` / `VITE_SOCKET_URL` to the backend URL, and `CLIENT_URL` in `backend/.env` to your domain (CORS + QR links use it).
