

## Clone of EasyDriveCanada — Marketing Site + DMS Dashboard

I'll rebuild EasyDrive Canada as two connected experiences: a public marketing site, and a logged-in Dealer Management System (DMS) matching the screenshot. All visual mockup, mock data only — no real auth or database.

### Public marketing routes
- `/` — Home: hero, trust badges, featured vehicles, "Why EasyDrive", how it works, EasyDrive Promise, FAQ, CTA
- `/inventory` — Vehicle grid with filter sidebar (make, price, year, body type)
- `/inventory/$vehicleId` — Vehicle detail: gallery, specs, financing calculator
- `/financing` — Pre-approval form
- `/contact` — Contact form
- `/login` — Fake login screen ("Sign in as Dealer" button → `/dealer`)

Shared marketing header (EDC logo, nav, "Get Pre-Approved" CTA) and footer.

### DMS dashboard routes (dealer layout with sidebar)
Layout route `/dealer` provides the dark navy sidebar from the screenshot + light content area with Outlet.

- `/dealer` — Home: KPI cards (inventory count, leads, sales MTD, revenue), recent activity, charts
- `/dealer/leads` — Leads table (name, vehicle interest, status, source, date) + detail drawer
- `/dealer/customers` — Customer list with search + profile drawer
- `/dealer/vendors` — Vendor directory
- `/dealer/marketplace` — Marketplace listings grid
- `/dealer/inventory` — **Matches the screenshot exactly**: tabs (All / Premier / Fleet), search bar, status filter, full table with Description, Trim, Vehicle Type, Drive, Transmission, Cylinders, Colour, Odometer, Cash Value, List Price, Sale Price, DII, Stock #, Key #, Cert/AS-IS, Status badges (In Stock / Deal Pending / Sold), Import File + Add Vehicle buttons
- `/dealer/sales` — Sales pipeline + bill of sale list
- `/dealer/sales/new` — Bill of Sale builder form (customer, vehicle, pricing breakdown, taxes, fees, trade-in, financing)
- `/dealer/esignature` — E-signature documents list
- `/dealer/reports` — Reports: expenses, profit/loss, inventory aging (recharts)
- `/dealer/billing` — Subscription plan (Premier shown), invoices
- `/dealer/directory` — Employees: list, add/remove, role assignment

### Design

**Marketing site** — Light theme, navy `#0a1628` primary, blue `#3b9eff` accent, large bold headings, rounded pill CTAs, Lucide icons.

**DMS** — Matches screenshot:
- Dark navy sidebar (`#0a1628`) with EDC logo top, profile icon, white nav items with blue active state
- Light gray-50 main content with white cards
- Page header pattern: large bold title + subtitle on left, action buttons on right
- Pill tab filters (active = dark navy filled)
- Data tables with subtle row dividers, status badges (green In Stock, orange Deal Pending, gray Sold)
- Collapsible sidebar (shadcn sidebar component, `collapsible="icon"`)

### Mock data (`src/data/`)
- `vehicles.ts` — 12 vehicles matching screenshot fields (year, make, model, trim, type, drive, transmission, cylinders, colour, odometer, prices, stock #, status)
- `leads.ts` — 15 leads
- `customers.ts` — 10 customers
- `sales.ts` — 8 bills of sale
- `employees.ts` — 5 employees with roles
- `vendors.ts` — 6 vendors

### Technical notes
- TanStack Start file-based routing; `dealer.tsx` is a layout route with `<Outlet />` and the sidebar
- shadcn `Sidebar` with `SidebarProvider`, collapsible icon mode, NavLink-style active state via TanStack `<Link activeProps>`
- All forms (login, pre-approval, bill of sale, add vehicle) UI-only — submit shows toast, no persistence
- Each route has its own `head()` meta (title, description, og)
- Charts via `recharts` (already in shadcn chart.tsx)
- Vehicle images from Unsplash

### Not included
- Real authentication or session — `/login` just navigates to `/dealer`
- Real database / persistence — adding/editing data won't survive refresh
- Real document signing, payments, or external integrations

