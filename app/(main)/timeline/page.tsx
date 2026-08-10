"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import { ProjectItem, STAGES } from "@/lib/types";
import { CategoryPill, ProvisionalPill, StatusPill, TypePill } from "@/components/Badges";
import { formatDate } from "@/lib/format";
import { ItemModal } from "@/components/ItemModal";

function computeCriticalPath(items: ProjectItem[]): ProjectItem[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const memo = new Map<string, ProjectItem[]>();

  function chainTo(id: string, guard: Set<string>): ProjectItem[] {
    if (memo.has(id)) return memo.get(id)!;
    if (guard.has(id)) return []; // cycle guard
    const item = byId.get(id);
    if (!item) return [];
    guard.add(id);
    let longest: ProjectItem[] = [];
    for (const depId of item.dependsOn) {
      const chain = chainTo(depId, guard);
      if (chain.length > longest.length) longest = chain;
    }
    const result = [...longest, item];
    memo.set(id, result);
    guard.delete(id);
    return result;
  }

  let best: ProjectItem[] = [];
  for (const item of items) {
    const chain = chainTo(item.id, new Set());
    if (chain.length > best.length) best = chain;
  }
  return best;
}

export default function TimelinePage() {
  const { items } = useData();
  const [editing, setEditing] = useState<ProjectItem | null>(null);

  const criticalPath = useMemo(() => computeCriticalPath(items), [items]);

  const ordered = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      items: items
        .filter((i) => i.stage === stage.id)
        .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999")),
    })).filter((g) => g.items.length > 0);
  }, [items]);

  return (
    <div className="flex flex-1 flex-col pb-12">
      <PageHeader title="Timeline" subtitle="Stage-ordered build sequence with the longest dependency (critical) path highlighted" />

      {criticalPath.length > 1 && (
        <div className="mx-5 mt-5 rounded-2xl border border-accent/30 bg-accent-soft p-4 md:mx-8">
          <p className="mb-2 text-xs uppercase tracking-wide text-accent">Critical Path ({criticalPath.length} steps)</p>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-foreground">
            {criticalPath.map((item, i) => (
              <span key={item.id} className="flex items-center gap-1.5">
                <button className="hover:underline" onClick={() => setEditing(item)}>
                  {item.name}
                </button>
                {i < criticalPath.length - 1 && <span className="text-muted-dim">→</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 px-5 py-5 md:px-8">
        {ordered.map(({ stage, items: stageItems }) => (
          <div key={stage.id}>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-dim">
              Stage {stage.id} · {stage.name}
            </p>
            <div className="card-surface flex flex-col divide-y divide-border rounded-2xl">
              {stageItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEditing(item)}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 text-left transition hover:bg-card-hover"
                >
                  <span className="w-24 shrink-0 text-xs text-muted-dim">{formatDate(item.date)}</span>
                  <span className="min-w-[10rem] flex-1 text-sm text-foreground">{item.name}</span>
                  <TypePill type={item.type} />
                  <StatusPill status={item.status} />
                  <CategoryPill category={item.category} />
                  {item.provisional && <ProvisionalPill />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && <ItemModal item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
