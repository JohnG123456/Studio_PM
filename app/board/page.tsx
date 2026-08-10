"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import { COMPLETE_STATUSES, ProjectItem, STAGES } from "@/lib/types";
import { CategoryPill, ProvisionalPill, StatusPill, TypePill } from "@/components/Badges";
import { IconPlus } from "@/components/icons";
import { ItemModal } from "@/components/ItemModal";

function BoardContent() {
  const { items } = useData();
  const searchParams = useSearchParams();
  const highlightStage = searchParams.get("stage");

  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [addingStage, setAddingStage] = useState<number | null>(null);

  const byStage = useMemo(() => {
    const map = new Map<number, ProjectItem[]>();
    for (const stage of STAGES) map.set(stage.id, []);
    for (const item of items) {
      map.set(item.stage, [...(map.get(item.stage) ?? []), item]);
    }
    return map;
  }, [items]);

  const blockedIds = useMemo(() => {
    const ids = new Set<string>();
    const byId = new Map(items.map((i) => [i.id, i]));
    for (const item of items) {
      const stillBlocked = item.dependsOn.some((depId) => {
        const dep = byId.get(depId);
        return dep && !COMPLETE_STATUSES.includes(dep.status);
      });
      if (stillBlocked) ids.add(item.id);
    }
    return ids;
  }, [items]);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Board" subtitle="Kanban by build stage — the primary working view" />
      <div className="flex flex-1 gap-4 overflow-x-auto px-5 py-5 md:px-8">
        {STAGES.map((stage) => {
          const stageItems = byStage.get(stage.id) ?? [];
          return (
            <div
              key={stage.id}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border ${
                highlightStage === String(stage.id) ? "border-accent" : "border-border"
              } bg-background-elevated`}
            >
              <div className="border-b border-border px-3.5 py-3">
                <p className="text-xs text-muted-dim">Stage {stage.id}</p>
                <p className="text-sm font-medium text-foreground">{stage.name}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2.5">
                {stageItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setEditing(item)}
                    className="card-surface rounded-xl p-3 text-left transition hover:bg-card-hover"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <TypePill type={item.type} />
                      {item.provisional && <ProvisionalPill />}
                    </div>
                    <p className="text-sm text-foreground">{item.name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusPill status={blockedIds.has(item.id) && item.status !== "blocked" ? "blocked" : item.status} />
                      <CategoryPill category={item.category} />
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setAddingStage(stage.id)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs text-muted-dim hover:text-foreground"
                >
                  <IconPlus className="h-3.5 w-3.5" /> Add item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <ItemModal item={editing} onClose={() => setEditing(null)} />}
      {addingStage !== null && (
        <ItemModal defaultStage={addingStage} onClose={() => setAddingStage(null)} />
      )}
    </div>
  );
}

export default function BoardPage() {
  return (
    <Suspense fallback={null}>
      <BoardContent />
    </Suspense>
  );
}
