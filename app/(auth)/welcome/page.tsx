import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function WelcomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-between px-8 py-14 text-center">
      <div />
      <div className="flex flex-col items-center">
        <Logo size={84} />
        <h1 className="font-display mt-8 text-4xl leading-tight text-foreground">
          Studio
          <br />
          <span className="italic text-accent">PM</span>
        </h1>
        <div className="mt-6 h-px w-10 bg-accent/60" />
        <p className="mt-6 text-xs tracking-[0.25em] text-muted">
          14 CONTOUR RD
          <br />
          ROLEYSTONE, WA
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <Link
          href="/signup"
          className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-background shadow-[0_10px_30px_rgba(224,149,77,0.25)]"
        >
          Let&rsquo;s Get Started
        </Link>
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
