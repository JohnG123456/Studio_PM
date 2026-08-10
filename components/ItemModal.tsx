"use client";

import { useEffect, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { CATEGORIES, ITEM_STATUS_LABELS, ItemStatus, ItemType, NewProjectItem, ProjectItem, STAGES } from "@/lib/types";
import { FieldLabel, PlainInput, PlainSelect, PlainTextarea, PrimaryButton, SecondaryButton } from "./FormControls";
import { IconTrash, IconX } from "./icons";
import { getErrorMessage } from "@/lib/errors";

const STATUS_OPTIONS: ItemStatus[] = ["not_started", "in_progress", "submitted", "approved", "blocked", "done"];
const TYPE_OPTIONS: ItemType[] = ["task", "gear", "decision"];

export function ItemModal({
  item,
  defaultStage,
  onClose,
}: {
  item?: ProjectItem;
  defaultStage?: number;
  onClose: () => void;
}) {
  const { items, addItem, updateItem, deleteItem, availableGearItems, gearSource } = useData();
  const isEdit = Boolean(item);

  const [name, setName] = useState(item?.name ?? "");
  const [type, setType] = useState<ItemType>(item?.type ?? "task");
  const [stage, setStage] = useState<number>(item?.stage ?? defaultStage ?? 0);
  const [status, setStatus] = useState<ItemStatus>(item?.status ?? "not_started");
  const [category, setCategory] = useState(item?.category ?? "");
  const [date, setDate] = useState(item?.date ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [dependsOn, setDependsOn] = useState<string[]>(item?.dependsOn ?? []);
  const [gearItemId, setGearItemId] = useState(item?.gearItemId ?? "");
  const [provisional, setProvisional] = useState(item?.provisional ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const candidateDeps = items.filter((i) => i.id !== item?.id);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const payload: NewProjectItem = {
      name: name.trim(),
      type,
      stage,
      status,
      category: category || undefined,
      date: date || undefined,
      notes: notes || undefined,
      dependsOn,
      gearItemId: type === "gear" ? gearItemId || undefined : undefined,
      provisional,
      sourceVersion: item?.sourceVersion,
    };
    try {
      if (isEdit && item) {
        await updateItem(item.id, payload);
      } else {
        await addItem(payload);
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!confirm(`Delete "${item.name}"? Any items depending on it will be unblocked.`)) return;
    try {
      await deleteItem(item.id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8" onClick={onClose}>
      <div
        className="card-surface w-full max-w-lg rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-foreground">{isEdit ? "Edit Item" : "New Item"}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-dim">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <FieldLabel>Name</FieldLabel>
            <PlainInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Confirm booth lighting spec" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Type</FieldLabel>
              <PlainSelect value={type} onChange={(e) => setType(e.target.value as ItemType)}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </PlainSelect>
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <PlainSelect value={status} onChange={(e) => setStatus(e.target.value as ItemStatus)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {ITEM_STATUS_LABELS[s]}
                  </option>
                ))}
              </PlainSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Stage</FieldLabel>
              <PlainSelect value={stage} onChange={(e) => setStage(Number(e.target.value))}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id}. {s.name}
                  </option>
                ))}
              </PlainSelect>
            </div>
            <div>
              <FieldLabel>Category</FieldLabel>
              <PlainSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </PlainSelect>
            </div>
          </div>

          <div>
            <FieldLabel hint="Optional">Date</FieldLabel>
            <PlainInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {type === "gear" && (
            <div>
              <FieldLabel
                hint={
                  availableGearItems.length > 0
                    ? `${availableGearItems.length} items ${gearSource === "live" ? "synced live" : "available"}`
                    : gearSource === "live"
                      ? "No gear found in your Inventory app account yet"
                      : "Import a gear snapshot in Settings first"
                }
              >
                Linked Inventory item
              </FieldLabel>
              <PlainSelect value={gearItemId} onChange={(e) => setGearItemId(e.target.value)}>
                <option value="">— none —</option>
                {availableGearItems.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.brand ? `(${g.brand})` : ""}
                  </option>
                ))}
              </PlainSelect>
            </div>
          )}

          <div>
            <FieldLabel hint="Items that must complete before this one can start">Blocked by</FieldLabel>
            <select
              multiple
              value={dependsOn}
              onChange={(e) => setDependsOn(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="h-28 w-full rounded-xl border border-border bg-background-elevated px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
            >
              {candidateDeps.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.stage}] {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={provisional} onChange={(e) => setProvisional(e.target.checked)} />
            Provisional — geometry/dimensions TBD pending room confirmation
          </label>

          <div>
            <FieldLabel hint="Optional">Notes</FieldLabel>
            <PlainTextarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}

        <div className="mt-5 flex items-center justify-between gap-2">
          {isEdit ? (
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-danger">
              <IconTrash className="h-3.5 w-3.5" /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving…" : "Save"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
