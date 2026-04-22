

## Plan: Real BridgeWarranty checkout integration (driven by your Bridge Warranty Planner project)

### What I found in your other project
**Project: "Bridge Warranty Planner"** (`8298ebe6-...`) is the source of truth. It contains:
- **`src/data/warrantyPlans.ts`** — full A-Protect V25 brochure: Powertrain (Bronze/Silver/Gold/Platinum), Essential, Premium Special, Luxury, Diamond Plus, Driver, Pro, Top Up. Each plan has terms (3–84 mo), claim limits ($750–$20,000), deductibles, base prices, mileage bands, add-ons (Unlimited km, Zero Deductible, Seals & Gaskets, Car Rental), premium-vehicle fees, coverage categories, benefits.
- **`src/data/tireRimPlans.ts`** — Essential / Extended / Superior tiers, by vehicle Class 1/2/3, 24–84 months.
- **`src/data/coverageMatrix.ts`** — full coverage comparison matrix.
- **`src/lib/eligibility.ts`** — real eligibility engine (vehicle age + km + make → which plans qualify, with reasons).
- **Supabase backend** (`products`, `dealership_product_pricing` tables) with dealership retail-price overlay.

### Approach
Treat Bridge Warranty Planner as the **brochure / catalog** and EDC's checkout as the **buyer**. Two integration modes, layered:

- **Phase 1 (this turn): Static import.** Copy the A-Protect plan data, eligibility engine, coverage matrix, and tire-rim plans from the other project into EDC. No backend dependency, works immediately.
- **Phase 2 (optional, after you confirm): Live API.** Add a `bridgewarranty_planner_url` env var and call its Supabase `products` table directly (or a thin server function) so plan/price edits in Bridge Warranty Planner reflect live in EDC checkout. Requires enabling Lovable Cloud on EDC.

I recommend doing Phase 1 now and asking you about Phase 2 after you see it working.

### Phase 1 changes

#### 1. Copy data + logic from Bridge Warranty Planner
New folder `src/lib/bridgewarranty/`:
- `plans.ts` — full `warrantyPlans` array (A-Protect V25, all tiers).
- `tire-rim.ts` — `tireRimTiers`, `vehicleClasses`, `coveredServices`.
- `coverage-matrix.ts` — `PLAN_COLUMNS` + `coverageMatrix`.
- `eligibility.ts` — `checkAllPlanEligibility(year, km, make, model)` returning eligible plans + reasons.
- `pricing.ts` — `quote(plan, term, addOns, premiumVehicle)` → `{ basePrice, addOnTotal, premiumFee, total, monthly }`.
- `terms.ts` — `GENERAL_TERMS`, `GENERAL_EXCLUSIONS`, `WAITING_PERIOD`, `COVERAGE_TERRITORY`.

#### 2. Replace the warranty tile in checkout with a real "Extended Warranty" step
In `src/routes/checkout.$vehicleId.tsx`, the existing single Add-ons step splits into:
- **Step: Extended Warranty (BridgeWarranty)** — new, dedicated step before the existing Add-ons step.
- **Step: Other Add-ons** — keeps Delivery, PPF, Ceramic Coating only (warranty options removed from `ADDONS`).

The new warranty step UI:
1. **Eligibility banner** at top reading the vehicle's `year`, `mileage`, `make`. Calls `checkAllPlanEligibility`. Shows "✓ Eligible for 6 plans" with a "Why are some unavailable?" disclosure listing ineligible plans + reasons (e.g. "Diamond Plus — vehicle must be 7 years or newer").
2. **Plan picker** — cards for each eligible plan, grouped (Powertrain has Bronze/Silver/Gold/Platinum sub-tabs, like the brochure). Each card: name, claim limit, included coverage chips, deductible, premium-vehicle warning if applicable, "View full coverage" → modal with `coverageDetails` and `benefits`.
3. **Term selector** — segmented buttons sourced from the selected plan's `terms` (3 mo / 6 mo / 12 mo / 24 mo / 36 mo …). Price recalculates live.
4. **Add-on toggles** (per plan): Unlimited km, Zero Deductible, Seals & Gaskets, Car Rental — each pulled from the plan's `rows` so n/a entries are auto-disabled.
5. **Coverage comparison link** — opens the full A-Protect coverage matrix as a modal.
6. **Quote summary** — base + add-ons + premium-vehicle fee (auto-applied for BMW/Mercedes/Audi/Tesla/etc. via `isPremiumVehicle`) + tax → total. Also shows monthly equivalent (total / months).
7. **"Decline coverage"** option that records a `warrantyDeclined: true` on the order.

#### 3. Tire & Rim — second optional product in same step
Below the warranty card, a collapsible "Add Tire & Rim Protection" using `tireRimTiers` (Class auto-detected from vehicle make via `vehicleClasses`). Same shape: tier picker + term selector + price.

#### 4. Order model + documents
In `src/lib/orders.ts`:
- Replace the three hard-coded warranty entries in `ADDONS` with two new structured fields on the `Order`:
  ```
  warranty?: {
    planSlug, planName, termMonths, termKm,
    deductible, claimLimit, addOns: string[],
    premiumVehicleFee, basePrice, total, contractNumber
  }
  tireRim?: { tier, termMonths, vehicleClass, total }
  ```
- `computePricing()` adds `warranty.total + tireRim.total` to the taxable subtotal alongside other add-ons.

In `src/lib/bill-of-sale.tsx` and `src/lib/pdf-generator.ts`:
- Render a dedicated **"Vehicle Service Contract — A-Protect via BridgeWarranty"** block listing plan name, term, km cap, deductible, claim limit, selected add-ons, contract # (auto-generated `BW-YYYYMMDD-XXXX`), and price.
- Render a separate **"Tire & Rim Protection"** line if selected.
- Add a checkbox at the bottom of the warranty step: *"I've reviewed the A-Protect terms, exclusions, and 30-day / 1,000 km waiting period"* — required to advance, and the acknowledged-at timestamp is stored on the order and printed on the contract.

#### 5. Stepper + summary sidebar
Update the 9-step flow to 10 steps:
1. Details → 2. Licence → 3. **Warranty (new)** → 4. Add-ons → 5. CARFAX → 6. Bill of Sale → 7. Dealer Guarantee → 8. Deposit terms → 9. E-transfer → 10. Confirmation.

Sidebar shows selected plan + term + price under "Coverage" so the buyer always sees what they've added.

#### 6. Public BridgeWarranty page on EDC marketing site
New route `src/routes/warranty.tsx` that mirrors the brochure: plan comparison matrix, "Get a quote for your car" form (year/km/make), and CTA to "Add to your purchase at checkout". Linked from the marketing header and from each vehicle detail page.

#### 7. Quiet fix
The hydration mismatch on `SummarySidebar` order ID (`ORD-...UE7V` vs `...8SFX`) — wrap that badge in `suppressHydrationWarning` and only generate the ID inside `useEffect`.

### Phase 2 (separate turn, only if you want live sync)
- Enable Lovable Cloud on EDC (this project currently has no backend).
- Add a server function `getWarrantyPlans()` that reads from the same Supabase project as Bridge Warranty Planner using its URL + anon key (stored as secrets `BRIDGEWARRANTY_SUPABASE_URL`, `BRIDGEWARRANTY_SUPABASE_ANON_KEY`).
- Switch `src/lib/bridgewarranty/plans.ts` to fetch live products via `productService.dbToDisplay`, falling back to the static import if the network call fails.
- This way price/plan edits in your Bridge Warranty Planner admin UI immediately reflect on EDC checkout.

### Out of scope
- Real contract issuance to A-Protect / BridgeWarranty (the contract # we generate is internal until your Bridge Warranty Planner has an issuance API).
- Provider claim lookups, claim filing UI.
- Dealership-specific retail-price overlay (Bridge Warranty Planner has it; bringing it over needs Phase 2).
- Editing plans from inside EDC (those still live in Bridge Warranty Planner).

