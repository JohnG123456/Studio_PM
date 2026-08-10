"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import { COMPLETE_STATUSES, ProjectItem, stageName } from "@/lib/types";
import { StatusPill, TypePill } from "@/components/Badges";
import { ItemModal } from "@/components/ItemModal";
import { IconAlert } from "@/components/icons";

export default function DependenciesPage() {
  const { items } = useData();
  const [editing, setEditing] = useState<ProjectItem | null>(null);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const blockers = useMemo(() => {
    const map = new Map<string, ProjectItem[]>(); // itemId -> items that depend on it
    for (const item of items) {
      for (const depId of item.dependsOn) {
        map.set(depId, [...(map.get(depId) ?? []), item]);
      }
    }
    return map;
  }, [items]);

  const isBlocked = (item: ProjectItem) =>
    item.dependsOn.some((depId) => {
      const dep = byId.get(depId);
      return dep && !COMPLETE_STATUSES.includes(dep.status);
    });

  const blockedNow = items.filter((i) => i.dependsOn.length > 0 && isBlocked(i));
  const chainItems = items.filter((i) => i.dependsOn.length > 0 || (blockers.get(i.id)?.length ?? 0) > 0);

  return (
    <div className="flex flex-1 flex-col pb-12">
      <PageHeader title="Dependencies" subtitle="Hard sequencing rules — what's blocked, and what unblocks it" />

      <div className="px-5 py-5 md:px-8">
        <h2 className="mb-3 font-display text-lg text-foreground">
          Currently Blocked <span className="text-sm text-muted-dim">({blockedNow.length})</span>
        </h2>
        {blockedNow.length === 0 ? (
          <p className="text-sm text-muted-dim">Nothing is currently blocked.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {blockedNow.map((item) => (
              <div key={item.id} className="card-surface rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <IconAlert className="h-4 w-4 text-danger" />
                  <button className="text-sm font-medium text-foreground hover:underline" onClick={() => setEditing(item)}>
                    {item.name}
                  </button>
                  <TypePill type={item.type} />
                  <span className="text-xs text-muted-dim">Stage {item.stage} · {stageName(item.stage)}</span>
                </div>
                <div className="mt-2.5 flex flex-col gap-1.5 pl-6">
                  {item.dependsOn.map((depId) => {
                    const dep = byId.get(depId);
                    if (!dep) return null;
                    const done = COMPLETE_STATUSES.includes(dep.status);
                    return (
                      <button
                        key={depId}
                        onClick={() => setEditing(dep)}
                        className="flex items-center gap-2 text-left text-xs"
                      >
                        <span className={done ? "text-good" : "text-muted"}>
                          {done ? "✓" : "○"} Waiting on: {dep.name}
                        </span>
                        <StatusPill status={dep.status} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-5 md:px-8">
        <h2 className="mb-3 font-display text-lg text-foreground">Full Dependency Chain</h2>
        {chainItems.length === 0 ? (
          <p className="text-sm text-muted-dim">No dependency relationships recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {chainItems.map((item) => {
              const dependents = blockers.get(item.id) ?? [];
              return (
                <div key={item.id} className="card-surface rounded-2xl p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="text-sm font-medium text-foreground hover:underline" onClick={() => setEditing(item)}>
                      {item.name}
                    </button>
                    <StatusPill status={item.status} />
                    <span className="text-xs text-muted-dim">Stage {item.stage}</span>
                  </div>
                  {item.dependsOn.length > 0 && (
                    <p className="mt-1.5 pl-1 text-xs text-muted">
                      Blocked by: {item.dependsOn.map((id) => byId.get(id)?.name ?? "?").join(", ")}
                    </p>
                  )}
                  {dependents.length > 0 && (
                    <p className="mt-1 pl-1 text-xs text-muted">
                      Unblocks: {dependents.map((d) => d.name).join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && <ItemModal item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
