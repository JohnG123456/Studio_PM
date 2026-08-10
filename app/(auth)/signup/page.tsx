"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PlainInput } from "@/components/FormControls";
import { useData } from "@/lib/data/DataProvider";

export default function SignupPage() {
  const { signUp } = useData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-14 text-center">
        <Logo size={56} />
        <h1 className="font-display mt-6 text-2xl text-foreground">Check your email</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">
          We&rsquo;ve sent a confirmation link to {email}. Confirm it, then sign in below.
        </p>
        <Link
          href="/login"
          className="mt-8 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-background"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-14">
      <Logo size={56} />
      <h1 className="font-display mt-6 text-2xl text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        Use the same account as your Studio Inventory app to link gear automatically.
      </p>

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
          minLength={6}
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-background disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
