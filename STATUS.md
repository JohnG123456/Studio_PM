# Status — Studio PM

_Last updated: 23 September 2026. First version, written from a read of the
repo rather than from memory of the work — correct anything that looks wrong._

## What this is

Platform of record for the studio build at 14 Contour Rd, Roleystone: budget,
build stages, dependency chains, timeline and the decisions log. The third piece
of a three-part system, and the only one that is an app.

It is a sibling of the **Studio Inventory** app — same stack, designed to share
one Supabase project and one login, so gear-type items link live to real
inventory records instead of a manual export.

## Where it runs

| | |
|---|---|
| Framework | Next.js (App Router), TypeScript, Tailwind |
| Data | Supabase when configured, `localStorage` otherwise |
| Supabase project | **The Studio Inventory app's project** — do not create a new one |
| Hosting | Vercel |

## Where we're up to

Built, with every open question from the handoff brief resolved and recorded in
`README.md`. Last pushed **29 August 2026** — about four weeks quiet.

A fresh account or browser seeds itself from the real Master Summary v14 and
Clean_Budget_v7_4 data, so the app opens with the actual project rather than an
empty shell.

## Open items

- [ ] **Confirm the above-carport room dimensions.** The working assumption,
  agreed 10 August, is that the above-carport build carries v14's 6.7 × 5.0 ×
  3.0 m as-is. Master Summary v14 makes no mention of the location change at all.
  Budget, planning and rack work proceed unblocked on that assumption; acoustic
  properties get recalculated only if the confirmed as-built room differs.
  Tracked on Stage 1 and in the Decisions log — still open, not locked.
- [ ] **Headphone amp conflict.** Master Summary v14 specifies a Behringer
  HA8000; Clean_Budget v7.4 lists an upgrade to a Rupert Neve RNHP. Needs a
  decision on which document is current. Visible in-app at Board → Stage 8.
- [ ] **Build and Network-Data budget anomalies.** Several lines have a Total
  that doesn't reconcile with Unit × Qty in the source spreadsheet — a stale
  cached-total symptom. Imported as printed rather than recomputed, and tagged
  `FLAGGED`. Check against the live spreadsheet before treating as final.
- [ ] **Construction Shell is a placeholder, not a quote.** Eight round,
  illustrative lines so the base structure isn't invisible on the dashboard —
  roughly $56.5k low / $92k mid / $138k high. Every line is tagged
  `provisional: true`. Replace the moment a builder's quote exists.
- [ ] **The README's deployment note is out of date.** It says the repo has no
  `main` branch yet; it does now. Worth correcting so nobody points Vercel's
  production branch at a working branch on its advice.

## Gotchas

- **Only ever update this app from the Master Summary.** Three documents feed the
  build and they are not equal in status: the Acoustic Design Document is
  derivation, the **Master Summary** is the single canonical spec, and the
  Operations Manual is day-2 reference from Stage 9 onward. Content flows in via
  the Decisions log and Planning ingestion, never from the other two directly.
- **One write-back path exists, and only one.** A budget line linked to a gear
  item pushes its Actual into that item's `purchase_price` in the Inventory app.
  Everywhere else the relationship is strictly read-only. It exists because the
  two apps' cost figures otherwise drift silently. Keep it narrow — it must never
  touch valuation fields.
- **Share the Inventory app's Supabase project.** Creating a second one breaks
  the live gear link, which is most of the point of the app.
- **Vercel bakes `NEXT_PUBLIC_*` at build time.** Setting or changing an env var
  does nothing to an existing deployment — redeploy, or it will look like the
  variables were ignored.
- **Category taxonomy is hand-synced with Studio Inventory.** Eleven shared
  categories copied from that app's `DEFAULT_STUDIO_AREAS`, plus four
  budget-only additions. No shared package between the repos, so a change in one
  needs the same change in the other.
- **`budgetMid` is computed, not sourced.** The spreadsheet has no mid figure —
  each line is a preferred pick and a cheaper alternative, so low is the budget
  option, high is the preferred option, and mid is their midpoint.
- **Seed data doesn't refresh itself.** A browser holding an earlier build keeps
  its old data until *Settings → Reset to seed data*.
