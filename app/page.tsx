"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data/DataProvider";
import { Logo } from "@/components/Logo";

export default function RootPage() {
  const { ready, authed } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(authed ? "/dashboard" : "/welcome");
  }, [ready, authed, router]);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
      <div className="animate-pulse">
        <Logo size={56} />
      </div>
    </div>
  );
}
