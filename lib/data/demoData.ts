import { BudgetLineItem, Decision, ProjectItem } from "../types";

// Starter data so every view has something to show on first run. This is
// NOT a transcription of Master Summary v14 or Clean_Budget_v4 — those
// documents weren't available in this build session. Everything here is
// clearly provenance-tagged as seed data; use Settings → Import Budget /
// Planning Ingest to replace it with the real thing.

function iso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

export function buildDemoItems(): ProjectItem[] {
  const items: Omit<ProjectItem, "createdAt" | "updatedAt">[] = [
    // Stage 0 — Planning & Approval
    {
      id: "seed-bal-assessment",
      stage: 0,
      name: "BAL assessment",
      type: "task",
      status: "in_progress",
      category: "Control",
      notes: "Bushfire Attack Level assessment for the Roleystone site — required before DA lodgement.",
      dependsOn: [],
      sourceVersion: "seed",
    },
    {
      id: "seed-da-requirement",
      stage: 0,
      name: "Confirm DA requirement",
      type: "decision",
      status: "not_started",
      category: "Control",
      notes: "Confirm with City of Armadale whether a full Development Application is triggered or a Building Permit alone suffices.",
      dependsOn: [],
      sourceVersion: "seed",
    },
    {
      id: "seed-building-permit",
      stage: 0,
      name: "Building Permit",
      type: "task",
      status: "not_started",
      category: "Control",
      notes: "",
      dependsOn: ["seed-da-requirement"],
      sourceVersion: "seed",
    },
    {
      id: "seed-ctf-levy",
      stage: 0,
      name: "CTF levy",
      type: "task",
      status: "not_started",
      category: "Control",
      notes: "Construction Training Fund levy — payable once contract value is known.",
      dependsOn: [],
      sourceVersion: "seed",
    },
    {
      id: "seed-builder-registration",
      stage: 0,
      name: "Builder registration check",
      type: "task",
      status: "not_started",
      category: "Control",
      notes: "",
      dependsOn: [],
      sourceVersion: "seed",
    },

    // Stage 1 — Pre-Construction
    {
      id: "seed-design-lock",
      stage: 1,
      name: "Design lock — above-carport layout",
      type: "decision",
      status: "blocked",
      category: "Acoustics",
      notes: "Location changed from under-house to above-carport. Footprint expected similar size, so budget category/line-item quantities should hold — but exact listening position and treatment coordinates are provisional until the new room is confirmed.",
      dependsOn: [],
      provisional: true,
      sourceVersion: "seed",
    },
    {
      id: "seed-cabinetmaker-drawings",
      stage: 1,
      name: "Cabinetmaker drawing pack",
      type: "task",
      status: "not_started",
      category: "Desk",
      notes: "Custom desk + two low side racks, angled 5–10° toward listening position.",
      dependsOn: ["seed-design-lock"],
      sourceVersion: "seed",
    },
    {
      id: "seed-supplier-quotes",
      stage: 1,
      name: "Acoustic treatment supplier quotes",
      type: "task",
      status: "not_started",
      category: "Acoustics",
      notes: "Perth suppliers — Autex, Ecoustic, Noise Control Systems.",
      dependsOn: [],
      sourceVersion: "seed",
    },
    {
      id: "seed-cabler-engagement",
      stage: 1,
      name: "Cabler engagement",
      type: "task",
      status: "not_started",
      category: "Cabling",
      notes: "",
      dependsOn: [],
      sourceVersion: "seed",
    },

    // Stage 2 — Construction Shell
    {
      id: "seed-walls",
      stage: 2,
      name: "Walls",
      type: "task",
      status: "not_started",
      category: "Acoustics",
      dependsOn: ["seed-building-permit"],
      sourceVersion: "seed",
    },
    { id: "seed-hvac-shell", stage: 2, name: "HVAC rough-in", type: "task", status: "not_started", category: "Power", dependsOn: ["seed-building-permit"], sourceVersion: "seed" },
    { id: "seed-power-shell", stage: 2, name: "Power rough-in", type: "task", status: "not_started", category: "Power", dependsOn: ["seed-building-permit"], sourceVersion: "seed" },
    { id: "seed-floor", stage: 2, name: "Floor", type: "task", status: "not_started", category: "Acoustics", dependsOn: ["seed-building-permit"], sourceVersion: "seed" },
    { id: "seed-doors", stage: 2, name: "Doors", type: "task", status: "not_started", category: "Acoustics", dependsOn: ["seed-walls"], sourceVersion: "seed" },

    // Stage 3 — Rough-In
    {
      id: "seed-cable-tray",
      stage: 3,
      name: "Cable tray runs",
      type: "task",
      status: "not_started",
      category: "Cabling",
      notes: "Must happen during slab/frame — cannot be retrofitted after lining.",
      dependsOn: ["seed-power-shell"],
      sourceVersion: "seed",
    },
    { id: "seed-wall-plate", stage: 3, name: "Wall plate cabling", type: "task", status: "not_started", category: "Cabling", dependsOn: ["seed-cable-tray"], sourceVersion: "seed" },
    {
      id: "seed-structural-blocking",
      stage: 3,
      name: "Structural blocking — A8H wall mount",
      type: "task",
      status: "not_started",
      category: "Monitoring",
      notes: "Blocking at 1400–1600mm AFFL for Adam Audio A8H mid-field mounts (not 1200mm — too low for line of sight above nearfields).",
      dependsOn: ["seed-walls"],
      sourceVersion: "seed",
    },

    // Stage 4 — Critical Geometry
    {
      id: "seed-false-wall",
      stage: 4,
      name: "False wall",
      type: "task",
      status: "not_started",
      category: "Acoustics",
      notes: "Two-frame timber assembly — not steel, steel transmits vibration.",
      dependsOn: ["seed-design-lock"],
      provisional: true,
      sourceVersion: "seed",
    },
    {
      id: "seed-rear-diffusers",
      stage: 4,
      name: "Rear diffusers — 2D Skyline QRD",
      type: "task",
      status: "not_started",
      category: "Acoustics",
      notes: "Prime 7, fd=700Hz, 40mm blocks, 228mm depth — spec locked; exact panel placement provisional pending room confirmation.",
      dependsOn: ["seed-false-wall"],
      provisional: true,
      sourceVersion: "seed",
    },
    { id: "seed-rug", stage: 4, name: "Rug", type: "task", status: "not_started", category: "Acoustics", dependsOn: ["seed-false-wall"], sourceVersion: "seed" },
    {
      id: "seed-provisional-monitors",
      stage: 4,
      name: "Provisional monitor placement",
      type: "gear",
      status: "not_started",
      category: "Monitoring",
      notes: "Adam Audio A8H — placed provisionally to empirically confirm listening position before side treatment is installed.",
      dependsOn: ["seed-structural-blocking"],
      provisional: true,
      sourceVersion: "seed",
    },

    // Stage 5 — Commissioning
    {
      id: "seed-lp-confirm",
      stage: 5,
      name: "Confirm listening position (bass test sequence)",
      type: "task",
      status: "not_started",
      category: "Acoustics",
      notes: "Phase 2–7 rolling bass test sequence — gated/sequential, not a flat checklist.",
      dependsOn: ["seed-provisional-monitors", "seed-rear-diffusers"],
      provisional: true,
      sourceVersion: "seed",
    },

    // Stage 6 — Remaining Treatment
    {
      id: "seed-side-panels",
      stage: 6,
      name: "Side wall panels",
      type: "task",
      status: "blocked",
      category: "Acoustics",
      notes: "Cannot be installed until listening position is empirically confirmed (hard sequencing rule).",
      dependsOn: ["seed-lp-confirm"],
      provisional: true,
      sourceVersion: "seed",
    },
    { id: "seed-corner-traps", stage: 6, name: "Corner bass traps", type: "task", status: "blocked", category: "Acoustics", dependsOn: ["seed-lp-confirm"], provisional: true, sourceVersion: "seed" },
    {
      id: "seed-ceiling-cloud",
      stage: 6,
      name: "Ceiling scatter panel / cloud",
      type: "task",
      status: "blocked",
      category: "Acoustics",
      notes: "Suspension needs joist positions verified before install (hard sequencing rule).",
      dependsOn: ["seed-lp-confirm"],
      provisional: true,
      sourceVersion: "seed",
    },

    // Stage 7 — Fit-out / Aesthetic
    { id: "seed-lighting-zones", stage: 7, name: "Lighting zones — 6-zone dimmable", type: "task", status: "not_started", category: "Control", dependsOn: ["seed-power-shell"], sourceVersion: "seed" },
    { id: "seed-velvet-panels", stage: 7, name: "Velvet panels", type: "task", status: "not_started", category: "Acoustics", dependsOn: ["seed-side-panels"], sourceVersion: "seed" },
    { id: "seed-guitar-gallery", stage: 7, name: "Guitar gallery", type: "task", status: "not_started", category: "Guitar Rig", dependsOn: [], sourceVersion: "seed" },
    { id: "seed-seating", stage: 7, name: "Seating", type: "task", status: "not_started", category: "Desk", dependsOn: [], sourceVersion: "seed" },

    // Stage 8 — Equipment Bring-up
    { id: "seed-rack-build", stage: 8, name: "Rack build", type: "task", status: "not_started", category: "Rack", dependsOn: ["seed-cabinetmaker-drawings"], sourceVersion: "seed" },
    { id: "seed-patchbay", stage: 8, name: "Patchbay", type: "task", status: "not_started", category: "Rack", dependsOn: ["seed-rack-build"], sourceVersion: "seed" },
    {
      id: "seed-signal-chain-test",
      stage: 8,
      name: "Signal chain testing",
      type: "task",
      status: "not_started",
      category: "Control",
      dependsOn: ["seed-patchbay", "seed-wall-plate"],
      sourceVersion: "seed",
    },
  ];

  return items.map((i) => ({ ...i, createdAt: now, updatedAt: now }));
}

export function buildDemoDecisions(): Decision[] {
  const decisions: Omit<Decision, "createdAt" | "updatedAt">[] = [
    {
      id: "seed-decision-lede",
      title: "Acoustic strategy: LEDE",
      description: "Live End Dead End strategy adopted for the control room. Listening position targeted at 38% of room length from the front wall.",
      category: "Acoustics",
      version: "seed",
      tags: ["acoustics", "lede"],
    },
    {
      id: "seed-decision-false-wall-material",
      title: "False wall: timber, not steel",
      description: "False wall built as a two-frame timber assembly. Steel was rejected — it transmits vibration.",
      category: "Acoustics",
      version: "seed",
      tags: ["acoustics", "false-wall"],
    },
    {
      id: "seed-decision-rear-diffusion",
      title: "Rear wall diffusion spec — locked",
      description: "2D Skyline QRD diffuser, prime 7, fd=700Hz, 40mm blocks, 228mm depth.",
      category: "Acoustics",
      version: "seed",
      tags: ["acoustics", "diffusion"],
    },
    {
      id: "seed-decision-furman-ruled-out",
      title: "Furman P-2300 IT ruled out",
      description: "Balanced power transformer explicitly ruled out for this build. Do not re-suggest. Furman PL-PLUS C E (conditioner) and PS-8RE III (sequencer) remain the confirmed power path.",
      category: "Power",
      version: "seed",
      tags: ["power"],
    },
    {
      id: "seed-decision-monitor-controller-location",
      title: "Drawmer MC3.1 lives on the desk surface",
      description: "Monitor controller sits on the desk surface, not in either rack — keep it off rack diagrams.",
      category: "Monitoring",
      version: "seed",
      tags: ["monitoring", "rack"],
    },
    {
      id: "seed-decision-location-change",
      title: "Studio relocated: above carport, not under house",
      description: "Physical build location changed from under the house to above the carport. Room footprint is expected to stay a similar size, so budget figures for acoustic treatment (Rockwool quantities, panel counts, rack/desk/signal-chain spec) are expected to hold at the category/line-item level — but exact acoustic dimensions (listening position, diffuser placement, wall treatment coordinates) are provisional until the new room is confirmed. Do not gate Budget, Planning, or Rack/Signal Chain work on the geometry redo.",
      category: "Acoustics",
      version: "seed",
      resolvedDate: iso(-14),
      tags: ["acoustics", "location", "provisional"],
    },
  ];
  return decisions.map((d) => ({ ...d, createdAt: now, updatedAt: now }));
}

export function buildDemoBudget(): BudgetLineItem[] {
  // One placeholder line per category, seeded at $0 with sourceVersion
  // flagged as "seed" — replace via Settings → Import Budget once
  // Clean_Budget_v4 figures for the confirmed room are available.
  const rows: Array<[string, number, number, number, boolean]> = [
    ["Monitoring", 6460, 9605, 12800, false],
    ["Control", 1800, 4100, 6400, false],
    ["500 Series", 3200, 5100, 7000, false],
    ["Microphones", 2050, 3115, 4500, false],
    ["Guitar Rig", 1560, 2300, 3600, false],
    ["Cabling", 1945, 2782, 3620, false],
    ["Acoustics", 3100, 10300, 17500, true],
    ["Desk", 1800, 7550, 13500, false],
    ["Power", 650, 3325, 6000, false],
    ["Rack", 470, 1195, 1900, false],
    ["Network / Data", 0, 0, 0, false],
  ];
  return rows.map(([category, budgetLow, budgetMid, budgetHigh, provisional]) => ({
    id: `seed-budget-${String(category).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    category,
    name: `${category} — category total (seed)`,
    budgetLow,
    budgetMid,
    budgetHigh,
    committed: 0,
    actual: 0,
    provisional,
    notes: "Seed figure — not from Clean_Budget_v4. Replace with real line items via Settings → Import Budget.",
    sourceVersion: "seed",
    createdAt: now,
    updatedAt: now,
  }));
}
