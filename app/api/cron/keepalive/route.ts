import { NextResponse } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

// Touches the database once a day so the free-tier Supabase project never goes
// a week without activity and gets paused. Vercel Cron calls it on the schedule
// in vercel.json.
//
// It reads one row with the public key and throws the answer away: row-level
// security still applies, nothing is written, and nothing is returned. When
// CRON_SECRET is set in Vercel, Vercel sends it as a bearer token and anything
// else is turned away, so the endpoint can't be hammered by anyone else.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ ok: false, error: "Supabase is not configured" }, { status: 500 });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/project_items?select=*&limit=1`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, status: response.status }, { status: 500 });
  }
  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
