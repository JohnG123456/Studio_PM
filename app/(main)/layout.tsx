"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data/DataProvider";
import { Logo } from "@/components/Logo";
import { AppShell } from "@/components/AppShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { ready, authed } = useData();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authed) router.replace("/welcome");
  }, [ready, authed, router]);

  if (!ready || !authed) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <div className="animate-pulse">
          <Logo size={48} />
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
