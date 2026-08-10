"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BudgetLineItem,
  Decision,
  GearSnapshot,
  GearSnapshotItem,
  NewBudgetLineItem,
  NewDecision,
  NewProjectItem,
  PlanningIngestBlock,
  ProjectItem,
} from "../types";
import { buildDemoBudget, buildDemoDecisions, buildDemoItems } from "./demoData";

const KEYS = {
  items: "studio-pm:items:v1",
  decisions: "studio-pm:decisions:v1",
  budget: "studio-pm:budget:v1",
  gearSnapshot: "studio-pm:gear-snapshot:v1",
} as const;

function nowIso() {
  return new Date().toISOString();
}

function genId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function loadLocal<T>(key: string, seed: () => T): T {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      const seeded = seed();
      window.localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed();
  }
}

function saveLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

interface DataContextValue {
  ready: boolean;

  items: ProjectItem[];
  addItem: (item: NewProjectItem) => ProjectItem;
  updateItem: (id: string, patch: Partial<NewProjectItem>) => void;
  deleteItem: (id: string) => void;

  decisions: Decision[];
  addDecision: (d: NewDecision) => Decision;
  updateDecision: (id: string, patch: Partial<NewDecision>) => void;
  deleteDecision: (id: string) => void;

  budget: BudgetLineItem[];
  addBudgetLine: (b: NewBudgetLineItem) => BudgetLineItem;
  updateBudgetLine: (id: string, patch: Partial<NewBudgetLineItem>) => void;
  deleteBudgetLine: (id: string) => void;

  gearSnapshot: GearSnapshot | null;
  importGearSnapshot: (items: GearSnapshotItem[]) => void;

  ingestPlanningBlocks: (blocks: PlanningIngestBlock[]) => { created: number; updated: number };

  exportAll: () => string;
  importAll: (json: string) => void;
  resetToSeed: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [budget, setBudget] = useState<BudgetLineItem[]>([]);
  const [gearSnapshot, setGearSnapshot] = useState<GearSnapshot | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser-only localStorage after mount
    setItems(loadLocal(KEYS.items, buildDemoItems));
    setDecisions(loadLocal(KEYS.decisions, buildDemoDecisions));
    setBudget(loadLocal(KEYS.budget, buildDemoBudget));
    setGearSnapshot(loadLocal<GearSnapshot | null>(KEYS.gearSnapshot, () => null));
    setReady(true);
  }, []);

  const persistItems = useCallback((next: ProjectItem[]) => {
    setItems(next);
    saveLocal(KEYS.items, next);
  }, []);
  const persistDecisions = useCallback((next: Decision[]) => {
    setDecisions(next);
    saveLocal(KEYS.decisions, next);
  }, []);
  const persistBudget = useCallback((next: BudgetLineItem[]) => {
    setBudget(next);
    saveLocal(KEYS.budget, next);
  }, []);

  // ---- items ----
  const addItem = useCallback(
    (item: NewProjectItem): ProjectItem => {
      const created: ProjectItem = { ...item, id: genId(), createdAt: nowIso(), updatedAt: nowIso() };
      setItems((prev) => {
        const next = [...prev, created];
        saveLocal(KEYS.items, next);
        return next;
      });
      return created;
    },
    []
  );

  const updateItem = useCallback((id: string, patch: Partial<NewProjectItem>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i));
      saveLocal(KEYS.items, next);
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => {
      // Also clear this id out of any dependsOn lists that referenced it.
      const next = prev
        .filter((i) => i.id !== id)
        .map((i) => (i.dependsOn.includes(id) ? { ...i, dependsOn: i.dependsOn.filter((d) => d !== id) } : i));
      saveLocal(KEYS.items, next);
      return next;
    });
  }, []);

  // ---- decisions ----
  const addDecision = useCallback((d: NewDecision): Decision => {
    const created: Decision = { ...d, id: genId(), createdAt: nowIso(), updatedAt: nowIso() };
    setDecisions((prev) => {
      const next = [...prev, created];
      saveLocal(KEYS.decisions, next);
      return next;
    });
    return created;
  }, []);

  const updateDecision = useCallback((id: string, patch: Partial<NewDecision>) => {
    setDecisions((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowIso() } : d));
      saveLocal(KEYS.decisions, next);
      return next;
    });
  }, []);

  const deleteDecision = useCallback((id: string) => {
    setDecisions((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveLocal(KEYS.decisions, next);
      return next;
    });
  }, []);

  // ---- budget ----
  const addBudgetLine = useCallback((b: NewBudgetLineItem): BudgetLineItem => {
    const created: BudgetLineItem = { ...b, id: genId(), createdAt: nowIso(), updatedAt: nowIso() };
    setBudget((prev) => {
      const next = [...prev, created];
      saveLocal(KEYS.budget, next);
      return next;
    });
    return created;
  }, []);

  const updateBudgetLine = useCallback((id: string, patch: Partial<NewBudgetLineItem>) => {
    setBudget((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: nowIso() } : b));
      saveLocal(KEYS.budget, next);
      return next;
    });
  }, []);

  const deleteBudgetLine = useCallback((id: string) => {
    setBudget((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveLocal(KEYS.budget, next);
      return next;
    });
  }, []);

  // ---- gear snapshot (reconciliation with the Inventory app) ----
  const importGearSnapshot = useCallback((snapItems: GearSnapshotItem[]) => {
    const snap: GearSnapshot = { importedAt: nowIso(), items: snapItems };
    setGearSnapshot(snap);
    saveLocal(KEYS.gearSnapshot, snap);
  }, []);

  // ---- Planning Agent ingestion ----
  const ingestPlanningBlocks = useCallback(
    (blocks: PlanningIngestBlock[]) => {
      let created = 0;
      let updated = 0;
      setItems((prev) => {
        let next = [...prev];
        for (const block of blocks) {
          if (!block.item || !block.item.trim()) continue;
          const existingIdx = next.findIndex(
            (i) => i.stage === 0 && i.name.trim().toLowerCase() === block.item.trim().toLowerCase()
          );
          if (existingIdx >= 0) {
            next[existingIdx] = {
              ...next[existingIdx],
              status: block.status,
              date: block.date || next[existingIdx].date,
              notes: block.notes || next[existingIdx].notes,
              sourceVersion: "Planning Agent",
              updatedAt: nowIso(),
            };
            updated += 1;
          } else {
            next = [
              ...next,
              {
                id: genId(),
                stage: 0,
                name: block.item.trim(),
                type: "task",
                status: block.status,
                date: block.date || undefined,
                notes: block.notes || undefined,
                dependsOn: [],
                sourceVersion: "Planning Agent",
                createdAt: nowIso(),
                updatedAt: nowIso(),
              },
            ];
            created += 1;
          }
        }
        saveLocal(KEYS.items, next);
        return next;
      });
      return { created, updated };
    },
    []
  );

  // ---- whole-app export/import (backup + portability) ----
  const exportAll = useCallback((): string => {
    return JSON.stringify(
      {
        exportedAt: nowIso(),
        items,
        decisions,
        budget,
        gearSnapshot,
      },
      null,
      2
    );
  }, [items, decisions, budget, gearSnapshot]);

  const importAll = useCallback((json: string) => {
    const parsed = JSON.parse(json) as {
      items?: ProjectItem[];
      decisions?: Decision[];
      budget?: BudgetLineItem[];
      gearSnapshot?: GearSnapshot | null;
    };
    if (parsed.items) persistItems(parsed.items);
    if (parsed.decisions) persistDecisions(parsed.decisions);
    if (parsed.budget) persistBudget(parsed.budget);
    if (parsed.gearSnapshot !== undefined) {
      setGearSnapshot(parsed.gearSnapshot);
      saveLocal(KEYS.gearSnapshot, parsed.gearSnapshot);
    }
  }, [persistItems, persistDecisions, persistBudget]);

  const resetToSeed = useCallback(() => {
    persistItems(buildDemoItems());
    persistDecisions(buildDemoDecisions());
    persistBudget(buildDemoBudget());
    setGearSnapshot(null);
    saveLocal(KEYS.gearSnapshot, null);
  }, [persistItems, persistDecisions, persistBudget]);

  const value: DataContextValue = useMemo(
    () => ({
      ready,
      items,
      addItem,
      updateItem,
      deleteItem,
      decisions,
      addDecision,
      updateDecision,
      deleteDecision,
      budget,
      addBudgetLine,
      updateBudgetLine,
      deleteBudgetLine,
      gearSnapshot,
      importGearSnapshot,
      ingestPlanningBlocks,
      exportAll,
      importAll,
      resetToSeed,
    }),
    [
      ready,
      items,
      addItem,
      updateItem,
      deleteItem,
      decisions,
      addDecision,
      updateDecision,
      deleteDecision,
      budget,
      addBudgetLine,
      updateBudgetLine,
      deleteBudgetLine,
      gearSnapshot,
      importGearSnapshot,
      ingestPlanningBlocks,
      exportAll,
      importAll,
      resetToSeed,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
