"use client";

import { useMemo, useRef, useState } from "react";
import { useData } from "@/lib/data/DataProvider";
import { PageHeader } from "@/components/PageHeader";
import { GearSnapshotItem, PlanningIngestBlock } from "@/lib/types";
import { PlainTextarea, PrimaryButton, SecondaryButton } from "@/components/FormControls";
import { formatDate } from "@/lib/format";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 pb-16">
      <PageHeader
        title="Settings"
        subtitle="Storage: local JSON in this browser (localStorage). No auth/cloud layer — same single-device model as the Studio Inventory app."
      />
      <div className="flex flex-col gap-8 px-5 md:px-8">
        <PlanningIngestSection />
        <GearReconciliationSection />
        <BackupSection />
      </div>
    </div>
  );
}

function PlanningIngestSection() {
  const { ingestPlanningBlocks } = useData();
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleIngest() {
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(raw);
      const blocks: PlanningIngestBlock[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const b of blocks) {
        if (typeof b.item !== "string" || typeof b.status !== "string") {
          throw new Error('Each block needs at least "item" and "status" fields.');
        }
        if (b.stage && b.stage !== "Planning & Approval") {
          // Non-fatal — the Planning Agent only emits Stage 0, but warn if it drifts.
          console.warn(`Planning ingest: unexpected stage "${b.stage}", writing to Stage 0 anyway.`);
        }
      }
      const outcome = ingestPlanningBlocks(blocks);
      setResult(outcome);
      setRaw("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't parse that as JSON.");
    }
  }

  return (
    <section>
      <h2 className="mb-1 font-display text-lg text-foreground">Planning Project Ingestion</h2>
      <p className="mb-3 text-sm text-muted">
        Paste the status block(s) emitted by the Armadale Planning Agent. Accepts a single object or a JSON array.
        Always writes into Stage 0 (Planning & Approval) — matches an existing item by name (case-insensitive) or
        creates a new one.
      </p>
      <pre className="mb-3 overflow-x-auto rounded-xl bg-background-elevated p-3 text-xs text-muted-dim">
{`{"stage": "Planning & Approval", "item": "BAL assessment", "status": "submitted", "date": "2026-08-01", "notes": "Lodged with council"}`}
      </pre>
      <PlainTextarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste JSON block(s) here…"
        className="min-h-32 font-mono text-xs"
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {result && (
        <p className="mt-2 text-xs text-good">
          Ingested — {result.created} created, {result.updated} updated.
        </p>
      )}
      <div className="mt-3">
        <PrimaryButton onClick={handleIngest} disabled={!raw.trim()}>
          Ingest into Stage 0
        </PrimaryButton>
      </div>
    </section>
  );
}

function GearReconciliationSection() {
  const { gearSnapshot, importGearSnapshot, items } = useData();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gearItems = useMemo(() => items.filter((i) => i.type === "gear" && i.gearItemId), [items]);
  const snapshotIds = useMemo(() => new Set((gearSnapshot?.items ?? []).map((g) => g.id)), [gearSnapshot]);

  function parseAndImport(text: string) {
    setError(null);
    try {
      const parsed = JSON.parse(text);
      const list: GearSnapshotItem[] = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(list)) throw new Error("Expected a JSON array of gear items.");
      const cleaned = list.map((g) => ({
        id: String(g.id),
        name: String(g.name ?? "Untitled"),
        brand: g.brand,
        model: g.model,
        category: g.category,
        area: g.area,
        location: g.location,
        status: g.status,
        purchasePrice: g.purchasePrice,
        manualValue: g.manualValue,
      }));
      importGearSnapshot(cleaned);
      setRaw("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't parse that as JSON.");
    }
  }

  function handleFile(file: File) {
    file.text().then(parseAndImport);
  }

  return (
    <section>
      <h2 className="mb-1 font-display text-lg text-foreground">Inventory App Reconciliation</h2>
      <p className="mb-3 text-sm text-muted">
        Both apps are local-first and single-device by default, so gear-type items link by reference (
        <code className="text-xs">gearItemId</code>) into a periodically-imported snapshot rather than a live query.
        In the Studio Inventory app, use <em>More → Export inventory as JSON</em>, then paste or upload that file
        here. Re-import any time to refresh — this is a manual sync trigger, not an automatic bidirectional link.
      </p>

      <div className="card-surface mb-3 rounded-2xl p-4">
        <p className="text-sm text-foreground">
          {gearSnapshot ? `${gearSnapshot.items.length} gear items in snapshot` : "No snapshot imported yet"}
        </p>
        {gearSnapshot && <p className="text-xs text-muted-dim">Last imported {formatDate(gearSnapshot.importedAt)}</p>}

        {gearItems.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
            <p className="text-xs uppercase tracking-wide text-muted-dim">Linked gear-type items</p>
            {gearItems.map((item) => {
              const stale = !snapshotIds.has(item.gearItemId!);
              return (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{item.name}</span>
                  <span className={stale ? "text-danger" : "text-good"}>
                    {stale ? "Not found in latest snapshot" : "Linked"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PlainTextarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste the exported gear JSON array here…"
        className="min-h-24 font-mono text-xs"
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <div className="mt-3 flex gap-2">
        <PrimaryButton onClick={() => parseAndImport(raw)} disabled={!raw.trim()}>
          Import Snapshot
        </PrimaryButton>
        <SecondaryButton onClick={() => fileInputRef.current?.click()}>Upload file…</SecondaryButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}

function BackupSection() {
  const { exportAll, importAll, resetToSeed } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleImportFile(file: File) {
    file.text().then((text) => {
      try {
        importAll(text);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't parse that file.");
      }
    });
  }

  return (
    <section>
      <h2 className="mb-1 font-display text-lg text-foreground">Backup & Reset</h2>
      <p className="mb-3 text-sm text-muted">
        Everything lives in this browser&apos;s localStorage as plain JSON. Export regularly — clearing browser data
        wipes it.
      </p>
      {error && <p className="mb-2 text-xs text-danger">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <PrimaryButton
          onClick={() => download(`studio-pm-${new Date().toISOString().slice(0, 10)}.json`, exportAll())}
        >
          Export all data as JSON
        </PrimaryButton>
        <SecondaryButton onClick={() => fileInputRef.current?.click()}>Import backup…</SecondaryButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImportFile(file);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => {
            if (confirm("Reset all data back to the seed dataset? This can't be undone.")) resetToSeed();
          }}
          className="rounded-full border border-danger/40 px-4 py-2.5 text-sm text-danger"
        >
          Reset to seed data
        </button>
      </div>
    </section>
  );
}
