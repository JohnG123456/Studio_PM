// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------
// Mirrors the Master Summary build sequence. Stage 0 gates everything below
// it; Stage 9 (Ongoing Ops) ties into the Studio Operations Manual and is
// intentionally out of scope for build tracking here.

export interface StageDef {
  id: number;
  name: string;
  summary: string;
}

export const STAGES: StageDef[] = [
  { id: 0, name: "Planning & Approval", summary: "BAL assessment, DA requirement, Building Permit, CTF levy, builder registration. Gates everything below." },
  { id: 1, name: "Pre-Construction", summary: "Design lock, cabinetmaker drawing pack, supplier quotes, cabler engagement." },
  { id: 2, name: "Construction Shell", summary: "Walls, HVAC, power, floor, doors (Master Summary Phase 1)." },
  { id: 3, name: "Rough-In", summary: "Cable tray runs, wall plate cabling, structural blocking — must happen during slab/frame." },
  { id: 4, name: "Critical Geometry", summary: "False wall, rear diffusers, rug, provisional monitors (Phase 3)." },
  { id: 5, name: "Commissioning", summary: "Phase 2–7 rolling bass test sequence — gated/sequential, not a flat checklist." },
  { id: 6, name: "Remaining Treatment", summary: "Corner traps, side panels, ceiling cloud (Phase 6, listening-position dependent)." },
  { id: 7, name: "Fit-out / Aesthetic", summary: "Cask & Carbon: lighting zones, velvet panels, guitar gallery, seating." },
  { id: 8, name: "Equipment Bring-up", summary: "Rack build, patchbay, signal chain testing." },
  { id: 9, name: "Ongoing Ops", summary: "Ties to the Studio Operations Manual — day-2 reference, not a build stage." },
];

export function stageName(id: number): string {
  return STAGES.find((s) => s.id === id)?.name ?? `Stage ${id}`;
}

// ---------------------------------------------------------------------------
// Category taxonomy — must stay in sync with the Studio Inventory app's
// DEFAULT_STUDIO_AREAS (lib/types.ts) and Clean_Budget_v4's category column,
// so budget/gear/task categories line up without remapping.
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  "Control",
  "Acoustics",
  "Monitoring",
  "Desk",
  "500 Series",
  "Microphones",
  "Cabling",
  "Guitar Rig",
  "Rack",
  "Power",
  "Network / Data",
  // Budget-only categories added in Clean_Budget_v7_4 — construction/fit-out
  // spend with no equipment record in the Inventory app, so no area there
  // to stay in sync with.
  "HVAC",
  "Lighting",
  "Flooring",
  "Build",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Project items — tasks, gear-linked items, and decisions all live on the
// same timeline/stage/dependency spine so the Kanban, dependency, and
// timeline views can share one data source.
// ---------------------------------------------------------------------------

export type ItemType = "gear" | "task" | "decision";

// Planning Agent statuses (not_started..blocked) plus "submitted"/"approved"
// for approval workflows, and "done" for general task/gear completion.
export type ItemStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "approved"
  | "blocked"
  | "done";

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  submitted: "Submitted",
  approved: "Approved",
  blocked: "Blocked",
  done: "Done",
};

// Statuses that count as "complete" for stage-progress math.
export const COMPLETE_STATUSES: ItemStatus[] = ["approved", "done"];

export interface ProjectItem {
  id: string;
  stage: number; // 0-9, see STAGES
  name: string;
  type: ItemType;
  status: ItemStatus;
  date?: string; // ISO date — target or actual date, depending on status
  notes?: string;
  category?: Category | string;
  dependsOn: string[]; // ids of ProjectItems that block this one
  gearItemId?: string; // reference into the Inventory app's GearItem.id (type === "gear")
  provisional?: boolean; // true = dimension/geometry data isn't finalized yet (e.g. pending empirical listening-position confirmation, a bracket spec sheet, or a room reconfirmation)
  sourceVersion?: string; // provenance, e.g. "Master Summary v14" or "Planning Agent"
  createdAt: string;
  updatedAt: string;
}

export type NewProjectItem = Omit<ProjectItem, "id" | "createdAt" | "updatedAt">;

// ---------------------------------------------------------------------------
// Decisions log — mirrors Master Summary Section 20 (Resolved from Previous
// Versions). Locked/resolved decisions, not the active work zone.
// ---------------------------------------------------------------------------

export interface Decision {
  id: string;
  title: string;
  description: string;
  category?: Category | string;
  version: string; // Master Summary version this was resolved in, e.g. "v14"
  resolvedDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NewDecision = Omit<Decision, "id" | "createdAt" | "updatedAt">;

// ---------------------------------------------------------------------------
// Budget module — first-class, not a rollup of something else.
// ---------------------------------------------------------------------------

export interface BudgetLineItem {
  id: string;
  category: Category | string;
  name: string;
  budgetLow: number;
  budgetMid: number;
  budgetHigh: number;
  committed: number; // ordered, price locked in, not yet paid
  actual: number; // paid
  provisional?: boolean; // quantity/spec may still shift before it's locked
  notes?: string;
  linkedItemId?: string; // optional ProjectItem id this line funds
  gearItemId?: string; // optional Inventory app GearItem id this line funds
  sourceVersion?: string; // e.g. "Clean_Budget_v7_4"
  createdAt: string;
  updatedAt: string;
}

export type NewBudgetLineItem = Omit<BudgetLineItem, "id" | "createdAt" | "updatedAt">;

export function lineVariance(line: BudgetLineItem): number {
  const actualOrCommitted = line.actual || line.committed || 0;
  return actualOrCommitted - line.budgetMid;
}

export function lineCostToComplete(line: BudgetLineItem): number {
  if (line.actual > 0) return 0;
  return Math.max(0, line.budgetMid - line.actual);
}

export interface CategoryRollup {
  category: string;
  budgetLow: number;
  budgetMid: number;
  budgetHigh: number;
  committed: number;
  actual: number;
  variance: number;
  costToComplete: number;
  // Flags when actual+committed trends toward/past budgeted-high.
  flag: "ok" | "watch" | "over";
}

const WATCH_THRESHOLD = 0.9; // 90% of budgeted-high

export function rollupByCategory(lines: BudgetLineItem[]): CategoryRollup[] {
  const map = new Map<string, BudgetLineItem[]>();
  for (const line of lines) {
    const key = line.category || "Uncategorised";
    map.set(key, [...(map.get(key) ?? []), line]);
  }
  return Array.from(map.entries())
    .map(([category, items]) => {
      const budgetLow = items.reduce((s, i) => s + i.budgetLow, 0);
      const budgetMid = items.reduce((s, i) => s + i.budgetMid, 0);
      const budgetHigh = items.reduce((s, i) => s + i.budgetHigh, 0);
      const committed = items.reduce((s, i) => s + i.committed, 0);
      const actual = items.reduce((s, i) => s + i.actual, 0);
      const spend = actual || committed;
      const variance = (actual || committed) - budgetMid;
      const costToComplete = items.reduce((s, i) => s + lineCostToComplete(i), 0);
      let flag: CategoryRollup["flag"] = "ok";
      if (budgetHigh > 0) {
        if (spend >= budgetHigh) flag = "over";
        else if (spend >= budgetHigh * WATCH_THRESHOLD) flag = "watch";
      }
      return { category, budgetLow, budgetMid, budgetHigh, committed, actual, variance, costToComplete, flag };
    })
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function totalCostToComplete(lines: BudgetLineItem[]): number {
  return lines.reduce((s, l) => s + lineCostToComplete(l), 0);
}

// ---------------------------------------------------------------------------
// Planning Project ingestion — the status block shape the Armadale Planning
// Agent emits. Always targets Stage 0 (Planning & Approval).
// ---------------------------------------------------------------------------

export type PlanningAgentStatus = "not_started" | "in_progress" | "submitted" | "approved" | "blocked";

export interface PlanningIngestBlock {
  stage: string;
  item: string;
  status: PlanningAgentStatus;
  date: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Inventory app gear snapshot — the shape produced by the Studio Inventory
// app's "More → Export inventory as JSON". Only the fields the PM app needs
// for linking/display are declared; unknown fields are ignored on import.
// ---------------------------------------------------------------------------

export interface GearSnapshotItem {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category?: string;
  area?: string;
  location?: string;
  status?: "owned" | "planned";
  purchasePrice?: number;
  manualValue?: number;
}

export interface GearSnapshot {
  importedAt: string;
  items: GearSnapshotItem[];
}
