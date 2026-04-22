

## Capture the real DMS and rebuild to match

Since you own the site, we can pull the actual logged-in DMS UI and use it as the spec instead of guessing from one screenshot.

### Step 1 — You provide access (one of these)

Pick whichever is easiest:

- **A. Credentials**: Paste a dealer login (email + password) into the chat. I'll use the browser tool to log in at easydrivecanada.com, walk every DMS screen, and screenshot each one. Recommended: create a temporary throwaway account with demo data, not your real admin.
- **B. You drive, I watch**: Record a 3–5 min screen recording (Loom, QuickTime, etc.) clicking through every DMS tab — Inventory (incl. add/edit vehicle modal), Leads detail, Customers, Bill of Sale builder (every step), E-Signature, Reports, Billing, Directory, Vendors, Marketplace. Upload it here.
- **C. Screenshot pack**: Take full-page screenshots of each DMS screen + every modal/drawer (add vehicle, lead detail, BoS step 1/2/3, etc.) and upload them as a batch.

Option A is fastest and most thorough. B is best for capturing interactions/flows. C is fine if you only care about static layouts.

### Step 2 — I capture and catalog (only if option A)

Using the browser tool, I will:
1. Navigate to easydrivecanada.com, log in with your credentials.
2. Visit each DMS route, take a full-page screenshot at 1440×900.
3. Open every "Add", "Edit", "New" modal/drawer and screenshot each.
4. For tables, capture column headers, sample rows, filter chips, status badges, action menus.
5. Save all screenshots to `/mnt/documents/edc-capture/` so you have the reference set too.
6. Log out, clear session.

I will NOT: change any data, click destructive actions (delete, archive, send), submit forms, or touch billing/payment screens beyond viewing.

### Step 3 — Rebuild each screen to match

For each captured screen, I'll update the corresponding `/dealer/*` route to match the real layout:
- Exact column order, labels, widths
- Real field names in forms (Bill of Sale especially — taxes, fees, trade-in, lien payout fields)
- Correct status badge colors and labels
- Modal/drawer structures and field groupings
- Sidebar nav order, icons, section grouping
- Branding: real EDC logo, exact navy/blue values, fonts

Mock data stays mock — only the UI structure changes to mirror the real product.

### Step 4 — Diff review

I'll post before/after screenshots (current clone vs. real DMS vs. updated clone) so you can confirm fidelity per screen.

### What I need from you to start

Reply with:
1. Which option (A, B, or C)
2. If A: the login URL + credentials (and confirmation it's a safe-to-use account)
3. Any screens to skip or prioritize

### Security notes

- Credentials pasted in chat are visible in the conversation history. After capture, rotate the password.
- I'll use a fresh browser session, won't save cookies, and won't reuse the login outside this task.
- If the site has 2FA, option A won't work — use B or C.

