

## Plan: EDC marketplace overhaul + checkout reorder + add-ons (14 changes)

### 1. Replace EDC logo
Copy `user-uploads://Profile_Logo.jpg` → `src/assets/edc-logo.jpg`. Rewrite `src/components/marketing/EdcLogo.tsx` to render the uploaded image (drop the inline SVG monogram). Keep `variant`/`asLink` props; size with `h-10 w-auto`.

### 2. Better finance calculator (`inventory.$vehicleId.tsx`)
- **Down payment**: numeric input alongside slider (slider step 100, max = 80% of price). Quick-pick chips: $0 / $1k / $2k / $5k / 10% / 20%.
- **Term**: replace slider with segmented buttons (24 / 36 / 48 / 60 / 72 / 84 mo) — click, not drag.
- **APR**: small input + slider (default 7.99%, range 4.99–14.99).
- **Frequency toggle**: monthly / bi-weekly.

### 3. Pull easydrivefinance.ca content into the app
Rewrite `src/routes/financing.tsx`:
- Hero "Get Pre-Qualified for Auto Financing" + three bullets (one secure application, no obligation, all credit profiles).
- "What we believe / How we do it / What we do" three-column section.
- "Who EasyDrive Finance is for" list (fair credit, rebuilding, self-employed, new to Canada, etc.).
- Testimonials (Nathaniel, Jackson, Olivia, Grace).
- Full FAQ accordion (~20 Qs from their site).
- Keep existing application form.

On the vehicle listing page add a compact 5–6 question "Financing FAQ" accordion in the right rail.

### 4. Split customer name (First / Middle / Last)
- `CustomerInfo` in `src/lib/orders.ts`: `firstName`, `middleName?`, `lastName` instead of `fullName`.
- Update zod schema and `StepCustomer` (Middle marked optional).
- `bill-of-sale.tsx` and `pdf-generator.ts` render full name correctly.

### 5. Frame output as "Digital Bill of Sale"
Update copy on confirmation step and `orders.$orderId.tsx`. Add prominent **Download PDF / Print / Save to device** buttons.

### 6. Term eligibility based on vehicle age
In the calculator, compute `age = currentYear - v.year` and disable terms above the cap:
- 0–6 yrs → up to 84 mo
- 7–9 yrs → up to 60 mo
- 10+ yrs → up to 48 mo

Render an info chip explaining the age-based bank cap, with a link to `/financing`.

### 7. Remove free-delivery claim from home
- Trust badge "Free Delivery" → **"Safety Inspected / Every EDC Premier vehicle"**.
- FAQ "Do you deliver?" → "Delivery is available for a fee."
- "How it works" step 4 → "Pick up or arrange delivery."

### 8. Safety inspection messaging for EDC Premier
On listing detail: when `listingType === "EDC Premier"`, show a green "Safety Inspected by EDC" trust badge. Other listing types show "Inspection status: see seller." Update home FAQ accordingly.

### 9–11. Marketplace listing types
Extend `Vehicle` in `src/data/vehicles.ts` with `listingType: "Private Seller" | "Dealer Select" | "EDC Premier" | "Fleet Select"` and `sellerName`. Backfill all 12 mock vehicles. Add a colored badge to `VehicleCard` (Premier=blue, Dealer Select=indigo, Fleet Select=slate, Private Seller=amber). Add a Listing Type checkbox group to inventory sidebar filters. Show the type chip + seller name on the listing detail. In `dealer.marketplace.tsx`, replace the static "AutoTrader / Kijiji / Facebook" pills with the actual listing type and a "Pushed live" indicator + tabs.

### 12. Private Seller verification gate
In `dealer.inventory.tsx`, show a top-of-page banner when account type is "Private Seller" (mock state via a top-bar account-type switcher for demo).

New `PrivateSellerVerification` component with 4 upload tiles + match-check status (Vehicle Ownership, Driver's Licence, Proof of Insurance, CARFAX Report). Until all 4 are uploaded and matched, marketplace status reads **"Pending Verification — not live"**; once complete, **"Live on Marketplace"**. Other account types skip the gate.

### 13. EDC Premier checkout fees + add-ons
Update `src/lib/orders.ts` pricing model and the checkout summary.

**Premier fee structure** (only when `listingType === "EDC Premier"`):
- Documentation Fee — **$999 ~~waived~~** ($0 charged, line shown with strike-through)
- Dealer Admin Fee — **$999 ~~waived~~** ($0 charged)
- OMVIC Fee — **$22** (taxable)
- New Plates / Licensing — **$59**
- HST 13% on (sale price + OMVIC + taxable add-ons).

Non-Premier listings keep current $599 doc fee + $120 licensing.

**New "Add-Ons" checkout step** with toggleable cards:
- **Home Delivery** — flat $299 within ON.
- **Extended Warranty (BridgeWarranty)** — Powertrain / Comprehensive / Premium tiers. Note "Powered by BridgeWarranty — final terms set at signing." (UI placeholder; real API deferred.)
- **Paint Protection Film (PPF)** — Partial Front / Full Front / Full Body.
- **Ceramic Coating** — 1yr / 5yr / Lifetime.

Selected add-ons roll into pricing, Bill of Sale, and PDF.

### 14. Reorder checkout: e-transfer is the LAST signed step
The current flow ends with deposit-then-sign. New flow puts the e-transfer at the end, after every document is reviewed and signed:

```text
1. Your details          (first / middle / last name, address, DOB)
2. Driver's licence      (front + back upload)
3. Add-ons               (delivery / warranty / PPF / ceramic)
4. CARFAX review         (NEW — open the report, "Initial here" pad,
                          checkbox "I have reviewed the CARFAX")
5. Bill of Sale          (read full doc, type + draw signature, agree)
6. 30-Day Dealer         (read full policy, type + draw signature, agree)
   Guarantee
7. Deposit terms         (acknowledge $1,000 non-refundable + dealer
                          discretion clause)
8. Send e-transfer       (shown only once 1–7 are complete; reveals
                          recipient email, password, memo with order ID,
                          "I have sent the e-transfer" confirmation)
9. Confirmation          (digital Bill of Sale ready — print / save / PDF)
```

Implementation:
- Reorder the `STEPS` array in `src/routes/checkout.$vehicleId.tsx`.
- Add a new `StepCarfaxReview` component (renders the same `CarfaxDialog` content inline, plus a small `SignaturePad` for an initial and an agreement checkbox; gates on initial + checkbox).
- Move `StepEtransfer` to the second-to-last position. Its "Submit sale request" button is what creates the order (instead of the current behavior where finalize fires after signing the Dealer Guarantee).
- `finalize()` now runs from the e-transfer step. Add `carfaxInitial` (data URL) and `carfaxAcknowledgedAt` to the `Order` type and persist them.
- Update the stepper labels and the summary sidebar's progress copy.

### Out of scope
- Real document OCR / identity verification (UI-only state machine with manual upload checkboxes).
- Real auth/account-type system — represented by a demo top-bar switcher.
- Live BridgeWarranty quote API (placeholder pricing only).
- Real per-vehicle CARFAX PDFs (sample placeholder remains until real reports are supplied).

