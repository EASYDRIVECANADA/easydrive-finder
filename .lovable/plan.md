

## How to view a car listing and complete checkout in your current app

This is a walkthrough of what's already built — no code changes needed unless you want the gaps closed.

### 1. Browse the inventory
- Go to **`/inventory`** (or click **Shop Cars** in the header).
- You'll see all 12 mock vehicles with price, photo, km, and a "Premier / Dealer" badge.
- Quick filters on the left (Seller Type, Special Listings, Cars Under) narrow the list. Sort dropdown top-right.
- Click any card to open the listing.

### 2. View a car listing (Vehicle Detail Page)
Route: **`/inventory/{vehicleId}`** (you're on `/inventory/v-001` right now).

What's on the page:
- Hero photo + title (Year Make Model), trim, stock #, Certified/AS-IS badge.
- Price, sale price, "Place on Hold" / primary CTA.
- Payment calculator (down payment slider, term slider → monthly payment).
- Vehicle specs (make, model, year, km, transmission, engine, drivetrain, colors).
- Description and feature list.
- Back-to-inventory link.

The primary CTA on the listing is what starts checkout.

### 3. Self-checkout flow
Route: **`/checkout/{vehicleId}`** — a multi-step wizard:

1. **Customer Info** — name, email, phone, address (Zod-validated).
2. **ID Upload** — driver's licence front/back via `FileUpload`.
3. **Review Documents** — Bill of Sale + 30-Day Dealer Guarantee shown inline (OMVIC $22 + $59 licensing + HST included in pricing).
4. **E-Signature** — `SignaturePad` captures a signature applied to both documents.
5. **Deposit** — $500 e-transfer instructions (copy-to-clipboard for email/amount).
6. **Confirmation** — order ID, "Download Bill of Sale" and "Download Guarantee" buttons (real signed PDFs via `pdf-lib`), link to the customer portal.

Order is saved to `localStorage` via `src/lib/orders.ts`.

### 4. Customer order portal
Route: **`/orders/{orderId}`** — customer returns here to:
- See order status (Deposit Pending → Deposit Received → Balance Due → Complete).
- Re-download signed Bill of Sale and Dealer Guarantee.
- See balance-due instructions (direct deposit) once dealer confirms the deposit.

### 5. Dealer side (you)
Route: **`/dealer/sales`** — every checkout creates a sale row here. You manually mark deposit received and balance received; the customer portal updates live.

---

### Gaps vs. the live EasyDrive Canada listing screenshots you uploaded

Your screenshots show polish the current build doesn't have yet:

| Live site has | Current build |
|---|---|
| Photo carousel with thumbnail strip + "1 / 19" counter | Single hero image only |
| "Deal Pending" status pill next to price | Not shown on listing |
| Side action stack: Place on Hold, **View CARFAX Report**, **View Important Disclosure**, **Ask a Question**, **Call Us** | Only Place on Hold / primary CTA |
| Trust row: CARFAX Available, Safety Inspected, Financing Available | Missing |
| Stat tiles (km, year) above specs | Missing |
| CARFAX PDF modal viewer | Missing |
| "Important Disclosure" modal (EDC Premier, OMVIC fees, CARFAX disclosure) | Missing |
| Breadcrumbs (Home › Inventory › Vehicle) | Missing |

### Proposed fixes (one batch)

1. **Listing page polish** (`inventory.$vehicleId.tsx`)
   - Add `images[]` to vehicle type (fall back to `[image]`); build a carousel with prev/next, thumbnail strip, and "n / total" counter.
   - Add breadcrumbs row.
   - Add "Deal Pending" pill when an active order exists for the vehicle (already detectable via `activeOrderForVehicle`).
   - Add the side action stack: Place on Hold, View CARFAX Report, View Important Disclosure, Ask a Question, Call Us (613) 777-2395.
   - Add the trust row (CARFAX / Safety Inspected / Financing Available).
   - Add the two stat tiles (km, year) above the specs grid.

2. **CARFAX modal** — Dialog with embedded `<iframe>` of a sample CARFAX PDF (bundled in `public/`), plus "Open in new tab" link. Per-vehicle `carfaxUrl` field.

3. **Important Disclosure modal** — Static EDC Premier disclosure (matches your screenshot exactly: Vehicle Status, Safety & Reconditioning, Fees & Licensing $22 OMVIC + $59 licensing, CARFAX Disclosure) with "I Understand" button.

4. **Ask a Question** — Simple dialog with a contact form that creates a lead in `dealer.leads` (localStorage).

5. **Checkout entry** — Make the listing's primary CTA explicitly say **"Buy Online — $500 Deposit"** and deep-link to `/checkout/{vehicleId}`, so the path from listing → checkout is obvious.

### Out of scope
- Real CARFAX API integration (modal will show a sample PDF placeholder until you supply per-vehicle reports).
- Real photo galleries per vehicle (will reuse the single image until you upload more).

