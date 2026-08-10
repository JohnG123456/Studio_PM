# Studio PM

Platform of record for the 14 Contour Rd, Roleystone studio build: budget, build
stages, dependency chains, timeline, and the decisions log. Third piece of a
three-part system — see [Document Hierarchy](#document-hierarchy) below.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, matching the stack
of the sibling **Studio Inventory** app.

## Running it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. **Out of the box, with no setup, the app runs in
local demo mode**: data is stored in the browser's `localStorage`, pre-seeded
from the real Master Summary v14 and Clean_Budget_v7_4 documents — see
[Data sources](#data-sources). Do the Supabase setup below whenever you want
cross-device sync and live gear reconciliation with the Inventory app.

## Connecting cloud sync (Supabase) — same project as the Inventory app

This app is designed to share one Supabase project with the Studio Inventory
app: one login, one Postgres database, and gear-type items link live to the
Inventory app's real records instead of a manual export/import.

1. **Use the Inventory app's existing Supabase project** — don't create a new
   one. If you haven't set that up yet, do it first (see that repo's README).
2. **Run this app's schema.** In the Supabase dashboard, *SQL Editor → New
   query*, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This adds
   `project_items`, `decisions`, and `budget_lines` tables alongside the
   Inventory app's existing `items` table, with row-level security so each
   account only ever sees its own rows.
3. **Reuse the same API keys.** Copy `.env.example` to `.env.local` and fill
   in the same `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   you used for the Inventory app (Project Settings → API in the Supabase
   dashboard).
4. **Restart the app.** You'll see a sign-in/sign-up screen. Use the **same
   account** as your Inventory app — that's what makes gear-type items link
   live. First sign-in on a fresh account auto-seeds it with the real Master
   Summary v14 / Clean_Budget_v7_4 data, same as local mode.

Signing up creates a Supabase Auth user shared across both apps (same
`auth.users` table), so gear-type items here read the Inventory app's `items`
table directly and filtered to your account — see
*Settings → Inventory App Reconciliation*, which shows "live" status instead
of the manual JSON import/export flow local mode falls back to.

### Deploying it (Vercel)

1. Push this repo to GitHub (already done — `claude/project-brief-review-l9fivx`).
   Vercel's Production Branch defaults to `main`; this repo doesn't have one
   yet, so either merge this branch into `main` first, or point Vercel's
   Production Branch setting at this branch directly.
2. **Vercel dashboard → Add New → Project → Import Git Repository** → pick
   this repo. Framework (Next.js) is auto-detected, no build config needed.
3. Set the same two `NEXT_PUBLIC_SUPABASE_*` environment variables in the
   Vercel project's settings (Project Settings → Environment Variables).
   Without them, the deployed app runs in local-only mode.
4. Deploy. Every push to the connected branch redeploys automatically.

## Open questions from the handoff brief — resolved

**Storage format: JSON, either `localStorage` (default) or Supabase Postgres
(once connected).** Same dual-mode model as the Studio Inventory app —
`lib/data/DataProvider.tsx` picks the mode automatically based on whether
`NEXT_PUBLIC_SUPABASE_*` env vars are set. Settings → Backup gives a full JSON
export in either mode.

**Reconciliation with the Inventory app: live query when Supabase is
connected, manual snapshot import otherwise.** Gear-type `ProjectItem`s carry
a `gearItemId` referencing the Inventory app's `GearItem.id`. With both apps
on the same Supabase project, this app reads the Inventory app's `items`
table directly (read-only, RLS-scoped to the signed-in user) — no export step
needed, refresh any time via *Settings → Refresh*. Without Supabase
configured, it falls back to a manual snapshot: *More → Export inventory as
JSON* in the Inventory app, then paste/upload it under
*Settings → Inventory App Reconciliation* here. Either way, Settings shows
every linked gear item's reconciliation status (`Linked` vs
`Not found in Inventory app`) so a stale link is visible, not silent.

**Auth / sync layer: optional, shared with the Inventory app when enabled.**
Local mode (no auth, single-device) is still the zero-setup default. Once
Supabase is connected, both apps share one Supabase Auth account — sign up
once, sign into both.

## Document Hierarchy

Three source documents feed this build, developed across multiple AI
platforms to cross-check acoustic design assumptions. They are **not**
equal-status:

| Document | Role | Feeds Into |
|---|---|---|
| Acoustic Design Document | Detailed analysis/derivation | Master Summary |
| **Master Summary** | Consolidated build spec — single canonical live document | **This app reads from here** |
| Operations Manual | Day-2 reference (Stage 9 onward only) | Kept separate from build stages |

This app should only ever be updated from Master Summary content (via the
Decisions log and Planning ingestion), never from the Acoustic Design Document
or Operations Manual directly.

**Location-change caveat (working assumption, tracked open):** the original
project handoff described the studio moving from under the house to above
the carport. Master Summary v14 itself makes **no mention of this
anywhere** — it treats the 6.7×5.0×3.0m room as fixed, and the only thing it
calls provisional is the listening position pending the Section 7A rolling
bass test (a normal commissioning step, unrelated to the location question).
Confirmed with John (2026-08-10): the working assumption is that the
above-carport build carries over v14's dimensions as-is; Budget, Planning,
and Rack/Signal Chain work proceeds unblocked on that assumption, and
acoustic properties get recalculated only if the confirmed as-built room
differs. Tracked as the "Confirm above-carport room dimensions" item on
Stage 1 and the matching decision in the Decisions log — still open, not
locked, revisit once the room is confirmed.

## Data sources

Seeded from two real documents (`lib/data/demoData.ts`):
- **Master Summary v14** — all stage items and decisions, sourced from
  Section 7A (Acoustic Commissioning Sequence), Section 19 (Open Items), and
  Section 20 (Resolved from Previous Versions). Each item's `sourceVersion`
  cites the section/version it came from.
- **Clean_Budget_v7_4.xlsx** — all 67 real budget line items. The sheet has
  no single "mid" figure — each line is really two distinct product choices
  (a preferred pick and a cheaper budget alternative), so `budgetLow` = the
  sheet's Budget Option Total, `budgetHigh` = the Preferred Option Total, and
  `budgetMid` is the midpoint of those two, computed here.

Two open discrepancies surfaced rather than silently resolved — both visible
in-app, not just in this file:
- **Headphone amp conflict** (Board → Stage 8 → "Headphone amp — RNHP vs
  HA8000"): Master Summary v14 still specifies Behringer HA8000; Clean_Budget
  v7.4 lists an upgrade to a Rupert Neve Designs RNHP. Needs a decision to
  reconcile which document is current.
- **Build / Network-Data budget anomalies**: several lines in those two
  categories have a Total that doesn't reconcile with Unit × Qty in the
  source spreadsheet (a `data_only=True` stale-cache symptom — the totals
  look like they were cached before quantities were last edited). Imported
  as printed rather than recomputed, and tagged `FLAGGED` in each line's
  notes — worth checking against the live spreadsheet before treating as
  final.

**"Construction Shell" budget category — placeholder, not sourced from
either document.** Neither Master Summary v14 nor Clean_Budget_v7_4 prices
the base building structure — both are scoped entirely to fit-out, acoustic
treatment, and equipment. At John's request (2026-08-10), `demoData.ts` adds
eight round, illustrative line items (slab & footings, structural framing,
roof, external walls & cladding, structural doors/windows, site works,
building permit/compliance fees, builder's margin) so the shell isn't
invisible on the dashboard — currently ~$56.5k low / $92k mid / $138k high.
None of these numbers come from a quote or comparable; every line is tagged
`provisional: true` and `sourceVersion: "Placeholder — awaiting builder's
quote"`. Replace them the moment a real builder's quote exists.

Because this is `localStorage` seed data, a browser that already loaded an
earlier build of this app keeps its old data — Settings → *Reset to seed
data* pulls in whatever `demoData.ts` currently contains.

## Data model

- **`ProjectItem`** (`lib/types.ts`) — the task/gear/decision record. Fields:
  `stage` (0–9), `type` (`gear | task | decision`), `status`, `date`, `notes`,
  `category`, `dependsOn` (blocking item IDs), `gearItemId` (Inventory app
  reference), `provisional`, `sourceVersion`.
- **`Decision`** — mirrors Master Summary Section 20 (Resolved from Previous
  Versions): title, description, category, `version`, tags, resolved date.
- **`BudgetLineItem`** — `budgetLow/Mid/High`, `committed`, `actual`,
  `provisional`, optional links back to a `ProjectItem` or `GearItem`.
  `lineVariance()` and `lineCostToComplete()` / `rollupByCategory()` in
  `lib/types.ts` implement the variance and cost-to-complete math described in
  the brief (Cost-to-complete = Σ(Budgeted-mid − Actual) over items not yet
  paid; category flags trip at 90%/100% of budgeted-high).
- Category taxonomy (`CATEGORIES` in `lib/types.ts`) starts as a literal copy
  of the Inventory app's `DEFAULT_STUDIO_AREAS` (11 categories) plus four
  budget-only additions found in Clean_Budget_v7_4 with no Inventory app
  equivalent — HVAC, Lighting, Flooring, Build. Keep the shared 11 in sync by
  hand if either app's list changes, since there's no shared package between
  the repos.

## Views

- **Dashboard** (`/dashboard`) — cost-to-complete headline, stage progress,
  budget flags, recent decisions. `/` redirects here once signed in (or to
  `/welcome` if not — only relevant in cloud mode; local mode is always
  "signed in").
- **Board** (`/board`) — Kanban by stage, the primary working view.
- **Dependencies** (`/dependencies`) — currently-blocked items and the full
  dependency chain, surfacing the Master Summary's hard sequencing rules
  (e.g. side panels wait on listening-position confirmation).
- **Timeline** (`/timeline`) — stage-ordered build sequence plus a computed
  critical path (longest chain through the dependency graph).
- **Budget** (`/budget`) — category rollup and editable line items (commits
  on blur, not per-keystroke, to keep cloud mode from writing on every
  character typed).
- **Decisions** (`/decisions`) — searchable, versioned log.
- **Settings** (`/settings`) — Planning ingestion, gear reconciliation,
  backup, and (cloud mode) account/sign-out.
- **Welcome / Login / Signup** (`/welcome`, `/login`, `/signup`) — only
  reachable in cloud mode; local mode skips straight to the dashboard.

## Project structure

- `app/(auth)/` — welcome, login, signup screens (cloud mode only)
- `app/(main)/` — dashboard and every other view, behind the sidebar nav
- `lib/data/DataProvider.tsx` — the single data layer; talks to Supabase when
  configured, otherwise falls back to `localStorage` automatically
- `lib/data/mapRow.ts` — snake_case DB row ⇄ camelCase domain type mappers,
  plus the mapper for reading the Inventory app's `items` table
- `lib/data/demoData.ts` — the real Master Summary v14 / Clean_Budget_v7_4
  seed data, used both for a fresh local browser and a fresh cloud account
- `supabase/schema.sql` — this app's tables, RLS policies; run in the same
  project as the Inventory app's own `supabase/schema.sql`

## Ingesting Planning Agent output

Paste the status block the Armadale Planning Agent emits — a single object or
a JSON array — under *Settings → Planning Project Ingestion*:

```json
{"stage": "Planning & Approval", "item": "BAL assessment", "status": "submitted", "date": "2026-08-01", "notes": "Lodged with council"}
```

It always writes into Stage 0, matching an existing item by name
(case-insensitive) or creating a new one.
