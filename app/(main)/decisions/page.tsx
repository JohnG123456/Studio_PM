"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import { CATEGORIES, Decision, NewDecision } from "@/lib/types";
import { CategoryPill } from "@/components/Badges";
import { formatDate } from "@/lib/format";
import { IconPlus, IconTrash } from "@/components/icons";
import { FieldLabel, PlainInput, PlainSelect, PlainTextarea, PrimaryButton, SecondaryButton } from "@/components/FormControls";

export default function DecisionsPage() {
  const { decisions, addDecision, deleteDecision } = useData();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? decisions.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.tags.some((t) => t.toLowerCase().includes(q)) ||
            (d.category ?? "").toLowerCase().includes(q)
        )
      : decisions;
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [decisions, query]);

  return (
    <div className="flex flex-1 flex-col pb-12">
      <PageHeader
        title="Decisions Log"
        subtitle="Mirrors Master Summary Section 20 (Resolved from Previous Versions) — locked, not the active work zone"
        actions={
          <SecondaryButton onClick={() => setAdding((v) => !v)}>
            <span className="flex items-center gap-1.5">
              <IconPlus className="h-3.5 w-3.5" /> Log decision
            </span>
          </SecondaryButton>
        }
      />

      <div className="px-5 pt-5 md:px-8">
        <PlainInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search decisions, categories, tags…"
        />
      </div>

      {adding && (
        <div className="px-5 pt-4 md:px-8">
          <NewDecisionForm
            onCancel={() => setAdding(false)}
            onSave={(payload) => {
              addDecision(payload);
              setAdding(false);
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 px-5 py-5 md:px-8">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-dim">No decisions match.</p>
        ) : (
          filtered.map((d) => <DecisionCard key={d.id} decision={d} onDelete={deleteDecision} />)
        )}
      </div>
    </div>
  );
}

function DecisionCard({ decision, onDelete }: { decision: Decision; onDelete: (id: string) => void }) {
  return (
    <div className="card-surface rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{decision.title}</p>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-dim">{decision.version}</span>
            <CategoryPill category={decision.category} />
          </div>
          <p className="mt-1.5 text-sm text-muted">{decision.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-dim">
            {decision.resolvedDate && <span>Resolved {formatDate(decision.resolvedDate)}</span>}
            {decision.tags.map((t) => (
              <span key={t} className="rounded-full bg-card-hover px-2 py-0.5">
                #{t}
              </span>
            ))}
          </div>
        </div>
        <button onClick={() => onDelete(decision.id)} className="shrink-0 text-muted-dim hover:text-danger">
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function NewDecisionForm({ onCancel, onSave }: { onCancel: () => void; onSave: (payload: NewDecision) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [version, setVersion] = useState("v14");
  const [tags, setTags] = useState("");

  return (
    <div className="card-surface rounded-2xl p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <FieldLabel>Title</FieldLabel>
          <PlainInput value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <FieldLabel>Master Summary version</FieldLabel>
            <PlainInput value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v14" />
          </div>
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Description</FieldLabel>
          <PlainTextarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <FieldLabel hint="comma separated">Tags</FieldLabel>
          <PlainInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="acoustics, false-wall" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <PrimaryButton
          disabled={!title.trim()}
          onClick={() =>
            onSave({
              title: title.trim(),
              description: description.trim(),
              category: category || undefined,
              version: version.trim() || "unversioned",
              tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
        >
          Save
        </PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      </div>
    </div>
  );
}
