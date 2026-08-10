"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import {
  BudgetLineItem,
  CATEGORIES,
  lineCostToComplete,
  lineVariance,
  NewBudgetLineItem,
  rollupByCategory,
  totalCostToComplete,
} from "@/lib/types";
import { formatAUD, formatSignedAUD } from "@/lib/format";
import { IconPlus, IconTrash } from "@/components/icons";
import { FieldLabel, PlainInput, PlainSelect, PrimaryButton, SecondaryButton } from "@/components/FormControls";
import { ProvisionalPill } from "@/components/Badges";

export default function BudgetPage() {
  const { budget, addBudgetLine, updateBudgetLine, deleteBudgetLine } = useData();
  const [adding, setAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");

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

  const visibleLines = filterCategory ? budget.filter((l) => l.category === filterCategory) : budget;

  return (
    <div className="flex flex-1 flex-col pb-12">
      <PageHeader
        title="Budget"
        subtitle="Budgeted (low/mid/high) vs Committed vs Actual, pulled per line item"
        actions={
          <SecondaryButton onClick={() => setAdding(true)}>
            <span className="flex items-center gap-1.5">
              <IconPlus className="h-3.5 w-3.5" /> Add line
            </span>
          </SecondaryButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 px-5 py-5 md:grid-cols-4 md:px-8">
        <Stat label="Budgeted (mid)" value={formatAUD(totals.budgetMid)} />
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">
            Line Items {filterCategory && <span className="text-sm text-muted-dim">— {filterCategory}</span>}
          </h2>
          {filterCategory && (
            <button className="text-xs text-accent" onClick={() => setFilterCategory("")}>
              Clear filter
            </button>
          )}
        </div>

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
            <p className="text-sm text-muted-dim">No budget lines yet.</p>
          )}
          {visibleLines.map((line) => (
            <LineRow key={line.id} line={line} onUpdate={updateBudgetLine} onDelete={deleteBudgetLine} />
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
}: {
  line: BudgetLineItem;
  onUpdate: (id: string, patch: Partial<NewBudgetLineItem>) => void;
  onDelete: (id: string) => void;
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
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[11px] text-muted-dim">{line.category}</span>
          {line.provisional && <ProvisionalPill />}
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
      <button onClick={() => onDelete(line.id)} aria-label="Delete line" className="shrink-0 text-muted-dim hover:text-danger">
        <IconTrash className="h-4 w-4" />
      </button>
    </div>
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
