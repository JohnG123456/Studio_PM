import {
  BudgetLineItem,
  Decision,
  GearSnapshotItem,
  ItemStatus,
  ItemType,
  NewBudgetLineItem,
  NewDecision,
  NewProjectItem,
  ProjectItem,
} from "../types";

// ---------------------------------------------------------------------------
// project_items
// ---------------------------------------------------------------------------

export interface ProjectItemRow {
  id: string;
  stage: number;
  name: string;
  type: string;
  status: string;
  date: string | null;
  notes: string | null;
  category: string | null;
  depends_on: string[] | null;
  gear_item_id: string | null;
  provisional: boolean;
  source_version: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToProjectItem(row: ProjectItemRow): ProjectItem {
  return {
    id: row.id,
    stage: row.stage,
    name: row.name,
    type: row.type as ItemType,
    status: row.status as ItemStatus,
    date: row.date ?? undefined,
    notes: row.notes ?? undefined,
    category: row.category ?? undefined,
    dependsOn: row.depends_on ?? [],
    gearItemId: row.gear_item_id ?? undefined,
    provisional: row.provisional,
    sourceVersion: row.source_version ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectItemToRow(item: NewProjectItem, userId: string) {
  return {
    user_id: userId,
    stage: item.stage,
    name: item.name,
    type: item.type,
    status: item.status,
    date: item.date || null,
    notes: item.notes ?? null,
    category: item.category ?? null,
    depends_on: item.dependsOn ?? [],
    gear_item_id: item.gearItemId ?? null,
    provisional: item.provisional ?? false,
    source_version: item.sourceVersion ?? null,
  };
}

// ---------------------------------------------------------------------------
// decisions
// ---------------------------------------------------------------------------

export interface DecisionRow {
  id: string;
  title: string;
  description: string;
  category: string | null;
  version: string;
  resolved_date: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export function rowToDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category ?? undefined,
    version: row.version,
    resolvedDate: row.resolved_date ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function decisionToRow(d: NewDecision, userId: string) {
  return {
    user_id: userId,
    title: d.title,
    description: d.description,
    category: d.category ?? null,
    version: d.version,
    resolved_date: d.resolvedDate || null,
    tags: d.tags ?? [],
  };
}

// ---------------------------------------------------------------------------
// budget_lines
// ---------------------------------------------------------------------------

export interface BudgetLineRow {
  id: string;
  category: string;
  name: string;
  budget_low: number;
  budget_mid: number;
  budget_high: number;
  committed: number;
  actual: number;
  provisional: boolean;
  notes: string | null;
  linked_item_id: string | null;
  gear_item_id: string | null;
  source_version: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToBudgetLine(row: BudgetLineRow): BudgetLineItem {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    budgetLow: Number(row.budget_low),
    budgetMid: Number(row.budget_mid),
    budgetHigh: Number(row.budget_high),
    committed: Number(row.committed),
    actual: Number(row.actual),
    provisional: row.provisional,
    notes: row.notes ?? undefined,
    linkedItemId: row.linked_item_id ?? undefined,
    gearItemId: row.gear_item_id ?? undefined,
    sourceVersion: row.source_version ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function budgetLineToRow(b: NewBudgetLineItem, userId: string) {
  return {
    user_id: userId,
    category: b.category,
    name: b.name,
    budget_low: b.budgetLow,
    budget_mid: b.budgetMid,
    budget_high: b.budgetHigh,
    committed: b.committed,
    actual: b.actual,
    provisional: b.provisional ?? false,
    notes: b.notes ?? null,
    linked_item_id: b.linkedItemId ?? null,
    gear_item_id: b.gearItemId ?? null,
    source_version: b.sourceVersion ?? null,
  };
}

// ---------------------------------------------------------------------------
// Inventory app's `items` table — read-only, for live gear reconciliation.
// Only the subset of columns this app displays/links against; the rest of
// that table's shape belongs to studioinv1's lib/data/mapRow.ts.
// ---------------------------------------------------------------------------

export interface InventoryItemRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  area: string | null;
  location: string | null;
  status: string | null;
  purchase_price: number | null;
  manual_value: number | null;
}

export function rowToGearSnapshotItem(row: InventoryItemRow): GearSnapshotItem {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    category: row.category ?? undefined,
    area: row.area ?? undefined,
    location: row.location ?? undefined,
    status: (row.status as GearSnapshotItem["status"]) ?? undefined,
    purchasePrice: row.purchase_price ?? undefined,
    manualValue: row.manual_value ?? undefined,
  };
}
