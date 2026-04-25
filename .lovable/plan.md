## Plan: Fix current errors and finish the dealer workflow

### 1. Fix the immediate page crashes
The Sales page and Sell My Car page are both hitting the same React store issue: a `useSyncExternalStore` snapshot returns a fresh object/array repeatedly.

I will fix:
- `src/routes/dealer.sales.index.tsx`: replace the local uncached `useOrders()` with the cached order subscription already built in `dealer-notifications`, or add the same stable cache there.
- `src/lib/account.ts`: cache private-seller verification snapshots so `/sell` stops crashing.
- Check `orders.$orderId.tsx` for the same pattern and stabilize it if needed.

### 2. Make inventory manageable
Upgrade `/dealer/inventory` from a read-only table to a basic working inventory manager:
- Multi-select rows with checkboxes.
- Bulk delete selected vehicles.
- Edit vehicle details in a dialog/drawer: price, status, stock/key number, VIN, mileage, certification, listing type, seller, description, features, images/URLs.
- Add vehicle flow using the same editor.
- Persist inventory changes in localStorage so edited/deleted/added vehicles continue to appear in inventory and marketplace during the demo.
- Keep the marketplace (`Shop Cars`) reading the same inventory source so dealer inventory changes push into public listings.

### 3. Expand Configuration for warranties and products
The current Configuration section supports BridgeWarranty pricing overrides and add-on products, but not full warranty-company/plan creation. I will extend it so you can:
- Add/edit warranty companies/providers.
- Add/edit warranty plan names.
- Add/edit tiers, coverage rows, terms, cost prices, and retail prices/markups.
- Hide/show each plan for customers.
- Keep customer-visible pricing as retail only; costs stay dealer-side.
- Keep the current BridgeWarranty/A-Protect catalog as a seeded default.

### 4. Wire configurable pricing everywhere customers see it
Ensure public/customer flows always use configured retail pricing:
- `/warranty` page.
- Checkout warranty step.
- Checkout add-ons/products step.
- Manual bill-of-sale product/warranty pickers.

### 5. Improve Sales / Deals flow for online and manual deals
Make online self-checkout orders show as dealer deals/sale requests without crashing:
- Show online checkout requests in Sales.
- Add clear “Online Sale” status/badges.
- Keep notifications for new customer checkout orders.
- Add a path to view the customer order and start dealer-side processing.
- Keep manual Bills of Sale separate but visible in the same Sales area.

### 6. Add a digital Bill of Sale preview
Add a “Preview digital bill of sale” surface so you can see what the document looks like before e-signature:
- From Sales/new bill of sale: preview panel or modal.
- From online sale request: view generated bill of sale using the customer/order data.
- Include seller, one or more buyers if available, vehicle, trade-in placeholder section, products/warranty, fees, taxes, total, disclosures, and signature blocks.

### 7. Run a whole-site smoke test
After implementation I will check core routes for runtime errors:
- Home, Shop Cars, vehicle details, checkout, warranty, sell, contact, login.
- Dealer: home, leads, customers, vendors, marketplace, inventory, sales, e-signature, reports, billing, directory, configuration.
- Verify console errors are cleared for the pages that currently crash.

### Technical notes
- This project currently uses frontend/localStorage demo persistence, so I will keep changes consistent with that approach rather than introducing a backend in this pass.
- I will avoid editing `src/routeTree.gen.ts`; route generation should be handled by TanStack Router tooling.
- The immediate priority is to stabilize the broken pages first, then add the requested management features.