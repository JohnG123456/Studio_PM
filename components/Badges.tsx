import { ITEM_STATUS_LABELS, ItemStatus, ItemType } from "@/lib/types";

const STATUS_TONE: Record<ItemStatus, string> = {
  not_started: "bg-card-hover text-muted-dim border-border",
  in_progress: "bg-info-soft text-info border-transparent",
  submitted: "bg-warn-soft text-warn border-transparent",
  approved: "bg-good-soft text-good border-transparent",
  blocked: "bg-danger-soft text-danger border-transparent",
  done: "bg-good-soft text-good border-transparent",
};

export function StatusPill({ status }: { status: ItemStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_TONE[status]}`}>
      {ITEM_STATUS_LABELS[status]}
    </span>
  );
}

const TYPE_LABEL: Record<ItemType, string> = { gear: "Gear", task: "Task", decision: "Decision" };
const TYPE_TONE: Record<ItemType, string> = {
  gear: "bg-accent-soft text-accent",
  task: "bg-card-hover text-muted",
  decision: "bg-info-soft text-info",
};

export function TypePill({ type }: { type: ItemType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_TONE[type]}`}>
      {TYPE_LABEL[type]}
    </span>
  );
}

export function ProvisionalPill() {
  return (
    <span className="inline-flex items-center rounded-full border border-warn/40 bg-warn-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warn">
      Provisional
    </span>
  );
}

export function CategoryPill({ category }: { category?: string }) {
  if (!category) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
      {category}
    </span>
  );
}
