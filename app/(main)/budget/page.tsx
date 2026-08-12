"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import {
  BudgetLineItem,
  CATEGORIES,
  GearSnapshotItem,
  lineCostToComplete,
  lineVariance,
  NewBudgetLineItem,
  rollupByCategory,
  totalCostToComplete,
} from "@/lib/types";
import { formatAUD, formatSignedAUD } from "@/lib/format";
import { IconLink, IconPlus, IconTrash, IconX } from "@/components/icons";
import { FieldLabel, PlainInput, PlainSelect, PrimaryButton, SecondaryButton } from "@/components/FormControls";
import { ProvisionalPill } from "@/components/Badges";

type SortOrder = "category" | "name" | "budget-desc" | "ctc-desc" | "variance-desc";

const SORT_LABELS: Record<SortOrder, string> = {
  category: "Category (default)",
  name: "Name (A–Z)",
  "budget-desc": "Budgeted (high → low)",
  "ctc-desc": "Cost to complete (high → low)",
  "variance-desc": "Variance (most over first)",
};

export default function BudgetPage() {
  const { budget, addBudgetLine, updateBudgetLine, deleteBudgetLine, availableGearItems, gearSource } = useData();
  const [adding, setAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOrder>("category");

  const rollup = useMemo(() => rollupByCategory(budget), [budget]);
  const ctc = useMemo(() => totalCostToComplete(budget), [budget]);
  const totals = useMemo(
    () => ({
      budgetLow: budget.reduce((s, l) => s + l.budgetLow, 0),
      budgetMid: budget.reduce((s, l) => s + l.budgetMid, 0),
      budgetHigh: budget.reduce((s, l) => s + l.budgetHigh, 0),
      committed: budget.reduce((s, l) => s + l.committed, 0),
      actual: budget.reduce((s, l) => s + l.actual, 0),
    }),
    [budget]
  );

  const visibleLines = useMemo(() => {
    let lines = filterCategory ? budget.filter((l) => l.category === filterCategory) : budget;

    const q = search.trim().toLowerCase();
    if (q) {
      lines = lines.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          (l.notes ?? "").toLowerCase().includes(q)
      );
    }

    if (sortBy === "category") return lines;
    const sorted = [...lines];
    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "budget-desc":
        sorted.sort((a, b) => b.budgetMid - a.budgetMid);
        break;
      case "ctc-desc":
        sorted.sort((a, b) => lineCostToComplete(b) - lineCostToComplete(a));
        break;
      case "variance-desc":
        sorted.sort((a, b) => lineVariance(b) - lineVariance(a));
        break;
    }
    return sorted;
  }, [budget, filterCategory, search, sortBy]);

  return (
    <div className="flex flex-1 flex-col pb-12">
      <PageHeader
        title="Budget"
        subtitle="Budgeted (low/mid/high) vs Committed vs Actual, pulled per line item"
      />

      <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-3 md:grid-cols-6 md:px-8">
        <Stat label="Budgeted (low)" value={formatAUD(totals.budgetLow)} />
        <Stat label="Budgeted (mid)" value={formatAUD(totals.budgetMid)} />
        <Stat label="Budgeted (high)" value={formatAUD(totals.budgetHigh)} />
        <Stat label="Committed" value={formatAUD(totals.committed)} />
        <Stat label="Actual" value={formatAUD(totals.actual)} />
        <Stat label="Cost to Complete" value={formatAUD(ctc)} accent />
      </div>

      <div className="px-5 md:px-8">
        <h2 className="mb-3 font-display text-lg text-foreground">By Category</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-dim">
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5 text-right">Low</th>
                <th className="px-4 py-2.5 text-right">Mid</th>
                <th className="px-4 py-2.5 text-right">High</th>
                <th className="px-4 py-2.5 text-right">Committed</th>
                <th className="px-4 py-2.5 text-right">Actual</th>
                <th className="px-4 py-2.5 text-right">Variance</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rollup.map((r) => (
                <tr
                  key={r.category}
                  className={`cursor-pointer border-b border-border last:border-0 hover:bg-card-hover ${
                    filterCategory === r.category ? "bg-card-hover" : ""
                  }`}
                  onClick={() => setFilterCategory(filterCategory === r.category ? "" : r.category)}
                >
                  <td className="px-4 py-2.5 text-foreground">{r.category}</td>
                  <td className="px-4 py-2.5 text-right text-muted">{formatAUD(r.budgetLow)}</td>
                  <td className="px-4 py-2.5 text-right text-muted">{formatAUD(r.budgetMid)}</td>
                  <td className="px-4 py-2.5 text-right text-muted">{formatAUD(r.budgetHigh)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatAUD(r.committed)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground">{formatAUD(r.actual)}</td>
                  <td className={`px-4 py-2.5 text-right ${r.variance > 0 ? "text-danger" : "text-good"}`}>
                    {formatSignedAUD(r.variance)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {r.flag === "over" && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] text-danger">Over high</span>}
                    {r.flag === "watch" && <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[10px] text-warn">Watch</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-5 py-5 md:px-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg text-foreground">
            Line Items {filterCategory && <span className="text-sm text-muted-dim">— {filterCategory}</span>}
          </h2>
          <SecondaryButton onClick={() => setAdding(true)}>
            <span className="flex items-center gap-1.5">
              <IconPlus className="h-3.5 w-3.5" /> Add line
            </span>
          </SecondaryButton>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <PlainInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search line items…"
            className="max-w-xs flex-1"
          />
          <div className="w-full shrink-0 sm:w-64">
            <PlainSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOrder)}
              aria-label="Sort line items"
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  Sort: {label}
                </option>
              ))}
            </PlainSelect>
          </div>
          {filterCategory && (
            <button className="text-xs text-accent" onClick={() => setFilterCategory("")}>
              Clear category filter
            </button>
          )}
        </div>

        <p className="mb-4 text-xs text-muted-dim">
          <IconLink className="mr-1 inline h-3 w-3 align-[-1px]" />
          {gearSource === "live"
            ? "Link a line to a gear item, and setting Actual pushes that price straight to the Inventory app — no manual updates to forget."
            : "Link a line to a gear item for your own records. Local mode has no live Inventory app to push prices to — connect Supabase for that (see Settings)."}
        </p>

        {adding && (
          <NewLineForm
            onCancel={() => setAdding(false)}
            onSave={(payload) => {
              addBudgetLine(payload);
              setAdding(false);
            }}
          />
        )}

        <div className="flex flex-col gap-2">
          {visibleLines.length === 0 && !adding && (
            <p className="text-sm text-muted-dim">
              {search || filterCategory ? "Nothing matches — try a different search or clear the filter." : "No budget lines yet."}
            </p>
          )}
          {visibleLines.map((line) => (
            <LineRow
              key={line.id}
              line={line}
              onUpdate={updateBudgetLine}
              onDelete={deleteBudgetLine}
              availableGearItems={availableGearItems}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-surface rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-dim">{label}</p>
      <p className={`mt-1.5 font-display text-xl ${accent ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function LineRow({
  line,
  onUpdate,
  onDelete,
  availableGearItems,
}: {
  line: BudgetLineItem;
  onUpdate: (id: string, patch: Partial<NewBudgetLineItem>) => void;
  onDelete: (id: string) => void;
  availableGearItems: GearSnapshotItem[];
}) {
  const variance = lineVariance(line);
  const ctc = lineCostToComplete(line);
  const [name, setName] = useState(line.name);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the local edit buffer when the canonical value changes externally (e.g. another device)
    setName(line.name);
  }, [line.name]);

  function commitName() {
    if (name !== line.name) onUpdate(line.id, { name });
  }

  return (
    <div className="card-surface flex flex-wrap items-center gap-3 rounded-2xl p-3.5">
      <div className="min-w-[10rem] flex-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full bg-transparent text-sm text-foreground focus:outline-none"
        />
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-dim">{line.category}</span>
          {line.provisional && <ProvisionalPill />}
          <GearLinkControl line={line} onUpdate={onUpdate} availableGearItems={availableGearItems} />
        </div>
      </div>
      <NumberField label="Low" value={line.budgetLow} onCommit={(v) => onUpdate(line.id, { budgetLow: v })} />
      <NumberField label="Mid" value={line.budgetMid} onCommit={(v) => onUpdate(line.id, { budgetMid: v })} />
      <NumberField label="High" value={line.budgetHigh} onCommit={(v) => onUpdate(line.id, { budgetHigh: v })} />
      <NumberField label="Committed" value={line.committed} onCommit={(v) => onUpdate(line.id, { committed: v })} />
      <NumberField label="Actual" value={line.actual} onCommit={(v) => onUpdate(line.id, { actual: v })} />
      <div className="w-24 shrink-0 text-right">
        <p className="text-[10px] uppercase tracking-wide text-muted-dim">Variance</p>
        <p className={`text-sm ${variance > 0 ? "text-danger" : "text-good"}`}>{formatSignedAUD(variance)}</p>
      </div>
      <div className="w-24 shrink-0 text-right">
        <p className="text-[10px] uppercase tracking-wide text-muted-dim">To complete</p>
        <p className="text-sm text-foreground">{formatAUD(ctc)}</p>
      </div>
      <button
        onClick={() => {
          if (confirm(`Delete "${line.name}"? This can't be undone.`)) onDelete(line.id);
        }}
        aria-label="Delete line"
        className="shrink-0 text-muted-dim hover:text-danger"
      >
        <IconTrash className="h-4 w-4" />
      </button>
    </div>
  );
}

function GearLinkControl({
  line,
  onUpdate,
  availableGearItems,
}: {
  line: BudgetLineItem;
  onUpdate: (id: string, patch: Partial<NewBudgetLineItem>) => void;
  availableGearItems: GearSnapshotItem[];
}) {
  const [picking, setPicking] = useState(false);

  if (line.gearItemId) {
    const linkedGear = availableGearItems.find((g) => g.id === line.gearItemId);
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
        <IconLink className="h-3 w-3" />
        {linkedGear ? linkedGear.name : "Linked gear item (not found)"}
        <button
          type="button"
          onClick={() => onUpdate(line.id, { gearItemId: undefined })}
          aria-label="Unlink gear item"
          className="text-accent/70 hover:text-danger"
        >
          <IconX className="h-3 w-3" />
        </button>
      </span>
    );
  }

  if (picking) {
    return (
      <select
        autoFocus
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onUpdate(line.id, { gearItemId: e.target.value });
          setPicking(false);
        }}
        onBlur={() => setPicking(false)}
        className="rounded-full border border-border bg-background-elevated px-2 py-0.5 text-[11px] text-foreground focus:border-accent focus:outline-none"
      >
        <option value="">{availableGearItems.length ? "Pick gear item…" : "No gear items available"}</option>
        {availableGearItems.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPicking(true)}
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-dim hover:text-accent"
    >
      <IconLink className="h-3 w-3" /> Link gear
    </button>
  );
}

function NumberField({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the local edit buffer when the canonical value changes externally (e.g. another device)
    setText(String(value));
  }, [value]);

  function commit() {
    const parsed = Number(text) || 0;
    if (parsed !== value) onCommit(parsed);
    else setText(String(value));
  }

  return (
    <div className="w-20 shrink-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-dim">{label}</p>
      <input
        type="number"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-full bg-transparent text-sm text-foreground focus:outline-none"
      />
    </div>
  );
}

function NewLineForm({ onCancel, onSave }: { onCancel: () => void; onSave: (payload: NewBudgetLineItem) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [budgetLow, setBudgetLow] = useState(0);
  const [budgetMid, setBudgetMid] = useState(0);
  const [budgetHigh, setBudgetHigh] = useState(0);

  return (
    <div className="card-surface mb-3 rounded-2xl p-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="col-span-2">
          <FieldLabel>Name</FieldLabel>
          <PlainInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Adam Audio A8H pair" />
        </div>
        <div>
          <FieldLabel>Category</FieldLabel>
          <PlainSelect value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </PlainSelect>
        </div>
        <div>
          <FieldLabel>Budget mid</FieldLabel>
          <PlainInput
            type="number"
            value={budgetMid}
            onChange={(e) => setBudgetMid(Number(e.target.value) || 0)}
          />
        </div>
        <div className="flex items-end gap-2">
          <PrimaryButton
            onClick={() =>
              onSave({
                name: name.trim() || "Untitled line",
                category,
                budgetLow,
                budgetMid,
                budgetHigh: budgetHigh || budgetMid,
                committed: 0,
                actual: 0,
              })
            }
          >
            Add
          </PrimaryButton>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div>
          <FieldLabel hint="Optional">Budget low</FieldLabel>
          <PlainInput type="number" value={budgetLow} onChange={(e) => setBudgetLow(Number(e.target.value) || 0)} />
        </div>
        <div>
          <FieldLabel hint="Optional">Budget high</FieldLabel>
          <PlainInput type="number" value={budgetHigh} onChange={(e) => setBudgetHigh(Number(e.target.value) || 0)} />
        </div>
      </div>
    </div>
  );
}
