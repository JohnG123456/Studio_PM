/** Supabase's PostgrestError (and similar) are plain objects with a
 * `.message`, not real Error instances, so `instanceof Error` alone misses them. */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}
