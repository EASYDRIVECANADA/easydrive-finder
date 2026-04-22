

## Rebuild from EasyDriveCanada source code

If you can share the real codebase, I'll mirror its DMS structure into this clone exactly.

### What to share (best → acceptable)

1. **GitHub repo access** (best) — Add the Lovable GitHub app or invite a collaborator to a private repo. I can then read every file directly via `cross_project` tools or by you connecting it to a Lovable project I can read from.
2. **ZIP of the repo** — Export from GitHub (Code → Download ZIP) or your local folder, upload here. I'll unzip and read it.
3. **Netlify/Vercel build output** — Less useful (minified, no source). Only helpful if source is unavailable.
4. **Specific files pasted in chat** — Works for small targeted pieces (e.g. just the Bill of Sale component).

### What I'll extract from the source

- **Routes/pages**: full list of DMS screens and their URL structure
- **Components**: real component names, props, layout structure for Inventory table, BoS form, Reports, etc.
- **Forms**: exact field names, validation, step order (especially Bill of Sale)
- **Data models**: vehicle/customer/lead/sale shapes → update `src/data/*.ts` to match
- **Styling**: real color tokens, fonts, spacing, logo asset
- **Sidebar nav**: exact labels, icons, grouping, order

### What I'll do with it

1. Catalog every DMS route + its component tree.
2. Update `src/data/*.ts` mock data to match real schemas (same field names/types).
3. Rewrite each `/dealer/*` route file to mirror the real screen's layout, columns, form fields, and copy.
4. Update `DealerSidebar.tsx` nav to match real order/labels/icons.
5. Pull the real logo + color values into `EdcLogo.tsx` and `src/styles.css`.
6. Keep everything mock-only — no real API calls, no DB, no auth (per original plan).

### What I won't copy

- Backend/server code, API routes, database schemas, env files, secrets
- Auth logic (still mock login)
- Any proprietary integrations (payment processors, e-sign vendors, credit bureaus)
- License-restricted assets (only fonts/icons/images you have rights to)

### How to share

Pick one and tell me which:
- **A**: I'll add the Lovable GitHub app to the EDC repo (you give me the org/repo name once connected)
- **B**: You upload a ZIP of the repo to this chat
- **C**: You paste specific files (tell me which screens to prioritize)

Also confirm: any folders/files to skip (e.g. `/server`, `/api`, `.env*`, payment integration code)?

