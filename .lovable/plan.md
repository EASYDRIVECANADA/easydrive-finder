

## EasyDrive Canada — Public inventory, branded logo, and self-checkout

### Live site status
- `easydrivecanada.com/inventory` currently shows **0 vehicles** — nothing to scrape. I'll wire the public inventory to the existing 12 mock vehicles in `src/data/vehicles.ts` so everything is clickable now. When you have real listings, swap the data source (CSV import, Cloud table, or scrape later).

### 1. Match the real logo
Recreate the EDC mark as a clean SVG component (`src/components/marketing/EdcLogo.tsx` — already exists, will be redrawn):
- Bold blue **"EDC"** monogram (color `#3b9eff`), rounded geometric letterforms matching the screenshot
- Small **"EASY DRIVE CANADA"** wordmark beneath in spaced caps
- Used in marketing header, footer, login screen, and the dark dealer sidebar (white variant)

Color palette pulled from the live site: primary blue `#3b9eff`, dark navy `#0a1628`, white background.

### 2. Public marketing — match live site feel
- Update `/` hero: dark showroom background image, "Buy Your Next Car Online — Simple, Transparent, Delivered" headline, "Browse Vehicles" + "Get Pre-Approved" CTAs, trust row (150+ Point Inspection, We Bring It to You, Secure Checkout)
- `/inventory` grid → cards link to `/inventory/$vehicleId`
- `/inventory/$vehicleId` — gallery, specs, price, **"Buy this vehicle"** CTA → starts checkout

### 3. Self-checkout — `/checkout/$vehicleId`
Stepper:
```text
[1 Customer info] → [2 Driver's licence] → [3 Deposit $1,000] →
[4 E-transfer instructions] → [5 Sign Bill of Sale] →
[6 Sign 30-Day Dealer Guarantee] → [7 Confirmation]
```
- **1** Name, email, phone, address, DOB (Zod validated)
- **2** Upload licence front + back (JPG/PNG/PDF, max 10 MB) → private Cloud Storage bucket
- **3** Acknowledge **non-refundable $1,000 deposit** + EDC's discretionary cancel/refund right (checkbox)
- **4** On-screen instructions: e-transfer $1,000 to `info@easydrivecanada.com`, reference = order #; "I've sent it" marks deposit pending
- **5** Bill of Sale rendered with customer + vehicle + HST/doc fee/licensing breakdown; typed name + canvas signature pad → generates signed PDF (pdf-lib server function)
- **6** 30-Day Dealer Guarantee — your PDF clauses 1–11 reformatted with proper typography, numbered list, signature block; signed PDF generated
- **7** Order summary, "what happens next" timeline, order number

On submit: vehicle status flips to **Deal Pending**, sale request appears in DMS.

### 4. Customer order portal — `/orders/$orderId` (magic-link login)
- Live status timeline: Deposit pending → Deposit confirmed → Awaiting full payment → Ready for delivery → Picked up
- **Direct deposit info card** (bank/transit/account) revealed when status = "Awaiting full payment"
- **72-hour countdown** when status = "Ready for delivery"
- Upload **proof of insurance** (required before pickup)
- Re-download signed Bill of Sale + Dealer Guarantee
- Forfeiture warning banner under 24h remaining

### 5. DMS additions — extend `/dealer/sales`
- New **Sale Requests** tab: customer, vehicle, deposit status, uploaded licence preview, signed docs
- Actions: **Confirm deposit received** • **Counter-sign Bill of Sale** (finalizes deal, emails customer) • **Mark ready for delivery** (starts 72h timer + email) • **Approve insurance** • **Mark picked up** • **Cancel & forfeit deposit**
- Auto-cancel: on order load, if 72h elapsed past `ready_for_delivery_at` without `picked_up` OR insurance not approved → status = Cancelled, vehicle returns to In Stock, deposit forfeited

### 6. Backend (Lovable Cloud)
**Tables:** `orders`, `customers`, `order_documents` (licence/insurance/bos/guarantee), `order_events` (audit), `user_roles` (separate roles table per security best practice).

**Storage buckets** (private, signed URLs): `licences`, `insurance`, `signed-docs`.

**RLS:** customers see only their orders; dealers (via `has_role` security definer) see all.

**Server functions:** create order + lock vehicle, confirm deposit, counter-sign, mark ready, approve insurance, cancel + release.

**Emails (Resend connector):** deposit instructions, dealer counter-signed, ready-for-delivery + 72h warning, cancellation, pickup confirmation.

### What I need before building
1. **Enable Lovable Cloud?** (required for auth, DB, file uploads, storage) — yes/no
2. **Email sending** — connect **Resend** for transactional emails? (recommended)
3. **Direct deposit details** — paste bank name, transit, institution, account number now, or use placeholder text I can swap later?
4. **Mock vehicles OK for now?** (live site has 0 inventory)

### Out of scope
- Real payment processing — deposit (e-transfer) and balance (direct deposit) are both manually confirmed by dealer
- Automated ID/licence verification — manual dealer review
- SMS notifications — email only
- pg_cron for the 72h timer — using on-load check + dealer manual action (can upgrade later)

