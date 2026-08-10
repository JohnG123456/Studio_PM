"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconAlert,
  IconBoard,
  IconBook,
  IconDashboard,
  IconDollar,
  IconSettings,
  IconTimeline,
} from "./icons";

const NAV = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/board", label: "Board", icon: IconBoard },
  { href: "/dependencies", label: "Dependencies", icon: IconAlert },
  { href: "/timeline", label: "Timeline", icon: IconTimeline },
  { href: "/budget", label: "Budget", icon: IconDollar },
  { href: "/decisions", label: "Decisions", icon: IconBook },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background-elevated px-4 py-6 md:flex">
        <div className="px-2">
          <p className="font-display text-lg text-foreground">Studio PM</p>
          <p className="mt-0.5 text-[11px] text-muted-dim">14 Contour Rd, Roleystone</p>
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-accent-soft text-accent" : "text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <p className="font-display text-base text-foreground">Studio PM</p>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                  active ? "bg-accent-soft text-accent" : "text-muted"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
