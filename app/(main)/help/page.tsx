"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill, TypePill, ProvisionalPill } from "@/components/Badges";
import { ITEM_STATUS_LABELS, ItemStatus } from "@/lib/types";
import {
  IconAlert,
  IconBoard,
  IconBook,
  IconClipboard,
  IconDashboard,
  IconDollar,
  IconSettings,
  IconTimeline,
} from "@/components/icons";

const STATUSES = Object.keys(ITEM_STATUS_LABELS) as ItemStatus[];

const SECTIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "board", label: "Board" },
  { id: "dependencies", label: "Dependencies" },
  { id: "timeline", label: "Timeline" },
  { id: "budget", label: "Budget" },
  { id: "decisions", label: "Decisions" },
  { id: "settings", label: "Settings" },
  { id: "glossary", label: "Glossary" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border-strong bg-card-hover px-2 py-0.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  dek,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  dek: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="card-surface scroll-mt-20 rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h2 className="font-display text-xl text-foreground">{title}</h2>
      </div>
      <p className="mt-1.5 ml-12 text-sm text-muted">{dek}</p>
      <div className="mt-5 ml-12 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function StepList({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="flex flex-col divide-y divide-border">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 py-2.5 text-sm text-muted first:pt-0 last:pb-0">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function PlainList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 py-2.5 text-sm text-muted first:pt-0 last:pb-0">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-dim" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-r-lg border-l-2 border-accent bg-card-hover px-3.5 py-2.5 text-xs text-muted">
      {children}
    </p>
  );
}

export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col pb-16">
      <PageHeader title="Help" subtitle="A working guide to every view — in the order they sit in the sidebar" />

      <nav className="flex gap-2 overflow-x-auto px-5 py-4 md:px-8" aria-label="Jump to section">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 whitespace-nowrap rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-accent"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-4 px-5 md:px-8">
        <Section id="dashboard" icon={IconDashboard} title="Dashboard" dek="Where you land. The five-second answer to “where are we.”">
          <PlainList
            items={[
              <>
                <strong className="text-foreground">Cost to Complete</strong>{" "}— everything still unpaid, valued at
                its mid-estimate. The single number that matters most for cash planning.
              </>,
              <>
                <strong className="text-foreground">Blocked Items</strong>{" "}— how many things can&rsquo;t start yet.
                Tap it to jump straight to{" "}
                <Link href="/dependencies" className="text-accent">
                  Dependencies
                </Link>
                .
              </>,
              <>
                <strong className="text-foreground">Categories Trending Over Budget</strong>{" "}— categories whose spend
                is closing in on their budgeted-high figure. Tap it to jump to{" "}
                <Link href="/budget" className="text-accent">
                  Budget
                </Link>
                .
              </>,
              <>
                <strong className="text-foreground">Stage Progress</strong>{" "}— a bar per build stage (0–9). Click any
                row to open the Board filtered to that stage.
              </>,
              <>
                <strong className="text-foreground">Recently Updated Decisions</strong>{" "}— the last few things logged
                or edited in the Decisions log.
              </>,
            ]}
          />
          <Note>This page is read-only — every number is pulled live from the Board and Budget, nothing to edit here.</Note>
        </Section>

        <Section id="board" icon={IconBoard} title="Board" dek="The one you’ll open most. A column per stage, a card per task, gear item, or decision.">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Add something</p>
            <StepList
              steps={[
                <>
                  Scroll to the stage it belongs in, then press <Kbd>+ Add item</Kbd> at the bottom of that column.
                </>,
                <>
                  Give it a name, pick a <strong className="text-foreground">Type</strong> (Task, Gear, or Decision),
                  a <strong className="text-foreground">Status</strong>, and a{" "}
                  <strong className="text-foreground">Category</strong>.
                </>,
                <>
                  If it&rsquo;s blocked by something else, add it under{" "}
                  <strong className="text-foreground">Blocked by</strong>{" "}— that&rsquo;s what drives the{" "}
                  <Link href="/dependencies" className="text-accent">
                    Dependencies
                  </Link>{" "}
                  view.
                </>,
                <>
                  Tick <strong className="text-foreground">Provisional</strong> if the dimensions or timing are still
                  TBD (e.g. anything waiting on the listening-position confirmation).
                </>,
                <>
                  Press <Kbd>Save</Kbd>.
                </>,
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Update or remove something</p>
            <StepList
              steps={[
                "Click any card to reopen that same form.",
                <>
                  Change its <strong className="text-foreground">Status</strong>{" "}
                  as work progresses — this is what moves the Dashboard&rsquo;s stage bars.
                </>,
                <>
                  Press <Kbd>Delete</Kbd>{" "}
                  at the bottom-left if it&rsquo;s no longer needed — you&rsquo;ll be asked to confirm first.
                  Anything that depended on it is automatically unblocked.
                </>,
              ]}
            />
          </div>
          <p className="text-sm text-muted">
            <strong className="text-foreground">Linking a gear item:</strong> set Type to <em>Gear</em>{" "}
            and a &ldquo;Linked Inventory item&rdquo; picker appears — pull directly from the Studio Inventory
            app&rsquo;s records instead of typing the same equipment twice.
          </p>
        </Section>

        <Section id="dependencies" icon={IconAlert} title="Dependencies" dek="What’s stuck, and exactly what has to happen first to unstick it.">
          <PlainList
            items={[
              <>
                <strong className="text-foreground">Currently Blocked</strong>{" "}— every item with an unfinished
                &ldquo;blocked by&rdquo; item, and which one it&rsquo;s waiting on.
              </>,
              <>
                <strong className="text-foreground">Full Dependency Chain</strong>{" "}— everything with any relationship
                at all, showing both what it&rsquo;s blocked by and what it unblocks once it&rsquo;s done.
              </>,
              "Click any item name in either list to open it and update its status.",
            ]}
          />
          <Note>
            This view exists because of rules like: side wall panels can&rsquo;t go in until the listening position is
            empirically confirmed, and the ceiling scatter panels can&rsquo;t be suspended until joist positions are
            verified. Marking the upstream item Done or Approved is what clears the downstream one.
          </Note>
        </Section>

        <Section id="timeline" icon={IconTimeline} title="Timeline" dek="The build in date order, with the longest chain of blocking dependencies picked out.">
          <PlainList
            items={[
              <>
                The banner at the top is the <strong className="text-foreground">critical path</strong>{" "}— the single
                longest chain of &ldquo;this has to finish before that can start.&rdquo; If anything on it slips, the
                whole project slips with it.
              </>,
              "Below that, everything is grouped by stage and sorted by date, so you can see what's coming next.",
              "Click any row to jump into that item's edit form.",
            ]}
          />
        </Section>

        <Section id="budget" icon={IconDollar} title="Budget" dek="Every dollar, low/mid/high, against what’s committed and what’s actually paid.">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">The four numbers up top</p>
            <PlainList
              items={[
                <>
                  <strong className="text-foreground">Budgeted (mid)</strong>{" "}— total of every line&rsquo;s midpoint
                  estimate.
                </>,
                <>
                  <strong className="text-foreground">Committed</strong>{" "}— ordered and price-locked, not yet paid.
                </>,
                <>
                  <strong className="text-foreground">Actual</strong>{" "}— paid.
                </>,
                <>
                  <strong className="text-foreground">Cost to Complete</strong>{" "}— the mid-estimate minus what&rsquo;s
                  already been paid, summed across everything still outstanding. Same figure as the Dashboard.
                </>,
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Finding a line</p>
            <PlainList
              items={[
                <>
                  Type into the <strong className="text-foreground">Search line items</strong> box above the list —
                  it matches name, category, and notes at once.
                </>,
                <>
                  Or use the <strong className="text-foreground">Sort</strong> dropdown next to it: Name (A–Z),
                  Budgeted high→low, Cost to complete high→low, or Variance (most over first) — handy for spotting
                  risk without scanning the whole list.
                </>,
                "Or click a row in the By Category table above to filter the list down to one category.",
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Editing a line</p>
            <StepList
              steps={[
                "Click straight into any field — name, Low, Mid, High, Committed, or Actual — and type.",
                <>
                  Click elsewhere (or press <Kbd>Enter</Kbd>) to save it. Nothing saves keystroke-by-keystroke, so
                  typing a new number doesn&rsquo;t fire off a save until you leave the field.
                </>,
              ]}
            />
          </div>
          <p className="text-sm text-muted">
            <strong className="text-foreground">Adding a line:</strong> press <Kbd>+ Add line</Kbd>{" "}
            next to the &ldquo;Line Items&rdquo; heading, fill in a name, category, and a budget figure, then{" "}
            <Kbd>Add</Kbd>.
          </p>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">
              Linking gear &amp; keeping the Inventory app in sync
            </p>
            <StepList
              steps={[
                <>
                  Under a line&rsquo;s category, press <Kbd>Link gear</Kbd>{" "}
                  and pick the matching Inventory app record.
                </>,
                <>
                  Once linked, setting that line&rsquo;s <strong className="text-foreground">Actual</strong>{" "}
                  to a real figure pushes that price straight to the linked item&rsquo;s purchase price in the
                  Inventory app — no manual double-entry, and no forgetting to update it later.
                </>,
                "Press the small × on the linked pill to unlink a line at any time.",
              ]}
            />
          </div>
          <Note>
            Watch for the amber <ProvisionalPill />{" "}
            tag — it means the figure is a placeholder (e.g. the Construction Shell numbers, which have no
            builder&rsquo;s quote behind them yet) rather than a sourced estimate. Deleting a line always asks for
            confirmation first. The gear-price sync only runs in cloud mode — local mode has no live Inventory app
            to push a price to.
          </Note>
        </Section>

        <Section id="decisions" icon={IconBook} title="Decisions" dek="The locked call, once it’s made — searchable, and never reopened.">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Logging a new one</p>
            <StepList
              steps={[
                <>
                  Press <Kbd>Log decision</Kbd> in the top right.
                </>,
                <>
                  Fill in <strong className="text-foreground">Title</strong>,{" "}
                  <strong className="text-foreground">Category</strong>, the{" "}
                  <strong className="text-foreground">Master Summary version</strong> it belongs to, a short{" "}
                  <strong className="text-foreground">Description</strong>, and any tags (comma-separated).
                </>,
                <>
                  Press <Kbd>Save</Kbd>.
                </>,
              ]}
            />
          </div>
          <Note>
            A locked decision only ever gets a newer version logged over it — it doesn&rsquo;t get quietly edited. If
            something genuinely reverses, log it as a new entry so the history stays honest. Deleting one asks for
            confirmation first.
          </Note>
        </Section>

        <Section id="settings" icon={IconSettings} title="Settings" dek="Four jobs live here: bringing in planning updates, linking gear, backing up, and your account.">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Planning Project Ingestion</p>
            <p className="text-sm text-muted">
              When the Armadale Planning Agent gives you a status update, paste it here and press{" "}
              <Kbd>Ingest into Stage 0</Kbd> — it matches an existing item by name or creates a new one.
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-background-elevated p-3 text-xs text-muted-dim">
{`{"stage": "Planning & Approval", "item": "BAL assessment", "status": "submitted", "date": "2026-08-01", "notes": "Lodged with council"}`}
            </pre>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Inventory App Reconciliation</p>
            <PlainList
              items={[
                <>
                  <strong className="text-foreground">Cloud mode:</strong> this is live and automatic — press{" "}
                  <Kbd>Refresh</Kbd>{" "}
                  if you&rsquo;ve just added something in the Inventory app and don&rsquo;t see it yet.
                </>,
                <>
                  <strong className="text-foreground">Local mode:</strong> in the Inventory app, use{" "}
                  <em>More → Export inventory as JSON</em>, then paste or upload that file here. Re-import any time to
                  refresh it.
                </>,
              ]}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Backup</p>
            <p className="text-sm text-muted">
              Press <Kbd>Export all data as JSON</Kbd>{" "}
              any time for an offline copy. In local mode only, you&rsquo;ll also see Import backup and Reset to seed
              data.
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">
              Account <span className="font-normal normal-case tracking-normal text-muted-dim">(cloud mode only)</span>
            </p>
            <p className="text-sm text-muted">Shows the signed-in email and a Sign out button.</p>
          </div>
        </Section>

        <Section id="glossary" icon={IconClipboard} title="Status &amp; badge glossary" dek="What every coloured tag on a card means, in one place.">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <StatusPill key={s} status={s} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Type</p>
            <div className="flex flex-col divide-y divide-border">
              <div className="flex items-center gap-3 py-2 text-sm text-muted">
                <TypePill type="task" /> Something to physically do or arrange.
              </div>
              <div className="flex items-center gap-3 py-2 text-sm text-muted">
                <TypePill type="gear" /> An equipment item — can link to a real record in the Inventory app.
              </div>
              <div className="flex items-center gap-3 py-2 text-sm text-muted">
                <TypePill type="decision" /> A call that needs making, or the record of one already made.
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-dim">Tags</p>
            <div className="flex items-center gap-3 py-2 text-sm text-muted">
              <ProvisionalPill /> The dimensions, timing, or figure aren&rsquo;t locked yet — either pending a
              measurement (like the listening-position bass test) or, on budget lines, a real quote.
            </div>
          </div>
        </Section>
      </div>

      <p className="mt-8 px-5 text-center text-xs text-muted-dim md:px-8">
        Studio PM · 14 Contour Rd, Roleystone WA · built from Master Summary v14 and Clean_Budget_v7_4
      </p>
    </div>
  );
}
