

## Plan: Public BridgeWarranty browsing before checkout

Right now A-Protect plans are only visible inside the checkout flow. I'll add three public surfaces so shoppers (and anyone you share a link with) can review pricing, coverage, and the brochure before committing to a vehicle.

### 1. New `/warranty` marketing route
File: `src/routes/warranty.tsx`. Public page mirroring the BridgeWarranty / A-Protect brochure, built from the data already in `src/lib/bridgewarranty/`:

- **Hero**: "A‑Protect Vehicle Service Contracts — by BridgeWarranty" + intent statement, CTA "Get a quote for your car" (anchors to the quote form below).
- **Plan grid**: cards for every plan in `warrantyPlans` (Powertrain Bronze/Silver/Gold/Platinum, Essential, Premium Special, Luxury, Diamond Plus, Driver, Pro, Top Up) — claim limit, deductible, included coverage chips, sample term, "View full coverage" → modal showing `coverageDetails` + `benefits`.
- **Coverage matrix**: full `coverageMatrix` rendered as a comparison table (sticky header row + first column on mobile).
- **Quote form** (no checkout commit): year / mileage / make / model inputs → calls `checkAllPlanEligibility` + `quoteWarranty` and shows eligible plans with live prices, term selector, and add-on toggles (Unlimited km, Zero Deductible, Seals & Gaskets, Car Rental). Identical pricing math as the checkout step.
- **CTA at the bottom of each quoted plan**: "Add this coverage at checkout" → deep-links into `/inventory` (or back to the vehicle page if they came from one) with the chosen plan slug + term + add-ons preserved in URL search params.
- **FAQ + waiting period block** using `WAITING_PERIOD`, `GENERAL_TERMS`, `GENERAL_EXCLUSIONS`, coverage territory.
- **Brochure download**: "Download A‑Protect brochure (PDF)" button — generates a client-side PDF from the same data via the existing `pdf-generator` utility (no new asset required).

### 2. Header + footer links
- `MarketingHeader.tsx`: add **Warranty** between "Financing" and "Sell".
- `MarketingFooter.tsx`: add **Extended Warranty** under the Shop column.

### 3. Vehicle detail page integration
In `src/routes/inventory.$vehicleId.tsx`, below the price block, add a **"BridgeWarranty coverage available"** card:
- Runs `checkAllPlanEligibility` for that vehicle and shows "Eligible for N plans, from $X/mo".
- Two buttons: "View plans for this vehicle" → `/warranty?year=…&km=…&make=…&model=…` (form pre-fills) and "Add at checkout" → existing `/checkout/$vehicleId` flow which jumps straight to the warranty step.

### 4. Pre-fill the checkout warranty step from URL
`checkout.$vehicleId.tsx`: read `?warrantyPlan=…&warrantyTerm=…&warrantyAddOns=…` search params and seed `warrantySelection` so a shopper who quoted on `/warranty` lands in checkout with their plan already chosen.

### Out of scope
- A real downloadable PDF brochure file from BridgeWarranty (we generate ours from the in-app catalog).
- Saving quotes to an account (no backend yet — quote stays in URL/local state).
- Tire & Rim browsing surface (can mirror this pattern in a follow-up).

