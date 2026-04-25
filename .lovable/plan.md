## Plan: Dealer-controlled warranty pricing + add-on catalog, online-sale visibility, header polish

Three connected pieces. Frontend-only — pricing/catalog overrides persist in `localStorage` so they survive refreshes. When you later wire a real backend, only the storage layer changes.

---

### 1) Header rename + small UX
- `MarketingHeader.tsx`: change **"Dealer Login"** → **"Login"** (desktop + mobile menus). Same destination (`/login`).

---

### 2) Online customer checkouts surface as Deals + dealer notification

The customer checkout already writes to the `Order` store (`src/lib/orders.ts`) and the "Sale requests" tab on `/dealer/sales` already lists them (line 72–85 of `dealer.sales.index.tsx`). What's missing is making them feel like real deals + a notification.

- **`/dealer/sales` ("Sale requests" tab)** — keep, but:
  - Add an **"Online"** badge + "Sold by customer" tag on each request card so dealers can tell self-checkout apart from manual BoS.
  - Add a **"Convert to Bill of Sale"** action that pre-fills `/dealer/sales/new` with the order's customer, vehicle, pricing lines, warranty selection, and add-ons (via search params + a `draftOrderId` lookup) so the dealer keeps one paper trail per sale.
- **Dealer Home (`/dealer`)** — add a small "New online sale requests (N)" alert card linking to `/dealer/sales?tab=requests` whenever there are un-actioned `deposit_pending` orders.
- **Header bell on `DealerSidebar` / dealer top bar** — small notification dot driven by the same count (uses the existing `edc.orders.updated` event already dispatched in `orders.ts`, so it updates live across tabs).
- **Toast on new order** — when a new order with `createdAt` newer than the dealer's last-seen timestamp shows up, fire a `sonner` toast ("New online sale request — 2023 Tesla Model 3"). Last-seen stamp stored in `localStorage` so it doesn't re-toast on refresh.

> Real email/SMS notifications need a backend; this gives in-app dealer notification today and is the natural place to plug a webhook later.

---

### 3) Dealer Configuration — warranty + add-on catalog with retail markup

This is the heart of the request. Adds a configurable layer on top of the BridgeWarranty cost catalog and the existing add-ons, mirroring the Bridge Warranty Planner UX you screenshotted (provider → plan → tier → term grid with bulk markup + per-cell override).

#### 3a) Sidebar
- `DealerSidebar.tsx`: add **Configuration** entry (icon: `Settings2`) below **Directory**, route `/dealer/configuration`.

#### 3b) New data layer — `src/lib/dealer-config.ts`
A single localStorage-backed store (key `edc.dealerConfig.v1`) with:
```ts
type RetailOverride = { cost: number; retail: number | null };  // null = use markup default
type DealerConfig = {
  warrantyMarkupPct: number;                        // global default, e.g. 40
  showRetailToCustomers: boolean;                   // matches the BWP toggle
  warranty: {
    [providerSlug: string]: {
      enabled: boolean;
      plans: {
        [planSlug: string]: {
          enabled: boolean;
          tiers: {
            [tierIndex: number]: {
              base: RetailOverride[];               // per term column
              addOns: { [rowLabel: string]: RetailOverride[] };  // Unlimited km, Zero Deductible…
            }
          }
        }
      }
    }
  };
  tireRim: { /* same shape, keyed by tier slug + class */ };
  addOnCatalog: AddOn[];   // overrides/extends ADDONS from src/lib/orders.ts
};
```
Helpers: `getRetailFor(plan, tier, termIdx, row)`, `setRetail(...)`, `setBulkMarkup(...)`, `applyToAll(...)`, `resetCell(...)`. All emit a `edc.dealerConfig.updated` event so consumer pages re-render via `useSyncExternalStore`.

#### 3c) New route — `src/routes/dealer.configuration.tsx`
Three tabs:

1. **Warranty plans** — Bridge Warranty Planner style:
   - Left rail: **Providers** list (today only "A‑Protect / BridgeWarranty"; UI ready for adding more later via "+ Add provider" stub).
   - Click provider → list of plans (driven by `warrantyPlans` in `src/lib/bridgewarranty/plans.ts`) with per-plan **Enabled** toggle (controls visibility on `/warranty` and in customer checkout).
   - Click plan → tier tabs (Bronze/Silver/Gold/etc.) → term grid identical to your screenshot:
     - Header row: each `term.label` from the plan's `pricingTiers[t].terms`.
     - Body rows: every entry in `pricingTiers[t].rows` (Base Price, Unlimited km, Zero Deductible, Seals & Gaskets, Car Rental, etc.).
     - Each cell shows **Cost $X** (from the catalog) and below it the **Retail** in bold; pencil to edit, ✕ to clear back to the markup default. Suggested retail (cost × (1 + markup)) shown in italic grey when no override is set.
     - Toolbar: **Bulk markup %** input + **Apply to all** + **Fill empty** (only fills cells without an explicit override) + global **Show retail to customers** toggle.
2. **Add-on products** — reads `ADDONS` from `src/lib/orders.ts` as the seed catalog. For each item: enabled toggle, label, description, **cost** (informational), **retail** (what the customer sees), taxable flag. **+ Add product** to add new dealer-defined items (e.g. nitrogen fill, winter mats). Items added here become available in the manual Bill of Sale builder and — if `customerVisible: true` — in the public checkout add-ons step.
3. **Defaults** — global markup, "show retail to customers" master toggle, default tax behaviour for new products.

#### 3d) Wiring retail prices into customer-facing surfaces
- `/warranty` (`src/routes/warranty.tsx`) and `StepWarranty` quote view: replace direct reads from `pricingTiers[].rows[].values` with `getRetailFor(...)` so customers always see dealer retail (or the markup default), never the raw cost. `eligibility.ts` / `index.ts` (`quoteWarranty`) need a thin override pass — they keep their math, just receive the dealer-resolved price per term/add-on.
- Plan tiles on `/warranty` honour the **Enabled** toggle from config.
- Customer checkout add-ons step (`checkout.$vehicleId.tsx`): pull from `dealerConfig.addOnCatalog` (filtered to `customerVisible`) instead of the static `ADDONS` constant.

#### 3e) Manual Bill of Sale gets a real product picker
`dealer.sales.new.tsx` currently only has price/trade-in/doc/licensing inputs (line 101–121). Add:
- **Add Warranty** button → modal that runs the same eligibility + quote engine and lets the dealer pick plan/tier/term/add-ons (using the **cost or retail** view, dealer choice).
- **Add Product** button → modal listing the configured add-on catalog (full list, not filtered to customer-visible) with quantity + price-override fields.
- Selected lines render in the Pricing section, recompute taxable base + total, and persist on the BoS draft.

---

### Files to add
- `src/lib/dealer-config.ts` — store + helpers
- `src/routes/dealer.configuration.tsx` — three-tab editor
- `src/components/dealer/configuration/WarrantyMatrix.tsx` — the term × add-on grid with edit/bulk markup
- `src/components/dealer/configuration/ProductCatalogEditor.tsx`
- `src/components/dealer/sales/AddWarrantyDialog.tsx`
- `src/components/dealer/sales/AddProductDialog.tsx`

### Files to edit
- `src/components/marketing/MarketingHeader.tsx` — "Dealer Login" → "Login"
- `src/components/dealer/DealerSidebar.tsx` — add Configuration item
- `src/routes/dealer.tsx` or `dealer.index.tsx` — online-sales alert card + notification dot
- `src/routes/dealer.sales.index.tsx` — "Online" badge, "Convert to Bill of Sale" action, toast on new orders
- `src/routes/dealer.sales.new.tsx` — product/warranty pickers + dynamic line items
- `src/routes/warranty.tsx` and `src/components/checkout/StepWarranty.tsx` — read prices through `getRetailFor`
- `src/routes/checkout.$vehicleId.tsx` — read add-on catalog from dealer config

### Out of scope (call out now)
- Real email/SMS notifications to the dealer (needs a backend).
- Multi-dealer roles/permissions (single dealer config for now).
- Persisting config to a database — purely localStorage until backend is added; the helper API is shaped so the swap is mechanical.
- Editing BridgeWarranty's underlying coverage text/exclusions (kept as the source of truth catalog; dealer only overrides pricing + visibility).
- Importing config from your separate Bridge Warranty Planner project — possible later via a JSON export/import button if helpful.
