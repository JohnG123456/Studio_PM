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

Open http://localhost:3000. Data is stored in the browser's `localStorage`,
pre-seeded with starter stage/budget/decision data so every view has something
to show on first run — see [Seed data caveat](#seed-data-caveat).

## Open questions from the handoff brief — resolved

**Storage format: JSON via `localStorage`.** Same default-local model as the
Studio Inventory app. Data volume here (a few hundred task/decision/budget
records) doesn't warrant SQLite, and staying in localStorage keeps this app
consistent with its sibling. Settings → Backup & Reset gives full JSON
export/import for portability and safekeeping.

**Reconciliation with the Inventory app: manual snapshot import, not a live
link.** Both apps are single-device/local-first by default, so there's no
shared backend to query live. Instead:
- Gear-type `ProjectItem`s carry a `gearItemId` that references the Inventory
  app's `GearItem.id`.
- In the Inventory app, *More → Export inventory as JSON* produces the
  snapshot; paste or upload it under *Settings → Inventory App Reconciliation*
  in this app.
- Settings shows every linked gear item's reconciliation status (`Linked` vs
  `Not found in latest snapshot`) so a stale link is visible, not silent.
- This is a manual sync trigger by design — re-import whenever the Inventory
  app's data moves. If both apps are ever put on a shared Supabase backend for
  cross-device sync, this snapshot mechanism could be swapped for a live
  read-only query without changing the `gearItemId` reference model.

**Auth / sync layer: none — stays single-device.** Consistent with the
Inventory app's default (no-Supabase) mode. Nothing here blocks adding
Supabase later using the same pattern the Inventory app already established,
if cross-device sync becomes a real need.

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

**Known data quality issue:** the studio's physical location has moved from
under the house to above the carport. Room footprint is expected to stay a
similar size, so budget figures are expected to hold at the category/line-item
level — but exact acoustic dimensions (listening position, diffuser placement,
wall treatment coordinates) are provisional until the new room is confirmed.
Any `ProjectItem` or `BudgetLineItem` touching those dimensions carries a
`provisional: true` flag and renders a **Provisional** badge — this is
editable from day one and isn't gating Budget, Planning, or Rack/Signal Chain
work.

## Seed data caveat

Master Summary v14 and Clean_Budget_v4.xlsx were referenced in the handoff
brief but weren't available in this build session — only the handoff document
itself was. Everything seeded in `lib/data/demoData.ts` (stage items,
decisions, budget category totals) is placeholder content tagged
`sourceVersion: "seed"`, built from what the brief and prior session notes
describe, **not** a transcription of the real documents. Replace it via:
- **Budget** — edit the category-total placeholder lines directly, or add
  granular line items via *Budget → Add line*, sourced from the real
  Clean_Budget_v4.
- **Stage 0 items** — paste the Armadale Planning Agent's JSON status blocks
  via *Settings → Planning Project Ingestion*.
- **Decisions** — log real Section 20 entries via *Decisions → Log decision*,
  or replace the seed set outright.
- Settings → *Reset to seed data* clears everything back to this starting
  point if you want a clean slate.

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
- Category taxonomy (`CATEGORIES` in `lib/types.ts`) is a literal copy of the
  Inventory app's `DEFAULT_STUDIO_AREAS` — keep the two lists in sync by hand
  if either changes, since there's no shared package between the repos.

## Views

- **Dashboard** (`/`) — cost-to-complete headline, stage progress, budget
  flags, recent decisions.
- **Board** (`/board`) — Kanban by stage, the primary working view.
- **Dependencies** (`/dependencies`) — currently-blocked items and the full
  dependency chain, surfacing the Master Summary's hard sequencing rules
  (e.g. side panels wait on listening-position confirmation).
- **Timeline** (`/timeline`) — stage-ordered build sequence plus a computed
  critical path (longest chain through the dependency graph).
- **Budget** (`/budget`) — category rollup and editable line items.
- **Decisions** (`/decisions`) — searchable, versioned log.
- **Settings** (`/settings`) — Planning ingestion, gear reconciliation,
  backup/export/reset.

## Ingesting Planning Agent output

Paste the status block the Armadale Planning Agent emits — a single object or
a JSON array — under *Settings → Planning Project Ingestion*:

```json
{"stage": "Planning & Approval", "item": "BAL assessment", "status": "submitted", "date": "2026-08-01", "notes": "Lodged with council"}
```

It always writes into Stage 0, matching an existing item by name
(case-insensitive) or creating a new one.
