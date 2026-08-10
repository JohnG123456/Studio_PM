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
pre-seeded from the real Master Summary v14 and Clean_Budget_v7_4 documents —
see [Data sources](#data-sources).

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

**Location-change caveat (unresolved):** the original project handoff
described the studio moving from under the house to above the carport, with
acoustic dimensions provisional until the new room is confirmed. Master
Summary v14 itself makes **no mention of this anywhere** — it treats the
6.7×5.0×3.0m room as fixed. The only thing v14 calls provisional is the
listening position pending the Section 7A rolling bass test, which is a
normal acoustic-commissioning step, not a location question. This app follows
v14 (the canonical document) rather than the older handoff note, but the
discrepancy is unresolved — confirm with John whether the carport relocation
is still live before trusting room dimensions.

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
