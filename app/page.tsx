"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import { COMPLETE_STATUSES, rollupByCategory, STAGES, totalCostToComplete } from "@/lib/types";
import { formatAUD } from "@/lib/format";
import { IconAlert } from "@/components/icons";

export default function DashboardPage() {
  const { items, budget, decisions, ready } = useData();

  const costToComplete = useMemo(() => totalCostToComplete(budget), [budget]);
  const rollup = useMemo(() => rollupByCategory(budget), [budget]);
  const flagged = rollup.filter((r) => r.flag !== "ok");

  const stageProgress = useMemo(() => {
    return STAGES.map((stage) => {
      const stageItems = items.filter((i) => i.stage === stage.id);
      const complete = stageItems.filter((i) => COMPLETE_STATUSES.includes(i.status)).length;
      const blocked = stageItems.filter((i) => i.status === "blocked").length;
      return {
        ...stage,
        total: stageItems.length,
        complete,
        blocked,
        percent: stageItems.length ? Math.round((complete / stageItems.length) * 100) : 0,
      };
    });
  }, [items]);

  const blockedItems = useMemo(() => items.filter((i) => i.status === "blocked"), [items]);
  const recentDecisions = useMemo(
    () => [...decisions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [decisions]
  );

  if (!ready) return null;

  return (
    <div className="flex flex-1 flex-col pb-12">
      <PageHeader title="Dashboard" subtitle="Platform of record for the studio build" />

      <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-3 md:px-8">
        <div className="card-surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted-dim">Cost to Complete</p>
          <p className="mt-2 font-display text-3xl text-foreground">{formatAUD(costToComplete)}</p>
          <p className="mt-1 text-xs text-muted">Sum of (Budgeted-mid − Actual) across items not yet paid</p>
        </div>
        <div className="card-surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted-dim">Blocked Items</p>
          <p className="mt-2 font-display text-3xl text-foreground">{blockedItems.length}</p>
          <Link href="/dependencies" className="mt-1 inline-block text-xs text-accent">
            View dependency chain →
          </Link>
        </div>
        <div className="card-surface rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-muted-dim">Categories Trending Over Budget</p>
          <p className="mt-2 font-display text-3xl text-foreground">{flagged.length}</p>
          <Link href="/budget" className="mt-1 inline-block text-xs text-accent">
            View budget →
          </Link>
        </div>
      </div>

      {flagged.length > 0 && (
        <div className="mx-5 mb-2 flex flex-col gap-2 md:mx-8">
          {flagged.map((f) => (
            <div key={f.category} className="flex items-center gap-2.5 rounded-xl border border-warn/30 bg-warn-soft px-4 py-2.5 text-sm text-warn">
              <IconAlert className="h-4 w-4 shrink-0" />
              <span>
                <strong>{f.category}</strong> spend ({formatAUD(f.actual || f.committed)}) is {f.flag === "over" ? "at or past" : "trending toward"} its budgeted-high figure ({formatAUD(f.budgetHigh)}).
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 md:px-8">
        <h2 className="mb-3 font-display text-lg text-foreground">Stage Progress</h2>
        <div className="card-surface flex flex-col divide-y divide-border rounded-2xl">
          {stageProgress.map((s) => (
            <Link
              key={s.id}
              href={`/board?stage=${s.id}`}
              className="flex items-center gap-4 px-4 py-3 transition hover:bg-card-hover"
            >
              <span className="w-6 shrink-0 text-xs text-muted-dim">{s.id}</span>
              <span className="w-44 shrink-0 truncate text-sm text-foreground">{s.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background-elevated">
                <div className="h-full rounded-full bg-accent" style={{ width: `${s.percent}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-muted">
                {s.total ? `${s.complete}/${s.total}` : "—"}
              </span>
              {s.blocked > 0 && (
                <span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] text-danger">
                  {s.blocked} blocked
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 md:px-8">
        <h2 className="mb-3 font-display text-lg text-foreground">Recently Updated Decisions</h2>
        {recentDecisions.length === 0 ? (
          <p className="text-sm text-muted-dim">No decisions logged yet.</p>
        ) : (
          <div className="card-surface flex flex-col divide-y divide-border rounded-2xl">
            {recentDecisions.map((d) => (
              <Link key={d.id} href="/decisions" className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-card-hover">
                <span className="text-foreground">{d.title}</span>
                <span className="text-xs text-muted-dim">{d.version}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
