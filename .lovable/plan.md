## Wavelength Infratech — Internal ERP (Iteration 1: Foundation)

This iteration delivers the **portfolio website + secure login + role hierarchy + Admin Pricing Master with live calculators**. Operations modules (GPS attendance, PR/PO/GRN, DPR, 3-way match, offline sync) come in iteration 2 once the foundation is solid.

> Decision needed: Iteration 1 assumes the existing SaaS landing page is **replaced** with a Wavelength Infratech company portfolio. If you'd rather keep the SaaS site too, say "keep landing, add /portal" before we start.

---

### What you'll get

**1. Public-facing portfolio (`/`)**
- Hero — "Wavelength Infratech: Construction · Design Studio · Elevation · Planning"
- Services section (4 cards: Construction, Design Studio, Elevation, Planning)
- Active Projects gallery (MP + Dholera sites placeholder)
- About + Contact
- **Logo fixed top-right** on every page (replaces current top-left placement)
- "Staff Login" CTA top-right next to logo

**2. Authentication (Lovable Cloud)**
- Email + password sign-in (Google sign-in optional — say if you want it)
- `/auth` page (login + signup)
- `/reset-password` page
- Auto-redirect to role-based dashboard after login
- Session persistence with `onAuthStateChange`

**3. Role hierarchy (5 roles, secure)**
Stored in a separate `user_roles` table (never on profiles — prevents privilege escalation):
- `main_admin` — Owner / Pricing Master / P&L / Approvals
- `contractor` — Site management, material requests, DPR
- `subcontractor` — Worker GPS attendance, task logs
- `mistri` — Daily material consumption logs
- `labour` — Own attendance + payment status

`profiles` table holds name, phone, assigned site. `has_role(uid, role)` security-definer function powers all RLS policies.

**4. Role-based dashboards (`/portal/*`)**
Each role lands on its own dashboard with the **logo fixed top-right** and a sidebar showing only what that role can access:
- **Main Admin** — Pricing Master (full CRUD), all-site P&L summary (placeholder cards), pending approvals queue, user management
- **Contractor** — My sites, material request button, DPR entry shortcut, today's hazri
- **Subcontractor** — Today's workers, GPS attendance punch (UI only this iteration), task list
- **Mistri** — "Aaj ka material kharcha" entry form
- **Labour** — My attendance calendar, payment status card

Iteration 1 ships the **shells with role-correct navigation and the Pricing Master fully wired**. Operations forms get real backend logic in iteration 2.

**5. Admin Pricing Master (the core of this iteration)**
A real, working dashboard for Main Admin:
- Categories: Tiles, Paint, Cement, Steel, Sand, Aggregate, Labour rates, Misc
- Each item: name, unit (sqft / litre / kg / bag / day), rate, vendor, last updated, updated_by
- Inline edit, search, filter by category
- Audit log: every rate change records old → new value + admin id + timestamp
- Items table seeded with examples (Vitrified Tiles ₹100/sqft, JSW Primer ₹125/L, OPC Cement ₹380/bag, Mason ₹800/day, etc.)

**6. Smart Calculators (public + internal)**
Three calculators that **fetch live rates from the Pricing Master** — Admin updates ₹100 → ₹110, every estimate across MP & Dholera updates instantly:
- **Tile Calculator** — area (sqft) × rate + wastage % + labour
- **Paint Calculator** — wall area × coats ÷ coverage × rate + primer + labour
- **Labour Cost Calculator** — trade × workers × days × daily rate
Each shows live total + a "Save estimate to project" button (visible only when logged in).

**7. Branding everywhere**
- Logo top-right on portfolio, portal, auth pages
- PDF/report generation: when added (iteration 2), every report header places logo top-right by default

---

### Technical details

**Database (Lovable Cloud / Postgres)**
```text
profiles (id PK = auth.users.id, full_name, phone, assigned_site, created_at)
app_role enum: 'main_admin' | 'contractor' | 'subcontractor' | 'mistri' | 'labour'
user_roles (id, user_id FK auth.users, role app_role, unique(user_id, role))
pricing_categories (id, name, sort_order)
pricing_items (id, category_id FK, name, unit, rate numeric, vendor, updated_by FK, updated_at)
pricing_audit_log (id, item_id FK, old_rate, new_rate, changed_by FK, changed_at)
projects (id, name, location, status, created_at) -- seed MP + Dholera
estimates (id, project_id FK, type, payload jsonb, total numeric, created_by FK, created_at)
```

**Security**
- RLS on every table
- `public.has_role(_user_id uuid, _role app_role)` SECURITY DEFINER function
- Pricing read: any authenticated user. Pricing write: `has_role(auth.uid(), 'main_admin')` only
- Audit log: insert via trigger on `pricing_items` UPDATE
- Profiles auto-created via `handle_new_user` trigger on `auth.users` insert
- First signed-up user auto-assigned `main_admin`; subsequent signups default to `labour` and Admin promotes from User Management screen

**Routing**
```text
/                    → Portfolio (public)
/services, /projects, /about, /contact (public sections or routes)
/auth                → Login + Signup
/reset-password      → Password reset form
/portal              → Auto-redirects to /portal/<role-home>
/portal/admin/*      → Pricing Master, Users, P&L (gated by main_admin)
/portal/contractor/* (gated)
/portal/subcontractor/*, /portal/mistri/*, /portal/labour/* (gated)
/calculators/tiles, /paint, /labour  (public, save needs auth)
```

**Components**
- `<AppLogo position="top-right" />` shared across portal + portfolio + report templates
- `<RoleGate allow={['main_admin']}>` route wrapper
- `<RateInput itemId>` reads + edits live rate via React Query
- React Query for all data, optimistic updates on rate edits

**Out of scope this iteration** (planned for iteration 2):
- GPS-fenced attendance with geolocation
- PR → PO → GRN procurement workflow + 3-way match
- DPR with photo upload + WhatsApp auto-report
- Offline-first sync (service worker + IndexedDB)
- PDF report generation with logo
- Live P&L calculations from real cost data

---

### Current code we're replacing / keeping

- **Replace**: SaaS landing sections (`Hero`, `Modules`, `Pricing`, `AIEdge`, `ArchitectureDocs`, `TechStack`, `LogicFlow`, `UserFlows`, `TrustBar`, `FinalCTA`) → new portfolio sections
- **Keep**: design system in `index.css` (teal + charcoal works perfectly), Button variants, all shadcn/ui primitives, logo asset
- **Update**: `SiteHeader` → logo moves top-right, add Staff Login button
- **Add**: Lovable Cloud (auth + Postgres), new `/portal` shell, Pricing Master, calculators

---

### After iteration 1, you can immediately

1. Sign up as Main Admin
2. Add/edit rates in Pricing Master (e.g. change Tiles from ₹100 → ₹110)
3. Open the public Tile Calculator and see the new rate flow through instantly
4. Invite contractors/labour and assign roles
5. See the role-gated dashboard shells ready for iteration 2 to fill in

Approve to proceed, or tell me what to change (e.g. "keep SaaS landing too", "skip portfolio, just build the portal", "add Google sign-in").