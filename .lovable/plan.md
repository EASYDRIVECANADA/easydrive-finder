
## Fix plan: inventory cards navigate, but the detail page never renders

### What is happening
The click itself is working. The URL changes to `/inventory/v-002`, but the app still shows the inventory grid.

### Exact problem
`/inventory/$vehicleId` is currently registered as a child route of `/inventory`, and `src/routes/inventory.tsx` is acting like a full page instead of a layout route. Because that parent route does not render an `<Outlet />`, TanStack Router matches the child URL but only displays the parent inventory page.

### Files involved
- `src/routes/inventory.tsx`
- `src/routes/inventory.$vehicleId.tsx`
- `src/components/marketing/VehicleCard.tsx`
- `src/routeTree.gen.ts` (auto-generated, should update automatically after route changes)

### Implementation plan
1. Convert the inventory route structure into the correct parent + index pattern:
   - make `src/routes/inventory.tsx` the shared layout route for inventory pages
   - move the current inventory listing page UI into a new `src/routes/inventory.index.tsx`

2. Update the new inventory layout route so it renders:
   - `MarketingHeader`
   - `<Outlet />`
   - `MarketingFooter`

3. Keep the current vehicle detail page in `src/routes/inventory.$vehicleId.tsx` as the child route under that layout, so `/inventory/:vehicleId` renders the listing detail content inside the shared shell.

4. Preserve the existing inventory list UI exactly as-is inside `inventory.index.tsx`:
   - search
   - filters
   - sliders
   - vehicle grid
   - `VehicleCard` links

5. Leave `VehicleCard` links pointing to `/inventory/$vehicleId`, since the link is already correct.

6. Verify the listing detail route still uses its loader, notFound state, and action buttons:
   - CARFAX
   - disclosure
   - ask question
   - checkout CTA

### Validation steps
1. Open `/inventory`
2. Click any card
3. Confirm the app renders the actual vehicle detail page instead of the inventory grid
4. Confirm breadcrumbs and pricing/actions appear
5. Click “Buy Online — $500 Deposit”
6. Confirm checkout opens at `/checkout/{vehicleId}`
7. Confirm back-navigation to inventory still works

### Technical note
This is a TanStack file-based routing issue, not a broken link. In the generated route tree, `/inventory/$vehicleId` is nested under `/inventory`, so the parent must behave like a layout route and render an `<Outlet />`. Without that, child URLs resolve but never display their child component.
