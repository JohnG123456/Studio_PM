"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
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
import { isSupabaseConfigured } from "../supabase/config";
import { getSupabaseBrowserClient } from "../supabase/client";
import {
  BudgetLineRow,
  budgetLineToRow,
  DecisionRow,
  decisionToRow,
  InventoryItemRow,
  ProjectItemRow,
  projectItemToRow,
  rowToBudgetLine,
  rowToDecision,
  rowToGearSnapshotItem,
  rowToProjectItem,
} from "./mapRow";
import { buildDemoBudget, buildDemoDecisions, buildDemoItems } from "./demoData";

const KEYS = {
  items: "studio-pm:items:v1",
  decisions: "studio-pm:decisions:v1",
  budget: "studio-pm:budget:v1",
  gearSnapshot: "studio-pm:gear-snapshot:v1",
} as const;

type AuthResult = { error?: string };

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
  mode: "cloud" | "local";
  ready: boolean;
  authed: boolean;
  userEmail?: string;

  items: ProjectItem[];
  addItem: (item: NewProjectItem) => Promise<ProjectItem>;
  updateItem: (id: string, patch: Partial<NewProjectItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  decisions: Decision[];
  addDecision: (d: NewDecision) => Promise<Decision>;
  updateDecision: (id: string, patch: Partial<NewDecision>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;

  budget: BudgetLineItem[];
  addBudgetLine: (b: NewBudgetLineItem) => Promise<BudgetLineItem>;
  updateBudgetLine: (id: string, patch: Partial<NewBudgetLineItem>) => Promise<void>;
  deleteBudgetLine: (id: string) => Promise<void>;

  // Gear reconciliation with the Inventory app. In cloud mode (same
  // Supabase project as the Inventory app) this is a live read-only query
  // against its `items` table. In local mode it's a manually imported
  // snapshot, cached in localStorage.
  gearSource: "live" | "manual";
  availableGearItems: GearSnapshotItem[];
  gearSnapshot: GearSnapshot | null; // local mode only
  importGearSnapshot: (items: GearSnapshotItem[]) => void; // local mode only
  refreshInventoryGear: () => Promise<void>; // cloud mode only

  ingestPlanningBlocks: (blocks: PlanningIngestBlock[]) => Promise<{ created: number; updated: number }>;

  exportAll: () => string;
  importAll: (json: string) => void; // local mode only
  resetToSeed: () => void; // local mode only

  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const cloud = isSupabaseConfigured();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(!cloud);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [budget, setBudget] = useState<BudgetLineItem[]>([]);
  const [gearSnapshot, setGearSnapshot] = useState<GearSnapshot | null>(null);
  const [inventoryItems, setInventoryItems] = useState<GearSnapshotItem[]>([]);

  // ---- local (no backend configured) mode ----
  useEffect(() => {
    if (cloud) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser-only localStorage after mount
    setItems(loadLocal(KEYS.items, buildDemoItems));
    setDecisions(loadLocal(KEYS.decisions, buildDemoDecisions));
    setBudget(loadLocal(KEYS.budget, buildDemoBudget));
    setGearSnapshot(loadLocal<GearSnapshot | null>(KEYS.gearSnapshot, () => null));
    setReady(true);
  }, [cloud]);

  // ---- cloud (Supabase) mode ----
  const fetchInventoryItems = useCallback(async (uid: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("items")
      .select("id,name,brand,model,category,area,location,status,purchase_price,manual_value")
      .eq("user_id", uid);
    setInventoryItems(((data ?? []) as InventoryItemRow[]).map(rowToGearSnapshotItem));
  }, []);

  useEffect(() => {
    if (!cloud) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    async function loadAccountData(uid: string) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const [itemsRes, decisionsRes, budgetRes] = await Promise.all([
        supabase.from("project_items").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
        supabase.from("decisions").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
        supabase.from("budget_lines").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;

      const isEmpty =
        (itemsRes.data ?? []).length === 0 &&
        (decisionsRes.data ?? []).length === 0 &&
        (budgetRes.data ?? []).length === 0;

      if (isEmpty) {
        // Fresh account — seed it from the real Master Summary v14 /
        // Clean_Budget_v7_4 data, same as a fresh local browser gets.
        const seedItems = buildDemoItems();
        const seedDecisions = buildDemoDecisions();
        const seedBudget = buildDemoBudget();
        await Promise.all([
          supabase.from("project_items").insert(seedItems.map((i) => ({ id: i.id, ...projectItemToRow(i, uid) }))),
          supabase.from("decisions").insert(seedDecisions.map((d) => ({ id: d.id, ...decisionToRow(d, uid) }))),
          supabase.from("budget_lines").insert(seedBudget.map((b) => ({ id: b.id, ...budgetLineToRow(b, uid) }))),
        ]);
        if (cancelled) return;
        const [reItems, reDecisions, reBudget] = await Promise.all([
          supabase.from("project_items").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
          supabase.from("decisions").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
          supabase.from("budget_lines").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
        ]);
        if (cancelled) return;
        setItems(((reItems.data ?? []) as ProjectItemRow[]).map(rowToProjectItem));
        setDecisions(((reDecisions.data ?? []) as DecisionRow[]).map(rowToDecision));
        setBudget(((reBudget.data ?? []) as BudgetLineRow[]).map(rowToBudgetLine));
      } else {
        setItems(((itemsRes.data ?? []) as ProjectItemRow[]).map(rowToProjectItem));
        setDecisions(((decisionsRes.data ?? []) as DecisionRow[]).map(rowToDecision));
        setBudget(((budgetRes.data ?? []) as BudgetLineRow[]).map(rowToBudgetLine));
      }

      await fetchInventoryItems(uid);
      if (cancelled) return;
      setReady(true);
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session;
      if (session?.user) {
        setAuthed(true);
        setUserEmail(session.user.email ?? undefined);
        setUserId(session.user.id);
        loadAccountData(session.user.id);
      } else {
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (session?.user) {
        setAuthed(true);
        setUserEmail(session.user.email ?? undefined);
        setUserId(session.user.id);
        loadAccountData(session.user.id);
      } else {
        setAuthed(false);
        setUserEmail(undefined);
        setUserId(undefined);
        setItems([]);
        setDecisions([]);
        setBudget([]);
        setInventoryItems([]);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [cloud, fetchInventoryItems]);

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
    async (item: NewProjectItem): Promise<ProjectItem> => {
      const id = genId();
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !userId) throw new Error("Not signed in");
        const { data, error } = await supabase
          .from("project_items")
          .insert({ id, ...projectItemToRow(item, userId) })
          .select()
          .single();
        if (error) throw error;
        const created = rowToProjectItem(data as ProjectItemRow);
        setItems((prev) => [...prev, created]);
        return created;
      }
      const created: ProjectItem = { ...item, id, createdAt: nowIso(), updatedAt: nowIso() };
      setItems((prev) => {
        const next = [...prev, created];
        saveLocal(KEYS.items, next);
        return next;
      });
      return created;
    },
    [cloud, userId]
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<NewProjectItem>) => {
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        const existing = items.find((i) => i.id === id);
        if (!supabase || !userId || !existing) return;
        const merged: NewProjectItem = { ...existing, ...patch };
        const { data, error } = await supabase
          .from("project_items")
          .update(projectItemToRow(merged, userId))
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        const updated = rowToProjectItem(data as ProjectItemRow);
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
        return;
      }
      setItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i));
        saveLocal(KEYS.items, next);
        return next;
      });
    },
    [cloud, userId, items]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        const { error } = await supabase.from("project_items").delete().eq("id", id);
        if (error) throw error;
        // Also clear this id out of any dependsOn lists that referenced it.
        const affected = items.filter((i) => i.dependsOn.includes(id));
        await Promise.all(
          affected.map((i) =>
            supabase
              .from("project_items")
              .update({ depends_on: i.dependsOn.filter((d) => d !== id) })
              .eq("id", i.id)
          )
        );
        setItems((prev) =>
          prev
            .filter((i) => i.id !== id)
            .map((i) => (i.dependsOn.includes(id) ? { ...i, dependsOn: i.dependsOn.filter((d) => d !== id) } : i))
        );
        return;
      }
      setItems((prev) => {
        const next = prev
          .filter((i) => i.id !== id)
          .map((i) => (i.dependsOn.includes(id) ? { ...i, dependsOn: i.dependsOn.filter((d) => d !== id) } : i));
        saveLocal(KEYS.items, next);
        return next;
      });
    },
    [cloud, items]
  );

  // ---- decisions ----
  const addDecision = useCallback(
    async (d: NewDecision): Promise<Decision> => {
      const id = genId();
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !userId) throw new Error("Not signed in");
        const { data, error } = await supabase
          .from("decisions")
          .insert({ id, ...decisionToRow(d, userId) })
          .select()
          .single();
        if (error) throw error;
        const created = rowToDecision(data as DecisionRow);
        setDecisions((prev) => [...prev, created]);
        return created;
      }
      const created: Decision = { ...d, id, createdAt: nowIso(), updatedAt: nowIso() };
      setDecisions((prev) => {
        const next = [...prev, created];
        saveLocal(KEYS.decisions, next);
        return next;
      });
      return created;
    },
    [cloud, userId]
  );

  const updateDecision = useCallback(
    async (id: string, patch: Partial<NewDecision>) => {
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        const existing = decisions.find((d) => d.id === id);
        if (!supabase || !userId || !existing) return;
        const merged: NewDecision = { ...existing, ...patch };
        const { data, error } = await supabase
          .from("decisions")
          .update(decisionToRow(merged, userId))
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        const updated = rowToDecision(data as DecisionRow);
        setDecisions((prev) => prev.map((d) => (d.id === id ? updated : d)));
        return;
      }
      setDecisions((prev) => {
        const next = prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowIso() } : d));
        saveLocal(KEYS.decisions, next);
        return next;
      });
    },
    [cloud, userId, decisions]
  );

  const deleteDecision = useCallback(
    async (id: string) => {
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        const { error } = await supabase.from("decisions").delete().eq("id", id);
        if (error) throw error;
        setDecisions((prev) => prev.filter((d) => d.id !== id));
        return;
      }
      setDecisions((prev) => {
        const next = prev.filter((d) => d.id !== id);
        saveLocal(KEYS.decisions, next);
        return next;
      });
    },
    [cloud]
  );

  // ---- budget ----

  // Write-back to the Inventory app: only fires when a budget line is
  // linked to a real gear item AND has a positive Actual, and only in
  // cloud mode (nothing to write to locally — the manual snapshot is
  // read-only by design). Keeps that item's purchase price in sync with
  // what's actually been paid, so its Inventory valuation doesn't drift
  // out of date from a figure only ever recorded here. Non-fatal on
  // failure — the budget line itself has already saved either way.
  const syncGearPurchasePrice = useCallback(
    async (gearItemId: string, actual: number) => {
      if (!cloud || !userId) return;
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { error } = await supabase
        .from("items")
        .update({ purchase_price: actual })
        .eq("id", gearItemId)
        .eq("user_id", userId);
      if (error) {
        console.warn("Couldn't sync purchase price to the Inventory app:", error.message);
        return;
      }
      setInventoryItems((prev) => prev.map((g) => (g.id === gearItemId ? { ...g, purchasePrice: actual } : g)));
    },
    [cloud, userId]
  );

  const addBudgetLine = useCallback(
    async (b: NewBudgetLineItem): Promise<BudgetLineItem> => {
      const id = genId();
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase || !userId) throw new Error("Not signed in");
        const { data, error } = await supabase
          .from("budget_lines")
          .insert({ id, ...budgetLineToRow(b, userId) })
          .select()
          .single();
        if (error) throw error;
        const created = rowToBudgetLine(data as BudgetLineRow);
        setBudget((prev) => [...prev, created]);
        if (created.gearItemId && created.actual > 0) {
          syncGearPurchasePrice(created.gearItemId, created.actual);
        }
        return created;
      }
      const created: BudgetLineItem = { ...b, id, createdAt: nowIso(), updatedAt: nowIso() };
      setBudget((prev) => {
        const next = [...prev, created];
        saveLocal(KEYS.budget, next);
        return next;
      });
      return created;
    },
    [cloud, userId, syncGearPurchasePrice]
  );

  const updateBudgetLine = useCallback(
    async (id: string, patch: Partial<NewBudgetLineItem>) => {
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        const existing = budget.find((b) => b.id === id);
        if (!supabase || !userId || !existing) return;
        const merged: NewBudgetLineItem = { ...existing, ...patch };
        const { data, error } = await supabase
          .from("budget_lines")
          .update(budgetLineToRow(merged, userId))
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        const updated = rowToBudgetLine(data as BudgetLineRow);
        setBudget((prev) => prev.map((b) => (b.id === id ? updated : b)));
        if (updated.gearItemId && updated.actual > 0) {
          syncGearPurchasePrice(updated.gearItemId, updated.actual);
        }
        return;
      }
      setBudget((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: nowIso() } : b));
        saveLocal(KEYS.budget, next);
        return next;
      });
    },
    [cloud, userId, budget, syncGearPurchasePrice]
  );

  const deleteBudgetLine = useCallback(
    async (id: string) => {
      if (cloud) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        const { error } = await supabase.from("budget_lines").delete().eq("id", id);
        if (error) throw error;
        setBudget((prev) => prev.filter((b) => b.id !== id));
        return;
      }
      setBudget((prev) => {
        const next = prev.filter((b) => b.id !== id);
        saveLocal(KEYS.budget, next);
        return next;
      });
    },
    [cloud]
  );

  // ---- gear reconciliation ----
  const importGearSnapshot = useCallback((snapItems: GearSnapshotItem[]) => {
    const snap: GearSnapshot = { importedAt: nowIso(), items: snapItems };
    setGearSnapshot(snap);
    saveLocal(KEYS.gearSnapshot, snap);
  }, []);

  const refreshInventoryGear = useCallback(async () => {
    if (!cloud || !userId) return;
    await fetchInventoryItems(userId);
  }, [cloud, userId, fetchInventoryItems]);

  const availableGearItems = useMemo(
    () => (cloud ? inventoryItems : gearSnapshot?.items ?? []),
    [cloud, inventoryItems, gearSnapshot]
  );

  // ---- Planning Agent ingestion ----
  const ingestPlanningBlocks = useCallback(
    async (blocks: PlanningIngestBlock[]) => {
      let created = 0;
      let updated = 0;
      for (const block of blocks) {
        if (!block.item || !block.item.trim()) continue;
        const existing = items.find(
          (i) => i.stage === 0 && i.name.trim().toLowerCase() === block.item.trim().toLowerCase()
        );
        if (existing) {
          await updateItem(existing.id, {
            status: block.status,
            date: block.date || existing.date,
            notes: block.notes || existing.notes,
            sourceVersion: "Planning Agent",
          });
          updated += 1;
        } else {
          await addItem({
            stage: 0,
            name: block.item.trim(),
            type: "task",
            status: block.status,
            date: block.date || undefined,
            notes: block.notes || undefined,
            dependsOn: [],
            sourceVersion: "Planning Agent",
          });
          created += 1;
        }
      }
      return { created, updated };
    },
    [items, addItem, updateItem]
  );

  // ---- whole-app export (backup) / import + reset (local mode only) ----
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

  const importAll = useCallback(
    (json: string) => {
      if (cloud) return;
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
    },
    [cloud, persistItems, persistDecisions, persistBudget]
  );

  const resetToSeed = useCallback(() => {
    if (cloud) return;
    persistItems(buildDemoItems());
    persistDecisions(buildDemoDecisions());
    persistBudget(buildDemoBudget());
    setGearSnapshot(null);
    saveLocal(KEYS.gearSnapshot, null);
  }, [cloud, persistItems, persistDecisions, persistBudget]);

  // ---- auth ----
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Cloud sync isn't configured yet." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return { error: "Cloud sync isn't configured yet." };
    const { error } = await supabase.auth.signUp({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value: DataContextValue = useMemo(
    () => ({
      mode: cloud ? "cloud" : "local",
      ready,
      authed,
      userEmail,
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
      gearSource: cloud ? "live" : "manual",
      availableGearItems,
      gearSnapshot,
      importGearSnapshot,
      refreshInventoryGear,
      ingestPlanningBlocks,
      exportAll,
      importAll,
      resetToSeed,
      signIn,
      signUp,
      signOut,
    }),
    [
      cloud,
      ready,
      authed,
      userEmail,
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
      availableGearItems,
      gearSnapshot,
      importGearSnapshot,
      refreshInventoryGear,
      ingestPlanningBlocks,
      exportAll,
      importAll,
      resetToSeed,
      signIn,
      signUp,
      signOut,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
