# PreSnag — Vendor Self-Registration + Cashfree (Managed-first, Direct via 1-click migration)

## Context
PreSnag takes **no per-order commission** (revenue is a flat ₹600/month/vendor, off-platform). Each
customer payment must reach the ordering vendor. We support **two settlement modes**, and — to
launch fast with ~20 vendors and minimal friction — **MANAGED is the default**:

- **MANAGED (`settlementMode = "MANAGED"`) — DEFAULT at launch.** Vendor provides only **Account
  Holder Name, Account Number, IFSC, PAN**. Customer payments are **collected by PreSnag**, and
  **one automated payout per day** (~10 PM) is sent to the vendor via **Cashfree Payouts**. No
  Cashfree KYC wait → vendor is ready instantly.
- **DIRECT (`settlementMode = "DIRECT"`).** Vendor completes **Cashfree Easy Split** hosted KYC;
  every order is paid with a **100% split straight to the vendor's bank**. PreSnag never holds the
  money (fully compliant). Vendors **migrate to DIRECT later with one click** — no admin needed.

> ⚠️ Compliance note: MANAGED collects third-party funds into PreSnag's account (the RBI-regulated
> "aggregator" pattern). It's a deliberate launch shortcut; the **migration path to DIRECT** is how
> vendors graduate to the fully-compliant model. Encourage DIRECT over time.

### Ideal flow
```
Vendor Signup → Basic Details → Choose:
   ① PreSnag Managed (Instant)   ← default
   ② Direct Settlement (Cashfree)
→ Admin "List on PreSnag" → Store Live
Later: any MANAGED vendor → [Switch to Direct Settlement] → Cashfree KYC → auto settlementMode=DIRECT
```
(Admin still gives the final **"List on PreSnag"** approval — a hard requirement — but MANAGED has no
external KYC delay, so approval is immediate. The later mode-switch needs **no** admin step.)

### Locked decisions
- Provider: **Cashfree** — Payouts (MANAGED) + Easy Split (DIRECT). Replaces the Razorpay stub.
- **Default `settlementMode = "MANAGED"`.**
- DIRECT onboarding: **hosted redirect**; migration is **vendor self-service, no admin**.
- Admin "List on PreSnag" remains the listing gate; not-yet-live vendors' **store is blocked**.

### Constraints
- MANAGED: live after admin approval + a valid Cashfree **Payouts beneficiary** exists.
- DIRECT: order-time split needs Cashfree vendor **ACTIVE** (`kycStatus==="active"`).
- ~2% MDR per order borne by the vendor (deducted from settlement/payout).
- Test against **Cashfree SANDBOX** first (PG + Payouts have separate sandbox creds).

---

## Deliverable 0 — Root plan doc
This file (`plan.md`) is that doc.

---

## Data model

### `backend/src/models/Vendor.ts` — add
- `settlementMode: enum ["MANAGED","DIRECT"]` **default `"MANAGED"`**.
- `eligibleForDirectMigration: boolean` default `true` — drives the "Switch to Direct" banner.
- `managedPayout: { accountHolderName, accountNumberLast4, ifsc, panMasked }` — display-only.
- `cashfreeBeneficiaryId: string` ("") — Cashfree Payouts beneficiary (MANAGED).
- `cashfreeVendorId: string` ("") — Easy Split sub-merchant (DIRECT).
- `kycStatus: enum ["not_started","in_progress","active","rejected"]` default `"not_started"` (DIRECT).
- Keep existing `status` as the admin listing decision (pending/active/suspended/inactive).
- **Publicly live** when `status==="active"` AND (MANAGED → `cashfreeBeneficiaryId` present) OR
  (DIRECT → `kycStatus==="active"`).

### `backend/src/models/Order.ts` — add
- `settlementMode: "MANAGED" | "DIRECT"` (snapshot at order time).
- `settlementStatus: enum ["not_applicable","pending","processing","settled","failed"]`
  (DIRECT → `not_applicable`; MANAGED paid → `pending` until daily payout).
- `payoutId: string`, `settledAt: Date`.

Mirror new fields in `frontend/src/lib/types.ts`.

---

## Phase 1 — Vendor self-registration + mode choice + admin listing
**Backend**
- `POST /api/auth/vendor/register` (`auth.routes.ts`): validate, dedupe email, unique `slug`
  (reuse `slugify` + dedupe from `admin.routes.ts` POST `/vendors`); create Vendor `status:"pending"`,
  `settlementMode:"MANAGED"`; auto-login via `signToken({id, role:"VENDOR"})`.
- Extend `GET /api/admin/vendors` select; add `GET /api/admin/vendors/:id` detail.

**Frontend**
- New `frontend/src/vendor/VendorRegister.tsx` (mirror `VendorLogin.tsx`): basic details, then a
  **mode choice** card — ① **PreSnag Managed (Instant)** [default, collects bank+PAN inline] or
  ② **Direct Settlement (Cashfree)** [redirect to hosted KYC]. Route `/vendor/register` in `App.tsx`;
  link from `VendorLogin.tsx`.
- `frontend/src/admin/Vendors.tsx`: row-click **detail modal** (all details + `settlementMode` +
  beneficiary/`kycStatus` + payout info); explicit **"List on PreSnag"** → `status:"active"` (enabled
  once the mode's live-condition is met). Show mode + status as badges.

**Gating** — `public.routes.ts`: `/vendors`, `/vendors/:slug`, order-create enforce "publicly live".

---

## Phase 2 — Onboarding + 1-click migration
**Config** — `env.ts`: `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`,
`CASHFREE_WEBHOOK_SECRET`, `CASHFREE_PAYOUT_CLIENT_ID`, `CASHFREE_PAYOUT_CLIENT_SECRET`. New
`backend/src/config/cashfree.ts` (PG + Payouts base URLs + auth headers).

**MANAGED setup:** form (name/account/IFSC/PAN) → backend creates a Cashfree **Payouts beneficiary**
→ store `cashfreeBeneficiaryId` + masked fields.

**Vendor dashboard → Payments section:**
```
Current Mode: 🟡 PreSnag Managed
[ Switch to Direct Settlement ]
🎉 Switch to Direct Settlement and receive payments directly into your bank account.   ← banner if eligibleForDirectMigration
```
- **Switch to Direct (self-service, no admin):** `POST /api/vendor/settlement/switch-direct` →
  create Cashfree Easy Split vendor → `kycStatus:"in_progress"` → return **hosted onboarding link** →
  redirect. Webhook `POST /api/payments/cashfree/webhook` (new `payment.routes.ts`,
  signature-verified): on vendor ACTIVE → set `kycStatus:"active"` **and** `settlementMode:"DIRECT"`
  automatically. Any still-pending MANAGED orders are paid by the next daily payout; new orders go
  DIRECT. No re-listing needed (vendor already `active`).

---

## Phase 3 — Checkout pays per mode
`payment.routes.ts` (replaces Razorpay stub):
- `POST /api/payments/cashfree/order` given `orderNumber`:
  - **DIRECT:** Cashfree order with `order_splits:[{vendor_id:cashfreeVendorId, percentage:100}]`.
  - **MANAGED:** Cashfree order **no split** (funds → PreSnag); stamp order `settlementMode:"MANAGED"`,
    `settlementStatus:"pending"`.
  - Return `payment_session_id`.
- PreSnag order created in `/api/public/orders` (`received`, `paymentStatus:"pending"`); webhook
  `PAYMENT_SUCCESS` → `paid` + emit `order:new` (reuse `emitNewOrder`) — alert vendor after payment.

**Frontend** (`Checkout.tsx`): create PreSnag order → Cashfree order → **Cashfree JS checkout**
(`@cashfreepayments/cashfree-js`) → success `/order/:n`. Remove placeholder + `razorpay/order`;
rename `VITE_RAZORPAY_*` → `VITE_CASHFREE_*`.

---

## Phase 4 — Daily managed payout + vendor earnings
**Daily payout job** (`backend/src/jobs/dailyPayout.ts`, `node-cron` ~10 PM + admin "Run settlement
now"): per MANAGED vendor, sum `paid` + `settlementStatus:"pending"` orders → **one** Cashfree
Payouts transfer to `cashfreeBeneficiaryId` → mark orders `settled` (`payoutId`, `settledAt`);
failures → `failed` + surfaced to admin. Idempotent transfer id per vendor per day.

**Vendor earnings** — `GET /api/vendor/settlement` returns: **today's earnings**, **pending
settlement** (paid-but-unsettled), **settlement status** (last payout time/result; DIRECT shows
"paid directly to bank per order"). Dashboard cards reuse `VendorHeader`/`vendor-stats` patterns.

**Admin** — settlements view (section in `admin/Vendors.tsx` or Overview): MANAGED vendors' pending
amounts, last payout, manual "Run settlement".

---

## Files (representative)
- Backend: `models/Vendor.ts`, `models/Order.ts`, `routes/auth.routes.ts`, `routes/admin.routes.ts`,
  `routes/vendor.routes.ts`, `routes/public.routes.ts`, `routes/payment.routes.ts` (rewrite),
  `config/env.ts`, `config/cashfree.ts` (new), `jobs/dailyPayout.ts` (new), `server.ts` (start cron).
- Frontend: `vendor/VendorRegister.tsx` (new), `vendor/VendorLogin.tsx`, vendor Payments/earnings UI,
  `admin/Vendors.tsx`, `customer/Checkout.tsx`, `App.tsx`, `lib/types.ts`, `.env`.
- Docs: `plan.md` (this file).

## Verification (Cashfree SANDBOX)
- **Phase 1:** register at `/vendor/register` (defaults MANAGED) → admin sees `pending` → "List on
  PreSnag" → store live; vendor hidden until listed.
- **Phase 2 migration:** as a MANAGED vendor click **Switch to Direct** → finish sandbox hosted KYC →
  webhook auto-sets `kycStatus:"active"` + `settlementMode:"DIRECT"` with no admin action; banner
  disappears.
- **Phase 3:** MANAGED order → funds in PreSnag account, order `settlementStatus:"pending"`; DIRECT
  order → 100% split to vendor in Cashfree dashboard.
- **Phase 4:** run daily job → MANAGED vendor gets one Payouts transfer; orders → `settled`; dashboard
  shows today's earnings / pending / settlement status.
- `npm run build` (frontend) + `npx tsc --noEmit` (backend) after each phase.
