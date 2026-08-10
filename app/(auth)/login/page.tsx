"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PlainInput } from "@/components/FormControls";
import { useData } from "@/lib/data/DataProvider";

export default function LoginPage() {
  const { signIn } = useData();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-14">
      <Logo size={56} />
      <h1 className="font-display mt-6 text-2xl text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to the studio build.</p>

      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xs space-y-4">
        <PlainInput
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PlainInput
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
